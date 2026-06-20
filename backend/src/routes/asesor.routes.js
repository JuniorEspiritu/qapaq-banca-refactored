import { Router } from 'express'
import { supabase } from '../db.js'
import { requireAuth, requireRole } from '../auth.js'
import { generarCronograma, TEA_POR_TIPO, validarSolicitud, puedeResolver, MONTO_LIMITE_ASESOR } from '../creditCalc.js'

const router = Router()
router.use(requireAuth, requireRole('asesor', 'comite'))

// GET /asesor/solicitudes?estado=En Evaluación
router.get('/solicitudes', async (req, res) => {
  const estado = req.query.estado
  let query = supabase
    .from('solicitudes_credito')
    .select('*, usuarios:usuario_id(codigo, nombre, dni)')
    .order('created_at', { ascending: false })

  if (estado) query = query.eq('estado', estado)

  const { data, error } = await query
  if (error) return res.status(500).json({ detail: error.message })
  res.json(data)
})

// GET /asesor/solicitudes/:id  -> detalle + cronograma simulado
router.get('/solicitudes/:id', async (req, res) => {
  const { data: sol, error } = await supabase
    .from('solicitudes_credito')
    .select('*, usuarios:usuario_id(codigo, nombre, dni)')
    .eq('id', req.params.id)
    .maybeSingle()

  if (error) return res.status(500).json({ detail: error.message })
  if (!sol) return res.status(404).json({ detail: 'Solicitud no encontrada.' })

  const { rows } = generarCronograma(Number(sol.monto), Number(sol.tea), sol.plazo, sol.fecha_solicitud)
  res.json({ ...sol, cronograma: rows })
})

// POST /asesor/solicitudes/:id/rechazar  { comentario }
router.post('/solicitudes/:id/rechazar', async (req, res) => {
  const { comentario } = req.body || {}

  const { data: sol, error: e1 } = await supabase
    .from('solicitudes_credito').select('*').eq('id', req.params.id).maybeSingle()
  if (e1) return res.status(500).json({ detail: e1.message })
  if (!sol) return res.status(404).json({ detail: 'Solicitud no encontrada.' })
  if (sol.estado !== 'En Evaluación') {
    return res.status(409).json({ detail: `La solicitud ya fue resuelta (estado actual: ${sol.estado}).` })
  }
  if (!puedeResolver(req.user.rol, sol.nivel_aprobacion)) {
    return res.status(403).json({
      detail: `Esta solicitud (S/ ${Number(sol.monto).toLocaleString('es-PE')}) requiere la aprobación del Comité de Créditos (monto mayor a S/ ${MONTO_LIMITE_ASESOR.toLocaleString('es-PE')}). Un asesor de negocios no puede resolverla.`,
    })
  }

  const { data, error } = await supabase
    .from('solicitudes_credito')
    .update({
      estado: 'Rechazado',
      comentario_asesor: comentario || 'No cumple con la política de riesgos.',
      asesor_id: req.user.id,
      fecha_resolucion: new Date().toISOString(),
    })
    .eq('id', req.params.id)
    .select()
    .single()

  if (error) return res.status(500).json({ detail: error.message })
  res.json({ mensaje: 'Solicitud rechazada.', solicitud: data })
})

// POST /asesor/solicitudes/:id/aprobar  { comentario }
// Crea el crédito + cronograma + abona el desembolso en la cuenta de ahorro principal del cliente.
router.post('/solicitudes/:id/aprobar', async (req, res) => {
  const { comentario } = req.body || {}

  const { data: sol, error: e1 } = await supabase
    .from('solicitudes_credito').select('*').eq('id', req.params.id).maybeSingle()
  if (e1) return res.status(500).json({ detail: e1.message })
  if (!sol) return res.status(404).json({ detail: 'Solicitud no encontrada.' })
  if (sol.estado !== 'En Evaluación') {
    return res.status(409).json({ detail: `La solicitud ya fue resuelta (estado actual: ${sol.estado}).` })
  }
  if (!puedeResolver(req.user.rol, sol.nivel_aprobacion)) {
    return res.status(403).json({
      detail: `Esta solicitud (S/ ${Number(sol.monto).toLocaleString('es-PE')}) requiere la aprobación del Comité de Créditos (monto mayor a S/ ${MONTO_LIMITE_ASESOR.toLocaleString('es-PE')}). Un asesor de negocios no puede resolverla.`,
    })
  }

  // 1) Generar cronograma
  const fechaDesembolso = new Date().toISOString().slice(0, 10)
  const { cuota, rows } = generarCronograma(Number(sol.monto), Number(sol.tea), sol.plazo, fechaDesembolso, sol.dia_pago || null)

  // 2) Código secuencial del crédito CREXXXXXXX
  const { count } = await supabase.from('creditos').select('id', { count: 'exact', head: true })
  const codigoCredito = 'CRE' + String((count || 0) + 1).padStart(7, '0')

  // 3) Crear crédito
  const { data: credito, error: e2 } = await supabase
    .from('creditos')
    .insert({
      codigo: codigoCredito,
      usuario_id: sol.usuario_id,
      solicitud_id: sol.id,
      tipo_credito: sol.tipo_credito,
      monto: sol.monto,
      plazo: sol.plazo,
      tea: sol.tea,
      cuota_mensual: cuota,
      saldo_pendiente: sol.monto,
      dias_atraso: 0,
      estado: 'Normal',
      fecha_desembolso: fechaDesembolso,
    })
    .select()
    .single()

  if (e2) return res.status(500).json({ detail: e2.message })

  // 4) Insertar cronograma de cuotas
  const cuotasInsert = rows.map((r) => ({ ...r, credito_id: credito.id }))
  const { error: e3 } = await supabase.from('cuotas_credito').insert(cuotasInsert)
  if (e3) return res.status(500).json({ detail: e3.message })

  // 5) Abonar el desembolso en la cuenta de ahorro principal del cliente
  const { data: cuenta, error: e4 } = await supabase
    .from('cuentas_ahorro')
    .select('*')
    .eq('usuario_id', sol.usuario_id)
    .order('codigo')
    .limit(1)
    .maybeSingle()

  if (e4) return res.status(500).json({ detail: e4.message })

  if (cuenta) {
    const nuevoSaldo = Number(cuenta.saldo) + Number(sol.monto)
    await supabase.from('cuentas_ahorro').update({ saldo: nuevoSaldo }).eq('id', cuenta.id)
    await supabase.from('movimientos_ahorro').insert({
      cuenta_id: cuenta.id,
      descripcion: `Desembolso de crédito ${codigoCredito}`,
      monto: Number(sol.monto),
      saldo: nuevoSaldo,
    })
  }

  // 6) Marcar la solicitud como Desembolsado
  const { data: solFinal, error: e5 } = await supabase
    .from('solicitudes_credito')
    .update({
      estado: 'Desembolsado',
      comentario_asesor: comentario || 'Aprobado. Cumple política de riesgos y RDS.',
      asesor_id: req.user.id,
      fecha_resolucion: new Date().toISOString(),
    })
    .eq('id', sol.id)
    .select()
    .single()

  if (e5) return res.status(500).json({ detail: e5.message })

  res.json({
    mensaje: `Solicitud aprobada y desembolsada. Crédito ${codigoCredito} creado con cuota fija S/ ${cuota.toFixed(2)}.`,
    solicitud: solFinal,
    credito,
  })
})

