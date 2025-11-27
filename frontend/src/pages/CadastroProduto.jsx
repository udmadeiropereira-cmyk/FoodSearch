import React, { useState, useContext, useEffect } from 'react'; // <-- useEffect é necessário
import api from '../services/api';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CadastroProduto = () => {
    const { user, authTokens } = useContext(AuthContext);
    const navigate = useNavigate();

    // --- NOVO ESTADO: Listas dinâmicas do Backend ---
    const [ingredientesList, setIngredientesList] = useState([]);
    const [alergenicosList, setAlergenicosList] = useState([]);
    
    // Estado inicial
    const [formData, setFormData] = useState({
        // Dados Básicos
        nome: '', descricao: '', preco: '', estoque: '', codigo_barras: '',
        porcao: '100', 
        categoria: '', 

        // Nutricional
        calorias: '', proteinas: '', carboidratos: '', gorduras_totais: '',
        gorduras_saturadas: '', sodio: '',
        acucar_adicionado: '0', 
        fibras: '0', 

        // Avisos e Booleanos
        contaminacao_cruzada: '', alto_teor_sodio: false, alto_teor_acucar: false,
        alto_teor_gordura_sat: false,
        
        // ManyToMany
        ingredientes: [], 
        alergenicos: []
    });

    const [imagem, setImagem] = useState(null);
    
    // --- FUNÇÃO PARA CARREGAR DADOS NA INICIALIZAÇÃO ---
    useEffect(() => {
        const fetchRelatedData = async () => {
            try {
                // Requisições GET para as suas rotas no Django
                const [ingredientesRes, alergenicosRes] = await Promise.all([
                    api.get('/ingredientes/'),
                    api.get('/alergenicos/'),
                ]);
                
                setIngredientesList(ingredientesRes.data);
                setAlergenicosList(alergenicosRes.data);
            } catch (error) {
                console.error("Erro ao carregar dados relacionados do Backend. Verifique as rotas /ingredientes/ e /alergenicos/:", error);
            }
        };
        fetchRelatedData();
    }, []); 
    // ----------------------------------------------------

    // ... (Handlers de estado e manipulação de arquivo - SEM ALTERAÇÕES) ...
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImagem(e.target.files[0]);
        }
    };

    const handleMultiSelect = (e) => {
        const { name, options } = e.target;
        const selectedValues = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selectedValues.push(options[i].value);
            }
        }
        setFormData({ ...formData, [name]: selectedValues });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!authTokens || !authTokens.access) {
            alert("Sessão expirada ou Token não encontrado. Por favor, faça login novamente.");
            navigate('/login'); 
            return;
        }
        
        const dataToSend = new FormData();
        Object.keys(formData).forEach(key => {
            if (key !== 'ingredientes' && key !== 'alergenicos') {
                dataToSend.append(key, formData[key]);
            }
        });
        if (imagem) {
            dataToSend.append('imagem', imagem);
        }
        formData.ingredientes.forEach(id => dataToSend.append('ingredientes', id));
        formData.alergenicos.forEach(id => dataToSend.append('alergenicos', id));

        try {
            await api.post('/admin/produtos/', dataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${authTokens.access}`,
                }
            });
            alert('Produto cadastrado com sucesso!');
            navigate('/'); 
        } catch (error) {
            console.error("Erro completo:", error.response?.data);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                alert("Erro: Sua sessão expirou ou não possui permissão de administrador. Faça login novamente.");
            } else {
            alert(`Erro: ${JSON.stringify(error.response?.data || error.message)}`);
        }
    }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2>Cadastrar Produto</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                
                {/* --- DADOS BÁSICOS --- */}
                <h3>Dados Básicos</h3>
                <input name="nome" placeholder="Nome do Produto" onChange={handleChange} required />
                <textarea name="descricao" placeholder="Descrição" onChange={handleChange} />
                <div style={{display: 'flex', gap: '10px'}}>
                    <input type="number" name="preco" placeholder="Preço (R$)" step="0.01" onChange={handleChange} required />
                    <input type="number" name="estoque" placeholder="Qtd Estoque" onChange={handleChange} required />
                </div>
                <input name="codigo_barras" placeholder="Código de Barras (EAN)" onChange={handleChange} required />
                <input type="number" name="porcao" placeholder="Porção (g)" step="0.01" value={formData.porcao} onChange={handleChange} required />

                {/* --- CATEGORIA --- */}
                <label>Categoria (Nome):</label>
                <input type="text" name="categoria" placeholder="Ex: Bebidas ou Limpeza" onChange={handleChange} required />

                {/* --- NUTRICIONAL --- */}
                <h3>Tabela Nutricional</h3>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                    <input type="number" name="calorias" placeholder="Calorias (kcal)" step="0.01" onChange={handleChange} required />
                    <input type="number" name="proteinas" placeholder="Proteínas (g)" step="0.01" onChange={handleChange} required />
                    <input type="number" name="carboidratos" placeholder="Carboidratos (g)" step="0.01" onChange={handleChange} required />
                    <input type="number" name="gorduras_totais" placeholder="Gorduras Totais (g)" step="0.01" onChange={handleChange} required />
                    <input type="number" name="gorduras_saturadas" placeholder="Gorduras Sat. (g)" step="0.01" onChange={handleChange} required />
                    <input type="number" name="acucar_adicionado" placeholder="Açúcar Add. (g)" step="0.01" value={formData.acucar_adicionado} onChange={handleChange} required />
                    <input type="number" name="sodio" placeholder="Sódio (mg)" step="0.01" onChange={handleChange} required />
                    <input type="number" name="fibras" placeholder="Fibras (g)" step="0.01" value={formData.fibras} onChange={handleChange} required />
                </div>

                {/* --- AVISOS --- */}
                <h3>Avisos e Imagem</h3>
                <textarea name="contaminacao_cruzada" placeholder="Aviso de Contaminação Cruzada" onChange={handleChange} />
                
                <label>
                    <input type="checkbox" name="alto_teor_sodio" onChange={handleChange} /> Alto Teor de Sódio
                </label>
                <label>
                    <input type="checkbox" name="alto_teor_acucar" onChange={handleChange} /> Alto Teor de Açúcar
                </label>
                <label>
                    <input type="checkbox" name="alto_teor_gordura_sat" onChange={handleChange} /> Alto Teor de Gordura Sat.
                </label>

                <label>Imagem:</label>
                <input type="file" onChange={handleImageChange} accept="image/*" />

                {/* --- RELACIONAMENTOS (Ingredientes e Alergenicos) --- */}
                {/* 3. MUDANÇA: Valores do select são NOMES */}
                <label>Ingredientes (Segure Ctrl):</label>
                <select name="ingredientes" multiple onChange={handleMultiSelect} style={{height: '60px'}}>
                    {ingredientesList.map((ing) => ( // NOVO: Mapeamento dinâmico
                        <option key={ing.nome} value={ing.nome}>
                            {ing.nome}
                        </option>
                    ))}
                </select>

                <label>Alergênicos (Segure Ctrl):</label>
                <select name="alergenicos" multiple onChange={handleMultiSelect} style={{height: '60px'}}>
                    {alergenicosList.map((ale) => ( // NOVO: Mapeamento dinâmico
                        <option key={ale.nome} value={ale.nome}>
                            {ale.nome}
                        </option>
                    ))}
                </select>

                <button type="submit" style={{marginTop: '20px', padding: '10px', fontSize: '16px'}}>CADASTRAR</button>
            </form>
        </div>
    );
};

export default CadastroProduto;