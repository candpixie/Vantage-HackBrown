import React from 'react';
import { motion } from 'motion/react';
import { Cpu, Navigation2, ShieldCheck, BarChart3, Sparkles, CheckCircle2, Loader2, Play } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  icon: any;
  status: 'idle' | 'active' | 'done';
  position: { x: number; y: number };
}

interface NeuralMeshWorkflowProps {
  agents: Agent[];
  onRun?: () => void;
}

export const NeuralMeshWorkflow: React.FC<NeuralMeshWorkflowProps> = ({ agents, onRun }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return '#10B981';
      case 'active': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getStatusGlow = (status: string) => {
    if (status === 'active') {
      return 'shadow-[0_0_20px_rgba(59,130,246,0.5)]';
    }
    if (status === 'done') {
      return 'shadow-[0_0_15px_rgba(16,185,129,0.3)]';
    }
    return '';
  };

  return (
    <div className="relative w-full h-[500px] glass-card-dark rounded-2xl overflow-hidden premium-glow liquid-shine">
      {/* Animated Grid Background */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.15) 1.5px, transparent 1.5px),
            linear-gradient(90deg, rgba(14, 165, 233, 0.15) 1.5px, transparent 1.5px)
          `,
          backgroundSize: '40px 40px'
        }}
        animate={{
          backgroundPosition: ['0px 0px', '40px 40px'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Aurora Background Effect */}
      <div className="absolute inset-0 aurora-effect opacity-40" />

      {/* Agent Nodes */}
      {agents.map((agent, index) => {
        const Icon = agent.icon;
        const isConnected = index < agents.length - 1;
        const nextAgent = agents[index + 1];
        
        return (
          <React.Fragment key={agent.id}>
            {/* Connection Line */}
            {isConnected && (
              <svg
                className="absolute pointer-events-none"
                style={{
                  left: `${agent.position.x}%`,
                  top: `${agent.position.y}%`,
                  width: `${nextAgent.position.x - agent.position.x}%`,
                  height: '2px',
                }}
              >
                <motion.line
                  x1="50"
                  y1="0"
                  x2="calc(100% - 50)"
                  y2="0"
                  stroke={agent.status === 'done' ? getStatusColor('done') : '#374151'}
                  strokeWidth="2"
                  strokeDasharray={agent.status === 'done' ? '0' : '5,5'}
                  initial={{ pathLength: 0 }}
                  animate={{ 
                    pathLength: agent.status === 'done' ? 1 : 0.3,
                    opacity: agent.status === 'idle' ? 0.3 : 1
                  }}
                  transition={{ duration: 0.5 }}
                />
                {agent.status === 'active' && (
                  <motion.circle
                    r="4"
                    fill="#6366F1"
                    initial={{ cx: '50', cy: '0' }}
                    animate={{ cx: ['50', 'calc(100% - 50)', '50'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </svg>
            )}

            {/* Node */}
            <motion.div
              className="absolute"
              style={{
                left: `${agent.position.x}%`,
                top: `${agent.position.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              whileHover={{ scale: 1.1 }}
              animate={{
                y: agent.status === 'active' ? [-2, 2, -2] : 0,
              }}
              transition={{
                y: {
                  duration: 2,
                  repeat: agent.status === 'active' ? Infinity : 0,
                  ease: 'easeInOut',
                },
              }}
            >
              <div
                className={`
                  relative w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center
                  transition-all duration-500 cursor-pointer backdrop-blur-xl
                  ${getStatusGlow(agent.status)}
                `}
                style={{
                  background: agent.status === 'done'
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(5, 150, 105, 0.9))'
                    : agent.status === 'active'
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(139, 92, 246, 0.9))'
                    : 'linear-gradient(135deg, rgba(31, 41, 55, 0.8), rgba(17, 24, 39, 0.8))',
                  borderColor: getStatusColor(agent.status),
                  boxShadow: agent.status === 'active'
                    ? '0 0 30px rgba(99, 102, 241, 0.6), 0 0 60px rgba(139, 92, 246, 0.4)'
                    : agent.status === 'done'
                    ? '0 0 20px rgba(16, 185, 129, 0.5)'
                    : 'none',
                }}
              >
                {agent.status === 'done' ? (
                  <CheckCircle2 className="w-10 h-10 text-white drop-shadow-lg" />
                ) : agent.status === 'active' ? (
                  <Loader2 className="w-10 h-10 text-white animate-spin drop-shadow-lg" />
                ) : (
                  <Icon className="w-10 h-10 text-slate-400" />
                )}

                {/* Pulse effect for active */}
                {agent.status === 'active' && (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-2xl"
                      style={{
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.4), rgba(139, 92, 246, 0.4))',
                      }}
                      animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.15, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute -inset-4 rounded-2xl"
                      style={{
                        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
                      }}
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </>
                )}

                {/* Shine effect for done */}
                {agent.status === 'done' && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl shimmer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                )}
              </div>

              {/* Agent Label */}
              <div className="absolute top-24 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Agent {String(index + 1).padStart(2, '0')}
                </div>
                <div className={`text-xs font-semibold ${
                  agent.status === 'idle' ? 'text-slate-500' : 'text-white'
                }`}>
                  {agent.name}
                </div>
              </div>
            </motion.div>
          </React.Fragment>
        );
      })}

      {/* Control Panel */}
      <motion.div
        className="absolute bottom-6 left-6 right-6 glass-card-dark rounded-2xl p-5 border border-white/20 premium-glow"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <motion.div
                className="w-2.5 h-2.5 rounded-full bg-[#10B981]"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.6, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-sm font-bold text-white">Neural Mesh Active</span>
            </div>
            <div className="h-4 w-px bg-white/20" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              5 PARALLEL AGENTS
            </span>
          </div>
          {onRun && (
            <motion.button
              onClick={onRun}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2.5 bg-gradient-to-r from-[#3B82F6] via-[#2563EB] to-[#1D4ED8] text-white rounded-xl text-xs font-bold shadow-lg hover:shadow-2xl hover:shadow-[#3B82F6]/60 transition-all flex items-center gap-2 neon-glow-hover"
            >
              <Play className="w-4 h-4" />
              RE-RUN ANALYSIS
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
