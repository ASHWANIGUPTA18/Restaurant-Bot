const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Burgers', 'Fries', 'Churros', 'Drinks', 'Wings Only',
      'Rice Box', 'Big Sharer', 'Milkshakes', 'Dips',
      'Noodle Box', 'Sides', 'Wings Meal',
    ],
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  isVeg: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
