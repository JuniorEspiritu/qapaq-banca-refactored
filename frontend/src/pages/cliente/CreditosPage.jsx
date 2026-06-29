import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as api from '../../lib/api.js'
import { fmt, fmtDate } from '../../lib/format.js'
import Badge from '../../components/Badge.jsx'
import Icon from '../../components/Icon.jsx'

export default function CreditosPage() {
  const navigate = useNavigate()
  const [creditos, setCreditos] = useState(null)
  const [err, setErr] = useState(null)
  const [open, setOpen] = useState(null)
  const [cuotas, setCuotas] = useState({})
  const [loadingC, setLoadingC] = useState(null)

  useEffect(() => {
    api.getCuentasCredito().then(setCreditos).catch((e) => setErr(e.message))
  }, [])

  const toggle = async (codigo) => {
    if (open === codigo) { setOpen(null); return }
    setOpen(codigo)
    if (!cuotas[codigo]) {
      setLoadingC(codigo)
      try {
        const data = await api.getCuotas(codigo)
        setCuotas((m) => ({ ...m, [codigo]: data }))
      } catch (e) { setErr(e.message) }
      finally { setLoadingC(null) }
    }
  }

  const totalDeuda = (creditos || []).reduce((s, c) => s + Number(c.saldo_pendiente), 0)
  const enMora = (creditos || []).filter(c => c.estado === 'Mora').length

  return (
    <div className="fade-in">
      <h1 className="hb-page-title">Mis Préstamos</h1>
      <p className="hb-page-sub">Detalle de créditos vigentes y cronograma de cuotas</p>

      {err && <div className="hb-alert-err">{err}</div>}

      {/* KPIs */}
      {creditos && creditos.length > 0 && (
        <div className="hb-kpis" style={{ marginBottom: 24 }}>
          <div className="hb-kpi">
            <div className="hb-kpi-ico" style={{ background: '#fee2e2', color: '#b91c1c' }}>
              <Icon name="credit" />
            </div>
            <div>
              <div className="hb-kpi-label">Deuda total</div>
              <div className="hb-kpi-val">{fmt(totalDeuda)}</div>
              <small>{creditos.length} crédito(s)</small>
            </div>
          </div>
          {enMora > 0 && (
            <div className="hb-kpi">
              <div className="hb-kpi-ico" style={{ background: '#fef3c7', color: '#92400e' }}>
                <Icon name="clock" />
              </div>
              <div>
                <div className="hb-kpi-label">Créditos en mora</div>
                <div className="hb-kpi-val" style={{ color: '#b91c1c' }}>{enMora}</div>
                <small>Requieren atención</small>
              </div>
            </div>
          )}
        </div>
      )}

      {!creditos
        ? <div className="hb-loader">Cargando créditos…</div>
        : creditos.length === 0
          ? (
            <div className="hb-empty-state">
              <div className="big">💳</div>
              Aún no tienes créditos activos.
              <div style={{ marginTop: 16 }}>
                <button className="hb-btn" onClick={() => navigate('/banca/solicitar')}>
                  Solicitar mi primer crédito →
                </button>
              </div>
            </div>
          )
          : creditos.map((c) => (
            <div key={c.codigo} className="hb-card">
              <div className="hb-card-hd">
                <span className="hb-card-title"><Icon name="credit" size={16} /> {c.codigo}</span>
                <Badge estado={c.estado} />
              </div>
              <div className="hb-card-body">
                {/* Info grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14, marginBottom: 18 }}>
                  {[
                    ['Saldo pendiente', fmt(c.saldo_pendiente), c.estado === 'Mora' ? '#b91c1c' : '#0c1e3e'],
                    ['Cuota mensual', fmt(c.cuota_mensual), '#0c1e3e'],
                    ['Días de atraso', c.dias_atraso + ' días', c.dias_atraso > 0 ? '#b91c1c' : '#15803d'],
                    ['Tipo', c.tipo_credito, '#374151'],
                    ['TEA', c.tea + '%', '#374151'],
                    ['Desembolso', fmtDate(c.fecha_desembolso), '#374151'],
                  ].map(([lbl, val, clr]) => (
                    <div key={lbl} style={{
                      background: '#f8fafc', borderRadius: 10, padding: '12px 14px',
                      borderLeft: '3px solid #e8a020'
                    }}>
                      <div style={{ fontSize: 10.5, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4 }}>{lbl}</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: clr }}>{val}</div>
                    </div>
                  ))}
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button className="hb-btn" onClick={() => navigate('/banca/operaciones')}>
                    <Icon name="receipt" size={14} /> Pagar cuota
                  </button>
                  <button className="hb-btn-gray" onClick={() => toggle(c.codigo)}>
                    <Icon name="chart" size={14} /> {open === c.codigo ? 'Ocultar' : 'Ver'} cronograma
                  </button>
                </div>

                {/* Cronograma */}
                {open === c.codigo && (
                  <div style={{ marginTop: 18 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: '#0c1e3e', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Icon name="file" size={14} /> Cronograma de pagos
                    </div>
                    {loadingC === c.codigo
                      ? <div className="hb-loader">Cargando cronograma…</div>
                      : <div className="hb-table-wrap">
                          <table className="hb-table">
                            <thead>
                              <tr><th>N°</th><th>Fecha de pago</th><th className="num">Cuota</th><th className="num">Capital</th><th className="num">Interés</th><th className="num">Saldo</th><th>Estado</th></tr>
                            </thead>
                            <tbody>
                              {(cuotas[c.codigo] || []).map((q) => (
                                <tr key={q.id}>
                                  <td>{q.numero}</td>
                                  <td>{fmtDate(q.fecha_pago)}</td>
                                  <td className="num">{fmt(q.cuota)}</td>
                                  <td className="num">{fmt(q.capital)}</td>
                                  <td className="num">{fmt(q.interes)}</td>
                                  <td className="num">{fmt(q.saldo)}</td>
                                  <td><Badge estado={q.estado} /></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                    }
                  </div>
                )}
              </div>
            </div>
          ))
      }
    </div>
  )
}