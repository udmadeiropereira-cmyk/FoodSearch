import { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
    let [user, setUser] = useState(() => localStorage.getItem('access_token') ? jwtDecode(localStorage.getItem('access_token')) : null);
    let [authTokens, setAuthTokens] = useState(() => localStorage.getItem('access_token') ? JSON.parse(localStorage.getItem('access_token')) : null);
    
    // O navigate pode precisar estar dentro do componente que é filho do Router no App.jsx
    // Se der erro aqui, a lógica de redirecionamento deve ir para a página de Login
    
    let loginUser = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/token/', {
                username: e.target.username.value,
                password: e.target.password.value
            });
            
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            
            setAuthTokens(response.data);
            setUser(jwtDecode(response.data.access));
            alert("Login efetuado!");
        } catch (error) {
            alert("Algo deu errado no login");
        }
    };

    let logoutUser = () => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    };

    let contextData = {
        user: user,
        loginUser: loginUser,
        logoutUser: logoutUser,
    };

    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    );
};