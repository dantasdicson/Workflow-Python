from rest_framework import serializers
from .models import OrdemDeServico
from usuarios.models import Usuario, Categoria
from usuarios.serializers import UsuarioSerializer, CategoriaSerializer

class OrdemDeServicoSerializer(serializers.ModelSerializer):
    contratante = UsuarioSerializer(read_only=True)
    freelancer_selecionado = UsuarioSerializer(read_only=True)
    freelancers_candidatos = UsuarioSerializer(many=True, read_only=True)
    categorias_necessarias = CategoriaSerializer(many=True, read_only=True)

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
        required=False,
        source='freelancers_candidatos',
        allow_null=True
    )
    categorias_necessarias_ids = serializers.PrimaryKeyRelatedField(
        queryset=Categoria.objects.all(),
        many=True,
        write_only=True,
        required=False,
        source='categorias_necessarias',
        allow_null=True
    )

    class Meta:
        model = OrdemDeServico
        fields = [
            'id_os', 'descricao_servico', 'valor_estimado_minimo', 'valor_estimado_maximo',
            'status', 'data_criacao', 'data_conclusao', 'imagem',
            'contratante', 'freelancer_selecionado', 'freelancers_candidatos', 'categorias_necessarias',
            'contratante_id', 'freelancer_selecionado_id', 'freelancers_candidatos_ids', 'categorias_necessarias_ids'
        ]
        read_only_fields = ['id_os', 'data_criacao']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from usuarios.models import Usuario, Categoria
        self.fields['contratante_id'].queryset = Usuario.objects.all()
        self.fields['freelancer_selecionado_id'].queryset = Usuario.objects.filter(freelancer=True)
        self.fields['freelancers_candidatos_ids'].queryset = Usuario.objects.filter(freelancer=True)
        self.fields['categorias_necessarias_ids'].queryset = Categoria.objects.all()