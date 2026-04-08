from django.db import migrations
from django.contrib.auth.hashers import make_password


def forwards_hash_passwords(apps, schema_editor):
    Usuario = apps.get_model('usuarios', 'Usuario')

    for user in Usuario.objects.all().only('pk', 'senha'):
        raw = user.senha
        if not raw:
            continue

        # If it already looks like a Django hashed password, skip.
        if raw.startswith('pbkdf2_') or raw.startswith('argon2$') or raw.startswith('bcrypt$') or raw.startswith('scrypt$'):
            continue

        user.senha = make_password(raw)
        user.save(update_fields=['senha'])


def backwards_noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0003_usuario_auth_fields'),
    ]

    operations = [
        migrations.RunPython(forwards_hash_passwords, backwards_noop),
    ]
