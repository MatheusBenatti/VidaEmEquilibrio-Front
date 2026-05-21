import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import HomePsicologo from './pages/HomePsicologo';
import HomePaciente from './pages/HomePaciente';
import ProtectedRoute from './components/ProtectedRoute';
import ConfiguracaoPaciente from './pages/ConfiguracaoPaciente';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/home-psicologo" element={
          <ProtectedRoute tipoPermitido="psicologo">
            <HomePsicologo />
          </ProtectedRoute>
        } />
        <Route path="/home-paciente" element={
          <ProtectedRoute tipoPermitido="paciente">
            <HomePaciente />
          </ProtectedRoute>
        } />
        <Route path="/configurar-perfil" element={
          <ProtectedRoute tipoPermitido="paciente">
            <ConfiguracaoPaciente />
          </ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;