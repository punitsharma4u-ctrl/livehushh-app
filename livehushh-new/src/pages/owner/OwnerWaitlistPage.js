import React, { useState } from 'react';
import { Button, Card, StatCard, FilterPill } from '../../components/UI';

const initial = [
  { id: 'W1', name: 'Taylor Kim', party: 4, source: 'app', joined: '7:02 PM', wait: 22, status: 'waiting' },
  { id: 'W2', name: 'Priya M.',   party: 2, source: 'app', joined: '7:08 PM', wait: 28, status: 'waiting' },
  { id: 'W3', name: 'Walk-in',    party: 3, source: 'walk-in', joined: '7:15 PM', wait: 35, status: 'waiting' },
  { id: 'W4', name: 'Liam O.',    party: 6, source: 'app', joined: '6:50 PM', wait: 0,  status: 'seated' },
];

const AVAILABLE_TABLES = [
  { id: 'T3', name: 'Table 3', seats: 2 },
  { id: 'T5', name: 'Table 5', seats: 4 },
  { id: 'T7', name: 'Table 7', seats: 6 },
  { id: 'T9', name: 'Table 9', seats: 8 },
];

export default function OwnerWaitlistPage() {
  const [list, setList] = useState(initial);
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [party, setParty] = useState(2);
  const [phone, setPhone] = useState('');
  const [assigning, setAssigning] = useState(null);
  const [toast, setToast] = useState('');

  const confirmAssign = (entry, table) => {
    setList(list.map(w => w.id === entry.id ? { ...w, status: 'seated', table: table.name } : w));
    setAssigning(null);
    setToast(`✓ ${table.name} reserved for ${entry.name}. Customer notified + email sent.`);
    setTimeout(() => setToast(''), 3500);
  };

  const filtered = list.filter(w => filter === 'all' || w.status === filter);
  const waiting = list.filter(w => w.status === 'waiting').length;

  const addWalkIn = () => {
    setList([{ id: `W${Date.now()}`, name: name || 'Walk-in', party, source: 'walk-in', joined: 'now', wait: 30, status: 'waiting', phone }, ...list]);
    setName(''); setParty(2); setPhone(''); setShowAdd(false);
  };
  const setStatus = (id, s) => setList(list.map(w => w.id === id ? { ...w, status: s } : w));

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Waitlist</h1>
        <Button onClick={() => setShowAdd(s => !s)}>+ Walk-in</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
        <StatCard value={waiting} label="In queue" />
        <StatCard value="28 min" label="Avg wait" />
        <StatCard value={list.filter(w => w.source === 'app').length} label="From app" color="var(--green)" />
      </div>

      {showAdd && (
        <Card style={{ padding: 14, marginBottom: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Add walk-in</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={inp} />
            <input placeholder="Phone (for SMS)" value={phone} onChange={e => setPhone(e.target.value)} style={inp} />
            <input type="number" min={1} placeholder="Party size" value={party} onChange={e => setParty(+e.target.value)} style={inp} />
            <Button fullWidth onClick={addWalkIn}>Add to waitlist</Button>
          </div>
        </Card>
      )}

      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {['all', 'waiting', 'seated'].map(s => (
          <FilterPill key={s} label={s[0].toUpperCase() + s.slice(1)} active={filter === s} onClick={() => setFilter(s)} />
        ))}
      </div>

      {filtered.map((w, i) => (
        <Card key={w.id} style={{ padding: 12, marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600 }}>
                #{i + 1} · {w.name} <span style={{ fontSize: 11, marginLeft: 6, color: 'var(--text-muted)' }}>{w.source === 'app' ? '📲 App' : '🚶 Walk-in'}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Party {w.party} · joined {w.joined} · {w.wait > 0 ? `~${w.wait} min wait` : 'seated'}</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {w.status === 'waiting' && <>
                <Button size="sm" variant="secondary" onClick={() => setStatus(w.id, 'notified')}>Notify</Button>
                <Button size="sm" onClick={() => setAssigning(w)}>Assign table</Button>
              </>}
              {w.table && <span style={{ fontSize: 11, color: 'var(--green)', background: 'var(--green-bg)', padding: '3px 8px', borderRadius: 8 }}>{w.table}</span>}
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
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>For {assigning.name} · party of {assigning.party}</div>
            {AVAILABLE_TABLES.filter(t => t.seats >= assigning.party).map(t => (
              <div key={t.id} onClick={() => confirmAssign(assigning, t)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', marginBottom: 8, cursor: 'pointer' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>🪑 {t.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.seats} seats</div>
                </div>
                <span style={{ color: 'var(--orange)', fontWeight: 600, fontSize: 13 }}>Assign →</span>
              </div>
            ))}
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10 }}>Once assigned, table is reserved, the customer's order is updated, and a confirmation email is sent.</div>
          </div>
        </div>
      )}
    </div>
  );
}

const inp ={ padding: 10, border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', background: 'var(--bg2)', fontFamily: 'var(--font)', fontSize: 13 };
