import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function ActualizacionManual() {
  const [opcion, setOpcion] = useState('');
  const navigate = useNavigate();

  // Estados para formularios
  const [producto, setProducto] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [fecha, setFecha] = useState('');
  const [factura, setFactura] = useState('');
  const [motivo, setMotivo] = useState('');
  const [observacion, setObservacion] = useState('');

  const handleSeleccion = (tipo) => {
    // Resetear estados al cambiar de opción
    setProducto('');
    setCantidad('');
    setProveedor('');
    setFecha('');
    setFactura('');
    setMotivo('');
    setObservacion('');
    setOpcion(tipo);
  };

  // Para inputs tipo number, convertir a entero o vacio
  const handleCantidadChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      setCantidad('');
      return;
    }
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 1) {
      setCantidad(num);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validar cantidad numérica mínima
    if (cantidad === '' || cantidad < 1) {
      alert('Por favor ingrese una cantidad válida (mayor o igual a 1).');
      return;
    }

    // Aquí procesar datos (por ahora solo console y alerta)
    console.log({
      opcion,
      producto,
      cantidad,
      proveedor,
      fecha,
      factura,
      motivo,
      observacion,
    });
    alert('Formulario enviado con éxito');

    // Limpiar formulario y volver a opciones
    setOpcion('');
    setProducto('');
    setCantidad('');
    setProveedor('');
    setFecha('');
    setFactura('');
    setMotivo('');
    setObservacion('');
  };

  // Handler para cerrar sesión (vacío, lo puedes adaptar)
  const handleCerrarSesion = () => {
    alert('Cerrar sesión');
    // Aquí lógica de cerrar sesión real
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
                <button
                  type="button"
                  className="btn btn-outline-danger mt-3"
                  onClick={handleCerrarSesion}
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <div className="container py-5" style={{ paddingTop: '90px' }}>
        <h2 className="text-center mb-4 text-primary fw-bold">
          <i className="bi bi-pencil-square me-2"></i> Actualización Manual de Inventario
        </h2>

        {/* TARJETAS - OPCIONES */}
        {!opcion && (
          <>
            <div className="row justify-content-center gap-4">
              <div
                className="col-md-3 card text-center shadow-sm"
                onClick={() => handleSeleccion('compra')}
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
                onClick={() => handleSeleccion('venta')}
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
                onClick={() => handleSeleccion('ajuste')}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-body">
                  <i className="bi bi-tools display-4 text-warning mb-3"></i>
                  <h5 className="card-title">Ajuste Manual</h5>
                  <p className="card-text text-muted">Salida por pérdida, vencimiento u otro motivo.</p>
                </div>
              </div>
            </div>

            {/* Botón para volver a Inventario principal */}
            <div className="text-center mt-4">
              <button
                className="btn btn-outline-secondary"
                onClick={() => navigate('/inventario')}
              >
                <i className="bi bi-arrow-left me-2"></i> Volver a Inventario
              </button>
            </div>
          </>
        )}

        {/* FORMULARIOS */}
        {opcion && (
          <>
            <div
              className="scroll-container card shadow-lg p-4 mt-5"
              style={{
                maxHeight: '75vh',
                overflowY: 'auto',
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '1.5rem',
              }}
            >
              {opcion === 'compra' && (
                <>
                  <h4 className="text-success mb-4 fw-bold">
                    Formulario: Devolución de Compra
                  </h4>
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
                        <label className="form-label fw-semibold">Cantidad a devolver</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Ej. 5"
                          value={cantidad}
                          onChange={handleCantidadChange}
                          required
                          min={1}
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
                        <label className="form-label fw-semibold">Motivo</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          placeholder="Describa el motivo de la devolución"
                          value={motivo}
                          onChange={(e) => setMotivo(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="d-flex justify-content-between mt-4">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setOpcion('')}
                      >
                        <i className="bi bi-arrow-left me-2"></i> Volver a opciones
                      </button>
                      <button type="submit" className="btn btn-success">
                        Guardar Devolución
                      </button>
                    </div>
                  </form>
                </>
              )}

              {opcion === 'venta' && (
                <>
                  <h4 className="text-danger mb-4 fw-bold">Formulario: Devolución de Venta</h4>
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
                        <label className="form-label fw-semibold">Cantidad a devolver</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Ej. 3"
                          value={cantidad}
                          onChange={handleCantidadChange}
                          required
                          min={1}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Factura</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Número de factura"
                          value={factura}
                          onChange={(e) => setFactura(e.target.value)}
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
                        <label className="form-label fw-semibold">Motivo</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          placeholder="Describa el motivo de la devolución"
                          value={motivo}
                          onChange={(e) => setMotivo(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="d-flex justify-content-between mt-4">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setOpcion('')}
                      >
                        <i className="bi bi-arrow-left me-2"></i> Volver a opciones
                      </button>
                      <button type="submit" className="btn btn-danger">
                        Guardar Devolución
                      </button>
                    </div>
                  </form>
                </>
              )}

              {opcion === 'ajuste' && (
                <>
                  <h4 className="text-warning mb-4 fw-bold">Formulario: Ajuste Manual</h4>
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
                        <label className="form-label fw-semibold">Cantidad a descontar</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Ej. 2"
                          value={cantidad}
                          onChange={handleCantidadChange}
                          required
                          min={1}
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
                          placeholder="Describa el motivo o detalle del ajuste"
                          value={observacion}
                          onChange={(e) => setObservacion(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="d-flex justify-content-between mt-4">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setOpcion('')}
                      >
                        <i className="bi bi-arrow-left me-2"></i> Volver a opciones
                      </button>
                      <button type="submit" className="btn btn-warning">
                        Guardar Ajuste
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
