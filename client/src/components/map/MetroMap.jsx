import { useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

const LINE_COLORS = {
  RED: '#e63946',
  YELLOW: '#ffd60a',
  BLUE: '#4361ee',
  GREEN: '#2dc653',
  VIOLET: '#7b2fbe',
  ORANGE: '#f4a261',
  PINK: '#ff6b9d',
  MAGENTA: '#c77dff',
  GREY: '#adb5bd',
};

// Simplified metro map coordinates (scaled to SVG viewport 800x600)
const MAP_LINES = [
  {
    id: 'YELLOW', name: 'Yellow Line',
    points: [[400,50],[395,80],[390,110],[385,140],[378,170],[370,200],[360,230],[348,255],[335,275],[320,290],[310,305],[298,320],[285,340],[275,355],[268,368],[262,380],[255,395],[248,410],[240,425],[232,440],[225,452],[218,462],[210,472],[200,482],[190,490],[182,498],[174,505],[166,512]],
  },
  {
    id: 'BLUE', name: 'Blue Line',
    points: [[40,380],[65,378],[90,376],[115,374],[140,372],[162,370],[182,368],[200,366],[218,364],[235,362],[250,360],[265,358],[280,356],[295,358],[310,360],[320,362],[330,364],[340,366],[350,368],[360,370],[370,372],[380,374],[395,376],[410,374],[425,372],[440,370],[455,368],[470,366],[485,364],[500,362],[515,360],[530,358],[545,356],[560,354],[575,352],[590,350],[605,348],[620,346],[635,344],[650,342],[665,340],[680,338],[700,336]],
  },
  {
    id: 'RED', name: 'Red Line',
    points: [[140,60],[155,80],[168,100],[178,120],[188,140],[196,160],[202,180],[206,205],[210,230],[212,255],[212,280],[210,305],[206,330],[200,355],[196,375]],
  },
  {
    id: 'VIOLET', name: 'Violet Line',
    points: [[210,305],[222,318],[235,330],[248,342],[258,355],[265,368],[270,382],[272,400],[268,420],[262,440],[255,458],[248,475],[240,490],[232,505],[225,520],[218,535],[210,548],[202,560],[195,572],[188,582],[182,590]],
  },
  {
    id: 'PINK', name: 'Pink Line',
    points: [[248,55],[262,80],[272,105],[278,130],[280,155],[278,180],[272,205],[262,228],[250,248],[238,265],[225,278],[212,288],[200,298],[188,305],[178,310],[168,318],[158,328],[150,340],[145,355],[142,370],[140,385],[142,400],[145,415],[150,428],[157,440],[165,450],[175,458],[187,464],[200,468],[215,470],[230,470],[245,468],[258,462],[268,454],[275,445],[280,435],[282,422],[280,408],[276,395],[270,382]],
  },
  {
    id: 'MAGENTA', name: 'Magenta Line',
    points: [[75,420],[95,415],[115,408],[135,400],[155,392],[172,385],[188,378],[200,372],[210,366],[218,360],[224,354],[228,348],[230,342],[228,335],[224,328],[218,320],[210,314],[200,308],[190,302],[182,298],[175,295]],
  },
  {
    id: 'ORANGE', name: 'Airport Express',
    points: [[268,368],[252,355],[235,340],[215,322],[195,302],[175,282],[158,260],[145,238],[135,215],[128,192],[122,168],[118,145]],
  },
  {
    id: 'GREEN', name: 'Green Line',
    points: [[196,375],[205,360],[215,345],[225,330],[235,315],[242,300],[248,285],[252,270],[254,255],[253,240],[250,225],[244,210],[236,198],[226,188],[215,180],[205,175]],
  },
];

// Key interchange stations on the map
const INTERCHANGES = [
  { id: 'rajiv_chowk', name: 'Rajiv Chowk', x: 268, y: 368, lines: ['YELLOW','BLUE'] },
  { id: 'kashmere_gate', name: 'Kashmere Gate', x: 210, y: 305, lines: ['RED','YELLOW','VIOLET'] },
  { id: 'central_secretariat', name: 'Central Secretariat', x: 255, y: 395, lines: ['YELLOW','VIOLET'] },
  { id: 'mandi_house', name: 'Mandi House', x: 310, y: 360, lines: ['BLUE','VIOLET'] },
  { id: 'hauz_khas', name: 'Hauz Khas', x: 175, y: 505, lines: ['YELLOW','MAGENTA'] },
  { id: 'inderlok', name: 'Inderlok', x: 196, y: 375, lines: ['RED','GREEN'] },
  { id: 'kirti_nagar', name: 'Kirti Nagar', x: 205, y: 175, lines: ['BLUE','GREEN'] },
  { id: 'netaji_subhash_place', name: 'NSP', x: 196, y: 160, lines: ['RED','PINK'] },
  { id: 'azadpur', name: 'Azadpur', x: 370, y: 200, lines: ['YELLOW','PINK'] },
  { id: 'lajpat_nagar', name: 'Lajpat Nagar', x: 145, y: 355, lines: ['VIOLET','PINK'] },
  { id: 'ina', name: 'INA', x: 248, y: 410, lines: ['YELLOW','PINK'] },
  { id: 'kalkaji_mandir', name: 'Kalkaji Mandir', x: 228, y: 335, lines: ['VIOLET','MAGENTA'] },
  { id: 'botanical_garden', name: 'Botanical Garden', x: 630, y: 344, lines: ['BLUE','MAGENTA'] },
  { id: 'dwarka_sec21', name: 'Dwarka Sec 21', x: 40, y: 380, lines: ['BLUE','ORANGE'] },
  { id: 'new_delhi', name: 'New Delhi', x: 262, y: 380, lines: ['YELLOW','ORANGE'] },
  { id: 'anand_vihar', name: 'Anand Vihar', x: 560, y: 354, lines: ['BLUE','PINK'] },
  { id: 'rajouri_garden', name: 'Rajouri Garden', x: 188, y: 364, lines: ['BLUE','PINK'] },
];

export default function MetroMap({ highlightLines = [], highlightStations = [] }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [hoveredStation, setHoveredStation] = useState(null);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !dragStart) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => { setIsDragging(false); setDragStart(null); };

  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#071428', border: '1px solid #1a3d70' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid #122d58' }}>
        <span className="text-xs font-mono uppercase tracking-widest" style={{ color: '#7a9cc8' }}>
          DMRC Network Map
        </span>
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom((z) => Math.min(z + 0.2, 3))} className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/5" style={{ color: '#7a9cc8' }}>
            <ZoomIn size={14} />
          </button>
          <button onClick={() => setZoom((z) => Math.max(z - 0.2, 0.5))} className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/5" style={{ color: '#7a9cc8' }}>
            <ZoomOut size={14} />
          </button>
          <button onClick={resetView} className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/5" style={{ color: '#7a9cc8' }}>
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 px-5 py-2" style={{ borderBottom: '1px solid #122d58' }}>
        {Object.entries(LINE_COLORS).map(([line, color]) => (
          <div key={line} className="flex items-center gap-1.5">
            <div className="w-4 h-1.5 rounded-full" style={{ background: color }} />
            <span className="text-xs" style={{ color: '#3d618a', fontFamily: 'JetBrains Mono', fontSize: '10px' }}>{line}</span>
          </div>
        ))}
      </div>

      {/* SVG Map */}
      <div
        className="relative overflow-hidden"
        style={{ height: '420px', cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          width="800" height="620"
          viewBox="0 0 800 620"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.1s',
          }}
        >
          {/* Grid */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(34,211,238,0.04)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="800" height="620" fill="url(#grid)" />

          {/* Metro lines */}
          {MAP_LINES.map((line) => {
            const isHighlighted = highlightLines.includes(line.id);
            const pathD = line.points.reduce((d, [x, y], i) =>
              i === 0 ? `M ${x} ${y}` : `${d} L ${x} ${y}`, '');

            return (
              <g key={line.id}>
                {/* Shadow/glow for highlighted */}
                {isHighlighted && (
                  <path d={pathD} fill="none" stroke={LINE_COLORS[line.id]} strokeWidth="8" strokeOpacity="0.2" strokeLinecap="round" strokeLinejoin="round" />
                )}
                <path
                  d={pathD}
                  fill="none"
                  stroke={LINE_COLORS[line.id]}
                  strokeWidth={isHighlighted ? 4 : 2.5}
                  strokeOpacity={isHighlighted ? 1 : 0.7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            );
          })}

          {/* Interchange stations */}
          {INTERCHANGES.map((station) => {
            const isHighlighted = highlightStations.includes(station.id);
            const isHovered = hoveredStation === station.id;

            return (
              <g
                key={station.id}
                onMouseEnter={() => setHoveredStation(station.id)}
                onMouseLeave={() => setHoveredStation(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Outer ring */}
                <circle
                  cx={station.x} cy={station.y}
                  r={isHighlighted ? 9 : isHovered ? 7 : 5}
                  fill={isHighlighted ? '#22d3ee' : '#0a1c35'}
                  stroke={isHighlighted ? '#22d3ee' : '#7a9cc8'}
                  strokeWidth={isHighlighted ? 2.5 : 1.5}
                  style={{ transition: 'all 0.2s' }}
                />
                {/* Inner dot */}
                <circle cx={station.x} cy={station.y} r={2} fill={isHighlighted ? '#040d1a' : '#7a9cc8'} />

                {/* Label */}
                {(isHighlighted || isHovered) && (
                  <g>
                    <rect
                      x={station.x + 10} y={station.y - 10}
                      width={station.name.length * 5.5 + 8} height={16}
                      rx="3" fill="rgba(4,13,26,0.92)"
                      stroke="rgba(34,211,238,0.3)" strokeWidth="0.5"
                    />
                    <text
                      x={station.x + 14} y={station.y + 1}
                      fontSize="8" fill={isHighlighted ? '#22d3ee' : '#e2eaf5'}
                      fontFamily="JetBrains Mono"
                    >
                      {station.name}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Yamuna River */}
          <path
            d="M 490 50 Q 510 150 505 280 Q 500 380 510 500"
            fill="none" stroke="rgba(34,211,238,0.12)" strokeWidth="8"
            strokeLinecap="round"
          />
          <text x="515" y="280" fontSize="8" fill="rgba(34,211,238,0.25)" fontFamily="JetBrains Mono">Yamuna</text>
        </svg>

        {/* Hover tooltip */}
        {hoveredStation && (
          <div
            className="absolute bottom-3 left-3 px-3 py-2 rounded-lg text-xs font-mono pointer-events-none"
            style={{ background: 'rgba(4,13,26,0.95)', border: '1px solid rgba(34,211,238,0.3)', color: '#22d3ee' }}
          >
            {INTERCHANGES.find((s) => s.id === hoveredStation)?.name}
          </div>
        )}
      </div>
    </div>
  );
}
