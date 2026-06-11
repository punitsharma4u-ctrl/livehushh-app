import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg2)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '20px 24px' }}>
        <Link to="/marketing" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>
          live<span style={{ color: 'var(--orange)' }}>hushh.</span>
        </Link>
      </header>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
