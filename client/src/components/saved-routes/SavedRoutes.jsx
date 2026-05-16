import { Bookmark, Trash2, ArrowRight, Clock } from 'lucide-react';

export default function SavedRoutes({ savedRoutes, onSelect, onRemove }) {
  if (savedRoutes.length === 0) return null;

  return (
    <div
      className="rounded-2xl p-5 mb-6"
      style={{ background: '#0a1c35', border: '1px solid #1a3d70' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bookmark size={14} style={{ color: '#ffd60a' }} />
          <span className="text-xs font-mono uppercase tracking-widest" style={{ color: '#7a9cc8' }}>
            Saved Routes
          </span>
        </div>
        <span className="text-xs font-mono" style={{ color: '#3d618a' }}>
          {savedRoutes.length}/10
        </span>
      </div>

      <div className="space-y-2">
        {savedRoutes.map((route) => (
          <div
            key={route.id}
            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer group transition-all"
            style={{ background: 'rgba(18,45,88,0.4)', border: '1px solid #122d58' }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(34,211,238,0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#122d58'}
            onClick={() => onSelect(route)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-sm" style={{ color: '#e2eaf5' }}>
                <span className="truncate">{route.from.name}</span>
                <ArrowRight size={12} style={{ color: '#3d618a', flexShrink: 0 }} />
                <span className="truncate">{route.to.name}</span>
              </div>
              <div className="text-xs mt-0.5" style={{ color: '#3d618a', fontFamily: 'JetBrains Mono' }}>
                {new Date(route.savedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(route.id); }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-500/10"
            >
              <Trash2 size={13} style={{ color: '#f87171' }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
