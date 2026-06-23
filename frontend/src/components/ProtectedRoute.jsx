import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function Forbidden({ rol }) {
  const ROL_LABEL = { 
    cliente: 'Cliente', 
    asesor: 'Asesor de Negocios', 
    comite: 'Comité de Créditos',
    gerente: 'Gerente General'
  }
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#eef1f7', fontFamily: 'Inter, sans-serif', padding: 24,
    }}>
      <style>{`
        @keyframes forbiddenIn { from { opacity:0; transform:translateY(24px) scale(.97); } to { opacity:1; transform:none; } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
        .f403-card { animation: forbiddenIn .45s cubic-bezier(.22,1,.36,1); }
        .f403-icon { animation: shake .6s ease .3s both; }
      `}</style>
      <div className="f403-card" style={{
        background: '#fff', borderRadius: 24, padding: '52px 44px',
        maxWidth: 480, width: '100%', textAlign: 'center',
        boxShadow: '0 20px 60px rgba(7,20,42,.12)',
        border: '1px solid rgba(0,0,0,.05)',
      }}>
        <div className="f403-icon" style={{
          width: 90, height: 90, borderRadius: '50%',
          background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
          border: '3px solid #fca5a5',
          fontSize: 40,
        }}>🔒</div>

        <div style={{
          fontSize: 72, fontWeight: 900, color: '#dc2626',
          letterSpacing: -4, lineHeight: 1, marginBottom: 8,
          fontVariantNumeric: 'tabular-nums',
        }}>403</div>

        <div style={{ fontSize: 20, fontWeight: 800, color: '#07142a', marginBottom: 8 }}>
          Acceso denegado
        </div>
        <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: 28 }}>
          Tu rol actual <strong style={{ color: '#07142a' }}>({ROL_LABEL[rol] || rol})</strong> no tiene
          permisos para acceder a esta sección. Solo los usuarios autorizados pueden ingresar aquí.
        </p>

        <div style={{
          height: 4, borderRadius: 2, marginBottom: 28,
          background: 'repeating-linear-gradient(90deg,#f5c800 0px,#f5c800 20px,#07142a 20px,#07142a 40px,#dc2626 40px,#dc2626 60px)',
        }} />

        <button
          onClick={() => {
            if (rol === 'cliente') window.location.href = '/banca'
            else if (rol === 'gerente') window.location.href = '/gerente'
            else window.location.href = '/asesor'
          }}
          style={{
            background: 'linear-gradient(135deg, #07142a, #163d82)',
            color: '#fff', fontSize: 14, fontWeight: 700,
            padding: '13px 32px', borderRadius: 10, border: 'none',
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 6px 20px rgba(7,20,42,.3)',
            transition: 'transform .15s, box-shadow .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(7,20,42,.4)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(7,20,42,.3)' }}
        >
          ← Volver a mi panel
        </button>

        <div style={{ marginTop: 18, fontSize: 11.5, color: '#9ca3af' }}>
          Si crees que esto es un error, contacta al administrador del sistema.
        </div>
      </div>
    </div>
  )
}

export default function ProtectedRoute({ roles, children }) {
  const { isAuthenticated, rol } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  if (roles && !roles.includes(rol)) {
    return <Forbidden rol={rol} />
  }
  return children
}