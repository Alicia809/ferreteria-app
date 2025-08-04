import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container, Table, Button, Modal, Form, Row, Col, InputGroup, Alert 
} from 'react-bootstrap';
import { FaSearch, FaPlus } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import {
  collection, getDocs, doc, setDoc, updateDoc, deleteDoc
} from 'firebase/firestore';
import { db } from '../../firebase';

export default function ResolucionCAI() {
  const navigate = useNavigate();

  const [resoluciones, setResoluciones] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevaResolucion, setNuevaResolucion] = useState({
    correlativo: '',
    fecha_limite_emision: '',
    fecha_recepcion: '',
    numero_inicial: '',
    numero_final: '',
  });
  const [errores, setErrores] = useState({});
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return '';
    const fecha = new Date(fechaStr);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
  };
  const [alerta, setAlerta] = useState({ tipo: '', mensaje: '', mostrar: false });
  const [confirmacion, setConfirmacion] = useState({ mostrar: false, correlativo: null });  

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
        setAlerta({
          tipo: 'success',
          mensaje: 'Resolución activada exitosamente.',
          mostrar: true
        });

      } catch (error) {
        setAlerta({
          tipo: 'danger',
          mensaje: 'Hubo un error al activar la resolución.',
          mostrar: true
        });

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
    const campos = ['correlativo', 'fecha_limite_emision', 'fecha_recepcion', 'numero_inicial', 'numero_final'];
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
      usadas: nuevaResolucion.numero_inicial,
      activa: false,
    };

    try {
      await setDoc(doc(db, 'resolucionCAI', nueva.correlativo), nueva);
      setResoluciones([...resoluciones, { ...nueva, id: resoluciones.length + 1 }]);
      setMostrarModal(false);
      setErrores({});
      setNuevaResolucion({
        correlativo: '',
        fecha_limite_emision: '',
        fecha_recepcion: '',
        numero_inicial: '',
        numero_final: '',
      });
    } catch (error) {
      console.error('Error al guardar la resolución en Firestore:', error);
      setAlerta({
        tipo: 'danger',
        mensaje: 'Hubo un error al guardar la resolución. Intenta de nuevo.',
        mostrar: true
      });
    }
  };

  const eliminarResolucion = async (correlativo) => {
    try {
      await deleteDoc(doc(db, 'resolucionCAI', correlativo));
      const nuevasResoluciones = resoluciones.filter(r => r.correlativo !== correlativo);
      setResoluciones(nuevasResoluciones);
      setAlerta({
        tipo: 'success',
        mensaje: 'Resolución eliminada correctamente.',
        mostrar: true
      });
    } catch (error) {
      console.error('Error al eliminar resolución:', error);
      setAlerta({
        tipo: 'danger',
        mensaje: 'Hubo un error al eliminar la resolución. Intenta de nuevo.',
        mostrar: true
      });
    } finally {
      setConfirmacion({ mostrar: false, correlativo: null });
    }
  };

  const activarResolucion = async (correlativo) => {
    try {
      const actual = resoluciones.find(r => r.correlativo === correlativo);

      // Obtenemos la fecha límite de emisión desde la resolución
      const fechaLimite = new Date(`${actual.fecha_limite_emision}T00:00:00-06:00`);
      
      // Fecha actual en zona horaria de Honduras
      const hoy = new Date();
      const hoyUTC6 = new Date(hoy.toLocaleString('en-US', { timeZone: 'America/Tegucigalpa' }));

      // Validamos que la fecha actual NO sea posterior a la fecha límite
      if (hoyUTC6 > fechaLimite) {
        setAlerta({
          tipo: 'warning',
          mensaje: 'No se puede activar esta resolución. La fecha límite de emisión ya ha pasado.',
          mostrar: true
        });
        return;
      }


      const querySnapshot = await getDocs(collection(db, 'resolucionCAI'));

      const updates = querySnapshot.docs.map((docSnap) => {
        const docRef = doc(db, 'resolucionCAI', docSnap.id);
        const esActiva = docSnap.id === correlativo;
        return updateDoc(docRef, { activa: esActiva });
      });

      await Promise.all(updates);

      // Refrescamos resoluciones
      const querySnapshot2 = await getDocs(collection(db, 'resolucionCAI'));
      const nuevasResoluciones = [];
      querySnapshot2.forEach((docSnap, index) => {
        nuevasResoluciones.push({
          id: index + 1,
          ...docSnap.data()
        });
      });
      setResoluciones(nuevasResoluciones);
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

        {alerta.mostrar && (
          <Alert
            variant={alerta.tipo}
            onClose={() => setAlerta({ ...alerta, mostrar: false })}
            dismissible
          >
            {alerta.mensaje}
          </Alert>
        )}

        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Correlativo</th>
              <th>Fecha Recepción</th>
              <th>Fecha Límite</th>
              <th>Número Inicial</th>
              <th>Número Final</th>
              <th>Usadas</th>
              <th>Activa</th>
              <th>Seleccionar</th>
              <th>Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {resolucionesFiltradas.map((r, idx) => (
              <tr key={r.id}>
                <td>{idx + 1}</td>
                <td>{r.correlativo}</td>
                <td>{formatearFecha(r.fecha_recepcion)}</td>
                <td>{formatearFecha(r.fecha_limite_emision)}</td>
                <td>{r.numero_inicial}</td>
                <td>{r.numero_final}</td>
                <td>{r.usadas}</td>
                <td>{r.activa ? 'Sí' : 'No'}</td>
                <td>
                  <Button
                    variant={r.activa ? "success" : "outline-primary"}
                    size="sm"
                    onClick={() => activarResolucion(r.correlativo)}
                    // disabled={r.activa || new Date(r.fecha_limite_emision) < new Date()}
                  >
                    {r.activa ? "Activa" : "Activar"}
                  </Button>
                </td>
                <td>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => setConfirmacion({ mostrar: true, correlativo: r.correlativo })}
                  >
                    Eliminar
                  </Button>
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
                    name="fecha_limite_emision"
                    value={nuevaResolucion.fecha_limite_emision}
                    onChange={handleChange}
                    isInvalid={!!errores.fecha_limite_emision}
                  />
                  <Form.Control.Feedback type="invalid">{errores.fecha_limite_emision}</Form.Control.Feedback>
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
      <Modal show={confirmacion.mostrar} onHide={() => setConfirmacion({ mostrar: false, correlativo: null })}>
      <Modal.Header closeButton>
        <Modal.Title>Confirmar Eliminación</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        ¿Estás seguro de que deseas eliminar esta resolución?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setConfirmacion({ mostrar: false, correlativo: null })}>
          Cancelar
        </Button>
        <Button
          variant="danger"
          onClick={() => eliminarResolucion(confirmacion.correlativo)}
        >
          Eliminar
        </Button>
      </Modal.Footer>
    </Modal>
    </div>
  );
}
