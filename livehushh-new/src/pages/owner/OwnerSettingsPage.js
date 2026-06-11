import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/UI';
import { useApp } from '../../context/AppContext';
import { signOut as cognitoSignOut } from '../../api/cognito';

const items = [
  { to: '/owner/go-live',   icon: '📡', label: 'Go Live',     desc: 'Start a broadcast' },
  { to: '/owner/media',     icon: '🎞️', label: 'Media gallery', desc: 'Upload videos & photos of your restaurant' },
  { to: '/owner/cameras',   icon: '📹', label: 'Cameras',     desc: 'Configure cameras & locations' },
  { to: '/owner/analytics', icon: '📊', label: 'Analytics',   desc: 'Viewers, revenue, peak hours' },
  { to: '/owner/billing',   icon: '💳', label: 'Billing',     desc: 'Plan, invoices, payment method' },
  { to: '/owner/profile',   icon: '👤', label: 'Profile',     desc: 'Restaurant & owner details' },
];

export default function OwnerSettingsPage() {
  const navigate = useNavigate();
  const { setUserRole } = useApp();

  const signOut = () => {
    try { cognitoSignOut(); } catch {}
    setUserRole && setUserRole('customer');
    navigate('/auth/signin');
  };

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 14 }}>Settings</h1>
      {items.map(it => (
        <Card key={it.to} onClick={() => navigate(it.to)} style={{ padding: 14, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 'var(--r-md)', background: 'var(--orange-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{it.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{it.label}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{it.desc}</div>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 18 }}>›</div>
        </Card>
      ))}
      <Card onClick={signOut} style={{ padding: 14, marginTop: 14, display: 'flex', alignItems: 'center', gap: 12, border: '0.5px solid rgba(255,59,59,0.25)' }}>
        <div style={{ width: 38, height: 38, borderRadius: 'var(--r-md)', background: 'rgba(255,59,59,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🚪</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#cc2200' }}>Sign out</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>End your session</div>
        </div>
      </Card>
    </div>
  );
}
