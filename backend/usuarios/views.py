from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Usuario, Categoria
from .serializers import UsuarioSerializer, CategoriaSerializer

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if getattr(self, 'action', None) in {'list', 'retrieve', 'create'}:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
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


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UsuarioSerializer(request.user)
        return Response(serializer.data)
