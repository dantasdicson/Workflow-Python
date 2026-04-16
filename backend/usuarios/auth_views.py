from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from datetime import timedelta

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        # Chamar o método original para obter os tokens
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Obter tokens
        access_token = serializer.validated_data['access']
        refresh_token = serializer.validated_data['refresh']
        
        # Criar resposta
        response = Response({
            'ok': True,
            'message': 'Login successful',
            'access': str(access_token),
            'refresh': str(refresh_token)
        }, status=status.HTTP_200_OK)
        
        # Definir cookies
        response.set_cookie(
            'wf_access',
            str(access_token),
            max_age=timedelta(minutes=15).total_seconds(),
            httponly=True,
            secure=False,  # Em produção, usar True com HTTPS
            samesite='Lax',
            path='/'
        )
        
        response.set_cookie(
            'wf_refresh',
            str(refresh_token),
            max_age=timedelta(days=7).total_seconds(),
            httponly=True,
            secure=False,  # Em produção, usar True com HTTPS
            samesite='Lax',
            path='/'
        )
        
        print("=== LOGIN DEBUG ===")
        print("Access token cookie set:", str(access_token)[:20] + "...")
        print("Refresh token cookie set:", str(refresh_token)[:20] + "...")
        print("=== FIM LOGIN DEBUG ===")
        
        return response

class CustomTokenRefreshView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        # Tentar obter refresh token do cookie
        refresh_token = request.COOKIES.get('wf_refresh')
        
        if not refresh_token:
            # Se não tiver cookie, tentar do body
            refresh_token = request.data.get('refresh')
        
        if not refresh_token:
            return Response(
                {'detail': 'Refresh token not provided'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Criar serializer manualmente
        from rest_framework_simplejwt.serializers import TokenRefreshSerializer
        serializer = TokenRefreshSerializer(data={'refresh': refresh_token})
        serializer.is_valid(raise_exception=True)
        
        # Obter novo access token
        access_token = serializer.validated_data['access']
        
        # Criar resposta
        response = Response({
            'ok': True,
            'access': str(access_token)
        }, status=status.HTTP_200_OK)
        
        # Atualizar cookie de access
        response.set_cookie(
            'wf_access',
            str(access_token),
            max_age=timedelta(minutes=15).total_seconds(),
            httponly=True,
            secure=False,
            samesite='Lax',
            path='/'
        )
        
        print("=== REFRESH DEBUG ===")
        print("New access token cookie set:", str(access_token)[:20] + "...")
        print("=== FIM REFRESH DEBUG ===")
        
        return response
