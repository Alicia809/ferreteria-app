import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from '../../components/AuthContext';

function Mostrar() {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    const fetchUsuarios = async () => {
      setError('');
      try {
        const usuariosCol = collection(db, 'usuarios');
        const usuariosSnapshot = await getDocs(usuariosCol);
        const usuariosList = usuariosSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsuarios(usuariosList);
      } catch (err) {
        setError('Error cargando usuarios: ' + err.message);
      }
    };

    fetchUsuarios();
  }, []);

  const badgeColor = (rol) => {
    switch (rol) {
      case 'admin':
        return 'danger';
      case 'ventas':
        return 'success';
      case 'bodega':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  const usuariosFiltrados = usuarios.filter(user =>
    (user.username || user.id).toLowerCase().includes(busqueda.toLowerCase()) ||
    (user.rol || '').toLowerCase().includes(busqueda.toLowerCase())
  );

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
      <div className="container min-vh-100" style={{ paddingTop: '120px' }}>
        <h3 className="text-center mb-4 text-primary fw-bold">Usuarios Registrados</h3>

        {/* Buscador */}
        <div className="input-group mb-4">
          <span className="input-group-text" id="buscar-addon">
            <i className="fas fa-search"></i>
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nombre, ID o rol"
            aria-label="Buscar"
            aria-describedby="buscar-addon"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {!error && usuariosFiltrados.length === 0 && (
          <p>No se encontraron usuarios.</p>
        )}

        {/* Tarjetas de usuarios */}
        <div className="d-flex flex-wrap gap-3 justify-content-center">
          {usuariosFiltrados.map(user => (
            <div key={user.id} className="card shadow-sm p-3" style={{ display: 'inline-block', width: 'auto', minWidth: '200px' }}>
              <div className="card-body">
                <h5 className="card-title text-truncate" style={{ maxWidth: '300px' }}>
                  {user.username || user.id}
                </h5>
                <p className="card-text">
                  <span className={`badge bg-${badgeColor(user.rol)}`}>
                    {user.rol?.charAt(0).toUpperCase() + user.rol?.slice(1)}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="d-flex justify-content-center mt-4">
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Regresar
          </button>
        </div>
      </div>
    </>
  );
}

export default Mostrar;
