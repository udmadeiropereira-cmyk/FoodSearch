import { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
    
    // Funções auxiliares para leitura segura do localStorage
    const getTokens = () => {
        const tokenString = localStorage.getItem('authTokens');
        return tokenString ? JSON.parse(tokenString) : null;
    };
    
    const getUserFromToken = (tokens) => {
        if (!tokens || !tokens.access) return null;
        try {
            // Verifica se o token está expirado antes de decodificar
            const decoded = jwtDecode(tokens.access);
            if (decoded.exp * 1000 < Date.now()) { // O token expirou
                return null;
            }
            return decoded;
        } catch (e) {
            // Token inválido (corrompido ou mal formado)
            return null;
        }
    };

    // 1. Inicializa o estado lendo de forma segura
    let [authTokens, setAuthTokens] = useState(getTokens);

    // 2. Inicializa o usuário lendo o token de acesso
    let [user, setUser] = useState(() => getUserFromToken(getTokens()));
    
    // O navigate deve ser usado nos componentes, não aqui diretamente, para evitar erros de contexto
    
    // ... (As funções loginUser e logoutUser permanecem como estão) ...
    let loginUser = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/token/', {
                username: e.target.username.value,
                password: e.target.password.value
            });
            
            localStorage.setItem('authTokens', JSON.stringify(response.data));
            
            setAuthTokens(response.data);
            setUser(jwtDecode(response.data.access)); // Aqui usa o token válido
            
            alert("Login efetuado!");
        } catch (error) {
            console.error(error);
            alert("Algo deu errado no login");
        }
    };

    let logoutUser = () => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
    };
    
    // 3. EFEITO DE MONITORAMENTO (Opcional, mas ajuda a manter a validade do token)
    // Este useEffect faria a tentativa de refresh do token. Por hora, vamos deixá-lo simples:
    
    useEffect(() => {
        // Se a página for carregada e o token estiver expirado, limpamos tudo.
        const tokens = getTokens();
        if (!getUserFromToken(tokens) && tokens) {
            console.warn("Token expirado na inicialização. Limpando sessão.");
            // Força a limpeza para garantir que o usuário precise logar de novo.
            logoutUser();
        }
    }, []); 

    // ... (restante do contextData e return) ...
    let contextData = {
        user: user,
        authTokens: authTokens,
        loginUser: loginUser,
        logoutUser: logoutUser,
    };

    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    );
};