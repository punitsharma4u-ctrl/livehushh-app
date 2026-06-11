import React from 'react';

/* ─── LiveBadge ─── */
export function LiveBadge({ viewers }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: '#FF3B3B', color: '#fff',
      fontSize: 10, fontWeight: 600, padding: '2px 8px',
      borderRadius: 999, letterSpacing: 0.3,
    }}>
      <span style={{ width: 5, height: 5, background: '#fff', borderRadius: '50%', display: 'inline-block' }} />
      LIVE{viewers ? ` · ${viewers}` : ''}
    </span>
  );
}

/* ─── AiBadge ─── */
export function AiBadge({ label = 'AI' }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: 'var(--orange-pale)', border: '0.5px solid var(--orange-border)',
      color: 'var(--orange)', fontSize: 10, fontWeight: 500,
      padding: '2px 8px', borderRadius: 999,
    }}>
      ✦ {label}
    </span>
  );
}

/* ─── AiStrip ─── */
export function AiStrip({ children }) {
  return (
    <div style={{
      background: 'var(--orange-pale)', border: '0.5px solid var(--orange-border)',
      borderRadius: 'var(--r-md)', padding: '10px 12px',
      display: 'flex', gap: 10, alignItems: 'flex-start',
      marginBottom: 14,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: 'var(--orange)', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, fontSize: 13, color: '#fff',
      }}>✦</div>
      <div style={{ fontSize: 12, lineHeight: 1.55, color: 'var(--text-sec)' }}>{children}</div>
    </div>
  );
}

/* ─── Card ─── */
export function Card({ children, style, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: 'var(--white)', border: '0.5px solid var(--border)',
      borderRadius: 'var(--r-md)', overflow: 'hidden',
      cursor: onClick ? 'pointer' : 'default',
      transition: onClick ? 'box-shadow 0.15s' : 'none',
      ...style,
    }}
    onMouseEnter={onClick ? e => e.currentTarget.style.boxShadow = 'var(--shadow-md)' : null}
    onMouseLeave={onClick ? e => e.currentTarget.style.boxShadow = 'none' : null}
    >
      {children}
    </div>
  );
}

/* ─── Button ─── */
export function Button({ children, variant = 'primary', size = 'md', onClick, style, disabled, fullWidth }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 6, fontWeight: 500, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s', borderRadius: 'var(--r-md)', fontFamily: 'var(--font)',
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? '100%' : 'auto',
  };
  const sizes = {
    sm: { padding: '6px 12px', fontSize: 12 },
    md: { padding: '10px 18px', fontSize: 13 },
    lg: { padding: '13px 24px', fontSize: 14 },
  };
  const variants = {
    primary: { background: 'var(--orange)', color: '#fff' },
    secondary: { background: 'var(--bg2)', color: 'var(--text)', border: '0.5px solid var(--border)' },
    danger: { background: '#FF3B3B', color: '#fff' },
    ghost: { background: 'transparent', color: 'var(--orange)', border: '1px solid var(--orange)' },
    green: { background: 'var(--green)', color: '#fff' },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...sizes[size], ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

/* ─── FilterPill ─── */
export function FilterPill({ label, active, onClick, icon }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '5px 12px', fontSize: 12, fontWeight: active ? 500 : 400,
      borderRadius: 999, border: '0.5px solid',
      cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
      background: active ? 'var(--orange)' : 'var(--bg2)',
      borderColor: active ? 'var(--orange)' : 'var(--border)',
      color: active ? '#fff' : 'var(--text-sec)',
    }}>
      {icon && <span style={{ fontSize: 11 }}>{icon}</span>}
      {label}
    </button>
  );
}

/* ─── SearchBar ─── */
export function SearchBar({ placeholder, value, onChange }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: 'var(--bg2)', border: '0.5px solid var(--border)',
      borderRadius: 'var(--r-md)', padding: '10px 14px', marginBottom: 12,
    }}>
      <span style={{ color: 'var(--text-muted)', fontSize: 16 }}>🔍</span>
      <input
        value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          flex: 1, border: 'none', outline: 'none',
          background: 'transparent', fontSize: 14,
          color: 'var(--text)', fontFamily: 'var(--font)',
        }}
      />
    </div>
  );
}

