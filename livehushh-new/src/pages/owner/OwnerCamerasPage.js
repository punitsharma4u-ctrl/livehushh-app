import React, { useState } from 'react';
import { Button, Card, StatCard } from '../../components/UI';

const initial = [
  { id: 'C1', name: 'Front entrance', location: 'Main hall',   resolution: '1080p', on: true,  blur: true,  online: true },
  { id: 'C2', name: 'Kitchen view',   location: 'Kitchen',     resolution: '720p',  on: true,  blur: false, online: true },
  { id: 'C3', name: 'Bar area',       location: 'Bar',         resolution: '1080p', on: false, blur: true,  online: true },
  { id: 'C4', name: 'Patio',          location: 'Outdoor',     resolution: '1080p', on: true,  blur: true,  online: false },
];

export default function OwnerCamerasPage() {
  const [cams, setCams] = useState(initial);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', location: '', resolution: '1080p' });

  const toggle = (id, k) => setCams(cams.map(c => c.id === id ? { ...c, [k]: !c[k] } : c));
  const add = () => {
    setCams([...cams, { id: `C${Date.now()}`, ...form, on: true, blur: true, online: true }]);
    setForm({ name: '', location: '', resolution: '1080p' }); setShowAdd(false);
  };
  const remove = id => setCams(cams.filter(c => c.id !== id));

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Cameras</h1>
        <Button onClick={() => setShowAdd(s => !s)}>+ Add camera</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
        <StatCard value={cams.filter(c => c.on && c.online).length} label="Streaming" color="var(--green)" />
        <StatCard value={cams.filter(c => !c.on).length} label="Off" />
        <StatCard value={cams.filter(c => !c.online).length} label="Offline" color="var(--live)" />
      </div>

      {showAdd && (
        <Card style={{ padding: 14, marginBottom: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Configure new camera</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input placeholder="Camera name (e.g. Patio)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inp} />
            <input placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} style={inp} />
            <select value={form.resolution} onChange={e => setForm({ ...form, resolution: e.target.value })} style={inp}>
              <option>1080p</option><option>720p</option><option>4K</option>
            </select>
            <Button fullWidth onClick={add}>Add camera</Button>
          </div>
        </Card>
      )}

      {cams.map(c => (
        <Card key={c.id} style={{ padding: 14, marginBottom: 10 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ width: 90, height: 60, background: 'var(--bg3)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, position: 'relative' }}>
              📹
              {c.on && c.online && <span style={{ position: 'absolute', top: 4, left: 4, width: 6, height: 6, borderRadius: '50%', background: '#FF3B3B' }} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.location} · {c.resolution}</div>
                </div>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: c.online ? 'var(--green-bg)' : 'rgba(255,59,59,0.10)', color: c.online ? 'var(--green)' : '#cc2200' }}>
                  {c.online ? 'Online' : 'Offline'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                <Button size="sm" variant={c.on ? 'green' : 'secondary'} onClick={() => toggle(c.id, 'on')}>{c.on ? 'On' : 'Off'}</Button>
                <Button size="sm" variant={c.blur ? 'primary' : 'secondary'} onClick={() => toggle(c.id, 'blur')}>Face blur {c.blur ? '✓' : ''}</Button>
                <Button size="sm" variant="secondary" onClick={() => remove(c.id)}>Remove</Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

const inp = { padding: 10, border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', background: 'var(--bg2)', fontFamily: 'var(--font)', fontSize: 13 };
