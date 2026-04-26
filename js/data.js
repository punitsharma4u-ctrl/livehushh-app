/* ============================================================
   LIVEHUSHH — Mock Data & App State
   ============================================================ */

const APP = {
  currentUser: null,
  cart: [],
  cartRestaurant: null,

  // ── Auth ──
  users: [
    { id: 'c1', role: 'customer', name: 'James Carter', email: 'james@example.com', password: 'demo123', phone: '+1 416 555 0101', avatar: 'JC' },
    { id: 'o1', role: 'owner', name: 'Emily Clarke', email: 'emily@example.com', password: 'demo123', restaurantId: 'r1', avatar: 'EC' },
    { id: 'a1', role: 'admin', name: 'Admin User', email: 'admin@livehushh.com', password: 'admin123', avatar: 'AU' },
  ],

  // ── Restaurants ──
  restaurants: [
    {
      id: 'r1', name: 'The Spice Garden', cuisine: 'Indian', rating: 4.7, reviews: 342,
      distance: 0.4, veg: true, isLive: true, liveViewers: 128,
      address: '12 King Street W, Toronto', phone: '+1 416 555 1234',
      priceRange: '₹₹', deliveryTime: '25-35 min', minOrder: 200,
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80',
      tags: ['Pure Veg', 'North Indian', 'South Indian'],
      deals: ['20% off on orders above ₹500', 'Free dessert on weekends'],
      hours: '8:00 AM – 11:00 PM',
      ownerId: 'o1',
      subscriptionPlan: 'Pro',
      menu: [
        { category: 'Starters', items: [
          { id: 'm1', name: 'Paneer Tikka', desc: 'Marinated cottage cheese grilled in tandoor', price: 280, veg: true, img: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=200&q=60', popular: true },
          { id: 'm2', name: 'Veg Spring Rolls', desc: 'Crispy rolls with fresh vegetable filling', price: 190, veg: true, img: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=200&q=60' },
          { id: 'm3', name: 'Hara Bhara Kabab', desc: 'Spinach and pea patties with green chutney', price: 220, veg: true, img: 'https://images.unsplash.com/photo-1630851840628-25c9a0ca2a3d?w=200&q=60' },
        ]},
        { category: 'Main Course', items: [
          { id: 'm4', name: 'Dal Makhani', desc: 'Slow-cooked black lentils with cream & butter', price: 320, veg: true, img: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=200&q=60', popular: true },
          { id: 'm5', name: 'Palak Paneer', desc: 'Fresh cottage cheese in spiced spinach gravy', price: 300, veg: true, img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=200&q=60' },
          { id: 'm6', name: 'Veg Biryani', desc: 'Aromatic basmati rice with seasonal vegetables', price: 280, veg: true, img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&q=60', popular: true },
        ]},
        { category: 'Breads', items: [
          { id: 'm7', name: 'Garlic Naan', desc: 'Soft leavened bread with garlic & butter', price: 70, veg: true, img: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=200&q=60' },
          { id: 'm8', name: 'Laccha Paratha', desc: 'Layered whole wheat flatbread', price: 60, veg: true, img: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=200&q=60' },
        ]},
        { category: 'Desserts', items: [
          { id: 'm9', name: 'Gulab Jamun', desc: 'Soft milk dumplings in rose-flavored syrup', price: 120, veg: true, img: 'https://images.unsplash.com/photo-1601303516534-bf4b6f23d800?w=200&q=60', popular: true },
          { id: 'm10', name: 'Rasgulla', desc: 'Soft spongy cheese balls in light sugar syrup', price: 110, veg: true, img: 'https://images.unsplash.com/photo-1635784064041-0e1a3f4fda15?w=200&q=60' },
        ]},
      ]
    },
    {
      id: 'r2', name: 'Dragon Palace', cuisine: 'Chinese', rating: 4.3, reviews: 218,
      distance: 0.8, veg: false, isLive: false, liveViewers: 0,
      address: '45 Granville St, Vancouver', phone: '+1 604 555 2345',
      priceRange: '₹₹₹', deliveryTime: '30-45 min', minOrder: 300,
      image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80',
      tags: ['Chinese', 'Sushi', 'Dim Sum'],
      deals: ['Buy 1 Get 1 on Dim Sum', '15% off lunch menu'],
      hours: '11:00 AM – 10:30 PM',
      ownerId: 'o2',
      subscriptionPlan: 'Starter',
      menu: [
        { category: 'Starters', items: [
          { id: 'm11', name: 'Chicken Dim Sum', desc: 'Steamed dumplings with spicy dipping sauce', price: 280, veg: false, img: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=200&q=60', popular: true },
          { id: 'm12', name: 'Crispy Wontons', desc: 'Deep fried wontons with sweet chilli sauce', price: 220, veg: false, img: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=200&q=60' },
        ]},
        { category: 'Mains', items: [
          { id: 'm13', name: 'Chicken Manchurian', desc: 'Spicy sauce-tossed chicken with spring onions', price: 360, veg: false, img: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=200&q=60', popular: true },
          { id: 'm14', name: 'Hakka Noodles', desc: 'Stir-fried noodles with vegetables and sauces', price: 280, veg: false, img: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=200&q=60' },
          { id: 'm15', name: 'Fried Rice (Chicken)', desc: 'Wok-tossed rice with egg, chicken & vegetables', price: 300, veg: false, img: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=200&q=60' },
        ]},
      ]
    },
    {
      id: 'r3', name: 'Bella Italia', cuisine: 'Italian', rating: 4.8, reviews: 521,
      distance: 1.2, veg: false, isLive: true, liveViewers: 87,
      address: '78 Stephen Ave, Calgary', phone: '+1 403 555 3456',
      priceRange: '₹₹₹₹', deliveryTime: '40-55 min', minOrder: 500,
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
      tags: ['Italian', 'Pizza', 'Pasta', 'Fine Dining'],
      deals: ['Free bruschetta on orders above ₹1000'],
      hours: '12:00 PM – 11:00 PM',
      ownerId: 'o3',
      subscriptionPlan: 'Enterprise',
      menu: [
        { category: 'Starters', items: [
          { id: 'm16', name: 'Bruschetta', desc: 'Grilled bread with tomatoes, garlic and basil', price: 280, veg: true, img: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=200&q=60', popular: true },
          { id: 'm17', name: 'Arancini', desc: 'Fried risotto balls with mozzarella', price: 320, veg: true, img: 'https://images.unsplash.com/photo-1474230893821-a1c819139b23?w=200&q=60' },
        ]},
        { category: 'Pizza', items: [
          { id: 'm18', name: 'Margherita', desc: 'Classic tomato sauce, mozzarella and fresh basil', price: 520, veg: true, img: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200&q=60', popular: true },
          { id: 'm19', name: 'Pepperoni Feast', desc: 'Double pepperoni with spicy tomato sauce', price: 680, veg: false, img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&q=60', popular: true },
        ]},
        { category: 'Pasta', items: [
          { id: 'm20', name: 'Spaghetti Carbonara', desc: 'Egg, pecorino, guanciale and black pepper', price: 580, veg: false, img: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=200&q=60' },
          { id: 'm21', name: 'Penne Arrabbiata', desc: 'Spicy tomato and garlic sauce with fresh herbs', price: 480, veg: true, img: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=200&q=60' },
        ]},
        { category: 'Desserts', items: [
          { id: 'm22', name: 'Tiramisu', desc: 'Classic Italian coffee and mascarpone dessert', price: 380, veg: true, img: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=200&q=60', popular: true },
        ]},
      ]
    },
    {
      id: 'r4', name: 'Burger Barn', cuisine: 'American', rating: 4.1, reviews: 178,
      distance: 0.5, veg: false, isLive: false, liveViewers: 0,
      address: '23 Sparks St, Ottawa', phone: '+1 613 555 4567',
      priceRange: '₹', deliveryTime: '20-30 min', minOrder: 150,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
      tags: ['Burgers', 'Fast Food', 'American'],
      deals: ['Free fries with any combo meal'],
      hours: '10:00 AM – 12:00 AM',
      ownerId: 'o4',
      subscriptionPlan: 'Starter',
      menu: [
        { category: 'Burgers', items: [
          { id: 'm23', name: 'Classic Cheeseburger', desc: 'Beef patty, cheddar, lettuce, tomato, pickles', price: 280, veg: false, img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=60', popular: true },
          { id: 'm24', name: 'Veggie Burger', desc: 'Black bean patty with avocado and salsa', price: 240, veg: true, img: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=200&q=60' },
          { id: 'm25', name: 'BBQ Bacon Burger', desc: 'Double smash patty with crispy bacon & BBQ sauce', price: 380, veg: false, img: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=200&q=60', popular: true },
        ]},
        { category: 'Sides', items: [
          { id: 'm26', name: 'Loaded Fries', desc: 'Crispy fries with cheese sauce and jalapeños', price: 180, veg: true, img: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=200&q=60' },
          { id: 'm27', name: 'Onion Rings', desc: 'Beer-battered crispy onion rings', price: 150, veg: true, img: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=200&q=60' },
        ]},
        { category: 'Drinks', items: [
          { id: 'm28', name: 'Classic Milkshake', desc: 'Thick shake in chocolate, vanilla or strawberry', price: 180, veg: true, img: 'https://images.unsplash.com/photo-1572490122747-3e9b923f5e51?w=200&q=60', popular: true },
        ]},
      ]
    },
    {
      id: 'r5', name: 'Sushi Zen', cuisine: 'Japanese', rating: 4.9, reviews: 687,
      distance: 2.1, veg: false, isLive: true, liveViewers: 205,
      address: '102 Crescent St, Montreal', phone: '+1 514 555 5678',
      priceRange: '₹₹₹₹', deliveryTime: '45-60 min', minOrder: 800,
      image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80',
      tags: ['Japanese', 'Sushi', 'Ramen', 'Premium'],
      deals: ['Omakase experience available', 'Sake pairing menu'],
      hours: '12:00 PM – 10:00 PM',
      ownerId: 'o5',
      subscriptionPlan: 'Enterprise',
      menu: [
        { category: 'Rolls', items: [
          { id: 'm29', name: 'Dragon Roll', desc: 'Shrimp tempura, cucumber, avocado, eel sauce', price: 680, veg: false, img: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=200&q=60', popular: true },
          { id: 'm30', name: 'Vegetable Rainbow Roll', desc: 'Avocado, cucumber, carrot, radish with sesame', price: 520, veg: true, img: 'https://images.unsplash.com/photo-1617196034538-dc55ad0a5b47?w=200&q=60' },
        ]},
        { category: 'Ramen', items: [
          { id: 'm31', name: 'Tonkotsu Ramen', desc: 'Rich pork bone broth, chashu, soft egg, bamboo', price: 580, veg: false, img: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=200&q=60', popular: true },
          { id: 'm32', name: 'Miso Ramen (Veg)', desc: 'White miso broth with tofu, mushrooms, corn', price: 480, veg: true, img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&q=60' },
        ]},
      ]
    },
    {
      id: 'r6', name: 'Taco Fiesta', cuisine: 'Mexican', rating: 4.4, reviews: 293,
      distance: 1.6, veg: false, isLive: false, liveViewers: 0,
      address: '55 Whyte Ave, Edmonton', phone: '+1 780 555 6789',
      priceRange: '₹₹', deliveryTime: '25-40 min', minOrder: 250,
      image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80',
      tags: ['Mexican', 'Tacos', 'Burritos', 'Casual'],
      deals: ['Taco Tuesday 30% off', 'Happy hour pitchers'],
      hours: '11:00 AM – 11:00 PM',
      ownerId: 'o6',
      subscriptionPlan: 'Pro',
      menu: [
        { category: 'Tacos', items: [
          { id: 'm33', name: 'Chicken Al Pastor', desc: 'Spiced chicken, pineapple, cilantro, onion', price: 220, veg: false, img: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=200&q=60', popular: true },
          { id: 'm34', name: 'Veggie Black Bean Taco', desc: 'Roasted black beans, avocado, pico de gallo', price: 180, veg: true, img: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=200&q=60' },
        ]},
        { category: 'Burritos', items: [
          { id: 'm35', name: 'Beef Burrito Grande', desc: 'Seasoned beef, rice, beans, cheese, sour cream', price: 380, veg: false, img: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=200&q=60', popular: true },
        ]},
      ]
    },
  ],

  // ── Live Sessions History (for owner analytics) ──
  liveSessions: [
    { id: 'ls1', restaurantId: 'r1', date: '2025-04-20', duration: 45, maxViewers: 183, avgViewers: 128, orders: 12, revenue: 4850 },
    { id: 'ls2', restaurantId: 'r1', date: '2025-04-18', duration: 62, maxViewers: 241, avgViewers: 195, orders: 19, revenue: 7200 },
    { id: 'ls3', restaurantId: 'r1', date: '2025-04-15', duration: 38, maxViewers: 142, avgViewers: 98, orders: 8, revenue: 3100 },
    { id: 'ls4', restaurantId: 'r1', date: '2025-04-12', duration: 55, maxViewers: 312, avgViewers: 245, orders: 24, revenue: 9600 },
    { id: 'ls5', restaurantId: 'r1', date: '2025-04-10', duration: 28, maxViewers: 89, avgViewers: 67, orders: 5, revenue: 1850 },
    { id: 'ls6', restaurantId: 'r1', date: '2025-04-08', duration: 71, maxViewers: 420, avgViewers: 310, orders: 31, revenue: 12500 },
    { id: 'ls7', restaurantId: 'r1', date: '2025-04-05', duration: 44, maxViewers: 201, avgViewers: 152, orders: 14, revenue: 5600 },
  ],

  // ── Waitlist ──
  waitlist: [
    { id: 'w1', restaurantId: 'r1', name: 'Ryan Davis', guests: 2, phone: '+1 416 555 0201', joinedAt: '6:45 PM', status: 'waiting', estimatedWait: '15 min' },
    { id: 'w2', restaurantId: 'r1', name: 'Sarah Miller', guests: 4, phone: '+1 416 555 0202', joinedAt: '6:52 PM', status: 'waiting', estimatedWait: '25 min' },
    { id: 'w3', restaurantId: 'r1', name: 'Alex Thompson', guests: 1, phone: '+1 416 555 0203', joinedAt: '7:01 PM', status: 'waiting', estimatedWait: '35 min' },
    { id: 'w4', restaurantId: 'r1', name: 'Kate Robinson', guests: 3, phone: '+1 416 555 0204', joinedAt: '7:08 PM', status: 'waiting', estimatedWait: '45 min' },
    { id: 'w5', restaurantId: 'r1', name: 'Robert Johnson', guests: 2, phone: '+1 416 555 0205', joinedAt: '7:15 PM', status: 'waiting', estimatedWait: '55 min' },
  ],

  // ── Orders ──
  orders: [
    { id: 'ord1', restaurantId: 'r1', customerId: 'c1', customerName: 'James Carter', items: [{name:'Dal Makhani', qty:1, price:320},{name:'Garlic Naan',qty:2,price:70},{name:'Gulab Jamun',qty:1,price:120}], total: 580, status: 'delivered', time: '6:30 PM', type: 'delivery' },
    { id: 'ord2', restaurantId: 'r1', customerId: 'c2', customerName: 'Patricia V', items: [{name:'Paneer Tikka',qty:2,price:280},{name:'Veg Biryani',qty:1,price:280}], total: 840, status: 'preparing', time: '7:12 PM', type: 'delivery' },
    { id: 'ord3', restaurantId: 'r1', customerId: 'c3', customerName: 'Karen M', items: [{name:'Palak Paneer',qty:1,price:300},{name:'Laccha Paratha',qty:3,price:60},{name:'Rasgulla',qty:1,price:110}], total: 590, status: 'placed', time: '7:25 PM', type: 'pickup' },
    { id: 'ord4', restaurantId: 'r1', customerId: 'c4', customerName: 'Diana S', items: [{name:'Hara Bhara Kabab',qty:2,price:220},{name:'Dal Makhani',qty:1,price:320}], total: 760, status: 'out_for_delivery', time: '7:40 PM', type: 'delivery' },
  ],

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
