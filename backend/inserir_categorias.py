#!/usr/bin/env python
import os

import django


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'workflow.settings')
django.setup()

from usuarios.models import Categoria


CATEGORIAS_PADRAO = [
    'Desenvolvimento Web',
    'WordPress',
    'Front-end',
    'Full Stack',
    'Desenvolvimento Mobile',
    'Desenvolvimento iOS',
    'Desenvolvimento Android',
    'IA e Machine Learning',
    'Cibersegurança',
    'Design Gráfico',
    'Design de Logotipos',
    'Design de Embalagens',
    'UX/UI Design',
    'Ilustração',
    'Edição de Vídeo',
    'Gestão de Tráfego Pago',
    'Social Media',
    'Marketing Digital',
    'Consultoria em Marketing Digital',
    'Marketing Online',
    'Vendas',
    'Redação de Conteúdo',
    'Copywriting',
    'Tradução',
    'Revisão de Texto',
    'Assistente Virtual',
    'Contabilidade',
    'Fotografia',
    'Consultoria',
    'Aulas e Treinamento',
    'Técnico em Refrigeração',
    'Técnico em Elétrica',
    'E-Commerce',
    'Expert em E-Commerce',
    'Excel e Planilhas',
    'Adobe Photoshop',
]

RENOMEAR_CATEGORIAS_LEGADAS = {
    'DESENVOLVIMENTO WEB': 'Desenvolvimento Web',
    'DESENVOLVIMENTO MOBILE': 'Desenvolvimento Mobile',
    'EXCEL': 'Excel e Planilhas',
    'PHOTOSHOP': 'Adobe Photoshop',
}


def normalizar_categorias_legadas():
    for nome_antigo, nome_novo in RENOMEAR_CATEGORIAS_LEGADAS.items():
        categoria = Categoria.objects.filter(nome=nome_antigo).first()
        if not categoria:
            continue

        destino = Categoria.objects.filter(nome__iexact=nome_novo).exclude(pk=categoria.pk).first()
        if destino:
            print(f'  Mantida categoria existente: {nome_novo}')
            continue

        categoria.nome = nome_novo
        categoria.save(update_fields=['nome'])
        print(f'  Renomeada categoria: {nome_antigo} -> {nome_novo}')


def inserir_categorias_padrao():
    print('Normalizando categorias antigas...')
    normalizar_categorias_legadas()

    print('\nInserindo categorias padrão...')

    for nome_categoria in CATEGORIAS_PADRAO:
        categoria = Categoria.objects.filter(nome__iexact=nome_categoria).first()
        if categoria:
            if categoria.nome != nome_categoria:
                categoria.nome = nome_categoria
                categoria.save(update_fields=['nome'])
            print(f'  Categoria já existe: {nome_categoria}')
            continue

        Categoria.objects.create(nome=nome_categoria)
        print(f'  Criada categoria: {nome_categoria}')

    print('\nCategorias atuais no banco:')
    for categoria in Categoria.objects.all().order_by('nome'):
        print(f'  - {categoria.nome}')


if __name__ == '__main__':
    inserir_categorias_padrao()
