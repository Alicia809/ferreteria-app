import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useAuth } from '../../components/AuthContext';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export default function ListadoReabastecimientos() {
  const { logout, nombre, rol } = useAuth();
  const navigate = useNavigate();

  const [reabastecimientos, setReabastecimientos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtrados, setFiltrados] = useState([]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    const fetchReabastecimientos = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'reabastecimientos'));
        // Enriquecer con nombres y formatear fechas
        const lista = await Promise.all(snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();

          // Obtener nombre proveedor
          let nombreProveedor = 'Desconocido';
          if (data.proveedorId) {
            const provSnap = await getDoc(doc(db, 'proveedores', data.proveedorId));
            if (provSnap.exists()) {
              nombreProveedor = provSnap.data().nombreX || 'Desconocido';
            }
          }

          // Obtener nombre producto
          let nombreProducto = 'Desconocido';
          if (data.productoId) {
            const prodSnap = await getDoc(doc(db, 'productos', data.productoId));
            if (prodSnap.exists()) {
              nombreProducto = prodSnap.data().nombreY || 'Desconocido';
            }
          }

          // Formatear fechas (timestamps Firestore)
          let fechaInput = '';
          if (data.fecha && data.fecha.seconds) {
            fechaInput = new Date(data.fecha.seconds * 1000).toLocaleDateString();
          }

          let fechaRegistro = '';
          if (data.fechaRegistro && data.fechaRegistro.seconds) {
            fechaRegistro = new Date(data.fechaRegistro.seconds * 1000).toLocaleString();
          }

          return {
            id: docSnap.id,
            ...data,
            nombreProveedor,
            nombreProducto,
            fechaInput,
            fechaRegistro,
          };
        }));
        setReabastecimientos(lista);
        setFiltrados(lista);
      } catch (error) {
        console.error('Error al obtener reabastecimientos:', error);
      }
    };
    fetchReabastecimientos();
  }, []);

  useEffect(() => {
    const filtro = reabastecimientos.filter(item =>
      item.nombreProveedor.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.nombreProducto.toLowerCase().includes(busqueda.toLowerCase()) ||
      (item.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ?? false) ||
      (item.usuario?.toLowerCase().includes(busqueda.toLowerCase()) ?? false) ||
      (item.numeroFactura?.toLowerCase().includes(busqueda.toLowerCase()) ?? false) ||
      (item.registroCAI?.toLowerCase().includes(busqueda.toLowerCase()) ?? false) ||
      (item.fechaInput?.toLowerCase().includes(busqueda.toLowerCase()) ?? false)
    );
    setFiltrados(filtro);
  }, [busqueda, reabastecimientos]);

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
      <div
        className="flex-grow-1 d-flex flex-column align-items-center pt-5"
        style={{ marginTop: '80px', padding: '2rem', overflowY: 'auto', width: '100%' }}
      >
        <h2 className="text-center mb-4 text-primary fw-bold">
          <i className="fas fa-history me-2"></i> Historial de Reabastecimientos
        </h2>

        {/* Buscador */}
        <div className="input-group mb-4" style={{ maxWidth: '900px' }}>
          <span className="input-group-text"><i className="fas fa-search"></i></span>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por proveedor, producto, usuario, factura, CAI, fecha o descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* Tabla */}
        <div className="table-responsive" style={{ maxHeight: '65vh', width: '100%' }}>
          <table className="table table-hover table-striped table-bordered">
            <thead className="table-primary text-center">
              <tr>
                <th>Proveedor</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Fecha (Input)</th>
                <th>Número Factura</th>
                <th>Registro CAI</th>
                <th>Descripción</th>
                <th>Usuario</th>
                {/* <th>Fecha Registro</th> */}
              </tr>
            </thead>
            <tbody>
              {filtrados.length > 0 ? (
                filtrados.map((item) => (
                  <tr key={item.id}>
                    <td>{item.nombreProveedor}</td>
                    <td>{item.nombreProducto}</td>
                    <td className="text-center">{item.cantidad}</td>
                    <td className="text-center">{item.fechaInput}</td>
                    <td>{item.numeroFactura}</td>
                    <td>{item.registroCAI}</td>
                    <td>{item.descripcion}</td>
                    <td>{item.usuario}</td>
                    {/* <td>{item.fechaRegistro}</td> */}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center text-muted">
                    No se encontraron reabastecimientos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <button
          className="btn btn-secondary mt-4"
          onClick={() => navigate('/inventario')}
        >
          <i className="bi bi-arrow-left me-1"></i> Volver a Inventario
        </button>
      </div>
    </div>
  );
}
