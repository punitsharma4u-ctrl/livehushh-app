import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const NAV = [
  { to: '/admin/dashboard',    icon: '📊', label: 'Dashboard' },
  { to: '/admin/restaurants',  icon: '🍽', label: 'Restaurants' },
  { to: '/admin/subscriptions',icon: '💳', label: 'Subscriptions' },
  { to: '/admin/users',        icon: '👥', label: 'Users' },
];

export default function AdminLayout() {
  const { setUserRole } = useApp();
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', minHeight: '100vh', background: 'var(--white)', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        background: 'var(--white)', borderBottom: '0.5px solid var(--border)',
        padding: '12px 24px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>live<span style={{ color: 'var(--orange)' }}>hushh.</span> <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>Admin</span></div>
          <div style={{ display: 'flex', gap: 4 }}>
            {NAV.map(item => (
              <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 8, textDecoration: 'none',
                fontSize: 13, fontWeight: 500,
                background: isActive ? 'var(--orange-pale)' : 'transparent',
                color: isActive ? 'var(--orange)' : 'var(--text-muted)',
              })}>
                <span>{item.icon}</span>{item.label}
              </NavLink>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--orange-pale)', border: '0.5px solid var(--orange-border)', color: 'var(--orange)', fontSize: 11, padding: '3px 10px', borderRadius: 999 }}>✦ AI insights on</span>
          <select
            onChange={e => { setUserRole(e.target.value); if (e.target.value === 'customer') navigate('/'); if (e.target.value === 'owner') navigate('/owner'); }}
            defaultValue="admin"
            style={{ fontSize: 11, border: '0.5px solid var(--border)', borderRadius: 8, padding: '3px 6px', background: 'var(--bg2)', color: 'var(--text-sec)', cursor: 'pointer' }}
          >
            <option value="customer">Customer</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
          </select>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12 }}>A</div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        <Outlet />
      </div>
    </div>
  );
}
