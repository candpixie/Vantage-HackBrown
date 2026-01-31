import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Search, 
  DollarSign,
  Users,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Loader2,
  Zap,
  Cpu,
  Navigation2,
  ShieldCheck,
  Sparkles,
  X,
  Target,
  BarChart3,
  Building2,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Star,
  Clock,
  ExternalLink,
  ChevronLeft,
  Menu,
  Home,
  Map,
  Settings,
  User,
  LogOut,
  LogIn,
  Bell,
  HelpCircle,
  Layers,
  Activity,
  FileText,
  Globe,
  Lock,
  Mail,
  Eye,
  EyeOff
} from 'lucide-react';
import { InputForm } from './components/InputForm';
import { MapView } from './components/MapView';
import { AgentWorkflow } from './components/AgentWorkflow';
import { NeuralMeshWorkflow } from './components/NeuralMeshWorkflow';
import { ScoreCard } from './components/ScoreCard';
import { ScoreBreakdown } from './components/ScoreBreakdown';
import { CompetitorCard } from './components/CompetitorCard';
import { RevenueTable } from './components/RevenueTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';

// Mock data - NYC/Manhattan locations
const LOCATIONS = [
  { id: 1, name: 'Chelsea Highline', score: 98, x: 35, y: 45, status: 'HIGH' as const, 
    metrics: [
      { label: 'Elite Density', score: 98, confidence: 'HIGH' as const },
      { label: 'Net Disposable', score: 95, confidence: 'HIGH' as const },
      { label: 'Foot Velocity', score: 92, confidence: 'HIGH' as const },
      { label: 'Transit', score: 96, confidence: 'HIGH' as const },
      { label: 'Rent Alpha', score: 88, confidence: 'HIGH' as const }
    ],
    competitors: [
      { name: 'Blue Bottle Coffee', rating: 4.6, reviews: 1247, distance: '0.1 mi', status: 'Open' as const, weakness: 'Premium pricing' },
      { name: 'Joe Coffee', rating: 4.4, reviews: 892, distance: '0.2 mi', status: 'Open' as const, weakness: 'Limited seating' },
      { name: 'Stumptown Coffee', rating: 4.5, reviews: 1103, distance: '0.3 mi', status: 'Open' as const, weakness: 'Crowded peak hours' }
    ],
    revenue: [
      { scenario: 'Conservative', monthly: '$28,500', annual: '$342k', margin: '22%' },
      { scenario: 'Moderate', monthly: '$42,200', annual: '$506k', margin: '28%', isRecommended: true },
      { scenario: 'Optimistic', monthly: '$58,800', annual: '$706k', margin: '32%' }
    ],
    checklist: [
      { text: 'Verify zoning permits for food service', completed: false },
      { text: 'Contact landlord for lease terms', completed: false },
      { text: 'Check foot traffic data for peak hours', completed: true },
      { text: 'Review competitor pricing strategy', completed: false },
      { text: 'Schedule site visit with realtor', completed: false }
    ]
  },
  { id: 2, name: 'Tribeca', score: 89, x: 60, y: 55, status: 'HIGH' as const,
    metrics: [
      { label: 'Elite Density', score: 92, confidence: 'HIGH' as const },
      { label: 'Net Disposable', score: 88, confidence: 'HIGH' as const },
      { label: 'Foot Velocity', score: 85, confidence: 'MEDIUM' as const },
      { label: 'Transit', score: 90, confidence: 'HIGH' as const },
      { label: 'Rent Alpha', score: 82, confidence: 'MEDIUM' as const }
    ],
    competitors: [
      { name: 'La Colombe', rating: 4.7, reviews: 2156, distance: '0.2 mi', status: 'Open' as const, weakness: 'High-end positioning' },
      { name: 'Bluestone Lane', rating: 4.5, reviews: 1834, distance: '0.3 mi', status: 'Open' as const, weakness: 'Australian focus' }
    ],
    revenue: [
      { scenario: 'Conservative', monthly: '$32,500', annual: '$390k', margin: '24%' },
      { scenario: 'Moderate', monthly: '$45,800', annual: '$550k', margin: '30%', isRecommended: true },
      { scenario: 'Optimistic', monthly: '$62,400', annual: '$749k', margin: '34%' }
    ],
    checklist: [
      { text: 'Verify zoning permits for food service', completed: false },
      { text: 'Contact landlord for lease terms', completed: false },
      { text: 'Check foot traffic data for peak hours', completed: false },
      { text: 'Review competitor pricing strategy', completed: false },
      { text: 'Schedule site visit with realtor', completed: false }
    ]
  },
  { id: 3, name: 'SoHo', score: 87, x: 50, y: 70, status: 'HIGH' as const,
    metrics: [
      { label: 'Elite Density', score: 94, confidence: 'HIGH' as const },
      { label: 'Net Disposable', score: 91, confidence: 'HIGH' as const },
      { label: 'Foot Velocity', score: 88, confidence: 'HIGH' as const },
      { label: 'Transit', score: 85, confidence: 'MEDIUM' as const },
      { label: 'Rent Alpha', score: 75, confidence: 'MEDIUM' as const }
    ],
    competitors: [
      { name: 'Café Gitane', rating: 4.6, reviews: 1923, distance: '0.2 mi', status: 'Open' as const, weakness: 'French bistro style' },
      { name: 'Balthazar', rating: 4.4, reviews: 3456, distance: '0.4 mi', status: 'Open' as const, weakness: 'Upscale dining' }
    ],
    revenue: [
      { scenario: 'Conservative', monthly: '$35,200', annual: '$422k', margin: '26%' },
      { scenario: 'Moderate', monthly: '$48,600', annual: '$583k', margin: '31%', isRecommended: true },
      { scenario: 'Optimistic', monthly: '$65,800', annual: '$790k', margin: '35%' }
    ],
    checklist: [
      { text: 'Verify zoning permits for food service', completed: false },
      { text: 'Contact landlord for lease terms', completed: false },
      { text: 'Check foot traffic data for peak hours', completed: false },
      { text: 'Review competitor pricing strategy', completed: false },
      { text: 'Schedule site visit with realtor', completed: false }
    ]
  }
];

