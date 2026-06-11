import React, { useState } from 'react';
import { Button, Card } from '../../components/UI';

export default function DemoPage() {
  const [submitted, setSubmitted] = useState(false);
  return (
    <div style={{ padding: '50px 20px', maxWidth: 560, margin: '0 auto' }}>
      <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 8 }}>Book a demo</h1>
      <p style={{ color: 'var(--text-sec)', marginBottom: 24 }}>
        See LiveHushh in action — 20 minutes, tailored to your restaurant.
      </p>
      {submitted ? (
        <Card style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Thanks — we'll be in touch</div>
          <div style={{ fontSize: 14, color: 'var(--text-sec)' }}>Our team will reach out within 24 hours to schedule your demo.</div>
        </Card>
      ) : (
        <Card style={{ padding: 24 }}>
          <form onSubmit={e => { e.preventDefault(); setSubmitted(true); }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Your name" type="text" required />
            <Field label="Restaurant name" type="text" required />
            <Field label="Work email" type="email" required />
            <Field label="Phone" type="tel" />
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>What do you want to learn?</label>
              <textarea rows={3} style={{ width: '100%', marginTop: 6, padding: 10, border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', background: 'var(--bg2)', fontFamily: 'var(--font)', fontSize: 13 }} />
            </div>
            <Button type="submit" fullWidth size="lg">Request demo</Button>
          </form>
        </Card>
      )}
    </div>
  );
}

function Field({ label, type, required }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{label}{required && ' *'}</label>
      <input type={type} required={required} style={{ width: '100%', marginTop: 6, padding: 10, border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', background: 'var(--bg2)', fontFamily: 'var(--font)', fontSize: 13 }} />
    </div>
  );
}
