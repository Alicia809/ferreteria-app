import React, { useState } from 'react';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { allCountries } from 'country-telephone-data';
import { useAuth } from '../../components/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

function EditProveedor() {
  const [rtnActual, setRtnActual] = useState('');
  const [rtnNuevo, setRtnNuevo] = useState('');
  const [nombreX, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [direccion, setDireccion] = useState('');
  const [pais, setPais] = useState('HN');
  const [telefono, setTelefono] = useState('');
  const [proveedorCargado, setProveedorCargado] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [encargadoRegistro, setEncargadoRegistro] = useState('');
  const [fechaRegistrado, setFechaRegistrado] = useState('');


  const navigate = useNavigate();
  const { logout, nombre, rol } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const codigoPais = (() => {
    const paisSeleccionado = allCountries.find((c) => c.iso2.toUpperCase() === pais);
    return paisSeleccionado ? `+${paisSeleccionado.dialCode}` : '';
  })();

  const cargarProveedor = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    setProveedorCargado(false);

    if (!rtnActual.trim()) {
      setError('Por favor ingresa el RTN del proveedor.');
      return;
    }

    try {
      const docRef = doc(db, 'proveedores', rtnActual);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setError('Proveedor no encontrado.');
        return;
      }

      const data = docSnap.data();
      setRtnNuevo(data.rtn || rtnActual);
      setNombre(data.nombreX || '');
      setCorreo(data.correo || '');
      setDireccion(data.direccion || '');
      setPais(data.pais || 'HN');
      setTelefono(data.telefono || ''); // ahora lo carga tal cual
      setEncargadoRegistro(data.encargadoRegistro || '');
      setFechaRegistrado(data.fechaRegistrado || '');
      setProveedorCargado(true);
    } catch (err) {
      setError('Error cargando proveedor: ' + err.message);
    }
  };


  const guardarCambios = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    const rtnRegex = /^\d{14}$/;
    if (!rtnRegex.test(rtnNuevo)) {
      setError('El RTN debe tener exactamente 14 dígitos.');
      return;
    }

    if (!isValidPhoneNumber(`${codigoPais}${telefono}`, pais)) {
      setError('Número de teléfono inválido.');
      return;
    }

    try {
    // 1️⃣ Obtener datos originales para conservar todo
    const docRef = doc(db, 'proveedores', rtnActual);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      setError('Proveedor no encontrado.');
      return;
    }

    const datosOriginales = docSnap.data();

    // 2️⃣ Hacer merge con los cambios nuevos
    const nuevoProveedor = {
      ...datosOriginales, // mantiene todos los campos previos
      nombreX,
      correo,
      direccion,
      codigoPais: codigoPais,
      telefono: telefono,
      rtn: rtnNuevo,
      pais,
      encargadoRegistro,
      encargadoEditor: nombre || 'Desconocido',
      fechaRegistrado,
      fechaEditado: new Date().toLocaleString('es-HN', { timeZone: 'America/Tegucigalpa' })
    };

    // 3️⃣ Guardar cambios
    if (rtnActual !== rtnNuevo) {
      const nuevoDocRef = doc(db, 'proveedores', rtnNuevo);
      const docExistente = await getDoc(nuevoDocRef);
      if (docExistente.exists()) {
        setError('Ya existe un proveedor con ese RTN.');
        return;
      }

      await setDoc(nuevoDocRef, nuevoProveedor);
      await deleteDoc(doc(db, 'proveedores', rtnActual));
      setMensaje('Proveedor actualizado y RTN cambiado correctamente.');
    } else {
      await setDoc(doc(db, 'proveedores', rtnActual), nuevoProveedor);
      setMensaje('Proveedor actualizado correctamente.');
    }

    // 4️⃣ Limpiar
    setProveedorCargado(false);
    setRtnActual('');
    setRtnNuevo('');
    setNombre('');
    setCorreo('');
    setDireccion('');
    setPais('HN');
    setTelefono('');
    setEncargadoRegistro('');
    setFechaRegistrado('');
  } catch (err) {
    setError('Error guardando proveedor: ' + err.message);
  }
};

  return (
    <>
      {/* Navbar */}
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

      {/* CONTENIDO PRINCIPAL */}
      <div className="scroll-container"
        style={{
          maxHeight: '100vh',
          overflowY: 'auto',
          padding: '2rem',
          maxWidth: '1200px',
          width: '100%',
        }}
      >
        <div className="container min-vh-100 d-flex justify-content-center align-items-center" 
        style={{ paddingTop: '100px' }}>
          <div className="card p-4 shadow-lg" style={{ width: '700px' }}>
            <h4 className="text-center mb-4">Editar Proveedor</h4>

            {error && <div className="alert alert-danger">{error}</div>}
            {mensaje && <div className="alert alert-success">{mensaje}</div>}

            {!proveedorCargado && (
            <form
              onSubmit={cargarProveedor}
              className="w-100"
              style={{ maxWidth: '900px', margin: '0 auto' }}
            >
              <div className="mb-4 row align-items-center">
                <label
                  className="col-md-4 col-form-label fw-semibold"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  RTN del proveedor:
                </label>
                <div className="col-md-8">
                  <input
                    type="text"
                    className="form-control"
                    value={rtnActual}
                    onChange={(e) => setRtnActual(e.target.value)}
                    required
                    style={{ minWidth: '0' }}
                  />
                </div>
              </div>
              <div className="d-flex justify-content-between mt-3">
                <Link to="/proveedores" className="btn btn-secondary">
                  Regresar
                </Link>
                <button type="submit" className="btn btn-primary">
                  Cargar proveedor
                </button>
              </div>
            </form>
          )}


            {proveedorCargado && (
              <form onSubmit={guardarCambios}>         	  
              
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Nombre</label>
                    <input
                      type="text"
                      className="form-control"
                      value={nombreX}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Correo</label>
                    <input
                      type="email"
                      className="form-control"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-12">
                    <label className="form-label fw-semibold">Dirección</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <div className="col-md-5">
                    <label className="form-label fw-semibold">RTN</label>
                    <input
                      type="text"
                      className="form-control"
                      value={rtnNuevo}
                      onChange={(e) => setRtnNuevo(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-semibold">País</label>
                    <select
                      className="form-select"
                      value={pais}
                      onChange={(e) => setPais(e.target.value)}
                    >
                      {allCountries.map(({ name, iso2, dialCode }) => (
                        <option key={iso2} value={iso2.toUpperCase()}>
                          {name} (+{dialCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Teléfono</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Encargado de Registro</label>
                    <input
                      type="text"
                      className="form-control"
                      value={encargadoRegistro}
                      readOnly
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Fecha de Registro</label>
                    <input
                      type="text"
                      className="form-control"
                      value={fechaRegistrado}
                      readOnly
                    />
                  </div>

                </div>

                <div className="d-flex justify-content-between mt-4">
                  <Link to="/proveedores" className="btn btn-secondary">Regresar</Link>
                  <button type="submit" className="btn btn-success">Guardar Cambios</button>
                </div>
              </form>
            )}
          </div>
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
          background-color: #e2f1ff;
          border-radius: 12px;
        }
        .scroll-container::-webkit-scrollbar-thumb:hover {
          background-color: #084298;
        }
      `}</style>
    </>
  );
}

export default EditProveedor;
