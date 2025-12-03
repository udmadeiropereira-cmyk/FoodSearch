import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import FilterSidebar from "../components/FilterSidebar";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext.jsx";
import "../index.css";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const { addToCart } = useCart();
  const { user } = useAuth();

  async function carregarProdutos(filtros = {}) {
    try {
      setCarregando(true);
      const resp = await api.get("produtos/", { params: { ...filtros } });
      setProducts(resp.data);
      setErro(null);
    } catch (e) {
      console.error(e);
      setErro("Não foi possível carregar os produtos. Verifique se o servidor está rodando.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  function getImageUrl(produto) {
    if (!produto.imagem) {
      return "https://via.placeholder.com/300x200?text=Sem+imagem";
    }
    if (produto.imagem.startsWith("http")) return produto.imagem;
    return `https://foodsearch-api.onrender.com${produto.imagem}`;
  }

  return (
    <div className="home-container">
      <h1 className="page-title">Catálogo de produtos</h1>

      <div className="home-layout">
        {/* SIDEBAR */}
        <aside className="home-sidebar">
          <FilterSidebar aoFiltrar={carregarProdutos} />
        </aside>

        {/* LISTA DE PRODUTOS */}
        <section className="home-products">
          {carregando && <p className="loading">Carregando produtos...</p>}
          {erro && <p className="error">{erro}</p>}

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

                    <p className="product-price">
                      R${Number(produto.preco).toFixed(2).replace(".", ",")}
                    </p>

                    <div className="product-card-actions">
                      <Link to={`/produto/${produto.id}`} className="btn-primary">
                        Ver detalhes
                      </Link>

                      {!user?.is_staff ? (
                        <button className="btn-secondary" onClick={() => addToCart(produto)}>
                          Adicionar ao Carrinho
                        </button>
                      ) : (
                        <Link to={`/admin/novo-produto?id=${produto.id}`} className="btn-secondary">
                          Alterar produto
                        </Link>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
