import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1400&q=85',
    tag: 'Junio 2026',
    titleRed: 'VALORAMOS',
    titleWhite: 'TU COMPROMISO',
    sub: 'Si eres cliente GNV y cumpliste con el pago de tus cuotas, participas automáticamente del sorteo.',
    chip: 'GANA HASTA\nS/ 1,000',
    chipColor: '#dc2626',
  },
  {
    img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1400&q=85',
    tag: 'Cuenta Digital',
    titleRed: 'ABRE TU',
    titleWhite: 'CUENTA DIGITAL',
    sub: 'Abre tu cuenta 100% digital con la mejor tasa del mercado peruano. Sin salir de casa.',
    chip: null,
  },
  {
    img: 'https://images.unsplash.com/photo-1664575602554-2087b04935a5?auto=format&fit=crop&w=1400&q=85',
    tag: 'Crédito Empresarial',
    titleRed: 'IMPULSA',
    titleWhite: 'TU NEGOCIO',
    sub: 'Microcréditos para tu negocio con aprobación rápida y cuotas a tu medida.',
    chip: 'DESDE\nS/ 500',
    chipColor: '#1a3a6b',
  },
  {
    img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1400&q=85',
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

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', -apple-system, sans-serif; }

  /* ── TOPBAR ── */
  .q-top {
    background: #f5c800;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    position: sticky;
    top: 0;
    z-index: 500;
    box-shadow: 0 2px 8px rgba(0,0,0,.08);
  }
  .q-brand { display: flex; flex-direction: column; line-height: 1; }
  .q-brand-name { font-size: 24px; font-weight: 900; color: #111; letter-spacing: 1px; }
  .q-brand-sub  { font-size: 9px; color: #dc2626; font-style: italic; font-weight: 700; }

  /* Botón "Abrir cuenta" — siempre visible en móvil */
  .q-top-cta-mobile {
    background: #16a34a;
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    padding: 9px 14px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    font-family: inherit;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  /* Botones de acción — ocultos en móvil, visibles en desktop */
  .q-top-actions {
    display: none;
    gap: 8px;
    align-items: center;
  }
  .q-top-btn {
    font-size: 12px; font-weight: 700;
    padding: 9px 16px; border-radius: 5px;
    border: none; cursor: pointer;
    display: flex; align-items: center; gap: 5px;
    font-family: inherit;
    transition: opacity .15s, transform .12s;
    white-space: nowrap;
  }
  .q-top-btn:hover { opacity: .88; transform: translateY(-1px); }
  .q-btn-gray  { background: #374151; color: #fff; }
  .q-btn-green { background: #16a34a; color: #fff; }
  .q-btn-red   { background: #dc2626; color: #fff; }

  /* Botón hamburger — solo en móvil */
  .q-hamburger {
    display: flex;
    flex-direction: column;
    gap: 5px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 6px;
    border-radius: 6px;
    transition: background .15s;
  }
  .q-hamburger:hover { background: rgba(0,0,0,.08); }
  .q-hamburger span {
    display: block;
    width: 24px; height: 2.5px;
    background: #111;
    border-radius: 2px;
    transition: transform .25s, opacity .25s;
  }
  .q-hamburger.open span:nth-child(1) { transform: translateY(7.5px) rotate(45deg); }
  .q-hamburger.open span:nth-child(2) { opacity: 0; }
  .q-hamburger.open span:nth-child(3) { transform: translateY(-7.5px) rotate(-45deg); }

  /* ── MENÚ MÓVIL ── */
  .q-mobile-menu {
    display: none;
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: #fff;
    z-index: 400;
    overflow-y: auto;
    padding-top: 64px;
    flex-direction: column;
  }
  .q-mobile-menu.open { display: flex; }

  .q-mobile-ctas {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 16px;
    background: #f5c800;
  }
  .q-mobile-cta {
    font-size: 14px; font-weight: 700;
    padding: 13px 16px; border-radius: 8px;
    border: none; cursor: pointer;
    font-family: inherit;
    text-align: left;
    display: flex; align-items: center; gap: 8px;
  }

  .q-mobile-nav { flex: 1; }
  .q-mobile-nav-item { border-bottom: 1px solid #f3f4f6; }
  .q-mobile-nav-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 15px 20px;
    cursor: pointer;
    font-size: 14px; font-weight: 700; color: #111;
    background: none; border: none; width: 100%;
    font-family: inherit; text-align: left;
  }
  .q-mobile-nav-header:hover { background: #fef9c3; }
  .q-mobile-nav-arrow { font-size: 12px; transition: transform .2s; color: #9ca3af; }
  .q-mobile-nav-arrow.open { transform: rotate(180deg); }
  .q-mobile-subnav { display: none; background: #f9fafb; }
  .q-mobile-subnav.open { display: block; }
  .q-mobile-subnav a {
    display: block; padding: 11px 32px;
    font-size: 13px; color: #374151;
    text-decoration: none;
    border-bottom: 1px solid #f3f4f6;
    transition: color .1s, background .1s;
  }
  .q-mobile-subnav a:hover { color: #d97706; background: #fffbeb; }

  /* ── NAVBAR DESKTOP ── */
  .q-nav-desktop {
    display: none;
    background: #fff;
    border-bottom: 1px solid #e5e7eb;
    box-shadow: 0 1px 6px rgba(0,0,0,.06);
  }
  .q-nav-inner {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
  }
  .q-nav-item { position: relative; }
  .q-nav-link {
    display: flex; align-items: center;
    color: #1a2a45; font-size: 11.5px;
    font-weight: 700;
    padding: 15px 11px;
    cursor: pointer;
    white-space: nowrap;
    text-transform: uppercase;
    letter-spacing: .3px;
    border-bottom: 2px solid transparent;
    transition: color .15s, border-color .15s;
    user-select: none;
  }
  .q-nav-item:hover .q-nav-link { color: #d97706; border-bottom-color: #d97706; }
  .q-nav-item:hover .q-drop { display: block; }
  .q-drop {
    display: none;
    position: absolute; top: 100%; left: 0;
    background: #fff; min-width: 200px;
    z-index: 400;
    border-top: 2px solid #d97706;
    box-shadow: 0 8px 28px rgba(0,0,0,.12);
    border-radius: 0 0 8px 8px;
  }
  .q-drop a {
    display: block; color: #374151;
    font-size: 12.5px; padding: 10px 16px;
    text-decoration: none; font-weight: 500;
    transition: background .1s, color .1s;
  }
  .q-drop a:hover { background: #fef9c3; color: #d97706; }

  /* ── HERO ── */
  .q-hero {
    position: relative;
    width: 100%;
    /* Móvil: aspecto más cuadrado para que el texto quepa bien */
    aspect-ratio: 4/3;
    min-height: 240px;
    max-height: 360px;
    overflow: hidden;
    background: #d4a000;
  }
  .q-hero-img {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: cover; object-position: center right;
    transition: opacity .35s ease, transform .6s ease;
  }
  .q-hero-img.in  { opacity: 1; transform: scale(1.02); }
  .q-hero-img.out { opacity: 0; transform: scale(1); }

  /* Overlay más oscuro en móvil para que el texto sea legible */
  .q-hero-ov {
    position: absolute; inset: 0;
    background: linear-gradient(
      105deg,
      rgba(245,200,0,.97) 0%,
      rgba(245,200,0,.95) 35%,
      rgba(245,200,0,.75) 55%,
      rgba(245,200,0,.2)  75%,
      rgba(245,200,0,0)  100%
    );
  }

  .q-hero-body {
    position: absolute; inset: 0;
    display: flex; align-items: center;
    justify-content: space-between;
    padding: 0 20px;
  }
  .q-hero-left {
    flex: 1; min-width: 0;
    max-width: 100%; /* ocupa todo en móvil */
    transition: opacity .3s ease, transform .3s ease;
  }
  .q-hero-left.in  { opacity: 1; transform: translateX(0); }
  .q-hero-left.out { opacity: 0; transform: translateX(-16px); }

  .q-hero-tag {
    display: inline-block; background: #fff;
    color: #dc2626; font-size: 9px; font-weight: 800;
    padding: 3px 10px; border-radius: 20px;
    margin-bottom: 10px; letter-spacing: 1px; text-transform: uppercase;
  }
  .q-title-red {
    display: inline-block; background: #dc2626;
    color: #fff; font-size: clamp(20px, 6vw, 58px);
    font-weight: 900;
    padding: 3px 10px; border-radius: 4px;
    letter-spacing: -1px; line-height: 1.05; margin-bottom: 5px;
  }
  .q-title-white {
    display: inline-block; background: #fff;
    color: #dc2626; font-size: clamp(18px, 5.5vw, 52px);
    font-weight: 900;
    padding: 3px 10px; border-radius: 4px;
    letter-spacing: -.5px; line-height: 1.05;
  }
  .q-hero-sub {
    font-size: clamp(10px, 2.8vw, 15px);
    color: #111; line-height: 1.6;
    max-width: 38ch;
    margin: 10px 0 14px;
  }
  .q-hero-btns { display: flex; gap: 8px; flex-wrap: wrap; }
  .q-hbtn-solid {
    background: #d97706; color: #fff;
    font-size: clamp(11px, 2.5vw, 14px); font-weight: 700;
    padding: 9px 18px; border-radius: 6px;
    border: none; cursor: pointer; font-family: inherit;
    transition: transform .15s, box-shadow .15s;
  }
  .q-hbtn-solid:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(217,119,6,.4); }
  .q-hbtn-outline {
    background: transparent; color: #1a2a45;
    font-size: clamp(11px, 2.5vw, 14px); font-weight: 700;
    padding: 9px 18px; border-radius: 6px;
    border: 2px solid #1a2a45; cursor: pointer;
    font-family: inherit; transition: background .15s, transform .15s;
  }
  .q-hbtn-outline:hover { background: rgba(0,0,0,.07); transform: translateY(-2px); }

  .q-chip {
    background: #dc2626; color: #fff;
    font-size: clamp(13px, 3.5vw, 28px); font-weight: 900;
    padding: 14px 18px; border-radius: 12px;
    text-align: center;
    box-shadow: 0 10px 32px rgba(220,38,38,.4);
    flex-shrink: 0;
    animation: chipPulse 2.4s ease-in-out infinite;
    line-height: 1.3;
    /* oculto en móvil */
    display: none;
  }
  @keyframes chipPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }

  .q-dots {
    position: absolute; bottom: 12px; left: 50%;
    transform: translateX(-50%);
    display: flex; gap: 6px; z-index: 3;
  }
  .q-dot {
    height: 8px; border-radius: 5px;
    background: rgba(255,255,255,.5);
    border: none; cursor: pointer;
    transition: all .3s ease;
  }
  .q-dot.on { background: #dc2626; }

  /* ── QUICK ACCESS ── */
  .q-quick {
    background: #f3f4f6;
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  .q-quick-label {
    display: flex; align-items: center; gap: 8px;
  }
  .q-quick-cards {
    display: flex; gap: 8px;
    flex-wrap: nowrap;
    overflow-x: auto;
    width: 100%;
    padding-bottom: 4px;
    /* scroll suave en móvil */
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .q-quick-cards::-webkit-scrollbar { display: none; }
  .q-qcard {
    background: #fff;
    border: 1.5px solid #f5c800;
    border-top: 3px solid #f5c800;
    border-radius: 8px;
    padding: 12px 14px;
    cursor: pointer; text-align: center;
    min-width: 90px;
    flex-shrink: 0;
    display: flex; flex-direction: column;
    align-items: center; gap: 2px;
    font-family: inherit;
    transition: transform .18s, box-shadow .18s;
  }
  .q-qcard:hover { transform: translateY(-3px); box-shadow: 0 6px 18px rgba(0,0,0,.1); }
  .q-qcard-ico { font-size: 22px; margin-bottom: 2px; }
  .q-qcard-t1  { font-size: 9px; color: #6b7280; }
  .q-qcard-t2  { font-size: 10px; font-weight: 800; color: #111; }
  .q-qcard-t3  { font-size: 9px; color: #d97706; font-weight: 700; }

  /* ── STATS ── */
  .q-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border-bottom: 1px solid #e5e7eb;
    background: #fff;
  }
  .q-stat {
    text-align: center;
    padding: 18px 12px;
    border-right: 1px solid #e5e7eb;
    border-bottom: 1px solid #e5e7eb;
  }
  .q-stat:nth-child(even) { border-right: none; }
  .q-stat:nth-last-child(-n+2) { border-bottom: none; }
  .q-stat-num { font-size: 24px; font-weight: 900; color: #d97706; margin-bottom: 3px; }
  .q-stat-lbl { font-size: 11px; color: #6b7280; font-weight: 500; }

  /* ── SECTIONS ── */
  .q-section { padding: 28px 16px; }
  .q-sec-title { font-size: 18px; font-weight: 800; color: #111; margin-bottom: 4px; }
  .q-sec-sub   { font-size: 12px; color: #6b7280; margin-bottom: 18px; }

  /* ── PRODUCT CARDS ── */
  .q-pgrid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .q-pcard {
    background: #fff; border-radius: 10px;
    border: 1px solid #e5e7eb; overflow: hidden;
    cursor: pointer;
    transition: transform .22s cubic-bezier(.22,1,.36,1), box-shadow .22s;
  }
  .q-pcard:hover { transform: translateY(-5px); box-shadow: 0 14px 36px rgba(0,0,0,.12); }
  .q-pcard-hd {
    height: 60px; display: flex;
    align-items: center; justify-content: center;
    font-size: 26px;
    transition: transform .22s;
  }
  .q-pcard:hover .q-pcard-hd { transform: scale(1.1); }
  .q-pcard-bd { padding: 10px 12px; }
  .q-pcard-title { font-size: 11.5px; font-weight: 700; color: #1a2a45; margin-bottom: 4px; }
  .q-pcard-desc  { font-size: 10px; color: #6b7280; line-height: 1.5; display: none; }
  .q-pcard-link  { display: inline-flex; align-items: center; gap: 3px; margin-top: 6px; font-size: 11px; font-weight: 700; color: #d97706; }

  /* ── QAMBIOS ── */
  .q-qgrid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .q-qtipo {
    background: #fff; border: 1px solid #e5e7eb;
    border-radius: 10px; padding: 16px;
    text-align: center;
    transition: transform .2s, box-shadow .2s;
  }
  .q-qtipo:hover { transform: translateY(-3px); box-shadow: 0 8px 22px rgba(0,0,0,.08); }
  .q-qtipo-lbl { font-size: 11px; color: #6b7280; margin-bottom: 5px; }
  .q-qtipo-val { font-size: 26px; font-weight: 900; }

  /* ── BANNER ── */
  .q-banner {
    background: linear-gradient(118deg, #1a3a6b 0%, #1e52a8 100%);
    padding: 22px 16px;
    display: flex; flex-direction: column;
    gap: 14px;
  }
  .q-banner-title { color: #fff; font-size: 15px; font-weight: 700; margin-bottom: 3px; }
  .q-banner-sub   { color: rgba(255,255,255,.75); font-size: 12px; }
  .q-banner-btn   {
    background: #f5c800; color: #111;
    font-size: 13px; font-weight: 800;
    padding: 12px 20px; border-radius: 6px;
    border: none; cursor: pointer;
    font-family: inherit; text-align: center;
    transition: opacity .15s, transform .12s;
    align-self: flex-start;
  }
  .q-banner-btn:hover { opacity: .9; transform: translateY(-2px); }

  /* ── FOOTER ── */
  .q-footer { background: #0f2447; color: #c8d8f0; padding: 28px 16px 16px; }
  .q-fgrid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
  }
  .q-fcol h4 { color: #f5c800; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 10px; }
  .q-fcol a  { display: block; color: #94a9c9; font-size: 11.5px; text-decoration: none; margin-bottom: 6px; }
  .q-fcol a:hover { color: #fff; }
  .q-flogo { width: 28px; height: 28px; background: #fff; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 13px; color: #1a2a45; }
  .q-libro {
    display: inline-flex; align-items: center; gap: 5px;
    background: #dc2626; color: #fff; font-size: 11px;
    font-weight: 700; padding: 7px 12px; border-radius: 5px;
    border: none; cursor: pointer; margin-top: 10px;
    font-family: inherit;
  }
  .q-fbot { border-top: 1px solid rgba(255,255,255,.08); padding-top: 14px; text-align: center; font-size: 11px; color: #475569; }
  .q-divider { border: none; border-top: 1px solid #e5e7eb; }

  /* ══════════════════════════════
     DESKTOP — ≥ 768px
  ══════════════════════════════ */
  @media (min-width: 768px) {
    /* Topbar */
    .q-top { padding: 10px 32px; }
    .q-top-actions     { display: flex; }
    .q-hamburger       { display: none; }
    .q-top-cta-mobile  { display: none; }

    /* Navbar desktop visible */
    .q-nav-desktop { display: block; }

    /* Hero más ancho */
    .q-hero {
      aspect-ratio: 16/5.5;
      min-height: 220px;
      max-height: 520px;
    }
    .q-hero-body { padding: 0 5vw; }
    .q-hero-left { max-width: 52%; }
    .q-hero-ov {
      background: linear-gradient(
        105deg,
        rgba(245,200,0,.97) 0%,
        rgba(245,200,0,.92) 30%,
        rgba(245,200,0,.65) 52%,
        rgba(245,200,0,.15) 72%,
        rgba(245,200,0,0)  100%
      );
    }
    .q-chip { display: block; }

    /* Quick: en fila */
    .q-quick {
      flex-direction: row;
      justify-content: center;
      padding: 20px 32px;
    }
    .q-quick-cards { flex-wrap: wrap; overflow-x: visible; width: auto; }
    .q-qcard { min-width: 100px; }
    .q-qcard-ico { font-size: 26px; }
    .q-qcard-t1  { font-size: 10px; }
    .q-qcard-t2  { font-size: 11.5px; }

    /* Stats: en fila */
    .q-stats {
      display: flex;
      justify-content: center;
    }
    .q-stat { border-right: 1px solid #e5e7eb; border-bottom: none; padding: 22px 40px; }
    .q-stat:last-child { border-right: none; }

    /* Sections */
    .q-section { padding: 40px 32px; max-width: 1120px; margin: 0 auto; }
    .q-sec-title { font-size: 22px; }
    .q-sec-sub   { font-size: 13px; }

    /* Productos: 3 col */
    .q-pgrid { grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .q-pcard-hd   { height: 80px; font-size: 34px; }
    .q-pcard-bd   { padding: 14px 16px; }
    .q-pcard-title { font-size: 13px; }
    .q-pcard-desc  { display: block; font-size: 11px; }
    .q-pcard-link  { font-size: 12px; }

    /* Qambios: 4 col */
    .q-qgrid { grid-template-columns: repeat(4, 1fr); gap: 16px; }

    /* Banner: en fila */
    .q-banner { flex-direction: row; align-items: center; justify-content: space-between; padding: 24px 40px; }

    /* Footer: 4 col */
    .q-fgrid { grid-template-columns: repeat(4, 1fr); gap: 24px; }
  }

  @media (min-width: 1024px) {
    .q-top { padding: 12px 5vw; }
    .q-brand-name { font-size: 28px; }
  }
`

export default function LandingPage() {
  const navigate = useNavigate()
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [openSub, setOpenSub] = useState(null)
  const timer = useRef(null)

  const go = () => { setMenuOpen(false); navigate('/login') }

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

  // Cerrar menú al resize a desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMenuOpen(false) }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  // Bloquear scroll cuando menú abierto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const goTo = (i) => { changeSlide(i); startTimer() }
  const s = SLIDES[idx]

  return (
    <>
      <style>{CSS}</style>

      {/* ── TOPBAR ── */}
      <div className="q-top">
        <div className="q-brand">
          <span className="q-brand-name">QAPAQ</span>
          <span className="q-brand-sub">una financiera solidaria</span>
        </div>

        {/* Botones desktop */}
        <div className="q-top-actions">
          <button className="q-top-btn q-btn-gray"  onClick={go}>🔒 Qapaq por INTERNET</button>
          <button className="q-top-btn q-btn-green" onClick={go}>👤 Abre tu CUENTA</button>
          <button className="q-top-btn q-btn-red"   onClick={go}>💰 Solicita tu PRÉSTAMO</button>
        </div>

        {/* Botón visible siempre en móvil */}
        <button className="q-top-cta-mobile" onClick={go}>
          👤 Abrir cuenta
        </button>

        {/* Hamburger móvil */}
        <button
          className={`q-hamburger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Abrir menú"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* ── MENÚ MÓVIL DESPLEGABLE ── */}
      <div className={`q-mobile-menu${menuOpen ? ' open' : ''}`}>
        {/* CTAs en móvil */}
        <div className="q-mobile-ctas">
          <button className="q-mobile-cta q-btn-gray"  onClick={go}>🔒 Qapaq por INTERNET</button>
          <button className="q-mobile-cta q-btn-green" onClick={go}>👤 Abre tu CUENTA</button>
          <button className="q-mobile-cta q-btn-red"   onClick={go}>💰 Solicita tu PRÉSTAMO</button>
        </div>

        {/* Links de navegación */}
        <nav className="q-mobile-nav">
          {NAV.map(([label, subs]) => (
            <div className="q-mobile-nav-item" key={label}>
              <button
                className="q-mobile-nav-header"
                onClick={() => {
                  if (subs.length === 0) { go(); return }
                  setOpenSub(v => v === label ? null : label)
                }}
              >
                {label}
                {subs.length > 0 && (
                  <span className={`q-mobile-nav-arrow${openSub === label ? ' open' : ''}`}>▼</span>
                )}
              </button>
              {subs.length > 0 && (
                <div className={`q-mobile-subnav${openSub === label ? ' open' : ''}`}>
                  {subs.map(s2 => (
                    <a key={s2} href="#" onClick={e => { e.preventDefault(); go() }}>{s2}</a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* ── NAVBAR DESKTOP ── */}
      <nav className="q-nav-desktop">
        <div className="q-nav-inner">
          {NAV.map(([label, subs]) => (
            <div className="q-nav-item" key={label}>
              <span className="q-nav-link">
                {label}{subs.length > 0 && ' ▾'}
              </span>
              {subs.length > 0 && (
                <div className="q-drop">
                  {subs.map(s2 => (
                    <a key={s2} href="#" onClick={e => { e.preventDefault(); go() }}>{s2}</a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* ── HERO ── */}
      <div className="q-hero">
        <img
          className={`q-hero-img ${visible ? 'in' : 'out'}`}
          src={s.img} alt="" key={idx}
        />
        <div className="q-hero-ov" />
        <div className="q-hero-body">
          <div className={`q-hero-left ${visible ? 'in' : 'out'}`}>
            {s.tag && <div className="q-hero-tag">{s.tag}</div>}
            <div style={{ display:'flex', flexDirection:'column', gap: 4, marginBottom: 10 }}>
              <div className="q-title-red">{s.titleRed}</div>
              <div className="q-title-white">{s.titleWhite}</div>
            </div>
            <p className="q-hero-sub">{s.sub}</p>
            <div className="q-hero-btns">
              <button className="q-hbtn-solid"   onClick={go}>Conocer más</button>
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
            <button key={i}
              className={`q-dot${i === idx ? ' on' : ''}`}
              style={{ width: i === idx ? 24 : 8 }}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      </div>

      {/* ── QUICK ACCESS ── */}
      <div className="q-quick">
        <div className="q-quick-label">
          <span style={{ fontSize: 28 }}>💡</span>
          <div>
            <div style={{ fontSize: 11, color: '#374151' }}>Todo lo que</div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#111' }}>NECESITAS</div>
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
        {[['30+','Años de experiencia'],['60+','Agencias nacionales'],['+200k','Clientes satisfechos'],['A+','Calificación SBS']].map(([n,l]) => (
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
          {PRODUCTOS.map(p => (
            <div key={p.title} className="q-pcard" onClick={go}>
              <div className="q-pcard-hd" style={{ background: p.bg }}>{p.ico}</div>
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
              <div className="q-qtipo-val" style={{ color: c }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <hr className="q-divider" />

      {/* ── BANNER APP ── */}
      <div className="q-banner">
        <div>
          <div className="q-banner-title">App Qapaq Móvil — Banca desde tu celular</div>
          <div className="q-banner-sub">Transferencias, saldos y pago de cuotas. iOS y Android.</div>
        </div>
        <button className="q-banner-btn" onClick={go}>Descargar App</button>
      </div>

      {/* ── FOOTER ── */}
      <footer className="q-footer">
        <div className="q-fgrid">
          <div className="q-fcol" style={{ gridColumn: 'span 2' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
              <div className="q-flogo">Q</div>
              <span style={{ fontWeight:900, fontSize:15, color:'#fff', letterSpacing:1 }}>QAPAQ</span>
            </div>
            <p style={{ fontSize:12, color:'#64748b', lineHeight:1.7 }}>
              Financiera QAPAQ S.A.<br/>RUC: 20521308321<br/>Regulado por la SBS
            </p>
            <button className="q-libro">📚 Libro de Reclamaciones</button>
          </div>
          {[
            ['Qapaq',['Conócenos','Ubícanos','Trabaja con Nosotros']],
            ['Información',['Términos','Protección de Datos','Guía para el Cliente']],
          ].map(([t,ls]) => (
            <div key={t} className="q-fcol">
              <h4>{t}</h4>
              {ls.map(l => <a key={l} href="#">{l}</a>)}
            </div>
          ))}
        </div>
        <div className="q-fbot">© Financiera QAPAQ S.A. | Todos los derechos reservados 2026</div>
      </footer>
    </>
  )
}
