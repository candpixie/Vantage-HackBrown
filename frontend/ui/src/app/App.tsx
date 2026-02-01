import React, { useState, useEffect } from 'react';
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
import { LinearPipeline } from './components/LinearPipeline';
import { SimpleBackground } from './components/SimpleBackground';
import { ScoreCard } from './components/ScoreCard';
import { ScoreBreakdown } from './components/ScoreBreakdown';
import { CompetitorCard } from './components/CompetitorCard';
import { RevenueTable } from './components/RevenueTable';
import { PremiumDashboard } from './components/PremiumDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { apiService, type LocationResult } from '../services/api';

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

export default function Vantage() {
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
  const [usePremiumView, setUsePremiumView] = useState(true);

  // Debug: Log when Premium Dashboard should render
  useEffect(() => {
    if (appState === 'results') {
      console.log('✅ Results state active - Premium Dashboard should be visible', {
        usePremiumView,
        locationsCount: LOCATIONS.length,
        selectedLocation
      });
    }
  }, [appState, usePremiumView, selectedLocation]);

  // Auto-select first location when results appear
  useEffect(() => {
    if (appState === 'results' && !selectedLocation && LOCATIONS.length > 0) {
      setSelectedLocation(LOCATIONS[0].id);
      console.log('📍 Auto-selected first location:', LOCATIONS[0].name);
    }
  }, [appState, selectedLocation]);

  // Dev shortcut: Press 'P' to jump directly to Premium Dashboard
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P') {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          console.log('🚀 Dev shortcut: Jumping to Premium Dashboard');
          setAppState('results');
          setSelectedLocation(LOCATIONS[0]?.id || null);
          setUsePremiumView(true);
          // Mark all agents as done for visual effect
          setActiveAgent(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

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

  const startAnalysis = async () => {
    setAppState('loading');
    setLoadingProgress(0);
    setActiveAgent(AGENTS[0].id);

    // Simulate progress for UI feedback
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = prev + 2;
        if (newProgress >= 100) {
          clearInterval(interval);
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

    try {
      // Call the API service to submit analysis request
      const response = await apiService.submitAnalysis({
        business_type: 'Boba Tea Shop',
        target_demo: 'Gen Z Students',
        budget: 8500,
        location_pref: 'Manhattan',
      });

      // Wait for progress animation to complete
      setTimeout(() => {
        clearInterval(interval);
        setAppState('results');
        setActiveAgent(null);
        // Update locations with real data if available
        if (response.locations && response.locations.length > 0) {
          // Locations would be updated here if we had a state for them
          console.log('Received locations:', response.locations);
        }
      }, 4000);
    } catch (error) {
      console.error('Analysis failed:', error);
      // Still show results with mock data on error
      setTimeout(() => {
        clearInterval(interval);
        setAppState('results');
        setActiveAgent(null);
      }, 4000);
    }
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-white flex items-center justify-center p-4 relative overflow-hidden">
        <SimpleBackground />

        {/* Login Card */}
        <div className="relative z-10 w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
          <div className="bg-white border border-slate-200 rounded-2xl p-10 shadow-lg">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-xl mb-5">
                <span className="text-3xl font-bold text-white">▲</span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 mb-2">
                VANTAGE
              </h1>
              <p className="text-slate-600 font-medium">Location Intelligence Platform</p>
              </div>
              
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  </div>
                </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-12 pr-14 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </motion.button>
                    </div>
                  </div>

                <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold text-base shadow-sm hover:shadow-md hover:bg-blue-600 transition-all"
                >
                  Sign In →
                </motion.button>

              <div className="text-center pt-2">
                <a href="#" className="text-sm text-slate-600 hover:text-blue-600 transition-colors font-medium hover:underline">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-white flex relative overflow-hidden">
      <SimpleBackground />

      {/* Collapsible Sidebar */}
      <aside
        style={{ width: sidebarCollapsed ? 80 : 280 }}
        className="relative z-30 bg-white border-r border-slate-200 shadow-sm flex flex-col transition-all duration-300"
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b-2 border-white/30 flex items-center justify-between">
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <motion.div
                className="w-12 h-12 bg-blue-300 rounded-2xl flex items-center justify-center shadow-xl neon-glow"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Target className="w-7 h-7 text-white drop-shadow-lg" />
              </motion.div>
              <span className="text-xl font-black text-slate-900">
                VANTAGE
              </span>
            </motion.div>
          )}
          <motion.button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2.5 hover:bg-blue-100 rounded-xl transition-all"
          >
            <ChevronLeft className={`w-5 h-5 text-slate-600 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
          </motion.button>
                  </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => setActiveTab(item.id as ActiveTab)}
                whileHover={{ scale: 1.03, x: 4 }}
                whileTap={{ scale: 0.97 }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold relative overflow-hidden ${
                  isActive
                    ? 'bg-blue-400 text-white shadow-xl neon-glow'
                    : 'text-slate-700 hover:bg-gradient-to-br hover:from-slate-100 hover:to-slate-50 hover:shadow-md'
                }`}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  />
                )}
                <Icon className="w-5 h-5 flex-shrink-0 relative z-10" />
                {!sidebarCollapsed && (
                  <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
                    className="relative z-10"
                  >
                    {item.label}
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t-2 border-white/30">
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              className="w-12 h-12 bg-blue-300 rounded-2xl flex items-center justify-center text-white font-black shadow-lg neon-glow"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              {!sidebarCollapsed ? 'JD' : 'J'}
            </motion.div>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1"
              >
                <p className="text-sm font-bold text-slate-900">John Doe</p>
                <p className="text-xs text-slate-600 font-semibold">john@example.com</p>
              </motion.div>
            )}
          </div>
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.03, x: 4 }}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-gradient-to-br hover:from-red-50 hover:to-orange-50 rounded-2xl transition-all font-bold hover:text-red-600"
          >
            <LogOut className="w-5 h-5" />
            {!sidebarCollapsed && <span>Logout</span>}
          </motion.button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm h-20 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <motion.h2
              key={activeTab}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-black text-slate-900 capitalize bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent"
            >
              {activeTab}
            </motion.h2>
          </div>
          <div className="flex items-center gap-3">
            {appState === 'results' && (
              <motion.button
                onClick={() => setUsePremiumView(!usePremiumView)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                  usePremiumView
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/50'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                {usePremiumView ? 'Premium View' : 'Classic View'}
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 hover:bg-blue-100 rounded-2xl transition-all relative"
            >
              <Bell className="w-5 h-5 text-slate-600" />
              <motion.span
                className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#EF4444] rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 hover:bg-blue-100 rounded-2xl transition-all"
            >
              <HelpCircle className="w-5 h-5 text-slate-600" />
            </motion.button>
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
                      <motion.div
                        className="text-center space-y-4 py-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <h1 className="text-5xl font-black tracking-tight text-slate-900">
                          Find Your Next Location
                        </h1>
                        <p className="text-xl text-slate-600 font-medium">Strategic site selection powered by AI</p>
              </motion.div>

                <motion.div
                  className="bg-white border border-slate-200 rounded-xl p-10 shadow-sm"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <InputForm onAnalyze={startAnalysis} isAnalyzing={false} />
              </motion.div>
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
                      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Analyzing Locations...</h3>
                            <span className="text-sm font-medium text-[#3B82F6]">{loadingProgress}%</span>
                  </div>
                          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${loadingProgress}%` }}
                    style={{ height: '100%', background: 'linear-gradient(to right, #3B82F6, #2563EB)', borderRadius: '9999px' }}
                  />
                </div>
                          <div className="pt-4">
                            <LinearPipeline
                              agents={AGENTS.map((agent, idx) => ({
                                name: agent.name,
                                status: activeAgent === agent.id ? 'active' : 
                                       AGENTS.findIndex(a => a.id === activeAgent) > idx ? 'done' : 'pending',
                                time: activeAgent === agent.id ? 'Running...' : undefined
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
              {usePremiumView ? (
                <PremiumDashboard
                  locations={LOCATIONS}
                  selectedLocationId={selectedLocation}
                  onLocationSelect={handleMarkerClick}
                  agents={AGENTS.map((agent, idx) => ({
                    id: agent.id,
                    name: agent.name,
                    status: activeAgent === agent.id ? 'active' : 
                           AGENTS.findIndex(a => a.id === activeAgent) > idx ? 'done' : 'idle',
                    time: idx === 0 ? '0.8s' : idx === 1 ? '1.2s' : idx === 2 ? '2.1s' : idx === 3 ? '1.5s' : '3.4s',
                  }))}
                  onReRun={startAnalysis}
                  onExportPDF={() => {
                    // TODO: Implement PDF export
                    console.log('Exporting PDF...');
                  }}
                  onShare={() => {
                    // TODO: Implement share functionality
                    console.log('Sharing analysis...');
                  }}
                />
              ) : (
                <div className="space-y-6">
                      {/* Bento-Grid Dashboard Layout */}
                      <div className="grid grid-cols-12 gap-4">
                        {/* Neural Mesh Workflow - Large Card */}
                        <div className="col-span-12 lg:col-span-8">
                          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">4 PARALLEL EXECUTION</div>
                                <h2 className="text-2xl font-black tracking-tight">Multi-Agent Synthesis</h2>
                                <p className="text-sm text-slate-600 mt-1">Vantage agents are analyzing Manhattan locations with precision.</p>
              </div>
                              <button
                                onClick={startAnalysis}
                                className="px-6 py-3 bg-blue-400 text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all flex items-center gap-2"
                              >
                                RE-RUN ANALYSIS →
                          </button>
                        </div>
                            <LinearPipeline
                              agents={AGENTS.map((agent, idx) => ({
                                name: agent.name,
                                status: activeAgent === agent.id ? 'active' : 
                                       AGENTS.findIndex(a => a.id === activeAgent) > idx ? 'done' : 'pending',
                                time: idx === 0 ? '0.8s' : idx === 1 ? '1.2s' : idx === 2 ? '2.1s' : idx === 3 ? '1.5s' : '3.4s'
                              }))}
                            />
                      </div>
                    </div>

                        {/* NYC Hyper-Density Card */}
                        {selectedLocationData && (
                          <div className="col-span-12 lg:col-span-4">
                            <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden h-full relative shadow-sm">
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
                          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
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
                          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
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
                              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
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
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
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
                                          className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 cursor-pointer hover:shadow-md transition-all"
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
                          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm sticky top-24">
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
                                        status === 'active' ? 'bg-[#3B82F6]/10 border-[#3B82F6] text-[#3B82F6] animate-pulse' :
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
              )}
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
                        className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md cursor-pointer transition-shadow"
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
                  <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
                    <h3 className="text-2xl font-bold mb-6">Analytics Dashboard</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-6 bg-blue-400 rounded-2xl text-white">
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
                      <div key={location.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-md cursor-pointer transition-shadow">
                        <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-semibold">{location.name} Analysis Report</h4>
                            <p className="text-sm text-slate-600">Generated 2 hours ago</p>
                          </div>
                          <button className="px-4 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] transition-colors">
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
