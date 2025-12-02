import { useState, useEffect } from "react";
import api from "../services/api";

export default function FilterSidebar({ aoFiltrar }) {
  const [categorias, setCategorias] = useState([]);
  const [avisos, setAvisos] = useState([]);
  const [ingredientes, setIngredientes] = useState([]); // <--- NOVO: Lista de ingredientes

  const [filtros, setFiltros] = useState({
    nome: "",
    categoria: "",
    excluir_ingrediente: [], // <--- MUDANÇA: Agora é um array, não string
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
        // Adicionamos a chamada para /ingredientes/
        const [catRes, avisosRes, ingRes] = await Promise.all([
          api.get("/categorias/"),
          api.get("/avisos/"),
          api.get("/ingredientes/"), 
        ]);
        setCategorias(catRes.data);
        setAvisos(avisosRes.data);
        setIngredientes(ingRes.data); // Salva os ingredientes
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

  // Função genérica para selects múltiplos (serve para avisos e ingredientes)
  const atualizarMultiplos = (e, campo) => {
    const selecionados = Array.from(e.target.selectedOptions).map(
      (opt) => opt.value
    );
    atualizarCampo(campo, selecionados);
  };

  // --------------------
  // ENVIAR PARA O PAI
  // --------------------
  const enviarFiltros = () => {
    const params = {};

    // texto
    if (filtros.nome) params.nome = filtros.nome;

    // Ingredientes a excluir (envia IDs separados por vírgula: "1,2,3")
    if (filtros.excluir_ingrediente.length > 0) {
      params.excluir_ingrediente = filtros.excluir_ingrediente.join(",");
    }

    // categoria (id)
    if (filtros.categoria) params.categoria = filtros.categoria;

    // checkboxes principais (Adaptado para os novos campos booleanos do Model)
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

      {/* INGREDIENTE A EVITAR (AGORA É SELECT MULTIPLE) */}
      <div className="filter-group">
        <label>Bloquear ingredientes:</label>
        <select
          multiple
          value={filtros.excluir_ingrediente}
          onChange={(e) => atualizarMultiplos(e, "excluir_ingrediente")}
          style={{ height: "100px" }} // Altura maior para facilitar visualização
        >
          {ingredientes.map((ing) => (
            <option key={ing.id} value={ing.id}>
              {ing.nome}
            </option>
          ))}
        </select>
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
          onChange={(e) => atualizarMultiplos(e, "evitar_contaminacao")}
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
        <label>Quantidades máximas de macronutrientes por porção:</label>
        <label>Máx kcal</label>
        <input
          type="number"
          value={filtros.max_calorias}
          onChange={(e) =>
            atualizarCampo("max_calorias", e.target.value)
          }
        />
      </div>

      <div className="filter-group">
        <label>Máx. açúcares totais (g)</label>
        <input
          type="number"
          value={filtros.max_acucar}
          onChange={(e) =>
            atualizarCampo("max_acucar", e.target.value)
          }
        />
      </div>

      <div className="filter-group">
        <label>Máx. sódio (mg)</label>
        <input
          type="number"
          value={filtros.max_sodio}
          onChange={(e) =>
            atualizarCampo("max_sodio", e.target.value)
          }
        />
      </div>

      <div className="filter-group">
        <label>Máx. carboidratos (g)</label>
        <input
          type="number"
          value={filtros.max_carboidratos}
          onChange={(e) =>
            atualizarCampo("max_carboidratos", e.target.value)
          }
        />
      </div>

      <div className="filter-group">
        <label>Máx. gorduras totais</label>
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