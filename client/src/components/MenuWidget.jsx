import { useState } from 'react';
import { menuData } from '../data/menuData';

export default function MenuWidget({ onAddToCart }) {
  const [selectedCategory, setSelectedCategory] = useState(null);

  if (selectedCategory) {
    const cat = menuData.find((c) => c.category === selectedCategory);
    return (
      <div className="menu-widget">
        <button className="menu-widget-back" onClick={() => setSelectedCategory(null)}>
          ← Back to categories
        </button>
        <div className="menu-widget-title">{cat.emoji} {cat.category}</div>
        <div className="menu-widget-items">
          {cat.items.map((item) => (
            <div key={item.name} className="menu-widget-item">
              <div className="menu-widget-item-info">
                <span className="menu-widget-item-name">{item.name}</span>
                {item.description && (
                  <span className="menu-widget-item-desc">{item.description}</span>
                )}
              </div>
              <div className="menu-widget-item-right">
                <span className="menu-widget-item-price">£{item.price.toFixed(2)}</span>
                {onAddToCart && (
                  <button
                    className="menu-widget-add"
                    onClick={() => onAddToCart(item, 1)}
                  >
                    +
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="menu-widget">
      <div className="menu-widget-title">Our Menu</div>
      <div className="menu-widget-categories">
        {menuData.map((cat) => (
          <button
            key={cat.category}
            className="menu-widget-cat-btn"
            onClick={() => setSelectedCategory(cat.category)}
          >
            <span className="menu-widget-cat-emoji">{cat.emoji}</span>
            <span className="menu-widget-cat-name">{cat.category}</span>
            <span className="menu-widget-cat-count">{cat.items.length} items</span>
          </button>
        ))}
      </div>
    </div>
  );
}
