'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, MessageCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ContactPage = () => {

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-green-900/20" />
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <Header />

      <main className="relative z-10 pt-20">
        {/* Hero Section */}
        <motion.section
          className="relative py-20 px-6"
          variants={pageVariants}
          initial="initial"
          animate="animate"
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              className="inline-flex items-center bg-gradient-to-r from-green-400/10 to-green-600/10 border border-green-400/20 rounded-full px-6 py-3 mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <MessageCircle className="w-5 h-5 text-green-400 mr-2" />
              <span className="text-green-400 font-medium">Get in Touch</span>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              CONTACT US
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-blue-200 mb-12 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Have questions about the NCC Robotics Workshop? We're here to help! Reach out to us using any of the methods below.
            </motion.p>
          </div>
        </motion.section>        {/* Contact Information & Form */}
        <motion.section
          className="py-16 px-6"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          <div className="max-w-4xl mx-auto">
              
            {/* Contact Information */}
            <motion.div
              className="space-y-8"
              variants={itemVariants}
            >
              <div>
                <h2 className="text-3xl font-bold text-yellow-400 mb-8 text-center">Get in Touch</h2>
                <p className="text-blue-200 mb-8 text-center max-w-2xl mx-auto">
                  Whether you have questions about registration, technical requirements, or just want to learn more about robotics, 
                  our team is ready to assist you. We typically respond within 24 hours.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">                <motion.div 
                  className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl border border-gray-700/30 p-6"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center mb-4">
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-3 rounded-xl mr-4">
                      <Mail className="w-6 h-6 text-black" />
                    </div>                    <div>
                      <h3 className="text-xl font-bold text-white">Email Us</h3>
                      <p className="text-gray-400">ncc.robotics.segment@gmail.com</p>
                    </div>
                  </div>
                  <p className="text-blue-200 text-sm">
                    Send us an email for general inquiries, registration support, or technical questions.
                  </p>
                </motion.div>

                <motion.div 
                  className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl border border-gray-700/30 p-6"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center mb-4">
                    <div className="bg-gradient-to-r from-green-400 to-green-600 p-3 rounded-xl mr-4">
                      <Phone className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Call Us</h3>
                      <p className="text-gray-400">+880 1718-360044</p>
                    </div>
                  </div>
                  <p className="text-blue-200 text-sm">
                    Contact Farhan Kabir Sifat (Segment Head) - Available for robotics workshop inquiries.
                  </p>
                </motion.div>

                <motion.div 
                  className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl border border-gray-700/30 p-6"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center mb-4">
                    <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-3 rounded-xl mr-4">
                      <MapPin className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Visit Us</h3>
                      <p className="text-gray-400">NCC Robotics Team</p>
                    </div>
                  </div>
                  <p className="text-blue-200 text-sm">
                    National Institute of Technology (NIT)<br />
                    Dhaka, Bangladesh
                  </p>
                </motion.div>

                <motion.div 
                  className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl border border-gray-700/30 p-6"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center mb-4">
                    <div className="bg-gradient-to-r from-purple-400 to-purple-600 p-3 rounded-xl mr-4">
                      <Clock className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Office Hours</h3>
                      <p className="text-gray-400">Mon - Fri: 9:00 AM - 6:00 PM</p>
                    </div>
                  </div>
                  <p className="text-blue-200 text-sm">
                    Weekend support available via email for urgent inquiries.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section
          className="py-16 px-6"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          <div className="max-w-4xl mx-auto">
            <motion.h2
              className="text-3xl font-bold text-center text-yellow-400 mb-12"
              variants={itemVariants}
            >
              Frequently Asked Questions
            </motion.h2>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  question: "What should I bring to the workshop?",
                  answer: "Just bring yourself and enthusiasm! All equipment, materials, and refreshments will be provided."
                },
                {
                  question: "Do I need prior robotics experience?",
                  answer: "Not at all! This workshop is designed for beginners. Our expert instructors will guide you through everything."
                },
                {
                  question: "Is the workshop really free?",
                  answer: "Yes! This workshop is completely free for all registered participants. We believe in making robotics education accessible."
                },
                {
                  question: "Will I receive a certificate?",
                  answer: "Yes, all participants who complete the workshop will receive a digital certificate of completion."
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl border border-gray-700/30 p-6"
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                >
                  <h3 className="text-lg font-bold text-yellow-400 mb-3">{faq.question}</h3>
                  <p className="text-blue-200">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
