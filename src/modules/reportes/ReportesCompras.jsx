import React, { useEffect, useMemo, useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../../firebase";
import ReportLayout from "./ReportLayout";
import { baseOptions, palette, stroke, fmtNum } from "./chartOptions";
import { format, subMonths, startOfMonth, isSameMonth } from "date-fns";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const last12 = () => {
  const out = [], now = new Date();
  for (let i = 11; i >= 0; i--) out.push(format(subMonths(now, i), "MMM yyyy"));
  return out;
};

export default function ReportesCompras() {
  const [loading, setLoading] = useState(true);
  const [reabs, setReabs] = useState([]);

  useEffect(() => {
    (async () => {
      const q = query(collection(db, "reabastecimientos"), orderBy("fecha", "desc"), limit(6000));
      const s = await getDocs(q);
      const _r = s.docs.map(d => {
        const x = d.data();
        const fecha = x.fecha?.toDate ? x.fecha.toDate() : new Date(x.fecha);
        return {
          id: d.id,
          fecha,
          cantidad: Number(x.cantidad || 0),
          productoId: x.productoId || "",
          proveedorNombre: x.proveedorNombre || x.proveedorId || "Proveedor",
        };
      });
      setReabs(_r);
      setLoading(false);
    })();
  }, []);

  const labels = last12();

  const unidadesMes = useMemo(() => {
    const now = new Date();
    const b = Object.fromEntries(labels.map(l => [l, 0]));
    reabs.forEach(r => {
      const ms = startOfMonth(r.fecha);
      for (let i = 0; i < 12; i++) {
        const t = startOfMonth(subMonths(now, i));
        if (isSameMonth(ms, t)) { b[format(t, "MMM yyyy")] += r.cantidad; break; }
      }
    });
    return labels.map(l => b[l]);
  }, [reabs, labels]);

  const totalUnidades = useMemo(() => unidadesMes.reduce((a, b) => a + b, 0), [unidadesMes]);

  const topProveedores = useMemo(() => {
    const map = new Map();
    reabs.forEach(r => map.set(r.proveedorNombre, (map.get(r.proveedorNombre) || 0) + r.cantidad));
    return [...map.entries()].map(([proveedor, cantidad]) => ({ proveedor, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad).slice(0, 10);
  }, [reabs]);

  const topProductos = useMemo(() => {
    const map = new Map();
    reabs.forEach(r => map.set(r.productoId, (map.get(r.productoId) || 0) + r.cantidad));
    return [...map.entries()].map(([productoId, cantidad]) => ({ productoId, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad).slice(0, 10);
  }, [reabs]);

  if (loading) return <ReportLayout title="Reportes de Compras"><div className="spinner-border" /> Cargando…</ReportLayout>;

  return (
    <ReportLayout
      title="Reportes de Compras"
      subtitle={`Unidades reabastecidas (12 meses): ${fmtNum(totalUnidades)} · Proveedores con movimiento: ${fmtNum(topProveedores.length)}`}
    >
      <div className="row g-4">
        {/* Reabastecido por mes */}
        <div className="col-12">
          <div className="card shadow-sm chart-card">
            <div className="card-body">
              <div className="chart-summary text-muted small">
                Unidades reabastecidas por mes (últimos 12 meses).
              </div>
              <div className="chart-area">
                <Bar
                  data={{
                    labels,
                    datasets: [{
                      label: "Unidades",
                      data: unidadesMes,
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

        {/* Top proveedores */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm chart-card">
            <div className="card-body">
              <div className="chart-summary text-muted small">
                Principales proveedores por unidades suministradas.
              </div>
              <div className="chart-area">
                <Doughnut
                  data={{
                    labels: topProveedores.map(x => x.proveedor),
                    datasets: [{
                      label: "Unidades",
                      data: topProveedores.map(x => x.cantidad),
                      backgroundColor: palette.slice(0, topProveedores.length),
                      borderColor: stroke.slice(0, topProveedores.length),
                      borderWidth: 1
                    }]
                  }}
                  options={baseOptions(false)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top productos reabastecidos */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm chart-card">
            <div className="card-body">
              <div className="chart-summary text-muted small">
                Productos más reabastecidos por unidades.
              </div>
              <div className="chart-area">
                <Bar
                  data={{
                    labels: topProductos.map(x => x.productoId),
                    datasets: [{
                      label: "Unidades",
                      data: topProductos.map(x => x.cantidad),
                      backgroundColor: palette[1],
                      borderColor: stroke[1],
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
