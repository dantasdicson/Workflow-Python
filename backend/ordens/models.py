from django.db import models
from usuarios.models import Usuario, Habilidade

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
    habilidades_necessarias = models.ManyToManyField(Habilidade, related_name='ordens', blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='aberta')
    imagem = models.ImageField(upload_to='ordens/', null=True, blank=True)
    data_criacao = models.DateTimeField(auto_now_add=True)
    data_conclusao = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"OS #{self.id_os} - {self.descricao_servico[:50]}"
    
    class Meta:
        db_table = 'tab_ordem_servico'
        ordering = ['-data_criacao']
