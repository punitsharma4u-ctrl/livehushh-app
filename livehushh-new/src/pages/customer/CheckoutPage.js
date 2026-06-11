import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../../components/UI';
import { useApp } from '../../context/AppContext';

const ORDER_TYPES = [
  { v: 'dine-in-now',   label: 'Dine in · Now',    icon: '🍽️',  desc: 'We add you to the waitlist' },
  { v: 'dine-in-later', label: 'Dine in · Later',  icon: '📅',  desc: 'We reserve a table for you' },
  { v: 'pickup',        label: 'Pickup',           icon: '🛍️',  desc: 'Order ready for collection' },
  { v: 'delivery',      label: 'Delivery',         icon: '🛵',  desc: 'Brought to your address' },
];

export default function CheckoutPage() {
  const { cart = [], setCart, joinWaitlist } = useApp();
  const navigate = useNavigate();
  const [type, setType] = useState('dine-in-now');
  const [phone, setPhone] = useState('');
  const [party, setParty] = useState(2);
  const [whenDate, setWhenDate] = useState('');
  const [whenTime, setWhenTime] = useState('');
  const [address, setAddress] = useState('');
  const [card, setCard] = useState('');

  const total = cart.reduce((s, i) => s + (i.price * (i.qty || 1)), 0);

  const submit = e => {
    e.preventDefault();
    if (type === 'dine-in-now') joinWaitlist && joinWaitlist('spice-garden', party);
    setCart && setCart([]);
    if (type === 'dine-in-now') navigate('/waitlist');
    else if (type === 'dine-in-later') navigate('/orders?tab=reservations');
    else navigate('/orders');
  };

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 14 }}>Checkout</h1>

      {/* Order type */}
      <Card style={{ padding: 14, marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 10 }}>How would you like it?</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {ORDER_TYPES.map(t => (
            <button key={t.v} type="button" onClick={() => setType(t.v)} style={{
              padding: 12, border: `1.5px solid ${type === t.v ? 'var(--orange)' : 'var(--border)'}`,
              background: type === t.v ? 'var(--orange-pale)' : 'var(--white)',
              borderRadius: 'var(--r-md)', cursor: 'pointer', textAlign: 'left',
            }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{t.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{t.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{t.desc}</div>
            </button>
          ))}
        </div>
      </Card>

      <Card style={{ padding: 14, marginBottom: 14 }}>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field label="Phone number *">
            <input value={phone} onChange={e => setPhone(e.target.value)} required type="tel" placeholder="+1 (555) 000-0000" style={inp} />
          </Field>

          {(type === 'dine-in-now' || type === 'dine-in-later') && (
            <Field label="Party size *">
              <input value={party} onChange={e => setParty(+e.target.value)} required type="number" min={1} max={20} style={inp} />
            </Field>
          )}

          {type === 'dine-in-later' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <Field label="Date *"><input value={whenDate} onChange={e => setWhenDate(e.target.value)} required type="date" style={inp} /></Field>
              <Field label="Time *"><input value={whenTime} onChange={e => setWhenTime(e.target.value)} required type="time" style={inp} /></Field>
            </div>
          )}

          {type === 'pickup' && (
            <Field label="Pickup time *">
              <input required type="time" style={inp} />
            </Field>
          )}

          {type === 'delivery' && (
            <Field label="Delivery address *">
              <input value={address} onChange={e => setAddress(e.target.value)} required type="text" placeholder="Street, city" style={inp} />
            </Field>
          )}

          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.7, marginTop: 6 }}>Payment</div>
          <Field label="Card number *">
            <input value={card} onChange={e => setCard(e.target.value)} required type="text" placeholder="•••• •••• •••• ••••" style={inp} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Field label="Expiry"><input required placeholder="MM/YY" style={inp} /></Field>
            <Field label="CVC"><input required placeholder="123" style={inp} /></Field>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '0.5px solid var(--border)', marginTop: 6 }}>
            <span style={{ fontWeight: 700 }}>Total</span>
            <span style={{ fontWeight: 800, fontSize: 18 }}>${total.toFixed(2)}</span>
          </div>

          <Button type="submit" fullWidth size="lg">Confirm {ORDER_TYPES.find(t => t.v === type).label}</Button>
        </form>
      </Card>

      <Card style={{ padding: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Order summary</div>
        {cart.map(i => (
          <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-sec)', padding: '4px 0' }}>
            <span>{i.name} × {i.qty || 1}</span><span>${(i.price * (i.qty || 1)).toFixed(2)}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>{label}</label>
      <div style={{ marginTop: 4 }}>{children}</div>
    </div>
  );
}

const inp = { width: '100%', padding: 10, border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', background: 'var(--bg2)', fontFamily: 'var(--font)', fontSize: 13 };
