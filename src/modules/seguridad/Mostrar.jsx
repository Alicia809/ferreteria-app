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
  const { logout, nombre } = useAuth();
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

  const usuariosFiltrados = usuarios.filter(user =>
    (user.username || user.id).toLowerCase().includes(busqueda.toLowerCase()) ||
    (user.rol || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar bg-body-tertiary fixed-top">
        <div className="container-fluid">
          {/* Logo */}
          <a className="navbar-brand d-flex align-items-center gap-2">
            <img src="/Logo.png" alt="Logo" height="60" />
            <span>Comercial Mateo</span>
          </a>

          {/* Usuario + Botón Sidebar */}
          <div className="d-flex align-items-center gap-4">
            <span>{nombre  || 'Usuario'}</span>
            <img
              src="/avatar.png"
              alt="Avatar"
              className="rounded-circle"
              height="40"
              width="40"
            />

            {/* Botón del sidebar */}
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
          </div>
          <div className="offcanvas offcanvas-end custom-offcanvas" tabIndex="-1" id="offcanvasNavbar">
            <div className="offcanvas-header">
              <button className="btn-close custom-close-btn" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body">
              <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
                <li className="nav-item"><Link to="/reportes" className="nav-link menu-link"><i className="fas fa-chart-line me-2"></i> REPORTES</Link></li>
                <li className="nav-item"><Link to="/facturacion" className="nav-link menu-link"><i className="fas fa-file-invoice-dollar me-2"></i> FACTURACIÓN</Link></li>
                <li className="nav-item"><Link to="/inventario" className="nav-link menu-link"><i className="fas fa-boxes me-2"></i> INVENTARIO</Link></li>
                <li className="nav-item"><Link to="/proveedores" className="nav-link menu-link"><i className="fas fa-truck me-2"></i> PROVEEDORES</Link></li>
                <li className="nav-item"><Link to="/seguridad" className="nav-link menu-link"><i className="fas fa-user-shield me-2"></i> SEGURIDAD</Link></li>
              </ul>
              <div>
                <button className="btn btn-outline-danger mt-3" onClick={handleLogout}>Cerrar Sesión</button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <div className="container min-vh-100" style={{ paddingTop: '120px' }}>

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
        <div className="d-flex flex-wrap gap-4 justify-content-center">
          {usuariosFiltrados.map(user => (
            <div
              key={user.id}
              className="card shadow-sm p-4"
              style={{
                width: '220px',
                minHeight: '180px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderRadius: '12px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s ease-in-out',
                cursor: 'default',
                backgroundColor: '#fff',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <div>
                <h5
                  className="card-title text-truncate"
                  style={{ maxWidth: '100%', fontWeight: '600', color: '#333' }}
                  title={user.username || user.id}
                >
                  {user.username || user.id}
                </h5>

                
                <p
                  className="card-text text-muted"
                  style={{
                    fontSize: '0.85rem',
                    borderTop: '1px solid #e9ecef',
                    paddingTop: '8px',
                    marginBottom: '5',
                    color: '#6c757d',
                    fontWeight: '500',
                  }}
                >
                  Rol: <strong>{user.rol?.charAt(0).toUpperCase() + user.rol?.slice(1)}</strong>
                </p>
                

                <p className="card-text mb-3">
                  <span
                    className={`badge`}
                    style={{
                      backgroundColor: user.activo ? '#198754' : '#dc3545',
                      fontWeight: '600',
                      padding: '6px 12px',
                      fontSize: '0.85rem',
                      borderRadius: '15px',
                    }}
                  >
                    {user.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </p>
              </div>



              <p
                className="card-text text-muted"
                style={{
                  fontSize: '0.85rem',
                  borderTop: '1px solid #e9ecef',
                  paddingTop: '8px',
                  marginBottom: '0',
                  color: '#6c757d',
                  fontWeight: '500',
                }}
              >
                Creado por: <strong>{user.nombreCreador || 'Desconocido'}</strong> el día {user.fechaCreado || 'Desconocido'}
              </p>
              <p
                className="card-text text-muted"
                style={{
                  fontSize: '0.85rem',
                  borderTop: '1px solid #e9ecef',
                  paddingTop: '8px',
                  marginBottom: '0',
                  color: '#6c757d',
                  fontWeight: '500',
                }}
              >
                Editado por: <strong>{user.nombreEditor || 'Desconocido'}</strong> el día <strong>{user.fechaEditado || 'Desconocido'}</strong>
              </p>
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
