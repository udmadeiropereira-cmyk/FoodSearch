from rest_framework import serializers
from .models import Produto, Categoria, Pedido, ItemPedido, Perfil
from django.contrib.auth.models import User

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'

class ProdutoSerializer(serializers.ModelSerializer):
    # Mostra o nome da categoria em vez de apenas o ID
    categoria_nome = serializers.CharField(source='categoria.nome', read_only=True)
    ingredientes_nomes = serializers.SerializerMethodField()
    class Meta:
        model = Produto
        fields = '__all__'
    def get_ingredientes_nomes(self, obj):
        return [ing.nome for ing in obj.ingredientes.all()]
class ItemPedidoSerializer(serializers.ModelSerializer):
    produto_nome = serializers.CharField(source='produto.nome', read_only=True)
    
    class Meta:
        model = ItemPedido
        fields = ['produto', 'produto_nome', 'quantidade', 'preco_unitario', 'subtotal']
        # preco_unitario é read_only na criação pois pegamos do banco, 
        # mas aqui deixamos aberto para visualização.

class PedidoSerializer(serializers.ModelSerializer):
    itens = ItemPedidoSerializer(many=True, read_only=True)
    
    class Meta:
        model = Pedido
        fields = ['id', 'usuario', 'status', 'data_criacao', 'total', 'itens']

# Serializer simples para criar o item no pedido (Payload do React)
class CriarItemPedidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemPedido
        fields = ['produto', 'quantidade']

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user