# core/admin.py
from django.contrib import admin
from .models import Categoria, Ingrediente, Alergenico, Produto, AvisoContaminacao

class ProdutoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'categoria', 'preco', 'estoque')
    search_fields = ('nome', 'codigo_barras')
    list_filter = ('categoria',)

    # 👇 ESTA LINHA É O QUE FALTAVA: mostra os novos campos no Admin
    filter_horizontal = ('ingredientes', 'alergenicos', 'avisos_contaminacao')

    # 👇 list_display mostra colunas; fieldsets controla layout
    fieldsets = (
        ("Informações do Produto", {
            "fields": ("nome", "descricao", "categoria", "codigo_barras", "preco", "estoque", "porcao")
        }),
        ("Ingredientes e Alergênicos", {
            "fields": ("ingredientes", "alergenicos", "avisos_contaminacao")
        }),
        ("Tabela Nutricional", {
            "fields": (
                "calorias", "proteinas", "carboidratos", "gorduras_totais",
                "gorduras_saturadas", "acucar_total", "acucar_adicionado", "sodio", "fibras"
            )
        }),
        ("Avisos e Imagem", {
            "fields": ("alto_teor_sodio", "alto_teor_acucar", "alto_teor_gordura_sat", "sem_gluten", "sem_lactose", "imagem")
        }),
    )

admin.site.register(Categoria)
admin.site.register(Ingrediente)
admin.site.register(Alergenico)
admin.site.register(Produto, ProdutoAdmin)
admin.site.register(AvisoContaminacao)
