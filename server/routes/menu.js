const express = require('express');
const mongoose = require('mongoose');

const MenuItem = require('../models/MenuItem');

const router = express.Router();

// GET /api/menu — return menu from database, grouped by category
router.get('/', async (req, res) => {
  try {
    const items = await MenuItem.find({});
    // Group items by category to match frontend expectations
    const categoryMap = {};
    items.forEach(item => {
      if (!categoryMap[item.category]) {
        categoryMap[item.category] = [];
      }
      categoryMap[item.category].push({
        name: item.name,
        description: item.description,
        price: item.price,
        isVeg: item.isVeg,
        isAvailable: item.isAvailable,
      });
    });
    const grouped = Object.entries(categoryMap).map(([category, items]) => ({
      category,
      items,
    }));
    res.json(grouped);
  } catch (err) {
    console.error('Menu fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});

module.exports = router;
