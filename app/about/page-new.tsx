'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, Trophy, Zap, CheckCircle, User, Camera, Utensils, CircuitBoard, Cpu, Eye, Smartphone } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const AboutPage = () => {
  const schedule = [
    {
      time: '09:00 – 09:30 AM',
      activity: 'Registration & Welcome',
      details: 'Participant check-in and welcome kit distribution',
      icon: CheckCircle,
      color: 'from-green-400 to-green-600'
    },
    {
      time: '09:30 – 10:00 AM',
      activity: 'Opening Ceremony',
      details: 'Welcome speech and robotics industry overview',
      icon: Users,
      color: 'from-blue-400 to-blue-600'
    },
    {
      time: '10:00 – 12:00 PM',
      activity: 'Arduino & Robotics Fundamentals',
      details: 'Hands-on introduction to robotics and microcontrollers',
      icon: CircuitBoard,
      color: 'from-purple-400 to-purple-600'
    },
    {
      time: '12:00 – 01:00 PM',
      activity: 'Lunch & Networking',
      details: 'Food and networking with fellow participants',
      icon: Utensils,
      color: 'from-orange-400 to-orange-600'
    },
    {
      time: '01:00 – 03:00 PM',
      activity: 'Build Your First Robot',
      details: 'Practical robot building session with expert guidance',
      icon: Zap,
      color: 'from-yellow-400 to-yellow-600'
    },
    {
      time: '03:00 – 04:00 PM',
      activity: 'Robot Soccer Competition',
      details: 'Exciting soccerbot challenge and demonstrations',
      icon: Trophy,
      color: 'from-red-400 to-red-600'
    },
    {
      time: '04:00 – 04:30 PM',
      activity: 'Closing & Awards',
      details: 'Certificate distribution and closing remarks',
      icon: Trophy,
      color: 'from-indigo-400 to-indigo-600'
    }
  ];

  const features = [
    {
      icon: CircuitBoard,
      title: 'AI-Powered Learning',
      description: 'Experience cutting-edge robotics with artificial intelligence integration',
      stats: '50+ TOPS',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Cpu,
      title: 'Advanced Computing',
      description: 'Work with high-performance processors and real-time systems',
      stats: 'Neural Engine',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Eye,
      title: 'Computer Vision',
      description: 'Learn object detection, tracking, and visual recognition systems',
      stats: '4K Camera',
      color: 'from-green-500 to-teal-500'
    },
    {
      icon: Smartphone,
      title: '5G Connectivity',
      description: 'Explore IoT integration and wireless communication protocols',
      stats: '5G Ready',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const stats = [
    { number: '300+', label: 'Participants Expected', icon: Users },
    { number: '25+', label: 'Expert Instructors', icon: User },
    { number: '8', label: 'Hours of Learning', icon: Clock },
    { number: '15+', label: 'Robot Kits', icon: Zap }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        
        {/* Floating Elements */}
        <motion.div 
          className="absolute top-20 right-20 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"
          animate={{ y: [0, -30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-20 left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"
          animate={{ y: [0, 30, 0], scale: [1, 0.8, 1] }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="text-sm font-semibold uppercase tracking-wider">
                  🤖 Workshop 2025
                </span>
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-black leading-tight">
                <span className="block">ROBOTICS</span>
                <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  WORKSHOP
                </span>
                <span className="block text-3xl md:text-4xl font-normal text-gray-300 mt-4">
                  Build the Future Today
                </span>
              </h1>

              <p className="text-xl text-gray-300 max-w-lg leading-relaxed">
                Join us for an immersive day of hands-on robotics learning, innovation, and competition. 
                From basics to advanced AI integration.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-full hover:from-cyan-600 hover:to-blue-700 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  REGISTER NOW
                </motion.button>
                <motion.button
                  className="px-8 py-4 border-2 border-white/30 text-white font-bold rounded-full hover:bg-white/10 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  DOWNLOAD SCHEDULE
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative w-full h-96 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl border border-white/20 flex items-center justify-center overflow-hidden">
                {/* Robot Placeholder */}
                <motion.div
                  className="text-8xl"
                  animate={{ 
                    y: [0, -10, 0],
                    rotateY: [0, 5, 0]
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  🤖
                </motion.div>
                
                {/* Floating Info Cards */}
                <motion.div 
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="text-xs text-gray-600 mb-1">EVENT DATE</div>
                  <div className="text-sm font-bold text-gray-900">June 30, 2025</div>
                </motion.div>

                <motion.div 
                  className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg"
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity }}
                >
                  <div className="text-xs text-gray-600 mb-1">LOCATION</div>
                  <div className="text-sm font-bold text-gray-900">NCC Auditorium</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-4">
              CUTTING-EDGE <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">TECHNOLOGY</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the latest in robotics technology with hands-on learning and real-world applications
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
                  <div className="text-2xl font-black bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    {feature.stats}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-4">
              EVENT <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">SCHEDULE</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A full day of learning, building, and competing in the world of robotics
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {schedule.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  className="flex items-start space-x-6 mb-12 group"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="flex-shrink-0">
                    <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-grow">
                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                        <h3 className="text-xl font-bold text-gray-900">{item.activity}</h3>
                        <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full mt-2 md:mt-0">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{item.details}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-black mb-4">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                BY THE NUMBERS
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  className="text-center group"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Icon className="w-12 h-12 text-cyan-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <motion.div 
                    className="text-4xl md:text-5xl font-black text-white mb-2"
                    whileInView={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    {stat.number}
                  </motion.div>
                  <div className="text-gray-400 uppercase tracking-wider font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-purple-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <motion.div
          className="container mx-auto px-4 text-center relative z-10"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-6xl font-black mb-8">
            READY TO <span className="bg-gradient-to-r from-cyan-400 to-white bg-clip-text text-transparent">BUILD</span> THE FUTURE?
          </h2>
          <p className="text-xl mb-12 max-w-3xl mx-auto opacity-90">
            Secure your spot in the most comprehensive robotics workshop of 2025. 
            Limited seats available - register now!
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <motion.button
              className="px-10 py-5 bg-white text-blue-600 font-bold rounded-full hover:bg-gray-100 transition-all duration-300 text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              REGISTER NOW - $50
            </motion.button>
            <motion.button
              className="px-10 py-5 border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition-all duration-300 text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              LEARN MORE
            </motion.button>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
