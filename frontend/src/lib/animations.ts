import { Variants } from 'framer-motion';

/**
 * Global Framer Motion Animation System for Ojas 3.1
 * Designed for gentle, high-performance, accessible astronaut wellness transitions.
 */

export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 12,
    scale: 0.99,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const cardVariants: Variants = {
  initial: {
    opacity: 0,
    y: 16,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  hover: {
    y: -4,
    boxShadow: '0 12px 30px -4px rgba(118, 86, 217, 0.12), 0 4px 12px -2px rgba(85, 53, 165, 0.05)',
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  tap: {
    scale: 0.99,
  },
};

export const buttonVariants: Variants = {
  hover: {
    scale: 1.02,
    transition: { duration: 0.15, ease: 'easeOut' },
  },
  tap: {
    scale: 0.97,
    transition: { duration: 0.1 },
  },
};

export const modalVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 15,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 10,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

export const badgeRevealVariants: Variants = {
  initial: {
    scale: 0.6,
    opacity: 0,
    rotate: -10,
  },
  animate: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      damping: 14,
      stiffness: 200,
    },
  },
};

export const pulseGlowVariants: Variants = {
  animate: {
    boxShadow: [
      '0 0 0 0 rgba(118, 86, 217, 0.4)',
      '0 0 0 12px rgba(118, 86, 217, 0)',
    ],
    transition: {
      repeat: Infinity,
      duration: 2.2,
      ease: 'easeInOut',
    },
  },
};
