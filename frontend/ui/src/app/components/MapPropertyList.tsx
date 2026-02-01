import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronUp, ChevronDown, Building2, MapPin, Maximize2, Bed } from 'lucide-react';
import type { LocationResult } from '../../services/api';

interface MapPropertyListProps {
  locations: LocationResult[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

export const MapPropertyList: React.FC<MapPropertyListProps> = ({
  locations,
  selectedId,
  onSelect,
  isCollapsed,
  onToggle,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 280, behavior: 'smooth' });
  };

  const formatPrice = (price?: number) => {
    if (!price) return '—';
    if (price >= 10000) return `$${Math.round(price / 1000)}K`;
    if (price >= 1000) {
      const k = price / 1000;
      return k === Math.floor(k) ? `$${k}K` : `$${k.toFixed(1)}K`;
    }
    return `$${price}`;
  };

  return (
    <motion.section
      initial={false}
      animate={{ height: isCollapsed ? 60 : 200 }}
      className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 relative overflow-hidden"
    >
      {/* Header with Toggle */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Available Locations
        </h2>
        <div className="flex gap-1">
          {!isCollapsed && (
            <>
              <button
                onClick={() => scroll(-1)}
                className="rounded-full p-1 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronUp size={16} />
              </button>
              <button
                onClick={() => scroll(1)}
                className="rounded-full p-1 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronDown size={16} />
              </button>
            </>
          )}
          <button
            onClick={onToggle}
            className="rounded-full p-1 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label={isCollapsed ? 'Expand list' : 'Collapse list'}
          >
            {isCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Scrollable List */}
      {!isCollapsed && (
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto px-4 pb-3 pt-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {locations.length === 0 && (
            <div className="flex-none w-full flex items-center justify-center py-6">
              <p className="text-slate-400 dark:text-slate-500 text-sm">No locations available</p>
            </div>
          )}
          {locations.map((location) => (
            <LocationCard
              key={location.id}
              location={location}
              isSelected={location.id === selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </motion.section>
  );
};

interface LocationCardProps {
  location: LocationResult;
  isSelected: boolean;
  onSelect: (id: number) => void;
}

const LocationCard: React.FC<LocationCardProps> = ({ location, isSelected, onSelect }) => {
  const formatPrice = (price?: number) => {
    if (!price) return '—';
    if (price >= 10000) return `$${Math.round(price / 1000)}K`;
    if (price >= 1000) {
      const k = price / 1000;
      return k === Math.floor(k) ? `$${k}K` : `$${k.toFixed(1)}K`;
    }
    return `$${price}`;
  };

  return (
    <motion.button
      onClick={() => onSelect(location.id)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex-none w-64 rounded-xl overflow-hidden border transition-all text-left ${
        isSelected
          ? 'border-teal-400 dark:border-teal-500 ring-2 ring-teal-200 dark:ring-teal-500/30 shadow-lg shadow-teal-100 dark:shadow-teal-500/20'
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md'
      } bg-white dark:bg-slate-800`}
    >
      <div className="h-24 bg-gradient-to-br from-teal-50 to-emerald-100/50 dark:from-teal-500/10 dark:to-emerald-600/10 relative overflow-hidden flex items-center justify-center">
        <Building2 size={24} className="text-teal-500 dark:text-teal-400" />
        <span className="absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 shadow-sm">
          {location.status}
        </span>
      </div>
      <div className="px-2.5 py-2">
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{location.name}</p>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          {location.rent_price && (
            <span className="text-teal-600 dark:text-teal-400 font-bold">
              {formatPrice(location.rent_price)}/mo
            </span>
          )}
          <span className="font-bold text-slate-700 dark:text-slate-300">Score: {location.score}</span>
        </div>
        <div className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
          <MapPin size={9} />
          <span className="truncate">{location.address || 'Location'}</span>
        </div>
      </div>
    </motion.button>
  );
};
