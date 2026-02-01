import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin,
  Search, 
  DollarSign,
  Users,
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
  EyeOff,
  Download,
  ChevronRight
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
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { apiService, type LocationResult } from '../services/api';
import { exportToPDF } from '../utils/pdfExport';
import { ComparisonView } from './components/ComparisonView';
import { AIInsights } from './components/AIInsights';
import { DemographicsTab } from './components/DemographicsTab';
import { CompetitorsTab } from './components/CompetitorsTab';
import { FinancialsTab } from './components/FinancialsTab';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { ReportsTab } from './components/ReportsTab';
import { SettingsTab } from './components/SettingsTab';
import { useTheme } from './contexts/ThemeContext';
import { Moon, Sun, LayoutDashboard, Plus } from 'lucide-react';
import { LocationCardSkeleton } from './components/LoadingSkeleton';

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
type DetailTab = 'overview' | 'demographics' | 'competitors' | 'financials' | 'insights' | 'comparison';

export default function Vantage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [appState, setAppState] = useState<AppState>('initial');
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>('overview');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [checklistStates, setChecklistStates] = useState<Record<number, boolean[]>>({});
  const [savedReports, setSavedReports] = useState<Array<{ id: number; locationId: number; generatedAt: Date }>>([]);
  const { theme, toggleTheme } = useTheme();

  // Generate report when analysis completes
  const generateReport = async (locationId: number) => {
    const location = LOCATIONS.find(l => l.id === locationId);
    if (!location) return;

    try {
      await exportToPDF({
        businessType: 'Boba Tea Shop',
        targetDemo: 'Gen Z Students',
        budget: 8500,
        location: {
          name: location.name,
          score: location.score,
          confidence: location.status,
          metrics: location.metrics.map(m => ({
            label: m.label,
            score: m.score,
            confidence: m.confidence
          })),
          competitors: location.competitors,
          revenue: location.revenue
        },
        generatedAt: new Date().toLocaleString()
      });
      
      // Save report to history
      setSavedReports(prev => [...prev, {
        id: Date.now(),
        locationId: location.id,
        generatedAt: new Date()
      }]);
      // Silent download - no toast
    } catch (error) {
      console.error('PDF export error:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

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
        // Show success toast
        const topLocation = LOCATIONS[0];
        toast.success('Analysis complete!', {
          description: `Found ${LOCATIONS.length} locations. ${topLocation.name} scored ${topLocation.score}/100 - Top pick`,
          duration: 4000,
        });
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        <SimpleBackground />

        {/* Login Card */}
        <div className="relative z-10 w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-10 shadow-lg">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl mb-5 shadow-lg shadow-amber-500/30 border border-amber-400/50">
                <MapPin className="w-8 h-8 text-white fill-current" />
              </div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">
                VANTAGE
              </h1>
              <p className="text-slate-600 dark:text-slate-300 font-medium">Location Intelligence Platform</p>
              </div>
              
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-amber-500 dark:group-focus-within:text-amber-400 transition-colors" />
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  />
                  </div>
                </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-amber-500 dark:group-focus-within:text-amber-400 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-12 pr-14 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                    </div>
                  </div>

                <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold text-base shadow-sm hover:shadow-md hover:from-amber-600 hover:to-amber-700 transition-all"
                onClick={(e) => {
                  e.preventDefault();
                  handleLogin(e);
                }}
              >
                  Sign In →
                </motion.button>

              <div className="text-center pt-2">
                <a href="#" className="text-sm text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium hover:underline">
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex relative overflow-hidden">
      <SimpleBackground />

      {/* Fixed Icon Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-20 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col items-center py-8 z-50">
            <motion.div
          className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/30 mb-12 border border-amber-400/50"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
          <MapPin className="w-6 h-6 fill-current" />
              </motion.div>
        
        <nav className="flex flex-col gap-8">
          {[
            { id: 'dashboard', icon: LayoutDashboard },
            { id: 'locations', icon: Map },
            { id: 'analytics', icon: BarChart3 },
            { id: 'reports', icon: FileText },
            { id: 'settings', icon: Settings }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => setActiveTab(item.id as ActiveTab)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`p-3 rounded-xl transition-all relative group ${
                  isActive
                    ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-6 h-6" />
                <div className="absolute left-full ml-4 px-2 py-1 bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-bold uppercase rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] border border-slate-700 dark:border-slate-600 shadow-lg">
                  {item.id}
                </div>
              </motion.button>
            );
          })}
        </nav>

          <motion.button
          className="mt-auto p-3 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
            onClick={handleLogout}
          >
          <LogOut className="w-6 h-6" />
          </motion.button>
      </aside>

      {/* Main Content */}
      <main className="ml-20 min-h-screen p-8 lg:p-12 bg-white dark:bg-slate-900">
        {/* Dashboard Header */}
        {activeTab === 'dashboard' && (
          <header className="flex justify-between items-end mb-12 animate-in fade-in duration-700">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">MANHATTAN DISTRICT</span>
          </div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight break-words">
                {appState === 'initial' ? 'Welcome to Vantage' : 'Location Intelligence'}
              </h1>
              <p className="text-slate-600 dark:text-slate-300 font-medium mt-1 break-words">
                {appState === 'initial' 
                  ? 'Select your parameters to begin site evaluation' 
                  : 'Advanced AI analysis for Boba Tea Shop expansion'}
              </p>
            </div>

            <div className="flex gap-4">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
              >
                <Search className="w-4 h-4" />
                History
            </motion.button>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setAppState('initial')}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-bold text-sm hover:from-amber-600 hover:to-amber-700 transition-all shadow-xl shadow-amber-500/30"
              >
                <Plus className="w-4 h-4" />
                New Analysis
            </motion.button>
          </div>
        </header>
        )}

        {/* Navigation Router View */}
        {activeTab === 'analytics' ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <AnalyticsDashboard />
          </motion.div>
        ) : activeTab === 'reports' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
            >
            <ReportsTab />
          </motion.div>
        ) : activeTab === 'settings' ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
                      >
            <SettingsTab />
              </motion.div>
        ) : activeTab === 'locations' ? (
                <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">All Locations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {LOCATIONS.map((location) => (
                  <motion.div
                    key={location.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                    onClick={() => {
                      setSelectedLocation(location.id);
                      setActiveTab('dashboard');
                      setAppState('results');
                    }}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-lg cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between mb-4 gap-2">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white truncate flex-1 min-w-0">{location.name}</h3>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 whitespace-nowrap ${
                        location.status === 'HIGH' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' :
                        location.status === 'MEDIUM' ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' :
                        'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400'
                      }`}>
                        {location.status}
              </div>
                    </div>
                    <div className="text-4xl font-black text-amber-600 dark:text-amber-400 mb-2 break-words">{location.score}/100</div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 break-words">Click to view detailed analysis</p>
            <motion.div
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-4 h-4 flex-shrink-0" />
                    </motion.div>
                  </motion.div>
                ))}
                </div>
                </div>
                    </motion.div>
        ) : (
            <motion.div
                key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-12 gap-8"
              >
            {/* Left Column: Form / Pipeline */}
            <div className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-8">
        <AnimatePresence mode="wait">
                {appState === 'initial' ? (
            <motion.div
                    key="form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <InputForm onAnalyze={startAnalysis} isAnalyzing={false} />
                    <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                      Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">⌘ Enter</kbd> to analyze
                        </div>
                  </motion.div>
                ) : (
                      <motion.div
                    key="pipeline"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <LinearPipeline
                              agents={AGENTS.map((agent, idx) => ({
                                name: agent.name,
                                status: activeAgent === agent.id ? 'active' : 
                               AGENTS.findIndex(a => a.id === activeAgent) > idx ? 'done' : 'pending',
                        time: activeAgent === agent.id ? 'Running...' : undefined
                      }))}
                    />
                    
                    {appState === 'results' && (
                      <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:bg-slate-900 text-slate-900 dark:text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden border border-amber-200 dark:border-slate-700">
                        <div className="relative z-10">
                          <Sparkles className="w-8 h-8 text-amber-600 dark:text-amber-400 mb-4" />
                          <h4 className="text-lg font-black mb-2">Vantage Score: {selectedLocationData?.score || 98}</h4>
                          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                            {selectedLocationData?.name || 'Chelsea Highline'} demonstrates elite potential with 95% foot traffic alignment for Boba Tea demographics.
                          </p>
                          <button 
                            onClick={async () => {
                              if (selectedLocationData) {
                                await generateReport(selectedLocationData.id);
                              } else {
                                toast.error('Select a location first');
                              }
                            }}
                            className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gradient-to-br from-amber-50 to-amber-100/500 transition-all shadow-lg shadow-amber-500/20"
                          >
                            <FileText className="w-4 h-4" />
                            Download Full Report
                                </button>
                          </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-50 to-amber-100/500/10 blur-3xl rounded-full translate-x-10 -translate-y-10" />
                        </div>
                        )}
            </motion.div>
          )}
              </AnimatePresence>
                          </div>

            {/* Right Column: Results / Visualization */}
            <div className="col-span-12 lg:col-span-8 xl:col-span-9 space-y-8">
              <AnimatePresence mode="wait">
                {appState === 'initial' ? (
            <motion.div
                    key="initial-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
                    className="h-[600px] relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700"
                  >
                    <SimpleBackground />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-white/80 dark:bg-slate-950/60 backdrop-blur-sm">
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="w-20 h-20 bg-amber-500/20 dark:bg-amber-500/10 backdrop-blur-xl rounded-3xl border border-amber-400/40 dark:border-amber-500/30 flex items-center justify-center mb-6 shadow-2xl"
                      >
                        <MapPin className="w-10 h-10 text-amber-600 dark:text-amber-400 fill-current" />
                      </motion.div>
                      <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter uppercase">Enter the Vantage Point</h2>
                      <p className="text-slate-700 dark:text-slate-200 max-w-md mx-auto leading-relaxed">
                        Analyze thousands of data points in seconds with our multi-agent intelligence layer. Trusted by Fortune 500 retail chains.
                      </p>
                          </div>
                  </motion.div>
                ) : appState === 'loading' ? (
                  <motion.div 
                    key="loading-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    <div className="col-span-full h-[400px]">
                      <LocationCardSkeleton />
                        </div>
                    {[1, 2, 3].map(i => (
                      <LocationCardSkeleton key={i} />
                    ))}
                    </motion.div>
                ) : (
            <motion.div
                    key="results-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    {/* Map and Results Split */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                      <div className="xl:col-span-2" style={{ minHeight: '600px', height: '600px' }}>
                            <MapView
                              markers={LOCATIONS}
                              onMarkerClick={handleMarkerClick}
                              selectedId={selectedLocation}
                            />
                      </div>
                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {LOCATIONS.map(loc => (
                          <div
                            key={loc.id}
                            onClick={() => setSelectedLocation(loc.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${
                              selectedLocation === loc.id
                                ? 'bg-amber-100 dark:bg-amber-500/20 border-amber-500 shadow-lg'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2 gap-2">
                              <h3 className="font-black text-slate-900 dark:text-white truncate flex-1 min-w-0">{loc.name}</h3>
                              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 flex-shrink-0">{loc.score}</div>
                    </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 break-words">{loc.status} confidence</p>
                  </div>
                      ))}
                    </div>
                  </div>

                    {/* Deep Analysis Tabs */}
                          {selectedLocationData && (
                            <motion.div
                        initial={{ opacity: 0, y: 40 }}
                              animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm"
                      >
                        <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto no-scrollbar gap-1">
                          {[
                            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                            { id: 'demographics', label: 'Demographics', icon: Users },
                            { id: 'competitors', label: 'Competitors', icon: Target },
                            { id: 'financials', label: 'Financials', icon: DollarSign },
                            { id: 'insights', label: 'AI Insights', icon: Sparkles },
                            { id: 'comparison', label: 'Compare', icon: TrendingUp }
                          ].map(tab => (
                            <motion.button
                              key={tab.id}
                              onClick={() => setDetailTab(tab.id as DetailTab)}
                              whileHover={{ y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              className={`flex items-center gap-2 px-5 py-4 text-sm font-bold transition-all relative whitespace-nowrap flex-shrink-0 ${
                                detailTab === tab.id 
                                  ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10' 
                                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                              }`}
                            >
                              <tab.icon className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate max-w-[120px]">{tab.label}</span>
                              {detailTab === tab.id && (
                                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500 rounded-t-full" />
                              )}
                            </motion.button>
                          ))}
                      </div>

                        <div className="p-8">
                          <AnimatePresence mode="wait">
                            {detailTab === 'overview' && (
                              <motion.div
                                key="overview"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="grid grid-cols-1 md:grid-cols-3 gap-8"
                              >
                                <div className="col-span-2">
                                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">Market Opportunity</h3>
                                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                                    {selectedLocationData.name} represents a high-conviction opportunity. The foot traffic density in this block is 140% higher than the neighborhood average, with a specific spike in Gen Z commuters during afternoon hours. This location sits at the intersection of three major transit lines.
                                  </p>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600">
                                      <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1 break-words">Catchment Area</div>
                                      <div className="text-lg font-black text-slate-900 dark:text-white break-words">2.4mi Radius</div>
                            </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600">
                                      <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1 break-words">Avg. Disposable Income</div>
                                      <div className="text-lg font-black text-slate-900 dark:text-white break-words">$4.2k/mo</div>
                          </div>
                        </div>
                      </div>
                                <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:bg-amber-500/10 p-6 rounded-2xl border border-amber-200 dark:border-amber-500/30">
                                  <h4 className="text-sm font-black text-amber-700 dark:text-amber-400 mb-4 uppercase tracking-widest break-words">Growth Forecast</h4>
                                  <div className="space-y-4">
                                    <div className="flex justify-between items-end h-32 gap-1">
                                      <div className="w-4 h-[20%] bg-amber-400 dark:bg-amber-500/30 rounded-t-sm flex-shrink-0" />
                                      <div className="w-4 h-[40%] bg-amber-500 dark:bg-amber-500/50 rounded-t-sm flex-shrink-0" />
                                      <div className="w-4 h-[60%] bg-amber-600 dark:bg-amber-500/70 rounded-t-sm flex-shrink-0" />
                                      <motion.div initial={{ height: 0 }} animate={{ height: '80%' }} className="w-4 bg-amber-600 dark:bg-amber-500 rounded-t-sm flex-shrink-0" />
                                      <div className="w-4 h-[95%] bg-amber-700 dark:bg-amber-600 rounded-t-sm flex-shrink-0" />
                      </div>
                                    <div className="text-center text-[10px] font-bold text-amber-700/70 dark:text-amber-400/70 uppercase break-words">Projected 5yr Revenue</div>
                    </div>
                  </div>
                    </motion.div>
                  )}

                            {detailTab === 'demographics' && (
                              <motion.div
                                key="demographics"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                              >
                                <DemographicsTab 
                                  locationName={selectedLocationData.name}
                                  demographics={selectedLocationData.demographics}
                                />
              </motion.div>
            )}

                            {detailTab === 'competitors' && (
              <motion.div
                                key="competitors"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                              >
                                <CompetitorsTab locationName={selectedLocationData.name} />
              </motion.div>
            )}

                            {detailTab === 'financials' && (
                    <motion.div 
                                key="financials"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                              >
                                <FinancialsTab 
                                  locationName={selectedLocationData.name} 
                                  baseRevenue={selectedLocationData.revenue?.[1]?.monthly || '$42,200'}
                                />
                    </motion.div>
                  )}

                            {detailTab === 'insights' && (
              <motion.div
                                key="insights"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                              >
                                <AIInsights locationName={selectedLocationData.name} score={selectedLocationData.score} />
            </motion.div>
            )}

                            {detailTab === 'comparison' && (
              <motion.div
                                key="comparison"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                              >
                                <ComparisonView locations={LOCATIONS} />
                              </motion.div>
                            )}
                          </AnimatePresence>
                      </div>
                      </motion.div>
                    )}
                    </motion.div>
                  )}
                </AnimatePresence>
            </div>
          </motion.div>
        )}
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <Toaster position="top-right" richColors />
    </div>
  );
}
