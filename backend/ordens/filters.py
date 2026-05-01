import django_filters

from .models import OrdemDeServico


class OrdemDeServicoFilter(django_filters.FilterSet):
    candidatos = django_filters.NumberFilter(method='filter_candidatos')
    freelancer = django_filters.NumberFilter(field_name='freelancer_selecionado__id_usuario')

    class Meta:
        model = OrdemDeServico
        fields = ['contratante', 'freelancer_selecionado', 'freelancer', 'status', 'candidatos']

    def filter_candidatos(self, queryset, name, value):
        if value:
            return queryset.filter(freelancers_candidatos__id_usuario=value)
        return queryset
