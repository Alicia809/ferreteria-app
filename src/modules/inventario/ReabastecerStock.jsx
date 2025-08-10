import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../components/AuthContext';
import '../../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';

export default function ReabastecerStock() {

  const {logout, nombre} = useAuth();
  const navigate = useNavigate();

  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState(() => {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  });
  const [numeroFactura, setNumeroFactura] = useState('');
  const [registroCAI, setRegistroCAI] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const provSnap = await getDocs(collection(db, 'proveedores'));
        const prodSnap = await getDocs(collection(db, 'productos'));

        setProveedores(provSnap.docs.map((doc) => ({
          id: doc.id,
          nombreX: doc.data().nombreX,
        })));

        setProductos(prodSnap.docs.map((doc) => ({
          id: doc.id,
          nombreY: doc.data().nombreY,
        })));
      } catch (e) {
        console.error('Error al cargar datos:', e);
      }
    };
    obtenerDatos();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleReabastecer = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    if (!proveedorSeleccionado || !productoSeleccionado || !cantidad || !descripcion || !fecha || !numeroFactura || !registroCAI) {
      setError('Por favor, complete todos los campos.');
      return;
    }

    const cantidadNumero = parseInt(cantidad);
    if (isNaN(cantidadNumero) || cantidadNumero <= 0) {
      setError('Ingrese una cantidad válida.');
      return;
    }

    // Validar formato Registro CAI
    const regexCAI = /^[A-Za-z0-9]{6}(-[A-Za-z0-9]{6}){4}-[A-Za-z0-9]{2}$/;
    if (!regexCAI.test(registroCAI)) {
      setError('El registro CAI no tiene el formato válido: 000000-000000-000000-000000-000000-00');
      return;
    }

    try {
      // Obtener referencia del producto
      const productoRef = doc(db, 'productos', productoSeleccionado);
      const productoSnap = await getDoc(productoRef);

      if (!productoSnap.exists()) {
        setError('Producto no encontrado.');
        return;
      }

      // Sumar stock
      const cantidadActual = productoSnap.data().cantidadStock || 0;
      const nuevaCantidad = cantidadActual + cantidadNumero;

      await updateDoc(productoRef, { cantidadStock: nuevaCantidad });

      // Obtener fecha/hora actual en Honduras
      const fechaHoraHonduras = new Date().toLocaleString('es-HN', {
        timeZone: 'America/Tegucigalpa',
        hour12: true
      });

      // Guardar registro completo en la colección 'reabastecimientos'
      await addDoc(collection(db, 'reabastecimientos'), {
        proveedorId: proveedorSeleccionado,
        productoId: productoSeleccionado,
        cantidad: cantidadNumero,
        descripcion,
        fecha: new Date(fecha),  // fecha sin hora (del input)
        usuario: nombre || 'Desconocido',
        fechaRegistro: fechaHoraHonduras,  // fecha con hora real en Honduras
        numeroFactura,
        registroCAI
      });

      setMensaje('Reabastecimiento exitoso.');
      setCantidad('');
      setDescripcion('');
      setProveedorSeleccionado('');
      setProductoSeleccionado('');
      setFecha(new Date().toISOString().split('T')[0]); // reset a hoy
      setNumeroFactura('');
      setRegistroCAI('');
    } catch (err) {
      console.error(err);
      setError('Error al reabastecer el stock.');
    }
  };

  return (
    <div className="d-flex flex-column vh-100" style={{ overflow: 'hidden' }}>
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
      <div
        className="flex-grow-1 d-flex flex-column align-items-center pt-5"
        style={{ marginTop: '20px', padding: '2rem' }}
      >
        <div className="card shadow-lg p-4" style={{ width: '100%', maxWidth: '800px' }}>
          <h4 className="text-center mb-4 fw-bold text-success">Reabastecer Stock</h4>

          {error && <div className="alert alert-danger">{error}</div>}
          {mensaje && <div className="alert alert-success">{mensaje}</div>}

          <form onSubmit={handleReabastecer}>
            <div className="row g-3 align-items-end">
              {/* Proveedor */}
              <div className="col-md-6">
                <label className="form-label fw-semibold" htmlFor="selectProveedor">
                  Proveedor
                </label>
                <select
                  id="selectProveedor"
                  className="form-select"
                  value={proveedorSeleccionado}
                  onChange={(e) => setProveedorSeleccionado(e.target.value)}
                  required
                >
                  <option value="">Seleccione proveedor</option>
                  {proveedores.map((prov) => (
                    <option key={prov.id} value={prov.id}>
                      {prov.nombreX}
                    </option>
                  ))}
                </select>
              </div>

              {/* Producto */}
              <div className="col-md-6">
                <label className="form-label fw-semibold" htmlFor="selectProducto">
                  Producto
                </label>
                <select
                  id="selectProducto"
                  className="form-select"
                  value={productoSeleccionado}
                  onChange={(e) => setProductoSeleccionado(e.target.value)}
                  required
                >
                  <option value="">Seleccione producto</option>
                  {productos.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.nombreY}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cantidad */}
              <div className="col-md-6">
                <label className="form-label fw-semibold" htmlFor="inputCantidad">
                  Cantidad
                </label>
                <input
                  id="inputCantidad"
                  type="number"
                  className="form-control"
                  placeholder="Ej. 100"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  required
                  min="1"
                />
              </div>

              {/* Fecha */}
              <div className="col-md-6">
                <label className="form-label fw-semibold" htmlFor="inputFecha">
                  Fecha
                </label>
                <input
                  id="inputFecha"
                  type="date"
                  className="form-control"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  required
                />
              </div>

              {/* Número de Factura */}
              <div className="col-md-6">
                <label className="form-label fw-semibold" htmlFor="inputNumeroFactura">
                  Número de Factura
                </label>
                <input
                  id="inputNumeroFactura"
                  type="text"
                  className="form-control"
                  value={numeroFactura}
                  onChange={(e) => setNumeroFactura(e.target.value)}
                  required
                />
              </div>

              {/* Registro CAI */}
              <div className="col-md-6">
                <label className="form-label fw-semibold" htmlFor="inputRegistroCAI">
                  Registro CAI
                </label>
                <input
                  id="inputRegistroCAI"
                  type="text"
                  className="form-control"
                  placeholder="000000-000000-000000-000000-000000-00"
                  value={registroCAI}
                  onChange={(e) => setRegistroCAI(e.target.value)}
                  maxLength={41}
                  required
                />
              </div>

              {/* Descripción */}
              <div className="col-12">
                <label className="form-label fw-semibold" htmlFor="textareaDescripcion">
                  Descripción
                </label>
                <textarea
                  id="textareaDescripcion"
                  className="form-control"
                  rows="3"
                  placeholder="Detalles adicionales"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="d-flex justify-content-between mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate(-1)}
              >
                <i className="bi bi-arrow-left me-1"></i>Volver
              </button>
              <button type="submit" className="btn btn-primary">
                <i className="bi bi-check2-circle me-1"></i>Guardar reabastecimiento
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
