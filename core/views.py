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

from .models import Produto, Pedido, ItemPedido, Categoria, Alergenico, Ingrediente
from .serializers import (
    ProdutoSerializer,
    PedidoSerializer,
    CategoriaSerializer,
    RegisterSerializer,
    MyTokenObtainPairSerializer,
    AlergenicoSerializer,
    IngredienteSerializer,
)

# --- Filtro Super Poderoso do FoodSearch ---
class ProdutoFilter(django_filters.FilterSet):
    nome = django_filters.CharFilter(field_name="nome", lookup_expr="icontains")
    categoria = django_filters.ModelChoiceFilter(queryset=Categoria.objects.all())
    excluir_ingrediente = django_filters.CharFilter(method="filter_excluir_ingrediente")

    excluir_alergenicos = django_filters.ModelMultipleChoiceFilter(
        field_name="alergenicos",
        queryset=Alergenico.objects.all(),
        exclude=True,
    )
    sem_contaminacao = django_filters.BooleanFilter(method="filter_sem_contaminacao")

    max_calorias = django_filters.NumberFilter(
        field_name="calorias", lookup_expr="lte"
    )
    max_carboidratos = django_filters.NumberFilter(
        field_name="carboidratos", lookup_expr="lte"
    )
    max_gorduras = django_filters.NumberFilter(
        field_name="gorduras_totais", lookup_expr="lte"
    )
    max_sodio = django_filters.NumberFilter(field_name="sodio", lookup_expr="lte")
    max_acucar = django_filters.NumberFilter(
        field_name="acucar_adicionado", lookup_expr="lte"
    )

    bloquear_alto_acucar = django_filters.BooleanFilter(
        field_name="alto_teor_acucar", exclude=True
    )
    bloquear_alto_sodio = django_filters.BooleanFilter(
        field_name="alto_teor_sodio", exclude=True
    )
    bloquear_alto_gordura = django_filters.BooleanFilter(
        field_name="alto_teor_gordura_sat", exclude=True
    )

    class Meta:
        model = Produto
        fields = ["categoria", "nome"]

    def filter_excluir_ingrediente(self, queryset, name, value):
        return queryset.exclude(ingredientes__nome__icontains=value)

    def filter_sem_contaminacao(self, queryset, name, value):
        if value:
            return queryset.filter(contaminacao_cruzada__exact="")
        return queryset


class ProdutoViewSet(viewsets.ModelViewSet):
    queryset = Produto.objects.all()
    serializer_class = ProdutoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProdutoFilter
    search_fields = ["nome", "ingredientes__nome"]
    ordering_fields = ["preco", "calorias"]


class PedidoViewSet(viewsets.ModelViewSet):
    serializer_class = PedidoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Pedido.objects.filter(usuario=self.request.user)

    def create(self, request, *args, **kwargs):
        itens_data = request.data.get("itens", [])
        if not itens_data:
            return Response(
                {"erro": "Carrinho vazio"}, status=status.HTTP_400_BAD_REQUEST
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


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer


class ProdutoAdminViewSet(viewsets.ModelViewSet):
    queryset = Produto.objects.all()
    serializer_class = ProdutoSerializer
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


# ---------- AUXILIARES: INGREDIENTE / ALERGÊNICO / CATEGORIA ----------


class IngredienteViewSet(viewsets.ModelViewSet):
    queryset = Ingrediente.objects.all()
    serializer_class = IngredienteSerializer
    permission_classes = [IsAdminUser]


class AlergenicoViewSet(viewsets.ModelViewSet):
    queryset = Alergenico.objects.all()
    serializer_class = AlergenicoSerializer
    permission_classes = [IsAdminUser]


class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [IsAdminUser]