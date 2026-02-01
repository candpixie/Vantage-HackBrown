import React from 'react';

export const LocationCardSkeleton: React.FC = () => (
  <div className="bg-white border border-slate-200 rounded-xl p-6 animate-pulse">
    <div className="h-6 bg-slate-200 rounded w-3/4 mb-4" />
    <div className="h-20 bg-slate-200 rounded mb-4" />
    <div className="space-y-2">
      <div className="h-4 bg-slate-200 rounded" />
      <div className="h-4 bg-slate-200 rounded w-5/6" />
      <div className="h-4 bg-slate-200 rounded w-4/6" />
    </div>
  </div>
);

export const MetricSkeleton: React.FC = () => (
  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl animate-pulse">
    <div className="flex-1">
      <div className="h-3 bg-slate-200 rounded w-24 mb-2" />
      <div className="h-5 bg-slate-200 rounded w-16" />
    </div>
    <div className="h-6 bg-slate-200 rounded w-12" />
  </div>
);

export const ComparisonSkeleton: React.FC = () => (
  <div className="bg-white border border-slate-200 rounded-xl p-6 animate-pulse">
    <div className="h-6 bg-slate-200 rounded w-48 mb-6" />
    <div className="grid grid-cols-2 gap-6">
      {[1, 2].map(i => (
        <div key={i} className="space-y-4">
          <div className="h-12 bg-slate-200 rounded" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(j => (
              <div key={j} className="space-y-2">
                <div className="h-3 bg-slate-200 rounded w-32" />
                <div className="h-2 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);
