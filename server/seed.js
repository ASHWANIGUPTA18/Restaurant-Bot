const mongoose = require('mongoose');
require('dotenv').config();
const MenuItem = require('./models/MenuItem');

const menuItems = [
  // Burgers
  { name: 'Burger', price: 8.99, category: 'Burgers' },

  // Fries
  { name: 'Fries', price: 3.00, category: 'Fries' },
  { name: 'Chicken Loaded Fries', price: 5.00, category: 'Fries' },
  { name: 'Truffle Fries', price: 5.00, category: 'Fries' },
  { name: 'Cheesy Fries', price: 4.00, category: 'Fries' },
  { name: 'Beef Brisket Fries', price: 8.00, category: 'Fries' },
  { name: 'Mac & Cheese Fries', price: 5.00, category: 'Fries' },
  { name: 'Pepperoni Pizza Fries', price: 5.00, category: 'Fries' },
  { name: 'Salt & Pepper Fries', price: 5.00, category: 'Fries' },
  { name: 'Sweet Potato Fries', price: 4.50, category: 'Fries' },
  { name: 'Peri Fries', price: 4.00, category: 'Fries' },
  { name: 'Ranch Fries', price: 4.50, category: 'Fries' },

  // Churros
  { name: 'Lotus Biscoff Churros', price: 6.00, category: 'Churros' },
  { name: 'Nutella Churros', price: 6.00, category: 'Churros' },
  { name: 'Oreo Churros', price: 6.00, category: 'Churros' },

  // Drinks
  { name: 'Ice Cola', price: 1.50, category: 'Drinks' },
  { name: 'Ice Pro Max', price: 1.50, category: 'Drinks' },
  { name: 'Ice Lemon', price: 1.50, category: 'Drinks' },
  { name: 'Ice Orange', price: 1.50, category: 'Drinks' },
  { name: 'Ice Tropical', price: 1.50, category: 'Drinks' },
  { name: 'Ice Mango', price: 1.50, category: 'Drinks' },
  { name: 'Ice Strawberry', price: 1.50, category: 'Drinks' },
  { name: 'Water', price: 1.00, category: 'Drinks' },
  { name: 'Ice Cola Bottle', price: 3.49, category: 'Drinks' },
  { name: 'Ice Pro Max Bottle', price: 3.49, category: 'Drinks' },

  // Wings Only
  { name: 'Wings Only', price: 7.50, category: 'Wings Only' },

  // Rice Box
  { name: 'Original Rice Box', price: 8.99, category: 'Rice Box' },
  { name: 'Mango Habanero Rice Box', price: 8.99, category: 'Rice Box' },
  { name: 'Hotshot Rice Box', price: 8.99, category: 'Rice Box' },
  { name: 'Chilli Lime Rice Box', price: 8.99, category: 'Rice Box' },
  { name: 'Korean BBQ Rice Box', price: 8.99, category: 'Rice Box' },
  { name: 'Sticky BBQ Rice Box', price: 8.99, category: 'Rice Box' },
  { name: 'Sweet Chilli Rice Box', price: 8.99, category: 'Rice Box' },
  { name: 'Garlic Parmesan Rice Box', price: 8.99, category: 'Rice Box' },
  { name: 'Lemon Pepper Rice Box', price: 8.99, category: 'Rice Box' },
  { name: 'Katsu Curry Rice Box', price: 8.99, category: 'Rice Box' },
  { name: 'Sweet & Sour Rice Box', price: 8.99, category: 'Rice Box' },
  { name: 'Honey Garlic Rice Box', price: 8.99, category: 'Rice Box' },
  { name: 'Pineapple Teriyaki Rice Box', price: 8.99, category: 'Rice Box' },
  { name: 'Honey BBQ Rice Box', price: 8.99, category: 'Rice Box' },
  { name: 'Salt & Pepper Rice Box', price: 8.99, category: 'Rice Box' },
  { name: 'Miami Heat Rice Box', price: 8.99, category: 'Rice Box' },
  { name: 'Butter Chicken Rice Box', price: 8.99, category: 'Rice Box' },
  { name: 'Louisiana Rub Rice Box', price: 8.99, category: 'Rice Box' },

  // Big Sharer
  {
    name: 'Big Sharer',
    price: 30.00,
    category: 'Big Sharer',
    description: '25pcs wings, choice of any five flavours, any 2x fries, Tango or Pepsi bottle',
  },

  // Milkshakes
  { name: 'Biscoff Milkshake', price: 5.00, category: 'Milkshakes' },
  { name: 'Aero Milkshake', price: 5.00, category: 'Milkshakes' },
  { name: 'Skittles Milkshake', price: 5.00, category: 'Milkshakes' },
  { name: 'Oreo Milkshake', price: 5.00, category: 'Milkshakes' },
  { name: 'Ferrero Rocher Milkshake', price: 5.00, category: 'Milkshakes' },
  { name: 'Daim Milkshake', price: 5.00, category: 'Milkshakes' },
  { name: 'Kinder Bueno Milkshake', price: 5.00, category: 'Milkshakes' },
  { name: 'Maltesers Milkshake', price: 5.00, category: 'Milkshakes' },
  { name: 'Milkybar Milkshake', price: 5.00, category: 'Milkshakes' },
  { name: 'Nutella Milkshake', price: 5.00, category: 'Milkshakes' },
  { name: 'Kinder Bueno White', price: 5.00, category: 'Milkshakes' },

  // Dips
  { name: 'Ranch Dip', price: 1.00, category: 'Dips' },
  { name: 'Honey Mustard Dip', price: 1.00, category: 'Dips' },

  // Noodle Box
  { name: 'Sticky BBQ Noodles', price: 8.99, category: 'Noodle Box' },
  { name: 'Korean BBQ Noodles', price: 8.99, category: 'Noodle Box' },
  { name: 'Sweet Chilli Noodles', price: 8.99, category: 'Noodle Box' },
  { name: 'Hotshot Noodles', price: 8.99, category: 'Noodle Box' },
  { name: 'Garlic Parmesan Noodles', price: 8.99, category: 'Noodle Box' },
  { name: 'Lemon Pepper Noodles', price: 8.99, category: 'Noodle Box' },
  { name: 'Mango Habanero Noodles', price: 8.99, category: 'Noodle Box' },
  { name: 'Honey Garlic Noodles', price: 8.99, category: 'Noodle Box' },
  { name: 'Chilli & Lime Noodles', price: 8.99, category: 'Noodle Box' },
  { name: 'Salt & Pepper Noodles', price: 8.99, category: 'Noodle Box' },
  { name: 'Honey BBQ Noodles', price: 8.99, category: 'Noodle Box' },
  { name: 'Katsu Noodles', price: 8.99, category: 'Noodle Box' },
  { name: 'Pineapple Teriyaki Noodles', price: 8.99, category: 'Noodle Box' },
  { name: 'Miami Heat Noodles', price: 8.99, category: 'Noodle Box' },
  { name: 'Louisiana Rub Noodles', price: 8.99, category: 'Noodle Box' },
  { name: 'Sweet & Sour Noodles', price: 8.99, category: 'Noodle Box' },
  { name: 'Sticky Caramel Noodles', price: 8.99, category: 'Noodle Box' },
  { name: 'Butter Chicken Noodles', price: 8.99, category: 'Noodle Box' },

  // Sides
  { name: 'Mac & Cheese Bites', price: 5.00, category: 'Sides' },
  { name: 'Dynamite Prawns', price: 6.50, category: 'Sides' },
  { name: 'Jalapeno Nuggets', price: 5.00, category: 'Sides' },
  { name: 'Crispy Calamari', price: 6.00, category: 'Sides' },
  { name: 'Caramel Chicken Poppers', price: 5.00, category: 'Sides' },
  { name: 'Salt & Pepper Prawns', price: 7.00, category: 'Sides' },
  { name: 'Dynamite Chicken Bites', price: 6.50, category: 'Sides' },
  { name: 'Chicken Loaded Nachos', price: 6.50, category: 'Sides' },
  { name: 'Baked Mac & Cheese', price: 5.50, category: 'Sides' },
  { name: 'Brisket Mac & Cheese', price: 8.50, category: 'Sides' },
  { name: 'Spicy Korean Bites', price: 5.50, category: 'Sides' },

  // Wings Meal
  { name: 'Wings Meal', price: 8.99, category: 'Wings Meal' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await MenuItem.deleteMany({});
    console.log('Cleared existing menu items');

    await MenuItem.insertMany(menuItems);
    console.log(`✅ Menu seeded successfully with ${menuItems.length} items`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
    process.exit(1);
  }
}

seed();
