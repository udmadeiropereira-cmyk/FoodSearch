from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
import django_filters

from .models import Produto, Pedido, ItemPedido, Categoria
from .serializers import ProdutoSerializer, PedidoSerializer, CriarItemPedidoSerializer, CategoriaSerializer

# --- Filtro Avançado (Onde a mágica da busca acontece) ---
class ProdutoFilter(django_filters.FilterSet):
    # Filtros de faixas (maior que / menor que)
    min_proteina = django_filters.NumberFilter(field_name="proteinas", lookup_expr='gte')
    max_calorias = django_filters.NumberFilter(field_name="calorias", lookup_expr='lte')
    max_sodio = django_filters.NumberFilter(field_name="sodio", lookup_expr='lte')
    
    # Filtro por nome da categoria (ex: ?categoria=Laticinios)
    categoria = django_filters.ModelChoiceFilter(queryset=Categoria.objects.all())

    class Meta:
        model = Produto
        fields = ['categoria', 'id']

class ProdutoViewSet(viewsets.ModelViewSet):
    queryset = Produto.objects.all()
    serializer_class = ProdutoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly] # Leitura pública, escrita só Admin
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = ProdutoFilter
    search_fields = ['nome', 'ingredientes__nome'] # Busca textual

class PedidoViewSet(viewsets.ModelViewSet):
    serializer_class = PedidoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Usuário só vê os próprios pedidos
        return Pedido.objects.filter(usuario=self.request.user)

    # Ação customizada para criar pedido com itens de uma vez
    def create(self, request, *args, **kwargs):
        # Espera receber um JSON: { "itens": [ {"produto": 1, "quantidade": 2} ] }
        itens_data = request.data.get('itens', [])
        
        # 1. Cria o pedido
        pedido = Pedido.objects.create(usuario=request.user, status='AB')
        
        # 2. Cria os itens dentro do pedido
        for item in itens_data:
            produto_id = item.get('produto')
            quantidade = item.get('quantidade')
            produto = Produto.objects.get(id=produto_id)
            
            ItemPedido.objects.create(
                pedido=pedido,
                produto=produto,
                quantidade=quantidade,
                preco_unitario=produto.preco # Congela o preço da hora da compra
            )
            
        serializer = self.get_serializer(pedido)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

# Create your views here.
