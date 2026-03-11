import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const LoadingScreen = ({ onLoadingComplete }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show loading for 2.5 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (onLoadingComplete) {
        onLoadingComplete();
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] bg-void flex items-center justify-center"
        >
          <div className="relative">
            {/* Animated logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              {/* Logo text with neon glow */}
              <motion.h1
                animate={{
                  textShadow: [
                    '0 0 10px rgba(0, 240, 255, 0.5), 0 0 20px rgba(0, 240, 255, 0.3)',
                    '0 0 20px rgba(0, 240, 255, 0.8), 0 0 40px rgba(0, 240, 255, 0.5)',
                    '0 0 10px rgba(0, 240, 255, 0.5), 0 0 20px rgba(0, 240, 255, 0.3)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="font-syne text-6xl md:text-8xl font-bold uppercase tracking-tighter"
              >
                <span className="text-white">INK</span>
                <span className="text-cyber-cyan">STREET</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="font-mono uppercase text-xs tracking-widest text-cyber-cyan text-center mt-4"
              >
                Loading Experience...
              </motion.p>
            </motion.div>

            {/* Animated loading bar */}
            <div className="mt-8 w-64 h-0.5 bg-white/10 mx-auto overflow-hidden">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="h-full w-1/3 bg-gradient-to-r from-transparent via-cyber-cyan to-transparent"
              />
            </div>

            {/* Corner accents */}
            <div className="absolute -top-20 -left-20 w-40 h-40 border-l-2 border-t-2 border-cyber-cyan/30" />
            <div className="absolute -bottom-20 -right-20 w-40 h-40 border-r-2 border-b-2 border-cyber-cyan/30" />
          </div>

          {/* Background particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  opacity: 0,
                }}
                animate={{
                  y: [null, Math.random() * window.innerHeight],
                  opacity: [0, 0.5, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
                className="absolute w-1 h-1 bg-cyber-cyan"
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
