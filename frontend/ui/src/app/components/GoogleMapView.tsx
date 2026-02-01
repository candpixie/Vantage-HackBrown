import { useCallback, useEffect, useRef, useState } from 'react';
import { APIProvider, Map as GoogleMap, useMap } from '@vis.gl/react-google-maps';
import DeckOverlay from './DeckOverlay';
import type { LocationResult } from '../../services/api';

const NYC_CENTER = { lat: 40.7128, lng: -74.006 };
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const GMAP_MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || '';

// Desaturated grey map style so colored dots pop
const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ saturation: -80 }, { lightness: 10 }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6b7280' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f1f5f9' }] },
  { featureType: 'water', elementType: 'geometry.fill', stylers: [{ color: '#cbd5e1' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ saturation: -100 }, { lightness: 20 }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ saturation: -80 }] },
];

// Convert x, y percentages to lat/lng (shared utility)
export function percentToLatLng(x: number, y: number): { lat: number; lng: number } {
  const lng = -74.3 + (x / 100) * 0.6;
  const lat = 40.5 + (y / 100) * 0.4;
  return { lat, lng };
}

interface MapControllerProps {
  targetId: number | null;
  target: LocationResult | null;
  rightPanelWidth?: number;
}

function MapController({ targetId, target, rightPanelWidth = 0 }: MapControllerProps) {
  const map = useMap();
  const prevIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!map || !target || targetId === prevIdRef.current) return;
    prevIdRef.current = targetId;

    const lat = target.lat ?? (40.5 + (target.y / 100) * 0.4);
    const lng = target.lng ?? (-74.3 + (target.x / 100) * 0.6);
    map.panTo({ lat, lng });
    map.setZoom(15);

    // Offset so the pin centers in the visible area (not behind the sidebar)
    if (rightPanelWidth > 0) {
      setTimeout(() => map.panBy(rightPanelWidth / 2, 0), 50);
    }

    if (!targetId) prevIdRef.current = null;
  }, [map, targetId, target, rightPanelWidth]);

  return null;
}

interface MapClickHandlerProps {
  locations: LocationResult[];
  onSelectLocation: (id: number) => void;
}

function MapClickHandler({ locations, onSelectLocation }: MapClickHandlerProps) {
  const map = useMap();

  useEffect(() => {
    if (!map || !locations?.length) return;

    const listener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      const zoom = map.getZoom() || 11;
      // Threshold shrinks as you zoom in so clicks feel precise
      const threshold = 0.004 / Math.pow(2, Math.max(0, zoom - 11));
      const thresholdSq = threshold * threshold;

      let closest: LocationResult | null = null;
      let closestDist = Infinity;
      for (const loc of locations) {
        const coords = percentToLatLng(loc.x, loc.y);
        const d = (coords.lat - lat) ** 2 + (coords.lng - lng) ** 2;
        if (d < closestDist && d < thresholdSq) {
          closestDist = d;
          closest = loc;
        }
      }

      if (closest) {
        onSelectLocation(closest.id);
      }
    });

    return () => {
      if (listener) {
        google.maps.event.removeListener(listener);
      }
    };
  }, [map, locations, onSelectLocation]);

  return null;
}

interface GoogleMapViewProps {
  locations: LocationResult[];
  selectedLocationId: number | null;
  onSelectLocation: (id: number) => void;
  neighborhoods?: any;
  colorMode?: string;
  onHoverNeighborhood?: (neighborhood: any) => void;
}

export default function GoogleMapView({
  locations,
  selectedLocationId,
  onSelectLocation,
  neighborhoods,
  colorMode = 'none',
  onHoverNeighborhood,
}: GoogleMapViewProps) {
  const [hoveringDot, setHoveringDot] = useState(false);
  const onHoverDot = useCallback((hovering: boolean) => setHoveringDot(hovering), []);

  // Don't render if API key is missing
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Google Maps API key not configured. Add VITE_GOOGLE_MAPS_API_KEY to .env.local
        </p>
      </div>
    );
  }

  return (
    <div className={`w-full h-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm absolute inset-0${hoveringDot ? ' map-cursor-pointer' : ''}`}>
      <style>{`.map-cursor-pointer, .map-cursor-pointer * { cursor: pointer !important; }`}</style>
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          defaultCenter={NYC_CENTER}
          defaultZoom={11}
          gestureHandling="greedy"
          disableDefaultUI={false}
          className="w-full h-full"
          mapId={GMAP_MAP_ID || undefined}
          styles={GMAP_MAP_ID ? undefined : MAP_STYLES}
        >
          <DeckOverlay
            locations={locations}
            selectedLocationId={selectedLocationId}
            onSelectLocation={onSelectLocation}
            neighborhoods={neighborhoods}
            colorMode={colorMode}
            onHoverNeighborhood={onHoverNeighborhood}
            onHoverDot={onHoverDot}
          />
          <MapController
            targetId={selectedLocationId}
            target={locations.find((loc) => loc.id === selectedLocationId) || null}
            rightPanelWidth={selectedLocationId ? 380 : 0}
          />
          <MapClickHandler locations={locations} onSelectLocation={onSelectLocation} />
        </GoogleMap>
      </APIProvider>
    </div>
  );
}
