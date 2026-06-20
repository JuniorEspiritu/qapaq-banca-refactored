import { Router } from 'express'
import { supabase } from '../db.js'
import { requireAuth, requireRole } from '../auth.js'

const router = Router()
router.use(requireAuth, requireRole('asesor', 'comite'))

// ── R1: Consulta de cartera morosa con KPIs ────────────────────────
// GET /mora/cartera?banda=Preventiva
router.get('/cartera', async (req, res) => {
  const banda = req.query.banda

  let query = supabase
    .from('creditos')
    .select('*, usuarios:usuario_id(codigo, nombre, dni)')
    .gt('dias_atraso', 0)
    .order('dias_atraso', { ascending: false })

  if (banda && banda !== 'Todas') {
    query = query.eq('banda_mora', banda)
  }

  const { data, error } = await query
  if (error) return res.status(500).json({ detail: error.message })

  const total = data.length
  const saldoTotal = data.reduce((s, c) => s + Number(c.saldo_pendiente), 0)
  const porBanda = {
    Preventiva: data.filter(c => c.banda_mora === 'Preventiva'),
    Temprana:   data.filter(c => c.banda_mora === 'Temprana'),
    Tardía:     data.filter(c => c.banda_mora === 'Tardía'),
    Judicial:   data.filter(c => c.banda_mora === 'Judicial'),
    Castigo:    data.filter(c => c.banda_mora === 'Castigo'),
  }

  res.json({
    creditos: data,
    kpis: {
      total,
      saldoTotal,
      porBanda: Object.fromEntries(
        Object.entries(porBanda).map(([k, v]) => [k, {
          cantidad: v.length,
          saldo: v.reduce((s, c) => s + Number(c.saldo_pendiente), 0),
        }])
      ),
    },
  })
})

// ── R2: Registrar gestión de cobranza ─────────────────────────────
// POST /mora/gestiones
router.post('/gestiones', async (req, res) => {
  const { creditoId, tipoGestion, resultado, comentario, montoPrometido, fechaPromesa } = req.body || {}

  if (!creditoId) return res.status(400).json({ detail: 'creditoId es obligatorio.' })
  if (!tipoGestion) return res.status(400).json({ detail: 'tipoGestion es obligatorio.' })
  if (!resultado) return res.status(400).json({ detail: 'resultado es obligatorio.' })

  const { data: credito, error: e1 } = await supabase
    .from('creditos').select('id, dias_atraso, banda_mora').eq('id', creditoId).maybeSingle()
  if (e1) return res.status(500).json({ detail: e1.message })
  if (!credito) return res.status(404).json({ detail: 'Crédito no encontrado.' })

  const { data, error } = await supabase
    .from('gestiones_cobranza')
    .insert({
      credito_id: creditoId,
      usuario_id: req.user.id,
      tipo_gestion: tipoGestion,
      resultado,
      comentario: comentario || null,
      monto_prometido: montoPrometido || null,
      fecha_promesa: fechaPromesa || null,
    })
    .select()
    .single()

  if (error) return res.status(500).json({ detail: error.message })
  res.status(201).json({ mensaje: 'Gestión registrada.', gestion: data })
})

// ── R2: Historial de gestiones de un crédito ──────────────────────
// GET /mora/gestiones/:creditoId
router.get('/gestiones/:creditoId', async (req, res) => {
  const { data, error } = await supabase
    .from('gestiones_cobranza')
    .select('*, usuarios:usuario_id(nombre, rol)')
    .eq('credito_id', req.params.creditoId)
    .order('fecha', { ascending: false })

  if (error) return res.status(500).json({ detail: error.message })
  res.json(data)
})

// ── R3: Derivar a Judicial (≥121 días) ────────────────────────────
// POST /mora/judicial/:creditoId
router.post('/judicial/:creditoId', async (req, res) => {
  const { comentario } = req.body || {}

  const { data: credito, error: e1 } = await supabase
    .from('creditos').select('*').eq('id', req.params.creditoId).maybeSingle()
  if (e1) return res.status(500).json({ detail: e1.message })
  if (!credito) return res.status(404).json({ detail: 'Crédito no encontrado.' })

  if (credito.dias_atraso < 121) {
    return res.status(422).json({
      detail: `El crédito tiene ${credito.dias_atraso} días de atraso. Se requieren mínimo 121 días para derivar a Judicial.`,
    })
  }
  if (credito.banda_mora === 'Judicial' || credito.banda_mora === 'Castigo') {
    return res.status(409).json({ detail: `El crédito ya está en estado ${credito.banda_mora}.` })
  }

  const { data, error } = await supabase
    .from('creditos')
    .update({ banda_mora: 'Judicial', estado: 'Mora' })
    .eq('id', req.params.creditoId)
    .select().single()

  if (error) return res.status(500).json({ detail: error.message })

  await supabase.from('gestiones_cobranza').insert({
    credito_id: req.params.creditoId,
    usuario_id: req.user.id,
    tipo_gestion: 'Derivación Judicial',
    resultado: 'Derivado a judicial',
    comentario: comentario || `Crédito derivado a Judicial con ${credito.dias_atraso} días de atraso.`,
  })

  res.json({ mensaje: 'Crédito derivado a Judicial correctamente.', credito: data })
})

// ── R3: Castigar crédito (>180 días) — SOLO COMITÉ ───────────────
// POST /mora/castigo/:creditoId
router.post('/castigo/:creditoId', requireRole('comite'), async (req, res) => {
  const { comentario } = req.body || {}

  const { data: credito, error: e1 } = await supabase
    .from('creditos').select('*').eq('id', req.params.creditoId).maybeSingle()
  if (e1) return res.status(500).json({ detail: e1.message })
  if (!credito) return res.status(404).json({ detail: 'Crédito no encontrado.' })

  if (credito.dias_atraso <= 180) {
    return res.status(422).json({
      detail: `El crédito tiene ${credito.dias_atraso} días de atraso. Se requieren más de 180 días para castigar.`,
    })
  }
  if (credito.banda_mora === 'Castigo') {
    return res.status(409).json({ detail: 'El crédito ya está castigado.' })
  }

  const { data, error } = await supabase
    .from('creditos')
    .update({ banda_mora: 'Castigo', estado: 'Mora' })
    .eq('id', req.params.creditoId)
    .select().single()

  if (error) return res.status(500).json({ detail: error.message })

  await supabase.from('gestiones_cobranza').insert({
    credito_id: req.params.creditoId,
    usuario_id: req.user.id,
    tipo_gestion: 'Castigo Contable',
    resultado: 'Castigado',
    comentario: comentario || `Crédito castigado contablemente con ${credito.dias_atraso} días de atraso.`,
  })

  res.json({ mensaje: 'Crédito castigado correctamente.', credito: data })
})

export default router
