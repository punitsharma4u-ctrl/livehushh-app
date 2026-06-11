import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card } from '../../components/UI';
import { useApp } from '../../context/AppContext';
import { signUp as cognitoSignUp, confirmSignUp } from '../../api/cognito';

export default function SignUpPage() {
  const navigate = useNavigate();
  const { setUserRole, useApi } = useApp();
  const [role, setRole] = useState('customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [phase, setPhase] = useState('form'); // 'form' | 'confirm'
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      if (useApi) {
        await cognitoSignUp(email, password, { name, role });
        setPhase('confirm');
      } else {
        setUserRole(role);
        if (role === 'owner') navigate('/owner/onboarding');
        else navigate('/discover');
      }
    } catch (err) {
      setErr(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const confirm = async e => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await confirmSignUp(email, code);
      setUserRole(role);
      if (role === 'owner') navigate('/owner/onboarding');
      else navigate('/discover');
    } catch (err) {
      setErr(err.message || 'Confirmation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ padding: 28 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Create account</h1>
      <p style={{ fontSize: 13, color: 'var(--text-sec)', marginBottom: 20 }}>Free for diners · 14-day trial for restaurants</p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        {[
          { v: 'customer', t: "I'm a diner", e: '🍽️' },
          { v: 'owner', t: "I own a restaurant", e: '🏪' },
        ].map(o => (
          <button key={o.v} type="button" onClick={() => setRole(o.v)} style={{
            flex: 1, padding: '14px 10px', border: `1.5px solid ${role === o.v ? 'var(--orange)' : 'var(--border)'}`,
            background: role === o.v ? 'var(--orange-pale)' : 'var(--bg2)',
            borderRadius: 'var(--r-md)', cursor: 'pointer', textAlign: 'left',
          }}>
            <div style={{ fontSize: 22 }}>{o.e}</div>
            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 6 }}>{o.t}</div>
          </button>
        ))}
      </div>

      {phase === 'form' ? (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input placeholder="Full name" required style={inp} value={name} onChange={e => setName(e.target.value)} />
          <input type="email" placeholder="Email" required style={inp} value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Password (min 8 chars)" required minLength={8} style={inp} value={password} onChange={e => setPassword(e.target.value)} />
          {err && <div style={{ fontSize: 12, color: '#cc2200', background: 'rgba(255,59,59,0.10)', padding: 8, borderRadius: 8 }}>{err}</div>}
          <Button type="submit" fullWidth size="lg" disabled={loading}>{loading ? 'Creating…' : 'Create account'}</Button>
        </form>
      ) : (
        <form onSubmit={confirm} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 13, color: 'var(--text-sec)' }}>We sent a verification code to <strong>{email}</strong>.</div>
          <input placeholder="6-digit code" required style={inp} value={code} onChange={e => setCode(e.target.value)} />
          {err && <div style={{ fontSize: 12, color: '#cc2200', background: 'rgba(255,59,59,0.10)', padding: 8, borderRadius: 8 }}>{err}</div>}
          <Button type="submit" fullWidth size="lg" disabled={loading}>{loading ? 'Verifying…' : 'Verify & continue'}</Button>
        </form>
      )}

      <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--text-sec)' }}>
        Already a member? <Link to="/auth/signin" style={{ color: 'var(--orange)', fontWeight: 600 }}>Sign in</Link>
      </div>
    </Card>
  );
}

const inp = { width: '100%', padding: 12, border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', background: 'var(--bg2)', fontFamily: 'var(--font)', fontSize: 14 };
