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

function numeroALetras(num) {
  const unidades = [
    '', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
    'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis',
    'diecisiete', 'dieciocho', 'diecinueve'
  ];
  const decenas = [
    '', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta',
    'sesenta', 'setenta', 'ochenta', 'noventa'
  ];
  const centenas = [
    '', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos',
    'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'
  ];

  if (num === 0) return 'cero centavos';

  const parteEntera = Math.floor(num);
  const parteDecimal = Math.round((num - parteEntera) * 100);

  function convertir(n) {
    if (n < 20) return unidades[n];
    if (n < 100) {
      return decenas[Math.floor(n / 10)] + (n % 10 !== 0 ? ' y ' + unidades[n % 10] : '');
    }
    if (n < 1000) {
      if (n === 100) return 'cien';
      return centenas[Math.floor(n / 100)] + ' ' + convertir(n % 100);
    }
    if (n < 1000000) {
      const miles = Math.floor(n / 1000);
      const resto = n % 1000;
      return (miles === 1 ? 'mil' : convertir(miles) + ' mil') + (resto > 0 ? ' ' + convertir(resto) : '');
    }
    return 'número demasiado grande';
  }

  return `${convertir(parteEntera)} Lempiras con ${parteDecimal.toString().padStart(2, '0')}/100 Centavos`;
}

// Formato de fecha legible: dd/mm/yyyy
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

async function obtenerNumerosRestantes() {
  try {
    const resolucionesRef = collection(db, 'resolucionCAI');
    const consulta = query(resolucionesRef, where('activa', '==', true));
    const snapshot = await getDocs(consulta);

    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();

      let numeroActual = 0;
      if (typeof data.usadas === 'string' && data.usadas.includes('-')) {
        const partesNumero = data.usadas.split('-');
        numeroActual = parseInt(partesNumero[3]) || 0;
      } else if (typeof data.usadas === 'number') {
        numeroActual = data.usadas;
      }

      let numeroFinal = 0;
      if (typeof data.numero_final === 'string' && data.numero_final.includes('-')) {
        const partesFinal = data.numero_final.split('-');
        numeroFinal = parseInt(partesFinal[3]) || 0;
      } else if (typeof data.numero_final === 'number') {
        numeroFinal = data.numero_final;
      }

      return numeroFinal - numeroActual;
    }
    return null;
  } catch (error) {
    console.error('Error al obtener números restantes:', error);
    return null;
  }
}



