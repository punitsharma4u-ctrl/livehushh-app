import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const NAV = [
  { to: '/owner/orders',       icon: '🧾', label: 'Orders' },
  { to: '/owner/waitlist',     icon: '🔢', label: 'Waitlist' },
  { to: '/owner/reservations', icon: '📅', label: 'Reservations' },
  { to: '/owner/tables',       icon: '🪑', label: 'Tables' },
  { to: '/owner/menu',         icon: '🍽', label: 'Menu' },
  { to: '/owner/settings',     icon: '⚙️', label: 'Settings' },
];

export default function OwnerLayout() {
  const { isLive, setUserRole } = useApp();
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', minHeight: '100vh', background: 'var(--white)', display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <div style={{
        background: 'var(--white)', borderBottom: '0.5px solid var(--border)',
        padding: '12px 16px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>live<span style={{ color: 'var(--orange)' }}>hushh.</span></div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Owner dashboard</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {isLive && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#FF3B3B', color: '#fff', fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 999 }}>
              <span style={{ width: 5, height: 5, background: '#fff', borderRadius: '50%' }} /> ON AIR
            </span>
          )}
          <select
            onChange={e => { setUserRole(e.target.value); if (e.target.value === 'customer') navigate('/'); if (e.target.value === 'admin') navigate('/admin'); }}
            defaultValue="owner"
            style={{ fontSize: 11, border: '0.5px solid var(--border)', borderRadius: 8, padding: '3px 6px', background: 'var(--bg2)', color: 'var(--text-sec)', cursor: 'pointer' }}
          >
            <option value="customer">Customer</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 72 }}>
        <Outlet />
      </div>

      {/* Bottom nav (scrollable since we have many) */}
      <div style={{
        position: 'sticky', bottom: 0,
        background: 'var(--white)', borderTop: '0.5px solid var(--border)',
        display: 'flex', padding: '8px 0 4px', zIndex: 100,
        overflowX: 'auto', whiteSpace: 'nowrap',
      }}>
        {NAV.map(item => (
          <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
            minWidth: 70, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            textDecoration: 'none', padding: '4px 8px',
            color: isActive ? 'var(--orange)' : 'var(--text-muted)',
          })}>
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 500 }}>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
