import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Observador Firebase
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Usuario admin autenticado con Firebase
        setUsuario({ tipo: 'admin', datos: firebaseUser });
      } else {
        // Usuario no admin, revisa localStorage para usuario local
        const localUser = localStorage.getItem('usuario');
        const tipoUsuario = localStorage.getItem('tipoUsuario');

        if (localUser && tipoUsuario === 'local') {
          setUsuario({ tipo: 'local', datos: JSON.parse(localUser) });
        } else {
          setUsuario(null);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Función para cerrar sesión (logout)
  const logout = async () => {
    // Limpiar localStorage
    localStorage.removeItem('usuario');
    localStorage.removeItem('tipoUsuario');

    // Logout Firebase
    await signOut(auth);

    setUsuario(null);
  };

  const value = {
    usuario,
    loading,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
      {loading && <div>Cargando...</div>}
    </AuthContext.Provider>
  );
}
