import { useState } from 'react';
import Navbar from './components/layout/Navbar.jsx';
import RouteFinder from './components/route-finder/RouteFinder.jsx';
import DelhiExplorer from './components/explorer/DelhiExplorer.jsx';
import TripPlanner from './components/trip-planner/TripPlanner.jsx';
import MetroMap from './components/map/MetroMap.jsx';
import ChatBot from './components/chat/ChatBot.jsx';
import './index.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('route');

  return (
    <div className="min-h-screen grid-bg" style={{ background: 'var(--bg-primary)' }}>
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.04) 0%, transparent 70%)', filter: 'blur(40px)' }}
      />

      <main className="pt-24 pb-12 px-4">
        {activeTab === 'route'    && <RouteFinder />}
        {activeTab === 'explorer' && <DelhiExplorer />}
        {activeTab === 'trip'     && <TripPlanner />}
        {activeTab === 'map'      && (
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h1 className="font-display text-2xl font-bold mb-1" style={{ color: '#e2eaf5' }}>Metro Map</h1>
              <p className="text-sm" style={{ color: '#7a9cc8' }}>Interactive DMRC network — drag to pan, scroll to zoom</p>
            </div>
            <MetroMap />
          </div>
        )}
        {activeTab === 'chat'     && <ChatBot />}
      </main>
    </div>
  );
}
