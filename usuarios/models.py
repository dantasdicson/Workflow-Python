from django.db import models

class Habilidade(models.Model):
    id = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=100, unique=True)
    descricao = models.TextField(blank=True)

    class Meta:
        db_table = 'tab_habilidade'
        verbose_name = 'Habilidade'
        verbose_name_plural = 'Habilidades'

    def __str__(self):
        return self.nome


class Usuario(models.Model):
    id_usuario = models.AutoField(primary_key=True)
    login = models.CharField(max_length=100, unique=True)
    senha = models.CharField(max_length=255)
    nome = models.CharField(max_length=100)
    sobre_nome = models.CharField(max_length=100, blank=True)
    email = models.EmailField(unique=True)
    data_nascimento = models.DateField(null=True, blank=True)
    num_tel = models.CharField(max_length=20, blank=True)
    num_cel = models.CharField(max_length=20, blank=True)
    cpf = models.CharField(max_length=14, unique=True)
    freelancer = models.BooleanField(default=False)
    habilidades = models.ManyToManyField(Habilidade, blank=True, related_name='usuarios')
    data_criacao = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'tab_usuario'
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'
        ordering = ['nome', 'sobre_nome']

    def __str__(self):
        return f"{self.nome} {self.sobre_nome}"
