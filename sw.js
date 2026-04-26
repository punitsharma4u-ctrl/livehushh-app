/* LiveHushh Service Worker — Push Notifications & Offline Cache */

const CACHE = 'lh-v1';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

/* ── Push Notifications ───────────────────────────────────────────────── */
self.addEventListener('push', e => {
  let data = {};
  try { data = e.data ? e.data.json() : {}; } catch {}

  const title   = data.title || 'LiveHushh';
  const options = {
    body:    data.body  || 'A restaurant near you is now live!',
    icon:    data.icon  || '/icon-192.png',
    badge:   '/icon-72.png',
    tag:     data.tag   || 'livehushh',
    data:    data.data  || {},
    vibrate: [200, 100, 200],
    actions: [
      { action: 'watch', title: '📺 Watch Live', icon: '/icon-72.png' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  e.waitUntil(self.registration.showNotification(title, options));
});

/* ── Notification Click ───────────────────────────────────────────────── */
self.addEventListener('notificationclick', e => {
  e.notification.close();

  const action       = e.action;
  const restaurantId = (e.notification.data || {}).restaurantId;
  const url = restaurantId
    ? `/customer-app.html?live=${restaurantId}`
    : '/customer-app.html';

  if (action === 'dismiss') return;

  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.includes('customer-app') && 'focus' in c) {
          c.postMessage({ type: 'OPEN_LIVE', restaurantId });
          return c.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
