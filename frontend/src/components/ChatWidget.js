import { useState } from 'react';
import { FiMessageCircle, FiX, FiSend } from 'react-icons/fi';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await axios.post(`${API}/chatbot`, {
        message: userMessage,
        session_id: sessionId
      });

      setSessionId(response.data.session_id);
      setMessages(prev => [...prev, { type: 'bot', text: response.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        type: 'bot',
        text: 'Sorry, I\'m having trouble connecting. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          data-testid="chat-widget-button"
          className="fixed bottom-6 right-6 z-50 p-4 bg-cyber-cyan text-black hover:shadow-[0_0_30px_rgba(0,240,255,0.8)] transition-all duration-300"
        >
          <FiMessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          data-testid="chat-widget-window"
          className="fixed bottom-6 right-6 z-50 w-96 h-[500px] bg-void-card border border-cyber-cyan/50 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div>
              <h3 className="font-syne font-bold">InkStreet Support</h3>
              <p className="font-mono text-xs text-zinc-400">AI Assistant</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              data-testid="chat-widget-close"
              className="hover:text-cyber-cyan transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-zinc-500 text-sm mt-8">
                <p>Hi! How can I help you today?</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 text-sm ${
                    msg.type === 'user'
                      ? 'bg-cyber-cyan text-black'
                      : 'bg-void-surface border border-white/10 text-white'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-void-surface border border-white/10 p-3 text-sm">
                  <span className="inline-block animate-pulse">Typing...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                data-testid="chat-widget-input"
                placeholder="Type a message..."
                className="flex-1 bg-transparent border-b border-white/20 px-0 py-2 text-white focus:border-cyber-cyan focus:outline-none placeholder:text-zinc-700 font-mono text-sm"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                data-testid="chat-widget-send"
                className="p-2 hover:text-cyber-cyan transition-colors disabled:opacity-50"
              >
                <FiSend size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};