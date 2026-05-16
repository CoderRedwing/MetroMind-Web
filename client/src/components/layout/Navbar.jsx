import { Train, Compass, MessageSquare, Map, Calendar } from 'lucide-react';

const tabs = [
  { id: 'route',    label: 'Route Finder',   icon: Train },
  { id: 'explorer', label: 'Delhi Explorer', icon: Compass },
  { id: 'trip',     label: 'Trip Planner',   icon: Calendar },
  { id: 'map',      label: 'Metro Map',      icon: Map },
  { id: 'chat',     label: 'MetroMind AI',   icon: MessageSquare },
];

export default function Navbar({ activeTab, onTabChange }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50" style={{ background: 'rgba(4,13,26,0.95)', borderBottom: '1px solid #122d58', backdropFilter: 'blur(12px)' }}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #22d3ee, #4361ee)' }}>
            <Train size={18} color="white" />
          </div>
          <div>
            <div className="font-display font-bold text-base leading-none" style={{ color: '#22d3ee' }}>MetroMind</div>
            <div className="text-xs leading-none mt-0.5" style={{ color: '#3d618a', fontFamily: 'JetBrains Mono' }}>DMRC Navigator</div>
          </div>
        </div>

        <nav className="flex gap-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: activeTab === id ? 'rgba(34,211,238,0.12)' : 'transparent',
                color: activeTab === id ? '#22d3ee' : '#7a9cc8',
                border: activeTab === id ? '1px solid rgba(34,211,238,0.3)' : '1px solid transparent',
                fontFamily: 'DM Sans',
              }}
            >
              <Icon size={15} />
              <span className="hidden lg:inline">{label}</span>
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2 text-xs" style={{ color: '#3d618a', fontFamily: 'JetBrains Mono' }}>
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-slow inline-block" />
          LIVE
        </div>
      </div>
    </header>
  );
}
