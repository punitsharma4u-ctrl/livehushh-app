import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { LiveBadge, AiStrip, FilterPill, Button } from '../../components/UI';

const CATEGORIES = ['All', 'Starters', 'Mains', 'Sides', 'Desserts', 'Drinks'];

export default function MenuPage() {
  const { restaurantId } = useParams();
  const { restaurants, menuItems, addToCart, cart, cartTotal } = useApp();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');

  const restaurant = restaurants.find(r => r.id === restaurantId) || restaurants[0];
  const items = menuItems[restaurantId] || menuItems['spice-garden'] || [];

  const filtered = items.filter(i => activeCategory === 'All' || i.category === activeCategory);

  const getCartQty = (id) => {
    const item = cart.find(i => i.id === id);
    return item ? item.qty : 0;
  };

  const finalPrice = (item) => item.isLiveDeal ? (item.price * (1 - item.dealDiscount / 100)).toFixed(2) : item.price.toFixed(2);

  return (
    <div style={{ paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ background: restaurant.bgColor, padding: '14px 16px', borderBottom: '0.5px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--text-sec)' }}>← Back</button>
          {restaurant.isLive && <LiveBadge viewers={restaurant.liveViewers} />}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 32 }}>{restaurant.emoji}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text)' }}>{restaurant.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-sec)' }}>{restaurant.cuisine} · ⭐ {restaurant.rating} ({restaurant.reviewCount} reviews)</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 16px 0' }}>
        <AiStrip>
          <strong style={{ color: 'var(--orange)' }}>AI recommends</strong> — Lamb Rogan Josh is being cooked live right now and has 20% off. 47 people ordered it today!
        </AiStrip>

        {/* Category filters */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 12, scrollbarWidth: 'none' }}>
          {CATEGORIES.map(c => (
            <FilterPill key={c} label={c} active={activeCategory === c} onClick={() => setActiveCategory(c)} />
          ))}
        </div>

        {/* Active deal banner */}
        {restaurant.hasActiveDeal && (
          <div style={{ background: 'var(--orange)', borderRadius: 'var(--r-md)', padding: '10px 14px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>🏷 Live deal active!</div>
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>{restaurant.dealText} — ends when stream ends</div>
            </div>
            <span style={{ fontSize: 22 }}>⚡</span>
          </div>
        )}

        {/* Menu items */}
        {filtered.map(item => {
          const qty = getCartQty(item.id);
          const price = parseFloat(finalPrice(item));
          return (
            <div key={item.id} style={{ display: 'flex', gap: 12, background: 'var(--white)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: 12, marginBottom: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 60, height: 60, borderRadius: 10, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>{item.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>
                    {item.name}
                    {item.popular && <span style={{ marginLeft: 6, background: 'var(--bg3)', color: 'var(--orange)', fontSize: 9, padding: '1px 6px', borderRadius: 999, fontWeight: 600 }}>Popular</span>}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.4 }}>{item.desc}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--orange)' }}>${price}</span>
                    {item.isLiveDeal && (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', textDecoration: 'line-through' }}>${item.price}</span>
                    )}
                    {item.isLiveDeal && (
                      <span style={{ background: 'var(--orange-pale)', border: '0.5px solid var(--orange-border)', color: 'var(--orange)', fontSize: 10, padding: '1px 6px', borderRadius: 999, fontWeight: 600 }}>
                        {item.dealDiscount}% off live
                      </span>
                    )}
                  </div>
                  {qty === 0 ? (
                    <button onClick={() => addToCart(item)} style={{ background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                      + Add
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--orange-pale)', borderRadius: 8, padding: '2px 4px', border: '0.5px solid var(--orange-border)' }}>
                      <button onClick={() => addToCart({ ...item, qty: -1 })} style={{ width: 26, height: 26, background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 16 }}>−</button>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--orange)', minWidth: 16, textAlign: 'center' }}>{qty}</span>
                      <button onClick={() => addToCart(item)} style={{ width: 26, height: 26, background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 16 }}>+</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart bar */}
      {cart.length > 0 && (
        <div style={{ position: 'fixed', bottom: 64, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, padding: '0 16px', zIndex: 90 }}>
          <div style={{ background: 'var(--orange)', borderRadius: 'var(--r-lg)', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 20px rgba(232,93,4,0.35)' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>Pre-order · {cart.reduce((s, i) => s + i.qty, 0)} items</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>${cartTotal.toFixed(2)} · Est. ready in 25 min</div>
            </div>
            <button style={{ background: '#fff', color: 'var(--orange)', border: 'none', borderRadius: 10, padding: '8px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              Pre-order →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
