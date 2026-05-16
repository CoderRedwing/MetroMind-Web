/**
 * Dijkstra's algorithm for shortest path
 * Supports: minimize time (with interchange penalty) or minimize stops
 */

export function dijkstra(graph, stationMap, startId, endId, mode = 'time') {
  const INTERCHANGE_PENALTY = mode === 'time' ? 0 : 0; // Already in edge weights
  const dist = {};
  const prev = {};
  const prevEdge = {};
  const visited = new Set();

  Object.keys(graph).forEach((id) => {
    dist[id] = Infinity;
    prev[id] = null;
    prevEdge[id] = null;
  });
  dist[startId] = 0;

  const pq = new MinHeap();
  pq.push({ id: startId, cost: 0 });

  while (!pq.isEmpty()) {
    const { id: current, cost } = pq.pop();

    if (visited.has(current)) continue;
    visited.add(current);

    if (current === endId) break;

    const neighbors = graph[current] || [];
    for (const edge of neighbors) {
      if (visited.has(edge.to)) continue;

      const edgeCost = mode === 'time' ? edge.travelTime :
                       mode === 'stops' ? (edge.isInterchange ? 0 : 1) :
                       edge.distance;

      const newCost = cost + edgeCost;
      if (newCost < dist[edge.to]) {
        dist[edge.to] = newCost;
        prev[edge.to] = current;
        prevEdge[edge.to] = edge;
        pq.push({ id: edge.to, cost: newCost });
      }
    }
  }

  if (dist[endId] === Infinity) return null;

  // Reconstruct path
  const path = [];
  let current = endId;
  while (current !== null) {
    const station = stationMap[current];
    const edge = prevEdge[current];
    path.unshift({
      station,
      line: edge ? edge.line : null,
      isInterchange: edge ? edge.isInterchange : false,
      travelTime: edge ? edge.travelTime : 0,
      distance: edge ? edge.distance : 0,
    });
    current = prev[current];
  }

  return {
    path,
    totalTime: dist[endId],
    totalStops: path.filter((p) => !p.isInterchange).length - 1,
    totalDistance: path.reduce((s, p) => s + (p.distance || 0), 0),
    interchanges: path.filter((p) => p.isInterchange).length,
  };
}

// BFS for all paths up to maxPaths or maxDepth
export function findAllPaths(graph, stationMap, startId, endId, maxPaths = 5, maxDepth = 40) {
  const results = [];
  const queue = [{
    id: startId,
    visited: new Set([startId]),
    path: [{ station: stationMap[startId], line: null, isInterchange: false, travelTime: 0, distance: 0 }],
    totalTime: 0,
    totalDistance: 0,
    interchanges: 0,
  }];

  while (queue.length > 0 && results.length < maxPaths) {
    const { id, visited, path, totalTime, totalDistance, interchanges } = queue.shift();

    if (id === endId && path.length > 1) {
      results.push({
        path,
        totalTime,
        totalStops: path.filter((p) => !p.isInterchange).length - 1,
        totalDistance,
        interchanges,
      });
      continue;
    }

    if (path.length > maxDepth) continue;

    const neighbors = graph[id] || [];
    for (const edge of neighbors) {
      if (!visited.has(edge.to)) {
        const newVisited = new Set(visited);
        newVisited.add(edge.to);
        queue.push({
          id: edge.to,
          visited: newVisited,
          path: [...path, {
            station: stationMap[edge.to],
            line: edge.line,
            isInterchange: edge.isInterchange,
            travelTime: edge.travelTime,
            distance: edge.distance,
          }],
          totalTime: totalTime + edge.travelTime,
          totalDistance: totalDistance + edge.distance,
          interchanges: interchanges + (edge.isInterchange ? 1 : 0),
        });
      }
    }
  }

  // Sort by time
  return results.sort((a, b) => a.totalTime - b.totalTime);
}

// Minimal heap for Dijkstra
class MinHeap {
  constructor() { this.heap = []; }

  push(item) {
    this.heap.push(item);
    this._bubbleUp(this.heap.length - 1);
  }

  pop() {
    const min = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._sinkDown(0);
    }
    return min;
  }

  isEmpty() { return this.heap.length === 0; }

  _bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent].cost <= this.heap[i].cost) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }

  _sinkDown(i) {
    const n = this.heap.length;
    while (true) {
      let min = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.heap[l].cost < this.heap[min].cost) min = l;
      if (r < n && this.heap[r].cost < this.heap[min].cost) min = r;
      if (min === i) break;
      [this.heap[min], this.heap[i]] = [this.heap[i], this.heap[min]];
      i = min;
    }
  }
}
