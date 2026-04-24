from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from ordens.views import OrdemDeServicoViewSet, test_auth
from usuarios.views import UsuarioViewSet, CategoriaViewSet, AnuncioServicoViewSet
from usuarios.views import MeView, NotificacaoListView, MarcarNotificacaoLidaView
from usuarios.auth_views import (
    AuthenticatedPasswordChangeView,
    CustomTokenObtainPairView,
    CustomTokenRefreshView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
)
from .views import home

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)
router.register(r'categorias', CategoriaViewSet)
router.register(r'ordens', OrdemDeServicoViewSet)
router.register(r'anuncios-servico', AnuncioServicoViewSet, basename='anuncios-servico')

urlpatterns = [
    path('', home, name='home'),
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/me/', MeView.as_view(), name='auth_me'),
    path('api/notificacoes/', NotificacaoListView.as_view(), name='notificacoes_list'),
    path('api/notificacoes/<int:notificacao_id>/marcar-lida/', MarcarNotificacaoLidaView.as_view(), name='notificacao_marcar_lida'),
    path('api/auth/change-password/', AuthenticatedPasswordChangeView.as_view(), name='change_password'),
    path('api/auth/password-reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('api/auth/password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('api/test-auth/', test_auth, name='test_auth'),
    path('api-auth/', include('rest_framework.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
