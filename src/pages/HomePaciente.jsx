import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import '../styles/HomePaciente.css';

const AVATARES = [
  require('../images/avatar-1.png'),
  require('../images/avatar-2.png'),
  require('../images/avatar-3.png'),
  require('../images/avatar-4.png'),
  require('../images/avatar-5.png'),
  require('../images/avatar-6.png'),
  require('../images/avatar-7.png'),
  require('../images/avatar-8.png'),
];

const getAvatarImg = (num) => AVATARES[(num || 1) - 1];

function HomePaciente() {
  const [paciente, setPaciente] = useState(null);
  const [mostrarMudarSenha, setMostrarMudarSenha] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [textoRelato, setTextoRelato] = useState('');
  const [erroRelato, setErroRelato] = useState('');
  const [sucessoRelato, setSucessoRelato] = useState('');
  const [salvandoRelato, setSalvandoRelato] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');

    if (userInfo) {
      const user = JSON.parse(userInfo);
      setPaciente(user);

      if (user.primeira_senha) {
        setMostrarMudarSenha(true);
      } else if (!user.perfil_configurado) {
        navigate('/configurar-perfil');
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
      setSucesso('Senha alterada! Redirecionando...');

      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      userInfo.primeira_senha = false;
      localStorage.setItem('userInfo', JSON.stringify(userInfo));

      setTimeout(() => {
        navigate('/configurar-perfil');
      }, 1500);
    } catch (error) {
      setErro(error.response?.data?.error || 'Erro ao alterar senha');
    } finally {
      setCarregando(false);
    }
  };

  const handleSalvarRelato = async (e) => {
    e.preventDefault();
    setErroRelato('');
    setSucessoRelato('');
    if (!textoRelato.trim()) {
      setErroRelato('Escreva algo antes de salvar.');
      return;
    }
    setSalvandoRelato(true);
    try {
      await authService.salvarRelato(textoRelato.trim());
      setSucessoRelato('Relato salvo!');
      setTextoRelato('');
      setTimeout(() => setSucessoRelato(''), 3000);
    } catch (error) {
      setErroRelato(error.response?.data?.error || 'Erro ao salvar relato');
    } finally {
      setSalvandoRelato(false);
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
          <div className="tamagochi-layout">
            <div className="tamagochi-screen">
              <p className="tamagochi-nome">{paciente?.nome}</p>
              <img
                src={getAvatarImg(paciente?.avatar)}
                alt="Seu avatar"
                className="tamagochi-avatar"
              />
            </div>

            <div className="relato-area">
              <h3>Como foi seu dia?</h3>
              <form onSubmit={handleSalvarRelato}>
                <textarea
                  placeholder="Escreva seu relato aqui..."
                  value={textoRelato}
                  onChange={(e) => setTextoRelato(e.target.value)}
                  rows={4}
                  maxLength={1000}
                />
                <div className="relato-footer">
                  <span className="char-count">{textoRelato.length}/1000</span>
                  {erroRelato && <p className="erro">{erroRelato}</p>}
                  {sucessoRelato && <p className="sucesso">{sucessoRelato}</p>}
                  <button type="submit" disabled={salvandoRelato}>
                    {salvandoRelato ? 'Salvando...' : 'Salvar relato'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePaciente;