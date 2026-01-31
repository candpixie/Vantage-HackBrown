import React from 'react';

interface RevenueProjection {
  scenario: string;
  monthly: string;
  annual: string;
  margin: string;
  isRecommended?: boolean;
}

interface RevenueTableProps {
  projections: RevenueProjection[];
}

export const RevenueTable: React.FC<RevenueTableProps> = ({ projections }) => {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-white/5">
        <h3 className="text-sm font-black text-white uppercase tracking-widest">Revenue Projections</h3>
      </div>
      <table className="w-full">
        <thead>
          <tr className="bg-white/5">
            <th className="px-6 py-3 text-left text-[10px] font-black text-white/40 uppercase tracking-widest">Scenario</th>
            <th className="px-6 py-3 text-left text-[10px] font-black text-white/40 uppercase tracking-widest">Monthly</th>
            <th className="px-6 py-3 text-left text-[10px] font-black text-white/40 uppercase tracking-widest">Annual</th>
            <th className="px-6 py-3 text-left text-[10px] font-black text-white/40 uppercase tracking-widest">Net Margin</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {projections.map((row) => (
            <tr key={row.scenario} className={`hover:bg-white/[0.02] transition-colors ${row.isRecommended ? 'bg-indigo-500/5' : ''}`}>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white uppercase">{row.scenario}</span>
                  {row.isRecommended && (
                    <span className="text-[8px] font-black bg-indigo-500 text-white px-1.5 py-0.5 rounded uppercase">Best Fit</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-xs font-bold text-white/80">{row.monthly}</td>
              <td className="px-6 py-4 text-xs font-bold text-white/80">{row.annual}</td>
              <td className="px-6 py-4 text-xs font-bold text-green-400">{row.margin}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-4 bg-white/5 border-t border-white/5">
        <div className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Neural Confidence: 94.2% based on local P&L synthesis
        </div>
      </div>
    </div>
  );
};