export default function FacturaCliente() {
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

  const {logout, nombre, rol } = useAuth();

  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  const [numerosRestantes, setNumerosRestantes] = useState(null);
  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  

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
      const nuevoNumero = (numeroActual + 1).toString().padStart(8, '0'); // Incrementar y formatear con ceros a la izquierda
      const nuevoNumeroFactura = `${partesNumeroFactura[0]}-${partesNumeroFactura[1]}-${partesNumeroFactura[2]}-${nuevoNumero}`; // Reconstruir el número de factura

      const subtotal = facturaProductos.reduce((sum, p) => sum + p.monto, 0);
      const isv = parseFloat((subtotal * 0.15).toFixed(2));
      const fechaHoraHonduras = new Date().toLocaleString('es-HN', {
        timeZone: 'America/Tegucigalpa',
        hour12: true
      });

      const facturaData = {
        numeroFactura: resolucionActiva.usadas || 'No especificado',
        tipoIdent: formData.tipoIdent || 'No especificado',
        identificacion: formData.identificacion || 'No especificado',
        fecha: fechaHoraHonduras || 'No especificado',
        productos: facturaProductos.map((p) => ({
          idProducto: p.id || 'No especificado',
          nombre: p.nombre || 'No especificado',
          cantidad: p.cantidad || 0,
          precioUnitario: p.precio || 0,
          subtotal: p.cantidad * p.precio || 0,
        })),
        subtotalFactura: calcularSubtotal() || 0,
        impuestos: impuestosSeleccionados || [],
        descuentos: descuentosSeleccionados || [],
        isv : isv || 0,
        total: calcularTotal() || 0,
        usuarioEncargado: nombre || 'Desconocido',
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
            alert(`El producto "${producto.nombreY}" no tiene suficiente stock.`);
            return;
          }

          batch.update(productoRef, { cantidadStock: nuevaCantidadStock });
        }
      }

      await batch.commit();

      setNumeroFactura(nuevoNumeroFactura); // Actualizar el estado con el nuevo número de factura
      
      setTimeout(async () => {
        const input = document.getElementById('facturaPDF');
        if (!input) {
          alert('Error: No se encontró el contenedor del PDF.');
          return;
        }

        try {
          const canvas = await html2canvas(input, { scale: 2, useCORS: true });
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          const width = pdf.internal.pageSize.getWidth();
          const height = (canvas.height * width) / canvas.width;

          pdf.addImage(imgData, 'PNG', 10, 10, width - 20, height);
          const blob = pdf.output('blob');
          const url = URL.createObjectURL(blob);
          const win = window.open(url, '_blank');

          if (!win) {
            alert('El navegador bloqueó la ventana emergente. Por favor, habilítala.');
          }
        } catch (err) {
          console.error('Error generando PDF:', err);
          alert('Error al generar el PDF. Revisa la consola.');
        }
      }, 300);

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
      const verificarNumeros = async () => {
        const restantes = await obtenerNumerosRestantes();
        if (restantes !== null) {
          setNumerosRestantes(restantes);
          setMostrarAlerta(restantes < 15);
        } else {
          setMostrarAlerta(false);
        }
      };

      verificarNumeros();
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

    if (!nuevoProducto.nombre) erroresModal.nombreY = 'Debe seleccionar un producto';
    if (!nuevoProducto.cantidad || nuevoProducto.cantidad <= 0) erroresModal.cantidad = 'Cantidad inválida';
    if (!nuevoProducto.precio || nuevoProducto.precio <= 0) erroresModal.precio = 'Precio inválido';

    const productoOriginal = productos.find(p => p.nombreY === nuevoProducto.nombre);
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

    const yaExiste = facturaProductos.some(p => p.nombreY === nuevoProducto.nombre);
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
    const producto = productos.find(p => p.nombreY === nombreSeleccionado);
    if (producto) {
      setNuevoProducto({ ...nuevoProducto, nombre: producto.nombreY, precio: producto.precioVenta });
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
      <div className="scroll-container"
        style={{
          maxHeight: '100vh',
          overflowY: 'auto',
          padding: '2.5rem',
          maxWidth: '1200px',
          width: '100%',
        }}
      >
        <Container style={{ marginTop: '90px' }}>        
          <Card>
            {mostrarAlerta && numerosRestantes !== null && (
              <div className="alert alert-warning" role="alert">
                Quedan <strong>{numerosRestantes}</strong> números disponibles para llegar al límite de la resolución CAI.
              </div>
            )}
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
                      {desc.nombreY} ({desc.porcentaje}%): -L. {desc.monto.toFixed(2)}
                    </p>
                  ))}
                  {impuestosSeleccionados.map((imp, i) => (
                    <p key={i}>
                      {imp.nombreY} ({imp.porcentaje}%): +L. {imp.monto.toFixed(2)}
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
      </div>
      <Modal show={productoModal} onHide={() => setProductoModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Producto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Campo de búsqueda con lupa */}
          <Form.Group className="mb-2">
            <Form.Label>Buscar producto</Form.Label>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Buscar producto..."
                value={terminoBusqueda}
                onChange={(e) => setTerminoBusqueda(e.target.value)}
              />
              <InputGroup.Text>
                <FaSearch />
              </InputGroup.Text>
            </InputGroup>
          </Form.Group>

          {/* Lista de productos filtrados */}
          <Form.Group className="mb-2">
            <Form.Select
              value={nuevoProducto.nombre}
              onChange={(e) => handleSeleccionProducto(e.target.value)}
            >
              <option value="">-- Seleccionar --</option>
              {productos
                .filter((p) =>
                  p.nombreY?.toLowerCase().includes(terminoBusqueda?.toLowerCase() || '')
                )
                .map((p) => (
                  <option key={p.id} value={p.nombreY}>
                    {p.nombreY}
                  </option>
                ))}
            </Form.Select>
            {errores.nombreY && (
              <div className="text-danger small">{errores.nombreY}</div>
            )}
          </Form.Group>

          {/* Cantidad */}
          <Form.Group className="mb-2">
            <Form.Label>Cantidad</Form.Label>
            <Form.Control
              type="number"
              value={nuevoProducto.cantidad}
              onChange={(e) =>
                setNuevoProducto({
                  ...nuevoProducto,
                  cantidad: parseInt(e.target.value) || 0,
                })
              }
            />
            {errores.cantidad && (
              <div className="text-danger small">{errores.cantidad}</div>
            )}
          </Form.Group>

          {/* Precio unitario */}
          <Form.Group>
            <Form.Label>Precio Unitario</Form.Label>
            <Form.Control type="number" value={nuevoProducto.precio} readOnly />
            {errores.precio && (
              <div className="text-danger small">{errores.precio}</div>
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setProductoModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleAgregarProducto}>
            Agregar
          </Button>
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
      {/* Contenedor OCULTO */}
      <div
        id="facturaPDF"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '-9999px',
          width: '800px', 
          padding: '40px',
          fontFamily: 'Arial, sans-serif',
          backgroundColor: '#fff',
          fontSize: '14px', 
          color: '#000',
          boxSizing: 'border-box',
          lineHeight: '1.2', 
        }}
      >
      {/* Encabezado */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '15px',
        borderBottom: '1px solid #000',
        paddingBottom: '10px',
      }}>

      <div style={{ flex: 1, textAlign: 'left' }}>
        <h2 style={{ margin: '0', fontSize: '18px', fontWeight: 'bold' }}>COMERCIAL Y FERRETERÍA MATEO</h2>
        <p style={{ margin: '2px 0' }}>RTN: 08011999123456</p>
        <p style={{ margin: '2px 0' }}>DIRECCIÓN: Una cuadra y media al sur del jardín de niños Horizontes Luminosos, El Rosario, Comayagua</p>
        <p style={{ margin: '2px 0' }}>Tel: (504) 9876-5432</p>
        <p style={{ margin: '2px 0' }}>Correo: comercialmateo@gmail.com</p>
        <p style={{ margin: "2px 0" }}>
          CAI: {resolucionActiva?.correlativo || "ORDEN DE VENTA"}
        </p>
        <p style={{ margin: "2px 0" }}>
          Rango Autorizado:{" "}
          {resolucionActiva?.numero_inicial || "N/A"} al{" "}
          {resolucionActiva?.numero_final || "N/A"}
        </p>
        <p style={{ margin: "2px 0" }}>
          Fecha Límite Emisión:{" "}
          {resolucionActiva?.fecha_limite_emision || "N/A"}
        </p>
      </div>


        <div style={{ textAlign: 'right', minWidth: '150px' }}>
          <img src="/Logo.png" alt="Logo" style={{ height: '100px', objectFit: 'contain' }} />
        </div>
      </div>



        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '10px',
        }}>
          <div style={{
            border: '1px solid black',
            padding: '5px 10px',
            fontSize: '14px',
            fontWeight: 'bold',
          }}>
            ORDEN DE VENTA<br />
            No. {resolucionActiva?.usadas}
          </div>
          <div style={{ fontSize: '14px', textAlign: 'right' }}>
            FECHA: {obtenerFechaFormatoHonduras()}
          </div>
        </div>

        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px',
          backgroundColor: '#eee', 
          padding: '5px 10px',
          fontWeight: 'bold',
          fontSize: '14px',
        }}>
          <span>CLIENTE: Consumidor Final</span> 
          <span>{formData.tipoIdent || 'No especificado'}: {formData.identificacion || 'No especificado'}</span>
        </div>

        {/* Tabla de productos */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderTop: '1px solid #000', borderBottom: '1px solid #000', backgroundColor: '#e0e0e0' }}> 
              <th style={{ textAlign: 'left', padding: '5px' }}>CANTIDAD</th>
              <th style={{ textAlign: 'left', padding: '5px' }}>DESCRIPCION</th>
              <th style={{ textAlign: 'right', padding: '5px' }}>PRECIO UNITARIO</th>
              <th style={{ textAlign: 'right', padding: '5px' }}>DESCUENTO</th>
              <th style={{ textAlign: 'right', padding: '5px' }}>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {facturaProductos.map((p, i) => (
              <tr key={i} style={{ borderBottom: '1px dashed #ccc' }}> 
                <td style={{ padding: '5px', textAlign: 'left' }}>{p.cantidad}</td>
                <td style={{ padding: '5px', textAlign: 'left' }}>{p.nombre}</td>
                <td style={{ padding: '5px', textAlign: 'right' }}>L. {p.precio.toFixed(2)}</td>
                <td style={{ padding: '5px', textAlign: 'right' }}>L. 0.00</td> 
                <td style={{ padding: '5px', textAlign: 'right' }}>L. {p.monto.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totales*/}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '14px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '300px', 
            padding: '2px 0',
          }}>
            <span>SUBTOTAL:</span>
            <span>L. {calcularSubtotal()}</span>
          </div>
          {descuentosSeleccionados.map((d, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '300px',
              padding: '2px 0',
            }}>
              <span>DESCUENTO ({d.nombre} {d.porcentaje}%):</span>
              <span>-L. {d.monto.toFixed(2)}</span>
            </div>
          ))}
          {impuestosSeleccionados.map((i, idx) => (
            <div key={idx} style={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '300px',
              padding: '2px 0',
            }}>
              <span>IMPUESTO ({i.nombre} {i.porcentaje}%):</span>
              <span>+L. {i.monto.toFixed(2)}</span>
            </div>
          ))}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '300px',
            padding: '2px 0',
            borderTop: '1px solid #000',
            marginTop: '5px',
            fontWeight: 'bold',
          }}>
            <span>TOTAL:</span>
            <span>L. {calcularTotal()}</span>
          </div>
        </div>

        {/* Total en letras */}
        <div style={{ marginTop: '15px', fontSize: '14px', textAlign: 'left', width: '100%' }}>
          <p style={{ margin: 0 }}>Total en letras:</p>
          <p style={{ margin: '2px 0', fontWeight: 'bold' }}>{numeroALetras(parseFloat(calcularTotal())).toUpperCase()} </p>
        </div>

        {/* Número de unidades facturadas */}
        <div style={{ marginTop: '15px', fontSize: '14px', textAlign: 'left', width: '100%' }}>
          <p style={{ margin: 0 }}>Total de unidades facturadas: {facturaProductos.reduce((sum, p) => sum + p.cantidad, 0)}</p>
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
    </div>
  );
}
