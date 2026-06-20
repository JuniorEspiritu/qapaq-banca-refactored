import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

// Imágenes de Unsplash con IDs específicos — carga garantizada
const SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1400&q=85',
    // Persona con dinero/billetes — muy relevante para sorteo
    tag: 'Junio 2026',
    titleRed: 'VALORAMOS',
    titleWhite: 'TU COMPROMISO',
    sub: 'Si eres cliente GNV y cumpliste con el pago de tus cuotas, participas automáticamente del sorteo.',
    chip: 'GANA HASTA S/ 1,000',
    chipColor: '#dc2626',
  },
  {
    img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1400&q=85',
    // Banca digital / teléfono + tarjeta
    tag: 'Cuenta Digital',
    titleRed: 'ABRE TU',
    titleWhite: 'CUENTA DIGITAL',
    sub: 'Abre tu cuenta 100% digital con la mejor tasa del mercado peruano. Sin salir de casa.',
    chip: null,
  },
  {
    img: 'https://images.unsplash.com/photo-1664575602554-2087b04935a5?auto=format&fit=crop&w=1400&q=85',
    // Empresario / negocio exitoso
    tag: 'Crédito Empresarial',
    titleRed: 'IMPULSA',
    titleWhite: 'TU NEGOCIO',
    sub: 'Microcréditos para tu negocio con aprobación rápida y cuotas a tu medida.',
    chip: 'DESDE S/ 500',
    chipColor: '#1a3a6b',
  },
  {
    img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1400&q=85',
    // Gráficas financieras / inversión
    tag: 'Qapaq Qambios',
    titleRed: 'CAMBIA AL',
    titleWhite: 'MEJOR TIPO',
    sub: 'USD y EUR con el tipo de cambio más competitivo en todas nuestras agencias a nivel nacional.',
    chip: null,
  },
]

const NAV = [
  ['Conócenos', []],
  ['Ubícanos', ['Agencias', 'Agentes Recaudadores']],
  ['Préstamos', ['Para tu Negocio', 'Para ti', 'CrediAqua', 'Con Garantía de Joyas', 'LD GNV']],
  ['Ahorros', ['Insuperable', 'Qapital+', 'La Magnífiqa', 'Depósito a Plazo Fijo', 'CTS', 'Cuenta Negocios']],
  ['Seguros', ['Desgravamen', 'Vida Integral Plus', 'Multiayuda', 'Ruta Protegida']],
  ['Qapaq Qambios', []],
  ['Canales Digitales', ['App Qapaq Móvil', 'Qapaq por Internet']],
  ['Servicios', ['Pago Link', 'Transferencias']],
]

const QUICK = [
  { ico: '💰', t1: 'Para tus gastos', t2: 'PERSONALES' },
  { ico: '💍', t1: 'Efectivo por tus', t2: 'JOYAS de ORO' },
  { ico: '🐷', t1: 'Haz crecer', t2: 'TUS AHORROS' },
  { ico: '💵', t1: 'Mesa de', t2: 'DINERO' },
  { ico: '📢', t1: 'Nuestras', t2: 'CAMPAÑAS' },
]

