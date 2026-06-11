import React, { useState } from 'react';
import { Button, Card, StatCard } from '../../components/UI';

const initial = [
  { id: 'T1', name: 'Table 1', seats: 2, status: 'occupied', guest: 'Taylor K.', order: 'O104', total: 42, since: '7:02 PM' },
  { id: 'T2', name: 'Table 2', seats: 4, status: 'occupied', guest: 'Priya M.',  order: 'O105', total: 68, since: '7:15 PM' },
  { id: 'T3', name: 'Table 3', seats: 2, status: 'available' },
  { id: 'T4', name: 'Table 4', seats: 6, status: 'reserved', guest: 'Emma S.', reservedFor: '8:00 PM' },
  { id: 'T5', name: 'Table 5', seats: 4, status: 'available' },
  { id: 'T6', name: 'Table 6', seats: 8, status: 'cleaning' },
];

const colors = {
  available: { bg: 'var(--green-bg)', text: 'var(--green)', border: 'var(--green-border)' },
  occupied:  { bg: 'rgba(232,93,4,0.10)', text: 'var(--orange)', border: 'var(--orange-border)' },
  reserved:  { bg: 'var(--orange-pale)', text: 'var(--orange)', border: 'var(--orange-border)' },
  cleaning:  { bg: 'rgba(0,0,0,0.05)', text: 'var(--text-muted)', border: 'var(--border)' },
};

export default function OwnerTablesPage() {
  const [tables, setTables] = useState(initial);
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const assign = id => setTables(tables.map(t => t.id === id ? { ...t, status: 'occupied', guest: 'New guest', order: `O${Math.floor(Math.random()*1000)}`, total: 0, since: 'now' } : t));
  const release = id => setTables(tables.map(t => t.id === id ? { id: t.id, name: t.name, seats: t.seats, status: 'cleaning' } : t));
  const markAvailable = id => setTables(tables.map(t => t.id === id ? { id: t.id, name: t.name, seats: t.seats, status: 'available' } : t));
  const addTable = (seats) => setTables([...tables, { id: `T${tables.length+1}`, name: `Table ${tables.length+1}`, seats, status: 'available' }]);
  const removeTable = id => { setTables(tables.filter(t => t.id !== id)); setSelected(null); };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Tables</h1>
        <Button onClick={() => setShowAdd(s => !s)}>+ Configure</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
        <StatCard value={tables.filter(t => t.status === 'available').length} label="Available" color="var(--green)" />
        <StatCard value={tables.filter(t => t.status === 'occupied').length} label="Occupied" color="var(--orange)" />
        <StatCard value={tables.filter(t => t.status === 'reserved').length} label="Reserved" />
        <StatCard value={tables.filter(t => t.status === 'cleaning').length} label="Cleaning" color="var(--text-muted)" />
      </div>

      {showAdd && (
        <Card style={{ padding: 14, marginBottom: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Add table (pick capacity)</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[2, 4, 6, 8, 10].map(n => (
              <Button key={n} variant="secondary" onClick={() => addTable(n)}>{n} seats</Button>
            ))}
          </div>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginBottom: 14 }}>
        {tables.map(t => {
          const c = colors[t.status];
          return (
            <Card key={t.id} onClick={() => setSelected(t)} style={{ padding: 12, border: `1.5px solid ${c.border}`, background: c.bg }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{t.seats} seats</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: c.text, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t.status}</div>
              {t.guest && <div style={{ fontSize: 11, color: 'var(--text-sec)', marginTop: 4 }}>{t.guest}</div>}
              {t.reservedFor && <div style={{ fontSize: 11, color: 'var(--text-sec)' }}>at {t.reservedFor}</div>}
            </Card>
          );
        })}
      </div>

      {selected && (
        <Card style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontWeight: 700 }}>{selected.name} · {selected.seats} seats</div>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>×</button>
          </div>
          {selected.status === 'occupied' && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 13 }}>Guest: <strong>{selected.guest}</strong></div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Order #{selected.order} · ${selected.total} · since {selected.since}</div>
            </div>
          )}
          {selected.status === 'reserved' && (
            <div style={{ fontSize: 13, marginBottom: 10 }}>Reserved for <strong>{selected.guest}</strong> at {selected.reservedFor}</div>
          )}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {selected.status === 'available' && <Button onClick={() => { assign(selected.id); setSelected(null); }}>Seat guest</Button>}
            {selected.status === 'occupied' && <Button variant="danger" onClick={() => { release(selected.id); setSelected(null); }}>Release & clean</Button>}
            {selected.status === 'cleaning' && <Button variant="green" onClick={() => { markAvailable(selected.id); setSelected(null); }}>Mark available</Button>}
            {selected.status === 'reserved' && <Button onClick={() => { assign(selected.id); setSelected(null); }}>Seat now</Button>}
            <Button variant="secondary" onClick={() => removeTable(selected.id)}>Delete table</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
