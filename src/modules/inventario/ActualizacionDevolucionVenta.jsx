// src/pages/DevolucionVenta.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function ActualizacionDevolucionVenta() {
  const [producto, setProducto] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [factura, setFactura] = useState('');
  const [fecha, setFecha] = useState('');
  const [motivo, setMotivo] = useState('');
  const navigate = useNavigate();

  const handleCantidadChange = (e) => {
    const val = e.target.value;
    if (val === '') return setCantidad('');
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 1) setCantidad(num);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cantidad === '' || cantidad < 1) {
      alert('Por favor ingrese una cantidad válida (mayor o igual a 1).');
      return;
    }

    console.log({ producto, cantidad, factura, fecha, motivo });
    alert('Formulario enviado con éxito');
    navigate('/actualizacion-manual');
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
                  onClick={() => alert('Cerrar sesión')}
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container pt-5 mt-5">
        <div className="card shadow-lg p-4">
          <h4 className="text-danger mb-4 fw-bold">Formulario: Devolución de Venta</h4>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Producto</label>
                <input type="text" className="form-control" value={producto} onChange={(e) => setProducto(e.target.value)} required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Cantidad a devolver</label>
                <input type="number" className="form-control" value={cantidad} onChange={handleCantidadChange} required min={1} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Factura</label>
                <input type="text" className="form-control" value={factura} onChange={(e) => setFactura(e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Fecha</label>
                <input type="date" className="form-control" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold">Motivo</label>
                <textarea className="form-control" rows="3" value={motivo} onChange={(e) => setMotivo(e.target.value)} required />
              </div>
            </div>
            <div className="d-flex justify-content-between mt-4">
              <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/inventario/actualizacion')}>
                <i className="bi bi-arrow-left me-2"></i> Volver
              </button>
              <button type="submit" className="btn btn-danger">Guardar Devolución</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
