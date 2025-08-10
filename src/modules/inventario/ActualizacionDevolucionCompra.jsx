// src/pages/DevolucionCompra.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/AuthContext';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export default function ActualizacionDevolucionCompra() {
  const [productos, setProductos] = useState([]);
  const [productoId, setProductoId] = useState(''); // ahora solo el id del producto
  const [proveedores, setProveedores] = useState([]);
  const [proveedorId, setProveedorId] = useState(''); // solo el id del proveedor
  const [cantidad, setCantidad] = useState('');
  const [fecha, setFecha] = useState('');
  const [motivo, setMotivo] = useState('');
  const [nuevaFactura, setNuevaFactura] = useState('');
  const [facturaAnterior, setFacturaAnterior] = useState('');

  const navigate = useNavigate();
  const { logout, nombre } = useAuth();

  useEffect(() => {
    async function fetchProductos() {
      const productosCol = collection(db, 'productos');
      const productosSnapshot = await getDocs(productosCol);
      const productosList = productosSnapshot.docs.map(doc => ({
        id: doc.id,
        nombre: doc.data().nombreY || doc.data().nombre || 'Sin nombre',
      }));
      setProductos(productosList);
    }

    async function fetchProveedores() {
      const proveedoresCol = collection(db, 'proveedores');
      const proveedoresSnapshot = await getDocs(proveedoresCol);
      const proveedoresList = proveedoresSnapshot.docs.map(doc => ({
        id: doc.id,
        nombre: doc.data().nombreX || doc.data().nombre || 'Sin nombre',
      }));
      setProveedores(proveedoresList);
    }

    fetchProductos();
    fetchProveedores();
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
    setProveedorId('');
    setCantidad('');
    setFecha('');
    setMotivo('');
    setNuevaFactura('');
    setFacturaAnterior('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productoId) {
      alert('Por favor selecciona un producto');
      return;
    }
    if (!proveedorId) {
      alert('Por favor selecciona un proveedor');
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
    if (!motivo.trim()) {
      alert('Por favor ingrese un motivo');
      return;
    }
    if (!nuevaFactura.trim()) {
      alert('Por favor ingrese el número de nueva factura');
      return;
    }
    if (!facturaAnterior.trim()) {
      alert('Por favor ingrese el número de factura anterior');
      return;
    }

    // Obtener nombres para guardar (del arreglo local)
    const productoSeleccionado = productos.find(p => p.id === productoId);
    const proveedorSeleccionado = proveedores.find(p => p.id === proveedorId);

    const fechaHoraHonduras = new Date().toLocaleString('es-HN', {
      timeZone: 'America/Tegucigalpa',
      hour12: false
    });

    const productoData = {
      productoId,
      productoNombre: productoSeleccionado ? productoSeleccionado.nombre : 'Desconocido',
      proveedorId,
      proveedorNombre: proveedorSeleccionado ? proveedorSeleccionado.nombre : 'Desconocido',
      cantidad,
      fecha,
      motivo,
      nuevaFactura,
      facturaAnterior,
      usuarioEncargado: nombre,
      fechaRegistradoP: fechaHoraHonduras,
    };

    try {
      await addDoc(collection(db, 'productosDevolucionCompra'), productoData);
      alert('Devolución guardada exitosamente');
      limpiarFormulario();
    } catch (error) {
      console.error('Error al guardar la devolución:', error);
      alert('Hubo un error al guardar la devolución');
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
        <div className="scroll-container"
          style={{
            maxHeight: '75vh',
            overflowY: 'auto',
            padding: '2.5rem',
            maxWidth: '1200px',
            width: '100%',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            borderRadius: '12px',
            backgroundColor: 'white',
          }}
        >
          <h4 className="text-success mb-4 fw-bold">
            Formulario: Devolución de Compra
          </h4>
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
              <div className="col-md-6">
                <label className="form-label fw-semibold">Cantidad a devolver</label>
                <input
                  type="number"
                  className="form-control"
                  value={cantidad}
                  onChange={handleCantidadChange}
                  required
                  min={1}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Proveedor</label>
                <select
                  className="form-select"
                  value={proveedorId}
                  onChange={(e) => setProveedorId(e.target.value)}
                  required
                >
                  <option value="">Selecciona un proveedor</option>
                  {proveedores.map((prov) => (
                    <option key={prov.id} value={prov.id}>
                      {prov.nombre}
                    </option>
                  ))}
                </select>
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
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  required
                />
              </div>
              <div className="col-6">
                <label className="form-label fw-semibold">Nueva Factura (#)</label>
                <input
                  type="text"
                  className="form-control"
                  value={nuevaFactura}
                  onChange={(e) => setNuevaFactura(e.target.value)}
                  required
                />
              </div>
              <div className="col-6">
                <label className="form-label fw-semibold">Factura Anterior (#)</label>
                <input
                  type="text"
                  className="form-control"
                  value={facturaAnterior}
                  onChange={(e) => setFacturaAnterior(e.target.value)}
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
              <button type="submit" className="btn btn-success">
                Guardar Devolución
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* Scroll personalizado */}
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
