from rest_framework import serializers
from .models import Usuario, Habilidade

class HabilidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Habilidade
        fields = ['id', 'nome', 'descricao']

class UsuarioSerializer(serializers.ModelSerializer):
    habilidades = HabilidadeSerializer(many=True, read_only=True)
    habilidades_ids = serializers.PrimaryKeyRelatedField(
        queryset=Habilidade.objects.all(),
        many=True,
        write_only=True,
        source='habilidades'
    )

    class Meta:
        model = Usuario
        fields = ['id_usuario', 'login', 'nome', 'sobre_nome', 'senha', 'email',
                  'data_nascimento', 'num_tel', 'num_cel', 'cpf', 'freelancer',
                  'habilidades', 'habilidades_ids', 'data_criacao']
        read_only_fields = ['id_usuario', 'data_criacao']