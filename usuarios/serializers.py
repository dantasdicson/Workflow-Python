from rest_framework import serializers
from .models import Usuario, Habilidade


def _only_digits(value):
    return ''.join(ch for ch in str(value or '') if ch.isdigit())


def _is_valid_cpf(value):
    cpf = _only_digits(value)

    if len(cpf) != 11:
        return False

    if cpf == cpf[0] * 11:
        return False

    nums = [int(d) for d in cpf]

    s1 = sum(nums[i] * (10 - i) for i in range(9))
    d1 = (s1 * 10) % 11
    d1 = 0 if d1 == 10 else d1
    if d1 != nums[9]:
        return False

    s2 = sum(nums[i] * (11 - i) for i in range(10))
    d2 = (s2 * 10) % 11
    d2 = 0 if d2 == 10 else d2
    return d2 == nums[10]


class HabilidadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Habilidade
        fields = ['id', 'nome', 'descricao']

class UsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    habilidades = HabilidadeSerializer(many=True, read_only=True)
    habilidades_ids = serializers.PrimaryKeyRelatedField(
        queryset=Habilidade.objects.all(),
        many=True,
        write_only=True,
        source='habilidades'
    )

    class Meta:
        model = Usuario
        fields = ['id_usuario', 'login', 'nome', 'sobre_nome', 'email',
                  'data_nascimento', 'num_tel', 'whatsapp', 'cpf', 'freelancer',
                  'habilidades', 'habilidades_ids', 'data_criacao', 'password']
        read_only_fields = ['id_usuario', 'data_criacao']

    def validate_cpf(self, value):
        if not _is_valid_cpf(value):
            raise serializers.ValidationError('CPF inválido.')
        return _only_digits(value)

    def validate(self, attrs):
        freelancer = attrs.get('freelancer')
        habilidades = attrs.get('habilidades')

        if freelancer:
            if not habilidades or len(habilidades) < 1:
                raise serializers.ValidationError({'habilidades_ids': 'Selecione pelo menos 1 habilidade.'})

        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        habilidades = validated_data.pop('habilidades', [])
        user = Usuario(**validated_data)

        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        if habilidades:
            user.habilidades.set(habilidades)
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        habilidades = validated_data.pop('habilidades', None)

        for attr, value in validated_data.items():
            if attr == 'cpf':
                value = self.validate_cpf(value)
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()

        if habilidades is not None:
            instance.habilidades.set(habilidades)
        return instance