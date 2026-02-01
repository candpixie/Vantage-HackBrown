import React, { useState } from 'react';
import { Search, MapPin, Users, DollarSign, Zap, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

const MotionDiv = motion.div as any;
const MotionButton = motion.button as any;

interface InputFormProps {
  onAnalyze: () => void;
  isAnalyzing: boolean;
  businessType: string;
  setBusinessType: (v: string) => void;
  budget: number;
  setBudget: (v: number) => void;
  targetDemo: string;
  setTargetDemo: (v: string) => void;
}

export const InputForm: React.FC<InputFormProps> = ({
  onAnalyze,
  isAnalyzing,
  businessType,
  setBusinessType,
  budget,
  setBudget,
  targetDemo,
  setTargetDemo
}) => {

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
            <Search className="w-4 h-4 text-white" />
          </div>
          Business Type
        </label>
        <div className="relative group">
          <select
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl px-5 py-4 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none cursor-pointer hover:border-teal-400 transition-all"
          >
            <option>Boba Tea Shop</option>
            <option>Coffee Roastery</option>
            <option>Craft Cocktail Bar</option>
            <option>Boutique Fitness</option>
            <option>Specialty Bakery</option>
            <option>Fast Casual Restaurant</option>
          </select>
          <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-slate-400 pointer-events-none rotate-90" />
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          Target Demographic
        </label>
        <div className="relative group">
          <select
            value={targetDemo}
            onChange={(e) => setTargetDemo(e.target.value)}
            className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl px-5 py-4 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none cursor-pointer hover:border-teal-400 transition-all"
          >
            <option>Gen Z Students</option>
            <option>Young Professionals</option>
            <option>High-Net Worth Families</option>
            <option>Digital Nomads</option>
            <option>Retirees</option>
          </select>
          <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 dark:text-slate-400 pointer-events-none rotate-90" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center gap-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            <span className="truncate">Monthly Budget</span>
          </label>
          <MotionDiv
            key={budget}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-xl flex-shrink-0 whitespace-nowrap"
          >
            <span className="text-lg font-black text-white">${budget.toLocaleString()}</span>
          </MotionDiv>
        </div>
        <div className="relative">
          <input
            type="range"
            min="2000"
            max="15000"
            step="500"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full h-3 rounded-full appearance-none cursor-pointer hover:opacity-80 transition-opacity"
            style={{
              background: `linear-gradient(to right,
                #14B8A6 0%,
                #14B8A6 ${((budget - 2000) / (15000 - 2000)) * 100}%,
                rgba(226, 232, 240, 0.5) ${((budget - 2000) / (15000 - 2000)) * 100}%,
                rgba(226, 232, 240, 0.5) 100%)`,
            }}
          />
          <div className="flex justify-between mt-2 text-xs font-bold text-slate-500 dark:text-slate-400 gap-2">
            <span className="whitespace-nowrap">$2k</span>
            <span className="text-slate-600 dark:text-slate-500 truncate">Budget Range</span>
            <span className="whitespace-nowrap">$15k</span>
          </div>
        </div>
      </div>

      <MotionButton
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.97 }}
        onClick={onAnalyze}
        disabled={isAnalyzing}
        className={`w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-3 transition-all ${isAnalyzing
          ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
          : 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-sm hover:shadow-md hover:from-teal-600 hover:to-emerald-700'
          }`}
      >
        {isAnalyzing ? (
          <>
            <MotionDiv
              className="w-6 h-6 border-3 border-slate-400 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <Zap className="w-6 h-6" />
            <span>Find Perfect Locations</span>
          </>
        )}
      </MotionButton>
    </div>
  );
};
