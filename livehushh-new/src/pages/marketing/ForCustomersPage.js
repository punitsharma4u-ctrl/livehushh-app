import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../../components/UI';

const benefits = [
  { icon: '🎥', title: 'Live restaurant streams', desc: 'See the vibe and crowd before you go. No more guessing.' },
  { icon: '🏷️', title: 'Exclusive live deals', desc: 'Deals that only members watching live can claim.' },
  { icon: '⏱️', title: 'Remote waitlist', desc: 'Join the queue from home and time your arrival perfectly.' },
  { icon: '📦', title: 'Pre-order ahead', desc: 'Food ready the moment you sit down.' },
  { icon: '⭐', title: 'AI recaps', desc: 'Quick summaries of each restaurant\'s vibe and specialties.' },
  { icon: '🔔', title: 'Live alerts', desc: 'Get notified when your favorites go live or drop a deal.' },
];

export default function ForCustomersPage() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '50px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, lineHeight: 1.15, color: 'var(--text)' }}>
          Dine smarter, <span style={{ color: 'var(--orange)' }}>not harder</span>
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-sec)', maxWidth: 600, margin: '14px auto 0' }}>
          Watch any restaurant live, see exactly what's cooking, lock in a deal, skip the wait, and pre-order. All free for diners.
        </p>
        <Button size="lg" onClick={() => navigate('/discover')} style={{ marginTop: 24 }}>Start exploring</Button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, maxWidth: 900, margin: '0 auto' }}>
        {benefits.map(b => (
          <Card key={b.title} style={{ padding: 20 }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{b.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{b.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-sec)', lineHeight: 1.5 }}>{b.desc}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
