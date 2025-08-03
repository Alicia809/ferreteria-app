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
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [direccion, setDireccion] = useState('');
  const [pais, setPais] = useState('HN');
  const [telefono, setTelefono] = useState('');
  const [proveedorCargado, setProveedorCargado] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const navigate = useNavigate();
  const { logout } = useAuth();

  const codigoPais = (() => {
    const paisSeleccionado = allCountries.find((c) => c.iso2.toUpperCase() === pais);
    return paisSeleccionado ? `+${paisSeleccionado.dialCode}` : '';
  })();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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
      setNombre(data.nombre || '');
      setCorreo(data.correo || '');
      setDireccion(data.direccion || '');
      setPais(data.pais || 'HN');
      setTelefono(data.telefono ? data.telefono.replace(/^\+\d+/, '') : '');
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
      const nuevoProveedor = {
        nombre,
        correo,
        direccion,
        telefono: `${codigoPais}${telefono}`,
        rtn: rtnNuevo,
        pais,
      };

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

      setProveedorCargado(false);
      setRtnActual('');
      setRtnNuevo('');
      setNombre('');
      setCorreo('');
      setDireccion('');
      setPais('HN');
      setTelefono('');
    } catch (err) {
      setError('Error guardando proveedor: ' + err.message);
    }
  };

  return (
    <>
      {/* Navbar */}
      <nav className="navbar bg-body-tertiary fixed-top">
        <div className="container-fluid">
          <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
            <img src="/Logo.png" alt="Logo" height="60" />
            <span>Comercial Mateo</span>
          </Link>
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
          <div
            className="offcanvas offcanvas-end custom-offcanvas"
            tabIndex="-1"
            id="offcanvasNavbar"
            aria-labelledby="offcanvasNavbarLabel"
          >
            <div className="offcanvas-header">
              <button
                type="button"
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
                <button type="button" className="btn btn-outline-danger mt-3">
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <div className="container min-vh-100 d-flex justify-content-center align-items-center" >
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
                    value={nombre}
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

                <div className="col-md-6">
                  <label className="form-label fw-semibold">RTN</label>
                  <input
                    type="text"
                    className="form-control"
                    value={rtnNuevo}
                    onChange={(e) => setRtnNuevo(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-3">
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
              </div>

              <div className="d-flex justify-content-between mt-4">
                <Link to="/proveedores" className="btn btn-secondary">Regresar</Link>
                <button type="submit" className="btn btn-success">Guardar Cambios</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

export default EditProveedor;
