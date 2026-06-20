import { Router } from 'express'
import { supabase } from '../db.js'
import { requireAuth } from '../auth.js'

const router = Router()
router.use(requireAuth)

async function getCuentaPropia(usuarioId, codigo) {
  const { data, error } = await supabase
    .from('cuentas_ahorro')
    .select('*')
    .eq('codigo', codigo)
    .eq('usuario_id', usuarioId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data
}

async function registrarMovimiento(cuentaId, descripcion, monto, saldoNuevo) {
  const { error } = await supabase.from('movimientos_ahorro').insert({
    cuenta_id: cuentaId, descripcion, monto, saldo: saldoNuevo,
  })
  if (error) throw new Error(error.message)
}

// POST /operaciones/transferencia
// body: { origen, destino, monto, concepto }
router.post('/transferencia', async (req, res) => {
  try {
    const { origen, destino, monto, concepto } = req.body || {}
    const montoNum = Number(monto)
    if (!montoNum || montoNum <= 0) return res.status(400).json({ detail: 'Ingresa un monto válido.' })
    if (origen === destino) return res.status(400).json({ detail: 'La cuenta origen y destino no pueden ser iguales.' })

    const cOrigen = await getCuentaPropia(req.user.id, origen)
    if (!cOrigen) return res.status(404).json({ detail: 'Cuenta origen no encontrada.' })
    if (Number(cOrigen.saldo) < montoNum) return res.status(422).json({ detail: 'Saldo insuficiente en la cuenta origen.' })

    const cDestino = await getCuentaPropia(req.user.id, destino)
    if (!cDestino) return res.status(404).json({ detail: 'Cuenta destino no encontrada.' })

    const nuevoSaldoOrigen = Number(cOrigen.saldo) - montoNum
    const nuevoSaldoDestino = Number(cDestino.saldo) + montoNum

    await supabase.from('cuentas_ahorro').update({ saldo: nuevoSaldoOrigen }).eq('id', cOrigen.id)
    await supabase.from('cuentas_ahorro').update({ saldo: nuevoSaldoDestino }).eq('id', cDestino.id)

    const desc = concepto ? `Transferencia a ${destino} — ${concepto}` : `Transferencia a ${destino}`
    await registrarMovimiento(cOrigen.id, desc, -montoNum, nuevoSaldoOrigen)
    await registrarMovimiento(cDestino.id, `Transferencia de ${origen}`, montoNum, nuevoSaldoDestino)

    res.json({
      mensaje: 'Transferencia realizada con éxito.',
      origen, destino, monto: montoNum,
      fecha: new Date().toISOString(),
    })
  } catch (e) {
    res.status(500).json({ detail: e.message })
  }
})

// POST /operaciones/pago-credito
// body: { codigoCredito, cuentaOrigen, monto }
router.post('/pago-credito', async (req, res) => {
  try {
    const { codigoCredito, cuentaOrigen, monto } = req.body || {}
    const montoNum = Number(monto)
    if (!montoNum || montoNum <= 0) return res.status(400).json({ detail: 'Ingresa un monto válido.' })

    const { data: credito, error: e1 } = await supabase
      .from('creditos').select('*').eq('codigo', codigoCredito).maybeSingle()
    if (e1) throw new Error(e1.message)
    if (!credito || credito.usuario_id !== req.user.id) return res.status(404).json({ detail: 'Crédito no encontrado.' })

    const cuenta = await getCuentaPropia(req.user.id, cuentaOrigen)
    if (!cuenta) return res.status(404).json({ detail: 'Cuenta origen no encontrada.' })
    if (Number(cuenta.saldo) < montoNum) return res.status(422).json({ detail: 'Saldo insuficiente.' })

    const nuevoSaldoCuenta = Number(cuenta.saldo) - montoNum
    const nuevoSaldoCredito = Math.max(0, Number(credito.saldo_pendiente) - montoNum)

    await supabase.from('cuentas_ahorro').update({ saldo: nuevoSaldoCuenta }).eq('id', cuenta.id)
    await supabase.from('creditos').update({ saldo_pendiente: nuevoSaldoCredito }).eq('id', credito.id)
    await registrarMovimiento(cuenta.id, `Pago de cuota — crédito ${codigoCredito}`, -montoNum, nuevoSaldoCuenta)

    // Marca la siguiente cuota pendiente como pagada
    const { data: siguienteCuota } = await supabase
      .from('cuotas_credito')
      .select('id').eq('credito_id', credito.id).eq('estado', 'Pendiente')
      .order('numero').limit(1).maybeSingle()
    if (siguienteCuota) {
      await supabase.from('cuotas_credito').update({ estado: 'Pagada' }).eq('id', siguienteCuota.id)
    }

    res.json({
      mensaje: 'Pago de cuota registrado correctamente.',
      codigoCredito, monto: montoNum, saldoPendiente: nuevoSaldoCredito,
      fecha: new Date().toISOString(),
    })
  } catch (e) {
    res.status(500).json({ detail: e.message })
  }
})

// POST /operaciones/pago-servicio
// body: { servicio, referencia, cuentaOrigen, monto }
router.post('/pago-servicio', async (req, res) => {
  try {
    const { servicio, referencia, cuentaOrigen, monto } = req.body || {}
    const montoNum = Number(monto)
    if (!montoNum || montoNum <= 0) return res.status(400).json({ detail: 'Ingresa un monto válido.' })

    const cuenta = await getCuentaPropia(req.user.id, cuentaOrigen)
    if (!cuenta) return res.status(404).json({ detail: 'Cuenta origen no encontrada.' })
    if (Number(cuenta.saldo) < montoNum) return res.status(422).json({ detail: 'Saldo insuficiente.' })

    const nuevoSaldo = Number(cuenta.saldo) - montoNum
    await supabase.from('cuentas_ahorro').update({ saldo: nuevoSaldo }).eq('id', cuenta.id)
    await registrarMovimiento(cuenta.id, `Pago ${servicio || 'servicio'} — ref. ${referencia || 's/n'}`, -montoNum, nuevoSaldo)

    res.json({
      mensaje: 'Pago de servicio realizado con éxito.',
      servicio, referencia, monto: montoNum,
      fecha: new Date().toISOString(),
    })
  } catch (e) {
    res.status(500).json({ detail: e.message })
  }
})

export default router
