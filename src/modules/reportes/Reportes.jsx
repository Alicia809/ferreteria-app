// src/modules/reportes/Reportes.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../../App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { useAuth } from '../../components/AuthContext';

export default function Reportes() {
  const { logout, nombre } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  const cards = [
    { to: "/reportes/ventas", icon: "fa-file-invoice-dollar", title: "Reportes de Ventas", desc: "Tendencias, ingresos y ticket promedio." },
    { to: "/reportes/inventario", icon: "fa-boxes", title: "Reportes de Inventario", desc: "Stock, valor y alertas." },
    { to: "/reportes/productos", icon: "fa-chart-pie", title: "Reportes de Productos", desc: "Top, margen y rotación." },
    { to: "/reportes/compras", icon: "fa-truck-loading", title: "Reportes de Compras", desc: "Reabastecimientos y proveedores." },
  ];

  return (
    <div className="d-flex flex-column vh-100 overflow-auto">
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

      {/* CONTENIDO */}
      <div className="container" style={{ marginTop: 100, marginBottom: 40 }}>
        {/* Descripción general del módulo */}
        <div className="text-center mb-5">
          <h4 className="fw-bold">Módulo de Reportes</h4>
          <p className="text-muted">
            El módulo de reportes proporciona información clave sobre ventas, inventario, productos y compras. 
            Permite analizar tendencias, controlar existencias, identificar los artículos más vendidos y 
            optimizar la relación con proveedores, facilitando una toma de decisiones basada en datos reales.
          </p>
        </div>

        <div className="row g-4">
          {cards.map((c) => (
            <div className="col-12 col-md-6 col-xl-3" key={c.to}>
              <Link to={c.to} className="text-decoration-none">
                <div className="card shadow-sm h-100">
                  <div className="card-body text-center">
                    <i className={`fas ${c.icon}`} style={{ fontSize: 40, color: "#1a73e8" }} />
                    <h5 className="mt-3">{c.title}</h5>
                    <p className="text-muted mb-0">{c.desc}</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
