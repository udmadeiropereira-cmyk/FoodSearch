import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Login = () => {
    let { loginUser } = useContext(AuthContext);

    return (
        <div>
            <form onSubmit={loginUser}>
                <input type="text" name="username" placeholder="Usuário" />
                <input type="password" name="password" placeholder="Senha" />
                <button type="submit">Entrar</button>
            </form>
        </div>
    );
}

export default Login;