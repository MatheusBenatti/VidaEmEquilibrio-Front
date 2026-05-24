import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import '../styles/Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await authService.login(email, senha);
      const { token, id, nome, username, tipo, crp, primeira_senha } = response.data;

      // Salva token
      localStorage.setItem('token', token);

      // Salva dados do usuário
      localStorage.setItem('userInfo', JSON.stringify({
        id,
        nome,
        email: username,
        tipo,
        crp,
        primeira_senha,
      }));

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
        <div className="login-brand">
          <div className="login-brand-icon">🧘</div>
          <h1>Vida em <span>Equilíbrio</span></h1>
        </div>
        <p className="login-subtitle">Faça login para continuar sua jornada de bem-estar</p>
        {erro && <p className="erro">{erro}</p>}
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>
          <button type="submit">Entrar</button>
        </form>
        <div className="login-footer">
          <p>
            É psicólogo? <a href="/cadastro">Cadastre-se aqui</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;