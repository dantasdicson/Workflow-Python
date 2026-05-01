from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone

from usuarios.models import Categoria, Usuario


class OrdemDeServico(models.Model):
    STATUS_ABERTA = 'aberta'
    STATUS_EM_EXECUCAO = 'em_execucao'
    STATUS_FINALIZADO = 'finalizado'

    STATUS_CHOICES = [
        (STATUS_ABERTA, 'Aberta'),
        (STATUS_EM_EXECUCAO, 'Em execucao'),
        (STATUS_FINALIZADO, 'Finalizado'),
    ]

    id_os = models.AutoField(primary_key=True)
    contratante = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='ordens_contratadas')
    freelancer_selecionado = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, blank=True, related_name='ordens_selecionadas')
    freelancers_candidatos = models.ManyToManyField(Usuario, related_name='ordens_candidatas', blank=True)
    descricao_servico = models.TextField()
    valor_estimado_minimo = models.DecimalField(max_digits=10, decimal_places=2)
    valor_estimado_maximo = models.DecimalField(max_digits=10, decimal_places=2)
    categorias_necessarias = models.ManyToManyField(Categoria, related_name='ordens', blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_ABERTA)
    imagem = models.ImageField(upload_to='ordens/', null=True, blank=True)
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_conclusao = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"OS #{self.id_os} - {self.descricao_servico[:50]}"

    def pode_receber_candidaturas(self):
        return self.status == self.STATUS_ABERTA

    def selecionar_freelancer(self, freelancer):
        self.freelancer_selecionado = freelancer
        self.status = self.STATUS_EM_EXECUCAO
        self.save(update_fields=['freelancer_selecionado', 'status'])

    def finalizar(self):
        self.status = self.STATUS_FINALIZADO
        self.data_conclusao = timezone.now()
        self.save(update_fields=['status', 'data_conclusao'])

    class Meta:
        db_table = 'tab_ordem_servico'
        ordering = ['-data_criacao']


class ConversaOrdem(models.Model):
    STATUS_CHOICES = [
        ('ativa', 'Ativa'),
        ('bloqueada', 'Bloqueada'),
        ('encerrada', 'Encerrada'),
    ]

    TIPO_CHOICES = [
        ('candidatura', 'Candidatura'),
        ('principal', 'Principal'),
    ]

    id = models.AutoField(primary_key=True)
    ordem_servico = models.ForeignKey(OrdemDeServico, on_delete=models.CASCADE, related_name='conversas')
    contratante = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='conversas_como_contratante')
    freelancer = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='conversas_como_freelancer')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ativa')
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='candidatura')
    ultima_mensagem_em = models.DateTimeField(null=True, blank=True)
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tab_conversa_ordem'
        ordering = ['-ultima_mensagem_em', '-data_atualizacao', '-data_criacao']
        constraints = [
            models.UniqueConstraint(
                fields=['ordem_servico', 'freelancer'],
                name='uniq_conversa_ordem_freelancer',
            ),
        ]

    def __str__(self):
        return f"Conversa OS #{self.ordem_servico_id} - Freelancer #{self.freelancer_id}"


class MensagemChat(models.Model):
    id = models.AutoField(primary_key=True)
    conversa = models.ForeignKey(ConversaOrdem, on_delete=models.CASCADE, related_name='mensagens')
    remetente = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='mensagens_chat')
    conteudo = models.TextField()
    lida_em = models.DateTimeField(null=True, blank=True)
    data_envio = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'tab_mensagem_chat'
        ordering = ['data_envio']

    def __str__(self):
        return f"Mensagem #{self.id} - Conversa #{self.conversa_id}"


class AvaliacaoOrdem(models.Model):
    AVALIADOR_CONTRATANTE = 'contratante'
    AVALIADOR_FREELANCER = 'freelancer'

    AVALIADOR_TIPO_CHOICES = [
        (AVALIADOR_CONTRATANTE, 'Contratante'),
        (AVALIADOR_FREELANCER, 'Freelancer'),
    ]

    id = models.AutoField(primary_key=True)
    ordem_servico = models.ForeignKey(OrdemDeServico, on_delete=models.CASCADE, related_name='avaliacoes')
    avaliador = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='avaliacoes_feitas')
    avaliado = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='avaliacoes_recebidas')
    avaliador_tipo = models.CharField(max_length=20, choices=AVALIADOR_TIPO_CHOICES)
    nota_profissional = models.PositiveSmallIntegerField(validators=[MinValueValidator(0), MaxValueValidator(5)])
    nota_plataforma = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
    )
    comentario = models.TextField(blank=True)
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tab_avaliacao_ordem'
        ordering = ['-data_criacao']
        constraints = [
            models.UniqueConstraint(
                fields=['ordem_servico', 'avaliador'],
                name='uniq_avaliacao_ordem_avaliador',
            ),
        ]

    def __str__(self):
        return f"Avaliacao OS #{self.ordem_servico_id} por #{self.avaliador_id}"

    def save(self, *args, **kwargs):
        avaliado_anterior_id = None
        if self.pk:
            avaliado_anterior_id = (
                AvaliacaoOrdem.objects
                .filter(pk=self.pk)
                .values_list('avaliado_id', flat=True)
                .first()
            )

        super().save(*args, **kwargs)
        self.avaliado.recalcular_avaliacao()

        if avaliado_anterior_id and avaliado_anterior_id != self.avaliado_id:
            Usuario.objects.get(pk=avaliado_anterior_id).recalcular_avaliacao()

    def delete(self, *args, **kwargs):
        avaliado = self.avaliado
        resultado = super().delete(*args, **kwargs)
        avaliado.recalcular_avaliacao()
        return resultado
