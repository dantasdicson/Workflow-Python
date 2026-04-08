from django.contrib import admin
from .models import Usuario, Habilidade

@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('login', 'nome', 'sobre_nome', 'email', 'freelancer', 'is_staff', 'is_active', 'data_criacao')
    list_filter = ('freelancer', 'is_staff', 'is_active', 'data_criacao')
    search_fields = ('login', 'nome', 'sobre_nome', 'email')
    ordering = ('-data_criacao',)

@admin.register(Habilidade)
class HabilidadeAdmin(admin.ModelAdmin):
    list_display = ('nome', 'descricao')
    search_fields = ('nome',)
    ordering = ('nome',)
