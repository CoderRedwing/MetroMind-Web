import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildGraph } from '../data/graph.js';
import { dijkstra } from '../algorithms/dijkstra.js';
import { getFareSummary } from '../data/fares.js';
import { getArrivalTime, isPeakHour } from '../utils/metroTimings.js';

const router = express.Router();
const { graph, stationMap } = buildGraph();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Build a station name → id lookup
const nameToId = {};
Object.values(stationMap).forEach((s) => {
  nameToId[s.name.toLowerCase()] = s.id;
  if (s.landmark) nameToId[s.landmark.toLowerCase()] = s.id;
});

// Landmark → station id map for common places
const LANDMARK_TO_STATION = {
  'connaught place': 'rajiv_chowk', 'cp': 'rajiv_chowk',
  'red fort': 'lal_quila', 'lal qila': 'lal_quila',
  'india gate': 'central_secretariat',
  'igi airport': 'igi_airport', 'airport': 'igi_airport', 'terminal 3': 'igi_airport',
  'qutub minar': 'qutab_minar', 'qutab minar': 'qutab_minar',
  'akshardham': 'akshardham',
  'aiims': 'aiims',
  'hauz khas': 'hauz_khas',
  'karol bagh': 'karol_bagh',
  'lajpat nagar': 'lajpat_nagar',
  'khan market': 'khan_market',
  'anand vihar': 'anand_vihar',
  'preet vihar': 'preet_vihar',
  'laxmi nagar': 'laxmi_nagar',
  'vaishali': 'vaishali',
  'noida city centre': 'noida_city_centre',
  'botanical garden': 'botanical_garden',
  'cyber hub': 'sikanderpur', 'gurgaon': 'huda_city_centre',
  'chandni chowk': 'chandni_chowk',
  'nehru place': 'nehru_place',
  'saket': 'saket',
  'dwarka': 'dwarka_sec21',
  'rajouri garden': 'rajouri_garden',
  'janakpuri': 'janakpuri_west',
  'noida sector 18': 'noida_sec18', 'sector 18': 'noida_sec18',
  'new delhi': 'new_delhi', 'ndls': 'new_delhi',
};

function resolveStation(name) {
  const lower = name.toLowerCase().trim();
  if (LANDMARK_TO_STATION[lower]) return stationMap[LANDMARK_TO_STATION[lower]];
  if (nameToId[lower]) return stationMap[nameToId[lower]];
  // Partial match
  const partial = Object.values(stationMap).find((s) =>
    s.name.toLowerCase().includes(lower) || lower.includes(s.name.toLowerCase())
  );
  return partial || null;
}

function buildRouteContext(fromName, toName) {
  const fromStation = resolveStation(fromName);
  const toStation = resolveStation(toName);
  if (!fromStation || !toStation) return null;

  const route = dijkstra(graph, stationMap, fromStation.id, toStation.id, 'time');
  if (!route) return null;

  const fare = getFareSummary(route.totalStops);
  const arrival = getArrivalTime(route.totalTime);
  const peak = isPeakHour();

  // Build step-by-step instructions
  let currentLine = null;
  const steps = [];
  let stepStations = [];

  route.path.forEach((step) => {
    if (step.isInterchange) {
      if (stepStations.length > 0) {
        steps.push({ type: 'ride', line: currentLine, stations: stepStations });
        stepStations = [];
      }
      steps.push({ type: 'interchange', station: step.station?.name });
      currentLine = null;
    } else if (step.line && step.line !== 'INTERCHANGE') {
      if (step.line !== currentLine) {
        if (stepStations.length > 0) steps.push({ type: 'ride', line: currentLine, stations: stepStations });
        currentLine = step.line;
        stepStations = [step.station?.name];
      } else {
        stepStations.push(step.station?.name);
      }
    }
  });
  if (stepStations.length > 0) steps.push({ type: 'ride', line: currentLine, stations: stepStations });

  const instructions = steps.map((s) => {
    if (s.type === 'ride') {
      const lineName = { RED:'Red Line', YELLOW:'Yellow Line', BLUE:'Blue Line', GREEN:'Green Line', VIOLET:'Violet Line', ORANGE:'Airport Express', PINK:'Pink Line', MAGENTA:'Magenta Line', GREY:'Grey Line' }[s.line] || s.line;
      return `Take ${lineName} from ${s.stations[0]} → ${s.stations[s.stations.length - 1]} (${s.stations.length - 1} stops)`;
    }
    return `Interchange at ${s.station}`;
  }).join('\n');

  return {
    from: fromStation.name,
    to: toStation.name,
    totalTime: route.totalTime,
    totalStops: route.totalStops,
    interchanges: route.interchanges,
    fareToken: fare.token,
    fareSmartCard: fare.smartCard,
    arrivalTime: arrival,
    isPeak: peak,
    instructions,
  };
}

