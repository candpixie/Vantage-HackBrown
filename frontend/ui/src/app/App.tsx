import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

// Type-safe motion components
const MotionButton = motion.button as any;
const MotionDiv = motion.div as any;
const MotionSpan = motion.span as any;
const MotionA = motion.a as any;

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
  ChevronRight,
  ImageIcon,
  Ruler
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
import { fetchListings, type RentCastListing } from '../services/nycData';
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
import { useAI } from './hooks/useAI';
import { Moon, Sun, LayoutDashboard, Plus } from 'lucide-react';
import { LocationCardSkeleton } from './components/LoadingSkeleton';

// Helper: convert lat/lng to x/y percentage (reverse of percentToLatLngArray)
function latLngToXY(lat: number, lng: number): { x: number; y: number } {
  const x = Math.max(0, Math.min(100, ((lng + 74.3) / 0.6) * 100));
  const y = Math.max(0, Math.min(100, ((lat - 40.5) / 0.4) * 100));
  return { x, y };
}

// Helper: generate a score based on listing attributes
function computeScore(listing: RentCastListing): number {
  let score = 70;
  if (listing.price && listing.price < 3000) score += 10;
  else if (listing.price && listing.price > 5000) score += 5;
  if (listing.sqft && listing.sqft > 800) score += 8;
  if (listing.bedrooms && listing.bedrooms >= 2) score += 5;
  // Add deterministic variation based on address
  let hash = 0;
  for (let i = 0; i < (listing.address || '').length; i++) {
    hash = ((hash << 5) - hash) + listing.address.charCodeAt(i);
    hash |= 0;
  }
  score += (Math.abs(hash) % 15);
  return Math.min(99, Math.max(60, score));
}

// Helper: convert RentCast listings to app location format
function listingsToLocations(listings: RentCastListing[]): LocationType[] {
  return listings
    .filter(l => l.lat && l.lng && l.price)
    .map((l, i) => {
      const { x, y } = latLngToXY(l.lat, l.lng);
      const score = computeScore(l);
      const status: 'HIGH' | 'MEDIUM' | 'LOW' = score >= 85 ? 'HIGH' : score >= 70 ? 'MEDIUM' : 'LOW';
      const price = l.price || 3000;
      const sqft = l.sqft || 800;
      const monthlyRev = Math.round(price * 3.5);
      const fmtMo = (n: number) => `$${(n / 1000).toFixed(1)}K`.replace('.0K', 'K');
      const fmtYr = (n: number) => `$${Math.round(n * 12 / 1000)}k`;
      const metricConfidence: 'HIGH' | 'MEDIUM' | 'LOW' = score > 80 ? 'HIGH' : 'MEDIUM';
      const rentConfidence: 'HIGH' | 'MEDIUM' | 'LOW' = price < 4000 ? 'HIGH' : 'MEDIUM';
      return {
        id: i + 1,
        name: l.address.split(',')[0] || `Location ${i + 1}`,
        score,
        x, y,
        lat: l.lat,
        lng: l.lng,
        status,
        address: l.address,
        rent_price: price,
        sqft,
        bedrooms: l.bedrooms ?? undefined,
        bathrooms: l.bathrooms ?? undefined,
        propertyType: l.propertyType || 'Commercial',
        metrics: [
          { label: 'Location Score', score: Math.min(99, score + 2), confidence: status },
          { label: 'Foot Traffic', score: Math.min(99, 60 + (Math.abs(x * y) % 30)), confidence: metricConfidence },
          { label: 'Transit Access', score: Math.min(99, 65 + (Math.abs(Math.round(x + y)) % 25)), confidence: 'MEDIUM' as const },
          { label: 'Rent Value', score: Math.min(99, price < 3000 ? 90 : price < 5000 ? 75 : 60), confidence: rentConfidence },
          { label: 'Space Utility', score: Math.min(99, sqft > 1000 ? 88 : sqft > 700 ? 75 : 65), confidence: 'MEDIUM' },
        ],
        competitors: [],
        revenue: [
          { scenario: 'Conservative', monthly: fmtMo(monthlyRev * 0.7), annual: fmtYr(monthlyRev * 0.7), margin: '20%' },
          { scenario: 'Moderate', monthly: fmtMo(monthlyRev), annual: fmtYr(monthlyRev), margin: '28%', isRecommended: true },
          { scenario: 'Optimistic', monthly: fmtMo(monthlyRev * 1.4), annual: fmtYr(monthlyRev * 1.4), margin: '34%' },
        ],
        checklist: [
          { text: 'Verify zoning permits for food service', completed: false },
          { text: 'Contact landlord for lease terms', completed: false },
          { text: 'Check foot traffic data for peak hours', completed: false },
          { text: 'Review competitor pricing strategy', completed: false },
          { text: 'Schedule site visit with realtor', completed: false },
        ],
      };
    });
}

