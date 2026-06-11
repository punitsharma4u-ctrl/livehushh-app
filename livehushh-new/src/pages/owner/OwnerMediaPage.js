import React, { useState } from 'react';
import { Button, Card, FilterPill } from '../../components/UI';

const initialMedia = [
  { id: 'M1', type: 'video', title: 'Lunch rush highlights', date: 'Jun 8', duration: '0:42', thumb: '🎬' },
  { id: 'M2', type: 'video', title: 'Chef Priya making naan', date: 'Jun 7', duration: '1:18', thumb: '🎥' },
  { id: 'M3', type: 'photo', title: 'New patio setup', date: 'Jun 6', thumb: '🌿' },
  { id: 'M4', type: 'photo', title: 'Diwali special menu', date: 'Jun 5', thumb: '🪔' },
  { id: 'M5', type: 'video', title: 'Last night\'s livestream', date: 'Jun 4', duration: '12:04', thumb: '📹' },
  { id: 'M6', type: 'photo', title: 'Front entrance', date: 'Jun 2', thumb: '🚪' },
];

export default function OwnerMediaPage() {
  const [media, setMedia] = useState(initialMedia);
  const [filter, setFilter] = useState('all');
  const [uploadOpen, setUploadOpen] = useState(false);

  const filtered = media.filter(m => filter === 'all' || m.type === filter);

  const onUpload = e => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newItems = files.map((f, i) => ({
      id: `M${Date.now()}${i}`,
      type: f.type.startsWith('video') ? 'video' : 'photo',
      title: f.name.replace(/\.[^/.]+$/, ''),
      date: 'Just now',
      duration: f.type.startsWith('video') ? '0:30' : undefined,
      thumb: f.type.startsWith('video') ? '🎬' : '🖼️',
    }));
    setMedia([...newItems, ...media]);
    setUploadOpen(false);
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Media gallery</h1>
        <Button onClick={() => setUploadOpen(s => !s)}>+ Upload</Button>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-sec)', marginBottom: 14 }}>
        Recent videos and photos of your restaurant. These show on your storefront and discovery card.
      </p>

      {uploadOpen && (
        <Card style={{ padding: 14, marginBottom: 14 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Upload videos or photos</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>Add clips from your kitchen, dining area, special events, or dishes.</div>
          <input type="file" accept="image/*,video/*" multiple onChange={onUpload} />
        </Card>
      )}

      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {[['all', 'All'], ['video', 'Videos'], ['photo', 'Photos']].map(([v, l]) => (
          <FilterPill key={v} label={l} active={filter === v} onClick={() => setFilter(v)} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
        {filtered.map(m => (
          <Card key={m.id} style={{ overflow: 'hidden' }}>
            <div style={{ height: 100, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, position: 'relative' }}>
              {m.thumb}
              {m.type === 'video' && (
                <span style={{ position: 'absolute', bottom: 6, right: 6, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 10, padding: '1px 6px', borderRadius: 4 }}>▶ {m.duration}</span>
              )}
            </div>
            <div style={{ padding: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{m.date}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
