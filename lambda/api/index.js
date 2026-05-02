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
    _client = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    await _client.connect();
  }
  return _client.db(DB_NAME);
}

// ─── helpers ────────────────────────────────────────────────────────────────

function resp(statusCode, body) {
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
    trialEndsAt: r.trialEndsAt || null,
    menu:        r.menu        || [],
  };
}

// ─── router ─────────────────────────────────────────────────────────────────

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return resp(200, {});

  const path   = event.path.replace(/\/+$/, '');   // strip trailing slash
  const method = event.httpMethod;
  const claims = getClaims(event);
  const userId = claims.sub;                        // Cognito user ID

  console.log(`[REQ] ${method} ${path} | user=${userId || 'anon'}`);

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
        .project({ _id: 0, cognitoSub: 1, email: 1, name: 1, role: 1, planStatus: 1, createdAt: 1, updatedAt: 1 })
        .toArray();
      return resp(200, users);
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
      const now = new Date();
      const list = await db.collection('restaurants').find({
        $or: [
          { planStatus: { $exists: false } },                     // legacy — always show
          { planStatus: null },                                    // explicitly null — always show
          { planStatus: 'active' },                               // paid plan
          { planStatus: 'trial', trialEndsAt: { $gt: now } }     // valid trial
        ]
      }).toArray();
      return resp(200, list.map(normalizeRestaurant));
    }

    // ── POST /restaurants ───────────────────────────────────────────────────
    if (method === 'POST' && path.endsWith('/restaurants')) {
      if (role !== 'owner') return resp(403, { error: 'Owners only' });
      const body = parseBody(event);
      const result = await db.collection('restaurants').updateOne(
        { ownerSub: userId },
        { $set: { ...body, ownerSub: userId, updatedAt: new Date() } },
        { upsert: true }
      );
      return resp(200, { ok: true, upserted: result.upsertedCount > 0 });
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
      if (!restaurantOwnerSub && body.restaurantId) {
        const { ObjectId } = require('mongodb');
        let restQuery = null;
        try { restQuery = { _id: new ObjectId(body.restaurantId) }; } catch { restQuery = { restaurant_id: body.restaurantId }; }
        const rest = await db.collection('restaurants').findOne(restQuery, { projection: { ownerSub: 1, owner_id: 1 } });
        if (rest) restaurantOwnerSub = rest.ownerSub || rest.owner_id || null;
      }
      const doc = {
        ...body,
        customerSub: userId,
        customerEmail: claims.email,
        restaurantOwnerSub,
        status: 'placed',
        createdAt: new Date(),
      };
      const result = await db.collection('orders').insertOne(doc);

      // Auto-email order confirmation to customer
      const restName    = doc.restaurantName || 'the restaurant';
      const orderType   = doc.orderType === 'delivery' ? 'Delivery' : 'Dine-In';
      const totalDisplay = doc.total ? `$${(doc.total / 100).toFixed(2)}` : '';
      const confirmSubject = `✅ Order Confirmed — ${restName}`;
      const confirmHtml = `<div style="font-family:sans-serif;max-width:520px;margin:auto;background:#06061A;color:#e0e0e0;padding:28px;border-radius:12px">
        <h2 style="color:#E8540A;margin-top:0">Order Confirmed! 🎉</h2>
        <p>Hi ${doc.customerName || 'there'},</p>
        <p>Your <strong>${orderType}</strong> order at <strong>${restName}</strong> has been placed successfully${totalDisplay ? ' for <strong>' + totalDisplay + '</strong>' : ''}.</p>
        ${doc.items && doc.items.length ? `<table style="width:100%;border-collapse:collapse;margin:16px 0">${doc.items.map(i=>`<tr><td style="padding:6px 0;border-bottom:1px solid #333">${i.name} × ${i.qty}</td><td style="text-align:right;padding:6px 0;border-bottom:1px solid #333">$${((i.price*i.qty)/100).toFixed(2)}</td></tr>`).join('')}</table>` : ''}
        ${doc.orderType === 'delivery' ? `<p>📍 Delivering to: ${doc.deliveryAddress}</p>` : `<p>🍽️ Table for ${doc.tableSize || 1}</p>`}
        <p style="color:#888;font-size:12px;margin-top:24px">— LiveHushh · You're receiving this because you placed an order</p>
      </div>`;
      await sendEmail(doc.customerEmail, confirmSubject, confirmHtml);

      return resp(201, { ok: true, id: result.insertedId });
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
      const { status } = parseBody(event);
      let query;
      try { query = { _id: new ObjectId(id) }; } catch { query = { id }; }
      // Owner can update their own orders, customer can cancel their own
      if (role === 'owner') {
        await db.collection('orders').updateOne(query, { $set: { status, updatedAt: new Date() } });
      } else {
        await db.collection('orders').updateOne({ ...query, customerSub: userId }, { $set: { status, updatedAt: new Date() } });
      }
      return resp(200, { ok: true });
    }

    // ── DELETE /waitlist/:id ────────────────────────────────────────────────
    if (method === 'DELETE' && /\/waitlist\/[^/]+$/.test(path)) {
      const id = path.split('/').pop();
      await db.collection('waitlist').deleteOne({ _id: new ObjectId(id), customerSub: userId });
      return resp(200, { ok: true });
    }

    // ── GET /videos ─────────────────────────────────────────────────────────
    if (method === 'GET' && path.endsWith('/videos')) {
      const filter = role === 'admin'  ? {} :
                     role === 'owner'  ? { ownerSub: userId } :
                     { status: 'approved' };
      const videos = await db.collection('videos').find(filter).sort({ uploadedAt: -1 }).toArray();
      return resp(200, videos);
    }

    // ── POST /videos ────────────────────────────────────────────────────────
    if (method === 'POST' && path.endsWith('/videos')) {
      if (role !== 'owner') return resp(403, { error: 'Owners only' });
      const body = parseBody(event);
      const doc  = { ...body, ownerSub: userId, status: 'pending', uploadedAt: new Date() };
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

    // ── POST /live/start ─────────────────────────────────────────────────────
    if (method === 'POST' && path.endsWith('/live/start')) {
      if (role !== 'owner') return resp(403, { error: 'Owners only' });
      const body = parseBody(event);
      const rest = await db.collection('restaurants').findOne({ ownerSub: userId });
      if (!rest) return resp(404, { error: 'Restaurant not found' });

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
      // Mark restaurant as live
      await db.collection('restaurants').updateOne(
        { ownerSub: userId },
        { $set: { isLive: true, liveViewers: 0, liveStartedAt: new Date() } }
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
      if (role !== 'owner') return resp(403, { error: 'Owners only' });
      await db.collection('liveSessions').updateOne(
        { ownerSub: userId },
        { $set: { status: 'ended', endedAt: new Date() } }
      );
      await db.collection('restaurants').updateOne(
        { ownerSub: userId },
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
        return resp(200, deals);
      }
      // Customer: fetch active deals for a specific restaurant
      const restaurantId = event.queryStringParameters?.restaurantId;
      const filter = { active: true };
      if (restaurantId) filter.restaurantId = restaurantId;
      const deals = await db.collection('deals').find(filter).sort({ createdAt: -1 }).toArray();
      return resp(200, deals);
    }

    // ── POST /deals ─────────────────────────────────────────────────────────
    if (method === 'POST' && path.endsWith('/deals')) {
      if (role !== 'owner') return resp(403, { error: 'Owners only' });
      const body = parseBody(event);
      // Get the owner's restaurant ID
      const rest = await db.collection('restaurants').findOne({ ownerSub: userId }, { projection: { _id: 1, name: 1 } });
      const doc = {
        ...body,
        ownerSub: userId,
        restaurantId: rest ? rest._id.toString() : null,
        restaurantName: rest ? rest.name : '',
        active: true,
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
      await db.collection('deals').updateOne(
        { _id: new ObjectId(id), ownerSub: userId },
        { $set: { ...body, updatedAt: new Date() } }
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

    return resp(404, { error: 'Not found' });

  } catch (err) {
    console.error(err);
    return resp(500, { error: 'Internal server error', detail: err.message });
  }
};
