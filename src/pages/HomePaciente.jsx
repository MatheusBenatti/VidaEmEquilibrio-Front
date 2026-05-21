import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function HomePaciente() {
  const [paciente, setPaciente] = useState(null);
  const [mostrarMudarSenha, setMostrarMudarSenha] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('userInfo');
    
    if (!token) {
      navigate('/login');
      return;
    }

    if (userInfo) {
      const user = JSON.parse(userInfo);
      setPaciente(user);
      
      if (user.primeira_senha) {
        setMostrarMudarSenha(true);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <div className="home-paciente">
      <nav className="navbar">
        <h1>Vida em Equilíbrio - Paciente</h1>
        <button onClick={handleLogout}>Logout</button>
      </nav>

      <div className="container">
        {mostrarMudarSenha && (
          <div className="mudar-senha-modal">
            <h2>Altere sua Senha</h2>
            <p>Você precisa alterar sua senha temporária antes de continuar.</p>
          </div>
        )}

        {!mostrarMudarSenha && (
          <div>
            <h2>Bem-vindo, {paciente?.nome}!</h2>
            <p>Em breve, mais funcionalidades estarão disponíveis aqui.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePaciente;