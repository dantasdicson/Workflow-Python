from django.db import transaction
from django.db.models import Count, Prefetch
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from usuarios.models import Notificacao, Usuario
from .filters import OrdemDeServicoFilter
from .models import ConversaOrdem, MensagemChat, OrdemDeServico
from .serializers import (
    ConversaOrdemSerializer,
    MensagemChatSerializer,
    OrdemDeServicoSerializer,
)


def _get_authenticated_user(request):
    if request.user.is_authenticated:
        return request.user
    return None


def _ensure_order_participant(ordem, usuario):
    if not usuario:
        raise PermissionDenied('Autenticação obrigatória.')

    participante = (
        ordem.contratante_id == usuario.id_usuario
        or ordem.freelancer_selecionado_id == usuario.id_usuario
        or ordem.freelancers_candidatos.filter(id_usuario=usuario.id_usuario).exists()
    )
    if not participante:
        raise PermissionDenied('Você não participa desta ordem de serviço.')


def _ensure_conversation_access(conversa, usuario):
    if not usuario:
        raise PermissionDenied('Autenticação obrigatória.')

    if usuario.id_usuario not in {conversa.contratante_id, conversa.freelancer_id}:
        raise PermissionDenied('Você não tem acesso a esta conversa.')


def _get_or_create_candidate_conversation(ordem, freelancer):
    conversa, _ = ConversaOrdem.objects.get_or_create(
        ordem_servico=ordem,
        freelancer=freelancer,
        defaults={
            'contratante': ordem.contratante,
            'status': 'ativa',
            'tipo': 'candidatura',
        },
    )
    return conversa


@api_view(['GET'])
def test_auth(request):
    if request.user.is_authenticated:
        return Response({
            'authenticated': True,
            'user_id': request.user.id_usuario,
            'username': request.user.login,
            'is_freelancer': getattr(request.user, 'freelancer', False),
        })
    return Response({
        'authenticated': False,
        'error': 'User not authenticated',
    }, status=401)


