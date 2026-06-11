import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../../components/UI';

const plans = [
  {
    name: 'Starter', price: 99, popular: false,
    features: ['Live streaming (up to 4 hrs/day)', 'Real-time menu & deals', 'Basic waitlist', 'Email support', 'Up to 500 viewers/stream'],
  },
  {
    name: 'Pro', price: 199, popular: true,
    features: ['Unlimited streaming', 'Pre-orders & checkout', 'Full waitlist & SMS alerts', 'Analytics dashboard', 'Priority support', 'Up to 5,000 viewers/stream'],
  },
  {
    name: 'Enterprise', price: 499, popular: false,
    features: ['Everything in Pro', 'Multi-location', 'Custom branding', 'Dedicated account manager', 'API access', 'Unlimited viewers'],
  },
];

const features = [
  { icon: '🎥', title: 'Go live in one tap', desc: 'Stream from your kitchen or floor in seconds.' },
  { icon: '🏷️', title: 'Push deals in real time', desc: 'Fill slow hours by dropping a flash deal mid-stream.' },
  { icon: '🧾', title: 'Orders & waitlist in one place', desc: 'Real-time queue, no extra device needed.' },
  { icon: '📊', title: 'Powerful analytics', desc: 'Viewer counts, peak hours, conversion attribution.' },
];

export default function ForRestaurantsPage() {
  const navigate = useNavigate();
  return (
    <div>
      <section style={{ padding: '50px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, lineHeight: 1.15 }}>
          Fill more seats with <span style={{ color: 'var(--orange)' }}>live</span>
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-sec)', maxWidth: 600, margin: '14px auto 0' }}>
          Turn empty hours into packed houses. Broadcast live, push real-time deals, and reach diners ready to walk in.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
          <Button size="lg" onClick={() => navigate('/owner/onboarding')}>Start 14-day trial</Button>
          <Button size="lg" variant="ghost" onClick={() => navigate('/marketing/demo')}>Book demo</Button>
        </div>
      </section>

      <section style={{ padding: '40px 20px', background: 'var(--bg2)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, maxWidth: 900, margin: '0 auto' }}>
          {features.map(f => (
            <Card key={f.title} style={{ padding: 18 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-sec)', lineHeight: 1.5 }}>{f.desc}</div>
            </Card>
          ))}
        </div>
      </section>

      <section style={{ padding: '50px 20px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Simple, scalable pricing</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-sec)', marginBottom: 30 }}>14-day free trial · cancel anytime</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, maxWidth: 1000, margin: '0 auto' }}>
          {plans.map(p => (
            <Card key={p.name} style={{ padding: 24, position: 'relative', border: p.popular ? '2px solid var(--orange)' : undefined }}>
              {p.popular && <div style={{ position: 'absolute', top: -10, left: 20, background: 'var(--orange)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999 }}>Most popular</div>}
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--orange)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.7 }}>{p.name}</div>
              <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 14 }}>${p.price}<span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>/mo</span></div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: 18 }}>
                {p.features.map(f => (
                  <li key={f} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--text-sec)', marginBottom: 8, lineHeight: 1.5 }}>
                    <span style={{ color: 'var(--green)' }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <Button fullWidth variant={p.popular ? 'primary' : 'secondary'} onClick={() => navigate('/owner/onboarding')}>Start trial</Button>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
