// src/components/Topbar.jsx
import { useContext } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import AuthContext from "../context/AuthContext";
import "../index.css";

export default function Topbar({
  searchTerm,
  onSearchChange,
  onCategoryChange,
}) {
  const { totalItems, clearCart } = useCart();
  const { user, logoutUser } = useContext(AuthContext);

  // 🔴 Sair = limpar carrinho + deslogar (AuthContext já redireciona p/ /login)
  const handleLogout = () => {
    clearCart();     // limpa estado e localStorage do carrinho
    logoutUser();    // limpa tokens e navega para /login
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <Link to="/" className="logo">
          FOOD <span>SEARCH</span>
        </Link>
      </div>

      <div className="topbar-center">
        {/* se quiser colocar barra de busca depois, entra aqui */}
      </div>

      <div className="topbar-right">
        {/* --- LÓGICA DE LOGIN / PERFIL --- */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            marginRight: "20px",
            color: "white",
          }}
        >
          {user ? (
            <>
              {/* Histórico: só para cliente (não-admin) */}
              {!user.is_staff && (
                <Link
                  to="/historico"
                  style={{
                    backgroundColor: "#ff4444",
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                  }}
                >
                  Historico
                </Link>
              )}

              {/* Botão de Admin: só para staff */}
              {user.is_staff && (
                <Link
                  to="/admin/novo-produto"
                  style={{
                    backgroundColor: "#ff4444",
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    textDecoration: "none",
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                  }}
                >
                  + Novo Produto
                </Link>
              )}

              <span style={{ fontWeight: "bold" }}>Olá, {user.username}</span>
              <button
                onClick={handleLogout}
                style={{
                  background: "transparent",
                  border: "1px solid white",
                  color: "white",
                  padding: "4px 10px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  color: "white",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                Entrar
              </Link>
              <Link
                to="/register"
                style={{ color: "white", textDecoration: "none" }}
              >
                Cadastro
              </Link>
            </>
          )}
        </div>
        {/* --- FIM LÓGICA LOGIN --- */}

        {/* Carrinho: só aparece para cliente, não para admin */}
        {!user?.is_staff && (
          <Link to="/carrinho" className="cart-button">
            🛒
            <span className="cart-count">{totalItems}</span>
          </Link>
        )}
      </div>
    </header>
  );
}
