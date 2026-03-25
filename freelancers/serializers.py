from rest_framework import serializers
from .models import Freelancer, Habilidade

class HabilidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Habilidade
        fields = ['id', 'nome', 'descricao']

class FreelancerSerializer(serializers.ModelSerializer):
    habilidades = HabilidadeSerializer(many=True, read_only=True)
    habilidades_ids = serializers.PrimaryKeyRelatedField(
        queryset=Habilidade.objects.all(),
        write_only=True,
        source='habilidades',
        many=True
    )
    
    class Meta:
        model = Freelancer
        fields = ['id_freelancer', 'login', 'nome', 'sobrenome', 'email', 'cpf', 
                  'num_tel', 'num_cel', 'data_nasc', 'habilidades', 'habilidades_ids']
        read_only_fields = ['id_freelancer', 'data_criacao']