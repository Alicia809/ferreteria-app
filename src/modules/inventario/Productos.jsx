import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useAuth } from '../../components/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

export default function Productos() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [productosFiltrados, setProductosFiltrados] = useState([]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const productosSnapshot = await getDocs(collection(db, 'productos'));
        const listaProductos = productosSnapshot.docs.map(doc => doc.data());
        setProductos(listaProductos);
        setProductosFiltrados(listaProductos); // inicializar
      } catch (error) {
        console.error('Error al obtener productos:', error);
      }
    };
    fetchProductos();
  }, []);

  useEffect(() => {
    const resultado = productos.filter(p =>
      p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.id?.toLowerCase().includes(busqueda.toLowerCase())
    );
    setProductosFiltrados(resultado);
  }, [busqueda, productos]);

  return (
    <div className="d-flex flex-column vh-100 overflow-hidden">
      {/* NAVBAR */}
      <nav className="navbar bg-body-tertiary fixed-top">
        <div className="container-fluid">
          <a className="navbar-brand d-flex align-items-center gap-2">
            <img src="/Logo.png" alt="Logo" height="60" />
            <span>Comercial Mateo</span>
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="offcanvas offcanvas-end" id="offcanvasNavbar">
            <div className="offcanvas-header">
              <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body">
              <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
                <li className="nav-item">
                  <Link to="/reportes" className="nav-link"><i className="fas fa-chart-line me-2"></i> REPORTES</Link>
                </li>
                <li className="nav-item">
                  <Link to="/facturacion" className="nav-link"><i className="fas fa-file-invoice-dollar me-2"></i> FACTURACIÓN</Link>
                </li>
                <li className="nav-item">
                  <Link to="/inventario" className="nav-link"><i className="fas fa-boxes me-2"></i> INVENTARIO</Link>
                </li>
                <li className="nav-item">
                  <Link to="/seguridad" className="nav-link"><i className="fas fa-user-shield me-2"></i> SEGURIDAD</Link>
                </li>
              </ul>
              <button className="btn btn-outline-danger mt-3" onClick={handleLogout}>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* CONTENIDO */}
      <div className="flex-grow-1 d-flex flex-column align-items-center pt-5" style={{ marginTop: '80px', padding: '2rem', overflowY: 'auto' }}>
        {/* <h1 className="text-center mb-4 text-primary">Listado de Productos</h1> */}

        {/* Buscador */}
        <div className="input-group mb-4" style={{ maxWidth: '600px' }}>
          <span className="input-group-text"><i className="fas fa-search"></i></span>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nombre o ID..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* Tabla de productos */}
        <div className="table-responsive" style={{ maxHeight: '65vh', width: '100%' }}>
          <table className="table table-hover table-striped table-bordered">
            <thead className="table-primary text-center">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Categoria</th>
                <th>Proveedor</th>
                <th>Stock</th>
                <th>Precio Venta</th>
                <th>Tipo Unidad Venta</th>
                <th>Unidad Medida Venta</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.length > 0 ? (
                productosFiltrados.map((producto) => (
                  <tr key={producto.id}>
                    <td>{producto.id}</td>
                    <td>{producto.nombre}</td>
                    <td>{producto.categoria}</td>
                    <td>{producto.proveedorId}</td>
                    <td>{producto.cantidadStock}</td>
                    <td>L {producto.precioVenta?.toFixed(2)}</td>
                    <td>{producto.tipoUnidadVenta}</td>
                    <td>{producto.unidadMedidaVenta}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted">
                    No se encontraron productos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Link to="/inventario" className="btn btn-secondary mt-4">
          <i className="bi bi-arrow-left me-1"></i> Volver al Inventario
        </Link>
      </div>
    </div>
  );
}
