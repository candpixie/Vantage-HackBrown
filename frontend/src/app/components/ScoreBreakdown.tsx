import React from 'react';
import { motion } from 'motion/react';

interface Metric {
  label: string;
  score: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface ScoreBreakdownProps {
  metrics: Metric[];
}

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ metrics }) => {
  const getConfidenceConfig = (confidence: string) => {
    switch (confidence) {
      case 'HIGH':
        return { color: '#10B981', bg: 'bg-[#10B981]/10', text: 'text-[#10B981]', border: 'border-[#10B981]' };
      case 'MEDIUM':
        return { color: '#F59E0B', bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-500' };
      case 'LOW':
        return { color: '#F97316', bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-500' };
      default:
        return { color: '#6366F1', bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-500' };
    }
  };

  return (
    <div className="space-y-4">
      {metrics.map((metric, index) => {
        const conf = getConfidenceConfig(metric.confidence);
        return (
          <div key={metric.label} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700">{metric.label}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-900">{metric.score}/100</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-md border ${conf.bg} ${conf.border} ${conf.text}`}>
                  {metric.confidence}
                </span>
              </div>
            </div>
            <div className="h-2 w-full glass-gradient rounded-full overflow-hidden border border-white/20">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metric.score}%` }}
                transition={{ duration: 1, delay: 0.1 * index, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ backgroundColor: conf.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
