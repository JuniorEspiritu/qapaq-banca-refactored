import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import * as api from '../../lib/api.js'
import { fmt, fmtDate, fmtDateTime } from '../../lib/format.js'
import Icon from '../../components/Icon.jsx'

/* ─── helpers ─────────────────────────────────────────────── */
const tipoColor = (desc = '') => {
  const d = desc.toLowerCase()
  if (d.includes('depósito') || d.includes('deposito') || d.includes('abono') || d.includes('recib'))
    return { bg: '#dcfce7', color: '#15803d', sign: '+' }
  if (d.includes('retiro') || d.includes('pago') || d.includes('cargo') || d.includes('transf') || d.includes('débito'))
    return { bg: '#fee2e2', color: '#b91c1c', sign: '-' }
  return { bg: '#f0f2f8', color: '#374151', sign: '' }
}

const CSS = `
  .hp * { box-sizing: border-box; }
  .hp {
    font-family: 'Inter', sans-serif;
    background: #f0f3f8;
    min-height: 100vh;
    margin: -36px -32px -72px;   /* anula el padding del hb-main */
  }

  /* ════════════════════════════════
     HERO — azul oscuro, ocupa todo el ancho
  ════════════════════════════════ */
  .hp-hero {
    background: linear-gradient(160deg, #06112b 0%, #0d1f4a 40%, #1a3d88 75%, #1e4fa8 100%);
    padding: 36px 22px 40px;
    position: relative;
    overflow: hidden;
  }
  .hp-hero::after {
    content: '';
    position: absolute; bottom: -1px; left: 0; right: 0;
    height: 28px;
    background: #f0f3f8;
    border-radius: 28px 28px 0 0;
  }
  /* Destellos de fondo */
  .hp-hero-glow1 {
    position: absolute; top: -80px; right: -80px;
    width: 260px; height: 260px; border-radius: 50%;
    background: radial-gradient(circle, rgba(245,200,0,.15) 0%, transparent 70%);
    pointer-events: none;
  }
  .hp-hero-glow2 {
    position: absolute; bottom: 20px; left: -60px;
    width: 180px; height: 180px; border-radius: 50%;
    background: radial-gradient(circle, rgba(59,130,246,.2) 0%, transparent 70%);
    pointer-events: none;
  }

  /* Saludo */
  .hp-greeting-row {
    display: flex; align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 4px;
    position: relative; z-index: 1;
  }
  .hp-greeting-sub { font-size: 13px; color: rgba(255,255,255,.55); margin-bottom: 3px; }
  .hp-greeting-name { font-size: 28px; font-weight: 900; color: #fff; letter-spacing: -1px; }

  .hp-eye-btn {
    background: rgba(255,255,255,.12);
    border: 1px solid rgba(255,255,255,.2);
    color: rgba(255,255,255,.85);
    font-size: 11px; font-weight: 600;
    padding: 7px 13px; border-radius: 20px;
    cursor: pointer; font-family: inherit;
    display: flex; align-items: center; gap: 5px;
    transition: background .15s; white-space: nowrap; flex-shrink: 0;
  }
  .hp-eye-btn:hover { background: rgba(255,255,255,.22); }

  /* Label "Mis productos" */
  .hp-productos-label {
    font-size: 10.5px; font-weight: 700;
    color: rgba(255,255,255,.45);
    letter-spacing: 1.5px; text-transform: uppercase;
    margin: 22px 0 12px;
    position: relative; z-index: 1;
  }

  /* Tarjetas de producto — scroll horizontal */
  .hp-products-scroll {
    display: flex; gap: 12px;
    overflow-x: auto; padding-bottom: 8px;
    scrollbar-width: none; -webkit-overflow-scrolling: touch;
    position: relative; z-index: 1;
  }
  .hp-products-scroll::-webkit-scrollbar { display: none; }

  /* Tarjeta ahorro */
  .hp-prod-card {
    min-width: 220px; flex-shrink: 0;
    border-radius: 20px; padding: 22px 20px;
    cursor: pointer; position: relative; overflow: hidden;
    transition: transform .2s, box-shadow .2s;
  }
  .hp-prod-card:hover { transform: translateY(-3px); }
  .hp-prod-card.ahorro {
    background: linear-gradient(135deg, #1044a8, #2563eb);
    box-shadow: 0 8px 28px rgba(16,68,168,.45);
  }
  .hp-prod-card.credito {
    background: linear-gradient(135deg, #3b0764, #6d28d9);
    box-shadow: 0 8px 28px rgba(109,40,217,.45);
  }
  .hp-prod-card::before {
    content: ''; position: absolute; top: -30px; right: -30px;
    width: 110px; height: 110px; border-radius: 50%;
    background: rgba(255,255,255,.08); pointer-events: none;
  }
  .hp-prod-chip {
    width: 30px; height: 20px;
    background: linear-gradient(135deg, #f5c800, #d97706);
    border-radius: 4px; margin-bottom: 20px;
  }
  .hp-prod-lbl {
    font-size: 9.5px; font-weight: 700;
    color: rgba(255,255,255,.5);
    text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 4px;
  }
  .hp-prod-amt {
    font-size: clamp(20px, 5.5vw, 26px);
    font-weight: 900; color: #fff; letter-spacing: -1px;
    margin-bottom: 18px; transition: filter .2s;
  }
  .hp-prod-amt.masked { filter: blur(7px); user-select: none; }
  .hp-prod-footer { display: flex; align-items: center; justify-content: space-between; }
  .hp-prod-codigo { font-size: 9.5px; color: rgba(255,255,255,.65); font-family: monospace; letter-spacing: .8px; }
  .hp-prod-tipo   { font-size: 8px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
  .hp-prod-tipo.ahorro  { color: #93c5fd; }
  .hp-prod-tipo.credito { color: #c4b5fd; }
  .hp-prod-estado {
    font-size: 8px; font-weight: 800;
    padding: 2px 7px; border-radius: 8px;
    text-transform: uppercase; letter-spacing: .5px;
  }
  .hp-prod-estado.mora   { background: rgba(239,68,68,.3); color: #fca5a5; }
  .hp-prod-estado.normal { background: rgba(34,197,94,.25); color: #86efac; }

  /* ════════════════════════════════
     CUERPO BLANCO
  ════════════════════════════════ */
  .hp-body {
    background: #f0f3f8;
    padding: 24px 18px 56px;
  }

  /* ── Acciones rápidas ── */
  .hp-acciones {
    display: grid; grid-template-columns: repeat(4,1fr);
    gap: 10px; margin-bottom: 28px;
  }
  .hp-acc-btn {
    background: #fff; border: 1px solid #e8edf6;
    border-radius: 18px; padding: 18px 8px 15px;
    cursor: pointer; font-family: inherit;
    display: flex; flex-direction: column;
    align-items: center; gap: 8px;
    transition: transform .18s, box-shadow .18s;
    box-shadow: 0 1px 6px rgba(0,0,0,.05);
  }
  .hp-acc-btn:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,.1); }
  .hp-acc-ico {
    width: 50px; height: 50px; border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    font-size: 24px; transition: transform .18s;
  }
  .hp-acc-btn:hover .hp-acc-ico { transform: scale(1.1); }
  .hp-acc-lbl { font-size: 11px; font-weight: 700; color: #374151; text-align: center; line-height: 1.3; }

  /* ── Section header ── */
  .hp-sec-hd {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 10px;
  }
  .hp-sec-title { font-size: 16px; font-weight: 800; color: #0c1e3e; display: flex; align-items: center; gap: 7px; }
  .hp-sec-link {
    font-size: 12px; font-weight: 700; color: #d97706;
    background: none; border: none; cursor: pointer;
    font-family: inherit; transition: color .15s;
  }
  .hp-sec-link:hover { color: #b45309; }

  /* ── Movimientos ── */
  .hp-mov-card {
    background: #fff; border-radius: 16px;
    overflow: hidden; margin-bottom: 20px;
    box-shadow: 0 1px 8px rgba(0,0,0,.06);
    border: 1px solid #edf0f8;
  }
  .hp-mov-row {
    display: flex; align-items: center;
    padding: 16px 16px; gap: 13px;
    cursor: pointer; border-bottom: 1px solid #f4f6fb;
    transition: background .15s;
  }
  .hp-mov-row:last-child { border-bottom: none; }
  .hp-mov-row:hover { background: #f8faff; }
  .hp-mov-ico { width: 46px; height: 46px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
  .hp-mov-info { flex: 1; min-width: 0; }
  .hp-mov-desc { font-size: 13.5px; font-weight: 700; color: #0c1e3e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 3px; }
  .hp-mov-date { font-size: 11.5px; color: #9ca3af; }
  .hp-mov-amt  { font-size: 15px; font-weight: 800; flex-shrink: 0; transition: filter .2s; }
  .hp-mov-amt.masked { filter: blur(5px); user-select: none; }

  /* ── Bottom sheet modal ── */
  .hp-sheet-bg {
    position: fixed; inset: 0; z-index: 700;
    background: rgba(6,17,43,.6);
    backdrop-filter: blur(4px);
    display: flex; align-items: flex-end;
    animation: hp-fi .2s ease;
  }
  @keyframes hp-fi { from { opacity:0; } to { opacity:1; } }
  .hp-sheet {
    background: #fff; border-radius: 24px 24px 0 0;
    width: 100%; max-width: 520px; margin: 0 auto;
    padding: 0 0 36px; max-height: 90vh; overflow-y: auto;
    animation: hp-su .3s cubic-bezier(.22,1,.36,1);
  }
  @keyframes hp-su { from { transform:translateY(100%); } to { transform:translateY(0); } }
  .hp-sheet-handle { width: 40px; height: 4px; background: #e5e7eb; border-radius: 2px; margin: 12px auto 0; }
  .hp-sheet-hd { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px 12px; border-bottom: 1px solid #f0f2f8; }
  .hp-sheet-title { font-size: 15px; font-weight: 800; color: #0c1e3e; }
  .hp-sheet-close { background: #f4f6fb; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 15px; color: #6b7280; }
  .hp-sheet-close:hover { background: #e5e7eb; }
  .hp-sheet-body { padding: 16px 18px; }

  /* Detalle movimiento */
  .hp-det-ico  { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 8px; }
  .hp-det-amt  { font-size: 30px; font-weight: 900; text-align: center; margin-bottom: 3px; }
  .hp-det-desc { font-size: 13px; color: #6b7280; text-align: center; margin-bottom: 18px; }
  .hp-det-row  { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f4f6fb; font-size: 13px; }
  .hp-det-row:last-child { border-bottom: none; }
  .hp-det-lbl  { color: #9ca3af; font-weight: 500; }
  .hp-det-val  { font-weight: 700; color: #0c1e3e; text-align: right; max-width: 60%; }

  /* Transferencia */
  .hp-tf-field { margin-bottom: 13px; }
  .hp-tf-lbl   { display: block; font-size: 10.5px; font-weight: 700; color: #374151; margin-bottom: 6px; text-transform: uppercase; letter-spacing: .4px; }
  .hp-tf-input { width: 100%; padding: 11px 13px; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 14px; font-family: inherit; background: #fafbfc; color: #0c1e3e; outline: none; transition: border-color .2s, box-shadow .2s; }
  .hp-tf-input:focus { border-color: #f5c800; box-shadow: 0 0 0 3px rgba(245,200,0,.18); }
  .hp-tf-btn   { width: 100%; background: linear-gradient(135deg, #071428, #1a3e8a); color: #fff; font-size: 14px; font-weight: 800; padding: 13px; border-radius: 10px; border: none; cursor: pointer; font-family: inherit; transition: transform .15s, box-shadow .15s; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 6px; }
  .hp-tf-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(7,20,42,.35); }
  .hp-tf-btn:disabled { opacity: .5; cursor: not-allowed; }
  .hp-tf-ok  { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; border-radius: 10px; padding: 11px 13px; font-size: 13px; font-weight: 600; margin-bottom: 12px; }
  .hp-tf-err { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; border-radius: 10px; padding: 11px 13px; font-size: 13px; font-weight: 600; margin-bottom: 12px; }
  .hp-orig-selector { display: flex; gap: 8px; flex-wrap: wrap; }
  .hp-orig-opt { flex: 1; min-width: 110px; border: 2px solid #e5e7eb; border-radius: 10px; padding: 9px 11px; cursor: pointer; background: #fafbfc; font-family: inherit; text-align: left; transition: border-color .15s, background .15s; }
  .hp-orig-opt.sel { border-color: #1a3e8a; background: #eef4ff; }
  .hp-orig-opt-cod   { font-size: 11px; font-weight: 700; color: #0c1e3e; font-family: monospace; }
  .hp-orig-opt-saldo { font-size: 10px; color: #6b7280; margin-top: 1px; }

  /* Estados */
  .hp-empty  { text-align: center; padding: 24px 16px; color: #9ca3af; font-size: 13px; }
  .hp-loader { text-align: center; padding: 18px; color: #9ca3af; font-size: 13px; }

  /* ── Animación LED tarjetas ahorro ── */
  /* Brillo LED — overlay con opacity sobre fondo fijo */
  @keyframes hp-glow-pulse {
    0%   { opacity: 0; }
    50%  { opacity: 1; }
    100% { opacity: 0; }
  }

  .hp-card-led {
    background: linear-gradient(135deg, #0d1f4a, #1044a8) !important;
    position: relative;
  }
  .hp-card-led::after {
    content: '';
    position: absolute; inset: 0;
    border-radius: 20px;
    background: linear-gradient(135deg, rgba(96,165,250,0) 0%, rgba(147,197,253,.55) 50%, rgba(224,242,254,.7) 100%);
    opacity: 0;
    animation: hp-glow-pulse 5s ease-in-out infinite;
    pointer-events: none;
  }

  .hp-card-led-credito {
    background: linear-gradient(135deg, #1e0938, #4c1d95) !important;
    position: relative;
  }
  .hp-card-led-credito::after {
    content: '';
    position: absolute; inset: 0;
    border-radius: 20px;
    background: linear-gradient(135deg, rgba(139,92,246,0) 0%, rgba(167,139,250,.55) 50%, rgba(237,233,254,.65) 100%);
    opacity: 0;
    animation: hp-glow-pulse 5s ease-in-out infinite;
    pointer-events: none;
  }

  /* Desktop */
  @media (min-width: 640px) {
    .hp { margin: -36px -32px -72px; }
    .hp-hero { padding: 32px 32px 36px; }
    .hp-greeting-name { font-size: 26px; }
    .hp-body { padding: 24px 32px 56px; }
    .hp-prod-card { min-width: 220px; }
    .hp-sheet-bg { align-items: center; }
    .hp-sheet    { border-radius: 20px; }
  }
`

