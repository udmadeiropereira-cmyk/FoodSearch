from django.contrib import admin
from .models import Categoria, Ingrediente, Alergenico, Produto

# Configuração para melhorar a visualização dos Produtos no Admin
class ProdutoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'categoria', 'preco', 'estoque') # Colunas que aparecem na lista
    search_fields = ('nome', 'codigo_barras') # Campo de busca
    list_filter = ('categoria',) # Filtro lateral por categoria

# Registrando os modelos simples
admin.site.register(Categoria)
admin.site.register(Ingrediente)
admin.site.register(Alergenico)

# Registrando o Produto com a configuração personalizada
admin.site.register(Produto, ProdutoAdmin)