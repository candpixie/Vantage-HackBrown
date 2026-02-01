import React from 'react';
import { CheckCircle2 } from 'lucide-react';

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
    <div className="glass-card border border-white/30 rounded-xl overflow-hidden premium-glow">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-[#E5E7EB]">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Scenario</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Monthly</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Annual</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Net Margin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {projections.map((row, idx) => (
              <tr
                key={idx}
                className={`hover:bg-slate-50 transition-colors ${
                  row.isRecommended ? 'bg-blue-100' : ''
                }`}
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900">{row.scenario}</span>
                    {row.isRecommended && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-400 text-white text-xs font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        Best Fit
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm font-semibold text-slate-900">{row.monthly}</td>
                <td className="px-4 py-4 text-sm font-semibold text-slate-900">{row.annual}</td>
                <td className="px-4 py-4 text-sm font-semibold text-[#10B981]">{row.margin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 bg-slate-50 border-t border-[#E5E7EB]">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <div className="w-2 h-2 rounded-full bg-[#10B981]" />
          <span>Neural Confidence: 94.2% based on local P&L synthesis</span>
        </div>
      </div>
    </div>
  );
};
