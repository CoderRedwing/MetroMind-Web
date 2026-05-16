import express from 'express';
import { buildGraph } from '../data/graph.js';
import { findMaxCoveragePath } from '../algorithms/maxCoverage.js';

const router = express.Router();
const { graph, stationMap } = buildGraph();

// POST /api/explorer/coverage - find max coverage path from a starting station
router.post('/coverage', (req, res) => {
  try {
    const { startId, maxTime = 240, prioritizeLandmarks = true } = req.body;

    if (!startId || !stationMap[startId]) {
      return res.status(400).json({ error: 'Valid startId required' });
    }

    const result = findMaxCoveragePath(graph, stationMap, startId, {
      maxTime,
      prioritizeLandmarks,
    });

    res.json({
      ...result,
      startStation: stationMap[startId],
    });
  } catch (err) {
    console.error('Explorer error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
