import { useEffect, useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Icon from './Icon.jsx'

const MENU_CLIENTE = [
  { to: '/banca',             icon: 'home',      label: 'Inicio' },
  { to: '/banca/ahorros',     icon: 'piggy',     label: 'Mis Ahorros' },
  { to: '/banca/creditos',    icon: 'credit',    label: 'Mis Créditos' },
  { to: '/banca/operaciones', icon: 'send',      label: 'Operaciones' },
  { to: '/banca/simulador',   icon: 'chart',     label: 'Simulador' },
  { to: '/banca/solicitar',   icon: 'file',      label: 'Solicitar Crédito' },
]

const MENU_ASESOR = [
  { to: '/asesor',                 icon: 'briefcase', label: 'Bandeja' },
  { to: '/asesor/nueva-solicitud', icon: 'plus',      label: 'Nueva Solicitud' },
  { to: '/asesor/aprobadas',       icon: 'check',     label: 'Resueltas' },
  { to: '/asesor/mora',            icon: 'clock',     label: 'Recuperaciones' },
]

const ROL_LABEL = {
  cliente: 'Cliente',
  asesor:  'Asesor de Negocios',
  comite:  'Comité de Créditos',
}

export default function HBHeader() {
  const { user, rol, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const first = user?.nombre?.split(',')[1]?.trim().split(' ')[0] || user?.nombre || 'Usuario'
  const menu  = rol === 'cliente' ? MENU_CLIENTE : MENU_ASESOR

  return (
    <>
      <style>{`
        .hb-header-v2 {
          background: linear-gradient(108deg, #07142a 0%, #0f2347 40%, #163d82 72%, #1a52b0 100%);
          position: sticky; top: 0; z-index: 200;
          box-shadow: 0 4px 40px rgba(7,20,42,.5);
        }
        .hb-franja-v2 {
          height: 4px;
          background: repeating-linear-gradient(90deg,
            #f5c800 0px, #f5c800 18px,
            #0c1e3e 18px, #0c1e3e 36px,
            #dc2626 36px, #dc2626 54px);
        }

        /* ── TOP BAR ── */
        .hb-top-v2 {
          display: flex; align-items: center;
          justify-content: space-between;
          max-width: 1320px; margin: 0 auto;
          padding: 12px 32px;
          gap: 16px;
        }

        /* Logo */
        .hb-logo-v2 {
          display: flex; align-items: center; gap: 12px;
          text-decoration: none; color: #fff;
          font-weight: 900; font-size: 19px;
          letter-spacing: .5px;
          transition: opacity .15s;
          flex-shrink: 0;
        }
        .hb-logo-v2:hover { opacity: .85; }
        .hb-logo-badge-v2 {
          width: 40px; height: 40px;
          background: #fff; color: #07142a;
          border-radius: 10px;
          display: grid; place-items: center;
          font-weight: 900; font-size: 16px;
          box-shadow: 0 2px 10px rgba(0,0,0,.25);
          flex-shrink: 0;
        }
        .hb-logo-sub { font-size: 10px; font-weight: 500; opacity: .7; }

        /* User info */
        .hb-user-v2 {
          display: flex; align-items: center; gap: 14px;
          flex-shrink: 0;
        }
        .hb-user-text { text-align: right; }
        .hb-user-name { font-size: 14px; font-weight: 700; color: #fff; }
        .hb-user-time { font-size: 11px; color: rgba(255,255,255,.55); margin-top: 1px; }
        .hb-role-badge {
          display: inline-block;
          font-size: 9px; font-weight: 800;
          letter-spacing: 1.5px; text-transform: uppercase;
          background: rgba(245,200,0,.2);
          color: #fbbf24;
          border: 1px solid rgba(245,200,0,.3);
          border-radius: 20px;
          padding: 2px 10px; margin-top: 3px;
        }
        .hb-logout-v2 {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,.1);
          border: 1.5px solid rgba(255,255,255,.18);
          color: #fff; font-size: 12px; font-weight: 700;
          padding: 8px 18px; border-radius: 8px;
          cursor: pointer; font-family: inherit;
          white-space: nowrap;
          transition: background .15s, border-color .15s, transform .15s;
        }
        .hb-logout-v2:hover {
          background: rgba(255,255,255,.18);
          border-color: rgba(255,255,255,.35);
          transform: scale(1.04);
        }

        /* ── NAV TABS ── */
        .hb-menu-v2 {
          display: flex; gap: 0;
          justify-content: center;
          max-width: 1320px; margin: 0 auto;
          padding: 0 32px;
          border-top: 1px solid rgba(255,255,255,.06);
        }
        .hb-menu-btn {
          background: transparent; border: none;
          color: rgba(255,255,255,.55);
          display: flex; flex-direction: row;
          align-items: center; gap: 9px;
          padding: 14px 22px;
          cursor: pointer;
          font-size: 12.5px; font-weight: 600;
          letter-spacing: .2px;
          transition: color .18s, background .18s;
          font-family: inherit;
          position: relative;
          white-space: nowrap;
        }
        .hb-menu-btn::after {
          content: '';
          position: absolute;
          bottom: 0; left: 50%; right: 50%;
          height: 2.5px;
          background: #f5c800;
          border-radius: 2px 2px 0 0;
          transition: left .22s cubic-bezier(.22,1,.36,1),
                      right .22s cubic-bezier(.22,1,.36,1);
        }
        .hb-menu-btn:hover { color: #fff; background: rgba(255,255,255,.06); }
        .hb-menu-btn:hover::after  { left: 12px; right: 12px; }
        .hb-menu-btn.active { color: #fff; background: rgba(255,255,255,.08); }
        .hb-menu-btn.active::after { left: 12px; right: 12px; }

        .hb-menu-ico {
          width: 30px; height: 30px;
          border-radius: 8px;
          background: rgba(255,255,255,.1);
          display: grid; place-items: center;
          font-size: 15px; flex-shrink: 0;
          transition: background .18s, transform .18s;
        }
        .hb-menu-btn:hover .hb-menu-ico {
          background: rgba(255,255,255,.18);
          transform: scale(1.08);
        }
        .hb-menu-btn.active .hb-menu-ico {
          background: rgba(245,200,0,.2);
          color: #f5c800;
          box-shadow: 0 0 0 1px rgba(245,200,0,.3);
        }

        /* ══════════════════════════════
           MÓVIL — < 768px
        ══════════════════════════════ */
        @media (max-width: 767px) {

          /* Top: una sola fila compacta */
          .hb-top-v2 {
            padding: 9px 14px;
            gap: 0;
            justify-content: space-between;
          }

          /* Logo más pequeño */
          .hb-logo-v2       { font-size: 15px; gap: 8px; }
          .hb-logo-badge-v2 { width: 32px; height: 32px; font-size: 13px; border-radius: 8px; }
          .hb-logo-sub      { font-size: 8.5px; }

          /* Usuario: solo nombre + badge, sin hora */
          .hb-user-v2   { gap: 8px; }
          .hb-user-name { font-size: 12px; }
          .hb-user-time { display: none; }
          .hb-role-badge { font-size: 7.5px; padding: 2px 7px; letter-spacing: 1px; }

          /* Botón Salir compacto */
          .hb-logout-v2 { padding: 7px 11px; font-size: 11px; gap: 4px; }

          /* Tabs: scroll horizontal, centrado desactivado */
          .hb-menu-v2 {
            justify-content: flex-start;
            padding: 0 4px;
            overflow-x: auto;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
          }
          .hb-menu-v2::-webkit-scrollbar { display: none; }

          .hb-menu-btn {
            padding: 10px 10px;
            font-size: 10.5px;
            gap: 6px;
            flex-shrink: 0;
          }
          .hb-menu-btn::after { display: none; }
          .hb-menu-btn.active {
            border-bottom: 2.5px solid #f5c800;
            color: #fff;
          }
          .hb-menu-ico {
            width: 24px; height: 24px;
            font-size: 12px; border-radius: 6px;
          }
        }
      `}</style>

      <div className="hb-header-v2">
        <div className="hb-franja-v2" />

        {/* ── Top bar ── */}
        <div className="hb-top-v2">
          <Link to={rol === 'cliente' ? '/banca' : '/asesor'} className="hb-logo-v2">
            <div className="hb-logo-badge-v2">Q</div>
            <div>
              <div>QAPAQ</div>
              <div className="hb-logo-sub">
                {rol === 'cliente' ? 'BANCA POR INTERNET' : 'CORE FINANCIERO · BACKOFFICE'}
              </div>
            </div>
          </Link>

          <div className="hb-user-v2">
            <div className="hb-user-text">
              <div className="hb-user-name">Hola, {first}</div>
              <div className="hb-user-time">
                {time.toLocaleTimeString('es-PE', { hour:'2-digit', minute:'2-digit', second:'2-digit' })}
              </div>
              <div className="hb-role-badge">{ROL_LABEL[rol] || rol}</div>
            </div>
            <button className="hb-logout-v2" onClick={() => { logout(); navigate('/') }}>
              <Icon name="logout" size={13} /> Salir
            </button>
          </div>
        </div>

        {/* ── Nav tabs ── */}
        <div className="hb-menu-v2">
          {menu.map((m) => {
            const active = location.pathname === m.to
            return (
              <button
                key={m.to}
                className={`hb-menu-btn${active ? ' active' : ''}`}
                onClick={() => navigate(m.to)}
              >
                <div className="hb-menu-ico">
                  <Icon name={m.icon} size={15} />
                </div>
                {m.label}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
