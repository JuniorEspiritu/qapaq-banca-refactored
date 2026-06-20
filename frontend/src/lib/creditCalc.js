// Espejo (solo para preview en el frontend) de backend/src/creditCalc.js

export const TEA_POR_TIPO = {
  Microempresa: 43.92,
  Consumo: 40.92,
}

export const LIMITES = {
  Microempresa: { montoMin: 500, montoMax: 30000, plazoMax: 36 },
  Consumo:      { montoMin: 500, montoMax: 25000, plazoMax: 24 },
}

export const RDS_MAXIMO = 0.40

// Espejo de calcularScoring (backend)
export function calcularScoring(rdsPorcentaje) {
  const score = Math.max(0, Math.round(100 - rdsPorcentaje * 1.5))
  let categoria, semaforo
  if (rdsPorcentaje <= 25) { categoria = 'A'; semaforo = 'verde' }
  else if (rdsPorcentaje <= 40) { categoria = 'B'; semaforo = 'amarillo' }
  else { categoria = 'C'; semaforo = 'rojo' }
  return { score, categoria, semaforo }
}

// Espejo de la ruta de aprobación por montos
export const MONTO_LIMITE_ASESOR = 8000

export function nivelAprobacionRequerido(monto) {
  return monto > MONTO_LIMITE_ASESOR ? 'comite' : 'asesor'
}

export function teaToTem(teaPorcentaje) {
  return Math.pow(1 + teaPorcentaje / 100, 1 / 12) - 1
}

export function calcCuota(monto, temDecimal, plazo) {
  if (temDecimal === 0) return monto / plazo
  const f = Math.pow(1 + temDecimal, plazo)
  return (monto * temDecimal * f) / (f - 1)
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

// Cronograma completo (espejo del backend) — usado por el Simulador.
export function generarCronograma(monto, teaPorcentaje, plazo, fechaDesembolso, diaPago = null) {
  const tem = teaToTem(teaPorcentaje)
  const cuota = round2(calcCuota(monto, tem, plazo))
  let saldo = monto
  const rows = []

  const [anio, mes, dia] = fechaDesembolso.split('-').map(Number)
  // Si el usuario eligió un día de pago, usarlo; si no, usar el mismo día del desembolso
  const diaBase = diaPago ? Number(diaPago) : dia

  for (let i = 1; i <= plazo; i++) {
    let mesVenc = mes - 1 + i
    let anioVenc = anio + Math.floor(mesVenc / 12)
    mesVenc = mesVenc % 12

    // Respetar el día elegido; si no existe en ese mes, usar el último día
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
