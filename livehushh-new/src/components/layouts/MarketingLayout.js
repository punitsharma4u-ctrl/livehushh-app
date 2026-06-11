import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';

const navItems = [
  { to: '/marketing', label: 'Home' },
  { to: '/marketing/for-customers', label: 'For Diners' },
  { to: '/marketing/for-restaurants', label: 'For Restaurants' },
  { to: '/marketing/demo', label: 'Demo' },
  { to: '/marketing/contact', label: 'Contact' },
];

export default function MarketingLayout() {
  const navigate = useNavigate();
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', minHeight: '100vh', background: 'var(--white)' }}>
      <header style={{
        position: 'sticky', top: 0, zIndex: 100, background: 'var(--white)',
        borderBottom: '0.5px solid var(--border)', padding: '14px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
      }}>
        <Link to="/marketing" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
          live<span style={{ color: 'var(--orange)' }}>hushh.</span>
        </Link>
        <nav style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
          {navItems.map(n => (
            <Link key={n.to} to={n.to} style={{ fontSize: 13, color: 'var(--text-sec)', fontWeight: 500 }}>{n.label}</Link>
          ))}
          <button onClick={() => navigate('/auth/signin')} style={{
            background: 'transparent', border: '1px solid var(--orange)', color: 'var(--orange)',
            padding: '6px 14px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 500, cursor: 'pointer'
          }}>Sign in</button>
          <button onClick={() => navigate('/auth/signup')} style={{
            background: 'var(--orange)', border: 'none', color: '#fff',
            padding: '7px 16px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 500, cursor: 'pointer'
          }}>Get started</button>
        </nav>
      </header>
      <Outlet />
      <footer style={{
        borderTop: '0.5px solid var(--border)', padding: '24px 20px', marginTop: 40,
        background: 'var(--bg2)', color: 'var(--text-muted)', fontSize: 12,
        display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
      }}>
        <div>© {new Date().getFullYear()} LiveHushh · Experience restaurants before you visit</div>
        <div style={{ display: 'flex', gap: 16 }}>
          <Link to="/marketing/data-deletion">Data deletion</Link>
          <Link to="/marketing/contact">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
