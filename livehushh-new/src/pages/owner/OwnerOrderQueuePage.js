import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AiStrip, OrderStatusBadge, Button } from '../../components/UI';

const orderTypeIcon = t => ({ 'dine-in': '🍽️', 'dine-in-now': '🍽️', 'dine-in-later': '📅', pickup: '🛍️', delivery: '🛵' }[t] || '🧾');
const orderTypeLabel = t => ({ 'dine-in': 'Dine in', 'dine-in-now': 'Dine in', 'dine-in-later': 'Reservation', pickup: 'Pickup', delivery: 'Delivery' }[t] || 'Order');
function Detail({ label, value }) {
  return (
    <div style={{ background: 'var(--bg2)', borderRadius: 'var(--r-md)', padding: '8px 10px' }}>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{value}</div>
    </div>
  );
}

/* ─── Order Queue ─── */
export function OwnerOrderQueuePage() {
  const { orders, updateOrderStatus } = useApp();
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const next = { new: 'preparing', preparing: 'ready', ready: 'served' };
  const nextLabel = { new: 'Accept', preparing: 'Mark ready', ready: 'Mark served' };

  const filtered = orders.filter(o => filter === 'all' || o.status === filter);
  const counts = { new: orders.filter(o => o.status === 'new').length, preparing: orders.filter(o => o.status === 'preparing').length, ready: orders.filter(o => o.status === 'ready').length };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Order queue</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
        {[['new', '#cc2200', 'New'], ['preparing', 'var(--green)', 'Preparing'], ['ready', 'var(--orange)', 'Ready']].map(([status, color, label]) => (
          <div key={status} onClick={() => setFilter(filter === status ? 'all' : status)} style={{ background: filter === status ? 'var(--orange-pale)' : 'var(--bg2)', border: `0.5px solid ${filter === status ? 'var(--orange-border)' : 'var(--border)'}`, borderRadius: 'var(--r-md)', padding: '10px', textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ fontWeight: 700, fontSize: 20, color }}>{counts[status]}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      <AiStrip>
        <strong style={{ color: 'var(--orange)' }}>AI alert</strong> — Orders O013 &amp; O014 have identical items. Batch together to save 6 min kitchen time.
      </AiStrip>

      {filtered.map(order => {
        const expanded = expandedId === order.id;
        return (
          <div key={order.id} style={{ background: 'var(--white)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: 14, marginBottom: 10 }}>
            {/* Compact header — always visible, click to expand */}
            <div onClick={() => setExpandedId(expanded ? null : order.id)} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{orderTypeIcon(order.type)}</span>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>#{order.id}</span>
                    <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-muted)' }}>{orderTypeLabel(order.type)} · {order.time}</span>
                  </div>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              <div style={{ background: 'var(--bg2)', borderRadius: 'var(--r-md)', padding: '10px 12px', marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.7, fontWeight: 600, marginBottom: 6 }}>Items ({order.items.length})</div>
                {order.items.map((it, i) => (
                  <div key={i} style={{ fontSize: 13, color: 'var(--text)', padding: '3px 0' }}>• {it}</div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--orange)' }}>${order.total}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{expanded ? '▲ Hide details' : '▼ Tap for details'}</span>
              </div>
            </div>

            {/* Expanded section */}
            {expanded && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '0.5px dashed var(--border)' }}>
                <div style={{ display: 'flex', gap: 10, padding: 10, background: 'var(--bg2)', borderRadius: 'var(--r-md)', marginBottom: 10, alignItems: 'center' }}>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent('LH-2026-' + order.id)}`} alt="QR" width={60} height={60} style={{ borderRadius: 4, background: '#fff' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.7 }}>Tracking ID</div>
                    <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 14 }}>LH-2026-{order.id}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Scan to verify pickup / serving</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  <Detail label="Table" value={order.table || '—'} />
                  <Detail label="Type" value={orderTypeLabel(order.type)} />
                  <Detail label="Placed" value={order.time} />
                  <Detail label="Amount" value={`$${order.total}`} />
                </div>

                {order.status !== 'served' && (
                  <button
                    onClick={e => { e.stopPropagation(); updateOrderStatus(order.id, next[order.status]); }}
                    style={{ width: '100%', background: order.status === 'new' ? 'var(--orange)' : order.status === 'preparing' ? 'var(--green)' : 'var(--bg2)', color: order.status === 'ready' ? 'var(--text-sec)' : '#fff', border: '0.5px solid var(--border)', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                  >
                    {nextLabel[order.status]}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Menu Manager ─── */
export function OwnerMenuManagerPage() {
  const { menuItems } = useApp();
  const items = menuItems['spice-garden'] || [];
  const [showAdd, setShowAdd] = useState(false);
  const [showScan, setShowScan] = useState(false);
  const [showDeal, setShowDeal] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [deal, setDeal] = useState({ discount: 20, mode: 'hours', hours: 2, startDate: '', endDate: '', startTime: '', endTime: '' });

  const onScan = e => {
    if (!e.target.files?.[0]) return;
    // Mock OCR result
    setTimeout(() => setScanResult([
      { name: 'Paneer Tikka', price: 14, category: 'Starter' },
      { name: 'Butter Chicken', price: 18, category: 'Main' },
      { name: 'Garlic Naan', price: 5, category: 'Bread' },
      { name: 'Mango Lassi', price: 6, category: 'Drink' },
    ]), 800);
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 8, flexWrap: 'wrap' }}>
        <div style={{ fontWeight: 700, fontSize: 20 }}>Menu manager</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Button size="sm" variant="ghost" onClick={() => setShowDeal('__all__')}>🏷 Deal on all</Button>
          <Button size="sm" variant="secondary" onClick={() => setShowScan(s => !s)}>📷 Scan menu</Button>
          <Button size="sm" onClick={() => setShowAdd(true)}>+ Add item</Button>
        </div>
      </div>

      {showScan && (
        <div style={{ background: 'var(--white)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: 14, marginBottom: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>📷 Scan menu card or photo</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>Upload a photo of a menu — we'll extract items with AI (Textract) and let you import them.</div>
          <input type="file" accept="image/*,.pdf" onChange={onScan} />
          {scanResult && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--orange)', fontWeight: 600, marginBottom: 6 }}>✦ AI detected {scanResult.length} items</div>
              {scanResult.map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '0.5px solid var(--border)', fontSize: 13 }}>
                  <span>{s.name} <span style={{ color: 'var(--text-muted)' }}>· {s.category}</span></span>
                  <span style={{ fontWeight: 600 }}>${s.price}</span>
                </div>
              ))}
              <Button fullWidth onClick={() => { setScanResult(null); setShowScan(false); }} style={{ marginTop: 10 }}>Import all to menu</Button>
            </div>
          )}
        </div>
      )}

      <AiStrip>
        <strong style={{ color: 'var(--orange)' }}>AI tip</strong> — Lamb Rogan Josh gets 3x more orders when you feature it during live streams. Pin it to the top tonight.
      </AiStrip>

      {items.map(item => (
        <div key={item.id} style={{ display: 'flex', gap: 12, background: 'var(--white)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: 12, marginBottom: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 28 }}>{item.emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{item.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{item.category} · ${item.price}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {item.isLiveDeal && <span style={{ background: 'var(--orange-pale)', color: 'var(--orange)', fontSize: 10, padding: '1px 7px', borderRadius: 999, fontWeight: 600, border: '0.5px solid var(--orange-border)' }}>Live deal {item.dealDiscount}% off</span>}
              {item.popular && <span style={{ background: 'var(--bg3)', color: 'var(--text-muted)', fontSize: 10, padding: '1px 7px', borderRadius: 999 }}>Popular</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <label style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)', borderRadius: 7, padding: '5px 10px', fontSize: 12, cursor: 'pointer', color: 'var(--text-sec)' }}>
              📷 Photo
              <input type="file" accept="image/*" style={{ display: 'none' }} />
            </label>
            <button onClick={() => setShowDeal(item.id)} style={{ background: 'var(--orange-pale)', border: '0.5px solid var(--orange-border)', borderRadius: 7, padding: '5px 10px', fontSize: 12, cursor: 'pointer', color: 'var(--orange)', fontWeight: 600 }}>🏷 Deal</button>
            <button style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)', borderRadius: 7, padding: '5px 10px', fontSize: 12, cursor: 'pointer', color: 'var(--text-sec)' }}>Edit</button>
          </div>
        </div>
      ))}

      {showDeal && (
        <div onClick={() => setShowDeal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--white)', borderRadius: 'var(--r-lg)', padding: 20, width: '100%', maxWidth: 380 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 700 }}>{showDeal === '__all__' ? 'Apply deal to all items' : 'Set live deal'}</div>
              <button onClick={() => setShowDeal(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>Discount %</label>
                <input type="number" value={deal.discount} onChange={e => setDeal({ ...deal, discount: +e.target.value })} style={dInp} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>Active for</label>
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  {['hours', 'time', 'dates'].map(m => (
                    <button key={m} onClick={() => setDeal({ ...deal, mode: m })} style={{
                      flex: 1, padding: '6px 10px', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      border: `0.5px solid ${deal.mode === m ? 'var(--orange)' : 'var(--border)'}`,
                      background: deal.mode === m ? 'var(--orange-pale)' : 'var(--bg2)',
                      color: deal.mode === m ? 'var(--orange)' : 'var(--text-sec)',
                    }}>{m === 'hours' ? 'Next N hrs' : m === 'time' ? 'Time window' : 'Date range'}</button>
                  ))}
                </div>
              </div>
              {deal.mode === 'hours' && (
                <input type="number" min={1} value={deal.hours} onChange={e => setDeal({ ...deal, hours: +e.target.value })} placeholder="Hours" style={dInp} />
              )}
              {deal.mode === 'time' && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <input type="time" value={deal.startTime} onChange={e => setDeal({ ...deal, startTime: e.target.value })} style={{ ...dInp, flex: 1 }} />
                  <input type="time" value={deal.endTime} onChange={e => setDeal({ ...deal, endTime: e.target.value })} style={{ ...dInp, flex: 1 }} />
                </div>
              )}
              {deal.mode === 'dates' && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <input type="date" value={deal.startDate} onChange={e => setDeal({ ...deal, startDate: e.target.value })} style={{ ...dInp, flex: 1 }} />
                  <input type="date" value={deal.endDate} onChange={e => setDeal({ ...deal, endDate: e.target.value })} style={{ ...dInp, flex: 1 }} />
                </div>
              )}
              <Button fullWidth onClick={() => setShowDeal(null)}>Activate deal</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const dInp = { width: '100%', padding: 10, border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', background: 'var(--bg2)', fontFamily: 'var(--font)', fontSize: 13, marginTop: 4 };

/* ─── Analytics ─── */
export function OwnerAnalyticsPage() {
  const hours = ['10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p'];
  const data = [12, 8, 34, 28, 18, 22, 30, 65, 88, 95, 76, 52];
  const max = Math.max(...data);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Analytics</div>

      <AiStrip>
        <strong style={{ color: 'var(--orange)' }}>AI insight</strong> — Your 8–9pm slot generates 3× more revenue than lunch. Going live at 7:30pm is your optimal start time.
      </AiStrip>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {[['$2,840', 'Revenue today', '+23%'], ['847', 'Total viewers', '+41%'], ['124', 'Orders placed', '+18%'], ['14.6%', 'Viewer → order', '+2.3%']].map(([v, l, d]) => (
          <div key={l} style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '12px 14px' }}>
            <div style={{ fontWeight: 700, fontSize: 20, color: 'var(--orange)', marginBottom: 2 }}>{v}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l}</div>
            <div style={{ fontSize: 11, color: 'var(--green)', marginTop: 3 }}>{d} vs yesterday</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '14px', marginBottom: 14 }}>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 14 }}>Viewers by hour — today</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80, marginBottom: 6 }}>
          {data.map((v, i) => (
            <div key={i} style={{ flex: 1, background: v >= 80 ? 'var(--orange)' : 'var(--border2)', borderRadius: '3px 3px 0 0', height: `${(v / max) * 100}%`, transition: 'height 0.3s' }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {hours.map(h => <div key={h} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--text-muted)' }}>{h}</div>)}
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 10, fontSize: 11, color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, background: 'var(--orange)', borderRadius: 2, display: 'inline-block' }} /> Peak hours</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, background: 'var(--border2)', borderRadius: 2, display: 'inline-block' }} /> Regular</span>
        </div>
      </div>

      <div style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: 14 }}>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Top dishes this week</div>
        {[['Lamb Rogan Josh', 89, '$1,602'], ['Chicken Tikka Masala', 64, '$1,024'], ['Garlic Naan', 120, '$600'], ['Vegetable Biryani', 42, '$588']].map(([name, count, rev]) => (
          <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '0.5px solid var(--border)' }}>
            <div style={{ fontSize: 13 }}>{name}</div>
            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)' }}>
              <span>{count} orders</span>
              <span style={{ color: 'var(--orange)', fontWeight: 600 }}>{rev}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OwnerOrderQueuePage;
