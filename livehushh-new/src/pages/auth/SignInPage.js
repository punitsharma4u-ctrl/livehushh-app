import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card } from '../../components/UI';
import { useApp } from '../../context/AppContext';
import { setToken, endpoints } from '../../api/client';
import { signIn as cognitoSignIn } from '../../api/cognito';

export default function SignInPage() {
  const navigate = useNavigate();
  const { setUserRole, useApi, refresh } = useApp();
  const [role, setRole] = useState('customer');
  const [email, setEmail] = useState('demo@livehushh.com');
  const [password, setPassword] = useState('demo1234');
  const [err, setErr] = useState('');

  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      if (useApi) {
        const session = await cognitoSignIn(email, password);
        const resolvedRole = session.role || role;
        setUserRole(resolvedRole);
        await endpoints.profile().catch(() => null);
        refresh && refresh();
        if (resolvedRole === 'customer') navigate('/discover');
        else if (resolvedRole === 'owner') navigate('/owner');
        else navigate('/admin');
      } else {
        // Mock mode: respect role picker, skip real auth.
        setToken(`stub-${role}-${email}`);
        setUserRole(role);
        if (role === 'customer') navigate('/discover');
        else if (role === 'owner') navigate('/owner');
        else navigate('/admin');
      }
    } catch (err) {
      setErr(err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ padding: 28 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Welcome back</h1>
      <p style={{ fontSize: 13, color: 'var(--text-sec)', marginBottom: 20 }}>Sign in to continue</p>

      <div style={{ display: 'flex', gap: 6, marginBottom: 18, background: 'var(--bg2)', padding: 4, borderRadius: 'var(--r-md)' }}>
        {['customer', 'owner', 'admin'].map(r => (
          <button key={r} type="button" onClick={() => setRole(r)} style={{
            flex: 1, padding: '8px 0', fontSize: 12, fontWeight: 600,
            border: 'none', borderRadius: 8, cursor: 'pointer',
            background: role === r ? 'var(--white)' : 'transparent',
            color: role === r ? 'var(--orange)' : 'var(--text-sec)',
            boxShadow: role === r ? 'var(--shadow-sm)' : 'none',
          }}>{r[0].toUpperCase() + r.slice(1)}</button>
        ))}
      </div>

      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input type="email" placeholder="Email" required style={inp} value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" required style={inp} value={password} onChange={e => setPassword(e.target.value)} />
        {err && <div style={{ fontSize: 12, color: '#cc2200', background: 'rgba(255,59,59,0.10)', padding: 8, borderRadius: 8 }}>{err}</div>}
        <Button type="submit" fullWidth size="lg" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</Button>
      </form>

      <div style={{ textAlign: 'center', margin: '14px 0', color: 'var(--text-muted)', fontSize: 12 }}>or</div>
      <button style={{ ...inp, background: '#000', color: '#fff', textAlign: 'center', cursor: 'pointer', border: 'none', fontWeight: 600 }} onClick={submit}> Continue with Apple</button>

      <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--text-sec)' }}>
        New here? <Link to="/auth/signup" style={{ color: 'var(--orange)', fontWeight: 600 }}>Create account</Link>
      </div>
    </Card>
  );
}

const inp = { width: '100%', padding: 12, border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', background: 'var(--bg2)', fontFamily: 'var(--font)', fontSize: 14 };
