# 🚇 MetroMind — DMRC Navigator

A full-stack web app for planning Delhi Metro routes with AI assistance.

## Features

- **Route Finder** — All possible routes between two stations with Dijkstra (fastest, fewest stops, all paths)
- **Delhi Explorer** — Max-coverage single-journey path with landmarks using beam search
- **MetroMind AI** — Claude-powered chatbot that understands natural language like "I'm at Anand Vihar, want to go to Preet Vihar"
- **Nearest Station Detection** — Automatically detect closest station from any Delhi/Noida location
- Dark mode techy UI with metro line color system

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Algorithms | Dijkstra, BFS (all paths), Beam Search (max coverage) |
| AI | Anthropic Claude claude-sonnet-4-20250514 |
| Metro Data | 260+ stations, 10+ lines, full interchange graph |

## Project Structure

```
dmrc-metro-app/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/      # Navbar
│   │   │   ├── route-finder/# RouteFinder, RouteCard
│   │   │   ├── explorer/    # DelhiExplorer
│   │   │   ├── chat/        # ChatBot, ChatMessage
│   │   │   └── ui/          # StationInput
│   │   ├── hooks/           # useChat, useStationSearch
│   │   ├── services/        # api.js
│   │   └── utils/           # formatRoute.js
├── server/                  # Express backend
│   ├── src/
│   │   ├── algorithms/      # dijkstra.js, maxCoverage.js
│   │   ├── data/            # stations.js, graph.js
│   │   ├── routes/          # route.js, explorer.js, chat.js
│   │   └── middleware/      # errorHandler.js
```

## Setup

### 1. Prerequisites
- Node.js 18+
- An Anthropic API key

### 2. Server setup
```bash
cd server
npm install
```

Create `.env` in `server/`:
```
ANTHROPIC_API_KEY=your_api_key_here
PORT=3001
```

Start server:
```bash
npm run dev
```

### 3. Client setup
```bash
cd client
npm install
npm run dev
```

### 4. Open app
Visit [http://localhost:5173](http://localhost:5173)

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/route/stations?q=` | Search stations by name |
| POST | `/api/route/find` | Find all routes between two stations |
| POST | `/api/route/nearest` | Find nearest station to coordinates |
| POST | `/api/explorer/coverage` | Max coverage path from a station |
| POST | `/api/chat/message` | AI chat message |

## Metro Lines Covered

- 🔴 Red Line (Rithala ↔ Kashmere Gate)
- 🟡 Yellow Line (Samaypur Badli ↔ HUDA City Centre)
- 🔵 Blue Line (Dwarka Sec 21 ↔ Vaishali / Noida Electronic City)
- 🟢 Green Line (Inderlok ↔ Brigadier Hoshiyar Singh)
- 🟣 Violet Line (Kashmere Gate ↔ Raja Nahar Singh/Ballabhgarh)
- 🟠 Orange / Airport Express (New Delhi ↔ Dwarka Sec 21)
- 🩷 Pink Line (Majlis Park ↔ Shiv Vihar)
- 💜 Magenta Line (Janakpuri West ↔ Botanical Garden)
- ⚪ Grey Line (Dwarka ↔ Najafgarh)