// GET /asesor/clientes?buscar=texto
// Lista clientes para que el asesor "ubique al cliente" (por nombre, correo o DNI).
router.get('/clientes', async (req, res) => {
  const buscar = (req.query.buscar || '').trim()
  let query = supabase
    .from('usuarios')
    .select('id, codigo, nombre, dni')
    .eq('rol', 'cliente')
    .order('nombre')

  if (buscar) {
    query = query.or(`nombre.ilike.%${buscar}%,codigo.ilike.%${buscar}%,dni.ilike.%${buscar}%`)
  }

  const { data, error } = await query
  if (error) return res.status(500).json({ detail: error.message })
  res.json(data)
})

// POST /asesor/solicitudes
// El asesor "registra la solicitud de crédito con los datos del caso" a nombre de un cliente.
// body: { usuarioId, tipoCredito, monto, plazo, actividad, ingresoNeto, diaPago }
router.post('/solicitudes', async (req, res) => {
  const { usuarioId, tipoCredito, monto, plazo, actividad, ingresoNeto, diaPago } = req.body || {}

  const montoNum = Number(monto)
  const plazoNum = parseInt(plazo, 10)
  const ingresoNum = Number(ingresoNeto)

  if (!usuarioId) return res.status(400).json({ detail: 'Selecciona el cliente.' })
  if (!TEA_POR_TIPO[tipoCredito]) {
    return res.status(400).json({ detail: 'Tipo de crédito fuera de alcance (solo Microempresa o Consumo).' })
  }
  if (!montoNum || montoNum <= 0) return res.status(400).json({ detail: 'Ingresa un monto válido.' })
  if (!plazoNum || plazoNum <= 0) return res.status(400).json({ detail: 'Ingresa un plazo válido.' })
  if (!ingresoNum || ingresoNum <= 0) return res.status(400).json({ detail: 'Ingresa el ingreso neto mensual del cliente.' })

  const { data: cliente, error: e1 } = await supabase
    .from('usuarios').select('id, codigo, nombre, rol').eq('id', usuarioId).maybeSingle()
  if (e1) return res.status(500).json({ detail: e1.message })
  if (!cliente || cliente.rol !== 'cliente') return res.status(404).json({ detail: 'Cliente no encontrado.' })

  const validacion = validarSolicitud({ tipoCredito, monto: montoNum, plazo: plazoNum, ingresoNeto: ingresoNum })
  if (!validacion.ok) {
    return res.status(422).json({ detail: validacion.motivo })
  }

  const { count } = await supabase
    .from('solicitudes_credito')
    .select('id', { count: 'exact', head: true })

  const codigo = 'SOL' + String((count || 0) + 1).padStart(7, '0')

  const { data, error } = await supabase
    .from('solicitudes_credito')
    .insert({
      codigo,
      usuario_id: cliente.id,
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
      dia_pago: diaPago ? Number(diaPago) : null,
    })
    .select('*, usuarios:usuario_id(codigo, nombre, dni)')
    .single()

  if (error) return res.status(500).json({ detail: error.message })

  const nivelTexto = validacion.nivelAprobacion === 'comite'
    ? `Comité de Créditos (monto > S/ ${MONTO_LIMITE_ASESOR.toLocaleString('es-PE')})`
    : 'Asesor de Negocios'

  res.status(201).json({
    mensaje: `Solicitud ${codigo} registrada para ${cliente.nombre}. Cuota S/ ${validacion.cuota.toFixed(2)} · RDS ${validacion.rds}% · Categoría ${validacion.categoria} · Requiere aprobación de: ${nivelTexto}.`,
    solicitud: data,
  })
})

export default router
