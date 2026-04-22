from rest_framework import serializers
from .models import Usuario, Categoria


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


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nome']

class UsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    categorias = CategoriaSerializer(many=True, read_only=True)
    categorias_ids = serializers.PrimaryKeyRelatedField(
        queryset=Categoria.objects.all(),
        many=True,
        write_only=True,
        source='categorias'
    )

    class Meta:
        model = Usuario
        fields = ['id_usuario', 'login', 'nome', 'sobre_nome', 'email',
                  'data_nascimento', 'num_tel', 'whatsapp', 'cpf', 'freelancer',
                  'categorias', 'categorias_ids', 'data_criacao', 'password']
        read_only_fields = ['id_usuario', 'data_criacao']
        extra_kwargs = {
            'login': {'validators': []},
            'email': {'validators': []},
            'cpf': {'validators': []},
        }

    def validate_login(self, value):
        login = str(value or '').strip()
        if not login:
            raise serializers.ValidationError('Login e obrigatorio.')

        if self.instance and str(self.instance.login).lower() == login.lower():
            return login

        if Usuario.objects.filter(login__iexact=login).exists():
            raise serializers.ValidationError('Ja existe um usuario cadastrado com esse login.')

        return login

    def validate_email(self, value):
        email = str(value or '').strip()
        if not email:
            raise serializers.ValidationError('Email e obrigatorio.')

        queryset = Usuario.objects.filter(email__iexact=email)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError('Ja existe um usuario cadastrado com esse email.')

        return email

    def validate_cpf(self, value):
        if not _is_valid_cpf(value):
            raise serializers.ValidationError('CPF inválido.')
        cpf = _only_digits(value)
        queryset = Usuario.objects.filter(cpf=cpf)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError('Ja existe um usuario cadastrado com esse CPF.')

        return cpf

    def validate(self, attrs):
        freelancer = attrs.get('freelancer')
        categorias = attrs.get('categorias')

        if freelancer:
            if not categorias or len(categorias) < 1:
                raise serializers.ValidationError({'categorias_ids': 'Selecione pelo menos 1 categoria.'})

        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        categorias = validated_data.pop('categorias', [])
        user = Usuario(**validated_data)

        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        if categorias:
            user.categorias.set(categorias)
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        categorias = validated_data.pop('categorias', None)

        for attr, value in validated_data.items():
            if attr == 'cpf':
                value = self.validate_cpf(value)
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()

        if categorias is not None:
            instance.categorias.set(categorias)
        return instance
