import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiMap, FiCompass, FiClock, FiUser, FiLogOut, FiGrid,
  FiSettings, FiUsers, FiDollarSign, FiNavigation, FiMenu, FiX
} from 'react-icons/fi';
import { MdDirectionsBus } from 'react-icons/md';

export default function Layout() {
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { 
    setSidebarOpen(false);
    logout(); 
    navigate('/'); 
  };

  const userLinks = [
    { to: '/dashboard', icon: <FiGrid />, label: 'Dashboard' },
    { to: '/planner', icon: <FiCompass />, label: 'Route Planner' },
    { to: '/history', icon: <FiClock />, label: 'My History' },
    { to: '/profile', icon: <FiUser />, label: 'Profile' },
  ];

  const adminLinks = [
    { to: '/admin', icon: <FiGrid />, label: 'Admin Overview' },
    { to: '/admin/cities', icon: <FiMap />, label: 'Manage Cities' },
    { to: '/admin/fares', icon: <FiDollarSign />, label: 'Fare Rules' },
    { to: '/admin/routes', icon: <FiNavigation />, label: 'Route Edges' },
    { to: '/admin/users', icon: <FiUsers />, label: 'Users' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navbar */}
      <header className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-icon btn-secondary mobile-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
          <NavLink to="/" className="navbar-brand" onClick={() => setSidebarOpen(false)}>
            <MdDirectionsBus className="logo-icon" />
            <span>CityRoute</span>
          </NavLink>
        </div>

        {/* Desktop-only horizontal links */}
        <nav className="navbar-links desktop-only">
          <NavLink to="/planner" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <FiCompass size={15} /> Plan Route
          </NavLink>
          {isAuthenticated ? (
            <button onClick={handleLogout} className="nav-link btn">
              <FiLogOut size={15} /> Logout
            </button>
          ) : (
            <NavLink to="/login" className="nav-link">Login</NavLink>
          )}
        </nav>
      </header>

      <div className="app-layout" style={{ flex: 1 }}>
        {/* Unified Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-section">
            <div className="sidebar-label">Navigation</div>
            
            {/* Added Plan Route to sidebar for mobile visibility */}
            {/* <NavLink to="/planner" className="sidebar-link mobile-only" onClick={() => setSidebarOpen(false)}>
              <span className="icon"><FiCompass /></span> Plan Route
            </NavLink> */}

            {userLinks.map(link => (
              <NavLink key={link.to} to={link.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
                <span className="icon">{link.icon}</span> {link.label}
              </NavLink>
            ))}
          </div>

          {isAdmin && (
            <div className="sidebar-section">
              <div className="sidebar-label">Admin Panel</div>
              {adminLinks.map(link => (
                <NavLink key={link.to} to={link.to} end={link.to === '/admin'}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
                  <span className="icon">{link.icon}</span> {link.label}
                </NavLink>
              ))}
            </div>
          )}

          <div style={{ marginTop: 'auto' }}>
            {/* Logout button moved here for mobile users */}
            <div className="sidebar-section mobile-only">
               <button onClick={handleLogout} className="sidebar-link" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <span className="icon"><FiLogOut /></span> Logout
               </button>
            </div>

            {/* User info at bottom */}
            <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6, #14b8a6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 700, color: 'white', flexShrink: 0
                }}>
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.name}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {user?.role}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="main-content">
          <div className="page-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}