import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function RutaProtegidaRol({ children, rolesPermitidos }) {
  const { usuario, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  // Si no está autenticado, redirige a login
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // Si es admin, dejamos pasar siempre (o también puedes restringir)
  if (usuario.tipo === 'admin') {
    return children;
  }

  // Si es usuario local, chequeamos que su rol esté en la lista de permitidos
  if (usuario.tipo === 'local') {
    if (rolesPermitidos.includes(usuario.datos.rol)) {
      return children;
    } else {
      // Si no tiene permiso para esta ruta, redirige a una página de "No autorizado" o Home
      return <Navigate to="*" replace />;
    }
  }

  // Por defecto bloquea el acceso
  return <Navigate to="/login" replace />;
}

export default RutaProtegidaRol;
