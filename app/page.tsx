'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Calendar, Users, Trophy, Zap, ArrowRight, Clock, MapPin, Star, Play, ChevronRight, CircuitBoard, Cpu, Smartphone, Eye, Bot, Rocket, Brain, Wifi } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';

const HomePage = () => {
  const [currentRobot, setCurrentRobot] = useState(0);
  const [imageErrors, setImageErrors] = useState<{[key: number]: boolean}>({});
  const { scrollY } = useScroll();
  const yTransform = useTransform(scrollY, [0, 1000], [0, -200]);

  const handleImageError = (robotIndex: number) => {
    setImageErrors(prev => ({ ...prev, [robotIndex]: true }));
  };  const robots = [
    {
      id: 1,
      name: "NCCROBOTICS",
      tagline: "EST.2025",
      description: "Revolutionary robotics technology redefining visual excellence and autonomous capture systems.",
      features: ["Neural AI", "Auto Focus", "4K Recording"],
      image: "/robots/robot1.png", 
      emoji: "🤖", 
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      id: 2,
      name: "CAMCORDER", 
      tagline: "Intelligent Imaging Awaits",
      description: "VCam Pro HD Indoor Security Cameras with 360° coverage and intelligent performance features.",
      features: ["3MP [1296P]", "360° Coverage", "1TB Storage"],
      image: "/robots/robot2.png", 
      emoji: "📹", 
      gradient: "from-orange-500 to-yellow-500"
    },
    {
      id: 3,
      name: "DRONE VISION",
      tagline: "Aerial Intelligence", 
      description: "Advanced drone technology with precision flight control and intelligent navigation systems.",
      features: ["Autonomous Flight", "4K Camera", "GPS Navigation"],
      image: "/robots/drone.png", 
      emoji: "🚁", 
      gradient: "from-purple-500 to-pink-500"
    },
    {
      id: 4,
      name: "HAND ROBOT",
      tagline: "Precision Manipulation", 
      description: "Robotic hand system with advanced dexterity and tactile feedback for complex operations.",
      features: ["Tactile Feedback", "Precision Grip", "AI Control"],
      image: "/robots/handrobot.png", 
      emoji: "🦾", 
      gradient: "from-green-500 to-teal-500"
    },
    {
      id: 5,
      name: "SPECIAL ROBOT",
      tagline: "Next-Gen Innovation", 
      description: "Specialized robotic system designed for advanced research and development applications.",
      features: ["Multi-Function", "Research Grade", "Modular Design"],
      image: "/robots/specialrobot.png", 
      emoji: "⚡", 
      gradient: "from-red-500 to-orange-500"
    }
  ];

  const techSpecs = [
    { icon: Brain, label: "AI Processing", value: "Neural Engine", color: "from-blue-500 to-cyan-500" },
    { icon: Cpu, label: "Computing Power", value: "50+ TOPS", color: "from-purple-500 to-pink-500" },
    { icon: Eye, label: "Vision System", value: "4K Camera Array", color: "from-green-500 to-teal-500" },
    { icon: Wifi, label: "Connectivity", value: "5G + WiFi 6E", color: "from-orange-500 to-red-500" }
  ];

  const stats = [
    { number: '500+', label: 'Expected Participants', icon: Users },
    { number: '50+', label: 'Expert Speakers', icon: Star },
    { number: '20+', label: 'Workshops & Sessions', icon: Trophy },
    { number: '10+', label: 'Competition Categories', icon: Zap }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRobot((prev) => (prev + 1) % robots.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 overflow-hidden">
      <Header />
      
      {/* Hero Section - First Product */}
      <section className="relative bg-white overflow-hidden">        {/* Header Bar */}
        <div className="flex justify-between items-center px-8 py-4 border-b border-gray-200">
          <div className="text-sm text-gray-600">NCCROBOTICS EST.2025</div>
          <div className="text-sm text-gray-600">Redefining Visual Excellence</div>
          <motion.button 
            className="px-6 py-2 bg-yellow-400 text-black text-sm font-bold rounded-full hover:bg-yellow-500 transition-colors"
            whileHover={{ scale: 1.05 }}
          >
            EXPLORE
          </motion.button>
        </div>

        <div className="container mx-auto px-8 py-16 relative">
          <div className="relative min-h-[80vh] flex items-center justify-center">
            
            {/* Background Large Text */}
            <motion.div 
              className="absolute inset-0 flex items-center justify-center z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2 }}
            >
              <motion.h1 
                className="text-[12rem] md:text-[16rem] lg:text-[20rem] font-black leading-none tracking-tighter select-none pointer-events-none"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 1 }}
              >
                <span className="block bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent opacity-30">FUTURE</span>
                <span className="block text-yellow opacity-15 -mt-8">TECH</span>
              </motion.h1>
            </motion.div>

            {/* Robot Image - Centered and Overlaying Text */}
            <motion.div
              className="relative z-10 flex items-center justify-center"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <motion.div 
                className="relative w-full h-[800px] flex items-center justify-center"
                animate={{ 
                  y: [0, -10, 0]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Image
                  src="/robots/specialrobot.png"
                  alt="Special Robot"
                  width={750}
                  height={750}
                  className="object-contain w-full h-full"
                  priority
                />
              </motion.div>
              

              

            </motion.div>
            
            {/* Bottom Content - Description and Button */}
            <motion.div 
              className="absolute bottom-8 left-8 z-20 max-w-md bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >              <motion.p className="text-sm text-gray-800 mb-4 leading-relaxed font-medium">
                EXPLORE THE CUTTING-EDGE WORLD OF TOMORROW WITH OUR WEBSITE, UNVEILING REVOLUTIONARY ADVANCEMENTS AND INNOVATIVE TECHNOLOGIES SHAPING THE FUTURE.
              </motion.p>
              <Link href="/register">
                <motion.button
                  className="px-6 py-3 bg-black border border-black text-white font-medium rounded-full hover:bg-gray-800 transition-all duration-300 flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <Play className="w-4 h-4" />
                  REGISTER NOW
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>      {/* CAMCORDER Section */}
      <section className="py-32 bg-yellow-400">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.h2 
                className="text-8xl md:text-9xl font-black text-black mb-8 leading-none"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                CAMCORDER
              </motion.h2>              <motion.div 
                className="space-y-6 mb-8"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              >
                {/* Certification Information */}
                <div className="bg-black/10 rounded-xl p-4 border border-black/20">
                  <div className="text-black">
                    <div className="text-lg font-bold mb-2">🏆 Certification Included</div>
                    <div className="text-sm leading-relaxed">
                      Complete our robotics workshop and receive an <strong>Official NCC Robotics Certificate</strong> recognized by industry professionals. Validate your skills in robotics technology, AI systems, and automation engineering.
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <Link href="/about">
                <motion.button
                  className="px-8 py-4 bg-black text-yellow-400 font-bold rounded-full hover:bg-gray-800 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  viewport={{ once: true }}
                >
                  Learn More
                </motion.button>
              </Link>
            </motion.div>

            {/* Right Content - Robot Image */}
            <motion.div
              className="relative flex items-center justify-center"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <motion.div 
                className="relative w-full h-[500px] flex items-center justify-center"
                animate={{ 
                  y: [0, -15, 0]
                }}
                transition={{ 
                  duration: 5, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Image
                  src="/robots/robot2.png"
                  alt="Security Camera Robot"
                  width={400}
                  height={400}
                  className="object-contain w-full h-full"
                />
              </motion.div>
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
            <h2 className="text-5xl md:text-7xl font-black mb-4 text-gray-900">
              EXPERIENCE THE FUTURE
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            {[
              {
                icon: "🏆",
                title: "Precision And Clarity",
                description: "Experience ultra-high resolution recording with advanced stabilization systems. Professional-grade optics deliver crystal-clear footage in any environment.",
                badge: "01"
              },
              {
                icon: "⚡",
                title: "Dynamic Tracking",
                description: "Real-time motion detection and autonomous subject tracking powered by advanced AI algorithms for seamless capture experiences.",
                badge: "02"
              },
              {
                icon: "🎨",
                title: "Intelligent Performance",
                description: "Adaptive learning systems that optimize performance based on usage patterns and environmental conditions for superior results.",
                badge: "03"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="group bg-white rounded-3xl p-8 hover:shadow-xl transition-all duration-500 border border-gray-100"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <div className="text-4xl mb-6">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                  {feature.badge} — FEATURE
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-black text-white">
        <motion.div 
          className="container mx-auto px-4 text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-7xl font-black mb-8">
            READY TO BUILD THE FUTURE?
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto">
            Subscribe to our robotics platform and join the innovation community shaping tomorrow's technology landscape.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              href="/register"
              className="inline-flex items-center justify-center px-10 py-5 bg-yellow-400 text-black font-bold rounded-full hover:bg-yellow-500 transition-all duration-300 text-lg"
            >
              Start Now →
            </Link>
            <Link 
              href="/about"
              className="inline-flex items-center justify-center px-10 py-5 border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-black transition-all duration-300 text-lg"
            >
              Learn More
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
