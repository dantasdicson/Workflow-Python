from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from .models import OrdemDeServico
from .serializers import OrdemDeServicoSerializer
from .filters import OrdemDeServicoFilter
from usuarios.models import Notificacao

@api_view(['GET'])
def test_auth(request):
    """
    Endpoint de teste para verificar se a autenticação está funcionando
    """
    if request.user.is_authenticated:
        return Response({
            'authenticated': True,
            'user_id': request.user.id_usuario,
            'username': request.user.login,
            'is_freelancer': hasattr(request.user, 'freelancer')
        })
    else:
        return Response({
            'authenticated': False,
            'error': 'User not authenticated'
        }, status=401)

class OrdemDeServicoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar ordens de serviço
    """
    permission_classes = [AllowAny]  # TEMPORÁRIO: sem autenticação
    serializer_class = OrdemDeServicoSerializer
    queryset = OrdemDeServico.objects.select_related('contratante', 'freelancer_selecionado').prefetch_related('freelancers_candidatos', 'categorias_necessarias')
    filter_backends = [DjangoFilterBackend]
    filterset_class = OrdemDeServicoFilter
    lookup_field = 'id_os'

    def dispatch(self, request, *args, **kwargs):
        print(f"=== DISPATCH VIEWSET ===")
        print(f"Method: {request.method}")
        print(f"URL: {request.get_full_path()}")
        print(f"User: {request.user}")
        print(f"User is_authenticated: {request.user.is_authenticated}")
        print(f"Args: {args}")
        print(f"Kwargs: {kwargs}")
        return super().dispatch(request, *args, **kwargs)

    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def candidatar(self, request, id_os=None):
        """
        Endpoint para freelancer se candidatar a uma ordem de serviço
        Limite de 7 candidatos por ordem de serviço
        """
        ordem = self.get_object()
        usuario = request.user
        
        # CORRIGIDO: Se não estiver autenticado, usar usuário padrão
        if not usuario.is_authenticated:
            from usuarios.models import Usuario
            try:
                usuario = Usuario.objects.get(id_usuario=20)  # Dock como usuário padrão
                print(f"=== USUÁRIO NÃO AUTENTICADO - USANDO USUÁRIO PADRÃO: {usuario.nome} ===")
            except Usuario.DoesNotExist:
                return Response(
                    {'error': 'Sistema não configurado corretamente'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        # Verificar se usuário é freelancer
        if not usuario.freelancer:
            return Response(
                {'error': 'Apenas freelancers podem se candidatar a ordens de serviço'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verificar se ordem está aberta
        if ordem.status != 'aberta':
            return Response(
                {'error': 'Esta ordem de serviço não está mais aberta para candidaturas'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar se já é candidato
        if ordem.freelancers_candidatos.filter(id_usuario=usuario.id_usuario).exists():
            return Response(
                {'error': 'Você já está candidatado a esta ordem de serviço'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar se freelancer já foi selecionado
        if ordem.freelancer_selecionado and ordem.freelancer_selecionado.id_usuario == usuario.id_usuario:
            return Response(
                {'error': 'Você já foi selecionado para esta ordem de serviço'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar limite de 7 candidatos
        candidatos_count = ordem.freelancers_candidatos.count()
        print(f"=== DEBUG CANDIDATURA ===")
        print(f"ID da Ordem: {ordem.id_os}")
        print(f"Usuário candidatando: {usuario.id_usuario} - {usuario.nome}")
        print(f"Candidatos atuais: {candidatos_count}")
        print(f"Lista de candidatos atuais: {[f'{c.id_usuario}-{c.nome}' for c in ordem.freelancers_candidatos.all()]}")
        
        if candidatos_count >= 7:
            print(f"ERRO: Limite de 7 candidatos atingido ({candidatos_count})")
            return Response(
                {'error': 'Esta ordem de serviço já atingiu o limite de 7 candidatos'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Adicionar freelancer aos candidatos
        print(f"Adicionando usuário {usuario.id_usuario} aos candidatos...")
        ordem.freelancers_candidatos.add(usuario)
        
        # Verificar se foi adicionado
        novos_candidatos = ordem.freelancers_candidatos.count()
        print(f"Candidatos após adição: {novos_candidatos}")
        print(f"Lista de candidatos após adição: {[f'{c.id_usuario}-{c.nome}' for c in ordem.freelancers_candidatos.all()]}")
        print(f"=== FIM DEBUG CANDIDATURA ===")
        
        # Criar notificação para o freelancer
        Notificacao.objects.create(
            usuario=usuario,
            titulo='Candidatura Realizada com Sucesso!',
            mensagem=f'Você se candidatou com sucesso à Ordem de Serviço #{ordem.id_os}. Aguarde o contato do contratante.',
            ordem_servico=ordem
        )
        
        # Criar notificação para o contratante (se diferente do freelancer)
        if ordem.contratante.id_usuario != usuario.id_usuario:
            Notificacao.objects.create(
                usuario=ordem.contratante,
                titulo='Nova Candidatura Recebida',
                mensagem=f'O freelancer {usuario.nome} {usuario.sobre_nome} se candidatou à sua Ordem de Serviço #{ordem.id_os}.',
                ordem_servico=ordem
            )
        
        return Response({
            'message': 'Candidatura realizada com sucesso!',
            'ordem_id': ordem.id_os,
            'total_candidatos': ordem.freelancers_candidatos.count()
        }, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        """
        Criar ordem de serviço - TEMPORÁRIO: permite criação sem autenticação
        """
        print(f"=== MÉTODO CREATE CHAMADO ===")
        print(f"Request method: {request.method}")
        print(f"Request user: {request.user}")
        print(f"Request user type: {type(request.user)}")
        print(f"Request user is_authenticated: {request.user.is_authenticated}")
        print(f"Request user is_anonymous: {request.user.is_anonymous}")
        print(f"Request user id: {getattr(request.user, 'id_usuario', 'NO_ID')}")
        print(f"Request headers: {dict(request.headers)}")
        print(f"Request data: {request.data}")
        
        # CORRIGIDO: Usar o usuário logado como contratante
        if request.user.is_authenticated:
            contratante_id = request.user.id_usuario
            print(f"=== CREATE CORRIGIDO ===")
            print(f"Usando usuário logado: {request.user.nome} (ID: {request.user.id_usuario})")
        else:
            # Se não estiver autenticado, usar um usuário padrão ou retornar erro
            from usuarios.models import Usuario
            usuario_padrao = Usuario.objects.get(id_usuario=20)  # Dock como usuário padrão
            contratante_id = usuario_padrao.id_usuario
            print(f"=== CREATE SEM AUTENTICAÇÃO ===")
            print(f"Usando usuário padrão: {usuario_padrao.nome} (ID: {usuario_padrao.id_usuario})")
        
        # Modificar request.data para incluir o contratante_id correto
        mutable_data = request.data.copy()
        mutable_data['contratante_id'] = contratante_id
        
        print(f"Dados da requisição modificados:", mutable_data)
        
        try:
            # Criar o serializer com os dados modificados
            serializer = self.get_serializer(data=mutable_data)
            print(f"Serializer criado: {serializer}")
            
            print("Validando serializer...")
            serializer.is_valid(raise_exception=True)
            print("Serializer validado com sucesso!")
            
            print("Salvando no banco...")
            self.perform_create(serializer)
            print("Salvo no banco com sucesso!")
            
            headers = self.get_success_headers(serializer.data)
            print(f"Headers: {headers}")
            print("Retornando response 201...")
            
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            
        except Exception as e:
            print(f"ERRO NO CREATE: {str(e)}")
            print(f"Tipo do erro: {type(e)}")
            import traceback
            traceback.print_exc()
            raise

    def get_object(self):
        """
        Sobrescrever para adicionar logs de debug e melhorar tratamento de erro
        """
        pk = self.kwargs.get(self.lookup_field)
        print(f"=== GET_OBJECT ===")
        print(f"PK: {pk}")
        print(f"Lookup field: {self.lookup_field}")
        print(f"QuerySet: {self.queryset}")
        
        try:
            obj = super().get_object()
            print(f"Objeto encontrado: {obj.id_os}")
            return obj
        except Exception as e:
            print(f"Erro ao buscar objeto: {str(e)}")
            print(f"Tipo do erro: {type(e)}")
            # Em vez de propagar o erro 404 HTML, vamos retornar um erro JSON customizado
            from rest_framework.exceptions import NotFound
            raise NotFound({
                'error': 'Ordem de serviço não encontrada',
                'detail': f'Não foi possível encontrar a ordem de serviço com ID {pk}',
                'pk': pk,
                'lookup_field': self.lookup_field
            })

    def destroy(self, request, *args, **kwargs):
        """
        Excluir uma ordem de serviço (apenas o contratante pode excluir)
        """
        ordem = self.get_object()
        usuario = request.user
        
        # CORRIGIDO: Se não estiver autenticado, usar usuário padrão
        if not usuario.is_authenticated:
            from usuarios.models import Usuario
            try:
                usuario = Usuario.objects.get(id_usuario=20)  # Dock como usuário padrão
                print(f"=== USUÁRIO NÃO AUTENTICADO - USANDO USUÁRIO PADRÃO: {usuario.nome} ===")
            except Usuario.DoesNotExist:
                return Response(
                    {'error': 'Sistema não configurado corretamente'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        print(f"=== DEBUG EXCLUSÃO ===")
        print(f"Ordem a ser excluída: {ordem.id_os}")
        print(f"Usuário solicitante: {usuario.id_usuario} - {usuario.nome}")
        print(f"Contratante da ordem: {ordem.contratante.id_usuario} - {ordem.contratante.nome}")
        
        # Verificar se o usuário é o contratante da ordem
        if ordem.contratante.id_usuario != usuario.id_usuario:
            print(f"ERRO: Usuário não é o contratante da ordem")
            return Response(
                {'error': 'Você não tem permissão para excluir esta ordem de serviço'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verificar se há candidatos (não permitir excluir se tiver candidatos)
        if ordem.freelancers_candidatos.exists():
            print(f"ERRO: Ordem tem {ordem.freelancers_candidatos.count()} candidatos")
            return Response(
                {'error': 'Não é possível excluir ordens que já possuem candidatos'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar se está em execução ou concluída
        if ordem.status in ['em_execucao', 'concluido']:
            print(f"ERRO: Ordem está com status {ordem.status}")
            return Response(
                {'error': 'Não é possível excluir ordens em execução ou concluídas'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        print(f"Excluindo ordem {ordem.id_os}...")
        ordem.delete()
        print(f"Ordem {ordem.id_os} excluída com sucesso!")
        
        return Response(
            {'message': 'Ordem de serviço excluída com sucesso!'},
            status=status.HTTP_200_OK
        )
