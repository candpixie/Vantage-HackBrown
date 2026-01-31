import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  TrendingUp, 
  Map as MapIcon, 
  Layers, 
  Search, 
  Filter,
  ArrowRight,
  Target,
  BarChart3,
  Building2,
  FileText,
  Gavel,
  Briefcase,
  ExternalLink,
  ChevronRight,
  Clock,
  CheckCircle2,
  Zap,
  Cpu,
  Navigation2,
  Maximize2,
  ShieldCheck,
  Sparkles,
  Volume2,
  ChevronDown,
  Info,
  History,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ReChartsTooltip,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

// --- Hackathon Grade Constants ---

const AGENTS = [
  { id: 'orchestrator', name: 'Neural Core', icon: Cpu, time: '1.2s' },
  { id: 'scout', name: 'Geo-Scanner', icon: Navigation2, time: '0.8s' },
  { id: 'intel', name: 'Ghost Intel', icon: ShieldCheck, time: '2.4s' },
  { id: 'viz', name: 'Optic Render', icon: Sparkles, time: '1.5s' }
];

const DETAILED_METRICS = [
  { 
    label: 'ELITE DENSITY', 
    value: '14.2k/mi²', 
    trend: '+18.4%', 
    confidence: 94, 
    source: 'Census ACS 2023',
    freshness: 'Live'
  },
  { 
    label: 'NET DISPOSABLE', 
    value: '$242k', 
    trend: '+12.1%', 
    confidence: 92, 
    source: 'IRS SOI Data',
    freshness: '24h ago'
  },
  { 
    label: 'FOOT VELOCITY', 
    value: '84k/hr', 
    trend: '+42%', 
    confidence: 74, 
    source: 'Placer.ai',
    freshness: '2 min ago'
  },
  { 
    label: 'LEASE ALPHA', 
    value: '-8.2%', 
    trend: 'Low', 
    confidence: 88, 
    source: 'CompStak',
    freshness: '12h ago'
  }
];

const SOURCES = [
  { title: 'Location', desc: 'Google Places API', status: 'Live' },
  { title: 'Demographics', desc: 'Census ACS 2023', status: 'Validated' },
  { title: 'Competitors', desc: 'Yelp Fusion', status: 'Live' },
  { title: 'Foot Traffic', desc: 'Placer.ai Estimates', status: 'Estimated' },
  { title: 'Rent Data', desc: 'CompStak Proxy', status: 'Estimated' },
  { title: 'Projections', desc: 'Gemini 2.0 RAG', status: 'AI-Generated' }
];

// --- Types ---

type AppState = 'initial' | 'loading' | 'results';

// --- Components ---

const AgentStatus = ({ agent, state, index }: { agent: any, state: 'idle' | 'running' | 'complete', index: number }) => {
  return (
    <div className="flex flex-col items-center gap-2 group">
      <div className="relative">
        <motion.div 
          animate={state === 'running' ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
          className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center relative z-10 transition-all duration-500 ${
            state === 'complete' ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 
            state === 'running' ? 'border-emerald-400 bg-white text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 
            'border-slate-100 bg-white text-slate-300'
          }`}
        >
          {state === 'complete' ? (
            <CheckCircle2 className="w-6 h-6 animate-in zoom-in duration-300" />
          ) : (
            <agent.icon className={`w-6 h-6 ${state === 'running' ? 'animate-pulse' : ''}`} />
          )}
        </motion.div>
        {state === 'running' && (
          <div className="absolute inset-0 bg-emerald-500/10 blur-xl animate-pulse -z-10" />
        )}
      </div>
      <div className="text-center">
        <p className={`text-[10px] font-black uppercase tracking-widest leading-none mb-1 ${state === 'idle' ? 'text-slate-300' : 'text-slate-400'}`}>Agent 0{index + 1}</p>
        <p className={`text-xs font-black leading-tight ${state === 'idle' ? 'text-slate-400' : 'text-slate-900'}`}>{agent.name}</p>
        {state === 'running' && (
          <div className="mt-1.5 w-12 h-1 bg-slate-100 rounded-full overflow-hidden mx-auto">
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1, repeat: Infinity }}
              className="h-full w-full bg-emerald-500"
            />
          </div>
        )}
        {state === 'complete' && (
          <span className="text-[10px] font-bold text-emerald-600 animate-in fade-in slide-in-from-top-1">{agent.time}</span>
        )}
      </div>
    </div>
  );
};

const ConfidenceBadge = ({ metric }: { metric: typeof DETAILED_METRICS[0] }) => {
  const isHigh = metric.confidence >= 90;
  const isMed = metric.confidence >= 70 && metric.confidence < 90;
  const colorClass = isHigh ? 'text-emerald-600' : isMed ? 'text-amber-500' : 'text-rose-500';
  const barColor = isHigh ? 'bg-emerald-500' : isMed ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="pt-3 mt-3 border-t border-slate-100 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Target className={`w-3 h-3 ${colorClass}`} />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confidence</span>
        </div>
        <span className={`text-[10px] font-black ${colorClass}`}>{metric.confidence}%</span>
      </div>
      <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${metric.confidence}%` }}
          className={`h-full ${barColor} rounded-full`}
        />
      </div>
      <div className="flex items-center justify-between text-[9px] font-bold text-slate-400">
        <span className="flex items-center gap-1">Source: {metric.source}</span>
        <span className="flex items-center gap-1">{metric.freshness}</span>
      </div>
    </div>
  );
};

