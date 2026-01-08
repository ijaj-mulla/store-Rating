import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const navItems = {
  admin: [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Users', path: '/admin/users' },
    { label: 'Stores', path: '/admin/stores' },
  ],
  user: [
    { label: 'Dashboard', path: '/dashboard' },
  ],
  store_owner: [
    { label: 'Dashboard', path: '/store-owner' },
  ],
};

export function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const currentNavItems = navItems[user.role];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{ width: '180px', borderRight: '1px solid #ddd', padding: '16px', background: '#fafafa' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '20px' }}>StoreRate</div>
        
        <nav>
          {currentNavItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              style={{
                display: 'block',
                padding: '8px',
                marginBottom: '4px',
                textDecoration: 'none',
                color: location.pathname === item.path ? '#fff' : '#333',
                background: location.pathname === item.path ? '#555' : 'transparent',
              }}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ marginTop: '20px', borderTop: '1px solid #ddd', paddingTop: '16px' }}>
          <NavLink
            to="/change-password"
            style={{
              display: 'block',
              padding: '8px',
              marginBottom: '4px',
              textDecoration: 'none',
              color: location.pathname === '/change-password' ? '#fff' : '#333',
              background: location.pathname === '/change-password' ? '#555' : 'transparent',
            }}
          >
            Change Password
          </NavLink>
          <button
            onClick={handleLogout}
            style={{
              display: 'block',
              width: '100%',
              padding: '8px',
              textAlign: 'left',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: '#c00',
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1 }}>
        <div style={{ borderBottom: '1px solid #ddd', padding: '12px 20px', display: 'flex', justifyContent: 'flex-end' }}>
          <span>Logged in as: <strong>{user.name}</strong> ({user.role.replace('_', ' ')})</span>
        </div>
        <div style={{ padding: '20px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
