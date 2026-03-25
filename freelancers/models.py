from django.db import models

class Habilidade(models.Model):
    id = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=100, unique=True)
    descricao = models.TextField(blank=True)
    
    def __str__(self):
        return self.nome
    
    class Meta:
        db_table = 'tab_habilidade'

class Freelancer(models.Model):
    id_freelancer = models.AutoField(primary_key=True)
    login = models.CharField(max_length=100, unique=True)
    senha = models.CharField(max_length=255)  # Usar make_password() do Django!
    nome = models.CharField(max_length=100)
    sobrenome = models.CharField(max_length=100)
    data_nasc = models.DateField(null=True, blank=True)
    cpf = models.CharField(max_length=11, unique=True)
    email = models.EmailField(unique=True)
    num_tel = models.CharField(max_length=11, blank=True)
    num_cel = models.CharField(max_length=11, blank=True)
    habilidades = models.ManyToManyField(Habilidade, blank=True)
    data_criacao = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.nome} {self.sobrenome}"
    
    class Meta:
        db_table = 'tab_freelancer'
        ordering = ['nome']
