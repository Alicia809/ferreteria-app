import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaUserPlus, FaUserEdit, FaUserTimes, FaFileAlt, FaFileInvoiceDollar, FaUndoAlt  } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

export default function FacturaCliente() {
  const { logout } = useAuth();
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
          <a className="navbar-brand d-flex align-items-center gap-2">
            <img src="/Logo.png" alt="Logo" height="60" />
            <span>Comercial Mateo</span>
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="offcanvas offcanvas-end custom-offcanvas" tabIndex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
            <div className="offcanvas-header">
              <button type="button" className="btn-close custom-close-btn" data-bs-dismiss="offcanvas" aria-label="Close"></button>
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
                <button type="button" className="btn btn-outline-danger mt-3" onClick={handleLogout}>
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* CONTENIDO CENTRADO */}
      <div className="flex-grow-1 d-flex justify-content-center align-items-center" style={{ marginTop: '80px' }}>
        <h1 className="text-center">Bienvenido al Sistema de Comercial Mateo</h1>
      </div>
    </div>
  );
}
