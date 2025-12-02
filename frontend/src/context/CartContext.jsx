// src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  // Carregar carrinho salvo ao iniciar
  const getStoredCart = () => {
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const [cart, setCart] = useState(getStoredCart);

  // Sempre salvar no localStorage quando alterar
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // ADICIONAR PRODUTO
  function addToCart(product, quantity = 1) {
    if (!product || !product.id) {
      console.warn("Produto inválido:", product);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantidade: (item.quantidade || 0) + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantidade: quantity }];
    });
  }

  // REMOVER PRODUTO
  function removeFromCart(productId) {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  }

  // LIMPAR CARRINHO (logout / compra finalizada)
  function clearCart() {
    setCart([]);
    localStorage.removeItem("cart");
  }

  // CÁLCULOS
  const totalItems = cart.reduce(
    (sum, item) => sum + (item.quantidade || 0),
    0
  );

  const totalPrice = cart.reduce(
    (sum, item) => sum + (item.quantidade || 0) * Number(item.preco || 0),
    0
  );

  const value = {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    totalItems,
    totalPrice,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    // isso só acontece se usar useCart fora do CartProvider
    throw new Error("useCart deve ser usado dentro de CartProvider");
  }
  return ctx;
}
