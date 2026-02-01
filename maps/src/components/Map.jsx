import { useEffect } from 'react';
import { APIProvider, Map as GoogleMap, useMap } from '@vis.gl/react-google-maps';
import DeckOverlay from './DeckOverlay';

const NYC_CENTER = { lat: 40.7128, lng: -74.006 };
const GMAP_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const GMAP_MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || '';

function MapController({ target }) {
  const map = useMap();
  useEffect(() => {
    if (map && target) {
      map.panTo({ lat: target.lat, lng: target.lng });
      map.setZoom(15);
    }
  }, [map, target]);
  return null;
}

// Detects clicks near property dots using Google Maps' native event system
// (deck.gl interleaved overlay doesn't reliably forward click events)
function MapClickHandler({ listings, onSelectProperty }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !listings?.length) return;

    const listener = map.addListener('click', (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      const zoom = map.getZoom() || 11;
      // Threshold shrinks as you zoom in so clicks feel precise
      const threshold = 0.004 / Math.pow(2, Math.max(0, zoom - 11));
      const thresholdSq = threshold * threshold;

      let closest = null;
      let closestDist = Infinity;
      for (const l of listings) {
        if (!l.lat || !l.lng) continue;
        const d = (l.lat - lat) ** 2 + (l.lng - lng) ** 2;
        if (d < closestDist && d < thresholdSq) {
          closestDist = d;
          closest = l;
        }
      }

      if (closest) onSelectProperty(closest);
    });

    return () => google.maps.event.removeListener(listener);
  }, [map, listings, onSelectProperty]);

  return null;
}

export default function MapView({ neighborhoods, listings, colorMode, audienceScores, selectedProperty, onSelectProperty, onHoverNeighborhood }) {
  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-slate-200 shadow-sm">
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
            neighborhoods={neighborhoods}
            colorMode={colorMode}
            audienceScores={audienceScores}
            onHoverNeighborhood={onHoverNeighborhood}
            listings={listings}
            selectedPropertyId={selectedProperty?.id ?? null}
            onSelectProperty={onSelectProperty}
          />
          <MapController target={selectedProperty} />
          <MapClickHandler listings={listings} onSelectProperty={onSelectProperty} />
        </GoogleMap>
      </APIProvider>
    </div>
  );
}
