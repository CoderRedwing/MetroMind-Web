import { useState } from 'react';
import { Plus, Trash2, Loader2, MapPin, Clock, Ticket, AlertTriangle, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import StationInput from '../ui/StationInput.jsx';
import { metroApi } from '../../services/api.js';
import { LINE_COLORS, LINE_NAMES, formatTime } from '../../utils/formatRoute.js';

export default function TripPlanner() {
  const [stops, setStops] = useState([null, null]);
  const [startTime, setStartTime] = useState('09:00');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [expandedLeg, setExpandedLeg] = useState(0);

  const addStop = () => setStops((prev) => [...prev, null]);
  const removeStop = (i) => setStops((prev) => prev.filter((_, idx) => idx !== i));
  const updateStop = (i, station) => setStops((prev) => prev.map((s, idx) => idx === i ? station : s));

  const handlePlan = async () => {
    const validStops = stops.filter(Boolean);
    if (validStops.length < 2) {
      setError('Please add at least 2 stops');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const data = await metroApi.planTrip(validStops.map((s) => s.id), startTime);
      setResult(data);
      setExpandedLeg(0);
    } catch (err) {
      setError(err.message || 'Failed to plan trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold mb-1" style={{ color: '#e2eaf5' }}>
          Trip Planner
        </h1>
        <p className="text-sm" style={{ color: '#7a9cc8' }}>
          Plan a full day itinerary with multiple metro stops
        </p>
      </div>

      {/* Config */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: '#0a1c35', border: '1px solid #1a3d70' }}>
        {/* Start time */}
        <div className="mb-5 flex items-center gap-4">
          <div>
            <label className="block text-xs font-mono mb-1.5" style={{ color: '#7a9cc8' }}>START TIME</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="metro-input px-3 py-2 rounded-lg text-sm font-mono"
              style={{ width: '140px' }}
            />
          </div>
          <div className="text-xs mt-4" style={{ color: '#3d618a' }}>
            Add stops in the order you want to visit them
          </div>
        </div>

        {/* Stops */}
        <div className="space-y-3">
          {stops.map((stop, i) => (
            <div key={i} className="flex items-end gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono flex-shrink-0 mb-0.5"
                style={{ background: '#0d2040', border: '1px solid #1a3d70', color: '#7a9cc8' }}
              >
                {i + 1}
              </div>
              <div className="flex-1">
                <StationInput
                  label={i === 0 ? 'START' : i === stops.length - 1 ? 'END' : `STOP ${i + 1}`}
                  value={stop}
                  onSelect={(s) => updateStop(i, s)}
                  placeholder={i === 0 ? 'Where are you starting?' : 'Add a destination...'}
                />
              </div>
              {stops.length > 2 && (
                <button
                  onClick={() => removeStop(i)}
                  className="mb-0.5 w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}
                >
                  <Trash2 size={14} style={{ color: '#f87171' }} />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={addStop}
          className="mt-4 flex items-center gap-2 text-sm px-4 py-2 rounded-xl transition-colors"
          style={{ background: 'rgba(34,211,238,0.06)', border: '1px dashed rgba(34,211,238,0.25)', color: '#22d3ee' }}
        >
          <Plus size={14} />
          Add Stop
        </button>

        {error && <div className="mt-4 text-sm" style={{ color: '#f87171' }}>{error}</div>}

        <button
          onClick={handlePlan}
          disabled={loading || stops.filter(Boolean).length < 2}
          className="mt-5 w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all"
          style={{
            background: stops.filter(Boolean).length >= 2 ? 'linear-gradient(135deg, #22d3ee, #4361ee)' : '#122d58',
            color: stops.filter(Boolean).length >= 2 ? 'white' : '#3d618a',
            fontFamily: 'Space Grotesk',
          }}
        >
          {loading ? <><Loader2 size={16} className="animate-spin" />Planning Trip...</> : <><MapPin size={16} />Plan My Trip</>}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="animate-slide-up">
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            {[
              { label: 'Total Time', value: formatTime(result.totalTime), color: '#22d3ee' },
              { label: 'Total Fare', value: `₹${result.totalFare}`, color: '#2dc653' },
              { label: 'End Time', value: result.estimatedEndTime, color: '#c77dff' },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-xl p-4 text-center" style={{ background: '#0a1c35', border: '1px solid #1a3d70' }}>
                <div className="font-display text-lg font-bold" style={{ color }}>{value}</div>
                <div className="text-xs mt-1" style={{ color: '#3d618a' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Last train warnings */}
          {result.lastTrainWarnings?.length > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-xl mb-4" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)' }}>
              <AlertTriangle size={14} style={{ color: '#f87171' }} />
              <span className="text-xs" style={{ color: '#f87171' }}>
                {result.lastTrainWarnings.map((w) => `Last ${w.line} Line at ${w.lastTrain}`).join(' · ')}
              </span>
            </div>
          )}

          {/* Legs */}
          <div className="space-y-3">
            {result.legs.map((leg, i) => (
              <div key={i} className="rounded-xl overflow-hidden" style={{ background: '#0a1c35', border: '1px solid #1a3d70' }}>
                <button
                  onClick={() => setExpandedLeg(expandedLeg === i ? -1 : i)}
                  className="w-full flex items-center justify-between p-4"
                  style={{ background: expandedLeg === i ? 'rgba(34,211,238,0.04)' : 'transparent' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono" style={{ background: '#0d2040', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.3)' }}>
                      {i + 1}
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium" style={{ color: '#e2eaf5' }}>
                        {leg.from.name} → {leg.to.name}
                      </div>
                      <div className="text-xs font-mono mt-0.5" style={{ color: '#3d618a' }}>
                        {leg.departureTime} → {leg.arrivalTime}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono" style={{ color: '#22d3ee' }}>{formatTime(leg.route.totalTime)}</span>
                    <span className="text-xs font-mono" style={{ color: '#2dc653' }}>₹{leg.fare}</span>
                    {leg.isPeak && <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(244,162,97,0.12)', color: '#f4a261' }}>Peak</span>}
                    {expandedLeg === i ? <ChevronUp size={14} style={{ color: '#3d618a' }} /> : <ChevronDown size={14} style={{ color: '#3d618a' }} />}
                  </div>
                </button>

                {expandedLeg === i && (
                  <div className="px-4 pb-4" style={{ borderTop: '1px solid #122d58' }}>
                    <div className="mt-3 space-y-2">
                      {leg.route.path
                        .filter((p) => !p.isInterchange)
                        .map((step, j) => (
                          <div key={j} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: LINE_COLORS[step.line] || '#94a3b8' }} />
                            <span className="text-xs" style={{ color: '#7a9cc8' }}>{step.station?.name}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
