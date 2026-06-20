// ============================================================
// Lógica del Crédito Empresarial — Micro Micro (Financiera Qapaq)
// TEA 43.92% (sin seguro de desgravamen) — Microempresa (ME)
// TEA 40.92% (con seguro de desgravamen)  — Consumo (CO)
// Cuota fija (sistema francés)
// ============================================================

export const TEA_POR_TIPO = {
  Microempresa: 43.92,
  Consumo: 40.92,
}

export const LIMITES = {
  Microempresa: { montoMin: 500, montoMax: 30000, plazoMax: 36 },
  Consumo:      { montoMin: 500, montoMax: 25000, plazoMax: 24 },
}

export const RDS_MAXIMO = 0.40 // 40%

// ── Scoring / semáforo de riesgo (Criterio 2) ──────────────────────
// Banda de riesgo en función del RDS (cuota / ingreso neto).
// Como toda solicitud con RDS > 40% se rechaza en el origen, el rango
// útil de RDS aquí es 0–40%.
//   RDS ≤ 25%        → score alto  → categoría A → semáforo verde
//   25% < RDS ≤ 40%  → score medio → categoría B → semáforo amarillo
//   RDS > 40%        → (no debería llegar aquí) → categoría C → semáforo rojo
export function calcularScoring(rdsPorcentaje) {
  const score = Math.max(0, Math.round(100 - rdsPorcentaje * 1.5))
  let categoria, semaforo
  if (rdsPorcentaje <= 25) { categoria = 'A'; semaforo = 'verde' }
  else if (rdsPorcentaje <= 40) { categoria = 'B'; semaforo = 'amarillo' }
  else { categoria = 'C'; semaforo = 'rojo' }
  return { score, categoria, semaforo }
}

// ── Ruta de aprobación por montos (Criterio 2) ─────────────────────
// Replica una jerarquía típica: el asesor de negocios puede aprobar
// montos pequeños; montos mayores requieren la opinión/aprobación del
// Comité de Créditos (segundo nivel).
export const MONTO_LIMITE_ASESOR = 8000 // S/ — por encima, requiere comité

export function nivelAprobacionRequerido(monto) {
  return monto > MONTO_LIMITE_ASESOR ? 'comite' : 'asesor'
}

// ¿El usuario con este rol puede resolver (aprobar/rechazar) esta solicitud?
export function puedeResolver(rolUsuario, nivelRequerido) {
  if (rolUsuario === 'comite') return true // el comité resuelve cualquier monto
  return rolUsuario === nivelRequerido
}

// TEA (%) -> TEM (decimal)
export function teaToTem(teaPorcentaje) {
  return Math.pow(1 + teaPorcentaje / 100, 1 / 12) - 1
}

// Cuota fija (sistema francés)
export function calcCuota(monto, temDecimal, plazo) {
  if (temDecimal === 0) return monto / plazo
  const f = Math.pow(1 + temDecimal, plazo)
  return (monto * temDecimal * f) / (f - 1)
}

// Cronograma completo: capital, interés, saldo por cuota
export function generarCronograma(monto, teaPorcentaje, plazo, fechaDesembolso, diaPago = null) {
  const tem = teaToTem(teaPorcentaje)
  const cuota = round2(calcCuota(monto, tem, plazo))
  let saldo = monto
  const rows = []

  const [anio, mes, dia] = fechaDesembolso.split('-').map(Number)
  const diaBase = diaPago ? Number(diaPago) : dia

  for (let i = 1; i <= plazo; i++) {
    let mesVenc = mes - 1 + i
    let anioVenc = anio + Math.floor(mesVenc / 12)
    mesVenc = mesVenc % 12

    const ultimoDia = new Date(anioVenc, mesVenc + 1, 0).getDate()
    const diaVenc = Math.min(diaBase, ultimoDia)

    const fechaStr = `${anioVenc}-${String(mesVenc + 1).padStart(2,'0')}-${String(diaVenc).padStart(2,'0')}`

    const interes = round2(saldo * tem)
    let capital = round2(cuota - interes)
    if (i === plazo) capital = round2(saldo)
    saldo = round2(saldo - capital)
    rows.push({
      numero: i,
      fecha_pago: fechaStr,
      cuota,
      capital,
      interes,
      saldo: Math.max(saldo, 0),
    })
  }
  return { cuota, rows }
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

// Valida elegibilidad de una solicitud según reglas de negocio.
// Retorna { ok: true, ... } o { ok: false, motivo }
export function validarSolicitud({ tipoCredito, monto, plazo, ingresoNeto }) {
  const lim = LIMITES[tipoCredito]
  if (!lim) return { ok: false, motivo: 'Tipo de crédito fuera de alcance (solo Microempresa o Consumo).' }

  if (monto < lim.montoMin) return { ok: false, motivo: `El monto mínimo es S/ ${lim.montoMin}.` }
  if (monto > lim.montoMax) return { ok: false, motivo: `El monto máximo para ${tipoCredito} es S/ ${lim.montoMax.toLocaleString('es-PE')}.` }
  if (plazo > lim.plazoMax) return { ok: false, motivo: `El plazo máximo para ${tipoCredito} es ${lim.plazoMax} meses.` }
  if (plazo <= 0) return { ok: false, motivo: 'El plazo debe ser mayor a 0.' }
  if (ingresoNeto <= 0) return { ok: false, motivo: 'Ingresa tu ingreso neto mensual.' }

  const tea = TEA_POR_TIPO[tipoCredito]
  const tem = teaToTem(tea)
  const cuota = round2(calcCuota(monto, tem, plazo))
  const rds = cuota / ingresoNeto

  if (rds > RDS_MAXIMO) {
    return {
      ok: false,
      motivo: `Relación deuda/ingreso (RDS) = ${(rds * 100).toFixed(1)}%. El máximo permitido es ${(RDS_MAXIMO * 100).toFixed(0)}%. Reduce el monto o amplía el plazo.`,
    }
  }

  return {
    ok: true,
    tea,
    cuota,
    rds: round2(rds * 100),
    ...calcularScoring(round2(rds * 100)),
    nivelAprobacion: nivelAprobacionRequerido(monto),
  }
}
