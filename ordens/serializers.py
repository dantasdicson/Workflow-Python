from rest_framework import serializers
from .models import OrdemDeServico
from usuarios.models import Usuario, Habilidade
from usuarios.serializers import UsuarioSerializer, HabilidadeSerializer

class OrdemDeServicoSerializer(serializers.ModelSerializer):
    contratante = UsuarioSerializer(read_only=True)
    freelancer_selecionado = UsuarioSerializer(read_only=True)
    freelancers_candidatos = UsuarioSerializer(many=True, read_only=True)
    habilidades_necessarias = HabilidadeSerializer(many=True, read_only=True)

    contratante_id = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all(),
        write_only=True,
        source='contratante'
    )
    freelancer_selecionado_id = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.filter(freelancer=True),
        write_only=True,
        allow_null=True,
        required=False,
        source='freelancer_selecionado'
    )
    freelancers_candidatos_ids = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.filter(freelancer=True),
        many=True,
        write_only=True,
        source='freelancers_candidatos'
    )
    habilidades_necessarias_ids = serializers.PrimaryKeyRelatedField(
        queryset=Habilidade.objects.all(),
        many=True,
        write_only=True,
        source='habilidades_necessarias'
    )

    class Meta:
        model = OrdemDeServico
        fields = [
            'id_os', 'descricao_servico', 'valor_estimado_minimo', 'valor_estimado_maximo',
            'status', 'data_criacao', 'data_conclusao',
            'contratante', 'freelancer_selecionado', 'freelancers_candidatos', 'habilidades_necessarias',
            'contratante_id', 'freelancer_selecionado_id', 'freelancers_candidatos_ids', 'habilidades_necessarias_ids'
        ]
        read_only_fields = ['id_os', 'data_criacao']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from usuarios.models import Usuario, Habilidade
        self.fields['contratante_id'].queryset = Usuario.objects.all()
        self.fields['freelancer_selecionado_id'].queryset = Usuario.objects.filter(freelancer=True)
        self.fields['freelancers_candidatos_ids'].queryset = Usuario.objects.filter(freelancer=True)
        self.fields['habilidades_necessarias_ids'].queryset = Habilidade.objects.all()