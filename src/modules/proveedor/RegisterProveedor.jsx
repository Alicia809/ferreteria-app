import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { useNavigate, Link } from 'react-router-dom';
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

function RegisterProveedor() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('bodega');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      if (rol === 'admin') {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'usuarios', cred.user.uid), {
          email,
          rol
        });
      } else {
        const newUserRef = doc(db, 'usuarios', username);
        await setDoc(newUserRef, {
          username,
          password,
          rol
        });
      }

      navigate('/seguridad'); // Volver al menú de seguridad
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
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
                  onClick={handleLogout}
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', paddingTop: '120px' }}>
        <Card className="p-4 shadow-sm w-100" style={{ maxWidth: '700px' }}>
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
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Col>
            </Form.Group>

            <Row>
              <Col sm={{ span: 8, offset: 4 }} className="d-flex justify-content-between">
                <Button variant="secondary" onClick={() => navigate('/seguridad')}>
                  <FaArrowLeft className="me-2" />
                  Regresar
                </Button>
                <Button variant="primary" type="submit">
                  Registrar
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>
      </Container>
    </>
  );
}

export default RegisterProveedor;
