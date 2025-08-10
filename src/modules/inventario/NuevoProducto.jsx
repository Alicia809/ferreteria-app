import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { useAuth } from '../../components/AuthContext';

const unidadesPorTipo = {
  Longitud: ['Metro (m)', 'Centímetro (cm)', 'Milímetro (mm)', 'Pie (ft)', 'Pulgada (in)'],
  Peso: ['Kilogramo (kg)', 'Gramo (g)', 'Tonelada (t)', 'Libra (lb)'],
  Volumen: ['Litro (L)', 'Mililitro (mL)', 'Galón (gal)'],
  Cantidad: ['Unidad', 'Caja', 'Paquete'],
};

export default function NuevoProducto() {
  const navigate = useNavigate();

  // Datos básicos
  const [nombreY, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('');

  // Proveedor
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState('');
  const [proveedores, setProveedores] = useState([]);

  // Compra
  const [tipoUnidadCompra, setTipoUnidadCompra] = useState('');
  const [unidadMedidaCompra, setUnidadMedidaCompra] = useState('');
  const [precioCosto, setPrecioCosto] = useState('');

  // Venta
  const [tipoUnidadVenta, setTipoUnidadVenta] = useState('');
  const [unidadMedidaVenta, setUnidadMedidaVenta] = useState('');
  const [precioVenta, setPrecioVenta] = useState('');

  // Cantidades
  const [cantidadVenta, setCantidadVenta] = useState('');
  const [cantidadStock, setCantidadStock] = useState('');

  const [productoId, setProductoId] = useState('');
  const {logout, nombre, rol } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  //Obtener proveedores desde Firestore
  useEffect(() => {
    const obtenerProveedores = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'proveedores'));
        const listaProveedores = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          nombreX: doc.data().nombreX,
        }));
        setProveedores(listaProveedores);
      } catch (error) {
        console.error('Error al obtener proveedores:', error);
      }
    };

    obtenerProveedores();
  }, []);

  const generarIdProducto = () => {
    if (!nombreY || !categoria) return '';
    const nom = nombreY.trim().substring(0, 3).toUpperCase();
    const cat = categoria.trim().substring(0, 3).toUpperCase();
    const num = Date.now().toString().slice(-3);
    return `${cat}-${nom}-${num}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      parseFloat(precioCosto) < 0 ||
      parseFloat(precioVenta) < 0 ||
      parseFloat(cantidadVenta) < 0 ||
      parseFloat(cantidadStock) < 0
    ) {
      alert("Los valores numéricos no pueden ser negativos.");
      return;
    }

    if (!productoId) {
      alert("No se pudo generar el ID del producto. Verifique el nombre y la categoría.");
      return;
    }
    // Fecha y hora en zona horaria de Honduras
    const fechaHoraHonduras = new Date().toLocaleString('es-HN', {
      timeZone: 'America/Tegucigalpa',
      hour12: true
    });

    const productoData = {
      id: productoId,
      nombreY,
      descripcion,
      categoria,
      proveedorId: proveedorSeleccionado,
      tipoUnidadCompra,
      unidadMedidaCompra,
      precioCosto: parseFloat(precioCosto),
      tipoUnidadVenta,
      unidadMedidaVenta,
      precioVenta: parseFloat(precioVenta),
      cantidadCompra: parseFloat(cantidadVenta),
      cantidadStock: parseFloat(cantidadStock),
      encargadoRegistroP: nombre || 'Desconocido',
      encargadoEditoP: nombre || 'Desconocido',
      fechaRegistradoP: fechaHoraHonduras,
      fechaEditadoP: fechaHoraHonduras
    };

    try {
      await setDoc(doc(db, 'productos', productoId), productoData);
      alert('Producto guardado exitosamente');
      limpiarFormulario();
    } catch (error) {
      console.error('Error al guardar el producto:', error);
      alert('Hubo un error al guardar el producto');
    }
  };

  const limpiarFormulario = () => {
    setNombre('');
    setDescripcion('');
    setCategoria('');
    setProveedorSeleccionado('');
    setTipoUnidadCompra('');
    setUnidadMedidaCompra('');
    setPrecioCosto('');
    setTipoUnidadVenta('');
    setUnidadMedidaVenta('');
    setPrecioVenta('');
    setCantidadVenta('');
    setCantidadStock('');
    setProductoId('');
  };

  const handleTipoUnidadCompraChange = (e) => {
    setTipoUnidadCompra(e.target.value);
    setUnidadMedidaCompra('');
  };

  const handleTipoUnidadVentaChange = (e) => {
    setTipoUnidadVenta(e.target.value);
    setUnidadMedidaVenta('');
  };

  useEffect(() => {
    if (nombreY.trim() && categoria.trim()) {
      const id = generarIdProducto();
      setProductoId(id);
    } else {
      setProductoId('');
    }
  }, [nombreY, categoria]);

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

      {/* FORMULARIO */}
      <div className="container d-flex justify-content-center align-items-start"
        style={{ paddingTop: '100px', minHeight: '80vh', backgroundColor: '#e2f1ff' }}>
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
          <h2 className="text-center text-primary mb-4" style={{ fontWeight: '700' }}>
            <i className="bi bi-box-seam me-2"></i>Registrar Nuevo Producto
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {/* Nombre y categoría */}
              <div className="col-md-12">
                <label className="form-label fw-semibold">Nombre del producto</label>
                <input type="text" className="form-control" value={nombreY}
                  onChange={(e) => setNombre(e.target.value)} required />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Categoría</label>
                <input type="text" className="form-control" value={categoria}
                  onChange={(e) => setCategoria(e.target.value)} required />
              </div>

              {/* Proveedor */}
              <div className="col-md-6">
                <label className="form-label fw-semibold">Proveedor</label>
                <select className="form-select"
                  value={proveedorSeleccionado}
                  onChange={(e) => setProveedorSeleccionado(e.target.value)}
                  required
                >
                  <option value="">Seleccionar proveedor</option>
                  {proveedores.map((prov) => (
                    <option key={prov.id} value={prov.id}>{prov.nombreX}</option>
                  ))}
                </select>
              </div>

              {/* Compra */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">Tipo de unidad de compra</label>
                <select className="form-select" value={tipoUnidadCompra} onChange={handleTipoUnidadCompraChange} required>
                  <option value="">Seleccionar tipo compra</option>
                  {Object.keys(unidadesPorTipo).map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">Unidad de medida de compra</label>
                <select className="form-select" value={unidadMedidaCompra}
                  onChange={(e) => setUnidadMedidaCompra(e.target.value)}
                  disabled={!tipoUnidadCompra} required
                >
                  <option value="">Seleccionar unidad compra</option>
                  {tipoUnidadCompra &&
                    unidadesPorTipo[tipoUnidadCompra].map((unidad) => (
                      <option key={unidad} value={unidad}>{unidad}</option>
                    ))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">Precio costo</label>
                <input type="number" className="form-control" min={0} step="0.01"
                  value={precioCosto} onChange={(e) => setPrecioCosto(e.target.value)} required />
              </div>

              {/* Venta */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">Tipo de unidad de venta</label>
                <select className="form-select" value={tipoUnidadVenta} onChange={handleTipoUnidadVentaChange} required>
                  <option value="">Seleccionar tipo venta</option>
                  {Object.keys(unidadesPorTipo).map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">Unidad de medida de venta</label>
                <select className="form-select" value={unidadMedidaVenta}
                  onChange={(e) => setUnidadMedidaVenta(e.target.value)}
                  disabled={!tipoUnidadVenta} required
                >
                  <option value="">Seleccionar unidad venta</option>
                  {tipoUnidadVenta &&
                    unidadesPorTipo[tipoUnidadVenta].map((unidad) => (
                      <option key={unidad} value={unidad}>{unidad}</option>
                    ))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold">Precio venta</label>
                <input type="number" className="form-control" min={0} step="0.01"
                  value={precioVenta} onChange={(e) => setPrecioVenta(e.target.value)} required />
              </div>

              {/* Cantidades */}
              <div className="col-6">
                <label className="form-label fw-semibold">Cantidad (según unidad compra)</label>
                <input type="number" className="form-control" min={0}
                  value={cantidadVenta} onChange={(e) => setCantidadVenta(e.target.value)} required />
              </div>

              <div className="col-6">
                <label className="form-label fw-semibold">Cantidad para stock (según unidad venta)</label>
                <input type="number" className="form-control" min={0}
                  value={cantidadStock} onChange={(e) => setCantidadStock(e.target.value)} required />
              </div>

              {/* Descripción */}
              <div className="col-12">
                <label className="form-label fw-semibold">Descripción</label>
                <textarea className="form-control" rows="3"
                  value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
              </div>

              {/* ID generado */}
              {productoId && (
                <div className="col-12">
                  <div className="alert alert-info mt-3" role="alert">
                    <strong>ID generado:</strong> {productoId}
                  </div>
                </div>
              )}
            </div>

            <div className="d-flex justify-content-between mt-4">
              <Link to="/inventario" className="btn btn-outline-secondary">
                <i className="bi bi-arrow-left me-1"></i>Volver
              </Link>
              <button type="submit" className="btn btn-primary">
                <i className="bi bi-check2-circle me-1"></i>Registrar producto
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
