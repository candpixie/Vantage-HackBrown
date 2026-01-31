import React, { useState, useEffect } from 'react';
import { motion, useSpring, useTransform, animate } from 'motion/react';

interface ScoreCardProps {
  score: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  label?: string;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ score, confidence, label = "SITE SCORE" }) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const controls = animate(0, score, {
      duration: 2,
      ease: "easeOut",
      onUpdate: (value) => setDisplayScore(Math.round(value))
    });
    return () => controls.stop();
  }, [score]);

  const confidenceColors = {
    HIGH: { text: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/50', glow: 'shadow-green-500/20' },
    MEDIUM: { text: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', glow: 'shadow-yellow-500/20' },
    LOW: { text: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/50', glow: 'shadow-orange-500/20' }
  };

  const colors = confidenceColors[confidence];

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
      <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-${confidence === 'HIGH' ? 'green' : 'indigo'}-500/5 pointer-events-none`} />
      
      <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-4">{label}</span>
      
      <div className="relative">
        <span className="text-7xl font-black text-white tracking-tighter tabular-nums">
          {displayScore}
        </span>
        <span className="text-xl font-bold text-white/20 absolute -right-8 bottom-2">/100</span>
      </div>

      <div className={`mt-6 px-4 py-1.5 rounded-full border ${colors.bg} ${colors.border} flex items-center gap-2 ${colors.glow} shadow-lg`}>
        <div className={`w-2 h-2 rounded-full ${confidence === 'HIGH' ? 'bg-green-400 animate-pulse' : 'bg-current'}`} />
        <span className={`text-[10px] font-black uppercase tracking-widest ${colors.text}`}>
          {confidence} CONFIDENCE
        </span>
      </div>
    </div>
  );
};
