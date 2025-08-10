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
        // Usuario no admin → leer datos guardados en localStorage
        const localUser = localStorage.getItem('usuario');
        const tipoUsuario = localStorage.getItem('tipoUsuario');

        if (localUser && tipoUsuario === 'local') {
          setUsuario({ tipo: 'local', datos: JSON.parse(localUser) }); // Recuperar datos del usuario local
        } else {
          setUsuario(null);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Función para iniciar sesión local (cuando no es Firebase)
  const loginLocal = (datosUsuario) => {
    localStorage.setItem('usuario', JSON.stringify(datosUsuario));
    localStorage.setItem('tipoUsuario', 'local');
    setUsuario({ tipo: 'local', datos: datosUsuario });
  };

  // Función para cerrar sesión (logout)
  const logout = async () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('tipoUsuario');
    await signOut(auth);
    setUsuario(null);
  };

  const value = {
    usuario,
    loading,
    logout,
    loginLocal, // para usar en el login local
    nombre:
      usuario?.tipo === 'admin'
        ? usuario.datos.email
        : usuario?.tipo === 'local'
        ? usuario.datos.nombre
        : null,
    rol:
      usuario?.tipo === 'admin'
        ? 'admin'
        : usuario?.tipo === 'local'
        ? usuario.datos.rol // 'bodega' o 'ventas'
        : null
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
      {loading && <div>Cargando...</div>}
    </AuthContext.Provider>
  );
}
