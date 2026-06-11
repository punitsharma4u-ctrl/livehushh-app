import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { LiveBadge, AiBadge, Button, AiStrip } from '../../components/UI';

export default function LiveViewerPage() {
  const { restaurantId } = useParams();
  const { restaurants, chatMessages } = useApp();
  const navigate = useNavigate();
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState(chatMessages);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(1243);

  const restaurant = restaurants.find(r => r.id === restaurantId) || restaurants[0];

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), user: 'You', avatar: 'T', color: 'var(--orange)', message: chatInput, time: 'now' }]);
    setChatInput('');
  };

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(c => liked ? c - 1 : c + 1);
  };

  return (
    <div style={{ padding: '0 0 16px' }}>

      {/* Stream header */}
      <div style={{ background: 'var(--bg3)', borderBottom: '0.5px solid var(--border)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-muted)' }}>←</button>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)' }}>{restaurant.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{restaurant.cuisine} · {restaurant.distance}</div>
          </div>
        </div>
        <LiveBadge viewers={restaurant.liveViewers} />
      </div>

      {/* Stream viewport */}
      <div style={{
        background: `linear-gradient(135deg, ${restaurant.bgColor}, #fff0e0)`,
        minHeight: 220, display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: 16, position: 'relative',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{restaurant.streamTitle}</div>
            <div style={{ fontSize: 13, color: 'var(--text-sec)' }}>{restaurant.streamSubtitle}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
            {restaurant.hasActiveDeal && (
              <span style={{ background: 'var(--orange)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999 }}>
                🏷 {restaurant.dealText}
              </span>
            )}
            <button onClick={handleLike} style={{ background: liked ? 'rgba(232,93,4,0.15)' : 'rgba(255,255,255,0.7)', border: `0.5px solid ${liked ? 'var(--orange-border)' : 'var(--border)'}`, borderRadius: 999, padding: '4px 10px', fontSize: 12, cursor: 'pointer', color: liked ? 'var(--orange)' : 'var(--text-sec)', display: 'flex', alignItems: 'center', gap: 4 }}>
              {liked ? '🧡' : '🤍'} {likeCount.toLocaleString()}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <AiBadge label="AI stream recap" />
          <div style={{ fontSize: 12, color: 'var(--text-sec)', display: 'flex', alignItems: 'center', gap: 4 }}>
            👁 {restaurant.liveViewers} watching
          </div>
        </div>

        {/* Simulated stream overlay */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72, opacity: 0.12, pointerEvents: 'none' }}>
          {restaurant.emoji}
        </div>
      </div>

      {/* AI recap strip */}
      <div style={{ padding: '12px 16px 0' }}>
        <AiStrip>
          <strong style={{ color: 'var(--orange)' }}>AI recap</strong> — Chef Ravi has been cooking for 47 min. Tonight's special is Lamb Rogan Josh (20% off live). 18 orders placed so far. Spice level: medium.
        </AiStrip>
      </div>

      {/* Live chat */}
      <div style={{ padding: '0 16px', marginBottom: 12 }}>
        <div style={{ background: 'var(--bg2)', border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '12px', marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live chat</div>
          <div style={{ maxHeight: 160, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: msg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 700, flexShrink: 0 }}>{msg.avatar}</div>
                <div style={{ background: msg.isHost ? 'var(--orange-pale)' : 'var(--white)', border: `0.5px solid ${msg.isHost ? 'var(--orange-border)' : 'var(--border)'}`, borderRadius: 10, padding: '6px 10px', maxWidth: '80%' }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: msg.isHost ? 'var(--orange)' : 'var(--text-muted)', marginBottom: 2 }}>{msg.user}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-sec)', lineHeight: 1.4 }}>{msg.message}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendChat()}
              placeholder="Ask a question..."
              style={{ flex: 1, background: 'var(--white)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '8px 12px', fontSize: 13, color: 'var(--text)', outline: 'none' }}
            />
            <button onClick={sendChat} style={{ background: 'var(--orange)', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16, color: '#fff' }}>→</button>
          </div>
        </div>
      </div>

      {/* CTA buttons */}
      <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Button onClick={() => navigate(`/menu/${restaurant.id}`)} fullWidth>
          🍽 View menu
        </Button>
        <Button variant="secondary" onClick={() => navigate('/waitlist')} fullWidth>
          🔢 Join waitlist
        </Button>
      </div>

    </div>
  );
}
