import express from 'express';
import { buildGraph } from '../data/graph.js';
import { STATIONS } from '../data/stations.js';
import { dijkstra, findAllPaths } from '../algorithms/dijkstra.js';
import { calculateFare, getFareSummary } from '../data/fares.js';
import { isPeakHour, getLastTrainWarning, getArrivalTime, getCurrentFrequency } from '../utils/metroTimings.js';

const router = express.Router();
const { graph, stationMap } = buildGraph();

router.get('/stations', (req, res) => {
  const { q = '' } = req.query;
  const query = q.toLowerCase().trim();
  if (!query) return res.json(deduplicateStations(STATIONS).slice(0, 20));
  const matches = STATIONS.filter(
    (s) => s.name.toLowerCase().includes(query) || (s.landmark && s.landmark.toLowerCase().includes(query))
  );
  res.json(deduplicateStations(matches).slice(0, 10));
});

router.post('/find', (req, res) => {
  try {
    const { fromId, toId } = req.body;
    if (!fromId || !toId) return res.status(400).json({ error: 'fromId and toId required' });
    if (!stationMap[fromId] || !stationMap[toId]) return res.status(404).json({ error: 'Station not found' });
    if (fromId === toId) return res.status(400).json({ error: 'Source and destination cannot be the same' });

    const fastest = dijkstra(graph, stationMap, fromId, toId, 'time');
    const leastStops = dijkstra(graph, stationMap, fromId, toId, 'stops');
    const allPaths = findAllPaths(graph, stationMap, fromId, toId, 5, 45);

    const enrich = (route) => {
      if (!route) return null;
      const usesAirport = route.path.some((p) => p.line === 'ORANGE');
      const fare = getFareSummary(route.totalStops, usesAirport);
      const lines = [...new Set(route.path.map((p) => p.line).filter((l) => l && l !== 'INTERCHANGE'))];
      const warnings = getLastTrainWarning(lines);
      const arrivalTime = getArrivalTime(route.totalTime);
      const frequencies = {};
      lines.forEach((l) => { frequencies[l] = getCurrentFrequency(l); });
      return { ...route, fare, isPeak: isPeakHour(), lastTrainWarnings: warnings, arrivalTime, frequencies };
    };

    res.json({
      fastest: enrich(fastest),
      leastStops: enrich(leastStops),
      allPaths: allPaths.map(enrich),
      from: stationMap[fromId],
      to: stationMap[toId],
      isPeak: isPeakHour(),
    });
  } catch (err) {
    console.error('Route find error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/nearest', (req, res) => {
  try {
    const { lat, lng, limit = 3 } = req.body;
    if (lat == null || lng == null) return res.status(400).json({ error: 'lat and lng required' });
    const withDist = Object.values(stationMap).map((s) => {
      const dist = Math.sqrt(Math.pow(s.lat - lat, 2) + Math.pow(s.lng - lng, 2)) * 111;
      return { ...s, distanceKm: Math.round(dist * 100) / 100 };
    });
    withDist.sort((a, b) => a.distanceKm - b.distanceKm);
    res.json({ nearest: deduplicateStations(withDist).slice(0, limit) });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

function deduplicateStations(stations) {
  const seen = new Set();
  return stations.filter((s) => {
    const key = s.name.toLowerCase().replace(/\s/g, '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default router;
