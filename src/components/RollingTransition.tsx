import React from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface RollingPageWrapperProps {
  pageKey: string;
  children: React.ReactNode;
}

/**
 * 3D Perspective Rolling Page Transition:
 * Unrolls incoming pages smoothly with GPU-composited rotateX + translateY + scale + opacity,
 * paired with a brief shimmering emerald-gold ribbon sweep along the top edge.
 */
export function RollingPageWrapper({ pageKey, children }: RollingPageWrapperProps) {
  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={`curtain-${pageKey}`}
          initial={{ scaleX: 0, opacity: 1, originX: 0 }}
          animate={{ scaleX: 1, opacity: [1, 1, 0], transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } }}
          className="fixed top-0 left-0 right-0 h-[3px] z-50 bg-gradient-to-r from-[#047857] via-[#F59E0B] to-[#10B981] pointer-events-none"
        />
      </AnimatePresence>

      <div style={{ perspective: 1600 }} className="w-full overflow-x-clip">
        <AnimatePresence mode="wait">
          <motion.div
            key={pageKey}
            initial={{
              opacity: 0,
              rotateX: -15,
              y: 52,
              scale: 0.96,
              filter: 'blur(3px)',
            }}
            animate={{
              opacity: 1,
              rotateX: 0,
              y: 0,
              scale: 1,
              filter: 'blur(0px)',
            }}
            exit={{
              opacity: 0,
              rotateX: 12,
              y: -36,
              scale: 0.97,
              filter: 'blur(3px)',
            }}
            transition={{
              duration: 0.44,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ transformOrigin: 'top center', willChange: 'transform, opacity' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}

/**
 * Rolling Number Badge that flips numbers cleanly when quantities change.
 */
export function RollingCounter({ value, className = '' }: { value: number | string; className?: string }) {
  return (
    <span className={`inline-flex overflow-hidden relative tabular-nums ${className}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={String(value)}
          initial={{ y: '100%', opacity: 0, rotateX: -45 }}
          animate={{ y: '0%', opacity: 1, rotateX: 0 }}
          exit={{ y: '-100%', opacity: 0, rotateX: 45 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/**
 * Smooth Scroll-Reveal Block with optional stagger delay
 */
export function RevealBlock({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, rotateX: -6 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformOrigin: 'top center' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
