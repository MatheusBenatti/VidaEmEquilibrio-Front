import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import Avatar3D from '../components/Avatar3D';
import '../styles/ConfiguracaoPaciente.css';

const AVATARES = [
  { type: 'male', nome: 'Masculino' },
  { type: 'female', nome: 'Feminino' },
];

const AvatarCard = ({ avatar, selecionado, onClick }) => (
  <button
    type="button"
    className={`avatar-card ${selecionado ? 'selecionado' : ''}`}
    onClick={onClick}
    aria-pressed={selecionado}
  >
    <Avatar3D type={avatar.type} className="avatar3d-opcao" />
    <span>{avatar.nome}</span>
  </button>
);

function ConfiguracaoPaciente() {
  const [nome, setNome] = useState('');
  const [avatarSelecionado, setAvatarSelecionado] = useState(null);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConfirmar = async (e) => {
    e.preventDefault();
    setErro('');

    if (avatarSelecionado === null) {
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
          <div className="configuracao-header-icon">🧘</div>
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
            <div className="avatares-grid-8">
              {AVATARES.map((avatar) => (
                <AvatarCard
                  key={avatar.type}
                  avatar={avatar}
                  selecionado={avatarSelecionado === avatar.type}
                  onClick={() => setAvatarSelecionado(avatar.type)}
                />
              ))}
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
