import React, { useState } from 'react';
import { Button, Card, FilterPill } from '../../components/UI';

const initial = [
  { id: 'R1', name: 'Emma S.',  party: 4, date: '2026-06-10', time: '8:00 PM', source: 'app',     status: 'confirmed', notes: 'Anniversary' },
  { id: 'R2', name: 'James L.', party: 2, date: '2026-06-11', time: '7:30 PM', source: 'app',     status: 'confirmed', notes: '' },
  { id: 'R3', name: 'Walk-in',  party: 6, date: '2026-06-12', time: '6:00 PM', source: 'walk-in', status: 'confirmed', notes: 'Birthday' },
  { id: 'R4', name: 'Mia R.',   party: 3, date: '2026-06-15', time: '9:00 PM', source: 'app',     status: 'pending',   notes: '' },
];

const AVAILABLE_TABLES = [
  { id: 'T3', name: 'Table 3', seats: 2 },
  { id: 'T5', name: 'Table 5', seats: 4 },
  { id: 'T7', name: 'Table 7', seats: 6 },
  { id: 'T9', name: 'Table 9', seats: 8 },
];

export default function OwnerReservationsPage() {
  const [list, setList] = useState(initial);
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', party: 2, date: '', time: '', notes: '' });
  const [assigning, setAssigning] = useState(null);
  const [toast, setToast] = useState('');

  const confirmAssign = (entry, table) => {
    setList(list.map(r => r.id === entry.id ? { ...r, table: table.name } : r));
    setAssigning(null);
    setToast(`✓ ${table.name} reserved for ${entry.name} on ${entry.date} at ${entry.time}. Customer notified + email sent.`);
    setTimeout(() => setToast(''), 3500);
  };

  const filtered = list.filter(r => filter === 'all' || r.status === filter);

  const add = () => {
    setList([{ id: `R${Date.now()}`, ...form, source: 'walk-in', status: 'confirmed' }, ...list]);
    setForm({ name: '', party: 2, date: '', time: '', notes: '' }); setShowAdd(false);
  };
  const cancel = id => setList(list.map(r => r.id === id ? { ...r, status: 'cancelled' } : r));

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Reservations</h1>
        <Button onClick={() => setShowAdd(s => !s)}>+ Add</Button>
      </div>

      {showAdd && (
        <Card style={{ padding: 14, marginBottom: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>New reservation (walk-in / phone)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input placeholder="Guest name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inp} />
            <input type="number" min={1} placeholder="Party size" value={form.party} onChange={e => setForm({ ...form, party: +e.target.value })} style={inp} />
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={{ ...inp, flex: 1 }} />
              <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} style={{ ...inp, flex: 1 }} />
            </div>
            <input placeholder="Notes (optional)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={inp} />
            <Button fullWidth onClick={add}>Confirm reservation</Button>
          </div>
        </Card>
      )}

      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        {['all', 'confirmed', 'pending', 'cancelled'].map(s => (
          <FilterPill key={s} label={s[0].toUpperCase() + s.slice(1)} active={filter === s} onClick={() => setFilter(s)} />
        ))}
      </div>

      {filtered.map(r => (
        <Card key={r.id} style={{ padding: 12, marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600 }}>
                📅 {r.name} <span style={{ fontSize: 11, marginLeft: 6, color: 'var(--text-muted)' }}>{r.source === 'app' ? '📲 App' : '🚶 Walk-in'}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                {r.date} · {r.time} · party {r.party}{r.notes && ` · ${r.notes}`}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
              <span style={{
                fontSize: 11, padding: '2px 8px', borderRadius: 999,
                background: r.status === 'cancelled' ? 'rgba(255,59,59,0.10)' : r.status === 'pending' ? 'var(--orange-pale)' : 'var(--green-bg)',
                color: r.status === 'cancelled' ? '#cc2200' : r.status === 'pending' ? 'var(--orange)' : 'var(--green)',
              }}>{r.status}</span>
              {r.table && <span style={{ fontSize: 11, color: 'var(--green)', background: 'var(--green-bg)', padding: '2px 8px', borderRadius: 8 }}>🪑 {r.table}</span>}
              {r.status === 'confirmed' && !r.table && <button onClick={() => setAssigning(r)} style={{ background: 'var(--orange)', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Assign table</button>}
              {r.status !== 'cancelled' && <button onClick={() => cancel(r.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer' }}>Cancel</button>}
            </div>
          </div>
        </Card>
      ))}

      {toast && (
        <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: 'var(--green)', color: '#fff', padding: '10px 16px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 600, boxShadow: 'var(--shadow-lg)', zIndex: 300, maxWidth: 360 }}>{toast}</div>
      )}

      {assigning && (
        <div onClick={() => setAssigning(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 200 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', padding: 20, width: '100%', maxWidth: 380 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Assign table</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>{assigning.name} · party of {assigning.party} · {assigning.date} {assigning.time}</div>
            {AVAILABLE_TABLES.filter(t => t.seats >= assigning.party).map(t => (
              <div key={t.id} onClick={() => confirmAssign(assigning, t)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', marginBottom: 8, cursor: 'pointer' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>🪑 {t.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.seats} seats</div>
                </div>
                <span style={{ color: 'var(--orange)', fontWeight: 600, fontSize: 13 }}>Assign →</span>
              </div>
            ))}
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10 }}>Table is reserved for this booking. Customer's order is updated and a confirmation email is sent.</div>
          </div>
        </div>
      )}
    </div>
  );
}

const inp ={ padding: 10, border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', background: 'var(--bg2)', fontFamily: 'var(--font)', fontSize: 13 };
