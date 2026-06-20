import { useEffect, useState } from 'react'
import * as api from '../../lib/api.js'
import { fmt, fmtDateTime } from '../../lib/format.js'
import Badge from '../../components/Badge.jsx'

export default function OperacionesPage() {
  const [op, setOp] = useState('transferencia')
  const [cuentas, setCuentas] = useState(null)
  const [creditos, setCreditos] = useState(null)
  const [err, setErr] = useState(null)
  const [done, setDone] = useState(null)
  const [loading, setLoading] = useState(false)

  const [tf, setTf] = useState({ origen: '', destino: '', monto: '', concepto: '' })
  const [pc, setPc] = useState({ codigoCredito: '', cuentaOrigen: '', monto: '' })
  const [ps, setPs] = useState({ servicio: 'SEDAPAL — Agua', referencia: '', cuentaOrigen: '', monto: '' })

  useEffect(() => {
    Promise.all([api.getCuentasAhorro(), api.getCuentasCredito()])
      .then(([c, cr]) => {
        setCuentas(c)
        setCreditos(cr)
        if (c.length >= 2) setTf({ origen: c[0].codigo, destino: c[1].codigo, monto: '', concepto: '' })
        else if (c.length === 1) setTf({ origen: c[0].codigo, destino: c[0].codigo, monto: '', concepto: '' })
        if (c.length) {
          setPc((p) => ({ ...p, cuentaOrigen: c[0].codigo }))
          setPs((p) => ({ ...p, cuentaOrigen: c[0].codigo }))
        }
        if (cr.length) setPc((p) => ({ ...p, codigoCredito: cr[0].codigo, monto: cr[0].cuota_mensual }))
      })
      .catch((e) => setErr(e.message))
  }, [])

  const ejecutar = async (e) => {
    e.preventDefault()
    setErr(null)
    setLoading(true)
    try {
      let resp
      if (op === 'transferencia') resp = await api.transferir({ ...tf, monto: Number(tf.monto) })
      else if (op === 'pago-credito') resp = await api.pagarCredito({ ...pc, monto: Number(pc.monto) })
      else resp = await api.pagarServicio({ ...ps, monto: Number(ps.monto) })
      setDone({ tipo: op, ...resp })
      // refresca saldos
      const [c, cr] = await Promise.all([api.getCuentasAhorro(), api.getCuentasCredito()])
      setCuentas(c); setCreditos(cr)
    } catch (ex) {
      setErr(ex.message)
    } finally {
      setLoading(false)
    }
  }

  const nueva = () => { setDone(null); setErr(null) }

  if (!cuentas) return <div className="hb-loader fade-in">Cargando cuentas…</div>

  if (done) {
    return (
      <div className="fade-in">
        <h1 className="hb-page-title">Operaciones</h1>
        <div className="hb-card">
          <div className="hb-card-hd"><span className="hb-card-title">✅ Operación completada</span></div>
          <div className="hb-card-body">
            <div className="hb-comprobante">
              <h3>✅ Comprobante de operación</h3>
              <dl className="hb-dl">
                <div><dt>Tipo</dt><dd style={{ textTransform: 'capitalize' }}>{done.tipo.replace('-', ' ')}</dd></div>
                <div><dt>Monto</dt><dd>{fmt(done.monto)}</dd></div>
                <div><dt>Fecha</dt><dd>{fmtDateTime(done.fecha)}</dd></div>
                <div><dt>Estado</dt><dd><Badge estado="Normal" /></dd></div>
              </dl>
              {done.mensaje && <p style={{ fontSize: 12, color: 'var(--q-muted)', marginTop: 10 }}>{done.mensaje}</p>}
            </div>
            <button className="hb-btn-gray" onClick={nueva}>Nueva operación</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in">
      <h1 className="hb-page-title">Operaciones</h1>
      <p className="hb-page-sub">Transferencias y pagos</p>

      <div className="hb-tabs">
        {[['transferencia', '💸 Transferencia'], ['pago-credito', '💳 Pago de crédito'], ['pago-servicio', '🧾 Pago de servicios']].map(([k, l]) => (
          <button key={k} className={`hb-tab${op === k ? ' active' : ''}`} onClick={() => { setOp(k); setErr(null) }}>{l}</button>
        ))}
      </div>

      {err && <div className="hb-alert-err">{err}</div>}

      <div className="hb-card">
        <form className="hb-card-body" onSubmit={ejecutar}>
          {op === 'transferencia' && (
            <>
              <div className="hb-form-grid">
                <div className="hb-field"><label>Cuenta origen</label>
                  <select className="hb-select" value={tf.origen} onChange={(e) => setTf({ ...tf, origen: e.target.value })}>
                    {cuentas.map((c) => <option key={c.codigo} value={c.codigo}>{c.codigo} — {fmt(c.saldo)}</option>)}
                  </select>
                </div>
                <div className="hb-field"><label>Cuenta destino</label>
                  <select className="hb-select" value={tf.destino} onChange={(e) => setTf({ ...tf, destino: e.target.value })}>
                    {cuentas.map((c) => <option key={c.codigo} value={c.codigo}>{c.codigo}</option>)}
                  </select>
                </div>
              </div>
              <div className="hb-form-grid">
                <div className="hb-field"><label>Monto (S/)</label>
                  <input className="hb-input" type="number" min="1" step="0.01" placeholder="0.00" value={tf.monto} onChange={(e) => setTf({ ...tf, monto: e.target.value })} required />
                </div>
                <div className="hb-field"><label>Concepto</label>
                  <input className="hb-input" placeholder="Descripción opcional" value={tf.concepto} onChange={(e) => setTf({ ...tf, concepto: e.target.value })} />
                </div>
              </div>
            </>
          )}

          {op === 'pago-credito' && (
            <div className="hb-form-grid">
              <div className="hb-field"><label>Crédito a pagar</label>
                {creditos?.length ? (
                  <select className="hb-select" value={pc.codigoCredito} onChange={(e) => {
                    const cr = creditos.find((x) => x.codigo === e.target.value)
                    setPc({ ...pc, codigoCredito: e.target.value, monto: cr?.cuota_mensual ?? pc.monto })
                  }}>
                    {creditos.map((c) => <option key={c.codigo} value={c.codigo}>{c.codigo} — {fmt(c.saldo_pendiente)}</option>)}
                  </select>
                ) : <div className="hb-empty">No tienes créditos activos.</div>}
              </div>
              <div className="hb-field"><label>Cuenta de débito</label>
                <select className="hb-select" value={pc.cuentaOrigen} onChange={(e) => setPc({ ...pc, cuentaOrigen: e.target.value })}>
                  {cuentas.map((c) => <option key={c.codigo} value={c.codigo}>{c.codigo} — {fmt(c.saldo)}</option>)}
                </select>
              </div>
              <div className="hb-field"><label>Monto (S/)</label>
                <input className="hb-input" type="number" min="1" step="0.01" value={pc.monto} onChange={(e) => setPc({ ...pc, monto: e.target.value })} required />
              </div>
            </div>
          )}

          {op === 'pago-servicio' && (
            <div className="hb-form-grid">
              <div className="hb-field"><label>Servicio</label>
                <select className="hb-select" value={ps.servicio} onChange={(e) => setPs({ ...ps, servicio: e.target.value })}>
                  <option>SEDAPAL — Agua</option>
                  <option>LUZ DEL SUR — Electricidad</option>
                  <option>MOVISTAR — Teléfono</option>
                  <option>CLARO — Internet</option>
                </select>
              </div>
              <div className="hb-field"><label>N° de suministro / cliente</label>
                <input className="hb-input" placeholder="Número de referencia" value={ps.referencia} onChange={(e) => setPs({ ...ps, referencia: e.target.value })} required />
              </div>
              <div className="hb-field"><label>Cuenta de débito</label>
                <select className="hb-select" value={ps.cuentaOrigen} onChange={(e) => setPs({ ...ps, cuentaOrigen: e.target.value })}>
                  {cuentas.map((c) => <option key={c.codigo} value={c.codigo}>{c.codigo} — {fmt(c.saldo)}</option>)}
                </select>
              </div>
              <div className="hb-field"><label>Monto (S/)</label>
                <input className="hb-input" type="number" min="1" step="0.01" value={ps.monto} onChange={(e) => setPs({ ...ps, monto: e.target.value })} required />
              </div>
            </div>
          )}

          <button type="submit" className="hb-btn" disabled={loading || (op === 'pago-credito' && !creditos?.length)}>
            {loading ? 'Procesando…' : 'Ejecutar operación →'}
          </button>
        </form>
      </div>
    </div>
  )
}
