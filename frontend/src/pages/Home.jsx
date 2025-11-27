// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../index.css";

const API_URL = "http://127.0.0.1:8000/api/produtos/";

export default function Home({ searchTerm, category }) {
  const [products, setProducts] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    async function carregarProdutos() {
      try {
        setCarregando(true);
        const resp = await fetch(API_URL);
        if (!resp.ok) throw new Error("Erro ao buscar produtos na API");
        const data = await resp.json();
        setProducts(data);
        setErro(null);
      } catch (e) {
        console.error(e);
        setErro("Não foi possível carregar os produtos.");
      } finally {
        setCarregando(false);
      }
    }

    carregarProdutos();
  }, []);

  function getImageUrl(produto) {
    if (!produto.imagem) {
      return "https://via.placeholder.com/300x200?text=Sem+imagem";
    }
    if (produto.imagem.startsWith("http")) return produto.imagem;
    return `http://127.0.0.1:8000${produto.imagem}`;
  }

  // filtros usando o searchTerm e category que vêm do Topbar/App
  const produtosFiltrados = products.filter((produto) => {
    const textoBusca = (searchTerm || "").toLowerCase();

    const matchBusca = textoBusca
      ? produto.nome.toLowerCase().includes(textoBusca)
      : true;

    const matchCategoria =
      category && category !== "todas"
        ? produto.categoria_nome === category
        : true;

    return matchBusca && matchCategoria;
  });

  if (carregando) {
    return <p style={{ padding: "2rem" }}>Carregando produtos...</p>;
  }

  if (erro) {
    return (
      <p style={{ padding: "2rem", color: "red" }}>
        {erro}
      </p>
    );
  }

  return (
    <div className="home-container">
      <h1 className="page-title">Catálogo de produtos</h1>

      <div className="products-grid">
        {produtosFiltrados.map((produto) => (
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
              R$ {Number(produto.preco).toFixed(2).replace(".", ",")}
            </p>

            <div className="product-card-actions">
              <Link
                to={`/produto/${produto.id}`}
                className="btn-primary"
              >
                Ver mais +
              </Link>
              {/* ❌ NÃO TEM MAIS BOTÃO "Adicionar" AQUI */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
