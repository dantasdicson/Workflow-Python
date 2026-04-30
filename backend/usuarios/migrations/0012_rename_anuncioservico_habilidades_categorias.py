from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0011_anuncioservico_foto_avatar'),
    ]

    operations = [
        migrations.RenameField(
            model_name='anuncioservico',
            old_name='habilidades',
            new_name='categorias',
        ),
    ]
