#!/usr/bin/env python
import os
import django

# Configurar ambiente Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'workflow.settings')
django.setup()

from usuarios.models import Categoria

def inserir_categorias_padrao():
    categorias = [
        'DESENVOLVIMENTO WEB',
        'DESENVOLVIMENTO MOBILE', 
        'EXCEL',
        'PHOTOSHOP'
    ]
    
    print("Inserindo categorias padrão...")
    
    for nome_categoria in categorias:
        categoria, created = Categoria.objects.get_or_create(
            nome=nome_categoria,
            defaults={'nome': nome_categoria}
        )
        
        if created:
            print(f"  Criada categoria: {nome_categoria}")
        else:
            print(f"  Categoria já existe: {nome_categoria}")
    
    print("\nCategorias inseridas com sucesso!")
    
    # Listar todas as categorias
    print("\nCategorias atuais no banco:")
    for categoria in Categoria.objects.all().order_by('nome'):
        print(f"  - {categoria.nome}")

if __name__ == '__main__':
    inserir_categorias_padrao()