const PRODUCTOS = [
  { bg: '#1a3a6b', ico: '🏪', title: 'Préstamo para tu Negocio', desc: 'Financia tu mercadería, maquinaria o cultivo.', link: 'Solicitar' },
  { bg: '#d97706', ico: '🐷', title: 'Cuenta Ahorros Insuperable', desc: 'La mejor tasa del mercado para tus ahorros.', link: 'Conocer más' },
  { bg: '#15803d', ico: '💳', title: 'Crédito de Consumo', desc: 'Efectivo rápido con cuotas fijas a tu medida.', link: 'Solicitar' },
  { bg: '#b91c1c', ico: '💍', title: 'Crédito con Garantía de Joyas', desc: 'Usa tus joyas y obtén liquidez de inmediato.', link: 'Solicitar' },
  { bg: '#0f766e', ico: '📅', title: 'Depósito a Plazo Fijo', desc: 'Alta rentabilidad garantizada por la SBS.', link: 'Conocer más' },
  { bg: '#6d28d9', ico: '🛡️', title: 'Seguros', desc: 'Protección para ti y tu familia.', link: 'Ver seguros' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)
  const timer = useRef(null)

  const go = () => navigate('/login')

  const changeSlide = useCallback((next) => {
    setVisible(false)
    setTimeout(() => { setIdx(next); setVisible(true) }, 300)
  }, [])

  const startTimer = useCallback(() => {
    clearInterval(timer.current)
    timer.current = setInterval(() => {
      setIdx(prev => { const n = (prev + 1) % SLIDES.length; changeSlide(n); return prev })
    }, 5500)
  }, [changeSlide])

  useEffect(() => { startTimer(); return () => clearInterval(timer.current) }, [startTimer])

  const goTo = (i) => { changeSlide(i); startTimer() }
  const s = SLIDES[idx]

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', -apple-system, sans-serif; }

        /* ── TOPBAR ── */
        .q-top { background:#f5c800; display:flex; align-items:center; justify-content:space-between; padding:10px 4vw; gap:10px; flex-wrap:wrap; }
        .q-brand-name { font-size:clamp(22px,3.5vw,30px); font-weight:900; color:#111; letter-spacing:1px; line-height:1; }
        .q-brand-tag  { font-size:clamp(9px,1vw,11px); color:#dc2626; font-style:italic; font-weight:600; }
        .q-top-btns   { display:flex; gap:8px; flex-wrap:wrap; }
        .q-top-btn { font-size:clamp(10px,1.1vw,12px); font-weight:700; padding:9px 14px; border-radius:5px; border:none; cursor:pointer; display:flex; align-items:center; gap:5px; font-family:inherit; transition:opacity .15s, transform .12s; white-space:nowrap; }
        .q-top-btn:hover { opacity:.88; transform:translateY(-1px); }
        .q-btn-gray  { background:#4b5563; color:#fff; }
        .q-btn-green { background:#16a34a; color:#fff; }
        .q-btn-red   { background:#dc2626; color:#fff; }

        /* ── NAVBAR ── */
        .q-nav { background:#fff; display:flex; align-items:center; justify-content:center; flex-wrap:wrap; border-bottom:1px solid #e5e7eb; position:sticky; top:0; z-index:300; box-shadow:0 1px 6px rgba(0,0,0,.07); }
        .q-nav-item { position:relative; }
        .q-nav-link { display:flex; align-items:center; color:#1a2a45; font-size:clamp(10px,1.05vw,12.5px); font-weight:700; padding:15px clamp(7px,1vw,12px); cursor:pointer; white-space:nowrap; text-transform:uppercase; letter-spacing:.3px; border-bottom:2px solid transparent; transition:color .15s, border-color .15s; user-select:none; }
        .q-nav-item:hover .q-nav-link { color:#d97706; border-bottom-color:#d97706; }
        .q-nav-item:hover .q-drop { display:block; }
        .q-drop { display:none; position:absolute; top:100%; left:0; background:#fff; min-width:200px; z-index:400; border-top:2px solid #d97706; box-shadow:0 8px 28px rgba(0,0,0,.12); border-radius:0 0 8px 8px; }
        .q-drop a { display:block; color:#374151; font-size:12.5px; padding:10px 16px; text-decoration:none; font-weight:500; transition:background .1s, color .1s; }
        .q-drop a:hover { background:#fef9c3; color:#d97706; }

        /* ── HERO ── */
        .q-hero { position:relative; width:100%; aspect-ratio:16/5.8; min-height:200px; max-height:520px; overflow:hidden; background:#d4a000; }
        .q-hero-img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:center right; transition:opacity .35s ease, transform .6s ease; }
        .q-hero-img.in  { opacity:1;   transform:scale(1.02); }
        .q-hero-img.out { opacity:0;   transform:scale(1); }

        /* Overlay split: amarillo izq → transparente der */
        .q-hero-ov { position:absolute; inset:0; background:linear-gradient(105deg, rgba(245,200,0,.97) 0%, rgba(245,200,0,.92) 30%, rgba(245,200,0,.65) 52%, rgba(245,200,0,.15) 72%, rgba(245,200,0,0) 100%); }

        /* Texto sobre hero */
        .q-hero-body { position:absolute; inset:0; display:flex; align-items:center; justify-content:space-between; padding:0 5vw; }
        .q-hero-left { flex:1; min-width:0; max-width:52%; transition:opacity .3s ease, transform .3s ease; }
        .q-hero-left.in  { opacity:1;  transform:translateX(0); }
        .q-hero-left.out { opacity:0;  transform:translateX(-16px); }

        .q-hero-tag { display:inline-block; background:#fff; color:#dc2626; font-size:clamp(8px,.9vw,11px); font-weight:800; padding:3px 12px; border-radius:20px; margin-bottom:clamp(8px,1.5vw,16px); letter-spacing:1px; text-transform:uppercase; }
        .q-title-red   { display:inline-block; background:#dc2626; color:#fff; font-size:clamp(22px,5vw,58px); font-weight:900; padding:clamp(3px,.5vw,8px) clamp(8px,1.2vw,18px); border-radius:5px; letter-spacing:-1px; line-height:1.05; margin-bottom:5px; }
        .q-title-white { display:inline-block; background:#fff;    color:#dc2626; font-size:clamp(20px,4.5vw,52px); font-weight:900; padding:clamp(3px,.5vw,8px) clamp(8px,1.2vw,18px); border-radius:5px; letter-spacing:-.5px; line-height:1.05; }
        .q-hero-sub { font-size:clamp(11px,1.4vw,15px); color:#111; line-height:1.65; max-width:44ch; margin:clamp(10px,1.5vw,18px) 0 clamp(14px,2vw,24px); }
        .q-hero-btns { display:flex; gap:10px; flex-wrap:wrap; }
        .q-hbtn-solid   { background:#d97706; color:#fff; font-size:clamp(11px,1.2vw,14px); font-weight:700; padding:clamp(8px,1vw,13px) clamp(14px,2vw,28px); border-radius:6px; border:none; cursor:pointer; font-family:inherit; transition:transform .15s, box-shadow .15s; }
        .q-hbtn-solid:hover   { transform:translateY(-2px); box-shadow:0 6px 20px rgba(217,119,6,.4); }
        .q-hbtn-outline { background:transparent; color:#1a2a45; font-size:clamp(11px,1.2vw,14px); font-weight:700; padding:clamp(8px,1vw,13px) clamp(14px,2vw,28px); border-radius:6px; border:2px solid #1a2a45; cursor:pointer; font-family:inherit; transition:background .15s, transform .15s; }
        .q-hbtn-outline:hover { background:rgba(0,0,0,.07); transform:translateY(-2px); }

        /* Chip derecho */
        .q-chip { background:#dc2626; color:#fff; font-size:clamp(15px,2.8vw,30px); font-weight:900; padding:clamp(14px,2vw,26px) clamp(18px,3vw,38px); border-radius:14px; text-align:center; box-shadow:0 12px 36px rgba(220,38,38,.45); flex-shrink:0; animation:chipPulse 2.4s ease-in-out infinite; line-height:1.3; }
        @keyframes chipPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.055)} }

        /* Dots */
        .q-dots { position:absolute; bottom:clamp(8px,1.5vw,18px); left:50%; transform:translateX(-50%); display:flex; gap:7px; z-index:3; }
        .q-dot { height:9px; border-radius:5px; background:rgba(255,255,255,.5); border:none; cursor:pointer; transition:all .3s ease; }
        .q-dot.on { background:#dc2626; }

        /* ── QUICK ── */
        .q-quick { background:#e5e7eb; display:flex; align-items:center; justify-content:center; gap:clamp(8px,2vw,20px); padding:clamp(12px,2vw,22px) 4vw; flex-wrap:wrap; }
        .q-quick-label { display:flex; align-items:center; gap:10px; flex-shrink:0; }
        .q-quick-bulb { font-size:clamp(22px,3vw,36px); }
        .q-quick-cards { display:flex; gap:clamp(6px,1vw,10px); flex-wrap:wrap; justify-content:center; }
        .q-qcard { background:#fff; border:1.5px solid #f5c800; border-top:3px solid #f5c800; border-radius:6px; padding:clamp(10px,1.4vw,16px) clamp(12px,1.6vw,20px); cursor:pointer; text-align:center; min-width:clamp(88px,9vw,118px); display:flex; flex-direction:column; align-items:center; gap:2px; font-family:inherit; transition:transform .18s, box-shadow .18s, border-color .15s; }
        .q-qcard:hover { transform:translateY(-4px); box-shadow:0 8px 22px rgba(0,0,0,.1); border-color:#d97706; border-top-color:#d97706; }
        .q-qcard-ico { font-size:clamp(18px,2.4vw,28px); margin-bottom:3px; }
        .q-qcard-t1 { font-size:clamp(9px,.95vw,11px); color:#6b7280; }
        .q-qcard-t2 { font-size:clamp(10px,1.05vw,12.5px); font-weight:800; color:#111; }
        .q-qcard-t3 { font-size:clamp(9px,.95vw,11px); color:#d97706; font-weight:700; }

        /* ── STATS ── */
        .q-stats { display:flex; justify-content:center; flex-wrap:wrap; border-bottom:1px solid #e5e7eb; background:#fff; }
        .q-stat { text-align:center; padding:clamp(14px,2.5vw,24px) clamp(16px,3.5vw,40px); border-right:1px solid #e5e7eb; }
        .q-stat:last-child { border-right:none; }
        .q-stat-num { font-size:clamp(20px,3.5vw,30px); font-weight:900; color:#d97706; margin-bottom:3px; }
        .q-stat-lbl { font-size:clamp(10px,1vw,12px); color:#6b7280; font-weight:500; }

        /* ── SECTION ── */
        .q-section { padding:clamp(28px,4.5vw,52px) clamp(16px,5vw,40px); max-width:1120px; margin:0 auto; }
        .q-sec-title { font-size:clamp(18px,2.8vw,24px); font-weight:800; color:#111; margin-bottom:5px; }
        .q-sec-sub   { font-size:clamp(11.5px,1.2vw,13.5px); color:#6b7280; margin-bottom:clamp(18px,2.5vw,28px); }
        .q-divider   { border:none; border-top:1px solid #e5e7eb; }

        /* ── PRODUCT CARDS ── */
        .q-pgrid { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(195px,100%),1fr)); gap:clamp(12px,1.8vw,18px); }
        .q-pcard { background:#fff; border-radius:12px; border:1px solid #e5e7eb; overflow:hidden; cursor:pointer; transition:transform .22s cubic-bezier(.22,1,.36,1), box-shadow .22s; }
        .q-pcard:hover { transform:translateY(-8px); box-shadow:0 18px 48px rgba(0,0,0,.13); }
        .q-pcard-hd { height:clamp(68px,7.5vw,92px); display:flex; align-items:center; justify-content:center; font-size:clamp(26px,3.5vw,38px); transition:transform .22s; }
        .q-pcard:hover .q-pcard-hd { transform:scale(1.1); }
        .q-pcard-bd { padding:clamp(12px,1.5vw,18px); }
        .q-pcard-title { font-size:clamp(12px,1.2vw,13.5px); font-weight:700; color:#1a2a45; margin-bottom:5px; }
        .q-pcard-desc  { font-size:clamp(10px,1vw,12px); color:#6b7280; line-height:1.6; }
        .q-pcard-link  { display:inline-flex; align-items:center; gap:3px; margin-top:9px; font-size:clamp(11px,1.1vw,12.5px); font-weight:700; color:#d97706; transition:gap .15s; }
        .q-pcard:hover .q-pcard-link { gap:8px; }

        /* ── QAMBIOS ── */
        .q-qgrid { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(160px,100%),1fr)); gap:clamp(10px,1.4vw,16px); }
        .q-qtipo { background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:clamp(16px,2vw,24px); text-align:center; transition:transform .2s, box-shadow .2s; }
        .q-qtipo:hover { transform:translateY(-4px); box-shadow:0 10px 28px rgba(0,0,0,.08); }
        .q-qtipo-lbl { font-size:clamp(11px,1vw,12.5px); color:#6b7280; margin-bottom:6px; font-weight:500; }
        .q-qtipo-val { font-size:clamp(22px,3vw,30px); font-weight:900; }

        /* ── BANNER ── */
        .q-banner { background:linear-gradient(118deg,#1a3a6b 0%,#1e52a8 100%); padding:clamp(20px,3vw,30px) 5vw; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; }
        .q-banner-title { color:#fff; font-size:clamp(14px,1.8vw,18px); font-weight:700; margin-bottom:4px; }
        .q-banner-sub   { color:rgba(255,255,255,.78); font-size:clamp(11px,1.1vw,13px); }
        .q-banner-btn   { background:#f5c800; color:#111; font-size:clamp(12px,1.2vw,14px); font-weight:800; padding:clamp(10px,1.1vw,13px) clamp(18px,2.5vw,26px); border-radius:6px; border:none; cursor:pointer; font-family:inherit; white-space:nowrap; transition:opacity .15s, transform .12s; }
        .q-banner-btn:hover { opacity:.9; transform:translateY(-2px); }

        /* ── FOOTER ── */
        .q-footer { background:#0f2447; color:#c8d8f0; padding:clamp(28px,4vw,48px) 5vw clamp(14px,2vw,20px); }
        .q-fgrid { display:grid; grid-template-columns:repeat(auto-fit,minmax(min(140px,100%),1fr)); gap:clamp(16px,2.5vw,28px); max-width:1080px; margin:0 auto clamp(20px,2.5vw,28px); }
        .q-fcol h4 { color:#f5c800; font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:12px; }
        .q-fcol a  { display:block; color:#94a9c9; font-size:12px; text-decoration:none; margin-bottom:7px; transition:color .15s; }
        .q-fcol a:hover { color:#fff; }
        .q-flogo { width:30px; height:30px; background:#fff; border-radius:4px; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:13px; color:#1a2a45; }
        .q-libro { display:inline-flex; align-items:center; gap:5px; background:#dc2626; color:#fff; font-size:11px; font-weight:700; padding:7px 12px; border-radius:5px; border:none; cursor:pointer; margin-top:12px; font-family:inherit; transition:opacity .15s; }
        .q-libro:hover { opacity:.85; }
        .q-fbot { border-top:1px solid rgba(255,255,255,.08); padding-top:14px; text-align:center; font-size:11px; color:#475569; max-width:1080px; margin:0 auto; }

        @media(max-width:640px){
          .q-hero { aspect-ratio:4/3; max-height:340px; }
          .q-chip  { display:none; }
          .q-hero-left { max-width:100%; }
        }
      `}</style>

      {/* ── TOP BAR ── */}
      <div className="q-top">
        <div>
          <div className="q-brand-name">QAPAQ</div>
          <div className="q-brand-tag">una financiera solidaria</div>
        </div>
        <div className="q-top-btns">
          <button className="q-top-btn q-btn-gray"  onClick={go}>🔒 Qapaq por INTERNET</button>
          <button className="q-top-btn q-btn-green" onClick={go}>👤 Abre tu CUENTA</button>
          <button className="q-top-btn q-btn-red"   onClick={go}>💰 Solicita tu PRÉSTAMO</button>
        </div>
      </div>

      {/* ── NAVBAR ── */}
      <nav className="q-nav">
        {NAV.map(([label, subs]) => (
          <div className="q-nav-item" key={label}>
            <span className="q-nav-link">{label}{subs.length > 0 && ' ▾'}</span>
            {subs.length > 0 && (
              <div className="q-drop">
                {subs.map(s2 => <a href="#" key={s2} onClick={e => { e.preventDefault(); go() }}>{s2}</a>)}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* ── HERO ── */}
      <div className="q-hero">
        <img
          className={`q-hero-img ${visible ? 'in' : 'out'}`}
          src={s.img}
          alt=""
          key={idx}
        />
        <div className="q-hero-ov" />
        <div className="q-hero-body">
          <div className={`q-hero-left ${visible ? 'in' : 'out'}`}>
            {s.tag && <div className="q-hero-tag">{s.tag}</div>}
            <div style={{ display:'flex', flexDirection:'column', gap: 5, marginBottom: 'clamp(8px,1.5vw,16px)' }}>
              <div className="q-title-red">{s.titleRed}</div>
              <div className="q-title-white">{s.titleWhite}</div>
            </div>
            <p className="q-hero-sub">{s.sub}</p>
            <div className="q-hero-btns">
              <button className="q-hbtn-solid" onClick={go}>Conocer más</button>
              <button className="q-hbtn-outline" onClick={go}>Ver condiciones</button>
            </div>
          </div>
          {s.chip && (
            <div className="q-chip" style={{ background: s.chipColor }}>
              {s.chip.split('\n').map((line, i) => <div key={i}>{line}</div>)}
            </div>
          )}
        </div>
        <div className="q-dots">
          {SLIDES.map((_, i) => (
            <button key={i} className={`q-dot${i === idx ? ' on' : ''}`}
              style={{ width: i === idx ? 26 : 9 }} onClick={() => goTo(i)} />
          ))}
        </div>
      </div>

      {/* ── QUICK ACCESS ── */}
      <div className="q-quick">
        <div className="q-quick-label">
          <div className="q-quick-bulb">💡</div>
          <div>
            <div style={{ fontSize:'clamp(11px,1.1vw,13px)', color:'#374151' }}>Todo lo que</div>
            <div style={{ fontSize:'clamp(12px,1.2vw,14px)', fontWeight:800, color:'#111' }}>NECESITAS</div>
          </div>
        </div>
        <div className="q-quick-cards">
          {QUICK.map(q => (
            <button key={q.t2} className="q-qcard" onClick={go}>
              <div className="q-qcard-ico">{q.ico}</div>
              <div className="q-qcard-t1">{q.t1}</div>
              <div className="q-qcard-t2">{q.t2}</div>
              <div className="q-qcard-t3">ver más</div>
            </button>
          ))}
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="q-stats">
        {[['30+','Años de experiencia'],['60+','Agencias a nivel nacional'],['+200k','Clientes satisfechos'],['A+','Calificación SBS']].map(([n,l]) => (
          <div key={l} className="q-stat">
            <div className="q-stat-num">{n}</div>
            <div className="q-stat-lbl">{l}</div>
          </div>
        ))}
      </div>

      {/* ── PRODUCTOS ── */}
      <div className="q-section">
        <h2 className="q-sec-title">Nuestros <span style={{ color:'#d97706' }}>Productos</span></h2>
        <p className="q-sec-sub">Soluciones financieras diseñadas para ti y tu negocio</p>
        <div className="q-pgrid">
          {PRODUCTOS.map((p,i) => (
            <div key={p.title} className="q-pcard" onClick={go} style={{ animationDelay:`${i*.07}s` }}>
              <div className="q-pcard-hd" style={{ background:p.bg }}>{p.ico}</div>
              <div className="q-pcard-bd">
                <div className="q-pcard-title">{p.title}</div>
                <div className="q-pcard-desc">{p.desc}</div>
                <div className="q-pcard-link">{p.link} →</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="q-divider" />

      {/* ── QAMBIOS ── */}
      <div className="q-section">
        <h2 className="q-sec-title">Qapaq <span style={{ color:'#d97706' }}>Qambios</span></h2>
        <p className="q-sec-sub">Tipo de cambio referencial — consulta el vigente en tu agencia</p>
        <div className="q-qgrid">
          {[['Compra USD','S/ 3.72','#1a3a6b'],['Venta USD','S/ 3.78','#d97706'],['Compra EUR','S/ 4.08','#1a3a6b'],['Venta EUR','S/ 4.15','#d97706']].map(([l,v,c]) => (
            <div key={l} className="q-qtipo">
              <div className="q-qtipo-lbl">{l}</div>
              <div className="q-qtipo-val" style={{ color:c }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <hr className="q-divider" />

      {/* ── BANNER ── */}
      <div className="q-banner">
        <div>
          <div className="q-banner-title">App Qapaq Móvil — Banca desde tu celular</div>
          <div className="q-banner-sub">Transferencias, saldos y pago de cuotas. Disponible en iOS y Android.</div>
        </div>
        <button className="q-banner-btn" onClick={go}>Descargar App</button>
      </div>

      {/* ── FOOTER ── */}
      <footer className="q-footer">
        <div className="q-fgrid">
          <div className="q-fcol">
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
              <div className="q-flogo">Q</div>
              <span style={{ fontWeight:900, fontSize:15, color:'#fff', letterSpacing:1 }}>QAPAQ</span>
            </div>
            <p style={{ fontSize:12, color:'#64748b', lineHeight:1.7 }}>Financiera QAPAQ S.A.<br/>RUC: 20521308321<br/>Regulado por la SBS</p>
            <button className="q-libro">📚 Libro de Reclamaciones</button>
          </div>
          {[['Qapaq',['Conócenos','Ubícanos','Trabaja con Nosotros','Mapa del Sitio']],
            ['Información',['Términos y Condiciones','Protección de Datos','Guía para el Cliente']],
            ['Transparencia',['Información de Reclamos','Comunicados','Campañas']],
          ].map(([t,ls]) => (
            <div key={t} className="q-fcol">
              <h4>{t}</h4>
              {ls.map(l => <a key={l} href="#">{l}</a>)}
            </div>
          ))}
          <div className="q-fcol">
            <h4>Contáctanos</h4>
            <p style={{ fontSize:12, color:'#94a9c9', lineHeight:1.7, marginBottom:10 }}>
              Call Center:<br/><strong style={{ color:'#fff', fontSize:14 }}>+51 1 712 3223</strong><br/>
              <span style={{ color:'#64748b' }}>Lun-Sab 9am–9pm</span>
            </p>
          </div>
        </div>
        <div className="q-fbot">© Financiera QAPAQ S.A. | Todos los derechos reservados 2026</div>
      </footer>
    </>
  )
}
