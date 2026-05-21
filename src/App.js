import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import HomePsicologo from './pages/HomePsicologo';
import HomePaciente from './pages/HomePaciente';
import AdicionarPaciente from './pages/AdicionarPaciente'; // criar depois

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/home-psicologo" element={<HomePsicologo />} />
        <Route path="/home-paciente" element={<HomePaciente />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;