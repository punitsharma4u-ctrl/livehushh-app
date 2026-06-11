import { API_BASE, TOKEN_KEY } from './config';

function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

async function request(method, path, body) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data; try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const err = new Error((data && data.error) || `HTTP ${res.status}`);
    err.status = res.status; err.body = data;
    throw err;
  }
  return data;
}

export const api = {
  get:    (p)        => request('GET',    p),
  post:   (p, body)  => request('POST',   p, body),
  patch:  (p, body)  => request('PATCH',  p, body),
  delete: (p)        => request('DELETE', p),
};

// ─── Typed endpoint helpers ────────────────────────────────────────────
export const endpoints = {
  // Public
  restaurants:        ()        => api.get('/restaurants'),
  restaurant:         (id)      => api.get(`/restaurants/${id}`),
  rate:               (id, body)=> api.post(`/restaurants/${id}/rate`, body),

  // Auth / profile
  profile:            ()        => api.get('/auth/profile'),
  saveProfile:        (body)    => api.post('/auth/profile', body),

  // Owner
  onboard:            (body)    => api.post('/owner/onboard', body),
  ownerStatus:        ()        => api.get('/owner/status'),
  ownerAnalytics:     ()        => api.get('/owner/analytics'),
  subscribe:          (body)    => api.post('/owner/subscribe', body),

  // Orders
  listOrders:         ()        => api.get('/orders'),
  getOrder:           (id)      => api.get(`/orders/${id}`),
  createOrder:        (body)    => api.post('/orders', body),
  updateOrder:        (id, body)=> api.patch(`/orders/${id}`, body),
  paymentIntent:      (body)    => api.post('/orders/payment-intent', body),

  // Waitlist
  myWaitlist:         ()        => api.get('/waitlist/mine'),
  listWaitlist:       ()        => api.get('/waitlist'),
  joinWaitlist:       (body)    => api.post('/waitlist', body),
  updateWaitlist:     (id, body)=> api.patch(`/waitlist/${id}`, body),
  leaveWaitlist:      (id)      => api.delete(`/waitlist/${id}`),

  // Videos & promos
  listVideos:         ()        => api.get('/videos'),
  addVideo:           (body)    => api.post('/videos', body),
  updateVideo:        (id, body)=> api.patch(`/videos/${id}`, body),
  deleteVideo:        (id)      => api.delete(`/videos/${id}`),
  listPromos:         ()        => api.get('/promos'),
  addPromo:           (body)    => api.post('/promos', body),
  updatePromo:        (id, body)=> api.patch(`/promos/${id}`, body),
  deletePromo:        (id)      => api.delete(`/promos/${id}`),
  usePromo:           (id)      => api.post(`/promos/${id}/use`),

  // Live
  liveChannel:        ()        => api.get('/live/channel'),

  // Upload / OCR
  upload:             (body)    => api.post('/upload', body),
  ocr:                (body)    => api.post('/ocr', body),

  // Notifications
  sendSMS:            (body)    => api.post('/notify/sms', body),

  // Admin
  adminUsers:         ()        => api.get('/admin/users'),
  adminSubscriptions: ()        => api.get('/admin/subscriptions'),
  adminStats:         ()        => api.get('/admin/stats'),
  adminRestaurantStats:()       => api.get('/admin/restaurant-stats'),
  adminPending:       ()        => api.get('/admin/pending'),
  adminApprove:       (body)    => api.post('/admin/approve', body),
};
