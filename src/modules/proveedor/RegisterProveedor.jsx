import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../components/AuthContext';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { allCountries } from 'country-telephone-data';
import { FaArrowLeft } from 'react-icons/fa';

function RegisterProveedor() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [direccion, setDireccion] = useState('');
  const [rtn, setRTN] = useState('');
  const [pais, setPais] = useState('HN');
  const [telefono, setTelefono] = useState('');
  const [error, setError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const navigate = useNavigate();
  const { logout } = useAuth();

  const limpiarFormulario = () => {
    setNombre('');
    setCorreo('');
    setDireccion('');
    setRTN('');
    setPais('HN');
    setTelefono('');
    setError('');
  };

  const paisSeleccionado = allCountries.find(
    (c) => c.iso2.toUpperCase() === pais
  );

  const codigoPais = paisSeleccionado ? `+${paisSeleccionado.dialCode}` : '';

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setMensajeExito('');

    const rtnRegex = /^\d{14}$/;
    if (!rtnRegex.test(rtn)) {
      setError('El RTN debe tener exactamente 14 dígitos numéricos.');
      return;
    }

    if (!isValidPhoneNumber(`${codigoPais}${telefono}`, pais)) {
      setError('Número de teléfono inválido para el país seleccionado.');
      return;
    }

    try {
      const docRef = doc(db, 'proveedores', rtn);
      await setDoc(docRef, {
        nombre,
        correo,
        direccion,
        telefono: `${codigoPais}${telefono}`,
        rtn,
        pais,
      });

      setMensajeExito('Proveedor registrado con éxito');
      limpiarFormulario();
    } catch (err) {
      setError('Error al registrar proveedor: ' + err.message);
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
        </div>
      </nav>

      {/* Contenedor principal */}
      <div className="container" style={{ paddingTop: '100px', maxWidth: '800px' }}>
        <div
          className="card shadow-lg p-4"
          style={{ backgroundColor: 'white', borderRadius: '8px' }}
        >
          <h4 className="text-primary mb-4 fw-bold text-center">
            <i className="bi bi-truck me-2"></i>Registrar Proveedor
          </h4>

          {error && <div className="alert alert-danger">{error}</div>}
          {mensajeExito && <div className="alert alert-success">{mensajeExito}</div>}

          <form onSubmit={handleRegister}>
            <div className="row g-3">
              {/* Campos del formulario */}
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
                  value={rtn}
                  onChange={(e) => setRTN(e.target.value)}
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
                  placeholder="Número"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="d-flex justify-content-between mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate('/proveedores')}
              >
                <FaArrowLeft className="me-2" />
                Regresar
              </button>
              <button type="submit" className="btn btn-primary">
                Registrar
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default RegisterProveedor;
