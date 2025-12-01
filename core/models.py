from django.db import models
from django.contrib.auth.models import User

# 1. Categoria (Ex: Laticínios, Bebidas) - Cite: 38, 76
class Categoria(models.Model):
    nome = models.CharField(max_length=100)

    def __str__(self):
        return self.nome

# 2. Tabelas auxiliares para Ingredientes e Alergênicos (Relacionamento N:N)
class Ingrediente(models.Model):
    nome = models.CharField(max_length=100)
    
    def __str__(self):
        return self.nome

class Alergenico(models.Model): # Cite: 78
    nome = models.CharField(max_length=100) # Ex: Glúten, Lactose
    
    def __str__(self):
        return self.nome

# 3. O Produto Principal - Cite: PRO004 (Cadastro de Produto)
class Produto(models.Model):
    nome = models.CharField(max_length=255) # Cite: 372
    descricao = models.TextField(blank=True, null=True)
    preco = models.DecimalField(max_digits=10, decimal_places=2) # Cite: 373
    estoque = models.IntegerField() # Cite: 374
    codigo_barras = models.CharField(max_length=13, unique=True) # Cite: 381
    porcao = models.DecimalField(max_digits=10, decimal_places=2, default=100)
    # Imagem do produto (conforme protótipos)
    imagem = models.ImageField(upload_to='produtos/', blank=True, null=True)
    
    # Relacionamentos
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE)
    ingredientes = models.ManyToManyField(Ingrediente, blank=True) # Cite: 376
    alergenicos = models.ManyToManyField(Alergenico, blank=True) # Cite: 377
    
    # Tabela Nutricional (Para os filtros de busca PRO001) - Cite: 150-157
    calorias = models.FloatField(verbose_name="Calorias (kcal)")
    proteinas = models.FloatField(verbose_name="Proteínas (g)")
    carboidratos = models.FloatField(verbose_name="Carboidratos (g)")
    gorduras_totais = models.FloatField(verbose_name="Gorduras Totais (g)")
    gorduras_saturadas = models.FloatField(verbose_name="Gorduras Saturadas (g)") # Cite: 168
    acucar_adicionado = models.FloatField(verbose_name="Açúcar Adicionado (g)", default=0) # Cite: 166
    sodio = models.FloatField(verbose_name="Sódio (mg)") # Cite: 167
    fibras = models.FloatField(verbose_name="Fibras (g)", default=0)

    # Avisos
    contaminacao_cruzada = models.TextField(blank=True, null=True) # Cite: 378
    alto_teor_sodio = models.BooleanField(default=False, verbose_name="Alto em sódio")
    alto_teor_acucar = models.BooleanField(default=False, verbose_name="Alto em açúcar")
    alto_teor_gordura_sat = models.BooleanField(default=False, verbose_name="Alto em gordura saturada")

    def __str__(self):
        return self.nome



# 4. O Carrinho/Pedido 
class Pedido(models.Model):
    STATUS_CHOICES = (
        ('AB', 'Aberto/Carrinho'),       # O cliente ainda está colocando itens [cite: 38, 42]
        ('FI', 'Finalizado/Pago'),       # Compra concluída [cite: 50-52]
        ('CA', 'Cancelado'),
    )
    
    usuario = models.ForeignKey(User, on_delete=models.CASCADE) # Liga o pedido ao cliente
    data_criacao = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=2, choices=STATUS_CHOICES, default='AB')
    
    # Armazena o endereço de entrega do momento da compra [cite: 248]
    endereco_entrega = models.TextField(blank=True, null=True) 
    
    @property
    def total(self):
        # Calcula o total somando os itens
        return sum(item.subtotal for item in self.itens.all())

    def __str__(self):
        return f"Pedido {self.id} - {self.usuario.username}"

# 5. Os Itens dentro do Pedido
class ItemPedido(models.Model):
    pedido = models.ForeignKey(Pedido, related_name='itens', on_delete=models.CASCADE)
    produto = models.ForeignKey(Produto, on_delete=models.CASCADE)
    quantidade = models.PositiveIntegerField(default=1) # [cite: 235]
    
    # Importante: Salvar o preço DO MOMENTO da compra. 
    # Se o produto aumentar de preço depois, o histórico de compras antigo não muda.
    preco_unitario = models.DecimalField(max_digits=10, decimal_places=2)

    @property
    def subtotal(self):
        return self.preco_unitario * self.quantidade

    def __str__(self):
        return f"{self.quantidade}x {self.produto.nome}"

# Adicione isso no final do models.py se for OBRIGATÓRIO salvar CPF no cadastro
class Perfil(models.Model):
    usuario = models.OneToOneField(User, on_delete=models.CASCADE)
    cpf = models.CharField(max_length=14, blank=True, null=True)
    telefone = models.CharField(max_length=20, blank=True, null=True)
    data_nascimento = models.DateField(blank=True, null=True)

    def __str__(self):
        return f"Perfil de {self.usuario.username}"