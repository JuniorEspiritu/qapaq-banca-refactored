import { useEffect, useState } from 'react'
import * as api from '../../lib/api.js'
import { fmt, fmtDate, fmtDateTime } from '../../lib/format.js'
import Icon from '../../components/Icon.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

// ── Colores por banda ───────────────────────────────────────────────
const BANDA_CFG = {
  Preventiva: { bg: '#fef9c3', color: '#854d0e', border: '#fde68a', dias: '1–30' },
  Temprana:   { bg: '#ffedd5', color: '#9a3412', border: '#fdba74', dias: '31–60' },
  Tardía:     { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5', dias: '61–120' },
  Judicial:   { bg: '#fce7f3', color: '#9d174d', border: '#f9a8d4', dias: '121–180' },
  Castigo:    { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1', dias: '>180' },
}

function BandaBadge({ banda }) {
  const cfg = BANDA_CFG[banda] || { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' }
  return (
    <span style={{
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
    }}>{banda || '—'}</span>
  )
}

// ── Semáforo días de atraso ─────────────────────────────────────────
function DiasBadge({ dias }) {
  const color = dias <= 30 ? '#854d0e' : dias <= 60 ? '#9a3412' : dias <= 120 ? '#b91c1c' : dias <= 180 ? '#9d174d' : '#475569'
  const bg = dias <= 30 ? '#fef9c3' : dias <= 60 ? '#ffedd5' : dias <= 120 ? '#fee2e2' : dias <= 180 ? '#fce7f3' : '#f1f5f9'
  return (
    <span style={{ background: bg, color, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
      {dias} días
    </span>
  )
}

// ── Formulario de Gestión (R2) ──────────────────────────────────────
function GestionModal({ credito, onClose, onSaved }) {
  const [form, setForm] = useState({
    tipoGestion: 'Llamada telefónica',
    resultado: 'Comprometió pago',
    comentario: '',
    montoPrometido: '',
    fechaPromesa: '',
  })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setErr(null)
    setLoading(true)
    try {
      await api.registrarGestionMora({
        creditoId: credito.id,
        tipoGestion: form.tipoGestion,
        resultado: form.resultado,
        comentario: form.comentario,
        montoPrometido: form.montoPrometido ? Number(form.montoPrometido) : undefined,
        fechaPromesa: form.fechaPromesa || undefined,
      })
      onSaved()
    } catch (ex) {
      setErr(ex.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box fade-in">
        <h3><Icon name="briefcase" size={16} /> Registrar Gestión de Cobranza</h3>
        <div style={{ fontSize: 12, color: 'var(--q-muted)', marginBottom: 14, background: '#f8fafc', padding: '10px 12px', borderRadius: 8 }}>
          <strong style={{ color: 'var(--q-navy)' }}>{credito.codigo}</strong> — {credito.usuarios?.nombre} —
          Saldo: {fmt(credito.saldo_pendiente)} — <BandaBadge banda={credito.banda_mora} />
        </div>
        {err && <div className="hb-alert-err">{err}</div>}
        <form onSubmit={submit}>
          <div className="hb-form-grid" style={{ marginBottom: 12 }}>
            <div className="hb-field">
              <label>Tipo de gestión</label>
              <select className="hb-select" value={form.tipoGestion} onChange={e => setForm(f => ({ ...f, tipoGestion: e.target.value }))}>
                <option>Llamada telefónica</option>
                <option>Visita domiciliaria</option>
                <option>Correo electrónico</option>
                <option>SMS / WhatsApp</option>
                <option>Carta notarial</option>
                <option>Acuerdo de pago</option>
                <option>Derivación Judicial</option>
              </select>
            </div>
            <div className="hb-field">
              <label>Resultado</label>
              <select className="hb-select" value={form.resultado} onChange={e => setForm(f => ({ ...f, resultado: e.target.value }))}>
                <option>Comprometió pago</option>
                <option>No contactado</option>
                <option>Rechazó pago</option>
                <option>Pagó cuota</option>
                <option>Acuerdo establecido</option>
                <option>Número incorrecto</option>
                <option>Buzón de voz</option>
              </select>
            </div>
            <div className="hb-field">
              <label>Monto prometido (S/) — opcional</label>
              <input className="hb-input" type="number" min="0" step="0.01" placeholder="0.00"
                value={form.montoPrometido} onChange={e => setForm(f => ({ ...f, montoPrometido: e.target.value }))} />
            </div>
            <div className="hb-field">
              <label>Fecha de promesa — opcional</label>
              <input className="hb-input" type="date"
                value={form.fechaPromesa} onChange={e => setForm(f => ({ ...f, fechaPromesa: e.target.value }))} />
            </div>
          </div>
          <div className="hb-field" style={{ marginBottom: 16 }}>
            <label>Comentarios</label>
            <textarea className="hb-textarea" rows={3} placeholder="Detalles de la gestión realizada…"
              value={form.comentario} onChange={e => setForm(f => ({ ...f, comentario: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" className="hb-btn-gray" onClick={onClose} disabled={loading}>Cancelar</button>
            <button type="submit" className="hb-btn hb-btn-green" disabled={loading}>
              {loading ? 'Guardando…' : '✓ Registrar gestión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Modal Historial de Gestiones ────────────────────────────────────
function HistorialModal({ credito, onClose }) {
  const [gestiones, setGestiones] = useState(null)
  const [err, setErr] = useState(null)

  useEffect(() => {
    api.getGestionesMora(credito.id)
      .then(setGestiones)
      .catch(e => setErr(e.message))
  }, [credito.id])

  return (
    <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box fade-in" style={{ maxWidth: 640 }}>
        <h3><Icon name="file" size={16} /> Historial de Gestiones — {credito.codigo}</h3>
        <div style={{ fontSize: 12, color: 'var(--q-muted)', marginBottom: 14 }}>
          Cliente: <strong>{credito.usuarios?.nombre}</strong> · Saldo: <strong>{fmt(credito.saldo_pendiente)}</strong>
        </div>
        {err && <div className="hb-alert-err">{err}</div>}
        {!gestiones ? <div className="hb-loader">Cargando historial…</div> :
         gestiones.length === 0 ? <div className="hb-empty">No hay gestiones registradas aún.</div> :
         <div className="hb-table-wrap" style={{ maxHeight: 360, overflowY: 'auto' }}>
           <table className="hb-table">
             <thead><tr><th>Fecha</th><th>Tipo</th><th>Resultado</th><th>Comentario</th><th>Monto prom.</th><th>Gestor</th></tr></thead>
             <tbody>
               {gestiones.map(g => (
                 <tr key={g.id}>
                   <td style={{ fontSize: 11, whiteSpace: 'nowrap' }}>{fmtDateTime(g.fecha)}</td>
                   <td style={{ fontSize: 11 }}>{g.tipo_gestion}</td>
                   <td style={{ fontSize: 11 }}>{g.resultado}</td>
                   <td style={{ fontSize: 11, color: 'var(--q-muted)' }}>{g.comentario || '—'}</td>
                   <td style={{ fontSize: 11 }}>{g.monto_prometido ? fmt(g.monto_prometido) : '—'}</td>
                   <td style={{ fontSize: 11 }}>{g.usuarios?.nombre?.split(',')[0] || '—'}</td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
        }
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
          <button className="hb-btn-gray" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}

// ── Modal Transición R3 ─────────────────────────────────────────────
function TransicionModal({ credito, tipo, onClose, onDone }) {
  const [comentario, setComentario] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)

  const esJudicial = tipo === 'judicial'
  const requiereDias = esJudicial ? 121 : 181

  const puedeProceder = credito.dias_atraso >= requiereDias

  const confirmar = async () => {
    setErr(null)
    setLoading(true)
    try {
      if (esJudicial) await api.derivarJudicial(credito.id, comentario)
      else await api.castigarCredito(credito.id, comentario)
      onDone()
    } catch (ex) {
      setErr(ex.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-bg" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box fade-in">
        <h3 style={{ color: esJudicial ? '#9d174d' : '#475569' }}>
          {esJudicial ? '⚖️ Derivar a Judicial' : '🗑️ Castigar Crédito'}
        </h3>

        {!puedeProceder && (
          <div className="hb-alert-err">
            El crédito tiene <strong>{credito.dias_atraso} días</strong> de atraso.
            Se requieren mínimo <strong>{requiereDias} días</strong> para {esJudicial ? 'derivar a Judicial' : 'castigar'}.
          </div>
        )}

        {puedeProceder && (
          <>
            <div style={{ background: esJudicial ? '#fce7f3' : '#f1f5f9', borderRadius: 8, padding: '12px 14px', marginBottom: 14, fontSize: 13 }}>
              <div><strong>{credito.codigo}</strong> — {credito.usuarios?.nombre}</div>
              <div style={{ color: 'var(--q-muted)', marginTop: 4 }}>
                Saldo pendiente: <strong>{fmt(credito.saldo_pendiente)}</strong> ·
                Días de atraso: <strong style={{ color: '#b91c1c' }}>{credito.dias_atraso}</strong>
              </div>
            </div>
            <div className="hb-alert-warn" style={{ marginBottom: 14 }}>
              {esJudicial
                ? '⚠️ Esta acción derivará el crédito al proceso de cobranza judicial. No es reversible sin autorización del comité.'
                : '⚠️ El castigo contable elimina el crédito de la cartera vigente y lo registra como pérdida. Esta acción es IRREVERSIBLE.'}
            </div>
            <div className="hb-field" style={{ marginBottom: 16 }}>
              <label>Comentario / justificación {!esJudicial && <span style={{ color: '#b91c1c' }}>*</span>}</label>
              <textarea className="hb-textarea" rows={3}
                placeholder={esJudicial ? 'Motivo de derivación a judicial…' : 'Justificación del castigo contable (obligatorio)…'}
                value={comentario} onChange={e => setComentario(e.target.value)}
                required={!esJudicial} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="hb-btn-gray" onClick={onClose} disabled={loading}>Cancelar</button>
              <button
                className={`hb-btn ${esJudicial ? '' : 'hb-btn-red'}`}
                style={esJudicial ? { background: '#9d174d' } : {}}
                onClick={confirmar}
                disabled={loading || (!esJudicial && !comentario.trim())}
              >
                {loading ? 'Procesando…' : esJudicial ? '⚖️ Confirmar derivación' : '🗑️ Confirmar castigo'}
              </button>
            </div>
          </>
        )}

        {!puedeProceder && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
            <button className="hb-btn-gray" onClick={onClose}>Cerrar</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Componente Principal MoraPage ───────────────────────────────────
export default function MoraPage() {
  const { rol } = useAuth()
  const [banda, setBanda] = useState('Todas')
  const [cartera, setCartera] = useState(null)
  const [kpis, setKpis] = useState(null)
  const [err, setErr] = useState(null)
  const [okMsg, setOkMsg] = useState(null)

  const [modalGestion, setModalGestion] = useState(null)
  const [modalHistorial, setModalHistorial] = useState(null)
  const [modalTransicion, setModalTransicion] = useState(null) // { credito, tipo }

  const BANDAS = ['Todas', 'Preventiva', 'Temprana', 'Tardía', 'Judicial', 'Castigo']

  const cargar = (b) => {
    setErr(null)
    api.getCarteraMora(b === 'Todas' ? undefined : b)
      .then(({ creditos, kpis }) => { setCartera(creditos); setKpis(kpis) })
      .catch(e => setErr(e.message))
  }

  useEffect(() => { cargar(banda) }, [banda])

  const handleOk = (msg) => {
    setModalGestion(null)
    setModalHistorial(null)
    setModalTransicion(null)
    setOkMsg(msg || 'Operación realizada correctamente.')
    cargar(banda)
    setTimeout(() => setOkMsg(null), 5000)
  }

  const totalMora = kpis?.saldoTotal || 0
  const totalCreditos = kpis?.total || 0

  return (
    <div className="fade-in">
      <h1 className="hb-page-title">Módulo de Recuperaciones — Cartera Morosa</h1>
      <p className="hb-page-sub">Gestión de cobranza R1 (consulta) · R2 (gestiones) · R3 (judicial / castigo)</p>

      {okMsg && <div className="hb-alert-ok" style={{ marginBottom: 14 }}>✅ {okMsg}</div>}
      {err && <div className="hb-alert-err" style={{ marginBottom: 14 }}>{err}</div>}

      {/* ── KPIs R1 ─────────────────────────────────────────────── */}
      {kpis && (
        <div className="hb-kpis" style={{ marginBottom: 22 }}>
          <div className="hb-kpi">
            <div className="hb-kpi-ico" style={{ background: '#fee2e2', color: '#b91c1c' }}><Icon name="credit" /></div>
            <div>
              <div className="hb-kpi-label">Créditos en mora</div>
              <div className="hb-kpi-val">{totalCreditos}</div>
              <small>cartera morosa activa</small>
            </div>
          </div>
          <div className="hb-kpi">
            <div className="hb-kpi-ico" style={{ background: '#fff7ed', color: '#c2410c' }}><Icon name="piggy" /></div>
            <div>
              <div className="hb-kpi-label">Saldo total en mora</div>
              <div className="hb-kpi-val">{fmt(totalMora)}</div>
              <small>exposición crediticia</small>
            </div>
          </div>
          {Object.entries(kpis.porBanda || {}).map(([b, d]) => (
            <div key={b} className="hb-kpi">
              <div className="hb-kpi-ico" style={{ background: BANDA_CFG[b]?.bg || '#f1f5f9', color: BANDA_CFG[b]?.color || '#475569' }}>
                <span style={{ fontSize: 20 }}>{b === 'Preventiva' ? '🟡' : b === 'Temprana' ? '🟠' : b === 'Tardía' ? '🔴' : b === 'Judicial' ? '⚖️' : '🗑️'}</span>
              </div>
              <div>
                <div className="hb-kpi-label">{b} ({BANDA_CFG[b]?.dias}d)</div>
                <div className="hb-kpi-val" style={{ fontSize: 17 }}>{d.cantidad} <span style={{ fontSize: 12, color: 'var(--q-muted)', fontWeight: 500 }}>créd.</span></div>
                <small>{fmt(d.saldo)}</small>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Filtro por banda ─────────────────────────────────────── */}
      <div className="hb-card" style={{ marginBottom: 0 }}>
        <div className="hb-card-hd">
          <span className="hb-card-title"><Icon name="briefcase" size={16} /> Cartera en mora por bandas</span>
          <button className="hb-link" onClick={() => cargar(banda)}><Icon name="refresh" size={14} /> Actualizar</button>
        </div>

        <div style={{ padding: '12px 18px 0', borderBottom: '1px solid var(--q-border)' }}>
          <div className="hb-tabs" style={{ marginBottom: 0 }}>
            {BANDAS.map(b => (
              <button key={b} className={`hb-tab${banda === b ? ' active' : ''}`} onClick={() => setBanda(b)}>
                {b}
                {kpis && b !== 'Todas' && kpis.porBanda?.[b] && (
                  <span style={{ marginLeft: 5, background: BANDA_CFG[b]?.bg, color: BANDA_CFG[b]?.color, borderRadius: 20, padding: '1px 7px', fontSize: 10 }}>
                    {kpis.porBanda[b].cantidad}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="hb-card-body" style={{ padding: 0 }}>
          {!cartera ? (
            <div className="hb-loader">Cargando cartera morosa…</div>
          ) : cartera.length === 0 ? (
            <div className="hb-empty-state"><div className="big">✅</div>No hay créditos en mora en esta banda.</div>
          ) : (
            <div className="hb-table-wrap">
              <table className="hb-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Cliente</th>
                    <th>DNI</th>
                    <th>Banda</th>
                    <th className="num">Días atraso</th>
                    <th className="num">Saldo pendiente</th>
                    <th className="num">Cuota mensual</th>
                    <th>Tipo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cartera.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{c.codigo}</td>
                      <td style={{ fontWeight: 600 }}>{c.usuarios?.nombre}</td>
                      <td style={{ fontSize: 11 }}>{c.usuarios?.dni}</td>
                      <td><BandaBadge banda={c.banda_mora} /></td>
                      <td className="num"><DiasBadge dias={c.dias_atraso} /></td>
                      <td className="num" style={{ fontWeight: 700, color: 'var(--q-red)' }}>{fmt(c.saldo_pendiente)}</td>
                      <td className="num">{fmt(c.cuota_mensual)}</td>
                      <td style={{ fontSize: 11 }}>{c.tipo_credito}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {/* R2: Registrar gestión */}
                          <button className="hb-btn" style={{ padding: '5px 10px', fontSize: 11 }}
                            onClick={() => setModalGestion(c)}>
                            📝 Gestión
                          </button>
                          {/* R2: Ver historial */}
                          <button className="hb-btn-gray" style={{ padding: '5px 10px', fontSize: 11 }}
                            onClick={() => setModalHistorial(c)}>
                            📋 Historial
                          </button>
                          {/* R3: Derivar a Judicial */}
                          {c.dias_atraso >= 121 && c.banda_mora !== 'Judicial' && c.banda_mora !== 'Castigo' && (
                            <button className="hb-btn" style={{ padding: '5px 10px', fontSize: 11, background: '#9d174d' }}
                              onClick={() => setModalTransicion({ credito: c, tipo: 'judicial' })}>
                              ⚖️ Judicial
                            </button>
                          )}
                          {/* R3: Castigar — solo comité y >180 días */}
                          {rol === 'comite' && c.dias_atraso > 180 && c.banda_mora !== 'Castigo' && (
                            <button className="hb-btn hb-btn-red" style={{ padding: '5px 10px', fontSize: 11 }}
                              onClick={() => setModalTransicion({ credito: c, tipo: 'castigo' })}>
                              🗑️ Castigar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Modales ─────────────────────────────────────────────── */}
      {modalGestion && (
        <GestionModal
          credito={modalGestion}
          onClose={() => setModalGestion(null)}
          onSaved={() => handleOk('Gestión de cobranza registrada correctamente.')}
        />
      )}
      {modalHistorial && (
        <HistorialModal
          credito={modalHistorial}
          onClose={() => setModalHistorial(null)}
        />
      )}
      {modalTransicion && (
        <TransicionModal
          credito={modalTransicion.credito}
          tipo={modalTransicion.tipo}
          onClose={() => setModalTransicion(null)}
          onDone={() => handleOk(
            modalTransicion.tipo === 'judicial'
              ? 'Crédito derivado a Judicial correctamente.'
              : 'Crédito castigado contablemente.'
          )}
        />
      )}
    </div>
  )
}
