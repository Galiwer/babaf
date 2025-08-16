import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { getProfile } from '../services/profileService'
import './sidebar.css'

type SidebarProps = {
  className?: string
}

function Sidebar({ className }: SidebarProps) {
  const profile = getProfile()
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        className="hamburger"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <span />
        <span />
        <span />
      </button>
      {open ? <div className="drawer-backdrop" onClick={() => setOpen(false)} /> : null}
      <nav className={['dash-nav', 'sidebar', open ? 'open' : '', className].filter(Boolean).join(' ')} aria-label="Primary">
      <div
        className="avatar"
        style={profile?.photoDataUrl ? { backgroundImage: `url(${profile.photoDataUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      />
      <ul className="menu">
        <li>
          <NavLink to="/dashboard" onClick={() => setOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Dashboard</NavLink>
        </li>
        <li>
          <NavLink to="/profile" onClick={() => setOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Profile</NavLink>
        </li>
        <li>
          <NavLink to="/bmi" onClick={() => setOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>BMI</NavLink>
        </li>
        <li>
          <NavLink to="/vaccines" onClick={() => setOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Vaccines</NavLink>
        </li>
      </ul>
      </nav>
    </>
  )
}

export default Sidebar


