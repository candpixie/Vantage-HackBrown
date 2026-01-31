import React from 'react';
import { motion } from 'motion/react';
import { RefreshCcw, SlidersHorizontal } from 'lucide-react';

interface WhatIfControlsProps {
  onReRun: () => void;
  isAnalyzing: boolean;
}

export const WhatIfControls: React.FC<WhatIfControlsProps> = ({ onReRun, isAnalyzing }) => {
  return (
    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />
      
      <div className="flex items-center gap-6 flex-1 w-full">
        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
          <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
        </div>
        
        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Scenario Testing: What If?</h3>
            <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Adjust parameters to re-calculate ROI</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-[9px] font-bold text-white/40 uppercase">
                <span>Foot Traffic Sensitivity</span>
                <span className="text-indigo-400">High Impact</span>
              </div>
              <input type="range" className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-indigo-500" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[9px] font-bold text-white/40 uppercase">
                <span>Competition Tolerance</span>
                <span className="text-purple-400">Aggressive</span>
              </div>
              <input type="range" className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-purple-500" />
            </div>
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onReRun}
        disabled={isAnalyzing}
        className="px-8 py-4 bg-white text-black rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCcw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
        Re-Run Analysis
      </motion.button>
    </div>
  );
};
