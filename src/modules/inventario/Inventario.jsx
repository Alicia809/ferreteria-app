import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useAuth } from '../../components/AuthContext';

export default function Inventario() {
  const navigate = useNavigate();

  const {logout,nombre } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="d-flex flex-column vh-100 overflow-auto">
      {/* NAVBAR con menú */}
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
      <div className="container mt-5 pt-5" style={{ paddingTop: '120px' }}>
        
        {/* TARJETAS */}
        <div className="row justify-content-center g-4">
          <div
            className="col-md-4"
            onClick={() => navigate('/inventario/nuevo')}
            style={{ cursor: 'pointer' }}
          >
            <div className="card text-center shadow-sm h-100 tarjeta-pequena">
              <div className="card-body">
                <i className="fas fa-plus fa-2x text-primary mb-3"></i>
                <h5 className="card-title">Registrar nuevo producto</h5>
                <p className="card-text">Agrega productos que aún no existen en el inventario.</p>
              </div>
            </div>
          </div>

          <div
            className="col-md-4"
            onClick={() => navigate('/inventario/actualizacion')}
            style={{ cursor: 'pointer' }}
          >
            <div className="card text-center shadow-sm h-100">
              <div className="card-body">
                <i className="fas fa-edit fa-2x text-warning mb-3"></i>
                <h5 className="card-title">Actualización manual</h5>
                <p className="card-text">Modifica cantidades específicas del inventario.</p>
              </div>
            </div>
          </div>

          <div
            className="col-md-4"
            onClick={() => navigate('/inventario/reabastecer')}
            style={{ cursor: 'pointer' }}
          >
            <div className="card text-center shadow-sm h-100">
              <div className="card-body">
                <i className="fas fa-box-open fa-2x text-success mb-3"></i>
                <h5 className="card-title">Reabastecer stock</h5>
                <p className="card-text">Agrega unidades a productos existentes.</p>
              </div>
            </div>
          </div>
        </div>
        {/* Segunda fila de tarjetas */}
        <div className="row justify-content-center g-4 mt-2">
          <div
            className="col-md-4"
            onClick={() => navigate('/proveedores')}
            style={{ cursor: 'pointer' }}
          >
            <div className="card text-center shadow-sm h-100">
              <div className="card-body">
                <i className="fas fa-truck fa-2x text-secondary mb-3"></i>
                <h5 className="card-title">Proveedores</h5>
                <p className="card-text">Gestiona los proveedores.</p>
              </div>
            </div>
          </div>

          <div
            className="col-md-4"
            onClick={() => navigate('/productos')}
            style={{ cursor: 'pointer' }}
          >
            <div className="card text-center shadow-sm h-100">
              <div className="card-body">
                <i className="fas fa-th-large fa-2x text-info mb-3"></i>
                <h5 className="card-title">Catálogo</h5>
                <p className="card-text">Explora los productos.</p>
              </div>
            </div>
          </div>
          <div
            className="col-md-4"
            onClick={() => navigate('/inventario/reabastecer/historialStocks')}
            style={{ cursor: 'pointer' }}
          >
            <div className="card text-center shadow-sm h-100">
              <div className="card-body">
                <i className="fas fa-history fa-2x text-dark mb-3"></i>
                <h5 className="card-title">Historial Reabastecimientos</h5>
                <p className="card-text">Consulta el historial de reabastecimientos realizados.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
