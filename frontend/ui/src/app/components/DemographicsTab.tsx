import React from 'react';
import { motion } from 'motion/react';
import { Users, TrendingUp, MapPin } from 'lucide-react';

const MotionDiv = motion.div as any;

interface DemographicsTabProps {
  locationName: string;
  demographics?: {
    median_income?: number;
    median_age?: number;
    population_density?: number;
    household_size?: number;
  };
}

export const DemographicsTab: React.FC<DemographicsTabProps> = ({ locationName, demographics: demoData }) => {
  // Use real data if available, otherwise use mock
  const medianIncome = demoData?.median_income || 70000;
  const medianAge = demoData?.median_age || 36;
  const populationDensity = demoData?.population_density || 27000;
  const householdSize = demoData?.household_size || 2.5;

  // Calculate demographics from median age
  const genZ = medianAge < 30 ? 35 : medianAge < 40 ? 25 : 15;
  const millennials = medianAge >= 28 && medianAge < 44 ? 45 : 35;
  const genX = medianAge >= 44 && medianAge < 60 ? 20 : 15;
  const boomers = medianAge >= 60 ? 10 : 5;

  const demographics = [
    { label: 'Gen Z (18-27)', value: `${genZ}%`, trend: '+12%', color: 'bg-teal-500' },
    { label: 'Millennials (28-43)', value: `${millennials}%`, trend: '+8%', color: 'bg-purple-500' },
    { label: 'Gen X (44-59)', value: `${genX}%`, trend: '-3%', color: 'bg-pink-500' },
    { label: 'Boomers (60+)', value: `${boomers}%`, trend: '-5%', color: 'bg-emerald-600' }
  ];

  // Income distribution based on median
  const incomeRanges = [
    { range: '$0-50k', value: medianIncome < 50000 ? 40 : 15, color: 'bg-slate-300' },
    { range: '$50-100k', value: medianIncome >= 50000 && medianIncome < 100000 ? 35 : 25, color: 'bg-slate-400' },
    { range: '$100-150k', value: medianIncome >= 100000 && medianIncome < 150000 ? 30 : 20, color: 'bg-teal-500' },
    { range: '$150k+', value: medianIncome >= 150000 ? 30 : 15, color: 'bg-teal-600' }
  ];

  const income = incomeRanges;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          Population Demographics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {demographics.map((demo, idx) => (
            <MotionDiv
              key={demo.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.05, y: -4 }}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-md cursor-pointer transition-all"
            >
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 break-words">{demo.label}</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mb-1 break-words">{demo.value}</div>
              <div className={`text-xs font-bold whitespace-nowrap ${demo.trend.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {demo.trend} YoY
              </div>
            </MotionDiv>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          Household Income Distribution
        </h3>
        <div className="space-y-3">
          {income.map((inc, idx) => (
            <div key={inc.range} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-slate-700 dark:text-slate-300">{inc.range}</span>
                <span className="font-black text-slate-900 dark:text-white">{inc.value}%</span>
              </div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <MotionDiv
                  initial={{ width: 0 }}
                  animate={{ width: `${inc.value}%` }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                  className={`h-full ${inc.color} rounded-full`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/30 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-black text-slate-900 dark:text-white mb-2">Key Insight</h4>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              {locationName} has a strong concentration of Gen Z and Millennial residents ({genZ + millennials}% combined),
              with {(incomeRanges.find(r => r.range === '$100-150k')?.value ?? 20) + (incomeRanges.find(r => r.range === '$150k+')?.value ??15)}% of households earning over $100k annually. This demographic profile aligns perfectly
              with target customers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
