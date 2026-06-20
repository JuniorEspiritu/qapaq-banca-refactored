import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import * as api from '../../lib/api.js'
import { fmt } from '../../lib/format.js'
import Badge from '../../components/Badge.jsx'
import Icon from '../../components/Icon.jsx'

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [cuentas, setCuentas] = useState(null)
  const [creditos, setCreditos] = useState(null)
  const [err, setErr] = useState(null)

  useEffect(() => {
    let active = true
    Promise.all([api.getCuentasAhorro(), api.getCuentasCredito()])
      .then(([c, cr]) => { if (active) { setCuentas(c); setCreditos(cr) } })
      .catch((e) => active && setErr(e.message))
    return () => { active = false }
  }, [])

  const first = user?.nombre?.split(',')[1]?.trim().split(' ')[0] || 'Cliente'
  const totalAhorro = (cuentas || []).reduce((s, c) => s + Number(c.saldo), 0)
  const totalDeuda  = (creditos || []).reduce((s, c) => s + Number(c.saldo_pendiente), 0)

  const acciones = [
    { icon: 'send',    label: 'Transferencia entre cuentas', to: '/banca/operaciones', color: '#f5c800' },
    { icon: 'receipt', label: 'Pago de cuota de crédito',    to: '/banca/operaciones', color: '#22c55e' },
    { icon: 'file',    label: 'Solicitar préstamo nuevo',    to: '/banca/solicitar',   color: '#3b82f6' },
    { icon: 'credit',  label: 'Ver mis créditos',            to: '/banca/creditos',    color: '#a855f7' },
  ]

  return (
    <div className="fade-in">
      <style>{`
        /* ── HERO CARD FUTURISTA ── */
        .hero-banner {
          background: linear-gradient(135deg, #07142a 0%, #0f2347 35%, #163d82 65%, #1a52b0 100%);
          border-radius: 24px;
          padding: 36px 40px;
          margin-bottom: 28px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(7,20,42,.4);
        }
        .hero-banner::before {
          content: '';
          position: absolute;
          top: -80px; right: -80px;
          width: 340px; height: 340px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(245,200,0,.18) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-banner::after {
          content: '';
          position: absolute;
          bottom: -60px; left: -60px;
          width: 260px; height: 260px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(37,99,192,.25) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-greeting {
          font-size: 13px; font-weight: 600;
          color: rgba(255,255,255,.6);
          text-transform: uppercase; letter-spacing: 2px;
          margin-bottom: 6px;
        }
        .hero-name {
          font-size: clamp(26px, 3.5vw, 38px);
          font-weight: 900;
          color: #fff;
          letter-spacing: -1px;
          margin-bottom: 4px;
        }
        .hero-sub {
          font-size: 13px; color: rgba(255,255,255,.55);
          margin-bottom: 32px;
        }
        .hero-kpis {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          position: relative; z-index: 1;
        }
        .hero-kpi {
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 16px;
          padding: 20px 22px;
          backdrop-filter: blur(10px);
          transition: background .2s, border-color .2s, transform .2s;
          cursor: default;
          position: relative;
          overflow: hidden;
        }
        .hero-kpi::before {
          content: '';
          position: absolute; top: 0; left: 0;
          width: 100%; height: 2px;
          border-radius: 2px 2px 0 0;
        }
        .hero-kpi.ahorro::before { background: linear-gradient(90deg, #22c55e, #16a34a); }
        .hero-kpi.deuda::before  { background: linear-gradient(90deg, #ef4444, #dc2626); }
        .hero-kpi:hover { background: rgba(255,255,255,.11); border-color: rgba(255,255,255,.22); transform: translateY(-2px); }
        .hero-kpi-icon {
          width: 40px; height: 40px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; margin-bottom: 12px;
        }
        .hero-kpi-label {
          font-size: 10.5px; font-weight: 700;
          color: rgba(255,255,255,.5);
          text-transform: uppercase; letter-spacing: 1px;
          margin-bottom: 6px;
        }
        .hero-kpi-val {
          font-size: clamp(20px, 2.5vw, 28px);
          font-weight: 900; color: #fff;
          letter-spacing: -1px;
        }
        .hero-kpi-sub { font-size: 11px; color: rgba(255,255,255,.4); margin-top: 4px; }

        /* ── TARJETA VIRTUAL ── */
        .virtual-card {
          position: absolute;
          right: 40px; top: 50%;
          transform: translateY(-50%);
          width: 220px; height: 138px;
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(255,255,255,.15), rgba(255,255,255,.05));
          border: 1px solid rgba(255,255,255,.18);
          backdrop-filter: blur(12px);
          padding: 18px 20px;
          display: flex; flex-direction: column;
          justify-content: space-between;
          box-shadow: 0 8px 32px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.2);
          animation: cardFloat 4s ease-in-out infinite;
        }
        @keyframes cardFloat { 0%,100%{transform:translateY(-50%) translateY(0)} 50%{transform:translateY(-50%) translateY(-6px)} }
        .vc-chip {
          width: 32px; height: 24px;
          background: linear-gradient(135deg, #f5c800, #d97706);
          border-radius: 5px;
        }
        .vc-num {
          font-size: 13px; font-weight: 700;
          color: rgba(255,255,255,.8);
          letter-spacing: 2px;
          font-family: monospace;
        }
        .vc-bottom {
          display: flex; align-items: center;
          justify-content: space-between;
        }
        .vc-name { font-size: 11px; font-weight: 700; color: rgba(255,255,255,.7); text-transform: uppercase; }
        .vc-logo { font-size: 11px; font-weight: 900; color: #f5c800; letter-spacing: .5px; }
        .vc-shine {
          position: absolute; inset: 0;
          background: linear-gradient(105deg, rgba(255,255,255,0) 40%, rgba(255,255,255,.08) 50%, rgba(255,255,255,0) 60%);
          border-radius: 16px;
          animation: vcShine 3s ease-in-out infinite;
        }
        @keyframes vcShine { 0%,100%{opacity:0} 50%{opacity:1} }

        /* ── SECTION CARDS ── */
        .section-card {
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 2px 16px rgba(7,20,42,.07);
          margin-bottom: 20px;
          border: 1px solid rgba(0,0,0,.05);
          transition: box-shadow .2s;
        }
        .section-card:hover { box-shadow: 0 8px 32px rgba(7,20,42,.12); }
        .section-card-hd {
          padding: 18px 24px;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid #f0f2f8;
          background: linear-gradient(90deg, #fafbff, #fff);
        }
        .section-card-title {
          font-size: 15px; font-weight: 800;
          color: #07142a;
          display: flex; align-items: center; gap: 8px;
        }
        .section-card-body { padding: 0 8px 8px; }

        /* ── PRODUCT LIST ROWS ── */
        .prod-row {
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 16px 16px;
          border-radius: 12px;
          cursor: pointer;
          transition: background .15s, transform .15s, padding-left .15s;
          margin: 4px 0;
        }
        .prod-row:hover {
          background: linear-gradient(90deg, #f0f6ff, #f8faff);
          transform: translateX(4px);
          padding-left: 20px;
        }
        .prod-row-left { display: flex; align-items: center; gap: 14px; }
        .prod-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .prod-info strong { display: block; font-size: 14px; font-weight: 700; color: #07142a; }
        .prod-info small  { font-size: 12px; color: #6b7280; }
        .prod-amount { font-size: 15px; font-weight: 800; color: #07142a; display: flex; align-items: center; gap: 6px; }
        .prod-divider { height: 1px; background: #f0f2f8; margin: 0 16px; }

        /* ── ASIDE ACCIONES ── */
        .aside-header {
          font-size: 12px; font-weight: 800;
          color: #07142a; text-transform: uppercase;
          letter-spacing: 1.2px;
          display: flex; align-items: center; gap: 6px;
          margin-bottom: 14px;
          padding-left: 4px;
        }
        .action-card {
          background: #fff;
          border: 1px solid #edf0f8;
          border-radius: 14px;
          padding: 14px 16px;
          cursor: pointer;
          display: flex; align-items: center; gap: 14px;
          transition: transform .18s, box-shadow .18s, border-color .18s, background .18s;
          margin-bottom: 10px;
          position: relative;
          overflow: hidden;
        }
        .action-card::before {
          content: '';
          position: absolute; left: 0; top: 0;
          width: 3px; height: 100%;
          border-radius: 3px 0 0 3px;
          transition: width .2s;
        }
        .action-card:hover { transform: translateX(5px); box-shadow: 0 6px 24px rgba(0,0,0,.08); border-color: transparent; }
        .action-card:hover::before { width: 4px; }
        .action-ico {
          width: 40px; height: 40px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 17px; flex-shrink: 0;
          transition: transform .2s;
        }
        .action-card:hover .action-ico { transform: scale(1.1) rotate(-5deg); }
        .action-label { font-size: 13px; font-weight: 600; color: #07142a; }
      `}</style>

      {/* ── HERO BANNER FUTURISTA ── */}
      <div className="hero-banner">
        <div style={{ position:'relative', zIndex:1 }}>
          <div className="hero-greeting">Bienvenido de vuelta</div>
          <div className="hero-name">{first} 👋</div>
          <div className="hero-sub">Posición global de tus productos en Financiera Qapaq</div>

          <div className="hero-kpis">
            <div className="hero-kpi ahorro">
              <div className="hero-kpi-icon" style={{ background:'rgba(34,197,94,.15)' }}>
                <Icon name="piggy" size={20} />
              </div>
              <div className="hero-kpi-label">Total en ahorros</div>
              <div className="hero-kpi-val">{cuentas ? fmt(totalAhorro) : '···'}</div>
              <div className="hero-kpi-sub">{cuentas?.length ?? 0} cuenta(s) activa(s)</div>
            </div>
            <div className="hero-kpi deuda">
              <div className="hero-kpi-icon" style={{ background:'rgba(239,68,68,.15)' }}>
                <Icon name="credit" size={20} />
              </div>
              <div className="hero-kpi-label">Deuda en créditos</div>
              <div className="hero-kpi-val">{creditos ? fmt(totalDeuda) : '···'}</div>
              <div className="hero-kpi-sub">{creditos?.length ?? 0} crédito(s)</div>
            </div>
          </div>
        </div>

        {/* Tarjeta virtual flotante */}
        <div className="virtual-card">
          <div className="vc-shine" />
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div className="vc-chip" />
            <div style={{ fontSize:9, color:'rgba(255,255,255,.4)', fontWeight:700, letterSpacing:1 }}>BANCA DIGITAL</div>
          </div>
          <div className="vc-num">•••• •••• 0001</div>
          <div className="vc-bottom">
            <div className="vc-name">{first}</div>
            <div className="vc-logo">QAPAQ</div>
          </div>
        </div>
      </div>

      {err && <div className="hb-alert-err">{err}</div>}

      {/* ── LAYOUT 2 COLS ── */}
      <div className="hb-layout-2">
        <div>
          {/* Cuentas de Ahorro */}
          <div className="section-card">
            <div className="section-card-hd">
              <span className="section-card-title">
                <span style={{ fontSize:18 }}>🐷</span> Cuentas de Ahorro
              </span>
              <button className="hb-link" onClick={() => navigate('/banca/ahorros')}>Ver todas →</button>
            </div>
            <div className="section-card-body">
              {!cuentas ? <div className="hb-loader">Cargando…</div> :
               cuentas.length === 0 ? <div className="hb-empty">No tienes cuentas registradas.</div> :
               cuentas.map((c, i) => (
                <div key={c.codigo}>
                  <div className="prod-row" onClick={() => navigate('/banca/ahorros')}>
                    <div className="prod-row-left">
                      <div className="prod-dot" style={{ background:'#22c55e' }} />
                      <div className="prod-info">
                        <strong>{c.codigo}</strong>
                        <small>{c.tipo} · <Badge estado={c.estado} /></small>
                      </div>
                    </div>
                    <div className="prod-amount">
                      <span style={{ color:'#15803d' }}>{fmt(c.saldo)}</span>
                      <Icon name="arrow" size={14} />
                    </div>
                  </div>
                  {i < cuentas.length - 1 && <div className="prod-divider" />}
                </div>
               ))
              }
            </div>
          </div>

          {/* Préstamos */}
          <div className="section-card">
            <div className="section-card-hd">
              <span className="section-card-title">
                <span style={{ fontSize:18 }}>💳</span> Préstamos
              </span>
              <button className="hb-link" onClick={() => navigate('/banca/creditos')}>Ver todos →</button>
            </div>
            <div className="section-card-body">
              {!creditos ? <div className="hb-loader">Cargando…</div> :
               creditos.length === 0 ? <div className="hb-empty">Aún no tienes créditos activos.</div> :
               creditos.map((c, i) => (
                <div key={c.codigo}>
                  <div className="prod-row" onClick={() => navigate('/banca/creditos')}>
                    <div className="prod-row-left">
                      <div className="prod-dot" style={{ background: c.estado === 'Mora' ? '#ef4444' : '#3b82f6' }} />
                      <div className="prod-info">
                        <strong>{c.codigo}</strong>
                        <small>{c.tipo_credito} · <Badge estado={c.estado} /></small>
                      </div>
                    </div>
                    <div className="prod-amount">
                      <span style={{ color: c.estado === 'Mora' ? '#dc2626' : '#07142a' }}>{fmt(c.saldo_pendiente)}</span>
                      <Icon name="arrow" size={14} />
                    </div>
                  </div>
                  {i < creditos.length - 1 && <div className="prod-divider" />}
                </div>
               ))
              }
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="aside-header">
            <span style={{ color:'#f5c800', fontSize:16 }}>⚡</span> Operaciones rápidas
          </div>
          {acciones.map((a) => (
            <div key={a.label} className="action-card" onClick={() => navigate(a.to)}
              style={{ '--ac': a.color }}
            >
              <style>{`.action-card:hover { background: ${a.color}08; } .action-card::before { background: ${a.color}; }`}</style>
              <div className="action-ico" style={{ background:`${a.color}18`, color: a.color }}>
                <Icon name={a.icon} size={17} />
              </div>
              <span className="action-label">{a.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
