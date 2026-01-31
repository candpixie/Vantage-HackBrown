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
      case 'active': return '#6366F1';
      default: return '#6B7280';
    }
  };

  const getStatusGlow = (status: string) => {
    if (status === 'active') {
      return 'shadow-[0_0_20px_rgba(99,102,241,0.5)]';
    }
    if (status === 'done') {
      return 'shadow-[0_0_15px_rgba(16,185,129,0.3)]';
    }
    return '';
  };

  return (
    <div className="relative w-full h-[500px] glass-card-dark rounded-2xl overflow-hidden premium-glow">
      {/* Grid Background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

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
              whileHover={{ scale: 1.05 }}
            >
              <div
                className={`
                  relative w-20 h-20 rounded-xl border-2 flex flex-col items-center justify-center
                  transition-all duration-300 cursor-pointer
                  ${getStatusGlow(agent.status)}
                `}
                style={{
                  backgroundColor: agent.status === 'done' ? '#10B981' : 
                                 agent.status === 'active' ? '#6366F1' : '#1F2937',
                  borderColor: getStatusColor(agent.status),
                }}
              >
                {agent.status === 'done' ? (
                  <CheckCircle2 className="w-8 h-8 text-white" />
                ) : agent.status === 'active' ? (
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                ) : (
                  <Icon className="w-8 h-8 text-slate-400" />
                )}
                
                {/* Pulse effect for active */}
                {agent.status === 'active' && (
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    style={{ backgroundColor: '#6366F1' }}
                    animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
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
      <div className="absolute bottom-4 left-4 right-4 glass-card-dark rounded-xl p-4 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-xs font-semibold text-slate-300">Neural Mesh Active</span>
            </div>
            <span className="text-xs text-slate-500">4 PARALLEL EXECUTION</span>
          </div>
          {onRun && (
            <button
              onClick={onRun}
              className="px-4 py-2 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white rounded-lg text-xs font-semibold hover:shadow-lg hover:shadow-[#6366F1]/50 transition-all flex items-center gap-2"
            >
              <Play className="w-3 h-3" />
              RE-RUN NEURAL MESH
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
