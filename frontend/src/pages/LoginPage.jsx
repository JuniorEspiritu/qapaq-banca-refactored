import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [codigo, setCodigo] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setErr(null)
    setLoading(true)
    try {
      const usuario = await login(codigo.trim(), pw)
      if (usuario.rol === 'cliente') navigate('/banca')
      else if (usuario.rol === 'gerente') navigate('/gerente')
      else navigate('/asesor')
    } catch (ex) {
      setErr(ex.message)
    } finally {
      setLoading(false)
    }
  }

  // Genera las 12 bolitas del anillo tipo "cometa"
  const spinnerDots = Array.from({ length: 12 }).map((_, i) => {
    const angle = (i * 30) // 360/12
    const fade = i / 12 // 0 = cabeza brillante, 1 = cola tenue
    const size = 7 - fade * 5      // de 7px a 2px
    const opacity = 1 - fade * 0.85 // de 1 a 0.15
    const color = i < 3 ? '#fff7d6' : '#f5c800' // cabeza casi blanca, resto dorado
    return (
      <span
        key={i}
        className="q-spinner-dot"
        style={{
          '--size': `${size}px`,
          '--c': color,
          opacity,
          transform: `rotate(${angle}deg) translate(11px, 0)`,
        }}
      />
    )
  })

  const spinnerCSS = `
    @keyframes qSpin { to { transform: rotate(360deg); } }
    .q-spinner-ring {
      position: relative;
      width: 22px;
      height: 22px;
      display: inline-block;
      animation: qSpin 0.9s linear infinite;
    }
    .q-spinner-dot {
      position: absolute;
      width: var(--size);
      height: var(--size);
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform-origin: 0 0;
      background: var(--c);
      box-shadow: 0 0 6px var(--c);
    }
  `

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5c800',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, sans-serif',
    }}>
      <style>{spinnerCSS}</style>

      {/* Header */}
      <div style={{ padding: '14px 32px', display: 'flex', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#111', letterSpacing: 1 }}>QAPAQ</div>
          <div style={{ fontSize: 10, color: '#dc2626', fontStyle: 'italic', fontWeight: 600 }}>una financiera solidaria</div>
        </div>
      </div>

      {/* Franja */}
      <div style={{
        height: 5,
        background: 'repeating-linear-gradient(90deg,#e8a020 0px,#e8a020 20px,#1a3a6b 20px,#1a3a6b 40px,#dc2626 40px,#dc2626 60px)',
      }} />

      {/* Cuerpo centrado */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        gap: 60,
      }}>

        {/* Ilustración izquierda */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
          <div style={{
            width: 280, height: 280,
            borderRadius: '50%',
            background: '#d4a800',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,.15)',
          }}>
            <svg viewBox="0 0 260 220" width="230" height="200" xmlns="http://www.w3.org/2000/svg">
              <rect x="40" y="110" width="180" height="100" rx="10" fill="#d1d5db"/>
              <rect x="50" y="118" width="160" height="82" rx="6" fill="#1a3a6b"/>
              <rect x="55" y="122" width="150" height="74" rx="4" fill="#2563c0"/>
              <rect x="58" y="125" width="144" height="68" rx="3" fill="#bfdbfe" opacity=".6"/>
              <rect x="62" y="129" width="55" height="8" rx="2" fill="#1e40af" opacity=".5"/>
              <rect x="62" y="141" width="85" height="5" rx="2" fill="#1e40af" opacity=".3"/>
              <rect x="62" y="150" width="70" height="5" rx="2" fill="#1e40af" opacity=".3"/>
              <rect x="62" y="162" width="32" height="10" rx="3" fill="#e8a020" opacity=".9"/>
              <rect x="28" y="210" width="204" height="7" rx="3.5" fill="#9ca3af"/>
              <rect x="90" y="206" width="80" height="6" rx="2" fill="#d1d5db"/>
              <circle cx="85" cy="82" r="20" fill="#fbbf24"/>
              <circle cx="80" cy="76" r="2" fill="#1a1a1a"/>
              <circle cx="90" cy="76" r="2" fill="#1a1a1a"/>
              <path d="M81 84 q4 4 8 0" stroke="#92400e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              <rect x="66" y="100" width="38" height="45" rx="8" fill="#1a3a6b"/>
              <ellipse cx="85" cy="100" rx="17" ry="5" fill="#1a3a6b"/>
              <path d="M68 120 q-18 -15 -10 -5" stroke="#1a3a6b" strokeWidth="9" strokeLinecap="round" fill="none"/>
              <circle cx="175" cy="78" r="20" fill="#d97706"/>
              <circle cx="170" cy="72" r="2" fill="#1a1a1a"/>
              <circle cx="180" cy="72" r="2" fill="#1a1a1a"/>
              <path d="M171 80 q4 4 8 0" stroke="#7c2d12" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              <path d="M156 76 q19-26 38 0" fill="#92400e"/>
              <rect x="157" y="96" width="36" height="48" rx="8" fill="#dc2626"/>
              <ellipse cx="175" cy="97" rx="16" ry="5" fill="#dc2626"/>
              <path d="M192 118 q18 -14 10 -4" stroke="#dc2626" strokeWidth="9" strokeLinecap="round" fill="none"/>
              <circle cx="130" cy="92" r="16" fill="#fde68a"/>
              <circle cx="125" cy="87" r="1.8" fill="#1a1a1a"/>
              <circle cx="135" cy="87" r="1.8" fill="#1a1a1a"/>
              <path d="M126 94 q4 3 8 0" stroke="#92400e" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
              <path d="M115 91 q15-16 30 0" fill="#92400e"/>
              <rect x="116" y="106" width="28" height="38" rx="5" fill="#16a34a"/>
              <circle cx="108" cy="98" r="13" fill="#fcd34d"/>
              <circle cx="104" cy="94" r="1.6" fill="#1a1a1a"/>
              <circle cx="112" cy="94" r="1.6" fill="#1a1a1a"/>
              <path d="M105 100 q3 2 6 0" stroke="#92400e" strokeWidth="1" fill="none" strokeLinecap="round"/>
              <rect x="96" y="109" width="24" height="34" rx="5" fill="#7c3aed"/>
            </svg>
            <div style={{ position:'absolute', top:14, left:20, width:10, height:10, borderRadius:'50%', background:'#dc2626', opacity:.7 }}/>
            <div style={{ position:'absolute', top:30, right:16, width:7, height:7, borderRadius:'50%', background:'#1a3a6b', opacity:.6 }}/>
            <div style={{ position:'absolute', bottom:20, left:16, width:8, height:8, borderRadius:'50%', background:'#16a34a', opacity:.6 }}/>
          </div>

          <div style={{
            background: '#dc2626',
            color: '#fff',
            fontWeight: 800,
            fontSize: 17,
            padding: '12px 52px',
            borderRadius: 8,
            marginTop: 12,
            letterSpacing: .5,
            boxShadow: '0 4px 16px rgba(220,38,38,.4)',
          }}>
            Banca por Internet
          </div>
        </div>

        {/* Formulario derecha */}
        <div style={{ width: 400, flexShrink: 0 }}>
          <div style={{
            background: '#fff',
            borderRadius: 18,
            padding: '32px 30px',
            boxShadow: '0 20px 60px rgba(0,0,0,.18)',
          }}>
            <div style={{
              height: 4,
              background: 'repeating-linear-gradient(90deg,#e8a020 0px,#e8a020 20px,#1a3a6b 20px,#1a3a6b 40px,#dc2626 40px,#dc2626 60px)',
              borderRadius: 2,
              marginBottom: 22,
            }}/>

            <div style={{ textAlign:'center', marginBottom: 16 }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: '#111827', letterSpacing: 1 }}>QAPAQ</div>
              <div style={{ fontSize: 10, color: '#dc2626', fontStyle: 'italic', fontWeight: 600, marginBottom: 8 }}>una financiera solidaria</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#111827' }}>Ingresa a tu cuenta</div>
              <div style={{ fontSize: 12.5, color: '#6b7280', marginTop: 4 }}>Correo institucional y clave</div>
            </div>

            {err && (
              <div style={{
                background:'#fee2e2', color:'#991b1b',
                border:'1px solid #fca5a5', borderLeft:'3px solid #ef4444',
                borderRadius:8, padding:'10px 14px', fontSize:13, marginBottom:14,
              }}>⚠️ {err}</div>
            )}

            <form onSubmit={onSubmit} autoComplete="off">
              <div style={{ marginBottom: 14 }}>
                <label style={{ display:'block', fontSize:11.5, fontWeight:700, color:'#374151', marginBottom:5, textTransform:'uppercase', letterSpacing:'.4px' }}>
                  Correo institucional
                </label>
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:14 }}>📧</span>
                  <input
                    style={{
                      width:'100%', padding:'11px 14px 11px 38px',
                      border:'1.5px solid #e5e7eb', borderRadius:8,
                      fontSize:13.5, fontFamily:'Inter,sans-serif',
                      background:'#fafbfc', color:'#111827',
                      outline:'none', boxSizing:'border-box',
                    }}
                    onFocus={e => e.target.style.borderColor='#f5c800'}
                    onBlur={e  => e.target.style.borderColor='#e5e7eb'}
                    type="email"
                    placeholder="Ej. carlos.ramirez@qapaq.pe"
                    value={codigo}
                    onChange={e => setCodigo(e.target.value)}
                    required autoFocus autoComplete="off"
                  />
                </div>
              </div>

              <div style={{ marginBottom: 22 }}>
                <label style={{ display:'block', fontSize:11.5, fontWeight:700, color:'#374151', marginBottom:5, textTransform:'uppercase', letterSpacing:'.4px' }}>
                  Clave
                </label>
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:14 }}>🔒</span>
                  <input
                    style={{
                      width:'100%', padding:'11px 40px 11px 38px',
                      border:'1.5px solid #e5e7eb', borderRadius:8,
                      fontSize:13.5, fontFamily:'Inter,sans-serif',
                      background:'#fafbfc', color:'#111827',
                      outline:'none', boxSizing:'border-box',
                    }}
                    onFocus={e => e.target.style.borderColor='#f5c800'}
                    onBlur={e  => e.target.style.borderColor='#e5e7eb'}
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={pw}
                    onChange={e => setPw(e.target.value)}
                    required autoComplete="new-password"
                  />
                  <button type="button" tabIndex={-1}
                    onClick={() => setShowPw(v => !v)}
                    style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:15, color:'#9ca3af' }}
                  >{showPw ? '🙈' : '👁'}</button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width:'100%',
                  background: loading ? '#d1d5db' : '#f5c800',
                  color: '#111',
                  fontSize: 15,
                  fontWeight: 800,
                  padding: '13px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Inter,sans-serif',
                  letterSpacing: .3,
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(245,200,0,.45)',
                  transition: 'transform .15s, box-shadow .15s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(245,200,0,.55)' }}}
                onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 4px 16px rgba(245,200,0,.45)' }}
              >
                {loading ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                    <span className="q-spinner-ring">{spinnerDots}</span>
                    Ingresando…
                  </span>
                ) : 'Ingresar →'}
              </button>
            </form>

            <div style={{ textAlign:'center', marginTop:16 }}>
              <button onClick={() => navigate('/')}
                style={{ background:'none', border:'none', color:'#6b7280', fontSize:12, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
                ← Volver al inicio
              </button>
            </div>
          </div>

          <div style={{ textAlign:'center', marginTop:12, fontSize:11, color:'rgba(0,0,0,.35)' }}>
            © 2026 Financiera Qapaq S.A. · Supervisada por la SBS
          </div>
        </div>
      </div>
    </div>
  )
}