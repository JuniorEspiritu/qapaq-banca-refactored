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
  const [cuentas,  setCuentas]  = useState(null)
  const [creditos, setCreditos] = useState(null)
  const [err,      setErr]      = useState(null)
  const [hidden,   setHidden]   = useState(false) // 👁 ocultar saldos

  useEffect(() => {
    let active = true
    Promise.all([api.getCuentasAhorro(), api.getCuentasCredito()])
      .then(([c, cr]) => { if (active) { setCuentas(c); setCreditos(cr) } })
      .catch((e) => active && setErr(e.message))
    return () => { active = false }
  }, [])

  const first       = user?.nombre?.split(',')[1]?.trim().split(' ')[0] || 'Cliente'
  const totalAhorro = (cuentas  || []).reduce((s, c) => s + Number(c.saldo),           0)
  const totalDeuda  = (creditos || []).reduce((s, c) => s + Number(c.saldo_pendiente), 0)

  // Valor mostrado según estado de oculto
  const mask = '••••••'
  const show = (val) => hidden ? mask : (val === null ? '···' : fmt(val))

  const acciones = [
    { icon: 'send',    label: 'Transferencia entre cuentas', to: '/banca/operaciones', color: '#f5c800' },
    { icon: 'receipt', label: 'Pago de cuota de crédito',    to: '/banca/operaciones', color: '#22c55e' },
    { icon: 'file',    label: 'Solicitar préstamo nuevo',    to: '/banca/solicitar',   color: '#3b82f6' },
    { icon: 'credit',  label: 'Ver mis créditos',            to: '/banca/creditos',    color: '#a855f7' },
  ]

  return (
    <div className="fade-in">
      <style>{`
        /* ── HERO ── */
        .hero-banner {
          background: linear-gradient(135deg, #07142a 0%, #0f2347 35%, #163d82 65%, #1a52b0 100%);
          border-radius: 20px;
          padding: 26px 20px 28px;
          margin-bottom: 20px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 16px 48px rgba(7,20,42,.4);
        }
        .hero-banner::before {
          content: '';
          position: absolute; top: -80px; right: -80px;
          width: 300px; height: 300px; border-radius: 50%;
          background: radial-gradient(circle, rgba(245,200,0,.15) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Greeting */
        .hero-greeting {
          font-size: 11px; font-weight: 600;
          color: rgba(255,255,255,.55);
          text-transform: uppercase; letter-spacing: 2px;
          margin-bottom: 4px;
        }
        .hero-name {
          font-size: clamp(22px, 5vw, 34px);
          font-weight: 900; color: #fff; letter-spacing: -1px;
          margin-bottom: 2px;
        }
        .hero-sub {
          font-size: 12px; color: rgba(255,255,255,.45);
          margin-bottom: 20px;
        }

        /* Botón ocultar saldos */
        .hero-eye-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,.1);
          border: 1px solid rgba(255,255,255,.18);
          color: rgba(255,255,255,.8);
          font-size: 11px; font-weight: 700;
          padding: 6px 14px; border-radius: 20px;
          cursor: pointer; font-family: inherit;
          transition: background .15s;
          margin-bottom: 18px;
          letter-spacing: .3px;
        }
        .hero-eye-btn:hover { background: rgba(255,255,255,.18); }

        /* KPI cards */
        .hero-kpis {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          position: relative; z-index: 1;
        }
        .hero-kpi {
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 14px;
          padding: 16px 16px;
          backdrop-filter: blur(10px);
          transition: background .2s, transform .2s;
          position: relative; overflow: hidden;
        }
        .hero-kpi::before {
          content: '';
          position: absolute; top: 0; left: 0;
          width: 100%; height: 2.5px; border-radius: 2px 2px 0 0;
        }
        .hero-kpi.ahorro::before { background: linear-gradient(90deg, #22c55e, #16a34a); }
        .hero-kpi.deuda::before  { background: linear-gradient(90deg, #ef4444, #dc2626); }
        .hero-kpi:hover { background: rgba(255,255,255,.11); transform: translateY(-2px); }

        .hero-kpi-icon {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; margin-bottom: 10px;
        }
        .hero-kpi-label {
          font-size: 9.5px; font-weight: 700;
          color: rgba(255,255,255,.45);
          text-transform: uppercase; letter-spacing: 1px;
          margin-bottom: 5px;
        }
        .hero-kpi-val {
          font-size: clamp(17px, 4vw, 26px);
          font-weight: 900; color: #fff; letter-spacing: -1px;
          min-height: 32px;
          display: flex; align-items: center;
          transition: filter .2s;
        }
        .hero-kpi-val.blurred { filter: blur(6px); user-select: none; }
        .hero-kpi-sub { font-size: 10px; color: rgba(255,255,255,.35); margin-top: 3px; }

        /* Tarjeta virtual — solo desktop */
        .virtual-card {
          display: none;
        }

        /* ── SECTION CARDS ── */
        .section-card {
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(7,20,42,.07);
          margin-bottom: 16px;
          border: 1px solid rgba(0,0,0,.05);
          transition: box-shadow .2s;
        }
        .section-card:hover { box-shadow: 0 6px 28px rgba(7,20,42,.11); }
        .section-card-hd {
          padding: 15px 18px;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid #f0f2f8;
        }
        .section-card-title {
          font-size: 14px; font-weight: 800; color: #07142a;
          display: flex; align-items: center; gap: 7px;
        }
        .section-card-body { padding: 0 6px 6px; }

        /* Product rows */
        .prod-row {
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 14px 12px;
          border-radius: 10px;
          cursor: pointer;
          transition: background .15s, transform .15s;
          margin: 3px 0;
        }
        .prod-row:hover { background: #f0f6ff; transform: translateX(3px); }
        .prod-row-left { display: flex; align-items: center; gap: 12px; }
        .prod-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
        .prod-info strong { display: block; font-size: 13px; font-weight: 700; color: #07142a; }
        .prod-info small  { font-size: 11px; color: #6b7280; }
        .prod-amount {
          font-size: 14px; font-weight: 800; color: #07142a;
          display: flex; align-items: center; gap: 5px;
          transition: filter .2s;
        }
        .prod-amount.blurred { filter: blur(5px); user-select: none; }
        .prod-divider { height: 1px; background: #f0f2f8; margin: 0 12px; }

        /* Aside */
        .aside-header {
          font-size: 11px; font-weight: 800; color: #07142a;
          text-transform: uppercase; letter-spacing: 1.2px;
          display: flex; align-items: center; gap: 6px;
          margin-bottom: 12px; padding-left: 2px;
        }
        .action-card {
          background: #fff;
          border: 1px solid #edf0f8;
          border-radius: 12px;
          padding: 13px 14px;
          cursor: pointer;
          display: flex; align-items: center; gap: 12px;
          transition: transform .18s, box-shadow .18s, background .18s;
          margin-bottom: 9px;
          position: relative; overflow: hidden;
        }
        .action-card::before {
          content: '';
          position: absolute; left: 0; top: 0;
          width: 3px; height: 100%;
          border-radius: 3px 0 0 3px;
          transition: width .2s;
        }
        .action-card:hover { transform: translateX(4px); box-shadow: 0 4px 18px rgba(0,0,0,.08); }
        .action-card:hover::before { width: 4px; }
        .action-ico {
          width: 38px; height: 38px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; flex-shrink: 0;
          transition: transform .2s;
        }
        .action-card:hover .action-ico { transform: scale(1.1) rotate(-5deg); }
        .action-label { font-size: 12.5px; font-weight: 600; color: #07142a; }

        /* ══════════════════════
           DESKTOP ≥ 640px
        ══════════════════════ */
        @media (min-width: 640px) {
          .hero-banner { padding: 36px 40px; border-radius: 24px; margin-bottom: 28px; }
          .hero-name   { font-size: 34px; }
          .hero-sub    { font-size: 13px; }
          .hero-kpis   { gap: 16px; }
          .hero-kpi    { padding: 20px 22px; }
          .hero-kpi-icon { width: 40px; height: 40px; font-size: 18px; margin-bottom: 12px; }
          .hero-kpi-label { font-size: 10.5px; }
          .hero-kpi-val   { font-size: 26px; }

          /* Tarjeta virtual visible en desktop */
          .virtual-card {
            display: flex;
            position: absolute;
            right: 40px; top: 50%;
            transform: translateY(-50%);
            width: 220px; height: 138px;
            border-radius: 16px;
            background: linear-gradient(135deg, rgba(255,255,255,.15), rgba(255,255,255,.05));
            border: 1px solid rgba(255,255,255,.18);
            backdrop-filter: blur(12px);
            padding: 18px 20px;
            flex-direction: column;
            justify-content: space-between;
            box-shadow: 0 8px 32px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.2);
            animation: cardFloat 4s ease-in-out infinite;
          }
          @keyframes cardFloat {
            0%,100% { transform: translateY(-50%) translateY(0); }
            50%      { transform: translateY(-50%) translateY(-6px); }
          }
        }
      `}</style>

      {/* ── HERO ── */}
      <div className="hero-banner">
        <div style={{ position:'relative', zIndex:1 }}>
          <div className="hero-greeting">Bienvenido de vuelta</div>
          <div className="hero-name">{first} 👋</div>
          <div className="hero-sub">Posición global de tus productos en Financiera Qapaq</div>

          {/* 👁 Botón ocultar/mostrar */}
          <button className="hero-eye-btn" onClick={() => setHidden(v => !v)}>
            {hidden ? '👁 Mostrar saldos' : '🙈 Ocultar saldos'}
          </button>

          <div className="hero-kpis">
            <div className="hero-kpi ahorro">
              <div className="hero-kpi-icon" style={{ background:'rgba(34,197,94,.15)' }}>
                <Icon name="piggy" size={18} />
              </div>
              <div className="hero-kpi-label">Total en ahorros</div>
              <div className={`hero-kpi-val${hidden ? ' blurred' : ''}`}>
                {show(cuentas ? totalAhorro : null)}
              </div>
              <div className="hero-kpi-sub">{cuentas?.length ?? 0} cuenta(s) activa(s)</div>
            </div>
            <div className="hero-kpi deuda">
              <div className="hero-kpi-icon" style={{ background:'rgba(239,68,68,.15)' }}>
                <Icon name="credit" size={18} />
              </div>
              <div className="hero-kpi-label">Deuda en créditos</div>
              <div className={`hero-kpi-val${hidden ? ' blurred' : ''}`}>
                {show(creditos ? totalDeuda : null)}
              </div>
              <div className="hero-kpi-sub">{creditos?.length ?? 0} crédito(s)</div>
            </div>
          </div>
        </div>

        {/* Tarjeta virtual flotante — solo desktop */}
        <div className="virtual-card">
          <div style={{
            position:'absolute', inset:0,
            background:'linear-gradient(105deg, rgba(255,255,255,0) 40%, rgba(255,255,255,.08) 50%, rgba(255,255,255,0) 60%)',
            borderRadius:16, animation:'vcShine 3s ease-in-out infinite',
          }} />
          <style>{`@keyframes vcShine{0%,100%{opacity:0}50%{opacity:1}}`}</style>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div style={{ width:32, height:24, background:'linear-gradient(135deg,#f5c800,#d97706)', borderRadius:5 }} />
            <div style={{ fontSize:9, color:'rgba(255,255,255,.4)', fontWeight:700, letterSpacing:1 }}>BANCA DIGITAL</div>
          </div>
          <div style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,.8)', letterSpacing:2, fontFamily:'monospace' }}>
            •••• •••• 0001
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,.7)', textTransform:'uppercase' }}>{first}</div>
            <div style={{ fontSize:11, fontWeight:900, color:'#f5c800', letterSpacing:.5 }}>QAPAQ</div>
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
                <span style={{ fontSize:17 }}>🐷</span> Cuentas de Ahorro
              </span>
              <button className="hb-link" onClick={() => navigate('/banca/ahorros')}>Ver todas →</button>
            </div>
            <div className="section-card-body">
              {!cuentas
                ? <div className="hb-loader">Cargando…</div>
                : cuentas.length === 0
                  ? <div className="hb-empty">No tienes cuentas registradas.</div>
                  : cuentas.map((c, i) => (
                    <div key={c.codigo}>
                      <div className="prod-row" onClick={() => navigate('/banca/ahorros')}>
                        <div className="prod-row-left">
                          <div className="prod-dot" style={{ background:'#22c55e' }} />
                          <div className="prod-info">
                            <strong>{c.codigo}</strong>
                            <small>{c.tipo} · <Badge estado={c.estado} /></small>
                          </div>
                        </div>
                        <div className={`prod-amount${hidden ? ' blurred' : ''}`}>
                          <span style={{ color:'#15803d' }}>
                            {hidden ? mask : fmt(c.saldo)}
                          </span>
                          <Icon name="arrow" size={13} />
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
                <span style={{ fontSize:17 }}>💳</span> Préstamos
              </span>
              <button className="hb-link" onClick={() => navigate('/banca/creditos')}>Ver todos →</button>
            </div>
            <div className="section-card-body">
              {!creditos
                ? <div className="hb-loader">Cargando…</div>
                : creditos.length === 0
                  ? <div className="hb-empty">Aún no tienes créditos activos.</div>
                  : creditos.map((c, i) => (
                    <div key={c.codigo}>
                      <div className="prod-row" onClick={() => navigate('/banca/creditos')}>
                        <div className="prod-row-left">
                          <div className="prod-dot" style={{ background: c.estado === 'Mora' ? '#ef4444' : '#3b82f6' }} />
                          <div className="prod-info">
                            <strong>{c.codigo}</strong>
                            <small>{c.tipo_credito} · <Badge estado={c.estado} /></small>
                          </div>
                        </div>
                        <div className={`prod-amount${hidden ? ' blurred' : ''}`}>
                          <span style={{ color: c.estado === 'Mora' ? '#dc2626' : '#07142a' }}>
                            {hidden ? mask : fmt(c.saldo_pendiente)}
                          </span>
                          <Icon name="arrow" size={13} />
                        </div>
                      </div>
                      {i < creditos.length - 1 && <div className="prod-divider" />}
                    </div>
                  ))
              }
            </div>
          </div>
        </div>

        {/* Sidebar — acciones rápidas */}
        <div>
          <div className="aside-header">
            <span style={{ color:'#f5c800', fontSize:15 }}>⚡</span> Operaciones rápidas
          </div>
          {acciones.map((a) => (
            <div
              key={a.label}
              className="action-card"
              onClick={() => navigate(a.to)}
              style={{ '--ac': a.color }}
            >
              <style>{`
                .action-card:hover { background: ${a.color}08 !important; }
                .action-card::before { background: ${a.color}; }
              `}</style>
              <div className="action-ico" style={{ background:`${a.color}18`, color: a.color }}>
                <Icon name={a.icon} size={16} />
              </div>
              <span className="action-label">{a.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
