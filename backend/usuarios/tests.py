from django.test import TestCase
from rest_framework.test import APIClient

from usuarios.models import Categoria, Usuario


class AnuncioServicoTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.categoria = Categoria.objects.create(nome='Refrigeracao')
        self.freelancer = Usuario.objects.create_user(
            login='freela-anuncio',
            password='senha123',
            email='freela-anuncio@example.com',
            nome='Freela',
            sobre_nome='Anuncio',
            cpf='39053344705',
            freelancer=True,
        )
        self.contratante = Usuario.objects.create_user(
            login='contratante-anuncio',
            password='senha123',
            email='contratante-anuncio@example.com',
            nome='Contra',
            sobre_nome='Tante',
            cpf='71460238001',
            freelancer=False,
        )

    def test_freelancer_cria_proprio_anuncio(self):
        self.client.force_authenticate(user=self.freelancer)

        response = self.client.post('/api/anuncios-servico/meu-anuncio/', {
            'titulo_profissional': 'Tecnico de Refrigeracao',
            'descricao': 'Instalacao, manutencao e diagnostico em sistemas residenciais.',
            'portfolio_url': 'https://portfolio.exemplo.com/refrigeracao',
            'habilidades_ids': [self.categoria.id],
        }, format='multipart')

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['titulo_profissional'], 'Tecnico de Refrigeracao')
        self.assertEqual(len(response.data['habilidades']), 1)

    def test_usuario_nao_freelancer_nao_cria_anuncio(self):
        self.client.force_authenticate(user=self.contratante)

        response = self.client.post('/api/anuncios-servico/meu-anuncio/', {
            'titulo_profissional': 'Nao deveria criar',
            'descricao': 'Descricao qualquer',
            'portfolio_url': 'https://portfolio.exemplo.com/nao-criar',
        }, format='multipart')

        self.assertEqual(response.status_code, 403)
