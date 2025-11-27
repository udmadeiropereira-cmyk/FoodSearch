import React, { useState, useContext } from 'react';
import api from '../services/api';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CadastroProduto = () => {
    const { user, authTokens } = useContext(AuthContext); // Apenas para garantir que tem user
    const navigate = useNavigate();

    // Estado inicial 
    const [formData, setFormData] = useState({
        // Dados Básicos
        nome: '',
        descricao: '',
        preco: '',
        estoque: '',
        codigo_barras: '',
        porcao: '', // Default 
        categoria: '', // Vai receber o ID

        // Nutricional (Obrigatórios)
        calorias: '',
        proteinas: '',
        carboidratos: '',
        gorduras_totais: '',
        gorduras_saturadas: '',
        acucar_adicionado: '', 
        sodio: '',
        fibras: '', 

        // Avisos e Booleanos
        contaminacao_cruzada: '',
        alto_teor_sodio: false,
        alto_teor_acucar: false,
        alto_teor_gordura_sat: false,
        
        // ManyToMany (Arrays de IDs)
        ingredientes: [], 
        alergenicos: []
    });

    const [imagem, setImagem] = useState(null);

    // Manipula texto e números
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    // Manipula arquivo
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImagem(e.target.files[0]);
        }
    };

    // Manipula selects múltiplos (Ingredientes/Alergenicos)
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
            // Opcional: Redirecionar para o login
            navigate('/login'); 
            return;
        }
        
        const dataToSend = new FormData();

        // Adiciona todos os campos do estado ao FormData
        Object.keys(formData).forEach(key => {
            if (key !== 'ingredientes' && key !== 'alergenicos') {
                dataToSend.append(key, formData[key]);
            }
        });

        // Adiciona a imagem se existir
        if (imagem) {
            dataToSend.append('imagem', imagem);
        }

        // Adiciona ManyToMany (repetindo as chaves para o Django entender lista)
        formData.ingredientes.forEach(id => dataToSend.append('ingredientes', id));
        formData.alergenicos.forEach(id => dataToSend.append('alergenicos', id));

        try {
            // Ajuste a URL se necessário
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

            // Mostra o erro exato na tela para facilitar
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

                {/* --- CATEGORIA (Atenção: Use um ID que exista no seu banco!) --- */}
                <label>Categoria (ID):</label>
                <input type="number" name="categoria" placeholder="ID da Categoria (Ex: 1)" onChange={handleChange} required />
                {/* Futuramente você pode trocar esse input por um <select> buscando da API */}

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
                {/* Nota: Para funcionar perfeitamente, você precisaria listar os IDs reais do banco */}
                <label>IDs de Ingredientes (Segure Ctrl):</label>
                <select name="ingredientes" multiple onChange={handleMultiSelect} style={{height: '60px'}}>
                    <option value="1">Ingrediente ID 1</option>
                    <option value="2">Ingrediente ID 2</option>
                </select>

                <label>IDs de Alergênicos (Segure Ctrl):</label>
                <select name="alergenicos" multiple onChange={handleMultiSelect} style={{height: '60px'}}>
                    <option value="1">Alergênico ID 1</option>
                    <option value="2">Alergênico ID 2</option>
                </select>

                <button type="submit" style={{marginTop: '20px', padding: '10px', fontSize: '16px'}}>CADASTRAR</button>
            </form>
        </div>
    );
};

export default CadastroProduto;