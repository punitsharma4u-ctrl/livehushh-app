import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../../components/UI';
import { useApp } from '../../context/AppContext';

export default function GoLivePage() {
  const [phase, setPhase] = useState('setup');
  const [title, setTitle] = useState('Lunch rush — dosas hot off the griddle');
  const [blurFaces, setBlurFaces] = useState(true);
  const [dealOn, setDealOn] = useState(false);
  const [dealScope, setDealScope] = useState('all'); // 'all' | 'selected'
  const [dealDiscount, setDealDiscount] = useState(20);
  const [dealDuration, setDealDuration] = useState(2);
  const [selectedItems, setSelectedItems] = useState([]);
  const { menuItems } = useApp();
  const items = (menuItems && menuItems['spice-garden']) || [];
  const navigate = useNavigate();

  const toggleItem = id => setSelectedItems(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const inp = { width: '100%', padding: 10, border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', background: 'var(--white)', fontFamily: 'var(--font)', fontSize: 13 };

  if (phase === 'live') {
    return (
      <div style={{ maxWidth: 560, margin: '40px auto', padding: 20 }}>
        <Card style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FF3B3B', color: '#fff', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 999, marginBottom: 16 }}>
            <span style={{ width: 6, height: 6, background: '#fff', borderRadius: '50%' }} /> LIVE NOW
          </div>
          <div style={{ background: 'var(--bg3)', height: 220, borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60, marginBottom: 16 }}>📹</div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>{title}</div>
          <div style={{ fontSize: 13, color: 'var(--text-sec)', marginBottom: 18 }}>0 viewers · streaming to your followers</div>
          <Button variant="danger" onClick={() => navigate('/owner/studio')}>End stream</Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: '40px auto', padding: 20 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 14 }}>Go live</h1>
      <Card style={{ padding: 24 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Stream title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%', marginTop: 6, marginBottom: 14, padding: 10, border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', background: 'var(--bg2)', fontFamily: 'var(--font)', fontSize: 13 }} />

        <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, cursor: 'pointer' }}>
          <input type="checkbox" checked={blurFaces} onChange={e => setBlurFaces(e.target.checked)} />
          <span style={{ fontSize: 14 }}>Auto-blur customer faces (recommended)</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, cursor: 'pointer' }}>
          <input type="checkbox" defaultChecked />
          <span style={{ fontSize: 14 }}>Enable live chat</span>
        </label>

        <div style={{ background: 'var(--bg3)', height: 180, borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--text-muted)', marginBottom: 18 }}>
          📷 Camera preview
        </div>

        {/* Apply live deal */}
        <div style={{ border: '0.5px solid var(--orange-border)', background: 'var(--orange-pale)', borderRadius: 'var(--r-md)', padding: 14, marginBottom: 14 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: dealOn ? 12 : 0 }}>
            <input type="checkbox" checked={dealOn} onChange={e => setDealOn(e.target.checked)} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>🏷 Apply live deal</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Push a discount to viewers the moment you go live</div>
            </div>
          </label>

          {dealOn && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>Apply to</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[['all', 'All menu items'], ['selected', 'Selected items']].map(([v, l]) => (
                    <button key={v} type="button" onClick={() => setDealScope(v)} style={{
                      flex: 1, padding: '8px 10px', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      border: `0.5px solid ${dealScope === v ? 'var(--orange)' : 'var(--border)'}`,
                      background: dealScope === v ? 'var(--orange)' : 'var(--white)',
                      color: dealScope === v ? '#fff' : 'var(--text-sec)',
                    }}>{l}</button>
                  ))}
                </div>
              </div>

              {dealScope === 'selected' && items.length > 0 && (
                <div style={{ background: 'var(--white)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: 8, maxHeight: 180, overflowY: 'auto' }}>
                  {items.map(it => (
                    <label key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 4px', cursor: 'pointer', fontSize: 13 }}>
                      <input type="checkbox" checked={selectedItems.includes(it.id)} onChange={() => toggleItem(it.id)} />
                      <span style={{ fontSize: 16 }}>{it.emoji}</span>
                      <span style={{ flex: 1 }}>{it.name}</span>
                      <span style={{ color: 'var(--text-muted)' }}>${it.price}</span>
                    </label>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>Discount %</div>
                  <input type="number" min={5} max={90} value={dealDiscount} onChange={e => setDealDiscount(+e.target.value)} style={inp} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>Active for (hrs)</div>
                  <input type="number" min={1} max={24} value={dealDuration} onChange={e => setDealDuration(+e.target.value)} style={inp} />
                </div>
              </div>

              <div style={{ fontSize: 12, color: 'var(--text-sec)', textAlign: 'center', padding: 6, background: 'var(--white)', borderRadius: 'var(--r-md)' }}>
                ✦ <strong>{dealDiscount}% off</strong> {dealScope === 'all' ? 'all items' : `${selectedItems.length} item${selectedItems.length === 1 ? '' : 's'}`} for <strong>{dealDuration}h</strong>
              </div>
            </div>
          )}
        </div>

        <Button fullWidth size="lg" onClick={() => setPhase('live')}>Start broadcasting{dealOn ? ' + push deal' : ''}</Button>
      </Card>
    </div>
  );
}
