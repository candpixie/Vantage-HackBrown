import { useEffect, useMemo, useState } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { GoogleMapsOverlay } from '@deck.gl/google-maps';
import { ScatterplotLayer, GeoJsonLayer } from '@deck.gl/layers';
import type { LocationResult } from '../../services/api';

interface DeckOverlayProps {
  locations: LocationResult[];
  selectedLocationId: number | null;
  onSelectLocation?: (id: number) => void;
  neighborhoods?: any; // GeoJSON neighborhoods data
  colorMode?: string; // 'none' | 'population' | 'age' | 'income'
  onHoverNeighborhood?: (neighborhood: any) => void;
  onHoverDot?: (hovering: boolean) => void;
}

// Convert x, y percentages to lat/lng (NYC bounds approximation)
function percentToLatLngArray(x: number, y: number): [number, number] {
  // NYC bounds: lat 40.5-40.9, lng -74.3 to -73.7
  const lng = -74.3 + (x / 100) * 0.6;
  const lat = 40.5 + (y / 100) * 0.4;
  return [lat, lng];
}

// Color interpolation functions
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function interpolateStops(t: number, stops: number[][]): [number, number, number, number] {
  const clamped = Math.max(0, Math.min(1, t));
  const n = stops.length - 1;
  const seg = Math.min(Math.floor(clamped * n), n - 1);
  const segT = (clamped * n) - seg;
  const from = stops[seg];
  const to = stops[seg + 1];
  return [
    lerp(from[0], to[0], segT),
    lerp(from[1], to[1], segT),
    lerp(from[2], to[2], segT),
    lerp(from[3], to[3], segT),
  ];
}

// Color stops for different heatmap modes
const POP_STOPS = [
  [255, 255, 178, 80],   // pale yellow
  [254, 204, 92, 140],   // gold
  [253, 141, 60, 175],   // orange
  [240, 59, 32, 210],    // red-orange
  [189, 0, 38, 235],     // deep crimson
];

const INC_STOPS = [
  [237, 248, 233, 90],   // very light green
  [186, 228, 179, 145],  // light green
  [116, 196, 118, 180],  // medium green
  [35, 139, 69, 215],    // forest green
  [0, 90, 50, 240],      // deep green
];

const AGE_STOPS = [
  [254, 235, 195, 80],   // pale peach
  [253, 174, 107, 140],  // peach
  [244, 109, 67, 175],   // coral
  [215, 48, 31, 210],    // brick red
  [153, 0, 75, 235],     // deep purple
];

function populationColor(norm: number) { return interpolateStops(Math.pow(norm, 0.35), POP_STOPS); }
function incomeColor(norm: number) { return interpolateStops(Math.pow(norm, 0.65), INC_STOPS); }
function ageColor(norm: number) { return interpolateStops(Math.pow(norm, 0.65), AGE_STOPS); }

function getFillColor(feature: any, colorMode: string): [number, number, number, number] {
  if (!feature || !feature.properties) {
    return [200, 200, 200, 50];
  }
  
  const props = feature.properties;
  // Get normalized values, with fallback to calculating from raw values if needed
  let popNorm = typeof props.popNorm === 'number' ? props.popNorm : 0;
  let incNorm = typeof props.incNorm === 'number' ? props.incNorm : 0;
  let ageNorm = typeof props.ageNorm === 'number' ? props.ageNorm : 0;
  
  // If normalized values are missing but raw values exist, calculate them
  if (popNorm === 0 && props.population) {
    popNorm = Math.min(1, Math.max(0, props.population / 50000));
  }
  if (incNorm === 0 && props.income) {
    incNorm = Math.min(1, Math.max(0, props.income / 150000));
  }
  if (ageNorm === 0 && props.medianAge) {
    ageNorm = Math.min(1, Math.max(0, props.medianAge / 50));
  }
  
  // Ensure we have at least a small value to show color (minimum 0.1 for visibility)
  const minValue = 0.1;
  
  switch (colorMode) {
    case 'population':
      if (popNorm > 0) {
        return populationColor(Math.max(minValue, popNorm));
      }
      // Try to use a default value if available
      return populationColor(minValue);
    case 'income':
      if (incNorm > 0) {
        return incomeColor(Math.max(minValue, incNorm));
      }
      return incomeColor(minValue);
    case 'age':
      if (ageNorm > 0) {
        return ageColor(Math.max(minValue, ageNorm));
      }
      return ageColor(minValue);
    default:
      return [0, 0, 0, 0]; // Transparent
  }
}

