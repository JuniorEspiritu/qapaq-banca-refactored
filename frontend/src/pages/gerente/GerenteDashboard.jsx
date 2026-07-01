import { useEffect, useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import * as api from '../../lib/api.js'

const BANDA_COLOR = {
  'Al día':     '#22c55e',
  Preventiva:   '#eab308',
  Temprana:     '#f97316',
  Tardía:       '#ef4444',
  Judicial:     '#db2777',
  Castigo:      '#64748b',
}

const SEMAFORO_COLOR = { verde: '#22c55e', amarillo: '#eab308', rojo: '#ef4444' }

function formatSoles(n) {
  return 'S/ ' + Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function KpiCard({ title, value, bg, border, color }) {
  return (
    <div style={{ background: bg, padding: '1.25rem 1.5rem', borderRadius: 10, border: `1px solid ${border}` }}>
      <h3 style={{ margin: 0, color, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px' }}>{title}</h3>
      <p style={{ fontSize: '1.9rem', fontWeight: 800, margin: '0.4rem 0 0', color: '#111827' }}>{value}</p>
    </div>
  )
}

export default function GerenteDashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getDashboardGerente()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: '2rem' }}>Cargando panel gerencial…</div>
  if (error) return <div style={{ padding: '2rem', color: '#b91c1c' }}>Error al cargar el dashboard: {error}</div>
  if (!data) return null

  const { kpis, distribucionBanda, carteraPorTipo, evolucionMensual, embudoSolicitudes } = data

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '0.25rem' }}>Panel Gerencial</h1>
      <p style={{ color: '#666', marginBottom: '1.75rem' }}>
        Bienvenido, Gerente General — QAPAQ Financiera
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <KpiCard title="Cartera colocada" value={formatSoles(kpis.carteraTotal)} bg="#e3f2fd" border="#90caf9" color="#1565c0" />
        <KpiCard title="Cartera atrasada" value={formatSoles(kpis.carteraAtrasada)} bg="#fce4ec" border="#f48fb1" color="#880e4f" />
        <KpiCard title="Clientes activos" value={kpis.clientesActivos} bg="#fff8e1" border="#ffd54f" color="#f57f17" />
        <KpiCard title="Créditos vigentes" value={kpis.creditosVigentes} bg="#e8f5e9" border="#a5d6a7" color="#2e7d32" />
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ marginTop: 0 }}>Ratio de mora — semáforo SBS</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{
            width: 110, height: 110, borderRadius: '50%',
            border: `10px solid ${SEMAFORO_COLOR[kpis.semaforoMora]}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 800, color: SEMAFORO_COLOR[kpis.semaforoMora],
          }}>
            {kpis.ratioMora}%
          </div>
          <div style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.6 }}>
            <div><span style={{ color: '#22c55e', fontWeight: 700 }}>● Verde</span> ≤ 4% — cartera sana</div>
            <div><span style={{ color: '#eab308', fontWeight: 700 }}>● Amarillo</span> 4% – 8% — atención</div>
            <div><span style={{ color: '#ef4444', fontWeight: 700 }}>● Rojo</span> &gt; 8% — riesgo alto</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.5rem' }}>
          <h3 style={{ marginTop: 0 }}>Cartera por banda de mora</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={distribucionBanda} dataKey="saldo" nameKey="banda" outerRadius={90} label={({ banda }) => banda}>
                {distribucionBanda.map((d, i) => (
                  <Cell key={i} fill={BANDA_COLOR[d.banda] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatSoles(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.5rem' }}>
          <h3 style={{ marginTop: 0 }}>Cartera por tipo de crédito</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={carteraPorTipo}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tipo" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatSoles(v)} />
              <Bar dataKey="monto" fill="#1565c0" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.5rem' }}>
          <h3 style={{ marginTop: 0 }}>Evolución mensual de desembolsos</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={evolucionMensual}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatSoles(v)} />
              <Legend />
              <Line type="monotone" dataKey="monto" name="Monto colocado" stroke="#2e7d32" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1.5rem' }}>
          <h3 style={{ marginTop: 0 }}>Embudo de solicitudes</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={embudoSolicitudes} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="estado" width={110} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="cantidad" fill="#f57f17" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}