export default function GerenteDashboard() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Panel Gerencial</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Bienvenido, Gerente General — QAPAQ Financiera
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem'
      }}>
        <div style={{ background: '#fff8e1', padding: '1.5rem', borderRadius: '8px', border: '1px solid #ffd54f' }}>
          <h3 style={{ margin: 0, color: '#f57f17' }}>Clientes activos</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0.5rem 0' }}>2</p>
        </div>
        <div style={{ background: '#e8f5e9', padding: '1.5rem', borderRadius: '8px', border: '1px solid #a5d6a7' }}>
          <h3 style={{ margin: 0, color: '#2e7d32' }}>Créditos vigentes</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0.5rem 0' }}>2</p>
        </div>
        <div style={{ background: '#e3f2fd', padding: '1.5rem', borderRadius: '8px', border: '1px solid #90caf9' }}>
          <h3 style={{ margin: 0, color: '#1565c0' }}>Asesores</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0.5rem 0' }}>1</p>
        </div>
        <div style={{ background: '#fce4ec', padding: '1.5rem', borderRadius: '8px', border: '1px solid #f48fb1' }}>
          <h3 style={{ margin: 0, color: '#880e4f' }}>Comité</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0.5rem 0' }}>1</p>
        </div>
      </div>
    </div>
  )
}