export default function DeckOverlay({
  locations,
  selectedLocationId,
  onSelectLocation,
  neighborhoods,
  colorMode = 'none',
  onHoverNeighborhood,
  onHoverDot,
}: DeckOverlayProps) {
  const map = useMap();
  const [overlay, setOverlay] = useState<GoogleMapsOverlay | null>(null);

  useEffect(() => {
    if (!map) return;
    const o = new GoogleMapsOverlay({ interleaved: true });
    o.setMap(map);
    setOverlay(o);
    return () => {
      o.setMap(null);
      setOverlay(null);
    };
  }, [map]);

  const layers = useMemo(() => {
    const result = [];

    // Heatmap layer - render neighborhoods GeoJSON
    if (neighborhoods?.features?.length && colorMode !== 'none') {
      console.log('DeckOverlay: Creating GeoJsonLayer', {
        features: neighborhoods.features.length,
        colorMode,
        sampleFeature: neighborhoods.features[0],
        sampleProps: neighborhoods.features[0]?.properties,
        hasPopNorm: !!neighborhoods.features[0]?.properties?.popNorm,
        hasIncNorm: !!neighborhoods.features[0]?.properties?.incNorm,
        hasAgeNorm: !!neighborhoods.features[0]?.properties?.ageNorm,
      });
      
      try {
        result.push(
          new GeoJsonLayer({
            id: 'neighborhoods-heatmap',
            data: neighborhoods,
            filled: true,
            stroked: false, // Disable strokes for cleaner look
            extruded: false,
            getLineColor: [100, 116, 139, 0], // Transparent lines
            getLineWidth: 0,
            getFillColor: (f: any) => {
              try {
                if (!f || !f.properties) {
                  console.warn('DeckOverlay: Feature missing properties', f);
                  return [200, 200, 200, 100];
                }
                const color = getFillColor(f, colorMode);
                // Ensure valid color with good opacity
                if (!Array.isArray(color) || color.length !== 4) {
                  console.warn('DeckOverlay: Invalid color returned', color, 'for feature', f);
                  return [200, 200, 200, 100];
                }
                // Ensure opacity is visible (min 120 for good visibility, max 200 for not too opaque)
                const alpha = Math.max(120, Math.min(200, color[3] || 150));
                const finalColor: [number, number, number, number] = [color[0], color[1], color[2], alpha];
                return finalColor;
              } catch (error) {
                console.error('DeckOverlay: Error in getFillColor', error, f);
                return [200, 200, 200, 100];
              }
            },
            pickable: true,
            autoHighlight: true,
            highlightColor: [20, 184, 166, 150],
            onHover: (info: any) => {
              if (onHoverNeighborhood && info.object) {
                onHoverNeighborhood(info.object.properties ?? null);
              }
            },
            updateTriggers: { 
              getFillColor: [colorMode, neighborhoods?.features?.length] 
            },
          })
        );
        console.log('DeckOverlay: Successfully created heatmap layer');
      } catch (error) {
        console.error('DeckOverlay: Error creating GeoJsonLayer', error);
      }
    } else {
      console.log('DeckOverlay: Skipping heatmap', {
        hasNeighborhoods: !!neighborhoods,
        featuresCount: neighborhoods?.features?.length,
        colorMode
      });
    }

    // Location markers — use real lat/lng when available, fall back to x/y percentages
    const locationPoints = locations
      .filter((loc) => (loc.lat && loc.lng) || (loc.x !== undefined && loc.y !== undefined))
      .map((loc) => {
        let lat: number, lng: number;
        if (loc.lat && loc.lng) {
          lat = loc.lat;
          lng = loc.lng;
        } else {
          [lat, lng] = percentToLatLngArray(loc.x, loc.y);
        }
        return {
          id: loc.id,
          lat,
          lng,
          score: loc.score,
          status: loc.status,
        };
      });

    if (locationPoints.length > 0) {
      result.push(
        new ScatterplotLayer({
          id: 'location-markers',
          data: locationPoints,
          getPosition: (d: { lat: number; lng: number }) => [d.lng, d.lat],
          getFillColor: (d: { id: number; status: string }) => {
            if (d.id === selectedLocationId) {
              return [20, 184, 166, 255]; // Teal for selected
            }
            switch (d.status) {
              case 'HIGH':
                return [16, 185, 129, 255]; // Green
              case 'MEDIUM':
                return [234, 179, 8, 255]; // Yellow
              case 'LOW':
                return [249, 115, 22, 255]; // Orange
              default:
                return [100, 116, 139, 255]; // Gray
            }
          },
          getLineColor: [255, 255, 255, 255],
          getRadius: (d: { id: number }) => (d.id === selectedLocationId ? 10 : 7),
          radiusMinPixels: 6,
          radiusMaxPixels: 12,
          stroked: true,
          lineWidthMinPixels: 2,
          pickable: true,
          onHover: (info: any) => {
            onHoverDot?.(!!info.object);
          },
          onClick: (info: any) => {
            if (info.object && onSelectLocation) {
              onSelectLocation(info.object.id);
            }
          },
          updateTriggers: {
            getFillColor: [selectedLocationId],
            getRadius: [selectedLocationId],
          },
        })
      );
    }

    return result;
  }, [locations, selectedLocationId, onSelectLocation, neighborhoods, colorMode, onHoverNeighborhood, onHoverDot, map]);

  useEffect(() => {
    if (overlay) {
      console.log('DeckOverlay: Updating overlay with', layers.length, 'layers', {
        hasHeatmap: layers.some(l => l.id === 'neighborhoods-heatmap'),
        hasMarkers: layers.some(l => l.id === 'location-markers'),
        colorMode
      });
      try {
        overlay.setProps({ layers });
      } catch (error) {
        console.error('DeckOverlay: Error updating overlay', error);
      }
    } else {
      console.log('DeckOverlay: No overlay instance yet');
    }
  }, [overlay, layers, colorMode]);

  return null;
}
