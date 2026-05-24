import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import '../styles/ConfiguracaoPaciente.css';

const AVATARES = [
  { num: 1, img: require('../images/avatar-01.png'), nome: 'Avatar 1' },
  { num: 2, img: require('../images/avatar-02.png'), nome: 'Avatar 2' },
  { num: 3, img: require('../images/avatar-03.png'), nome: 'Avatar 3' },
  { num: 4, img: require('../images/avatar-04.png'), nome: 'Avatar 4' },
  { num: 5, img: require('../images/avatar-05.png'), nome: 'Avatar 5' },
  { num: 6, img: require('../images/avatar-06.png'), nome: 'Avatar 6' },
  { num: 7, img: require('../images/avatar-07.png'), nome: 'Avatar 7' },
  { num: 8, img: require('../images/avatar-08.png'), nome: 'Avatar 8' },
];

const AvatarCard = ({ avatar, selecionado, onClick }) => (
  <div className={`avatar-card ${selecionado ? 'selecionado' : ''}`} onClick={onClick}>
    <img src={avatar.img} alt={avatar.nome} className="avatar-svg" />
  </div>
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
                  key={avatar.num}
                  avatar={avatar}
                  selecionado={avatarSelecionado === avatar.num}
                  onClick={() => setAvatarSelecionado(avatar.num)}
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
