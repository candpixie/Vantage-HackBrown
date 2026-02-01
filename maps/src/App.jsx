import { useState, useEffect, useCallback, useMemo } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';

import MapView from './components/Map';
import Sidebar from './components/Sidebar';
import PreviewPanel from './components/PreviewPanel';
import PropertyList from './components/PropertyList';
import DetailPanel from './components/DetailPanel';

import { fetchAllData, buildNeighborhoodSummary, findNeighborhoodForProperty } from './services/api';
import { useAI } from './hooks/useAI';

export default function App() {
  const [neighborhoods, setNeighborhoods] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [colorMode, setColorMode] = useState('none');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [hoveredNeighborhood, setHoveredNeighborhood] = useState(null);

  const {
    audienceScores, audienceLoading, scoreAudience,
    revenueData, revenueLoading, revenueError, predictRevenue,
    storefrontUrl, storefrontLoading, storefrontError, generateStorefront,
    floorplanUrl, floorplanLoading, floorplanError, generateFloorplan,
    resetPropertyAI,
  } = useAI();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchAllData();
        if (cancelled) return;
        setNeighborhoods(data.neighborhoods);
        setListings(data.listings);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Compute neighborhood for selected property (NYC Open Data)
  const selectedNeighborhood = useMemo(() => {
    if (!selectedProperty || !neighborhoods) return null;
    return findNeighborhoodForProperty(selectedProperty, neighborhoods);
  }, [selectedProperty, neighborhoods]);

  const handleAudienceSubmit = useCallback((desc) => {
    if (!neighborhoods) return;
    scoreAudience(desc, buildNeighborhoodSummary(neighborhoods));
  }, [neighborhoods, scoreAudience]);

  const handleSelectProperty = useCallback((listing) => {
    resetPropertyAI();
    setSelectedProperty(listing);
  }, [resetPropertyAI]);

  const handleCloseDetail = useCallback(() => {
    resetPropertyAI();
    setSelectedProperty(null);
  }, [resetPropertyAI]);

  const handlePredictRevenue = useCallback(() => {
    if (!selectedProperty) return;
    const score = audienceScores[findNearestNta(selectedProperty, neighborhoods)] ?? null;
    predictRevenue(selectedProperty, score);
  }, [selectedProperty, audienceScores, neighborhoods, predictRevenue]);

  const handleGenerateStorefront = useCallback(() => {
    if (!selectedProperty) return;
    generateStorefront(selectedProperty.address, selectedProperty.propertyType);
  }, [selectedProperty, generateStorefront]);

  const handleGenerateFloorplan = useCallback(() => {
    if (!selectedProperty) return;
    generateFloorplan(selectedProperty.sqft, selectedProperty.propertyType);
  }, [selectedProperty, generateFloorplan]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 size={36} className="animate-spin text-sky-500" />
        <p className="text-slate-400 text-sm">Loading NYC data...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <AlertTriangle size={36} className="text-amber-500" />
        <p className="text-slate-600 text-sm max-w-md text-center">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-2 px-4 py-2 rounded-lg bg-sky-500 text-white text-sm hover:bg-sky-600 cursor-pointer">Retry</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-5 py-2.5 bg-white border-b border-slate-200 flex-none shadow-sm">
        <h1 className="text-base font-bold text-slate-900 tracking-tight">
          Vantage <span className="text-sky-500 font-normal text-sm ml-1">NYC Rentals</span>
        </h1>
        <span className="text-[11px] text-slate-400">
          {listings.length} properties &middot; {neighborhoods?.features?.length ?? 0} neighborhoods
        </span>
      </header>

      {/* ── Main area: sidebar + map + detail panel overlay ── */}
      <div className="grid grid-cols-[260px_1fr] flex-none" style={{ height: 'calc(100vh - 42px - 140px)' }}>
        <Sidebar
          colorMode={colorMode}
          setColorMode={setColorMode}
          onAudienceSubmit={handleAudienceSubmit}
          audienceLoading={audienceLoading}
          hoveredNeighborhood={hoveredNeighborhood}
        />
        <main className="relative p-2 min-h-0">
          <MapView
            neighborhoods={neighborhoods}
            listings={listings}
            colorMode={colorMode}
            audienceScores={audienceScores}
            selectedProperty={selectedProperty}
            onSelectProperty={handleSelectProperty}
            onHoverNeighborhood={setHoveredNeighborhood}
          />
          {/* Detail panel overlays on the right side of the map */}
          {selectedProperty && (
            <DetailPanel
              property={selectedProperty}
              neighborhood={selectedNeighborhood}
              onClose={handleCloseDetail}
            />
          )}
        </main>
      </div>

      {/* ── Property carousel ── */}
      <PropertyList
        listings={listings}
        selectedId={selectedProperty?.id}
        onSelect={handleSelectProperty}
      />

      {/* ── AI Visualizations ── */}
      <PreviewPanel
        property={selectedProperty}
        revenueData={revenueData}
        revenueLoading={revenueLoading}
        revenueError={revenueError}
        onPredictRevenue={handlePredictRevenue}
        storefrontUrl={storefrontUrl}
        storefrontLoading={storefrontLoading}
        storefrontError={storefrontError}
        onGenerateStorefront={handleGenerateStorefront}
        floorplanUrl={floorplanUrl}
        floorplanLoading={floorplanLoading}
        floorplanError={floorplanError}
        onGenerateFloorplan={handleGenerateFloorplan}
      />
    </div>
  );
}

function findNearestNta(property, geojson) {
  if (!property?.lat || !property?.lng || !geojson?.features) return null;
  let bestCode = null;
  let bestDist = Infinity;
  for (const f of geojson.features) {
    const c = getCentroid(f.geometry);
    if (!c) continue;
    const d = (property.lat - c[1]) ** 2 + (property.lng - c[0]) ** 2;
    if (d < bestDist) { bestDist = d; bestCode = f.properties.ntacode; }
  }
  return bestCode;
}

function getCentroid(geometry) {
  if (!geometry) return null;
  const coords = geometry.type === 'MultiPolygon' ? geometry.coordinates.flat(2) : geometry.type === 'Polygon' ? geometry.coordinates.flat() : null;
  if (!coords?.length) return null;
  let sx = 0, sy = 0;
  for (const [x, y] of coords) { sx += x; sy += y; }
  return [sx / coords.length, sy / coords.length];
}
