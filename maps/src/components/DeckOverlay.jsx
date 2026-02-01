import { useEffect, useMemo, useState } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { GoogleMapsOverlay } from '@deck.gl/google-maps';
import { GeoJsonLayer, ScatterplotLayer } from '@deck.gl/layers';

function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Interpolate through color stops (no extra power curve — callers control the spread)
function interpolateStops(t, stops) {
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

// Population — warm YlOrRd palette, aggressive sqrt spread because density is skewed
const POP_STOPS = [
  [255, 255, 178, 80],   // pale yellow
  [254, 204, 92, 140],   // gold
  [253, 141, 60, 175],   // orange
  [240, 59, 32, 210],    // red-orange
  [189, 0, 38, 235],     // deep crimson
];

// Income — green scale (clearly distinct from warm population palette)
const INC_STOPS = [
  [237, 248, 233, 90],   // very light green
  [186, 228, 179, 145],  // light green
  [116, 196, 118, 180],  // medium green
  [35, 139, 69, 215],    // forest green
  [0, 90, 50, 240],      // deep green
];

// Age — warm peach→coral→purple
const AGE_STOPS = [
  [254, 235, 195, 80],   // pale peach
  [253, 174, 107, 140],  // peach
  [244, 109, 67, 175],   // coral
  [215, 48, 31, 210],    // brick red
  [153, 0, 75, 235],     // deep purple
];

// Audience — blue→indigo→violet (cool tones are fine here since it's a separate concept)
const AUD_STOPS = [
  [30, 40, 100, 50],     // dark navy
  [59, 130, 246, 130],   // blue
  [99, 102, 241, 180],   // indigo
  [139, 92, 246, 230],   // violet — strong
];

// Population: extra-aggressive power (0.35) because density is heavily right-skewed
function populationColor(norm) { return interpolateStops(Math.pow(norm, 0.35), POP_STOPS); }
// Income: moderate spread
function incomeColor(norm) { return interpolateStops(Math.pow(norm, 0.65), INC_STOPS); }
// Age: moderate spread
function ageColor(norm) { return interpolateStops(Math.pow(norm, 0.65), AGE_STOPS); }

function audienceColor(score) {
  return interpolateStops(Math.pow(Math.max(0, Math.min(1, score / 100)), 0.7), AUD_STOPS);
}

function getFillColor(feature, colorMode, audienceScores) {
  const { popNorm = 0, incNorm = 0, ageNorm = 0, ntacode } = feature.properties;
  switch (colorMode) {
    case 'population':
      return populationColor(popNorm);
    case 'income':
      return incomeColor(incNorm);
    case 'age':
      return ageColor(ageNorm);
    case 'audience': {
      const score = audienceScores[ntacode];
      return score != null ? audienceColor(score) : [30, 40, 100, 40];
    }
    default:
      return [0, 0, 0, 0];
  }
}

export default function DeckOverlay({
  neighborhoods, colorMode = 'none', audienceScores = {},
  onHoverNeighborhood,
  listings = [], selectedPropertyId = null, onSelectProperty,
}) {
  const map = useMap();
  const [overlay, setOverlay] = useState(null);

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

    // Heat map layer
    if (neighborhoods?.features?.length && colorMode !== 'none') {
      result.push(
        new GeoJsonLayer({
          id: 'neighborhoods',
          data: neighborhoods,
          filled: true,
          stroked: true,
          extruded: false,
          getLineColor: [100, 116, 139, 50],
          getLineWidth: 1,
          lineWidthMinPixels: 0.5,
          getFillColor: (f) => getFillColor(f, colorMode, audienceScores),
          pickable: true,
          autoHighlight: true,
          highlightColor: [14, 165, 233, 40],
          onHover: (info) => onHoverNeighborhood?.(info.object?.properties ?? null),
          updateTriggers: { getFillColor: [colorMode, audienceScores] },
        }),
      );
    }

    // Property markers — always-visible black dots
    const validListings = listings.filter((l) => l.lat && l.lng);
    if (validListings.length > 0) {
      result.push(
        new ScatterplotLayer({
          id: 'property-dots',
          data: validListings,
          getPosition: (d) => [d.lng, d.lat],
          getFillColor: (d) => d.id === selectedPropertyId ? [15, 23, 42, 255] : [15, 23, 42, 220],
          getLineColor: [255, 255, 255, 255],
          getRadius: (d) => d.id === selectedPropertyId ? 7 : 5,
          radiusMinPixels: 4,
          radiusMaxPixels: 10,
          stroked: true,
          lineWidthMinPixels: 1.5,
          pickable: false,
          updateTriggers: {
            getFillColor: [selectedPropertyId],
            getRadius: [selectedPropertyId],
          },
        }),
      );
    }

    return result;
  }, [neighborhoods, colorMode, audienceScores, onHoverNeighborhood, listings, selectedPropertyId, onSelectProperty]);

  useEffect(() => {
    overlay?.setProps({ layers });
  }, [overlay, layers]);

  return null;
}
