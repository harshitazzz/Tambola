import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BubbleProps {
  num: number;
  bottom?: string;
  top?: string;
  left?: string;
  right?: string;
  size: number;
  delay: number;
}

const Bubble = ({ num, bottom, top, left, right, size, delay }: BubbleProps) => {
  const [isBurst, setIsBurst] = useState(false);

  // When hovered, trigger burst
  const handleHover = () => {
    if (isBurst) return;
    setIsBurst(true);
  };

  useEffect(() => {
    if (isBurst) {
      const timer = setTimeout(() => {
        setIsBurst(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isBurst]);

  // Generate 8 particles for the pop effect
  const particles = Array.from({ length: 8 }).map((_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    // Explode outward distance
    const dist = size * 0.8; 
    return {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
    };
  });

  return (
    <motion.div
      style={{
        position: 'absolute',
        bottom, top, left, right,
        zIndex: 50,
        width: size,
        height: size,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', delay, damping: 12 }}
    >
      <AnimatePresence>
        {!isBurst && (
          <motion.div
            className="floating-ball"
            style={{
              width: '100%',
              height: '100%',
              fontSize: size * 0.4,
              position: 'relative',
              bottom: 'auto', right: 'auto', left: 'auto', top: 'auto',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              y: [0, -15 - Math.random() * 10, 0],
              transition: {
                y: {
                  duration: 4 + Math.random() * 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: Math.random() * 2
                },
                scale: { type: 'spring', stiffness: 300, damping: 20 },
                opacity: { duration: 0.2 }
              }
            }}
            exit={{ 
              scale: 1.3, // "zoom out" slightly before burst
              opacity: 0,
              transition: { duration: 0.15 }
            }}
            onHoverStart={handleHover}
            onMouseEnter={handleHover}
            onClick={handleHover}
          >
            {num}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pop particles (Sprinkles) */}
      <AnimatePresence>
        {isBurst && particles.map((p, i) => (
          <motion.div
            key={`p-${i}`}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{ x: p.x, y: p.y, scale: 0, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: size * 0.15,
              height: size * 0.15,
              marginLeft: -(size * 0.15) / 2,
              marginTop: -(size * 0.15) / 2,
              backgroundColor: '#1a7631', // var(--tambola-green)
              borderRadius: '50%',
              pointerEvents: 'none'
            }}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default Bubble;
