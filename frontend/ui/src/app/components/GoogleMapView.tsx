import { useEffect } from 'react';
import { APIProvider, Map as GoogleMap, useMap } from '@vis.gl/react-google-maps';
import DeckOverlay from './DeckOverlay';
import type { LocationResult } from '../../services/api';

const NYC_CENTER = { lat: 40.7128, lng: -74.006 };
const GMAP_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const GMAP_MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || '';

// Convert x, y percentages to lat/lng (shared utility)
export function percentToLatLng(x: number, y: number): { lat: number; lng: number } {
  const lng = -74.3 + (x / 100) * 0.6;
  const lat = 40.5 + (y / 100) * 0.4;
  return { lat, lng };
}

interface MapControllerProps {
  target: LocationResult | null;
}

function MapController({ target }: MapControllerProps) {
  const map = useMap();
  useEffect(() => {
    if (map && target) {
      const coords = percentToLatLng(target.x, target.y);
      map.panTo({ lat: coords.lat, lng: coords.lng });
      map.setZoom(15);
    }
  }, [map, target]);
  return null;
}

interface MapClickHandlerProps {
  locations: LocationResult[];
  onSelectLocation: (id: number | null) => void;
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
  onSelectLocation: (id: number | null) => void;
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
  // Don't render if API key is missing
  if (!GMAP_API_KEY) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Google Maps API key not configured. Add VITE_GOOGLE_MAPS_API_KEY to .env.local
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm absolute inset-0">
      <APIProvider apiKey={GMAP_API_KEY}>
        <GoogleMap
          defaultCenter={NYC_CENTER}
          defaultZoom={11}
          gestureHandling="greedy"
          disableDefaultUI={false}
          className="w-full h-full"
          mapId={GMAP_MAP_ID}
        >
          <DeckOverlay
            locations={locations}
            selectedLocationId={selectedLocationId}
            onSelectLocation={onSelectLocation}
            neighborhoods={neighborhoods}
            colorMode={colorMode}
            onHoverNeighborhood={onHoverNeighborhood}
          />
          <MapController
            target={locations.find((loc) => loc.id === selectedLocationId) || null}
          />
          <MapClickHandler locations={locations} onSelectLocation={onSelectLocation} />
        </GoogleMap>
      </APIProvider>
    </div>
  );
}
