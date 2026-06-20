import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fmt, fmtDate } from '../../lib/format.js'
import { TEA_POR_TIPO, LIMITES, RDS_MAXIMO, teaToTem, generarCronograma } from '../../lib/creditCalc.js'
import { SemaforoBadge } from '../../components/RiskBadges.jsx'

const todayISO = () => new Date().toISOString().slice(0, 10)

export default function SimuladorPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    tipoCredito: 'Microempresa',
    monto: '5000',
    plazo: '18',
    fecha: todayISO(),
    diaPago: '',
    ingresoNeto: '',
  })
  const [resultado, setResultado] = useState(null)
  const [casoActivo, setCasoActivo] = useState(null)

  const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const TEA = TEA_POR_TIPO[form.tipoCredito]
  const lim = LIMITES[form.tipoCredito]

  useEffect(() => {
    const m = parseFloat(form.monto), p = parseInt(form.plazo)
    if (m > 0 && p > 0) {
      const { cuota, rows } = generarCronograma(m, TEA, p, form.fecha, form.diaPago || null)
      const ingreso = parseFloat(form.ingresoNeto)
      const rds = ingreso > 0 ? (cuota / ingreso) * 100 : null
      setResultado({ cuota, rows, tem: (teaToTem(TEA) * 100).toFixed(4), rds })
    } else setResultado(null)
  }, [form.monto, form.plazo, form.fecha, form.diaPago, form.tipoCredito, form.ingresoNeto, TEA])

  const aplicarCaso = (c) => {
    setCasoActivo(c.n)
    setForm((f) => ({ ...f, monto: String(c.monto), plazo: String(c.plazo), tipoCredito: c.tipoTEA, fecha: c.desembolso, diaPago: String(c.diaPago || '') }))
  }

  const cumpleRango = form.monto && Number(form.monto) >= lim.montoMin && Number(form.monto) <= lim.montoMax
  const cumplePlazo = form.plazo && Number(form.plazo) <= lim.plazoMax

  return (
    <div className="fade-in">
      <h1 className="hb-page-title">Simulador de Crédito</h1>
      <p className="hb-page-sub">Calcula tu cuota y cronograma antes de enviar tu solicitud — Crédito Empresarial Micro Micro</p>

      <div className="hb-alert-warn" style={{ marginBottom: 16 }}>
        ℹ️ Tarifario: <strong>43.92% TEA</strong> (sin seguro de desgravamen) o <strong>40.92% TEA</strong> (con seguro
        de desgravamen). Cuotas fijas (sistema francés). Esta simulación <strong>no registra ninguna solicitud</strong> —
        es solo informativa.
      </div>

      <div className="hb-card">
        <div className="hb-card-hd"><span className="hb-card-title">🧮 Datos del préstamo</span></div>
        <div className="hb-card-body">
          <div className="hb-form-grid">
            <div className="hb-field"><label>Tarifa aplicada</label>
              <select className="hb-select" value={form.tipoCredito} onChange={setF('tipoCredito')}>
                <option value="Microempresa">43.92% TEA — sin seguro de desgravamen</option>
                <option value="Consumo">40.92% TEA — con seguro de desgravamen</option>
              </select>
            </div>
            <div className="hb-field"><label>Fecha de desembolso</label>
              <input className="hb-input" type="date" value={form.fecha} onChange={setF('fecha')} />
            </div>
          </div>
          <div className="hb-form-grid">
            <div className="hb-field"><label>Monto del préstamo (S/)</label>
              <input className="hb-input" type="number" min="100" step="100" value={form.monto} onChange={setF('monto')} />
              {!cumpleRango && form.monto && (
                <small style={{ color: 'var(--q-red)' }}>Rango permitido: S/ {lim.montoMin} – S/ {lim.montoMax.toLocaleString('es-PE')}</small>
              )}
            </div>
            <div className="hb-field"><label>Plazo (meses)</label>
              <select className="hb-select" value={form.plazo} onChange={setF('plazo')}>
                {[6, 12, 18, 24, 36].map((p) => <option key={p} value={p}>{p} meses</option>)}
              </select>
              {!cumplePlazo && <small style={{ color: 'var(--q-red)' }}>Plazo máximo para esta tarifa: {lim.plazoMax} meses</small>}
            </div>
            <div className="hb-field">
              <label>Día de pago mensual <span style={{ color: '#9ca3af', fontWeight: 400 }}>(1–31)</span></label>
              <select className="hb-select" value={form.diaPago} onChange={setF('diaPago')}>
                <option value="">— Mismo día del desembolso —</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>Día {String(d).padStart(2, '0')} de cada mes</option>
                ))}
              </select>
              {form.diaPago && (
                <small style={{ color: '#6b7280' }}>
                  Las cuotas vencerán el día <strong>{form.diaPago}</strong> de cada mes
                </small>
              )}
            </div>
            <div className="hb-field"><label>Ingreso neto mensual (S/) — opcional</label>
              <input className="hb-input" type="number" min="0" step="50" placeholder="Para ver tu RDS" value={form.ingresoNeto} onChange={setF('ingresoNeto')} />
            </div>
          </div>

          {resultado && (
            <div className="cuota-destacada">
              <div>
                <div className="cuota-label">Cuota mensual fija</div>
                <div className="cuota-val">S/ {resultado.cuota.toFixed(2)}</div>
                <div className="cuota-tea">TEA {TEA}% · TEM {resultado.tem}%</div>
              </div>
              <div style={{ flex: 1, display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.75)' }}>Total a pagar</div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{fmt(resultado.cuota * Number(form.plazo))}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.75)' }}>Total intereses</div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{fmt(resultado.cuota * Number(form.plazo) - Number(form.monto))}</div>
                </div>
                {resultado.rds != null && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.75)', marginBottom: 4 }}>RDS</div>
                    <SemaforoBadge
                      semaforo={resultado.rds > 40 ? 'rojo' : resultado.rds > 30 ? 'amarillo' : 'verde'}
                      rds={resultado.rds}
                      size="sm"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {resultado?.rds > 40 && (
            <div className="hb-alert-err">
              ⚠️ Con estos datos, tu RDS superaría el {(RDS_MAXIMO * 100).toFixed(0)}% permitido y la solicitud sería
              rechazada automáticamente. Prueba con un monto menor o un plazo mayor.
            </div>
          )}

          {/* ── SEMÁFORO RDS GRANDE ── */}
          {resultado?.rds != null && (
            <div style={{
              background: '#fff',
              border: '1.5px solid #e8edf4',
              borderRadius: 16,
              padding: '20px 24px',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              flexWrap: 'wrap',
            }}>
              <SemaforoBadge
                semaforo={resultado.rds > 40 ? 'rojo' : resultado.rds > 30 ? 'amarillo' : 'verde'}
                rds={resultado.rds}
                size="lg"
              />
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8 }}>
                  Relación Deuda-Servicio (RDS)
                </div>
                {/* Barra de progreso */}
                <div style={{ background: '#f0f2f8', borderRadius: 8, height: 12, position: 'relative', overflow: 'hidden' }}>
                  <div style={{
                    position: 'absolute', left: 0, top: 0,
                    width: `${Math.min(resultado.rds, 100)}%`,
                    height: '100%',
                    borderRadius: 8,
                    background: resultado.rds > 40 ? 'linear-gradient(90deg,#f59e0b,#ef4444)'
                              : resultado.rds > 30 ? 'linear-gradient(90deg,#22c55e,#eab308)'
                              : 'linear-gradient(90deg,#22c55e,#16a34a)',
                    transition: 'width .5s cubic-bezier(.22,1,.36,1)',
                  }} />
                  {/* Línea límite 40% */}
                  <div style={{
                    position: 'absolute', left: '40%', top: 0,
                    width: 2, height: '100%',
                    background: '#dc2626', opacity: .8,
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 10.5, color: '#9ca3af' }}>0%</span>
                  <span style={{ fontSize: 10.5, color: '#dc2626', fontWeight: 700 }}>Límite 40%</span>
                  <span style={{ fontSize: 10.5, color: '#9ca3af' }}>100%</span>
                </div>
              </div>
              <div style={{ fontSize: 32, fontWeight: 900, color: resultado.rds > 40 ? '#dc2626' : resultado.rds > 30 ? '#ca8a04' : '#16a34a', letterSpacing: -1 }}>
                {resultado.rds.toFixed(1)}<span style={{ fontSize: 18 }}>%</span>
              </div>
            </div>
          )}

          {resultado && (
            <div className="hb-table-wrap" style={{ marginTop: 16 }}>
              <table className="hb-table">
                <thead><tr><th>N°</th><th>Fecha de pago</th><th className="num">Cuota</th><th className="num">Capital</th><th className="num">Interés</th><th className="num">Saldo</th></tr></thead>
                <tbody>
                  {resultado.rows.map((r) => (
                    <tr key={r.numero}>
                      <td>{r.numero}</td><td>{fmtDate(r.fecha_pago)}</td>
                      <td className="num">{fmt(r.cuota)}</td><td className="num">{fmt(r.capital)}</td>
                      <td className="num">{fmt(r.interes)}</td><td className="num">{fmt(r.saldo)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <button className="hb-btn" onClick={() => navigate('/banca/solicitar')}>Continuar con la solicitud →</button>
          </div>
        </div>
      </div>
    </div>
  )
}
