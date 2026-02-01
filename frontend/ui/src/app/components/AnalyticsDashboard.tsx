import React from 'react';
import { motion } from 'motion/react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Users, MapPin, Activity, Target } from 'lucide-react';

const MotionDiv = motion.div as any;

interface AnalyticsDashboardProps {
  businessType: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ businessType }) => {
  const metrics = [
    { label: 'Total Analyses', value: '247', change: '+12%', trend: 'up', icon: BarChart3 },
    { label: 'Avg. Score', value: '87.3', change: '+2.1%', trend: 'up', icon: Target },
    { label: 'Locations Analyzed', value: '1,429', change: '+8%', trend: 'up', icon: MapPin },
    { label: 'Revenue Projected', value: '$12.4M', change: '+15%', trend: 'up', icon: DollarSign }
  ];

  const topLocations = [
    { name: 'Chelsea Highline', score: 98, analyses: 24, revenue: '$42.3k' },
    { name: 'Tribeca Lofts', score: 89, analyses: 18, revenue: '$38.2k' },
    { name: 'SoHo Artisan', score: 76, analyses: 12, revenue: '$35.4k' }
  ];

  const trends = [
    { month: 'Jan', value: 82 },
    { month: 'Feb', value: 85 },
    { month: 'Mar', value: 87 },
    { month: 'Apr', value: 84 },
    { month: 'May', value: 89 },
    { month: 'Jun', value: 87 }
  ];

  const maxValue = Math.max(...trends.map(t => t.value));

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, idx) => (
          <MotionDiv
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.03, y: -4 }}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm hover:shadow-md cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between mb-4 gap-2">
              <div className={`p-3 rounded-lg flex-shrink-0 ${metric.trend === 'up' ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-red-100 dark:bg-red-500/20'}`}>
                <metric.icon className={`w-5 h-5 ${metric.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-bold whitespace-nowrap flex-shrink-0 ${metric.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {metric.trend === 'up' ? <TrendingUp className="w-4 h-4 flex-shrink-0" /> : <TrendingDown className="w-4 h-4 flex-shrink-0" />}
                <span>{metric.change}</span>
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white mb-1 break-words">{metric.value}</div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400 break-words">{metric.label}</div>
          </MotionDiv>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Trend Chart */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            Average Score Trend
          </h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {trends.map((trend, idx) => (
              <div key={trend.month} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center justify-end h-full">
                  <MotionDiv
                    initial={{ height: 0 }}
                    animate={{ height: `${(trend.value / maxValue) * 100}%` }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    className="w-full bg-gradient-to-t from-teal-500 to-teal-400 rounded-t-lg min-h-[20px]"
                  />
                </div>
                <div className="text-xs font-bold text-slate-600 dark:text-slate-400">{trend.month}</div>
                <div className="text-xs font-black text-slate-900 dark:text-white">{trend.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Locations */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            Top Performing Locations
          </h3>
          <div className="space-y-4">
            {topLocations.map((loc, idx) => (
              <MotionDiv
                key={loc.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.02, x: 4 }}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg gap-4 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 dark:text-white mb-1 truncate">{loc.name}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 break-words">{loc.analyses} analyses</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-black text-teal-600 dark:text-teal-400 break-words">{loc.score}</div>
                  <div className="text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">{loc.revenue}/mo</div>
                </div>
              </MotionDiv>
            ))}
          </div>
        </div>
      </div>

      {/* Business Type Distribution */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          Analysis by Business Type
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { type: businessType, count: 89, color: 'bg-teal-500' },
            { type: 'Coffee', count: 67, color: 'bg-emerald-500' },
            { type: 'Restaurant', count: 45, color: 'bg-emerald-500' },
            { type: 'Retail', count: 32, color: 'bg-purple-500' },
            { type: 'Fitness', count: 14, color: 'bg-pink-500' },
            { type: 'Other', count: 0, color: 'bg-slate-400' }
          ].map((item, idx) => (
            <div key={item.type} className="text-center">
              <div className={`h-24 ${item.color} rounded-lg flex items-center justify-center mb-2`}>
                <span className="text-2xl font-black text-white">{item.count}</span>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">{item.type}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
