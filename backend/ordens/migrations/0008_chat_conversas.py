from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('usuarios', '0009_usuario_uniq_usuario_login_ci'),
        ('ordens', '0007_ordemdeservico_categorias_necessarias'),
    ]

    operations = [
        migrations.CreateModel(
            name='ConversaOrdem',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('status', models.CharField(choices=[('ativa', 'Ativa'), ('bloqueada', 'Bloqueada'), ('encerrada', 'Encerrada')], default='ativa', max_length=20)),
                ('tipo', models.CharField(choices=[('candidatura', 'Candidatura'), ('principal', 'Principal')], default='candidatura', max_length=20)),
                ('ultima_mensagem_em', models.DateTimeField(blank=True, null=True)),
                ('data_criacao', models.DateTimeField(auto_now_add=True)),
                ('data_atualizacao', models.DateTimeField(auto_now=True)),
                ('contratante', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='conversas_como_contratante', to='usuarios.usuario')),
                ('freelancer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='conversas_como_freelancer', to='usuarios.usuario')),
                ('ordem_servico', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='conversas', to='ordens.ordemdeservico')),
            ],
            options={
                'db_table': 'tab_conversa_ordem',
                'ordering': ['-ultima_mensagem_em', '-data_atualizacao', '-data_criacao'],
            },
        ),
        migrations.CreateModel(
            name='MensagemChat',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('conteudo', models.TextField()),
                ('lida_em', models.DateTimeField(blank=True, null=True)),
                ('data_envio', models.DateTimeField(auto_now_add=True)),
                ('conversa', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='mensagens', to='ordens.conversaordem')),
                ('remetente', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='mensagens_chat', to='usuarios.usuario')),
            ],
            options={
                'db_table': 'tab_mensagem_chat',
                'ordering': ['data_envio'],
            },
        ),
        migrations.AddConstraint(
            model_name='conversaordem',
            constraint=models.UniqueConstraint(fields=('ordem_servico', 'freelancer'), name='uniq_conversa_ordem_freelancer'),
        ),
    ]
