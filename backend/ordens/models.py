from django.db import models
from usuarios.models import Usuario, Categoria

class OrdemDeServico(models.Model):
    STATUS_CHOICES = [
        ('aberta', 'Aberta'),
        ('em_execucao', 'Em Execução'),
        ('concluido', 'Concluído'),
    ]
    
    id_os = models.AutoField(primary_key=True)
    contratante = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='ordens_contratadas')
    freelancer_selecionado = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, blank=True, related_name='ordens_selecionadas')
    freelancers_candidatos = models.ManyToManyField(Usuario, related_name='ordens_candidatas', blank=True)
    descricao_servico = models.TextField()
    valor_estimado_minimo = models.DecimalField(max_digits=10, decimal_places=2)
    valor_estimado_maximo = models.DecimalField(max_digits=10, decimal_places=2)
    categorias_necessarias = models.ManyToManyField(Categoria, related_name='ordens', blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='aberta')
    imagem = models.ImageField(upload_to='ordens/', null=True, blank=True)
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_conclusao = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"OS #{self.id_os} - {self.descricao_servico[:50]}"
    
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
