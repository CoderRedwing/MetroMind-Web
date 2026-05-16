import { Clock, AlertTriangle, Zap, Timer } from 'lucide-react';

export default function TimingBadge({ isPeak, lastTrainWarnings = [], arrivalTime, frequencies = {} }) {
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {/* Arrival time */}
      {arrivalTime && (
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
          style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)', color: '#22d3ee' }}
        >
          <Timer size={11} />
          Arrive by {arrivalTime}
        </div>
      )}

      {/* Peak hour */}
      {isPeak && (
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
          style={{ background: 'rgba(244,162,97,0.08)', border: '1px solid rgba(244,162,97,0.3)', color: '#f4a261' }}
        >
          <Zap size={11} />
          Peak Hours — Expect crowds
        </div>
      )}

      {/* Last train warnings */}
      {lastTrainWarnings.map((w) => (
        <div
          key={w.line}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
          style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171' }}
        >
          <AlertTriangle size={11} />
          Last {w.line} Line at {w.lastTrain} ({w.minutesLeft}min left)
        </div>
      ))}

      {/* Frequency */}
      {Object.entries(frequencies).slice(0, 2).map(([line, freq]) => freq && (
        <div
          key={line}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
          style={{ background: 'rgba(122,156,200,0.06)', border: '1px solid rgba(122,156,200,0.15)', color: '#7a9cc8' }}
        >
          <Clock size={11} />
          {line} every {freq} min
        </div>
      ))}
    </div>
  );
}
