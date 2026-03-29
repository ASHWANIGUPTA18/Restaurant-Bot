export default function Cart({ cart, onAddToCart, onCheckout, checkingOut }) {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="cart-panel">
        <div className="cart-empty">
          <span className="cart-empty-icon">🛒</span>
          <p>Your cart is empty</p>
          <p className="cart-empty-hint">Browse the menu and add items!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-panel">
      <div className="cart-items">
        {cart.map((item) => (
          <div key={item.name} className="cart-item">
            <div className="cart-item-info">
              <span className="cart-item-name">{item.name}</span>
              <span className="cart-item-price">£{(item.price * item.quantity).toFixed(2)}</span>
            </div>
            <div className="qty-controls">
              <button className="qty-btn" onClick={() => onAddToCart(item, -1)}>−</button>
              <span className="qty-value">{item.quantity}</span>
              <button className="qty-btn" onClick={() => onAddToCart(item, 1)}>+</button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-footer">
        <div className="cart-total">
          <span>Total</span>
          <strong>£{total.toFixed(2)}</strong>
        </div>
        <button
          className="checkout-btn"
          onClick={onCheckout}
          disabled={checkingOut}
        >
          {checkingOut ? 'Placing Order...' : `Place Order • £${total.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
}
