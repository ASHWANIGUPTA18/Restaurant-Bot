import { useState, useEffect } from 'react';

export default function MenuPanel({ onAddToCart, cart }) {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/menu`)
      .then((res) => res.json())
      .then((data) => {
        setMenu(data);
        if (data.length > 0) setActiveCategory(data[0].category);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getCartQty = (itemName) => {
    const item = cart.find((c) => c.name === itemName);
    return item ? item.quantity : 0;
  };

  if (loading) {
    return (
      <div className="menu-panel">
        <p className="menu-loading">Loading menu...</p>
      </div>
    );
  }

  return (
    <div className="menu-panel">
      {/* Category Tabs */}
      <div className="menu-categories">
        {menu.map((cat) => (
          <button
            key={cat.category}
            className={`category-tab ${activeCategory === cat.category ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.category)}
          >
            {cat.category}
          </button>
        ))}
      </div>

      {/* Items */}
      <div className="menu-items">
        {menu
          .filter((cat) => cat.category === activeCategory)
          .map((cat) =>
            cat.items.map((item) => {
              const qty = getCartQty(item.name);
              return (
                <div key={item.name} className="menu-item-card">
                  <div className="menu-item-info">
                    <span className="menu-item-name">{item.name}</span>
                    {item.description && (
                      <span className="menu-item-desc">{item.description}</span>
                    )}
                    <span className="menu-item-price">£{item.price.toFixed(2)}</span>
                  </div>
                  <div className="menu-item-actions">
                    {qty > 0 ? (
                      <div className="qty-controls">
                        <button
                          className="qty-btn"
                          onClick={() => onAddToCart(item, -1)}
                        >
                          −
                        </button>
                        <span className="qty-value">{qty}</span>
                        <button
                          className="qty-btn"
                          onClick={() => onAddToCart(item, 1)}
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        className="add-btn"
                        onClick={() => onAddToCart(item, 1)}
                      >
                        + Add
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
      </div>
    </div>
  );
}
