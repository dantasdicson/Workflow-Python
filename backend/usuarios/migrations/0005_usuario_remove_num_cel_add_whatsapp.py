from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0004_hash_existing_passwords'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='usuario',
            name='num_cel',
        ),
        migrations.AddField(
            model_name='usuario',
            name='whatsapp',
            field=models.BooleanField(default=False),
        ),
    ]
