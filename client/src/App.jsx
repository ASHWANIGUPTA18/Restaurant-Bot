import { useState, useEffect } from 'react';
import ChatBot from './components/ChatBot';
import LoginScreen from './components/LoginScreen';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check localStorage for existing session
    const saved = localStorage.getItem('chatbot_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem('chatbot_user');
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('chatbot_user');
  };

  return (
    <div className="app">
      {user ? (
        <ChatBot user={user} onLogout={handleLogout} />
      ) : (
        <LoginScreen onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
