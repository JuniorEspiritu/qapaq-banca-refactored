const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const TOKEN_KEY = 'qapaq_token'
const USER_KEY = 'qapaq_user'

export function getToken() { return localStorage.getItem(TOKEN_KEY) }
export function getUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
}
export function saveSession(token, usuario) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(usuario))
}
export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  let data = null
  try { data = await res.json() } catch { /* sin body */ }

  if (!res.ok) {
    const msg = data?.detail || `Error ${res.status}`
    if (res.status === 401 && auth) clearSession()
    throw new Error(msg)
  }
  return data
}

// ── Auth ────────────────────────────────────
export const login = (codigo, password) =>
  request('/auth/login', { method: 'POST', body: { codigo, password }, auth: false })

// ── Cuentas ─────────────────────────────────
export const getCuentasAhorro = () => request('/cuentas/ahorro')
export const getMovimientos = (codigo) => request(`/cuentas/ahorro/${codigo}/movimientos`)
export const getCuentasCredito = () => request('/cuentas/credito')
export const getCuotas = (codigo) => request(`/cuentas/credito/${codigo}/cuotas`)

// ── Créditos ────────────────────────────────
export const solicitarCredito = (payload) =>
  request('/creditos/solicitar', { method: 'POST', body: payload })
export const getMisSolicitudes = () => request('/creditos/solicitudes')

// ── Operaciones ─────────────────────────────
export const transferir = (payload) =>
  request('/operaciones/transferencia', { method: 'POST', body: payload })
export const pagarCredito = (payload) =>
  request('/operaciones/pago-credito', { method: 'POST', body: payload })
export const pagarServicio = (payload) =>
  request('/operaciones/pago-servicio', { method: 'POST', body: payload })

// ── Asesor / Comité ──────────────────────────
export const getSolicitudesPendientes = (estado) =>
  request(`/asesor/solicitudes${estado ? `?estado=${encodeURIComponent(estado)}` : ''}`)
export const getSolicitudDetalle = (id) => request(`/asesor/solicitudes/${id}`)
export const aprobarSolicitud = (id, comentario) =>
  request(`/asesor/solicitudes/${id}/aprobar`, { method: 'POST', body: { comentario } })
export const rechazarSolicitud = (id, comentario) =>
  request(`/asesor/solicitudes/${id}/rechazar`, { method: 'POST', body: { comentario } })
export const getClientes = (buscar) =>
  request(`/asesor/clientes${buscar ? `?buscar=${encodeURIComponent(buscar)}` : ''}`)
export const registrarSolicitudParaCliente = (payload) =>
  request('/asesor/solicitudes', { method: 'POST', body: payload })

// ── Mora (R1·R2·R3) ──────────────────────────────────────────────
export const getCarteraMora = (banda) =>
  request(`/mora/cartera${banda ? `?banda=${encodeURIComponent(banda)}` : ''}`)
export const registrarGestionMora = (payload) =>
  request('/mora/gestiones', { method: 'POST', body: payload })
export const getGestionesMora = (creditoId) =>
  request(`/mora/gestiones/${creditoId}`)
export const derivarJudicial = (creditoId, comentario) =>
  request(`/mora/judicial/${creditoId}`, { method: 'POST', body: { comentario } })
export const castigarCredito = (creditoId, comentario) =>
  request(`/mora/castigo/${creditoId}`, { method: 'POST', body: { comentario } })
export const getDashboardGerente = () => request('/gerente/dashboard')