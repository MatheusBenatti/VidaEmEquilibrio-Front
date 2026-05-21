import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import '../styles/HomePaciente.css';

function HomePaciente() {
  const [paciente, setPaciente] = useState(null);
  const [mostrarMudarSenha, setMostrarMudarSenha] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');

    if (userInfo) {
      const user = JSON.parse(userInfo);
      setPaciente(user);
      
      if (user.primeira_senha) {
        setMostrarMudarSenha(true);
      }
    }
  }, []);

  const handleMudarSenha = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem');
      return;
    }

    if (novaSenha.length < 8) {
      setErro('A nova senha deve ter no mínimo 8 caracteres');
      return;
    }

    setCarregando(true);
    try {
      await authService.mudarSenha(senhaAtual, novaSenha);
      setSucesso('Senha alterada com sucesso!');

      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      userInfo.primeira_senha = false;
      localStorage.setItem('userInfo', JSON.stringify(userInfo));

      setTimeout(() => {
        setMostrarMudarSenha(false);
        setSucesso('');
      }, 2000);
    } catch (error) {
      setErro(error.response?.data?.error || 'Erro ao alterar senha');
    } finally {
      setCarregando(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="home-paciente">
      <nav className="navbar">
        <h1>Vida em Equilíbrio</h1>
        <div>
          <span>Olá, {paciente?.nome}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="container">
        {mostrarMudarSenha && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Altere sua Senha</h2>
              <p>Você precisa alterar sua senha temporária antes de continuar.</p>
              {erro && <p className="erro">{erro}</p>}
              {sucesso && <p className="sucesso">{sucesso}</p>}
              <form onSubmit={handleMudarSenha}>
                <input
                  type="password"
                  placeholder="Senha atual (temporária)"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Nova senha (mínimo 8 caracteres)"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Confirmar nova senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  required
                />
                <button type="submit" disabled={carregando}>
                  {carregando ? 'Alterando...' : 'Alterar Senha'}
                </button>
              </form>
            </div>
          </div>
        )}

        {!mostrarMudarSenha && (
          <div className="welcome-content">
            <h2>Bem-vindo, {paciente?.nome}!</h2>
            <p>Em breve, mais funcionalidades estarão disponíveis aqui.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePaciente;