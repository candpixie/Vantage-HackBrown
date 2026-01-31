import React from 'react';
import { motion } from 'motion/react';

interface Metric {
  label: string;
  score: number;
  confidence: 'HIGH' | 'MED' | 'LOW';
}

interface ScoreBreakdownProps {
  metrics: Metric[];
}

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ metrics }) => {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-black text-white uppercase tracking-widest">Score Breakdown</h3>
        <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Neural Analysis</span>
      </div>

      <div className="space-y-5">
        {metrics.map((metric, index) => (
          <div key={metric.label} className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold text-white/60 uppercase tracking-tighter">{metric.label}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-white">{metric.score}</span>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${
                  metric.confidence === 'HIGH' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                  metric.confidence === 'MED' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                  'bg-orange-500/10 border-orange-500/20 text-orange-400'
                }`}>
                  {metric.confidence}
                </span>
              </div>
            </div>
            
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metric.score}%` }}
                transition={{ duration: 1, delay: 0.1 * index, ease: "easeOut" }}
                className={`h-full rounded-full relative ${
                  metric.score > 85 ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' :
                  metric.score > 70 ? 'bg-indigo-400' : 'bg-indigo-300'
                }`}
              >
                {metric.score > 85 && (
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    animate={{ opacity: [0, 0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
