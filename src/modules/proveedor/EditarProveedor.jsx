import React, { useState } from 'react';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from '../../components/AuthContext';

function EditLocalUser() {
  const [currentUsername, setCurrentUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('bodega');
  const [userLoaded, setUserLoaded] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleLoadUser = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setUserLoaded(false);

    if (!currentUsername.trim()) {
      setError('Por favor ingresa el nombre de usuario actual.');
      return;
    }

    try {
      const userRef = doc(db, 'usuarios', currentUsername);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setError('Usuario no encontrado.');
        return;
      }

      const userData = userSnap.data();

      if (userData.rol === 'admin') {
        setError('No se puede editar un usuario administrador.');
        return;
      }

      setNewUsername(userData.username || currentUsername);
      setPassword(userData.password || '');
      setRol(userData.rol || 'bodega');
      setUserLoaded(true);
    } catch (err) {
      setError('Error cargando usuario: ' + err.message);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!newUsername.trim()) {
      setError('El nuevo nombre de usuario no puede estar vacío.');
      return;
    }
    if (!password) {
      setError('La contraseña no puede estar vacía.');
      return;
    }
    if (!rol) {
      setError('Debe seleccionar un rol.');
      return;
    }

    try {
      if (newUsername !== currentUsername) {
        const newUserRef = doc(db, 'usuarios', newUsername);
        const newUserSnap = await getDoc(newUserRef);
        if (newUserSnap.exists()) {
          setError('El nuevo nombre de usuario ya existe.');
          return;
        }

        await setDoc(newUserRef, { username: newUsername, password, rol });
        const oldUserRef = doc(db, 'usuarios', currentUsername);
        await deleteDoc(oldUserRef);

        setMessage('Usuario actualizado y renombrado correctamente.');
      } else {
        const userRef = doc(db, 'usuarios', currentUsername);
        await setDoc(userRef, { username: newUsername, password, rol });
        setMessage('Usuario actualizado correctamente.');
      }

      setCurrentUsername('');
      setNewUsername('');
      setPassword('');
      setRol('bodega');
      setUserLoaded(false);
    } catch (err) {
      setError('Error guardando usuario: ' + err.message);
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar bg-body-tertiary fixed-top">
        <div className="container-fluid">
          <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
            <img src="/Logo.png" alt="Logo" height="60" />
            <span>Comercial Mateo</span>
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasNavbar"
            aria-controls="offcanvasNavbar"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div
            className="offcanvas offcanvas-end custom-offcanvas"
            tabIndex="-1"
            id="offcanvasNavbar"
            aria-labelledby="offcanvasNavbarLabel"
          >
            <div className="offcanvas-header">
              <button
                type="button"
                className="btn-close custom-close-btn"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              ></button>
            </div>
            <div className="offcanvas-body">
              <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
                <li className="nav-item">
                  <Link to="/reportes" className="nav-link menu-link">
                    <i className="fas fa-chart-line me-2"></i> REPORTES
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/facturacion" className="nav-link menu-link">
                    <i className="fas fa-file-invoice-dollar me-2"></i> FACTURACIÓN
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/inventario" className="nav-link menu-link">
                    <i className="fas fa-boxes me-2"></i> INVENTARIO
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/proveedores" className="nav-link menu-link">
                    <i className="fas fa-truck me-2"></i> PROVEEDORES
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/seguridad" className="nav-link menu-link">
                    <i className="fas fa-user-shield me-2"></i> SEGURIDAD
                  </Link>
                </li>
              </ul>
              <div>
                <button
                  type="button"
                  className="btn btn-outline-danger mt-3"
                  onClick={handleLogout}
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <div className="container min-vh-100 d-flex justify-content-center align-items-center" style={{ paddingTop: '120px' }}>
        <div className="card p-4 shadow-lg" style={{ width: '700px' }}>
          <h4 className="text-center mb-4">Editar Usuario Local</h4>

          {!userLoaded && (
            <form onSubmit={handleLoadUser}>
              <div className="mb-3 row align-items-center">
                <label className="col-sm-5 col-form-label">Nombre de usuario actual:</label>
                <div className="col-sm-7">
                  <input
                    type="text"
                    className="form-control"
                    value={currentUsername}
                    onChange={(e) => setCurrentUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="d-flex justify-content-between mt-4">
                <Link to="/seguridad" className="btn btn-secondary">Regresar</Link>
                <button type="submit" className="btn btn-primary">Cargar usuario</button>
              </div>
            </form>
          )}

          {userLoaded && (
            <form onSubmit={handleSave}>
              <div className="mb-3 row align-items-center">
                <label className="col-sm-5 col-form-label">Nombre de usuario:</label>
                <div className="col-sm-7">
                  <input
                    type="text"
                    className="form-control"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3 row align-items-center">
                <label className="col-sm-5 col-form-label">Contraseña:</label>
                <div className="col-sm-7">
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3 row align-items-center">
                <label className="col-sm-5 col-form-label">Rol:</label>
                <div className="col-sm-7">
                  <select
                    className="form-select"
                    value={rol}
                    onChange={(e) => setRol(e.target.value)}
                    required
                  >
                    <option value="bodega">Encargado de bodega</option>
                    <option value="ventas">Encargado de ventas</option>
                  </select>
                </div>
              </div>

              <div className="d-flex justify-content-between mt-4">
                <Link to="/seguridad" className="btn btn-secondary">Regresar</Link>
                <button type="submit" className="btn btn-success">Guardar cambios</button>
              </div>
            </form>
          )}

          {error && <div className="alert alert-danger mt-3">{error}</div>}
          {message && <div className="alert alert-success mt-3">{message}</div>}
        </div>
      </div>
    </>
  );
}

export default EditLocalUser;
