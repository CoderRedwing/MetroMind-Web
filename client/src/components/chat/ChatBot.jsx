import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Trash2, Bot, Sparkles } from 'lucide-react';
import ChatMessage from './ChatMessage.jsx';
import { useChat } from '../../hooks/useChat.js';

const QUICK_PROMPTS = [
  'How do I get to IGI Airport?',
  'Fastest route from Rajiv Chowk to Noida',
  'Route from Anand Vihar to Preet Vihar',
  'Best way to see Delhi landmarks by metro',
  'How to reach Red Fort from Gurgaon?',
];

export default function ChatBot() {
  const [input, setInput] = useState('');
  const { messages, loading, sendMessage, clearChat } = useChat();
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    sendMessage(text);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold" style={{ color: '#e2eaf5' }}>
            MetroMind AI
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#7a9cc8' }}>
            Type your location — AI finds the nearest station & best route
          </p>
        </div>
        <button
          onClick={clearChat}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-colors"
          style={{ background: 'rgba(18,45,88,0.6)', border: '1px solid #122d58', color: '#7a9cc8' }}
        >
          <Trash2 size={12} />
          Clear
        </button>
      </div>

      {/* Chat area */}
      <div
        className="flex-1 rounded-2xl p-4 overflow-y-auto space-y-4 mb-4"
        style={{
          background: '#071428',
          border: '1px solid #1a3d70',
          minHeight: '400px',
          maxHeight: '520px',
        }}
      >
        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}

        {loading && (
          <div className="flex gap-3 animate-slide-up">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #22d3ee22, #4361ee22)', border: '1px solid rgba(34,211,238,0.3)' }}
            >
              <Bot size={14} style={{ color: '#22d3ee' }} />
            </div>
            <div
              className="px-4 py-3 rounded-2xl flex items-center gap-2"
              style={{ background: 'rgba(10,28,53,0.9)', border: '1px solid #1a3d70' }}
            >
              <Loader2 size={14} style={{ color: '#22d3ee' }} className="animate-spin" />
              <span className="text-sm font-mono" style={{ color: '#3d618a' }}>
                Computing route...
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      <div className="flex flex-wrap gap-2 mb-3">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => { setInput(prompt); inputRef.current?.focus(); }}
            className="text-xs px-3 py-1.5 rounded-full transition-colors"
            style={{
              background: 'rgba(34,211,238,0.06)',
              border: '1px solid rgba(34,211,238,0.15)',
              color: '#7a9cc8',
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input */}
      <div
        className="flex gap-3 p-3 rounded-2xl"
        style={{ background: '#0a1c35', border: '1px solid #1a3d70' }}
      >
        <Sparkles size={16} style={{ color: '#22d3ee', flexShrink: 0, marginTop: '10px' }} />
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="E.g. I'm at Anand Vihar and want to reach Preet Vihar..."
          rows={1}
          className="flex-1 bg-transparent resize-none text-sm outline-none"
          style={{
            color: '#e2eaf5',
            fontFamily: 'DM Sans',
            minHeight: '36px',
            maxHeight: '120px',
            lineHeight: '1.6',
          }}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-105"
          style={{
            background: input.trim() && !loading
              ? 'linear-gradient(135deg, #22d3ee, #4361ee)'
              : '#122d58',
            color: input.trim() && !loading ? 'white' : '#3d618a',
          }}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={14} />}
        </button>
      </div>

      <p className="text-center text-xs mt-3" style={{ color: '#3d618a', fontFamily: 'JetBrains Mono' }}>
        Powered by Claude AI · DMRC Network v2024
      </p>
    </div>
  );
}
