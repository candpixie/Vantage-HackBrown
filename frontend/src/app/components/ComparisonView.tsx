import React from 'react';
import { motion } from 'motion/react';

const MotionDiv = motion.div as any;

interface Location {
  name: string;
  score: number;
  metrics: Array<{ label: string; score: number }>;
  revenue: Array<{ scenario: string; monthly: string }>;
}

export const ComparisonView: React.FC<{ locations: Location[] }> = ({ locations }) => {
  const topTwo = locations.slice(0, 2);

  if (topTwo.length < 2) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Head-to-Head Comparison</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {topTwo.map((loc, idx) => (
          <MotionDiv
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="space-y-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl p-6 hover:shadow-lg cursor-pointer transition-all"
          >
            <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-700">
              <div className="text-4xl font-black text-teal-600 dark:text-teal-400 mb-2 break-words">{loc.score}</div>
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 break-words px-2">{loc.name}</div>
            </div>

            {/* Metrics comparison bars */}
            <div className="space-y-3">
              {loc.metrics.map((metric, i) => {
                const other = topTwo[1 - idx].metrics[i];
                const isWinning = metric.score > other.score;
                const diff = metric.score - other.score;

                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 break-words">
                        {metric.label}
                      </div>
                      <div className={`text-sm font-bold whitespace-nowrap ${isWinning ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                        {metric.score}
                        {diff !== 0 && (
                          <span className={`ml-1 text-xs ${isWinning ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                            {diff > 0 ? '+' : ''}{diff}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <MotionDiv
                          initial={{ width: 0 }}
                          animate={{ width: `${metric.score}%` }}
                          transition={{ duration: 0.6, delay: i * 0.1 }}
                          className={`h-full ${isWinning ? 'bg-emerald-500' : 'bg-slate-500'}`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Revenue comparison */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 break-words">Revenue (Moderate)</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white break-words">
                {loc.revenue.find(r => r.scenario === 'Moderate')?.monthly || 'N/A'}
              </div>
            </div>
          </MotionDiv>
        ))}
      </div>

      {/* Winner badge */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/50 rounded-xl">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            🏆 {topTwo[0].name} leads by {topTwo[0].score - topTwo[1].score} points
          </span>
        </div>
      </div>
    </div>
  );
};