export default function HomePage() {
  const { user } = useAuth()
  const navigate  = useNavigate()

  const [cuentas,  setCuentas]  = useState(null)
  const [creditos, setCreditos] = useState(null)
  const [movs,     setMovs]     = useState({})
  const [loadingM, setLoadingM] = useState({})
  const [err,      setErr]      = useState(null)
  const [hidden,   setHidden]   = useState(true)
  const [modal,    setModal]    = useState(null)

  // Transferencia
  const [tfOrigen,  setTfOrigen]  = useState('')
  const [tfDestino, setTfDestino] = useState('')
  const [tfMonto,   setTfMonto]   = useState('')
  const [tfDesc,    setTfDesc]    = useState('')
  const [tfLoading, setTfLoading] = useState(false)
  const [tfMsg,     setTfMsg]     = useState(null)

  const first     = user?.nombre?.split(',')[1]?.trim().split(' ')[0] || 'Cliente'
  const showAmt   = (v) => hidden ? '••••••' : fmt(v)

  useEffect(() => {
    let a = true
    Promise.all([api.getCuentasAhorro(), api.getCuentasCredito()])
      .then(([c, cr]) => { if (a) { setCuentas(c); setCreditos(cr) } })
      .catch(e => a && setErr(e.message))
    return () => { a = false }
  }, [])

  const loadMovs = useCallback(async (codigo) => {
    if (movs[codigo] !== undefined || loadingM[codigo]) return
    setLoadingM(p => ({ ...p, [codigo]: true }))
    try   { const d = await api.getMovimientos(codigo); setMovs(p => ({ ...p, [codigo]: d })) }
    catch { setMovs(p => ({ ...p, [codigo]: [] })) }
    finally { setLoadingM(p => ({ ...p, [codigo]: false })) }
  }, [movs, loadingM])

  // Auto-carga movimientos de la primera cuenta
  useEffect(() => { if (cuentas?.length) loadMovs(cuentas[0].codigo) }, [cuentas])

  const openMovs   = (cuenta) => { loadMovs(cuenta.codigo); setModal({ type:'movs', cuenta }) }
  const openDetalle = (mov, cuenta) => setModal({ type:'det', mov, cuenta })
  const openTf     = () => {
    setTfOrigen(cuentas?.[0]?.codigo || '')
    setTfDestino(''); setTfMonto(''); setTfDesc(''); setTfMsg(null)
    setModal({ type:'tf' })
  }
  const closeModal = () => setModal(null)

  const hacerTf = async () => {
    if (!tfOrigen || !tfDestino || !tfMonto) return
    setTfLoading(true); setTfMsg(null)
    try {
      await api.transferir({ cuenta_origen: tfOrigen, cuenta_destino: tfDestino, monto: Number(tfMonto), descripcion: tfDesc || 'Transferencia' })
      setTfMsg({ ok: true, text: '✅ Transferencia realizada con éxito.' })
      const c = await api.getCuentasAhorro(); setCuentas(c); setMovs({})
    } catch (e) { setTfMsg({ ok: false, text: '⚠️ ' + e.message }) }
    finally { setTfLoading(false) }
  }

  const primeraCuenta = cuentas?.[0]
  const movsPreview   = primeraCuenta ? (movs[primeraCuenta.codigo] || []).slice(0, 5) : []

  return (
    <div className="hp fade-in">
      <style>{CSS}</style>

      {/* ════════ HERO ════════ */}
      <div className="hp-hero">
        <div className="hp-hero-glow1" />
        <div className="hp-hero-glow2" />

        {/* Saludo */}
        <div className="hp-greeting-row">
          <div>
            <div className="hp-greeting-sub">¿Qué haremos hoy?</div>
            <div className="hp-greeting-name">Hola, {first} 👋</div>
          </div>
          <button className="hp-eye-btn" onClick={() => setHidden(v => !v)}>
            {hidden ? '👁 Ver' : '🙈 Ocultar'}
          </button>
        </div>

        {/* Label */}
        <div className="hp-productos-label">Mis productos</div>

        {/* Tarjetas dentro del hero */}
        <div className="hp-products-scroll">
          {/* Cuentas de ahorro */}
          {cuentas === null && (
            <div style={{ color:'rgba(255,255,255,.5)', fontSize:13, padding:'8px 0' }}>Cargando…</div>
          )}
          {(cuentas || []).map((c, i) => (
            <TarjetaAhorro key={c.codigo} cuenta={c} delay={i * 1.2} onOpen={() => openMovs(c)} />
          ))}
          {/* Créditos */}
          {(creditos || []).map((c, i) => (
            <TarjetaCredito key={c.codigo} credito={c} delay={i * 1.5} onOpen={() => navigate('/banca/creditos')} />
          ))}
        </div>
      </div>

      {/* ════════ CUERPO BLANCO ════════ */}
      <div className="hp-body">
        {err && <div className="hb-alert-err" style={{ marginBottom:16 }}>{err}</div>}

        {/* Acciones rápidas */}
        <div className="hp-acciones">
          {[
            { ico:'💸', lbl:'Transferir',   bg:'#dbeafe', fg:'#1d4ed8', fn: openTf },
            { ico:'💰', lbl:'Mis ahorros',  bg:'#dcfce7', fg:'#15803d', fn: () => navigate('/banca/ahorros') },
            { ico:'💳', lbl:'Mis créditos', bg:'#ede9fe', fg:'#7c3aed', fn: () => navigate('/banca/creditos') },
            { ico:'📊', lbl:'Simulador',    bg:'#fef3c7', fg:'#d97706', fn: () => navigate('/banca/simulador') },
          ].map(a => (
            <button key={a.lbl} className="hp-acc-btn" onClick={a.fn}>
              <div className="hp-acc-ico" style={{ background:a.bg, color:a.fg }}>{a.ico}</div>
              <span className="hp-acc-lbl">{a.lbl}</span>
            </button>
          ))}
        </div>

        {/* Últimos movimientos */}
        <div className="hp-sec-hd">
          <span className="hp-sec-title">📋 Últimos movimientos</span>
          {primeraCuenta && (
            <button className="hp-sec-link" onClick={() => openMovs(primeraCuenta)}>Ver más →</button>
          )}
        </div>

        {!primeraCuenta || loadingM[primeraCuenta?.codigo] ? (
          <div className="hp-loader">Cargando movimientos…</div>
        ) : movsPreview.length === 0 ? (
          <div className="hp-empty">Sin movimientos recientes.</div>
        ) : (
          <div className="hp-mov-card">
            {movsPreview.map((m, i) => (
              <MovFila key={m.id || i} mov={m} hidden={hidden} showAmt={showAmt}
                onClick={() => openDetalle(m, primeraCuenta)} />
            ))}
          </div>
        )}

        {/* Solicitar crédito — si no tiene */}
        {creditos && creditos.length === 0 && (
          <div style={{ background:'linear-gradient(135deg,#1a3e8a,#2563eb)', borderRadius:16, padding:'18px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, boxShadow:'0 4px 20px rgba(26,62,138,.3)' }}>
            <div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,.6)', marginBottom:3 }}>¿Necesitas financiamiento?</div>
              <div style={{ fontSize:14, fontWeight:800, color:'#fff' }}>Solicita tu préstamo</div>
            </div>
            <button onClick={() => navigate('/banca/solicitar')} style={{ background:'#f5c800', color:'#0c1e3e', fontWeight:800, fontSize:12, padding:'9px 16px', borderRadius:8, border:'none', cursor:'pointer', whiteSpace:'nowrap', fontFamily:'inherit' }}>
              Solicitar →
            </button>
          </div>
        )}
      </div>

      {/* ════════ MODALES ════════ */}
      {modal && (
        <div className="hp-sheet-bg" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="hp-sheet">
            <div className="hp-sheet-handle" />

            {/* Movimientos de cuenta */}
            {modal.type === 'movs' && (
              <ModalMovimientos
                cuenta={modal.cuenta}
                movs={movs} loading={loadingM}
                onDetalle={m => openDetalle(m, modal.cuenta)}
                loadMovs={loadMovs}
                onClose={closeModal}
              />
            )}

            {/* Detalle movimiento */}
            {modal.type === 'det' && (() => {
              const { bg, color, sign } = tipoColor(modal.mov.descripcion || modal.mov.tipo || '')
              const monto = modal.mov.monto || modal.mov.importe || 0
              return (
                <>
                  <div className="hp-sheet-hd">
                    <span className="hp-sheet-title">Detalle</span>
                    <button className="hp-sheet-close" onClick={closeModal}>✕</button>
                  </div>
                  <div className="hp-sheet-body">
                    <div className="hp-det-ico" style={{ background:bg, color }}>{sign==='+' ? '⬆️' : sign==='-' ? '⬇️' : '↔️'}</div>
                    <div className="hp-det-amt" style={{ color }}>{sign}{showAmt(monto)}</div>
                    <div className="hp-det-desc">{modal.mov.descripcion || modal.mov.tipo}</div>
                    {[
                      ['Fecha',        fmtDateTime(modal.mov.fecha || modal.mov.created_at)],
                      ['Tipo',         modal.mov.tipo || '—'],
                      ['Cuenta',       modal.cuenta?.codigo || '—'],
                      ['N° operación', modal.mov.id ? `#${modal.mov.id}` : '—'],
                      ['Saldo tras op.', modal.mov.saldo_despues != null ? fmt(modal.mov.saldo_despues) : '—'],
                    ].map(([l,v]) => (
                      <div key={l} className="hp-det-row">
                        <span className="hp-det-lbl">{l}</span>
                        <span className="hp-det-val">{v}</span>
                      </div>
                    ))}
                  </div>
                </>
              )
            })()}

            {/* Transferencia */}
            {modal.type === 'tf' && (
              <>
                <div className="hp-sheet-hd">
                  <span className="hp-sheet-title">💸 Transferir</span>
                  <button className="hp-sheet-close" onClick={closeModal}>✕</button>
                </div>
                <div className="hp-sheet-body">
                  {tfMsg && <div className={tfMsg.ok ? 'hp-tf-ok' : 'hp-tf-err'}>{tfMsg.text}</div>}

                  <div className="hp-tf-field">
                    <label className="hp-tf-lbl">Cuenta origen</label>
                    <div className="hp-orig-selector">
                      {(cuentas || []).map(c => (
                        <button key={c.codigo} className={`hp-orig-opt${tfOrigen===c.codigo?' sel':''}`} onClick={() => setTfOrigen(c.codigo)}>
                          <div className="hp-orig-opt-cod">{c.codigo}</div>
                          <div className="hp-orig-opt-saldo">{showAmt(c.saldo)}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="hp-tf-field">
                    <label className="hp-tf-lbl">Cuenta destino</label>
                    <input className="hp-tf-input" placeholder="Ej. AH-00002" value={tfDestino} onChange={e => setTfDestino(e.target.value.toUpperCase())} />
                    <div style={{ fontSize:10, color:'#9ca3af', marginTop:4 }}>Código de cuenta QAPAQ del destinatario</div>
                  </div>

                  <div className="hp-tf-field">
                    <label className="hp-tf-lbl">Monto (S/)</label>
                    <input className="hp-tf-input" type="number" min="1" step="0.01" placeholder="0.00" value={tfMonto} onChange={e => setTfMonto(e.target.value)} />
                  </div>

                  <div className="hp-tf-field">
                    <label className="hp-tf-lbl">Descripción (opcional)</label>
                    <input className="hp-tf-input" placeholder="Ej. Pago entre amigos" value={tfDesc} onChange={e => setTfDesc(e.target.value)} />
                  </div>

                  <button className="hp-tf-btn" onClick={hacerTf} disabled={tfLoading || !tfOrigen || !tfDestino || !tfMonto}>
                    {tfLoading ? '⏳ Procesando…' : '💸 Confirmar transferencia'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Modal movimientos con ojo propio ── */
function ModalMovimientos({ cuenta, movs, loading, onDetalle, loadMovs, onClose }) {
  const [vis, setVis] = useState(false)
  const showAmt = (v) => vis ? fmt(v) : '••••••'
  return (
    <>
      <div className="hp-sheet-hd">
        <span className="hp-sheet-title">🐷 {cuenta.codigo}</span>
        <button className="hp-sheet-close" onClick={onClose}>✕</button>
      </div>
      <div className="hp-sheet-body">
        <div style={{ textAlign:'center', marginBottom:18, paddingBottom:16, borderBottom:'1px solid #f0f2f8' }}>
          <div style={{ fontSize:10, color:'#9ca3af', marginBottom:3 }}>Saldo disponible</div>
          <div style={{ fontSize:26, fontWeight:900, color:'#0c1e3e', filter: vis ? 'none' : 'blur(7px)', transition:'filter .3s' }}>
            {vis ? fmt(cuenta.saldo) : '••••••'}
          </div>
          <div style={{ fontSize:10, color:'#9ca3af', marginTop:3 }}>{cuenta.tipo}</div>
          <button
            onClick={() => setVis(v => !v)}
            style={{ marginTop:10, background:'#f4f6fb', border:'1px solid #e5e7eb', borderRadius:20, padding:'5px 14px', cursor:'pointer', fontSize:11, fontWeight:700, color:'#374151', fontFamily:'inherit', display:'inline-flex', alignItems:'center', gap:5 }}
          >
            {vis ? '🙈 Ocultar saldos' : '👁 Ver saldos'}
          </button>
        </div>
        <MovLista
          codigo={cuenta.codigo} movs={movs} loading={loading}
          hidden={!vis} showAmt={showAmt}
          onDetalle={onDetalle} loadMovs={loadMovs}
        />
      </div>
    </>
  )
}

/* ── Tarjeta Ahorro con ojo propio ── */
function TarjetaAhorro({ cuenta, delay, onOpen }) {
  const [vis, setVis] = useState(false)  // oculto por defecto
  return (
    <div className="hp-prod-card ahorro hp-card-led"
      style={{ animationDelay: `${delay}s` }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div className="hp-prod-chip" />
        <button
          onClick={e => { e.stopPropagation(); setVis(v => !v) }}
          style={{ background:'rgba(255,255,255,.15)', border:'none', borderRadius:20, padding:'3px 10px', cursor:'pointer', fontSize:10, color:'#fff', fontWeight:700, fontFamily:'inherit', display:'flex', alignItems:'center', gap:4 }}
        >
          {vis ? '🙈' : '👁'} {vis ? 'Ocultar' : 'Ver'}
        </button>
      </div>
      <div className="hp-prod-lbl" style={{ marginTop: 8 }}>Saldo disponible</div>
      <div
        className={`hp-prod-amt${!vis ? ' masked' : ''}`}
        onClick={onOpen}
        style={{ cursor:'pointer' }}
      >
        {vis ? fmt(cuenta.saldo) : '••••••'}
      </div>
      <div className="hp-prod-footer" onClick={onOpen} style={{ cursor:'pointer' }}>
        <span className="hp-prod-codigo">{cuenta.codigo}</span>
        <span className="hp-prod-tipo ahorro">{cuenta.tipo}</span>
      </div>
    </div>
  )
}

/* ── Tarjeta Crédito con ojo propio ── */
function TarjetaCredito({ credito, delay, onOpen }) {
  const [vis, setVis] = useState(false)  // oculto por defecto
  return (
    <div className="hp-prod-card credito hp-card-led-credito"
      style={{ animationDelay: `${delay}s` }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div className={`hp-prod-estado${credito.estado === 'Mora' ? ' mora' : ' normal'}`}>{credito.estado}</div>
        <button
          onClick={e => { e.stopPropagation(); setVis(v => !v) }}
          style={{ background:'rgba(255,255,255,.15)', border:'none', borderRadius:20, padding:'3px 10px', cursor:'pointer', fontSize:10, color:'#fff', fontWeight:700, fontFamily:'inherit', display:'flex', alignItems:'center', gap:4 }}
        >
          {vis ? '🙈' : '👁'} {vis ? 'Ocultar' : 'Ver'}
        </button>
      </div>
      <div className="hp-prod-lbl" style={{ marginTop: 8 }}>Saldo pendiente</div>
      <div
        className={`hp-prod-amt${!vis ? ' masked' : ''}`}
        onClick={onOpen}
        style={{ cursor:'pointer' }}
      >
        {vis ? fmt(credito.saldo_pendiente) : '••••••'}
      </div>
      <div className="hp-prod-footer" onClick={onOpen} style={{ cursor:'pointer' }}>
        <span className="hp-prod-codigo">{credito.codigo}</span>
        <span className="hp-prod-tipo credito">{credito.tipo_credito}</span>
      </div>
    </div>
  )
}

/* ── Lista completa de movimientos ── */
function MovLista({ codigo, movs, loading, hidden, showAmt, onDetalle, loadMovs }) {
  useEffect(() => { loadMovs(codigo) }, [codigo])
  const lista = movs[codigo] || []
  if (loading[codigo]) return <div className="hp-loader">Cargando…</div>
  if (!lista.length)   return <div className="hp-empty">Sin movimientos registrados.</div>
  return (
    <div>
      {lista.map((m, i) => (
        <MovFila key={m.id || i} mov={m} hidden={hidden} showAmt={showAmt} onClick={() => onDetalle(m)} />
      ))}
    </div>
  )
}

/* ── Fila de movimiento ── */
function MovFila({ mov, hidden, showAmt, onClick }) {
  const desc  = mov.descripcion || mov.tipo || 'Movimiento'
  const monto = Math.abs(Number(mov.monto || mov.importe || 0))
  const fechaRaw = mov.fecha || mov.created_at || ''
  const fecha = (() => {
    try {
      const d = new Date(fechaRaw)
      if (isNaN(d.getTime())) return fechaRaw
      return d.toLocaleDateString('es-PE', { day:'2-digit', month:'short', year:'numeric' }) +
             ' · ' + d.toLocaleTimeString('es-PE', { hour:'2-digit', minute:'2-digit' })
    } catch { return fechaRaw }
  })()
  const { bg, color, sign } = tipoColor(desc)
  return (
    <div className="hp-mov-row" onClick={onClick}>
      <div className="hp-mov-ico" style={{ background:bg, color }}>{sign==='+' ? '⬆️' : sign==='-' ? '⬇️' : '↔️'}</div>
      <div className="hp-mov-info">
        <div className="hp-mov-desc">{desc}</div>
        <div className="hp-mov-date">{fecha}</div>
      </div>
      <div className={`hp-mov-amt${hidden ? ' masked' : ''}`} style={{ color }}>
        {hidden ? '••••••' : `${sign}${fmt(monto)}`}
      </div>
    </div>
  )
}
