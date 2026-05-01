from django.test import TestCase
from rest_framework.test import APIClient

from ordens.models import AvaliacaoOrdem, ConversaOrdem, OrdemDeServico
from usuarios.models import Usuario


class OrdemChatTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.contratante = Usuario.objects.create_user(
            login='contratante',
            password='senha123',
            email='contratante@example.com',
            nome='Contra',
            sobre_nome='Tante',
            cpf='12345678909',
            freelancer=False,
        )
        self.freelancer_1 = Usuario.objects.create_user(
            login='freela1',
            password='senha123',
            email='freela1@example.com',
            nome='Free',
            sobre_nome='One',
            cpf='11144477735',
            freelancer=True,
        )
        self.freelancer_2 = Usuario.objects.create_user(
            login='freela2',
            password='senha123',
            email='freela2@example.com',
            nome='Free',
            sobre_nome='Two',
            cpf='52998224725',
            freelancer=True,
        )
        self.ordem = OrdemDeServico.objects.create(
            contratante=self.contratante,
            descricao_servico='Criar landing page',
            valor_estimado_minimo='100.00',
            valor_estimado_maximo='200.00',
        )

    def test_candidatura_cria_conversa(self):
        self.client.force_authenticate(user=self.freelancer_1)

        response = self.client.post(f'/api/ordens/{self.ordem.id_os}/candidatar/')

        self.assertEqual(response.status_code, 200)
        self.assertTrue(
            ConversaOrdem.objects.filter(ordem_servico=self.ordem, freelancer=self.freelancer_1).exists()
        )

    def test_selecao_bloqueia_outros_chats(self):
        self.ordem.freelancers_candidatos.add(self.freelancer_1, self.freelancer_2)
        conversa_1 = ConversaOrdem.objects.create(
            ordem_servico=self.ordem,
            contratante=self.contratante,
            freelancer=self.freelancer_1,
        )
        conversa_2 = ConversaOrdem.objects.create(
            ordem_servico=self.ordem,
            contratante=self.contratante,
            freelancer=self.freelancer_2,
        )

        self.client.force_authenticate(user=self.contratante)
        response = self.client.post(
            f'/api/ordens/{self.ordem.id_os}/selecionar-freelancer/',
            {'freelancer_id': self.freelancer_1.id_usuario},
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.ordem.refresh_from_db()
        conversa_1.refresh_from_db()
        conversa_2.refresh_from_db()
        self.assertEqual(self.ordem.status, 'em_execucao')
        self.assertEqual(self.ordem.freelancer_selecionado_id, self.freelancer_1.id_usuario)
        self.assertEqual(conversa_1.tipo, 'principal')
        self.assertEqual(conversa_1.status, 'ativa')
        self.assertEqual(conversa_2.status, 'bloqueada')

    def test_freelancer_nao_selecionado_nao_envia_mensagem_apos_inicio(self):
        self.ordem.freelancers_candidatos.add(self.freelancer_1, self.freelancer_2)
        conversa_1 = ConversaOrdem.objects.create(
            ordem_servico=self.ordem,
            contratante=self.contratante,
            freelancer=self.freelancer_1,
            tipo='principal',
            status='ativa',
        )
        conversa_2 = ConversaOrdem.objects.create(
            ordem_servico=self.ordem,
            contratante=self.contratante,
            freelancer=self.freelancer_2,
            status='bloqueada',
        )
        self.ordem.freelancer_selecionado = self.freelancer_1
        self.ordem.status = 'em_execucao'
        self.ordem.save(update_fields=['freelancer_selecionado', 'status'])

        self.client.force_authenticate(user=self.freelancer_2)
        response = self.client.post(
            f'/api/ordens/{self.ordem.id_os}/conversas/{conversa_2.id}/mensagens/',
            {'conteudo': 'Posso continuar?'},
            format='json',
        )

        self.assertEqual(response.status_code, 400)

    def test_contratante_finaliza_ordem_com_avaliacao(self):
        self.ordem.freelancers_candidatos.add(self.freelancer_1)
        self.ordem.freelancer_selecionado = self.freelancer_1
        self.ordem.status = 'em_execucao'
        self.ordem.save(update_fields=['freelancer_selecionado', 'status'])

        self.client.force_authenticate(user=self.contratante)
        response = self.client.post(
            f'/api/ordens/{self.ordem.id_os}/finalizar-servico/',
            {
                'nota_freelancer': 5,
                'nota_plataforma': 4,
                'comentario': 'Servico entregue corretamente.',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.ordem.refresh_from_db()
        self.assertEqual(self.ordem.status, 'finalizado')
        self.assertTrue(self.ordem.data_conclusao)
        self.assertTrue(
            AvaliacaoOrdem.objects.filter(
                ordem_servico=self.ordem,
                avaliador=self.contratante,
                avaliado=self.freelancer_1,
                nota_profissional=5,
                nota_plataforma=4,
            ).exists()
        )
        self.freelancer_1.refresh_from_db()
        self.assertEqual(str(self.freelancer_1.avaliacao_media), '5.00')
        self.assertEqual(self.freelancer_1.total_avaliacoes, 1)

    def test_freelancer_avalia_contratante_apos_finalizacao(self):
        self.ordem.freelancers_candidatos.add(self.freelancer_1)
        self.ordem.freelancer_selecionado = self.freelancer_1
        self.ordem.status = 'finalizado'
        self.ordem.save(update_fields=['freelancer_selecionado', 'status'])

        self.client.force_authenticate(user=self.freelancer_1)
        response = self.client.post(
            f'/api/ordens/{self.ordem.id_os}/avaliar-contratante/',
            {
                'nota_contratante': 4,
                'comentario': 'Boa comunicacao.',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(
            AvaliacaoOrdem.objects.filter(
                ordem_servico=self.ordem,
                avaliador=self.freelancer_1,
                avaliado=self.contratante,
                nota_profissional=4,
                nota_plataforma__isnull=True,
            ).exists()
        )
        self.contratante.refresh_from_db()
        self.assertEqual(str(self.contratante.avaliacao_media), '4.00')
        self.assertEqual(self.contratante.total_avaliacoes, 1)

    def test_media_do_usuario_recalcula_com_feedbacks_recebidos(self):
        outra_ordem = OrdemDeServico.objects.create(
            contratante=self.contratante,
            descricao_servico='Criar aplicativo',
            valor_estimado_minimo='300.00',
            valor_estimado_maximo='600.00',
        )

        avaliacao_1 = AvaliacaoOrdem.objects.create(
            ordem_servico=self.ordem,
            avaliador=self.contratante,
            avaliado=self.freelancer_1,
            avaliador_tipo=AvaliacaoOrdem.AVALIADOR_CONTRATANTE,
            nota_profissional=5,
            nota_plataforma=4,
        )
        AvaliacaoOrdem.objects.create(
            ordem_servico=outra_ordem,
            avaliador=self.freelancer_2,
            avaliado=self.freelancer_1,
            avaliador_tipo=AvaliacaoOrdem.AVALIADOR_FREELANCER,
            nota_profissional=3,
        )

        self.freelancer_1.refresh_from_db()
        self.assertEqual(str(self.freelancer_1.avaliacao_media), '4.00')
        self.assertEqual(self.freelancer_1.total_avaliacoes, 2)

        avaliacao_1.delete()

        self.freelancer_1.refresh_from_db()
        self.assertEqual(str(self.freelancer_1.avaliacao_media), '3.00')
        self.assertEqual(self.freelancer_1.total_avaliacoes, 1)
