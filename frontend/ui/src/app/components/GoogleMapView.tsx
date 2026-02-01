import { useEffect, useRef } from 'react';
import { APIProvider, Map as GoogleMap, useMap } from '@vis.gl/react-google-maps';
import DeckOverlay from './DeckOverlay';
import type { LocationResult } from '../../services/api';
import { GOOGLE_MAPS_API_KEY } from '../config/keys';

const NYC_CENTER = { lat: 40.7128, lng: -74.006 };
const GMAP_MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || '';
const PLACEHOLDER_API_KEY = 'PASTE_YOUR_GOOGLE_MAPS_API_KEY_HERE';

const DARK_GREY_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#f2f2f2' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6b6b6b' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f0f0f0' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#e0e0e0' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#5f5f5f' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#5f5f5f' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#ededed' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#7a7a7a' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#e6eee6' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6f846f' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#dcdcdc' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#cfcfcf' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#6f6f6f' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#e4e4e4' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#6f6f6f' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#dfe5ea' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#6b6b6b' }] },
];

// Desaturated grey map style so colored dots stand out
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
  target: LocationResult | null;
}

function MapController({ target }: MapControllerProps) {
  const map = useMap();
  const lastTargetIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (map && target) {
      if (lastTargetIdRef.current === target.id) {
        return;
      }
      const coords = percentToLatLng(target.x, target.y);
      map.panTo({ lat: coords.lat, lng: coords.lng });
      map.setZoom(15);
      lastTargetIdRef.current = target.id;
    }
    if (!target) {
      lastTargetIdRef.current = null;
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
  if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === PLACEHOLDER_API_KEY) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Google Maps API key not configured. Add your key in app/config/keys.ts
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm absolute inset-0">
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
