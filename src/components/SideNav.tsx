import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './sidenav.css';

const SideNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Hamburger Menu Button */}
      <button className="hamburger" onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Sidebar */}
      <nav className={`sidenav ${isOpen ? 'open' : ''}`}>
        <div className="nav-header">
          <h3>Baby Tracker</h3>
        </div>
        
        <div className="nav-links">
          <NavLink to="/dashboard" onClick={() => setIsOpen(false)}>
            <span className="icon">📊</span>
            Dashboard
          </NavLink>
          
          <NavLink to="/profile" onClick={() => setIsOpen(false)}>
            <span className="icon">👶</span>
            Profile
          </NavLink>
          
          <NavLink to="/vaccines" onClick={() => setIsOpen(false)}>
            <span className="icon">💉</span>
            Vaccines
          </NavLink>
          
          <NavLink to="/appointments" onClick={() => setIsOpen(false)}>
            <span className="icon">🏥</span>
            Appointments
          </NavLink>
          
          <NavLink to="/bmi" onClick={() => setIsOpen(false)}>
            <span className="icon">📈</span>
            BMI
          </NavLink>
        </div>
      </nav>

      {/* Backdrop */}
      {isOpen && <div className="backdrop" onClick={toggleMenu} />}
    </>
  );
};

export default SideNav;


