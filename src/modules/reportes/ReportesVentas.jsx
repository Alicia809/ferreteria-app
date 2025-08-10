import React, { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../../firebase";
import ReportLayout from "./ReportLayout";
import { baseOptions, palette, stroke, fmtMoney, fmtNum } from "./chartOptions";
import { format, subMonths, startOfMonth, isSameMonth } from "date-fns";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);

const last12 = () => {
  const out = [], now = new Date();
  for (let i = 11; i >= 0; i--) out.push(format(subMonths(now, i), "MMM yyyy"));
  return out;
};

export default function ReportesVentas() {
  const [loading, setLoading] = useState(true);
  const [facturas, setFacturas] = useState([]);
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    (async () => {
      const qF = query(collection(db, "facturas"), orderBy("fecha", "desc"), limit(6000));
      const sF = await getDocs(qF);
      const _f = sF.docs.map(d => {
        const x = d.data();
        const fecha = x.fecha?.toDate ? x.fecha.toDate() : new Date(x.fecha);
        return { id: d.id, fecha, total: +x.total || 0, productos: Array.isArray(x.productos) ? x.productos : [] };
      });
      const sP = await getDocs(collection(db, "productos"));
      const _p = sP.docs.map(d => ({ id: d.id, ...d.data() }));
      setFacturas(_f);
      setProductos(_p);
      setLoading(false);
    })();
  }, []);

  const labels = last12();

  // Ingresos por mes
  const ingresosMes = useMemo(() => {
    const now = new Date(), b = Object.fromEntries(labels.map(l => [l, 0]));
    for (const f of facturas) {
      const ms = startOfMonth(f.fecha);
      for (let i = 0; i < 12; i++) {
        const t = startOfMonth(subMonths(now, i));
        if (isSameMonth(ms, t)) { b[format(t, "MMM yyyy")] += f.total; break; }
      }
    }
    return labels.map(l => b[l]);
  }, [facturas, labels]);

  // Costos por mes (estimado)
  const costosMes = useMemo(() => {
    const costoUnit = new Map(productos.map(p => [p.id, +p.precioCosto || 0]));
    const now = new Date(), b = Object.fromEntries(labels.map(l => [l, 0]));
    for (const f of facturas) {
      let c = 0;
      (f.productos || []).forEach(it => {
        const cu = +it.precioCosto || costoUnit.get(it.idProducto) || 0;
        c += cu * (+it.cantidad || 0);
      });
      const ms = startOfMonth(f.fecha);
      for (let i = 0; i < 12; i++) {
        const t = startOfMonth(subMonths(now, i));
        if (isSameMonth(ms, t)) { b[format(t, "MMM yyyy")] += c; break; }
      }
    }
    return labels.map(l => b[l]);
  }, [facturas, productos, labels]);

  // Resúmenes
  const totalIngresos = useMemo(() => ingresosMes.reduce((a, b) => a + b, 0), [ingresosMes]);
  const totalCostos   = useMemo(() => costosMes.reduce((a, b) => a + b, 0), [costosMes]);
  const margen        = totalIngresos - totalCostos;
  const ticketProm    = useMemo(() => {
    // promedio mensual simple sobre los meses con ventas
    const mesesConVenta = ingresosMes.filter(x => x > 0);
    return mesesConVenta.length ? (totalIngresos / mesesConVenta.length) : 0;
  }, [ingresosMes, totalIngresos]);

  // Top 5 productos (unidades)
  const top5 = useMemo(() => {
    const m = new Map();
    facturas.forEach(f => (f.productos || []).forEach(it => {
      const name = it.nombre || it.idProducto || "Producto";
      m.set(name, (m.get(name) || 0) + (+it.cantidad || 0));
    }));
    return [...m.entries()].map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad).slice(0, 5);
  }, [facturas]);

  if (loading) {
    return <ReportLayout title="Reportes de Ventas"><div className="spinner-border" /> Cargando…</ReportLayout>;
  }

  return (
    <ReportLayout
      title="Reportes de Ventas"
      subtitle={`Ingresos 12M: ${fmtMoney(totalIngresos)} · Costos: ${fmtMoney(totalCostos)} · Margen: ${fmtMoney(margen)} · Ticket prom.: ${fmtMoney(ticketProm)}`}
    >
      <div className="row g-4">

        {/* Ventas por mes */}
        <div className="col-12">
          <div className="card shadow-sm chart-card">
            <div className="card-body">
              <div className="chart-summary text-muted small">
                Tendencia mensual de ingresos (últimos 12 meses).
              </div>
              <div className="chart-area">
                <Line
                  data={{
                    labels,
                    datasets: [{
                      label: "Ingresos",
                      data: ingresosMes,
                      borderColor: stroke[0],
                      backgroundColor: palette[0],
                      tension: 0.3,
                      borderWidth: 2,
                      pointRadius: 0
                    }]
                  }}
                  options={baseOptions(true)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Ingresos vs Costos */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm chart-card">
            <div className="card-body">
              <div className="chart-summary text-muted small">
                Comparativa de ingresos vs. costos estimados por mes.
              </div>
              <div className="chart-area">
                <Bar
                  data={{
                    labels,
                    datasets: [
                      { label: "Ingresos", data: ingresosMes, backgroundColor: palette[0], borderColor: stroke[0], borderWidth: 1 },
                      { label: "Costos",   data: costosMes,   backgroundColor: palette[2], borderColor: stroke[2], borderWidth: 1 }
                    ]
                  }}
                  options={baseOptions(true)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top 5 vendidos */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm chart-card">
            <div className="card-body">
              <div className="chart-summary text-muted small">
                Productos con mayor rotación (unidades vendidas).
              </div>
              <div className="chart-area">
                <Doughnut
                  data={{
                    labels: top5.map(x => x.nombre),
                    datasets: [{
                      label: "Unidades",
                      data: top5.map(x => x.cantidad),
                      backgroundColor: palette.slice(0, top5.length),
                      borderColor: stroke.slice(0, top5.length),
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
