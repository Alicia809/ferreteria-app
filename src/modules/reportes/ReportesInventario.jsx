import React, { useEffect, useMemo, useState } from "react";
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import ReportLayout from "./ReportLayout";
import { baseOptions, palette, stroke, fmtMoney, fmtNum } from "./chartOptions";
import { useAuth } from '../../components/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function ReportesInventario() {
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState([]);
  const {logout, nombre, rol} = useAuth();
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    (async () => {
      const sP = await getDocs(collection(db, "productos"));
      setProductos(sP.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    })();
  }, []);

  const valorInventario = useMemo(
    () => productos.reduce((acc, p) => acc + (Number(p.cantidadStock || 0) * Number(p.precioCosto || 0)), 0),
    [productos]
  );

  const stockPorCategoria = useMemo(() => {
    const map = new Map();
    productos.forEach(p => {
      const cat = p.categoria || "Sin categoría";
      map.set(cat, (map.get(cat) || 0) + Number(p.cantidadStock || 0));
    });
    return [...map.entries()].map(([categoria, stock]) => ({ categoria, stock }));
  }, [productos]);

  const bajoStock = useMemo(() => {
    const min = p =>
      typeof p.stockMinimo === "number" ? p.stockMinimo :
      typeof p.cantidadMinima === "number" ? p.cantidadMinima : 10;
    return productos
      .map(p => ({ ...p, _min: min(p), _stk: Number(p.cantidadStock || 0) }))
      .filter(p => p._stk <= p._min)
      .sort((a, b) => a._stk - b._stk)
      .slice(0, 15);
  }, [productos]);

  const topStock = useMemo(
    () => [...productos].sort((a, b) => Number(b.cantidadStock||0) - Number(a.cantidadStock||0)).slice(0, 10),
    [productos]
  );

  if (loading) return <ReportLayout title="Reportes de Inventario"><div className="spinner-border" /> Cargando…</ReportLayout>;

  return (
    <div className="scroll-container"
      style={{
        maxHeight: '100vh',
        overflowY: 'auto',
        padding: '2.5rem',
        maxWidth: '1200px',
        width: '100%',
      }}
    >
    <ReportLayout
      title="Reportes de Inventario"
      subtitle={`Valor del inventario: ${fmtMoney(valorInventario)} · Productos en bajo stock: ${fmtNum(bajoStock.length)}`}
    >
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
      <div className="row g-4">
        {/* Stock por categoría */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm chart-card">
            <div className="card-body">
              <div className="chart-summary text-muted small">
                Distribución del stock total por categoría.
              </div>
              <div className="chart-area">
                <Pie
                  data={{
                    labels: stockPorCategoria.map(x => x.categoria),
                    datasets: [{
                      label: "Stock",
                      data: stockPorCategoria.map(x => x.stock),
                      backgroundColor: palette.slice(0, stockPorCategoria.length),
                      borderColor: stroke.slice(0, stockPorCategoria.length),
                      borderWidth: 1
                    }]
                  }}
                  options={baseOptions(false)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Valor de inventario */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm chart-card">
            <div className="card-body d-flex flex-column justify-content-center">
              <h6 className="text-muted mb-2">Valor del inventario (cantidad × costo)</h6>
              <div className="display-6">{fmtMoney(valorInventario)}</div>
              <small className="text-muted">Basado en precio de costo actual.</small>
            </div>
          </div>
        </div>

        {/* Bajo stock */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="text-muted mb-2">Bajo stock</h6>
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead><tr><th>Producto</th><th>Categoría</th><th>Stock</th><th>Mínimo</th></tr></thead>
                  <tbody>
                    {bajoStock.length === 0 && <tr><td colSpan="4" className="text-center">Sin alertas</td></tr>}
                    {bajoStock.map(p => (
                      <tr key={p.id}>
                        <td>{p.nombre || p.id}</td>
                        <td>{p.categoria || "N/D"}</td>
                        <td>{fmtNum(p.cantidadStock || 0)}</td>
                        <td>{fmtNum(p._min)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <small className="text-muted">Listado de hasta 15 referencias con stock ≤ mínimo.</small>
            </div>
          </div>
        </div>

        {/* Top mayor stock */}
        <div className="col-12">
          <div className="card shadow-sm chart-card">
            <div className="card-body">
              <div className="chart-summary text-muted small">
                Referencias con mayor cantidad en inventario.
              </div>
              <div className="chart-area">
                <Bar
                  data={{
                    labels: topStock.map(p => p.nombre || p.id),
                    datasets: [{
                      label: "Unidades",
                      data: topStock.map(p => Number(p.cantidadStock || 0)),
                      backgroundColor: palette[0],
                      borderColor: stroke[0],
                      borderWidth: 1
                    }]
                  }}
                  options={baseOptions(false)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ReportLayout>
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
