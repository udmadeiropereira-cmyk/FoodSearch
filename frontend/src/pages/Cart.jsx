// src/pages/Cart.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Cart() {
  const { cart, totalItems, totalPrice, removeFromCart, clearCart } = useCart();
  const { user, accessToken } = useAuth();

  const [mensagem, setMensagem] = useState("");
  const [isCheckoutStep, setIsCheckoutStep] = useState(false);

  const [formaPagamento, setFormaPagamento] = useState("");
  const [numeroCartao, setNumeroCartao] = useState("");
  const [endereco, setEndereco] = useState("");

  const navigate = useNavigate();

  async function handleFinalizarCompra() {
    if (!user || !accessToken) {
      setMensagem("Você precisa estar logado para finalizar a compra.");
      return;
    }

    if (!formaPagamento || !numeroCartao || !endereco) {
      setMensagem("Preencha forma de pagamento, número do cartão e endereço.");
      return;
    }

    const itens = cart.map((i) => ({
      produto: i.id,
      quantidade: i.quantidade || 1,
    }));

    try {
      const resp = await fetch("https://foodsearch-api.onrender.com/api/pedidos/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          itens,
          endereco_entrega: endereco,
          forma_pagamento: formaPagamento,
          numero_cartao: numeroCartao,
        }),
      });

      if (!resp.ok) {
        setMensagem("Erro ao finalizar a compra.");
        return;
      }

      setMensagem("Obrigado por comprar com a FoodSearch!");
      clearCart();
      setIsCheckoutStep(false);

      setTimeout(() => navigate("/"), 5000);
    } catch {
      setMensagem("Erro de comunicação com o servidor.");
    }
  }

  const carrinhoVazio = cart.length === 0;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Carrinho</h1>

      {/* Carrinho vazio → mostra só uma mensagem */}
      {carrinhoVazio && (
        <p style={{ marginTop: "1rem" }}>
          {mensagem || "Seu carrinho está vazio."}
        </p>
      )}

      {/* Tabela só quando houver itens */}
      {!carrinhoVazio && (
        <>
          <table className="cart-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Qtd.</th>
                <th>Preço</th>
                <th>Total</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {cart.map((item) => (
                <tr key={item.id}>
                  <td>{item.nome}</td>
                  <td>{item.quantidade}</td>
                  <td>R$ {Number(item.preco).toFixed(2).replace(".", ",")}</td>
                  <td>
                    R{"$ "}
                    {(item.quantidade * Number(item.preco))
                      .toFixed(2)
                      .replace(".", ",")}
                  </td>
                  <td>
                    <button
                      className="danger-button"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="cart-summary">
            <div>
              Itens: {totalItems} — Total: R{"$ "}
              {totalPrice.toFixed(2).replace(".", ",")}
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button className="secondary-button" onClick={clearCart}>
                Limpar carrinho
              </button>

              {!isCheckoutStep && (
                <button
                  className="primary-button"
                  onClick={() => {
                    setMensagem("");
                    setIsCheckoutStep(true);
                  }}
                >
                  Finalizar compra
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Etapa de checkout só se ainda houver itens */}
      {isCheckoutStep && !carrinhoVazio && (
        <div
          style={{
            marginTop: "2rem",
            padding: "1.5rem",
            maxWidth: "500px",
            border: "1px solid #eee",
            borderRadius: "8px",
            background: "#fafafa",
          }}
        >
          <h2>Dados para pagamento e entrega</h2>

          <div style={{ marginTop: "1rem" }}>
            <label style={{ display: "block", marginBottom: 4 }}>
              Forma de pagamento
            </label>
            <select
              value={formaPagamento}
              onChange={(e) => setFormaPagamento(e.target.value)}
              style={{ width: "100%", padding: "8px" }}
            >
              <option value="">Selecione...</option>
              <option value="credito">Cartão de crédito</option>
              <option value="debito">Cartão de débito</option>
              <option value="pix">PIX</option>
              <option value="boleto">Boleto</option>
            </select>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <label style={{ display: "block", marginBottom: 4 }}>
              Número do cartão
            </label>
            <input
              type="text"
              value={numeroCartao}
              onChange={(e) => setNumeroCartao(e.target.value)}
              placeholder="0000 0000 0000 0000"
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <div style={{ marginTop: "1rem" }}>
            <label style={{ display: "block", marginBottom: 4 }}>
              Endereço de entrega
            </label>
            <textarea
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              placeholder="Rua, número, bairro, cidade, CEP..."
              rows={3}
              style={{ width: "100%", padding: "8px", resize: "vertical" }}
            />
          </div>

          <button
            className="primary-button"
            style={{ marginTop: "1.5rem" }}
            onClick={handleFinalizarCompra}
          >
            Confirmar compra
          </button>
        </div>
      )}

      {/* Mensagem extra só quando ainda há itens (erros de checkout, etc.) */}
      {mensagem && !carrinhoVazio && (
        <p style={{ marginTop: "1.5rem", fontWeight: "600" }}>{mensagem}</p>
      )}
    </div>
  );
}