// --- Main Page Component ---

export default function SiteSelectPro() {
  const [appState, setAppState] = React.useState<AppState>('initial');
  const [concept, setConcept] = React.useState('High-end boba café targeting young professionals');
  const [loadingProgress, setLoadingProgress] = React.useState(0);
  const [isDataSourcesOpen, setIsDataSourcesOpen] = React.useState(false);

  const startAnalysis = () => {
    setAppState('loading');
    setLoadingProgress(0);
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setAppState('results'), 500);
          return 100;
        }
        return prev + 1;
      });
    }, 40);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-900 font-sans selection:bg-indigo-100">
      {/* Background Noise & Polish */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-0" />

      {/* Navigation */}
      <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-2xl border-b border-slate-200/50 h-20 flex items-center">
        <div className="max-w-[1600px] mx-auto px-8 w-full flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center relative z-10">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tighter uppercase italic leading-none">SiteSelect<span className="text-indigo-600">Pro</span></span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-0.5">Neural Market Intelligence</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Documentation</button>
            <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all">Connect Wallet</button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-8 py-10 space-y-10 relative z-10">
        
        {/* ADDITION 1: Input Form (Hero Section) */}
        <section className="max-w-4xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-2xl shadow-slate-200/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
            <div className="relative z-10 space-y-8">
              <div className="space-y-2">
                <h1 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Launch Analysis</h1>
                <h2 className="text-2xl font-black tracking-tight">What's your business concept?</h2>
              </div>
              
              <div className="space-y-4">
                <div className="relative group">
                  <input 
                    type="text" 
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    placeholder="e.g. High-end boba café targeting young professionals..."
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-5 text-lg font-bold placeholder:text-slate-300 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 flex flex-col group hover:border-indigo-200 transition-all cursor-pointer">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      <MapIcon className="w-3 h-3" /> Location
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black">Manhattan (Chelsea)</span>
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 flex flex-col group hover:border-indigo-200 transition-all cursor-pointer">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      <Briefcase className="w-3 h-3" /> Budget
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black">$8k - $15k /mo</span>
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 flex flex-col group hover:border-indigo-200 transition-all cursor-pointer">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      <Users className="w-3 h-3" /> Demographics
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black">Millennials + Gen Z</span>
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center pt-4">
                <button 
                  onClick={startAnalysis}
                  disabled={appState === 'loading'}
                  className="group relative bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-5 rounded-[24px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    {appState === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-white" />}
                    ACTIVATE NEURAL MESH
                  </div>
                </button>
              </div>
            </div>
          </div>
          {appState === 'loading' && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mt-6 text-sm font-bold text-slate-400 animate-pulse"
            >
              Analyzing 847 micro-locations across Manhattan...
            </motion.p>
          )}
        </section>

        <AnimatePresence mode="wait">
          {appState === 'initial' && (
            <motion.section 
              key="initial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="py-20 flex flex-col items-center justify-center space-y-12"
            >
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center">
                <Target className="w-12 h-12 text-slate-300" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-black text-slate-900">Enter your business concept above</h3>
                <p className="text-slate-400 font-medium">to activate the Neural Mesh and generate high-fidelity market reports.</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-4xl opacity-40 grayscale">
                {AGENTS.map((agent, i) => (
                  <AgentStatus key={agent.id} agent={agent} state="idle" index={i} />
                ))}
              </div>

              <div className="bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <p className="text-xs font-bold text-slate-500 italic">Try: "Specialty coffee shop targeting remote workers in Tribeca"</p>
              </div>
            </motion.section>
          )}

          {appState === 'loading' && (
            <motion.section 
              key="loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="py-12 space-y-12"
            >
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-emerald-500 fill-emerald-500" />
                    <h3 className="text-lg font-black tracking-tight text-slate-900 uppercase">Neural Mesh Active</h3>
                  </div>
                  <span className="text-sm font-black text-emerald-500">{loadingProgress}%</span>
                </div>
                
                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${loadingProgress}%` }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>

                {/* Agent Activity Log */}
                <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-4 shadow-sm">
                  {[
                    { id: 1, log: 'Agent 01: Intent parsed — "boba café, Chelsea"', done: loadingProgress > 25 },
                    { id: 2, log: 'Agent 02: 12 competitor locations identified', done: loadingProgress > 50 },
                    { id: 3, log: 'Agent 03: Analyzing foot traffic patterns...', active: loadingProgress > 50 && loadingProgress < 85, done: loadingProgress >= 85 },
                    { id: 4, log: 'Agent 04: Waiting for upstream data', waiting: loadingProgress < 85, done: loadingProgress >= 100 }
                  ].map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        {entry.done ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : 
                         entry.active ? <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" /> : 
                         <div className="w-4 h-4 rounded-full border-2 border-slate-200" />}
                        <span className={`text-xs font-black uppercase tracking-widest ${entry.done ? 'text-slate-900' : 'text-slate-400'}`}>
                          {entry.log}
                        </span>
                      </div>
                      {entry.active && <span className="text-[10px] font-black text-emerald-500 uppercase">Processing...</span>}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-4 gap-8">
                  {AGENTS.map((agent, i) => (
                    <AgentStatus 
                      key={agent.id} 
                      agent={agent} 
                      state={loadingProgress > (i + 1) * 25 ? 'complete' : loadingProgress > i * 25 ? 'running' : 'idle'} 
                      index={i} 
                    />
                  ))}
                </div>
                
                <p className="text-center text-xs font-bold text-slate-400">Estimated time remaining: {Math.max(0, Math.ceil((100 - loadingProgress) / 10))} seconds</p>
              </div>
            </motion.section>
          )}

          {appState === 'results' && (
            <motion.section 
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              {/* Agent Mesh Row (Completed) */}
              <div className="grid grid-cols-4 gap-8 max-w-4xl mx-auto">
                {AGENTS.map((agent, i) => (
                  <AgentStatus key={agent.id} agent={agent} state="complete" index={i} />
                ))}
              </div>

              {/* Main Map & Analytics Grid */}
              <div className="grid grid-cols-12 gap-8">
                
                {/* Column 1: Map Visualizer */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                  <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm relative h-[600px] group">
                    <div className="absolute top-8 left-8 z-20 space-y-4">
                      <div className="bg-white/90 backdrop-blur-xl border border-white p-6 rounded-3xl shadow-2xl w-72 group-hover:scale-105 transition-transform">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="text-lg font-black text-slate-900 leading-tight">Chelsea Highline — Analysis Complete</h4>
                          <button className="p-2 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors group/speaker">
                            <Volume2 className="w-4 h-4 text-indigo-600" />
                          </button>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 mb-6">"Listen to 60-second summary"</p>
                        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-xl">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Optimized Location Found</span>
                        </div>
                      </div>
                    </div>

                    <div className="absolute inset-0">
                      <ImageWithFallback 
                        src="https://images.unsplash.com/photo-1558377266-fd0fd8f66d29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                        alt="Manhattan Map"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-indigo-900/5 mix-blend-multiply" />
                      
                      {/* Interactive Target Marker */}
                      <motion.div 
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="absolute top-[40%] left-[45%] z-20 cursor-pointer"
                      >
                        <div className="relative group">
                          <div className="absolute -inset-8 bg-indigo-500/20 rounded-full blur-2xl animate-pulse" />
                          <div className="w-8 h-8 bg-slate-900 rounded-full border-4 border-white shadow-2xl flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* ADDITION 4: "What If" Control Bar */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 w-[90%] bg-white/90 backdrop-blur-2xl border border-white rounded-[32px] p-8 shadow-2xl">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <History className="w-5 h-5 text-indigo-600" />
                          <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Scenario Explorer</h3>
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last run: 34 seconds ago</div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-12 mb-8">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget: $12k</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full relative">
                            <div className="absolute inset-y-0 left-0 w-[60%] bg-indigo-500 rounded-full" />
                            <div className="absolute top-1/2 left-[60%] -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-indigo-500 rounded-full shadow-lg" />
                          </div>
                          <div className="flex justify-between text-[8px] font-bold text-slate-300">
                            <span>$5k</span>
                            <span>$20k</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neighborhood</span>
                          <div className="flex items-center justify-between bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl">
                            <span className="text-xs font-bold">Chelsea</span>
                            <ChevronDown className="w-3 h-3 text-slate-400" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Demo</span>
                          <div className="flex items-center justify-between bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl">
                            <span className="text-xs font-bold">Gen Z / Millennials</span>
                            <ChevronDown className="w-3 h-3 text-slate-400" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compare:</span>
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">Chelsea vs Tribeca vs SoHo</span>
                        </div>
                        <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:scale-105 transition-all">
                          <Zap className="w-3 h-3 fill-white" />
                          RE-RUN ANALYSIS
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Virtual Storefront Component */}
                  <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm grid md:grid-cols-2 gap-10">
                    <div className="aspect-[4/3] rounded-3xl overflow-hidden relative border border-slate-100 bg-slate-50">
                      <ImageWithFallback 
                        src="https://images.unsplash.com/photo-1750072931872-1c78fb5fb2fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                        alt="Storefront Sketch"
                        className="w-full h-full object-cover grayscale opacity-60 mix-blend-multiply"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                      <div className="absolute top-4 right-4 bg-white/90 px-3 py-1.5 rounded-lg shadow-sm">
                        <span className="text-[10px] font-black text-slate-900 uppercase">Optic Render v0.42</span>
                      </div>
                    </div>
                    <div className="space-y-8">
                      <div>
                        <h4 className="text-xl font-black text-slate-900">Storefront Shadow Projection</h4>
                        <p className="text-sm text-slate-500 mt-2 font-medium leading-relaxed">Agent 04 simulated 1,200 sqft corner unit at 22nd & 10th. Predicted conversion uplift: <span className="text-indigo-600 font-black">+14%</span> based on footfall vectors.</p>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                            <Maximize2 className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900 leading-none">Max Exposure</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1">42ft Glass Frontage</p>
                          </div>
                        </div>
                        <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-xl shadow-slate-900/10">Generate 3D Twin</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: Detailed Analytics */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                  {/* Real-Time Analytics with ADDITION 3: Confidence Badges */}
                  <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                      <div className="flex items-center gap-3">
                        <BarChart3 className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Real-Time Analytics</h3>
                      </div>
                      <Info className="w-4 h-4 text-slate-300" />
                    </div>
                    
                    <div className="space-y-8">
                      {DETAILED_METRICS.map((metric, i) => (
                        <div key={i} className="group cursor-pointer">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">{metric.label}</p>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold ${metric.trend.startsWith('+') ? 'text-emerald-500' : 'text-indigo-600'}`}>{metric.trend}</span>
                            </div>
                          </div>
                          <div className="text-2xl font-black text-slate-900 tracking-tighter mb-4">{metric.value}</div>
                          
                          {/* NEW: Confidence Badge Component */}
                          <ConfidenceBadge metric={metric} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Vault Section */}
                  <div className="bg-slate-900 text-white rounded-[32px] p-8 shadow-xl border border-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full -mr-16 -mt-16" />
                    <div className="relative z-10 space-y-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                          <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black tracking-tight">Business Vault</h3>
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Legal & Toolkit</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-indigo-400" />
                              <span className="text-xs font-bold">Lease Terms Analysis</span>
                            </div>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          </div>
                          <p className="text-[10px] font-medium text-white/40 leading-relaxed group-hover:text-white/60 transition-colors">"Good Guy Guarantee" clause detected. Favorable terms confirmed.</p>
                        </div>
                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer group">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <Gavel className="w-4 h-4 text-indigo-400" />
                              <span className="text-xs font-bold">NYC Zoning (M1-5B)</span>
                            </div>
                            <span className="text-[8px] font-black bg-indigo-500 px-2 py-0.5 rounded-md">VERIFIED</span>
                          </div>
                          <p className="text-[10px] font-medium text-white/40 leading-relaxed group-hover:text-white/60 transition-colors">Retail & Light Manufacturing permitted. High liquor license availability.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <button className="flex items-center justify-center gap-2 py-4 bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">
                          <ExternalLink className="w-4 h-4" />
                          Contact Rep
                        </button>
                        <button className="flex items-center justify-center gap-2 py-4 bg-indigo-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-400 transition-all shadow-xl shadow-indigo-500/20">
                          <FileText className="w-4 h-4" />
                          Export Kit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ADDITION 6: Data Sources & Methodology */}
              <section className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
                <button 
                  onClick={() => setIsDataSourcesOpen(!isDataSourcesOpen)}
                  className="w-full px-12 py-8 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-slate-900" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-black tracking-tight text-slate-900 uppercase">Data Sources & Methodology</h3>
                      <p className="text-xs font-bold text-slate-400 mt-1">Audit of SiteSelect Intelligence Core v4.2</p>
                    </div>
                  </div>
                  {isDataSourcesOpen ? <ChevronDown className="w-6 h-6 rotate-180 transition-transform" /> : <ChevronDown className="w-6 h-6 transition-transform" />}
                </button>
                
                <AnimatePresence>
                  {isDataSourcesOpen && (
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden border-t border-slate-100"
                    >
                      <div className="px-12 py-10 space-y-10">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                          {SOURCES.map((source, i) => (
                            <div key={i} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{source.title}</p>
                              <p className="text-xs font-black text-slate-900 leading-tight">{source.desc}</p>
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{source.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="pt-8 border-t border-slate-100">
                          <div className="flex items-start gap-4 text-slate-500 max-w-3xl">
                            <AlertCircle className="w-5 h-5 mt-1 shrink-0 text-amber-500" />
                            <p className="text-sm font-medium leading-relaxed italic">
                              Methodology Note: Confidence scores reflect a weighted average of source reliability (84%), data recency (92%), and cross-agent validation consensus (89%). Gemini 2.0 RAG pipeline synthesized for natural language insights.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Global Footer Banner */}
        <section className="bg-slate-900 rounded-[48px] p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <h2 className="text-4xl font-black tracking-tighter text-white">Dominate Manhattan with Neural Intelligence.</h2>
            <p className="text-lg text-white/50 font-medium">SitSelect Pro agents are ready to deploy. Launch your next location with billion-dollar confidence.</p>
            <div className="flex items-center justify-center gap-6 pt-4">
              <button className="bg-white text-slate-900 px-10 py-5 rounded-[24px] font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-white/10">
                Go Enterprise • $499
              </button>
              <button className="text-white/60 hover:text-white px-10 py-5 rounded-[24px] font-black text-sm uppercase tracking-widest transition-all">
                Schedule Demo
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-20 border-t border-slate-100 bg-white">
        <div className="max-w-[1600px] mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-slate-900" />
            <span className="text-sm font-black tracking-tighter uppercase italic">SiteSelect<span className="text-indigo-600">Pro</span></span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2026 SiteSelect Intelligence Core. Built for NYC Hackathon.</p>
          <div className="flex gap-10">
            {['Protocol', 'Intelligence', 'Security'].map(link => (
              <a key={link} href="#" className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
