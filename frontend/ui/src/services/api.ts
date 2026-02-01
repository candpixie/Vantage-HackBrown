// API Service for backend agent communication
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8020';

export interface AnalyzeRequest {
  business_type: string;
  target_demo: string;
  budget: number;
}

export interface LocationMetric {
  label: string;
  score: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface Competitor {
  name: string;
  rating: number;
  reviews: number;
  distance: string;
  status: 'Open' | 'Closed';
  weakness: string;
}

export interface RevenueProjection {
  scenario: string;
  monthly: string;
  annual: string;
  margin: string;
  isRecommended?: boolean;
}

export interface LocationResult {
  id: number;
  name: string;
  score: number;
  x: number;
  y: number;
  status: 'HIGH' | 'MEDIUM' | 'LOW';
  metrics: LocationMetric[];
  competitors: Competitor[];
  revenue: RevenueProjection[];
  checklist: { text: string; completed: boolean }[];
  // Required fields for map display
  rent_price: number;
  address: string;
  lat: number;
  lng: number;
  sqft: number;
  propertyType: string;
  // Optional fields
  bedrooms?: number;
  bathrooms?: number;
  demographics?: {
    median_income?: number;
    median_age?: number;
    population_density?: number;
    household_size?: number;
  };
  magic_number?: number;
}

export interface AgentProgress {
  agent_id: string;
  agent_name: string;
  status: 'idle' | 'active' | 'done';
  progress: number;
  message?: string;
}

export interface AnalysisResponse {
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  active_agent?: string;
  agent_statuses: AgentProgress[];
  locations: LocationResult[];
  error?: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Submit an analysis request to the Flask bridge server
   */
  async submitAnalysis(request: AnalyzeRequest): Promise<AnalysisResponse> {
    try {
      // Build query string from request parameters
      const params = new URLSearchParams({
        type: request.business_type,
        demo: request.target_demo,
        budget: request.budget.toString(),
      });

      const response = await fetch(`${this.baseUrl}/submit?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformBackendResponse(data);
    } catch (error) {
      console.error('API Error:', error);
      // Return mock data as fallback when backend is not available
      return this.getMockResponse();
    }
  }

  /**
   * Poll for analysis status and progress
   */
  async getAnalysisStatus(requestId: string): Promise<AnalysisResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/status/${requestId}`);

      if (!response.ok) {
        throw new Error(`Status request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformBackendResponse(data);
    } catch (error) {
      console.error('Status Error:', error);
      return this.getMockResponse();
    }
  }

  /**
   * Transform backend response to frontend format
   */
  private transformBackendResponse(data: any): AnalysisResponse {
    // Check if we have results from the orchestrator API
    if (data.results && Array.isArray(data.results)) {
      const locations = this.transformOrchestratorResults(data.results);
      return {
        status: 'completed',
        progress: 100,
        active_agent: undefined,
        agent_statuses: [],
        locations: locations.length > 0 ? locations : this.getMockLocations(),
      };
    }

    // Map backend data structure to frontend expected structure
    return {
      status: data.status || 'completed',
      progress: data.progress || 100,
      active_agent: data.active_agent,
      agent_statuses: data.agent_statuses || [],
      locations: data.locations || this.getMockLocations(),
    };
  }

  /**
   * Transform orchestrator results from backend to LocationResult format
   */
  private transformOrchestratorResults(results: any[]): LocationResult[] {
    return results.map((result, index) => {
      const { id, request, location_analysis, competitor_analysis, revenue_projection, overall_score } = result;

      // Convert lat/lng to x/y percentage for map display
      const x = Math.max(0, Math.min(100, ((request.longitude + 74.3) / 0.6) * 100));
      const y = Math.max(0, Math.min(100, ((request.latitude - 40.5) / 0.4) * 100));

      // Determine status based on overall score
      const status: 'HIGH' | 'MEDIUM' | 'LOW' =
        overall_score >= 75 ? 'HIGH' : overall_score >= 50 ? 'MEDIUM' : 'LOW';

      // Build metrics from location and competitor analysis
      const metrics: LocationMetric[] = [
        {
          label: 'Location Score',
          score: location_analysis?.score || 0,
          confidence: (location_analysis?.confidence?.toUpperCase() || 'LOW') as 'HIGH' | 'MEDIUM' | 'LOW'
        },
        {
          label: 'Foot Traffic',
          score: location_analysis?.breakdown?.foot_traffic?.score || 0,
          confidence: (location_analysis?.confidence?.toUpperCase() || 'LOW') as 'HIGH' | 'MEDIUM' | 'LOW'
        },
        {
          label: 'Transit Access',
          score: location_analysis?.breakdown?.transit_access?.score || 0,
          confidence: (location_analysis?.confidence?.toUpperCase() || 'LOW') as 'HIGH' | 'MEDIUM' | 'LOW'
        },
        {
          label: 'Competition',
          score: competitor_analysis?.score || 0,
          confidence: (competitor_analysis?.confidence?.toUpperCase() || 'LOW') as 'HIGH' | 'MEDIUM' | 'LOW'
        },
        {
          label: 'Overall',
          score: overall_score || 0,
          confidence: status
        },
      ];

      // Build competitors list from competitor analysis
      const competitors: Competitor[] = (competitor_analysis?.breakdown?.competitors || []).map((c: any) => ({
        name: c.name || 'Unknown',
        rating: c.rating || 0,
        reviews: c.reviews || 0,
        distance: c.distance ? `${c.distance.toFixed(2)} mi` : 'N/A',
        status: 'Open' as const,
        weakness: c.weakness || 'N/A',
      }));

      // Build revenue projections
      const formatMoney = (n: number) => {
        if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`.replace('.0K', 'K');
        return `$${n}`;
      };

      const revenue: RevenueProjection[] = [
        {
          scenario: 'Conservative',
          monthly: formatMoney(revenue_projection?.conservative || 0),
          annual: formatMoney((revenue_projection?.conservative || 0) * 12),
          margin: '20%'
        },
        {
          scenario: 'Moderate',
          monthly: formatMoney(revenue_projection?.moderate || 0),
          annual: formatMoney((revenue_projection?.moderate || 0) * 12),
          margin: '28%',
          isRecommended: true
        },
        {
          scenario: 'Optimistic',
          monthly: formatMoney(revenue_projection?.optimistic || 0),
          annual: formatMoney((revenue_projection?.optimistic || 0) * 12),
          margin: '34%'
        },
      ];

      const locationResult: LocationResult = {
        id: id || index + 1,
        name: request?.neighborhood || `Location ${id || index + 1}`,
        score: overall_score || 0,
        x,
        y,
        status,
        metrics,
        competitors,
        revenue,
        checklist: [
          { text: 'Verify zoning permits for food service', completed: false },
          { text: 'Contact landlord for lease terms', completed: false },
          { text: 'Check foot traffic data for peak hours', completed: false },
          { text: 'Review competitor pricing strategy', completed: false },
          { text: 'Schedule site visit with realtor', completed: false },
        ],
        rent_price: request?.rent_estimate || 5000,
        address: request?.neighborhood || `Location ${id || index + 1}`,
        lat: request?.latitude || 40.7128,
        lng: request?.longitude || -74.006,
        sqft: 1000, // Default estimate for commercial space
        propertyType: 'Commercial',
        demographics: {
          median_income: undefined,
          median_age: undefined,
          population_density: undefined,
          household_size: undefined,
        },
      };
      return locationResult;
    });
  }

