const express = require('express');
const Order = require('../models/Order');

const router = express.Router();

// GET /api/orders/:userId — get order history for a user
router.get('/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(orders);
  } catch (err) {
    console.error('Orders fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// POST /api/orders — create order directly from cart (no OpenAI needed)
router.post('/', async (req, res) => {
  try {
    const { userId, userEmail, userName, items, total } = req.body;

    if (!userId || !items || items.length === 0) {
      return res.status(400).json({ error: 'userId and items are required' });
    }

    const order = new Order({
      userId,
      userEmail: userEmail || 'unknown',
      userName: userName || 'unknown',
      items,
      total,
      status: 'confirmed',
    });

    await order.save();
    console.log('✅ Direct order saved:', order._id);

    res.json({
      id: order._id,
      items: order.items,
      total: order.total,
      status: order.status,
    });
  } catch (err) {
    console.error('Order create error:', err.message);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

module.exports = router;
