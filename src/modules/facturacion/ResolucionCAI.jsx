import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container, Table, Button, Modal, Form, Row, Col, InputGroup
} from 'react-bootstrap';
import { FaSearch, FaPlus } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import {
  collection, getDocs, doc, setDoc, updateDoc
} from 'firebase/firestore';
import { db } from '../../firebase';

export default function ResolucionCAI() {
  const navigate = useNavigate();

  const [resoluciones, setResoluciones] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevaResolucion, setNuevaResolucion] = useState({
    correlativo: '',
    fecha_emision: '',
    fecha_recepcion: '',
    numero_inicial: '',
    numero_final: '',
  });
  const [errores, setErrores] = useState({});

  useEffect(() => {
    const obtenerResoluciones = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'resolucionCAI'));
        const resolucionesFirebase = [];
        querySnapshot.forEach((docSnap, index) => {
          resolucionesFirebase.push({
            id: index + 1,
            ...docSnap.data()
          });
        });
        setResoluciones(resolucionesFirebase);
      } catch (error) {
        console.error('Error al obtener resoluciones de Firestore:', error);
      }
    };

    obtenerResoluciones();
  }, []);

  const handleLogout = () => navigate('/login');

  const formatearInput = (value, tipo) => {
    if (tipo === 'correlativo') {
      let limpio = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      return limpio.slice(0, 34).replace(/(.{6})(.{6})?(.{6})?(.{6})?(.{6})?(.{0,2})?/, (_, a, b, c, d, e, f) =>
        [a, b, c, d, e, f].filter(Boolean).join('-'));
    }
    if (tipo === 'numero') {
      let limpio = value.replace(/\D/g, '');
      return limpio.slice(0, 17).replace(/(.{3})(.{3})?(.{2})?(.{8})?/, (_, a, b, c, d) =>
        [a, b, c, d].filter(Boolean).join('-'));
    }
    return value;
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    const campos = ['correlativo', 'fecha_emision', 'fecha_recepcion', 'numero_inicial', 'numero_final'];
    campos.forEach(campo => {
      if (!nuevaResolucion[campo]) nuevosErrores[campo] = 'Este campo es obligatorio';
    });
    if (nuevaResolucion.correlativo && nuevaResolucion.correlativo.length !== 37) {
      nuevosErrores.correlativo = 'El correlativo debe tener el formato xxxxxx-xxxxxx-xxxxxx-xxxxxx-xxxxxx-xx';
    }
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let nuevoValor = value;
    if (name === 'correlativo') nuevoValor = formatearInput(value, 'correlativo');
    if (name === 'numero_inicial' || name === 'numero_final') nuevoValor = formatearInput(value, 'numero');
    setNuevaResolucion(prev => ({ ...prev, [name]: nuevoValor }));
  };

  const agregarResolucion = async () => {
    if (!validarFormulario()) return;

    const nueva = {
      ...nuevaResolucion,
      usadas: 0,
      activa: false,
    };

    try {
      await setDoc(doc(db, 'resolucionCAI', nueva.correlativo), nueva);
      setResoluciones([...resoluciones, { ...nueva, id: resoluciones.length + 1 }]);
      setMostrarModal(false);
      setErrores({});
      setNuevaResolucion({
        correlativo: '',
        fecha_emision: '',
        fecha_recepcion: '',
        numero_inicial: '',
        numero_final: '',
      });
    } catch (error) {
      console.error('Error al guardar la resolución en Firestore:', error);
      alert('Hubo un error al guardar la resolución. Intenta de nuevo.');
    }
  };

  const activarResolucion = async (id) => {
    try {
      const querySnapshot = await getDocs(collection(db, 'resolucionCAI'));
      const actual = resoluciones.find(r => r.id === id);

      const actualCorrelativo = actual?.correlativo;

      const updates = querySnapshot.docs.map((docSnap) => {
        const docRef = doc(db, 'resolucionCAI', docSnap.id);
        const esActiva = docSnap.id === actualCorrelativo;
        return updateDoc(docRef, { activa: esActiva });
      });

      await Promise.all(updates);

      setResoluciones(resoluciones.map(r => ({
        ...r,
        activa: r.id === id
      })));
    } catch (error) {
      console.error('Error al actualizar resolución activa:', error);
      alert('Hubo un error al activar la resolución.');
    }
  };

  const resolucionesFiltradas = resoluciones.filter(r =>
    r.correlativo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="d-flex flex-column vh-100 overflow-hidden">
      {/* NAVBAR */}
      <nav className="navbar bg-body-tertiary fixed-top">
        <div className="container-fluid">
          <a className="navbar-brand d-flex align-items-center gap-2" href="#">
            <img src="/Logo.png" alt="Logo" height="60" />
            <span>Comercial Mateo</span>
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="offcanvas offcanvas-end" tabIndex="-1" id="offcanvasNavbar">
            <div className="offcanvas-header">
              <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body">
              <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
                <li className="nav-item"><Link to="/reportes" className="nav-link"><i className="fas fa-chart-line me-2" />REPORTES</Link></li>
                <li className="nav-item"><Link to="/facturacion" className="nav-link"><i className="fas fa-file-invoice-dollar me-2" />FACTURACIÓN</Link></li>
                <li className="nav-item"><Link to="/inventario" className="nav-link"><i className="fas fa-boxes me-2" />INVENTARIO</Link></li>
                <li className="nav-item"><Link to="/proveedores" className="nav-link"><i className="fas fa-truck me-2" />PROVEEDORES</Link></li>
                <li className="nav-item"><Link to="/seguridad" className="nav-link"><i className="fas fa-user-shield me-2" />SEGURIDAD</Link></li>
              </ul>
              <Button variant="outline-danger" className="mt-3" onClick={handleLogout}>Cerrar Sesión</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* CONTENIDO */}
      <Container className="mt-5 pt-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <InputGroup style={{ maxWidth: '300px' }}>
            <InputGroup.Text><FaSearch /></InputGroup.Text>
            <Form.Control
              placeholder="Buscar..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </InputGroup>
          <Button variant="primary" onClick={() => setMostrarModal(true)}>
            <FaPlus className="me-2" /> Nueva Resolución
          </Button>
        </div>

        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Correlativo</th>
              <th>Fecha Límite</th>
              <th>Fecha Recepción</th>
              <th>Número Inicial</th>
              <th>Número Final</th>
              <th>Usadas</th>
              <th>Activa</th>
              <th>Seleccionar</th>
            </tr>
          </thead>
          <tbody>
            {resolucionesFiltradas.map((r, idx) => (
              <tr key={r.id}>
                <td>{idx + 1}</td>
                <td>{r.correlativo}</td>
                <td>{r.fecha_emision}</td>
                <td>{r.fecha_recepcion}</td>
                <td>{r.numero_inicial}</td>
                <td>{r.numero_final}</td>
                <td>{r.usadas}</td>
                <td>{r.activa ? 'Sí' : 'No'}</td>
                <td>
                  <div className="form-check form-switch d-flex justify-content-center">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`switch-${r.id}`}
                      checked={r.activa}
                      onChange={() => activarResolucion(r.id)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>

      {/* MODAL NUEVA RESOLUCIÓN */}
      <Modal show={mostrarModal} onHide={() => setMostrarModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Registrar Nueva Resolución</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Correlativo</Form.Label>
              <Form.Control
                name="correlativo"
                value={nuevaResolucion.correlativo}
                onChange={handleChange}
                placeholder="xxxxxx-xxxxxx-xxxxxx-xxxxxx-xxxxxx-xx"
                isInvalid={!!errores.correlativo}
              />
              <Form.Control.Feedback type="invalid">{errores.correlativo}</Form.Control.Feedback>
            </Form.Group>
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha Límite de Emisión</Form.Label>
                  <Form.Control
                    type="date"
                    name="fecha_emision"
                    value={nuevaResolucion.fecha_emision}
                    onChange={handleChange}
                    isInvalid={!!errores.fecha_emision}
                  />
                  <Form.Control.Feedback type="invalid">{errores.fecha_emision}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha de Recepción</Form.Label>
                  <Form.Control
                    type="date"
                    name="fecha_recepcion"
                    value={nuevaResolucion.fecha_recepcion}
                    onChange={handleChange}
                    isInvalid={!!errores.fecha_recepcion}
                  />
                  <Form.Control.Feedback type="invalid">{errores.fecha_recepcion}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Número Inicial</Form.Label>
              <Form.Control
                name="numero_inicial"
                value={nuevaResolucion.numero_inicial}
                onChange={handleChange}
                placeholder="xxx-xxx-xx-xxxxxxxx"
                isInvalid={!!errores.numero_inicial}
              />
              <Form.Control.Feedback type="invalid">{errores.numero_inicial}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Número Final</Form.Label>
              <Form.Control
                name="numero_final"
                value={nuevaResolucion.numero_final}
                onChange={handleChange}
                placeholder="xxx-xxx-xx-xxxxxxxx"
                isInvalid={!!errores.numero_final}
              />
              <Form.Control.Feedback type="invalid">{errores.numero_final}</Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setMostrarModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={agregarResolucion}>Guardar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
