import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, ChevronLeft, ChevronRight, X, MapPin, Users, DollarSign, Calendar, Building2, TrendingUp, ExternalLink } from 'lucide-react';
import type { LocationResult } from '../../services/api';

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
    <motion.aside
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
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        )}
      </button>

      <AnimatePresence mode="wait">
        {!isCollapsed ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-4 p-4 overflow-y-auto"
          >
            {/* Header */}
            <div>
              <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Demographic Layers
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Select a heatmap overlay</p>
            </div>

            {/* Radio selectors */}
            <div className="space-y-1">
              {LAYERS.map(({ key, label }) => (
                <label
                  key={key}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    colorMode === key
                      ? 'bg-amber-50 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/30'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700 border border-transparent'
                  }`}
                >
                  <input
                    type="radio"
                    name="layer"
                    value={key}
                    checked={colorMode === key}
                    onChange={() => setColorMode(key)}
                    className="accent-amber-500 w-3.5 h-3.5"
                  />
                  <span className={`text-sm ${colorMode === key ? 'text-amber-700 dark:text-amber-400 font-medium' : 'text-slate-600 dark:text-slate-300'}`}>
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
                    <MapPin size={12} className="text-amber-500" />
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
          </motion.div>
        ) : (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-4 gap-3"
          >
            <Layers className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
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
    lat: 40.5 + (location.y / 100) * 0.4,
    lng: -74.3 + (location.x / 100) * 0.6,
  };
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;

  return (
    <motion.div
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
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto"
          >
            {/* Header */}
            <div className="relative h-52 bg-gradient-to-br from-amber-500/20 to-amber-600/20 dark:from-amber-500/10 dark:to-amber-600/10 flex-none flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-amber-500 mx-auto mb-2" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{location.name}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Location Analysis</p>
              </div>
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-700/90 backdrop-blur-sm flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 transition-colors shadow-sm"
              >
                <X size={16} className="text-slate-700 dark:text-slate-300" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Score */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-500/10 dark:to-amber-600/10 rounded-xl p-4 border border-amber-200 dark:border-amber-500/30">
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Vantage Score</p>
                  <p className="text-4xl font-black text-amber-600 dark:text-amber-400">{location.score}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Status: {location.status}</p>
                </div>
              </div>

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
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30 text-sm font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/30 transition-colors"
                >
                  <ExternalLink size={13} /> View on Google Maps
                </a>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-full"
          >
            <MapPin className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
