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
  ["gorduras_saturadas", "Gorduras Sat. (g)"],
  ["acucar_adicionado", "Açúcar Adicionado (g)"],
  ["sodio", "Sódio (mg)"],
  ["fibras", "Fibras (g)"],
];

const flagFields = [
  ["alto_teor_sodio", "Alto Teor de Sódio"],
  ["alto_teor_acucar", "Alto Teor de Açúcar"],
  ["alto_teor_gordura_sat", "Alto Teor de Gordura Sat."],
];

const CadastroProduto = () => {
  const { authTokens } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const produtoId = searchParams.get("id"); // se tiver id => edição

  const [categoriasList, setCategoriasList] = useState([]);
  const [ingredientesList, setIngredientesList] = useState([]);
  const [alergenicosList, setAlergenicosList] = useState([]);

  const [novaCategoria, setNovaCategoria] = useState("");
  const [novoIngrediente, setNovoIngrediente] = useState("");
  const [novoAlergenico, setNovoAlergenico] = useState("");

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    preco: "",
    estoque: "",
    codigo_barras: "",
    porcao: "100",
    categoria: "",
    calorias: "",
    proteinas: "",
    carboidratos: "",
    gorduras_totais: "",
    gorduras_saturadas: "",
    acucar_adicionado: "0",
    sodio: "",
    fibras: "0",
    contaminacao_cruzada: "",
    alto_teor_sodio: false,
    alto_teor_acucar: false,
    alto_teor_gordura_sat: false,
    ingredientes: [],
    alergenicos: [],
  });

  const [imagem, setImagem] = useState(null);

  const authHeader = authTokens?.access
    ? { headers: { Authorization: `Bearer ${authTokens.access}` } }
    : null;

  // carregar listas + produto (se edição)
  useEffect(() => {
    if (!authTokens?.access) {
      navigate("/login");
      return;
    }

    const fetchAuxiliares = async () => {
      try {
        const [catRes, ingRes, aleRes] = await Promise.all([
          api.get("categorias/", authHeader),
          api.get("ingredientes/", authHeader),
          api.get("alergenicos/", authHeader),
        ]);
        setCategoriasList(catRes.data);
        setIngredientesList(ingRes.data);
        setAlergenicosList(aleRes.data);
      } catch (error) {
        console.error("Erro ao carregar listas auxiliares:", error);
      }
    };

    const fetchProduto = async () => {
      if (!produtoId) return;
      try {
        const { data: p } = await api.get(`produtos/${produtoId}/`);
        setFormData((prev) => ({
          ...prev,
          nome: p.nome || "",
          descricao: p.descricao || "",
          preco: p.preco || "",
          estoque: p.estoque || "",
          codigo_barras: p.codigo_barras || "",
          porcao: p.porcao || "100",
          categoria: p.categoria || "",
          calorias: p.calorias || "",
          proteinas: p.proteinas || "",
          carboidratos: p.carboidratos || "",
          gorduras_totais: p.gorduras_totais || "",
          gorduras_saturadas: p.gorduras_saturadas || "",
          acucar_adicionado: p.acucar_adicionado ?? "0",
          sodio: p.sodio || "",
          fibras: p.fibras ?? "0",
          contaminacao_cruzada: p.contaminacao_cruzada || "",
          alto_teor_sodio: p.alto_teor_sodio || false,
          alto_teor_acucar: p.alto_teor_acucar || false,
          alto_teor_gordura_sat: p.alto_teor_gordura_sat || false,
          ingredientes: Array.isArray(p.ingredientes) ? p.ingredientes : [],
          alergenicos: Array.isArray(p.alergenicos) ? p.alergenicos : [],
        }));
      } catch (error) {
        console.error("Erro ao carregar produto para edição:", error);
      }
    };

    fetchAuxiliares();
    fetchProduto();
  }, [authTokens, produtoId, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  // handlers genéricos
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files?.[0]) setImagem(e.target.files[0]);
  };

  const handleMultiSelect = (e) => {
    const { name, options } = e.target;
    const selected = Array.from(options).filter((o) => o.selected).map((o) => o.value);
    setFormData((prev) => ({ ...prev, [name]: selected }));
  };

  // criação rápida de categoria / ingrediente / alergênico
  const makeCreator =
    (url, stateSetter, field) =>
    async (nomeRaw) => {
      const nome = nomeRaw.trim();
      if (!nome || !authHeader) return;
      try {
        const { data } = await api.post(url, { nome }, authHeader);
        stateSetter((prev) => [...prev, data]);
        setFormData((prev) =>
          field
            ? { ...prev, [field]: [...prev[field], data.nome] }
            : { ...prev, categoria: data.nome }
        );
      } catch (err) {
        console.error("Erro ao criar registro em", url, err);
        alert("Não foi possível criar o registro.");
      }
    };

  const addCategoria = () => makeCreator("categorias/", setCategoriasList)(novaCategoria);
  const addIngrediente = () =>
    makeCreator("ingredientes/", setIngredientesList, "ingredientes")(novoIngrediente);
  const addAlergenico = () =>
    makeCreator("alergenicos/", setAlergenicosList, "alergenicos")(novoAlergenico);

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!authTokens?.access) {
      alert("Sessão expirada. Faça login novamente.");
      navigate("/login");
      return;
    }

    const dataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "ingredientes" || key === "alergenicos") return;
      dataToSend.append(key, value);
    });

    formData.ingredientes.forEach((nome) => dataToSend.append("ingredientes", nome));
    formData.alergenicos.forEach((nome) => dataToSend.append("alergenicos", nome));
    if (imagem) dataToSend.append("imagem", imagem);

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${authTokens.access}`,
      },
    };

    try {
      if (produtoId) {
        await api.put(`admin/produtos/${produtoId}/`, dataToSend, config);
        alert("Produto atualizado com sucesso!");
      } else {
        await api.post("admin/produtos/", dataToSend, config);
        alert("Produto cadastrado com sucesso!");
      }
      navigate("/");
    } catch (error) {
      console.error("Erro ao salvar produto:", error.response?.data || error);
      alert("Não foi possível salvar o produto. Veja o console.");
    }
  };

  return (
    <div className="product-form-container">
      <h2>{produtoId ? "Editar Produto" : "Cadastrar Produto"}</h2>

      <form onSubmit={handleSubmit} className="product-form">
        {/* DADOS BÁSICOS */}
        <h3>Dados Básicos</h3>

        <label className="form-label">
          Nome do Produto
          <input
            name="nome"
            className="form-input"
            value={formData.nome}
            onChange={handleChange}
            required
          />
        </label>

        <label className="form-label">
          Descrição
          <textarea
            name="descricao"
            className="form-textarea"
            value={formData.descricao}
            onChange={handleChange}
          />
        </label>

        <div className="form-row">
          <label className="form-label">
            Preço (R$)
            <input
              type="number"
              name="preco"
              step="0.01"
              className="form-input"
              value={formData.preco}
              onChange={handleChange}
              required
            />
          </label>

          <label className="form-label">
            Qtd Estoque
            <input
              type="number"
              name="estoque"
              className="form-input"
              value={formData.estoque}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <label className="form-label">
          Código de Barras (EAN)
          <input
            name="codigo_barras"
            className="form-input"
            value={formData.codigo_barras}
            onChange={handleChange}
            required
          />
        </label>

        <label className="form-label">
          Porção (g)
          <input
            type="number"
            name="porcao"
            step="0.01"
            className="form-input"
            value={formData.porcao}
            onChange={handleChange}
            required
          />
        </label>

        {/* CATEGORIA */}
        <h3>Categoria</h3>
        <label className="form-label">
          Categoria (Nome)
          <select
            name="categoria"
            className="form-input"
            value={formData.categoria}
            onChange={handleChange}
            required
          >
            <option value="">Selecione...</option>
            {categoriasList.map((cat) => (
              <option key={cat.id || cat.nome} value={cat.nome}>
                {cat.nome}
              </option>
            ))}
          </select>
        </label>

        <div className="inline-add-row">
          <input
            type="text"
            placeholder="Nova categoria"
            className="form-input"
            value={novaCategoria}
            onChange={(e) => setNovaCategoria(e.target.value)}
          />
          <button type="button" className="small-button" onClick={addCategoria}>
            + Adicionar
          </button>
        </div>

        {/* TABELA NUTRICIONAL */}
        <h3>Tabela Nutricional</h3>
        <div className="form-row-grid">
          {nutritionFields.map(([field, label]) => (
            <label className="form-label" key={field}>
              {label}
              <input
                type="number"
                name={field}
                step="0.01"
                className="form-input"
                value={formData[field]}
                onChange={handleChange}
                required
              />
            </label>
          ))}
        </div>

        {/* AVISOS */}
        <h3>Avisos e Imagem</h3>
        <label className="form-label">
          Aviso de Contaminação Cruzada
          <textarea
            name="contaminacao_cruzada"
            className="form-textarea"
            value={formData.contaminacao_cruzada}
            onChange={handleChange}
          />
        </label>

        {flagFields.map(([field, label]) => (
          <label className="checkbox-label" key={field}>
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

        {/* INGREDIENTES / ALERGÊNICOS */}
        <h3>Ingredientes e Alergênicos</h3>

        <label className="form-label">
          Ingredientes (Ctrl para múltiplos)
          <select
            name="ingredientes"
            multiple
            className="form-multiselect"
            value={formData.ingredientes}
            onChange={handleMultiSelect}
          >
            {ingredientesList.map((ing) => (
              <option key={ing.id || ing.nome} value={ing.nome}>
                {ing.nome}
              </option>
            ))}
          </select>
        </label>

        <div className="inline-add-row">
          <input
            type="text"
            placeholder="Novo ingrediente"
            className="form-input"
            value={novoIngrediente}
            onChange={(e) => setNovoIngrediente(e.target.value)}
          />
          <button type="button" className="small-button" onClick={addIngrediente}>
            + Adicionar
          </button>
        </div>

        <label className="form-label">
          Alergênicos (Ctrl para múltiplos)
          <select
            name="alergenicos"
            multiple
            className="form-multiselect"
            value={formData.alergenicos}
            onChange={handleMultiSelect}
          >
            {alergenicosList.map((ale) => (
              <option key={ale.id || ale.nome} value={ale.nome}>
                {ale.nome}
              </option>
            ))}
          </select>
        </label>

        <div className="inline-add-row">
          <input
            type="text"
            placeholder="Novo alergênico"
            className="form-input"
            value={novoAlergenico}
            onChange={(e) => setNovoAlergenico(e.target.value)}
          />
          <button type="button" className="small-button" onClick={addAlergenico}>
            + Adicionar
          </button>
        </div>

        <button type="submit" className="primary-submit">
          {produtoId ? "Salvar alterações" : "Cadastrar"}
        </button>
      </form>
    </div>
  );
};

export default CadastroProduto;
