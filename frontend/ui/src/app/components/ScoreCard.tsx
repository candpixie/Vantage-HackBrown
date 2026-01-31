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
      bg: 'bg-[#10B981]/10', 
      border: 'border-[#10B981]',
      badge: 'HIGH confidence'
    },
    MEDIUM: { 
      text: 'text-yellow-600', 
      bg: 'bg-yellow-50', 
      border: 'border-yellow-500',
      badge: 'MEDIUM confidence'
    },
    LOW: { 
      text: 'text-orange-600', 
      bg: 'bg-orange-50', 
      border: 'border-orange-500',
      badge: 'LOW confidence'
    }
  };

  const config = confidenceConfig[confidence];

  return (
    <div className="inline-flex items-center gap-3 px-4 py-2 bg-white border border-[#E5E7EB] rounded-xl">
      <div className="text-right">
        <span className="text-3xl font-bold text-slate-900 tabular-nums">
          {displayScore}
        </span>
        <span className="text-sm font-medium text-slate-500">/100</span>
      </div>
      <div className="h-12 w-px bg-[#E5E7EB]" />
      <div className={`px-3 py-1.5 rounded-lg border ${config.bg} ${config.border} ${config.text}`}>
        <span className="text-xs font-semibold uppercase tracking-wide">
          {config.badge}
        </span>
      </div>
    </div>
  );
};
