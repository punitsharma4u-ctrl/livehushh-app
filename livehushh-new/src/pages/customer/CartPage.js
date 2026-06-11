import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, EmptyState } from '../../components/UI';
import { useApp } from '../../context/AppContext';

export default function CartPage() {
  const { cart = [], setCart } = useApp();
  const navigate = useNavigate();
  const [placed, setPlaced] = useState(false);

  const total = cart.reduce((s, i) => s + (i.price * (i.qty || 1)), 0);

  if (placed) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
        <h2 style={{ fontWeight: 700, marginBottom: 6 }}>Order placed!</h2>
        <p style={{ color: 'var(--text-sec)', fontSize: 13, marginBottom: 20 }}>Track your order from the Orders tab.</p>
        <Button onClick={() => navigate('/orders')}>View orders</Button>
      </div>
    );
  }

  if (cart.length === 0) {
    return <EmptyState emoji="🛒" title="Cart is empty" subtitle="Add menu items while watching a stream." action="Discover restaurants" onAction={() => navigate('/discover')} />;
  }

  const placeOrder = () => {
    setCart && setCart([]);
    setPlaced(true);
  };

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 14 }}>Your cart</h1>
      <Card style={{ padding: 16, marginBottom: 14 }}>
        {cart.map(item => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '0.5px solid var(--border)' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{item.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Qty {item.qty || 1}</div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>${(item.price * (item.qty || 1)).toFixed(2)}</div>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, fontWeight: 700 }}>
          <span>Total</span><span>${total.toFixed(2)}</span>
        </div>
      </Card>
      <Button fullWidth size="lg" onClick={() => navigate('/checkout')}>Continue to checkout · ${total.toFixed(2)}</Button>
    </div>
  );
}
