from decimal import Decimal

from django.db.models import Avg
from django.db import migrations, models


def recalcular_avaliacoes_existentes(apps, schema_editor):
    Usuario = apps.get_model('usuarios', 'Usuario')
    AvaliacaoOrdem = apps.get_model('ordens', 'AvaliacaoOrdem')

    Usuario.objects.update(avaliacao_media=Decimal('0.00'), total_avaliacoes=0)

    for resumo in (
        AvaliacaoOrdem.objects
        .values('avaliado_id')
        .annotate(media=Avg('nota_profissional'), total=models.Count('id'))
    ):
        Usuario.objects.filter(pk=resumo['avaliado_id']).update(
            avaliacao_media=round(Decimal(str(resumo['media'] or 0)), 2),
            total_avaliacoes=resumo['total'],
        )


class Migration(migrations.Migration):

    dependencies = [
        ('ordens', '0009_alter_ordemdeservico_status_avaliacaoordem'),
        ('usuarios', '0015_alter_usuario_options'),
    ]

    operations = [
        migrations.AddField(
            model_name='usuario',
            name='avaliacao_media',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=3),
        ),
        migrations.AddField(
            model_name='usuario',
            name='total_avaliacoes',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.RunPython(recalcular_avaliacoes_existentes, migrations.RunPython.noop),
    ]
