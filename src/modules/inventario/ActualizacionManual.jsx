// src/pages/ActualizacionManual.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../../components/AuthContext';

export default function ActualizacionManual() {
  const navigate = useNavigate();

  const handleRedireccion = (ruta) => {
    navigate(ruta);
  };
  const {logout,nombre } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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

      {/* TARJETAS */}
      <div className="container py-5" style={{ paddingTop: '90px' }}>
        <h2 className="text-center mb-4 text-primary fw-bold">
          <i className="bi bi-pencil-square me-2"></i> Actualización Manual de Inventario
        </h2>

        <div className="row justify-content-center gap-4">
          <div
            className="col-md-3 card text-center shadow-sm"
            onClick={() => handleRedireccion('/inventario/actualizacion/compra')}
            style={{ cursor: 'pointer' }}
          >
            <div className="card-body">
              <i className="bi bi-box-arrow-in-left display-4 text-success mb-3"></i>
              <h5 className="card-title">Devolución de Compra</h5>
              <p className="card-text text-muted">Registrar devolución a proveedor.</p>
            </div>
          </div>
          <div
            className="col-md-3 card text-center shadow-sm"
            onClick={() => handleRedireccion('/inventario/actualizacion/venta')}
            style={{ cursor: 'pointer' }}
          >
            <div className="card-body">
              <i className="bi bi-box-arrow-up-right display-4 text-danger mb-3"></i>
              <h5 className="card-title">Devolución de Venta</h5>
              <p className="card-text text-muted">Registrar devolución de cliente.</p>
            </div>
          </div>
          <div
            className="col-md-3 card text-center shadow-sm"
            onClick={() => handleRedireccion('/inventario/actualizacion/ajuste')}
            style={{ cursor: 'pointer' }}
          >
            <div className="card-body">
              <i className="bi bi-tools display-4 text-warning mb-3"></i>
              <h5 className="card-title">Ajuste Manual</h5>
              <p className="card-text text-muted">Salida por pérdida, vencimiento u otro motivo.</p>
            </div>
          </div>
          <div
            className="col-md-3 card text-center shadow-sm"
            onClick={() => handleRedireccion('/inventario/actualizacion/ajustesRealizados')}
            style={{ cursor: 'pointer' }}
          >
            <div className="card-body">
              <i className="bi bi-list-ul display-4 text-info mb-3"></i>
              <h5 className="card-title">Listado Ajustes Manuales</h5>
              <p className="card-text text-muted">Ver historial de ajustes realizados.</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-4">
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate('/inventario')}
          >
            <i className="bi bi-arrow-left me-2"></i> Volver a Inventario
          </button>
        </div>
      </div>
    </>
  );
}
