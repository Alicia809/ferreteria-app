import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

function RutaProtegida({ children }) {
  const { usuario, loading } = useAuth();
  const tipoUsuario = localStorage.getItem('tipoUsuario');

  if (loading) {
    return <div>Cargando...</div>;
  }

  //Permitir acceso si hay usuario autenticado o tipoUsuario 'local'
  if (!usuario && tipoUsuario !== 'local') {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default RutaProtegida;


