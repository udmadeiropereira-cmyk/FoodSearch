// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

// Hook para usar o contexto
export function useAuth() {
    return useContext(AuthContext);
}

export default AuthContext;

export const AuthProvider = ({ children }) => {
    
    const getTokens = () => {
        const tokenString = localStorage.getItem('authTokens');
        return tokenString ? JSON.parse(tokenString) : null;
    };
    
    const getUserFromToken = (tokens) => {
        if (!tokens || !tokens.access) return null;
        try {
            const decoded = jwtDecode(tokens.access);

            if (decoded.exp * 1000 < Date.now()) {
                return null;
            }

            return decoded;
        } catch (e) {
            return null;
        }
    };

    const [authTokens, setAuthTokens] = useState(getTokens);
    const [user, setUser] = useState(() => getUserFromToken(getTokens()));
    
    const loginUser = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/token/', {
                username: e.target.username.value,
                password: e.target.password.value
            });
            
            localStorage.setItem('authTokens', JSON.stringify(response.data));
            
            setAuthTokens(response.data);
            setUser(jwtDecode(response.data.access));
            
            alert("Login efetuado!");
        } catch (error) {
            console.error(error);
            alert("Algo deu errado no login");
        }
    };

    const logoutUser = () => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
    };
    
    useEffect(() => {
        const tokens = getTokens();
        if (!getUserFromToken(tokens) && tokens) {
            console.warn("Token expirado na inicialização. Limpando sessão.");
            logoutUser();
        }
    }, []); 

    let contextData = {
        user,
        authTokens,
        accessToken: authTokens?.access,  // <- token certo p/ usar no Cart
        loginUser,
        logoutUser,
    };

    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    );
};
