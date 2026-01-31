import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Loader2 } from 'lucide-react';

export interface AgentStatus {
  id: string;
  name: string;
  status: 'idle' | 'active' | 'done';
}

interface AgentWorkflowProps {
  agents: AgentStatus[];
}

export const AgentWorkflow: React.FC<AgentWorkflowProps> = ({ agents }) => {
  return (
    <div className="w-full bg-white border border-[#E5E7EB] rounded-xl p-6">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {agents.map((agent, index) => {
          const isLast = index === agents.length - 1;
          
          return (
            <React.Fragment key={agent.id}>
              <div className="flex flex-col items-center gap-3 group shrink-0">
                <div className="relative">
                  <motion.div
                    initial={false}
                    animate={{
                      backgroundColor: agent.status === 'done' ? '#10B981' : 
                                     agent.status === 'active' ? '#6366F1' : '#E5E7EB',
                      borderColor: agent.status === 'done' ? '#10B981' : 
                                  agent.status === 'active' ? '#6366F1' : '#E5E7EB',
                    }}
                    className="w-14 h-14 rounded-xl border-2 flex items-center justify-center relative z-20 transition-all duration-500 shadow-sm"
                  >
                    {agent.status === 'done' ? (
                      <CheckCircle2 className="w-7 h-7 text-white" />
                    ) : agent.status === 'active' ? (
                      <Loader2 className="w-7 h-7 text-white animate-spin" />
                    ) : (
                      <span className="text-lg font-bold text-slate-400">{index + 1}</span>
                    )}
                  </motion.div>

                  {agent.status === 'active' && (
                    <motion.div
                      className="absolute -inset-2 rounded-xl bg-[#6366F1]/20 blur-md z-10"
                      animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>
                
                <div className="flex flex-col items-center text-center">
                  <span className={`text-[10px] font-semibold uppercase tracking-wide ${
                    agent.status === 'idle' ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Agent {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className={`text-xs font-semibold whitespace-nowrap ${
                    agent.status === 'idle' ? 'text-slate-400' : 'text-slate-900'
                  }`}>
                    {agent.name}
                  </span>
                </div>
              </div>

              {!isLast && (
                <div className="flex-1 h-0.5 mx-4 bg-[#E5E7EB] relative overflow-hidden min-w-[40px]">
                  {agent.status === 'done' && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      className="absolute inset-0 bg-gradient-to-r from-[#10B981] to-[#6366F1] origin-left"
                    />
                  )}
                  {agent.status === 'active' && (
                    <motion.div
                      className="absolute inset-0 flex justify-around"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    >
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-1 h-1 bg-[#6366F1] rounded-full blur-[1px]" />
                      ))}
                    </motion.div>
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        {agents.some(a => a.status === 'active') ? (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#6366F1] animate-pulse" />
            <span className="text-xs font-medium text-slate-600">
              {agents.find(a => a.status === 'active')?.name} processing...
            </span>
          </div>
        ) : agents.every(a => a.status === 'done') ? (
          <span className="text-xs font-semibold text-[#10B981]">
            ✓ Analysis complete
          </span>
        ) : (
          <span className="text-xs font-medium text-slate-400">
            Ready to analyze
          </span>
        )}
      </div>
    </div>
  );
};
