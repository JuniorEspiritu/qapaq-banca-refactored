import { useEffect, useState } from 'react'
import * as api from '../../lib/api.js'
import { fmt, fmtDate, fmtDateTime } from '../../lib/format.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { MONTO_LIMITE_ASESOR } from '../../lib/creditCalc.js'
import { SemaforoBadge, NivelBadge, CategoriaBadge } from '../../components/RiskBadges.jsx'
import Icon from '../../components/Icon.jsx'

export default function AsesorDashboard() {
  const { rol } = useAuth()
  const [solicitudes, setSolicitudes] = useState(null)
  const [err, setErr] = useState(null)
  const [detalle, setDetalle] = useState(null)   // solicitud abierta en el modal
  const [accion, setAccion] = useState(null)     // 'aprobar' | 'rechazar'
  const [comentario, setComentario] = useState('')
  const [loadingDetalle, setLoadingDetalle] = useState(false)
  const [loadingAccion, setLoadingAccion] = useState(false)
  const [okMsg, setOkMsg] = useState(null)

  const cargar = () => {
    setErr(null)
    api.getSolicitudesPendientes('En Evaluación').then(setSolicitudes).catch((e) => setErr(e.message))
  }

  useEffect(cargar, [])

  const abrir = async (sol, tipoAccion) => {
    setAccion(tipoAccion)
    setComentario('')
    setLoadingDetalle(true)
    try {
      const data = await api.getSolicitudDetalle(sol.id)
      setDetalle(data)
    } catch (e) { setErr(e.message) }
    finally { setLoadingDetalle(false) }
  }

  const cerrar = () => { setDetalle(null); setAccion(null); setComentario('') }

  const confirmar = async () => {
    setLoadingAccion(true)
    setErr(null)
    try {
      let resp
      if (accion === 'aprobar') resp = await api.aprobarSolicitud(detalle.id, comentario)
      else resp = await api.rechazarSolicitud(detalle.id, comentario)
      setOkMsg(resp.mensaje)
      cerrar()
      cargar()
      setTimeout(() => setOkMsg(null), 6000)
    } catch (e) {
      setErr(e.message)
    } finally {
      setLoadingAccion(false)
    }
  }

  return (
    <div className="fade-in">
      <h1 className="hb-page-title">Bandeja de Solicitudes</h1>
      <p className="hb-page-sub">Solicitudes de crédito en estado "En Evaluación" — Crédito Empresarial Micro Micro</p>

      {okMsg && <div className="hb-alert-ok">✅ {okMsg}</div>}
      {err && <div className="hb-alert-err">{err}</div>}

      <div className="hb-kpis">
        <div className="hb-kpi">
          <div className="hb-kpi-ico" style={{ background: '#fef3c7', color: '#92400e' }}><Icon name="clock" /></div>
          <div>
            <div className="hb-kpi-label">Pendientes de evaluación</div>
            <div className="hb-kpi-val">{solicitudes ? solicitudes.length : '…'}</div>
            <small>actualizado en tiempo real</small>
          </div>
        </div>
        <div className="hb-kpi">
          <div className="hb-kpi-ico" style={{ background: '#dbeafe', color: '#1e40af' }}><Icon name="briefcase" /></div>
          <div>
            <div className="hb-kpi-label">Monto total solicitado</div>
            <div className="hb-kpi-val">{solicitudes ? fmt(solicitudes.reduce((s, x) => s + Number(x.monto), 0)) : '…'}</div>
            <small>suma de solicitudes pendientes</small>
          </div>
        </div>
      </div>

      <div className="hb-card">
        <div className="hb-card-hd">
          <span className="hb-card-title"><Icon name="file" size={16} /> Solicitudes en evaluación</span>
          <button className="hb-link" onClick={cargar}><Icon name="refresh" size={14} /> Actualizar</button>
        </div>
        <div className="hb-card-body">
          {!solicitudes ? <div className="hb-loader">Cargando solicitudes…</div> :
           solicitudes.length === 0 ? (
            <div className="hb-empty-state"><div className="big">✅</div>No hay solicitudes pendientes por evaluar.</div>
           ) : (
            <div className="hb-table-wrap">
              <table className="hb-table">
                <thead>
                  <tr>
                    <th>Código</th><th>Cliente</th><th>DNI</th><th className="num">Monto</th>
                    <th>Plazo</th><th className="num">Cuota</th><th>TEA</th>
                    <th>RDS / Semáforo</th><th>Scoring</th><th>Ruta</th>
                    <th>Actividad</th><th>Fecha</th><th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudes.map((s) => {
                    const autorizado = rol === 'comite' || s.nivel_aprobacion === 'asesor' || !s.nivel_aprobacion
                    return (
                    <tr key={s.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{s.codigo}</td>
                      <td>{s.usuarios?.nombre}</td>
                      <td>{s.usuarios?.dni}</td>
                      <td className="num">{fmt(s.monto)}</td>
                      <td>{s.plazo} meses</td>
                      <td className="num">{fmt(s.cuota_mensual)}</td>
                      <td>{s.tea}%</td>
                      <td><SemaforoBadge semaforo={s.semaforo} rds={s.rds} /></td>
                      <td><CategoriaBadge categoria={s.categoria_riesgo} scoring={s.scoring} /></td>
                      <td><NivelBadge nivel={s.nivel_aprobacion} /></td>
                      <td style={{ fontSize: 11 }}>{s.actividad || '—'}</td>
                      <td style={{ fontSize: 11 }}>{fmtDate(s.fecha_solicitud)}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {autorizado ? (
                          <>
                            <button className="hb-btn hb-btn-green" style={{ padding: '6px 10px', marginRight: 6, fontSize: 11 }} onClick={() => abrir(s, 'aprobar')}>
                              <Icon name="thumbsUp" size={13} /> Aprobar
                            </button>
                            <button className="hb-btn hb-btn-red" style={{ padding: '6px 10px', fontSize: 11 }} onClick={() => abrir(s, 'rechazar')}>
                              <Icon name="thumbsDown" size={13} /> Rechazar
                            </button>
                          </>
                        ) : (
                          <span style={{ fontSize: 11, color: 'var(--q-muted)', fontStyle: 'italic' }}>
                            🔒 Requiere Comité
                          </span>
                        )}
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
           )
          }
        </div>
      </div>

      {accion && (
        <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && cerrar()}>
          <div className="modal-box">
            <h3>{accion === 'aprobar' ? <><Icon name="thumbsUp" /> Aprobar y desembolsar solicitud</> : <><Icon name="thumbsDown" /> Rechazar solicitud</>}</h3>

            {loadingDetalle ? <div className="hb-loader">Cargando detalle…</div> : detalle && (
              <>
                <div className="hb-comprobante" style={{ marginBottom: 14 }}>
                  <h3 style={{ fontSize: 14 }}><Icon name="cardId" size={15} /> {detalle.codigo} — {detalle.usuarios?.nombre}</h3>
                  <dl className="hb-dl">
                    <div><dt>Tipo</dt><dd>{detalle.tipo_credito}</dd></div>
                    <div><dt>Monto</dt><dd>{fmt(detalle.monto)}</dd></div>
                    <div><dt>Plazo</dt><dd>{detalle.plazo} meses</dd></div>
                    <div><dt>TEA</dt><dd>{detalle.tea}%</dd></div>
                    <div><dt>Cuota mensual</dt><dd>{fmt(detalle.cuota_mensual)}</dd></div>
                    <div><dt>Ingreso neto</dt><dd>{fmt(detalle.ingreso_neto)}</dd></div>
                    <div><dt>Actividad</dt><dd style={{ fontSize: 11 }}>{detalle.actividad || '—'}</dd></div>
                  </dl>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                    <SemaforoBadge semaforo={detalle.semaforo} rds={detalle.rds} />
                    <CategoriaBadge categoria={detalle.categoria_riesgo} scoring={detalle.scoring} />
                    <NivelBadge nivel={detalle.nivel_aprobacion} />
                  </div>
                </div>

                {detalle.nivel_aprobacion === 'comite' && rol !== 'comite' && (
                  <div className="hb-alert-err">
                    🔒 Esta solicitud supera S/ {MONTO_LIMITE_ASESOR.toLocaleString('es-PE')} y requiere la
                    aprobación del <strong>Comité de Créditos</strong>. Como asesor de negocios no puedes
                    resolverla; ingresa con la cuenta del comité.
                  </div>
                )}

                {accion === 'aprobar' && (
                  <>
                    <div className="hb-alert-warn">
                      Al aprobar se creará un crédito vigente con su cronograma de {detalle.plazo} cuotas y se
                      abonará <strong>{fmt(detalle.monto)}</strong> a la cuenta de ahorro principal del cliente
                      ({detalle.usuarios?.codigo}).
                    </div>
                    <div className="hb-table-wrap" style={{ marginBottom: 14, maxHeight: 220, overflowY: 'auto' }}>
                      <table className="hb-table">
                        <thead><tr><th>N°</th><th>Vencimiento</th><th className="num">Cuota</th><th className="num">Capital</th><th className="num">Interés</th><th className="num">Saldo</th></tr></thead>
                        <tbody>
                          {detalle.cronograma.map((c) => (
                            <tr key={c.numero}>
                              <td>{c.numero}</td><td>{fmtDate(c.fecha_pago)}</td>
                              <td className="num">{fmt(c.cuota)}</td><td className="num">{fmt(c.capital)}</td>
                              <td className="num">{fmt(c.interes)}</td><td className="num">{fmt(c.saldo)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                <div className="hb-field" style={{ marginBottom: 16 }}>
                  <label>Comentario {accion === 'rechazar' ? '(motivo del rechazo)' : '(observaciones, opcional)'}</label>
                  <textarea className="hb-textarea" rows={3}
                    placeholder={accion === 'aprobar' ? 'Cumple política de riesgos y RDS. Aprobado.' : 'No cumple con la política de riesgos / RDS elevado.'}
                    value={comentario} onChange={(e) => setComentario(e.target.value)} />
                </div>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button className="hb-btn-gray" onClick={cerrar} disabled={loadingAccion}>Cancelar</button>
                  <button className={`hb-btn ${accion === 'aprobar' ? 'hb-btn-green' : 'hb-btn-red'}`} onClick={confirmar}
                    disabled={loadingAccion || (detalle.nivel_aprobacion === 'comite' && rol !== 'comite')}>
                    {loadingAccion ? 'Procesando…' : accion === 'aprobar' ? 'Confirmar aprobación y desembolso' : 'Confirmar rechazo'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
