const MAP = {
  Normal: 'normal',
  'En Evaluación': 'eval',
  Activo: 'activo',
  Mora: 'mora',
  'En mora': 'mora',
  Aprobado: 'aprobado',
  Desembolsado: 'desembolsado',
  Rechazado: 'rechazado',
  Pagada: 'aprobado',
  Pendiente: 'eval',
  Vencida: 'rechazado',
}

export default function Badge({ estado }) {
  const cls = MAP[estado] || 'eval'
  return <span className={`hb-badge ${cls}`}>{estado}</span>
}
