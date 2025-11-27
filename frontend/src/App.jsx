// src/App.jsx
import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Cart from "./pages/Cart.jsx";           // ⬅️ AQUI
import Topbar from "./components/Topbar.jsx";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState(null);

  return (
    <div className="page">
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
          <Route path="/carrinho" element={<Cart />} /> {/* ⬅️ AQUI */}
        </Routes>
      </main>
    </div>
  );
}

export default App;
