import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import RutaProtegida from './components/RutaProtegida';
import Productos from './modules/inventario/Productos';
import Proveedores from './modules/proveedor/Proveedores';
import Inventario from './modules/inventario/Inventario';
import Facturacion from './modules/facturacion/Facturacion';
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
import ReabastecerStock from './modules/inventario/ReabastecerStock';
import NotFound from './NotFound';
import Home from './Home';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <RutaProtegida>
              <Home />
            </RutaProtegida>
          } />
          <Route path="/seguridad" element={
            <RutaProtegida>
              <CrudSeguridad />
            </RutaProtegida>
          } />
          <Route path="/register" element={
            <RutaProtegida>
              <Register />
            </RutaProtegida>
          } />
          <Route path="/eliminar" element={
            <RutaProtegida>
              <Eliminar />
            </RutaProtegida>
          } />
          <Route path="/editar" element={
            <RutaProtegida>
              <Editar />
            </RutaProtegida>
          } />
          <Route path="/mostrar" element={
            <RutaProtegida>
              <Mostrar />
            </RutaProtegida>
          } />
          <Route path="/registerProveedor" element={
            <RutaProtegida>
              <RegisterProveedor />
            </RutaProtegida>
          } />
          <Route path="/eliminarProveedor" element={
            <RutaProtegida>
              <EliminarProveedor />
            </RutaProtegida>
          } />
          <Route path="/editarProveedor" element={
            <RutaProtegida>
              <EditarProveedor />
            </RutaProtegida>
          } />
          <Route path="/mostrarProveedor" element={
            <RutaProtegida>
              <MostrarProveedor />
            </RutaProtegida>
          } />
          <Route path="/inventario" element={
            <RutaProtegida>
              <Inventario />
            </RutaProtegida>
          } />
          <Route path="/productos" element={
            <RutaProtegida>
              <Productos />
            </RutaProtegida>
          } />
          <Route path="/proveedores" element={
            <RutaProtegida>
              <Proveedores />
            </RutaProtegida>
          } />
          


          <Route path="/inventario/nuevo" element={
            <RutaProtegida>
              <NuevoProducto />
            </RutaProtegida>
          } />
          <Route path="/inventario/actualizacion" element={
            <RutaProtegida>
              <ActualizacionManual />
            </RutaProtegida>
          } />
          <Route path="/inventario/reabastecer" element={
            <RutaProtegida>
              <ReabastecerStock />
            </RutaProtegida>
          } />



          <Route path="/facturacion" element={
            <RutaProtegida>
              <Facturacion />
            </RutaProtegida>
          } />
          <Route path="/reportes" element={
            <RutaProtegida>
              <Reportes />
            </RutaProtegida>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;