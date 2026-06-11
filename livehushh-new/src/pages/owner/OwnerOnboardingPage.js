import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../../components/UI';

const steps = ['Restaurant', 'Location', 'Menu', 'Plan', 'Done'];

export default function OwnerOnboardingPage() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 560, margin: '40px auto', padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: i <= step ? 'var(--orange)' : 'var(--bg3)',
              color: i <= step ? '#fff' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700,
            }}>{i + 1}</div>
            {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: i < step ? 'var(--orange)' : 'var(--border)' }} />}
          </React.Fragment>
        ))}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.7 }}>Step {step + 1} of {steps.length}</div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 18 }}>{steps[step]}</h1>

      <Card style={{ padding: 24 }}>
        {step === 0 && (
          <Fields fields={[
            { l: 'Restaurant name', t: 'text', p: 'e.g. Spice Garden' },
            { l: 'Cuisine', t: 'text', p: 'e.g. Indian' },
            { l: 'Owner name', t: 'text' },
            { l: 'Phone', t: 'tel' },
          ]} />
        )}
        {step === 1 && (
          <Fields fields={[
            { l: 'Address', t: 'text' },
            { l: 'City', t: 'text' },
            { l: 'Open hours', t: 'text', p: 'e.g. 12pm – 10pm' },
            { l: 'Seating capacity', t: 'number' },
          ]} />
        )}
        {step === 2 && (
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-sec)', marginBottom: 14 }}>Upload a menu (PDF or image) or skip and add items later.</p>
            <input type="file" />
          </div>
        )}
        {step === 3 && (
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-sec)', marginBottom: 14 }}>Pick a plan — 14-day free trial starts immediately.</p>
            {[
              ['Starter', 99, '500 viewers/stream'],
              ['Pro', 199, '5,000 viewers · analytics'],
              ['Enterprise', 499, 'Multi-location · API'],
            ].map(([n, p, d]) => (
              <label key={n} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', marginBottom: 8, cursor: 'pointer' }}>
                <input type="radio" name="plan" defaultChecked={n === 'Pro'} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{n} <span style={{ color: 'var(--orange)' }}>· ${p}/mo</span></div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d}</div>
                </div>
              </label>
            ))}
          </div>
        )}
        {step === 4 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>You're all set</div>
            <div style={{ fontSize: 13, color: 'var(--text-sec)', marginBottom: 16 }}>Ready to broadcast and start filling seats.</div>
            <Button onClick={() => navigate('/owner/go-live')}>Go live now</Button>
          </div>
        )}

        {step < steps.length - 1 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
            {step > 0 && <Button variant="secondary" onClick={() => setStep(step - 1)}>Back</Button>}
            <Button fullWidth onClick={() => setStep(step + 1)}>Continue</Button>
          </div>
        )}
      </Card>
    </div>
  );
}

function Fields({ fields }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {fields.map(f => (
        <div key={f.l}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{f.l}</label>
          <input type={f.t} placeholder={f.p} style={{ width: '100%', marginTop: 6, padding: 10, border: '0.5px solid var(--border)', borderRadius: 'var(--r-md)', background: 'var(--bg2)', fontFamily: 'var(--font)', fontSize: 13 }} />
        </div>
      ))}
    </div>
  );
}
