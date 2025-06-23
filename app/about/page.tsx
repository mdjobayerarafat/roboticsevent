'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, Trophy, Zap, CheckCircle, User, Camera, Utensils, CircuitBoard, Cpu, Eye, Smartphone, Download } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

const AboutPage = () => {
  // Download schedule function
  const downloadSchedule = async () => {
    try {
      const doc = new jsPDF();
      
      // Set background color to dark theme
      doc.setFillColor(0, 0, 0); // Black background
      doc.rect(0, 0, 210, 297, 'F'); // A4 size background
      
      // Header section with gradient-like effect
      doc.setFillColor(255, 215, 0); // Yellow/Gold color
      doc.rect(0, 0, 210, 50, 'F');
      
      // Main title
      doc.setFontSize(24);
      doc.setTextColor(0, 0, 0); // Black text on yellow background
      doc.setFont("helvetica", "bold");
      doc.text('NCCROBOTICS WORKSHOP 2025', 105, 25, { align: 'center' });
      
      // Subtitle
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.text('EVENT SCHEDULE & AGENDA', 105, 40, { align: 'center' });
      
      // Event Information Section
      doc.setFontSize(16);
      doc.setTextColor(255, 215, 0); // Yellow headers
      doc.setFont("helvetica", "bold");
      doc.text('EVENT DETAILS', 20, 70);
      
      // Draw a yellow line under the header
      doc.setDrawColor(255, 215, 0);
      doc.setLineWidth(2);
      doc.line(20, 75, 190, 75);
      
      // Event details with white text
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255); // White text
      doc.setFont("helvetica", "normal");
      
      const eventInfo = [
        'Date: June 30, 2025',
        'Time: 9:00 AM - 4:30 PM',
        'Venue: NITER Campus, AC-204',
        'Registration Fee: 100 BDT',
        'Contact: info@nccrobotics.com'
      ];
      
      let yPos = 90;
      eventInfo.forEach((info) => {
        doc.text(`• ${info}`, 25, yPos);
        yPos += 10;
      });
      
      // Schedule Section
      doc.setFontSize(16);
      doc.setTextColor(255, 215, 0); // Yellow headers
      doc.setFont("helvetica", "bold");
      doc.text('DETAILED SCHEDULE', 20, yPos + 20);
      
      // Draw a yellow line under the header
      doc.setDrawColor(255, 215, 0);
      doc.setLineWidth(2);
      doc.line(20, yPos + 25, 190, yPos + 25);
      
      yPos += 40;
      
      // Schedule items
      schedule.forEach((item, index) => {
        if (yPos > 250) { // Add new page if content exceeds page height
          doc.addPage();
          doc.setFillColor(0, 0, 0);
          doc.rect(0, 0, 210, 297, 'F');
          yPos = 30;
        }
        
        // Time (Yellow)
        doc.setFontSize(12);
        doc.setTextColor(255, 215, 0);
        doc.setFont("helvetica", "bold");
        doc.text(item.time, 25, yPos);
        
        // Activity (White)
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text(item.activity, 25, yPos + 12);
        
        // Details (Light Gray)
        doc.setFontSize(10);
        doc.setTextColor(200, 200, 200);
        doc.setFont("helvetica", "normal");
        const details = doc.splitTextToSize(item.details, 160);
        doc.text(details, 25, yPos + 22);
        
        yPos += 35;
      });
      
      // Footer with website theme colors
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFillColor(255, 215, 0); // Yellow footer
        doc.rect(0, 270, 210, 27, 'F');
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0); // Black text on yellow
        doc.setFont("helvetica", "bold");
        doc.text('NCCROBOTICS WORKSHOP 2025', 105, 285, { align: 'center' });
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text('Build the Future Today', 105, 292, { align: 'center' });
      }
      
      // Save the PDF
      doc.save('NCCROBOTICS_Workshop_Schedule_2025.pdf');
      toast.success('Schedule downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to download schedule. Please try again.');
    }
  };

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
    { number: '30+', label: 'Participants Expected', icon: Users },
    { number: '5+', label: 'Expert Instructors', icon: User },
    { number: '8', label: 'Hours of Learning', icon: Clock },
    { number: '5+', label: 'Robot Kits', icon: Zap }
  ];

  return (
    <div className="min-h-screen bg-gray-50">      <Header />
      
      {/* Hero Section */}
      <section className="relative py-24 pt-32 bg-black text-white overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-black to-yellow-400/5"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,0,0.1),transparent_50%)] opacity-60"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,0,0.08),transparent_50%)] opacity-40"></div>
        </div>
        
        {/* Floating Elements */}
        <motion.div 
          className="absolute top-10 right-10 w-40 h-40 bg-gradient-to-br from-yellow-500/30 to-yellow-400/10 rounded-full blur-2xl"
          animate={{ y: [0, -20, 0], x: [0, 10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-10 left-10 w-32 h-32 bg-gradient-to-br from-yellow-400/25 to-yellow-500/15 rounded-full blur-xl"
          animate={{ y: [0, 15, 0], x: [0, -8, 0], scale: [1, 0.9, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/4 w-24 h-24 bg-yellow-500/20 rounded-full blur-lg"
          animate={{ y: [0, -25, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
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
                className="inline-block px-6 py-3 bg-yellow-500 text-black rounded-full border border-yellow-400"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="text-sm font-black uppercase tracking-wider">
                  🤖 WORKSHOP 2025
                </span>
              </motion.div>

              <h1 className="text-6xl md:text-8xl font-black leading-tight">
                <span className="block">ROBOTICS</span>
                <span className="block bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                  WORKSHOP
                </span>
                <span className="block text-4xl md:text-5xl font-black text-white mt-4">
                  BUILD THE FUTURE TODAY
                </span>
              </h1>

              <p className="text-xl text-gray-300 max-w-lg leading-relaxed">
                Join us for an immersive day of hands-on robotics learning, innovation, and competition. 
                From basics to advanced AI integration.
              </p>              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <motion.button
                    className="px-10 py-5 bg-yellow-500 text-black font-black text-lg rounded-full hover:bg-yellow-400 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    REGISTER NOW
                  </motion.button>
                </Link>
                <motion.button
                  onClick={downloadSchedule}
                  className="px-10 py-5 border-2 border-yellow-500 text-yellow-500 font-black text-lg rounded-full hover:bg-yellow-500 hover:text-black transition-all duration-300 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download className="w-5 h-5" />
                  DOWNLOAD SCHEDULE
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              className="relative flex items-center justify-center"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Drone Image */}
              <motion.div
                className="relative w-[600px] h-[600px] z-10"
                animate={{ 
                  y: [0, -15, 0],
                  rotateY: [0, 8, 0],
                  rotateX: [0, 3, 0]
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Image
                  src="/robots/drone.png"
                  alt="Advanced Drone Technology"
                  fill
                  className="object-contain drop-shadow-2xl"
                />
                {/* Glow effect behind drone */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/30 to-yellow-500/20 rounded-full blur-3xl scale-125 -z-10"></div>
              </motion.div>
              
              {/* Floating Decorative Elements */}
              <motion.div 
                className="absolute top-10 right-10 w-4 h-4 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50"
                animate={{ 
                  y: [0, -10, 0],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.div 
                className="absolute bottom-10 left-10 w-3 h-3 bg-yellow-500 rounded-full shadow-lg shadow-yellow-500/50"
                animate={{ 
                  y: [0, 10, 0],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              />
              <motion.div 
                className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-300 rounded-full"
                animate={{ 
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              />
              <motion.div 
                className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-yellow-400 rounded-full"
                animate={{ 
                  y: [0, -15, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{ duration: 3, repeat: Infinity, delay: 2 }}
              />
              

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
            <h2 className="text-6xl md:text-7xl font-black text-black mb-6">
              CUTTING-EDGE <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">TECHNOLOGY</span>
            </h2>
            <p className="text-xl font-bold text-gray-800 max-w-3xl mx-auto uppercase tracking-wide">
              EXPERIENCE THE LATEST IN ROBOTICS TECHNOLOGY WITH HANDS-ON LEARNING
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  className="group bg-black rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-yellow-500"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                >
                  <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-xl font-black mb-3 text-white uppercase tracking-wide">{feature.title}</h3>
                  <p className="text-gray-300 mb-4 leading-relaxed font-medium">{feature.description}</p>
                  <div className="text-2xl font-black bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                    {feature.stats}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Robot Showcase Section */}
      <section className="py-24 bg-black text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-yellow-600/10" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-yellow-400/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.h2 
              className="text-6xl md:text-8xl font-black mb-6"
              initial={{ opacity: 0, rotateX: -30 }}
              whileInView={{ opacity: 1, rotateX: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              viewport={{ once: true }}
            >
              ROBOT <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg">GALLERY</span>
            </motion.h2>
            <motion.p 
              className="text-xl font-bold text-gray-300 max-w-3xl mx-auto uppercase tracking-wide"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              EXPLORE OUR COLLECTION OF ADVANCED ROBOTICS SYSTEMS
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 perspective-1000">
            {[
              { name: "Advanced Robot 1", image: "/robots/robot1.png", description: "Neural AI Processing", color: "from-blue-500 to-purple-600" },
              { name: "Advanced Robot 2", image: "/robots/robot2.png", description: "Precision Control", color: "from-green-500 to-teal-600" },
              { name: "Drone Vision", image: "/robots/drone.png", description: "Aerial Intelligence", color: "from-yellow-500 to-orange-600" },
              { name: "Robotic Hand", image: "/robots/handrobot.png", description: "Tactile Manipulation", color: "from-red-500 to-pink-600" },
              { name: "Special Robot", image: "/robots/specialrobot.png", description: "Multi-Function Design", color: "from-purple-500 to-indigo-600" }
            ].map((robot, index) => (
              <motion.div
                key={index}
                className="group relative transform-gpu"
                initial={{ 
                  opacity: 0, 
                  y: 60,
                  rotateX: 30,
                  rotateY: index % 2 === 0 ? -15 : 15
                }}
                whileInView={{ 
                  opacity: 1, 
                  y: 0,
                  rotateX: 0,
                  rotateY: 0
                }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.15,
                  type: "spring",
                  stiffness: 100
                }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -20, 
                  rotateX: -5,
                  rotateY: index % 2 === 0 ? 5 : -5,
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
                    delay: index * 0.5,
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
                    
                    {/* Image Container with 3D Effect */}
                    <motion.div 
                      className="relative w-full h-72 mb-8 bg-gradient-to-br from-yellow-500/10 via-transparent to-yellow-600/10 rounded-2xl overflow-hidden"
                      whileHover={{
                        rotateX: 10,
                        rotateY: 5,
                        transition: { duration: 0.3 }
                      }}
                      style={{
                        transformStyle: 'preserve-3d'
                      }}
                    >
                      {/* Image Glow */}
                      <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/20 to-transparent rounded-2xl" />
                      
                      <motion.div
                        className="relative w-full h-full"
                        whileHover={{
                          scale: 1.1,
                          rotateY: 10,
                          transition: { duration: 0.5 }
                        }}
                      >
                        <Image
                          src={robot.image}
                          alt={robot.name}
                          fill
                          className="object-contain p-6 filter drop-shadow-2xl"
                        />
                      </motion.div>
                      
                      {/* Floating Particles */}
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                          style={{
                            left: `${20 + i * 30}%`,
                            top: `${10 + i * 20}%`
                          }}
                          animate={{
                            y: [0, -20, 0],
                            opacity: [0.3, 1, 0.3],
                            scale: [0.5, 1, 0.5]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.5 + index * 0.2,
                            ease: "easeInOut"
                          }}
                        />
                      ))}
                    </motion.div>
                    
                    {/* Content */}
                    <motion.div
                      className="relative z-10"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
                      viewport={{ once: true }}
                    >
                      <h3 className="text-2xl font-black mb-3 text-white uppercase tracking-wide group-hover:text-yellow-400 transition-colors duration-300">
                        {robot.name}
                      </h3>
                      <motion.p 
                        className={`text-transparent bg-gradient-to-r ${robot.color} bg-clip-text font-bold uppercase text-sm tracking-wider group-hover:scale-105 transition-transform duration-300`}
                        whileHover={{
                          textShadow: "0 0 20px rgba(255, 255, 0, 0.5)"
                        }}
                      >
                        {robot.description}
                      </motion.p>
                    </motion.div>
                    
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
                        delay: index * 0.3
                      }}
                    />
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section className="py-24 bg-black">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-6xl md:text-7xl font-black text-white mb-6">
              EVENT <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">SCHEDULE</span>
            </h2>
            <p className="text-xl font-bold text-gray-300 max-w-3xl mx-auto uppercase tracking-wide">
              A FULL DAY OF LEARNING, BUILDING, AND COMPETING
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
                    <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-8 h-8 text-black" />
                    </div>
                  </div>
                  
                  <div className="flex-grow">
                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-yellow-500">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                        <h3 className="text-xl font-black text-black uppercase tracking-wide">{item.activity}</h3>
                        <span className="text-sm font-black text-black bg-yellow-500 px-4 py-2 rounded-full mt-2 md:mt-0 uppercase tracking-wider">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-gray-800 leading-relaxed font-medium">{item.details}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-white text-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-yellow-400/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-6xl md:text-7xl font-black mb-6">
              <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
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
                  className="text-center group bg-black rounded-3xl p-8 border border-yellow-500"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Icon className="w-12 h-12 text-yellow-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <motion.div 
                    className="text-4xl md:text-5xl font-black text-white mb-2"
                    whileInView={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    {stat.number}
                  </motion.div>
                  <div className="text-yellow-500 uppercase tracking-wider font-black text-sm">
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <motion.div
          className="container mx-auto px-4 text-center relative z-10"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-6xl md:text-8xl font-black mb-8">
            READY TO <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">BUILD</span> THE FUTURE?
          </h2>
          <p className="text-xl font-bold mb-12 max-w-3xl mx-auto text-gray-300 uppercase tracking-wide">
            SECURE YOUR SPOT IN THE MOST COMPREHENSIVE ROBOTICS WORKSHOP OF 2025
          </p>          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/register">
              <motion.button
                className="px-12 py-6 bg-yellow-500 text-black font-black rounded-full hover:bg-yellow-400 transition-all duration-300 text-xl uppercase tracking-wide"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                REGISTER NOW - ৳100
              </motion.button>
            </Link>
            <motion.button
              onClick={downloadSchedule}
              className="px-12 py-6 border-2 border-yellow-500 text-yellow-500 font-black rounded-full hover:bg-yellow-500 hover:text-black transition-all duration-300 text-xl uppercase tracking-wide flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="w-6 h-6" />
              DOWNLOAD SCHEDULE
            </motion.button>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
