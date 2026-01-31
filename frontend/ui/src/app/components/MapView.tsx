import React from 'react';
import { motion } from 'motion/react';
import { MapPin } from 'lucide-react';

interface Marker {
  id: number;
  name: string;
  score: number;
  x: number;
  y: number;
  status: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface MapViewProps {
  markers: Marker[];
  onMarkerClick: (id: number) => void;
  selectedId: number | null;
}

export const MapView: React.FC<MapViewProps> = ({ markers, onMarkerClick, selectedId }) => {
  return (
    <div className="relative w-full h-full bg-[#0F0F1A] rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
      {/* Abstract Map Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 800 600" fill="none">
          <path d="M0 100L200 150L400 120L600 180L800 140" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" />
          <path d="M100 0L150 200L120 400L180 600" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" />
          <circle cx="400" cy="300" r="200" stroke="white" strokeWidth="0.2" />
          <circle cx="400" cy="300" r="300" stroke="white" strokeWidth="0.2" />
        </svg>
      </div>
      
      {/* Grid */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '24px 24px' }} />

      {/* Markers */}
      {markers.map((marker) => (
        <motion.button
          key={marker.id}
          className="absolute z-20 group -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
          onClick={() => onMarkerClick(marker.id)}
          whileHover={{ scale: 1.2 }}
        >
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`absolute -inset-4 rounded-full blur-md ${
                marker.status === 'HIGH' ? 'bg-green-500/30' : 
                marker.status === 'MEDIUM' ? 'bg-yellow-500/30' : 'bg-orange-500/30'
              }`}
            />
            
            <div className={`relative px-3 py-1.5 rounded-xl border flex items-center gap-2 backdrop-blur-md transition-all duration-300 ${
              selectedId === marker.id 
                ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.4)]' 
                : `${marker.status === 'HIGH' ? 'bg-green-500/20 border-green-500/30 text-green-400' : 
                   marker.status === 'MEDIUM' ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400' : 
                   'bg-orange-500/20 border-orange-500/30 text-orange-400'}`
            }`}>
              <MapPin className="w-3 h-3" />
              <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] font-black uppercase tracking-tighter">{marker.name}</span>
                <span className="text-[8px] font-bold opacity-70">{marker.score}</span>
              </div>
            </div>
          </div>
        </motion.button>
      ))}

      {/* Map UI */}
      <div className="absolute bottom-6 left-6 z-30">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">Med</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">Low</span>
          </div>
        </div>
      </div>

      <div className="absolute top-6 right-6 z-30 bg-black/60 backdrop-blur-md border border-white/10 p-2 rounded-xl flex flex-col gap-2 text-white/40">
        <div className="w-8 h-8 flex items-center justify-center hover:text-white transition-colors cursor-pointer">+</div>
        <div className="w-8 h-8 flex items-center justify-center hover:text-white transition-colors cursor-pointer">-</div>
      </div>
    </div>
  );
};
