import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useAuth } from '../../components/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

export default function RegistroFacturas() {
  const { logout, nombre, rol } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const [facturas, setFacturas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [facturasFiltradas, setFacturasFiltradas] = useState([]);

  useEffect(() => {
    const fetchFacturas = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'facturas'));
        const lista = snapshot.docs.map(doc => ({ idDoc: doc.id, ...doc.data() }));
        setFacturas(lista);
        setFacturasFiltradas(lista);
      } catch (error) {
        console.error('Error al obtener facturas:', error);
      }
    };
    fetchFacturas();
  }, []);

  useEffect(() => {
    const resultado = facturas.filter(f =>
      f.id?.toLowerCase().includes(busqueda.toLowerCase()) ||
      f.numeroFactura?.toLowerCase().includes(busqueda.toLowerCase()) ||
      f.usuarioEncargado?.toLowerCase().includes(busqueda.toLowerCase())
    );
    setFacturasFiltradas(resultado);
  }, [busqueda, facturas]);

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

      {/* CONTENIDO */}
      <div className="flex-grow-1 d-flex flex-column align-items-center pt-5" style={{ marginTop: '80px', padding: '2rem', overflowY: 'auto' }}>
        {/* Buscador */}
        <div className="input-group mb-4" style={{ maxWidth: '600px' }}>
          <span className="input-group-text"><i className="fas fa-search"></i></span>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por ID, número de factura o usuario..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* Tabla de facturas */}
        <div className="table-responsive" style={{ maxHeight: '65vh', width: '100%' }}>
          <table className="table table-hover table-striped table-bordered">
            <thead className="table-primary text-center">
              <tr>
                <th>ID</th>
                <th>Número Factura</th>
                <th>Fecha</th>
                <th>Identificación</th>
                <th>Tipo ID</th>
                <th>Usuario Encargado</th>
                <th>Subtotal</th>
                <th>ISV</th>
                <th>Total</th>
                <th>Productos</th>
                <th>Descuentos</th> {/* NUEVA COLUMNA */}
              </tr>
            </thead>
            <tbody>
              {facturasFiltradas.length > 0 ? (
                facturasFiltradas.map((factura) => (
                  <tr key={factura.idDoc}>
                    <td>{factura.id}</td>
                    <td>{factura.numeroFactura}</td>
                    <td>{factura.fecha}</td>
                    <td>{factura.identificacion}</td>
                    <td>{factura.tipoIdent}</td>
                    <td>{factura.usuarioEncargado}</td>
                    <td>L {parseFloat(factura.subtotalFactura || 0).toFixed(2)}</td>
                    <td>L {parseFloat(factura.impuestos?.isv || 0).toFixed(2)}</td>
                    <td>L {parseFloat(factura.total || 0).toFixed(2)}</td>
                    <td>
                      {factura.productos?.map((p, i) => (
                        <div key={i}>
                          {p.idProducto} - L {p.subtotal}
                        </div>
                      ))}
                    </td>                    
                    <td>
                    {factura.descuentos?.map((d, i) => (
                        <div key={i}>
                        {d.nombre} ({d.porcentaje}%) - L {parseFloat(d.monto || 0).toFixed(2)}
                        </div>
                    ))}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center text-muted">
                    No se encontraron facturas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Link to="/facturacion" className="btn btn-secondary mt-4">
          <i className="bi bi-arrow-left me-1"></i> Volver a Facturación
        </Link>
      </div>
    </div>
  );
}
