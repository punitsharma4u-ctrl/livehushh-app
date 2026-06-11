import React from 'react';
import { Card, StatCard } from '../../components/UI';

const subs = [
  { restaurant: 'Spice Garden', plan: 'Pro', mrr: 199, renews: 'Jul 12', status: 'Active' },
  { restaurant: 'Sushi Zen', plan: 'Enterprise', mrr: 499, renews: 'Jun 28', status: 'Active' },
  { restaurant: 'Burger Barn', plan: 'Starter', mrr: 99, renews: 'Jul 03', status: 'Trial' },
  { restaurant: 'Bistro Lyon', plan: 'Pro', mrr: 199, renews: 'Jun 25', status: 'Past due' },
];

export default function AdminSubscriptionsPage() {
  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 14 }}>Subscriptions</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
        <StatCard value="$24.6k" label="MRR" delta="+8.2%" />
        <StatCard value="142" label="Active subs" />
        <StatCard value="$4.2k" label="At risk" color="var(--live)" />
        <StatCard value="93%" label="Retention" />
      </div>
      <Card style={{ padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--bg2)', textAlign: 'left' }}>
              <th style={th}>Restaurant</th><th style={th}>Plan</th><th style={th}>MRR</th><th style={th}>Renews</th><th style={th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {subs.map(s => (
              <tr key={s.restaurant} style={{ borderTop: '0.5px solid var(--border)' }}>
                <td style={td}>{s.restaurant}</td>
                <td style={td}>{s.plan}</td>
                <td style={td}>${s.mrr}</td>
                <td style={td}>{s.renews}</td>
                <td style={td}>
                  <span style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 999,
                    background: s.status === 'Past due' ? 'rgba(255,59,59,0.10)' : s.status === 'Trial' ? 'var(--orange-pale)' : 'var(--green-bg)',
                    color: s.status === 'Past due' ? '#cc2200' : s.status === 'Trial' ? 'var(--orange)' : 'var(--green)',
                  }}>{s.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

const th = { padding: '10px 12px', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.7 };
const td = { padding: '12px' };
