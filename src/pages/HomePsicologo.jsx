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
      const response = await authService.adicionarPaciente(emailPaciente, nomePaciente);
      setSucesso(`Paciente adicionado! Senha temporária: ${response.data.senha_temporaria}`);
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
              <h3>{paciente.nome}</h3>
              <p>{paciente.email}</p>
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