import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../../components/UI';

const features = [
  { icon: '🎥', title: 'Watch live before you go', desc: 'See real-time streams from restaurants — vibe, crowd, kitchen action.' },
  { icon: '🍽️', title: 'Real menus & live deals', desc: 'Browse menus updated in real time, with deals pushed during streams.' },
  { icon: '⏱️', title: 'Skip the wait', desc: 'Join waitlists remotely and get notified the moment your table is ready.' },
  { icon: '📦', title: 'Pre-order ahead', desc: 'Place your order before you arrive — food ready when you sit down.' },
  { icon: '✨', title: 'AI recap & highlights', desc: 'Quick AI summaries of streams so you know what each restaurant is famous for.' },
  { icon: '📲', title: 'Push notifications', desc: 'Get alerts when your favorites go live or push a deal.' },
];

const steps = [
  { n: 1, title: 'Discover nearby', desc: 'Browse restaurants live right now and filter by cuisine, distance, and price.' },
  { n: 2, title: 'Watch live & explore', desc: 'Tap a stream, see the menu, chat, and check the wait.' },
  { n: 3, title: 'Order & arrive ready', desc: 'Pre-order or join the waitlist — show up to a hot meal and an open table.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div>
      {/* Hero */}
      <section style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: 'var(--orange-pale)', border: '0.5px solid var(--orange-border)', color: 'var(--orange)', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500, marginBottom: 20 }}>
          ✦ Now live in 12 cities
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)', fontWeight: 800, lineHeight: 1.1, color: 'var(--text)', maxWidth: 800, margin: '0 auto 16px' }}>
          Experience Restaurants <span style={{ color: 'var(--orange)' }}>Before You Visit</span>
        </h1>
        <p style={{ fontSize: 17, color: 'var(--text-sec)', maxWidth: 600, margin: '0 auto 28px', lineHeight: 1.5 }}>
          Live streams, real menus, zero surprises. Watch, decide, pre-order, and skip the line — all from your phone.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button size="lg" onClick={() => navigate('/discover')}>Try the app</Button>
          <Button size="lg" variant="ghost" onClick={() => navigate('/marketing/for-restaurants')}>I own a restaurant</Button>
        </div>
      </section>

      {/* Steps */}
      <section style={{ padding: '40px 20px', background: 'var(--bg2)' }}>
        <h2 style={{ textAlign: 'center', fontSize: 26, fontWeight: 700, marginBottom: 30, color: 'var(--text)' }}>
          Dining reimagined in <span style={{ color: 'var(--orange)' }}>3 simple steps</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, maxWidth: 900, margin: '0 auto' }}>
          {steps.map(s => (
            <Card key={s.n} style={{ padding: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--orange)', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>{s.n}</div>
              <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>{s.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-sec)', lineHeight: 1.5 }}>{s.desc}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '50px 20px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 26, fontWeight: 700, marginBottom: 30, color: 'var(--text)' }}>
          Everything you need, <span style={{ color: 'var(--orange)' }}>nothing you don't</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, maxWidth: 900, margin: '0 auto' }}>
          {features.map(f => (
            <Card key={f.title} style={{ padding: 20 }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>{f.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-sec)', lineHeight: 1.5 }}>{f.desc}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* Two audiences */}
      <section style={{ padding: '40px 20px', background: 'var(--bg2)' }}>
        <h2 style={{ textAlign: 'center', fontSize: 26, fontWeight: 700, marginBottom: 30, color: 'var(--text)' }}>
          Built for <span style={{ color: 'var(--orange)' }}>every table</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, maxWidth: 900, margin: '0 auto' }}>
          <Card style={{ padding: 24 }}>
            <div style={{ fontSize: 12, color: 'var(--orange)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.7 }}>For diners</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Dine like a VIP</div>
            <ul style={{ paddingLeft: 18, color: 'var(--text-sec)', fontSize: 14, lineHeight: 1.7 }}>
              <li>Watch restaurants live before you commit</li>
              <li>Exclusive deals pushed during streams</li>
              <li>Skip the wait with remote waitlist</li>
              <li>Pre-order and arrive to fresh food</li>
            </ul>
            <Button onClick={() => navigate('/marketing/for-customers')} style={{ marginTop: 16 }}>Learn more</Button>
          </Card>
          <Card style={{ padding: 24 }}>
            <div style={{ fontSize: 12, color: 'var(--orange)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.7 }}>For restaurant owners</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Fill more seats</div>
            <ul style={{ paddingLeft: 18, color: 'var(--text-sec)', fontSize: 14, lineHeight: 1.7 }}>
              <li>Broadcast live & show your atmosphere</li>
              <li>Push deals in real time to fill slow hours</li>
              <li>Manage waitlist, orders & menu in one place</li>
              <li>See viewer + conversion analytics</li>
            </ul>
            <Button onClick={() => navigate('/marketing/for-restaurants')} style={{ marginTop: 16 }}>See pricing</Button>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 14, color: 'var(--text)' }}>
          Ready to transform your dining experience?
        </h2>
        <p style={{ fontSize: 15, color: 'var(--text-sec)', marginBottom: 24 }}>Free for diners. 14-day free trial for restaurants.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button size="lg" onClick={() => navigate('/auth/signup')}>Get started free</Button>
          <Button size="lg" variant="secondary" onClick={() => navigate('/marketing/demo')}>Book a demo</Button>
        </div>
      </section>
    </div>
  );
}
