from rest_framework import serializers
from .models import Produto, Categoria, Pedido, ItemPedido, Perfil
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Produto, Categoria, Ingrediente, Alergenico

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'

class ProdutoSerializer(serializers.ModelSerializer):
    # Mostra o nome da categoria em vez de apenas o ID
    categoria = serializers.SlugRelatedField(
        queryset=Categoria.objects.all(), # Onde buscar o objeto
        slug_field='nome'                # O campo que será usado para a busca/entrada
    )
    ingredientes = serializers.SlugRelatedField(
        queryset=Ingrediente.objects.all(),
        slug_field='nome',
        many=True # Indica que pode haver múltiplos valores
    )
    
    alergenicos = serializers.SlugRelatedField(
        queryset=Alergenico.objects.all(),
        slug_field='nome',
        many=True
    )

    class Meta:
        model = Produto
        fields = '__all__'
        
    def get_ingredientes_nomes(self, obj):
        # Verifica se o campo ingredientes existe para evitar erros
        if hasattr(obj, 'ingredientes'):
            return [ing.nome for ing in obj.ingredientes.all()]
        return []

class ItemPedidoSerializer(serializers.ModelSerializer):
    produto_nome = serializers.CharField(source='produto.nome', read_only=True)
    
    class Meta:
        model = ItemPedido
        fields = ['produto', 'produto_nome', 'quantidade', 'preco_unitario', 'subtotal']

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

# --- MUDANÇA: Renomeado de UserSerializer para RegisterSerializer ---
# Isso alinha com o que o views.py está esperando importar
class RegisterSerializer(serializers.ModelSerializer):
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

# --- JWT Customizado (Correto estar aqui) ---
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Adiciona campos extras ao token
        token['username'] = user.username
        token['is_staff'] = user.is_staff  # Necessário para o botão Admin no React
        token['email'] = user.email

        return token
    
class IngredienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingrediente
        fields = ['id', 'nome'] # Use apenas os campos necessários, 'nome' é crucial

class AlergenicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alergenico
        fields = ['id', 'nome'] # Use apenas os campos necessários, 'nome' é crucial