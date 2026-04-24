from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AnuncioServico, Categoria, Notificacao, Usuario
from .serializers import (
    AnuncioServicoSerializer,
    CategoriaSerializer,
    NotificacaoSerializer,
    UsuarioSerializer,
)


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_permissions(self):
        if getattr(self, 'action', None) in {'list', 'retrieve', 'create'}:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        if getattr(self, 'action', None) == 'list':
            return Usuario.objects.all()

        user = self.request.user
        if getattr(user, 'is_staff', False) or getattr(user, 'is_superuser', False):
            return Usuario.objects.all()
        return Usuario.objects.filter(pk=user.pk)


class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if getattr(self, 'action', None) in {'list', 'retrieve'}:
            return [AllowAny()]
        return [IsAuthenticated()]


class AnuncioServicoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AnuncioServico.objects.select_related('freelancer').prefetch_related('habilidades')
    serializer_class = AnuncioServicoSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    @action(detail=False, methods=['get', 'post', 'put', 'patch', 'delete'], permission_classes=[IsAuthenticated], url_path='meu-anuncio')
    def meu_anuncio(self, request):
        usuario = request.user
        if not usuario.freelancer:
            return Response(
                {'detail': 'Apenas usuarios com perfil freelancer podem gerenciar anuncio de servico.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        anuncio = AnuncioServico.objects.filter(freelancer=usuario).first()

        if request.method == 'GET':
            if not anuncio:
                return Response({'detail': 'Anuncio nao encontrado.'}, status=status.HTTP_404_NOT_FOUND)
            return Response(self.get_serializer(anuncio).data)

        if request.method == 'DELETE':
            if not anuncio:
                return Response({'detail': 'Anuncio nao encontrado.'}, status=status.HTTP_404_NOT_FOUND)
            anuncio.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        if request.method == 'POST':
            if anuncio:
                return Response(
                    {'detail': 'Voce ja possui um anuncio de servico cadastrado.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            serializer = self.get_serializer(data=request.data)
        else:
            if not anuncio:
                return Response({'detail': 'Anuncio nao encontrado.'}, status=status.HTTP_404_NOT_FOUND)
            serializer = self.get_serializer(anuncio, data=request.data, partial=request.method == 'PATCH')

        serializer.is_valid(raise_exception=True)
        serializer.save(freelancer=usuario)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED if request.method == 'POST' else status.HTTP_200_OK,
        )


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UsuarioSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        data = request.data.copy()
        data.pop('login', None)
        data.pop('cpf', None)

        serializer = UsuarioSerializer(request.user, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class NotificacaoListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notificacoes = Notificacao.objects.filter(usuario=request.user).order_by('-data_criacao')
        serializer = NotificacaoSerializer(notificacoes, many=True)
        nao_lidas = notificacoes.filter(lida=False).count()
        return Response({
            'results': serializer.data,
            'unread_count': nao_lidas,
        })


class MarcarNotificacaoLidaView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, notificacao_id):
        notificacao = Notificacao.objects.filter(
            id=notificacao_id,
            usuario=request.user,
        ).first()

        if not notificacao:
            return Response({'detail': 'Notificacao nao encontrada.'}, status=status.HTTP_404_NOT_FOUND)

        if not notificacao.lida:
            notificacao.lida = True
            notificacao.save(update_fields=['lida'])

        return Response({'ok': True, 'id': notificacao.id, 'lida': notificacao.lida})
