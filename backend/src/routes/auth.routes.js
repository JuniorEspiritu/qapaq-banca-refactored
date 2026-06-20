import { Router } from 'express'
import { supabase } from '../db.js'
import { firmarToken } from '../auth.js'

const router = Router()

// POST /auth/login  { codigo, password }  (codigo = correo institucional, ej. carlos.ramirez@qapaq.pe)
router.post('/login', async (req, res) => {
  const { codigo, password } = req.body || {}
  if (!codigo || !password) {
    return res.status(400).json({ detail: 'Correo y clave son obligatorios.' })
  }

  const { data: usuario, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('codigo', codigo.trim().toLowerCase())
    .maybeSingle()

  if (error) return res.status(500).json({ detail: 'Error de base de datos: ' + error.message })
  if (!usuario || usuario.password !== password) {
    return res.status(401).json({ detail: 'Correo o clave incorrectos.' })
  }

  const token = firmarToken(usuario)
  res.json({
    access_token: token,
    token_type: 'bearer',
    usuario: {
      id: usuario.id,
      codigo: usuario.codigo,
      nombre: usuario.nombre,
      rol: usuario.rol,
    },
  })
})

export default router
