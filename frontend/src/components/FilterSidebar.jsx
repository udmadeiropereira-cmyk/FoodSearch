import { useState } from 'react';

export default function FilterSidebar({ aoFiltrar }) {
  // Estado local para guardar os valores do formulário
  const [filtros, setFiltros] = useState({
    nome: '',
    categoria: '',
    excluir_ingrediente: '',
    max_calorias: '',
    max_carboidratos: '',
    max_sodio: '',
    max_acucar: '',
    // Alergias (simulando IDs 1, 2, 3 - Ajuste conforme seu banco)
    alergia_gluten: false,  
    alergia_lactose: false,
    sem_contaminacao: false, // O "Modo Estrito"
    // Bloqueios
    bloquear_alto_acucar: false,
    bloquear_alto_sodio: false,
    bloquear_alto_gordura: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFiltros({
      ...filtros,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepara o objeto para enviar para a Home (e depois pra API)
    const dadosParaEnvio = { ...filtros };
    
    // Tratamento especial para alergias (Junta os IDs em uma lista)
    // Supondo: Gluten=1, Lactose=2 (Você precisa ver os IDs no seu Django Admin)
    const alergiasIds = [];
    if (filtros.alergia_gluten) alergiasIds.push(1); 
    if (filtros.alergia_lactose) alergiasIds.push(2);
    
    if (alergiasIds.length > 0) {
        dadosParaEnvio.excluir_alergenicos = alergiasIds.join(',');
    }

    aoFiltrar(dadosParaEnvio);
  };

  const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '0.9rem', color: '#555' };
  const inputStyle = { width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '10px' };
  const sectionStyle = { marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' };

  return (
    <aside style={{ width: '280px', padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <h3 style={{ color: '#E67E22', marginTop: 0 }}>Filtros Avançados</h3>
      <form onSubmit={handleSubmit}>
        
        {/* BUSCA BÁSICA */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Nome do Produto</label>
          <input name="nome" value={filtros.nome} onChange={handleChange} style={inputStyle} placeholder="Ex: Biscoito" />
          
          <label style={labelStyle}>ID da Categoria</label>
          <input type="number" name="categoria" value={filtros.categoria} onChange={handleChange} style={inputStyle} placeholder="Ex: 1" />
        </div>

        {/* RESTRIÇÕES */}
        <div style={sectionStyle}>
          <h4 style={{margin: '0 0 10px 0', fontSize: '1rem'}}>🚫 Restrições</h4>
          
          <label style={labelStyle}>Ingrediente a Evitar</label>
          <input name="excluir_ingrediente" value={filtros.excluir_ingrediente} onChange={handleChange} style={inputStyle} placeholder="Ex: Cebola" />

          <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
            <label><input type="checkbox" name="alergia_gluten" checked={filtros.alergia_gluten} onChange={handleChange} /> Sem Glúten (ID 1)</label>
            <label><input type="checkbox" name="alergia_lactose" checked={filtros.alergia_lactose} onChange={handleChange} /> Sem Lactose (ID 2)</label>
            
            <label style={{color: '#c0392b', fontWeight: 'bold', marginTop: '5px'}}>
                <input type="checkbox" name="sem_contaminacao" checked={filtros.sem_contaminacao} onChange={handleChange} /> 
                Evitar Contaminação Cruzada (Risco de Traços)
            </label>
          </div>
        </div>

        {/* LIMITES NUTRICIONAIS */}
        <div style={sectionStyle}>
          <h4 style={{margin: '0 0 10px 0', fontSize: '1rem'}}>⚖️ Limites (por porção)</h4>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
            <div>
                <label style={{fontSize: '0.8rem'}}>Máx Kcal</label>
                <input type="number" name="max_calorias" value={filtros.max_calorias} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
                <label style={{fontSize: '0.8rem'}}>Máx Açúcar</label>
                <input type="number" name="max_acucar" value={filtros.max_acucar} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
                <label style={{fontSize: '0.8rem'}}>Máx Sódio</label>
                <input type="number" name="max_sodio" value={filtros.max_sodio} onChange={handleChange} style={inputStyle} />
            </div>
             <div>
                <label style={{fontSize: '0.8rem'}}>Máx Carbo</label>
                <input type="number" name="max_carboidratos" value={filtros.max_carboidratos} onChange={handleChange} style={inputStyle} />
            </div>
          </div>
        </div>

        {/* BLOQUEIOS DE ALTO TEOR */}
        <div style={sectionStyle}>
          <h4 style={{margin: '0 0 10px 0', fontSize: '1rem'}}> Bloquear Alto Teor</h4>
          <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
            <label><input type="checkbox" name="bloquear_alto_acucar" checked={filtros.bloquear_alto_acucar} onChange={handleChange} /> Açúcar Adicionado</label>
            <label><input type="checkbox" name="bloquear_alto_sodio" checked={filtros.bloquear_alto_sodio} onChange={handleChange} /> Sódio</label>
            <label><input type="checkbox" name="bloquear_alto_gordura" checked={filtros.bloquear_alto_gordura} onChange={handleChange} /> Gordura Saturada</label>
          </div>
        </div>

        <button type="submit" style={{ width: '100%', padding: '12px', background: '#E67E22', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
          Filtrar Resultados
        </button>
      </form>
    </aside>
  );
}