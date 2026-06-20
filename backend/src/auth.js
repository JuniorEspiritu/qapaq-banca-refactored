import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'qapaq_secreto_2026'

export function firmarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, codigo: usuario.codigo, nombre: usuario.nombre, rol: usuario.rol },
    SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  )
}

// Middleware: exige Authorization: Bearer <token>
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ detail: 'No autenticado.' })

  try {
    req.user = jwt.verify(token, SECRET)
    next()
  } catch {
    return res.status(401).json({ detail: 'Sesión inválida o expirada.' })
  }
}

// Middleware: exige uno de los roles dados
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return res.status(403).json({ detail: 'No tienes permisos para esta acción.' })
    }
    next()
  }
}
