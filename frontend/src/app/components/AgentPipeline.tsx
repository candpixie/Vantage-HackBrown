import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Loader2, Circle, X, Target, MapPin, Search, BarChart3, Sparkles, HelpCircle } from 'lucide-react';

const MotionDiv = motion.div as any;

export interface AgentStatus {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: 'waiting' | 'running' | 'done' | 'error';
  time?: string;
}

interface AgentPipelineProps {
  agents: AgentStatus[];
}

const agentIcons = {
  'orchestrator': Target,
  'scout': MapPin,
  'intel': Search,
  'analyst': BarChart3,
  'visualizer': Sparkles,
};

export const AgentPipeline: React.FC<AgentPipelineProps> = ({ agents }) => {
  const getStatusIcon = (status: string, Icon: React.ElementType) => {
    switch (status) {
      case 'done':
        return <CheckCircle2 className="w-6 h-6 text-white" />;
      case 'running':
        return <Loader2 className="w-6 h-6 text-white animate-spin" />;
      case 'error':
        return <X className="w-6 h-6 text-white" />;
      default:
        return <Icon className="w-6 h-6 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return { bg: '#10B981', border: '#10B981', text: '#10B981' };
      case 'running':
        return { bg: '#3B82F6', border: '#3B82F6', text: '#3B82F6' };
      case 'error':
        return { bg: '#EF4444', border: '#EF4444', text: '#EF4444' };
      default:
        return { bg: '#E5E7EB', border: '#D1D5DB', text: '#9CA3AF' };
    }
  };

  return (
    <div className="w-full glass-card premium-glow rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black text-slate-900">AI Agent Pipeline</h3>
        <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
          <HelpCircle className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <div className="flex items-center justify-between max-w-5xl mx-auto">
        {agents.map((agent, index) => {
          const isLast = index === agents.length - 1;
          const colors = getStatusColor(agent.status);
          const Icon = agent.icon;

          return (
            <React.Fragment key={agent.id}>
              <div className="flex flex-col items-center gap-3 group shrink-0 relative">
                {/* Number Badge */}
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-black shadow-lg z-10">
                  {index + 1}
                </div>

                {/* Agent Node */}
                <div className="relative">
                  <MotionDiv
                    className="w-20 h-20 rounded-2xl border-2 flex items-center justify-center relative z-20 transition-all duration-500 shadow-lg"
                    initial={false as const}
                    animate={{
                      backgroundColor: colors.bg,
                      borderColor: colors.border,
                      scale: agent.status === 'running' ? [1, 1.05, 1] as const : 1,
                    }}
                    transition={{
                      scale: {
                        duration: 2,
                        repeat: agent.status === 'running' ? Infinity : 0,
                        ease: 'easeInOut' as const,
                      },
                    }}
                  >
                    {getStatusIcon(agent.status, Icon)}
                  </MotionDiv>

                  {/* Running Animation */}
                  {agent.status === 'running' && (
                    <>
                      <MotionDiv
                        className="absolute -inset-3 rounded-2xl bg-blue-500/30 blur-lg z-10"
                        animate={{
                          opacity: [0.3, 0.6, 0.3],
                          scale: [1, 1.15, 1]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <MotionDiv
                        className="absolute -inset-1 rounded-2xl z-0"
                        style={{
                          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.5), rgba(37, 99, 235, 0.5))',
                        }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      />
                    </>
                  )}

                  {/* Done Glow */}
                  {agent.status === 'done' && (
                    <MotionDiv
                      className="absolute -inset-2 rounded-2xl bg-green-500/20 blur-md z-10"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    />
                  )}

                  {/* Tooltip on Hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
                      <div className="font-bold mb-1">AGENT {index + 1}: {agent.name.toUpperCase()}</div>
                      <div className="text-slate-300">{agent.description}</div>
                      {agent.time && <div className="text-slate-400 mt-1">Time: {agent.time}</div>}
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900" />
                  </div>
                </div>

                {/* Agent Label */}
                <div className="flex flex-col items-center text-center">
                  <span className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${agent.status === 'waiting' ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                    {agent.name.split(' ')[0]}
                  </span>
                  <span className={`text-xs font-bold whitespace-nowrap ${agent.status === 'waiting' ? 'text-slate-400' :
                    agent.status === 'running' ? colors.text :
                      agent.status === 'error' ? colors.text : 'text-slate-900'
                    }`}>
                    {agent.name.split(' ').slice(1).join(' ') || agent.name}
                  </span>
                  {agent.time && agent.status === 'running' && (
                    <span className="text-[10px] text-blue-600 font-semibold mt-0.5">{agent.time}</span>
                  )}
                </div>
              </div>

              {/* Connector Arrow */}
              {!isLast && (
                <div className="flex-1 h-1 mx-4 bg-gradient-to-r from-slate-200 to-slate-200 rounded-full relative overflow-hidden min-w-[60px]">
                  {agent.status === 'done' && (
                    <MotionDiv
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="absolute inset-0 bg-blue-400 origin-left rounded-full"
                    />
                  )}
                  {agent.status === 'running' && (
                    <>
                      <MotionDiv
                        className="absolute inset-0 bg-blue-300/30 rounded-full"
                        animate={{ scaleX: [0, 1, 1, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <MotionDiv
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full shadow-lg"
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

      {/* Status Message */}
      <div className="mt-6 flex items-center justify-center">
        {agents.some(a => a.status === 'running') ? (
          <MotionDiv
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-4 py-2 glass-gradient rounded-xl border border-blue-200"
          >
            <MotionDiv
              className="w-2.5 h-2.5 rounded-full bg-blue-500"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-xs font-bold text-slate-700">
              {agents.find(a => a.status === 'running')?.name} processing...
            </span>
          </MotionDiv>
        ) : agents.every(a => a.status === 'done') ? (
          <MotionDiv
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-xl border border-emerald-300"
          >
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-xs font-bold text-green-600">
              Analysis Complete
            </span>
          </MotionDiv>
        ) : agents.some(a => a.status === 'error') ? (
          <MotionDiv
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-xl border border-red-200"
          >
            <X className="w-4 h-4 text-red-500" />
            <span className="text-xs font-bold text-red-600">
              Error in {agents.find(a => a.status === 'error')?.name}
            </span>
          </MotionDiv>
        ) : (
          <span className="text-xs font-semibold text-slate-400 px-4 py-2">
            Ready to analyze
          </span>
        )}
      </div>
    </div>
  );
};
