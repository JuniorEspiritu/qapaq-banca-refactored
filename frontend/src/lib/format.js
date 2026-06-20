export const fmt = (v) =>
  'S/ ' + Number(v || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const fmtDate = (d) => {
  if (!d) return '—'
  // Parsear como fecha local para evitar el desfase UTC
  const [anio, mes, dia] = String(d).split('-').map(Number)
  if (!anio || !mes || !dia) return d
  return `${String(dia).padStart(2,'0')}/${String(mes).padStart(2,'0')}/${anio}`
}

export const fmtDateTime = (d) => {
  if (!d) return '—'
  const date = new Date(d)
  if (isNaN(date.getTime())) return d
  return date.toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })
}