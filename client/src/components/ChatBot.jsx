import { useState, useEffect, useRef } from 'react';
import Message from './Message';
import MenuWidget from './MenuWidget';
import MenuPanel from './MenuPanel';
import Cart from './Cart';

const MENU_KEYWORDS = [
  'menu', 'what do you have', 'what do you serve', 'what do you offer',
  'what can i order', 'food options', 'show me food', 'see the menu',
  'your menu', 'full menu', 'what food', 'what items',
];

function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ChatBot({ user, onLogout }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hey ${user.name}! 🔥 Welcome to **Wings 101**!\n\nBrowse our **Menu** to add items directly, or chat with me for recommendations!\n\nWhat are you craving today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => generateId());
  const [activeView, setActiveView] = useState('chat'); // 'chat' | 'menu' | 'cart' | 'orders'
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (activeView === 'chat') inputRef.current?.focus();
  }, [activeView]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Cart management
  const handleAddToCart = (item, delta) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.name === item.name);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) return prev.filter((c) => c.name !== item.name);
        return prev.map((c) =>
          c.name === item.name ? { ...c, quantity: newQty } : c
        );
      }
      if (delta > 0) {
        return [...prev, { name: item.name, price: item.price, quantity: 1 }];
      }
      return prev;
    });
  };

  // Direct checkout (no OpenAI)
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckingOut(true);

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
          items: cart,
          total,
        }),
      });
      const data = await res.json();

      if (data.error) {
        alert('Order failed: ' + data.error);
      } else {
        // Add confirmation to chat
        const itemList = cart.map((c) => `${c.quantity}x ${c.name}`).join(', ');
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `✅ **Order #${data.id.slice(-6).toUpperCase()} placed!**\n\n${itemList}\n\n**Total: £${total.toFixed(2)}**\n\nYour order is confirmed and being prepared! 🎉`,
            timestamp: new Date(),
          },
        ]);
        setCart([]);
        setActiveView('chat');
      }
    } catch {
      alert('Failed to connect to server.');
    } finally {
      setCheckingOut(false);
    }
  };

  // Chat send
  const sendMessage = async (text) => {
    if (!text || isLoading) return;

    const userMessage = { role: 'user', content: text, timestamp: new Date() };

    // Intercept menu queries — no API call needed
    const lower = text.toLowerCase();
    if (MENU_KEYWORDS.some((kw) => lower.includes(kw))) {
      setMessages((prev) => [
        ...prev,
        userMessage,
        { role: 'menu-widget', timestamp: new Date() },
      ]);
      setInput('');
      return;
    }

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId,
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
        }),
      });

      const data = await res.json();
      if (data.error) {
        setMessages((prev) => [...prev, { role: 'assistant', content: `⚠️ ${data.error}`, timestamp: new Date() }]);
      } else {
        const msgContent = data.orderSaved
          ? `${data.reply}\n\n✅ **Order #${data.orderSaved.id.slice(-6).toUpperCase()} placed!** Total: £${data.orderSaved.total.toFixed(2)}`
          : data.reply;
        setMessages((prev) => [...prev, { role: 'assistant', content: msgContent, timestamp: new Date() }]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '⚠️ Unable to connect to the server.', timestamp: new Date() },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input.trim());
  };

  // Fetch orders
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch(`${API_URL}/orders/${user.id}`);
      const data = await res.json();
      setOrders(data);
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const showOrders = () => {
    if (activeView === 'orders') {
      setActiveView('chat');
    } else {
      fetchOrders();
      setActiveView('orders');
    }
  };

  const quickActions = [
    '🔥 What\'s popular?',
    '🍟 Show me fries',
    '🍗 Wing flavours',
    '🥤 Drinks & shakes',
  ];

  return (
    <div className="chatbot-container">
      {/* Header */}
      <div className="chatbot-header">
        <div className="header-icon logo-text">W101</div>
        <div className="header-text">
          <h1>Wings 101</h1>
          <span className="status-indicator">
            <span className="status-dot"></span>
            {user.name}
          </span>
        </div>
        <div className="header-actions">
          <button
            className={`header-btn ${activeView === 'orders' ? 'active' : ''}`}
            onClick={showOrders}
            title="Order History"
          >
            📦
          </button>
          <button className="header-btn" onClick={onLogout} title="Sign Out">
            🚪
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="view-tabs">
        <button
          className={`view-tab ${activeView === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveView('chat')}
        >
          💬 Chat
        </button>
        <button
          className={`view-tab ${activeView === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveView('menu')}
        >
          📋 Menu
        </button>
        <button
          className={`view-tab ${activeView === 'cart' ? 'active' : ''}`}
          onClick={() => setActiveView('cart')}
        >
          🛒 Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>
      </div>

      {/* ====== CHAT VIEW ====== */}
      {activeView === 'chat' && (
        <>
          <div className="chatbot-messages">
            {messages.map((msg, i) =>
              msg.role === 'menu-widget' ? (
                <div key={i} className="message bot-message">
                  <div className="message-avatar">🔥</div>
                  <div className="message-content">
                    <MenuWidget onAddToCart={handleAddToCart} />
                    <span className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ) : (
                <Message key={i} role={msg.role} content={msg.content} timestamp={msg.timestamp} />
              )
            )}
            {isLoading && (
              <div className="message bot-message">
                <div className="message-avatar">🔥</div>
                <div className="message-bubble typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 1 && (
            <div className="quick-actions">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  className="quick-action-btn"
                  onClick={() => sendMessage(action.replace(/^[^\s]+\s/, ''))}
                  disabled={isLoading}
                >
                  {action}
                </button>
              ))}
            </div>
          )}

          <form className="chatbot-input" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything or place an order..."
              disabled={isLoading}
              autoComplete="off"
            />
            <button type="submit" disabled={isLoading || !input.trim()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </button>
          </form>
        </>
      )}

      {/* ====== MENU VIEW ====== */}
      {activeView === 'menu' && (
        <MenuPanel onAddToCart={handleAddToCart} cart={cart} />
      )}

      {/* ====== CART VIEW ====== */}
      {activeView === 'cart' && (
        <Cart
          cart={cart}
          onAddToCart={handleAddToCart}
          onCheckout={handleCheckout}
          checkingOut={checkingOut}
        />
      )}

      {/* ====== ORDERS VIEW ====== */}
      {activeView === 'orders' && (
        <div className="orders-panel-full">
          <div className="orders-list">
            {ordersLoading ? (
              <p className="orders-loading">Loading...</p>
            ) : orders.length === 0 ? (
              <p className="orders-empty">No orders yet!</p>
            ) : (
              orders.map((order) => (
                <div key={order._id} className="order-card">
                  <div className="order-card-header">
                    <span className="order-id">#{order._id.slice(-6).toUpperCase()}</span>
                    <span className="order-status">{order.status}</span>
                  </div>
                  <div className="order-items">
                    {order.items.map((item, i) => (
                      <div key={i} className="order-item">
                        <span>{item.quantity}x {item.name}</span>
                        <span>£{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="order-total">
                    <strong>Total: £{order.total.toFixed(2)}</strong>
                    <span className="order-date">
                      {new Date(order.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
