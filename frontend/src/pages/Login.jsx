import { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Login = () => {
    const { loginUser, user } = useContext(AuthContext);
    const navigate = useNavigate();

    // ⬇ Redireciona automaticamente após login
    useEffect(() => {
        if (user) {
            navigate("/");  // vai para a Home (lista de produtos)
        }
    }, [user, navigate]);

    return (
        <div
            style={{
                maxWidth: '400px',
                margin: '60px auto',
                padding: '30px',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}
        >
            <h2
                style={{
                    textAlign: 'center',
                    color: '#27ae60',
                    marginBottom: '20px'
                }}
            >
                Acessar Conta
            </h2>

            <form onSubmit={loginUser}>
                {/* Campo Usuário */}
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                        Usuário
                    </label>
                    <input
                        type="text"
                        name="username"
                        placeholder="Nome de Usuário"
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '6px'
                        }}
                        required
                    />
                </div>

                {/* Campo Senha */}
                <div style={{ marginBottom: '25px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                        Senha
                    </label>
                    <input
                        type="password"
                        name="password"
                        placeholder="Senha"
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '6px'
                        }}
                        required
                    />
                </div>

                {/* Botão Entrar */}
                <button
                    type="submit"
                    style={{
                        width: '100%',
                        padding: '12px',
                        background: '#27ae60',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '1rem'
                    }}
                >
                    Entrar
                </button>
            </form>

            {/* Link para Cadastrar */}
            <div
                style={{
                    marginTop: '20px',
                    textAlign: 'center',
                    fontSize: '0.9rem'
                }}
            >
                Não tem conta?{' '}
                <Link
                    to="/register"
                    style={{
                        color: '#27ae60',
                        fontWeight: 'bold'
                    }}
                >
                    Cadastre-se
                </Link>
            </div>
        </div>
    );
};

export default Login;
