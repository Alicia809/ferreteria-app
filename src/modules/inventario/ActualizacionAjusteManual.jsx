// src/pages/AjusteManual.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/AuthContext';
import { collection, getDocs, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export default function ActualizacionAjusteManual() {
  const [productos, setProductos] = useState([]);
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [fecha, setFecha] = useState('');
  const [observacion, setObservacion] = useState('');
  const navigate = useNavigate();
  const { logout, nombre } = useAuth();

  useEffect(() => {
    async function fetchProductos() {
      const productosCol = collection(db, 'productos');
      const productosSnapshot = await getDocs(productosCol);
      const productosList = productosSnapshot.docs.map(doc => ({
        id: doc.id,
        nombre: doc.data().nombreY || doc.data().nombre || 'Sin nombre',
        cantidadStock: doc.data().cantidadStock || 0,
      }));
      setProductos(productosList);
    }
    fetchProductos();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCantidadChange = (e) => {
    const val = e.target.value;
    if (val === '') return setCantidad('');
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 1) setCantidad(num);
  };

  const limpiarFormulario = () => {
    setProductoId('');
    setCantidad('');
    setFecha('');
    setObservacion('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productoId) {
      alert('Por favor selecciona un producto');
      return;
    }

    if (cantidad === '' || cantidad < 1) {
      alert('Por favor ingrese una cantidad válida (mayor o igual a 1).');
      return;
    }

    if (!fecha) {
      alert('Por favor ingrese una fecha válida');
      return;
    }

    if (!observacion.trim()) {
      alert('Por favor ingrese una observación');
      return;
    }

    try {
      // Obtener el producto seleccionado de Firestore para obtener cantidadStock actual
      const productoRef = doc(db, 'productos', productoId);
      const productoSnap = await getDoc(productoRef);

      if (!productoSnap.exists()) {
        alert('Producto no encontrado en la base de datos.');
        return;
      }

      const productoData = productoSnap.data();
      const stockActual = productoData.cantidadStock || 0;

      if (cantidad > stockActual) {
        alert(`No se puede descontar más que el stock actual (${stockActual}).`);
        return;
      }

      // Descontar cantidad del stock
      const nuevoStock = stockActual - cantidad;
      await updateDoc(productoRef, { cantidadStock: nuevoStock });

      // Guardar el ajuste manual en la colección ajustesManuales
      const fechaHoraHonduras = new Date().toLocaleString('es-HN', {
        timeZone: 'America/Tegucigalpa',
        hour12: false
      });

      const ajusteData = {
        productoId,
        productoNombre: productoData.nombreY || productoData.nombre || 'Desconocido',
        cantidadDescontada: cantidad,
        fecha,
        observacion,
        usuarioEncargado: nombre,
        fechaRegistradoP: fechaHoraHonduras,
      };

      await addDoc(collection(db, 'ajustesManuales'), ajusteData);

      alert('Ajuste manual guardado exitosamente y stock actualizado.');
      limpiarFormulario();
    } catch (error) {
      console.error('Error al guardar ajuste manual o actualizar stock:', error);
      alert('Hubo un error al guardar el ajuste manual o actualizar el stock.');
    }
  };

  return (
    <>
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
          <div
            className="offcanvas offcanvas-end custom-offcanvas"
            tabIndex="-1"
            id="offcanvasNavbar"
          >
            <div className="offcanvas-header">
              <button
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
                  className="btn btn-outline-danger mt-3"
                  onClick={handleLogout}
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* FORMULARIO */}
      <div className="container pt-5 mt-5">
        <div className="card shadow-lg p-4">
          <h4 className="text-warning mb-4 fw-bold">Formulario: Ajuste Manual</h4>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Producto</label>
                <select
                  className="form-select"
                  value={productoId}
                  onChange={(e) => setProductoId(e.target.value)}
                  required
                >
                  <option value="">Selecciona un producto</option>
                  {productos.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">Cantidad a descontar</label>
                <input
                  type="number"
                  className="form-control"
                  value={cantidad}
                  onChange={handleCantidadChange}
                  required
                  min={1}
                />
              </div>
              <div className="col-md-3">
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
                onClick={() => navigate('/inventario/actualizacion')}
              >
                <i className="bi bi-arrow-left me-2"></i> Volver
              </button>
              <button type="submit" className="btn btn-warning">
                Guardar Ajuste
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
