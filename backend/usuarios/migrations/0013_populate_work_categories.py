from django.db import migrations


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
    'Entrada de Dados',
    'Contabilidade',
    'Conciliação Bancária',
    'Fotografia',
    'Cinema e TV',
    'Consultoria',
    'Artesanato',
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


def populate_categories(apps, schema_editor):
    Categoria = apps.get_model('usuarios', 'Categoria')

    for nome_antigo, nome_novo in RENOMEAR_CATEGORIAS_LEGADAS.items():
        categoria = Categoria.objects.filter(nome=nome_antigo).first()
        if not categoria:
            continue

        destino = Categoria.objects.filter(nome__iexact=nome_novo).exclude(pk=categoria.pk).first()
        if not destino:
            categoria.nome = nome_novo
            categoria.save(update_fields=['nome'])

    for nome_categoria in CATEGORIAS_PADRAO:
        categoria = Categoria.objects.filter(nome__iexact=nome_categoria).first()
        if categoria:
            if categoria.nome != nome_categoria:
                categoria.nome = nome_categoria
                categoria.save(update_fields=['nome'])
            continue

        Categoria.objects.create(nome=nome_categoria)


class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0012_rename_anuncioservico_habilidades_categorias'),
    ]

    operations = [
        migrations.RunPython(populate_categories, migrations.RunPython.noop),
    ]
