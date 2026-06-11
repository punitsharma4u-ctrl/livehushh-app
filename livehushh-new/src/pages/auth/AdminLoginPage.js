import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../../components/UI';
import { useApp } from '../../context/AppContext';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { setUserRole } = useApp();
  return (
    <Card style={{ padding: 28 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Admin login</h1>
      <p style={{ fontSize: 13, color: 'var(--text-sec)', marginBottom: 20 }}>Internal access only</p>
      <form onSubmit={e => { e.preventDefault(); setUserRole('admin'); navigate('/admin'); }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input placeholder="Admin email" type="email" required style={inp} />
        <input placeholder="Password" type="password" required style={inp} />
        <input placeholder="2FA code" required style={inp} />
        <Button type="submit" fullWidth size="lg">Sign in</Button>
      </form>
    </Card>
  );
}

const inp = { width: '100%', padding: 12, border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', background: 'var(--bg2)', fontFamily: 'var(--font)', fontSize: 14 };
