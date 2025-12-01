// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

// Hook personalizado
export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // --- Helpers para tokens ---
  const getTokens = () => {
    const tokenString = localStorage.getItem("authTokens");
    return tokenString ? JSON.parse(tokenString) : null;
  };

  const decodeTokenIfValid = (tokens) => {
    if (!tokens?.access) return null;

    try {
      const decoded = jwtDecode(tokens.access);

      // Se expirar, devolve null — mas NÃO apaga o token automaticamente
      if (decoded.exp * 1000 < Date.now()) {
        console.warn("Token expirado (mas não apagado automaticamente).");
        return null;
      }

      return decoded;
    } catch {
      return null;
    }
  };

  // --- Estados globais ---
  const [authTokens, setAuthTokens] = useState(getTokens);
  const [user, setUser] = useState(() => decodeTokenIfValid(getTokens()));

  // --- LOGIN ---
  const loginUser = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/token/", {
        username: e.target.username.value,
        password: e.target.password.value,
      });

      localStorage.setItem("authTokens", JSON.stringify(response.data));

      setAuthTokens(response.data);
      setUser(jwtDecode(response.data.access));

      alert("Login efetuado!");

      // 🔁 Depois de logar, manda para a home (lista de produtos)
      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Erro ao tentar fazer login");
    }
  };

  // --- LOGOUT ---
  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem("authTokens");

    // Garante que qualquer carrinho salvo também suma
    localStorage.removeItem("cart");

    // 🔁 Sempre que sair, volta para tela de login
    navigate("/login");
  };

  // --- Verifica token ao iniciar (mas NÃO apaga automaticamente) ---
  useEffect(() => {
    const tokens = getTokens();
    const decoded = decodeTokenIfValid(tokens);

    if (!decoded && tokens) {
      console.warn("Token pode estar expirado. Usuário precisará logar depois.");
    }

    setUser(decoded);
  }, []);

  // --- Valores expostos no contexto ---
  const contextData = {
    user,
    authTokens,
    accessToken: authTokens?.access,
    loginUser,
    logoutUser,
  };

  return (
    <AuthContext.Provider value={contextData}>
      {children}
    </AuthContext.Provider>
  );
};
