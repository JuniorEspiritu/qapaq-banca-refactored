import { Router } from 'express'
import { supabase } from '../db.js'
import { requireAuth } from '../auth.js'

const router = Router()
router.use(requireAuth)

// GET /cuentas/ahorro
router.get('/ahorro', async (req, res) => {
  const { data, error } = await supabase
    .from('cuentas_ahorro')
    .select('*')
    .eq('usuario_id', req.user.id)
    .order('codigo')

  if (error) return res.status(500).json({ detail: error.message })
  res.json(data)
})

// GET /cuentas/ahorro/:codigo/movimientos
router.get('/ahorro/:codigo/movimientos', async (req, res) => {
  const { data: cuenta, error: e1 } = await supabase
    .from('cuentas_ahorro')
    .select('id, usuario_id')
    .eq('codigo', req.params.codigo)
    .maybeSingle()

  if (e1) return res.status(500).json({ detail: e1.message })
  if (!cuenta || cuenta.usuario_id !== req.user.id) {
    return res.status(404).json({ detail: 'Cuenta no encontrada.' })
  }

  const { data, error } = await supabase
    .from('movimientos_ahorro')
    .select('*')
    .eq('cuenta_id', cuenta.id)
    .order('fecha', { ascending: false })

  if (error) return res.status(500).json({ detail: error.message })
  res.json(data)
})

// GET /cuentas/credito  -> créditos vigentes del cliente
router.get('/credito', async (req, res) => {
  const { data, error } = await supabase
    .from('creditos')
    .select('*')
    .eq('usuario_id', req.user.id)
    .order('codigo')

  if (error) return res.status(500).json({ detail: error.message })
  res.json(data)
})

// GET /cuentas/credito/:codigo/cuotas
router.get('/credito/:codigo/cuotas', async (req, res) => {
  const { data: credito, error: e1 } = await supabase
    .from('creditos')
    .select('id, usuario_id')
    .eq('codigo', req.params.codigo)
    .maybeSingle()

  if (e1) return res.status(500).json({ detail: e1.message })
  if (!credito || credito.usuario_id !== req.user.id) {
    return res.status(404).json({ detail: 'Crédito no encontrado.' })
  }

  const { data, error } = await supabase
    .from('cuotas_credito')
    .select('*')
    .eq('credito_id', credito.id)
    .order('numero')

  if (error) return res.status(500).json({ detail: error.message })
  res.json(data)
})

export default router
