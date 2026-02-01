import React from 'react';
import { motion } from 'motion/react';
import { DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { VisaIntegrationStatus } from './VisaIntegrationStatus';

interface FinancialsTabProps {
  locationName: string;
  baseRevenue: string;
  visaData?: {
    dataSource?: string;
    merchantCount?: number;
    confidence?: string;
    assumptions?: string[];
  };
}

export const FinancialsTab: React.FC<FinancialsTabProps> = ({ locationName, baseRevenue, visaData }) => {
  const scenarios = [
    {
      name: 'Conservative',
      monthly: '$28,500',
      annual: '$342k',
      margin: '22%',
      color: 'bg-slate-500'
    },
    {
      name: 'Moderate',
      monthly: '$42,200',
      annual: '$506k',
      margin: '28%',
      color: 'bg-amber-500',
      recommended: true
    },
    {
      name: 'Optimistic',
      monthly: '$58,800',
      annual: '$706k',
      margin: '32%',
      color: 'bg-emerald-500'
    }
  ];

  const costs = [
    { item: 'Monthly Rent', amount: '$8,500', percentage: '20%' },
    { item: 'Labor Costs', amount: '$12,000', percentage: '28%' },
    { item: 'Inventory', amount: '$6,500', percentage: '15%' },
    { item: 'Utilities & Overhead', amount: '$2,200', percentage: '5%' },
    { item: 'Marketing', amount: '$1,500', percentage: '4%' },
    { item: 'Net Profit (Moderate)', amount: '$11,500', percentage: '28%', highlight: true }
  ];

  return (
    <div className="space-y-8">
      {/* Visa Integration Status */}
      {visaData && (
        <VisaIntegrationStatus
          dataSource={visaData.dataSource}
          merchantCount={visaData.merchantCount}
          confidence={visaData.confidence}
          assumptions={visaData.assumptions}
        />
      )}

      <div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          Revenue Projections
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scenarios.map((scenario, idx) => (
            <motion.div
              key={scenario.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.03, y: -4 }}
              className={`bg-white dark:bg-slate-800 border-2 rounded-xl p-6 cursor-pointer transition-all ${
                scenario.recommended 
                  ? 'border-amber-500 dark:border-amber-500 shadow-lg shadow-amber-500/30 hover:shadow-xl' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-600 hover:shadow-md'
              }`}
            >
              {scenario.recommended && (
                <div className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase mb-2 tracking-widest">
                  Recommended
                </div>
              )}
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 break-words">{scenario.name}</div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mb-2 break-words">{scenario.monthly}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-3 break-words">{scenario.annual} annually</div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">Margin</span>
                <span className="text-sm font-black text-slate-900 dark:text-white whitespace-nowrap">{scenario.margin}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-400" />
          Cost Breakdown (Moderate Scenario)
        </h3>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
          {costs.map((cost, idx) => (
            <div key={cost.item} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-bold ${cost.highlight ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {cost.item}
                </span>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-black ${cost.highlight ? 'text-emerald-400' : 'text-white'}`}>
                    {cost.amount}
                  </span>
                  <span className="text-xs font-bold text-slate-500">{cost.percentage}</span>
                </div>
              </div>
              {!cost.highlight && (
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: cost.percentage }}
                    transition={{ delay: idx * 0.1, duration: 0.6 }}
                    className="h-full bg-amber-500 rounded-full"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-black text-slate-900 dark:text-white mb-2">Financial Health</h4>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              Based on {locationName}, the moderate scenario projects a healthy 28% margin with 
              $11,500 monthly profit. Break-even point estimated at 60% capacity utilization. 
              Conservative scenario still yields positive cash flow, indicating strong financial viability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
