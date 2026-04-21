from datetime import timedelta
from smtplib import SMTPException

from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.db.models import Q
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from usuarios.models import Usuario


def mask_email(email):
    local_part, separator, domain = str(email or '').partition('@')
    if not separator or not local_part or not domain:
        return 'email cadastrado'

    domain_name, dot, extension = domain.rpartition('.')
    masked_local = local_part[:2] if len(local_part) > 1 else f'{local_part}*'

    if dot and domain_name and extension:
        masked_domain = f'{domain_name[:2]}**.{extension}'
    else:
        masked_domain = f'{domain[:2]}**'

    return f'{masked_local}@{masked_domain}'


class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        login = str(request.data.get('login') or '').strip()
        password = request.data.get('password') or ''

        if not login or not password:
            return Response(
                {'detail': 'Login e senha sao obrigatorios.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = Usuario.objects.filter(login=login, is_active=True).first()
        if not user:
            user = Usuario.objects.filter(login__iexact=login, is_active=True).first()

        if not user:
            return Response(
                {'detail': 'Nao foi encontrado usuario com esse login.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not user.check_password(password):
            return Response(
                {'detail': 'Senha invalida.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh_token = RefreshToken.for_user(user)
        access_token = refresh_token.access_token

        response = Response({
            'ok': True,
            'message': 'Login successful',
            'access': str(access_token),
            'refresh': str(refresh_token),
        }, status=status.HTTP_200_OK)

        response.set_cookie(
            'wf_access',
            str(access_token),
            max_age=timedelta(minutes=15).total_seconds(),
            httponly=True,
            secure=False,
            samesite='Lax',
            path='/',
        )

        response.set_cookie(
            'wf_refresh',
            str(refresh_token),
            max_age=timedelta(days=7).total_seconds(),
            httponly=True,
            secure=False,
            samesite='Lax',
            path='/',
        )

        return response


class CustomTokenRefreshView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('wf_refresh') or request.data.get('refresh')

        if not refresh_token:
            return Response(
                {'detail': 'Refresh token not provided'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        from rest_framework_simplejwt.serializers import TokenRefreshSerializer

        serializer = TokenRefreshSerializer(data={'refresh': refresh_token})
        serializer.is_valid(raise_exception=True)
        access_token = serializer.validated_data['access']

        response = Response({
            'ok': True,
            'access': str(access_token),
        }, status=status.HTTP_200_OK)

        response.set_cookie(
            'wf_access',
            str(access_token),
            max_age=timedelta(minutes=15).total_seconds(),
            httponly=True,
            secure=False,
            samesite='Lax',
            path='/',
        )

        return response


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        login = str(request.data.get('login') or request.data.get('email') or '').strip()
        if not login:
            return Response({'detail': 'Email ou login obrigatorio.'}, status=status.HTTP_400_BAD_REQUEST)

        reset_url = None
        user = Usuario.objects.filter(
            Q(login__iexact=login) | Q(email__iexact=login),
            is_active=True,
        ).first()

        if not user:
            return Response(
                {'detail': 'Email ou Login nao encontrado'},
                status=status.HTTP_404_NOT_FOUND,
            )

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        frontend_url = getattr(settings, 'FRONTEND_BASE_URL', 'http://localhost:3000')
        reset_url = f'{frontend_url}/novaSenha?uid={uid}&token={token}'

        try:
            send_mail(
                subject='Redefinicao de senha - WorkFlow',
                message=(
                    f'Ola, {user.nome or user.login}.\n\n'
                    'Recebemos uma solicitacao para redefinir sua senha.\n'
                    f'Acesse o link abaixo para cadastrar uma nova senha:\n\n{reset_url}\n\n'
                    'Se voce nao solicitou essa alteracao, ignore este email.'
                ),
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@workflow.local'),
                recipient_list=[user.email],
                fail_silently=False,
            )
        except SMTPException:
            return Response(
                {
                    'ok': False,
                    'detail': (
                        'Nao foi possivel enviar o email. Verifique se o SMTP esta habilitado '
                        'na conta remetente e se a senha informada e uma senha de app valida.'
                    ),
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        data = {
            'ok': True,
            'detail': f'Foi enviado um email para {mask_email(user.email)} com as instrucoes de redefinicao de senha.',
        }

        if (
            reset_url
            and settings.DEBUG
            and settings.EMAIL_BACKEND == 'django.core.mail.backends.console.EmailBackend'
        ):
            data['dev_reset_url'] = reset_url

        return Response(data, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        uid = request.data.get('uid')
        token = request.data.get('token')
        password = request.data.get('password')

        if not uid or not token or not password:
            return Response(
                {'detail': 'uid, token e password sao obrigatorios.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = Usuario.objects.get(pk=user_id, is_active=True)
        except (TypeError, ValueError, OverflowError, Usuario.DoesNotExist):
            return Response({'detail': 'Link de redefinicao invalido.'}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({'detail': 'Link de redefinicao invalido ou expirado.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(password, user)
        except ValidationError as exc:
            return Response({'detail': list(exc.messages)}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(password)
        user.save(update_fields=['password'])

        return Response({'ok': True, 'detail': 'Senha redefinida com sucesso.'}, status=status.HTTP_200_OK)


class AuthenticatedPasswordChangeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        password = request.data.get('password')

        if not password:
            return Response(
                {'detail': 'password e obrigatorio.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            validate_password(password, request.user)
        except ValidationError as exc:
            return Response({'detail': list(exc.messages)}, status=status.HTTP_400_BAD_REQUEST)

        request.user.set_password(password)
        request.user.save(update_fields=['password'])

        return Response({'ok': True, 'detail': 'Senha alterada com sucesso.'}, status=status.HTTP_200_OK)
