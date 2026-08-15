/**
 * LiveHushh — API Lambda (Node.js 18.x)
 *
 * Routes:
 *   GET    /auth/profile           — fetch user profile
 *   POST   /auth/profile           — save Cognito user profile
 *   GET    /restaurants            — list restaurants
 *   POST   /restaurants            — create/update restaurant (owner)
 *   GET    /orders                 — list orders
 *   POST   /orders                 — place order
 *   GET    /waitlist               — get waitlist
 *   POST   /waitlist               — join waitlist
 *   DELETE /waitlist/:id           — leave waitlist
 *   GET    /videos                 — list videos
 *   POST   /videos                 — submit video
 *   PATCH  /videos/:id             — approve/reject video (admin)
 *   GET    /deals                  — list deals
 *   POST   /deals                  — create deal (owner)
 *   PATCH  /deals/:id              — toggle deal (owner)
 *   DELETE /deals/:id              — delete deal (owner)
 *   GET    /promos                 — list promos (admin) or validate (customer ?code=X)
 *   POST   /promos                 — create promo (admin)
 *   PATCH  /promos/:id             — enable/disable promo (admin)
 *   DELETE /promos/:id             — delete promo (admin)
 *   GET    /live/channel           — get or create IVS channel for owner
 *   POST   /live/start             — owner marks restaurant as live
 *   POST   /live/end               — owner ends live session
 *   GET    /live/sessions          — get all currently live restaurants
 *   POST   /push/subscribe         — store browser push subscription + location
 *   DELETE /push/subscribe         — remove push subscription
 */

const { MongoClient, ObjectId } = require('mongodb');
const webpush = require('web-push');
const Stripe   = require('stripe');
const stripe   = Stripe(process.env.STRIPE_SECRET_KEY || '');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const sesClient = new SESClient({ region: 'us-east-1' });
const { IvsClient, CreateChannelCommand, GetChannelCommand } = require('@aws-sdk/client-ivs');
const ivsClient = new IvsClient({ region: 'us-east-1' });
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = new S3Client({ region: 'us-east-1' });
const S3_BUCKET = process.env.S3_BUCKET || '';

const { TextractClient, DetectDocumentTextCommand } = require('@aws-sdk/client-textract');
const textractClient = new TextractClient({ region: 'us-east-1' });
const SES_FROM  = process.env.SES_FROM_EMAIL || 'punitsharma4u@gmail.com';

// VAPID keys — generate with: npx web-push generate-vapid-keys
// Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in Lambda environment variables
const VAPID_PUBLIC  = process.env.VAPID_PUBLIC_KEY  || '';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_EMAIL   = process.env.VAPID_EMAIL       || 'mailto:admin@livehushh.com';
if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE);
}

const MONGO_URI  = process.env.MONGO_URI;   // set in Amplify console → Function → Environment variables
const DB_NAME    = 'livehushh';

let _client;
async function getDb() {
  if (!_client) {
    _client = new MongoClient(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,   // fail fast if no server found
      connectTimeoutMS:         5000,   // TCP connection timeout
      socketTimeoutMS:         10000,   // individual operation timeout
    });
    try {
      await _client.connect();
    } catch (e) {
      _client = null;   // reset so next invocation retries fresh
      throw e;
    }
  }
  return _client.db(DB_NAME);
}

// ─── helpers ────────────────────────────────────────────────────────────────

function resp(statusCode, body) {
  if (statusCode >= 500) console.error(`[${statusCode}]`, JSON.stringify(body));
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    },
    body: JSON.stringify(body),
  };
}

function parseBody(event) {
  try { return JSON.parse(event.body || '{}'); } catch { return {}; }
}

// Cognito adds claims to event.requestContext.authorizer.claims when the
// API Gateway authorizer is set to "COGNITO_USER_POOLS".
// Falls back to parsing the JWT from the Authorization header directly
// (works whether or not API Gateway has a Cognito authorizer configured).
// Admin API key — set ADMIN_API_KEY env var in Lambda, or use this default for dev
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'lh-admin-2024-secret';

function getClaims(event) {
  const authClaims = event.requestContext?.authorizer?.claims;
  if (authClaims && authClaims.sub) return authClaims;

  const auth = (event.headers || {})['Authorization'] || (event.headers || {})['authorization'] || '';

  // Admin API key shortcut (no Cognito account needed for admin dashboard)
  if (auth === `AdminKey ${ADMIN_API_KEY}`) {
    return { sub: 'admin', email: 'admin@livehushh.com', __isAdmin: true };
  }

  // Parse JWT payload from Authorization header
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
  if (!token) return {};
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return {};
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    return payload;
  } catch {
    return {};
  }
}

// ─── restaurant normalizer ──────────────────────────────────────────────────
// Handles both legacy records (cuisine_type, photos[], is_live) and new records
// (cuisine, imageUrl, isLive) so the frontend always gets consistent field names.
function normalizeRestaurant(r) {
  const id = (r._id || r.restaurant_id || r.id || '').toString();
  return {
    id,
    _id: id,
    name:        r.name        || 'Unnamed Restaurant',
    cuisine:     r.cuisine     || r.cuisine_type || 'Restaurant',
    description: r.description || '',
    city:        r.city        || '',
    address:     r.address     || '',
    phone:       r.phone       || '',
    hours:       r.hours       || '',
    priceRange:  r.priceRange  || r.price_range || '$$',
    image:       r.imageUrl    || r.image || (r.photos && r.photos[0]) || '',
    website:     r.website     || '',
    isLive:      r.isLive      || r.is_live      || false,
    liveViewers: r.liveViewers || r.live_viewers  || 0,
    latitude:    r.latitude    || null,
    longitude:   r.longitude   || null,
    isOpen:      true,   // default; can be computed from hours later
    rating:      r.rating      || 4.5,
    distance:    r.distance    || '< 1',
    isVeg:       r.isVeg       || false,
    planStatus:  r.planStatus  || null,
    ownerSub:    r.ownerSub    || r.owner_id || null,
    ownerName:   r.ownerName   || '',
    // Directory listings created by admin with no owner yet — customers can
    // browse them, but photos/menu/live features stay locked until a real
    // owner claims the listing via POST /restaurants/:id/claim.
    claimed:     !!(r.ownerSub || r.owner_id),
    isListing:   !!r.isListing,
    trialEndsAt: r.trialEndsAt || null,
    menu:           r.menu           || [],
    tables:         r.tables         || [],
    isFull:         r.isFull         || false,
    coverImage:     r.coverImage     || '',
    playbackUrl:    r.playbackUrl    || r.ivsPlaybackUrl || '',
    deliveryFee:    r.deliveryFee    != null ? parseFloat(r.deliveryFee) : null,
    approvalStatus: r.approvalStatus || 'approved',
  };
}

// ─── demo fallback restaurants (shown when MongoDB is unreachable) ───────────
const DEMO_RESTAURANTS = [
  { id:'demo1', _id:'demo1', name:'The Spice Garden', cuisine:'Indian', description:'Authentic Indian cuisine with live cooking shows every evening.', city:'Toronto', address:'123 Main St', phone:'416-555-0101', hours:'11am-10pm', priceRange:'$$', image:'', website:'', isLive:true, liveViewers:12, latitude:43.65, longitude:-79.38, isOpen:true, rating:4.8, distance:'0.3 km', isVeg:false, ownerSub:null, ownerName:'Raj Patel', planStatus:'active', trialEndsAt:null, menu:[] },
  { id:'demo2', _id:'demo2', name:'Bella Italia',     cuisine:'Italian', description:'Wood-fired pizza and fresh pasta. Watch our chefs go live at 7pm.', city:'Toronto', address:'456 Queen St', phone:'416-555-0202', hours:'12pm-11pm', priceRange:'$$$', image:'', website:'', isLive:false, liveViewers:0, latitude:43.65, longitude:-79.39, isOpen:true, rating:4.6, distance:'0.7 km', isVeg:false, ownerSub:null, ownerName:'Marco Rossi', planStatus:'active', trialEndsAt:null, menu:[] },
  { id:'demo3', _id:'demo3', name:'Green Bowl',       cuisine:'Vegan', description:'Fresh plant-based bowls and smoothies. Healthy eating made delicious.', city:'Toronto', address:'789 King St', phone:'416-555-0303', hours:'8am-8pm', priceRange:'$', image:'', website:'', isLive:false, liveViewers:0, latitude:43.64, longitude:-79.40, isOpen:true, rating:4.7, distance:'1.2 km', isVeg:true, ownerSub:null, ownerName:'Aisha Kumar', planStatus:'active', trialEndsAt:null, menu:[] },
  { id:'demo4', _id:'demo4', name:'Dragon Palace',    cuisine:'Chinese', description:'Traditional dim sum and Szechuan specialties. Family recipes since 1985.', city:'Toronto', address:'321 Dundas St', phone:'416-555-0404', hours:'10am-10pm', priceRange:'$$', image:'', website:'', isLive:false, liveViewers:0, latitude:43.66, longitude:-79.37, isOpen:true, rating:4.5, distance:'1.8 km', isVeg:false, ownerSub:null, ownerName:'Wei Chen', planStatus:'active', trialEndsAt:null, menu:[] },
  { id:'demo5', _id:'demo5', name:'Taco Loco',        cuisine:'Mexican', description:'Street-style tacos and fresh guacamole. Live salsa cooking Fridays!', city:'Toronto', address:'567 Bloor St', phone:'416-555-0505', hours:'11am-9pm', priceRange:'$', image:'', website:'', isLive:false, liveViewers:0, latitude:43.67, longitude:-79.41, isOpen:true, rating:4.4, distance:'2.1 km', isVeg:false, ownerSub:null, ownerName:'Carlos Mendez', planStatus:'active', trialEndsAt:null, menu:[] },
];

