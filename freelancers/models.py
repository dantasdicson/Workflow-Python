from django.db import models
from usuarios.models import Habilidade

class Freelancer(models.Model):
    id_freelancer = models.AutoField(primary_key=True)
    login = models.CharField(max_length=100, unique=True)
    senha = models.CharField(max_length=255)
    nome = models.CharField(max_length=100)
    sobrenome = models.CharField(max_length=100, blank=True)
    email = models.EmailField(unique=True)
    data_nasc = models.DateField(null=True, blank=True)
    num_tel = models.CharField(max_length=20, blank=True)
    num_cel = models.CharField(max_length=20, blank=True)
    cpf = models.CharField(max_length=14, unique=True)
    habilidades = models.ManyToManyField(Habilidade, blank=True, related_name='freelancers')
    data_criacao = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'tab_freelancer'
        verbose_name = 'Freelancer'
        verbose_name_plural = 'Freelancers'
        ordering = ['nome', 'sobrenome']

    def __str__(self):
        return f"{self.nome} {self.sobrenome}"