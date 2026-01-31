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
    <div className="w-full glass-card premium-glow rounded-2xl p-6 liquid-shine">
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
                                     agent.status === 'active' ? '#3B82F6' : 'rgba(226, 232, 240, 0.5)',
                      borderColor: agent.status === 'done' ? '#10B981' :
                                  agent.status === 'active' ? '#3B82F6' : '#E5E7EB',
                      scale: agent.status === 'active' ? [1, 1.05, 1] : 1,
                    }}
                    transition={{
                      scale: {
                        duration: 2,
                        repeat: agent.status === 'active' ? Infinity : 0,
                        ease: 'easeInOut',
                      },
                    }}
                    className="w-16 h-16 rounded-2xl border-2 flex items-center justify-center relative z-20 transition-all duration-500 shadow-lg backdrop-blur-sm"
                  >
                    {agent.status === 'done' ? (
                      <CheckCircle2 className="w-8 h-8 text-white drop-shadow-lg" />
                    ) : agent.status === 'active' ? (
                      <Loader2 className="w-8 h-8 text-white animate-spin drop-shadow-lg" />
                    ) : (
                      <span className="text-xl font-bold text-slate-400">{index + 1}</span>
                    )}
                  </motion.div>

                  {agent.status === 'active' && (
                    <>
                      <motion.div
                        className="absolute -inset-3 rounded-2xl bg-[#3B82F6]/30 blur-lg z-10"
                        animate={{
                          opacity: [0.3, 0.6, 0.3],
                          scale: [1, 1.15, 1]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <motion.div
                        className="absolute -inset-1 rounded-2xl z-0"
                        style={{
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.5), rgba(37, 99, 235, 0.5))',
                        }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      />
                    </>
                  )}

                  {agent.status === 'done' && (
                    <motion.div
                      className="absolute -inset-2 rounded-2xl bg-[#10B981]/20 blur-md z-10"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    />
                  )}
                </div>

                <div className="flex flex-col items-center text-center">
                  <span className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${
                    agent.status === 'idle' ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Agent {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className={`text-xs font-bold whitespace-nowrap ${
                    agent.status === 'idle' ? 'text-slate-400' :
                    agent.status === 'active' ? 'text-[#3B82F6]' : 'text-slate-900'
                  }`}>
                    {agent.name}
                  </span>
                </div>
              </div>

              {!isLast && (
                <div className="flex-1 h-1 mx-4 bg-gradient-to-r from-slate-200 to-slate-200 rounded-full relative overflow-hidden min-w-[40px]">
                  {agent.status === 'done' && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="absolute inset-0 bg-gradient-to-r from-[#10B981] via-[#3B82F6] to-[#2563EB] origin-left rounded-full"
                    />
                  )}
                  {agent.status === 'active' && (
                    <>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-[#3B82F6]/30 to-[#2563EB]/30 rounded-full"
                        animate={{ scaleX: [0, 1, 1, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <motion.div
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#3B82F6] rounded-full shadow-lg"
                        style={{
                          boxShadow: '0 0 12px rgba(59, 130, 246, 0.8)',
                        }}
                        animate={{ x: ['-12px', 'calc(100% + 12px)'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    </>
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-center gap-2">
        {agents.some(a => a.status === 'active') ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-4 py-2 glass-gradient rounded-xl border border-white/30"
          >
            <motion.div
              className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-xs font-bold text-slate-700">
              {agents.find(a => a.status === 'active')?.name} processing...
            </span>
          </motion.div>
        ) : agents.every(a => a.status === 'done') ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#10B981]/10 to-emerald-500/10 rounded-xl border border-[#10B981]/30"
          >
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            <span className="text-xs font-bold text-[#10B981]">
              Analysis Complete
            </span>
          </motion.div>
        ) : (
          <span className="text-xs font-semibold text-slate-400 px-4 py-2">
            Ready to analyze
          </span>
        )}
      </div>
    </div>
  );
};
