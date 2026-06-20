import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as api from '../../lib/api.js'
import { fmt } from '../../lib/format.js'
import { TEA_POR_TIPO, LIMITES, RDS_MAXIMO, teaToTem, calcCuota, calcularScoring, nivelAprobacionRequerido, MONTO_LIMITE_ASESOR } from '../../lib/creditCalc.js'
import { CASOS_30 } from '../../lib/casos.js'
import { SemaforoBadge, NivelBadge, CategoriaBadge } from '../../components/RiskBadges.jsx'

const ACTIVIDADES = [
  { cod: '0111', label: '0111 — Cultivo de cereales' },
  { cod: '4711', label: '4711 — Comercio minorista (bodega/abarrotes)' },
  { cod: '4771', label: '4771 — Comercio minorista de prendas de vestir' },
  { cod: '4520', label: '4520 — Mantenimiento y reparación de vehículos' },
  { cod: '5610', label: '5610 — Restaurantes y servicio de comidas' },
  { cod: '4100', label: '4100 — Construcción de edificios' },
  { cod: '4923', label: '4923 — Transporte de carga por carretera' },
  { cod: '9601', label: '9601 — Lavado y limpieza de prendas' },
]

export default function AsesorNuevaSolicitud() {
  const navigate = useNavigate()
  const [clientes, setClientes] = useState(null)
  const [buscar, setBuscar] = useState('')
  const [err, setErr] = useState(null)
  const [okMsg, setOkMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    usuarioId: '', tipoCredito: 'Microempresa', actividad: '4711', monto: '', plazo: '12', ingresoNeto: '', diaPago: '',
  })
  const [preview, setPreview] = useState(null)

  const cargarClientes = (texto) => {
    api.getClientes(texto).then(setClientes).catch((e) => setErr(e.message))
  }

  useEffect(() => { cargarClientes('') }, [])

  const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const TEA = TEA_POR_TIPO[form.tipoCredito]
  const lim = LIMITES[form.tipoCredito]

  useEffect(() => {
    const m = parseFloat(form.monto), p = parseInt(form.plazo)
    if (m > 0 && p > 0) {
      const tem = teaToTem(TEA)
      const cuota = calcCuota(m, tem, p)
      const ingreso = parseFloat(form.ingresoNeto)
      const rds = ingreso > 0 ? (cuota / ingreso) * 100 : null
      const scoring = rds != null ? calcularScoring(rds) : null
      const nivel = nivelAprobacionRequerido(m)
      setPreview({ cuota: cuota.toFixed(2), rds, scoring, nivel })
    } else setPreview(null)
  }, [form.monto, form.plazo, form.tipoCredito, form.ingresoNeto, TEA])

  const aplicarCaso = (c) => {
    setForm((f) => ({ ...f, monto: String(c.monto), plazo: String(c.plazo), tipoCredito: c.tipoTEA, diaPago: String(c.diaPago || '') }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setErr(null)
    setOkMsg(null)
    if (!form.usuarioId) { setErr('Primero ubica y selecciona al cliente.'); return }
    setLoading(true)
    try {
      const resp = await api.registrarSolicitudParaCliente({
        usuarioId: form.usuarioId,
        tipoCredito: form.tipoCredito,
        actividad: ACTIVIDADES.find((a) => a.cod === form.actividad)?.label || form.actividad,
        monto: Number(form.monto),
        plazo: Number(form.plazo),
        ingresoNeto: Number(form.ingresoNeto),
        diaPago: form.diaPago ? Number(form.diaPago) : null,
      })
      setOkMsg(resp.mensaje)
      setForm((f) => ({ ...f, monto: '', plazo: '12', ingresoNeto: '', diaPago: '' }))
    } catch (ex) {
      setErr(ex.message)
    } finally {
      setLoading(false)
    }
  }

  const clienteSel = clientes?.find((c) => c.id === form.usuarioId)

  return (
    <div className="fade-in">
      <h1 className="hb-page-title">Registrar Solicitud de Crédito</h1>
      <p className="hb-page-sub">
        Flujo del asesor de negocios: ubica al cliente y registra la solicitud con los datos del caso.
        El sistema evaluará elegibilidad y RDS; luego apruébala desde la <strong>Bandeja</strong> para generar el
        cronograma y el desembolso.
      </p>

      {okMsg && <div className="hb-alert-ok">✅ {okMsg} <button className="hb-link" style={{ marginLeft: 8 }} onClick={() => navigate('/asesor')}>Ir a la bandeja →</button></div>}
      {err && <div className="hb-alert-err">{err}</div>}

      <div className="hb-card">
        <div className="hb-card-hd"><span className="hb-card-title">🔎 1. Ubicar al cliente</span></div>
        <div className="hb-card-body">
          <div className="hb-form-grid">
            <div className="hb-field" style={{ gridColumn: '1 / -1' }}>
              <label>Buscar por nombre, correo o DNI</label>
              <input className="hb-input" placeholder="Ej. Carlos, Ramírez, 11200007, ana.torres@qapaq.pe…"
                value={buscar}
                onChange={(e) => { setBuscar(e.target.value); cargarClientes(e.target.value) }} />
            </div>
          </div>
          {!clientes ? <div className="hb-loader">Cargando clientes…</div> :
           clientes.length === 0 ? <div className="hb-empty">No se encontraron clientes con ese criterio.</div> :
           <div className="hb-table-wrap" style={{ maxHeight: 220, overflowY: 'auto' }}>
            <table className="hb-table">
              <thead><tr><th></th><th>Cliente</th><th>Correo</th><th>DNI</th></tr></thead>
              <tbody>
                {clientes.map((c) => (
                  <tr key={c.id} style={{ cursor: 'pointer', background: form.usuarioId === c.id ? '#eef4fc' : undefined }} onClick={() => setForm((f) => ({ ...f, usuarioId: c.id }))}>
                    <td><input type="radio" checked={form.usuarioId === c.id} onChange={() => setForm((f) => ({ ...f, usuarioId: c.id }))} /></td>
                    <td><strong>{c.nombre}</strong></td>
                    <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{c.codigo}</td>
                    <td>{c.dni}</td>
                  </tr>
                ))}
              </tbody>
            </table>
           </div>
          }
          {clienteSel && <div className="hb-alert-ok" style={{ marginTop: 12 }}>👤 Cliente seleccionado: <strong>{clienteSel.nombre}</strong> ({clienteSel.codigo})</div>}
        </div>
      </div>

      <div className="hb-card">
        <div className="hb-card-hd"><span className="hb-card-title">📝 2. Datos del caso</span></div>
        <div className="hb-card-body">
          <div className="hb-alert-warn" style={{ marginBottom: 14 }}>
            ℹ️ Tarifario: <strong>43.92% TEA</strong> sin seguro de desgravamen / <strong>40.92% TEA</strong> con
            seguro. Monto S/ {lim.montoMin}–{lim.montoMax.toLocaleString('es-PE')} · Plazo máx. {lim.plazoMax} meses ·
            RDS máx. {(RDS_MAXIMO * 100).toFixed(0)}%.
          </div>
          <form onSubmit={onSubmit}>
            <div className="hb-form-grid">
              <div className="hb-field"><label>Tipo de crédito / TEA</label>
                <select className="hb-select" value={form.tipoCredito} onChange={setF('tipoCredito')}>
                  <option value="Microempresa">Microempresa — TEA 43.92% (sin seguro)</option>
                  <option value="Consumo">Consumo — TEA 40.92% (con seguro)</option>
                </select>
              </div>
              <div className="hb-field"><label>Actividad económica (CIIU)</label>
                <select className="hb-select" value={form.actividad} onChange={setF('actividad')}>
                  {ACTIVIDADES.map((a) => <option key={a.cod} value={a.cod}>{a.label}</option>)}
                </select>
              </div>
            </div>
            <div className="hb-form-grid">
              <div className="hb-field"><label>Monto del préstamo (S/)</label>
                <input className="hb-input" type="number" min={lim.montoMin} max={lim.montoMax} step="100" placeholder="1000.00" value={form.monto} onChange={setF('monto')} required />
              </div>
              <div className="hb-field"><label>Plazo (meses)</label>
                <select className="hb-select" value={form.plazo} onChange={setF('plazo')}>
                  {[6, 12, 18, 24, 36].filter((p) => p <= lim.plazoMax).map((p) => <option key={p} value={p}>{p} meses</option>)}
                </select>
              </div>
              <div className="hb-field"><label>Ingreso neto mensual del cliente (S/)</label>
                <input className="hb-input" type="number" min="0" step="50" placeholder="2000.00" value={form.ingresoNeto} onChange={setF('ingresoNeto')} required />
              </div>
              <div className="hb-field">
                <label>Día de pago mensual</label>
                <select className="hb-select" value={form.diaPago} onChange={setF('diaPago')}>
                  <option value="">— Mismo día del desembolso —</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                    <option key={d} value={d}>Día {String(d).padStart(2,'0')} de cada mes</option>
                  ))}
                </select>
              </div>
            </div>

            {preview && (
              <div className="cuota-destacada" style={{ marginBottom: 14 }}>
                <div>
                  <div className="cuota-label">Cuota mensual estimada</div>
                  <div className="cuota-val">S/ {preview.cuota}</div>
                  <div className="cuota-tea">TEA {TEA}%</div>
                </div>
                {preview.rds != null && (
                  <div style={{ flex: 1, textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.75)' }}>RDS</div>
                    <div style={{ fontWeight: 700, fontSize: 18, color: preview.rds > 40 ? '#fecaca' : '#bbf7d0' }}>
                      {preview.rds.toFixed(1)}% {preview.rds > 40 ? '⚠️' : '✓'}
                    </div>
                  </div>
                )}
              </div>
            )}

            {preview?.scoring && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                <SemaforoBadge semaforo={preview.scoring.semaforo} rds={preview.rds.toFixed(1)} />
                <CategoriaBadge categoria={preview.scoring.categoria} scoring={preview.scoring.score} />
                <NivelBadge nivel={preview.nivel} />
              </div>
            )}
            {preview?.nivel === 'comite' && (
              <div className="hb-alert-warn" style={{ marginBottom: 14 }}>
                🏛️ Este monto supera S/ {MONTO_LIMITE_ASESOR.toLocaleString('es-PE')} → la solicitud quedará
                marcada para <strong>aprobación del Comité de Créditos</strong> (un asesor no podrá resolverla
                desde la Bandeja).
              </div>
            )}

            <button type="submit" className="hb-btn" disabled={loading || !form.usuarioId}>
              {loading ? 'Registrando…' : 'Registrar solicitud →'}
            </button>
          </form>

          <div style={{ marginTop: 22, paddingTop: 16, borderTop: '1px solid var(--q-border)' }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--q-navy)', marginBottom: 8 }}>📚 Casos de práctica (PDF — 30 casos)</div>
            <div className="hb-table-wrap" style={{ maxHeight: 280, overflowY: 'auto' }}>
              <table className="hb-table">
                <thead><tr><th>Caso</th><th>Cliente del PDF</th><th className="num">Monto</th><th>Plazo</th><th className="num">Cuota esperada</th><th>TEA</th></tr></thead>
                <tbody>
                  {CASOS_30.map((c) => (
                    <tr key={c.n} style={{ cursor: 'pointer' }} onClick={() => aplicarCaso(c)}>
                      <td>Caso {c.n}</td><td>{c.cliente}</td><td className="num">S/ {c.monto.toLocaleString('es-PE')}</td>
                      <td>{c.plazo} meses</td><td className="num">S/ {c.cuota}</td>
                      <td>{c.tipoTEA === 'Microempresa' ? '43.92%' : '40.92%'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: 11, color: 'var(--q-muted)', marginTop: 8 }}>
              Haz clic en un caso para prellenar monto, plazo y TEA. El "cliente del PDF" es solo referencial — el
              cliente real es el que selecciones arriba en el sistema (p. ej. Carlos, Rosa o Ana).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
