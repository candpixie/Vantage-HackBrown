import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, ChevronLeft, ChevronRight, X, MapPin, DollarSign, TrendingUp, ExternalLink } from 'lucide-react';
import type { LocationResult } from '../../services/api';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const MotionDiv = motion.div as any;
const MotionAside = motion.aside as any;

const LAYERS = [
  { key: 'none', label: 'None' },
  { key: 'population', label: 'Population Density', legend: { stops: ['#ffffb2', '#fecc5c', '#fd8d3c', '#f03b20', '#bd0026'], labels: ['Low', 'High'] } },
  { key: 'age', label: 'Median Age', legend: { stops: ['#feebC3', '#fdae6b', '#f46d43', '#d7301f', '#99004b'], labels: ['Younger', 'Older'] } },
  { key: 'income', label: 'Median Income', legend: { stops: ['#edf8e9', '#bae4b3', '#74c476', '#238b45', '#005a32'], labels: ['Low', 'High'] } },
];

interface MapSidebarProps {
  colorMode: string;
  setColorMode: (mode: string) => void;
  isCollapsed: boolean;
  onToggle: () => void;
  hoveredNeighborhood?: any;
}

export const MapSidebar: React.FC<MapSidebarProps> = ({
  colorMode,
  setColorMode,
  isCollapsed,
  onToggle,
  hoveredNeighborhood
}) => {
  const activeLegend = LAYERS.find((l) => l.key === colorMode)?.legend;

  return (
    <MotionAside
      initial={false}
      animate={{ width: isCollapsed ? 60 : 280 }}
      className="flex flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 overflow-hidden relative z-10"
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute top-4 right-2 z-20 p-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4 text-slate-600 dark:text-slate-300"
          aria-hidden="true"
        >
          <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
          <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" />
          <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" />
        </svg>
      </button>

      <AnimatePresence mode="wait">
        {!isCollapsed ? (
          <MotionDiv
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-4 p-4 overflow-y-auto"
          >
            {/* Header */}
            <div>
              <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                  aria-hidden="true"
                >
                  <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
                  <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" />
                  <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" />
                </svg>
                Demographic Layers
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Select a heatmap overlay</p>
            </div>

            {/* Radio selectors */}
            <div className="space-y-1">
              {LAYERS.map(({ key, label }) => (
                <label
                  key={key}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors ${colorMode === key
                    ? 'bg-teal-50 dark:bg-teal-500/20 border border-teal-300 dark:border-teal-500/30'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700 border border-transparent'
                    }`}
                >
                  <input
                    type="radio"
                    name="layer"
                    value={key}
                    checked={colorMode === key}
                    onChange={() => setColorMode(key)}
                    className="accent-teal-500 w-3.5 h-3.5"
                  />
                  <span className={`text-sm ${colorMode === key ? 'text-teal-700 dark:text-teal-400 font-medium' : 'text-slate-600 dark:text-slate-300'}`}>
                    {label}
                  </span>
                </label>
              ))}
            </div>

            {/* Legend */}
            {activeLegend && (
              <div className="px-1">
                <div
                  className="h-2.5 rounded-full"
                  style={{
                    background: `linear-gradient(to right, ${activeLegend.stops.join(', ')})`,
                  }}
                />
                <div className="flex justify-between mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                  <span>{activeLegend.labels[0]}</span>
                  <span>{activeLegend.labels[1]}</span>
                </div>
              </div>
            )}

            {/* Hover info */}
            {hoveredNeighborhood && (
              <>
                <hr className="border-slate-200 dark:border-slate-700" />
                <div className="rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 px-3 py-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <MapPin size={12} className="text-teal-500" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {hoveredNeighborhood.ntaname || hoveredNeighborhood.name}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                    {hoveredNeighborhood.population > 0 && (
                      <span>Pop: {hoveredNeighborhood.population.toLocaleString()}</span>
                    )}
                    {hoveredNeighborhood.medianAge > 0 && (
                      <span>Age: {hoveredNeighborhood.medianAge}</span>
                    )}
                    {hoveredNeighborhood.income > 0 && (
                      <span>Income: ${hoveredNeighborhood.income.toLocaleString()}</span>
                    )}
                    {hoveredNeighborhood.boroname && (
                      <span className="text-slate-400 dark:text-slate-500">{hoveredNeighborhood.boroname}</span>
                    )}
                  </div>
                </div>
              </>
            )}
          </MotionDiv>
        ) : (
          <MotionDiv
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-4 gap-3"
          >
            <Layers className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          </MotionDiv>
        )}
      </AnimatePresence>
    </MotionAside>
  );
};

interface MapDetailPanelProps {
  location: LocationResult | null;
  isCollapsed: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export const MapDetailPanel: React.FC<MapDetailPanelProps> = ({
  location,
  isCollapsed,
  onToggle,
  onClose
}) => {
  if (!location) return null;

  const coords = {
    lat: location.lat || (40.5 + (location.y / 100) * 0.4),
    lng: location.lng || (-74.3 + (location.x / 100) * 0.6),
  };
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;

  return (
    <MotionDiv
      initial={false}
      animate={{ width: isCollapsed ? 60 : 380 }}
      className="absolute top-0 right-0 bottom-0 bg-white dark:bg-slate-800 z-20 flex flex-col overflow-hidden rounded-l-xl border-l border-slate-200 dark:border-slate-700 shadow-xl"
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute top-4 left-2 z-20 p-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm"
        aria-label={isCollapsed ? 'Expand panel' : 'Collapse panel'}
      >
        {isCollapsed ? (
          <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        )}
      </button>

      <AnimatePresence mode="wait">
        {!isCollapsed ? (
          <MotionDiv
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto"
          >
            {/* Header with Google Street View */}
            <div className="relative h-52 flex-none overflow-hidden">
              <img
                src={`https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${coords.lat},${coords.lng}&fov=90&pitch=10&key=${GOOGLE_MAPS_API_KEY}`}
                alt={`Street view of ${location.name}`}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  // Hide broken image and show fallback
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              {/* Overlay gradient for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-12">
                <h2 className="text-lg font-bold text-white drop-shadow-lg">{location.name}</h2>
                <p className="text-sm text-white/80 drop-shadow">Street View</p>
              </div>
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors"
              >
                <X size={16} className="text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Score */}
              <div className="bg-gradient-to-br from-teal-50 to-emerald-100/50 dark:from-teal-500/10 dark:to-emerald-600/10 rounded-xl p-4 border border-teal-200 dark:border-teal-500/30">
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Vantage Score</p>
                  <p className="text-4xl font-black text-teal-600 dark:text-teal-400">{location.score}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Status: {location.status}</p>
                </div>
              </div>

              {/* Rent & Property Details */}
              {(location.rent_price || location.address) && (
                <div className="rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 px-3 py-2.5 space-y-1.5">
                  {location.rent_price && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1"><DollarSign size={10} />Rent</span>
                      <span className="text-sm font-bold text-teal-600 dark:text-teal-400">${location.rent_price.toLocaleString()}/mo</span>
                    </div>
                  )}
                  {location.sqft && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Size</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{location.sqft.toLocaleString()} sqft</span>
                    </div>
                  )}
                  {location.bedrooms && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Layout</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{location.bedrooms}BR / {location.bathrooms || 1}BA</span>
                    </div>
                  )}
                  {location.propertyType && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Type</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{location.propertyType}</span>
                    </div>
                  )}
                  {location.address && (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-600 truncate">{location.address}</p>
                  )}
                </div>
              )}

              {/* Metrics */}
              {location.metrics && location.metrics.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <TrendingUp size={12} /> Metrics
                  </h3>
                  <div className="space-y-2">
                    {location.metrics.map((metric, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">{metric.label}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{metric.score}/100</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Revenue */}
              {location.revenue && location.revenue.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <DollarSign size={12} /> Revenue Projections
                  </h3>
                  <div className="space-y-2">
                    {location.revenue.map((rev, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">{rev.scenario}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{rev.monthly}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <MapPin size={12} /> Location
                </h3>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                </div>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-50 dark:bg-teal-500/20 border border-teal-200 dark:border-teal-500/30 text-sm font-medium text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-500/30 transition-colors"
                >
                  <ExternalLink size={13} /> View on Google Maps
                </a>
              </div>
            </div>
          </MotionDiv>
        ) : (
          <MotionDiv
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-full"
          >
            <MapPin className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          </MotionDiv>
        )}
      </AnimatePresence>
    </MotionDiv>
  );
};
