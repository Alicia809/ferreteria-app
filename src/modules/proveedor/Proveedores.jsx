import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaUserPlus, FaUserEdit, FaUserTimes, FaUsers } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Proveedores = () => {
  const navigate = useNavigate();

  const opciones = [
    {
      icon: <FaUserPlus size={40} color="#0d6efd" />,
      title: 'Nuevo Proveedor',
      description: 'Registra nuevos proveedores.',
      route: '/registerProveedor',
    },
    {
      icon: <FaUserEdit size={40} color="#0d6efd" />,
      title: 'Editar Proveedor',
      description: 'Modifica la información de provedores existentes.',
      route: '/editarProveedor',
    },
    {
      icon: <FaUserTimes size={40} color="#0d6efd" />,
      title: 'Eliminar Proveedor',
      description: 'Elimina proveedores.',
      route: '/eliminarProveedor',
    },
    {
      icon: <FaUsers size={40} color="#0d6efd" />,
      title: 'Ver Proveedores',
      description: 'Ver la lista de proveedores actuales.',
      route: '/mostrarProveedor',
    },
  ];

  return (
    <>
      {/* Navbar */}
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
                <button type="button" className="btn btn-outline-danger mt-3">
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <Container className="text-center" style={{ marginTop: '120px' }}>
        <Row className="justify-content-center">
          {opciones.map((op, index) => (
            <Col key={index} xs={12} md={6} lg={4} className="mb-4">
              <Card
                className="h-100 p-4 border-0 shadow-sm hover-shadow"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(op.route)}
              >
                <div className="mb-3">{op.icon}</div>
                <h5 className="fw-bold">{op.title}</h5>
                <p className="text-muted">{op.description}</p>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default Proveedores;
