# urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

# 2. IMPORTE A SUA VIEW CUSTOMIZADA DAQUI (MyTokenObtainPairView):
from core.views import ProdutoViewSet, PedidoViewSet, RegisterView, ProdutoAdminViewSet, MyTokenObtainPairView

router = DefaultRouter()
router.register(r'produtos', ProdutoViewSet, basename='produto')
router.register(r'pedidos', PedidoViewSet, basename='pedido')
router.register(r'admin/produtos', ProdutoAdminViewSet, basename='admin-produtos')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    
    # 3. USE A SUA VIEW AQUI (MyTokenObtainPairView):
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/register/', RegisterView.as_view(), name='auth_register'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)