// Location type definition
type LocationType = {
  id: number;
  name: string;
  score: number;
  x: number;
  y: number;
  status: 'HIGH' | 'MEDIUM' | 'LOW';
  address: string;
  rent_price: number;
  sqft: number;
  lat: number;
  lng: number;
  propertyType: string;
  bedrooms?: number;
  bathrooms?: number;
  metrics: Array<{ label: string; score: number; confidence: 'HIGH' | 'MEDIUM' | 'LOW' }>;
  competitors: Array<{ name: string; rating: number; reviews: number; distance: string; status: 'Open' | 'Closed'; weakness: string }>;
  revenue: Array<{ scenario: string; monthly: string; annual: string; margin: string; isRecommended?: boolean }>;
  checklist: Array<{ text: string; completed: boolean }>;
};

// Fallback mock data - NYC/Manhattan locations
const FALLBACK_LOCATIONS: LocationType[] = [
  {
    id: 1, name: '401 W 25th St', score: 98, x: 35, y: 45, status: 'HIGH',
    address: '401 W 25th St, Apt 3B, New York, NY 10001', rent_price: 4200, sqft: 1100, lat: 40.7490, lng: -74.0015, propertyType: 'Apartment', bedrooms: 2, bathrooms: 1,
    metrics: [
      { label: 'Elite Density', score: 98, confidence: 'HIGH' },
      { label: 'Net Disposable', score: 95, confidence: 'HIGH' },
      { label: 'Foot Velocity', score: 92, confidence: 'HIGH' },
      { label: 'Transit', score: 96, confidence: 'HIGH' },
      { label: 'Rent Alpha', score: 88, confidence: 'HIGH' }
    ],
    competitors: [
      { name: 'Blue Bottle Coffee', rating: 4.6, reviews: 1247, distance: '0.1 mi', status: 'Open', weakness: 'Premium pricing' },
      { name: 'Joe Coffee', rating: 4.4, reviews: 892, distance: '0.2 mi', status: 'Open', weakness: 'Limited seating' },
      { name: 'Stumptown Coffee', rating: 4.5, reviews: 1103, distance: '0.3 mi', status: 'Open', weakness: 'Crowded peak hours' }
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
  {
    id: 2, name: '82 Reade St', score: 89, x: 60, y: 55, status: 'HIGH',
    address: '82 Reade St, Apt 7A, New York, NY 10007', rent_price: 5500, sqft: 1350, lat: 40.7148, lng: -74.0064, propertyType: 'Loft', bedrooms: 2, bathrooms: 2,
    metrics: [
      { label: 'Elite Density', score: 92, confidence: 'HIGH' },
      { label: 'Net Disposable', score: 88, confidence: 'HIGH' },
      { label: 'Foot Velocity', score: 85, confidence: 'MEDIUM' },
      { label: 'Transit', score: 90, confidence: 'HIGH' },
      { label: 'Rent Alpha', score: 82, confidence: 'MEDIUM' }
    ],
    competitors: [
      { name: 'La Colombe', rating: 4.7, reviews: 2156, distance: '0.2 mi', status: 'Open', weakness: 'High-end positioning' },
      { name: 'Bluestone Lane', rating: 4.5, reviews: 1834, distance: '0.3 mi', status: 'Open', weakness: 'Australian focus' }
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
  {
    id: 3, name: '145 Spring St', score: 87, x: 50, y: 70, status: 'HIGH',
    address: '145 Spring St, Unit 2, New York, NY 10012', rent_price: 6800, sqft: 1500, lat: 40.7246, lng: -74.0012, propertyType: 'Retail', bedrooms: 0, bathrooms: 1,
    metrics: [
      { label: 'Elite Density', score: 94, confidence: 'HIGH' },
      { label: 'Net Disposable', score: 91, confidence: 'HIGH' },
      { label: 'Foot Velocity', score: 88, confidence: 'HIGH' },
      { label: 'Transit', score: 85, confidence: 'MEDIUM' },
      { label: 'Rent Alpha', score: 75, confidence: 'MEDIUM' }
    ],
    competitors: [
      { name: 'Cafe Gitane', rating: 4.6, reviews: 1923, distance: '0.2 mi', status: 'Open', weakness: 'French bistro style' },
      { name: 'Balthazar', rating: 4.4, reviews: 3456, distance: '0.4 mi', status: 'Open', weakness: 'Upscale dining' }
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
  const [locations, setLocations] = useState(FALLBACK_LOCATIONS);
  const { theme, toggleTheme } = useTheme();
  const {
    storefrontUrl, storefrontLoading, storefrontError, generateStorefront,
    floorplanUrl, floorplanLoading, floorplanError, generateFloorplan,
    resetPropertyAI,
  } = useAI();

  // Generate report when analysis completes
  const generateReport = async (locationId: number) => {
    const location = locations.find(l => l.id === locationId);
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
    } catch (error) {
      console.error('PDF export error:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  // Dev shortcut: Press 'P' to jump directly to Premium Dashboard
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P') {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          setAppState('results');
          setSelectedLocation(locations[0]?.id || null);
          setActiveAgent(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const selectedLocationData = selectedLocation ? locations.find(l => l.id === selectedLocation) : null;

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
      // Fetch real rental listings from RentCast API in parallel with backend
      const [response, rentcastListings] = await Promise.all([
        apiService.submitAnalysis({
          business_type: 'retail',
          target_demo: 'young professionals',
          budget: 15000,
        }),
        fetchListings(),
      ]);

      setTimeout(() => {
        clearInterval(interval);
        setAppState('results');
        setActiveAgent(null);

        // Priority 1: Use backend orchestrator results if available
        if (response.locations && response.locations.length > 0) {
          // Sort by score descending
          const backendLocations = [...response.locations].sort((a, b) => b.score - a.score);
          setLocations(backendLocations as typeof FALLBACK_LOCATIONS);
          console.log('Using backend orchestrator locations:', backendLocations.length);
          const topLoc = backendLocations[0];
          toast.success('Analysis complete!', {
            description: `Found ${backendLocations.length} locations from backend. ${topLoc.name} scored ${topLoc.score}/100 — $${topLoc.rent_price?.toLocaleString()}/mo`,
            duration: 4000,
          });
          return;
        }

        // Priority 2: Use real RentCast data if available
        if (rentcastListings && rentcastListings.length > 0) {
          const realLocations = listingsToLocations(rentcastListings);
          if (realLocations.length > 0) {
            // Sort by score descending
            realLocations.sort((a, b) => b.score - a.score);
            setLocations(realLocations);
            console.log('Using real RentCast listings:', realLocations.length);
            const topLoc = realLocations[0];
            toast.success('Analysis complete!', {
              description: `Found ${realLocations.length} real listings. ${topLoc.name} scored ${topLoc.score}/100 — $${topLoc.rent_price?.toLocaleString()}/mo`,
              duration: 4000,
            });
            return;
          }
        }

        // Fallback to mock data
        const topLocation = locations[0];
        toast.success('Analysis complete!', {
          description: `Found ${locations.length} locations. ${topLocation.name} scored ${topLocation.score}/100 - Top pick`,
          duration: 4000,
        });
      }, 4000);
    } catch (error) {
      console.error('Analysis failed:', error);
      setTimeout(() => {
        clearInterval(interval);
        setAppState('results');
        setActiveAgent(null);
      }, 4000);
    }
  };

  const handleMarkerClick = (id: number) => {
    setSelectedLocation(id);
    resetPropertyAI();
    if (!checklistStates[id]) {
      const location = locations.find(l => l.id === id);
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
    return checklistStates[locationId]?.[index] ?? locations.find(l => l.id === locationId)?.checklist[index]?.completed ?? false;
  };

  // Login Modal
  if (showLogin && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        <SimpleBackground />

        {/* Login Card */}
        <div className="relative z-10 w-full max-w-md">
          <MotionDiv
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-10 shadow-lg">
              <div className="text-center mb-10">
                <img src="/logo.png" alt="Vantage" className="w-16 h-16 rounded-xl mb-5 mx-auto shadow-lg" />
                <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">
                  VANTAGE
                </h1>
                <p className="text-slate-600 dark:text-slate-300 font-medium">Location Intelligence Platform</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-500 dark:group-focus-within:text-teal-400 transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-500 dark:group-focus-within:text-teal-400 transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-12 pr-14 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
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

                <MotionButton
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-semibold text-base shadow-sm hover:shadow-md hover:from-teal-600 hover:to-emerald-700 transition-all"
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    handleLogin(e as any);
                  }}
                >
                  Sign In →
                </MotionButton>

                <div className="text-center pt-2">
                  <a href="#" className="text-sm text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors font-medium hover:underline">
                    Forgot password?
                  </a>
                </div>
              </form>
            </div>
          </MotionDiv>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex relative overflow-hidden">
      <SimpleBackground />

      {/* Fixed Icon Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-20 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col items-center py-8 z-50">
        <MotionDiv
          className="w-12 h-12 flex items-center justify-center mb-12"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <img src="/logo.png" alt="Vantage" className="w-12 h-12 object-cover" />
        </MotionDiv>

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
              <MotionButton
                key={item.id}
                onClick={() => setActiveTab(item.id as ActiveTab)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`p-3 rounded-xl transition-all relative group ${isActive
                  ? 'bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
              >
                <Icon className="w-6 h-6" />
                <div className="absolute left-full ml-4 px-2 py-1 bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-bold uppercase rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100] border border-slate-700 dark:border-slate-600 shadow-lg">
                  {item.id}
                </div>
              </MotionButton>
            );
          })}
        </nav>

        <MotionButton
          className="mt-auto p-3 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleLogout}
        >
          <LogOut className="w-6 h-6" />
        </MotionButton>
      </aside>

      {/* Main Content */}
      <main className="ml-20 min-h-screen p-8 lg:p-12 bg-white dark:bg-slate-900 w-full">
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
              <MotionButton
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
              >
                <Search className="w-4 h-4" />
                History
              </MotionButton>
              <MotionButton
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setAppState('initial')}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-bold text-sm hover:from-teal-600 hover:to-emerald-700 transition-all shadow-xl shadow-teal-500/30"
              >
                <Plus className="w-4 h-4" />
                New Analysis
              </MotionButton>
            </div>
          </header>
        )}

        {/* Navigation Router View */}
        {activeTab === 'analytics' ? (
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <AnalyticsDashboard />
          </MotionDiv>
        ) : activeTab === 'reports' ? (
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <ReportsTab />
          </MotionDiv>
        ) : activeTab === 'settings' ? (
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <SettingsTab />
          </MotionDiv>
        ) : activeTab === 'locations' ? (
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">All Locations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {locations.map((location) => (
                  <MotionDiv
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
                      <div className={`px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 whitespace-nowrap ${location.status === 'HIGH' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' :
                        location.status === 'MEDIUM' ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' :
                          'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400'
                        }`}>
                        {location.status}
                      </div>
                    </div>
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-4xl font-black text-teal-600 dark:text-teal-400">{location.score}/100</span>
                      {location.rent_price && (
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">${location.rent_price.toLocaleString()}/mo</span>
                      )}
                    </div>
                    {location.address && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 mb-1 truncate flex items-center gap-1"><MapPin size={10} />{location.address}</p>
                    )}
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 break-words">
                      {location.sqft ? `${location.sqft.toLocaleString()} sqft` : ''}
                      {location.sqft && location.bedrooms ? ' · ' : ''}
                      {location.bedrooms ? `${location.bedrooms}BR` : ''}
                      {!location.sqft && !location.bedrooms ? 'Click to view detailed analysis' : ''}
                    </p>
                    <MotionDiv
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-2 text-xs font-bold text-teal-600 dark:text-teal-400 whitespace-nowrap"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-4 h-4 flex-shrink-0" />
                    </MotionDiv>
                  </MotionDiv>
                ))}
              </div>
            </div>
          </MotionDiv>
        ) : (
          <MotionDiv
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-12 gap-6 lg:gap-8"
          >
            {/* Left Column: Form / Pipeline */}
            <div className="col-span-12 lg:col-span-4 xl:col-span-3 space-y-6 lg:space-y-8">
              <AnimatePresence mode="wait">
                {appState === 'initial' ? (
                  <MotionDiv
                    key="form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <InputForm onAnalyze={startAnalysis} isAnalyzing={false} />
                    <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                      Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">⌘ Enter</kbd> to analyze
                    </div>
                  </MotionDiv>
                ) : (
                  <MotionDiv
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
                      <div className="bg-gradient-to-br from-teal-50 to-emerald-100/50 dark:bg-slate-900 text-slate-900 dark:text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden border border-teal-200 dark:border-slate-700">
                        <div className="relative z-10">
                          <Sparkles className="w-8 h-8 text-teal-600 dark:text-teal-400 mb-4" />
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
                            className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:from-teal-600 hover:to-emerald-700 transition-all shadow-lg shadow-teal-500/20"
                          >
                            <FileText className="w-4 h-4" />
                            Download Full Report
                          </button>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-400/10 to-emerald-500/10 blur-3xl rounded-full translate-x-10 -translate-y-10" />
                      </div>
                    )}
                  </MotionDiv>
                )}
              </AnimatePresence>
            </div>

            {/* Right Column: Results / Visualization - Full Width */}
            <div className="col-span-12 lg:col-span-8 xl:col-span-9 space-y-6 lg:space-y-8">
              <AnimatePresence mode="wait">
                {appState === 'initial' ? (
                  <MotionDiv
                    key="initial-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-[600px] relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700"
                  >
                    <SimpleBackground />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-white/80 dark:bg-slate-950/60 backdrop-blur-sm">
                      <MotionDiv
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="w-20 h-20 bg-teal-500/20 dark:bg-teal-500/10 backdrop-blur-xl rounded-3xl border border-teal-400/40 dark:border-teal-500/30 flex items-center justify-center mb-6 shadow-2xl"
                      >
                        <img src="/logo.png" alt="Vantage" className="w-12 h-12 rounded-lg" />
                      </MotionDiv>
                      <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter uppercase">Enter the Vantage Point</h2>
                      <p className="text-slate-700 dark:text-slate-200 max-w-md mx-auto leading-relaxed">
                        Analyze thousands of data points in seconds with our multi-agent intelligence layer. Trusted by Fortune 500 retail chains.
                      </p>
                    </div>
                  </MotionDiv>
                ) : appState === 'loading' ? (
                  <MotionDiv
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
                  </MotionDiv>
                ) : (
                  <MotionDiv
                    key="results-view"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Map - Full Width with popup detail sidebar built-in */}
                    <div style={{ minHeight: '650px', height: '650px' }}>
                      <MapView
                        markers={locations}
                        onMarkerClick={handleMarkerClick}
                        selectedId={selectedLocation}
                      />
                    </div>

                    {/* Storefront Visualizer - always visible below the map */}
                    <MotionDiv
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm"
                    >
                      {selectedLocationData ? (
                        <>
                          {/* Property info bar */}
                          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                              <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedLocationData.name}</h3>
                              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                {selectedLocationData.rent_price && (
                                  <span className="text-teal-600 dark:text-teal-400 font-bold">
                                    ${selectedLocationData.rent_price.toLocaleString()}/mo
                                  </span>
                                )}
                                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                                  <TrendingUp size={14} />Score: {selectedLocationData.score}/100
                                </span>
                              </div>
                            </div>
                            {selectedLocationData.address && (
                              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                                <MapPin size={10} />{selectedLocationData.address}
                                {selectedLocationData.sqft && <span> &middot; {selectedLocationData.sqft.toLocaleString()} sqft</span>}
                                {selectedLocationData.bedrooms && <span> &middot; {selectedLocationData.bedrooms}BR</span>}
                                {selectedLocationData.propertyType && <span> &middot; {selectedLocationData.propertyType}</span>}
                              </p>
                            )}
                          </div>

                          {/* 3-column grid: Revenue | Storefront | Floor Plan */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-100 dark:bg-slate-700">
                            {/* Revenue */}
                            <div className="bg-white dark:bg-slate-800 p-5 space-y-3">
                              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <TrendingUp size={13} /> Revenue Estimate
                              </h4>
                              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 px-4 py-3 space-y-1.5">
                                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                  {selectedLocationData.revenue?.[1]?.monthly || '$42,200'}/mo
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  Confidence:{' '}
                                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                    {selectedLocationData.revenue?.[1]?.isRecommended ? 'high' : 'medium'}
                                  </span>
                                </p>
                              </div>
                              <div className="space-y-2">
                                {selectedLocationData.revenue?.map((rev, idx) => (
                                  <div key={idx} className={`flex items-center justify-between text-sm px-2 py-1.5 rounded-lg ${rev.isRecommended ? 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20' : ''}`}>
                                    <span className="text-slate-500 dark:text-slate-400 text-xs">{rev.scenario}</span>
                                    <div className="text-right">
                                      <span className="font-bold text-slate-800 dark:text-white text-xs">{rev.monthly}/mo</span>
                                      <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-2">{rev.annual}/yr</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Storefront */}
                            <div className="bg-white dark:bg-slate-800 p-5 space-y-3">
                              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <ImageIcon size={13} /> Storefront Mockup
                              </h4>
                              {storefrontUrl ? (
                                <img src={storefrontUrl} alt="AI Storefront" className="w-full aspect-[4/3] rounded-lg object-cover" />
                              ) : (
                                <div className="w-full aspect-[4/3] rounded-lg bg-slate-50 dark:bg-slate-700 border border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center gap-2">
                                  {storefrontLoading ? (
                                    <>
                                      <Loader2 size={28} className="text-sky-400 animate-spin" />
                                      <span className="text-xs text-slate-400 dark:text-slate-500">Generating with DALL-E 3...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles size={28} className="text-slate-300 dark:text-slate-500" />
                                      <span className="text-xs text-slate-400 dark:text-slate-500">DALL-E generated storefront</span>
                                      <span className="text-[10px] text-slate-300 dark:text-slate-600">Based on address &amp; property type</span>
                                    </>
                                  )}
                                </div>
                              )}
                              {storefrontError && (
                                <p className="text-xs text-red-500">{storefrontError}</p>
                              )}
                              <button
                                onClick={() => generateStorefront(selectedLocationData.address || selectedLocationData.name, 'Boba Tea Shop', selectedLocationData.sqft, selectedLocationData.propertyType)}
                                disabled={storefrontLoading}
                                className={`w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white cursor-pointer transition-colors ${storefrontLoading ? 'bg-sky-300 cursor-not-allowed' : 'bg-sky-500 hover:bg-sky-600'}`}
                              >
                                {storefrontLoading ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
                                {storefrontLoading ? 'Generating...' : storefrontUrl ? 'Regenerate' : 'Visualize Storefront'}
                              </button>
                            </div>

                            {/* Floor Plan */}
                            <div className="bg-white dark:bg-slate-800 p-5 space-y-3">
                              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Ruler size={13} /> Architectural Layout
                              </h4>
                              {floorplanUrl ? (
                                <img src={floorplanUrl} alt="AI Floor Plan" className="w-full aspect-[4/3] rounded-lg object-cover" />
                              ) : (
                                <div className="w-full aspect-[4/3] rounded-lg bg-slate-50 dark:bg-slate-700 border border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center gap-2">
                                  {floorplanLoading ? (
                                    <>
                                      <Loader2 size={28} className="text-emerald-400 animate-spin" />
                                      <span className="text-xs text-slate-400 dark:text-slate-500">Generating with DALL-E 3...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Ruler size={28} className="text-slate-300 dark:text-slate-500" />
                                      <span className="text-xs text-slate-400 dark:text-slate-500">DALL-E generated floor plan</span>
                                      <span className="text-[10px] text-slate-300 dark:text-slate-600">Based on sqft &amp; property type</span>
                                    </>
                                  )}
                                </div>
                              )}
                              {floorplanError && (
                                <p className="text-xs text-red-500">{floorplanError}</p>
                              )}
                              <button
                                onClick={() => generateFloorplan(selectedLocationData.sqft || 2000, 'Boba Tea Shop', selectedLocationData.address)}
                                disabled={floorplanLoading}
                                className={`w-full flex items-center justify-center gap-2 rounded-lg border border-emerald-600 px-4 py-2.5 text-sm font-medium text-white cursor-pointer transition-colors ${floorplanLoading ? 'bg-emerald-300 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                              >
                                {floorplanLoading ? <Loader2 size={14} className="animate-spin" /> : <Ruler size={14} />}
                                {floorplanLoading ? 'Generating...' : floorplanUrl ? 'Regenerate' : 'Generate Floor Plan'}
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="px-6 py-12 flex flex-col items-center justify-center text-center">
                          <Building2 size={48} className="text-slate-200 dark:text-slate-600 mb-3" />
                          <p className="text-sm text-slate-400 dark:text-slate-500">Select a property on the map to view AI visualizations</p>
                        </div>
                      )}
                    </MotionDiv>

                    {/* Deep Analysis Tabs */}
                    {selectedLocationData && (
                      <MotionDiv
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
                            <MotionButton
                              key={tab.id}
                              onClick={() => setDetailTab(tab.id as DetailTab)}
                              whileHover={{ y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              className={`flex items-center gap-2 px-5 py-4 text-sm font-bold transition-all relative whitespace-nowrap flex-shrink-0 ${detailTab === tab.id
                                ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                }`}
                            >
                              <tab.icon className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate max-w-[120px]">{tab.label}</span>
                              {detailTab === tab.id && (
                                <MotionDiv layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-teal-500 rounded-t-full" />
                              )}
                            </MotionButton>
                          ))}
                        </div>

                        <div className="p-8">
                          <AnimatePresence mode="wait">
                            {detailTab === 'overview' && (
                              <MotionDiv
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
                                <div className="bg-gradient-to-br from-teal-50 to-emerald-100/50 dark:bg-teal-500/10 p-6 rounded-2xl border border-teal-200 dark:border-teal-500/30">
                                  <h4 className="text-sm font-black text-teal-700 dark:text-teal-400 mb-4 uppercase tracking-widest break-words">Growth Forecast</h4>
                                  <div className="space-y-4">
                                    <div className="flex justify-between items-end h-32 gap-1">
                                      <div className="w-4 h-[20%] bg-teal-400 dark:bg-teal-500/30 rounded-t-sm flex-shrink-0" />
                                      <div className="w-4 h-[40%] bg-teal-500 dark:bg-teal-500/50 rounded-t-sm flex-shrink-0" />
                                      <div className="w-4 h-[60%] bg-emerald-500 dark:bg-emerald-500/70 rounded-t-sm flex-shrink-0" />
                                      <MotionDiv initial={{ height: 0 }} animate={{ height: '80%' }} className="w-4 bg-emerald-600 dark:bg-emerald-500 rounded-t-sm flex-shrink-0" />
                                      <div className="w-4 h-[95%] bg-emerald-700 dark:bg-emerald-600 rounded-t-sm flex-shrink-0" />
                                    </div>
                                    <div className="text-center text-[10px] font-bold text-teal-700/70 dark:text-teal-400/70 uppercase break-words">Projected 5yr Revenue</div>
                                  </div>
                                </div>
                              </MotionDiv>
                            )}

                            {detailTab === 'demographics' && (
                              <MotionDiv
                                key="demographics"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                              >
                                <DemographicsTab
                                  locationName={selectedLocationData.name}
                                  demographics={(selectedLocationData as any).demographics}
                                />
                              </MotionDiv>
                            )}

                            {detailTab === 'competitors' && (
                              <MotionDiv
                                key="competitors"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                              >
                                <CompetitorsTab locationName={selectedLocationData.name} />
                              </MotionDiv>
                            )}

                            {detailTab === 'financials' && (
                              <MotionDiv
                                key="financials"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                              >
                                <FinancialsTab
                                  locationName={selectedLocationData.name}
                                  baseRevenue={selectedLocationData.revenue?.[1]?.monthly || '$42,200'}
                                  visaData={{
                                    dataSource: (selectedLocationData as any).dataSource || 'Industry-standard benchmarks',
                                    merchantCount: (selectedLocationData as any).merchantCount || 0,
                                    confidence: (selectedLocationData as any).confidence || selectedLocationData.status?.toLowerCase() || 'medium',
                                    assumptions: (selectedLocationData as any).assumptions || []
                                  }}
                                />
                              </MotionDiv>
                            )}

                            {detailTab === 'insights' && (
                              <MotionDiv
                                key="insights"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                              >
                                <AIInsights locationName={selectedLocationData.name} score={selectedLocationData.score} />
                              </MotionDiv>
                            )}

                            {detailTab === 'comparison' && (
                              <MotionDiv
                                key="comparison"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                              >
                                <ComparisonView locations={locations} />
                              </MotionDiv>
                            )}
                          </AnimatePresence>
                        </div>
                      </MotionDiv>
                    )}
                  </MotionDiv>
                )}
              </AnimatePresence>
            </div>
          </MotionDiv>
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