const SYSTEM_PROMPT = `You are MetroMind, a Delhi Metro assistant built into the MetroMind app.
You give SHORT, DIRECT, CONVERSATIONAL answers — like a knowledgeable friend, not a travel website.

CRITICAL RULES:
- Never suggest cabs, autos, buses, or roads. You ONLY know metro routes.
- Never use headers, bullet points, or markdown formatting.
- Keep replies under 80 words max.
- Be casual and friendly, like texting a friend.
- When route data is provided in context, use ONLY that data. Do not invent or estimate.
- If you don't know something, say so simply.

TONE EXAMPLES:
Bad: "The Delhi Metro is often the most reliable option during peak hours..."
Good: "Board Blue Line from Rajiv Chowk, get off at Noida City Centre — 35 min, ₹30 token."

Bad: "### Option 1: Via DND Flyway..."  
Good: "Take Blue Line from Rajiv Chowk → Noida Sec 18, 6 stops, about 25 min. ₹20 token."`;

router.post('/message', async (req, res) => {
  try {
    const { messages, context } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array required' });
    }

    // Try to extract from/to from the last user message
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    let routeContext = '';

    if (lastUserMsg) {
      // Simple pattern matching for "from X to Y" or "X to Y"
      const text = lastUserMsg.content.toLowerCase();
      const patterns = [
        /(?:from|at|in|standing at|i(?:'m| am)(?: at| in)?)\s+([a-z\s]+?)\s+(?:to|and want to|want to go to|to reach|towards)\s+([a-z\s]+)/i,
        /([a-z\s]+?)\s+to\s+([a-z\s]+)/i,
      ];

      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          const fromName = match[1].trim();
          const toName = match[2].trim();
          const routeData = buildRouteContext(fromName, toName);
          if (routeData) {
            routeContext = `\n\nREAL ROUTE DATA FROM APP (use this exactly):
From: ${routeData.from}
To: ${routeData.to}
Travel time: ${routeData.totalTime} minutes
Stops: ${routeData.totalStops}
Interchanges: ${routeData.interchanges}
Token fare: ₹${routeData.fareToken}
Smart Card fare: ₹${routeData.fareSmartCard}
Estimated arrival: ${routeData.arrivalTime}
Peak hour now: ${routeData.isPeak ? 'Yes — expect crowds' : 'No'}

Step by step:
${routeData.instructions}

Reply using ONLY this data. No cabs. No roads. Under 80 words. Casual tone.`;
            break;
          }
        }
      }
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT + routeContext,
    });

    const allMessages = messages.filter((m) => m.role === 'user' || m.role === 'assistant');
    let startIndex = 0;
    while (startIndex < allMessages.length - 1 && allMessages[startIndex].role === 'assistant') {
      startIndex++;
    }
    const trimmed = allMessages.slice(startIndex);
    const history = trimmed.slice(0, -1).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
    const lastMessage = trimmed[trimmed.length - 1];

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage.content);
    const reply = result.response.text() || 'Could not process that.';

    const stationSuggestions = extractStationMentions(reply);
    res.json({ reply, stationSuggestions });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Chat service unavailable: ' + err.message });
  }
});

function extractStationMentions(text) {
  const suggestions = [];
  Object.values(stationMap).forEach((station) => {
    if (text.toLowerCase().includes(station.name.toLowerCase()) && station.name.length > 4) {
      if (!suggestions.find((s) => s.id === station.id)) {
        suggestions.push({ id: station.id, name: station.name, lines: station.lines });
      }
    }
  });
  return suggestions.slice(0, 3);
}

export default router;
