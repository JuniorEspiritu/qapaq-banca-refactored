import { useEffect, useState } from 'react'
import * as api from '../../lib/api.js'
import { fmt, fmtDate } from '../../lib/format.js'
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

export default function SolicitarCreditoPage() {
  const [form, setForm] = useState({ tipoCredito: 'Microempresa', actividad: '4711', monto: '', plazo: '12', ingresoNeto: '' })
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('nueva')
  const [historial, setHistorial] = useState(null)

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
      setPreview({ cuota: cuota.toFixed(2), tem: (tem * 100).toFixed(4), rds, scoring, nivel })
    } else setPreview(null)
  }, [form.monto, form.plazo, form.tipoCredito, form.ingresoNeto, TEA])

  const cargarHistorial = () => {
    setHistorial(null)
    api.getMisSolicitudes().then(setHistorial).catch((e) => setErr(e.message))
  }

  useEffect(() => { if (tab === 'historial') cargarHistorial() }, [tab])

  const onSubmit = async (e) => {
    e.preventDefault()
    setErr(null)
    setLoading(true)
    try {
      const resp = await api.solicitarCredito({
        tipoCredito: form.tipoCredito,
        actividad: ACTIVIDADES.find((a) => a.cod === form.actividad)?.label || form.actividad,
        monto: Number(form.monto),
        plazo: Number(form.plazo),
        ingresoNeto: Number(form.ingresoNeto),
      })
      setResult(resp)
    } catch (ex) {
      setErr(ex.message)
    } finally {
      setLoading(false)
    }
  }

  const nueva = () => {
    setResult(null); setErr(null)
    setForm({ tipoCredito: 'Microempresa', actividad: '4711', monto: '', plazo: '12', ingresoNeto: '' })
  }

  const aplicarCaso = (monto, plazo, tipo) => {
    setForm((f) => ({ ...f, monto: String(monto), plazo: String(plazo), tipoCredito: tipo }))
  }

  if (result) {
    return (
      <div className="fade-in">
        <h1 className="hb-page-title">Solicitud Registrada</h1>
        <div className="hb-alert-ok">✅ {result.mensaje}</div>
        <div className="cuota-destacada">
          <div>
            <div className="cuota-label">Cuota mensual fija</div>
            <div className="cuota-val">S/ {Number(result.solicitud.cuota_mensual).toFixed(2)}</div>
            <div className="cuota-tea">TEA {result.solicitud.tea}%</div>
          </div>
          <div style={{ flex: 1, display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {[
              ['Código', result.solicitud.codigo],
              ['Monto', fmt(result.solicitud.monto)],
              ['Plazo', `${result.solicitud.plazo} meses`],
              ['RDS', `${result.solicitud.rds}%`],
              ['Estado', result.solicitud.estado],
            ].map(([l, v]) => (
              <div key={l} style={{ textAlign: 'center' }}><div style={{ fontSize: 10, color: 'rgba(255,255,255,.75)' }}>{l}</div><div style={{ fontSize: 14, fontWeight: 700 }}>{v}</div></div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          <SemaforoBadge semaforo={result.solicitud.semaforo} rds={result.solicitud.rds} />
          <CategoriaBadge categoria={result.solicitud.categoria_riesgo} scoring={result.solicitud.scoring} />
          <NivelBadge nivel={result.solicitud.nivel_aprobacion} />
        </div>
        <div className="hb-alert-warn">
          ⏳ Tu solicitud pasó a estado <strong>En Evaluación</strong>. {result.solicitud.nivel_aprobacion === 'comite'
            ? <>Por ser un monto mayor a S/ {MONTO_LIMITE_ASESOR.toLocaleString('es-PE')}, será revisada por el <strong>Comité de Créditos</strong>.</>
            : <>Será revisada por un <strong>Asesor de Negocios</strong>.</>} Podrá <strong>aprobarla y desembolsarla</strong> o <strong>rechazarla</strong>. El resultado
          se reflejará automáticamente aquí, en tu historial y en "Mis Créditos".
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="hb-btn-gray" onClick={nueva}>Nueva solicitud</button>
          <button className="hb-btn" onClick={() => { setTab('historial'); nueva() }}>Ver historial →</button>
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in">
      <h1 className="hb-page-title">Solicitar Crédito</h1>
      <p className="hb-page-sub">Crédito Empresarial Micro Micro · TEA {TEA}%</p>

      <div className="hb-tabs">
        <button className={`hb-tab${tab === 'nueva' ? ' active' : ''}`} onClick={() => setTab('nueva')}>📝 Nueva solicitud</button>
        <button className={`hb-tab${tab === 'historial' ? ' active' : ''}`} onClick={() => setTab('historial')}>📋 Historial</button>
      </div>

      {tab === 'nueva' && (
        <div className="hb-card">
          <div className="hb-card-hd"><span className="hb-card-title">📝 Datos de la solicitud</span></div>
          <div className="hb-card-body">
            {err && <div className="hb-alert-err">{err}</div>}

            <div className="hb-alert-warn" style={{ marginBottom: 14 }}>
              ℹ️ Tarifario aplicado: <strong>Crédito Empresarial Micro Micro</strong> · TEA{' '}
              {form.tipoCredito === 'Microempresa' ? '43.92% (sin seguro de desgravamen)' : '40.92% (con seguro de desgravamen)'}.
              Monto S/ {lim.montoMin}–{lim.montoMax.toLocaleString('es-PE')} · Plazo máx. {lim.plazoMax} meses · RDS máx. {(RDS_MAXIMO * 100).toFixed(0)}%.
            </div>

            <form onSubmit={onSubmit}>
              <div className="hb-form-grid">
                <div className="hb-field"><label>Tipo de crédito</label>
                  <select className="hb-select" value={form.tipoCredito} onChange={setF('tipoCredito')}>
                    <option value="Microempresa">Microempresa — TEA 43.92%</option>
                    <option value="Consumo">Consumo — TEA 40.92%</option>
                  </select>
                </div>
                <div className="hb-field"><label>Actividad económica (CIIU)</label>
                  <select className="hb-select" value={form.actividad} onChange={setF('actividad')}>
                    {ACTIVIDADES.map((a) => <option key={a.cod} value={a.cod}>{a.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="hb-form-grid">
                <div className="hb-field"><label>Monto solicitado (S/)</label>
                  <input className="hb-input" type="number" min={lim.montoMin} max={lim.montoMax} step="100" placeholder="1000.00" value={form.monto} onChange={setF('monto')} required />
                </div>
                <div className="hb-field"><label>Plazo (meses)</label>
                  <select className="hb-select" value={form.plazo} onChange={setF('plazo')}>
                    {[6, 12, 18, 24, 36].filter((p) => p <= lim.plazoMax).map((p) => <option key={p} value={p}>{p} meses</option>)}
                  </select>
                </div>
                <div className="hb-field"><label>Ingreso neto mensual (S/)</label>
                  <input className="hb-input" type="number" min="0" step="50" placeholder="2000.00" value={form.ingresoNeto} onChange={setF('ingresoNeto')} required />
                </div>
              </div>

              {preview && (
                <div className="cuota-destacada" style={{ marginBottom: 14 }}>
                  <div>
                    <div className="cuota-label">Cuota mensual estimada</div>
                    <div className="cuota-val">S/ {preview.cuota}</div>
                    <div className="cuota-tea">TEM {preview.tem}%</div>
                  </div>
                  {preview.rds != null && (
                    <div style={{ flex: 1, textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.75)' }}>RDS (cuota / ingreso)</div>
                      <div style={{ fontWeight: 700, fontSize: 18, color: preview.rds > 40 ? '#fecaca' : '#bbf7d0' }}>
                        {preview.rds.toFixed(1)}% {preview.rds > 40 ? '⚠️' : '✓'}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {preview?.rds > 40 && (
                <div className="hb-alert-err">
                  ⚠️ El RDS supera el 40% permitido. Reduce el monto o amplía el plazo antes de enviar.
                </div>
              )}
              {preview?.scoring && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                  <SemaforoBadge semaforo={preview.scoring.semaforo} rds={preview.rds.toFixed(1)} />
                  <CategoriaBadge categoria={preview.scoring.categoria} scoring={preview.scoring.score} />
                  <NivelBadge nivel={preview.nivel} />
                </div>
              )}
              {preview?.nivel === 'comite' && preview?.rds <= 40 && (
                <div className="hb-alert-warn" style={{ marginBottom: 14 }}>
                  🏛️ Por ser un monto mayor a S/ {MONTO_LIMITE_ASESOR.toLocaleString('es-PE')}, tu solicitud
                  será evaluada por el <strong>Comité de Créditos</strong>.
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <button type="submit" className="hb-btn" disabled={loading}>
                  {loading ? 'Registrando solicitud…' : 'Enviar solicitud →'}
                </button>
                <span style={{ fontSize: 11, color: 'var(--q-muted)' }}>✔ Validación de elegibilidad y RDS automática</span>
              </div>
            </form>

            <div style={{ marginTop: 22, paddingTop: 16, borderTop: '1px solid var(--q-border)' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--q-navy)', marginBottom: 8 }}>📚 Casos de práctica (Crédito Empresarial Micro Micro — 30 casos del PDF)</div>
              <div className="hb-table-wrap" style={{ maxHeight: 320, overflowY: 'auto' }}>
                <table className="hb-table">
                  <thead><tr><th>Caso</th><th>Cliente</th><th className="num">Monto</th><th>Plazo</th><th className="num">Cuota esperada</th><th>TEA</th></tr></thead>
                  <tbody>
                    {CASOS_30.map((c) => (
                      <tr key={c.n} style={{ cursor: 'pointer' }} onClick={() => aplicarCaso(c.monto, c.plazo, c.tipoTEA)}>
                        <td>Caso {c.n}</td><td>{c.cliente}</td><td className="num">S/ {c.monto.toLocaleString('es-PE')}</td>
                        <td>{c.plazo} meses</td><td className="num">S/ {c.cuota}</td>
                        <td>{c.tipoTEA === 'Microempresa' ? '43.92%' : '40.92%'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize: 11, color: 'var(--q-muted)', marginTop: 8 }}>Haz clic en un caso para prellenar monto, plazo y tipo de crédito. Compara la "Cuota esperada" del PDF con la "Cuota mensual estimada" que calcula el sistema.</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'historial' && (
        <div className="hb-card">
          <div className="hb-card-hd">
            <span className="hb-card-title">📋 Mis solicitudes</span>
            <button className="hb-link" onClick={cargarHistorial}>↻ Actualizar</button>
          </div>
          <div className="hb-card-body">
            {!historial ? <div className="hb-loader">Cargando…</div> :
             historial.length === 0 ? <div className="hb-empty">Aún no has registrado solicitudes.</div> :
             <div className="hb-table-wrap">
               <table className="hb-table">
                 <thead><tr><th>Código</th><th className="num">Monto</th><th>Plazo</th><th className="num">Cuota</th><th>Tipo</th><th>Estado</th><th>Fecha</th><th>Comentario asesor</th></tr></thead>
                 <tbody>
                   {historial.map((r) => (
                     <tr key={r.id}>
                       <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{r.codigo}</td>
                       <td className="num">{fmt(r.monto)}</td>
                       <td>{r.plazo} meses</td>
                       <td className="num">{fmt(r.cuota_mensual)}</td>
                       <td>{r.tipo_credito}</td>
                       <td>
                         <span className={
                           `status-pill ${r.estado === 'En Evaluación' ? 'status-eval' :
                             r.estado === 'Aprobado' ? 'status-aprobado' :
                             r.estado === 'Desembolsado' ? 'status-desembolsado' : 'status-rechazado'}`
                         }>{r.estado}</span>
                       </td>
                       <td style={{ fontSize: 11 }}>{fmtDate(r.fecha_solicitud)}</td>
                       <td style={{ fontSize: 11, color: 'var(--q-muted)' }}>{r.comentario_asesor || '—'}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
            }
          </div>
        </div>
      )}
    </div>
  )
}
