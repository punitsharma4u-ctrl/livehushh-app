/* ============================================================
   LIVEHUSHH — Mock Data & App State
   ============================================================ */

const APP = {
  currentUser: null,
  cart: [],
  cartRestaurant: null,

  // ── Auth ──
  users: [], // auth handled by Cognito/localStorage

  // ── Restaurants ──
  restaurants: [], // loaded from API

  // ── Waitlist ──
  waitlist: [], // loaded from API

  // ── Orders ──
  orders: [], // loaded from API

  // ── Admin Data ──
  allRestaurants: [], // will be set from restaurants array
  subscriptions: [
    { restaurantId: 'r1', plan: 'Pro', price: 2999, startDate: '2025-01-01', endDate: '2025-12-31', status: 'active' },
    { restaurantId: 'r2', plan: 'Starter', price: 999, startDate: '2025-02-01', endDate: '2025-07-31', status: 'active' },
    { restaurantId: 'r3', plan: 'Enterprise', price: 7999, startDate: '2024-12-01', endDate: '2025-11-30', status: 'active' },
    { restaurantId: 'r4', plan: 'Starter', price: 999, startDate: '2025-03-01', endDate: '2025-08-31', status: 'expiring' },
    { restaurantId: 'r5', plan: 'Enterprise', price: 7999, startDate: '2025-01-15', endDate: '2026-01-14', status: 'active' },
    { restaurantId: 'r6', plan: 'Pro', price: 2999, startDate: '2025-02-15', endDate: '2026-02-14', status: 'active' },
  ],

  adminRevenue: {
    monthly: [18000, 24500, 29000, 35000, 31000, 42000, 38000, 45000, 52000, 48000, 61000, 73000],
    forecast: [78000, 85000, 92000],
    labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  },

  chatMessages: [
    { user: 'James', text: 'Looks amazing! What\'s today\'s special?', time: '7:05 PM' },
    { user: 'Emily', text: 'Love the ambience! 😍', time: '7:06 PM' },
    { user: 'Ryan', text: 'Is the Paneer Tikka available now?', time: '7:07 PM' },
    { user: 'Karen', text: 'How long is the wait tonight?', time: '7:08 PM' },
    { user: 'Diana', text: 'Can we see the dessert menu?', time: '7:09 PM' },
    { user: 'Steven', text: 'Great vibe! Following now 🔥', time: '7:10 PM' },
  ],

  plans: [
    { id: 'starter', name: 'Starter', price: 999, features: ['Up to 5 live sessions/mo', 'Basic analytics', 'Menu management', 'Waitlist (up to 20/day)', '1 special offer at a time', 'Email support'] },
    { id: 'pro', name: 'Pro', price: 2999, features: ['Unlimited live sessions', 'Advanced analytics', 'Menu management', 'Unlimited waitlist', '10 simultaneous deals', 'Priority support', 'Featured listing', 'Custom branding'] },
    { id: 'enterprise', name: 'Enterprise', price: 7999, features: ['Everything in Pro', 'Dedicated account manager', 'Custom integrations', 'White-label option', 'API access', 'SLA guarantee', 'Revenue forecasting', 'Multi-location support'] },
  ],

  // ── Methods (defined inside APP so they're always available) ──
  getRestaurant(id) { return APP.restaurants.find(r => r.id === id); },
  getUser(email, password) { return APP.users.find(u => u.email === email && u.password === password); },
  addToCart(item, restaurantId) {
    if (APP.cartRestaurant && APP.cartRestaurant !== restaurantId) return false;
    APP.cartRestaurant = restaurantId;
    const existing = APP.cart.find(c => c.id === item.id);
    if (existing) existing.qty++;
    else APP.cart.push({ ...item, qty: 1 });
    return true;
  },
  removeFromCart(itemId) {
    const idx = APP.cart.findIndex(c => c.id === itemId);
    if (idx === -1) return;
    if (APP.cart[idx].qty > 1) APP.cart[idx].qty--;
    else APP.cart.splice(idx, 1);
    if (!APP.cart.length) APP.cartRestaurant = null;
  },
  cartTotal() { return APP.cart.reduce((s, i) => s + i.price * i.qty, 0); },
  cartCount() { return APP.cart.reduce((s, i) => s + i.qty, 0); },
  showToast(msg, type = 'info', duration = 3000) {
    let t = document.getElementById('global-toast');
    if (!t) { t = document.createElement('div'); t.id = 'global-toast'; t.className = 'toast'; document.body.appendChild(t); }
    t.className = `toast toast-${type} show`;
    const icons = { success: '✅', error: '❌', info: '💡' };
    t.innerHTML = `<span>${icons[type] || '💡'}</span><span>${msg}</span>`;
    setTimeout(() => t.classList.remove('show'), duration);
  },
  openModal(id) { document.getElementById(id)?.classList.add('open'); document.body.classList.add('no-scroll'); },
  closeModal(id) { document.getElementById(id)?.classList.remove('open'); document.body.classList.remove('no-scroll'); },
};

// Initialize after definition
APP.allRestaurants = [...APP.restaurants];

// ── Nav scroll ──
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.nav');
  if (nav) {
    window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 20));
  }

  // Scroll animations
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.animate-on-scroll').forEach(el => obs.observe(el));

  // Modal close on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(overlay.id); });
  });

  // Tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const group = tab.closest('[data-tab-group]');
      if (!group) return;
      const target = tab.dataset.tab;
      group.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      group.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      group.querySelector(`.tab-content[data-tab="${target}"]`)?.classList.add('active');
    });
  });
});
