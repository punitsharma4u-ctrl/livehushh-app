import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const NAV = [
  { to: '/discover', icon: '🧭', label: 'Discover' },
  { to: '/orders',   icon: '🧾', label: 'Orders' },
  { to: '/waitlist', icon: '🔢', label: 'Waitlist' },
  { to: '/profile',  icon: '👤', label: 'Profile' },
];

export default function CustomerLayout() {
  const { cartCount, notifications, setUserRole } = useApp();
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: 'var(--white)', display: 'flex', flexDirection: 'column', position: 'relative' }}>

      {/* Top bar */}
      <div style={{
        background: 'var(--white)', borderBottom: '0.5px solid var(--border)',
        padding: '12px 16px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', cursor: 'pointer' }} onClick={() => navigate('/discover')}>
          live<span style={{ color: 'var(--orange)' }}>hushh.</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* Role switcher for demo */}
          <select
            onChange={e => { setUserRole(e.target.value); if (e.target.value === 'owner') navigate('/owner'); if (e.target.value === 'admin') navigate('/admin'); }}
            style={{ fontSize: 11, border: '0.5px solid var(--border)', borderRadius: 8, padding: '3px 6px', background: 'var(--bg2)', color: 'var(--text-sec)', cursor: 'pointer' }}
          >
            <option value="customer">Customer</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
          </select>
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <span style={{ fontSize: 20 }}>🔔</span>
            {notifications > 0 && (
              <span style={{ position: 'absolute', top: -2, right: -2, width: 14, height: 14, background: 'var(--orange)', borderRadius: '50%', fontSize: 9, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{notifications}</span>
            )}
          </div>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--orange-pale)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--orange)', fontSize: 13, cursor: 'pointer' }}>T</div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 72 }}>
        <Outlet />
      </div>

      {/* Cart bar */}
      {cartCount > 0 && (
        <div style={{
          position: 'sticky', bottom: 64, left: 0, right: 0, zIndex: 90,
          background: 'var(--orange)', color: '#fff', padding: '12px 16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          cursor: 'pointer',
        }} onClick={() => navigate('/cart')}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>View cart · {cartCount} item{cartCount > 1 ? 's' : ''}</div>
            <div style={{ fontSize: 11, opacity: 0.85 }}>Tap to review & pre-order</div>
          </div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>→</div>
        </div>
      )}

      {/* Bottom navigation */}
      <div style={{
        position: 'sticky', bottom: 0, left: 0, right: 0,
        background: 'var(--white)', borderTop: '0.5px solid var(--border)',
        display: 'flex', padding: '8px 0 4px', zIndex: 100,
      }}>
        {NAV.map(item => (
          <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            textDecoration: 'none', padding: '4px 0',
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