// ─── router ─────────────────────────────────────────────────────────────────

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return resp(200, {});

  const path   = event.path.replace(/\/+$/, '');   // strip trailing slash
  const method = event.httpMethod;
  const claims = getClaims(event);
  const userId = claims.sub;                        // Cognito user ID

  console.log(`[REQ] ${method} ${path} | user=${userId || 'anon'}`);

  // ── Public GET /restaurants with DB fallback ──────────────────────────────
  // Return demo data immediately if MongoDB is unreachable, so the app always
  // shows restaurants to guests/customers even during DB downtime.
  if (method === 'GET' && path.endsWith('/restaurants') && !userId) {
    try {
      const db = await getDb();
      const now = new Date();
      const list = await db.collection('restaurants').find({
        $or: [
          { planStatus: { $exists: false } },
          { planStatus: null },
          { planStatus: 'active' },
          { planStatus: 'trial', trialEndsAt: { $gt: now } }
        ]
      }).toArray();
      return resp(200, list.map(normalizeRestaurant));
    } catch (dbErr) {
      console.warn('[WARN] MongoDB unavailable, serving demo restaurants:', dbErr.message);
      return resp(200, DEMO_RESTAURANTS);
    }
  }

  try {
    const db = await getDb();

    // ── Role lookup ─────────────────────────────────────────────────────────
    let role = 'customer'; // safe default
    if (claims.__isAdmin) {
      role = 'admin'; // admin API key auth
    } else if (userId) {
      const userRecord = await db.collection('users').findOne(
        { cognitoSub: userId },
        { projection: { role: 1 } }
      );
      if (userRecord && userRecord.role) role = userRecord.role;
    }

    // ── GET /admin/users ────────────────────────────────────────────────────
    if (method === 'GET' && path.endsWith('/admin/users')) {
      if (role !== 'admin') return resp(403, { error: 'Admin only' });
      const users = await db.collection('users').find({})
        .sort({ updatedAt: -1 })
        .project({ _id: 0, cognitoSub: 1, email: 1, name: 1, role: 1, planStatus: 1, activePlan: 1, selectedPlan: 1, trialEndsAt: 1, planActivatedAt: 1, planExpiresAt: 1, createdAt: 1, updatedAt: 1 })
        .toArray();
      return resp(200, users);
    }

    // ── GET /admin/subscriptions ──────────────────────────────────────────────
    // Returns all owners who have an active plan or are on trial, joined with restaurant name
    if (method === 'GET' && path.endsWith('/admin/subscriptions')) {
      if (role !== 'admin') return resp(403, { error: 'Admin only' });
      const owners = await db.collection('users').find({
        role: 'owner',
        planStatus: { $in: ['active', 'trial', 'expired'] }
      }).sort({ updatedAt: -1 }).toArray();

      // Bulk-fetch restaurants in one query
      const ownerSubs = owners.map(o => o.cognitoSub).filter(Boolean);
      const restaurants = await db.collection('restaurants').find(
        { ownerSub: { $in: ownerSubs } },
        { projection: { ownerSub: 1, name: 1 } }
      ).toArray();
      const restMap = {};
      restaurants.forEach(r => { restMap[r.ownerSub] = r.name; });

      const PLAN_MRR = { starter: 99, pro: 199, enterprise: 499 };
      const subs = owners.map(o => {
        const plan = o.activePlan || o.selectedPlan || 'starter';
        const mrr  = PLAN_MRR[plan] || 99;
        const fmt  = d => d ? new Date(d).toLocaleDateString('en-CA',{month:'short',year:'numeric'}) : '—';
        return {
          name:       restMap[o.cognitoSub] || o.name || o.email,
          email:      o.email,
          plan:       plan.charAt(0).toUpperCase() + plan.slice(1),
          mrr:        `$${mrr}`,
          start:      fmt(o.planActivatedAt || o.trialStartedAt || o.createdAt),
          next:       fmt(o.planExpiresAt || o.trialEndsAt),
          status:     o.planStatus,
        };
      });
      return resp(200, subs);
    }

    // ── GET /admin/stats ──────────────────────────────────────────────────────
    // Returns platform-wide KPI counts for the overview dashboard
    if (method === 'GET' && path.endsWith('/admin/stats')) {
      if (role !== 'admin') return resp(403, { error: 'Admin only' });
      const [totalRestaurants, totalUsers, activeOwners, liveSessions] = await Promise.all([
        db.collection('restaurants').countDocuments({}),
        db.collection('users').countDocuments({}),
        db.collection('users').countDocuments({ role: 'owner', planStatus: { $in: ['active', 'trial'] } }),
        db.collection('liveSessions').countDocuments({ status: 'live' }),
      ]);
      // MRR = sum of all active plan owners
      const PLAN_MRR = { starter: 99, pro: 199, enterprise: 499 };
      const activeOwnerDocs = await db.collection('users').find(
        { role: 'owner', planStatus: 'active' },
        { projection: { activePlan: 1 } }
      ).toArray();
      const mrr = activeOwnerDocs.reduce((sum, o) => sum + (PLAN_MRR[o.activePlan] || 99), 0);

      // Plan distribution
      const planCounts = { starter: 0, pro: 0, enterprise: 0, trial: 0 };
      const allOwners = await db.collection('users').find(
        { role: 'owner' },
        { projection: { planStatus: 1, activePlan: 1 } }
      ).toArray();
      allOwners.forEach(o => {
        if (o.planStatus === 'trial') planCounts.trial++;
        else if (o.planStatus === 'active') planCounts[o.activePlan] = (planCounts[o.activePlan] || 0) + 1;
      });

      return resp(200, { totalRestaurants, totalUsers, activeOwners, liveSessions, mrr, planCounts });
    }

    // ── GET /admin/restaurant-stats ───────────────────────────────────────────
    // Per-restaurant stats for admin dashboard table
    if (method === 'GET' && path.endsWith('/admin/restaurant-stats')) {
      if (role !== 'admin') return resp(403, { error: 'Admin only' });
      const restaurants = await db.collection('restaurants').find({}).toArray();
      const stats = await Promise.all(restaurants.map(async (r) => {
        const rid = r._id;
        const orders = await db.collection('orders').find({ restaurantId: String(rid) }).toArray();
        const totalOrders = orders.length;
        const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
        const orderTypes = { 'dine-in': 0, pickup: 0, delivery: 0 };
        orders.forEach(o => { if (orderTypes[o.orderType] !== undefined) orderTypes[o.orderType]++; });
        const liveSessions = await db.collection('liveSessions').countDocuments({ restaurantId: String(rid) });
        const totalViewers = await db.collection('liveSessions').aggregate([
          { $match: { restaurantId: String(rid) } },
          { $group: { _id: null, total: { $sum: '$peakViewers' } } }
        ]).toArray().then(r => r[0]?.total || 0).catch(() => 0);
        return {
          id: String(rid), name: r.name, city: r.city, cuisine: r.cuisine,
          plan: r.activePlan || r.planStatus || 'trial',
          isLive: r.isLive || false, joinedAt: r.createdAt || r.updatedAt,
          ownerEmail: r.ownerEmail || '—',
          approvalStatus: r.approvalStatus || 'approved',
          totalOrders, revenue, orderTypes, liveSessionCount: liveSessions, totalViewers,
        };
      }));
      return resp(200, stats);
    }

    // ── GET /admin/pending ────────────────────────────────────────────────────
    // List restaurants pending admin approval
    if (method === 'GET' && path.endsWith('/admin/pending')) {
      if (role !== 'admin') return resp(403, { error: 'Admin only' });
      const pending = await db.collection('restaurants').find({ approvalStatus: 'pending' }).toArray();
      return resp(200, pending.map(r => ({
        id: String(r._id), name: r.name, city: r.city, cuisine: r.cuisine,
        ownerEmail: r.ownerEmail || '—', createdAt: r.createdAt,
        phone: r.phone, address: r.address,
      })));
    }

    // ── POST /admin/approve ───────────────────────────────────────────────────
    // Approve or reject a restaurant; approved owners get push notification
    if (method === 'POST' && path.endsWith('/admin/approve')) {
      if (role !== 'admin') return resp(403, { error: 'Admin only' });
      const { restaurantId, action, reason } = parseBody(event);
      if (!restaurantId || !['approve', 'reject'].includes(action)) {
        return resp(400, { error: 'restaurantId and action (approve|reject) required' });
      }
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      const update = { approvalStatus: newStatus, approvedAt: new Date() };
      if (reason) update.rejectionReason = reason;
      await db.collection('restaurants').updateOne(
        { _id: new ObjectId(restaurantId) },
        { $set: update }
      );
      // Send push notification to owner if approved
      if (action === 'approve') {
        const rest = await db.collection('restaurants').findOne({ _id: new ObjectId(restaurantId) });
        if (rest?.ownerSub) {
          const ownerTokens = await db.collection('expoPushTokens')
            .find({ userId: rest.ownerSub }).toArray();
          if (ownerTokens.length > 0) {
            const messages = ownerTokens.map(t => ({
              to: t.token, sound: 'default',
              title: '🎉 You\'re approved!',
              body: `${rest.name} is now live on LiveHushh. Start exploring your dashboard!`,
              data: { type: 'approval' },
            }));
            await fetch('https://exp.host/--/api/v2/push/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(messages),
            }).catch(() => {});
          }
        }
      }
      return resp(200, { ok: true, status: newStatus });
    }

    // ── GET /auth/profile ───────────────────────────────────────────────────
    if (method === 'GET' && path.endsWith('/auth/profile')) {
      if (!userId) return resp(401, { error: 'Unauthorized' });
      const profile = await db.collection('users').findOne(
        { cognitoSub: userId },
        { projection: { _id: 0, role: 1, name: 1, restaurant: 1, email: 1 } }
      );
      if (!profile) return resp(404, { error: 'Profile not found' });
      return resp(200, profile);
    }

    // ── POST /auth/profile ──────────────────────────────────────────────────
    if (method === 'POST' && path.endsWith('/auth/profile')) {
      if (!userId) return resp(401, { error: 'Unauthorized' });
      const body = parseBody(event);
      const { name, restaurant } = body;
      // Accept role from the request body (Cognito token may not have custom:role)
      const userRole = body.role || role;
      await db.collection('users').updateOne(
        { cognitoSub: userId },
        { $set: { cognitoSub: userId, email: claims.email, name, role: userRole, restaurant, updatedAt: new Date() } },
        { upsert: true }
      );
      return resp(200, { ok: true });
    }

    // ── POST /owner/onboard ─────────────────────────────────────────────────
    if (method === 'POST' && path.endsWith('/owner/onboard')) {
      if (!userId) return resp(401, { error: 'Unauthorized' });
      const body = parseBody(event);
      const now  = new Date();
      const trialEndsAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      // Save restaurant (live immediately during trial)
      await db.collection('restaurants').updateOne(
        { ownerSub: userId },
        { $set: { ...body.restaurant, ownerSub: userId, ownerEmail: claims.email, isLive: true, planStatus: 'trial', trialEndsAt, updatedAt: now } },
        { upsert: true }
      );
      // Record trial on user record
      await db.collection('users').updateOne(
        { cognitoSub: userId },
        { $set: { planStatus: 'trial', selectedPlan: body.planType || 'pro', trialStartedAt: now, trialEndsAt, updatedAt: now } },
        { upsert: true }
      );
      return resp(200, { ok: true, trialEndsAt });
    }

    // ── GET /owner/status ───────────────────────────────────────────────────
    if (method === 'GET' && path.endsWith('/owner/status')) {
      if (!userId) return resp(401, { error: 'Unauthorized' });
      const user = await db.collection('users').findOne({ cognitoSub: userId });
      const restaurant = await db.collection('restaurants').findOne({ ownerSub: userId });
      if (!user) return resp(200, { planStatus: 'none', hasRestaurant: false });
      const now = new Date();
      let planStatus = user.planStatus || 'none';
      // Auto-expire trial if time is up
      if (planStatus === 'trial' && user.trialEndsAt && now > new Date(user.trialEndsAt)) {
        planStatus = 'expired';
        await db.collection('users').updateOne({ cognitoSub: userId }, { $set: { planStatus: 'expired' } });
        if (restaurant) await db.collection('restaurants').updateOne({ ownerSub: userId }, { $set: { isLive: false, planStatus: 'expired' } });
      }
      // Auto-expire paid plan if monthly period ended
      if (planStatus === 'active' && user.planExpiresAt && now > new Date(user.planExpiresAt)) {
        planStatus = 'expired';
        await db.collection('users').updateOne({ cognitoSub: userId }, { $set: { planStatus: 'expired' } });
        if (restaurant) await db.collection('restaurants').updateOne({ ownerSub: userId }, { $set: { isLive: false, planStatus: 'expired' } });
      }
      return resp(200, {
        planStatus,
        selectedPlan:    user.selectedPlan    || null,
        activePlan:      user.activePlan      || null,
        trialStartedAt:  user.trialStartedAt  || null,
        trialEndsAt:     user.trialEndsAt     || null,
        planActivatedAt: user.planActivatedAt || null,
        planExpiresAt:   user.planExpiresAt   || null,
        hasRestaurant:   !!restaurant,
      });
    }

    // ── GET /owner/analytics ────────────────────────────────────────────────
    if (method === 'GET' && path.endsWith('/owner/analytics')) {
      if (!userId) return resp(401, { error: 'Unauthorized' });
      const [rest, videosCount, ordersArr, dealsCount] = await Promise.allSettled([
        db.collection('restaurants').findOne({ ownerSub: userId }),
        db.collection('videos').countDocuments({ ownerSub: userId }),
        db.collection('orders').find({ restaurantOwnerSub: userId }).sort({ createdAt: -1 }).limit(50).toArray(),
        db.collection('deals').countDocuments({ ownerSub: userId }),
      ]);
      const restaurant = rest.status === 'fulfilled' ? rest.value : null;
      const videos = videosCount.status === 'fulfilled' ? videosCount.value : 0;
      const orders = ordersArr.status === 'fulfilled' ? ordersArr.value : [];
      const deals = dealsCount.status === 'fulfilled' ? dealsCount.value : 0;
      const menuCount = restaurant?.menu?.reduce((s, c) => s + (c.items?.length || 0), 0) || 0;
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
      const views = restaurant?.profileViews || 0;
      const waitlistCount = restaurant ? await db.collection('waitlist').countDocuments({ restaurantId: restaurant._id.toString() }) : 0;
      return resp(200, {
        views,
        menuItems: menuCount,
        videoCount: videos,
        deals,
        orders: totalOrders,
        revenue: totalRevenue,
        waitlist: waitlistCount,
        rating: restaurant?.rating || 4.5,
        isLive: restaurant?.isLive || false,
      });
    }

    // ── POST /owner/subscribe ───────────────────────────────────────────────
    // In production: call this from a Stripe webhook after payment confirmation.
    // For MVP demo: call directly from the UI.
    if (method === 'POST' && path.endsWith('/owner/subscribe')) {
      if (!userId) return resp(401, { error: 'Unauthorized' });
      const { planType } = parseBody(event); // 'starter' | 'pro' | 'enterprise'
      const now = new Date();
      const planExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      await db.collection('users').updateOne(
        { cognitoSub: userId },
        { $set: { planStatus: 'active', activePlan: planType, planActivatedAt: now, planExpiresAt, updatedAt: now } },
        { upsert: true }
      );
      await db.collection('restaurants').updateOne(
        { ownerSub: userId },
        { $set: { isLive: true, planStatus: 'active', activePlan: planType, updatedAt: now } }
      );
      return resp(200, { ok: true, planType, planExpiresAt });
    }

    // ── POST /upload ────────────────────────────────────────────────────────
    if (method === 'POST' && path.endsWith('/upload')) {
      if (!userId) return resp(401, { error: 'Unauthorized' });
      if (!S3_BUCKET) {
        return resp(503, { error: 'Image storage not configured. Please set S3_BUCKET environment variable in Lambda.' });
      }
      const body = parseBody(event);
      const { base64, filename = 'image.jpg', contentType = 'image/jpeg' } = body;
      if (!base64) return resp(400, { error: 'base64 image data required' });
      try {
        const buffer = Buffer.from(base64, 'base64');
        const key = `livehushh/uploads/${userId}/${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '')}`;
        await s3Client.send(new PutObjectCommand({
          Bucket: S3_BUCKET,
          Key: key,
          Body: buffer,
          ContentType: contentType,
        }));
        const url = `https://${S3_BUCKET}.s3.amazonaws.com/${key}`;
        return resp(200, { url, key });
      } catch (e) {
        console.error('S3 upload error:', e);
        return resp(500, { error: 'Upload failed: ' + e.message });
      }
    }

    // ── POST /ocr ────────────────────────────────────────────────────────────
    if (method === 'POST' && path.endsWith('/ocr')) {
      if (!userId) return resp(401, { error: 'Unauthorized' });
      const body = parseBody(event);
      const { image } = body;
      if (!image) return resp(400, { error: 'image (base64) required' });
      try {
        const buffer = Buffer.from(image, 'base64');
        const result = await textractClient.send(new DetectDocumentTextCommand({
          Document: { Bytes: buffer },
        }));
        const text = (result.Blocks || [])
          .filter(b => b.BlockType === 'LINE' && b.Text)
          .map(b => b.Text)
          .join('\n');
        return resp(200, { text, blockCount: result.Blocks?.length || 0 });
      } catch (e) {
        console.error('Textract OCR error:', e);
        return resp(500, { error: 'OCR failed: ' + e.message });
      }
    }

    // ── GET /restaurants/:id ────────────────────────────────────────────────
    if (method === 'GET' && /\/restaurants\/[^/]+$/.test(path)) {
      const rid = path.split('/').pop();
      let query;
      try { query = { _id: new ObjectId(rid) }; } catch { query = { id: rid }; }
      const rest = await db.collection('restaurants').findOne(query);
      if (!rest) return resp(404, { error: 'Restaurant not found' });
      return resp(200, normalizeRestaurant(rest));
    }

    // ── GET /restaurants ────────────────────────────────────────────────────
    if (method === 'GET' && path.endsWith('/restaurants')) {
      const ownerView = (event.queryStringParameters || {}).view === 'owner';

      if (role === 'admin') {
        // Admin sees every restaurant in the database
        const list = await db.collection('restaurants').find({}).toArray();
        return resp(200, list.map(normalizeRestaurant));
      }

      if (role === 'owner' && ownerView) {
        // Owner dashboard: return only THIS owner's restaurant(s)
        const list = await db.collection('restaurants').find({
          $or: [{ ownerSub: userId }, { owner_id: userId }]
        }).toArray();
        return resp(200, list.map(normalizeRestaurant));
      }

      // Customer view (or owner browsing as customer): show all active/trial/legacy restaurants
      // Exclude restaurants pending admin approval
      const now = new Date();
      const list = await db.collection('restaurants').find({
        approvalStatus: { $ne: 'pending' },   // hide pending-approval restaurants from customers
        $or: [
          { planStatus: { $exists: false } },                     // legacy — always show
          { planStatus: null },                                    // explicitly null — always show
          { planStatus: 'active' },                               // paid plan
          { planStatus: 'trial', trialEndsAt: { $gt: now } }     // valid trial
        ]
      }).toArray();
      return resp(200, list.map(normalizeRestaurant));
    }

    // ── POST /admin/restaurants/listing ─────────────────────────────────────
    // Admin-only: create an unclaimed directory listing (name/address/cuisine
    // only, no owner yet). Distinct from POST /restaurants below, which always
    // upserts against the calling user's ownerSub — that would collapse every
    // admin-created listing into a single document since they'd all share the
    // admin API key's identity.
    if (method === 'POST' && path.endsWith('/admin/restaurants/listing')) {
      if (role !== 'admin') return resp(403, { error: 'Admin only' });
      const body = parseBody(event);
      if (!body.name) return resp(400, { error: 'name is required' });

      let { latitude, longitude } = body;
      if ((latitude == null || longitude == null) && (body.address || body.city)) {
        try {
          const q = encodeURIComponent([body.address, body.city].filter(Boolean).join(', '));
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
            { headers: { 'User-Agent': 'LiveHushhApp/1.0' } }
          );
          const geoData = await geoRes.json();
          if (geoData && geoData[0]) {
            latitude  = parseFloat(geoData[0].lat);
            longitude = parseFloat(geoData[0].lon);
          }
        } catch (geoErr) {
          console.warn('[GEO] Listing geocode failed:', geoErr.message);
        }
      }

      const doc = {
        name:        body.name,
        cuisine:     body.cuisine || 'Restaurant',
        description: body.description || '',
        city:        body.city || '',
        address:     body.address || '',
        priceRange:  body.priceRange || '$$',
        placeholderIcon: body.placeholderIcon || '',
        latitude:    latitude  != null ? latitude  : null,
        longitude:   longitude != null ? longitude : null,
        ownerSub:    null,
        isListing:   true,
        approvalStatus: 'approved',
        createdAt:   new Date(),
      };
      const result = await db.collection('restaurants').insertOne(doc);
      return resp(200, { ok: true, id: result.insertedId.toString() });
    }

    // ── POST /restaurants/:id/claim ─────────────────────────────────────────
    // A real restaurant owner claims an admin-created directory listing,
    // taking over ownership so they can add photos, menu, and go live.
    if (method === 'POST' && /\/restaurants\/[^/]+\/claim$/.test(path)) {
      if (role !== 'owner' && role !== 'admin') return resp(403, { error: 'Owners only' });
      const parts = path.split('/');
      const id = parts[parts.length - 2];
      let query;
      try { query = { _id: new ObjectId(id) }; } catch { query = { id }; }

      const rest = await db.collection('restaurants').findOne(query);
      if (!rest) return resp(404, { error: 'Listing not found' });
      if (rest.ownerSub) return resp(409, { error: 'This listing has already been claimed' });

      await db.collection('restaurants').updateOne(query, {
        $set: { ownerSub: userId, isListing: false, approvalStatus: 'approved', claimedAt: new Date() },
      });
      return resp(200, { ok: true });
    }

    // ── POST /restaurants ───────────────────────────────────────────────────
    if (method === 'POST' && path.endsWith('/restaurants')) {
      if (role !== 'owner' && role !== 'admin') return resp(403, { error: 'Owners only' });
      const body = parseBody(event);
      // Auto-geocode address → lat/lng using Nominatim (free, no API key)
      // Only geocode if address/city changed and we don't already have coords
      let { latitude, longitude } = body;
      if ((latitude == null || longitude == null) && (body.address || body.city)) {
        try {
          const q = encodeURIComponent([body.address, body.city].filter(Boolean).join(', '));
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
            { headers: { 'User-Agent': 'LiveHushhApp/1.0' } }
          );
          const geoData = await geoRes.json();
          if (geoData && geoData[0]) {
            latitude  = parseFloat(geoData[0].lat);
            longitude = parseFloat(geoData[0].lon);
            console.log(`[GEO] ${body.name} geocoded to ${latitude}, ${longitude}`);
          }
        } catch (geoErr) {
          console.warn('[GEO] Geocoding failed:', geoErr.message);
        }
      }
      const saveData = { ...body, ownerSub: userId, updatedAt: new Date() };
      if (latitude != null)  saveData.latitude  = latitude;
      if (longitude != null) saveData.longitude = longitude;
      const result = await db.collection('restaurants').updateOne(
        { ownerSub: userId },
        {
          $set: saveData,
          // Only set approvalStatus on first insert — don't overwrite approved/rejected status
          $setOnInsert: { approvalStatus: 'pending', createdAt: new Date() },
        },
        { upsert: true }
      );
      return resp(200, { ok: true, upserted: result.upsertedCount > 0, latitude, longitude });
    }

    // ── POST /restaurants/:id/rate ──────────────────────────────────────────
    if (method === 'POST' && /\/restaurants\/[^/]+\/rate$/.test(path)) {
      const rid = path.split('/').slice(-2)[0];
      const { rating } = parseBody(event);
      if (!rating || rating < 1 || rating > 5) return resp(400, { error: 'Rating must be 1–5' });
      // Store individual rating, compute new average
      let query;
      try { query = { _id: new ObjectId(rid) }; } catch { query = { id: rid }; }
      const rest = await db.collection('restaurants').findOne(query, { projection: { rating: 1, ratingCount: 1 } });
      if (!rest) return resp(404, { error: 'Restaurant not found' });
      const oldCount = rest.ratingCount || 1;
      const oldRating = rest.rating || 4.5;
      const newCount = oldCount + 1;
      const newRating = parseFloat(((oldRating * oldCount + rating) / newCount).toFixed(2));
      await db.collection('restaurants').updateOne(
        query,
        { $set: { rating: newRating, ratingCount: newCount } }
      );
      // Store individual rating for dedup later
      await db.collection('ratings').updateOne(
        { restaurantId: rid, customerSub: userId },
        { $set: { restaurantId: rid, customerSub: userId, rating, createdAt: new Date() } },
        { upsert: true }
      );
      return resp(200, { ok: true, newRating, newCount });
    }

    // ── GET /orders/:id ─────────────────────────────────────────────────────
    if (method === 'GET' && /\/orders\/[^/]+$/.test(path) && !path.endsWith('/orders/payment-intent')) {
      const oid = path.split('/').pop();
      let query;
      try { query = { _id: new ObjectId(oid) }; } catch { query = { id: oid }; }
      const order = await db.collection('orders').findOne(query);
      if (!order) return resp(404, { error: 'Order not found' });
      return resp(200, order);
    }

    // ── GET /orders ─────────────────────────────────────────────────────────
    if (method === 'GET' && path.endsWith('/orders')) {
      // viewAs param lets an owner browse their customer orders too
      const viewAs = (event.queryStringParameters || {}).viewAs;
      let filter;
      if (role === 'owner' && viewAs !== 'customer') {
        filter = { restaurantOwnerSub: userId };
      } else {
        filter = { customerSub: userId };
      }
      const orders = await db.collection('orders').find(filter).sort({ createdAt: -1 }).toArray();
      return resp(200, orders);
    }

    // ── Email helper (AWS SES) ────────────────────────────────────────────────
    async function sendEmail(to, subject, htmlBody, textBody) {
      if (!to) { console.log('Email skipped: no recipient'); return { ok: false }; }
      try {
        const cmd = new SendEmailCommand({
          Source: `LiveHushh <${SES_FROM}>`,
          Destination: { ToAddresses: [to] },
          Message: {
            Subject: { Data: subject, Charset: 'UTF-8' },
            Body: {
              Html: { Data: htmlBody, Charset: 'UTF-8' },
              Text: { Data: textBody || htmlBody.replace(/<[^>]+>/g,''), Charset: 'UTF-8' },
            },
          },
        });
        const r = await sesClient.send(cmd);
        console.log('Email sent:', r.MessageId, '→', to);
        return { ok: true, messageId: r.MessageId };
      } catch (e) {
        console.log('Email error:', e.message);
        return { ok: false, error: e.message };
      }
    }

    // ── POST /notify/sms ─────────────────────────────────────────────────────
    // Owner notifies customer that their table is ready (now sends email)
    if (method === 'POST' && path.endsWith('/notify/sms')) {
      if (role !== 'owner') return resp(403, { error: 'Owners only' });
      const { email, customerEmail, customerName, restaurantName, message } = parseBody(event);
      const to = email || customerEmail;
      if (!to) return resp(400, { error: 'customer email required' });
      const name    = customerName || 'there';
      const resto   = restaurantName || 'the restaurant';
      const subject = `🍽️ Your table at ${resto} is ready!`;
      const html    = `<div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#E8540A">Your table is ready! 🎉</h2>
        <p>Hi ${name},</p>
        <p>${message || `Your table at <strong>${resto}</strong> is ready. Please head to the host stand now.`}</p>
        <p style="color:#888;font-size:12px">— LiveHushh</p>
      </div>`;
      const result = await sendEmail(to, subject, html);
      if (!result.ok) return resp(500, { error: result.error || 'Email failed' });
      return resp(200, { ok: true, messageId: result.messageId });
    }

    // ── POST /orders/payment-intent ─────────────────────────────────────────
    if (method === 'POST' && path.endsWith('/orders/payment-intent')) {
      const { amountCents, currency = 'usd', restaurantId } = parseBody(event);
      if (!amountCents || amountCents < 50) return resp(400, { error: 'Invalid amount' });
      const paymentIntent = await stripe.paymentIntents.create({
        amount:   amountCents,
        currency,
        metadata: { restaurantId: restaurantId || '', customerEmail: claims?.email || '' },
      });
      return resp(200, { clientSecret: paymentIntent.client_secret });
    }

    // ── POST /orders ────────────────────────────────────────────────────────
    if (method === 'POST' && path.endsWith('/orders')) {
      const body = parseBody(event);
      // Look up restaurant owner so the order appears on the owner's dashboard
      let restaurantOwnerSub = body.restaurantOwnerSub || null;
      let restaurantAddress  = '';
      if (body.restaurantId) {
        const { ObjectId } = require('mongodb');
        let restQuery = null;
        try { restQuery = { _id: new ObjectId(body.restaurantId) }; } catch { restQuery = { restaurant_id: body.restaurantId }; }
        const rest = await db.collection('restaurants').findOne(restQuery, { projection: { ownerSub: 1, owner_id: 1, address: 1, city: 1 } });
        if (rest) {
          restaurantOwnerSub = rest.ownerSub || rest.owner_id || null;
          restaurantAddress  = [rest.address, rest.city].filter(Boolean).join(', ');
        }
      }
      const doc = {
        ...body,
        customerSub: userId,
        customerEmail: claims.email,
        restaurantOwnerSub,
        status: 'placed',
        // How much has been collected online so far (drives paid/partial/unpaid)
        paidAmount: typeof body.paidAmount === 'number' ? body.paidAmount : 0,
        createdAt: new Date(),
      };
      // ── Insert order, then attach tracking number ─────────────────────────
      const result = await db.collection('orders').insertOne(doc);
      const trackingNumber = 'LH-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      await db.collection('orders').updateOne(
        { _id: result.insertedId },
        { $set: { trackingNumber } }
      );

      // Auto-email order confirmation to customer
      const restName     = doc.restaurantName || 'the restaurant';
      const orderTypeStr = doc.orderType === 'delivery' ? 'Delivery' : doc.orderType === 'pickup' ? 'Pickup' : 'Dine-In';
      const totalDisplay = doc.total ? `$${parseFloat(doc.total || 0).toFixed(2)}` : '';
      const confirmSubject = `✅ Order Confirmed — ${restName}`;
      const confirmHtml = `<div style="font-family:sans-serif;max-width:520px;margin:auto;background:#06061A;color:#e0e0e0;padding:28px;border-radius:12px">
        <h2 style="color:#E8540A;margin-top:0">Order Confirmed! 🎉</h2>
        <p>Hi ${doc.customerName || 'there'},</p>
        <p>Your <strong>${orderTypeStr}</strong> order at <strong>${restName}</strong> has been placed successfully${totalDisplay ? ' for <strong>' + totalDisplay + '</strong>' : ''}.</p>
        ${doc.items && doc.items.length ? `<table style="width:100%;border-collapse:collapse;margin:16px 0">${doc.items.map(i=>`<tr><td style="padding:6px 0;border-bottom:1px solid #333">${i.name} × ${i.qty}</td><td style="text-align:right;padding:6px 0;border-bottom:1px solid #333">$${(parseFloat(i.price||0)*parseInt(i.qty||1)).toFixed(2)}</td></tr>`).join('')}</table>` : ''}
        ${doc.orderType === 'delivery' ? `<p>📍 Delivering to: ${doc.deliveryAddress}</p>` : doc.orderType === 'pickup' ? '<p>🚗 Pickup order — we\'ll have it ready for you!</p>' : `<p>🍽️ Dine-In order</p>`}
        <div style="background:#1a1a3a;border-radius:8px;padding:16px;margin:16px 0;text-align:center">
          <p style="margin:0;color:#aaa;font-size:12px">YOUR TRACKING NUMBER</p>
          <p style="margin:4px 0 0;color:#E8540A;font-size:28px;font-weight:800;letter-spacing:4px">${trackingNumber}</p>
          <p style="margin:4px 0 0;color:#aaa;font-size:11px">Use this to track your order status</p>
        </div>
        <p style="color:#888;font-size:12px;margin-top:24px">— LiveHushh · You're receiving this because you placed an order</p>
      </div>`;
      await sendEmail(doc.customerEmail, confirmSubject, confirmHtml);

      return resp(201, { ok: true, id: result.insertedId, trackingNumber });
    }

    // ── GET /waitlist/mine ──────────────────────────────────────────────────
    // Returns ALL of this customer's waitlist entries (so they can track their position)
    if (method === 'GET' && path.endsWith('/waitlist/mine')) {
      if (!userId) return resp(401, { error: 'Unauthorized' });
      const entries = await db.collection('waitlist')
        .find({ customerSub: userId })
        .sort({ joinedAt: -1 })
        .toArray();
      if (!entries.length) return resp(200, []);
      // Enrich each entry with position in queue
      const enriched = await Promise.all(entries.map(async entry => {
        const position = await db.collection('waitlist').countDocuments({
          restaurantId: entry.restaurantId,
          status: { $in: ['waiting', 'notified'] },
          joinedAt: { $lte: entry.joinedAt },
        });
        const total = await db.collection('waitlist').countDocuments({
          restaurantId: entry.restaurantId,
          status: { $in: ['waiting', 'notified'] },
        });
        return { ...entry, position, total, _id: entry._id.toString() };
      }));
      return resp(200, enriched);
    }

    // ── GET /waitlist ───────────────────────────────────────────────────────
    if (method === 'GET' && path.endsWith('/waitlist')) {
      const restaurantId = event.queryStringParameters?.restaurantId;
      console.log(`[WAITLIST GET] restaurantId=${restaurantId}`);
      let list;
      if (restaurantId) {
        // Match on restaurantId string OR restaurant_id OR _id
        list = await db.collection('waitlist').find({
          $or: [
            { restaurantId: restaurantId },
            { restaurantId: restaurantId.toString() },
            { restaurant_id: restaurantId },
          ]
        }).sort({ joinedAt: 1 }).toArray();
      } else {
        list = await db.collection('waitlist').find({}).sort({ joinedAt: 1 }).toArray();
      }
      console.log(`[WAITLIST GET] found ${list.length} entries`);
      return resp(200, list);
    }

    // ── POST /waitlist ──────────────────────────────────────────────────────
    if (method === 'POST' && path.endsWith('/waitlist')) {
      const body = parseBody(event);
      const doc  = { ...body, customerSub: userId, customerEmail: claims.email, joinedAt: new Date(), startedAt: new Date() };
      console.log(`[WAITLIST POST] restaurantId=${doc.restaurantId} customerEmail=${doc.customerEmail} name=${doc.name}`);
      const result = await db.collection('waitlist').insertOne(doc);
      return resp(201, { ok: true, id: result.insertedId });
    }

    // ── PATCH /orders/:id ───────────────────────────────────────────────────
    if (method === 'PATCH' && /\/orders\/[^/]+$/.test(path)) {
      const id = path.split('/').pop();
      const { status, orderType: patchOrderType, additionalItems, additionalTotal, additionalPaid, tableNumber, paidAmount } = parseBody(event);
      let query;
      try { query = { _id: new ObjectId(id) }; } catch { query = { id }; }

      // Build update: only touch fields that were actually sent
      const setFields = { updatedAt: new Date() };
      if (status !== undefined) setFields.status = status;
      if (tableNumber !== undefined) setFields.tableNumber = tableNumber;
      if (typeof paidAmount === 'number') setFields.paidAmount = paidAmount;
      const update = { $set: setFields };

      // Add-items flow: append items and bump totals (paidAmount too when the
      // customer paid for the added items online)
      if (Array.isArray(additionalItems) && additionalItems.length) {
        update.$push = { items: { $each: additionalItems } };
        const addAmt = parseFloat(additionalTotal || 0) || 0;
        update.$inc = { total: addAmt };
        if (additionalPaid) update.$inc.paidAmount = addAmt;
      }

      // Owner can update their own orders, customer can update their own
      if (role === 'owner') {
        await db.collection('orders').updateOne(query, update);
      } else {
        await db.collection('orders').updateOne({ ...query, customerSub: userId }, update);
      }

      // Send status update email to customer (only when the status changed)
      try {
        const updatedOrder = status !== undefined ? await db.collection('orders').findOne(query) : null;
        if (updatedOrder?.customerEmail) {
          const ot = patchOrderType || updatedOrder.orderType || 'dine-in';
          const statusLabels = {
            placed:     'received and confirmed',
            preparing:  'being prepared',
            ready:      ot === 'pickup' ? 'ready for pickup' : ot === 'delivery' ? 'out for delivery' : 'ready to serve',
            delivered:  ot === 'pickup' ? 'picked up' : ot === 'delivery' ? 'delivered' : 'completed',
          };
          const statusMsg = statusLabels[status] || status;
          const orderItems = (updatedOrder.items || []).map(i => `${i.qty}× ${i.name}`).join(', ');
          const emailHtml = `
            <div style="font-family:sans-serif;max-width:500px;margin:auto;background:#1a1a1a;color:#eee;padding:32px;border-radius:12px">
              <h2 style="color:#e8540a;margin-bottom:8px">Order Update 📦</h2>
              <p style="font-size:16px">Your order at <strong>${updatedOrder.restaurantName || 'the restaurant'}</strong> is now <strong>${statusMsg}</strong>.</p>
              ${orderItems ? `<p style="color:#aaa;font-size:14px">Items: ${orderItems}</p>` : ''}
              ${ot === 'delivery' && status === 'ready' ? '<p style="color:#10b981;font-size:14px">🛵 Your delivery is on the way!</p>' : ''}
              ${ot === 'pickup' && status === 'ready' ? '<p style="color:#10b981;font-size:14px">🚗 Please come pick up your order!</p>' : ''}
              <p style="color:#888;font-size:12px;margin-top:24px">— LiveHushh · You're receiving this because you placed an order</p>
            </div>`;
          await sendEmail(
            updatedOrder.customerEmail,
            `Your order at ${updatedOrder.restaurantName || 'LiveHushh'} is ${statusMsg}`,
            emailHtml
          );
        }
      } catch (emailErr) {
        console.error('Order status email failed:', emailErr);
        // Don't fail the request if email fails
      }

      return resp(200, { ok: true });
    }

    // ── PATCH /waitlist/:id — update status (seated / waiting / removed) ───────
    if (method === 'PATCH' && /\/waitlist\/[^/]+$/.test(path)) {
      const id = path.split('/').pop();
      const { status } = parseBody(event);
      if (role === 'owner' || role === 'admin') {
        await db.collection('waitlist').updateOne(
          { _id: new ObjectId(id) },
          { $set: { status, updatedAt: new Date() } }
        );
      } else {
        return resp(403, { error: 'Owners only' });
      }
      return resp(200, { ok: true });
    }

    // ── DELETE /waitlist/:id ────────────────────────────────────────────────
    if (method === 'DELETE' && /\/waitlist\/[^/]+$/.test(path)) {
      const id = path.split('/').pop();
      // Owners can remove any entry from their restaurant's waitlist; customers only their own
      if (role === 'owner' || role === 'admin') {
        await db.collection('waitlist').deleteOne({ _id: new ObjectId(id) });
      } else {
        await db.collection('waitlist').deleteOne({ _id: new ObjectId(id), customerSub: userId });
      }
      return resp(200, { ok: true });
    }

    // ── GET /videos ─────────────────────────────────────────────────────────
    if (method === 'GET' && path.endsWith('/videos')) {
      const restaurantId = (event.queryStringParameters || {}).restaurantId;
      let filter;
      if (role === 'admin') {
        filter = {};
      } else if (role === 'owner') {
        filter = { ownerSub: userId };
      } else {
        // Customers: show approved videos, optionally filtered by restaurant
        filter = { status: 'approved' };
        if (restaurantId) filter.restaurantId = restaurantId;
      }
      const videos = await db.collection('videos').find(filter).sort({ uploadedAt: -1 }).limit(50).toArray();
      return resp(200, videos);
    }

    // ── POST /videos ────────────────────────────────────────────────────────
    if (method === 'POST' && path.endsWith('/videos')) {
      if (role !== 'owner') return resp(403, { error: 'Owners only' });
      const body = parseBody(event);
      // Attach restaurant name for display in customer app
      const rest = await db.collection('restaurants').findOne({ ownerSub: userId }, { projection: { name: 1, city: 1, cuisine: 1 } });
      const doc  = {
        ...body,
        ownerSub: userId,
        restaurantName: rest ? rest.name : (body.restaurantName || ''),
        restaurantCity: rest ? rest.city  : (body.restaurantCity || ''),
        restaurantCuisine: rest ? rest.cuisine : (body.restaurantCuisine || ''),
        restaurantId: rest ? rest._id.toString() : (body.restaurantId || null),
        status: 'approved',   // auto-approve for MVP — admin can reject if needed
        uploadedAt: new Date()
      };
      const result = await db.collection('videos').insertOne(doc);
      return resp(201, { ok: true, id: result.insertedId });
    }

    // ── PATCH /videos/:id ───────────────────────────────────────────────────
    if (method === 'PATCH' && /\/videos\/[^/]+$/.test(path)) {
      if (role !== 'admin') return resp(403, { error: 'Admin only' });
      const id   = path.split('/').pop();
      const { status } = parseBody(event);   // 'approved' | 'rejected'
      await db.collection('videos').updateOne(
        { _id: new ObjectId(id) },
        { $set: { status, reviewedAt: new Date() } }
      );
      return resp(200, { ok: true });
    }

    // ── DELETE /videos/:id ──────────────────────────────────────────────────
    if (method === 'DELETE' && /\/videos\/[^/]+$/.test(path)) {
      const id = path.split('/').pop();
      const video = await db.collection('videos').findOne({ _id: new ObjectId(id) });
      if (!video) return resp(404, { error: 'Not found' });
      if (role !== 'admin' && video.ownerSub !== userId) return resp(403, { error: 'Forbidden' });
      await db.collection('videos').deleteOne({ _id: new ObjectId(id) });
      return resp(200, { ok: true });
    }

    // ── GET /promos ──────────────────────────────────────────────────────────
    // Admin: list all promos.  Anyone: ?code=XXXX to validate a code.
    if (method === 'GET' && path.endsWith('/promos')) {
      const code = event.queryStringParameters?.code;
      if (code) {
        // Validate promo code — no auth required so customers can check at checkout
        const promo = await db.collection('promos').findOne({
          code: code.toUpperCase(), active: true,
        });
        if (!promo) return resp(404, { error: 'Invalid or expired promo code' });
        // Check usage limit
        if (promo.maxUses && promo.usedCount >= promo.maxUses)
          return resp(400, { error: 'Promo code has reached its usage limit' });
        return resp(200, { valid: true, discount: promo.discount, type: promo.type || 'percent', desc: promo.desc, code: promo.code });
      }
      if (role !== 'admin') return resp(403, { error: 'Admin only' });
      const promos = await db.collection('promos').find({}).sort({ createdAt: -1 }).toArray();
      return resp(200, promos);
    }

    // ── POST /promos ─────────────────────────────────────────────────────────
    if (method === 'POST' && path.endsWith('/promos')) {
      if (role !== 'admin') return resp(403, { error: 'Admin only' });
      const body = parseBody(event);
      const code = (body.code || '').toUpperCase().replace(/\s/g, '');
      if (!code) return resp(400, { error: 'Code is required' });
      const existing = await db.collection('promos').findOne({ code });
      if (existing) return resp(409, { error: 'Code already exists' });
      const doc = {
        code,
        desc:      body.desc    || '',
        discount:  Number(body.discount) || 0,
        type:      body.type    || 'percent',   // 'percent' | 'flat'
        maxUses:   body.maxUses ? Number(body.maxUses) : null,
        usedCount: 0,
        active:    true,
        createdAt: new Date(),
      };
      const result = await db.collection('promos').insertOne(doc);
      return resp(201, { ok: true, id: result.insertedId });
    }

    // ── PATCH /promos/:id ─────────────────────────────────────────────────────
    if (method === 'PATCH' && /\/promos\/[^/]+$/.test(path)) {
      if (role !== 'admin') return resp(403, { error: 'Admin only' });
      const id = path.split('/').pop();
      const body = parseBody(event);
      await db.collection('promos').updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...body, updatedAt: new Date() } }
      );
      return resp(200, { ok: true });
    }

    // ── DELETE /promos/:id ────────────────────────────────────────────────────
    if (method === 'DELETE' && /\/promos\/[^/]+$/.test(path)) {
      if (role !== 'admin') return resp(403, { error: 'Admin only' });
      const id = path.split('/').pop();
      await db.collection('promos').deleteOne({ _id: new ObjectId(id) });
      return resp(200, { ok: true });
    }

    // ── POST /promos/:id/use ─────────────────────────────────────────────────
    // Called at checkout to increment usedCount
    if (method === 'POST' && /\/promos\/[^/]+\/use$/.test(path)) {
      const parts = path.split('/');
      const id = parts[parts.length - 2];
      await db.collection('promos').updateOne(
        { _id: new ObjectId(id) },
        { $inc: { usedCount: 1 } }
      );
      return resp(200, { ok: true });
    }

    // ── GET /live/channel ────────────────────────────────────────────────────
    // Returns existing IVS channel creds or creates a new channel for this owner.
    // Falls back gracefully if IVS is unavailable — returns manualMode:true so the
    // owner can go live without a streaming credential (just marks restaurant live).
    if (method === 'GET' && path.endsWith('/live/channel')) {
      if (role !== 'owner' && role !== 'admin') return resp(403, { error: 'Owners only' });
      const rest = await db.collection('restaurants').findOne({
        $or: [{ ownerSub: userId }, { ownerEmail: claims.email }]
      });
      if (!rest) return resp(404, { error: 'Restaurant not found. Please complete your restaurant profile first.' });
      // Link ownerSub if missing
      if (!rest.ownerSub && userId) {
        await db.collection('restaurants').updateOne({ _id: rest._id }, { $set: { ownerSub: userId } });
      }

      // Return existing credentials if already provisioned
      if (rest.ivsStreamKey && rest.ivsIngestEndpoint) {
        return resp(200, {
          streamKey:    rest.ivsStreamKey,
          ingest:       rest.ivsIngestEndpoint,
          playback:     rest.ivsPlaybackUrl || '',
          channelArn:   rest.ivsChannelArn  || '',
          manualMode:   false,
        });
      }

      // Create a new IVS channel for this owner
      try {
        const channelName = `livehushh-${userId.replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 40)}`;
        const createRes = await ivsClient.send(new CreateChannelCommand({
          name:       channelName,
          latencyMode: 'LOW',
          type:        'STANDARD',
          tags:        { ownerSub: userId, restaurantId: rest._id.toString() },
        }));

        const channel   = createRes.channel;
        const streamKey = createRes.streamKey;

        const ivsData = {
          ivsChannelArn:      channel.arn,
          ivsIngestEndpoint:  channel.ingestEndpoint,
          ivsPlaybackUrl:     channel.playbackUrl,
          ivsStreamKeyArn:    streamKey.arn,
          ivsStreamKey:       streamKey.value,
          ivsCreatedAt:       new Date(),
        };

        // Save credentials against the restaurant so we never create duplicates
        await db.collection('restaurants').updateOne(
          { ownerSub: userId },
          { $set: ivsData }
        );

        return resp(200, {
          streamKey:  streamKey.value,
          ingest:     channel.ingestEndpoint,
          playback:   channel.playbackUrl,
          channelArn: channel.arn,
          manualMode: false,
        });
      } catch (ivsErr) {
        // IVS unavailable (e.g. Lambda IAM permissions not yet granted).
        // Return a manual-mode response so the owner can still mark themselves live.
        console.error('IVS channel creation failed (falling back to manual mode):', ivsErr.message);
        return resp(200, {
          streamKey:  null,
          ingest:     null,
          playback:   null,
          channelArn: null,
          manualMode: true,
          ivsError:   ivsErr.message || 'IVS not available',
        });
      }
    }

    // ── POST /live/start ─────────────────────────────────────────────────────
    if (method === 'POST' && path.endsWith('/live/start')) {
      if (role !== 'owner' && role !== 'admin') return resp(403, { error: 'Owners only' });
      const body = parseBody(event);
      const rest = await db.collection('restaurants').findOne({
        $or: [{ ownerSub: userId }, { ownerEmail: claims.email }]
      });
      if (!rest) return resp(404, { error: 'Restaurant not found' });
      if (!rest.ownerSub && userId) {
        await db.collection('restaurants').updateOne({ _id: rest._id }, { $set: { ownerSub: userId } });
      }

      const session = {
        restaurantId:   rest._id.toString(),
        restaurantName: rest.name,
        ownerSub:       userId,
        playbackUrl:    body.playbackUrl || rest.ivsPlaybackUrl || '',
        startedAt:      new Date(),
        status:         'live',
        viewerCount:    0,
        lat:            body.lat || rest.latitude  || null,
        lng:            body.lng || rest.longitude || null,
      };
      await db.collection('liveSessions').updateOne(
        { ownerSub: userId },
        { $set: session },
        { upsert: true }
      );
      // Mark restaurant as live and save playback URL so customers can watch
      const livePlaybackUrl = body.playbackUrl || rest.ivsPlaybackUrl || '';
      await db.collection('restaurants').updateOne(
        { ownerSub: userId },
        { $set: { isLive: true, liveViewers: 0, liveStartedAt: new Date(), playbackUrl: livePlaybackUrl } }
      );

      // Send push notifications to subscribers within 20 miles (~32 km)
      if (VAPID_PUBLIC && VAPID_PRIVATE && rest.latitude && rest.longitude) {
        const R = 6371; // Earth radius km
        const lat1 = rest.latitude * Math.PI / 180;
        const allSubs = await db.collection('pushSubscriptions').find({}).toArray();
        const nearby = allSubs.filter(s => {
          if (!s.lat || !s.lng) return true; // no location → always notify
          const lat2 = s.lat * Math.PI / 180;
          const dLat = lat2 - lat1;
          const dLng = (s.lng - rest.longitude) * Math.PI / 180;
          const a = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;
          const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          return dist <= 32; // 20 miles
        });
        const payload = JSON.stringify({
          title: `🔴 ${rest.name} is now LIVE!`,
          body:  'Tap to watch live and grab exclusive deals',
          icon:  '/icon-192.png',
          tag:   `live-${rest._id}`,
          data:  { restaurantId: rest._id.toString() },
        });
        await Promise.allSettled(nearby.map(s =>
          webpush.sendNotification(s.subscription, payload).catch(() =>
            db.collection('pushSubscriptions').deleteOne({ _id: s._id })
          )
        ));
      }
      return resp(200, { ok: true, restaurantId: rest._id.toString() });
    }

    // ── POST /live/end ───────────────────────────────────────────────────────
    if (method === 'POST' && path.endsWith('/live/end')) {
      if (role !== 'owner' && role !== 'admin') return resp(403, { error: 'Owners only' });
      const restQuery = { $or: [{ ownerSub: userId }, { ownerEmail: claims.email }] };
      await db.collection('liveSessions').updateOne(
        { ownerSub: userId },
        { $set: { status: 'ended', endedAt: new Date() } }
      );
      await db.collection('restaurants').updateOne(
        restQuery,
        { $set: { isLive: false, liveViewers: 0 } }
      );
      return resp(200, { ok: true });
    }

    // ── GET /live/sessions ───────────────────────────────────────────────────
    if (method === 'GET' && path.endsWith('/live/sessions')) {
      const sessions = await db.collection('liveSessions')
        .find({ status: 'live' })
        .sort({ startedAt: -1 })
        .toArray();
      return resp(200, sessions);
    }

    // ── GET /live/chat?restaurantId=xxx ──────────────────────────────────────
    if (method === 'GET' && path.endsWith('/live/chat')) {
      const restaurantId = (event.queryStringParameters || {}).restaurantId;
      if (!restaurantId) return resp(400, { error: 'restaurantId required' });
      const messages = await db.collection('liveChat')
        .find({ restaurantId })
        .sort({ createdAt: -1 })
        .limit(60)
        .toArray();
      return resp(200, messages.reverse());
    }

    // ── POST /live/chat ──────────────────────────────────────────────────────
    if (method === 'POST' && path.endsWith('/live/chat')) {
      const body = parseBody(event);
      const { restaurantId, message, senderName } = body || {};
      if (!restaurantId || !message) return resp(400, { error: 'restaurantId and message required' });
      const doc = {
        restaurantId,
        message: String(message).slice(0, 300),
        senderName: senderName || 'Guest',
        senderId: userId || null,
        createdAt: new Date(),
      };
      await db.collection('liveChat').insertOne(doc);
      // Auto-expire: keep only last 200 messages per restaurant
      const count = await db.collection('liveChat').countDocuments({ restaurantId });
      if (count > 200) {
        const oldest = await db.collection('liveChat')
          .find({ restaurantId }).sort({ createdAt: 1 }).limit(count - 200).toArray();
        const ids = oldest.map(m => m._id);
        await db.collection('liveChat').deleteMany({ _id: { $in: ids } });
      }
      return resp(200, { ok: true, id: doc._id });
    }

    // ── POST /live/viewer ────────────────────────────────────────────────────
    if (method === 'POST' && path.endsWith('/live/viewer')) {
      const body = parseBody(event);
      const { restaurantId, action } = body || {};
      if (!restaurantId) return resp(400, { error: 'restaurantId required' });
      const delta = action === 'leave' ? -1 : 1;
      await db.collection('restaurants').updateOne(
        { $or: [{ _id: restaurantId }, { _id: { $oid: restaurantId } }] },
        { $inc: { liveViewers: delta } }
      );
      return resp(200, { ok: true });
    }

    // ── POST /push/token ─────────────────────────────────────────────────────
    // Store an Expo push token so we can send native push notifications
    if (method === 'POST' && path.endsWith('/push/token')) {
      const body = parseBody(event);
      const { token, platform } = body;
      if (!token || !token.startsWith('ExponentPushToken')) return resp(400, { error: 'valid Expo push token required' });
      const role = claims?.['custom:role'] || 'customer';
      await db.collection('expoPushTokens').updateOne(
        { token },
        { $set: { token, platform: platform || 'unknown', userId: userId || null, role, updatedAt: new Date() } },
        { upsert: true }
      );
      return resp(200, { ok: true });
    }

    // ── POST /live/notify-customers ──────────────────────────────────────────
    // Called by owner app when going live — sends Expo push to all customer tokens
    if (method === 'POST' && path.endsWith('/live/notify-customers')) {
      const body = parseBody(event);
      const { restaurantName, message } = body;
      // Fetch all customer Expo push tokens
      const tokens = await db.collection('expoPushTokens')
        .find({ role: { $ne: 'owner' } })
        .toArray();
      if (tokens.length === 0) return resp(200, { ok: true, sent: 0 });

      const pushTitle = `🔴 ${restaurantName || 'A restaurant'} is LIVE!`;
      const pushBody  = message || `${restaurantName} just went live. Tap to watch and see today's specials!`;

      // Expo Push API accepts batches of up to 100
      const chunks = [];
      for (let i = 0; i < tokens.length; i += 100) chunks.push(tokens.slice(i, i + 100));

      let sent = 0;
      for (const chunk of chunks) {
        const messages = chunk.map(t => ({
          to:    t.token,
          sound: 'default',
          title: pushTitle,
          body:  pushBody,
          data:  { type: 'restaurant_live', restaurantName },
          badge: 1,
        }));
        try {
          await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Accept-Encoding': 'gzip, deflate' },
            body: JSON.stringify(messages),
          });
          sent += chunk.length;
        } catch (pushErr) {
          console.error('Expo push batch error:', pushErr.message);
        }
      }
      return resp(200, { ok: true, sent });
    }

    // ── POST /push/subscribe ─────────────────────────────────────────────────
    if (method === 'POST' && path.endsWith('/push/subscribe')) {
      const body = parseBody(event);
      const { subscription, lat, lng } = body;
      if (!subscription || !subscription.endpoint) return resp(400, { error: 'subscription required' });
      await db.collection('pushSubscriptions').updateOne(
        { 'subscription.endpoint': subscription.endpoint },
        { $set: { subscription, lat: lat||null, lng: lng||null, userId: userId||null, updatedAt: new Date() } },
        { upsert: true }
      );
      return resp(200, { ok: true, publicKey: VAPID_PUBLIC });
    }

    // ── DELETE /push/subscribe ───────────────────────────────────────────────
    if (method === 'DELETE' && path.endsWith('/push/subscribe')) {
      const body = parseBody(event);
      if (body.endpoint) {
        await db.collection('pushSubscriptions').deleteOne({ 'subscription.endpoint': body.endpoint });
      }
      return resp(200, { ok: true });
    }

    // ── GET /deals ──────────────────────────────────────────────────────────
    // Owner gets their own deals; customers get active deals for a restaurant
    if (method === 'GET' && path.endsWith('/deals')) {
      if (role === 'owner') {
        const deals = await db.collection('deals').find({ ownerSub: userId }).sort({ createdAt: -1 }).toArray();
        return resp(200, deals.map(d => ({ ...d, isActive: d.active !== false })));
      }
      // Customer: fetch active deals for a specific restaurant
      const restaurantId = event.queryStringParameters?.restaurantId;
      const filter = {
        active: true,
        $or: [{ expiresAt: null }, { expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }],
      };
      if (restaurantId) filter.restaurantId = restaurantId;
      const deals = await db.collection('deals').find(filter).sort({ createdAt: -1 }).toArray();
      return resp(200, deals.map(d => ({ ...d, isActive: d.active !== false })));
    }

    // ── POST /deals ─────────────────────────────────────────────────────────
    if (method === 'POST' && path.endsWith('/deals')) {
      if (role !== 'owner') return resp(403, { error: 'Owners only' });
      const body = parseBody(event);
      // Get the owner's restaurant ID
      const rest = await db.collection('restaurants').findOne({ ownerSub: userId }, { projection: { _id: 1, name: 1 } });
      const doc = {
        title: body.title,
        description: body.description || '',
        discountPercent: body.discountPercent || 0,
        validUntil: body.validUntil || '',
        expiresAt: body.validForHours ? new Date(Date.now() + body.validForHours * 3600 * 1000) : null,
        validForHours: body.validForHours || null,
        ownerSub: userId,
        restaurantId: rest ? rest._id.toString() : null,
        restaurantName: rest ? rest.name : '',
        active: body.isActive !== undefined ? !!body.isActive : true,
        views: 0,
        createdAt: new Date(),
      };
      const result = await db.collection('deals').insertOne(doc);
      return resp(201, { ok: true, id: result.insertedId });
    }

    // ── PATCH /deals/:id ─────────────────────────────────────────────────────
    if (method === 'PATCH' && /\/deals\/[^/]+$/.test(path)) {
      if (role !== 'owner') return resp(403, { error: 'Owners only' });
      const id = path.split('/').pop();
      const body = parseBody(event);
      const updateBody = { ...body };
      if ('isActive' in updateBody) { updateBody.active = updateBody.isActive; delete updateBody.isActive; }
      await db.collection('deals').updateOne(
        { _id: new ObjectId(id), ownerSub: userId },
        { $set: { ...updateBody, updatedAt: new Date() } }
      );
      return resp(200, { ok: true });
    }

    // ── DELETE /deals/:id ────────────────────────────────────────────────────
    if (method === 'DELETE' && /\/deals\/[^/]+$/.test(path)) {
      if (role !== 'owner') return resp(403, { error: 'Owners only' });
      const id = path.split('/').pop();
      await db.collection('deals').deleteOne({ _id: new ObjectId(id), ownerSub: userId });
      return resp(200, { ok: true });
    }

    // ── PATCH /restaurants (owner sets isFull, hours, etc.) ─────────────────
    if (method === 'PATCH' && path.endsWith('/restaurants')) {
      if (role !== 'owner') return resp(403, { error: 'Owners only' });
      const body = parseBody(event);
      await db.collection('restaurants').updateOne(
        { ownerSub: userId },
        { $set: { ...body, updatedAt: new Date() } }
      );
      return resp(200, { ok: true });
    }

    // ── POST /reservations ───────────────────────────────────────────────────
    if (method === 'POST' && path.endsWith('/reservations')) {
      const body = parseBody(event);
      const doc = {
        ...body,
        customerSub: userId || null,
        customerEmail: claims.email || null,
        status: 'confirmed',
        createdAt: new Date(),
      };
      const result = await db.collection('reservations').insertOne(doc);
      return resp(201, { ok: true, id: result.insertedId, confirmationCode: String(result.insertedId).slice(-6).toUpperCase() });
    }

    // ── GET /reservations ────────────────────────────────────────────────────
    if (method === 'GET' && path.endsWith('/reservations')) {
      if (role === 'owner') {
        const rest = await db.collection('restaurants').findOne({ ownerSub: userId }, { projection: { _id: 1 } });
        const rid = rest?._id?.toString();
        const list = await db.collection('reservations').find({ restaurantId: rid }).sort({ createdAt: -1 }).toArray();
        return resp(200, list);
      }
      const restaurantId = event.queryStringParameters?.restaurantId;
      const filter = restaurantId ? { restaurantId } : {};
      const list = await db.collection('reservations').find(filter).sort({ createdAt: -1 }).toArray();
      return resp(200, list);
    }

    return resp(404, { error: 'Not found' });

  } catch (err) {
    console.error(err);
    return resp(500, { error: 'Internal server error', detail: err.message });
  }
};
