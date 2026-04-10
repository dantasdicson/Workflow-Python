from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from .models import OrdemDeServico
from .serializers import OrdemDeServicoSerializer
from .filters import OrdemDeServicoFilter
from usuarios.models import Notificacao

class OrdemDeServicoViewSet(viewsets.ModelViewSet):
    queryset = OrdemDeServico.objects.prefetch_related('contratante', 'freelancer_selecionado', 'freelancers_candidatos', 'categorias_necessarias')
    serializer_class = OrdemDeServicoSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = OrdemDeServicoFilter

    def get_permissions(self):
        if getattr(self, 'action', None) in {'list', 'retrieve'}:
            return [AllowAny()]
        return [IsAuthenticated()]

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def candidatar(self, request, pk=None):
        """
        Endpoint para freelancer se candidatar a uma ordem de serviço
        Limite de 7 candidatos por ordem de serviço
        """
        ordem = self.get_object()
        usuario = request.user
        
        # Verificar se usuário é freelancer
        if not usuario.freelancer:
            return Response(
                {'error': 'Apenas freelancers podem se candidatar a ordens de serviço'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verificar se ordem está aberta
        if ordem.status != 'aberta':
            return Response(
                {'error': 'Esta ordem de serviço não está mais aberta para candidaturas'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar se já é candidato
        if ordem.freelancers_candidatos.filter(id_usuario=usuario.id_usuario).exists():
            return Response(
                {'error': 'Você já está candidatado a esta ordem de serviço'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar se freelancer já foi selecionado
        if ordem.freelancer_selecionado and ordem.freelancer_selecionado.id_usuario == usuario.id_usuario:
            return Response(
                {'error': 'Você já foi selecionado para esta ordem de serviço'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar limite de 7 candidatos
        candidatos_count = ordem.freelancers_candidatos.count()
        if candidatos_count >= 7:
            return Response(
                {'error': 'Esta ordem de serviço já atingiu o limite de 7 candidatos'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Adicionar freelancer aos candidatos
        ordem.freelancers_candidatos.add(usuario)
        
        # Criar notificação para o freelancer
        Notificacao.objects.create(
            usuario=usuario,
            titulo='Candidatura Realizada com Sucesso!',
            mensagem=f'Você se candidatou com sucesso à Ordem de Serviço #{ordem.id_os}. Aguarde o contato do contratante.',
            ordem_servico=ordem
        )
        
        # Criar notificação para o contratante (se diferente do freelancer)
        if ordem.contratante.id_usuario != usuario.id_usuario:
            Notificacao.objects.create(
                usuario=ordem.contratante,
                titulo='Nova Candidatura Recebida',
                mensagem=f'O freelancer {usuario.nome} {usuario.sobre_nome} se candidatou à sua Ordem de Serviço #{ordem.id_os}.',
                ordem_servico=ordem
            )
        
        return Response({
            'message': 'Candidatura realizada com sucesso!',
            'ordem_id': ordem.id_os,
            'total_candidatos': ordem.freelancers_candidatos.count()
        }, status=status.HTTP_200_OK)
