import React from 'react';
import { Star, Clock, MapPin, ExternalLink } from 'lucide-react';

interface Competitor {
  name: string;
  rating: number;
  reviews: number;
  distance: string;
  status: 'Open' | 'Closed';
}

interface CompetitorCardProps {
  competitor: Competitor;
}

export const CompetitorCard: React.FC<CompetitorCardProps> = ({ competitor }) => {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/5 rounded-xl p-4 group hover:bg-white/10 transition-all duration-300">
      <div className="flex justify-between items-start mb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-black text-white uppercase tracking-tight">{competitor.name}</h4>
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          </div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-3 h-3 ${i < Math.floor(competitor.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-white/10'}`} 
              />
            ))}
            <span className="text-[10px] font-bold text-white/40 ml-1">({competitor.reviews} reviews)</span>
          </div>
        </div>
        <button className="text-white/20 hover:text-white transition-colors">
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center">
            <Clock className="w-3 h-3 text-white/40" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-white/20 uppercase">Status</span>
            <span className={`text-[10px] font-black uppercase ${competitor.status === 'Open' ? 'text-green-400' : 'text-orange-400'}`}>
              {competitor.status}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center">
            <MapPin className="w-3 h-3 text-white/40" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-white/20 uppercase">Dist.</span>
            <span className="text-[10px] font-black text-white uppercase">{competitor.distance}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
