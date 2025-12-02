// src/pages/CadastroProduto.jsx
import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import AuthContext from "../context/AuthContext";

const nutritionFields = [
  ["calorias", "Calorias (kcal)"],
  ["proteinas", "Proteínas (g)"],
  ["carboidratos", "Carboidratos (g)"],
  ["gorduras_totais", "Gorduras Totais (g)"],
  ["gorduras_saturadas", "Gorduras Saturadas (g)"],
  ["acucar_total", "Açúcares Totais (g)"],
  ["acucar_adicionado", "Açúcar Adicionado (g)"],
  ["sodio", "Sódio (mg)"],
  ["fibras", "Fibras (g)"],
];

const flagFields = [
  ["alto_teor_sodio", "Alto Teor de Sódio"],
  ["alto_teor_acucar", "Alto Teor de Açúcar"],
  ["alto_teor_gordura_sat", "Alto Teor de Gordura Saturada"],
];

export default function CadastroProduto() {
  const { authTokens } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const produtoId = searchParams.get("id");

  const [categorias, setCategorias] = useState([]);
  const [ingredientes, setIngredientes] = useState([]);
  const [alergenicos, setAlergenicos] = useState([]);
  const [avisos, setAvisos] = useState([]);

  const [novaCategoria, setNovaCategoria] = useState("");
  const [novoIngrediente, setNovoIngrediente] = useState("");
  const [novoAlergenico, setNovoAlergenico] = useState("");
  const [novoAviso, setNovoAviso] = useState("");

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    preco: "",
    estoque: "",
    codigo_barras: "",
    porcao: "100",
    categoria: "",
    ingredientes: [],
    alergenicos: [],
    avisos_contaminacao: [],
    // --- NOVOS CAMPOS ADICIONADOS ---
    sem_gluten: false,  
    sem_lactose: false, 
    // --------------------------------
    ...Object.fromEntries(nutritionFields.map(([f]) => [f, ""])),
    ...Object.fromEntries(flagFields.map(([f]) => [f, false])),
  });

  const [imagem, setImagem] = useState(null);

  // ============================================================
  // useEffect – carrega listas + produto para edição
  // ============================================================
  useEffect(() => {
    if (!authTokens?.access) return;

    const header = {
      headers: { Authorization: `Bearer ${authTokens.access}` },
    };

    const carregarListas = async () => {
      try {
        const [c, i, a, v] = await Promise.all([
          api.get("categorias/", header),
          api.get("ingredientes/", header),
          api.get("alergenicos/", header),
          api.get("avisos/", header),
        ]);

        setCategorias(c.data);
        setIngredientes(i.data);
        setAlergenicos(a.data);
        setAvisos(v.data);
      } catch (err) {
        console.error(err);
        alert("Erro ao carregar listas.");
      }
    };

    const carregarProduto = async () => {
      if (!produtoId) return;

      try {
        const { data: p } = await api.get(`produtos/${produtoId}/`, header);
        setFormData((prev) => ({
          ...prev,
          ...p,
          ingredientes: p.ingredientes || [],
          alergenicos: p.alergenicos || [],
          avisos_contaminacao: p.avisos_contaminacao || [],
          // Garante que booleanos venham certos da API
          sem_gluten: p.sem_gluten || false, 
          sem_lactose: p.sem_lactose || false,
        }));
      } catch (err) {
        console.error(err);
        alert("Erro ao carregar produto.");
      }
    };

    carregarListas();
    carregarProduto();
  }, [authTokens, produtoId]);

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleMulti = (e) => {
    const selected = [...e.target.options]
      .filter((o) => o.selected)
      .map((o) => o.value);
    setFormData((f) => ({ ...f, [e.target.name]: selected }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) setImagem(e.target.files[0]);
  };

  // cria registro via API e já seleciona no formulário
  const createAndAttach = async (url, nome, setList, fieldKey) => {
    const trimmed = nome.trim();
    if (!trimmed || !authTokens?.access) return;

    try {
      const header = {
        headers: { Authorization: `Bearer ${authTokens.access}` },
      };
      const { data } = await api.post(url, { nome: trimmed }, header);

      setList((prev) => [...prev, data]);

      setFormData((prev) => {
        if (!fieldKey) {
          // categoria (campo simples)
          return { ...prev, categoria: data.nome };
        }
        const atual = prev[fieldKey] || [];
        return { ...prev, [fieldKey]: [...atual, data.nome] };
      });
    } catch (err) {
      console.error(err);
      alert("Erro ao criar registro.");
    }
  };

  const handleAddCategoria = () => {
    createAndAttach("categorias/", novaCategoria, setCategorias, null);
    setNovaCategoria("");
  };

  const handleAddIngrediente = () => {
    createAndAttach("ingredientes/", novoIngrediente, setIngredientes, "ingredientes");
    setNovoIngrediente("");
  };

  const handleAddAlergenico = () => {
    createAndAttach("alergenicos/", novoAlergenico, setAlergenicos, "alergenicos");
    setNovoAlergenico("");
  };

  const handleAddAviso = () => {
    createAndAttach("avisos/", novoAviso, setAvisos, "avisos_contaminacao");
    setNovoAviso("");
  };

  // ============================================================
  // SUBMIT
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    // 1. Adiciona os campos de texto/número/booleanos
    Object.entries(formData).forEach(([k, v]) => {
      // IGNORA 'imagem' aqui, pois ela pode conter a URL antiga (string) que quebra o backend
      // IGNORA arrays (ingredientes, etc) pois são tratados abaixo
      if (k !== 'imagem' && !Array.isArray(v)) {
        data.append(k, v);
      }
    });

    // 2. Adiciona as listas (M2M)
    formData.ingredientes.forEach((v) => data.append("ingredientes", v));
    formData.alergenicos.forEach((v) => data.append("alergenicos", v));
    formData.avisos_contaminacao.forEach((v) =>
      data.append("avisos_contaminacao", v)
    );

    // 3. LÓGICA DA IMAGEM CORRIGIDA:
    // Só envia a chave 'imagem' se o usuário selecionou um arquivo NOVO.
    // Se 'imagem' for null, não enviamos nada, e o PATCH do Django mantém a foto antiga.
    if (imagem) {
        data.append("imagem", imagem);
    }

    const url = produtoId
      ? `admin/produtos/${produtoId}/`
      : "admin/produtos/";

    try {
      const method = produtoId ? api.patch : api.post;

      await method(url, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${authTokens.access}`,
        },
      });

      alert("Produto salvo!");
      navigate("/");
    } catch (err) {
      console.error(err.response?.data || err);
      // Dica: Mostra o erro específico se vier do backend (ajuda muito a debugar)
      const errorMsg = err.response?.data 
        ? JSON.stringify(err.response.data) 
        : "Erro ao salvar produto.";
      alert(errorMsg);
    }
  };
  // ============================================================
  // JSX – LAYOUT
  // ============================================================
  return (
    <div className="form-container">
      <h2 className="form-title">
        {produtoId ? "Editar Produto" : "Cadastrar Produto"}
      </h2>

      <form onSubmit={handleSubmit}>
        {/* DADOS BÁSICOS */}
        <div className="form-section">
          <h3>Dados Básicos</h3>

          <div className="form-grid-2">
            <label className="form-label">
              Nome
              <input
                className="form-input"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
              />
            </label>

            <label className="form-label">
              Categoria
              <select
                className="form-select"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
              >
                <option value="">Selecione...</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.nome}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-label">
              Preço (R$)
              <input
                type="number"
                className="form-input"
                name="preco"
                value={formData.preco}
                onChange={handleChange}
              />
            </label>

            <label className="form-label">
              Estoque
              <input
                type="number"
                className="form-input"
                name="estoque"
                value={formData.estoque}
                onChange={handleChange}
              />
            </label>

            <label className="form-label">
              Código de Barras
              <input
                className="form-input"
                name="codigo_barras"
                value={formData.codigo_barras}
                onChange={handleChange}
              />
            </label>

            <label className="form-label">
              Porção (g)
              <input
                type="number"
                className="form-input"
                name="porcao"
                value={formData.porcao}
                onChange={handleChange}
              />
            </label>
          </div>

          <div className="inline-add-row">
            <input
              type="text"
              className="form-input"
              placeholder="Nova categoria"
              value={novaCategoria}
              onChange={(e) => setNovaCategoria(e.target.value)}
            />
            <button
              type="button"
              className="primary-submit"
              onClick={handleAddCategoria}
            >
              + Adicionar
            </button>
          </div>

          <label className="form-label">
            Descrição
            <textarea
              className="form-textarea"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
            />
          </label>
        </div>

        {/* TABELA NUTRICIONAL */}
        <div className="form-section">
          <h3>Tabela Nutricional</h3>

          <div className="form-grid-3">
            {nutritionFields.map(([field, label]) => (
              <label key={field} className="form-label">
                {label}
                <input
                  type="number"
                  className="form-input"
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                />
              </label>
            ))}
          </div>
        </div>

        {/* AVISOS & IMAGEM */}
        <div className="form-section">
          <h3>Avisos e Imagem</h3>

          {/* --- NOVOS CAMPOS BOOLEXANOS DE GLÚTEN E LACTOSE --- */}
          <div style={{ marginBottom: "15px", padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "5px" }}>
            <label className="checkbox-row" style={{ display: "block", marginBottom: "5px" }}>
                <input
                    type="checkbox"
                    name="sem_gluten"
                    checked={formData.sem_gluten}
                    onChange={handleChange}
                />
                <strong>Produto Sem Glúten</strong>
            </label>
            <label className="checkbox-row" style={{ display: "block" }}>
                <input
                    type="checkbox"
                    name="sem_lactose"
                    checked={formData.sem_lactose}
                    onChange={handleChange}
                />
                <strong>Produto Sem Lactose</strong>
            </label>
          </div>
          {/* --------------------------------------------------- */}

          <label className="form-label">
            Avisos de Contaminação (Ctrl para múltiplos)
            <select
              className="form-multiselect"
              multiple
              name="avisos_contaminacao"
              value={formData.avisos_contaminacao}
              onChange={handleMulti}
            >
              {avisos.map((a) => (
                <option key={a.id} value={a.nome}>
                  {a.nome}
                </option>
              ))}
            </select>
          </label>

          <div className="inline-add-row">
            <input
              type="text"
              className="form-input"
              placeholder="Novo aviso (ex: Sem glúten)"
              value={novoAviso}
              onChange={(e) => setNovoAviso(e.target.value)}
            />
            <button
              type="button"
              className="primary-submit"
              onClick={handleAddAviso}
            >
              + Adicionar
            </button>
          </div>

          {flagFields.map(([field, label]) => (
            <label key={field} className="checkbox-row">
              <input
                type="checkbox"
                name={field}
                checked={formData[field]}
                onChange={handleChange}
              />
              {label}
            </label>
          ))}

          <label className="form-label">
            Imagem
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </label>
        </div>

        {/* INGREDIENTES & ALERGÊNICOS */}
        <div className="form-section">
          <h3>Ingredientes e Alergênicos</h3>

          <label className="form-label">
            Ingredientes (Ctrl múltiplos)
            <select
              name="ingredientes"
              multiple
              className="form-multiselect"
              value={formData.ingredientes}
              onChange={handleMulti}
            >
              {ingredientes.map((i) => (
                <option key={i.id} value={i.nome}>
                  {i.nome}
                </option>
              ))}
            </select>
          </label>

          <div className="inline-add-row">
            <input
              type="text"
              className="form-input"
              placeholder="Novo ingrediente"
              value={novoIngrediente}
              onChange={(e) => setNovoIngrediente(e.target.value)}
            />
            <button
              type="button"
              className="primary-submit"
              onClick={handleAddIngrediente}
            >
              + Adicionar
            </button>
          </div>

          <label className="form-label">
            Alergênicos (Ctrl múltiplos)
            <select
              name="alergenicos"
              multiple
              className="form-multiselect"
              value={formData.alergenicos}
              onChange={handleMulti}
            >
              {alergenicos.map((a) => (
                <option key={a.id} value={a.nome}>
                  {a.nome}
                </option>
              ))}
            </select>
          </label>

          <div className="inline-add-row">
            <input
              type="text"
              className="form-input"
              placeholder="Novo alergênico"
              value={novoAlergenico}
              onChange={(e) => setNovoAlergenico(e.target.value)}
            />
            <button
              type="button"
              className="primary-submit"
              onClick={handleAddAlergenico}
            >
              + Adicionar
            </button>
          </div>
        </div>

        <button className="primary-submit" type="submit">
          {produtoId ? "Salvar alterações" : "Cadastrar"}
        </button>
      </form>
    </div>
  );
}