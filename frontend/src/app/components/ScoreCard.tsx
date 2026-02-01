import React, { useState, useEffect } from 'react';
import { motion, animate } from 'motion/react';

interface ScoreCardProps {
  score: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  label?: string;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ score, confidence, label = "SCORE" }) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const controls = animate(0, score, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (value) => setDisplayScore(Math.round(value))
    });
    return () => controls.stop();
  }, [score]);

  const confidenceConfig = {
    HIGH: { 
      text: 'text-[#10B981]', 
      bg: 'bg-[#10B981]/20', 
      border: 'border-[#10B981]/50',
      badge: 'HIGH confidence'
    },
    MEDIUM: { 
      text: 'text-yellow-400', 
      bg: 'bg-yellow-500/20', 
      border: 'border-yellow-500/50',
      badge: 'MEDIUM confidence'
    },
    LOW: { 
      text: 'text-orange-400', 
      bg: 'bg-orange-500/20', 
      border: 'border-orange-500/50',
      badge: 'LOW confidence'
    }
  };

  const config = confidenceConfig[confidence];

  return (
    <div className="inline-flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
      <div className="text-right">
        <span className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
          {displayScore}
        </span>
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">/100</span>
      </div>
      <div className="h-12 w-px bg-slate-200 dark:bg-slate-700" />
      <div className={`px-3 py-1.5 rounded-lg border ${config.bg} ${config.border} ${config.text}`}>
        <span className="text-xs font-semibold uppercase tracking-wide">
          {config.badge}
        </span>
      </div>
    </div>
  );
};
