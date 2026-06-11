import React from 'react';
import { Button, Card } from '../../components/UI';

export default function OwnerProfilePage() {
  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 14 }}>Profile</h1>
      <Card style={{ padding: 18, marginBottom: 14, textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--orange)', color: '#fff', fontSize: 26, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>P</div>
        <div style={{ fontWeight: 700, fontSize: 16 }}>Priya Sharma</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Owner · Spice Garden</div>
      </Card>
      <Card style={{ padding: 18, marginBottom: 14 }}>
        <div style={{ fontWeight: 600, marginBottom: 10 }}>Restaurant details</div>
        <Field label="Restaurant name" value="Spice Garden" />
        <Field label="Cuisine" value="Indian" />
        <Field label="Address" value="12 Maple St, Downtown" />
        <Field label="Phone" value="+1 (555) 234-5678" />
        <Field label="Hours" value="12pm – 10pm" />
        <Button style={{ marginTop: 10 }}>Edit details</Button>
      </Card>
      <Card style={{ padding: 18 }}>
        <div style={{ fontWeight: 600, marginBottom: 10 }}>Owner account</div>
        <Field label="Name" value="Priya Sharma" />
        <Field label="Email" value="priya@spicegarden.com" />
        <Field label="Phone" value="+1 (555) 111-2222" />
        <Button variant="secondary" style={{ marginTop: 10 }}>Change password</Button>
      </Card>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div style={{ padding: '8px 0', borderBottom: '0.5px solid var(--border)' }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</div>
      <div style={{ fontSize: 14, marginTop: 2 }}>{value}</div>
    </div>
  );
}
