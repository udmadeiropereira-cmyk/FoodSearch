// src/App.jsx
import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext'; // 🛒 Importante para o carrinho funcionar

import Home from "./pages/Home.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Cart from "./pages/Cart.jsx";
import Topbar from "./components/Topbar.jsx";
import Login from './pages/Login';
import Register from './pages/Register';
import CadastroProduto from "./pages/CadastroProduto.jsx";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState(null);

  return (
    <AuthProvider> {/* 1. Autenticação envolve tudo */}
      <CartProvider> {/* 2. Carrinho envolve o visual */}
        
        <div className="page">
          {/* Agora o Topbar está DENTRO dos providers e vai funcionar */}
          <Topbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onCategoryChange={setCategory}
          />
          
          <main className="content">
            <Routes>
              <Route
                path="/"
                element={<Home searchTerm={searchTerm} category={category} />}
              />
              <Route path="/produto/:id" element={<ProductDetail />} />
              <Route path="/carrinho" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} /> 
              <Route path="/admin/novo-produto" element={<CadastroProduto />} />
            </Routes>
          </main>
        </div>

      </CartProvider>
    </AuthProvider>
  );
}

export default App;