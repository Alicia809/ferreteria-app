import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import {
  Container,
  Form,
  Button,
  Card,
  Row,
  Col,
  Alert
} from 'react-bootstrap';
import { FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../../components/AuthContext';

function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('bodega');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);


  const { logout, nombre } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validar contraseña según estándar de Google
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

    if (!passwordRegex.test(password)) {
      setError(
        'La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y un carácter especial.'
      );
      return;
    }

    try {
      const fechaCreado = new Date().toLocaleString('es-ES', {
        timeZone: 'America/Tegucigalpa',
        hour12: true,
      });

      if (rol === 'admin') {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'usuarios', cred.user.uid), {
          email,
          rol,
          nombreCreador: nombre,
          nombreEditor: nombre,
          activo: true,
          fechaCreado,
          fechaEditado: fechaCreado
        });
      } else {
        const newUserRef = doc(db, 'usuarios', username);
        await setDoc(newUserRef, {
          username,
          password,
          rol,
          nombreCreador: nombre,
          nombreEditor: nombre,
          activo: true,
          fechaCreado,
          fechaEditado: fechaCreado
        });
      }

      navigate('/seguridad');
    } catch (err) {
      setError(err.message);
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

      {/* CONTENIDO PRINCIPAL */}
      <div className="card p-4 shadow-lg" style={{ width: '700px' }}>
        <h3 className="text-center mb-4">Registrar Usuario</h3>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleRegister}>
          <Form.Group as={Row} className="mb-3 align-items-center" controlId="rol">
            <Form.Label column sm={4} className="text-end mb-0">
              Rol
            </Form.Label>
            <Col sm={8}>
              <Form.Select value={rol} onChange={(e) => setRol(e.target.value)}>
                <option value="admin">Administrador general</option>
                <option value="bodega">Encargado de bodega</option>
                <option value="ventas">Encargado de ventas</option>
              </Form.Select>
            </Col>
          </Form.Group>

          {rol === 'admin' ? (
            <Form.Group as={Row} className="mb-3 align-items-center" controlId="email">
              <Form.Label column sm={4} className="text-end mb-0">
                Correo Electrónico
              </Form.Label>
              <Col sm={8}>
                <Form.Control
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Col>
            </Form.Group>
          ) : (
            <Form.Group as={Row} className="mb-3 align-items-center" controlId="username">
              <Form.Label column sm={4} className="text-end mb-0">
                Nombre de Usuario
              </Form.Label>
              <Col sm={8}>
                <Form.Control
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </Col>
            </Form.Group>
          )}

          <Form.Group as={Row} className="mb-4 align-items-center" controlId="password">
            <Form.Label column sm={4} className="text-end mb-0">
              Contraseña
            </Form.Label>
            <Col sm={8}>
              <div className="input-group">
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  variant="outline-secondary"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </div>
            </Col>
          </Form.Group>


          <Row className="mt-3">
            <Col xs={6} className="d-flex justify-content-start">
              <Button variant="secondary" onClick={() => navigate('/seguridad')}>
                Regresar
              </Button>
            </Col>
            <Col xs={6} className="d-flex justify-content-end">
              <Button variant="primary" type="submit">
                Registrar
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    </>
  );
}

export default Register;
