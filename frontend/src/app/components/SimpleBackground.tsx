import React from 'react';

export const SimpleBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      {/* Subtle gradient - light mode default */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />

      {/* Optional: Single subtle orb (not animated) */}
      <div
        className="absolute w-96 h-96 bg-teal-100/30 dark:bg-teal-500/10 rounded-full blur-3xl"
        style={{ top: '10%', right: '10%' }}
      />
    </div>
  );
};
