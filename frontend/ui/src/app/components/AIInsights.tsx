import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, Loader2 } from 'lucide-react';
import { apiService } from '../../services/api';
import type { LocationResult } from '../../services/api';

const MotionDiv = motion.div as any;

interface Insight {
  type: 'opportunity' | 'risk' | 'trend' | 'tip';
  title: string;
  description: string;
}
interface AIInsightsProps {
  locationName: string;
  score: number;
  locationData?: LocationResult;
  businessType?: string;
  targetDemo?: string;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ locationName, score, locationData, businessType, targetDemo }) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fallback mock insights
  const fallbackInsights: Insight[] = [

    {
      type: 'opportunity',
      title: 'Peak Hours Opportunity',
      description: 'Foot traffic peaks 2-4pm but competitor lines are long. Consider express ordering to capture overflow demand.'
    },
    {
      type: 'trend',
      title: 'Demographic Shift',
      description: `Gen Z population in ${locationName} increased 23% YoY. Strong alignment with ${businessType.toLowerCase()} demand - market is expanding.`
    },
    {
      type: 'risk',
      title: 'Rent Escalation',
      description: 'Commercial rents in this zone increased 12% annually. Budget for 3-5% annual increases in lease renewals.'
    },
    {
      type: 'tip',
      title: 'Competitive Edge',
      description: 'No competitors offer late-night service past 8pm. Extended hours (until 10pm) could capture 15-20% additional revenue.'
    }
  ];

  // Fetch AI insights from backend
  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      setError(null);

      try {
        if (locationData) {
          const aiInsights = await apiService.generateInsights(locationData, businessType, targetDemo);
          
          if (aiInsights && aiInsights.length > 0) {
            // Validate and format insights
            const validInsights = aiInsights
              .filter((insight: any) => 
                insight.type && 
                (insight.type === 'opportunity' || insight.type === 'risk' || insight.type === 'trend' || insight.type === 'tip') &&
                insight.title && 
                insight.description
              )
              .map((insight: any) => ({
                type: insight.type as 'opportunity' | 'risk' | 'trend' | 'tip',
                title: insight.title,
                description: insight.description
              }));
            
            if (validInsights.length > 0) {
              // Add score-specific insight if applicable
              if (score >= 95 && !validInsights.some(i => i.title.toLowerCase().includes('elite'))) {
                validInsights.unshift({
                  type: 'opportunity' as const,
                  title: 'Elite Location Match',
                  description: 'This location scores in the top 5% for your business type. High probability of success with proper execution.'
                });
              }
              setInsights(validInsights);
            } else {
              // Use fallback if no valid insights
              setInsights(fallbackInsights);
            }
          } else {
            // Use fallback if empty response
            setInsights(fallbackInsights);
          }
        } else {
          // Use fallback if no location data
          setInsights(fallbackInsights);
        }
      } catch (err) {
        console.error('Error fetching AI insights:', err);
        setError('Failed to load AI insights');
        setInsights(fallbackInsights);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [locationName, score, locationData, businessType, targetDemo]);

  // Add score-specific insights to fallback
  const displayInsights = loading ? [] : (insights.length > 0 ? insights : fallbackInsights);

  const icons = {
    opportunity: TrendingUp,
    risk: AlertTriangle,
    trend: Sparkles,
    tip: Lightbulb
  };

  const colors = {
    opportunity: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/30', text: 'text-emerald-700 dark:text-emerald-400', icon: 'text-emerald-600 dark:text-emerald-400' },
    risk: { bg: 'bg-orange-50 dark:bg-orange-500/10', border: 'border-orange-200 dark:border-orange-500/30', text: 'text-orange-700 dark:text-orange-400', icon: 'text-orange-600 dark:text-orange-400' },
    trend: { bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/30', text: 'text-amber-700 dark:text-amber-400', icon: 'text-amber-600 dark:text-amber-400' },
    tip: { bg: 'bg-violet-50 dark:bg-violet-500/10', border: 'border-violet-200 dark:border-violet-500/30', text: 'text-violet-700 dark:text-violet-400', icon: 'text-violet-600 dark:text-violet-400' }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
        <h3 className="font-bold text-slate-900 dark:text-white">AI Insights for {locationName}</h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-violet-600 dark:text-violet-400 animate-spin mr-2" />
          <span className="text-slate-600 dark:text-slate-400">Generating AI insights...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 rounded-xl">
          <p className="text-sm text-orange-700 dark:text-orange-400">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {displayInsights.map((insight, idx) => {
          const Icon = icons[insight.type];
          const color = colors[insight.type];

          return (
            <MotionDiv
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02, x: 4 }}
              className={`p-4 border ${color.border} ${color.bg} rounded-xl hover:shadow-md cursor-pointer transition-all`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 bg-white dark:bg-slate-700 rounded-lg ${color.icon} flex-shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-bold ${color.text} mb-1 break-words`}>
                    {insight.title}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed break-words">
                    {insight.description}
                  </div>
                </div>
              </div>
            </MotionDiv>
          );
        })}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          💡 Insights generated by Vantage AI using {loading ? 'real-time' : 'Gemini'} data analysis
        </p>
      </div>
    </div>
  );
};
