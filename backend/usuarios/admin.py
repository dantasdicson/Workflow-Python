from django.contrib import admin

from .models import AnuncioServico, Categoria, Notificacao, Usuario


@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('login', 'nome', 'sobre_nome', 'email', 'freelancer', 'is_staff', 'is_active', 'data_criacao')
    list_filter = ('freelancer', 'is_staff', 'is_active', 'data_criacao')
    search_fields = ('login', 'nome', 'sobre_nome', 'email')
    ordering = ('-data_criacao',)


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('nome',)
    search_fields = ('nome',)
    ordering = ('nome',)


@admin.register(Notificacao)
class NotificacaoAdmin(admin.ModelAdmin):
    list_display = ('id', 'usuario', 'titulo', 'lida', 'data_criacao', 'ordem_servico')
    list_filter = ('lida', 'data_criacao')
    search_fields = ('titulo', 'mensagem', 'usuario__login', 'usuario__nome')
    ordering = ('-data_criacao',)


@admin.register(AnuncioServico)
class AnuncioServicoAdmin(admin.ModelAdmin):
    list_display = ('id', 'titulo_profissional', 'freelancer', 'data_criacao', 'data_atualizacao')
    list_filter = ('data_criacao', 'data_atualizacao')
    search_fields = ('titulo_profissional', 'descricao', 'freelancer__login', 'freelancer__nome')
    filter_horizontal = ('habilidades',)
    ordering = ('-data_atualizacao',)
