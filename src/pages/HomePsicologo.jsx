import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import '../styles/HomePsicologo.css';

function HomePsicologo() {
  const [psicologo, setPsicologo] = useState(null);
  const [pacientes, setPacientes] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [emailPaciente, setEmailPaciente] = useState('');
  const [nomePaciente, setNomePaciente] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setPsicologo(JSON.parse(userInfo));
    }
    carregarPacientes();
  }, []);

  const carregarPacientes = async () => {
    try {
      const response = await authService.meusPacientes();
      setPacientes(response.data);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    }
  };

  const handleAdicionarPaciente = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');
    setCarregando(true);

    try {
      await authService.adicionarPaciente(emailPaciente, nomePaciente);
      setSucesso('Paciente adicionado! Convite enviado para o e-mail cadastrado.');
      setEmailPaciente('');
      setNomePaciente('');
      carregarPacientes();
      setTimeout(() => {
        setMostrarModal(false);
        setSucesso('');
      }, 4000);
    } catch (error) {
      setErro(error.response?.data?.error || 'Erro ao adicionar paciente');
    } finally {
      setCarregando(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="home-psicologo">
      <nav className="navbar">
        <h1>Vida em Equilíbrio</h1>
        <div>
          <span>Bem-vindo, {psicologo?.nome}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="container">
        <h2>Meus Pacientes</h2>
        <div className="pacientes-grid">
          {pacientes.map(paciente => (
            <div key={paciente.id} className="paciente-box">
              <div className="paciente-card-body">
                <div className="paciente-avatar-col">
                  {paciente.avatar === 'feminino' ? (
                    <svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg" className="paciente-avatar-svg">
                      <polygon points="50,4 58,20 42,20" fill="#b0b8c1" />
                      <circle cx="50" cy="32" r="16" fill="#c8d0d8" />
                      <path d="M32,50 Q50,48 68,50 L76,95 H24 Z" fill="#a8b4be" />
                      <path d="M24,95 Q30,125 42,130 H58 Q70,125 76,95 Z" fill="#b0b8c1" />
                      <line x1="32" y1="52" x2="16" y2="80" stroke="#b0b8c1" strokeWidth="7" strokeLinecap="round" />
                      <line x1="68" y1="52" x2="84" y2="80" stroke="#b0b8c1" strokeWidth="7" strokeLinecap="round" />
                      <ellipse cx="50" cy="22" rx="20" ry="10" fill="none" stroke="#9aa8b4" strokeWidth="3" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg" className="paciente-avatar-svg">
                      <polygon points="50,8 62,28 38,28" fill="#b0b8c1" />
                      <circle cx="50" cy="38" r="18" fill="#c8d0d8" />
                      <polygon points="50,56 28,90 72,90" fill="#a8b4be" />
                      <polygon points="28,90 20,130 42,130 50,95 58,130 80,130 72,90" fill="#b0b8c1" />
                      <line x1="28" y1="90" x2="14" y2="116" stroke="#b0b8c1" strokeWidth="8" strokeLinecap="round" />
                      <line x1="72" y1="90" x2="86" y2="116" stroke="#b0b8c1" strokeWidth="8" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
                <div className="paciente-info-col">
                  <span className="paciente-label">Paciente</span>
                  <h3>{paciente.nome}</h3>
                  <p>{paciente.email}</p>
                </div>
              </div>
              <button className="btn-relatorio">Relatório</button>
            </div>
          ))}

          <div 
            className="adicionar-box"
            onClick={() => { setMostrarModal(true); setErro(''); setSucesso(''); }}
          >
            <div className="icon-plus">+</div>
            <p>Adicionar Paciente</p>
          </div>
        </div>
      </div>

      {mostrarModal && (
        <div className="modal-overlay" onClick={() => setMostrarModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Adicionar Paciente</h2>
            <p>O paciente receberá um email com as credenciais de acesso.</p>
            {erro && <p className="erro">{erro}</p>}
            {sucesso && <p className="sucesso">{sucesso}</p>}
            <form onSubmit={handleAdicionarPaciente}>
              <input
                type="text"
                placeholder="Nome do paciente"
                value={nomePaciente}
                onChange={(e) => setNomePaciente(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email do paciente"
                value={emailPaciente}
                onChange={(e) => setEmailPaciente(e.target.value)}
                required
              />
              <div className="modal-buttons">
                <button type="submit" disabled={carregando}>
                  {carregando ? 'Adicionando...' : 'Adicionar'}
                </button>
                <button type="button" className="btn-cancelar" onClick={() => setMostrarModal(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePsicologo;