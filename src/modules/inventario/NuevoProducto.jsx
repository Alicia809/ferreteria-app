import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function NuevoProducto() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('');
  const [unidadMedida, setUnidadMedida] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [productoId, setProductoId] = useState('');

  const generarIdProducto = () => {
    if (!nombre || !categoria) return '';
    const nom = nombre.trim().substring(0, 3).toUpperCase();
    const cat = categoria.trim().substring(0, 3).toUpperCase();
    const num = Date.now().toString().slice(-3);
    return `${cat}-${nom}-${num}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = generarIdProducto();
    setProductoId(id);
    console.log({ id, nombre, descripcion, categoria, unidadMedida, cantidad });
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

      {/* CONTENIDO DEL FORMULARIO */}
      <div
        className="container d-flex justify-content-center align-items-start"
        style={{ paddingTop: '100px', minHeight: '80vh', backgroundColor: '#f8f9fa' }}
      >
        <div
          style={{
            maxHeight: '75vh',
            overflowY: 'auto',
            padding: '2.5rem',
            maxWidth: '600px',
            width: '100%',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            borderRadius: '12px',
            backgroundColor: 'white',
          }}
          className="scroll-container"
        >
          <h2 className="text-center text-primary mb-4" style={{ fontWeight: '700' }}>
            <i className="bi bi-box-seam me-2"></i>Registrar Nuevo Producto
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Nombre del producto</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej. Tornillo Phillips"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Categoría</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej. Tornillería"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Descripción</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Descripción detallada del producto"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Unidad de medida</label>
                <select
                  className="form-select"
                  value={unidadMedida}
                  onChange={(e) => setUnidadMedida(e.target.value)}
                  required
                >
                  <option value="">Seleccionar unidad</option>
                  <option value="unidad">Unidad</option>
                  <option value="metro">Metro</option>
                  <option value="litro">Litro</option>
                  <option value="kilo">Kilo</option>
                  <option value="paquete">Paquete</option>
                  <option value="rollo">Rollo</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Cantidad inicial</label>
                <input
                  type="number"
                  className="form-control"
                  min={0}
                  placeholder="0"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  required
                />
              </div>

              {productoId && (
                <div className="col-12">
                  <div className="alert alert-info mt-3" role="alert">
                    <i className="bi bi-info-circle me-2"></i>
                    <strong>ID generado:</strong> {productoId}
                  </div>
                </div>
              )}
            </div>

            <div className="d-flex justify-content-between mt-4">
              <Link to="/inventario" className="btn btn-outline-secondary">
                <i className="bi bi-arrow-left me-1"></i>Volver
              </Link>
              <button type="submit" className="btn btn-primary">
                <i className="bi bi-check2-circle me-1"></i>Registrar producto
              </button>
            </div>
          </form>
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
