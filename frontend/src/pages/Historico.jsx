import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Historico() {
  const { authTokens } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarPedidos() {
      if (!authTokens || !authTokens.access) {
        console.warn("Nenhum token encontrado");
        setCarregando(false);
        return;
      }

      try {
        const resp = await fetch("http://127.0.0.1:8000/api/pedidos/", {
          headers: {
            Authorization: `Bearer ${authTokens.access}`,
          },
        });

        if (!resp.ok) {
          console.error("Erro:", resp.status);
          setCarregando(false);
          return;
        }

        const data = await resp.json();
        setPedidos(data);
      } catch (err) {
        console.error("Erro de rede:", err);
      }

      setCarregando(false);
    }

    carregarPedidos();
  }, [authTokens]);

  if (carregando) {
    return <p style={{ padding: "2rem" }}>Carregando histórico...</p>;
  }

  if (pedidos.length === 0) {
    return <p style={{ padding: "2rem" }}>Nenhuma compra realizada ainda.</p>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Histórico de Compras</h1>

      {pedidos.map((pedido) => (
        <div
          key={pedido.id}
          style={{
            marginTop: "1.5rem",
            padding: "1rem",
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        >
          <h2>Pedido #{pedido.id}</h2>
          <p>Data: {new Date(pedido.data_criacao).toLocaleString()}</p>
          <p>Status: {pedido.status === "FI" ? "Finalizado" : "Outro"}</p>
          <p>Total: R$ {pedido.total.toFixed(2).replace(".", ",")}</p>

          <h3>Itens:</h3>
          <ul>
            {pedido.itens.map((item, index) => (
              <li key={index}>
                {item.quantidade}x {item.produto_nome} — R${" "}
                {item.preco_unitario.toFixed(2).replace(".", ",")}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
