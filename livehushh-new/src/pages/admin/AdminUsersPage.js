import React, { useState } from 'react';
import { Card, FilterPill, SearchBar } from '../../components/UI';

const users = [
  { name: 'Taylor Kim', email: 'taylor@example.com', role: 'customer', joined: 'Mar 14', orders: 24 },
  { name: 'Kenji Sato', email: 'kenji@sushizen.com', role: 'owner', joined: 'Jan 02', orders: '—' },
  { name: 'Priya Sharma', email: 'priya@spicegarden.com', role: 'owner', joined: 'Feb 18', orders: '—' },
  { name: 'Maria Lopez', email: 'maria@example.com', role: 'customer', joined: 'Apr 09', orders: 8 },
  { name: 'Alex Chen', email: 'alex@livehushh.com', role: 'admin', joined: 'Jan 01', orders: '—' },
];

export default function AdminUsersPage() {
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const filtered = users
    .filter(u => filter === 'all' || u.role === filter)
    .filter(u => !q || u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()));

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 14 }}>Users</h1>
      <SearchBar placeholder="Search by name or email" value={q} onChange={setQ} />
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {['all', 'customer', 'owner', 'admin'].map(r => (
          <FilterPill key={r} label={r[0].toUpperCase() + r.slice(1)} active={filter === r} onClick={() => setFilter(r)} />
        ))}
      </div>
      <Card style={{ padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--bg2)', textAlign: 'left' }}>
              <th style={th}>Name</th><th style={th}>Email</th><th style={th}>Role</th><th style={th}>Joined</th><th style={th}>Orders</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.email} style={{ borderTop: '0.5px solid var(--border)' }}>
                <td style={td}>{u.name}</td>
                <td style={td}>{u.email}</td>
                <td style={td}><span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: 'var(--orange-pale)', color: 'var(--orange)' }}>{u.role}</span></td>
                <td style={td}>{u.joined}</td>
                <td style={td}>{u.orders}</td>
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
