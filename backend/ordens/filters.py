import django_filters
from .models import OrdemDeServico

class OrdemDeServicoFilter(django_filters.FilterSet):
    # Filtro para buscar ordens onde o usuário é candidato
    candidatos = django_filters.NumberFilter(method='filter_candidatos')
    
    class Meta:
        model = OrdemDeServico
        fields = ['contratante', 'freelancer_selecionado', 'status', 'candidatos']
    
    def filter_candidatos(self, queryset, name, value):
        """
        Filtra ordens onde o usuário com ID=value é um dos candidatos
        """
        if value:
            return queryset.filter(freelancers_candidatos__id_usuario=value)
        return queryset
