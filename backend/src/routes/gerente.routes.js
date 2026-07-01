import { Router } from 'express'
import { supabase } from '../db.js'
import { requireAuth, requireRole } from '../auth.js'

const router = Router()
router.use(requireAuth, requireRole('gerente'))

router.get('/dashboard', async (_req, res) => {
  const [
    { data: creditos, error: eCreditos },
    { data: solicitudes, error: eSolicitudes },
    { data: usuarios, error: eUsuarios },
    { data: cuentas, error: eCuentas },
  ] = await Promise.all([
    supabase.from('creditos').select('monto, saldo_pendiente, dias_atraso, banda_mora, tipo_credito, fecha_desembolso, estado'),
    supabase.from('solicitudes_credito').select('estado, monto, fecha_solicitud'),
    supabase.from('usuarios').select('rol'),
    supabase.from('cuentas_ahorro').select('saldo, estado'),
  ])

  const error = eCreditos || eSolicitudes || eUsuarios || eCuentas
  if (error) return res.status(500).json({ detail: error.message })

  const carteraTotal = creditos.reduce((s, c) => s + Number(c.saldo_pendiente), 0)
  const carteraAtrasada = creditos
    .filter(c => Number(c.dias_atraso) > 0)
    .reduce((s, c) => s + Number(c.saldo_pendiente), 0)

  const ratioMora = carteraTotal > 0 ? (carteraAtrasada / carteraTotal) * 100 : 0
  const semaforoMora = ratioMora <= 4 ? 'verde' : ratioMora <= 8 ? 'amarillo' : 'rojo'

  const bandas = ['Al día', 'Preventiva', 'Temprana', 'Tardía', 'Judicial', 'Castigo']
  const distribucionBanda = bandas.map(b => ({
    banda: b,
    cantidad: creditos.filter(c => (c.banda_mora || 'Al día') === b).length,
    saldo: creditos
      .filter(c => (c.banda_mora || 'Al día') === b)
      .reduce((s, c) => s + Number(c.saldo_pendiente), 0),
  }))

  const tipos = [...new Set(creditos.map(c => c.tipo_credito))]
  const carteraPorTipo = tipos.map(t => ({
    tipo: t,
    monto: creditos.filter(c => c.tipo_credito === t).reduce((s, c) => s + Number(c.monto), 0),
    cantidad: creditos.filter(c => c.tipo_credito === t).length,
  }))

  const evolucionMap = {}
  for (const c of creditos) {
    if (!c.fecha_desembolso) continue
    const mes = String(c.fecha_desembolso).slice(0, 7)
    if (!evolucionMap[mes]) evolucionMap[mes] = { mes, monto: 0, cantidad: 0 }
    evolucionMap[mes].monto += Number(c.monto)
    evolucionMap[mes].cantidad += 1
  }
  const evolucionMensual = Object.values(evolucionMap).sort((a, b) => a.mes.localeCompare(b.mes))

  const estadosEmbudo = ['En Evaluación', 'Aprobado', 'Rechazado', 'Desembolsado']
  const embudoSolicitudes = estadosEmbudo.map(e => ({
    estado: e,
    cantidad: solicitudes.filter(s => s.estado === e).length,
  }))

  const clientesActivos = usuarios.filter(u => u.rol === 'cliente').length
  const asesores = usuarios.filter(u => u.rol === 'asesor').length
  const comite = usuarios.filter(u => u.rol === 'comite').length
  const creditosVigentes = creditos.filter(c => c.estado !== 'Cancelado').length

  res.json({
    kpis: { carteraTotal, carteraAtrasada, ratioMora: Number(ratioMora.toFixed(2)), semaforoMora, clientesActivos, creditosVigentes, asesores, comite },
    distribucionBanda,
    carteraPorTipo,
    evolucionMensual,
    embudoSolicitudes,
  })
})

export default router