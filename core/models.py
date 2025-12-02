from django.db import models
from django.contrib.auth.models import User


# 1. Categoria (Ex: Laticínios, Bebidas)
class Categoria(models.Model):
    nome = models.CharField(max_length=100)

    def __str__(self):
        return self.nome


# 2. Tabelas auxiliares para Ingredientes e Alergênicos (Relacionamento N:N)
class Ingrediente(models.Model):
    nome = models.CharField(max_length=100)

    def __str__(self):
        return self.nome


class Alergenico(models.Model):
    # Ex: Glúten, Lactose
    nome = models.CharField(max_length=100)

    def __str__(self):
        return self.nome


class AvisoContaminacao(models.Model):
    # Ex: "Pode conter traços de glúten", "Pode conter leite"
    nome = models.CharField(max_length=100)

    class Meta:
        verbose_name = "Aviso de contaminação cruzada"
        verbose_name_plural = "Avisos de contaminação cruzada"

    def __str__(self):
        return self.nome


# 3. Produto
class Produto(models.Model):
    nome = models.CharField(max_length=255)
    descricao = models.TextField(blank=True, null=True)
    preco = models.DecimalField(max_digits=10, decimal_places=2)
    estoque = models.IntegerField()
    codigo_barras = models.CharField(max_length=13, unique=True)
    porcao = models.DecimalField(max_digits=10, decimal_places=2, default=100)

    imagem = models.ImageField(upload_to="produtos/", blank=True, null=True)

    # Relacionamentos
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE)
    ingredientes = models.ManyToManyField(Ingrediente, blank=True)
    alergenicos = models.ManyToManyField(Alergenico, blank=True)

    # NOVO: lista de avisos de contaminação cruzada (igual Ingredientes/Alergênicos)
    avisos_contaminacao = models.ManyToManyField(
        AvisoContaminacao,
        blank=True,
        related_name="produtos",
        verbose_name="Avisos de contaminação cruzada",
    )

    # Texto livre opcional (se quiser escrever algo extra)
    contaminacao_cruzada = models.TextField(
        blank=True,
        null=True,
        verbose_name="Texto livre de contaminação (opcional)",
    )

    # Tabela Nutricional
    calorias = models.FloatField(verbose_name="Calorias (kcal)")
    proteinas = models.FloatField(verbose_name="Proteínas (g)")
    carboidratos = models.FloatField(verbose_name="Carboidratos (g)")
    gorduras_totais = models.FloatField(verbose_name="Gorduras Totais (g)")
    gorduras_saturadas = models.FloatField(verbose_name="Gorduras Saturadas (g)")
    acucar_adicionado = models.FloatField(
        verbose_name="Açúcar Adicionado (g)", default=0
    )
    sodio = models.FloatField(verbose_name="Sódio (mg)")
    fibras = models.FloatField(verbose_name="Fibras (g)", default=0)

    # Avisos de alto teor
    alto_teor_sodio = models.BooleanField(default=False, verbose_name="Alto em sódio")
    alto_teor_acucar = models.BooleanField(
        default=False, verbose_name="Alto em açúcar"
    )
    alto_teor_gordura_sat = models.BooleanField(
        default=False, verbose_name="Alto em gordura saturada"
    )

    def __str__(self):
        return self.nome


# 4. Pedido
class Pedido(models.Model):
    STATUS_CHOICES = (
        ("AB", "Aberto/Carrinho"),
        ("FI", "Finalizado/Pago"),
        ("CA", "Cancelado"),
    )

    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    data_criacao = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=2, choices=STATUS_CHOICES, default="AB")

    endereco_entrega = models.TextField(blank=True, null=True)

    @property
    def total(self):
        return sum(item.subtotal for item in self.itens.all())

    def __str__(self):
        return f"Pedido {self.id} - {self.usuario.username}"


# 5. Item do Pedido
class ItemPedido(models.Model):
    pedido = models.ForeignKey(
        Pedido, related_name="itens", on_delete=models.CASCADE
    )
    produto = models.ForeignKey(Produto, on_delete=models.CASCADE)
    quantidade = models.PositiveIntegerField(default=1)
    preco_unitario = models.DecimalField(max_digits=10, decimal_places=2)

    @property
    def subtotal(self):
        return self.preco_unitario * self.quantidade

    def __str__(self):
        return f"{self.quantidade}x {self.produto.nome}"


class Perfil(models.Model):
    usuario = models.OneToOneField(User, on_delete=models.CASCADE)
    cpf = models.CharField(max_length=14, blank=True, null=True)
    telefone = models.CharField(max_length=20, blank=True, null=True)
    data_nascimento = models.DateField(blank=True, null=True)

    def __str__(self):
        return f"Perfil de {self.usuario.username}"
