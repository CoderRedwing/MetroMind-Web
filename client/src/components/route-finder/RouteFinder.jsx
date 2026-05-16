import { useState } from 'react';
import { ArrowLeftRight, Loader2, AlertCircle, Navigation, LocateFixed, Bookmark } from 'lucide-react';
import StationInput from '../ui/StationInput.jsx';
import RouteCard from './RouteCard.jsx';
import SavedRoutes from '../saved-routes/SavedRoutes.jsx';
import MetroMap from '../map/MetroMap.jsx';
import { metroApi } from '../../services/api.js';
import { useGeolocation } from '../../hooks/useGeolocation.js';
import { useSavedRoutes } from '../../hooks/useSavedRoutes.js';
import { getPathLines } from '../../utils/formatRoute.js';

export default function RouteFinder() {
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [gpsTarget, setGpsTarget] = useState('from'); // which field GPS fills

  const { loading: gpsLoading, error: gpsError, nearestStations, getNearestStations, clear: clearGps } = useGeolocation();
  const { savedRoutes, saveRoute, removeRoute, isAlreadySaved } = useSavedRoutes();

  const swapStations = () => { setFrom(to); setTo(from); setResults(null); };

  const handleGps = (target) => {
    setGpsTarget(target);
    getNearestStations();
  };

  const handleSelectNearest = (station) => {
    if (gpsTarget === 'from') setFrom(station);
    else setTo(station);
    clearGps();
  };

  const handleFind = async () => {
    if (!from || !to) { setError('Please select both source and destination stations'); return; }
    setError('');
    setLoading(true);
    setResults(null);
    try {
      const data = await metroApi.findRoutes(from.id, to.id);
      setResults(data);
    } catch (err) {
      setError(err.message || 'Failed to find routes');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => { if (from && to) saveRoute(from, to); };

  const handleLoadSaved = (route) => { setFrom(route.from); setTo(route.to); setResults(null); };

  const highlightLines = results?.fastest ? getPathLines(results.fastest.path) : [];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold mb-1" style={{ color: '#e2eaf5' }}>Route Finder</h1>
        <p className="text-sm" style={{ color: '#7a9cc8' }}>Find all possible routes between two DMRC stations</p>
      </div>

      {/* Saved Routes */}
      <SavedRoutes savedRoutes={savedRoutes} onSelect={handleLoadSaved} onRemove={removeRoute} />

      {/* Search Panel */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: '#0a1c35', border: '1px solid #1a3d70' }}>
        <div className="flex gap-4 items-end">
          <div className="flex-1 space-y-4">
            {/* FROM */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono" style={{ color: '#7a9cc8' }}>FROM</label>
                <button
                  onClick={() => handleGps('from')}
                  disabled={gpsLoading}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors"
                  style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)', color: '#22d3ee' }}
                >
                  <LocateFixed size={11} className={gpsLoading ? 'animate-spin' : ''} />
                  Use GPS
                </button>
              </div>
              <StationInput value={from} onSelect={setFrom} placeholder="Enter source station..." />
            </div>

            {/* TO */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono" style={{ color: '#7a9cc8' }}>TO</label>
                <button
                  onClick={() => handleGps('to')}
                  disabled={gpsLoading}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors"
                  style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)', color: '#22d3ee' }}
                >
                  <LocateFixed size={11} className={gpsLoading ? 'animate-spin' : ''} />
                  Use GPS
                </button>
              </div>
              <StationInput value={to} onSelect={setTo} placeholder="Enter destination station..." />
            </div>
          </div>

          <button onClick={swapStations} className="mb-0.5 w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105" style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)', color: '#22d3ee' }}>
            <ArrowLeftRight size={16} />
          </button>
        </div>

        {/* GPS nearest station picker */}
        {nearestStations.length > 0 && (
          <div className="mt-4 p-3 rounded-xl animate-slide-up" style={{ background: 'rgba(34,211,238,0.04)', border: '1px solid rgba(34,211,238,0.15)' }}>
            <p className="text-xs font-mono mb-2" style={{ color: '#7a9cc8' }}>
              NEAREST STATIONS ({gpsTarget.toUpperCase()})
            </p>
            <div className="space-y-1">
              {nearestStations.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectNearest(s)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left transition-colors hover:bg-white/5"
                  style={{ color: '#e2eaf5' }}
                >
                  <span>{s.name}</span>
                  <span className="text-xs font-mono" style={{ color: '#3d618a' }}>{s.distanceKm} km</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {(error || gpsError) && (
          <div className="mt-4 flex items-center gap-2 text-sm" style={{ color: '#f87171' }}>
            <AlertCircle size={14} />
            {error || gpsError}
          </div>
        )}

        <div className="mt-5 flex gap-3">
          <button
            onClick={handleFind}
            disabled={loading || !from || !to}
            className="flex-1 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all"
            style={{
              background: from && to ? 'linear-gradient(135deg, #22d3ee, #4361ee)' : '#122d58',
              color: from && to ? 'white' : '#3d618a',
              fontFamily: 'Space Grotesk',
              cursor: from && to ? 'pointer' : 'not-allowed',
            }}
          >
            {loading ? <><Loader2 size={16} className="animate-spin" />Computing...</> : <><Navigation size={16} />Find Routes</>}
          </button>

          {from && to && (
            <button
              onClick={handleSave}
              className="px-4 py-3 rounded-xl flex items-center gap-2 text-sm transition-all"
              style={{ background: 'rgba(255,214,10,0.08)', border: '1px solid rgba(255,214,10,0.2)', color: '#ffd60a' }}
            >
              <Bookmark size={15} />
            </button>
          )}

          <button
            onClick={() => setShowMap(!showMap)}
            className="px-4 py-3 rounded-xl text-sm transition-all"
            style={{
              background: showMap ? 'rgba(67,97,238,0.15)' : 'rgba(18,45,88,0.6)',
              border: `1px solid ${showMap ? 'rgba(67,97,238,0.4)' : '#122d58'}`,
              color: showMap ? '#4361ee' : '#7a9cc8',
            }}
          >
            Map
          </button>
        </div>
      </div>

      {/* Metro Map */}
      {showMap && (
        <div className="mb-6 animate-slide-up">
          <MetroMap highlightLines={highlightLines} />
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-4 animate-slide-up">
          {results.isPeak && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs" style={{ background: 'rgba(244,162,97,0.08)', border: '1px solid rgba(244,162,97,0.25)', color: '#f4a261' }}>
              ⚡ Currently peak hours — trains may be crowded
            </div>
          )}

          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-base" style={{ color: '#7a9cc8' }}>Routes found</h2>
            <span className="text-xs font-mono" style={{ color: '#3d618a' }}>{results.from?.name} → {results.to?.name}</span>
          </div>

          {results.fastest && (
            <RouteCard
              route={results.fastest}
              label="Fastest Route"
              badge={{ text: 'FASTEST', bg: 'rgba(34,211,238,0.15)', color: '#22d3ee' }}
              expanded={true}
              onSave={handleSave}
              isSaved={isAlreadySaved(results.from?.id, results.to?.id)}
            />
          )}

          {results.leastStops && results.leastStops.totalStops !== results.fastest?.totalStops && (
            <RouteCard
              route={results.leastStops}
              label="Fewest Stops"
              badge={{ text: 'MIN STOPS', bg: 'rgba(45,198,83,0.15)', color: '#2dc653' }}
            />
          )}

          {results.allPaths?.length > 0 && (
            <>
              <div className="mt-6 mb-3 text-xs font-mono uppercase tracking-widest" style={{ color: '#3d618a' }}>
                All possible routes ({results.allPaths.length})
              </div>
              {results.allPaths.map((path, i) => (
                <RouteCard
                  key={i}
                  route={path}
                  label={`Route ${i + 1}`}
                  badge={{ text: `#${i + 1}`, bg: 'rgba(122,156,200,0.1)', color: '#7a9cc8' }}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
