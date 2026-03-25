from rest_framework import viewsets
from .models import OrdemDeServico
from .serializers import OrdemDeServicoSerializer

class OrdemDeServicoViewSet(viewsets.ModelViewSet):
    queryset = OrdemDeServico.objects.prefetch_related('contratante', 'freelancer_selecionado', 'freelancers_candidatos', 'habilidades_necessarias')
    serializer_class = OrdemDeServicoSerializer
