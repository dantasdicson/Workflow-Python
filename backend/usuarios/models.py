from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db.models.functions import Lower
from django.utils import timezone

class Categoria(models.Model):
    id = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = 'tab_categoria'
        verbose_name = 'Categoria'
        verbose_name_plural = 'Categorias'

    def __str__(self):
        return self.nome


class UsuarioManager(BaseUserManager):
    def create_user(self, login, password=None, **extra_fields):
        if not login:
            raise ValueError('O campo login é obrigatório')

        login = str(login).strip()
        if self.model.objects.filter(login__iexact=login).exists():
            raise ValueError('Ja existe um usuario cadastrado com esse login')

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
    categorias = models.ManyToManyField(Categoria, blank=True, related_name='usuarios')
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
        constraints = [
            models.UniqueConstraint(Lower('login'), name='uniq_usuario_login_ci'),
        ]

    def __str__(self):
        return f"{self.nome} {self.sobre_nome}"


class Notificacao(models.Model):
    id = models.AutoField(primary_key=True)
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='notificacoes')
    titulo = models.CharField(max_length=200)
    mensagem = models.TextField()
    lida = models.BooleanField(default=False)
    data_criacao = models.DateTimeField(auto_now_add=True)
    ordem_servico = models.ForeignKey('ordens.OrdemDeServico', on_delete=models.CASCADE, null=True, blank=True)
    
    class Meta:
        db_table = 'tab_notificacao'
        ordering = ['-data_criacao']
    
    def __str__(self):
        return f"Notificação para {self.usuario.nome}: {self.titulo}"
