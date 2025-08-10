import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useAuth } from '../../components/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

export default function MostrarProveedor() {
  const { logout, nombre, rol } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  const navigate = useNavigate();

  const [proveedores, setProveedores] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [proveedoresFiltrados, setProveedoresFiltrados] = useState([]);

  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        const proveedoresSnapshot = await getDocs(collection(db, 'proveedores'));
        // Mapear y agregar el id (RTN) explícitamente
        const listaProveedores = proveedoresSnapshot.docs.map(doc => ({
          rtn: doc.id,
          ...doc.data(),
        }));
        setProveedores(listaProveedores);
        setProveedoresFiltrados(listaProveedores); // inicializar filtro
      } catch (error) {
        console.error('Error al obtener proveedores:', error);
      }
    };
    fetchProveedores();
  }, []);

  useEffect(() => {
    const resultado = proveedores.filter(p =>
      p.nombreX?.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.rtn?.toLowerCase().includes(busqueda.toLowerCase())
    );
    setProveedoresFiltrados(resultado);
  }, [busqueda, proveedores]);

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
        style={{ marginTop: '80px', padding: '2rem', overflowY: 'auto' }}
      >

        {/* Buscador */}
        <div className="input-group mb-4" style={{ maxWidth: '600px' }}>
          <span className="input-group-text"><i className="fas fa-search"></i></span>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nombre o RTN..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* Tabla de proveedores */}
        <div className="table-responsive" style={{ maxHeight: '65vh', width: '100%' }}>
          <table className="table table-hover table-striped table-bordered">
            <thead className="table-primary text-center">
              <tr>
                <th>RTN</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Dirección</th>
                <th>País</th>
                <th>Código de país</th>
                <th>Teléfono</th>
                <th>Registrado por</th>
                <th>Fecha registro</th>
                <th>Editado por</th>
                <th>Fecha editado</th>
              </tr>
            </thead>
            <tbody>
              {proveedoresFiltrados.length > 0 ? (
                proveedoresFiltrados.map((prov) => (
                  <tr key={prov.rtn}>
                    <td>{prov.rtn}</td>
                    <td>{prov.nombreX}</td>
                    <td>{prov.correo}</td>
                    <td>{prov.direccion}</td>
                    <td>{prov.pais}</td>
                    <td>{prov.codigoPais}</td>
                    <td>{prov.telefono}</td>
                    <td>{prov.encargadoRegistro}</td>
                    <td>{prov.fechaRegistrado}</td>
                    <td>{prov.encargadoEditor}</td>
                    <td>{prov.fechaEditado}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted">
                    No se encontraron proveedores.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Link to="/proveedores" className="btn btn-secondary mt-4">
          <i className="bi bi-arrow-left me-1"></i> Volver
        </Link>
      </div>
    </div>
  );
}
