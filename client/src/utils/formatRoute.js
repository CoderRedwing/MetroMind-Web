export const LINE_COLORS = {
  RED: '#e63946',
  YELLOW: '#ffd60a',
  BLUE: '#4361ee',
  BLUE_BRANCH: '#4361ee',
  GREEN: '#2dc653',
  GREEN_BRANCH: '#2dc653',
  VIOLET: '#7b2fbe',
  ORANGE: '#f4a261',
  PINK: '#ff6b9d',
  MAGENTA: '#c77dff',
  GREY: '#adb5bd',
  RAPID: '#00b4d8',
  INTERCHANGE: '#94a3b8',
};

export const LINE_NAMES = {
  RED: 'Red Line',
  YELLOW: 'Yellow Line',
  BLUE: 'Blue Line',
  BLUE_BRANCH: 'Blue Line (Branch)',
  GREEN: 'Green Line',
  VIOLET: 'Violet Line',
  ORANGE: 'Airport Express',
  PINK: 'Pink Line',
  MAGENTA: 'Magenta Line',
  GREY: 'Grey Line',
  RAPID: 'Rapid Metro',
  INTERCHANGE: 'Interchange',
};

export function formatTime(minutes) {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)} km`;
}

// Get the distinct lines used in a path (for display)
export function getPathLines(path) {
  const lines = [];
  path.forEach((step) => {
    if (step.line && step.line !== 'INTERCHANGE' && !lines.includes(step.line)) {
      lines.push(step.line);
    }
  });
  return lines;
}

// Group path into segments by line
export function groupPathBySegment(path) {
  const segments = [];
  let current = null;

  path.forEach((step) => {
    if (!step.line || step.line === 'INTERCHANGE') {
      if (current) {
        segments.push(current);
        current = null;
      }
      if (step.isInterchange) {
        segments.push({ type: 'interchange', station: step.station });
      }
      return;
    }

    if (!current || current.line !== step.line) {
      if (current) segments.push(current);
      current = { type: 'ride', line: step.line, stations: [], time: 0 };
    }
    current.stations.push(step.station);
    current.time += step.travelTime || 0;
  });

  if (current) segments.push(current);
  return segments;
}
