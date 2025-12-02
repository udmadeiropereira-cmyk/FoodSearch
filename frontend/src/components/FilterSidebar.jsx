import { useState, useEffect } from "react";
import api from "../services/api";

export default function FilterSidebar({ aoFiltrar }) {
  const [categorias, setCategorias] = useState([]);
  const [avisos, setAvisos] = useState([]);

  const [filtros, setFiltros] = useState({
    nome: "",
    categoria: "",
    excluir_ingrediente: "",
    sem_gluten: false,
    sem_lactose: false,
    evitar_contaminacao: [],

    max_calorias: "",
    max_acucar: "",
    max_sodio: "",
    max_carboidratos: "",
    max_gorduras: "",

    bloquear_alto_acucar: false,
    bloquear_alto_sodio: false,
    bloquear_alto_gordura: false,
  });

  // --------------------
  // CARREGAR LISTAS
  // --------------------
  useEffect(() => {
    async function carregar() {
      try {
        const [catRes, avisosRes] = await Promise.all([
          api.get("/categorias/"),
          api.get("/avisos/"),
        ]);
        setCategorias(catRes.data);
        setAvisos(avisosRes.data);
      } catch (e) {
        console.error(e);
        alert("Erro ao carregar listas de filtros.");
      }
    }
    carregar();
  }, []);

  // --------------------
  // ATUALIZAR ESTADO
  // --------------------
  const atualizarCampo = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  const atualizarMultiplosAvisos = (e) => {
    const selecionados = Array.from(e.target.selectedOptions).map(
      (opt) => opt.value
    );
    atualizarCampo("evitar_contaminacao", selecionados);
  };

  // --------------------
  // ENVIAR PARA O PAI
  // --------------------
  const enviarFiltros = () => {
    const params = {};

    // texto
    if (filtros.nome) params.nome = filtros.nome;
    if (filtros.excluir_ingrediente)
      params.excluir_ingrediente = filtros.excluir_ingrediente;

    // categoria (id)
    if (filtros.categoria) params.categoria = filtros.categoria;

    // checkboxes principais
    if (filtros.sem_gluten) params.sem_gluten = "true";
    if (filtros.sem_lactose) params.sem_lactose = "true";

    // evitar contaminação cruzada (lista de IDs de avisos)
    if (filtros.evitar_contaminacao.length > 0) {
      params.evitar_contaminacao = filtros.evitar_contaminacao.join(",");
    }

    // limites numéricos
    if (filtros.max_calorias) params.max_calorias = filtros.max_calorias;
    if (filtros.max_acucar) params.max_acucar = filtros.max_acucar;
    if (filtros.max_sodio) params.max_sodio = filtros.max_sodio;
    if (filtros.max_carboidratos)
      params.max_carboidratos = filtros.max_carboidratos;
    if (filtros.max_gorduras) params.max_gorduras = filtros.max_gorduras;

    // bloquear alto teor
    if (filtros.bloquear_alto_acucar)
      params.bloquear_alto_acucar = "true";
    if (filtros.bloquear_alto_sodio)
      params.bloquear_alto_sodio = "true";
    if (filtros.bloquear_alto_gordura)
      params.bloquear_alto_gordura = "true";

    aoFiltrar(params);
  };

  return (
    <aside className="filter-sidebar">
      {/* NOME */}
      <div className="filter-group">
        <label>Nome do Produto</label>
        <input
          type="text"
          value={filtros.nome}
          onChange={(e) => atualizarCampo("nome", e.target.value)}
          placeholder="Ex: Biscoito"
        />
      </div>

      {/* CATEGORIA */}
      <div className="filter-group">
        <label>Categoria</label>
        <select
          value={filtros.categoria}
          onChange={(e) => atualizarCampo("categoria", e.target.value)}
        >
          <option value="">Todas</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      </div>

      {/* INGREDIENTE A EVITAR */}
      <div className="filter-group">
        <label>Ingrediente a evitar</label>
        <input
          type="text"
          value={filtros.excluir_ingrediente}
          onChange={(e) =>
            atualizarCampo("excluir_ingrediente", e.target.value)
          }
          placeholder="Ex: Cebola"
        />
      </div>

      {/* CHECKBOXES PRINCIPAIS */}
      <div className="filter-group">
        <label>
          <input
            type="checkbox"
            checked={filtros.sem_gluten}
            onChange={(e) =>
              atualizarCampo("sem_gluten", e.target.checked)
            }
          />
          {" "}Sem glúten
        </label>

        <label>
          <input
            type="checkbox"
            checked={filtros.sem_lactose}
            onChange={(e) =>
              atualizarCampo("sem_lactose", e.target.checked)
            }
          />
          {" "}Sem lactose
        </label>
      </div>

      {/* EVITAR CONTAMINAÇÃO CRUZADA */}
      <div className="filter-group">
        <label>Evitar contaminação cruzada</label>
        <select
          multiple
          value={filtros.evitar_contaminacao}
          onChange={atualizarMultiplosAvisos}
        >
          {avisos.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nome}
            </option>
          ))}
        </select>
      </div>

      {/* LIMITES POR PORÇÃO */}
      <div className="filter-group">
        <label>Máx Kcal</label>
        <input
          type="number"
          value={filtros.max_calorias}
          onChange={(e) =>
            atualizarCampo("max_calorias", e.target.value)
          }
        />
      </div>

      <div className="filter-group">
        <label>Máx Açúcar</label>
        <input
          type="number"
          value={filtros.max_acucar}
          onChange={(e) =>
            atualizarCampo("max_acucar", e.target.value)
          }
        />
      </div>

      <div className="filter-group">
        <label>Máx Sódio</label>
        <input
          type="number"
          value={filtros.max_sodio}
          onChange={(e) =>
            atualizarCampo("max_sodio", e.target.value)
          }
        />
      </div>

      <div className="filter-group">
        <label>Máx Carbo</label>
        <input
          type="number"
          value={filtros.max_carboidratos}
          onChange={(e) =>
            atualizarCampo("max_carboidratos", e.target.value)
          }
        />
      </div>

      <div className="filter-group">
        <label>Máx Gorduras</label>
        <input
          type="number"
          value={filtros.max_gorduras}
          onChange={(e) =>
            atualizarCampo("max_gorduras", e.target.value)
          }
        />
      </div>

      {/* BLOQUEAR ALTO TEOR */}
      <div className="filter-group">
        <label>
          <input
            type="checkbox"
            checked={filtros.bloquear_alto_acucar}
            onChange={(e) =>
              atualizarCampo("bloquear_alto_acucar", e.target.checked)
            }
          />
          {" "}Bloquear alto açúcar
        </label>

        <label>
          <input
            type="checkbox"
            checked={filtros.bloquear_alto_sodio}
            onChange={(e) =>
              atualizarCampo("bloquear_alto_sodio", e.target.checked)
            }
          />
          {" "}Bloquear alto sódio
        </label>

        <label>
          <input
            type="checkbox"
            checked={filtros.bloquear_alto_gordura}
            onChange={(e) =>
              atualizarCampo("bloquear_alto_gordura", e.target.checked)
            }
          />
          {" "}Bloquear alto gordura sat.
        </label>
      </div>

      <button className="btn-primary" onClick={enviarFiltros}>
        Filtrar
      </button>
    </aside>
  );
}
