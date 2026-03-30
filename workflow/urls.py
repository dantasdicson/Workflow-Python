from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from rest_framework.routers import DefaultRouter
from ordens.views import OrdemDeServicoViewSet
from usuarios.views import UsuarioViewSet, HabilidadeViewSet
from .views import home

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)
router.register(r'habilidades', HabilidadeViewSet)
router.register(r'ordens', OrdemDeServicoViewSet)

urlpatterns = [
    path('', home, name='home'),
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
]
