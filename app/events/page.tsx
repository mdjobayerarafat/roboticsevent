
'use client'

import { motion } from 'framer-motion'
import { Metadata, Viewport } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Calendar, Trophy, Users, Zap, Target, Cpu } from 'lucide-react'

// Note: In a real app, metadata would be handled differently for client components
// export const metadata: Metadata = {
//   title: 'Events - NCC Robotics Workshop 2025',
//   description: 'Upcoming robotics events and competitions at NCC Robotics Workshop 2025.',
// }

// export const viewport: Viewport = {
//   width: 'device-width',
//   initialScale: 1,
// }

export default function EventsPage() {
  return (
    <div className="min-h-screen">
      <Header />
        <main className="pt-32">
        {/* Hero Section */}
        <section className="relative py-32 px-4 sm:px-6 lg:px-8 bg-black overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-yellow-600/5" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-yellow-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-yellow-500/5 to-transparent rounded-full" />
          </div>

          {/* Floating Elements */}
          <motion.div
            className="absolute top-20 left-10 w-4 h-4 bg-yellow-400 rounded-full"
            animate={{
              y: [0, -20, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-40 right-20 w-6 h-6 border-2 border-yellow-500 rounded-full"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          <motion.div
            className="absolute bottom-32 left-1/4 w-3 h-3 bg-yellow-300 rounded-full"
            animate={{
              x: [0, 30, 0],
              y: [0, -15, 0]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          <div className="relative max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1 
                className="text-6xl md:text-8xl font-black mb-8"
                initial={{ opacity: 0, rotateX: -30 }}
                animate={{ opacity: 1, rotateX: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                <span className="text-white">ROBOTICS </span>
                <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg">
                  EVENTS
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-xl font-bold text-gray-300 max-w-4xl mx-auto mb-12 uppercase tracking-wide"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                JOIN US FOR EXCITING ROBOTICS COMPETITIONS, WORKSHOPS, AND NETWORKING EVENTS THROUGHOUT 2025
              </motion.p>

              {/* Event Stats */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                {[
                  { icon: Calendar, label: "EVENTS", value: "15+" },
                  { icon: Users, label: "PARTICIPANTS", value: "500+" },
                  { icon: Trophy, label: "PRIZES", value: "$25K+" }
                ].map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={index}
                      className="group bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-2xl p-6 border border-yellow-500/30 hover:border-yellow-400 transition-all duration-500"
                      whileHover={{ y: -5, scale: 1.02 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                    >
                      <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6 text-black" />
                      </div>
                      <div className="text-3xl font-black text-white mb-2">{stat.value}</div>
                      <div className="text-yellow-500 font-bold uppercase text-sm tracking-wider">{stat.label}</div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Events Grid */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-black relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-yellow-600/10" />
            <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '3s' }} />
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            {/* Section Header */}
            <motion.div
              className="text-center mb-20"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.h2 
                className="text-5xl md:text-7xl font-black mb-6"
                initial={{ opacity: 0, rotateX: -30 }}
                whileInView={{ opacity: 1, rotateX: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <span className="text-white">UPCOMING </span>
                <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg">
                  EVENTS
                </span>
              </motion.h2>
              <motion.p 
                className="text-xl font-bold text-gray-300 max-w-3xl mx-auto uppercase tracking-wide"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              >
                DISCOVER AMAZING ROBOTICS EXPERIENCES WAITING FOR YOU
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 perspective-1000">
              
              {/* Main Workshop Event */}
              <motion.div 
                className="group relative transform-gpu"
                initial={{ 
                  opacity: 0, 
                  y: 60,
                  rotateX: 30,
                  rotateY: -15
                }}
                whileInView={{ 
                  opacity: 1, 
                  y: 0,
                  rotateX: 0,
                  rotateY: 0
                }}
                transition={{ 
                  duration: 0.8, 
                  delay: 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -20, 
                  rotateX: -5,
                  rotateY: 5,
                  scale: 1.05,
                  transition: { duration: 0.3 }
                }}
                style={{
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Floating Animation */}
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotateZ: [0, 1, 0, -1, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: 0.5,
                    ease: "easeInOut"
                  }}
                  className="relative"
                >
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 transform scale-110" />
                  
                  {/* Main Card */}
                  <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-3xl p-8 border border-yellow-500/30 hover:border-yellow-400 transition-all duration-500 backdrop-blur-sm shadow-2xl group-hover:shadow-yellow-500/20">
                    {/* Holographic Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-yellow-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative">
                      <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Cpu className="w-8 h-8 text-black" />
                      </div>
                      <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-wide group-hover:text-yellow-400 transition-colors duration-300">
                        Main Robotics Workshop
                      </h3>
                      <p className="text-gray-300 mb-6 font-medium leading-relaxed">
                        Our flagship 3-day intensive workshop covering robotics fundamentals, AI integration, and hands-on building sessions.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <span className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></span>
                          <span className="text-white font-bold uppercase text-sm tracking-wider">Duration: 3 Days</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></span>
                          <span className="text-white font-bold uppercase text-sm tracking-wider">Level: Beginner to Advanced</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-3 h-3 bg-yellow-300 rounded-full mr-3"></span>
                          <span className="text-white font-bold uppercase text-sm tracking-wider">Certification: Yes</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Interactive Elements */}
                    <motion.div
                      className="absolute top-4 right-4 w-3 h-3 bg-yellow-400 rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: 0.3
                      }}
                    />
                  </div>
                </motion.div>
              </motion.div>

              {/* Soccerbot Competition */}
              <motion.div 
                className="group relative transform-gpu"
                initial={{ 
                  opacity: 0, 
                  y: 60,
                  rotateX: 30,
                  rotateY: 0
                }}
                whileInView={{ 
                  opacity: 1, 
                  y: 0,
                  rotateX: 0,
                  rotateY: 0
                }}
                transition={{ 
                  duration: 0.8, 
                  delay: 0.25,
                  type: "spring",
                  stiffness: 100
                }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -20, 
                  rotateX: -5,
                  rotateY: -5,
                  scale: 1.05,
                  transition: { duration: 0.3 }
                }}
                style={{
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Floating Animation */}
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotateZ: [0, -1, 0, 1, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: 1,
                    ease: "easeInOut"
                  }}
                  className="relative"
                >
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 transform scale-110" />
                  
                  {/* Main Card */}
                  <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-3xl p-8 border border-yellow-500/30 hover:border-yellow-400 transition-all duration-500 backdrop-blur-sm shadow-2xl group-hover:shadow-yellow-500/20">
                    {/* Holographic Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-yellow-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Trophy className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-wide group-hover:text-yellow-400 transition-colors duration-300">
                        Soccerbot Competition
                      </h3>
                      <p className="text-gray-300 mb-6 font-medium leading-relaxed">
                        Competitive robotics tournament where teams build and program robots to play soccer autonomously.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                          <span className="text-white font-bold uppercase text-sm tracking-wider">Teams: 2-4 members</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></span>
                          <span className="text-white font-bold uppercase text-sm tracking-wider">Prize Pool: $5,000</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-3 h-3 bg-red-500 rounded-full mr-3"></span>
                          <span className="text-white font-bold uppercase text-sm tracking-wider">Registration Deadline: TBA</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Interactive Elements */}
                    <motion.div
                      className="absolute top-4 right-4 w-3 h-3 bg-green-400 rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: 0.6
                      }}
                    />
                  </div>
                </motion.div>
              </motion.div>

              {/* Networking & Demo Day */}
              <motion.div 
                className="group relative transform-gpu"
                initial={{ 
                  opacity: 0, 
                  y: 60,
                  rotateX: 30,
                  rotateY: 15
                }}
                whileInView={{ 
                  opacity: 1, 
                  y: 0,
                  rotateX: 0,
                  rotateY: 0
                }}
                transition={{ 
                  duration: 0.8, 
                  delay: 0.4,
                  type: "spring",
                  stiffness: 100
                }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -20, 
                  rotateX: -5,
                  rotateY: -5,
                  scale: 1.05,
                  transition: { duration: 0.3 }
                }}
                style={{
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Floating Animation */}
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotateZ: [0, 1, 0, -1, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: 1.5,
                    ease: "easeInOut"
                  }}
                  className="relative"
                >
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 transform scale-110" />
                  
                  {/* Main Card */}
                  <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-3xl p-8 border border-yellow-500/30 hover:border-yellow-400 transition-all duration-500 backdrop-blur-sm shadow-2xl group-hover:shadow-yellow-500/20">
                    {/* Holographic Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-yellow-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Target className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-wide group-hover:text-yellow-400 transition-colors duration-300">
                        Demo Day & Networking
                      </h3>
                      <p className="text-gray-300 mb-6 font-medium leading-relaxed">
                        Showcase your projects, network with industry professionals, and connect with fellow robotics enthusiasts.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <span className="w-3 h-3 bg-purple-500 rounded-full mr-3"></span>
                          <span className="text-white font-bold uppercase text-sm tracking-wider">Project Showcases</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                          <span className="text-white font-bold uppercase text-sm tracking-wider">Industry Speakers</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                          <span className="text-white font-bold uppercase text-sm tracking-wider">Career Opportunities</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Interactive Elements */}
                    <motion.div
                      className="absolute top-4 right-4 w-3 h-3 bg-purple-400 rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: 0.9
                      }}
                    />
                  </div>
                </motion.div>
              </motion.div>

            </div>

            {/* Call to Action */}
            <motion.div
              className="mt-20 text-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.h2 
                className="text-5xl md:text-6xl font-black mb-8"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <span className="text-white">READY TO JOIN THE </span>
                <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg">
                  ROBOTICS REVOLUTION?
                </span>
              </motion.h2>
              
              <motion.p 
                className="text-xl font-bold text-gray-300 mb-12 max-w-4xl mx-auto uppercase tracking-wide leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              >
                DON'T MISS OUT ON THESE INCREDIBLE OPPORTUNITIES TO LEARN, COMPETE, AND CONNECT WITH THE ROBOTICS COMMUNITY.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-8 justify-center items-center"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                viewport={{ once: true }}
              >
                <motion.a
                  href="/register"
                  className="group relative bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-12 py-6 rounded-2xl font-black text-xl uppercase tracking-wider shadow-2xl overflow-hidden transform-gpu"
                  whileHover={{ 
                    scale: 1.05,
                    y: -5,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Button Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl" />
                  
                  {/* Button Content */}
                  <span className="relative z-10 flex items-center gap-3">
                    <Zap className="w-6 h-6" />
                    REGISTER NOW
                  </span>
                  
                  {/* Animated Background */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-600 opacity-0 group-hover:opacity-20"
                    animate={{
                      x: ['-100%', '100%']
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </motion.a>
                
                <motion.a
                  href="/about"
                  className="group relative border-3 border-yellow-500 text-yellow-400 px-12 py-6 rounded-2xl font-black text-xl uppercase tracking-wider hover:bg-yellow-500 hover:text-black transition-all duration-300 shadow-2xl overflow-hidden transform-gpu"
                  whileHover={{ 
                    scale: 1.05,
                    y: -5,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Button Glow Effect */}
                  <div className="absolute inset-0 bg-yellow-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl" />
                  
                  {/* Button Content */}
                  <span className="relative z-10 flex items-center gap-3">
                    <Target className="w-6 h-6" />
                    LEARN MORE
                  </span>
                </motion.a>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
