'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface RobotSVGProps {
  className?: string;
  animated?: boolean;
}

const RobotSVG: React.FC<RobotSVGProps> = ({ className = '', animated = true }) => {
  return (
    <motion.div
      className={`${className} ${animated ? 'robot-float' : ''}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Robot Head */}
        <motion.g
          animate={animated ? { y: [0, -5, 0] } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Head Base */}
          <rect
            x="150"
            y="80"
            width="100"
            height="80"
            rx="20"
            fill="url(#headGradient)"
            stroke="#2563eb"
            strokeWidth="2"
          />
          
          {/* Eyes */}
          <motion.circle
            cx="170"
            cy="110"
            r="8"
            fill="#00d4ff"
            className="robot-eye"
            animate={animated ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.circle
            cx="230"
            cy="110"
            r="8"
            fill="#00d4ff"
            className="robot-eye"
            animate={animated ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
          />
          
          {/* Eye Glow */}
          <circle cx="170" cy="110" r="12" fill="none" stroke="#00d4ff" strokeWidth="1" opacity="0.5" />
          <circle cx="230" cy="110" r="12" fill="none" stroke="#00d4ff" strokeWidth="1" opacity="0.5" />
          
          {/* Mouth/Speaker */}
          <rect x="180" y="130" width="40" height="15" rx="7" fill="#1e40af" />
          <rect x="185" y="133" width="30" height="3" rx="1" fill="#00d4ff" />
          <rect x="185" y="137" width="30" height="3" rx="1" fill="#00d4ff" />
          <rect x="185" y="141" width="30" height="3" rx="1" fill="#00d4ff" />
          
          {/* Antenna */}
          <line x1="200" y1="80" x2="200" y2="60" stroke="#2563eb" strokeWidth="3" />
          <motion.circle
            cx="200"
            cy="55"
            r="5"
            fill="#ef4444"
            animate={animated ? { scale: [1, 1.5, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.g>

        {/* Robot Body */}
        <motion.g
          animate={animated ? { y: [0, -3, 0] } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        >
          {/* Main Body */}
          <rect
            x="130"
            y="160"
            width="140"
            height="120"
            rx="15"
            fill="url(#bodyGradient)"
            stroke="#2563eb"
            strokeWidth="2"
          />
          
          {/* Chest Panel */}
          <rect x="150" y="180" width="100" height="80" rx="10" fill="#1e40af" opacity="0.3" />
          
          {/* Control Buttons */}
          <circle cx="170" cy="200" r="6" fill="#10b981" />
          <circle cx="190" cy="200" r="6" fill="#f59e0b" />
          <circle cx="210" cy="200" r="6" fill="#ef4444" />
          <circle cx="230" cy="200" r="6" fill="#8b5cf6" />
          
          {/* Screen */}
          <rect x="160" y="220" width="80" height="30" rx="5" fill="#000" />
          <motion.rect
            x="165"
            y="225"
            width="70"
            height="20"
            rx="3"
            fill="#00d4ff"
            opacity="0.8"
            animate={animated ? { opacity: [0.3, 0.8, 0.3] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Data Lines on Screen */}
          <line x1="170" y1="230" x2="230" y2="230" stroke="#000" strokeWidth="1" />
          <line x1="170" y1="235" x2="220" y2="235" stroke="#000" strokeWidth="1" />
          <line x1="170" y1="240" x2="225" y2="240" stroke="#000" strokeWidth="1" />
        </motion.g>

        {/* Left Arm */}
        <motion.g
          className="robot-arm"
          style={{ transformOrigin: '110px 180px' }}
          animate={animated ? { rotate: [0, 10, -5, 0] } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <rect x="90" y="170" width="40" height="20" rx="10" fill="url(#armGradient)" stroke="#2563eb" strokeWidth="1" />
          <rect x="70" y="190" width="40" height="15" rx="7" fill="url(#armGradient)" stroke="#2563eb" strokeWidth="1" />
          {/* Hand */}
          <circle cx="75" cy="210" r="8" fill="#2563eb" />
          <rect x="70" y="215" width="10" height="3" rx="1" fill="#00d4ff" />
          <rect x="70" y="219" width="10" height="3" rx="1" fill="#00d4ff" />
        </motion.g>

        {/* Right Arm */}
        <motion.g
          className="robot-arm"
          style={{ transformOrigin: '290px 180px' }}
          animate={animated ? { rotate: [0, -10, 5, 0] } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        >
          <rect x="270" y="170" width="40" height="20" rx="10" fill="url(#armGradient)" stroke="#2563eb" strokeWidth="1" />
          <rect x="290" y="190" width="40" height="15" rx="7" fill="url(#armGradient)" stroke="#2563eb" strokeWidth="1" />
          {/* Hand */}
          <circle cx="325" cy="210" r="8" fill="#2563eb" />
          <rect x="320" y="215" width="10" height="3" rx="1" fill="#00d4ff" />
          <rect x="320" y="219" width="10" height="3" rx="1" fill="#00d4ff" />
        </motion.g>

        {/* Legs */}
        <motion.g
          animate={animated ? { y: [0, -2, 0] } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        >
          {/* Left Leg */}
          <rect x="160" y="280" width="25" height="60" rx="12" fill="url(#legGradient)" stroke="#2563eb" strokeWidth="1" />
          <rect x="155" y="340" width="35" height="15" rx="7" fill="#2563eb" />
          
          {/* Right Leg */}
          <rect x="215" y="280" width="25" height="60" rx="12" fill="url(#legGradient)" stroke="#2563eb" strokeWidth="1" />
          <rect x="210" y="340" width="35" height="15" rx="7" fill="#2563eb" />
        </motion.g>

        {/* Floating Particles */}
        {animated && (
          <g>
            <motion.circle
              cx="100"
              cy="150"
              r="2"
              fill="#00d4ff"
              animate={{ y: [0, -20, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0 }}
            />
            <motion.circle
              cx="320"
              cy="180"
              r="2"
              fill="#8b5cf6"
              animate={{ y: [0, -25, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
            />
            <motion.circle
              cx="80"
              cy="250"
              r="2"
              fill="#10b981"
              animate={{ y: [0, -30, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 2 }}
            />
          </g>
        )}

        {/* Gradients */}
        <defs>
          <linearGradient id="headGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0e7ff" />
            <stop offset="100%" stopColor="#c7d2fe" />
          </linearGradient>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#dbeafe" />
            <stop offset="100%" stopColor="#bfdbfe" />
          </linearGradient>
          <linearGradient id="armGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
          <linearGradient id="legGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
};

export default RobotSVG;