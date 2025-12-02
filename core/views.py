# core/views.py
from rest_framework import viewsets, status, filters, generics
from rest_framework.response import Response
from rest_framework.permissions import (
    IsAuthenticatedOrReadOnly,
    IsAuthenticated,
    IsAdminUser,
    AllowAny,
)
from django_filters.rest_framework import DjangoFilterBackend
import django_filters
from django.contrib.auth.models import User
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Produto, Pedido, ItemPedido, Categoria, Alergenico, Ingrediente, AvisoContaminacao
from .serializers import (
    ProdutoSerializer,
    PedidoSerializer,
    CategoriaSerializer,
    RegisterSerializer,
    MyTokenObtainPairSerializer,
    AlergenicoSerializer,
    IngredienteSerializer,
    AvisoContaminacaoSerializer,
)

# ------------------ FILTROS ------------------


class ProdutoFilter(django_filters.FilterSet):
    nome = django_filters.CharFilter(field_name="nome", lookup_expr="icontains")
    categoria = django_filters.ModelChoiceFilter(queryset=Categoria.objects.all())
    
    # Recebe string de IDs ex: "1,2,3"
    excluir_ingrediente = django_filters.CharFilter(method="filter_excluir_ingrediente")

    # Recebe string de IDs ex: "1,2"
    excluir_alergenicos = django_filters.CharFilter(method="filter_excluir_alergenicos")

    # Checkboxes Booleanos (Agora apontam direto para os campos do Model)
    # Se no model o campo chama 'sem_gluten', o filtro faz isso automaticamente se tirarmos o method.
    # Mas vou manter os methods para garantir a lógica exata que você quer.
    sem_gluten = django_filters.BooleanFilter(method="filter_sem_gluten")
    sem_lactose = django_filters.BooleanFilter(method="filter_sem_lactose")

    # Evitar contaminação (IDs de avisos)
    evitar_contaminacao = django_filters.CharFilter(method="filter_evitar_contaminacao")

    # Limites Nutricionais
    max_calorias = django_filters.NumberFilter(field_name="calorias", lookup_expr="lte")
    max_carboidratos = django_filters.NumberFilter(field_name="carboidratos", lookup_expr="lte")
    max_gorduras = django_filters.NumberFilter(field_name="gorduras_totais", lookup_expr="lte")
    max_sodio = django_filters.NumberFilter(field_name="sodio", lookup_expr="lte")
    max_acucar = django_filters.NumberFilter(field_name="acucar_adicionado", lookup_expr="lte")

    # Bloqueios Booleanos
    bloquear_alto_acucar = django_filters.BooleanFilter(field_name="alto_teor_acucar", exclude=True)
    bloquear_alto_sodio = django_filters.BooleanFilter(field_name="alto_teor_sodio", exclude=True)
    bloquear_alto_gordura = django_filters.BooleanFilter(field_name="alto_teor_gordura_sat", exclude=True)

    class Meta:
        model = Produto
        fields = ["categoria", "nome"]

    # --- CORREÇÃO 1: Filtrar Ingredientes por ID ---
    def filter_excluir_ingrediente(self, queryset, name, value):
        # O Front manda "1,5,8"
        # Precisamos transformar isso em lista de inteiros
        ids = [int(v) for v in value.split(',') if v.strip().isdigit()]
        
        if not ids:
            return queryset

        # Encontra os produtos que TÊM esses ingredientes (pelos IDs)
        produtos_proibidos = Produto.objects.filter(
            ingredientes__id__in=ids  # <--- MUDANÇA AQUI: id__in em vez de nome__in
        ).values_list('id', flat=True)
        
        # Exclui esses produtos da lista final
        return queryset.exclude(id__in=produtos_proibidos)

    # --- CORREÇÃO 2: Filtros Booleanos Diretos ---
    def filter_sem_gluten(self, queryset, name, value):
        # Se value for True, retorna apenas produtos onde sem_gluten=True
        if value:
            return queryset.filter(sem_gluten=True)
        return queryset

    def filter_sem_lactose(self, queryset, name, value):
        # Se value for True, retorna apenas produtos onde sem_lactose=True
        if value:
            return queryset.filter(sem_lactose=True)
        return queryset

    # --- Outros Filtros (Mantidos iguais, parecem corretos para lógica de IDs) ---
    def filter_excluir_alergenicos(self, queryset, name, value):
        if not value: return queryset
        ids = [int(v) for v in value.split(",") if v.strip().isdigit()]
        if not ids: return queryset
        
        # Filtra quem tem Alergênico ID X ou Aviso ID X (se usar mesma tabela)
        return queryset.exclude(
            alergenicos__id__in=ids
        ).distinct()

    def filter_evitar_contaminacao(self, queryset, name, value):
        if not value: return queryset
        ids = [int(v) for v in value.split(",") if v.strip().isdigit()]
        if not ids: return queryset
        # Assume que o campo no model Produto se chama 'avisos_contaminacao' ou similar
        # Ajuste o nome do campo abaixo se for diferente no seu model
        return queryset.exclude(avisos__id__in=ids).distinct()
# ------------------ PRODUTOS ------------------


class ProdutoViewSet(viewsets.ModelViewSet):
    queryset = Produto.objects.all()
    serializer_class = ProdutoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = ProdutoFilter
    search_fields = ["nome", "ingredientes__nome"]
    ordering_fields = ["preco", "calorias"]


# ------------------ PEDIDOS ------------------


class PedidoViewSet(viewsets.ModelViewSet):
    serializer_class = PedidoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Pedido.objects.filter(usuario=self.request.user)

    def create(self, request, *args, **kwargs):
        itens_data = request.data.get("itens", [])
        if not itens_data:
            return Response(
                {"erro": "Carrinho vazio"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        pedido = Pedido.objects.create(usuario=request.user, status="AB")

        for item in itens_data:
            produto_id = item.get("produto")
            quantidade = item.get("quantidade")
            try:
                produto = Produto.objects.get(id=produto_id)
                ItemPedido.objects.create(
                    pedido=pedido,
                    produto=produto,
                    quantidade=quantidade,
                    preco_unitario=produto.preco,
                )
            except Produto.DoesNotExist:
                continue

        serializer = self.get_serializer(pedido)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ------------------ AUTH ------------------


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


# ------------------ ADMIN PRODUTOS ------------------


class ProdutoAdminViewSet(viewsets.ModelViewSet):
    queryset = Produto.objects.all()
    serializer_class = ProdutoSerializer
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]


# ------------------ LISTAS AUXILIARES (AGORA PÚBLICAS) ------------------


class IngredienteViewSet(viewsets.ModelViewSet):
    queryset = Ingrediente.objects.all()
    serializer_class = IngredienteSerializer
    permission_classes = [AllowAny]


class AlergenicoViewSet(viewsets.ModelViewSet):
    queryset = Alergenico.objects.all()
    serializer_class = AlergenicoSerializer
    permission_classes = [AllowAny]


class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [AllowAny]

class AvisoContaminacaoViewSet(viewsets.ModelViewSet):
    queryset = AvisoContaminacao.objects.all()
    serializer_class = AvisoContaminacaoSerializer
    permission_classes = [AllowAny]