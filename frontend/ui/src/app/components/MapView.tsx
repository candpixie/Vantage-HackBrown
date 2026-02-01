import React, { useState, useEffect } from 'react';
import GoogleMapView from './GoogleMapView';
import { MapSidebar, MapDetailPanel } from './MapSidebar';
import { MapPropertyList } from './MapPropertyList';
import type { LocationResult } from '../../services/api';
import { fetchAllNYCData, type NeighborhoodGeoJSON } from '../../services/nycData';

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
    lat?: number;
    lng?: number;
    sqft?: number;
    bedrooms?: number;
    bathrooms?: number;
    propertyType?: string;
    demographics?: any;
  }>;
  onMarkerClick: (id: number | null) => void;
  selectedId: number | null;
}

export const MapView: React.FC<MapViewProps> = ({ markers, onMarkerClick, selectedId }) => {
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(true);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [bottomListCollapsed, setBottomListCollapsed] = useState(true);
  const [colorMode, setColorMode] = useState('none');
  const [hoveredNeighborhood, setHoveredNeighborhood] = useState<any>(null);
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodGeoJSON | null>(null);

  // Fetch real NYC neighborhood data (GeoJSON + demographics)
  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      try {
        console.log('MapView: Fetching real NYC data...');
        const { neighborhoods: realNeighborhoods } = await fetchAllNYCData();
        if (!cancelled) {
          console.log('MapView: Loaded real NYC neighborhoods', {
            features: realNeighborhoods.features.length,
            sampleProps: realNeighborhoods.features[0]?.properties,
          });
          setNeighborhoods(realNeighborhoods);
        }
      } catch (error) {
        console.error('MapView: Failed to fetch NYC data, using fallback', error);
        if (!cancelled) {
          setNeighborhoods(createFallbackNeighborhoods());
        }
      }
    };
    loadData();
    return () => { cancelled = true; };
  }, []);

  // Minimal fallback if all APIs fail
  const createFallbackNeighborhoods = (): NeighborhoodGeoJSON => {
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
          coordinates: [[[lng, lat], [lng + 0.04, lat], [lng + 0.04, lat + 0.04], [lng, lat + 0.04], [lng, lat]]],
        },
        properties: {
          ntaname: `Neighborhood ${i + 1}`,
          population, income, medianAge: age,
          popNorm: Math.min(1, population / 40000),
          incNorm: Math.min(1, income / 150000),
          ageNorm: Math.min(1, age / 50),
        },
      });
    }
    return { type: 'FeatureCollection', features };
  };

  const normalizeConfidence = (value?: string): 'HIGH' | 'MEDIUM' | 'LOW' => {
    if (!value) return 'LOW';
    const upper = value.toUpperCase();
    if (upper === 'HIGH' || upper === 'MEDIUM' || upper === 'LOW') {
      return upper;
    }
    return 'LOW';
  };

  // Convert markers to LocationResult format
  const locations: LocationResult[] = markers.map((marker) => ({
    id: marker.id,
    name: marker.name,
    score: marker.score,
    x: marker.x,
    y: marker.y,
    status: marker.status,
    metrics: (marker.metrics || []).map((m) => ({
      label: m.label,
      score: m.score,
      confidence: normalizeConfidence(m.confidence),
    })),
    competitors: marker.competitors || [],
    revenue: marker.revenue || [],
    checklist: [],
    rent_price: marker.rent_price ?? 0,
    address: marker.address || marker.name || 'Location',
    lat: marker.lat ?? 0,
    lng: marker.lng ?? 0,
    sqft: marker.sqft ?? 0,
    bedrooms: marker.bedrooms,
    bathrooms: marker.bathrooms,
    propertyType: marker.propertyType || 'Commercial',
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

      {/* Bottom Property List */}
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
