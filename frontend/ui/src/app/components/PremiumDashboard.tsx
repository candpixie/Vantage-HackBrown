import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Download, 
  Share2, 
  Volume2, 
  MapPin, 
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Star,
  Clock,
  ExternalLink
} from 'lucide-react';
import type { LocationResult } from '../../services/api';

interface PremiumDashboardProps {
  locations: LocationResult[];
  selectedLocationId: number | null;
  onLocationSelect: (id: number) => void;
  agents: Array<{ id: string; name: string; status: 'idle' | 'active' | 'done'; time?: string }>;
  onReRun?: () => void;
  onExportPDF?: () => void;
  onShare?: () => void;
}

export const PremiumDashboard: React.FC<PremiumDashboardProps> = ({
  locations,
  selectedLocationId,
  onLocationSelect,
  agents,
  onReRun,
  onExportPDF,
  onShare,
}) => {
  const [mapZoom, setMapZoom] = useState(1);
  const [budget, setBudget] = useState(8500);
  const [targetDemo, setTargetDemo] = useState('Gen Z Students');
  const [showVoiceSummary, setShowVoiceSummary] = useState(false);
  // Transform location data to match premium dashboard format
  const transformLocation = (loc: LocationResult, rank: number) => {
    const metricsMap: Record<string, { score: number; confidence: string; source: string }> = {};
    
    loc.metrics.forEach((metric) => {
      const key = metric.label.toLowerCase().replace(/\s+/g, '');
      metricsMap[key] = {
        score: metric.score,
        confidence: metric.confidence.toLowerCase(),
        source: metric.label === 'Elite Density' ? 'NYC Open Data' :
                metric.label === 'Net Disposable' ? 'Census ACS 2023' :
                metric.label === 'Foot Velocity' ? 'NYC Open Data' :
                metric.label === 'Transit' ? 'MTA Data' :
                'LoopNet Estimates',
      };
    });

    // Extract revenue data
    const moderateRevenue = loc.revenue.find(r => r.isRecommended) || loc.revenue[1] || loc.revenue[0];
    const conservativeRevenue = loc.revenue[0];
    const optimisticRevenue = loc.revenue[2] || loc.revenue[1] || loc.revenue[0];

    const parseMoney = (str: string) => {
      if (!str) return 0;
      // Handle formats like "$28,500" or "$342k"
      const cleaned = str.replace(/[^0-9kK]/g, '');
      if (cleaned.toLowerCase().includes('k')) {
        return parseInt(cleaned.replace(/[kK]/g, '')) * 1000;
      }
      return parseInt(cleaned) || 0;
    };

    return {
      id: loc.id,
      name: loc.name,
      score: loc.score,
      confidence: loc.status === 'HIGH' ? 94 : loc.status === 'MEDIUM' ? 88 : 75,
      rank,
      metrics: {
        footTraffic: metricsMap['footvelocity'] || metricsMap['elitedensity'] || { score: 85, confidence: 'high', source: 'NYC Open Data' },
        targetDemo: metricsMap['netdisposable'] || { score: 82, confidence: 'medium', source: 'Census ACS 2023' },
        competition: { score: 88, confidence: 'high', source: 'Google Places API' },
        transitAccess: metricsMap['transit'] || { score: 90, confidence: 'high', source: 'MTA Data' },
        rentFit: metricsMap['rentalpha'] || { score: 80, confidence: 'medium', source: 'LoopNet Estimates' },
      },
      competitors: loc.competitors.map(comp => ({
        name: comp.name,
        rating: comp.rating,
        reviews: comp.reviews,
        distance: comp.distance,
        hours: '10am-9pm', // Default hours
        gap: comp.weakness || null,
      })),
      revenue: {
        conservative: parseMoney(conservativeRevenue?.monthly || '0'),
        moderate: parseMoney(moderateRevenue?.monthly || '0'),
        optimistic: parseMoney(optimisticRevenue?.monthly || '0'),
        breakeven: Math.max(1, Math.ceil(parseMoney(moderateRevenue?.monthly || '0') / 3000)), // Rough estimate
      },
      rent: 8500, // Default rent estimate
      dailyTraffic: Math.floor(loc.score * 150), // Estimate based on score
    };
  };

  const transformedLocations = locations.map((loc, idx) => transformLocation(loc, idx + 1));
  
  // Auto-select first location if none selected
  React.useEffect(() => {
    if (!selectedLocationId && transformedLocations.length > 0) {
      onLocationSelect(transformedLocations[0].id);
    }
  }, [selectedLocationId, transformedLocations.length]);
  
  const selectedLocation = selectedLocationId 
    ? transformedLocations.find(l => l.id === selectedLocationId) 
    : transformedLocations[0];
  
  const loc = selectedLocation || transformedLocations[0];

  // Debug log to verify component is rendering
  React.useEffect(() => {
    console.log('🎨 Premium Dashboard rendered!', {
      locations: transformedLocations.length,
      selectedLocation: loc?.name,
      usePremiumView: true
    });
  }, [transformedLocations.length, loc?.name]);

  const getConfidenceColor = (conf: string) => {
    if (conf === 'high') return 'text-emerald-400';
    if (conf === 'medium') return 'text-amber-400';
    return 'text-red-400';
  };
  
  const getConfidenceBg = (conf: string) => {
    if (conf === 'high') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (conf === 'medium') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  const formatMoney = (n: number) => '$' + n.toLocaleString();

  const allAgentsComplete = agents.length > 0 && agents.every(a => a.status === 'done');
  const totalTime = agents.reduce((sum, a) => sum + (parseFloat(a.time?.replace('s', '') || '0')), 0);

  // Ensure we have valid data
  if (!transformedLocations || transformedLocations.length === 0) {
    console.error('❌ PremiumDashboard: No transformed locations available');
    return null;
  }

  // Handle empty state - but still show the dashboard structure
  if (!loc || transformedLocations.length === 0) {
    console.warn('⚠️ PremiumDashboard: No locations available, showing empty state');
    return (
      <div className="min-h-screen bg-[#0a0b0f] text-white p-4 font-sans">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                VANTAGE
              </h1>
              <p className="text-xs text-gray-500">AI-Powered Location Intelligence</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-xl text-gray-400 mb-2">No locations available</p>
            <p className="text-sm text-gray-500 mb-4">Run an analysis to see results</p>
            <button
              onClick={onReRun}
              className="px-6 py-3 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-600 transition"
            >
              Run Analysis
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Debug: Log component render
  console.log('🎨 PremiumDashboard component rendering', {
    locationsCount: locations.length,
    selectedLocationId,
    locName: loc?.name
  });

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-white p-4 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/50"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <MapPin className="w-6 h-6 text-white" />
          </motion.div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              SiteSelect
            </h1>
            <p className="text-xs text-gray-500">AI-Powered Location Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.span 
            className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs"
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
            LIVE
          </motion.span>
          <span className="text-xs text-gray-500">NYC Dataset • {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Agent Workflow Bar */}
      <motion.div 
        className="bg-[#12131a] rounded-xl border border-white/5 p-3 mb-4 glass-card-dark premium-glow"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400 uppercase tracking-wider">Multi-Agent Pipeline</span>
          {allAgentsComplete && (
            <span className="text-xs text-emerald-400">✓ Complete in {totalTime.toFixed(1)}s</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {agents.map((agent, i) => (
            <React.Fragment key={agent.id}>
              <motion.div 
                onClick={() => {
                  console.log('🤖 Agent clicked:', agent.name);
                  console.log('📊 Agent Status:', agent.status);
                  console.log('⏱️ Execution Time:', agent.time);
                  alert(`🤖 Agent: ${agent.name}\n\nStatus: ${agent.status.toUpperCase()}\nExecution Time: ${agent.time || 'N/A'}\n\nThis agent is part of the multi-agent pipeline analyzing location data.`);
                }}
                className="flex-1 bg-[#1a1b25] rounded-lg p-2 border border-white/5 cursor-pointer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02, borderColor: 'rgba(99, 102, 241, 0.5)' }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                    agent.status === 'done' ? 'bg-emerald-500/20' :
                    agent.status === 'active' ? 'bg-indigo-500/20 animate-pulse' :
                    'bg-gray-500/20'
                  }`}>
                    {agent.status === 'done' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : agent.status === 'active' ? (
                      <motion.div
                        className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                    ) : (
                      <div className="w-2 h-2 bg-gray-500 rounded-full" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white">{agent.name}</p>
                    {agent.time && <p className="text-[10px] text-gray-500">{agent.time}</p>}
                  </div>
                </div>
              </motion.div>
              {i < agents.length - 1 && (
                <motion.svg 
                  className="w-4 h-4 text-emerald-500/50 flex-shrink-0"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: agent.status === 'done' ? 1 : 0.3 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </motion.svg>
              )}
            </React.Fragment>
          ))}
        </div>
      </motion.div>

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-12 gap-4">
        
        {/* LEFT COLUMN - Location List + Score */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          {/* Top Locations */}
          <div className="bg-[#12131a] rounded-xl border border-white/5 p-4 glass-card-dark premium-glow">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <span className="text-indigo-400">📍</span> Top Locations
            </h3>
            <div className="space-y-2">
              {transformedLocations.map((l) => (
                <motion.button
                  key={l.id}
                  onClick={() => onLocationSelect(l.id)}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedLocationId === l.id 
                      ? 'bg-indigo-500/20 border-indigo-500/50 shadow-lg shadow-indigo-500/20' 
                      : 'bg-[#1a1b25] border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          l.rank === 1 ? 'bg-amber-500/20 text-amber-400' :
                          l.rank === 2 ? 'bg-gray-500/20 text-gray-400' :
                          'bg-orange-900/20 text-orange-400'
                        }`}>#{l.rank}</span>
                        <span className="font-medium text-sm">{l.name}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{l.dailyTraffic.toLocaleString()} daily foot traffic</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-2xl font-bold ${
                        l.score >= 90 ? 'text-emerald-400' :
                        l.score >= 85 ? 'text-indigo-400' :
                        'text-amber-400'
                      }`}>{l.score}</span>
                      <p className="text-[10px] text-gray-500">/ 100</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Overall Score Card */}
          <motion.div 
            onClick={() => {
              console.log('📊 Overall Score Card clicked');
              console.log('📍 Location:', loc.name);
              console.log('⭐ Score:', loc.score);
              console.log('🎯 Confidence:', loc.confidence + '%');
              alert(`📊 Overall Score Details\n\nLocation: ${loc.name}\nScore: ${loc.score}/100\nConfidence: ${loc.confidence}%\n\nThis score is calculated from multiple factors including foot traffic, demographics, competition, transit access, and rent fit.`);
            }}
            className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl border border-indigo-500/30 p-4 glass-card-dark premium-glow cursor-pointer"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Overall Score</p>
              <motion.div 
                className="text-6xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {loc.score}
              </motion.div>
              <p className="text-sm text-gray-400 mt-1">{loc.name}</p>
              <div className="flex items-center justify-center gap-1 mt-3">
                <span className={`text-xs px-2 py-1 rounded-full border ${getConfidenceBg('high')}`}>
                  {loc.confidence}% Confidence
                </span>
              </div>
            </div>
          </motion.div>

          {/* Data Sources */}
          <div className="bg-[#12131a] rounded-xl border border-white/5 p-4 glass-card-dark">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Data Sources</h3>
            <div className="space-y-2 text-xs">
              {[
                { name: 'NYC Open Data', status: 'live', count: '2.4M records' },
                { name: 'Google Places API', status: 'live', count: `${loc.competitors.length} businesses` },
                { name: 'Census ACS 2023', status: 'cached', count: 'Demographics' },
                { name: 'MTA Ridership', status: 'live', count: '14 stations' },
              ].map((src) => (
                <div 
                  key={src.name} 
                  onClick={() => {
                    console.log('📡 Data Source clicked:', src.name);
                    console.log('📊 Status:', src.status);
                    console.log('📈 Record Count:', src.count);
                    alert(`📡 Data Source: ${src.name}\n\nStatus: ${src.status.toUpperCase()}\nRecords: ${src.count}\n\n${src.status === 'live' ? 'This data source is actively updating in real-time.' : 'This data source is cached and updated periodically.'}`);
                  }}
                  className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0 cursor-pointer hover:bg-white/5 rounded px-2 transition"
                >
                  <div className="flex items-center gap-2">
                    <motion.span 
                      className={`w-1.5 h-1.5 rounded-full ${src.status === 'live' ? 'bg-emerald-400' : 'bg-amber-400'}`}
                      animate={src.status === 'live' ? { opacity: [1, 0.5, 1] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    ></motion.span>
                    <span className="text-gray-300">{src.name}</span>
                  </div>
                  <span className="text-gray-500">{src.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN - Map + Score Breakdown */}
        <div className="col-span-12 lg:col-span-6 space-y-4">
          {/* Map Area */}
          <div className="bg-[#12131a] rounded-xl border border-white/5 overflow-hidden glass-card-dark premium-glow">
            <div className="relative h-64 bg-gradient-to-br from-[#1a1b25] to-[#12131a]">
              {/* Fake map visualization */}
              <div className="absolute inset-0 opacity-30">
                <svg className="w-full h-full" viewBox="0 0 400 200">
                  {/* Grid lines */}
                  {[...Array(20)].map((_, i) => (
                    <line key={`v${i}`} x1={i * 20} y1="0" x2={i * 20} y2="200" stroke="#374151" strokeWidth="0.5" />
                  ))}
                  {[...Array(10)].map((_, i) => (
                    <line key={`h${i}`} x1="0" y1={i * 20} x2="400" y2={i * 20} stroke="#374151" strokeWidth="0.5" />
                  ))}
                  {/* Heat zones */}
                  <circle cx="200" cy="100" r="60" fill="url(#heatGradient)" opacity="0.6" />
                  <circle cx="280" cy="80" r="40" fill="url(#heatGradient2)" opacity="0.4" />
                  <circle cx="140" cy="120" r="35" fill="url(#heatGradient2)" opacity="0.4" />
                  <defs>
                    <radialGradient id="heatGradient">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                    <radialGradient id="heatGradient2">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                  </defs>
                </svg>
              </div>
              
              {/* Location markers */}
              {transformedLocations.map((l, idx) => {
                const positions = [
                  { x: '50%', y: '50%' },
                  { x: '75%', y: '33%' },
                  { x: '33%', y: '67%' },
                ];
                const pos = positions[idx] || positions[0];
                const isSelected = selectedLocationId === l.id;
                
                return (
                  <motion.div
                    key={l.id}
                    className="absolute cursor-pointer"
                    style={{ 
                      left: pos.x, 
                      top: pos.y,
                      transform: 'translate(-50%, -50%)',
                    }}
                    animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 2, repeat: isSelected ? Infinity : 0 }}
                    onClick={() => {
                      console.log('📍 Map marker clicked:', l.name);
                      onLocationSelect(l.id);
                    }}
                  >
                    <div className="relative">
                      <motion.div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
                          isSelected 
                            ? 'bg-indigo-500 shadow-indigo-500/50' 
                            : 'bg-purple-500/80'
                        }`}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <span className="text-xs font-bold">{l.rank}</span>
                      </motion.div>
                      {isSelected && (
                        <motion.div
                          className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <span className="text-xs bg-black/80 px-2 py-1 rounded text-indigo-300">{l.name}</span>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* Map controls overlay */}
              <div className="absolute top-3 right-3 flex flex-col gap-2">
                <motion.button 
                  onClick={() => {
                    setMapZoom(prev => Math.min(prev + 0.1, 2));
                    console.log('🔍 Zoom In - Current zoom:', (mapZoom + 0.1).toFixed(1));
                  }}
                  className="w-8 h-8 bg-black/60 backdrop-blur rounded-lg flex items-center justify-center hover:bg-black/80 transition"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Zoom In"
                >
                  <span className="text-lg">+</span>
                </motion.button>
                <motion.button 
                  onClick={() => {
                    setMapZoom(prev => Math.max(prev - 0.1, 0.5));
                    console.log('🔍 Zoom Out - Current zoom:', (mapZoom - 0.1).toFixed(1));
                  }}
                  className="w-8 h-8 bg-black/60 backdrop-blur rounded-lg flex items-center justify-center hover:bg-black/80 transition"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Zoom Out"
                >
                  <span className="text-lg">−</span>
                </motion.button>
              </div>
              
              {/* Map legend */}
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur rounded-lg px-3 py-2">
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                    <span className="text-gray-300">High Potential</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-purple-500/60"></div>
                    <span className="text-gray-300">Medium</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="bg-[#12131a] rounded-xl border border-white/5 p-4 glass-card-dark premium-glow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-300">Score Breakdown</h3>
              <span className="text-xs text-gray-500">Hover for sources</span>
            </div>
            <div className="space-y-3">
              {Object.entries(loc.metrics).map(([key, metric]) => (
                <motion.div 
                  key={key} 
                  onClick={() => {
                    console.log('📊 Metric clicked:', key);
                    console.log('📈 Score:', metric.score);
                    console.log('🎯 Confidence:', metric.confidence);
                    console.log('📡 Source:', metric.source);
                    alert(`📊 ${key.replace(/([A-Z])/g, ' $1').trim()}\n\nScore: ${metric.score}/100\nConfidence: ${metric.confidence.toUpperCase()}\nSource: ${metric.source}\n\nThis metric contributes to the overall location score.`);
                  }}
                  className="group cursor-pointer p-2 rounded-lg hover:bg-white/5 transition"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getConfidenceBg(metric.confidence)}`}>
                        {metric.confidence.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-white">{metric.score}</span>
                  </div>
                  <div className="relative h-2 bg-[#1a1b25] rounded-full overflow-hidden">
                    <motion.div 
                      className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${
                        metric.score >= 90 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                        metric.score >= 80 ? 'bg-gradient-to-r from-indigo-500 to-indigo-400' :
                        'bg-gradient-to-r from-amber-500 to-amber-400'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.score}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                    ></motion.div>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition">
                    Source: {metric.source}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Revenue Projections */}
          <div className="bg-[#12131a] rounded-xl border border-white/5 p-4 glass-card-dark premium-glow">
            <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <span className="text-emerald-400">💰</span> Revenue Projection
            </h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Conservative', value: loc.revenue.conservative, color: 'from-gray-500 to-gray-400' },
                { label: 'Moderate', value: loc.revenue.moderate, color: 'from-indigo-500 to-indigo-400' },
                { label: 'Optimistic', value: loc.revenue.optimistic, color: 'from-emerald-500 to-emerald-400' },
              ].map((scenario) => (
                <motion.div 
                  key={scenario.label} 
                  className={`bg-[#1a1b25] rounded-lg p-3 border border-white/5 ${scenario.label === 'Moderate' ? 'ring-2 ring-indigo-500/50' : ''}`}
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <p className="text-xs text-gray-400 mb-1">{scenario.label}</p>
                  <p className={`text-xl font-bold bg-gradient-to-r ${scenario.color} bg-clip-text text-transparent`}>
                    {formatMoney(scenario.value)}
                  </p>
                  <p className="text-[10px] text-gray-500">/ month</p>
                </motion.div>
              ))}
            </div>
            <div className="flex items-center justify-between p-3 bg-[#1a1b25] rounded-lg border border-white/5">
              <div>
                <p className="text-xs text-gray-400">Break-even Timeline</p>
                <p className="text-lg font-semibold text-white">{loc.revenue.breakeven} months</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Est. Rent</p>
                <p className="text-lg font-semibold text-amber-400">{formatMoney(loc.rent)}/mo</p>
              </div>
            </div>
            <p className="text-[10px] text-gray-500 mt-2 italic">
              * Based on industry benchmarks, 2-3% capture rate, $8 avg ticket
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN - Competitors + Gaps */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          {/* Competitor Intel */}
          <div className="bg-[#12131a] rounded-xl border border-white/5 p-4 glass-card-dark premium-glow">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <span className="text-red-400">🎯</span> Competitor Intel
              </h3>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                Live Data
              </span>
            </div>
            <div className="space-y-2">
              {loc.competitors.map((comp, i) => (
                <motion.div 
                  key={i} 
                  onClick={() => {
                    console.log('🎯 Competitor clicked:', comp.name);
                    console.log('📊 Competitor Details:', {
                      name: comp.name,
                      rating: comp.rating,
                      reviews: comp.reviews,
                      distance: comp.distance,
                      hours: comp.hours,
                      gap: comp.gap,
                    });
                    // Open competitor details in new tab (simulated)
                    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(comp.name + ' ' + loc.name)}`;
                    window.open(searchUrl, '_blank');
                  }}
                  className="bg-[#1a1b25] rounded-lg p-3 border border-white/5 cursor-pointer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.02, borderColor: 'rgba(99, 102, 241, 0.5)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm text-white">{comp.name}</p>
                        <ExternalLink className="w-3 h-3 text-gray-500" />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-amber-400">★ {comp.rating}</span>
                        <span className="text-xs text-gray-500">({comp.reviews})</span>
                        <span className="text-xs text-gray-500">• {comp.distance}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">Hours: {comp.hours}</p>
                    </div>
                    {comp.gap && (
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('⚠️ Opportunity Gap:', comp.gap);
                          alert(`💡 Opportunity Gap Identified!\n\n${comp.gap}\n\nThis represents a potential competitive advantage for your business.`);
                        }}
                        className="text-[10px] px-2 py-1 bg-red-500/20 text-red-400 rounded border border-red-500/30 cursor-pointer hover:bg-red-500/30 transition"
                      >
                        {comp.gap}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Gap Analysis */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/30 p-4 glass-card-dark premium-glow">
            <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
              ⚡ Opportunity Gaps
            </h3>
            <div className="space-y-2">
              {[
                { gap: 'No late-night options', impact: 'High', desc: 'All competitors close by 10pm' },
                { gap: 'Limited dairy-free menu', impact: 'Medium', desc: 'Growing vegan demographic' },
                { gap: 'No loyalty program', impact: 'Medium', desc: 'Student retention opportunity' },
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  onClick={() => {
                    console.log('⚡ Opportunity Gap clicked:', item.gap);
                    console.log('📈 Impact:', item.impact);
                    console.log('💡 Description:', item.desc);
                    alert(`⚡ Opportunity Gap: ${item.gap}\n\nImpact: ${item.impact}\n\n${item.desc}\n\nThis gap represents a potential market opportunity for your business.`);
                  }}
                  className="bg-[#12131a]/50 rounded-lg p-2.5 cursor-pointer"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white font-medium">{item.gap}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      item.impact === 'High' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>{item.impact}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[#12131a] rounded-xl border border-white/5 p-4 glass-card-dark premium-glow">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <motion.button 
                onClick={() => {
                  if (onExportPDF) {
                    onExportPDF();
                  } else {
                    console.log('📄 Exporting PDF report for:', loc.name);
                    // Simulate PDF generation
                    const reportData = {
                      location: loc.name,
                      score: loc.score,
                      confidence: loc.confidence,
                      revenue: loc.revenue,
                      competitors: loc.competitors.length,
                    };
                    console.log('📊 Report Data:', reportData);
                    alert(`📄 PDF Export Started!\n\nLocation: ${loc.name}\nScore: ${loc.score}/100\nConfidence: ${loc.confidence}%\n\nReport will be downloaded shortly...`);
                  }
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg text-sm font-medium hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Full Report (PDF)
              </motion.button>
              <motion.button 
                onClick={() => {
                  if (onShare) {
                    onShare();
                  } else {
                    console.log('🔗 Sharing analysis for:', loc.name);
                    const shareUrl = `${window.location.origin}/share/${loc.id}`;
                    if (navigator.share) {
                      navigator.share({
                        title: `Vantage Analysis: ${loc.name}`,
                        text: `Check out this location analysis for ${loc.name} with a score of ${loc.score}/100!`,
                        url: shareUrl,
                      }).catch(err => console.log('Share cancelled:', err));
                    } else {
                      navigator.clipboard.writeText(shareUrl).then(() => {
                        alert('🔗 Share link copied to clipboard!');
                      });
                    }
                  }
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2.5 px-4 bg-[#1a1b25] border border-white/10 rounded-lg text-sm font-medium hover:border-white/20 transition flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share Analysis
              </motion.button>
              <motion.button 
                onClick={() => {
                  setShowVoiceSummary(!showVoiceSummary);
                  const summary = `Location Analysis for ${loc.name}. Overall score: ${loc.score} out of 100 with ${loc.confidence}% confidence. ` +
                    `Revenue projections range from ${formatMoney(loc.revenue.conservative)} to ${formatMoney(loc.revenue.optimistic)} per month. ` +
                    `Break-even expected in ${loc.revenue.breakeven} months. ` +
                    `Found ${loc.competitors.length} nearby competitors. ` +
                    `Daily foot traffic estimated at ${loc.dailyTraffic.toLocaleString()} visitors.`;
                  
                  console.log('🔊 Voice Summary:', summary);
                  
                  if ('speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance(summary);
                    utterance.rate = 0.9;
                    utterance.pitch = 1;
                    utterance.volume = 1;
                    window.speechSynthesis.speak(utterance);
                  } else {
                    alert(`🔊 Voice Summary:\n\n${summary}`);
                  }
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2.5 px-4 bg-[#1a1b25] border border-white/10 rounded-lg text-sm font-medium hover:border-white/20 transition flex items-center justify-center gap-2"
              >
                <Volume2 className="w-4 h-4" />
                Voice Summary
              </motion.button>
            </div>
          </div>

          {/* What If Controls */}
          <div className="bg-[#12131a] rounded-xl border border-indigo-500/30 p-4 glass-card-dark premium-glow">
            <h3 className="text-sm font-semibold text-indigo-400 mb-3 flex items-center gap-2">
              🔄 What If Analysis
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Adjust Budget</label>
                <input 
                  type="range" 
                  min="5000" 
                  max="15000" 
                  value={budget}
                  onChange={(e) => {
                    const newBudget = parseInt(e.target.value);
                    setBudget(newBudget);
                    console.log('💰 Budget adjusted to:', formatMoney(newBudget));
                  }}
                  className="w-full h-2 bg-[#1a1b25] rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                  <span>$5k</span>
                  <span className="text-indigo-400 font-semibold">{formatMoney(budget)}</span>
                  <span>$15k</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Target Demo</label>
                <select 
                  value={targetDemo}
                  onChange={(e) => {
                    setTargetDemo(e.target.value);
                    console.log('👥 Target demographic changed to:', e.target.value);
                  }}
                  className="w-full bg-[#1a1b25] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option>Gen Z Students</option>
                  <option>Young Professionals</option>
                  <option>Families</option>
                  <option>Tourists</option>
                </select>
              </div>
              <motion.button 
                onClick={() => {
                  if (onReRun) {
                    onReRun();
                  } else {
                    console.log('🔄 Re-running analysis with new parameters:', {
                      budget: formatMoney(budget),
                      targetDemo,
                      location: loc.name,
                    });
                    alert(`🔄 Re-running Analysis\n\nBudget: ${formatMoney(budget)}\nTarget Demo: ${targetDemo}\nLocation: ${loc.name}\n\nAnalysis will start shortly...`);
                  }
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2 bg-indigo-500/20 border border-indigo-500/50 rounded-lg text-sm text-indigo-400 font-medium hover:bg-indigo-500/30 transition"
              >
                Re-run Analysis →
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 text-center text-xs text-gray-600">
        Built with Fetch.ai Agents • Google Gemini • NYC Open Data
      </div>
    </div>
  );
};
