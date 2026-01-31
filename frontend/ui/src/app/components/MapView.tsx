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
    <div className="relative w-full h-[600px] glass-card rounded-3xl overflow-hidden premium-glow">
      {/* Map Background - Providence style */}
      <div className="absolute inset-0 opacity-30">
        <svg width="100%" height="100%" viewBox="0 0 800 600" fill="none" className="text-slate-300">
          {/* Streets */}
          <path d="M0 150L800 150" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M0 300L800 300" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M0 450L800 450" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M200 0L200 600" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M400 0L400 600" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M600 0L600 600" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
          
          {/* Water (Providence has rivers) */}
          <path d="M100 0 Q150 100 100 200 T100 400 T100 600" stroke="#3B82F6" strokeWidth="3" fill="none" opacity="0.2" />
        </svg>
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none" 
        style={{ 
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.05) 1px, transparent 0)', 
          backgroundSize: '24px 24px' 
        }} 
      />

      {/* Markers */}
      {markers.map((marker, index) => {
        const isSelected = selectedId === marker.id;
        const colors = {
          HIGH: { bg: 'bg-[#10B981]', border: 'border-[#10B981]', text: 'text-[#10B981]', glow: 'shadow-[#10B981]/30' },
          MEDIUM: { bg: 'bg-yellow-500', border: 'border-yellow-500', text: 'text-yellow-600', glow: 'shadow-yellow-500/30' },
          LOW: { bg: 'bg-orange-500', border: 'border-orange-500', text: 'text-orange-600', glow: 'shadow-orange-500/30' }
        };
        const color = colors[marker.status];

        return (
          <button
            key={marker.id}
            className="absolute z-20 group -translate-x-1/2 -translate-y-1/2 hover:scale-110 active:scale-95 transition-transform"
            style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
            onClick={() => onMarkerClick(marker.id)}
          >
            <div className="relative">
              {/* Pulse animation */}
              {!isSelected && (
                <div className={`absolute -inset-4 rounded-full ${color.bg} opacity-30 blur-md animate-pulse`} />
              )}
              
              {/* Marker */}
              <div className={`relative px-4 py-2 rounded-xl border-2 flex items-center gap-2 backdrop-blur-sm transition-all ${
                isSelected
                  ? `${color.bg} text-white border-white shadow-2xl ${color.glow} scale-110`
                  : `bg-white ${color.border} ${color.text} shadow-lg hover:shadow-xl`
              }`}>
                <div className={`w-8 h-8 rounded-lg ${isSelected ? 'bg-white/20' : color.bg} flex items-center justify-center text-white font-bold text-sm`}>
                  {index + 1}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-xs font-bold leading-none">{marker.name}</span>
                  <span className="text-[10px] font-medium opacity-80">{marker.score}/100</span>
                </div>
                <MapPin className={`w-4 h-4 ${isSelected ? 'text-white' : color.text}`} />
              </div>
            </div>
          </button>
        );
      })}

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-30">
        <div className="bg-white/95 backdrop-blur-sm border border-[#E5E7EB] px-4 py-2 rounded-lg shadow-lg flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#10B981]" />
            <span className="text-xs font-medium text-slate-700">High Score</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-xs font-medium text-slate-700">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-xs font-medium text-slate-700">Low</span>
          </div>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-30 bg-white/95 backdrop-blur-sm border border-[#E5E7EB] p-2 rounded-lg shadow-lg flex flex-col gap-2">
        <button 
          onClick={() => console.log('Zoom in')}
          className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded transition-colors text-slate-600 font-bold cursor-pointer"
        >
          +
        </button>
        <button 
          onClick={() => console.log('Zoom out')}
          className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded transition-colors text-slate-600 font-bold cursor-pointer"
        >
          −
        </button>
      </div>
    </div>
  );
};
