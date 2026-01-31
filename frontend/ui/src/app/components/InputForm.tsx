import React from 'react';
import { Search, MapPin, Users, DollarSign, Rocket } from 'lucide-react';
import { motion } from 'motion/react';

interface InputFormProps {
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onAnalyze, isAnalyzing }) => {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full -mr-16 -mt-16 pointer-events-none" />
      
      <div className="space-y-6 relative z-10">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
            <Search className="w-3 h-3" /> Business Type
          </label>
          <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none">
            <option className="bg-[#0A0A0F]">Boba Tea Shop</option>
            <option className="bg-[#0A0A0F]">Coffee Roastery</option>
            <option className="bg-[#0A0A0F]">Craft Cocktail Bar</option>
            <option className="bg-[#0A0A0F]">Boutique Fitness</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
            <Users className="w-3 h-3" /> Target Demographic
          </label>
          <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none">
            <option className="bg-[#0A0A0F]">Gen Z Students</option>
            <option className="bg-[#0A0A0F]">Young Professionals</option>
            <option className="bg-[#0A0A0F]">High-Net Worth Families</option>
            <option className="bg-[#0A0A0F]">Digital Nomads</option>
          </select>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
              <DollarSign className="w-3 h-3" /> Monthly Budget
            </label>
            <span className="text-sm font-black text-indigo-400">$8,500</span>
          </div>
          <input 
            type="range" 
            min="2000" 
            max="15000" 
            step="500" 
            defaultValue="8500"
            className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-[8px] font-bold text-white/20 uppercase tracking-widest">
            <span>$2k</span>
            <span>$15k</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all duration-300 relative overflow-hidden group ${
            isAnalyzing 
              ? 'bg-white/5 text-white/40 cursor-not-allowed' 
              : 'bg-indigo-600 text-white shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_40px_rgba(99,102,241,0.6)]'
          }`}
        >
          {isAnalyzing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Processing...
            </div>
          ) : (
            <span className="flex items-center gap-3">
              <Rocket className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              Initialize Synthesis
            </span>
          )}
          {!isAnalyzing && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          )}
        </motion.button>
      </div>
    </div>
  );
};
