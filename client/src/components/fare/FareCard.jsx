import { Ticket, CreditCard, RefreshCw, TrendingDown } from 'lucide-react';

export default function FareCard({ fare }) {
  if (!fare) return null;

  return (
    <div
      className="rounded-xl p-4 mt-4"
      style={{ background: 'rgba(45,198,83,0.06)', border: '1px solid rgba(45,198,83,0.2)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Ticket size={14} style={{ color: '#2dc653' }} />
        <span className="text-xs font-mono uppercase tracking-widest" style={{ color: '#2dc653' }}>
          Fare Estimate
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Token */}
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(45,198,83,0.12)' }}
          >
            <Ticket size={13} style={{ color: '#2dc653' }} />
          </div>
          <div>
            <div className="text-xs" style={{ color: '#3d618a' }}>Token</div>
            <div className="font-mono font-bold text-sm" style={{ color: '#e2eaf5' }}>
              ₹{fare.token}
            </div>
          </div>
        </div>

        {/* Smart Card */}
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(34,211,238,0.12)' }}
          >
            <CreditCard size={13} style={{ color: '#22d3ee' }} />
          </div>
          <div>
            <div className="text-xs" style={{ color: '#3d618a' }}>Smart Card</div>
            <div className="font-mono font-bold text-sm" style={{ color: '#22d3ee' }}>
              ₹{fare.smartCard}
              <span className="text-xs font-normal ml-1" style={{ color: '#2dc653' }}>
                (-10%)
              </span>
            </div>
          </div>
        </div>

        {/* Round Trip */}
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(244,162,97,0.12)' }}
          >
            <RefreshCw size={13} style={{ color: '#f4a261' }} />
          </div>
          <div>
            <div className="text-xs" style={{ color: '#3d618a' }}>Round Trip</div>
            <div className="font-mono font-bold text-sm" style={{ color: '#f4a261' }}>
              ₹{fare.roundTrip}
            </div>
          </div>
        </div>

        {/* Savings */}
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(123,47,190,0.12)' }}
          >
            <TrendingDown size={13} style={{ color: '#c77dff' }} />
          </div>
          <div>
            <div className="text-xs" style={{ color: '#3d618a' }}>Daily Saving</div>
            <div className="font-mono font-bold text-sm" style={{ color: '#c77dff' }}>
              ₹{fare.smartCardSaving * 2}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
