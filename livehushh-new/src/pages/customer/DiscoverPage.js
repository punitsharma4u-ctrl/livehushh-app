import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AiStrip, SearchBar, FilterPill, RestaurantCard, SectionHeader, LiveBadge } from '../../components/UI';

const FILTERS = ['All', 'Live now', 'Indian', 'Italian', 'Japanese', 'American', 'Deals', 'Near me'];

export default function DiscoverPage() {
  const { restaurants } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const liveNow = restaurants.filter(r => r.isLive);
  const comingUp = restaurants.filter(r => !r.isLive);

  const filtered = (list) => list.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.cuisine.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === 'All' || activeFilter === 'Live now'
      ? true
      : activeFilter === 'Deals' ? r.hasActiveDeal
      : activeFilter === 'Near me' ? true
      : r.cuisine === activeFilter;
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ padding: '16px 16px 0' }}>

      <AiStrip>
        <strong style={{ color: 'var(--orange)' }}>AI pick for you</strong> — Spice Garden is live now with a 12 min wait. Matches your Indian food preference. 🍛
      </AiStrip>

      <SearchBar
        placeholder="Search restaurants, cuisines..."
        value={search}
        onChange={setSearch}
      />

      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 12, scrollbarWidth: 'none' }}>
        {FILTERS.map(f => (
          <FilterPill
            key={f}
            label={f}
            active={activeFilter === f}
            onClick={() => setActiveFilter(f)}
            icon={f === 'Live now' ? '🔴' : null}
          />
        ))}
      </div>

      {/* Live now section */}
      {filtered(liveNow).length > 0 && (
        <>
          <SectionHeader title="Live right now 🔴" action="See all" />
          {filtered(liveNow).map(r => (
            <RestaurantCard key={r.id} restaurant={r} onClick={() => navigate(`/live/${r.id}`)} />
          ))}
        </>
      )}

      {/* Coming up section */}
      {filtered(comingUp).length > 0 && (
        <>
          <SectionHeader title="Coming up soon" action="See all" />
          {filtered(comingUp).map(r => (
            <div key={r.id} style={{ background: 'var(--white)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '12px 14px', marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 22 }}>{r.emoji}</span>
                    <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{r.name}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.cuisine} · Goes live at {r.goesLiveAt}</div>
                </div>
                <button
                  onClick={() => alert(`Reminder set for ${r.name} at ${r.goesLiveAt}`)}
                  style={{ background: 'var(--orange-pale)', border: '0.5px solid var(--orange-border)', color: 'var(--orange)', fontSize: 12, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap' }}
                >
                  🔔 Remind me
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Near you section */}
      <SectionHeader title="Popular near you" action="Map view" />
      <div style={{ background: 'var(--bg2)', borderRadius: 'var(--r-md)', padding: 14, marginBottom: 16, border: '0.5px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
        📍 Enable location to see restaurants near you
      </div>

      {/* Promotions banner */}
      <div style={{
        background: 'var(--orange)', borderRadius: 'var(--r-lg)', padding: '16px 18px',
        marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 3 }}>New on livehushh</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.82)' }}>Sakura Sushi goes live tonight at 7pm. Set a reminder!</div>
        </div>
        <span style={{ fontSize: 28 }}>🍣</span>
      </div>

    </div>
  );
}
