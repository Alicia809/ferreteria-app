// src/pages/ListadoAjustes.js
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useAuth } from '../../components/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

export default function ListadoAjustes() {
  const { logout, nombre } = useAuth();
  const navigate = useNavigate();

  const [ajustes, setAjustes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [ajustesFiltrados, setAjustesFiltrados] = useState([]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    const fetchAjustes = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'ajustesManuales'));
        const listaAjustes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAjustes(listaAjustes);
        setAjustesFiltrados(listaAjustes);
      } catch (error) {
        console.error('Error al obtener ajustes manuales:', error);
      }
    };
    fetchAjustes();
  }, []);

  useEffect(() => {
    const filtro = ajustes.filter(a =>
      (a.productoNombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
       a.usuarioEncargado?.toLowerCase().includes(busqueda.toLowerCase()) ||
       a.fecha?.toLowerCase().includes(busqueda.toLowerCase()) ||
       a.observacion?.toLowerCase().includes(busqueda.toLowerCase()))
    );
    setAjustesFiltrados(filtro);
  }, [busqueda, ajustes]);

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
            <span>{nombre || 'Usuario'}</span>
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
      <div className="flex-grow-1 d-flex flex-column align-items-center pt-5" style={{ marginTop: '80px', padding: '2rem', overflowY: 'auto', width: '100%' }}>
        <h2 className="text-center mb-4 text-primary fw-bold">
          <i className="bi bi-list-ul me-2"></i> Listado de Ajustes Manuales
        </h2>

        {/* Buscador */}
        <div className="input-group mb-4" style={{ maxWidth: '700px' }}>
          <span className="input-group-text"><i className="fas fa-search"></i></span>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por producto, usuario, fecha u observación..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* Tabla */}
        <div className="table-responsive" style={{ maxHeight: '65vh', width: '100%' }}>
          <table className="table table-hover table-striped table-bordered">
            <thead className="table-primary text-center">
              <tr>
                <th>Producto</th>
                <th>Cantidad Descontada</th>
                <th>Fecha Ajuste</th>
                <th>Observación</th>
                <th>Usuario Encargado</th>
                <th>Fecha Registro</th>
              </tr>
            </thead>
            <tbody>
              {ajustesFiltrados.length > 0 ? (
                ajustesFiltrados.map((ajuste) => (
                  <tr key={ajuste.id}>
                    <td>{ajuste.productoNombre}</td>
                    <td className="text-center">{ajuste.cantidadDescontada}</td>
                    <td className="text-center">{ajuste.fecha}</td>
                    <td>{ajuste.observacion}</td>
                    <td>{ajuste.usuarioEncargado}</td>
                    <td>{ajuste.fechaRegistradoP}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted">
                    No se encontraron ajustes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Link to="/inventario/actualizacion" className="btn btn-secondary mt-4">
          <i className="bi bi-arrow-left me-1"></i> Volver a Actualización Manual
        </Link>
      </div>
    </div>
  );
}
