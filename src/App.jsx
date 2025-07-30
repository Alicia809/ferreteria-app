import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import RutaProtegida from './components/RutaProtegida';
import Productos from './modules/inventario/Productos';
import Inventario from './modules/inventario/Inventario';
import Facturacion from './modules/facturacion/Facturacion';
import Reportes from './modules/reportes/Reportes';
import CrudSeguridad from './modules/seguridad/CrudSeguridad';
import Login from './modules/seguridad/Login';
import Register from './modules/seguridad/Register';
import Eliminar from './modules/seguridad/Eliminar';
import Editar from './modules/seguridad/Editar';
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
