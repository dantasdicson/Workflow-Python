from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Freelancer, Habilidade
from .serializers import FreelancerSerializer, HabilidadeSerializer

class HabilidadeViewSet(viewsets.ModelViewSet):
    queryset = Habilidade.objects.all()
    serializer_class = HabilidadeSerializer

class FreelancerViewSet(viewsets.ModelViewSet):
    queryset = Freelancer.objects.prefetch_related('habilidades')
    serializer_class = FreelancerSerializer
    
    @action(detail=False, methods=['get'])
    def por_habilidade(self, request):
        """Listar freelancers por habilidade"""
        habilidade_id = request.query_params.get('habilidade_id')
        if habilidade_id:
            freelancers = Freelancer.objects.filter(habilidades__id=habilidade_id)
            serializer = self.get_serializer(freelancers, many=True)
            return Response(serializer.data)
        return Response([])
