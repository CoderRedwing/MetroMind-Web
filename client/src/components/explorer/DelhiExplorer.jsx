import { useState } from 'react';
import { Compass, Loader2, Star, MapPin, Clock, Train } from 'lucide-react';
import StationInput from '../ui/StationInput.jsx';
import { metroApi } from '../../services/api.js';
import { LINE_COLORS, formatTime } from '../../utils/formatRoute.js';

const TIME_OPTIONS = [
  { label: '2 Hours', value: 120 },
  { label: '3 Hours', value: 180 },
  { label: '4 Hours', value: 240 },
  { label: '6 Hours', value: 360 },
  { label: 'Full Day', value: 600 },
];

export default function DelhiExplorer() {
  const [startStation, setStartStation] = useState(null);
  const [maxTime, setMaxTime] = useState(240);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleExplore = async () => {
    if (!startStation) {
      setError('Please select a starting station');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    try {
      const data = await metroApi.findCoverage(startStation.id, maxTime);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to compute coverage path');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold mb-1" style={{ color: '#e2eaf5' }}>
          Delhi Explorer
        </h1>
        <p className="text-sm" style={{ color: '#7a9cc8' }}>
          Find the single path that covers maximum stations & landmarks
        </p>
      </div>

      {/* Config Panel */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{ background: '#0a1c35', border: '1px solid #1a3d70' }}
      >
        <StationInput
          label="START FROM"
          value={startStation}
          onSelect={setStartStation}
          placeholder="Where do you want to start?"
        />

        {/* Time selector */}
        <div className="mt-5">
          <label className="block text-xs font-mono mb-2" style={{ color: '#7a9cc8' }}>
            MAX TRAVEL TIME
          </label>
          <div className="flex flex-wrap gap-2">
            {TIME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setMaxTime(opt.value)}
                className="px-3 py-1.5 rounded-lg text-xs font-mono transition-all"
                style={{
                  background: maxTime === opt.value ? 'rgba(34,211,238,0.15)' : 'rgba(18,45,88,0.6)',
                  border: `1px solid ${maxTime === opt.value ? 'rgba(34,211,238,0.4)' : '#122d58'}`,
                  color: maxTime === opt.value ? '#22d3ee' : '#7a9cc8',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-4 text-sm" style={{ color: '#f87171' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleExplore}
          disabled={loading || !startStation}
          className="mt-5 w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all"
          style={{
            background: startStation ? 'linear-gradient(135deg, #7b2fbe, #c77dff)' : '#122d58',
            color: startStation ? 'white' : '#3d618a',
            fontFamily: 'Space Grotesk',
            cursor: startStation ? 'pointer' : 'not-allowed',
          }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Computing Max Coverage Path...
            </>
          ) : (
            <>
              <Compass size={16} />
              Explore Delhi by Metro
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="animate-slide-up">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { icon: Train, label: 'Stations Covered', value: result.stationCount, color: '#22d3ee' },
              { icon: Star, label: 'Landmarks', value: result.landmarkCount || 0, color: '#ffd60a' },
              { icon: Clock, label: 'Travel Time', value: formatTime(result.totalTime), color: '#c77dff' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div
                key={label}
                className="rounded-xl p-4 text-center"
                style={{ background: '#0a1c35', border: '1px solid #1a3d70' }}
              >
                <Icon size={18} style={{ color, margin: '0 auto 6px' }} />
                <div className="font-display text-xl font-bold" style={{ color }}>
                  {value}
                </div>
                <div className="text-xs mt-1" style={{ color: '#3d618a' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Landmarks */}
          {result.landmarks?.length > 0 && (
            <div
              className="rounded-xl p-5 mb-4"
              style={{ background: '#0a1c35', border: '1px solid #1a3d70' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Star size={14} style={{ color: '#ffd60a' }} />
                <span className="text-xs font-mono uppercase tracking-widest" style={{ color: '#7a9cc8' }}>
                  Landmarks on Route
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.landmarks.map((s) => (
                  <div
                    key={s.id}
                    className="px-3 py-1.5 rounded-lg text-xs"
                    style={{ background: 'rgba(255,214,10,0.08)', border: '1px solid rgba(255,214,10,0.2)', color: '#ffd60a' }}
                  >
                    {s.landmark}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full station list */}
          <div
            className="rounded-xl p-5"
            style={{ background: '#0a1c35', border: '1px solid #1a3d70' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={14} style={{ color: '#22d3ee' }} />
              <span className="text-xs font-mono uppercase tracking-widest" style={{ color: '#7a9cc8' }}>
                Complete Route ({result.stations?.length} stations)
              </span>
            </div>

            <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
              {result.stations?.map((station, i) => (
                <div
                  key={`${station.id}-${i}`}
                  className="flex items-center gap-3 py-2 px-3 rounded-lg"
                  style={{ background: station.landmark ? 'rgba(255,214,10,0.05)' : 'transparent' }}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono flex-shrink-0"
                    style={{ background: '#0d2040', color: '#3d618a', fontSize: '10px' }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: station.landmark ? '#ffd60a' : '#e2eaf5' }}>
                      {station.name}
                      {station.interchange && (
                        <span className="ml-2 text-xs font-mono" style={{ color: '#f4a261' }}>⇄</span>
                      )}
                    </div>
                    {station.landmark && (
                      <div className="text-xs" style={{ color: '#7a9cc8' }}>{station.landmark}</div>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {(station.lines || []).slice(0, 2).map((line) => (
                      <div
                        key={line}
                        className="w-2 h-2 rounded-full"
                        style={{ background: LINE_COLORS[line] || '#94a3b8' }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
