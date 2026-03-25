from django.db import migrations


def create_initial_habilidades(apps, schema_editor):
    Habilidade = apps.get_model('usuarios', 'Habilidade')
    initial = [
        {'nome': 'Java'},
        {'nome': 'Python'},
        {'nome': 'JavaScript'},
        {'nome': 'HTML/CSS'},
        {'nome': 'React'},
        {'nome': 'Django'},
        {'nome': 'SQL'},
        {'nome': 'DevOps'},
    ]
    for item in initial:
        Habilidade.objects.get_or_create(nome=item['nome'], defaults={'descricao': ''})


def delete_initial_habilidades(apps, schema_editor):
    Habilidade = apps.get_model('usuarios', 'Habilidade')
    Habilidade.objects.filter(nome__in=['Java', 'Python', 'JavaScript', 'HTML/CSS', 'React', 'Django', 'SQL', 'DevOps']).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_initial_habilidades, delete_initial_habilidades),
    ]
