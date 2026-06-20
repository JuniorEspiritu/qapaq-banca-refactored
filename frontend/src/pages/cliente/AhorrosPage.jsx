import { useEffect, useState } from 'react'
import * as api from '../../lib/api.js'
import { fmt, fmtDateTime } from '../../lib/format.js'
import Badge from '../../components/Badge.jsx'
import Icon from '../../components/Icon.jsx'

export default function AhorrosPage() {
  const [cuentas, setCuentas] = useState(null)
  const [err, setErr] = useState(null)
  const [selected, setSelected] = useState(null)
  const [movs, setMovs] = useState({})
  const [loadingMov, setLoadingMov] = useState(null)

  useEffect(() => {
    api.getCuentasAhorro().then(setCuentas).catch((e) => setErr(e.message))
  }, [])

  const toggle = async (codigo) => {
    if (selected === codigo) { setSelected(null); return }
    setSelected(codigo)
    if (!movs[codigo]) {
      setLoadingMov(codigo)
      try {
        const data = await api.getMovimientos(codigo)
        setMovs((m) => ({ ...m, [codigo]: data }))
      } catch (e) { setErr(e.message) }
      finally { setLoadingMov(null) }
    }
  }

  const totalSaldo = (cuentas || []).reduce((s, c) => s + Number(c.saldo), 0)

  return (
    <div className="fade-in">
      <h1 className="hb-page-title">Cuentas de Ahorro</h1>
      <p className="hb-page-sub">Detalle y movimientos de tus cuentas</p>

      {err && <div className="hb-alert-err">{err}</div>}

      {/* KPI total */}
      {cuentas && cuentas.length > 0 && (
        <div className="hb-kpis" style={{ marginBottom: 24 }}>
          <div className="hb-kpi">
            <div className="hb-kpi-ico" style={{ background: '#dcfce7', color: '#15803d' }}>
              <Icon name="piggy" />
            </div>
            <div>
              <div className="hb-kpi-label">Saldo total en ahorros</div>
              <div className="hb-kpi-val">{fmt(totalSaldo)}</div>
              <small>{cuentas.length} cuenta(s) activa(s)</small>
            </div>
          </div>
        </div>
      )}

      {!cuentas
        ? <div className="hb-loader">Cargando cuentas…</div>
        : cuentas.length === 0
          ? <div className="hb-empty-state"><div className="big">🐷</div>No tienes cuentas de ahorro registradas.</div>
          : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 20 }}>
              {cuentas.map((c) => (
                <div key={c.codigo} className="hb-card" style={{ margin: 0 }}>
                  <div className="hb-card-hd" style={{ cursor: 'pointer' }} onClick={() => toggle(c.codigo)}>
                    <span className="hb-card-title"><Icon name="piggy" size={16} /> {c.codigo}</span>
                    <Badge estado={c.estado} />
                  </div>
                  <div className="hb-card-body" style={{ cursor: 'pointer' }} onClick={() => toggle(c.codigo)}>
                    <div style={{ fontSize: 11.5, color: '#6b7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.4px', fontWeight: 600 }}>Tipo: {c.tipo}</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: '#0c1e3e', letterSpacing: '-1px', margin: '6px 0' }}>{fmt(c.saldo)}</div>
                    <div style={{ fontSize: 11.5, color: '#9ca3af' }}>Moneda: {c.moneda === 'SO' ? 'Soles (S/)' : 'USD'}</div>
                    <button className="hb-link" style={{ marginTop: 12 }}>
                      {selected === c.codigo ? '▲ Ocultar movimientos' : '▼ Ver movimientos'}
                    </button>
                  </div>

                  {selected === c.codigo && (
                    <div className="hb-card-body" style={{ borderTop: '1px solid #f0f4f8', paddingTop: 16 }}>
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: '#0c1e3e', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Icon name="file" size={14} /> Últimos movimientos
                      </div>
                      {loadingMov === c.codigo
                        ? <div className="hb-loader">Cargando movimientos…</div>
                        : !movs[c.codigo]?.length
                          ? <div className="hb-empty">Sin movimientos registrados.</div>
                          : <div className="hb-table-wrap">
                              <table className="hb-table">
                                <thead>
                                  <tr><th>Fecha</th><th>Descripción</th><th className="num">Monto</th><th className="num">Saldo</th></tr>
                                </thead>
                                <tbody>
                                  {movs[c.codigo].map((m) => (
                                    <tr key={m.id}>
                                      <td style={{ fontSize: 11, whiteSpace: 'nowrap' }}>{fmtDateTime(m.fecha)}</td>
                                      <td>{m.descripcion}</td>
                                      <td className="num" style={{ color: Number(m.monto) >= 0 ? '#15803d' : '#b91c1c', fontWeight: 700 }}>
                                        {Number(m.monto) >= 0 ? '+' : ''}{fmt(m.monto)}
                                      </td>
                                      <td className="num">{fmt(m.saldo)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                      }
                    </div>
                  )}
                </div>
              ))}
            </div>
      }
    </div>
  )
}
