import React, { useState } from 'react';
import { Search, MapPin, Users, DollarSign, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface InputFormProps {
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onAnalyze, isAnalyzing }) => {
  const [businessType, setBusinessType] = useState('Boba Tea Shop');
  const [budget, setBudget] = useState(8500);
  const [targetDemo, setTargetDemo] = useState('Gen Z Students');

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Search className="w-4 h-4 text-[#6366F1]" />
          Business Type
        </label>
        <select
          value={businessType}
          onChange={(e) => setBusinessType(e.target.value)}
          className="w-full glass-card border border-white/30 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50 focus:border-transparent appearance-none cursor-pointer hover:border-[#6366F1]/50 transition-all premium-glow-hover"
        >
          <option>Boba Tea Shop</option>
          <option>Coffee Roastery</option>
          <option>Craft Cocktail Bar</option>
          <option>Boutique Fitness</option>
          <option>Specialty Bakery</option>
          <option>Fast Casual Restaurant</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Users className="w-4 h-4 text-[#6366F1]" />
          Target Demographic
        </label>
        <select
          value={targetDemo}
          onChange={(e) => setTargetDemo(e.target.value)}
          className="w-full glass-card border border-white/30 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50 focus:border-transparent appearance-none cursor-pointer hover:border-[#6366F1]/50 transition-all premium-glow-hover"
        >
          <option>Gen Z Students</option>
          <option>Young Professionals</option>
          <option>High-Net Worth Families</option>
          <option>Digital Nomads</option>
          <option>Retirees</option>
        </select>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#6366F1]" />
            Monthly Budget
          </label>
          <span className="text-lg font-bold text-[#6366F1]">${budget.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min="2000"
          max="15000"
          step="500"
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-[#6366F1]"
          style={{
            background: `linear-gradient(to right, #6366F1 0%, #6366F1 ${((budget - 2000) / (15000 - 2000)) * 100}%, #E5E7EB ${((budget - 2000) / (15000 - 2000)) * 100}%, #E5E7EB 100%)`
          }}
        />
        <div className="flex justify-between text-xs font-medium text-slate-500">
          <span>$2k</span>
          <span>$15k</span>
        </div>
      </div>

        <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onAnalyze}
        disabled={isAnalyzing}
        className={`w-full py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
          isAnalyzing
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-xl shadow-[#6366F1]/40 hover:shadow-2xl hover:shadow-[#6366F1]/50'
        }`}
      >
        {isAnalyzing ? (
          <>
            <div className="w-5 h-5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Zap className="w-5 h-5" />
            Find Locations
          </>
        )}
      </motion.button>
    </div>
  );
};
