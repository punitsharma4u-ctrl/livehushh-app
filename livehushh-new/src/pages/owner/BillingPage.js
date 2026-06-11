import React from 'react';
import { Button, Card, StatCard } from '../../components/UI';

const invoices = [
  { id: 'INV-1042', date: 'Jun 1, 2026', amount: 199, status: 'Paid' },
  { id: 'INV-1029', date: 'May 1, 2026', amount: 199, status: 'Paid' },
  { id: 'INV-1015', date: 'Apr 1, 2026', amount: 199, status: 'Paid' },
];

export default function BillingPage() {
  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 14 }}>Billing</h1>

      <Card style={{ padding: 18, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.7 }}>Current plan</div>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>Pro · $199/mo</div>
            <div style={{ fontSize: 12, color: 'var(--text-sec)', marginTop: 4 }}>Renews Jul 1, 2026</div>
          </div>
          <Button variant="secondary">Change plan</Button>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
        <StatCard value="$1,194" label="Last 6 mo" />
        <StatCard value="12,450" label="Total viewers" />
        <StatCard value="89%" label="Conversion" />
      </div>

      <Card style={{ padding: 18, marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Payment method</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: 'var(--bg2)', borderRadius: 'var(--r-md)' }}>
          <span style={{ fontSize: 22 }}>💳</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Visa ending 4242</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Expires 12/27</div>
          </div>
          <button style={{ background: 'none', border: 'none', color: 'var(--orange)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Update</button>
        </div>
      </Card>

      <Card style={{ padding: 18 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Invoices</div>
        {invoices.map(inv => (
          <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '0.5px solid var(--border)' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{inv.id}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{inv.date}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>${inv.amount}</span>
              <span style={{ fontSize: 11, color: 'var(--green)', background: 'var(--green-bg)', padding: '2px 8px', borderRadius: 999 }}>{inv.status}</span>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
