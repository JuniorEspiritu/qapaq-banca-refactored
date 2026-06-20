/* ─────────────────────────────────────────────────────────────
   RiskBadges — Semáforo visual premium + badges de scoring
───────────────────────────────────────────────────────────── */

// Semáforo físico de 3 luces — el componente principal
export function SemaforoBadge({ semaforo, rds, size = 'md' }) {
  const estado = semaforo || 'amarillo'
  const isVerde   = estado === 'verde'
  const isAmarillo = estado === 'amarillo'
  const isRojo    = estado === 'rojo'

  const labels = {
    verde:    { txt: 'Bajo riesgo',  sub: 'RDS dentro del límite', bg: '#f0fdf4', border: '#16a34a' },
    amarillo: { txt: 'Riesgo medio', sub: 'Revisar capacidad',      bg: '#fefce8', border: '#ca8a04' },
    rojo:     { txt: 'Alto riesgo',  sub: 'RDS supera el 40%',      bg: '#fef2f2', border: '#dc2626' },
  }
  const cfg = labels[estado]

  const dotSize = size === 'lg' ? 22 : size === 'sm' ? 10 : 14
  const gap     = size === 'lg' ? 8  : size === 'sm' ? 4  : 5

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      background: cfg.bg,
      border: `1.5px solid ${cfg.border}`,
      borderRadius: 12,
      padding: size === 'lg' ? '12px 16px' : '8px 12px',
      boxShadow: `0 2px 8px ${cfg.border}22`,
    }}>
      {/* Semáforo físico */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap,
        background: '#1a1a1a',
        borderRadius: dotSize,
        padding: `${gap + 2}px ${gap}px`,
        boxShadow: 'inset 0 1px 4px rgba(0,0,0,.5), 0 2px 6px rgba(0,0,0,.3)',
      }}>
        {/* Rojo */}
        <div style={{
          width: dotSize, height: dotSize,
          borderRadius: '50%',
          background: isRojo ? '#ef4444' : '#3a1a1a',
          boxShadow: isRojo ? `0 0 ${dotSize}px 4px rgba(239,68,68,.7), 0 0 4px rgba(239,68,68,.9)` : 'none',
          transition: 'all .3s ease',
        }} />
        {/* Amarillo */}
        <div style={{
          width: dotSize, height: dotSize,
          borderRadius: '50%',
          background: isAmarillo ? '#eab308' : '#2a2000',
          boxShadow: isAmarillo ? `0 0 ${dotSize}px 4px rgba(234,179,8,.7), 0 0 4px rgba(234,179,8,.9)` : 'none',
          transition: 'all .3s ease',
        }} />
        {/* Verde */}
        <div style={{
          width: dotSize, height: dotSize,
          borderRadius: '50%',
          background: isVerde ? '#22c55e' : '#0a2010',
          boxShadow: isVerde ? `0 0 ${dotSize}px 4px rgba(34,197,94,.7), 0 0 4px rgba(34,197,94,.9)` : 'none',
          transition: 'all .3s ease',
        }} />
      </div>

      {/* Texto */}
      <div>
        <div style={{
          fontSize: size === 'lg' ? 14 : 12,
          fontWeight: 700,
          color: cfg.border,
          letterSpacing: '.2px',
        }}>{cfg.txt}</div>
        {rds != null && (
          <div style={{ fontSize: 11, color: cfg.border, opacity: .8, marginTop: 1 }}>
            RDS: <strong>{typeof rds === 'number' ? rds.toFixed(1) : rds}%</strong>
          </div>
        )}
        {size !== 'sm' && (
          <div style={{ fontSize: 10.5, color: '#6b7280', marginTop: 2 }}>{cfg.sub}</div>
        )}
      </div>
    </div>
  )
}

// Badge de nivel de aprobación
export function NivelBadge({ nivel }) {
  if (!nivel) return null
  const cfg = nivel === 'comite'
    ? { bg: '#ede9fe', color: '#6d28d9', border: '#a78bfa', icon: '🏛️', label: 'Requiere Comité' }
    : { bg: '#e0f2fe', color: '#0369a1', border: '#7dd3fc', icon: '🧑‍💼', label: 'Nivel Asesor' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`,
      borderRadius: 20, padding: '3px 10px',
      fontSize: 11, fontWeight: 700,
    }}>
      {cfg.icon} {cfg.label}
    </span>
  )
}

// Badge de categoría de scoring
export function CategoriaBadge({ categoria, scoring }) {
  if (!categoria) return null
  const cfgs = {
    A: { bg: '#dcfce7', color: '#15803d', border: '#86efac', label: 'Excelente' },
    B: { bg: '#fef3c7', color: '#92400e', border: '#fcd34d', label: 'Aceptable' },
    C: { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5', label: 'Riesgo alto' },
  }
  const cfg = cfgs[categoria] || cfgs.B
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`,
      borderRadius: 20, padding: '4px 12px',
      fontSize: 11.5, fontWeight: 700,
    }}>
      Score {scoring} · Cat. <strong>{categoria}</strong> — {cfg.label}
    </span>
  )
}
