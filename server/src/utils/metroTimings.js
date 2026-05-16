/**
 * DMRC Metro Timings
 * First/last train times, peak hours, frequency
 */

export const METRO_TIMINGS = {
  RED:     { first: '06:00', last: '23:00', peakFreq: 3,  offPeakFreq: 5  },
  YELLOW:  { first: '05:50', last: '23:30', peakFreq: 2,  offPeakFreq: 4  },
  BLUE:    { first: '05:50', last: '23:30', peakFreq: 2,  offPeakFreq: 4  },
  GREEN:   { first: '06:05', last: '22:45', peakFreq: 5,  offPeakFreq: 8  },
  VIOLET:  { first: '06:00', last: '23:00', peakFreq: 3,  offPeakFreq: 6  },
  ORANGE:  { first: '04:45', last: '23:30', peakFreq: 10, offPeakFreq: 15 },
  PINK:    { first: '06:00', last: '23:00', peakFreq: 4,  offPeakFreq: 7  },
  MAGENTA: { first: '06:00', last: '23:00', peakFreq: 4,  offPeakFreq: 7  },
  GREY:    { first: '06:15', last: '22:30', peakFreq: 8,  offPeakFreq: 12 },
};

// Peak hours: 8-10 AM and 5:30-8 PM on weekdays
export function isPeakHour(date = new Date()) {
  const day = date.getDay(); // 0=Sun, 6=Sat
  if (day === 0 || day === 6) return false; // Weekend = no peak

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  const morningPeakStart = 8 * 60;
  const morningPeakEnd = 10 * 60;
  const eveningPeakStart = 17 * 60 + 30;
  const eveningPeakEnd = 20 * 60;

  return (
    (totalMinutes >= morningPeakStart && totalMinutes <= morningPeakEnd) ||
    (totalMinutes >= eveningPeakStart && totalMinutes <= eveningPeakEnd)
  );
}

export function isMetroRunning(line, date = new Date()) {
  const timing = METRO_TIMINGS[line];
  if (!timing) return true;

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const current = hours * 60 + minutes;

  const [fh, fm] = timing.first.split(':').map(Number);
  const [lh, lm] = timing.last.split(':').map(Number);
  const first = fh * 60 + fm;
  const last = lh * 60 + lm;

  return current >= first && current <= last;
}

export function getLastTrainWarning(lines, date = new Date()) {
  const warnings = [];
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const current = hours * 60 + minutes;

  lines.forEach((line) => {
    const timing = METRO_TIMINGS[line];
    if (!timing) return;

    const [lh, lm] = timing.last.split(':').map(Number);
    const last = lh * 60 + lm;
    const diff = last - current;

    if (diff > 0 && diff <= 60) {
      warnings.push({
        line,
        lastTrain: timing.last,
        minutesLeft: diff,
      });
    }
  });

  return warnings;
}

export function getArrivalTime(travelMinutes, date = new Date()) {
  const arrival = new Date(date.getTime() + travelMinutes * 60000);
  return arrival.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export function getCurrentFrequency(line, date = new Date()) {
  const timing = METRO_TIMINGS[line];
  if (!timing) return null;
  return isPeakHour(date) ? timing.peakFreq : timing.offPeakFreq;
}
