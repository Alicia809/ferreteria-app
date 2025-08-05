// src/pages/FacturaCliente.js
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container, Row, Col, Card, Form, Button, Table, Modal, InputGroup
} from 'react-bootstrap';
import { FaSearch, FaPlus, FaTrash  } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { collection, getDocs, query, where, doc, updateDoc, setDoc, increment, writeBatch, getDoc, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../components/AuthContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const CODIGOS_VALIDOS_MUNICIPIOS = new Set([
  '0101','0102','0103','0104','0105','0106','0107','0108',
  '0201','0202','0203','0204','0205','0206','0207','0208','0209','0210',
  '0301','0302','0303','0304','0305','0306','0307','0308','0309','0310','0311',
  '0312','0313','0314','0315','0316','0317','0318','0319','0320','0321',
  '0401','0402','0403','0404','0405','0406','0407','0408','0409','0410','0411',
  '0412','0413','0414','0415','0416','0417','0418','0419','0420','0421','0422','0423',
  '0501','0502','0503','0504','0505','0506','0507','0508','0509','0510','0511','0512',
  '0601','0602','0603','0604','0605','0606','0607','0608','0609','0610','0611','0612',
  '0613','0614','0615','0616',
  '0701','0702','0703','0704','0705','0706','0707','0708','0709','0710','0711','0712',
  '0713','0714','0715','0716','0717','0718','0719',
  '0801','0802','0803','0804','0805','0806','0807','0808','0809','0810','0811','0812',
  '0813','0814','0815','0816','0817','0818','0819','0820','0821','0822','0823','0824',
  '0825','0826','0827','0828',
  '0901','0902','0903','0904','0905','0906',
  '1001','1002','1003','1004','1005','1006','1007','1008','1009','1010','1011','1012',
  '1013','1014','1015','1016','1017',
  '1101','1102','1103','1104',
  '1201','1202','1203','1204','1205','1206','1207','1208','1209','1210','1211','1212',
  '1213','1214','1215','1216','1217','1218','1219',
  '1301','1302','1303','1304','1305','1306','1307','1308','1309','1310','1311','1312',
  '1313','1314','1315','1316','1317','1318','1319','1320','1321','1322','1323','1324',
  '1325','1326','1327','1328',
  '1401','1402','1403','1404','1405','1406','1407','1408','1409','1410','1411','1412',
  '1413','1414','1415','1416',
  '1501','1502','1503','1504','1505','1506','1507','1508','1509','1510','1511','1512',
  '1513','1514','1515','1516','1517','1518','1519','1520','1521','1522','1523',
  '1601','1602','1603','1604','1605','1606','1607','1608','1609','1610','1611','1612',
  '1613','1614','1615','1616','1617','1618','1619','1620','1621','1622','1623','1624',
  '1625','1626','1627','1628',
  '1701','1702','1703','1704','1705','1706','1707','1708','1709',
  '1801','1802','1803','1804','1805','1806','1807','1808','1809','1810','1811'
]);


function obtenerFechaHoraLocalHonduras() {
  const ahora = new Date();

  const offsetHonduras = -6 * 60; // UTC-6 en minutos
  const fechaUTC = ahora.getTime() + ahora.getTimezoneOffset() * 60000;
  const fechaHonduras = new Date(fechaUTC + offsetHonduras * 60000);

  const yyyy = fechaHonduras.getFullYear();
  const mm = String(fechaHonduras.getMonth() + 1).padStart(2, '0');
  const dd = String(fechaHonduras.getDate()).padStart(2, '0');
  const hh = String(fechaHonduras.getHours()).padStart(2, '0');
  const min = String(fechaHonduras.getMinutes()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

function obtenerFechaFormatoHonduras() {
  const ahora = new Date();
  const offsetHonduras = -6 * 60;
  const fechaUTC = ahora.getTime() + ahora.getTimezoneOffset() * 60000;
  const fechaHonduras = new Date(fechaUTC + offsetHonduras * 60000);

  const dia = String(fechaHonduras.getDate()).padStart(2, '0');
  const mes = String(fechaHonduras.getMonth() + 1).padStart(2, '0');
  const anio = fechaHonduras.getFullYear();

  return `${dia}/${mes}/${anio}`;
}


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

  const [fechaHoraHonduras, setFechaHoraHonduras] = useState('');
  const [idRegistro, setIdRegistro] = useState('');

  const [numeroFactura, setNumeroFactura] = useState('');
  const [resolucionActiva, setResolucionActiva] = useState(null);

  const [impuestosSeleccionados, setImpuestosSeleccionados] = useState([]);
  const [descuentosSeleccionados, setDescuentosSeleccionados] = useState([]);
  const [mostrarImpuesto, setMostrarImpuesto] = useState(false); // Estado para controlar la visibilidad del impuesto
  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState(false); // Estado para controlar el modal


  const handleGuardarEImprimir = async () => {
    try {
      if (facturaProductos.length === 0) {
        alert('Debe agregar al menos un producto.');
        return;
      }

      if (!resolucionActiva) {
        alert('No hay resolución CAI activa.');
        return;
      }

      // Obtener el número de factura actual y calcular el siguiente
      const partesNumeroFactura = resolucionActiva.usadas.split('-'); // Dividir el número de factura en partes
      const numeroActual = parseInt(partesNumeroFactura[3]); // Obtener la última parte numérica
      const nuevoNumero = (numeroActual + 1).toString().padStart(9, '0'); // Incrementar y formatear con ceros a la izquierda
      const nuevoNumeroFactura = `${partesNumeroFactura[0]}-${partesNumeroFactura[1]}-${partesNumeroFactura[2]}-${nuevoNumero}`; // Reconstruir el número de factura

      const subtotal = facturaProductos.reduce((sum, p) => sum + p.monto, 0);
      const isv = parseFloat((subtotal * 0.15).toFixed(2));

      const facturaData = {
        numeroFactura: resolucionActiva.usadas,
        tipoIdent: formData.tipoIdent || 'No especificado',
        identificacion: formData.identificacion || 'No especificado',
        fecha: new Date().toISOString(),
        productos: facturaProductos.map((p) => ({
          idProducto: p.id,
          nombre: p.nombre,
          cantidad: p.cantidad,
          precioUnitario: p.precio,
          subtotal: p.cantidad * p.precio,
        })),
        subtotalFactura: calcularSubtotal(),
        impuestos: impuestosSeleccionados,
        descuentos: descuentosSeleccionados,
        isv,
        total: calcularTotal(),
      };

      // Guardar la factura en la colección "facturas"
      await setDoc(doc(db, 'facturas', idRegistro), {
        ...facturaData,
        id: idRegistro,
      });

      // Actualizar el número de factura en la resolución activa
      const resolucionRef = doc(db, 'resolucionCAI', resolucionActiva.id);
      await updateDoc(resolucionRef, {
        usadas: nuevoNumeroFactura, // Actualizar el número de factura completo
      });

      // Actualizar el stock de los productos
      const batch = writeBatch(db); // Crear un batch para realizar múltiples actualizaciones
      for (const producto of facturaProductos) {
        const productoRef = doc(db, 'productos', producto.id);
        const productoSnap = await getDoc(productoRef);

        if (productoSnap.exists()) {
          const productoData = productoSnap.data();
          const nuevaCantidadStock = (productoData.cantidadStock || 0) - producto.cantidad;

          if (nuevaCantidadStock < 0) {
            alert(`El producto "${producto.nombre}" no tiene suficiente stock.`);
            return;
          }

          batch.update(productoRef, { cantidadStock: nuevaCantidadStock });
        }
      }

      await batch.commit();

      setNumeroFactura(nuevoNumeroFactura); // Actualizar el estado con el nuevo número de factura
      setMostrarModalConfirmacion(true);// Actualizar el estado con el nuevo número de factura
    } catch (error) {
      console.error('Error al guardar e imprimir:', error);
      alert(`Ocurrió un error: ${error.message}`);
    }
  };


  useEffect(() => {
    const obtenerResolucionActiva = async () => {
      try {
        const resolucionesRef = collection(db, 'resolucionCAI');
        const consulta = query(resolucionesRef, where('activa', '==', true));
        const snapshot = await getDocs(consulta);

        if (!snapshot.empty) {
          const docRes = snapshot.docs[0]; // Asumimos que solo hay una activa
          const data = docRes.data();

          setResolucionActiva({ id: docRes.id, ...data });

          // Aquí obtenemos el campo 'usadas' y lo usamos como base para número de factura
          // Asumiendo que 'usadas' es un número
          const usadas = data.usadas || 0;
          // Puedes armar el número con formato o simplemente incrementar
          const siguienteNumero = usadas;

          // Si tienes prefijo o formato, adaptarlo aquí.
          // Ejemplo simple:
          setNumeroFactura(`${siguienteNumero.toString().padStart(6, '0')}`);
        } else {
          // No hay resolución activa
          setNumeroFactura('No hay resolución activa');
        }
      } catch (error) {
        console.error('Error obteniendo resolución activa:', error);
        setNumeroFactura('Error al obtener número factura');
      }
    };

    obtenerResolucionActiva();
  }, []);

  useEffect(() => {
    const generarIDRegistro = async () => {
      const obtenerFechaFormatoFirestore = () => {
        const ahora = new Date();

        const offsetHonduras = -6 * 60; // UTC-6 en minutos
        const fechaUTC = ahora.getTime() + ahora.getTimezoneOffset() * 60000;
        const fechaHonduras = new Date(fechaUTC + offsetHonduras * 60000);

        const anio = fechaHonduras.getFullYear();
        const mes = String(fechaHonduras.getMonth() + 1).padStart(2, '0');
        const dia = String(fechaHonduras.getDate()).padStart(2, '0');
        const hora = String(fechaHonduras.getHours()).padStart(2, '0');
        const minutos = String(fechaHonduras.getMinutes()).padStart(2, '0');

        return `${anio}-${mes}-${dia}-${hora}${minutos}`; // ej: "2025-08-04-1451"
      };

      const idRegistro = obtenerFechaFormatoFirestore();
      setIdRegistro(idRegistro);
    };

    generarIDRegistro();
  }, []);


  useEffect(() => {
    const actualizarFecha = () => {
      setFechaHoraHonduras(obtenerFechaHoraLocalHonduras());
    };

    actualizarFecha(); // Ejecuta inmediatamente

    const intervalo = setInterval(actualizarFecha, 60000); // Cada minuto

    return () => clearInterval(intervalo); // Limpieza al desmontar
  }, []);


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

    const productoOriginal = productos.find(p => p.nombre === nuevoProducto.nombre);
    if (!productoOriginal) {
      alert('Producto no válido o no encontrado.');
      return;
    }

    // Validar que la cantidad seleccionada no exceda la cantidad disponible en stock
    if (nuevoProducto.cantidad > productoOriginal.cantidadStock) {
      erroresModal.cantidad = `La cantidad seleccionada excede el stock disponible (${productoOriginal.cantidadStock}).`;
    }

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
    setFacturaProductos([
      ...facturaProductos,
      {
        id: productoOriginal.id,
        ...nuevoProducto,
        monto,
      }
    ]);
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
    const subtotal = facturaProductos.reduce((sum, p) => sum + p.monto, 0);
    const totalDescuentos = descuentosSeleccionados.reduce((sum, desc) => sum + desc.monto, 0);
    const totalImpuestos = impuestosSeleccionados.reduce((sum, imp) => sum + imp.monto, 0);

    return (subtotal - totalDescuentos + totalImpuestos).toFixed(2);
  };

  const calcularSubtotal = () => {
    return facturaProductos.reduce((sum, p) => sum + p.monto, 0).toFixed(2);
  };

  const validarIdentificacion = () => {
    const { tipoIdent, identificacion } = formData;
    const erroresTmp = {};

    if (tipoIdent === 'DNI') {
      const regexDNI = /^\d{4}-\d{4}-\d{5}$/;
      if (!regexDNI.test(identificacion)) {
        erroresTmp.identificacion = 'Formato DNI inválido. Debe ser XXXX-XXXX-XXXXX';
      } else {
        const [codMun] = identificacion.split('-');
        if (!CODIGOS_VALIDOS_MUNICIPIOS.has(codMun)) {
          erroresTmp.identificacion = 'Código municipal inválido en DNI';
        }
      }

    } else if (tipoIdent === 'RTN') {
      const regexRTN = /^\d{4}-\d{4}-\d{6}$/;
      if (!regexRTN.test(identificacion)) {
        erroresTmp.identificacion = 'Formato RTN inválido. Debe ser XXXX-XXXX-XXXXXX';
      } else {
        const [codMun] = identificacion.split('-');
        if (!CODIGOS_VALIDOS_MUNICIPIOS.has(codMun)) {
          erroresTmp.identificacion = 'Código municipal inválido en RTN';
        }
      }

    } else if (tipoIdent === 'PASAPORTE') {
      const regexPasaporte = /^[A-Z0-9]{6,10}$/;
      if (!regexPasaporte.test(identificacion)) {
        erroresTmp.identificacion = 'Pasaporte inválido. Debe tener entre 6 y 10 caracteres alfanuméricos en mayúsculas.';
      }

    } else if (tipoIdent) {
      erroresTmp.identificacion = 'Tipo de identificación no reconocido';
    }

    setErrores(erroresTmp);
    return Object.keys(erroresTmp).length === 0;
  };


  const handleAgregarDescuentoImpuesto = (item) => {
    const subtotal = facturaProductos.reduce((sum, p) => sum + p.monto, 0);

    if (subtotal <= 0) {
      alert("No se puede aplicar un descuento o impuesto sin productos en la factura.");
      return;
    }

    const monto = (subtotal * (item.porcentaje / 100)).toFixed(2);

    // Actualizar el estado con el nuevo impuesto o descuento
    if (item.tipo === 'Impuesto') {
      setImpuestosSeleccionados((prev) => [
        ...prev,
        { ...item, monto: parseFloat(monto) },
      ]);
    } else if (item.tipo === 'Descuento') {
      setDescuentosSeleccionados((prev) => [
        ...prev,
        { ...item, monto: parseFloat(monto) },
      ]);
    }

    setDescuentoModal(false);
  };

  return (
    <div className="d-flex flex-column vh-100 overflow-auto">
      {/* NAVBAR */}
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
                <button
                  type="button"
                  className="btn btn-outline-danger mt-3"
                  onClick={() => alert('Cerrar sesión')}
                >
                  Cerrar Sesión
                </button>
              </div>
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
                  <Form.Control type="datetime-local" value={fechaHoraHonduras} disabled />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Número de factura</Form.Label>
                  <Form.Control value={numeroFactura} disabled />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>ID Registro</Form.Label>
                  <Form.Control type="text" value={idRegistro} disabled />
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
                  <th>ID</th>
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
                    <td>{prod.id}</td>
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
                <p>Subtotal: L. {calcularSubtotal()}</p>
                {descuentosSeleccionados.map((desc, i) => (
                  <p key={i}>
                    {desc.nombre} ({desc.porcentaje}%): -L. {desc.monto.toFixed(2)}
                  </p>
                ))}
                {impuestosSeleccionados.map((imp, i) => (
                  <p key={i}>
                    {imp.nombre} ({imp.porcentaje}%): +L. {imp.monto.toFixed(2)}
                  </p>
                ))}
                <p>ISV (15%): L. {calcularImpuesto()}</p>
                <h5>Total: L. {calcularTotal()}</h5>
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
                <Button variant="success" onClick={handleGuardarEImprimir}>Guardar e Imprimir</Button>
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
            {impuestosDescuentos
              .filter(item => item.activo) // Filtra solo los activos
              .map((item) => (
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
      <Modal show={mostrarModalConfirmacion} backdrop="static" centered>
        <Modal.Header>
          <Modal.Title>Factura Guardada</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>La factura ha sido guardada y enviada a impresión correctamente.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => window.location.reload()}>Aceptar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
