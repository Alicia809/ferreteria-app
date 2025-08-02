import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function ReabastecerStock() {
  const navigate = useNavigate();

  const [producto, setProducto] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [fecha, setFecha] = useState('');
  const [observacion, setObservacion] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ producto, cantidad, proveedor, fecha, observacion });
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
                  <Link to="/seguridad" className="nav-link menu-link">
                    <i className="fas fa-user-shield me-2"></i> SEGURIDAD
                  </Link>
                </li>
              </ul>
              <div>
                <button type="button" className="btn btn-outline-danger mt-3">
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* FRANJA DE SEPARACIÓN */}
      <div style={{ height: '50px', backgroundColor: '#f8f9fa' }} />

      {/* CONTENIDO DEL FORMULARIO */}
      <div className="container d-flex justify-content-center align-items-start" style={{ paddingTop: '0', minHeight: '80vh' }}>
        <div
          style={{
            backgroundColor: '#f8f9fa',
            padding: '2rem',
            borderRadius: '12px',
            maxWidth: '700px',
            width: '100%',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          }}
        >
          <div
            className="scroll-container"
            style={{
              maxHeight: '75vh',
              overflowY: 'auto',
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '1.5rem',
            }}
          >
            <h2 className="text-center text-primary mb-4" style={{ fontWeight: '700' }}>
              <i className="bi bi-arrow-repeat me-2"></i>Reabastecer Stock
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Producto</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nombre del producto"
                    value={producto}
                    onChange={(e) => setProducto(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Cantidad</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Ej. 100"
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Proveedor</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nombre del proveedor"
                    value={proveedor}
                    onChange={(e) => setProveedor(e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Fecha</label>
                  <input
                    type="date"
                    className="form-control"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Observación</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Detalles adicionales"
                    value={observacion}
                    onChange={(e) => setObservacion(e.target.value)}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-between mt-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => navigate(-1)}
                >
                  <i className="bi bi-arrow-left me-1"></i>Volver
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-check2-circle me-1"></i>Guardar reabastecimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Scrollbar styles for WebKit browsers */}
      <style>{`
        .scroll-container::-webkit-scrollbar {
          width: 8px;
        }
        .scroll-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 12px;
        }
        .scroll-container::-webkit-scrollbar-thumb {
          background-color: #0d6efd;
          border-radius: 12px;
        }
        .scroll-container::-webkit-scrollbar-thumb:hover {
          background-color: #084298;
        }
      `}</style>
    </>
  );
}
