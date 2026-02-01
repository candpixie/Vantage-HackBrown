import { AlertTriangle, Building2, ImageIcon, Loader2, Ruler, Sparkles, TrendingUp, MapPin, Maximize2, DollarSign } from 'lucide-react';

function ErrorBox({ message }) {
  return (
    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 flex items-start gap-2">
      <AlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0" />
      <p className="text-xs text-red-600 leading-relaxed">{message}</p>
    </div>
  );
}

export default function PreviewPanel({
  property,
  revenueData,
  revenueLoading,
  revenueError,
  onPredictRevenue,
  storefrontUrl,
  storefrontLoading,
  storefrontError,
  onGenerateStorefront,
  floorplanUrl,
  floorplanLoading,
  floorplanError,
  onGenerateFloorplan,
}) {
  if (!property) {
    return (
      <section className="bg-white border-t border-slate-200 px-6 py-12 flex flex-col items-center justify-center text-center">
        <Building2 size={48} className="text-slate-200 mb-3" />
        <p className="text-sm text-slate-400">Select a property above to generate AI visualizations</p>
      </section>
    );
  }

  return (
    <section className="bg-white border-t border-slate-200">
      {/* Property info bar */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center gap-x-6 gap-y-2">
        <h3 className="text-base font-bold text-slate-900">{property.address}</h3>
        <div className="flex items-center gap-4 text-sm text-slate-500">
          {property.price != null && (
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <DollarSign size={14} />{property.price.toLocaleString()}/mo
            </span>
          )}
          {property.sqft != null && (
            <span className="flex items-center gap-1">
              <Maximize2 size={13} />{property.sqft.toLocaleString()} sqft
            </span>
          )}
          <span className="flex items-center gap-1">
            <MapPin size={13} />{property.propertyType}
          </span>
        </div>
      </div>

      {/* 3-column grid: Revenue | Storefront | Floor Plan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-100">
        {/* Revenue */}
        <div className="bg-white p-5 space-y-3">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp size={13} /> Revenue Estimate
          </h4>
          {revenueData ? (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 space-y-1.5">
              <p className="text-2xl font-bold text-emerald-600">${revenueData.revenue?.toLocaleString()}/mo</p>
              <p className="text-xs text-slate-500">
                Confidence:{' '}
                <span className={revenueData.confidence === 'high' ? 'text-emerald-600 font-semibold' : revenueData.confidence === 'medium' ? 'text-yellow-600 font-semibold' : 'text-orange-500 font-semibold'}>
                  {revenueData.confidence}
                </span>
              </p>
              {revenueData.summary && <p className="text-xs text-slate-600 leading-relaxed">{revenueData.summary}</p>}
              {revenueData.factors?.length > 0 && (
                <ul className="mt-1 space-y-0.5">
                  {revenueData.factors.map((f, i) => (
                    <li key={i} className="text-[11px] text-slate-500 flex items-start gap-1">
                      <span className="text-emerald-500 mt-0.5">&#8226;</span> {f}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <>
              <button onClick={onPredictRevenue} disabled={revenueLoading} className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-50 cursor-pointer transition-colors">
                {revenueLoading ? <><Loader2 size={14} className="animate-spin" /> Analyzing...</> : <><TrendingUp size={14} /> Estimate Revenue</>}
              </button>
              {revenueError && <ErrorBox message={revenueError} />}
            </>
          )}
        </div>

        {/* Storefront */}
        <div className="bg-white p-5 space-y-3">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <ImageIcon size={13} /> Storefront Mockup
          </h4>
          {storefrontUrl ? (
            <img src={storefrontUrl} alt="AI Storefront" className="w-full rounded-lg border border-slate-200" />
          ) : (
            <>
              <div className="w-full aspect-[4/3] rounded-lg bg-slate-50 border border-dashed border-slate-300 flex flex-col items-center justify-center gap-2">
                <Sparkles size={28} className="text-slate-300" />
                <span className="text-xs text-slate-400">DALL-E generated storefront</span>
                <span className="text-[10px] text-slate-300">Based on address &amp; property type</span>
              </div>
              <button onClick={onGenerateStorefront} disabled={storefrontLoading} className="w-full flex items-center justify-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-600 disabled:opacity-50 cursor-pointer transition-colors">
                {storefrontLoading ? <><Loader2 size={14} className="animate-spin" /> Generating...</> : <><ImageIcon size={14} /> Visualize Storefront</>}
              </button>
              {storefrontError && <ErrorBox message={storefrontError} />}
            </>
          )}
        </div>

        {/* Floor Plan */}
        <div className="bg-white p-5 space-y-3">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Ruler size={13} /> Architectural Layout
          </h4>
          {floorplanUrl ? (
            <img src={floorplanUrl} alt="AI Floor Plan" className="w-full rounded-lg border border-slate-200" />
          ) : (
            <>
              <div className="w-full aspect-[4/3] rounded-lg bg-slate-50 border border-dashed border-slate-300 flex flex-col items-center justify-center gap-2">
                <Ruler size={28} className="text-slate-300" />
                <span className="text-xs text-slate-400">DALL-E generated floor plan</span>
                <span className="text-[10px] text-slate-300">Based on sqft &amp; property type</span>
              </div>
              <button onClick={onGenerateFloorplan} disabled={floorplanLoading} className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-500 border border-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50 cursor-pointer transition-colors">
                {floorplanLoading ? <><Loader2 size={14} className="animate-spin" /> Generating...</> : <><Ruler size={14} /> Generate Floor Plan</>}
              </button>
              {floorplanError && <ErrorBox message={floorplanError} />}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
