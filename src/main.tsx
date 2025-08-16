import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Welcome from './pages/Welcome.tsx'
import Auth from './pages/Auth.tsx'
import Dashboard from './pages/Dashboard.tsx'
import Profile from './pages/Profile.tsx'
import Bmi from './pages/Bmi.tsx'
import Vaccines from './pages/Vaccines.tsx'
import Appointments from './pages/Appointments.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="auth" element={<Auth />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="bmi" element={<Bmi />} />
        <Route path="vaccines" element={<Vaccines />} />
        <Route path="appointments" element={<Appointments />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
