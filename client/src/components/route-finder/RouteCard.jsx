import { useState } from 'react';
import { Clock, ChevronDown, ChevronUp, Repeat2, Bookmark, BookmarkCheck } from 'lucide-react';
import { LINE_COLORS, LINE_NAMES, formatTime, groupPathBySegment } from '../../utils/formatRoute.js';
import FareCard from '../fare/FareCard.jsx';
import TimingBadge from '../fare/TimingBadge.jsx';

export default function RouteCard({ route, label, badge, expanded: defaultExpanded = false, onSave, isSaved }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showFare, setShowFare] = useState(false);

  if (!route?.path) return null;
  const segments = groupPathBySegment(route.path);

  return (
    <div className="rounded-xl overflow-hidden animate-slide-up" style={{ background: '#0a1c35', border: '1px solid #1a3d70' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-opacity-80 transition-colors"
        style={{ background: expanded ? 'rgba(34,211,238,0.04)' : 'transparent' }}
      >
        <div className="flex items-center gap-3">
          {badge && (
            <span className="text-xs px-2 py-0.5 rounded font-mono font-semibold" style={{ background: badge.bg, color: badge.color }}>
              {badge.text}
            </span>
          )}
          <span className="text-sm font-medium" style={{ color: '#e2eaf5', fontFamily: 'Space Grotesk' }}>{label}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Clock size={13} style={{ color: '#22d3ee' }} />
              <span className="text-sm font-mono font-semibold" style={{ color: '#22d3ee' }}>{formatTime(route.totalTime)}</span>
            </div>
            <span className="text-xs" style={{ color: '#3d618a' }}>·</span>
            <span className="text-xs font-mono" style={{ color: '#7a9cc8' }}>{route.totalStops} stops</span>
            {route.interchanges > 0 && (
              <>
                <span className="text-xs" style={{ color: '#3d618a' }}>·</span>
                <div className="flex items-center gap-1">
                  <Repeat2 size={11} style={{ color: '#f4a261' }} />
                  <span className="text-xs font-mono" style={{ color: '#f4a261' }}>{route.interchanges}x</span>
                </div>
              </>
            )}
            {route.fare && (
              <span className="text-xs font-mono" style={{ color: '#2dc653' }}>₹{route.fare.token}</span>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-1">
            {segments.filter((s) => s.type === 'ride').map((seg, i) => (
              <div key={i} className="h-2 w-6 rounded-full" style={{ background: LINE_COLORS[seg.line] || '#94a3b8' }} title={LINE_NAMES[seg.line]} />
            ))}
          </div>
          {onSave && (
            <button
              onClick={(e) => { e.stopPropagation(); onSave(); }}
              className="p-1 rounded transition-colors hover:bg-white/5"
              title={isSaved ? 'Already saved' : 'Save route'}
            >
              {isSaved
                ? <BookmarkCheck size={15} style={{ color: '#ffd60a' }} />
                : <Bookmark size={15} style={{ color: '#3d618a' }} />
              }
            </button>
          )}
          {expanded ? <ChevronUp size={16} style={{ color: '#3d618a' }} /> : <ChevronDown size={16} style={{ color: '#3d618a' }} />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4" style={{ borderTop: '1px solid #122d58' }}>
          {/* Timing badges */}
          {(route.arrivalTime || route.isPeak || route.lastTrainWarnings?.length > 0) && (
            <TimingBadge
              isPeak={route.isPeak}
              lastTrainWarnings={route.lastTrainWarnings}
              arrivalTime={route.arrivalTime}
              frequencies={route.frequencies}
            />
          )}

          {/* Path detail */}
          <div className="mt-4 space-y-2">
            {segments.map((seg, i) => (
              <div key={i}>
                {seg.type === 'ride' && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full border-2 mt-1" style={{ borderColor: LINE_COLORS[seg.line], background: '#040d1a' }} />
                      <div className="w-0.5 flex-1 my-1" style={{ background: LINE_COLORS[seg.line] }} />
                      <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: LINE_COLORS[seg.line], background: '#040d1a' }} />
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-1.5 py-0.5 rounded font-mono" style={{ background: `${LINE_COLORS[seg.line]}20`, color: LINE_COLORS[seg.line] }}>
                          {LINE_NAMES[seg.line] || seg.line}
                        </span>
                        <span className="text-xs font-mono" style={{ color: '#3d618a' }}>{formatTime(seg.time)}</span>
                      </div>
                      <div className="text-sm font-medium" style={{ color: '#e2eaf5' }}>{seg.stations[0]?.name}</div>
                      {seg.stations.length > 2 && (
                        <div className="text-xs my-1" style={{ color: '#3d618a', fontFamily: 'JetBrains Mono' }}>
                          ↓ {seg.stations.length - 2} station{seg.stations.length - 2 !== 1 ? 's' : ''}
                        </div>
                      )}
                      <div className="text-sm" style={{ color: '#7a9cc8' }}>{seg.stations[seg.stations.length - 1]?.name}</div>
                    </div>
                  </div>
                )}
                {seg.type === 'interchange' && (
                  <div className="flex items-center gap-3 py-1 pl-1.5">
                    <div className="w-3 flex items-center justify-center">
                      <Repeat2 size={12} style={{ color: '#f4a261' }} />
                    </div>
                    <span className="text-xs font-mono" style={{ color: '#f4a261' }}>Change at {seg.station?.name}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Fare toggle */}
          {route.fare && (
            <button
              onClick={() => setShowFare(!showFare)}
              className="mt-3 text-xs font-mono flex items-center gap-1.5 transition-colors"
              style={{ color: showFare ? '#2dc653' : '#3d618a' }}
            >
              {showFare ? '▲' : '▼'} {showFare ? 'Hide' : 'Show'} fare details
            </button>
          )}
          {showFare && route.fare && <FareCard fare={route.fare} />}
        </div>
      )}
    </div>
  );
}
