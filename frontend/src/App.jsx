import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import HBLayout from './components/HBLayout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import HomePage from './pages/cliente/HomePage.jsx'
import AhorrosPage from './pages/cliente/AhorrosPage.jsx'
import CreditosPage from './pages/cliente/CreditosPage.jsx'
import OperacionesPage from './pages/cliente/OperacionesPage.jsx'
import SolicitarCreditoPage from './pages/cliente/SolicitarCreditoPage.jsx'
import SimuladorPage from './pages/cliente/SimuladorPage.jsx'

import AsesorDashboard from './pages/asesor/AsesorDashboard.jsx'
import ResueltasPage from './pages/asesor/ResueltasPage.jsx'
import AsesorNuevaSolicitud from './pages/asesor/AsesorNuevaSolicitud.jsx'
import MoraPage from './pages/asesor/MoraPage.jsx'

import GerenteDashboard from './pages/gerente/GerenteDashboard.jsx'

export default function App() {
  return (
    <Routes>
      {/* Público */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Homebanking — cliente */}
      <Route path="/banca" element={
        <ProtectedRoute roles={['cliente']}><HBLayout /></ProtectedRoute>
      }>
        <Route index element={<HomePage />} />
        <Route path="ahorros" element={<AhorrosPage />} />
        <Route path="creditos" element={<CreditosPage />} />
        <Route path="operaciones" element={<OperacionesPage />} />
        <Route path="simulador" element={<SimuladorPage />} />
        <Route path="solicitar" element={<SolicitarCreditoPage />} />
      </Route>

      {/* Backoffice — asesor / comité */}
      <Route path="/asesor" element={
        <ProtectedRoute roles={['asesor', 'comite']}><HBLayout /></ProtectedRoute>
      }>
        <Route index element={<AsesorDashboard />} />
        <Route path="nueva-solicitud" element={<AsesorNuevaSolicitud />} />
        <Route path="aprobadas" element={<ResueltasPage />} />
        <Route path="mora" element={<MoraPage />} />
      </Route>

      {/* Panel Gerente */}
      <Route path="/gerente" element={
        <ProtectedRoute roles={['gerente']}><HBLayout /></ProtectedRoute>
      }>
        <Route index element={<GerenteDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}