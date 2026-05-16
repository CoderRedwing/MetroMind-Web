import express from 'express';
import { buildGraph } from '../data/graph.js';
import { dijkstra } from '../algorithms/dijkstra.js';
import { calculateFare } from '../data/fares.js';
import { getArrivalTime, isPeakHour, getLastTrainWarning } from '../utils/metroTimings.js';

const router = express.Router();
const { graph, stationMap } = buildGraph();

// POST /api/trip/plan
// Body: { stops: [stationId, ...], startTime: "09:00" }
router.post('/plan', (req, res) => {
  try {
    const { stops, startTime = '09:00' } = req.body;

    if (!stops || stops.length < 2) {
      return res.status(400).json({ error: 'At least 2 stops required' });
    }

    for (const id of stops) {
      if (!stationMap[id]) {
        return res.status(404).json({ error: `Station not found: ${id}` });
      }
    }

    // Parse start time
    const [sh, sm] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(sh, sm, 0, 0);

    let currentTime = new Date(startDate);
    let totalFare = 0;
    let totalTime = 0;
    const legs = [];

    for (let i = 0; i < stops.length - 1; i++) {
      const fromId = stops[i];
      const toId = stops[i + 1];

      const route = dijkstra(graph, stationMap, fromId, toId, 'time');
      if (!route) {
        return res.status(400).json({ error: `No route between ${stationMap[fromId]?.name} and ${stationMap[toId]?.name}` });
      }

      const usesAirport = route.path.some((p) => p.line === 'ORANGE');
      const fare = calculateFare(route.totalStops, usesAirport);
      const departureTime = currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

      currentTime = new Date(currentTime.getTime() + route.totalTime * 60000);
      const arrivalTime = currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

      // Add 15 min default visit time between stops (except last)
      if (i < stops.length - 2) {
        currentTime = new Date(currentTime.getTime() + 15 * 60000);
      }

      totalFare += fare;
      totalTime += route.totalTime;

      legs.push({
        from: stationMap[fromId],
        to: stationMap[toId],
        route,
        fare,
        departureTime,
        arrivalTime,
        isPeak: isPeakHour(new Date(startDate.getTime() + totalTime * 60000 - route.totalTime * 60000)),
      });
    }

    // Last train warnings
    const allLines = [...new Set(legs.flatMap((l) => l.route.path.map((p) => p.line).filter(Boolean)))];
    const warnings = getLastTrainWarning(allLines);

    res.json({
      legs,
      totalFare,
      totalTime,
      totalStops: stops.length,
      estimatedEndTime: currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      lastTrainWarnings: warnings,
    });
  } catch (err) {
    console.error('Trip plan error:', err);
    res.status(500).json({ error: 'Trip planning failed' });
  }
});

export default router;
