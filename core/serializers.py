from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import (
    Produto,
    Categoria,
    Pedido,
    ItemPedido,
    Ingrediente,
    Alergenico,
)


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ["id", "nome"]


class IngredienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingrediente
        fields = ["id", "nome"]


class AlergenicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alergenico
        fields = ["id", "nome"]


class ProdutoSerializer(serializers.ModelSerializer):
    # ------------------------------------------------------------------
    # Escrita/leitura pelo NOME (slug_field) – é o que o frontend usa
    # ------------------------------------------------------------------
    categoria = serializers.SlugRelatedField(
        queryset=Categoria.objects.all(),
        slug_field="nome",
    )
    ingredientes = serializers.SlugRelatedField(
        queryset=Ingrediente.objects.all(),
        slug_field="nome",
        many=True,
    )
    alergenicos = serializers.SlugRelatedField(
        queryset=Alergenico.objects.all(),
        slug_field="nome",
        many=True,
    )

    # ------------------------------------------------------------------
    # Campos extras SÓ de leitura, para conveniência do frontend
    # (voltam no JSON, mas não são usados na escrita)
    # ------------------------------------------------------------------
    categoria_nome = serializers.CharField(
        source="categoria.nome", read_only=True
    )
    ingredientes_nomes = serializers.SerializerMethodField()
    alergenicos_nomes = serializers.SerializerMethodField()

    class Meta:
        model = Produto
        # '__all__' inclui os campos do modelo + esses extras acima
        fields = "__all__"

    def get_ingredientes_nomes(self, obj):
        return [ing.nome for ing in obj.ingredientes.all()]

    def get_alergenicos_nomes(self, obj):
        return [al.nome for al in obj.alergenicos.all()]


class ItemPedidoSerializer(serializers.ModelSerializer):
    produto_nome = serializers.CharField(
        source="produto.nome", read_only=True
    )

    class Meta:
        model = ItemPedido
        fields = [
            "produto",
            "produto_nome",
            "quantidade",
            "preco_unitario",
            "subtotal",
        ]


class PedidoSerializer(serializers.ModelSerializer):
    itens = ItemPedidoSerializer(many=True, read_only=True)

    class Meta:
        model = Pedido
        fields = ["id", "usuario", "status", "data_criacao", "total", "itens"]


class CriarItemPedidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemPedido
        fields = ["produto", "quantidade"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password")

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )
        return user


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Campos extras no JWT – usados no React
        token["username"] = user.username
        token["is_staff"] = user.is_staff
        token["email"] = user.email

        return token
