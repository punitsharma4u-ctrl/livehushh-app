import React, { useState } from 'react';
import { Button, Card } from '../../components/UI';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <div style={{ padding: '50px 20px', maxWidth: 560, margin: '0 auto' }}>
      <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 8 }}>Contact us</h1>
      <p style={{ color: 'var(--text-sec)', marginBottom: 24 }}>Questions, partnerships, or support — drop us a line.</p>
      <Card style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: 'var(--text-sec)' }}>📧 hello@livehushh.com</div>
        <div style={{ fontSize: 13, color: 'var(--text-sec)', marginTop: 6 }}>📞 +1 (555) 123-4567</div>
        <div style={{ fontSize: 13, color: 'var(--text-sec)', marginTop: 6 }}>🏢 San Francisco, CA</div>
      </Card>
      {sent ? (
        <Card style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✉️</div>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Message sent</div>
          <div style={{ fontSize: 13, color: 'var(--text-sec)' }}>We'll reply within 1 business day.</div>
        </Card>
      ) : (
        <Card style={{ padding: 24 }}>
          <form onSubmit={e => { e.preventDefault(); setSent(true); }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input placeholder="Your name" required style={inp} />
            <input placeholder="Email" type="email" required style={inp} />
            <textarea placeholder="How can we help?" rows={5} required style={{ ...inp, fontFamily: 'var(--font)' }} />
            <Button type="submit" fullWidth size="lg">Send message</Button>
          </form>
        </Card>
      )}
    </div>
  );
}

const inp = { padding: 10, border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', background: 'var(--bg2)', fontFamily: 'var(--font)', fontSize: 13 };
