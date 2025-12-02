// src/pages/ProductDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import "../index.css";

const API_URL = "http://127.0.0.1:8000/api/produtos/";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [produto, setProduto] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    async function carregarProduto() {
      try {
        setCarregando(true);
        const resp = await fetch(`${API_URL}${id}/`);
        if (!resp.ok) throw new Error("Erro ao carregar produto");
        const data = await resp.json();
        console.log("Produto carregado:", data);
        setProduto(data);
        setErro(null);
      } catch (e) {
        console.error(e);
        setErro("Não foi possível carregar este produto.");
      } finally {
        setCarregando(false);
      }
    }

    carregarProduto();
  }, [id]);

  function getImageUrl(p) {
    if (!p?.imagem) {
      return "https://via.placeholder.com/400x400?text=Sem+imagem";
    }
    if (p.imagem.startsWith("http")) return p.imagem;
    return `http://127.0.0.1:8000${p.imagem}`;
  }

  function handleAddToCart() {
    const qtd = Number(quantidade) || 1;
    console.log("handleAddToCart clicado, qtd =", qtd);
    console.log("Produto atual:", produto);

    addToCart(produto, qtd);

    setMensagem("Produto adicionado ao carrinho!");
    setTimeout(() => setMensagem(""), 2000);
  }

  function handleVoltar() {
    navigate("/");
  }

  if (carregando) {
    return <p style={{ padding: "2rem" }}>Carregando produto...</p>;
  }

  if (erro) {
    return <p style={{ padding: "2rem", color: "red" }}>{erro}</p>;
  }

  if (!produto) return null;

  const ingredientesTexto =
    produto.ingredientes_nomes?.join(", ") ||
    (Array.isArray(produto.ingredientes)
      ? produto.ingredientes
          .map((ing) => (typeof ing === "string" ? ing : ing.nome))
          .join(", ")
      : "");

  return (
    <div className="product-detail-page">
      <div className="product-detail-layout">
        {/* ESQUERDA: imagem + tabela nutricional */}
        <div className="product-detail-left">
          <div className="product-detail-image-wrapper">
            <img
              src={getImageUrl(produto)}
              alt={produto.nome}
              className="product-detail-image"
            />
          </div>

          <section className="nutrition-card">
            <h2 className="nutrition-title">
              Tabela Nutricional{" "}
              <span className="nutrition-sub">(por 100 g)</span>
            </h2>
            <table className="nutrition-table">
              <tbody>
                <tr>
                  <td>Calorias</td>
                  <td>{produto.calorias} kcal</td>
                </tr>
                <tr>
                  <td>Proteínas</td>
                  <td>{produto.proteinas} g</td>
                </tr>
                <tr>
                  <td>Carboidratos</td>
                  <td>{produto.carboidratos} g</td>
                </tr>
                <tr>
                  <td>Gorduras Totais</td>
                  <td>{produto.gorduras_totais} g</td>
                </tr>
                <tr>
                  <td>Gorduras Saturadas</td>
                  <td>{produto.gorduras_saturadas} g</td>
                </tr>
                <tr>
                  <td>Açúcares Totais</td>
                  <td>{produto.acucar_total} g</td>
                </tr>
                <tr>
                  <td>Açúcar Adicionado</td>
                  <td>{produto.acucar_adicionado} g</td>
                </tr>
                <tr>
                  <td>Sódio</td>
                  <td>{produto.sodio} mg</td>
                </tr>
                <tr>
                  <td>Fibras</td>
                  <td>{produto.fibras} g</td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>

        {/* DIREITA: infos + ingredientes + ações */}
        <div className="product-detail-right">
          <h1 className="product-detail-title">{produto.nome}</h1>

          <p className="product-detail-category">
            Categoria: <span>{produto.categoria_nome}</span>
          </p>

          <p className="product-detail-price">
            R$ {Number(produto.preco).toFixed(2).replace(".", ",")}
          </p>

          {produto.descricao && (
            <p className="product-detail-description">
              {produto.descricao}
            </p>
          )}

          <section className="section-box">
            <h3>Ingredientes</h3>
            <p>
              {ingredientesTexto && ingredientesTexto.trim() !== ""
                ? ingredientesTexto
                : "Ingredientes não informados."}
            </p>
          </section>

          {/* AÇÕES DIFERENTES PARA CLIENTE E ADMIN */}

          {/* Cliente comum: quantidade + adicionar ao carrinho */}
          {!user?.is_staff && (
            <div className="product-detail-actions">
              <div className="quantity-row">
                <label htmlFor="qty-input">Quantidade</label>
                <input
                  id="qty-input"
                  type="number"
                  min={1}
                  value={quantidade}
                  onChange={(e) =>
                    setQuantidade(Number(e.target.value) || 1)
                  }
                  className="quantity-input"
                />
                <button
                  className="btn-primary btn-large"
                  onClick={handleAddToCart}
                >
                  Adicionar ao carrinho
                </button>
              </div>

              <button
                className="btn-secondary btn-large"
                onClick={handleVoltar}
              >
                Voltar para lista
              </button>

              {mensagem && (
                <p className="success-message">{mensagem}</p>
              )}
            </div>
          )}

          {/* Admin: apenas editar produto + voltar */}
          {user?.is_staff && (
            <div className="product-detail-actions">
              <button
                className="btn-primary btn-large"
                onClick={() =>
                  navigate(`/admin/novo-produto?id=${produto.id}`)
                }
              >
                Editar produto
              </button>

              <button
                className="btn-secondary btn-large"
                onClick={handleVoltar}
                style={{ marginLeft: "1rem" }}
              >
                Voltar para lista
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
