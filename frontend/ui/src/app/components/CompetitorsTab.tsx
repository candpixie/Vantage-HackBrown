import React from 'react';
import { motion } from 'motion/react';
import { Target, Star, MapPin, Clock, AlertTriangle } from 'lucide-react';

const MotionDiv = motion.div as any;

interface CompetitorsTabProps {
  locationName: string;
}

export const CompetitorsTab: React.FC<CompetitorsTabProps> = ({ locationName }) => {
  const competitors = [
    {
      name: 'Blue Bottle Coffee',
      rating: 4.6,
      reviews: 1247,
      distance: '0.1 mi',
      hours: '7am-8pm',
      weakness: 'Premium pricing ($6-8 per drink)',
      threat: 'High'
    },
    {
      name: 'Joe Coffee',
      rating: 4.4,
      reviews: 892,
      distance: '0.2 mi',
      hours: '6am-9pm',
      weakness: 'Limited seating (12 seats)',
      threat: 'Medium'
    },
    {
      name: 'Stumptown Coffee',
      rating: 4.5,
      reviews: 1103,
      distance: '0.3 mi',
      hours: '7am-7pm',
      weakness: 'Crowded peak hours (2-4pm)',
      threat: 'Medium'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Target className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          Nearby Competitors
        </h3>
        <div className="space-y-4">
          {competitors.map((comp, idx) => (
            <MotionDiv
              key={comp.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-4 gap-4">
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-black text-slate-900 dark:text-white mb-1 break-words">{comp.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                      <span className="font-bold text-slate-900 dark:text-white">{comp.rating}</span>
                      <span>({comp.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span>{comp.distance}</span>
                    </div>
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate max-w-[80px]">{comp.hours}</span>
                    </div>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap flex-shrink-0 ${comp.threat === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                  {comp.threat} Threat
                </div>
              </div>
              <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 break-words">Weakness</div>
                    <div className="text-sm text-slate-700 dark:text-slate-300 break-words">{comp.weakness}</div>
                  </div>
                </div>
              </div>
            </MotionDiv>
          ))}
        </div>
      </div>

      <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl p-6">
        <h4 className="font-black text-slate-900 dark:text-white mb-2">Competitive Advantage</h4>
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
          All competitors close by 8pm. Offering extended hours (until 10pm) could capture 15-20%
          additional revenue from evening foot traffic. None offer boba-specific menu items, creating
          a clear differentiation opportunity.
        </p>
      </div>
    </div>
  );
};
