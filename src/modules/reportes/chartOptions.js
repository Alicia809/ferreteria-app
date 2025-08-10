export const palette = [
  "rgba(25, 118, 210, 0.35)",
  "rgba(46, 125, 50, 0.35)",
  "rgba(211, 47, 47, 0.35)",
  "rgba(123, 31, 162, 0.35)",
  "rgba(255, 143, 0, 0.35)",
  "rgba(0, 172, 193, 0.35)",
  "rgba(142, 65, 197, 0.35)",
];

export const stroke = [
  "rgb(25, 118, 210)",
  "rgb(46, 125, 50)",
  "rgb(211, 47, 47)",
  "rgb(123, 31, 162)",
  "rgb(255, 143, 0)",
  "rgb(0, 172, 193)",
  "rgb(142, 65, 197)",
];

export const fmtNum = n =>
  new Intl.NumberFormat("es-HN", { maximumFractionDigits: 0 }).format(n ?? 0);

export const fmtMoney = n =>
  "L. " + new Intl.NumberFormat("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n ?? 0);

export const baseOptions = (isMoney = false) => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: { intersect: false, mode: "index" },
  scales: {
    x: { grid: { display: false } },
    y: {
      beginAtZero: true,
      ticks: {
        callback: v => isMoney ? fmtMoney(v) : fmtNum(v)
      }
    }
  },
  plugins: {
    legend: { position: "bottom" },
    tooltip: {
      callbacks: {
        label: ctx => {
          const v = ctx.parsed.y;
          return `${ctx.dataset.label}: ${isMoney ? fmtMoney(v) : fmtNum(v)}`;
        }
      }
    }
  }
});