class OrdemDeServicoViewSet(viewsets.ModelViewSet):
    serializer_class = OrdemDeServicoSerializer
    queryset = OrdemDeServico.objects.select_related(
        'contratante',
        'freelancer_selecionado',
    ).prefetch_related(
        'freelancers_candidatos',
        'categorias_necessarias',
    )
    filter_backends = [DjangoFilterBackend]
    filterset_class = OrdemDeServicoFilter
    lookup_field = 'id_os'
    permission_classes = [AllowAny]

    def get_object(self):
        return get_object_or_404(self.get_queryset(), **{self.lookup_field: self.kwargs[self.lookup_field]})

    def create(self, request, *args, **kwargs):
        usuario = _get_authenticated_user(request)
        if not usuario:
            return Response({'error': 'Autenticação obrigatória para criar ordens.'}, status=status.HTTP_401_UNAUTHORIZED)

        mutable_data = request.data.copy()
        mutable_data['contratante_id'] = usuario.id_usuario
        serializer = self.get_serializer(data=mutable_data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def candidatar(self, request, id_os=None):
        ordem = self.get_object()
        usuario = request.user

        if not usuario.freelancer:
            return Response(
                {'error': 'Apenas freelancers podem se candidatar a ordens de serviço'},
                status=status.HTTP_403_FORBIDDEN,
            )

        if ordem.contratante_id == usuario.id_usuario:
            return Response(
                {'error': 'O contratante não pode se candidatar à própria ordem.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if ordem.status != 'aberta':
            return Response(
                {'error': 'Esta ordem de serviço não está mais aberta para candidaturas'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if ordem.freelancers_candidatos.filter(id_usuario=usuario.id_usuario).exists():
            return Response(
                {'error': 'Você já está candidatado a esta ordem de serviço'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if ordem.freelancers_candidatos.count() >= 7:
            return Response(
                {'error': 'Esta ordem de serviço já atingiu o limite de 7 candidatos'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ordem.freelancers_candidatos.add(usuario)
        conversa = _get_or_create_candidate_conversation(ordem, usuario)

        Notificacao.objects.create(
            usuario=usuario,
            titulo='Candidatura realizada',
            mensagem=f'Você se candidatou à Ordem de Serviço #{ordem.id_os}.',
            ordem_servico=ordem,
        )
        Notificacao.objects.create(
            usuario=ordem.contratante,
            titulo='Nova candidatura recebida',
            mensagem=f'{usuario.nome} {usuario.sobre_nome} se candidatou à Ordem de Serviço #{ordem.id_os}.',
            ordem_servico=ordem,
        )

        return Response({
            'message': 'Candidatura realizada com sucesso.',
            'ordem_id': ordem.id_os,
            'conversa_id': conversa.id,
            'total_candidatos': ordem.freelancers_candidatos.count(),
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated], url_path='selecionar-freelancer')
    def selecionar_freelancer(self, request, id_os=None):
        ordem = self.get_object()
        usuario = request.user
        freelancer_id = request.data.get('freelancer_id')

        if ordem.contratante_id != usuario.id_usuario:
            return Response(
                {'error': 'Apenas o contratante pode selecionar o freelancer.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        if ordem.status != 'aberta':
            return Response(
                {'error': 'A seleção só pode ocorrer enquanto a ordem estiver aberta.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not freelancer_id:
            return Response({'error': 'freelancer_id é obrigatório.'}, status=status.HTTP_400_BAD_REQUEST)

        freelancer = get_object_or_404(Usuario.objects.filter(freelancer=True), id_usuario=freelancer_id)
        if not ordem.freelancers_candidatos.filter(id_usuario=freelancer.id_usuario).exists():
            return Response(
                {'error': 'O freelancer selecionado precisa ser um candidato desta ordem.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            ordem.freelancer_selecionado = freelancer
            ordem.status = 'em_execucao'
            ordem.save(update_fields=['freelancer_selecionado', 'status'])

            conversa_principal = _get_or_create_candidate_conversation(ordem, freelancer)
            conversa_principal.tipo = 'principal'
            conversa_principal.status = 'ativa'
            conversa_principal.save(update_fields=['tipo', 'status', 'data_atualizacao'])

            ConversaOrdem.objects.filter(ordem_servico=ordem).exclude(id=conversa_principal.id).update(status='bloqueada')

            Notificacao.objects.create(
                usuario=freelancer,
                titulo='Você foi selecionado',
                mensagem=f'Você foi selecionado para a Ordem de Serviço #{ordem.id_os}.',
                ordem_servico=ordem,
            )

            outros_ids = list(
                ordem.freelancers_candidatos.exclude(id_usuario=freelancer.id_usuario).values_list('id_usuario', flat=True)
            )
            for candidato_id in outros_ids:
                Notificacao.objects.create(
                    usuario_id=candidato_id,
                    titulo='Candidatura encerrada',
                    mensagem=f'A Ordem de Serviço #{ordem.id_os} entrou em andamento com outro freelancer.',
                    ordem_servico=ordem,
                )

        serializer = self.get_serializer(ordem)
        return Response({
            'message': 'Freelancer selecionado e chat principal ativado.',
            'ordem': serializer.data,
            'conversa_principal_id': conversa_principal.id,
        })

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def conversas(self, request, id_os=None):
        ordem = self.get_object()
        usuario = request.user
        _ensure_order_participant(ordem, usuario)

        queryset = ConversaOrdem.objects.filter(ordem_servico=ordem).select_related(
            'contratante',
            'freelancer',
        ).prefetch_related(
            Prefetch(
                'mensagens',
                queryset=MensagemChat.objects.select_related('remetente').order_by('-data_envio'),
                to_attr='mensagens_cache',
            )
        ).annotate(total_mensagens=Count('mensagens'))

        if usuario.id_usuario != ordem.contratante_id:
            queryset = queryset.filter(freelancer_id=usuario.id_usuario)

        conversas = list(queryset)
        for conversa in conversas:
            mensagens = getattr(conversa, 'mensagens_cache', [])
            conversa.ultima_mensagem_cache = mensagens[0] if mensagens else None

        return Response(ConversaOrdemSerializer(conversas, many=True).data)

    @action(
        detail=True,
        methods=['get', 'post'],
        permission_classes=[IsAuthenticated],
        url_path=r'conversas/(?P<conversa_id>[^/.]+)/mensagens',
    )
    def mensagens(self, request, id_os=None, conversa_id=None):
        ordem = self.get_object()
        conversa = get_object_or_404(
            ConversaOrdem.objects.select_related('contratante', 'freelancer', 'ordem_servico'),
            id=conversa_id,
            ordem_servico=ordem,
        )
        usuario = request.user
        _ensure_conversation_access(conversa, usuario)

        if request.method == 'GET':
            mensagens = conversa.mensagens.select_related('remetente').all()
            conversa.mensagens.exclude(remetente=usuario, lida_em__isnull=True).update(lida_em=timezone.now())
            return Response(MensagemChatSerializer(mensagens, many=True).data)

        if conversa.status != 'ativa':
            return Response(
                {'error': 'Esta conversa não aceita novas mensagens.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if ordem.status == 'em_execucao' and usuario.id_usuario not in {ordem.contratante_id, ordem.freelancer_selecionado_id}:
            return Response(
                {'error': 'Após o início da execução, somente contratante e freelancer selecionado podem enviar mensagens.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        conteudo = (request.data.get('conteudo') or '').strip()
        if not conteudo:
            return Response({'error': 'conteudo é obrigatório.'}, status=status.HTTP_400_BAD_REQUEST)

        mensagem = MensagemChat.objects.create(
            conversa=conversa,
            remetente=usuario,
            conteudo=conteudo,
        )
        conversa.ultima_mensagem_em = mensagem.data_envio
        conversa.save(update_fields=['ultima_mensagem_em', 'data_atualizacao'])

        destinatario = conversa.freelancer if usuario.id_usuario == conversa.contratante_id else conversa.contratante
        if destinatario.id_usuario != usuario.id_usuario:
            Notificacao.objects.create(
                usuario=destinatario,
                titulo=f'Nova mensagem na OS #{ordem.id_os}',
                mensagem=conteudo[:180],
                ordem_servico=ordem,
            )

        return Response(MensagemChatSerializer(mensagem).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        ordem = self.get_object()
        usuario = _get_authenticated_user(request)
        if not usuario:
            return Response({'error': 'Autenticação obrigatória.'}, status=status.HTTP_401_UNAUTHORIZED)

        if ordem.contratante_id != usuario.id_usuario:
            return Response(
                {'error': 'Você não tem permissão para excluir esta ordem de serviço'},
                status=status.HTTP_403_FORBIDDEN,
            )

        if ordem.freelancers_candidatos.exists():
            return Response(
                {'error': 'Não é possível excluir ordens que já possuem candidatos'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if ordem.status in ['em_execucao', 'concluido']:
            return Response(
                {'error': 'Não é possível excluir ordens em execução ou concluídas'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ordem.delete()
        return Response({'message': 'Ordem de serviço excluída com sucesso.'}, status=status.HTTP_200_OK)
