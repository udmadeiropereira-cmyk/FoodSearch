import { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
    // 1. Recupera o objeto completo (Access + Refresh) se existir
    let [authTokens, setAuthTokens] = useState(() => 
        localStorage.getItem('authTokens') 
            ? JSON.parse(localStorage.getItem('authTokens')) 
            : null
    );

    // 2. Decodifica o usuário a partir do token de acesso salvo
    let [user, setUser] = useState(() => 
        localStorage.getItem('authTokens') 
            ? jwtDecode(localStorage.getItem('authTokens')) 
            : null
    );
    
    // O navigate deve ser usado nos componentes, não aqui diretamente, para evitar erros de contexto
    
    let loginUser = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/token/', {
                username: e.target.username.value,
                password: e.target.password.value
            });
            
            // 3. AQUI ESTAVA O ERRO: Agora salvamos o objeto JSON completo (access e refresh)
            // Usamos JSON.stringify para transformar o objeto em string
            localStorage.setItem('authTokens', JSON.stringify(response.data));
            
            setAuthTokens(response.data);
            setUser(jwtDecode(response.data.access));
            
            alert("Login efetuado!");
            // Aqui você pode redirecionar usando window.location ou passando navigate via props
        } catch (error) {
            console.error(error);
            alert("Algo deu errado no login");
        }
    };

    let logoutUser = () => {
        setAuthTokens(null);
        setUser(null);
        // 4. Limpa a chave correta
        localStorage.removeItem('authTokens');
    };

    let contextData = {
        user: user,
        authTokens: authTokens, // Útil expor os tokens caso precise usar em interceptors
        loginUser: loginUser,
        logoutUser: logoutUser,
    };

    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    );
};