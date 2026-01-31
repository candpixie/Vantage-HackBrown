import React from 'react';
import { Star, Clock, MapPin, ExternalLink, AlertCircle } from 'lucide-react';

interface Competitor {
  name: string;
  rating: number;
  reviews: number;
  distance: string;
  status: 'Open' | 'Closed';
  weakness?: string;
}

interface CompetitorCardProps {
  competitor: Competitor;
}

export const CompetitorCard: React.FC<CompetitorCardProps> = ({ competitor }) => {
  return (
    <div className="glass-card border border-white/30 rounded-xl p-4 premium-glow-hover group">
      <div className="flex justify-between items-start mb-3">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-slate-900">{competitor.name}</h4>
            <div className={`w-2 h-2 rounded-full ${competitor.status === 'Open' ? 'bg-[#10B981]' : 'bg-orange-500'}`} />
          </div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.floor(competitor.rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-slate-200'
                }`}
              />
            ))}
            <span className="text-xs font-medium text-slate-500 ml-1">
              {competitor.rating} ({competitor.reviews} reviews)
            </span>
          </div>
        </div>
        <button 
          onClick={() => console.log(`View ${competitor.name} details`)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {competitor.weakness && (
        <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-amber-900">Weakness</p>
              <p className="text-xs text-amber-700">{competitor.weakness}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#E5E7EB]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
            <Clock className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-slate-500 uppercase">Status</span>
            <span className={`text-xs font-semibold ${
              competitor.status === 'Open' ? 'text-[#10B981]' : 'text-orange-600'
            }`}>
              {competitor.status}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-slate-500 uppercase">Distance</span>
            <span className="text-xs font-semibold text-slate-900">{competitor.distance}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
