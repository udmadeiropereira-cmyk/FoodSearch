// src/pages/Cart.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Cart() {
  const { cart, totalItems, totalPrice, removeFromCart, clearCart } = useCart();
  const { user, accessToken } = useAuth();  // <-- corrigido!

  const [mensagem, setMensagem] = useState("");
  const [isCheckoutStep, setIsCheckoutStep] = useState(false);

  const [formaPagamento, setFormaPagamento] = useState("");
  const [numeroCartao, setNumeroCartao] = useState("");
  const [endereco, setEndereco] = useState("");

  const navigate = useNavigate();

  async function handleFinalizarCompra() {
    // AGORA FUNCIONA: accessToken existe
    if (!user || !accessToken) {
      setMensagem("Você precisa estar logado para finalizar a compra.");
      return;
    }

    if (!formaPagamento || !numeroCartao || !endereco) {
      setMensagem("Preencha forma de pagamento, número do cartão e endereço.");
      return;
    }

    const itensPayload = cart.map((item) => ({
      produto: item.id,
      quantidade: item.quantidade || 1,
    }));

    try {
      const resp = await fetch("http://127.0.0.1:8000/api/pedidos/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`, // <-- corrigido!
        },
        body: JSON.stringify({
          itens: itensPayload,
          endereco_entrega: endereco,
          forma_pagamento: formaPagamento,
          numero_cartao: numeroCartao,
        }),
      });

      if (!resp.ok) {
        console.error("Erro ao criar pedido:", resp.status);
        setMensagem(
          `Não foi possível finalizar a compra (erro ${resp.status}).`
        );
        return;
      }

      const pedido = await resp.json();
      console.log("Pedido criado:", pedido);

      setMensagem("Obrigado por comprar com a FoodSearch!");
      clearCart();
      setIsCheckoutStep(false);

      setTimeout(() => {
        setMensagem("");
        navigate("/");
      }, 5000);
    } catch (err) {
      console.error("Erro de rede ao criar pedido:", err);
      setMensagem("Erro de comunicação com o servidor.");
    }
  }

  const podeConfirmar =
    formaPagamento.trim() !== "" &&
    numeroCartao.trim() !== "" &&
    endereco.trim() !== "";

  if (!cart || cart.length === 0) {
    return (
      <div style={{ padding: "2rem" }}>
        {mensagem ? <p>{mensagem}</p> : <p>Seu carrinho está vazio.</p>}
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Carrinho</h1>

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
                R${" "}
                {(Number(item.preco) * (item.quantidade || 0))
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
          Itens: {totalItems} – Total: R${" "}
          {totalPrice.toFixed(2).replace(".", ",")}
        </div>

        <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
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

      {isCheckoutStep && (
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
            disabled={!podeConfirmar}
          >
            Confirmar compra
          </button>

          {!podeConfirmar && (
            <p
              style={{
                marginTop: "0.5rem",
                fontSize: "0.9rem",
                color: "#555",
              }}
            >
              Preencha os três campos para confirmar a compra.
            </p>
          )}
        </div>
      )}

      {mensagem && (
        <p style={{ marginTop: "1.5rem", color: "#333" }}>{mensagem}</p>
      )}
    </div>
  );
}