/* ─── SectionHeader ─── */
export function SectionHeader({ title, action, onAction }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
      <h3 style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.7px' }}>{title}</h3>
      {action && <button onClick={onAction} style={{ fontSize: 12, color: 'var(--orange)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>{action}</button>}
    </div>
  );
}

/* ─── StatCard ─── */
export function StatCard({ value, label, delta, color }) {
  return (
    <div style={{
      background: 'var(--bg2)', border: '0.5px solid var(--border)',
      borderRadius: 'var(--r-md)', padding: '12px 14px',
    }}>
      <div style={{ fontSize: 22, fontWeight: 600, color: color || 'var(--orange)', marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</div>
      {delta && <div style={{ fontSize: 10, color: 'var(--green)', marginTop: 3 }}>{delta}</div>}
    </div>
  );
}

/* ─── RestaurantCard ─── */
export function RestaurantCard({ restaurant, onClick }) {
  return (
    <Card onClick={onClick} style={{ marginBottom: 12 }}>
      <div style={{ height: 110, background: restaurant.bgColor, display: 'flex', alignItems: 'flex-end', padding: '10px 12px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, opacity: 0.35 }}>{restaurant.emoji}</div>
        <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          {restaurant.isLive
            ? <LiveBadge viewers={restaurant.liveViewers} />
            : <span style={{ background: 'rgba(255,255,255,0.85)', color: 'var(--text-sec)', fontSize: 11, padding: '2px 8px', borderRadius: 999 }}>Goes live {restaurant.goesLiveAt}</span>
          }
          {restaurant.hasActiveDeal && (
            <span style={{ background: 'var(--orange-pale)', border: '0.5px solid var(--orange-border)', color: 'var(--orange)', fontSize: 10, padding: '2px 8px', borderRadius: 999 }}>
              🏷 {restaurant.dealText}
            </span>
          )}
        </div>
      </div>
      <div style={{ padding: '10px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{restaurant.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>⭐ {restaurant.rating}</div>
        </div>
        <div style={{ display: 'flex', gap: 6, fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
          <span>{restaurant.cuisine}</span>
          <span>·</span><span>{restaurant.distance}</span>
          <span>·</span><span>{restaurant.priceRange}</span>
          {restaurant.isLive && restaurant.waitMinutes > 0 && (
            <><span>·</span><span style={{ color: 'var(--green)' }}>⏱ ~{restaurant.waitMinutes} min wait</span></>
          )}
        </div>
      </div>
    </Card>
  );
}

/* ─── OrderStatusBadge ─── */
export function OrderStatusBadge({ status }) {
  const map = {
    new:      { bg: 'rgba(255,59,59,0.10)',  color: '#cc2200', label: 'New' },
    preparing:{ bg: 'rgba(29,158,117,0.10)', color: '#1d9e75', label: 'Preparing' },
    ready:    { bg: 'rgba(232,93,4,0.10)',   color: 'var(--orange)', label: 'Ready' },
    served:   { bg: 'rgba(0,0,0,0.06)',       color: 'var(--text-muted)', label: 'Served' },
    completed:{ bg: 'rgba(0,0,0,0.06)',       color: 'var(--text-muted)', label: 'Completed' },
  };
  const s = map[status] || map.new;
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 11, padding: '3px 9px', borderRadius: 8, fontWeight: 500 }}>
      {s.label}
    </span>
  );
}

/* ─── ProgressBar ─── */
export function ProgressBar({ value, max = 100, color }) {
  return (
    <div style={{ background: 'var(--bg3)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
      <div style={{ width: `${(value / max) * 100}%`, height: '100%', background: color || 'var(--orange)', borderRadius: 4, transition: 'width 0.3s' }} />
    </div>
  );
}

/* ─── EmptyState ─── */
export function EmptyState({ emoji, title, subtitle, action, onAction }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{emoji}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>{subtitle}</div>
      {action && <Button onClick={onAction}>{action}</Button>}
    </div>
  );
}

/* ─── PageHeader ─── */
export function PageHeader({ title, subtitle, right }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
