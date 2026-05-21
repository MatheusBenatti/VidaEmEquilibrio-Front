import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, tipoPermitido }) {
  const token = localStorage.getItem('token');
  const userInfo = localStorage.getItem('userInfo');

  if (!token || !userInfo) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userInfo);

  if (tipoPermitido && user.tipo !== tipoPermitido) {
    if (user.tipo === 'psicologo') {
      return <Navigate to="/home-psicologo" replace />;
    }
    return <Navigate to="/home-paciente" replace />;
  }

  return children;
}

export default ProtectedRoute;