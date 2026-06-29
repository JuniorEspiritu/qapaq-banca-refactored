import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

/* ─── Bolas flotantes con canvas ────────────────────────────── */
function BolasCanvas() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId

    // Configurar tamaño
    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Crear bolas
    const COLORS = [
      'rgba(245,200,0,',    // dorado QAPAQ
      'rgba(220,38,38,',    // rojo
      'rgba(26,58,107,',    // azul marino
      'rgba(255,255,255,',  // blanco
      'rgba(251,191,36,',   // amarillo claro
      'rgba(37,99,192,',    // azul
    ]

    const bolas = Array.from({ length: 28 }, (_, i) => ({
      x:    Math.random() * canvas.width,
      y:    Math.random() * canvas.height,
      r:    16 + Math.random() * 40,
      vx:   (Math.random() - 0.5) * 0.7,
      vy:   (Math.random() - 0.5) * 0.7,
      color: COLORS[i % COLORS.length],
      alpha: 0.15 + Math.random() * 0.25,
      pulseSpeed: 0.008 + Math.random() * 0.012,
      pulseAngle: Math.random() * Math.PI * 2,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      bolas.forEach(b => {
        // Pulso de opacidad suave
        b.pulseAngle += b.pulseSpeed
        const alpha = b.alpha + Math.sin(b.pulseAngle) * 0.08

        // Gradiente radial para efecto LED/glow
        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r)
        grad.addColorStop(0,   b.color + (alpha + 0.15) + ')')
        grad.addColorStop(0.5, b.color + alpha + ')')
        grad.addColorStop(1,   b.color + '0)')

        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()

        // Mover
        b.x += b.vx
        b.y += b.vy

        // Rebotar en bordes
        if (b.x - b.r < 0 || b.x + b.r > canvas.width)  b.vx *= -1
        if (b.y - b.r < 0 || b.y + b.r > canvas.height) b.vy *= -1
      })

      // Colisiones entre bolas
      for (let i = 0; i < bolas.length; i++) {
        for (let j = i + 1; j < bolas.length; j++) {
          const a = bolas[i], bb = bolas[j]
          const dx = bb.x - a.x
          const dy = bb.y - a.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const minDist = a.r + bb.r
          if (dist < minDist && dist > 0) {
            // Intercambiar velocidades (colisión elástica simple)
            const nx = dx / dist
            const ny = dy / dist
            const dvx = a.vx - bb.vx
            const dvy = a.vy - bb.vy
            const dot = dvx * nx + dvy * ny
            if (dot > 0) {
              a.vx -= dot * nx
              a.vy -= dot * ny
              bb.vx += dot * nx
              bb.vy += dot * ny
            }
            // Separar para que no se superpongan
            const overlap = (minDist - dist) / 2
            a.x  -= overlap * nx
            a.y  -= overlap * ny
            bb.x += overlap * nx
            bb.y += overlap * ny
          }
        }
      }

      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
      }}
    />
  )
}

