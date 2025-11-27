import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api"; // Substitui o fetch manual pelo axios configurado
import FilterSidebar from "../components/FilterSidebar"; // O novo componente de filtros
import { useCart } from "../context/CartContext"; // Para o botão funcionar
import "../index.css";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  
  // Hook para adicionar ao carrinho
  const { addToCart } = useCart();

  // Função principal de busca (agora aceita os filtros da Sidebar)
  async function carregarProdutos(filtros = {}) {
    try {
      setCarregando(true);
      
      // Mapeia os dados da Sidebar para os parâmetros que o Django espera
      const params = {};
      if (filtros.nome) params.nome = filtros.nome;
      if (filtros.categoria) params.categoria = filtros.categoria;
      if (filtros.excluir_ingrediente) params.excluir_ingrediente = filtros.excluir_ingrediente;
      if (filtros.excluir_alergenicos) params.excluir_alergenicos = filtros.excluir_alergenicos;
      if (filtros.sem_contaminacao) params.sem_contaminacao = true;
      
      // Nutricionais
      if (filtros.max_calorias) params.max_calorias = filtros.max_calorias;
      if (filtros.max_acucar) params.max_acucar = filtros.max_acucar;
      if (filtros.max_sodio) params.max_sodio = filtros.max_sodio;
      if (filtros.max_carboidratos) params.max_carboidratos = filtros.max_carboidratos;

      // Bloqueios
      if (filtros.bloquear_alto_acucar) params.bloquear_alto_acucar = true;
      if (filtros.bloquear_alto_sodio) params.bloquear_alto_sodio = true;
      if (filtros.bloquear_alto_gordura) params.bloquear_alto_gordura = true;

      // Faz a chamada ao backend
      const resp = await api.get('produtos/', { params });
      
      setProducts(resp.data);
      setErro(null);
    } catch (e) {
      console.error(e);
      setErro("Não foi possível carregar os produtos. Verifique se o Django está rodando.");
    } finally {
      setCarregando(false);
    }
  }

  // Carrega produtos ao abrir a página
  useEffect(() => {
    carregarProdutos();
  }, []);

  // Sua função auxiliar para imagens (mantida igual)
  function getImageUrl(produto) {
    if (!produto.imagem) {
      return "https://via.placeholder.com/300x200?text=Sem+imagem";
    }
    if (produto.imagem.startsWith("http")) return produto.imagem;
    return `http://127.0.0.1:8000${produto.imagem}`;
  }

  return (
    <div className="home-container">
      <h1 className="page-title">Catálogo de produtos</h1>

      {/* Container Flex para alinhar Sidebar (Esquerda) e Produtos (Direita) */}
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* 1. Barra Lateral de Filtros */}
        <div style={{ flexShrink: 0 }}> 
            <FilterSidebar aoFiltrar={carregarProdutos} />
        </div>

        {/* 2. Lista de Produtos */}
        <div style={{ flex: 1 }}>
          
          {carregando && <p style={{ padding: "2rem" }}>Carregando produtos...</p>}
          
          {erro && <p style={{ padding: "2rem", color: "red" }}>{erro}</p>}

          {!carregando && !erro && (
            <div className="products-grid">
              {products.length === 0 ? (
                <p>Nenhum produto encontrado com esses filtros.</p>
              ) : (
                products.map((produto) => (
                  <div key={produto.id} className="product-card">
                    <div className="product-image-wrapper">
                      <img
                        src={getImageUrl(produto)}
                        alt={produto.nome}
                        className="product-image"
                      />
                    </div>

                    <h2 className="product-name">{produto.nome}</h2>
                    
                    {/* Exibe categoria se disponível */}
                    {produto.categoria_nome && (
                        <span style={{fontSize: '0.8rem', color: '#666', background: '#f0f0f0', padding: '2px 5px', borderRadius: '4px', display: 'inline-block', marginBottom: '5px'}}>
                            {produto.categoria_nome}
                        </span>
                    )}

                    <p className="product-price">
                      R$ {Number(produto.preco).toFixed(2).replace(".", ",")}
                    </p>

                    <div className="product-card-actions" style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                      <Link
                        to={`/produto/${produto.id}`}
                        className="btn-primary"
                        style={{textAlign: 'center', textDecoration: 'none'}}
                      >
                        Ver detalhes
                      </Link>
                      
                      {/* Botão de Adicionar ao Carrinho */}
                      <button 
                        onClick={() => addToCart(produto)}
                        style={{
                            backgroundColor: '#27ae60', 
                            color: 'white', 
                            border: 'none', 
                            padding: '10px', 
                            borderRadius: '4px', 
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '1rem'
                        }}
                      >
                        Adicionar ao Carrinho
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}