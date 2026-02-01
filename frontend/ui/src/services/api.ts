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
  // Additional fields from backend
  rent_price?: number;
  address?: string;
  lat?: number;
  lng?: number;
  sqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
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
        status: 'HIGH',
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
        status: 'HIGH',
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
        status: 'HIGH',
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
