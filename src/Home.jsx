import React from 'react';
import { Link } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useAuth } from './components/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const {logout, nombre, rol } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  const navigate = useNavigate();

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

      {/* CARRUSEL CON FADE IN */}
      <div
        id="homeCarousel"
        className="carousel slide carousel-fade flex-grow-1"
        data-bs-ride="carousel"
        style={{
          marginTop: '80px',
          height: 'calc(100vh - 80px)', // ← Esto es clave: alto fijo
          overflow: 'hidden', // Evita desbordamiento
        }}
      >
        {/* Indicadores */}
        <div className="carousel-indicators">
          <button
            type="button"
            data-bs-target="#homeCarousel"
            data-bs-slide-to="0"
            className="active bg-dark"
            aria-current="true"
            aria-label="Slide 1"
          ></button>
          <button
            type="button"
            data-bs-target="#homeCarousel"
            data-bs-slide-to="1"
            className="bg-dark"
            aria-label="Slide 2"
          ></button>
          <button
            type="button"
            data-bs-target="#homeCarousel"
            data-bs-slide-to="2"
            className="bg-dark"
            aria-label="Slide 3"
          ></button>
        </div>

        {/* Slides */}
        <div className="carousel-inner h-100">
          {/* Slide 1*/}
          <div
            className="carousel-item active h-100 d-flex align-items-center justify-content-center text-white"
            style={{
              backgroundImage: 'url(/carrusel/a1.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              height: '100%',
            }}
          >
            <div
              className="text-center px-4 py-5"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                borderRadius: '12px',
                maxWidth: '800px',
                backdropFilter: 'blur(4px)',
              }}
            >
              <h1 className="fw-bold mb-3 display-4" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.7)' }}>
                Bienvenido a
              </h1>
              <h2 className="fw-bold mb-3 display-5 text-warning" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.8)' }}>
                Comercial y Ferretería Mateo
              </h2>
              <p className="lead mb-0" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.6)' }}>
                ¡Donde encuentras todo para la construcción!
              </p>
            </div>
          </div>

          {/* Slide 2 */}
          <div
            className="carousel-item h-100 d-flex align-items-center justify-content-center text-white"
            style={{
              backgroundImage: 'url(/carrusel/a2.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              height: '100%',
            }}
          >
            <div
              className="text-center px-4"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', borderRadius: '12px', padding: '2rem' }}
            >
              <h2 className="fw-bold display-5 mb-3" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.6)' }}>
                Calidad en cada herramienta
              </h2>
              <p className="lead mb-4" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.6)' }}>
                Productos seleccionados para profesionales y hogares.
              </p>
            </div>
          </div>

          {/* Slide 3: Inventario */}
          <div
            className="carousel-item h-100 d-flex align-items-center justify-content-center text-white"
            style={{
              backgroundImage: 'url(/carrusel/a3.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              height: '100%',
            }}
          >
            <div
              className="text-center px-4"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', borderRadius: '12px', padding: '2rem' }}
            >
              <h2 className="fw-bold display-5 mb-3" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.6)' }}>
                Tu ferretería de confianza
              </h2>
              <p className="lead mb-4" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.6)' }}>
                Sirviendo a la comunidad con calidad y compromiso.
              </p>
            </div>
          </div>
        </div>

        {/* Controles */}
        <button className="carousel-control-prev" type="button" data-bs-target="#homeCarousel" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Anterior</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#homeCarousel" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Siguiente</span>
        </button>
      </div>
    </div>
  );
}