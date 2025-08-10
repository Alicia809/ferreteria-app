import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import RutaProtegida from './components/RutaProtegida';
import RutaProtegidaRol from './components/RutaProtegidaRol';
import Productos from './modules/inventario/Productos';
import Proveedores from './modules/proveedor/Proveedores';
import Inventario from './modules/inventario/Inventario';
import Facturacion from './modules/facturacion/Facturacion';
import RegistroFacturas from './modules/facturacion/RegistroFacturas';
import FacturaCliente from './modules/facturacion/FacturaCliente';
import ResolucionCAI from './modules/facturacion/ResolucionCAI';
import ImpuestosDescuentos from './modules/facturacion/ImpuestosDescuentos';
import Reportes from './modules/reportes/Reportes';
import CrudSeguridad from './modules/seguridad/CrudSeguridad';
import Login from './modules/seguridad/Login';
import Register from './modules/seguridad/Register';
import Eliminar from './modules/seguridad/Eliminar';
import Editar from './modules/seguridad/Editar';
import Mostrar from './modules/seguridad/Mostrar';
import RegisterProveedor from './modules/proveedor/RegisterProveedor';
import EliminarProveedor from './modules/proveedor/EliminarProveedor';
import EditarProveedor from './modules/proveedor/EditarProveedor';
import MostrarProveedor from './modules/proveedor/MostrarProveedor';
import NuevoProducto from './modules/inventario/NuevoProducto';
import ActualizacionManual from './modules/inventario/ActualizacionManual';
import ActualizacionAjusteManual from './modules/inventario/ActualizacionAjusteManual';
import ActualizacionDevolucionCompra from './modules/inventario/ActualizacionDevolucionCompra';
import ActualizacionDevolucionVenta from './modules/inventario/ActualizacionDevolucionVenta';
import ListadoAjustes from './modules/inventario/ListadoAjustes';
import ListadoReabastecimientos from './modules/inventario/ListadoReabastecimientos';
import ReabastecerStock from './modules/inventario/ReabastecerStock';
import NotFound from './NotFound';
import Home from './Home';
import ReportesVentas from './modules/reportes/ReportesVentas.jsx';
import ReportesInventario from "./modules/reportes/ReportesInventario.jsx";
import ReportesProductos from "./modules/reportes/ReportesProductos.jsx";
import ReportesCompras from "./modules/reportes/ReportesCompras.jsx";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* INICIO */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <RutaProtegidaRol rolesPermitidos={['bodega', 'ventas', 'admin']}>
              <Home />
            </RutaProtegidaRol>
          } />

          {/* SEGURIDAD */}
          <Route path="/seguridad" element={
            <RutaProtegidaRol rolesPermitidos={['bodega', 'ventas', 'admin']}>
              <CrudSeguridad />
            </RutaProtegidaRol>
          } />
          <Route path="/register" element={
            <RutaProtegidaRol rolesPermitidos={['admin']}>
              <Register />
            </RutaProtegidaRol>
          } />
          <Route path="/eliminar" element={
            <RutaProtegidaRol rolesPermitidos={['admin']}>
              <Eliminar />
            </RutaProtegidaRol>
          } />
          <Route path="/editar" element={
            <RutaProtegidaRol rolesPermitidos={['bodega', 'ventas', 'admin']}>
              <Editar />
            </RutaProtegidaRol>
          } />
          <Route path="/mostrar" element={
            <RutaProtegidaRol rolesPermitidos={['bodega', 'ventas', 'admin']}>
              <Mostrar />
            </RutaProtegidaRol>
          } />

          {/* PROVEEDORES */}
          <Route path="/proveedores" element={
            <RutaProtegidaRol rolesPermitidos={['bodega', 'admin']}>
              <Proveedores />
            </RutaProtegidaRol>
          } />  
          <Route path="/registerProveedor" element={
            <RutaProtegidaRol rolesPermitidos={['bodega', 'admin']}>
              <RegisterProveedor />
            </RutaProtegidaRol>
          } />
          <Route path="/eliminarProveedor" element={
            <RutaProtegidaRol rolesPermitidos={['bodega', 'admin']}>
              <EliminarProveedor />
            </RutaProtegidaRol>
          } />
          <Route path="/editarProveedor" element={
            <RutaProtegidaRol rolesPermitidos={['bodega', 'admin']}>
              <EditarProveedor />
            </RutaProtegidaRol>
          } />
          <Route path="/mostrarProveedor" element={
            <RutaProtegidaRol rolesPermitidos={['bodega', 'admin']}>
              <MostrarProveedor />
            </RutaProtegidaRol>
          } />

          {/* INVENTARIO */}
          <Route path="/inventario" element={
            <RutaProtegidaRol rolesPermitidos={['bodega','admin']}>
              <Inventario />
            </RutaProtegidaRol>
          } />
          <Route path="/productos" element={
            <RutaProtegidaRol rolesPermitidos={['bodega', 'admin']}>
              <Productos />
            </RutaProtegidaRol>
          } />        
          <Route path="/inventario/nuevo" element={
            <RutaProtegidaRol rolesPermitidos={['bodega', 'admin']}>
              <NuevoProducto />
            </RutaProtegidaRol>
          } />
          <Route path="/inventario/actualizacion" element={
            <RutaProtegidaRol rolesPermitidos={['bodega', 'admin']}>
              <ActualizacionManual />
            </RutaProtegidaRol>
          } />
          <Route path="/inventario/actualizacion/ajuste" element={
            <RutaProtegidaRol rolesPermitidos={['bodega', 'admin']}>
              <ActualizacionAjusteManual />
            </RutaProtegidaRol>
          } />
          <Route path="/inventario/actualizacion/ajustesRealizados" element={
            <RutaProtegidaRol rolesPermitidos={['bodega', 'admin']}>
              <ListadoAjustes />
            </RutaProtegidaRol>
          } />
          <Route path="/inventario/actualizacion/compra" element={
            <RutaProtegidaRol  rolesPermitidos={['bodega', 'admin']}>
              <ActualizacionDevolucionCompra />
            </RutaProtegidaRol>
          } />
          <Route path="/inventario/actualizacion/venta" element={
            <RutaProtegidaRol rolesPermitidos={['bodega', 'admin']}>
              <ActualizacionDevolucionVenta />
            </RutaProtegidaRol>
          } />
          <Route path="/inventario/reabastecer" element={
            <RutaProtegidaRol rolesPermitidos={['bodega', 'admin']}>
              <ReabastecerStock />
            </RutaProtegidaRol>
          } />
          <Route path="/inventario/reabastecer/historialStocks" element={
            <RutaProtegidaRol rolesPermitidos={['bodega', 'admin']}>
              <ListadoReabastecimientos />
            </RutaProtegidaRol>
          } />

          {/* FACTURACIÓN */}
          <Route path="/facturacion" element={
            <RutaProtegidaRol rolesPermitidos={['ventas', 'admin']}>
              <Facturacion />
            </RutaProtegidaRol>
          } />
          <Route path="/facturacion/registro" element={
            <RutaProtegidaRol rolesPermitidos={['ventas', 'admin']}>
              <RegistroFacturas />
            </RutaProtegidaRol>
          } />
          <Route path="/facturacion/cliente" element={
            <RutaProtegidaRol rolesPermitidos={['ventas', 'admin']}>
              <FacturaCliente />
            </RutaProtegidaRol>
          } />
          <Route path="/facturacion/resolucionCai" element={
            <RutaProtegidaRol rolesPermitidos={['ventas', 'admin']}>
              <ResolucionCAI />
            </RutaProtegidaRol>
          } />
          <Route path="/facturacion/impuestosDescuentos" element={
            <RutaProtegidaRol rolesPermitidos={['ventas', 'admin']}>
              <ImpuestosDescuentos />
            </RutaProtegidaRol>
          } />

          {/* REPORTES */}
          <Route path="/reportes" element={
            <RutaProtegidaRol rolesPermitidos={['bodega', 'ventas', 'admin']}>
              <Reportes />
            </RutaProtegidaRol>
          } />
          <Route path="/reportes/ventas" element={
            <RutaProtegidaRol rolesPermitidos={['bodega', 'ventas', 'admin']}>
              <ReportesVentas />
            </RutaProtegidaRol>
          } />
          <Route path="/reportes/inventario" element={
            <RutaProtegidaRol rolesPermitidos={['bodega', 'ventas', 'admin']}>
              <ReportesInventario />
            </RutaProtegidaRol>
          } />
          <Route path="/reportes/productos" element={
            <RutaProtegidaRol rolesPermitidos={['bodega', 'ventas', 'admin']}>
              <ReportesProductos />
            </RutaProtegidaRol>
          } />
          <Route path="/reportes/compras" element={
            <RutaProtegidaRol rolesPermitidos={['bodega', 'ventas', 'admin']}>
              <ReportesCompras />
            </RutaProtegidaRol>
          } />

          {/* PAGINA DE ERROR */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;