import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { Sparkles } from 'lucide-react';

interface StorefrontMockupProps {
  imageUrl: string;
  isLoading?: boolean;
}

export const StorefrontMockup: React.FC<StorefrontMockupProps> = ({ imageUrl, isLoading = false }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-white/5 border border-white/10 group">
      <AnimatePresence>
        {(!loaded || isLoading) && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10"
          >
            <div className="w-full h-full bg-slate-900 overflow-hidden relative">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full"
                animate={{ translateX: ['100%', '-100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white/10 animate-pulse" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ scale: 1.1, filter: 'blur(10px)' }}
        animate={{ 
          scale: loaded ? 1 : 1.1, 
          filter: loaded ? 'blur(0px)' : 'blur(10px)' 
        }}
        transition={{ duration: 0.8 }}
        className="w-full h-full"
      >
        <img
          src={imageUrl}
          alt="AI Generated Storefront Mockup"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onLoad={() => setLoaded(true)}
        />
      </motion.div>

      <div className="absolute top-4 right-4 z-20">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full flex items-center gap-2">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span className="text-[9px] font-black text-white uppercase tracking-widest">AI Visualization</span>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};
