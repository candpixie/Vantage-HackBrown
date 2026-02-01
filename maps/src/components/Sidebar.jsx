import { useState } from 'react';
import { Send, Loader2, MapPin } from 'lucide-react';

const LAYERS = [
  { key: 'none', label: 'None' },
  { key: 'population', label: 'Population Density', legend: { stops: ['#ffffb2', '#fecc5c', '#fd8d3c', '#f03b20', '#bd0026'], labels: ['Low', 'High'] } },
  { key: 'age', label: 'Median Age', legend: { stops: ['#feebC3', '#fdae6b', '#f46d43', '#d7301f', '#99004b'], labels: ['Younger', 'Older'] } },
  { key: 'income', label: 'Median Income', legend: { stops: ['#edf8e9', '#bae4b3', '#74c476', '#238b45', '#005a32'], labels: ['Low', 'High'] } },
];

export default function Sidebar({ colorMode, setColorMode, onAudienceSubmit, audienceLoading, hoveredNeighborhood }) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim() || audienceLoading) return;
    setColorMode('audience');
    onAudienceSubmit(prompt.trim());
  };

  const activeLegend = LAYERS.find((l) => l.key === colorMode)?.legend;

  return (
    <aside className="flex flex-col gap-4 p-4 bg-white border-r border-slate-200 overflow-y-auto">
      {/* Header */}
      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Demographic Layers</h2>
        <p className="text-[11px] text-slate-400 mt-0.5">Select a heatmap overlay</p>
      </div>

      {/* Radio selectors */}
      <div className="space-y-1">
        {LAYERS.map(({ key, label }) => (
          <label
            key={key}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
              colorMode === key ? 'bg-sky-50 border border-sky-300' : 'hover:bg-slate-50 border border-transparent'
            }`}
          >
            <input
              type="radio"
              name="layer"
              value={key}
              checked={colorMode === key}
              onChange={() => setColorMode(key)}
              className="accent-sky-500 w-3.5 h-3.5"
            />
            <span className={`text-sm ${colorMode === key ? 'text-sky-700 font-medium' : 'text-slate-600'}`}>
              {label}
            </span>
          </label>
        ))}
      </div>

      {/* Legend */}
      {activeLegend && (
        <div className="px-1">
          <div
            className="h-2.5 rounded-full"
            style={{
              background: `linear-gradient(to right, ${activeLegend.stops.join(', ')})`,
            }}
          />
          <div className="flex justify-between mt-1 text-[10px] text-slate-400">
            <span>{activeLegend.labels[0]}</span>
            <span>{activeLegend.labels[1]}</span>
          </div>
        </div>
      )}

      {/* Divider */}
      <hr className="border-slate-200" />

      {/* AI audience prompt */}
      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Target Audience (AI)</h2>
        <p className="text-[11px] text-slate-400 mt-0.5">Describe your ideal customer</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder='e.g. "Young tech workers aged 25-35" or "Families with children"'
          className="w-full rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-300"
        />
        <button
          type="submit"
          disabled={audienceLoading || !prompt.trim()}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-sky-500 px-3 py-2 text-sm font-medium text-white hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {audienceLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          {audienceLoading ? 'Scoring...' : 'Analyze Audience'}
        </button>
      </form>

      {/* Audience legend */}
      {colorMode === 'audience' && (
        <div className="px-1">
          <div
            className="h-2.5 rounded-full"
            style={{ background: 'linear-gradient(to right, #1e2850, #3b82f6, #6366f1, #8b5cf6)' }}
          />
          <div className="flex justify-between mt-1 text-[10px] text-slate-400">
            <span>0 (Low fit)</span>
            <span>100 (High fit)</span>
          </div>
        </div>
      )}

      {/* Hover info */}
      {hoveredNeighborhood && (
        <>
          <hr className="border-slate-200" />
          <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <MapPin size={12} className="text-sky-500" />
              <span className="text-xs font-semibold text-slate-800 truncate">{hoveredNeighborhood.ntaname}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
              {hoveredNeighborhood.population > 0 && <span>Pop: {hoveredNeighborhood.population.toLocaleString()}</span>}
              {hoveredNeighborhood.medianAge > 0 && <span>Age: {hoveredNeighborhood.medianAge}</span>}
              {hoveredNeighborhood.income > 0 && <span>Income: ${hoveredNeighborhood.income.toLocaleString()}</span>}
              <span className="text-slate-400">{hoveredNeighborhood.boroname}</span>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
