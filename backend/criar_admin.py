#!/usr/bin/env python
import os
import django

# Configurar ambiente Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'workflow.settings')
django.setup()

from usuarios.models import Usuario

def criar_superusuario():
    try:
        # Criar superusuário com CPF válido
        admin = Usuario.objects.create_superuser(
            login='admin',
            password='admin123',
            cpf='12345678901',  # CPF válido para teste
            email='admin@workflow.com',
            nome='Admin',
            sobre_nome='User'
        )
        print(f"Superusuário criado com sucesso!")
        print(f"Login: admin")
        print(f"Senha: admin123")
        print(f"Email: admin@workflow.com")
        print(f"CPF: 12345678901")
    except Exception as e:
        print(f"Erro ao criar superusuário: {e}")
        
        # Verificar se já existe um admin
        try:
            admin_existente = Usuario.objects.get(login='admin')
            print(f"Superusuário 'admin' já existe!")
            print(f"Login: admin")
            print(f"Email: {admin_existente.email}")
            print(f"ID: {admin_existente.id_usuario}")
        except Usuario.DoesNotExist:
            print("Nenhum superusuário encontrado.")

if __name__ == '__main__':
    criar_superusuario()
