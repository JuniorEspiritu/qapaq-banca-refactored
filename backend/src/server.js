import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

import authRoutes from './routes/auth.routes.js'
import cuentasRoutes from './routes/cuentas.routes.js'
import creditosRoutes from './routes/creditos.routes.js'
import operacionesRoutes from './routes/operaciones.routes.js'
import asesorRoutes from './routes/asesor.routes.js'
import moraRoutes from './routes/mora.routes.js'

const app = express()

// Soporta múltiples orígenes separados por coma en CORS_ORIGIN.
// Si la variable no existe o está vacía, permite cualquier origen (*).
const corsOriginEnv = process.env.CORS_ORIGIN || process.env.CORS_ORIGINS || ''
const allowedOrigins = corsOriginEnv.split(',').map(s => s.trim()).filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Peticiones sin origin (ej. Postman, curl) siempre se permiten
    if (!origin) return callback(null, true)
    // Si no se configuró ninguna lista, permitir todo
    if (allowedOrigins.length === 0) return callback(null, true)
    // Permitir si el origin de la petición está en la lista
    if (allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error('No permitido por CORS: ' + origin))
  },
}))
app.use(express.json())

app.get('/', (_req, res) => {
  res.json({ sistema: 'Core Financiero QAPAQ', version: '1.0.0', status: 'ok' })
})

app.use('/auth', authRoutes)
app.use('/cuentas', cuentasRoutes)
app.use('/creditos', creditosRoutes)
app.use('/operaciones', operacionesRoutes)
app.use('/asesor', asesorRoutes)
app.use('/mora', moraRoutes)

// 404
app.use((_req, res) => res.status(404).json({ detail: 'Ruta no encontrada.' }))

// Manejador de errores
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ detail: 'Error interno del servidor.' })
})

const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
  console.log(`🚀 Qapaq Core API corriendo en http://localhost:${PORT}`)
})