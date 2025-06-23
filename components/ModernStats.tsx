import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Zap, Award } from 'lucide-react';

interface StatItemProps {
  icon: React.ElementType;
  number: string;
  label: string;
  description: string;
  delay: number;
}

const StatItem: React.FC<StatItemProps> = ({ icon: Icon, number, label, description, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      className="relative group"
    >
      <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
        {/* Icon */}
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-8 h-8 text-white" />
        </div>
        
        {/* Number */}
        <div className="text-4xl font-black text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {number}
        </div>
        
        {/* Label */}
        <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
          {label}
        </div>
        
        {/* Description */}
        <div className="text-gray-600 text-sm leading-relaxed">
          {description}
        </div>
        
        {/* Hover Effect Border */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
      </div>
    </motion.div>
  );
};

const ModernStats: React.FC = () => {
  const stats = [
    {
      icon: Users,
      number: '500+',
      label: 'Participants',
      description: 'Students and professionals from 60+ countries joining our robotics community'
    },
    {
      icon: Award,
      number: '25+',
      label: 'Expert Mentors',
      description: 'Industry leaders and researchers guiding the next generation of roboticists'
    },
    {
      icon: Zap,
      number: '15+',
      label: 'Workshops',
      description: 'Hands-on sessions covering AI, machine learning, and advanced robotics'
    },
    {
      icon: TrendingUp,
      number: '90%',
      label: 'Success Rate',
      description: 'Participants successfully building and programming their first robot'
    }
  ];

  return (
    <section className="py-32 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30">
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 left-1/3 w-3 h-3 bg-pink-300 rounded-full animate-bounce"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="h-px w-12 bg-gray-400"></div>
            <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">IMPACT</span>
            <div className="h-px w-12 bg-gray-400"></div>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
            Building the Future
            <br />
            <span className="gradient-text">One Robot at a Time</span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Join a global community of innovators, creators, and dreamers pushing the boundaries of what's possible with robotics and AI.
          </p>
        </motion.div>
        
        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <StatItem
              key={index}
              icon={stat.icon}
              number={stat.number}
              label={stat.label}
              description={stat.description}
              delay={index * 0.1}
            />
          ))}
        </div>
        
        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center mt-20"
        >
          <div className="inline-flex items-center px-8 py-4 bg-black text-white rounded-full text-base font-medium hover:bg-gray-800 transition-colors cursor-pointer group">
            Join Our Community
            <TrendingUp className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ModernStats;
