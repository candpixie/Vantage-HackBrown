import React from 'react';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';

interface Agent {
  name: string;
  status: 'done' | 'active' | 'pending';
  time?: string;
}

export const LinearPipeline: React.FC<{ agents: Agent[] }> = ({ agents }) => {
  const doneCount = agents.filter(a => a.status === 'done').length;
  const activeIndex = agents.findIndex(a => a.status === 'active');
  const progress = activeIndex >= 0 
    ? ((doneCount + 0.5) / agents.length) * 100 
    : (doneCount / agents.length) * 100;

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-lg">Analysis Progress</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            {activeIndex >= 0 
              ? `Analyzing Manhattan... (Step ${doneCount + 1} of ${agents.length})`
              : doneCount === agents.length 
                ? 'Analysis complete'
                : 'Preparing analysis...'}
          </p>
        </div>
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {doneCount + (activeIndex >= 0 ? 1 : 0)} / {agents.length}
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="mb-6">
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-right">
          {Math.round(progress)}% complete
        </div>
      </div>
      
      {/* Agent list */}
      <div className="space-y-3">
        {agents.map((agent, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              agent.status === 'done' ? 'bg-emerald-500/20 text-emerald-400' :
              agent.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
              'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
            }`}>
              {agent.status === 'done' ? <CheckCircle2 className="w-5 h-5" /> :
               agent.status === 'active' ? <Loader2 className="w-5 h-5 animate-spin" /> :
               <Circle className="w-5 h-5" />}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-slate-900 dark:text-white">{agent.name}</div>
              {agent.time && (
                <div className="text-xs text-slate-500 dark:text-slate-400">{agent.time}</div>
              )}
            </div>
            
            {agent.status === 'active' && (
              <div className="text-xs font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">Running...</div>
            )}
            {agent.status === 'done' && agent.time && (
              <div className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{agent.time}</div>
            )}
          </div>
        ))}
      </div>

      {activeIndex >= 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Scanning retail spaces in target neighborhoods
          </p>
        </div>
      )}
    </div>
  );
};
