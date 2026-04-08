from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import OrdemDeServico
from .serializers import OrdemDeServicoSerializer

class OrdemDeServicoViewSet(viewsets.ModelViewSet):
    queryset = OrdemDeServico.objects.prefetch_related('contratante', 'freelancer_selecionado', 'freelancers_candidatos', 'habilidades_necessarias')
    serializer_class = OrdemDeServicoSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if getattr(self, 'action', None) in {'list', 'retrieve'}:
            return [AllowAny()]
        return [IsAuthenticated()]
