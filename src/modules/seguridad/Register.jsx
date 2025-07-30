import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { useNavigate } from 'react-router-dom';
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

function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('bodega');
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
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
                  placeholder="usuario123"
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
                placeholder="••••••••"
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
  );
}

export default Register;
