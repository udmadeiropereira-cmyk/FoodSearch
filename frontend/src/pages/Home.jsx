import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import FilterSidebar from "../components/FilterSidebar";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext.jsx"; // 👈 pegamos o user
import "../index.css";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const { addToCart } = useCart();
  const { user } = useAuth(); // 👈 aqui está o usuário logado

  async function carregarProdutos(filtros = {}) {
    try {
      setCarregando(true);

      const params = {};
      if (filtros.nome) params.nome = filtros.nome;
      if (filtros.categoria) params.categoria = filtros.categoria;
      if (filtros.excluir_ingrediente)
        params.excluir_ingrediente = filtros.excluir_ingrediente;
      if (filtros.excluir_alergenicos)
        params.excluir_alergenicos = filtros.excluir_alergenicos;
      if (filtros.sem_contaminacao) params.sem_contaminacao = true;

      if (filtros.max_calorias) params.max_calorias = filtros.max_calorias;
      if (filtros.max_acucar) params.max_acucar = filtros.max_acucar;
      if (filtros.max_sodio) params.max_sodio = filtros.max_sodio;
      if (filtros.max_carboidratos)
        params.max_carboidratos = filtros.max_carboidratos;

      if (filtros.bloquear_alto_acucar)
        params.bloquear_alto_acucar = true;
      if (filtros.bloquear_alto_sodio)
        params.bloquear_alto_sodio = true;
      if (filtros.bloquear_alto_gordura)
        params.bloquear_alto_gordura = true;

      const resp = await api.get("produtos/", { params });

      setProducts(resp.data);
      setErro(null);
    } catch (e) {
      console.error(e);
      setErro(
        "Não foi possível carregar os produtos. Verifique se o Django está rodando."
      );
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
    return `http://127.0.0.1:8000${produto.imagem}`;
  }

  return (
    <div className="home-container">
      <h1 className="page-title">Catálogo de produtos</h1>

      <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
        <div style={{ flexShrink: 0 }}>
          <FilterSidebar aoFiltrar={carregarProdutos} />
        </div>

        <div style={{ flex: 1 }}>
          {carregando && (
            <p style={{ padding: "2rem" }}>Carregando produtos...</p>
          )}

          {erro && (
            <p style={{ padding: "2rem", color: "red" }}>{erro}</p>
          )}

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

                    {produto.categoria_nome && (
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "#666",
                          background: "#f0f0f0",
                          padding: "2px 5px",
                          borderRadius: "4px",
                          display: "inline-block",
                          marginBottom: "5px",
                        }}
                      >
                        {produto.categoria_nome}
                      </span>
                    )}

                    <p className="product-price">
                      R${" "}
                      {Number(produto.preco)
                        .toFixed(2)
                        .replace(".", ",")}
                    </p>

                    <div
                      className="product-card-actions"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <Link
                        to={`/produto/${produto.id}`}
                        className="btn-primary"
                        style={{
                          textAlign: "center",
                          textDecoration: "none",
                        }}
                      >
                        Ver detalhes
                      </Link>

                      {/* Se for ADMIN: botão Alterar produto; se for CLIENTE: Adicionar ao Carrinho */}
                      {user?.is_staff ? (
                        <Link
                          to={`/admin/novo-produto?id=${produto.id}`}
                          style={{
                            backgroundColor: "#e67e22",
                            color: "white",
                            border: "none",
                            padding: "10px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontWeight: "bold",
                            fontSize: "1rem",
                            textAlign: "center",
                            textDecoration: "none",
                          }}
                        >
                          Alterar produto
                        </Link>
                      ) : (
                        <button
                          onClick={() => addToCart(produto)}
                          style={{
                            backgroundColor: "#27ae60",
                            color: "white",
                            border: "none",
                            padding: "10px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontWeight: "bold",
                            fontSize: "1rem",
                          }}
                        >
                          Adicionar ao Carrinho
                        </button>
                      )}
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
