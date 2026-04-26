import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface ConfettiModalProps {
  isVisible: boolean;
  rank?: number;
  onClose: () => void;
}

export const ConfettiModal: React.FC<ConfettiModalProps> = ({ isVisible, rank, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#1a7631', '#114c20', '#f8f3ea', '#FFD700']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#1a7631', '#114c20', '#f8f3ea', '#FFD700']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();

      const timer = setTimeout(() => {
        onClose();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const getRankSuffix = (n?: number) => {
    if (!n) return '';
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.8, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl text-center border-4 border-green-200"
          >
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-black text-[#1a7631] mb-2">Housefull!</h2>
            <p className="text-xl font-bold text-[#114c20] mb-6">
              You finished in <span className="text-yellow-500 font-black text-2xl">{getRankSuffix(rank)}</span> place!
            </p>
            <button
              onClick={onClose}
              className="w-full rounded-full bg-[#1a7631] px-6 py-3 text-lg font-bold text-white shadow-lg transition hover:bg-[#114c20]"
            >
              Watch Game Finish
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
