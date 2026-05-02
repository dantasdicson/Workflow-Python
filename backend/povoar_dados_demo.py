#!/usr/bin/env python
import os
from decimal import Decimal

import django


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'workflow.settings')
django.setup()

from inserir_categorias import inserir_categorias_padrao
from ordens.models import OrdemDeServico
from usuarios.models import AnuncioServico, Categoria, Usuario


SENHA_PADRAO = '12345678'

USUARIOS_DEMO = [
    {
        'login': 'cliente_demo',
        'password': SENHA_PADRAO,
        'nome': 'Cliente',
        'sobre_nome': 'Demo',
        'email': 'cliente.demo@workflow.local',
        'data_nascimento': '1990-01-15',
        'num_tel': '11999990001',
        'whatsapp': True,
        'cpf': '52998224725',
        'freelancer': False,
        'categorias': [],
    },
    {
        'login': 'freelancer_dev',
        'password': SENHA_PADRAO,
        'nome': 'Freelancer',
        'sobre_nome': 'Dev',
        'email': 'freelancer.dev@workflow.local',
        'data_nascimento': '1992-04-20',
        'num_tel': '11999990002',
        'whatsapp': True,
        'cpf': '16899535009',
        'freelancer': True,
        'categorias': ['Desenvolvimento Web', 'Front-end', 'Full Stack'],
    },
    {
        'login': 'freelancer_design',
        'password': SENHA_PADRAO,
        'nome': 'Freelancer',
        'sobre_nome': 'Design',
        'email': 'freelancer.design@workflow.local',
        'data_nascimento': '1995-08-10',
        'num_tel': '11999990003',
        'whatsapp': True,
        'cpf': '11144477735',
        'freelancer': True,
        'categorias': ['Design Gráfico', 'UX/UI Design', 'Design de Logotipos'],
    },
]

ANUNCIOS_DEMO = [
    {
        'login': 'freelancer_dev',
        'titulo_profissional': 'Desenvolvedor Full Stack',
        'descricao': 'Crio sites, sistemas web e integrações usando tecnologias modernas.',
        'portfolio_url': 'https://github.com/',
        'categorias': ['Desenvolvimento Web', 'Front-end', 'Full Stack'],
    },
    {
        'login': 'freelancer_design',
        'titulo_profissional': 'Designer UI/UX',
        'descricao': 'Desenvolvo interfaces, identidades visuais e materiais digitais.',
        'portfolio_url': 'https://www.behance.net/',
        'categorias': ['Design Gráfico', 'UX/UI Design', 'Design de Logotipos'],
    },
]

ORDENS_DEMO = [
    {
        'descricao_servico': 'Criar site institucional responsivo para uma pequena empresa, com pagina inicial, sobre, servicos e contato.',
        'valor_estimado_minimo': '1200.00',
        'valor_estimado_maximo': '2500.00',
        'categorias': ['Desenvolvimento Web', 'Front-end'],
        'candidatos': ['freelancer_dev'],
    },
    {
        'descricao_servico': 'Desenvolver identidade visual e logotipo para uma nova marca de consultoria.',
        'valor_estimado_minimo': '800.00',
        'valor_estimado_maximo': '1800.00',
        'categorias': ['Design Gráfico', 'Design de Logotipos'],
        'candidatos': ['freelancer_design'],
    },
    {
        'descricao_servico': 'Configurar loja online simples com cadastro de produtos, carrinho e checkout externo.',
        'valor_estimado_minimo': '2000.00',
        'valor_estimado_maximo': '4500.00',
        'categorias': ['E-Commerce', 'Desenvolvimento Web'],
        'candidatos': ['freelancer_dev'],
    },
]


def categorias_por_nome(nomes):
    return list(Categoria.objects.filter(nome__in=nomes))


def criar_usuarios():
    print('\nCriando usuarios demo...')
    usuarios = {}

    for dados in USUARIOS_DEMO:
        categorias = dados.pop('categorias')
        password = dados.pop('password')
        usuario = (
            Usuario.objects.filter(login=dados['login']).first()
            or Usuario.objects.filter(email=dados['email']).first()
            or Usuario.objects.filter(cpf=dados['cpf']).first()
        )
        criado = usuario is None

        if criado:
            usuario = Usuario(**dados)

        if criado:
            usuario.set_password(password)
            usuario.save()
            print(f'  Criado usuario: {usuario.login}')
        else:
            for campo, valor in dados.items():
                setattr(usuario, campo, valor)
            usuario.set_password(password)
            usuario.save()
            print(f'  Atualizado usuario: {usuario.login}')

        if usuario.freelancer:
            usuario.categorias.set(categorias_por_nome(categorias))
        else:
            usuario.categorias.clear()

        usuarios[usuario.login] = usuario

        dados['password'] = password
        dados['categorias'] = categorias

    return usuarios


def criar_anuncios(usuarios):
    print('\nCriando anuncios demo...')

    for dados in ANUNCIOS_DEMO:
        freelancer = usuarios[dados['login']]
        anuncio, criado = AnuncioServico.objects.get_or_create(
            freelancer=freelancer,
            defaults={
                'titulo_profissional': dados['titulo_profissional'],
                'descricao': dados['descricao'],
                'portfolio_url': dados['portfolio_url'],
            },
        )

        if not criado:
            anuncio.titulo_profissional = dados['titulo_profissional']
            anuncio.descricao = dados['descricao']
            anuncio.portfolio_url = dados['portfolio_url']
            anuncio.save()

        anuncio.categorias.set(categorias_por_nome(dados['categorias']))
        print(f'  {"Criado" if criado else "Atualizado"} anuncio: {freelancer.login}')


def criar_ordens(usuarios):
    print('\nCriando ordens de servico demo...')
    contratante = usuarios['cliente_demo']

    for dados in ORDENS_DEMO:
        ordem, criada = OrdemDeServico.objects.get_or_create(
            contratante=contratante,
            descricao_servico=dados['descricao_servico'],
            defaults={
                'valor_estimado_minimo': Decimal(dados['valor_estimado_minimo']),
                'valor_estimado_maximo': Decimal(dados['valor_estimado_maximo']),
                'status': OrdemDeServico.STATUS_ABERTA,
            },
        )

        if not criada:
            ordem.valor_estimado_minimo = Decimal(dados['valor_estimado_minimo'])
            ordem.valor_estimado_maximo = Decimal(dados['valor_estimado_maximo'])
            ordem.status = OrdemDeServico.STATUS_ABERTA
            ordem.freelancer_selecionado = None
            ordem.save()

        ordem.categorias_necessarias.set(categorias_por_nome(dados['categorias']))
        ordem.freelancers_candidatos.set([usuarios[login] for login in dados['candidatos']])
        print(f'  {"Criada" if criada else "Atualizada"} OS #{ordem.id_os}')


def povoar_dados_demo():
    inserir_categorias_padrao()
    usuarios = criar_usuarios()
    criar_anuncios(usuarios)
    criar_ordens(usuarios)

    print('\nDados demo prontos.')
    print(f'  Login contratante: cliente_demo / senha: {SENHA_PADRAO}')
    print(f'  Login freelancer: freelancer_dev / senha: {SENHA_PADRAO}')
    print(f'  Login freelancer: freelancer_design / senha: {SENHA_PADRAO}')


if __name__ == '__main__':
    povoar_dados_demo()
