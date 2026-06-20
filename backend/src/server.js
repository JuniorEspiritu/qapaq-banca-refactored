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

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))
app.use(express.json())

app.get('/', (_req, res) => {
  res.json({ ok: true, servicio: 'Qapaq Banca — Core API', hora: new Date().toISOString() })
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
