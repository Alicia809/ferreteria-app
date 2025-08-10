import React, { useState } from 'react';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap';
import { useAuth } from '../../components/AuthContext';

function EliminarProveedor() {
  const [rtn, setRTN] = useState('');
  const [proveedorNombre, setProveedorNombre] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();
  const { logout, nombre, rol } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleVerificarProveedor = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    setProveedorNombre('');
    setShowModal(false);

    const rtnRegex = /^\d{14}$/;
    if (!rtnRegex.test(rtn.trim())) {
      setError('El RTN debe tener exactamente 14 dígitos numéricos.');
      return;
    }

    try {
      const docRef = doc(db, 'proveedores', rtn.trim());
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setError('Proveedor no encontrado con ese RTN.');
        return;
      }

      const data = docSnap.data();
      setProveedorNombre(data.nombre || '');
      setShowModal(true);
    } catch (err) {
      setError('Error al verificar proveedor: ' + err.message);
    }
  };

  const handleEliminarProveedor = async () => {
    setError('');
    setMensaje('');
    try {
      await deleteDoc(doc(db, 'proveedores', rtn.trim()));
      setMensaje(`Proveedor '${proveedorNombre}' eliminado correctamente.`);
      setRTN('');
      setProveedorNombre('');
      setShowModal(false);
    } catch (err) {
      setError('Error al eliminar proveedor: ' + err.message);
      setShowModal(false);
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
      <div
        className="container min-vh-100 d-flex justify-content-center align-items-center"
        style={{ paddingTop: '120px' }}
      >
        <div className="card p-4 shadow-lg" style={{ width: '700px' }}>
          <h4 className="text-center mb-4">Eliminar Proveedor</h4>

          <form onSubmit={handleVerificarProveedor}>
            <div className="mb-3 row align-items-center">
              <label className="col-sm-5 col-form-label">RTN del proveedor a eliminar:</label>
              <div className="col-sm-7">
                <input
                  type="text"
                  className="form-control"
                  value={rtn}
                  onChange={(e) => setRTN(e.target.value)}
                  placeholder="Ejemplo: 08011998123945"
                  required
                />
              </div>
            </div>

            <div className="d-flex justify-content-between mt-4">
              <Link to="/proveedores" className="btn btn-secondary">
                Regresar
              </Link>
              <button type="submit" className="btn btn-danger">
                Verificar Proveedor
              </button>
            </div>
          </form>

          {error && <div className="alert alert-danger mt-3">{error}</div>}
          {mensaje && <div className="alert alert-success mt-3">{mensaje}</div>}
        </div>
      </div>

      {/* MODAL CONFIRMACIÓN */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro que deseas eliminar al proveedor{' '}
          <strong>{proveedorNombre}</strong> (RTN: {rtn})?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleEliminarProveedor}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default EliminarProveedor;
