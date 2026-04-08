# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ordens', '0003_update_status_choices'),
    ]

    operations = [
        migrations.AddField(
            model_name='ordemdeservico',
            name='imagem',
            field=models.ImageField(blank=True, null=True, upload_to='ordens/'),
        ),
    ]
