from django.db import migrations


CATEGORIAS_REMOVER = [
    'Artesanato',
    'Cinema e TV',
    'Conciliação Bancária',
    'Entrada de Dados',
]


def remove_categories(apps, schema_editor):
    Categoria = apps.get_model('usuarios', 'Categoria')
    Categoria.objects.filter(nome__in=CATEGORIAS_REMOVER).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0013_populate_work_categories'),
    ]

    operations = [
        migrations.RunPython(remove_categories, migrations.RunPython.noop),
    ]
