import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AiStrip, Button, StatCard } from '../../components/UI';

export default function OwnerStudioPage() {
  const { isLive, setIsLive } = useApp();
  const [seconds, setSeconds] = useState(isLive ? 2842 : 0);
  const [showDealModal, setShowDealModal] = useState(false);
  const [dealText, setDealText] = useState('20% off all mains');
  const [sentDeals, setSentDeals] = useState([{ text: '20% off mains', sentAt: '7:30 PM' }]);

  useEffect(() => {
    if (!isLive) return;
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [isLive]);

  const fmt = (s) => `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const pushDeal = () => {
    setSentDeals(prev => [{ text: dealText, sentAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }, ...prev]);
    setShowDealModal(false);
  };

  return (
    <div style={{ padding: 16 }}>

      {/* Broadcast card */}
      <div style={{ background: isLive ? 'var(--orange-pale)' : 'var(--bg2)', border: `1px solid ${isLive ? 'var(--orange-border)' : 'var(--border)'}`, borderRadius: 'var(--r-lg)', padding: 20, marginBottom: 16, textAlign: 'center' }}>
        {isLive ? (
          <>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FF3B3B', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 999, marginBottom: 12, letterSpacing: 0.5 }}>
              <span style={{ width: 6, height: 6, background: '#fff', borderRadius: '50%', animation: 'pulse 1s infinite' }} /> BROADCASTING LIVE
            </div>
            <div style={{ fontSize: 42, fontWeight: 700, color: 'var(--text)', fontVariantNumeric: 'tabular-nums', marginBottom: 4 }}>{fmt(seconds)}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Spice Garden · live session</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📡</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Ready to go live?</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Start broadcasting to your waitlisted diners and potential new customers</div>
          </>
        )}

        {isLive && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
            {[['234', 'Viewers'], ['18', 'Orders'], ['$412', 'Revenue']].map(([v, l]) => (
              <div key={l} style={{ background: 'var(--white)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: 10, textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--orange)' }}>{v}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l}</div>
              </div>
            ))}
          </div>
        )}

        <Button
          variant={isLive ? 'danger' : 'primary'}
          size="lg"
          fullWidth
          onClick={() => { setIsLive(!isLive); if (!isLive) setSeconds(0); }}
        >
          {isLive ? '⬛ End broadcast' : '🔴 Go live now'}
        </Button>
      </div>

      {isLive && (
        <AiStrip>
          <strong style={{ color: 'var(--orange)' }}>AI insight</strong> — Peak viewers expected in 8 min (8–9pm is your highest traffic window). Push a deal now for max conversion. Your conversion rate is 23% tonight.
        </AiStrip>
      )}

      {/* Push deal */}
      {isLive && (
        <div style={{ marginBottom: 14 }}>
          <Button onClick={() => setShowDealModal(true)} fullWidth size="lg">
            🏷 Push a live deal
          </Button>
        </div>
      )}

      {/* Deal modal */}
      {showDealModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,8,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ background: 'var(--white)', borderRadius: '20px 20px 0 0', padding: 20, width: '100%', maxWidth: 480 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Push live deal</div>
            <input
              value={dealText}
              onChange={e => setDealText(e.target.value)}
              style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 14, marginBottom: 14, outline: 'none', color: 'var(--text)' }}
              placeholder="e.g. 20% off all mains"
            />
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
              This will be shown to all {234} current viewers as a live notification
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Button variant="secondary" onClick={() => setShowDealModal(false)} fullWidth>Cancel</Button>
              <Button onClick={pushDeal} fullWidth>Push deal now</Button>
            </div>
          </div>
        </div>
      )}

      {/* Live chat preview */}
      {isLive && (
        <div style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: 14, marginBottom: 14 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Viewer chat</div>
          {[
            { user: 'James', msg: 'What time does the special end?', avatar: 'J', color: 'var(--orange)' },
            { user: 'Sara', msg: 'Is there parking nearby?', avatar: 'S', color: '#9B59B6' },
          ].map(m => (
            <div key={m.user} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: m.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, flexShrink: 0 }}>{m.avatar}</div>
              <div style={{ background: 'var(--white)', border: '0.5px solid var(--border)', borderRadius: 9, padding: '5px 10px', fontSize: 12, color: 'var(--text-sec)', flex: 1 }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 1 }}>{m.user}</div>
                {m.msg}
              </div>
            </div>
          ))}
          <div style={{ background: 'var(--orange-pale)', border: '0.5px solid var(--orange-border)', borderRadius: 9, padding: '8px 12px', fontSize: 12, color: 'var(--orange)', marginTop: 4 }}>
            ✦ AI drafted: "Special runs till 9pm. Free parking on Main St!" <span style={{ marginLeft: 8, background: 'var(--orange)', color: '#fff', borderRadius: 6, padding: '2px 8px', fontSize: 11, cursor: 'pointer', fontWeight: 500 }}>Send</span>
          </div>
        </div>
      )}

      {/* Past deals */}
      {sentDeals.length > 0 && (
        <div style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: 14 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Deals pushed today</div>
          {sentDeals.map((d, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < sentDeals.length - 1 ? '0.5px solid var(--border)' : 'none' }}>
              <span style={{ fontSize: 13, color: 'var(--text)' }}>🏷 {d.text}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.sentAt}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
