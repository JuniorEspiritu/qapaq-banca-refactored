import { Outlet } from 'react-router-dom'
import HBHeader from './HBHeader.jsx'

export default function HBLayout() {
  return (
    <div className="hb-wrap">
      <HBHeader />
      <div className="hb-main">
        <Outlet />
      </div>
    </div>
  )
}
