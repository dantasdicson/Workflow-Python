from django.contrib import admin
from .models import OrdemDeServico

@admin.register(OrdemDeServico)
class OrdemDeServicoAdmin(admin.ModelAdmin):
    list_display = ('id_os', 'descricao_servico', 'valor_estimado_minimo', 'valor_estimado_maximo', 'status', 'contratante', 'freelancer_selecionado', 'data_criacao')
    list_filter = ('status', 'data_criacao', 'contratante', 'freelancer_selecionado')
    search_fields = ('descricao_servico', 'contratante__nome', 'contratante__login')
    ordering = ('-data_criacao',)
    readonly_fields = ('id_os', 'data_criacao')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('contratante', 'freelancer_selecionado')
