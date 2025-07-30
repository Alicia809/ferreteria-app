import React, { useState } from 'react';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';

function DeleteLocalUser() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleDelete = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!username.trim()) {
      setError('Por favor ingresa el nombre de usuario.');
      return;
    }

    try {
      const userRef = doc(db, "usuarios", username);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setError('Usuario no encontrado.');
        return;
      }

      const userData = userSnap.data();

      if (userData.rol === 'admin') {
        setError('No se puede eliminar un usuario administrador.');
        return;
      }

      // Confirmación de eliminación
      const confirmado = window.confirm(`¿Estás seguro que deseas eliminar al usuario '${username}'?`);
      if (!confirmado) {
        return; // el usuario canceló
      }

      await deleteDoc(userRef);
      setMessage(`Usuario '${username}' eliminado correctamente.`);
      setUsername('');
    } catch (err) {
      setError('Error eliminando usuario: ' + err.message);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Eliminar Usuario Local</h2>
      <form onSubmit={handleDelete}>
        <div>
          <label>Nombre de usuario:</label><br />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <button type="submit" style={{ marginTop: '1rem' }}>
          Eliminar
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}
    </div>
  );
}

export default DeleteLocalUser;
