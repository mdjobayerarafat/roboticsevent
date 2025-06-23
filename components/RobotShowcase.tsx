import React from 'react';
import { motion } from 'framer-motion';

interface RobotShowcaseProps {
  className?: string;
}

const RobotShowcase: React.FC<RobotShowcaseProps> = ({ className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      {/* Main Robot Visual */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="relative z-10"
      >
        {/* Robot Body */}
        <div className="relative">
          <svg
            width="400"
            height="600"
            viewBox="0 0 400 600"
            className="w-full h-auto"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Robot Body */}
            <g className="robot-body">
              {/* Head */}
              <ellipse cx="200" cy="120" rx="80" ry="70" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="3"/>
              
              {/* Eyes */}
              <circle cx="175" cy="105" r="15" fill="#3b82f6" className="animate-pulse">
                <animate attributeName="fill" values="#3b82f6;#1d4ed8;#3b82f6" dur="3s" repeatCount="indefinite"/>
              </circle>
              <circle cx="225" cy="105" r="15" fill="#3b82f6" className="animate-pulse">
                <animate attributeName="fill" values="#3b82f6;#1d4ed8;#3b82f6" dur="3s" repeatCount="indefinite"/>
              </circle>
              
              {/* Eye Highlights */}
              <circle cx="180" cy="100" r="5" fill="#ffffff"/>
              <circle cx="230" cy="100" r="5" fill="#ffffff"/>
              
              {/* Antenna */}
              <line x1="200" y1="50" x2="200" y2="20" stroke="#6b7280" strokeWidth="3" strokeLinecap="round"/>
              <circle cx="200" cy="15" r="8" fill="#ef4444" className="animate-ping"/>
              
              {/* Torso */}
              <rect x="150" y="190" width="100" height="150" rx="20" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="3"/>
              
              {/* Chest Panel */}
              <rect x="170" y="210" width="60" height="40" rx="8" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2"/>
              
              {/* Control Buttons */}
              <circle cx="185" cy="225" r="6" fill="#10b981"/>
              <circle cx="200" cy="225" r="6" fill="#f59e0b"/>
              <circle cx="215" cy="225" r="6" fill="#ef4444"/>
              
              {/* Screen */}
              <rect x="175" y="265" width="50" height="30" rx="4" fill="#1f2937" stroke="#374151" strokeWidth="2"/>
              <text x="200" y="285" textAnchor="middle" fill="#10b981" fontSize="12" fontFamily="monospace">ONLINE</text>
              
              {/* Arms */}
              <ellipse cx="110" cy="250" rx="25" ry="60" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="3"/>
              <ellipse cx="290" cy="250" rx="25" ry="60" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="3"/>
              
              {/* Hands */}
              <circle cx="110" cy="320" r="20" fill="#d1d5db" stroke="#6b7280" strokeWidth="3"/>
              <circle cx="290" cy="320" r="20" fill="#d1d5db" stroke="#6b7280" strokeWidth="3"/>
              
              {/* Legs */}
              <rect x="170" y="340" width="25" height="80" rx="12" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="3"/>
              <rect x="205" y="340" width="25" height="80" rx="12" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="3"/>
              
              {/* Feet */}
              <ellipse cx="182" cy="440" rx="20" ry="12" fill="#374151" stroke="#1f2937" strokeWidth="3"/>
              <ellipse cx="218" cy="440" rx="20" ry="12" fill="#374151" stroke="#1f2937" strokeWidth="3"/>
            </g>
            
            {/* Floating Elements */}
            <g className="floating-elements">
              <circle cx="80" cy="150" r="3" fill="#3b82f6" opacity="0.6">
                <animateTransform 
                  attributeName="transform" 
                  type="translate" 
                  values="0,0; 10,-10; 0,0" 
                  dur="4s" 
                  repeatCount="indefinite"
                />
              </circle>
              
              <circle cx="320" cy="200" r="2" fill="#8b5cf6" opacity="0.7">
                <animateTransform 
                  attributeName="transform" 
                  type="translate" 
                  values="0,0; -15,15; 0,0" 
                  dur="5s" 
                  repeatCount="indefinite"
                />
              </circle>
              
              <rect x="50" y="350" width="6" height="6" fill="#10b981" opacity="0.5" transform="rotate(45 53 353)">
                <animateTransform 
                  attributeName="transform" 
                  type="rotate" 
                  values="45 53 353; 405 53 353; 45 53 353" 
                  dur="6s" 
                  repeatCount="indefinite"
                />
              </rect>
            </g>
          </svg>
        </div>
      </motion.div>
      
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 rounded-full blur-3xl -z-10"></div>
      
      {/* Technical Grid Background */}
      <div className="absolute inset-0 opacity-5 -z-20">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
      </div>
    </div>
  );
};

export default RobotShowcase;
