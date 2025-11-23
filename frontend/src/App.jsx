import { useState, useEffect } from 'react';
import api from './services/api';
import './App.css';

function App() {
  const [produtos, setProdutos] = useState([]);
  const [filtros, setFiltros] = useState({ nome: '', max_calorias: '' });
  const [loading, setLoading] = useState(false);

  const fetchProdutos = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filtros.nome) params.search = filtros.nome;
      if (filtros.max_calorias) params.max_calorias = filtros.max_calorias;

      const response = await api.get('produtos/', { params });
      setProdutos(response.data);
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchProdutos();
  };

  const handleChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  return (
    <div className="app-container">
      <header>
        <h1>FoodSearch 🥗</h1>
      </header>

      <div className="content-wrapper">
        {/* Sidebar de Filtros */}
        <aside className="sidebar">
          <h3>Filtros</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Produto</label>
              <input
                type="text"
                name="nome"
                placeholder="Ex: Iogurte"
                value={filtros.nome}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Máx. Calorias</label>
              <input
                type="number"
                name="max_calorias"
                placeholder="Ex: 100"
                value={filtros.max_calorias}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn-search" disabled={loading}>
              {loading ? 'Buscando...' : 'Filtrar Resultados'}
            </button>
          </form>
        </aside>

        {/* Grid de Resultados */}
        <main className="product-grid">
          {produtos.length > 0 ? (
            produtos.map((produto) => (
              <div key={produto.id} className="product-card">
                <div className="image-area">
                  {produto.imagem ? <img src={produto.imagem} alt={produto.nome} /> : <span>📷</span>}
                </div>
                <div className="info-area">
                  <h3>{produto.nome}</h3>
                  <span className="category-tag">{produto.categoria_nome}</span>
                  
                  <div className="nutri-badges">
                    <span>🔥 {produto.calorias} kcal</span>
                    <span>💪 {produto.proteinas}g prot</span>
                  </div>

                  <p className="price">R$ {parseFloat(produto.preco).toFixed(2)}</p>
                  <button className="btn-add">Adicionar</button>
                </div>
              </div>
            ))
          ) : (
            <p className="no-results">Nenhum produto encontrado com esses filtros.</p>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;