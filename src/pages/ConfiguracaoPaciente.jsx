import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import '../styles/ConfiguracaoPaciente.css';

const AvatarMasculino = ({ selecionado, onClick }) => (
  <div className={`avatar-card ${selecionado ? 'selecionado' : ''}`} onClick={onClick}>
    <svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg" className="avatar-svg">
      <polygon points="50,8 62,28 38,28" fill="#b0b8c1" />
      <circle cx="50" cy="38" r="18" fill="#c8d0d8" />
      <polygon points="50,56 28,90 72,90" fill="#a8b4be" />
      <polygon points="28,90 20,130 42,130 50,95 58,130 80,130 72,90" fill="#b0b8c1" />
      <polygon points="28,90 20,130 28,130" fill="#9aa8b4" />
      <polygon points="72,90 80,130 72,130" fill="#9aa8b4" />
      <line x1="28" y1="90" x2="14" y2="116" stroke="#b0b8c1" strokeWidth="8" strokeLinecap="round" />
      <line x1="72" y1="90" x2="86" y2="116" stroke="#b0b8c1" strokeWidth="8" strokeLinecap="round" />
    </svg>
    <span>Masculino</span>
  </div>
);

const AvatarFeminino = ({ selecionado, onClick }) => (
  <div className={`avatar-card ${selecionado ? 'selecionado' : ''}`} onClick={onClick}>
    <svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg" className="avatar-svg">
      <polygon points="50,4 58,20 42,20" fill="#b0b8c1" />
      <circle cx="50" cy="32" r="16" fill="#c8d0d8" />
      <path d="M32,50 Q50,48 68,50 L76,95 H24 Z" fill="#a8b4be" />
      <path d="M24,95 Q30,125 42,130 H58 Q70,125 76,95 Z" fill="#b0b8c1" />
      <line x1="32" y1="52" x2="16" y2="80" stroke="#b0b8c1" strokeWidth="7" strokeLinecap="round" />
      <line x1="68" y1="52" x2="84" y2="80" stroke="#b0b8c1" strokeWidth="7" strokeLinecap="round" />
      <ellipse cx="50" cy="22" rx="20" ry="10" fill="none" stroke="#9aa8b4" strokeWidth="3" />
    </svg>
    <span>Feminino</span>
  </div>
);

function ConfiguracaoPaciente() {
  const [nome, setNome] = useState('');
  const [avatarSelecionado, setAvatarSelecionado] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      if (user.tipo !== 'paciente') {
        navigate('/home-psicologo');
        return;
      }
      if (user.perfil_configurado) {
        navigate('/home-paciente');
        return;
      }
      setNome(user.nome || '');
    }
  }, []);

  const handleConfirmar = async (e) => {
    e.preventDefault();
    setErro('');

    if (!avatarSelecionado) {
      setErro('Selecione um avatar para continuar');
      return;
    }

    if (!nome.trim()) {
      setErro('Digite como quer ser chamado');
      return;
    }

    setCarregando(true);
    try {
      const response = await authService.configurarPerfil(nome.trim(), avatarSelecionado);

      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      userInfo.nome = response.data.nome;
      userInfo.avatar = response.data.avatar;
      userInfo.perfil_configurado = true;
      localStorage.setItem('userInfo', JSON.stringify(userInfo));

      navigate('/home-paciente');
    } catch (error) {
      setErro(error.response?.data?.error || 'Erro ao configurar perfil');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="configuracao-container">
      <div className="configuracao-box">
        <div className="configuracao-header">
          <h1>Vida em Equilíbrio</h1>
          <p className="subtitulo">Vamos personalizar seu perfil</p>
        </div>

        <form onSubmit={handleConfirmar}>
          <div className="campo-nome">
            <label>Como você quer ser chamado?</label>
            <input
              type="text"
              placeholder="Seu nome ou apelido"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              maxLength={60}
              required
            />
          </div>

          <div className="avatar-section">
            <label>Escolha seu avatar</label>
            <div className="avatares-grid">
              <AvatarMasculino
                selecionado={avatarSelecionado === 'masculino'}
                onClick={() => setAvatarSelecionado('masculino')}
              />
              <AvatarFeminino
                selecionado={avatarSelecionado === 'feminino'}
                onClick={() => setAvatarSelecionado('feminino')}
              />
            </div>
          </div>

          {erro && <p className="erro">{erro}</p>}

          <button type="submit" className="btn-confirmar" disabled={carregando}>
            {carregando ? 'Salvando...' : 'Começar →'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ConfiguracaoPaciente;
