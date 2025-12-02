// src/components/Topbar.jsx
import { useContext } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import AuthContext from "../context/AuthContext";
import "../index.css";

export default function Topbar() {
  const { totalItems, clearCart } = useCart();
  const { user, logoutUser } = useContext(AuthContext);

  function handleLogout() {
    clearCart();
    logoutUser();
  }

  return (
    <header className="topbar">
      {/* LOGO */}
      <div className="topbar-left">
        <Link to="/" className="logo">
          FOOD <span>SEARCH</span>
        </Link>
      </div>

      {/* CENTRO — reservado para futuras buscas */}
      <div className="topbar-center" />

      {/* LADO DIREITO */}
      <div className="topbar-right">

        {/* LOGIN / PERFIL */}
        <div className="topbar-auth">
          {user ? (
            <>
              {/* Histórico (cliente) */}
              {!user.is_staff && (
                <Link to="/historico" className="topbar-btn-red">
                  Histórico
                </Link>
              )}

              {/* Painel Admin */}
              {user.is_staff && (
                <Link to="/admin/novo-produto" className="topbar-btn-red">
                  + Novo Produto
                </Link>
              )}

              <span className="topbar-username">
                Olá, {user.username}
              </span>

              <button className="topbar-btn-outline" onClick={handleLogout}>
                Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="topbar-link">
                Entrar
              </Link>
              <Link to="/register" className="topbar-link">
                Cadastro
              </Link>
            </>
          )}
        </div>

        {/* CARRINHO (somente cliente) */}
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
