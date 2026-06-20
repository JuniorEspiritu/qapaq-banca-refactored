import { useEffect, useState } from 'react'
import * as api from '../../lib/api.js'
import { fmt, fmtDate, fmtDateTime } from '../../lib/format.js'
import Icon from '../../components/Icon.jsx'

const ESTADOS = ['Todos', 'Aprobado', 'Desembolsado', 'Rechazado']

export default function ResueltasPage() {
  const [solicitudes, setSolicitudes] = useState(null)
  const [filtro, setFiltro] = useState('Todos')
  const [err, setErr] = useState(null)

  const cargar = () => {
    setErr(null)
    api.getSolicitudesPendientes().then(setSolicitudes).catch((e) => setErr(e.message))
  }

  useEffect(cargar, [])

  const resueltas = (solicitudes || []).filter((s) => s.estado !== 'En Evaluación')
  const filtradas = filtro === 'Todos' ? resueltas : resueltas.filter((s) => s.estado === filtro)

  return (
    <div className="fade-in">
      <h1 className="hb-page-title">Solicitudes Resueltas</h1>
      <p className="hb-page-sub">Historial de créditos aprobados, desembolsados o rechazados</p>

      {err && <div className="hb-alert-err">{err}</div>}

      <div className="hb-tabs">
        {ESTADOS.map((e) => (
          <button key={e} className={`hb-tab${filtro === e ? ' active' : ''}`} onClick={() => setFiltro(e)}>{e}</button>
        ))}
      </div>

      <div className="hb-card">
        <div className="hb-card-hd">
          <span className="hb-card-title"><Icon name="check" size={16} /> Resultado de evaluaciones</span>
          <button className="hb-link" onClick={cargar}><Icon name="refresh" size={14} /> Actualizar</button>
        </div>
        <div className="hb-card-body">
          {!solicitudes ? <div className="hb-loader">Cargando…</div> :
           filtradas.length === 0 ? <div className="hb-empty">No hay solicitudes con este estado.</div> :
           <div className="hb-table-wrap">
            <table className="hb-table">
              <thead>
                <tr>
                  <th>Código</th><th>Cliente</th><th className="num">Monto</th><th>Plazo</th>
                  <th className="num">Cuota</th><th>Estado</th><th>Resuelto</th><th>Comentario</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{s.codigo}</td>
                    <td>{s.usuarios?.nombre}</td>
                    <td className="num">{fmt(s.monto)}</td>
                    <td>{s.plazo} meses</td>
                    <td className="num">{fmt(s.cuota_mensual)}</td>
                    <td>
                      <span className={
                        `status-pill ${s.estado === 'Aprobado' ? 'status-aprobado' :
                          s.estado === 'Desembolsado' ? 'status-desembolsado' : 'status-rechazado'}`
                      }>{s.estado}</span>
                    </td>
                    <td style={{ fontSize: 11 }}>{fmtDateTime(s.fecha_resolucion)}</td>
                    <td style={{ fontSize: 11, color: 'var(--q-muted)', maxWidth: 220 }}>{s.comentario_asesor || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
           </div>
          }
        </div>
      </div>
    </div>
  )
}
