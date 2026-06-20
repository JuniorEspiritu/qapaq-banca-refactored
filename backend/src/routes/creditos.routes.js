import { Router } from 'express'
import { supabase } from '../db.js'
import { requireAuth, requireRole } from '../auth.js'
import { TEA_POR_TIPO, validarSolicitud } from '../creditCalc.js'

const router = Router()
router.use(requireAuth)

// POST /creditos/solicitar  (rol: cliente)
// body: { tipoCredito: 'Microempresa'|'Consumo', monto, plazo, actividad, ingresoNeto }
router.post('/solicitar', requireRole('cliente'), async (req, res) => {
  const { tipoCredito, monto, plazo, actividad, ingresoNeto } = req.body || {}

  const montoNum = Number(monto)
  const plazoNum = parseInt(plazo, 10)
  const ingresoNum = Number(ingresoNeto)

  if (!TEA_POR_TIPO[tipoCredito]) {
    return res.status(400).json({ detail: 'Tipo de crédito fuera de alcance (solo Microempresa o Consumo).' })
  }
  if (!montoNum || montoNum <= 0) return res.status(400).json({ detail: 'Ingresa un monto válido.' })
  if (!plazoNum || plazoNum <= 0) return res.status(400).json({ detail: 'Ingresa un plazo válido.' })
  if (!ingresoNum || ingresoNum <= 0) return res.status(400).json({ detail: 'Ingresa tu ingreso neto mensual.' })

  const validacion = validarSolicitud({ tipoCredito, monto: montoNum, plazo: plazoNum, ingresoNeto: ingresoNum })
  if (!validacion.ok) {
    return res.status(422).json({ detail: validacion.motivo })
  }

  // Código secuencial SOLxxxxxxx
  const { count } = await supabase
    .from('solicitudes_credito')
    .select('id', { count: 'exact', head: true })

  const codigo = 'SOL' + String((count || 0) + 1).padStart(7, '0')

  const { data, error } = await supabase
    .from('solicitudes_credito')
    .insert({
      codigo,
      usuario_id: req.user.id,
      tipo_credito: tipoCredito,
      actividad: actividad || null,
      monto: montoNum,
      plazo: plazoNum,
      tea: validacion.tea,
      ingreso_neto: ingresoNum,
      cuota_mensual: validacion.cuota,
      rds: validacion.rds,
      scoring: validacion.score,
      categoria_riesgo: validacion.categoria,
      semaforo: validacion.semaforo,
      nivel_aprobacion: validacion.nivelAprobacion,
      estado: 'En Evaluación',
    })
    .select()
    .single()

  if (error) return res.status(500).json({ detail: error.message })

  const nivelTexto = validacion.nivelAprobacion === 'comite'
    ? 'el Comité de Créditos (monto mayor a S/ 8,000)'
    : 'un Asesor de Negocios'

  res.status(201).json({
    mensaje: `Solicitud registrada (RDS ${validacion.rds}%, categoría ${validacion.categoria}). Pasará a evaluación de ${nivelTexto}.`,
    solicitud: data,
  })
})

// GET /creditos/solicitudes  -> historial de solicitudes del cliente
router.get('/solicitudes', async (req, res) => {
  let query = supabase.from('solicitudes_credito').select('*').order('created_at', { ascending: false })

  if (req.user.rol === 'cliente') {
    query = query.eq('usuario_id', req.user.id)
  }

  const { data, error } = await query
  if (error) return res.status(500).json({ detail: error.message })
  res.json(data)
})

export default router