  /**
   * Generate mock data when backend is unavailable (for development)
   */
  private getMockResponse(): AnalysisResponse {
    return {
      status: 'completed',
      progress: 100,
      agent_statuses: [
        { agent_id: 'orchestrator', agent_name: 'Neural Core', status: 'done', progress: 100 },
        { agent_id: 'scout', agent_name: 'Geo-Scanner', status: 'done', progress: 100 },
        { agent_id: 'intel', agent_name: 'Ghost Intel', status: 'done', progress: 100 },
        { agent_id: 'analyst', agent_name: 'Market Analyst', status: 'done', progress: 100 },
        { agent_id: 'visualizer', agent_name: 'Optic Render', status: 'done', progress: 100 },
      ],
      locations: this.getMockLocations(),
    };
  }

  /**
   * Mock locations for development/fallback
   */
  private getMockLocations(): LocationResult[] {
    return [
      {
        id: 1,
        name: 'Chelsea Highline',
        score: 98,
        x: 35,
        y: 45,
        lat: 40.7490,
        lng: -74.0015,
        status: 'HIGH',
        address: '401 W 25th St, New York, NY 10001',
        rent_price: 4200,
        sqft: 1100,
        propertyType: 'Commercial',
        metrics: [
          { label: 'Elite Density', score: 98, confidence: 'HIGH' },
          { label: 'Net Disposable', score: 95, confidence: 'HIGH' },
          { label: 'Foot Velocity', score: 92, confidence: 'HIGH' },
          { label: 'Transit', score: 96, confidence: 'HIGH' },
          { label: 'Rent Alpha', score: 88, confidence: 'HIGH' },
        ],
        competitors: [
          { name: 'Blue Bottle Coffee', rating: 4.6, reviews: 1247, distance: '0.1 mi', status: 'Open', weakness: 'Premium pricing' },
          { name: 'Joe Coffee', rating: 4.4, reviews: 892, distance: '0.2 mi', status: 'Open', weakness: 'Limited seating' },
          { name: 'Stumptown Coffee', rating: 4.5, reviews: 1103, distance: '0.3 mi', status: 'Open', weakness: 'Crowded peak hours' },
        ],
        revenue: [
          { scenario: 'Conservative', monthly: '$28,500', annual: '$342k', margin: '22%' },
          { scenario: 'Moderate', monthly: '$42,200', annual: '$506k', margin: '28%', isRecommended: true },
          { scenario: 'Optimistic', monthly: '$58,800', annual: '$706k', margin: '32%' },
        ],
        checklist: [
          { text: 'Verify zoning permits for food service', completed: false },
          { text: 'Contact landlord for lease terms', completed: false },
          { text: 'Check foot traffic data for peak hours', completed: true },
          { text: 'Review competitor pricing strategy', completed: false },
          { text: 'Schedule site visit with realtor', completed: false },
        ],
      },
      {
        id: 2,
        name: 'Tribeca',
        score: 89,
        x: 60,
        y: 55,
        lat: 40.7148,
        lng: -74.0064,
        status: 'HIGH',
        address: '82 Reade St, New York, NY 10007',
        rent_price: 5500,
        sqft: 1350,
        propertyType: 'Loft',
        metrics: [
          { label: 'Elite Density', score: 92, confidence: 'HIGH' },
          { label: 'Net Disposable', score: 88, confidence: 'HIGH' },
          { label: 'Foot Velocity', score: 85, confidence: 'MEDIUM' },
          { label: 'Transit', score: 90, confidence: 'HIGH' },
          { label: 'Rent Alpha', score: 82, confidence: 'MEDIUM' },
        ],
        competitors: [
          { name: 'La Colombe', rating: 4.7, reviews: 2156, distance: '0.2 mi', status: 'Open', weakness: 'High-end positioning' },
          { name: 'Bluestone Lane', rating: 4.5, reviews: 1834, distance: '0.3 mi', status: 'Open', weakness: 'Australian focus' },
        ],
        revenue: [
          { scenario: 'Conservative', monthly: '$32,500', annual: '$390k', margin: '24%' },
          { scenario: 'Moderate', monthly: '$45,800', annual: '$550k', margin: '30%', isRecommended: true },
          { scenario: 'Optimistic', monthly: '$62,400', annual: '$749k', margin: '34%' },
        ],
        checklist: [
          { text: 'Verify zoning permits for food service', completed: false },
          { text: 'Contact landlord for lease terms', completed: false },
          { text: 'Check foot traffic data for peak hours', completed: false },
          { text: 'Review competitor pricing strategy', completed: false },
          { text: 'Schedule site visit with realtor', completed: false },
        ],
      },
      {
        id: 3,
        name: 'SoHo',
        score: 87,
        x: 50,
        y: 70,
        lat: 40.7246,
        lng: -74.0012,
        status: 'HIGH',
        address: '145 Spring St, New York, NY 10012',
        rent_price: 6800,
        sqft: 1500,
        propertyType: 'Retail',
        metrics: [
          { label: 'Elite Density', score: 94, confidence: 'HIGH' },
          { label: 'Net Disposable', score: 91, confidence: 'HIGH' },
          { label: 'Foot Velocity', score: 88, confidence: 'HIGH' },
          { label: 'Transit', score: 85, confidence: 'MEDIUM' },
          { label: 'Rent Alpha', score: 75, confidence: 'MEDIUM' },
        ],
        competitors: [
          { name: 'Café Gitane', rating: 4.6, reviews: 1923, distance: '0.2 mi', status: 'Open', weakness: 'French bistro style' },
          { name: 'Balthazar', rating: 4.4, reviews: 3456, distance: '0.4 mi', status: 'Open', weakness: 'Upscale dining' },
        ],
        revenue: [
          { scenario: 'Conservative', monthly: '$35,200', annual: '$422k', margin: '26%' },
          { scenario: 'Moderate', monthly: '$48,600', annual: '$583k', margin: '31%', isRecommended: true },
          { scenario: 'Optimistic', monthly: '$65,800', annual: '$790k', margin: '35%' },
        ],
        checklist: [
          { text: 'Verify zoning permits for food service', completed: false },
          { text: 'Contact landlord for lease terms', completed: false },
          { text: 'Check foot traffic data for peak hours', completed: false },
          { text: 'Review competitor pricing strategy', completed: false },
          { text: 'Schedule site visit with realtor', completed: false },
        ],
      },
    ];
  }

  /**
   * Check if backend is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();
