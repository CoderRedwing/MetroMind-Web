import { Bot, User } from 'lucide-react';
import { LINE_COLORS } from '../../utils/formatRoute.js';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-slide-up`}>
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{
          background: isUser
            ? 'rgba(67,97,238,0.2)'
            : 'linear-gradient(135deg, #22d3ee22, #4361ee22)',
          border: `1px solid ${isUser ? 'rgba(67,97,238,0.3)' : 'rgba(34,211,238,0.3)'}`,
        }}
      >
        {isUser ? (
          <User size={14} style={{ color: '#4361ee' }} />
        ) : (
          <Bot size={14} style={{ color: '#22d3ee' }} />
        )}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div
          className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
          style={{
            background: isUser
              ? 'rgba(67,97,238,0.15)'
              : 'rgba(10,28,53,0.9)',
            border: `1px solid ${isUser ? 'rgba(67,97,238,0.25)' : '#1a3d70'}`,
            color: '#e2eaf5',
            fontFamily: 'DM Sans',
            whiteSpace: 'pre-wrap',
          }}
        >
          {message.content}
        </div>

        {/* Station suggestions */}
        {message.suggestions?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {message.suggestions.map((s) => (
              <span
                key={s.id}
                className="text-xs px-2 py-1 rounded-lg"
                style={{
                  background: 'rgba(34,211,238,0.08)',
                  border: '1px solid rgba(34,211,238,0.2)',
                  color: '#22d3ee',
                }}
              >
                📍 {s.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
