# urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from core.views import (
    ProdutoViewSet,
    PedidoViewSet,
    RegisterView,
    ProdutoAdminViewSet,
    MyTokenObtainPairView,
    CategoriaViewSet,
    IngredienteViewSet,
    AlergenicoViewSet,
    AvisoContaminacaoViewSet,  # 👈 NOVO
)

# 🔥 Router principal da API
router = DefaultRouter()
router.register(r"produtos", ProdutoViewSet, basename="produto")
router.register(r"pedidos", PedidoViewSet, basename="pedido")

# Rotas administrativas
router.register(r"admin/produtos", ProdutoAdminViewSet, basename="admin-produtos")

# Modelos auxiliares
router.register(r"categorias", CategoriaViewSet, basename="categoria")
router.register(r"ingredientes", IngredienteViewSet, basename="ingrediente")
router.register(r"alergenicos", AlergenicoViewSet, basename="alergenico")
router.register(r"avisos", AvisoContaminacaoViewSet, basename="aviso")  # 👈 NOVA ROTA

urlpatterns = [
    path("admin/", admin.site.urls),

    # 🌐 API principal
    path("api/", include(router.urls)),

    # 🔑 Autenticação JWT
    path("api/token/", MyTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # 👤 Registro de usuários
    path("api/register/", RegisterView.as_view(), name="auth_register"),
]

# Arquivos de mídia
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
