import React from 'react';
import { motion } from 'motion/react';
import { Check, Loader2 } from 'lucide-react';

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
    <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 pointer-events-none" />
      
      <div className="flex items-center justify-between relative z-10 max-w-4xl mx-auto">
        {agents.map((agent, index) => (
          <div key={agent.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-3 group shrink-0">
              <div className="relative">
                {/* Node */}
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: agent.status === 'done' ? 'rgba(34, 197, 94, 0.2)' : agent.status === 'active' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    borderColor: agent.status === 'done' ? '#22C55E' : agent.status === 'active' ? '#6366F1' : 'rgba(255, 255, 255, 0.1)',
                  }}
                  className="w-12 h-12 rounded-xl border flex items-center justify-center relative z-20 transition-colors duration-500"
                >
                  {agent.status === 'done' ? (
                    <Check className="w-6 h-6 text-green-500" />
                  ) : agent.status === 'active' ? (
                    <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                  ) : (
                    <span className="text-sm font-bold text-white/40">{index + 1}</span>
                  )}
                </motion.div>

                {/* Glow Effect */}
                {agent.status === 'active' && (
                  <motion.div
                    layoutId="glow"
                    className="absolute -inset-2 rounded-2xl bg-indigo-500/20 blur-md z-10"
                    animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </div>
              
              <div className="flex flex-col items-center">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${
                  agent.status === 'idle' ? 'text-white/20' : 'text-indigo-400'
                }`}>
                  Agent 0{index + 1}
                </span>
                <span className={`text-xs font-bold whitespace-nowrap ${
                  agent.status === 'idle' ? 'text-white/40' : 'text-white'
                }`}>
                  {agent.name}
                </span>
              </div>
            </div>

            {/* Connection Line */}
            {index < agents.length - 1 && (
              <div className="flex-1 h-[2px] mx-4 bg-white/5 relative overflow-hidden min-w-[20px]">
                {agents[index].status === 'done' && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className="absolute inset-0 bg-gradient-to-r from-green-500/50 to-indigo-500/50 origin-left"
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
                      <div key={i} className="w-1 h-1 bg-indigo-400 rounded-full blur-[1px]" />
                    ))}
                  </motion.div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        {agents.some(a => a.status === 'active') ? (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
              {agents.find(a => a.status === 'active')?.name} processing neural nodes...
            </span>
          </div>
        ) : agents.every(a => a.status === 'done') ? (
          <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">
            Neural synthesis complete
          </span>
        ) : (
          <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
            System ready for initialization
          </span>
        )}
      </div>
    </div>
  );
};
