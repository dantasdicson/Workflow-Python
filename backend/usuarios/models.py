from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone

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


class UsuarioManager(BaseUserManager):
    def create_user(self, login, password=None, **extra_fields):
        if not login:
            raise ValueError('O campo login é obrigatório')

        extra_fields.setdefault('is_active', True)
        user = self.model(login=login, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, login, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser precisa ter is_staff=True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser precisa ter is_superuser=True')

        return self.create_user(login=login, password=password, **extra_fields)


class Usuario(AbstractBaseUser, PermissionsMixin):
    id_usuario = models.AutoField(primary_key=True)
    login = models.CharField(max_length=100, unique=True)
    password = models.CharField(max_length=128, db_column='senha')
    last_login = models.DateTimeField(null=True, blank=True)
    nome = models.CharField(max_length=100)
    sobre_nome = models.CharField(max_length=100, blank=True)
    email = models.EmailField(unique=True)
    data_nascimento = models.DateField(null=True, blank=True)
    num_tel = models.CharField(max_length=20, blank=True)
    whatsapp = models.BooleanField(default=False)
    cpf = models.CharField(max_length=14, unique=True)
    freelancer = models.BooleanField(default=False)
    habilidades = models.ManyToManyField(Habilidade, blank=True, related_name='usuarios')
    data_criacao = models.DateTimeField(auto_now_add=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UsuarioManager()

    USERNAME_FIELD = 'login'
    REQUIRED_FIELDS = ['email']

    class Meta:
        db_table = 'tab_usuario'
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'
        ordering = ['nome', 'sobre_nome']

    def __str__(self):
        return f"{self.nome} {self.sobre_nome}"
