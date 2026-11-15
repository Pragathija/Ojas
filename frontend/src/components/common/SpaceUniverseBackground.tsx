import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export const SpaceUniverseBackground: React.FC<{ intensity?: 'subtle' | 'full' }> = ({ intensity = 'subtle' }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 select-none">
      {/* 1. Ambient Nebula Gradients */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#E8E0FF]/40 via-[#F2EDFF]/20 to-transparent blur-3xl" />
      <div className="absolute top-1/3 -right-40 w-[550px] h-[550px] rounded-full bg-gradient-to-bl from-[#9BDCC3]/15 via-[#E8E0FF]/25 to-transparent blur-3xl" />
      <div className="absolute -bottom-40 left-1/4 w-[700px] h-[700px] rounded-full bg-gradient-to-t from-[#FFC98B]/10 via-[#F8F6FF]/30 to-transparent blur-3xl" />

      {/* 2. Delicate Orbital Rings */}
      <svg className="absolute top-12 right-12 w-[520px] h-[520px] opacity-25" viewBox="0 0 520 520" fill="none">
        <circle cx="260" cy="260" r="240" stroke="#7656D9" strokeWidth="1" strokeDasharray="6 6" />
        <circle cx="260" cy="260" r="170" stroke="#8B78C6" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="260" cy="260" r="90" stroke="#9BDCC3" strokeWidth="1.5" />
      </svg>

      {/* 3. Floating Peaceful Celestial Orbs */}
      <motion.div
        animate={shouldReduceMotion ? {} : { y: [0, -18, 0], x: [0, 8, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-28 left-[8%] w-16 h-16 rounded-full bg-gradient-to-tr from-[#7656D9]/15 via-[#9BDCC3]/25 to-white/60 backdrop-blur-xs border border-white/60 shadow-soft"
      >
        <div className="absolute inset-1 rounded-full border border-[#7656D9]/10" />
      </motion.div>

      <motion.div
        animate={shouldReduceMotion ? {} : { y: [0, 24, 0], x: [0, -10, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute top-2/3 right-[7%] w-24 h-24 rounded-full bg-gradient-to-br from-[#8B78C6]/15 via-[#FFC98B]/20 to-white/40 backdrop-blur-xs border border-white/50 shadow-soft"
      >
        <div className="absolute top-3 left-3 w-4 h-4 rounded-full bg-white/40 blur-[1px]" />
      </motion.div>

      {/* 4. Twinkling Soft Stars */}
      <div className="absolute inset-0">
        {[
          { top: '15%', left: '20%', size: 3, delay: 0 },
          { top: '25%', left: '75%', size: 2.5, delay: 1.2 },
          { top: '45%', left: '10%', size: 3, delay: 2.5 },
          { top: '60%', left: '85%', size: 2, delay: 0.8 },
          { top: '78%', left: '30%', size: 3.5, delay: 3.1 },
          { top: '88%', left: '65%', size: 2, delay: 1.8 },
          { top: '12%', left: '50%', size: 2, delay: 2.1 },
          { top: '38%', left: '92%', size: 2.5, delay: 0.4 },
        ].map((star, idx) => (
          <motion.div
            key={idx}
            animate={
              shouldReduceMotion
                ? { opacity: 0.5 }
                : { opacity: [0.2, 0.85, 0.2], scale: [0.9, 1.25, 0.9] }
            }
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: star.delay,
            }}
            style={{
              position: 'absolute',
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
            }}
            className="rounded-full bg-[#7656D9]/50 shadow-[0_0_8px_rgba(118,86,217,0.4)]"
          />
        ))}
      </div>

      {/* 5. Occasional Gentle Shooting Star */}
      {!shouldReduceMotion && (
        <motion.div
          initial={{ x: '-10%', y: '10%', opacity: 0 }}
          animate={{
            x: ['0%', '120vw'],
            y: ['10%', '60vh'],
            opacity: [0, 1, 0.8, 0],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            repeatDelay: 18,
            ease: 'easeOut',
          }}
          className="absolute top-10 left-0 w-28 h-[2px] bg-gradient-to-r from-transparent via-[#7656D9]/70 to-[#9BDCC3] rotate-[-18deg] filter blur-[0.5px]"
        />
      )}

      {/* 6. Elegant Animated Space Shuttle Traversing on Curved Trajectory */}
      {!shouldReduceMotion && (
        <motion.div
          initial={{ x: '-15vw', y: '82vh', rotate: -22, opacity: 0 }}
          animate={{
            x: ['-15vw', '30vw', '75vw', '115vw'],
            y: ['82vh', '54vh', '30vh', '8vh'],
            rotate: [-24, -20, -16, -14],
            opacity: [0, 0.6, 0.8, 0],
          }}
          transition={{
            duration: 48,
            repeat: Infinity,
            repeatDelay: 8,
            ease: 'easeInOut',
          }}
          className="absolute w-20 h-10 flex items-center z-0"
        >
          {/* Subtle Ion Exhaust Plume */}
          <motion.div
            animate={{ scaleX: [0.8, 1.3, 0.9], opacity: [0.5, 0.9, 0.6] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
            className="w-12 h-3 mr-[-4px] bg-gradient-to-l from-[#7656D9] via-[#9BDCC3]/70 to-transparent rounded-l-full blur-[1.5px]"
          />

          {/* Space Shuttle Vector Silhouette Illustration */}
          <svg
            className="w-14 h-8 drop-shadow-[0_2px_8px_rgba(118,86,217,0.25)]"
            viewBox="0 0 64 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Fuselage */}
            <path
              d="M58 16C58 16 46 11 32 11C20 11 12 13 8 16C12 19 20 21 32 21C46 21 58 16 58 16Z"
              fill="#FFFFFF"
              stroke="#5535A5"
              strokeWidth="1.2"
            />
            {/* Cockpit Window */}
            <path
              d="M48 15C47 13.5 44 13.2 42 14C43.5 15.2 46.5 15.5 48 15Z"
              fill="#7656D9"
            />
            {/* Delta Wing Top */}
            <path
              d="M36 11L18 3C16 3 14 5 15 8L24 11H36Z"
              fill="#F2EDFF"
              stroke="#7656D9"
              strokeWidth="1"
            />
            {/* Delta Wing Bottom */}
            <path
              d="M36 21L18 29C16 29 14 27 15 24L24 21H36Z"
              fill="#E8E0FF"
              stroke="#7656D9"
              strokeWidth="1"
            />
            {/* Vertical Stabilizer Fin */}
            <path
              d="M16 16L6 9C5 9 4 10 4 12V20C4 22 5 23 6 23L16 16Z"
              fill="#7656D9"
            />
            {/* Mission Accent Stripe */}
            <line x1="26" y1="16" x2="40" y2="16" stroke="#FFC98B" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </motion.div>
      )}
    </div>
  );
};
