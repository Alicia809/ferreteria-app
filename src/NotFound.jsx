import React from 'react';
import { Link } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useAuth } from './components/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const { logout, nombre, rol } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="d-flex flex-column vh-100 overflow-hidden">
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
                {(rol === 'admin' || rol === 'ventas' || rol === 'bodega')&&(
                  <li className="nav-item"><Link to="/reportes" className="nav-link menu-link"><i className="fas fa-chart-line me-2"></i> REPORTES</Link></li>
                )}
                {(rol === 'admin' || rol === 'ventas')&&(
                  <li className="nav-item"><Link to="/facturacion" className="nav-link menu-link"><i className="fas fa-file-invoice-dollar me-2"></i> FACTURACIÓN</Link></li>
                )}
                {(rol === 'admin' || rol === 'bodega')&&(
                  <li className="nav-item"><Link to="/inventario" className="nav-link menu-link"><i className="fas fa-boxes me-2"></i> INVENTARIO</Link></li>
                )}
                {(rol === 'admin' || rol === 'bodega')&&(
                  <li className="nav-item"><Link to="/proveedores" className="nav-link menu-link"><i className="fas fa-truck me-2"></i> PROVEEDORES</Link></li>
                )}
                {(rol === 'admin' || rol === 'ventas' || rol === 'bodega')&&(
                  <li className="nav-item"><Link to="/seguridad" className="nav-link menu-link"><i className="fas fa-user-shield me-2"></i> SEGURIDAD</Link></li>
                )}
              </ul>
              <div>
                <button className="btn btn-outline-danger mt-3" onClick={handleLogout}>Cerrar Sesión</button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div 
        className="flex-grow-1 d-flex flex-column justify-content-center align-items-center text-center" 
        style={{ marginTop: '80px', padding: '20px' }}
      >
        <img 
          src="/page-unavailable.png" 
          alt="Página no disponible" 
          style={{ width: '200px', marginBottom: '20px' }}
        />

        <h1 className="fw-bold">🚫 Página No Disponible</h1>

        <p className="mt-3 text-muted" style={{ maxWidth: '500px' }}>
          La página a la que intentas acceder no está disponible en este momento.  
          Verifica la dirección o regresa a una sección disponible.
        </p>

        <div className="d-flex gap-3 mt-4">
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            <i className="fas fa-home me-2"></i> Volver al Inicio
          </button>
        </div>
      </div>      
    </div>
  );
}
