import React from 'react';
import { AiStrip, StatCard } from '../../components/UI';

/* ─── Admin Dashboard ─── */
export function AdminDashboardPage() {
  const hours = ['10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p'];
  const data = [8, 12, 34, 28, 22, 30, 45, 68, 84, 100, 78, 55];
  const max = Math.max(...data);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Platform overview</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Tuesday, June 2026 · All metrics real-time</p>
      </div>

      <AiStrip>
        <strong style={{ color: 'var(--orange)' }}>AI intelligence</strong> — Platform GMV is up 23% today. 3 restaurants approaching trial expiry — consider proactive outreach. Peak conversion window is 8–9pm.
      </AiStrip>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          ['142', 'Restaurants', '+8 this week'],
          ['18.4k', 'Active users', '+12% WoW'],
          ['$84k', 'GMV today', '+23% DoD'],
          ['37', 'Live now', 'Peak 8–10pm'],
        ].map(([v, l, d]) => (
          <StatCard key={l} value={v} label={l} delta={d} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* Live activity */}
        <div style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
            Restaurant activity
            <span style={{ fontSize: 11, color: 'var(--orange)', fontWeight: 500 }}>37 live now</span>
          </div>
          {[
            { name: 'Spice Garden', sub: '234 viewers · $412', status: 'LIVE', statusColor: '#cc2200', statusBg: 'rgba(255,59,59,0.08)' },
            { name: 'Napoli Kitchen', sub: '89 viewers · $188', status: 'LIVE', statusColor: '#cc2200', statusBg: 'rgba(255,59,59,0.08)' },
            { name: 'Burger Barn', sub: '54 viewers · $96', status: 'LIVE', statusColor: '#cc2200', statusBg: 'rgba(255,59,59,0.08)' },
            { name: 'Sakura Sushi', sub: 'Goes live 7pm', status: 'Scheduled', statusColor: 'var(--orange)', statusBg: 'var(--orange-muted)' },
          ].map(r => (
            <div key={r.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '0.5px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{r.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.sub}</div>
              </div>
              <span style={{ background: r.statusBg, color: r.statusColor, fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 8 }}>{r.status}</span>
            </div>
          ))}
        </div>

        {/* Subscriptions */}
        <div style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Subscriptions</div>
          {[
            ['Pro plan', '78 restaurants', '$7,800/mo', 'var(--orange)'],
            ['Starter plan', '64 restaurants', '$3,200/mo', 'var(--green)'],
            ['Trial', '12 restaurants', 'Expiring soon', 'var(--text-muted)'],
          ].map(([plan, count, rev, color]) => (
            <div key={plan} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '0.5px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{plan}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{count}</div>
              </div>
              <span style={{ fontWeight: 600, fontSize: 13, color }}>{rev}</span>
            </div>
          ))}
          <div style={{ marginTop: 10, padding: '10px 12px', background: 'var(--orange-pale)', borderRadius: 8, border: '0.5px solid var(--orange-border)' }}>
            <div style={{ fontSize: 11, color: 'var(--orange)', fontWeight: 600 }}>✦ AI alert</div>
            <div style={{ fontSize: 12, color: 'var(--text-sec)', marginTop: 2 }}>3 trials expiring in 48h. Reach out to convert.</div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14, display: 'flex', justifyContent: 'space-between' }}>
          Platform GMV — hourly today
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>🟠 Peak · ⬛ Regular</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100 }}>
          {data.map((v, i) => (
            <div key={i} style={{ flex: 1, background: v >= 80 ? 'var(--orange)' : 'var(--border2)', borderRadius: '3px 3px 0 0', height: `${(v / max) * 100}%`, transition: 'height 0.3s', cursor: 'pointer', position: 'relative' }}
              title={`$${(v * 1000).toLocaleString()}`}
            />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
          {hours.map(h => <div key={h} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'var(--text-muted)' }}>{h}</div>)}
        </div>
      </div>
    </div>
  );
}

/* ─── Admin Restaurants ─── */
export function AdminRestaurantsPage() {
  const restaurants = [
    { name: 'Spice Garden', cuisine: 'Indian', plan: 'Pro', status: 'live', revenue: '$12,400', joined: 'Jan 2024' },
    { name: 'Napoli Kitchen', cuisine: 'Italian', plan: 'Pro', status: 'live', revenue: '$9,800', joined: 'Mar 2024' },
    { name: 'Sakura Sushi', cuisine: 'Japanese', plan: 'Pro', status: 'active', revenue: '$18,200', joined: 'Nov 2023' },
    { name: 'Burger Barn', cuisine: 'American', plan: 'Starter', status: 'live', revenue: '$4,200', joined: 'Apr 2024' },
    { name: 'The Taco Lab', cuisine: 'Mexican', plan: 'Trial', status: 'trial', revenue: '$0', joined: 'Jun 2024' },
  ];

  const statusStyle = { live: { bg: 'rgba(255,59,59,0.08)', color: '#cc2200' }, active: { bg: 'var(--green-bg)', color: 'var(--green)' }, trial: { bg: 'var(--orange-muted)', color: 'var(--orange)' } };
  const planStyle = { Pro: { bg: 'var(--orange-pale)', color: 'var(--orange)' }, Starter: { bg: 'var(--green-bg)', color: 'var(--green)' }, Trial: { bg: 'var(--bg3)', color: 'var(--text-muted)' } };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Restaurants</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>142 total · 37 live now</p>
        </div>
        <button style={{ background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Add restaurant</button>
      </div>

      <div style={{ background: 'var(--white)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--bg2)', borderBottom: '0.5px solid var(--border)' }}>
              {['Restaurant', 'Cuisine', 'Plan', 'Status', 'Revenue', 'Joined'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {restaurants.map((r, i) => (
              <tr key={r.name} style={{ borderBottom: i < restaurants.length - 1 ? '0.5px solid var(--border)' : 'none', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '12px 14px', fontWeight: 600 }}>{r.name}</td>
                <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>{r.cuisine}</td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ background: planStyle[r.plan].bg, color: planStyle[r.plan].color, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999 }}>{r.plan}</span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ background: statusStyle[r.status].bg, color: statusStyle[r.status].color, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 8 }}>
                    {r.status === 'live' ? '🔴 LIVE' : r.status === 'active' ? '✓ Active' : '⏳ Trial'}
                  </span>
                </td>
                <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--orange)' }}>{r.revenue}</td>
                <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>{r.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
