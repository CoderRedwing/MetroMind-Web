const BASE = '/api';

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const metroApi = {
  searchStations: (q) => request('GET', `/route/stations?q=${encodeURIComponent(q)}`),
  findRoutes:     (fromId, toId) => request('POST', '/route/find', { fromId, toId }),
  findNearest:    (lat, lng, limit = 3) => request('POST', '/route/nearest', { lat, lng, limit }),
  findCoverage:   (startId, maxTime = 240) => request('POST', '/explorer/coverage', { startId, maxTime }),
  planTrip:       (stops, startTime) => request('POST', '/trip/plan', { stops, startTime }),
  chat:           (messages, context) => request('POST', '/chat/message', { messages, context }),
};
