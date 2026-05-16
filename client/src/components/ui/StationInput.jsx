import { useState, useRef, useEffect } from 'react';
import { Search, X, MapPin } from 'lucide-react';
import { useStationSearch } from '../../hooks/useStationSearch.js';
import { LINE_COLORS } from '../../utils/formatRoute.js';

export default function StationInput({ label, value, onSelect, placeholder = 'Search station or location...' }) {
  const [query, setQuery] = useState(value?.name || '');
  const [open, setOpen] = useState(false);
  const { results, loading, search, clear } = useStationSearch();
  const wrapRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        clear();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    search(val);
    setOpen(true);
    if (!val) onSelect(null);
  };

  const handleSelect = (station) => {
    setQuery(station.name);
    onSelect(station);
    setOpen(false);
    clear();
  };

  const handleClear = () => {
    setQuery('');
    onSelect(null);
    clear();
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className="relative">
      {label && (
        <label className="block text-xs font-mono mb-1.5" style={{ color: '#7a9cc8' }}>
          {label}
        </label>
      )}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#3d618a' }} />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => query.length >= 2 && setOpen(true)}
          placeholder={placeholder}
          className="metro-input w-full pl-9 pr-9 py-2.5 rounded-lg text-sm"
        />
        {query && (
          <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-80">
            <X size={14} style={{ color: '#3d618a' }} />
          </button>
        )}
      </div>

      {open && (results.length > 0 || loading) && (
        <div
          className="absolute top-full left-0 right-0 mt-1 rounded-lg overflow-hidden z-50 animate-slide-up"
          style={{ background: '#0a1c35', border: '1px solid #1a3d70', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
        >
          {loading && (
            <div className="px-4 py-3 text-xs" style={{ color: '#3d618a', fontFamily: 'JetBrains Mono' }}>
              Scanning network...
            </div>
          )}
          {results.map((station) => (
            <button
              key={station.id}
              onClick={() => handleSelect(station)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-opacity-50 transition-colors"
              style={{ borderTop: '1px solid #122d58' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(34,211,238,0.06)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <MapPin size={13} style={{ color: '#3d618a', flexShrink: 0 }} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate" style={{ color: '#e2eaf5' }}>
                  {station.name}
                </div>
                {station.landmark && (
                  <div className="text-xs truncate" style={{ color: '#3d618a' }}>
                    {station.landmark}
                  </div>
                )}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {(station.lines || []).slice(0, 3).map((line) => (
                  <span
                    key={line}
                    className="w-2 h-2 rounded-full"
                    style={{ background: LINE_COLORS[line] || '#94a3b8' }}
                    title={line}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
