import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { endpoints } from '../api/client';
import { getCurrentSession } from '../api/cognito';

const AppContext = createContext(null);

// Feature flag: live API on / off. Toggle via REACT_APP_USE_API=true at build time.
// When false, the app uses mock data (good for local UI dev). When true, calls real Lambda.
const USE_API = process.env.REACT_APP_USE_API === 'true';

export const RESTAURANTS = [
  {
    id: 'spice-garden',
    name: 'Spice Garden',
    cuisine: 'Indian',
    distance: '1.2mi',
    priceRange: '$$',
    rating: 4.8,
    reviewCount: 342,
    isLive: true,
    liveViewers: 234,
    waitMinutes: 12,
    waitlistCount: 9,
    hasActiveDeal: true,
    dealText: '20% off mains',
    streamTitle: "Chef Ravi's Kitchen",
    streamSubtitle: 'Making Lamb Rogan Josh tonight',
    emoji: '🍛',
    bgColor: '#FFE8D0',
    tags: ['Spicy', 'Vegetarian options', 'Halal'],
    address: '42 Curry Lane, Downtown',
    phone: '+1 (555) 123-4567',
    openHours: '11am – 11pm',
  },
  {
    id: 'napoli-kitchen',
    name: 'Napoli Kitchen',
    cuisine: 'Italian',
    distance: '0.8mi',
    priceRange: '$$$',
    rating: 4.6,
    reviewCount: 218,
    isLive: true,
    liveViewers: 89,
    waitMinutes: 25,
    waitlistCount: 6,
    hasActiveDeal: true,
    dealText: '15% off pizza',
    streamTitle: 'Friday Night Pasta',
    streamSubtitle: 'Live from our open kitchen',
    emoji: '🍕',
    bgColor: '#FDE0C0',
    tags: ['Wood-fired', 'Gluten-free option', 'Wine bar'],
    address: '18 Roma Street, Midtown',
    phone: '+1 (555) 234-5678',
    openHours: '12pm – 10pm',
  },
  {
    id: 'sakura-sushi',
    name: 'Sakura Sushi',
    cuisine: 'Japanese',
    distance: '2.1mi',
    priceRange: '$$$',
    rating: 4.9,
    reviewCount: 512,
    isLive: false,
    goesLiveAt: '7:00 PM',
    liveViewers: 0,
    waitMinutes: 0,
    waitlistCount: 0,
    hasActiveDeal: false,
    dealText: '',
    streamTitle: 'Omakase Evening',
    streamSubtitle: "Chef Kenji's signature course",
    emoji: '🍣',
    bgColor: '#FEF0E4',
    tags: ['Omakase', 'Fresh fish daily', 'Sake selection'],
    address: '7 Blossom Ave, Eastside',
    phone: '+1 (555) 345-6789',
    openHours: '5pm – 11pm',
  },
  {
    id: 'burger-barn',
    name: 'Burger Barn',
    cuisine: 'American',
    distance: '0.4mi',
    priceRange: '$',
    rating: 4.4,
    reviewCount: 891,
    isLive: true,
    liveViewers: 54,
    waitMinutes: 8,
    waitlistCount: 3,
    hasActiveDeal: false,
    dealText: '',
    streamTitle: 'Smash Burger Session',
    streamSubtitle: 'Patties on the griddle, live!',
    emoji: '🍔',
    bgColor: '#FFF0E0',
    tags: ['Smash burgers', 'Craft beer', 'Late night'],
    address: '99 Main Street, Uptown',
    phone: '+1 (555) 456-7890',
    openHours: '11am – 2am',
  },
];

export const MENU_ITEMS = {
  'spice-garden': [
    { id: 'm1', name: 'Lamb Rogan Josh', desc: 'Slow-cooked lamb, aromatic spices, saffron rice', price: 18, category: 'Mains', emoji: '🍖', isLiveDeal: true, dealDiscount: 20, popular: true },
    { id: 'm2', name: 'Chicken Tikka Masala', desc: 'Tender chicken, creamy tomato sauce', price: 16, category: 'Mains', emoji: '🧆', isLiveDeal: false, popular: true },
    { id: 'm3', name: 'Garlic Naan (3pc)', desc: 'Fresh from the tandoor, buttered', price: 5, category: 'Sides', emoji: '🫓', isLiveDeal: false, popular: false },
    { id: 'm4', name: 'Vegetable Biryani', desc: 'Fragrant basmati, seasonal vegetables', price: 14, category: 'Mains', emoji: '🍚', isLiveDeal: true, dealDiscount: 15, popular: false },
    { id: 'm5', name: 'Mango Lassi', desc: 'Fresh mango, yoghurt, cardamom', price: 5, category: 'Drinks', emoji: '🥭', isLiveDeal: false, popular: true },
    { id: 'm6', name: 'Samosa Platter (4pc)', desc: 'Crispy pastry, spiced potato filling', price: 8, category: 'Starters', emoji: '🥟', isLiveDeal: false, popular: false },
    { id: 'm7', name: 'Gulab Jamun', desc: 'Soft milk dumplings in rose syrup', price: 6, category: 'Desserts', emoji: '🍮', isLiveDeal: false, popular: false },
  ],
};

