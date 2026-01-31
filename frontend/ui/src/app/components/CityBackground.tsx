import React from 'react';
import { motion } from 'motion/react';

export const CityBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Sky gradient - dark to light blue */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900 via-blue-600 to-blue-400" />
      
      {/* Stars/dots layer */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 30}%`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
      
      {/* Moving city lights (cars) */}
      <div className="absolute bottom-[33%] left-0 right-0 h-2 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`light-${i}`}
            className="absolute w-2 h-2 bg-yellow-300 rounded-full blur-sm"
            style={{
              bottom: `${Math.random() * 100}%`,
            }}
            animate={{
              x: ['-20px', 'calc(100vw + 20px)'],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: 'linear',
            }}
          />
        ))}
      </div>
      
      {/* Animated clouds */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`cloud-${i}`}
          className="absolute rounded-full bg-white/20 backdrop-blur-sm"
          style={{
            width: `${100 + i * 50}px`,
            height: `${60 + i * 30}px`,
            left: `${i * 20}%`,
            top: `${10 + i * 15}%`,
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 20 + i * 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* City skyline - animated buildings */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3">
        {/* Building layer 1 (back) */}
        {[...Array(8)].map((_, i) => {
          const height = 120 + Math.random() * 80;
          const width = 40 + Math.random() * 30;
          return (
            <motion.div
              key={`building-back-${i}`}
              className="absolute bg-gradient-to-t from-blue-800 to-blue-600 rounded-t-lg opacity-60"
              style={{
                left: `${i * 12.5}%`,
                bottom: 0,
                width: `${width}px`,
                height: `${height}px`,
                boxShadow: 'inset 0 -2px 10px rgba(0,0,0,0.3)',
              }}
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2,
              }}
            >
              {/* Windows */}
              {[...Array(Math.floor(height / 20))].map((_, j) => (
                <div
                  key={`window-${i}-${j}`}
                  className="absolute w-2 h-3 bg-yellow-300/40 rounded-sm"
                  style={{
                    left: `${10 + (j % 2) * 15}px`,
                    top: `${20 + j * 20}px`,
                    animation: `twinkle ${2 + Math.random() * 2}s infinite`,
                  }}
                />
              ))}
            </motion.div>
          );
        })}

        {/* Building layer 2 (middle) */}
        {[...Array(10)].map((_, i) => {
          const height = 150 + Math.random() * 100;
          const width = 50 + Math.random() * 40;
          return (
            <motion.div
              key={`building-mid-${i}`}
              className="absolute bg-gradient-to-t from-blue-700 to-blue-500 rounded-t-lg opacity-80"
              style={{
                left: `${i * 10}%`,
                bottom: 0,
                width: `${width}px`,
                height: `${height}px`,
                boxShadow: 'inset 0 -2px 10px rgba(0,0,0,0.3)',
              }}
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 4 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.15,
              }}
            >
              {/* Windows */}
              {[...Array(Math.floor(height / 25))].map((_, j) => (
                <div
                  key={`window-mid-${i}-${j}`}
                  className="absolute w-3 h-4 bg-yellow-300/50 rounded-sm"
                  style={{
                    left: `${12 + (j % 2) * 18}px`,
                    top: `${25 + j * 25}px`,
                    animation: `twinkle ${1.5 + Math.random() * 2}s infinite`,
                  }}
                />
              ))}
            </motion.div>
          );
        })}

        {/* Building layer 3 (front) */}
        {[...Array(12)].map((_, i) => {
          const height = 180 + Math.random() * 120;
          const width = 60 + Math.random() * 50;
          return (
            <motion.div
              key={`building-front-${i}`}
              className="absolute bg-gradient-to-t from-blue-900 via-blue-600 to-blue-400 rounded-t-lg"
              style={{
                left: `${i * 8.3}%`,
                bottom: 0,
                width: `${width}px`,
                height: `${height}px`,
                boxShadow: 'inset 0 -2px 15px rgba(0,0,0,0.4), 0 4px 20px rgba(0,0,0,0.2)',
              }}
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 5 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.1,
              }}
            >
              {/* Windows */}
              {[...Array(Math.floor(height / 30))].map((_, j) => (
                <div
                  key={`window-front-${i}-${j}`}
                  className="absolute w-4 h-5 bg-yellow-300/60 rounded-sm"
                  style={{
                    left: `${15 + (j % 2) * 22}px`,
                    top: `${30 + j * 30}px`,
                    animation: `twinkle ${1 + Math.random() * 2}s infinite`,
                  }}
                />
              ))}
            </motion.div>
          );
        })}
      </div>

      {/* CSS for twinkling windows */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};
