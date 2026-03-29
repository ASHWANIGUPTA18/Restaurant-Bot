const express = require('express');
const OpenAI = require('openai');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ── Menu cache (load once, refresh every 10 min) ──────────────────────────────
let menuCache = null;
let menuCacheTime = 0;
const MENU_CACHE_TTL = 10 * 60 * 1000;

async function getMenuText() {
  if (menuCache && Date.now() - menuCacheTime < MENU_CACHE_TTL) return menuCache;

  const items = await MenuItem.find({}, 'name price category').lean();
  if (!items.length) return '';

  const grouped = {};
  items.forEach(({ category, name, price }) => {
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push(`${name}(£${price})`);
  });

  menuCache = Object.entries(grouped)
    .map(([cat, list]) => `${cat}: ${list.join(', ')}`)
    .join('\n');
  menuCacheTime = Date.now();
  return menuCache;
}

// ── Past order summary for a user (last 3 orders) ────────────────────────────
async function getUserOrderSummary(userId) {
  if (!userId) return '';
  const orders = await Order.find({ userId })
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();
  if (!orders.length) return 'No previous orders.';

  return orders
    .map((o) => {
      const items = o.items.map((i) => `${i.quantity}x ${i.name}`).join(', ');
      const date = new Date(o.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      return `${date}: ${items} (£${o.total.toFixed(2)})`;
    })
    .join(' | ');
}

// ── Session store ─────────────────────────────────────────────────────────────
const sessions = new Map();
const SESSION_TIMEOUT = 30 * 60 * 1000;

function getOrCreateSession(sessionId) {
  if (sessions.has(sessionId)) {
    const s = sessions.get(sessionId);
    s.lastAccessed = Date.now();
    return s;
  }
  const s = { history: [], lastAccessed: Date.now() };
  sessions.set(sessionId, s);
  return s;
}

setInterval(() => {
  const now = Date.now();
  for (const [id, s] of sessions) {
    if (now - s.lastAccessed > SESSION_TIMEOUT) sessions.delete(id);
  }
}, 10 * 60 * 1000);

router.post('/', async (req, res) => {
  try {
    const { message, sessionId, userId, userEmail, userName } = req.body;

    if (!message || !sessionId) {
      return res.status(400).json({ error: 'message and sessionId are required' });
    }

    const session = getOrCreateSession(sessionId);

    // Fetch menu (cached) and user order history in parallel
    const [menuText, orderHistory] = await Promise.all([
      getMenuText(),
      getUserOrderSummary(userId),
    ]);

    const systemPrompt = `You are a crisp, friendly chatbot for Wings 101 Northampton (200 Wellingborough Road).

MENU:
${menuText}

CUSTOMER'S PAST ORDERS: ${orderHistory}

RULES:
- Keep every reply under 3 sentences. Be direct. Use past orders to personalise (e.g. "You usually go for X — want that again?").
- Answer only about items on the menu. Prices in £.
- Use 🔥🍗🍟 emojis sparingly.
- To confirm an order append exactly: [ORDER_DATA]{"items":[{"name":"...","price":0.00,"quantity":1}],"total":0.00}[/ORDER_DATA]
- Only append [ORDER_DATA] when the customer says yes/confirm/place order — not while browsing.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...session.history,
      { role: 'user', content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.5,
      max_tokens: 300,
    });

    let reply = completion.choices[0].message.content;
    let orderSaved = null;

    // Check if the response contains an order
    const orderMatch = reply.match(/\[ORDER_DATA\](.*?)\[\/ORDER_DATA\]/s);
    if (orderMatch && userId) {
      try {
        const orderData = JSON.parse(orderMatch[1]);
        const order = new Order({
          userId,
          userEmail: userEmail || 'unknown',
          userName: userName || 'unknown',
          items: orderData.items,
          total: orderData.total,
          status: 'confirmed',
        });
        await order.save();
        console.log('✅ Order saved to DB:', order._id);
        orderSaved = {
          id: order._id,
          items: order.items,
          total: order.total,
        };
      } catch (parseErr) {
        console.error('Order parse error:', parseErr.message);
      }

      // Remove the order tag from the visible response
      reply = reply.replace(/\[ORDER_DATA\].*?\[\/ORDER_DATA\]/s, '').trim();
    }

    // Update session history
    session.history.push({ role: 'user', content: message });
    session.history.push({ role: 'assistant', content: reply });

    // Keep history manageable
    if (session.history.length > 40) {
      session.history = session.history.slice(-40);
    }

    res.json({ reply, sessionId, orderSaved });
  } catch (err) {
    console.error('Chat error:', err.message);

    if (err.status === 401) {
      return res.status(500).json({ error: 'Invalid OpenAI API key. Please check your configuration.' });
    }

    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
