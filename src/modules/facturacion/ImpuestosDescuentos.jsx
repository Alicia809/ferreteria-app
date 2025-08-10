// Importaciones necesarias
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container, Table, Button, Modal, Form, InputGroup
} from 'react-bootstrap';
import { FaSearch, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import {
  collection, getDocs, doc, setDoc, deleteDoc, updateDoc
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../components/AuthContext';

export default function ImpuestosDescuentos() {
  const navigate = useNavigate();
  const [registros, setRegistros] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoRegistro, setNuevoRegistro] = useState({
    nombre: '',
    porcentaje: '',
    tipo: 'Impuesto',
    activo: false
  });
  const [errores, setErrores] = useState({});
  const [registroEditando, setRegistroEditando] = useState(null);

  const {logout,nombre } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    const obtenerRegistros = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'impuestosDescuentos'));
        const registrosFirebase = [];
        querySnapshot.forEach((docSnap) => {
          registrosFirebase.push({
            id: docSnap.id,
            ...docSnap.data()
          });
        });
        setRegistros(registrosFirebase);
      } catch (error) {
        console.error('Error al obtener datos:', error);
      }
    };
    obtenerRegistros();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNuevoRegistro(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    if (!nuevoRegistro.nombre) nuevosErrores.nombre = 'Requerido';
    if (!nuevoRegistro.porcentaje || isNaN(nuevoRegistro.porcentaje)) nuevosErrores.porcentaje = 'Debe ser un número';
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const agregarRegistro = async () => {
    if (!validarFormulario()) return;
    try {
      const ref = doc(db, 'impuestosDescuentos', `${Date.now()}`);
      await setDoc(ref, nuevoRegistro);
      setRegistros([...registros, { ...nuevoRegistro, id: ref.id }]);
      setMostrarModal(false);
      setErrores({});
      setNuevoRegistro({ nombre: '', porcentaje: '', tipo: 'Impuesto', activo: false });
    } catch (error) {
      console.error('Error al guardar en Firestore:', error);
    }
  };

  const eliminarRegistro = async (id) => {
    try {
      await deleteDoc(doc(db, 'impuestosDescuentos', id));
      setRegistros(registros.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  };

  const toggleActivo = async (id, nuevoEstado) => {
    try {
      await updateDoc(doc(db, 'impuestosDescuentos', id), { activo: nuevoEstado });
      setRegistros(registros.map(r => r.id === id ? { ...r, activo: nuevoEstado } : r));
    } catch (error) {
      console.error('Error al actualizar activo:', error);
    }
  };

  const editarRegistroDirecto = async (id, campo, valor) => {
    try {
      await updateDoc(doc(db, 'impuestosDescuentos', id), { [campo]: valor });
      setRegistros(
        registros.map(r => (r.id === id ? { ...r, [campo]: valor } : r))
      );
    } catch (error) {
      console.error('Error al editar directamente:', error);
    }
  };

  const iniciarEdicion = (registro) => {
    setRegistroEditando({ ...registro });
  };

  const guardarEdicion = async () => {
    try {
      await updateDoc(doc(db, 'impuestosDescuentos', registroEditando.id), registroEditando);
      setRegistros(
        registros.map(r => (r.id === registroEditando.id ? registroEditando : r))
      );
      setRegistroEditando(null);
    } catch (error) {
      console.error('Error al guardar edición:', error);
    }
  };

  const registrosFiltrados = registros.filter(r =>
    r.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="d-flex flex-column vh-100 overflow-hidden">
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

      <Container className="mt-5 pt-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <InputGroup style={{ maxWidth: '300px' }} className="me-3">
            <InputGroup.Text><FaSearch /></InputGroup.Text>
            <Form.Control
              placeholder="Buscar..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </InputGroup>
          <Button variant="primary" onClick={() => setMostrarModal(true)}>
            <FaPlus className="me-2" /> Nuevo Registro
          </Button>
        </div>

        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Tipo</th>
              <th>Nombre</th>
              <th>Porcentaje (%)</th>
              <th>Activo</th>
              <th>Editar</th>
              <th>Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {registrosFiltrados.map((r, idx) => (
              <tr key={r.id}>
                <td>{idx + 1}</td>
                <td>{r.tipo}</td>
                <td>
                  {registroEditando?.id === r.id ? (
                    <Form.Control
                      type="text"
                      value={registroEditando.nombre}
                      onChange={(e) =>
                        setRegistroEditando({ ...registroEditando, nombre: e.target.value })
                      }
                    />
                  ) : (
                    r.nombre
                  )}
                </td>
                <td>
                  {registroEditando?.id === r.id ? (
                    <Form.Control
                      type="number"
                      value={registroEditando.porcentaje}
                      onChange={(e) =>
                        setRegistroEditando({ ...registroEditando, porcentaje: e.target.value })
                      }
                    />
                  ) : (
                    r.porcentaje
                  )}
                </td>
                <td className="text-center">
                  <Form.Check
                    type="switch"
                    checked={r.activo}
                    onChange={() => toggleActivo(r.id, !r.activo)}
                  />
                </td>
                <td className="text-center">
                  {registroEditando?.id === r.id ? (
                    <Button variant="success" onClick={guardarEdicion}>
                      Guardar
                    </Button>
                  ) : (
                    <Button variant="link" onClick={() => iniciarEdicion(r)} title="Editar">
                      <FaEdit color="green" />
                    </Button>
                  )}
                </td>
                <td className="text-center">
                  <Button variant="link" onClick={() => eliminarRegistro(r.id)} title="Eliminar">
                    <FaTrash color="red" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>

      <Modal show={mostrarModal} onHide={() => setMostrarModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Impuesto o Descuento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tipo</Form.Label>
              <Form.Select name="tipo" value={nuevoRegistro.tipo} onChange={handleChange}>
                <option>Impuesto</option>
                <option>Descuento</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                name="nombre"
                value={nuevoRegistro.nombre}
                onChange={handleChange}
                isInvalid={!!errores.nombre}
              />
              <Form.Control.Feedback type="invalid">{errores.nombre}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Porcentaje</Form.Label>
              <Form.Control
                name="porcentaje"
                value={nuevoRegistro.porcentaje}
                onChange={handleChange}
                isInvalid={!!errores.porcentaje}
              />
              <Form.Control.Feedback type="invalid">{errores.porcentaje}</Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setMostrarModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={agregarRegistro}>Guardar</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={registroEditando !== null} onHide={() => setRegistroEditando(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Registro</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {registroEditando && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Tipo</Form.Label>
                <Form.Select
                  name="tipo"
                  value={registroEditando.tipo}
                  onChange={(e) => setRegistroEditando({ ...registroEditando, tipo: e.target.value })}
                >
                  <option>Impuesto</option>
                  <option>Descuento</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  name="nombre"
                  value={registroEditando.nombre}
                  onChange={(e) => setRegistroEditando({ ...registroEditando, nombre: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Porcentaje</Form.Label>
                <Form.Control
                  name="porcentaje"
                  value={registroEditando.porcentaje}
                  onChange={(e) => setRegistroEditando({ ...registroEditando, porcentaje: e.target.value })}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setRegistroEditando(null)}>Cancelar</Button>
          <Button variant="primary" onClick={guardarEdicion}>Guardar Cambios</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