/* ─── CSS ────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes qSpin  { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
  @keyframes shake  { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }

  /* ── Página ── */
  .q-page {
    min-height: 100vh;
    font-family: 'Inter', sans-serif;
    display: flex;
    flex-direction: column;
    background: #f5c800;
    position: relative;
    overflow: hidden;
  }

  /* ── Topbar ── */
  .q-topbar {
    background: rgba(245,200,0,.85);
    backdrop-filter: blur(8px);
    padding: 0 20px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    position: relative;
    z-index: 10;
    border-bottom: 1px solid rgba(0,0,0,.06);
  }
  .q-topbar-logo     { display: flex; flex-direction: column; line-height: 1; }
  .q-topbar-logo-name{ font-size: 22px; font-weight: 900; color: #111; letter-spacing: 1px; }
  .q-topbar-logo-sub { font-size: 9px; color: #dc2626; font-style: italic; font-weight: 700; }
  .q-topbar-tag {
    background: #1a3a6b; color: #f5c800;
    font-size: 10px; font-weight: 700;
    padding: 5px 12px; border-radius: 20px;
    letter-spacing: .5px; text-transform: uppercase;
  }

  /* ── Franja ── */
  .q-stripe {
    height: 4px; flex-shrink: 0; position: relative; z-index: 10;
    background: repeating-linear-gradient(90deg,
      #e8a020 0px,#e8a020 20px,
      #1a3a6b 20px,#1a3a6b 40px,
      #dc2626 40px,#dc2626 60px);
  }

  /* ── Body ── */
  .q-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 16px 16px 32px;
    position: relative;
    z-index: 2;
  }

  /* ── Ilustración desktop ── */
  .q-illustration {
    display: none;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    flex-shrink: 0;
  }
  .q-illustration-circle {
    width: 300px; height: 300px; border-radius: 50%;
    background: rgba(212,168,0,.6);
    backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    position: relative; overflow: hidden;
    box-shadow: 0 12px 40px rgba(0,0,0,.18);
  }
  .q-illustration-badge {
    background: #dc2626; color: #fff;
    font-weight: 800; font-size: 16px;
    padding: 13px 48px; border-radius: 8px;
    letter-spacing: .5px;
    box-shadow: 0 4px 18px rgba(220,38,38,.35);
    text-align: center;
  }

  /* ── Card ── */
  .q-card {
    width: 100%; max-width: 340px;
    background: rgba(255,255,255,.92);
    backdrop-filter: blur(16px);
    border-radius: 20px;
    padding: 22px 20px 20px;
    box-shadow: 0 16px 48px rgba(0,0,0,.18), 0 0 0 1px rgba(255,255,255,.5);
    animation: fadeIn .4s ease both;
  }

  .q-card-header { text-align: center; margin-bottom: 22px; }
  .q-card-logo-name { font-size: 22px; font-weight: 900; color: #111827; letter-spacing: 1px; }
  .q-card-logo-sub  { font-size: 9.5px; color: #dc2626; font-style: italic; font-weight: 700; margin-bottom: 14px; }
  .q-card-title { font-size: 15px; font-weight: 800; color: #111827; margin-bottom: 2px; }
  .q-card-sub   { font-size: 11.5px; color: #6b7280; }

  .q-divider {
    height: 3px; border-radius: 2px; margin-bottom: 20px;
    background: repeating-linear-gradient(90deg,
      #e8a020 0px,#e8a020 20px,
      #1a3a6b 20px,#1a3a6b 40px,
      #dc2626 40px,#dc2626 60px);
  }

  .q-error {
    background: #fee2e2; color: #991b1b;
    border: 1px solid #fca5a5; border-left: 3px solid #ef4444;
    border-radius: 8px; padding: 10px 14px;
    font-size: 13px; margin-bottom: 16px;
    animation: shake .35s ease;
  }

  .q-field { margin-bottom: 14px; }
  .q-label {
    display: block; font-size: 11px; font-weight: 700;
    color: #374151; margin-bottom: 6px;
    text-transform: uppercase; letter-spacing: .5px;
  }
  .q-input-wrap { position: relative; }
  .q-input-icon {
    position: absolute; left: 12px; top: 50%;
    transform: translateY(-50%); font-size: 14px;
    pointer-events: none; display: flex; align-items: center;
  }
  .q-input {
    width: 100%; padding: 10px 12px 10px 36px;
    border: 1.5px solid #e5e7eb; border-radius: 10px;
    font-size: 14px; font-family: 'Inter', sans-serif;
    background: #fafbfc; color: #111827; outline: none;
    transition: border-color .2s, box-shadow .2s;
    -webkit-appearance: none;
  }
  .q-input:focus { border-color: #f5c800; box-shadow: 0 0 0 3px rgba(245,200,0,.2); }
  .q-input-pw { padding-right: 44px; }
  .q-eye-btn {
    position: absolute; right: 12px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none; cursor: pointer;
    font-size: 15px; color: #9ca3af; padding: 2px; line-height: 1;
  }

  .q-btn-submit {
    width: 100%; background: #f5c800; color: #111827;
    font-size: 14px; font-weight: 800; padding: 12px;
    border-radius: 10px; border: none; cursor: pointer;
    font-family: 'Inter', sans-serif; letter-spacing: .3px;
    box-shadow: 0 4px 16px rgba(245,200,0,.5);
    transition: transform .15s, box-shadow .15s;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    margin-top: 8px;
  }
  .q-btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(245,200,0,.6); }
  .q-btn-submit:disabled { background: #e5e7eb; color: #9ca3af; cursor: not-allowed; box-shadow: none; }

  .q-back-btn {
    background: none; border: none; color: #9ca3af;
    font-size: 12px; cursor: pointer; font-family: 'Inter', sans-serif;
    margin-top: 14px; width: 100%; text-align: center; padding: 6px;
    transition: color .15s;
  }
  .q-back-btn:hover { color: #6b7280; }

  .q-footer { text-align: center; margin-top: 10px; font-size: 11px; color: rgba(0,0,0,.35); }

  .q-sbs-badge {
    display: inline-flex; align-items: center; gap: 5px;
    background: rgba(240,253,244,.9); border: 1px solid #bbf7d0;
    border-radius: 6px; padding: 5px 10px;
    font-size: 11px; color: #166534; font-weight: 600; margin-top: 14px;
  }

  .q-spinner-ring {
    position: relative; width: 20px; height: 20px;
    display: inline-block;
    animation: qSpin 0.9s linear infinite; flex-shrink: 0;
  }
  .q-spinner-dot {
    position: absolute; width: var(--size); height: var(--size);
    border-radius: 50%; top: 50%; left: 50%;
    transform-origin: 0 0; background: var(--c); box-shadow: 0 0 5px var(--c);
  }

  /* Desktop */
  @media (min-width: 768px) {
    .q-topbar { padding: 0 40px; height: 64px; }
    .q-topbar-logo-name { font-size: 26px; }
    .q-body {
      flex-direction: row;
      justify-content: center;
      gap: 60px;
      padding: 40px 40px 60px;
    }
    .q-illustration { display: flex; }
    .q-card { padding: 24px 22px 22px; }
    .q-card-logo-name { font-size: 24px; }
    .q-card-title { font-size: 19px; }
  }
  @media (min-width: 1024px) {
    .q-body { gap: 72px; }
  }
`

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [codigo,  setCodigo]  = useState('')
  const [pw,      setPw]      = useState('')
  const [err,     setErr]     = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPw,  setShowPw]  = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setErr(null); setLoading(true)
    try {
      const usuario = await login(codigo.trim(), pw)
      if (usuario.rol === 'cliente')      navigate('/banca')
      else if (usuario.rol === 'gerente') navigate('/gerente')
      else                                navigate('/asesor')
    } catch (ex) { setErr(ex.message) }
    finally { setLoading(false) }
  }

  const spinnerDots = Array.from({ length: 12 }).map((_, i) => {
    const angle   = i * 30
    const fade    = i / 12
    const size    = 6 - fade * 4
    const opacity = 1 - fade * 0.85
    const color   = i < 3 ? '#fff7d6' : '#f5c800'
    return (
      <span key={i} className="q-spinner-dot" style={{
        '--size': `${size}px`, '--c': color, opacity,
        transform: `rotate(${angle}deg) translate(10px, 0)`,
      }} />
    )
  })

  return (
    <div className="q-page">
      <style>{GLOBAL_CSS}</style>

      {/* ── Bolas flotantes en el fondo ── */}
      <BolasCanvas />

      {/* ── Topbar ── */}
      <header className="q-topbar">
        <div className="q-topbar-logo">
          <span className="q-topbar-logo-name">QAPAQ</span>
          <span className="q-topbar-logo-sub">una financiera solidaria</span>
        </div>
        <span className="q-topbar-tag">🔒 Acceso seguro</span>
      </header>

      <div className="q-stripe" />

      {/* ── Cuerpo ── */}
      <main className="q-body">

        {/* Ilustración desktop */}
        <div className="q-illustration">
          <div className="q-illustration-circle">
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
          <div className="q-illustration-badge">Banca por Internet</div>
          <div className="q-sbs-badge"><span>✅</span> Supervisada por la SBS del Perú</div>
        </div>

        {/* ── Formulario ── */}
        <div style={{ width:'100%', maxWidth:400, display:'flex', flexDirection:'column', alignItems:'center' }}>
          <div className="q-card">
            <div className="q-divider" />
            <div className="q-card-header">
              <div className="q-card-logo-name">QAPAQ</div>
              <div className="q-card-logo-sub">una financiera solidaria</div>
              <div className="q-card-title">Ingresa a tu cuenta</div>
              <div className="q-card-sub">Usa tu correo institucional y clave</div>
            </div>

            {err && <div className="q-error" key={err}>⚠️ {err}</div>}

            <form onSubmit={onSubmit} autoComplete="off">
              <div className="q-field">
                <label className="q-label" htmlFor="q-email">Correo institucional</label>
                <div className="q-input-wrap">
                  <span className="q-input-icon">📧</span>
                  <input id="q-email" className="q-input" type="email"
                    placeholder="carlos.ramirez@qapaq.pe"
                    value={codigo} onChange={e => setCodigo(e.target.value)}
                    required autoFocus autoComplete="off" />
                </div>
              </div>

              <div className="q-field" style={{ marginBottom: 20 }}>
                <label className="q-label" htmlFor="q-pw">Clave</label>
                <div className="q-input-wrap">
                  <span className="q-input-icon">🔒</span>
                  <input id="q-pw" className="q-input q-input-pw"
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={pw} onChange={e => setPw(e.target.value)}
                    required autoComplete="new-password" />
                  <button type="button" tabIndex={-1} className="q-eye-btn"
                    onClick={() => setShowPw(v => !v)}
                    aria-label={showPw ? 'Ocultar' : 'Mostrar'}>
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button type="submit" className="q-btn-submit" disabled={loading}>
                {loading ? (
                  <><span className="q-spinner-ring">{spinnerDots}</span>Ingresando…</>
                ) : 'Ingresar →'}
              </button>
            </form>

            <button className="q-back-btn" onClick={() => navigate('/')}>
              ← Volver al inicio
            </button>
          </div>

          <div className="q-footer" style={{ marginTop: 12 }}>
            © 2026 Financiera Qapaq S.A. · Supervisada por la SBS
          </div>
          <div className="q-sbs-badge" style={{ marginTop: 10 }}>
            <span>✅</span> Entidad supervisada por la SBS del Perú
          </div>
        </div>
      </main>
    </div>
  )
}
