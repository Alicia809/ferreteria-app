import { Link } from "react-router-dom";

export default function ReportLayout({ title, subtitle, children }) {
  return (
    <div className="reportes-wrapper">
      {/* Header compacto con volver y menú */}
      <div className="reportes-header container-xxl">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <Link to="/reportes" className="btn btn-light btn-sm shadow-sm">
              ← Volver
            </Link>
            <h4 className="mb-0">{title}</h4>
        </div>
        {/* Botón para imprimir el contenido de los reportes */}
        <button
          className="btn btn-outline-secondary btn-sm"
          type="button"
          onClick={() => window.print()} // Llama a la función de impresión del navegador
        >
          Imprimir
        </button>
      </div>
        {subtitle && <p className="text-muted small mt-2 mb-0">{subtitle}</p>}
      </div>

      {/* Contenido con scroll natural */}
      <div className="reportes-content container-xxl">
        {children}
      </div>
    </div>
  );
}
