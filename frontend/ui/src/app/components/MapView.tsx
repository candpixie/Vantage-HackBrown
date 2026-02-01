import React, { useState } from 'react';
import GoogleMapView from './GoogleMapView';
import { MapSidebar, MapDetailPanel } from './MapSidebar';
import { MapPropertyList } from './MapPropertyList';
import type { LocationResult } from '../../services/api';

interface MapViewProps {
  markers: Array<{
    id: number;
    name: string;
    score: number;
    x: number;
    y: number;
    status: 'HIGH' | 'MEDIUM' | 'LOW';
    metrics?: Array<{ label: string; score: number; confidence: string }>;
    competitors?: Array<any>;
    revenue?: Array<any>;
    rent_price?: number;
    address?: string;
    demographics?: any;
  }>;
  onMarkerClick: (id: number) => void;
  selectedId: number | null;
}

export const MapView: React.FC<MapViewProps> = ({ markers, onMarkerClick, selectedId }) => {
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [bottomListCollapsed, setBottomListCollapsed] = useState(true); // Start collapsed
  const [colorMode, setColorMode] = useState('none');
  const [hoveredNeighborhood, setHoveredNeighborhood] = useState<any>(null);
  const [neighborhoods, setNeighborhoods] = useState<any>(null);

  // Fetch neighborhood GeoJSON data
  React.useEffect(() => {
    const fetchNeighborhoods = async () => {
      try {
        // Try to load from public data folder
        const response = await fetch('/data/neighborhoods.geojson');
        if (response.ok) {
          const data = await response.json();
          console.log('MapView: Loaded neighborhoods from /data', data);
          // Normalize the data for heatmap rendering
          const normalized = normalizeNeighborhoodData(data);
          console.log('MapView: Normalized neighborhoods', normalized);
          setNeighborhoods(normalized);
          return;
        }
      } catch (error) {
        console.warn('Could not load from /data, trying backend path', error);
      }
      
      try {
        // Try backend data path
        const response = await fetch('http://localhost:8020/data/neighborhoods.geojson');
        if (response.ok) {
          const data = await response.json();
          const normalized = normalizeNeighborhoodData(data);
          setNeighborhoods(normalized);
          return;
        }
      } catch (error) {
        console.warn('Could not load neighborhoods data, using mock data', error);
      }
      
      // Fallback: create mock normalized data
      console.log('MapView: Using mock neighborhoods data');
      const mockData = createMockNeighborhoods();
      console.log('MapView: Created mock neighborhoods', mockData);
      setNeighborhoods(mockData);
    };
    fetchNeighborhoods();
  }, []);

  // Normalize neighborhood data for heatmap
  const normalizeNeighborhoodData = React.useCallback((geojson: any) => {
    if (!geojson?.features || !Array.isArray(geojson.features)) {
      console.warn('MapView: No features in geojson', geojson);
      return geojson;
    }
    
    console.log('MapView: Normalizing', geojson.features.length, 'features');
    
    // First pass: collect all values to calculate min/max for proper normalization
    const allPopulations: number[] = [];
    const allIncomes: number[] = [];
    const allAges: number[] = [];
    
    // Generate synthetic values if no demographic data exists
    // Use a deterministic hash based on neighborhood name/ID for consistency
    const hash = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash);
    };
    
    const features = geojson.features.map((f: any, index: number) => {
      const props = f.properties || {};
      const ntaName = props.ntaname || props.nta2020 || `neighborhood_${index}`;
      const hashValue = hash(ntaName);
      
      // Try to get actual data first
      let population = props.population || props.pop || props.POPULATION || 0;
      let income = props.income || props.median_income || props.INCOME || props.Median_Income || 0;
      let age = props.medianAge || props.median_age || props.Median_Age || 0;
      
      // If no actual data, generate synthetic values based on hash for consistency
      if (population === 0) {
        population = 15000 + (hashValue % 30000); // Range: 15k-45k
      }
      if (income === 0) {
        income = 60000 + (hashValue % 90000); // Range: 60k-150k
      }
      if (age === 0) {
        age = 32 + (hashValue % 18); // Range: 32-50
      }
      
      // Normalize values (0-1 range) - use fixed ranges for consistency
      const popNorm = Math.min(1, Math.max(0, population / 50000));
      const incNorm = Math.min(1, Math.max(0, income / 150000));
      const ageNorm = Math.min(1, Math.max(0, age / 50));
      
      return {
        ...f,
        properties: {
          ...props,
          population,
          income,
          medianAge: age,
          popNorm,
          incNorm,
          ageNorm,
        },
      };
    });
    
    console.log('MapView: Normalized features', { 
      count: features.length, 
      sample: features[0]?.properties,
      sampleNorms: features[0]?.properties ? {
        popNorm: features[0].properties.popNorm,
        incNorm: features[0].properties.incNorm,
        ageNorm: features[0].properties.ageNorm,
      } : null
    });
    
    return { ...geojson, features };
  }, []);

  // Create mock neighborhoods for demo
  const createMockNeighborhoods = React.useCallback(() => {
    // Create a simple grid of neighborhoods around NYC
    const features = [];
    for (let i = 0; i < 30; i++) {
      const lat = 40.5 + (i % 6) * 0.06;
      const lng = -74.3 + Math.floor(i / 6) * 0.1;
      const population = 10000 + Math.random() * 30000;
      const income = 50000 + Math.random() * 100000;
      const age = 30 + Math.random() * 20;
      
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [lng, lat],
            [lng + 0.04, lat],
            [lng + 0.04, lat + 0.04],
            [lng, lat + 0.04],
            [lng, lat],
          ]],
        },
        properties: {
          ntaname: `Neighborhood ${i + 1}`,
          population,
          income,
          medianAge: age,
          // Pre-normalize for consistency
          popNorm: Math.min(1, population / 40000),
          incNorm: Math.min(1, income / 150000),
          ageNorm: Math.min(1, age / 50),
        },
      });
    }
    console.log('MapView: Created mock neighborhoods', { count: features.length });
    return { type: 'FeatureCollection', features };
  }, []);

  // Convert markers to LocationResult format for GoogleMapView
  const locations: LocationResult[] = markers.map((marker) => ({
    id: marker.id,
    name: marker.name,
    score: marker.score,
    x: marker.x,
    y: marker.y,
    status: marker.status,
    metrics: marker.metrics || [],
    competitors: marker.competitors || [],
    revenue: marker.revenue || [],
    checklist: [],
    rent_price: marker.rent_price,
    address: marker.address,
    demographics: marker.demographics,
  }));

  const selectedLocation = locations.find((loc) => loc.id === selectedId) || null;

  return (
    <div className="relative w-full h-full flex flex-col bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
      {/* Main Map Container with Sidebars */}
      <div className="flex-1 flex relative min-h-0">
        {/* Left Sidebar */}
        <MapSidebar
          colorMode={colorMode}
          setColorMode={setColorMode}
          isCollapsed={leftSidebarCollapsed}
          onToggle={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
          hoveredNeighborhood={hoveredNeighborhood}
        />

        {/* Map - takes remaining space */}
        <div className="flex-1 relative min-w-0">
          <GoogleMapView
            locations={locations}
            selectedLocationId={selectedId}
            onSelectLocation={onMarkerClick}
            neighborhoods={neighborhoods}
            colorMode={colorMode}
            onHoverNeighborhood={setHoveredNeighborhood}
          />
          {/* Debug info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs p-2 rounded z-30 font-mono">
              <div>ColorMode: <strong>{colorMode}</strong></div>
              <div>Neighborhoods: <strong>{neighborhoods?.features?.length || 0}</strong> features</div>
              <div>Has Data: {neighborhoods ? 'YES' : 'NO'}</div>
              {neighborhoods?.features?.[0]?.properties && (
                <div className="mt-1 text-[10px]">
                  Sample: popNorm={neighborhoods.features[0].properties.popNorm?.toFixed(2)}, 
                  incNorm={neighborhoods.features[0].properties.incNorm?.toFixed(2)}
                </div>
              )}
            </div>
          )}

          {/* Right Detail Panel - positioned absolutely */}
          {selectedLocation && (
            <MapDetailPanel
              location={selectedLocation}
              isCollapsed={rightPanelCollapsed}
              onToggle={() => setRightPanelCollapsed(!rightPanelCollapsed)}
              onClose={() => onMarkerClick(null)}
            />
          )}
        </div>
      </div>

      {/* Bottom Property List - fixed height when expanded */}
      <MapPropertyList
        locations={locations}
        selectedId={selectedId}
        onSelect={onMarkerClick}
        isCollapsed={bottomListCollapsed}
        onToggle={() => setBottomListCollapsed(!bottomListCollapsed)}
      />
    </div>
  );
};
