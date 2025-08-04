// src/pages/FacturaCliente.js
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container, Row, Col, Card, Form, Button, Table, Modal, InputGroup
} from 'react-bootstrap';
import { FaSearch, FaPlus, FaTrash  } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../components/AuthContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


const CODIGOS_VALIDOS_MUNICIPIOS = new Set([
  '0101','0102','0103','0104','0105','0106','0107','0108',
  '0201','0202','0203','0204','0205','0206','0207','0208','0209','0210',
]);

export default function FacturaCliente() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [productoModal, setProductoModal] = useState(false);
  const [formData, setFormData] = useState({ tipoIdent: '', identificacion: '' });
  const [facturaProductos, setFacturaProductos] = useState([]);
  const [nuevoProducto, setNuevoProducto] = useState({ nombre: '', cantidad: 1, precio: 0 });
  const [errores, setErrores] = useState({});
  const [descuentoModal, setDescuentoModal] = useState(false);
  const [impuestosDescuentos, setImpuestosDescuentos] = useState([]);
  const [descuentoImpuestoAplicado, setDescuentoImpuestoAplicado] = useState(null);

  useEffect(() => {
    getDocs(collection(db, 'productos')).then(snapshot => {
      const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProductos(prods);
    });
  }, []);

  useEffect(() => {
    // Cargar datos de la colección impuestosDescuentos
    const obtenerImpuestosDescuentos = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'impuestosDescuentos'));
        const datos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setImpuestosDescuentos(datos);
      } catch (error) {
        console.error('Error al obtener impuestos/descuentos:', error);
      }
    };
    obtenerImpuestosDescuentos();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleAgregarProducto = () => {
    const erroresModal = {};

    if (!nuevoProducto.nombre) erroresModal.nombre = 'Debe seleccionar un producto';
    if (!nuevoProducto.cantidad || nuevoProducto.cantidad <= 0) erroresModal.cantidad = 'Cantidad inválida';
    if (!nuevoProducto.precio || nuevoProducto.precio <= 0) erroresModal.precio = 'Precio inválido';

    if (Object.keys(erroresModal).length > 0) {
      setErrores(erroresModal);
      return;
    }

    const yaExiste = facturaProductos.some(p => p.nombre === nuevoProducto.nombre);
    if (yaExiste) {
      alert('Este producto ya ha sido agregado.');
      return;
    }

    const monto = nuevoProducto.cantidad * nuevoProducto.precio;
    setFacturaProductos([...facturaProductos, { ...nuevoProducto, monto }]);
    setNuevoProducto({ nombre: '', cantidad: 1, precio: 0 });
    setErrores({});
    setProductoModal(false);
  };

  const handleEliminarProducto = (index) => {
    const nuevosProductos = [...facturaProductos];
    nuevosProductos.splice(index, 1);
    setFacturaProductos(nuevosProductos);
  };

  const handleSeleccionProducto = (nombreSeleccionado) => {
    const producto = productos.find(p => p.nombre === nombreSeleccionado);
    if (producto) {
      setNuevoProducto({ ...nuevoProducto, nombre: producto.nombre, precio: producto.precioVenta });
    } else {
      setNuevoProducto({ ...nuevoProducto, nombre: '', precio: 0 });
    }
  };

  const calcularImpuesto = () => {
    const total = facturaProductos.reduce((sum, p) => sum + p.monto, 0);
    return (total * 0.15).toFixed(2);
  };

  const calcularTotal = () => {
    return facturaProductos.reduce((sum, p) => sum + p.monto, 0).toFixed(2);
  };

  const validarIdentificacion = () => {
    const { tipoIdent, identificacion } = formData;
    const partes = identificacion.split('-');
    const erroresTmp = {};

    if (tipoIdent === 'DNI' || tipoIdent === 'RTN') {
      if ((tipoIdent === 'DNI' && partes.length !== 3) ||
          (tipoIdent === 'RTN' && partes.length !== 3)) {
        erroresTmp.identificacion = 'Formato incorrecto';
      } else {
        const [codMun, anio, corr] = partes;
        const isDNI = tipoIdent === 'DNI';
        const lenCorr = isDNI ? 5 : 6;
        if (
          codMun.length !== 4 || !/^[0-9]+$/.test(codMun) ||
          anio.length !== 4 || !/^[0-9]+$/.test(anio) ||
          corr.length !== lenCorr || !/^[0-9]+$/.test(corr) ||
          !CODIGOS_VALIDOS_MUNICIPIOS.has(codMun)
        ) {
          erroresTmp.identificacion = 'Número inválido o código municipal incorrecto';
        }
      }
    }

    const handleGuardarEImprimir = async () => {
      if (!validarIdentificacion() || facturaProductos.length === 0) {
        alert("Datos incompletos o inválidos.");
        return;
      }

      // Datos de la factura
      const facturaData = {
        fecha: new Date().toISOString(),
        numeroFactura: `INV/${new Date().getFullYear()}/00001`, // Puedes usar un contador real si deseas
        identificacion: formData.identificacion,
        tipoIdentificacion: formData.tipoIdent,
        productos: facturaProductos,
        subtotal: facturaProductos.reduce((sum, p) => sum + p.monto, 0),
        impuesto: parseFloat(calcularImpuesto()),
        total: parseFloat(calcularTotal()),
      };

      try {
        // Guardar en Firestore
        await addDoc(collection(db, 'facturas'), facturaData);

        // Esperar a que el componente de factura se renderice antes de capturarlo
        setTimeout(() => {
          generarPDF(facturaData);
        }, 500);

      } catch (error) {
        console.error("Error al guardar factura:", error);
        alert("No se pudo guardar la factura.");
      }
    };


    setErrores(erroresTmp);
    return Object.keys(erroresTmp).length === 0;
  };

  const handleAgregarDescuentoImpuesto = (item) => {
    const subtotal = facturaProductos.reduce((sum, p) => sum + p.monto, 0);

    // Verifica que el subtotal sea válido antes de calcular el monto
    if (subtotal <= 0) {
      alert("No se puede aplicar un descuento o impuesto sin productos en la factura.");
      return;
    }

    const monto = (subtotal * (item.porcentaje / 100)).toFixed(2);

    // Guardar el descuento/impuesto aplicado
    setDescuentoImpuestoAplicado({
      nombre: item.nombre,
      porcentaje: item.porcentaje,
      monto: parseFloat(monto),
    });

    setDescuentoModal(false);
  };

  return (
    <div className="d-flex flex-column vh-100 overflow-auto">
      <nav className="navbar bg-body-tertiary fixed-top">
        <div className="container-fluid">
          <a className="navbar-brand d-flex align-items-center gap-2">
            <img src="/Logo.png" alt="Logo" height="60" />
            <span>Comercial Mateo</span>
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="offcanvas offcanvas-end" id="offcanvasNavbar">
            <div className="offcanvas-header">
              <button className="btn-close" data-bs-dismiss="offcanvas"></button>
            </div>
            <div className="offcanvas-body">
              <ul className="navbar-nav">
                <li><Link to="/reportes" className="nav-link">Reportes</Link></li>
                <li><Link to="/facturacion" className="nav-link">Facturación</Link></li>
                <li><Link to="/inventario" className="nav-link">Inventario</Link></li>
                <li><Link to="/proveedores" className="nav-link">Proveedores</Link></li>
                <li><Link to="/seguridad" className="nav-link">Seguridad</Link></li>
              </ul>
              <Button variant="outline-danger" onClick={handleLogout}>Cerrar Sesión</Button>
            </div>
          </div>
        </div>
      </nav>

      <Container style={{ marginTop: '90px' }}>
        <Card>
          <Card.Body>
            <Row className="border-bottom mb-3 pb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Fecha y hora</Form.Label>
                  <Form.Control type="datetime-local" value={new Date().toISOString().slice(0, 16)} disabled />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Número de factura</Form.Label>
                  <Form.Control value="AUTO" disabled />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>ID Registro</Form.Label>
                  <Form.Control value={`03/08/2025-00001`} disabled />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Tipo Identificación</Form.Label>
                  <Form.Select value={formData.tipoIdent} onChange={e => setFormData({ ...formData, tipoIdent: e.target.value })}>
                    <option value="">-- Seleccionar --</option>
                    <option value="RTN">RTN</option>
                    <option value="DNI">DNI</option>
                    <option value="PASAPORTE">Pasaporte</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Número de Identificación</Form.Label>
                  <Form.Control
                    isInvalid={errores.identificacion}
                    value={formData.identificacion}
                    onChange={e => setFormData({ ...formData, identificacion: e.target.value })}
                    onBlur={validarIdentificacion}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errores.identificacion}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col className="text-end">
                <Button variant="primary" className="me-2" onClick={() => setProductoModal(true)}>
                  <FaPlus /> Añadir producto
                </Button>
                <Button variant="info" onClick={() => setDescuentoModal(true)}>
                  <FaPlus /> Añadir descuento/impuesto
                </Button>
              </Col>
            </Row>

            <Table bordered>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio Unitario</th>
                  <th>Monto</th>
                  <th>Acciones</th> {/* Nueva columna */}
                </tr>
              </thead>
              <tbody>
                {facturaProductos.map((prod, i) => (
                  <tr key={i}>
                    <td>{prod.nombre}</td>
                    <td>{prod.cantidad}</td>
                    <td>{prod.precio}</td>
                    <td>{prod.monto.toFixed(2)}</td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleEliminarProducto(i)}
                        title="Eliminar producto"
                      >
                        <FaTrash />
                      </Button>

                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <Row className="text-end">
              <Col md={{ span: 4, offset: 8 }}>
                <p>Subtotal: L. {facturaProductos.reduce((sum, p) => sum + p.monto, 0).toFixed(2)}</p>
                {descuentoImpuestoAplicado && (
                  <p>
                    {descuentoImpuestoAplicado.nombre} ({descuentoImpuestoAplicado.porcentaje}%): 
                    -L. {descuentoImpuestoAplicado.monto.toFixed(2)}
                  </p>
                )}
                <p>Impuesto (15%): L. {calcularImpuesto()}</p>
                <h5>
                  Total: L. {(
                    facturaProductos.reduce((sum, p) => sum + p.monto, 0) +
                    parseFloat(calcularImpuesto()) -
                    (descuentoImpuestoAplicado?.monto || 0)
                  ).toFixed(2)}
                </h5>
              </Col>
            </Row>

            <Row className="text-end">
              <Col>
                <Button
                  variant="secondary"
                  className="me-2"
                  onClick={() => navigate('/facturacion')}
                >
                  Cancelar
                </Button>
                <Button variant="success">Guardar e Imprimir</Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>

      <Modal show={productoModal} onHide={() => setProductoModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Producto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>Producto</Form.Label>
            <InputGroup>
              <Form.Select
                value={nuevoProducto.nombre}
                onChange={e => handleSeleccionProducto(e.target.value)}>
                <option value="">-- Seleccionar --</option>
                {productos.map(p => (
                  <option key={p.id} value={p.nombre}>{p.nombre}</option>
                ))}
              </Form.Select>
              <InputGroup.Text><FaSearch /></InputGroup.Text>
            </InputGroup>
            {errores.nombre && <div className="text-danger small">{errores.nombre}</div>}
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Cantidad</Form.Label>
            <Form.Control
              type="number"
              value={nuevoProducto.cantidad}
              onChange={e => setNuevoProducto({ ...nuevoProducto, cantidad: parseInt(e.target.value) })}
            />
            {errores.cantidad && <div className="text-danger small">{errores.cantidad}</div>}
          </Form.Group>
          <Form.Group>
            <Form.Label>Precio Unitario</Form.Label>
            <Form.Control
              type="number"
              value={nuevoProducto.precio}
              readOnly
            />
            {errores.precio && <div className="text-danger small">{errores.precio}</div>}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setProductoModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleAgregarProducto}>Agregar</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={descuentoModal} onHide={() => setDescuentoModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Seleccionar Descuento/Impuesto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Porcentaje</th>
                <th>Tipo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {impuestosDescuentos.map((item) => (
                <tr key={item.id}>
                  <td>{item.nombre}</td>
                  <td>{item.porcentaje}%</td>
                  <td>{item.tipo}</td>
                  <td>
                    <Button variant="success" size="sm" onClick={() => handleAgregarDescuentoImpuesto(item)}>
                      Añadir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDescuentoModal(false)}>Cancelar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
