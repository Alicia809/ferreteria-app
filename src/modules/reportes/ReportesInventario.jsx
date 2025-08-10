import React, { useEffect, useMemo, useState } from "react";
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import ReportLayout from "./ReportLayout";
import { baseOptions, palette, stroke, fmtMoney, fmtNum } from "./chartOptions";

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function ReportesInventario() {
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState([]);

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
    <ReportLayout
      title="Reportes de Inventario"
      subtitle={`Valor del inventario: ${fmtMoney(valorInventario)} · Productos en bajo stock: ${fmtNum(bajoStock.length)}`}
    >
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
  );
}
