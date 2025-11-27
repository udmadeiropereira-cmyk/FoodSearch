// src/pages/Cart.jsx  (ou ajuste o caminho conforme sua estrutura)
import { useCart } from "../context/CartContext.jsx";

export default function Cart() {
  const { cart, totalItems, totalPrice, removeFromCart, clearCart } = useCart();

  if (!cart || cart.length === 0) {
    return <p style={{ padding: "2rem" }}>Seu carrinho está vazio.</p>;
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
              <td>
                R$ {Number(item.preco).toFixed(2).replace(".", ",")}
              </td>
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
        <button className="secondary-button" onClick={clearCart}>
          Limpar carrinho
        </button>
      </div>
    </div>
  );
}
