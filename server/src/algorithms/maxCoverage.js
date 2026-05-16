/**
 * Maximum Coverage Path Algorithm
 * Finds the path that covers the most unique stations/landmarks
 * Uses greedy DFS with backtracking + beam search for performance
 */

export function findMaxCoveragePath(graph, stationMap, startId, options = {}) {
  const {
    maxTime = 240,        // max travel time in minutes (default 4 hours)
    prioritizeLandmarks = true,
    maxStations = 30,
  } = options;

  // Score stations: landmarks get higher score
  const stationScore = (id) => {
    const s = stationMap[id];
    if (!s) return 1;
    if (s.landmark) return 3;
    if (s.interchange) return 2;
    return 1;
  };

  let bestPath = null;
  let bestScore = 0;

  // Greedy beam search: keep top K paths at each step
  const BEAM_WIDTH = 5;
  let beams = [{
    id: startId,
    visited: new Set([startId]),
    path: [startId],
    totalTime: 0,
    score: stationScore(startId),
  }];

  while (beams.length > 0) {
    const nextBeams = [];

    for (const beam of beams) {
      const { id, visited, path, totalTime, score } = beam;

      // Try all neighbors
      const neighbors = graph[id] || [];
      let expanded = false;

      for (const edge of neighbors) {
        if (!visited.has(edge.to) && totalTime + edge.travelTime <= maxTime) {
          const newScore = score + stationScore(edge.to);
          const newVisited = new Set(visited);
          newVisited.add(edge.to);

          nextBeams.push({
            id: edge.to,
            visited: newVisited,
            path: [...path, edge.to],
            totalTime: totalTime + edge.travelTime,
            score: newScore,
          });
          expanded = true;

          // Track best
          if (newScore > bestScore) {
            bestScore = newScore;
            bestPath = {
              stationIds: [...path, edge.to],
              totalTime: totalTime + edge.travelTime,
              score: newScore,
              stationCount: newVisited.size,
            };
          }
        }
      }
    }

    // Keep top BEAM_WIDTH beams by score
    nextBeams.sort((a, b) => b.score - a.score);
    beams = nextBeams.slice(0, BEAM_WIDTH);

    // Stop if all beams have exhausted options
    if (nextBeams.length === 0) break;
  }

  if (!bestPath) {
    return {
      stationIds: [startId],
      totalTime: 0,
      score: stationScore(startId),
      stationCount: 1,
    };
  }

  // Enrich with station data
  const enriched = bestPath.stationIds.map((id) => stationMap[id]).filter(Boolean);
  const landmarks = enriched.filter((s) => s.landmark);

  return {
    ...bestPath,
    stations: enriched,
    landmarks,
    landmarkCount: landmarks.length,
  };
}

// Find nearest stations to given coordinates
export function findNearestStations(stationMap, lat, lng, limit = 3) {
  const distances = Object.values(stationMap).map((station) => {
    const dlat = station.lat - lat;
    const dlng = station.lng - lng;
    const dist = Math.sqrt(dlat * dlat + dlng * dlng) * 111; // rough km
    return { station, distanceKm: Math.round(dist * 100) / 100 };
  });

  distances.sort((a, b) => a.distanceKm - b.distanceKm);
  return distances.slice(0, limit);
}
