import React, { useEffect, useMemo, useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../../firebase";
import ReportLayout from "./ReportLayout";
import { baseOptions, palette, stroke, fmtMoney, fmtNum } from "./chartOptions";
import { subDays, isAfter } from "date-fns";
import { useAuth } from '../../components/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function ReportesProductos() {
  const [loading, setLoading] = useState(true);
  const [facturas, setFacturas] = useState([]);
  const [productos, setProductos] = useState([]);
  const {logout, nombre, rol} = useAuth();
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  useEffect(() => {
    (async () => {
      const qF = query(collection(db, "facturas"), orderBy("fecha", "desc"), limit(6000));
      const sF = await getDocs(qF);
      const _f = sF.docs.map(d => {
        const x = d.data();
        const fecha = x.fecha?.toDate ? x.fecha.toDate() : new Date(x.fecha);
        return { id: d.id, fecha, total: Number(x.total||0), productos: Array.isArray(x.productos) ? x.productos : [] };
      });
      const sP = await getDocs(collection(db, "productos"));
      const _p = sP.docs.map(d => ({ id: d.id, ...d.data() }));
      setFacturas(_f);
      setProductos(_p);
      setLoading(false);
    })();
  }, []);

  const desde = subDays(new Date(), 90);
  const ventas90 = useMemo(() => facturas.filter(f => isAfter(f.fecha, desde)), [facturas, desde]);

  const costo = new Map(productos.map(p => [p.id, Number(p.precioCosto||0)]));
  const venta = new Map(productos.map(p => [p.id, Number(p.precioVenta||0)]));
  const categoria = new Map(productos.map(p => [p.id, p.categoria || "Sin categoría"]));

  // Agregados 90 días
  const agg = {};
  ventas90.forEach(f => (f.productos||[]).forEach(it => {
    const id = it.idProducto || it.nombre || "N/D";
    const cant = Number(it.cantidad||0);
    const pv = Number(it.precioUnitario||venta.get(it.idProducto)||0);
    const pc = Number(it.precioCosto||costo.get(it.idProducto)||0);
    const cat = categoria.get(it.idProducto) || "Sin categoría";
    agg[id] = agg[id] || { nombre: it.nombre || id, unidades: 0, ingresos: 0, margen: 0, categoria: cat };
    agg[id].unidades += cant;
    agg[id].ingresos += pv * cant;
    agg[id].margen += (pv - pc) * cant;
  }));
  const arr = Object.values(agg);

  const topIngresos = [...arr].sort((a,b)=>b.ingresos-a.ingresos).slice(0,10);
  const topMargen   = [...arr].sort((a,b)=>b.margen-a.margen).slice(0,10);

  const ingresosPorCatMap = arr.reduce((m,x)=>{ m[x.categoria]=(m[x.categoria]||0)+x.ingresos; return m; },{});
  const catLabels = Object.keys(ingresosPorCatMap);
  const ingresosPorCat = catLabels.map(k=>ingresosPorCatMap[k]);

  const sinVenta90 = productos.filter(p => !arr.find(x => x.nombre===p.nombre || x.id===p.id));
  const totalIngresos90 = arr.reduce((s,x)=>s+x.ingresos,0);
  const totalMargen90   = arr.reduce((s,x)=>s+x.margen,0);

  if (loading) return <ReportLayout title="Reportes de Productos"><div className="spinner-border" /> Cargando…</ReportLayout>;

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
      title="Reportes de Productos"
      subtitle={`Ingresos 90 días: ${fmtMoney(totalIngresos90)} · Margen: ${fmtMoney(totalMargen90)} · Sin venta 90 días: ${fmtNum(sinVenta90.length)}`}
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
        {/* Top por ingresos */}
        <div className="col-12 col-xl-6">
          <div className="card shadow-sm chart-card">
            <div className="card-body">
              <div className="chart-summary text-muted small">Productos con mayores ingresos en 90 días.</div>
              <div className="chart-area">
                <Bar
                  data={{
                    labels: topIngresos.map(x => x.nombre),
                    datasets: [{
                      label: "Ingresos",
                      data: topIngresos.map(x => x.ingresos),
                      backgroundColor: palette[0],
                      borderColor: stroke[0],
                      borderWidth: 1
                    }]
                  }}
                  options={baseOptions(true)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top por margen */}
        <div className="col-12 col-xl-6">
          <div className="card shadow-sm chart-card">
            <div className="card-body">
              <div className="chart-summary text-muted small">Productos con mayor margen bruto en 90 días.</div>
              <div className="chart-area">
                <Bar
                  data={{
                    labels: topMargen.map(x => x.nombre),
                    datasets: [{
                      label: "Margen",
                      data: topMargen.map(x => x.margen),
                      backgroundColor: palette[2],
                      borderColor: stroke[2],
                      borderWidth: 1
                    }]
                  }}
                  options={baseOptions(true)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Ingresos por categoría */}
        <div className="col-12">
          <div className="card shadow-sm chart-card">
            <div className="card-body">
              <div className="chart-summary text-muted small">Participación de ingresos por categoría (90 días).</div>
              <div className="chart-area">
                <Doughnut
                  data={{
                    labels: catLabels,
                    datasets: [{
                      label: "Ingresos",
                      data: ingresosPorCat,
                      backgroundColor: palette.slice(0, catLabels.length),
                      borderColor: stroke.slice(0, catLabels.length),
                      borderWidth: 1
                    }]
                  }}
                  options={baseOptions(true)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sin venta 90 días */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="text-muted mb-2">Productos sin venta en 90 días</h6>
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead><tr><th>Producto</th><th>Categoría</th><th>Stock</th></tr></thead>
                  <tbody>
                    {sinVenta90.length === 0 && <tr><td colSpan="3" className="text-center">Todos tuvieron ventas</td></tr>}
                    {sinVenta90.slice(0,15).map(p => (
                      <tr key={p.id}>
                        <td>{p.nombre || p.id}</td>
                        <td>{p.categoria || "N/D"}</td>
                        <td>{fmtNum(p.cantidadStock || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <small className="text-muted">Se muestran hasta 15 referencias sin movimiento.</small>
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