const AGENTS = [
  { id: 'orchestrator', name: 'Neural Core', icon: Cpu },
  { id: 'scout', name: 'Geo-Scanner', icon: Navigation2 },
  { id: 'intel', name: 'Ghost Intel', icon: ShieldCheck },
  { id: 'analyst', name: 'Market Analyst', icon: BarChart3 },
  { id: 'visualizer', name: 'Optic Render', icon: Sparkles }
];

const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, active: true },
  { id: 'locations', label: 'Locations', icon: Map },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

type AppState = 'initial' | 'loading' | 'results';
type ActiveTab = 'dashboard' | 'locations' | 'analytics' | 'reports' | 'settings';

export default function SiteSelect() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [appState, setAppState] = useState<AppState>('initial');
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [checklistStates, setChecklistStates] = useState<Record<number, boolean[]>>({});

  const selectedLocationData = selectedLocation ? LOCATIONS.find(l => l.id === selectedLocation) : null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticated(true);
    setShowLogin(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowLogin(true);
  };

  const startAnalysis = () => {
    setAppState('loading');
    setLoadingProgress(0);
    setActiveAgent(AGENTS[0].id);
    
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = prev + 2;
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setAppState('results');
            setActiveAgent(null);
          }, 500);
          return 100;
        }
        
        if (newProgress < 20) setActiveAgent(AGENTS[0].id);
        else if (newProgress < 40) setActiveAgent(AGENTS[1].id);
        else if (newProgress < 60) setActiveAgent(AGENTS[2].id);
        else if (newProgress < 80) setActiveAgent(AGENTS[3].id);
        else setActiveAgent(AGENTS[4].id);
        
        return newProgress;
      });
    }, 60);
  };

  const handleMarkerClick = (id: number) => {
    setSelectedLocation(id);
    if (!checklistStates[id]) {
      const location = LOCATIONS.find(l => l.id === id);
      if (location) {
        setChecklistStates(prev => ({
          ...prev,
          [id]: location.checklist.map(item => item.completed)
        }));
      }
    }
  };

  const toggleChecklistItem = (locationId: number, index: number) => {
    setChecklistStates(prev => {
      const current = prev[locationId] || [];
      const updated = [...current];
      updated[index] = !updated[index];
      return {
        ...prev,
        [locationId]: updated
      };
    });
  };

  const getChecklistState = (locationId: number, index: number): boolean => {
    return checklistStates[locationId]?.[index] ?? LOCATIONS.find(l => l.id === locationId)?.checklist[index]?.completed ?? false;
  };

  // Login Modal
  if (showLogin && !isAuthenticated) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background layers */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-[#6366F1] rounded-full blur-3xl opacity-20 animate-pulse" style={{ animation: 'float 20s ease-in-out infinite' }} />
          <div className="absolute w-96 h-96 bg-[#8B5CF6] rounded-full blur-3xl opacity-20 animate-pulse" style={{ animation: 'float 25s ease-in-out infinite reverse' }} />
        </div>

        {/* Login Card */}
        <div className="relative z-10 w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
          >
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-2xl mb-4 shadow-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">SiteSelect</h1>
              <p className="text-white/70">AI-Powered Retail Site Selection</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent backdrop-blur-sm"
                  />
        </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent backdrop-blur-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

                <button 
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                Sign In
                </button>

              <div className="text-center">
                <a href="#" className="text-sm text-white/70 hover:text-white transition-colors">
                  Forgot password?
                </a>
              </div>
            </form>
          </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex relative overflow-hidden">
      {/* Multi-layer background effects - Subtle liquid glass ambiance */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-[800px] h-[800px] bg-gradient-to-br from-[#6366F1]/5 via-[#8B5CF6]/5 to-[#6366F1]/5 rounded-full blur-3xl" style={{ 
          top: '-200px', 
          right: '-200px',
          animation: 'float 20s ease-in-out infinite'
        }} />
        <div className="absolute w-[600px] h-[600px] bg-gradient-to-br from-[#8B5CF6]/5 via-[#6366F1]/5 to-[#8B5CF6]/5 rounded-full blur-3xl" style={{ 
          bottom: '-150px', 
          left: '-150px',
          animation: 'float 25s ease-in-out infinite reverse'
        }} />
      </div>

      {/* Collapsible Sidebar */}
      <aside
        style={{ width: sidebarCollapsed ? 80 : 280 }}
        className="relative z-30 glass-card border-r border-white/30 shadow-2xl flex flex-col transition-all duration-300"
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-[#E5E7EB]/50 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3 animate-in fade-in duration-300">
              <div className="w-10 h-10 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-xl flex items-center justify-center shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900">SiteSelect</span>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft className={`w-5 h-5 text-slate-600 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as ActiveTab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-lg'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <span className="font-medium animate-in fade-in duration-300">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-[#E5E7EB]/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-full flex items-center justify-center text-white font-semibold">
              {!sidebarCollapsed ? 'JD' : 'J'}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 animate-in fade-in duration-300">
                <p className="text-sm font-semibold text-slate-900">John Doe</p>
                <p className="text-xs text-slate-500">john@example.com</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {!sidebarCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-20 glass-card border-b border-white/30 h-16 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-900 capitalize">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full" />
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <HelpCircle className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="space-y-6">
        <AnimatePresence mode="wait">
          {appState === 'initial' && (
            <motion.div
              key="initial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="max-w-4xl mx-auto space-y-8">
                      <div className="text-center space-y-4 py-12">
                        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent">
                          AI-Powered Retail Site Selection
                        </h1>
                        <p className="text-lg text-slate-600">Find the perfect location for your business in Manhattan</p>
              </div>
              
                <div className="glass-card rounded-3xl p-8 premium-glow">
                  <InputForm onAnalyze={startAnalysis} isAnalyzing={false} />
              </div>
              </div>
            </motion.div>
          )}

          {appState === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="space-y-8">
                      <div className="glass-card rounded-3xl p-8 premium-glow">
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Analyzing Locations...</h3>
                            <span className="text-sm font-medium text-[#6366F1]">{loadingProgress}%</span>
                  </div>
                          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${loadingProgress}%` }}
                    style={{ height: '100%', background: 'linear-gradient(to right, #6366F1, #8B5CF6)', borderRadius: '9999px' }}
                  />
                          </div>
                          <div className="pt-4">
                            <AgentWorkflow 
                              agents={AGENTS.map(agent => ({
                                id: agent.id,
                                name: agent.name,
                                status: activeAgent === agent.id ? 'active' : 
                                       AGENTS.findIndex(a => a.id === activeAgent) > AGENTS.findIndex(a => a.id === agent.id) ? 'done' : 'idle'
                              }))}
                  />
                </div>
                        </div>
                      </div>
              </div>
                    </motion.div>
          )}

          {appState === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="space-y-6">
                      {/* Bento-Grid Dashboard Layout */}
                      <div className="grid grid-cols-12 gap-4">
                        {/* Neural Mesh Workflow - Large Card */}
                        <div className="col-span-12 lg:col-span-8">
                          <div className="glass-card rounded-2xl p-6 premium-glow">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">4 PARALLEL EXECUTION</div>
                                <h2 className="text-2xl font-black tracking-tight">Multi-Agent Synthesis</h2>
                                <p className="text-sm text-slate-600 mt-1">SiteSelect Pro agents are currently crunching Manhattan high-velocity data points.</p>
              </div>
                              <button
                                onClick={startAnalysis}
                                className="px-6 py-3 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all flex items-center gap-2"
                              >
                                RE-RUN NEURAL MESH →
                          </button>
                        </div>
                            <NeuralMeshWorkflow
                              agents={AGENTS.map((agent, idx) => ({
                                id: agent.id,
                                name: agent.name,
                                icon: agent.icon,
                                status: activeAgent === agent.id ? 'active' : 
                                       AGENTS.findIndex(a => a.id === activeAgent) > idx ? 'done' : 'idle',
                                position: { x: 15 + idx * 20, y: 50 }
                              }))}
                              onRun={startAnalysis}
                            />
                          </div>
                        </div>

                        {/* NYC Hyper-Density Card */}
                        {selectedLocationData && (
                          <div className="col-span-12 lg:col-span-4">
                            <div className="glass-card-dark rounded-2xl overflow-hidden premium-glow h-full relative">
                              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-800/70 to-slate-900/70" />
                              <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center gap-2 mb-4">
                                    <Globe className="w-5 h-5 text-white" />
                                    <span className="text-xs font-bold text-white/70 uppercase tracking-wider">NYC HYPER-DENSITY</span>
                                  </div>
                                  <div className="text-xs font-bold text-white/50 uppercase mb-2">SELECTED CORE</div>
                                  <h3 className="text-3xl font-black text-white mb-3">{selectedLocationData.name}</h3>
                                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#10B981] rounded-lg mb-4">
                                    <span className="text-sm font-black text-white">{selectedLocationData.score}% FIT</span>
                                  </div>
                                  <div className="space-y-2 text-white">
                                    <div className="text-sm">
                                      <span className="text-white/60">LTV PROJECTION</span>
                                      <div className="text-xl font-black">$2.4M /yr</div>
                                    </div>
                                    <div className="text-sm">
                                      <span className="text-white/60">RENT ALPHA</span>
                                      <div className="text-xl font-black">-12.4% vs Market</div>
                                    </div>
                                  </div>
                                </div>
                                <button className="w-full mt-6 px-4 py-3 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-colors">
                                  ANALYZE MICRO-LEASE
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Real-Time Analytics - Bento Grid */}
                        <div className="col-span-12 lg:col-span-6">
                          <div className="glass-card rounded-2xl p-6 premium-glow">
                            <div className="flex items-center gap-2 mb-6">
                              <BarChart3 className="w-5 h-5 text-[#6366F1]" />
                              <h3 className="text-lg font-bold">REAL-TIME ANALYTICS</h3>
                            </div>
                            <div className="space-y-4">
                              {selectedLocationData ? selectedLocationData.metrics.map((metric, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                  <div className="flex-1">
                                    <div className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">{metric.label}</div>
                                    <div className="text-lg font-black text-slate-900">{metric.score}/100</div>
                                  </div>
                                  <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                    metric.confidence === 'HIGH' ? 'bg-[#10B981]/10 text-[#10B981]' :
                                    metric.confidence === 'MEDIUM' ? 'bg-yellow-50 text-yellow-600' :
                                    'bg-orange-50 text-orange-600'
                                  }`}>
                                    {metric.confidence}
                                  </div>
                                </div>
                              )) : (
                                <>
                                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                    <div className="flex-1">
                                      <div className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">ELITE DENSITY</div>
                                      <div className="text-lg font-black text-slate-900">14.2k/mi² <span className="text-[#10B981] text-sm">+18.4%</span></div>
                                    </div>
                                    <div className="px-3 py-1 bg-[#10B981]/10 text-[#10B981] rounded-lg text-xs font-bold">98</div>
                                  </div>
                                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                    <div className="flex-1">
                                      <div className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">NET DISPOSABLE</div>
                                      <div className="text-lg font-black text-slate-900">$242k <span className="text-[#10B981] text-sm">+12.1%</span></div>
                                    </div>
                                    <div className="px-3 py-1 bg-[#10B981]/10 text-[#10B981] rounded-lg text-xs font-bold">92</div>
                                  </div>
                                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                    <div className="flex-1">
                                      <div className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">FOOT VELOCITY</div>
                                      <div className="text-lg font-black text-slate-900">84k/hr <span className="text-[#10B981] text-sm">+42%</span></div>
                                    </div>
                                    <div className="px-3 py-1 bg-[#10B981]/10 text-[#10B981] rounded-lg text-xs font-bold">95</div>
                                  </div>
                                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                    <div className="flex-1">
                                      <div className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">LEASE ALPHA</div>
                                      <div className="text-lg font-black text-slate-900">-8.2% <span className="text-orange-600 text-sm">Opportunity</span></div>
                                    </div>
                                    <div className="px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-xs font-bold">74</div>
                                  </div>
                                </>
                              )}
                        </div>
                      </div>
                    </div>

                        {/* Map View */}
                        <div className="col-span-12 lg:col-span-6 space-y-4">
                          <div className="glass-card rounded-2xl overflow-hidden premium-glow">
                            <MapView
                              markers={LOCATIONS}
                              onMarkerClick={handleMarkerClick}
                              selectedId={selectedLocation}
                            />
                          </div>

                          {/* Location Report Card */}
                          {selectedLocationData && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                            >
                              <div className="glass-card rounded-3xl p-6 premium-glow">
                              <div className="flex items-start justify-between mb-6">
                                <div>
                                  <h3 className="text-xl font-semibold mb-1">{selectedLocationData.name}</h3>
                                  <ScoreCard 
                                    score={selectedLocationData.score} 
                                    confidence={selectedLocationData.status}
                                  />
                                </div>
                                <button
                                  onClick={() => setSelectedLocation(null)}
                                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                  <X className="w-5 h-5 text-slate-400" />
                                </button>
                        </div>
                                <ScoreBreakdown metrics={selectedLocationData.metrics} />
                        </div>
                      </motion.div>
                          )}

                          {/* Tabs Below Map */}
                          {selectedLocationData && (
                            <div className="glass-card rounded-3xl premium-glow overflow-hidden">
                              <Tabs defaultValue="analysis" className="w-full">
                                <TabsList className="w-full justify-start rounded-none border-b border-[#E5E7EB] bg-white/50">
                                  <TabsTrigger value="analysis" className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    Location Analysis
                                  </TabsTrigger>
                                  <TabsTrigger value="competitors" className="flex items-center gap-2">
                                    <Target className="w-4 h-4" />
                                    Competitors
                                  </TabsTrigger>
                                  <TabsTrigger value="revenue" className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" />
                                    Revenue Projection
                                  </TabsTrigger>
                                  <TabsTrigger value="checklist" className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Action Checklist
                                  </TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="analysis" className="p-6 space-y-4">
                                  <div className="space-y-4">
                                    <h4 className="font-semibold text-lg">Location Details</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="p-4 glass-gradient rounded-xl border border-white/20">
                                        <p className="text-sm text-slate-600 mb-1">Address</p>
                                        <p className="font-medium">{selectedLocationData.name}, Manhattan, NY</p>
                                      </div>
                                      <div className="p-4 glass-gradient rounded-xl border border-white/20">
                                        <p className="text-sm text-slate-600 mb-1">Score</p>
                                        <p className="font-semibold text-2xl text-[#6366F1]">{selectedLocationData.score}/100</p>
                                      </div>
                                    </div>
                                    <ScoreBreakdown metrics={selectedLocationData.metrics} />
                    </div>
                                </TabsContent>
                                
                                <TabsContent value="competitors" className="p-6">
                                  <div className="space-y-4">
                                    <h4 className="font-semibold text-lg mb-4">Nearby Competitors</h4>
                                    <div className="grid gap-4">
                                      {selectedLocationData.competitors.map((competitor, idx) => (
                                        <CompetitorCard key={idx} competitor={competitor} />
                                      ))}
                        </div>
                      </div>
                                </TabsContent>
                                
                                <TabsContent value="revenue" className="p-6">
                                  <RevenueTable projections={selectedLocationData.revenue} />
                                </TabsContent>
                      
                                <TabsContent value="checklist" className="p-6">
                        <div className="space-y-3">
                                    <h4 className="font-semibold text-lg mb-4">Action Items</h4>
                                    {selectedLocationData.checklist.map((item, idx) => {
                                      const isChecked = getChecklistState(selectedLocationData.id, idx);
                                      return (
                                        <label
                                          key={idx}
                                          className="flex items-center gap-3 p-4 glass-gradient rounded-xl border border-white/20 hover:border-[#6366F1]/30 cursor-pointer premium-glow-hover transition-all"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => toggleChecklistItem(selectedLocationData.id, idx)}
                                            className="w-5 h-5 rounded border-[#E5E7EB] text-[#6366F1] focus:ring-2 focus:ring-[#6366F1] cursor-pointer"
                                          />
                                          <span className={`flex-1 ${isChecked ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                                            {item.text}
                                          </span>
                                        </label>
                                      );
                                    })}
                          </div>
                                </TabsContent>
                              </Tabs>
                          </div>
                          )}
                        </div>

                        {/* Right: Workflow Sidebar */}
                        <div className="col-span-12 lg:col-span-3">
                          <div className="glass-card rounded-3xl premium-glow overflow-hidden sticky top-24">
                            <div className="p-6 border-b border-white/20">
                              <h3 className="font-semibold">Agent Workflow</h3>
                            </div>
                            <div className="p-6 space-y-4">
                              {AGENTS.map((agent, index) => {
                                const isActive = activeAgent === agent.id;
                                const isDone = activeAgent && AGENTS.findIndex(a => a.id === activeAgent) > index;
                                const status = isActive ? 'active' : isDone ? 'done' : 'idle';
                                
                                return (
                                  <div key={agent.id} className="flex items-start gap-4">
                                    <div className="flex flex-col items-center">
                                      <div className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
                                        status === 'done' ? 'bg-[#10B981]/10 border-[#10B981] text-[#10B981]' :
                                        status === 'active' ? 'bg-[#6366F1]/10 border-[#6366F1] text-[#6366F1] animate-pulse' :
                                        'bg-slate-50 border-[#E5E7EB] text-slate-300'
                                      }`}>
                                        {status === 'done' ? (
                                          <CheckCircle2 className="w-6 h-6" />
                                        ) : status === 'active' ? (
                                          <Loader2 className="w-6 h-6 animate-spin" />
                                        ) : (
                                          <agent.icon className="w-6 h-6" />
                                        )}
                                      </div>
                                      {index < AGENTS.length - 1 && (
                                        <div className={`w-0.5 h-8 mt-2 ${
                                          status === 'done' ? 'bg-[#10B981]' : 'bg-[#E5E7EB]'
                                        }`} />
                                      )}
                                    </div>
                                    <div className="flex-1 pt-1">
                                      <p className="text-xs font-medium text-slate-500 mb-1">Agent {index + 1}</p>
                                      <p className={`text-sm font-semibold ${
                                        status === 'idle' ? 'text-slate-400' : 'text-slate-900'
                                      }`}>
                                        {agent.name}
                                      </p>
                          </div>
                        </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    </motion.div>
                  )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {activeTab === 'locations' && (
              <motion.div
                key="locations"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {LOCATIONS.map((location) => (
                      <div
                        key={location.id}
                        onClick={() => {
                          setSelectedLocation(location.id);
                          setActiveTab('dashboard');
                        }}
                        className="glass-card rounded-3xl p-6 premium-glow-hover cursor-pointer"
                      >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">{location.name}</h3>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          location.status === 'HIGH' ? 'bg-[#10B981]/10 text-[#10B981]' :
                          location.status === 'MEDIUM' ? 'bg-yellow-50 text-yellow-600' :
                          'bg-orange-50 text-orange-600'
                        }`}>
                          {location.status}
                        </div>
                      </div>
                        <div className="text-3xl font-bold text-[#6366F1] mb-2">{location.score}/100</div>
                        <p className="text-sm text-slate-600">Click to view detailed analysis</p>
                    </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="space-y-6">
                  <div className="glass-card rounded-3xl p-8 premium-glow">
                    <h3 className="text-2xl font-bold mb-6">Analytics Dashboard</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-6 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-2xl text-white">
                        <p className="text-sm opacity-90 mb-2">Total Locations</p>
                        <p className="text-4xl font-bold">{LOCATIONS.length}</p>
                      </div>
                      <div className="p-6 bg-gradient-to-br from-[#10B981] to-emerald-500 rounded-2xl text-white">
                        <p className="text-sm opacity-90 mb-2">Avg. Score</p>
                        <p className="text-4xl font-bold">
                          {Math.round(LOCATIONS.reduce((acc, l) => acc + l.score, 0) / LOCATIONS.length)}
                        </p>
                      </div>
                      <div className="p-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl text-white">
                        <p className="text-sm opacity-90 mb-2">Analyses Run</p>
                        <p className="text-4xl font-bold">24</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'reports' && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="space-y-6">
                <div className="glass-card rounded-3xl p-8 premium-glow">
                  <h3 className="text-2xl font-bold mb-6">Reports</h3>
                  <div className="space-y-4">
                    {LOCATIONS.map((location) => (
                      <div key={location.id} className="p-4 glass-gradient rounded-xl border border-white/20 premium-glow-hover cursor-pointer">
                        <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-semibold">{location.name} Analysis Report</h4>
                            <p className="text-sm text-slate-600">Generated 2 hours ago</p>
                          </div>
                          <button className="px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-colors">
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="space-y-6">
                <div className="glass-card rounded-3xl p-8 premium-glow">
                  <h3 className="text-2xl font-bold mb-6">Settings</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Email Notifications</label>
                      <input type="checkbox" className="w-5 h-5 rounded border-[#E5E7EB] text-[#6366F1]" defaultChecked />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Theme</label>
                      <select className="w-full px-4 py-2 border border-[#E5E7EB] rounded-xl">
                        <option>Light</option>
                        <option>Dark</option>
                        <option>Auto</option>
                      </select>
                    </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
      </main>
        </div>
    </div>
  );
}
