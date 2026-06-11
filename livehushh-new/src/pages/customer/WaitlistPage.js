import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AiStrip, Button, Card, ProgressBar, EmptyState } from '../../components/UI';

/* ─── Waitlist Page ─── */
export function WaitlistPage() {
  const { waitlist, joinWaitlist, restaurants } = useApp();
  const navigate = useNavigate();
  const [guests, setGuests] = useState(2);

  if (!waitlist) {
    return (
      <div style={{ padding: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 4 }}>Waitlist</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Join a restaurant's live queue remotely</div>
        <AiStrip>
          <strong style={{ color: 'var(--orange)' }}>AI tip</strong> — Spice Garden has the shortest wait right now at 12 min. Napoli Kitchen is 25 min.
        </AiStrip>
        {restaurants.filter(r => r.isLive && r.waitlistCount > 0).map(r => (
          <div key={r.id} style={{ background: 'var(--white)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '14px', marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 22 }}>{r.emoji}</span>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{r.name}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>⏱ ~{r.waitMinutes} min · {r.waitlistCount} in queue</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Guests</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => setGuests(g => Math.max(1, g - 1))} style={{ width: 28, height: 28, borderRadius: 8, border: '0.5px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', fontWeight: 700 }}>−</button>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{guests}</span>
                  <button onClick={() => setGuests(g => g + 1)} style={{ width: 28, height: 28, borderRadius: 8, border: '0.5px solid var(--border)', background: 'var(--bg2)', cursor: 'pointer', fontWeight: 700 }}>+</button>
                </div>
              </div>
            </div>
            <Button onClick={() => joinWaitlist(r.id, guests)} fullWidth>Join waitlist</Button>
          </div>
        ))}
      </div>
    );
  }

  const restaurant = restaurants.find(r => r.id === waitlist.restaurantId);
  const progress = ((waitlist.total - waitlist.position + 1) / waitlist.total) * 100;

  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Your waitlist</div>

      <div style={{ background: 'var(--white)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 20, marginBottom: 14, textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 28 }}>{restaurant?.emoji}</span>
          <span style={{ fontWeight: 600, fontSize: 16 }}>{restaurant?.name}</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Your position in queue</div>
        <div style={{ fontSize: 64, fontWeight: 700, color: 'var(--orange)', lineHeight: 1, marginBottom: 8 }}>{waitlist.position}</div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>of {waitlist.total} in queue</div>
        <ProgressBar value={progress} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, color: 'var(--text-muted)' }}>
          <span>{waitlist.position - 1} parties ahead</span>
          <span>~{restaurant?.waitMinutes} min wait</span>
        </div>
      </div>

      <div style={{ background: 'var(--green-bg)', border: '0.5px solid var(--green-border)', borderRadius: 'var(--r-md)', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <div><div style={{ color: 'var(--green)', fontSize: 11 }}>⏱ Estimated seating</div><div style={{ fontWeight: 600, fontSize: 16 }}>{waitlist.estimatedTime}</div></div>
        <div style={{ textAlign: 'right' }}><div style={{ color: 'var(--green)', fontSize: 11 }}>Table for</div><div style={{ fontWeight: 600, fontSize: 16 }}>{waitlist.guests} guests</div></div>
      </div>

      <AiStrip>
        <strong style={{ color: 'var(--orange)' }}>AI tip</strong> — Pre-order now to cut your in-seat wait by 15 min. Lamb Rogan Josh is cooking live right now!
      </AiStrip>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <Button onClick={() => alert('Navigate to menu')} fullWidth>🍽 Pre-order food</Button>
        <Button variant="secondary" style={{ color: '#cc2200' }} fullWidth>✕ Leave queue</Button>
      </div>

      <div style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: 14 }}>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Queue updates</div>
        {[
          { dot: 'var(--green)', text: 'Table 4 seated — queue moved up' },
          { dot: 'var(--orange)', text: 'New deal pushed — 20% off biryani' },
          { dot: 'var(--border2)', text: `You joined queue at ${new Date(waitlist.joinedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.dot, flexShrink: 0 }} />
            <div style={{ fontSize: 12, color: 'var(--text-sec)' }}>{item.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Orders Page ─── */
export function OrdersPage() {
  const navigate = useNavigate();

  const orders = [
    { id: 'O034', tracking: 'LH-2026-0034', restaurant: 'Spice Garden', emoji: '🍛', status: 'preparing', type: 'dine-in-now', table: 'Table 5', items: ['Lamb Rogan Josh × 1', 'Garlic Naan × 2'], total: 23, progress: 50, eta: '~8 min' },
    { id: 'O028', tracking: 'LH-2026-0028', restaurant: 'Napoli Kitchen', emoji: '🍕', status: 'completed', type: 'pickup', items: ['Margherita Pizza × 1', 'Tiramisu × 1'], total: 28, progress: 100, eta: null },
    { id: 'O021', tracking: 'LH-2026-0021', restaurant: 'Burger Barn', emoji: '🍔', status: 'completed', type: 'delivery', items: ['Smash Burger × 2', 'Fries × 2'], total: 32, progress: 100, eta: null },
  ];
  const typeIcon = t => ({ 'dine-in-now': '🍽️', 'dine-in-later': '📅', pickup: '🛍️', delivery: '🛵' }[t] || '🧾');
  const typeLabel = t => ({ 'dine-in-now': 'Dine in', 'dine-in-later': 'Reservation', pickup: 'Pickup', delivery: 'Delivery' }[t] || 'Order');
  const qrFor = t => `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(t)}`;

  const statusColors = { preparing: 'var(--green)', completed: 'var(--text-muted)', new: 'var(--orange)' };
  const statusLabels = { preparing: 'Preparing', completed: 'Completed', new: 'New' };
  const STEPS = ['Placed', 'Preparing', 'Ready', 'Served'];

  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 4 }}>My orders</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Track your pre-orders and past visits</div>

      <AiStrip>
        <strong style={{ color: 'var(--orange)' }}>AI update</strong> — Your Lamb Rogan Josh is being plated. Ready in ~8 min. Watch it live!
      </AiStrip>

      {orders.map(order => (
        <div key={order.id} style={{ background: 'var(--white)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: 14, marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 22 }}>{order.emoji}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{order.restaurant}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{typeIcon(order.type)} {typeLabel(order.type)} · #{order.id}{order.table ? ` · ${order.table}` : ''}</div>
              </div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: statusColors[order.status], background: order.status === 'preparing' ? 'var(--green-bg)' : 'var(--bg3)', padding: '3px 8px', borderRadius: 8 }}>
              {statusLabels[order.status]}
            </span>
          </div>

          {/* Tracking + QR */}
          <div style={{ display: 'flex', gap: 10, padding: 10, background: 'var(--bg2)', borderRadius: 'var(--r-md)', marginBottom: 10, alignItems: 'center' }}>
            <img src={qrFor(order.tracking)} alt="QR" width={56} height={56} style={{ borderRadius: 6, background: '#fff' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.7 }}>Tracking ID</div>
              <div style={{ fontWeight: 700, fontSize: 14, fontFamily: 'monospace' }}>{order.tracking}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Show this QR at the counter</div>
            </div>
          </div>

          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.6 }}>{order.items.join(', ')}</div>

          {order.status === 'preparing' && (
            <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '10px 12px', marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-sec)' }}>Order progress</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{order.eta}</span>
              </div>
              <ProgressBar value={order.progress} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
                {STEPS.map((s, i) => (
                  <span key={i} style={{ fontSize: 9, color: i * 25 <= order.progress ? 'var(--orange)' : 'var(--text-muted)', fontWeight: i * 25 <= order.progress ? 600 : 400 }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: 'var(--orange)', fontSize: 15 }}>${order.total}</span>
            {order.status === 'preparing'
              ? <button onClick={() => navigate(`/live/spice-garden`)} style={{ background: 'var(--orange-pale)', color: 'var(--orange)', border: '0.5px solid var(--orange-border)', borderRadius: 8, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>📡 Watch live</button>
              : <button style={{ background: 'var(--bg2)', color: 'var(--text-sec)', border: '0.5px solid var(--border)', borderRadius: 8, padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>Reorder</button>
            }
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Profile Page ─── */
export function ProfilePage() {
  return (
    <div style={{ padding: 16 }}>
      <div style={{ textAlign: 'center', padding: '24px 0 20px' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--orange)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#fff', fontWeight: 700 }}>T</div>
        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 2 }}>Tripta</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Member since 2024 · 12 visits</div>
      </div>

      <div style={{ background: 'var(--orange-pale)', border: '0.5px solid var(--orange-border)', borderRadius: 'var(--r-md)', padding: 14, marginBottom: 16, display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
        {[['12', 'Visits'], ['3', 'Waitlists'], ['$284', 'Spent'], ['8', 'Streams watched']].map(([v, l]) => (
          <div key={l}><div style={{ fontWeight: 700, fontSize: 18, color: 'var(--orange)' }}>{v}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l}</div></div>
        ))}
      </div>

      {[
        { icon: '❤️', label: 'Saved restaurants', count: 4 },
        { icon: '🔔', label: 'Stream reminders', count: 2 },
        { icon: '🍽', label: 'Dietary preferences', count: null },
        { icon: '📍', label: 'Saved addresses', count: 1 },
        { icon: '💳', label: 'Payment methods', count: null },
        { icon: '🔒', label: 'Privacy & security', count: null },
        { icon: '❓', label: 'Help & support', count: null },
      ].map(item => (
        <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '0.5px solid var(--border)', cursor: 'pointer' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span style={{ fontSize: 14, color: 'var(--text)' }}>{item.label}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {item.count && <span style={{ background: 'var(--orange-pale)', color: 'var(--orange)', fontSize: 11, fontWeight: 600, padding: '1px 7px', borderRadius: 999 }}>{item.count}</span>}
            <span style={{ color: 'var(--text-muted)' }}>›</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default WaitlistPage;
