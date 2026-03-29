export default function Message({ role, content, timestamp }) {
  const isBot = role === 'assistant';

  // Simple markdown-like formatting: **bold**, *italic*, \n → <br>
  const formatContent = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`message ${isBot ? 'bot-message' : 'user-message'}`}>
      {isBot && <div className="message-avatar">🔥</div>}
      <div className="message-content">
        <div
          className="message-bubble"
          dangerouslySetInnerHTML={{ __html: formatContent(content) }}
        />
        <span className="message-time">{formatTime(timestamp)}</span>
      </div>
      {!isBot && <div className="message-avatar user-avatar">👤</div>}
    </div>
  );
}
