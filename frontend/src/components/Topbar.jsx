// src/components/Topbar.jsx
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import "../index.css";

export default function Topbar({
  searchTerm,
  onSearchChange,
  onCategoryChange,
}) {
  const { totalItems } = useCart();

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
        <Link to="/carrinho" className="cart-button">
          🛒
          <span className="cart-count">{totalItems}</span>
        </Link>
      </div>
    </header>
  );
}
