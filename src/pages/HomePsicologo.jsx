import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/HomePsicologo.css';

function HomePsicologo() {
  const [psicologo, setPsicologo] = useState(null);
  const [pacientes, setPacientes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setPsicologo(JSON.parse(userInfo));
    }

    carregarPacientes();
  }, []);

  const carregarPacientes = async () => {
    try {
      const response = await api.get('pacientes/');
      setPacientes(response.data);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
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
              <h3>{paciente.user.first_name}</h3>
              <p>{paciente.user.email}</p>
            </div>
          ))}

          <div 
            className="adicionar-box"
            onClick={() => navigate('/adicionar-paciente')}
          >
            <div className="icon-plus">+</div>
            <p>Adicionar Paciente</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePsicologo;