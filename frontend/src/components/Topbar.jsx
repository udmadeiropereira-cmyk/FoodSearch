// src/components/Topbar.jsx
import { useContext } from "react"; // <--- Adicionado
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import AuthContext from '../context/AuthContext'; // <--- Já estava aqui, perfeito
import "../index.css";

export default function Topbar({
  searchTerm,
  onSearchChange,
  onCategoryChange,
}) {
  const { totalItems } = useCart();
  
  // Pega os dados do usuário e a função de logout do contexto
  const { user, logoutUser } = useContext(AuthContext);

  const categories = [
    "Frutas",
    "Verduras & Legumes",
    "Grãos & Cereais",
    "Industrializados",
  ];

  return (
    <header className="topbar">
      <div className="topbar-left">
        <Link to="/" className="logo">
          FOOD <span>SEARCH</span>
        </Link>
      </div>

      <div className="topbar-center">
        <input
          type="text"
          className="search-input"
          placeholder="Buscar produto..."
          value={searchTerm}
          onChange={(e) => onSearchChange?.(e.target.value)}
        />

        <div className="category-buttons">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className="category-button"
              onClick={() => onCategoryChange?.(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="topbar-right">
        
        {/* --- INÍCIO DA LÓGICA DE LOGIN --- */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginRight: '20px', color: 'white' }}>
          {user ? (
            // Se estiver logado
            <>
              <span style={{ fontWeight: 'bold' }}>Olá, {user.username}</span>
              <button 
                onClick={logoutUser} 
                style={{ 
                  background: 'transparent', 
                  border: '1px solid white', 
                  color: 'white', 
                  padding: '4px 10px', 
                  borderRadius: '4px', 
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Sair
              </button>
            </>
          ) : (
            // Se NÃO estiver logado
            <>
              <Link to="/login" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
                Entrar
              </Link>
              <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>
                Cadastrar
              </Link>
            </>
          )}
        </div>
        {/* --- FIM DA LÓGICA DE LOGIN --- */}

        <Link to="/carrinho" className="cart-button">
          🛒
          <span className="cart-count">{totalItems}</span>
        </Link>
      </div>
    </header>
  );
}