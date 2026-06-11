import React from 'react';
import { Card } from '../../components/UI';

export default function DataDeletionPage() {
  return (
    <div style={{ padding: '40px 20px', maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Data deletion</h1>
      <p style={{ color: 'var(--text-sec)', marginBottom: 18 }}>
        You can permanently delete your LiveHushh account and all associated data at any time.
      </p>
      <Card style={{ padding: 20 }}>
        <h3 style={{ marginBottom: 8 }}>How to delete your data</h3>
        <ol style={{ paddingLeft: 18, color: 'var(--text-sec)', fontSize: 14, lineHeight: 1.7 }}>
          <li>Open the app and go to <strong>Profile → Settings</strong>.</li>
          <li>Tap <strong>Delete account</strong>.</li>
          <li>Confirm via the email link we send you.</li>
        </ol>
        <p style={{ marginTop: 16, fontSize: 13, color: 'var(--text-muted)' }}>
          Prefer email? Send a request to <strong>privacy@livehushh.com</strong> from the email tied to your account. We'll confirm within 7 days.
        </p>
      </Card>
    </div>
  );
}
