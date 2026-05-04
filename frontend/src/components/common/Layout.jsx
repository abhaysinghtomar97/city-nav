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
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

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
      <nav className="navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn btn-icon btn-secondary mobile-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
          <NavLink to="/" className="navbar-brand">
            <MdDirectionsBus className="logo-icon" />
            <span>CityRoute</span>
          </NavLink>
        </div>
        <div className={`navbar-links ${sidebarOpen ? 'open' : ''}`}>
          <NavLink to="/planner" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <FiCompass size={15} /> Plan Route
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                <FiGrid size={15} /> Dashboard
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                  <FiSettings size={15} /> Admin
                </NavLink>
              )}
              <button onClick={handleLogout} className="nav-link btn">
                <FiLogOut size={15} /> Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Login</NavLink>
              <NavLink to="/register" className="nav-link btn-primary">Sign Up</NavLink>
            </>
          )}
        </div>
      </nav>

      <div className="app-layout" style={{ flex: 1 }}>
        {/* Sidebar - only for authenticated users */}
        {isAuthenticated && (
          <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-section">
              <div className="sidebar-label">Navigation</div>
              {userLinks.map(link => (
                <NavLink key={link.to} to={link.to}
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
                    className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
                    <span className="icon">{link.icon}</span> {link.label}
                  </NavLink>
                ))}
              </div>
            )}
            {/* User info at bottom */}
            <div style={{ marginTop: 'auto', padding: '0.75rem', borderTop: '1px solid var(--border)' }}>
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
          </aside>
        )}

        {/* Main content */}
        <div className="main-content">
          <div className="page-content">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}