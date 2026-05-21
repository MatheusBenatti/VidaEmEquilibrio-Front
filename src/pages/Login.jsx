import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import '../styles/Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [lembrar, setLembrar] = useState(false);
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.login(email, senha);
      const { token, id, nome, email: emailResp, tipo, crp } = response.data;

      // Salva token
      localStorage.setItem('token', token);

      // Salva dados do usuário
      localStorage.setItem('userInfo', JSON.stringify({
        id,
        nome,
        email: emailResp,
        tipo,
        crp,
      }));

      // Se marcou "lembrar", salva email
      if (lembrar) {
        localStorage.setItem('email', email);
      }

      // Redireciona baseado no tipo
      if (tipo === 'psicologo') {
        navigate('/home-psicologo');
      } else if (tipo === 'paciente') {
        navigate('/home-paciente');
      }
    } catch (error) {
      setErro('Email ou senha inválidos');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        {erro && <p className="erro">{erro}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
          <label>
            <input
              type="checkbox"
              checked={lembrar}
              onChange={(e) => setLembrar(e.target.checked)}
            />
            Lembrar credenciais
          </label>
          <button type="submit">Login</button>
        </form>
        <p>
          Cadastro para psicólogos  <a href="/cadastro">Cadastre-se aqui</a>
        </p>
      </div>
    </div>
  );
}

export default Login;