export const CHAT_MESSAGES = [
  { id: 1, user: 'Ayesha', avatar: 'A', color: '#E85D04', message: 'Is the butter chicken spicy?', time: '7:32 PM' },
  { id: 2, user: 'Chef Ravi', avatar: 'R', color: '#1D9E75', message: 'Mild-medium! We can adjust on request 😊', time: '7:32 PM', isHost: true },
  { id: 3, user: 'Mike', avatar: 'M', color: '#B07848', message: 'Just pre-ordered the lamb! Can\'t wait', time: '7:33 PM' },
  { id: 4, user: 'Priya', avatar: 'P', color: '#9B59B6', message: 'Table for 4, what\'s the wait time?', time: '7:33 PM' },
  { id: 5, user: 'Chef Ravi', avatar: 'R', color: '#1D9E75', message: 'About 12 minutes right now, join the waitlist!', time: '7:34 PM', isHost: true },
  { id: 6, user: 'Sam', avatar: 'S', color: '#E85D04', message: 'That lamb looks incredible 🔥', time: '7:35 PM' },
];

export const OWNER_ORDERS = [
  { id: 'O014', table: 'Table 6', type: 'dine-in', status: 'new', items: ['Lamb Rogan Josh × 2', 'Garlic Naan × 3'], total: 41, time: '7:38 PM' },
  { id: 'O013', table: 'Pre-order', type: 'pre-order', status: 'preparing', items: ['Chicken Tikka Masala × 1', 'Naan × 2'], total: 21, time: '7:30 PM' },
  { id: 'O012', table: 'Table 2', type: 'dine-in', status: 'ready', items: ['Vegetable Biryani × 1', 'Mango Lassi × 2'], total: 24, time: '7:22 PM' },
  { id: 'O011', table: 'Table 8', type: 'dine-in', status: 'served', items: ['Samosa Platter', 'Lamb Rogan Josh × 1'], total: 26, time: '7:10 PM' },
];

export function AppProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [waitlist, setWaitlist] = useState(null);
  const [userRole, setUserRole] = useState('customer'); // 'customer' | 'owner' | 'admin'
  const [isLive, setIsLive] = useState(true);
  const [orders, setOrders] = useState(OWNER_ORDERS);
  const [notifications, setNotifications] = useState(3);
  const [restaurants, setRestaurants] = useState(RESTAURANTS);
  const [apiStatus, setApiStatus] = useState({ loading: false, error: null });

  // ─── Live API loader (mock fallback if USE_API=false or call fails) ───
  const refresh = useCallback(async () => {
    if (!USE_API) return;
    setApiStatus({ loading: true, error: null });
    try {
      const r = await endpoints.restaurants();
      if (Array.isArray(r) && r.length) setRestaurants(r);
      try {
        const myWait = await endpoints.myWaitlist();
        if (myWait && myWait.position) setWaitlist(myWait);
      } catch (e) { /* not signed in, ignore */ }
      try {
        if (userRole === 'owner') {
          const o = await endpoints.listOrders();
          if (Array.isArray(o) && o.length) setOrders(o);
        }
      } catch (e) { /* not signed in, ignore */ }
      setApiStatus({ loading: false, error: null });
    } catch (e) {
      console.warn('[LiveHushh] API unavailable, using mock data:', e.message);
      setApiStatus({ loading: false, error: e.message });
    }
  }, [userRole]);

  useEffect(() => { refresh(); }, [refresh]);

  // ─── Restore Cognito session on app load ────────────────────────────
  useEffect(() => {
    if (!USE_API) return;
    getCurrentSession().then(session => {
      if (session?.role) setUserRole(session.role);
    }).catch(() => {});
  }, []);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
  };

  const updateCartQty = (itemId, qty) => {
    if (qty <= 0) return removeFromCart(itemId);
    setCart(prev => prev.map(i => i.id === itemId ? { ...i, qty } : i));
  };

  const cartTotal = cart.reduce((sum, i) => {
    const price = i.isLiveDeal ? i.price * (1 - i.dealDiscount / 100) : i.price;
    return sum + price * i.qty;
  }, 0);

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  const joinWaitlist = async (restaurantId, guests) => {
    // Optimistic local update so the UI never feels laggy.
    setWaitlist({ restaurantId, guests, position: 3, total: 9, joinedAt: new Date(), estimatedTime: '7:42 PM' });
    if (USE_API) {
      try {
        const result = await endpoints.joinWaitlist({ restaurantId, guests });
        if (result) setWaitlist(result);
      } catch (e) {
        console.warn('[LiveHushh] joinWaitlist API failed:', e.message);
      }
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    if (USE_API) {
      try { await endpoints.updateOrder(orderId, { status: newStatus }); }
      catch (e) { console.warn('[LiveHushh] updateOrderStatus API failed:', e.message); }
    }
  };

  return (
    <AppContext.Provider value={{
      cart, addToCart, removeFromCart, updateCartQty, cartTotal, cartCount,
      waitlist, joinWaitlist,
      userRole, setUserRole,
      isLive, setIsLive,
      orders, updateOrderStatus,
      notifications, setNotifications,
      restaurants,
      menuItems: MENU_ITEMS,
      chatMessages: CHAT_MESSAGES,
      refresh, apiStatus, useApi: USE_API,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
