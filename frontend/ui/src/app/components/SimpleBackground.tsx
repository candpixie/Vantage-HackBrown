import React from 'react';

export const SimpleBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      {/* Subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-slate-50 to-white" />
      
      {/* Optional: Single subtle orb (not animated) */}
      <div 
        className="absolute w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"
        style={{ top: '10%', right: '10%' }}
      />
    </div>
  );
};
