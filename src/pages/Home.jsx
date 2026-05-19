import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="home-container">
      <div className="home-box">
        <h2>Bem-vindo!</h2>
        <p>Você está logado na aplicação</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

export default Home;