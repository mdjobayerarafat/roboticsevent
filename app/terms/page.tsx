'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Users, Shield, AlertTriangle, Check, Calendar } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

const TermsOfServicePage = () => {
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

  const lastUpdated = 'January 15, 2025';

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
              className="inline-flex items-center bg-gradient-to-r from-blue-400/10 to-blue-600/10 border border-blue-400/20 rounded-full px-6 py-3 mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <FileText className="w-5 h-5 text-blue-400 mr-2" />
              <span className="text-blue-400 font-medium">Terms & Conditions</span>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              TERMS OF SERVICE
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-blue-200 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Please read these terms carefully before registering for the NCC Robotics Workshop 2025.
            </motion.p>

            <motion.div
              className="flex flex-wrap justify-center gap-4 text-sm text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <span>Last Updated: {lastUpdated}</span>
              <span>•</span>
              <span>Effective Date: January 1, 2025</span>
            </motion.div>
          </div>
        </motion.section>

        {/* Terms Sections */}
        <motion.section
          className="py-16 px-6"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          <div className="max-w-4xl mx-auto space-y-12">
            
            {/* Agreement to Terms */}
            <motion.div
              className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-3xl border-2 border-blue-500/20 p-8"
              variants={itemVariants}
            >
              <div className="flex items-center mb-6">
                <Users className="w-8 h-8 text-yellow-400 mr-4" />
                <h2 className="text-3xl font-bold text-white">Agreement to Terms</h2>
              </div>
              <div className="text-blue-200 space-y-4">
                <p>
                  By registering for the NCC Robotics Workshop 2025, you agree to be bound by these Terms of Service. 
                  If you do not agree to these terms, please do not register for the workshop.
                </p>
                <p>
                  These terms constitute a legally binding agreement between you and NCCROBOTICS regarding your 
                  participation in the workshop and use of our services.
                </p>
              </div>
            </motion.div>

            {/* Workshop Participation */}
            <motion.div
              className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-3xl border-2 border-gray-700/30 p-8"
              variants={itemVariants}
            >
              <div className="flex items-center mb-6">
                <Calendar className="w-8 h-8 text-yellow-400 mr-4" />
                <h2 className="text-3xl font-bold text-white">Workshop Participation</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-yellow-400 mb-3">Eligibility</h3>
                  <ul className="space-y-2 text-blue-200">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      Must be a current student with valid student ID
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      Must provide accurate registration information
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      Must be 16 years or older, or have parental consent
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-yellow-400 mb-3">Attendance & Punctuality</h3>
                  <ul className="space-y-2 text-blue-200">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      Participants must attend all scheduled sessions
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      Arrive on time for all activities and sessions
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      Notify organizers of any emergency absence
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Conduct & Behavior */}
            <motion.div
              className="bg-gradient-to-br from-red-500/10 to-orange-600/10 rounded-3xl border-2 border-red-500/20 p-8"
              variants={itemVariants}
            >
              <div className="flex items-center mb-6">
                <Shield className="w-8 h-8 text-yellow-400 mr-4" />
                <h2 className="text-3xl font-bold text-white">Code of Conduct</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-yellow-400 mb-3">Expected Behavior</h3>
                  <ul className="space-y-2 text-blue-200">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      Treat all participants, instructors, and staff with respect
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      Follow safety guidelines and equipment usage instructions
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      Participate actively and constructively in all activities
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      Respect intellectual property and confidential information
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-red-400 mb-3">Prohibited Conduct</h3>
                  <ul className="space-y-2 text-blue-200">
                    <li className="flex items-start">
                      <AlertTriangle className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                      Harassment, discrimination, or inappropriate behavior
                    </li>
                    <li className="flex items-start">
                      <AlertTriangle className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                      Damage to equipment, facilities, or property
                    </li>
                    <li className="flex items-start">
                      <AlertTriangle className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                      Unauthorized recording or photography
                    </li>
                    <li className="flex items-start">
                      <AlertTriangle className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                      Sharing workshop materials without permission
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Cancellation & Refunds */}
            <motion.div
              className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-3xl border-2 border-gray-700/30 p-8"
              variants={itemVariants}
            >
              <div className="flex items-center mb-6">
                <FileText className="w-8 h-8 text-yellow-400 mr-4" />
                <h2 className="text-3xl font-bold text-white">Cancellation Policy</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-yellow-400 mb-3">Participant Cancellation</h3>
                  <ul className="space-y-2 text-blue-200">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      Cancellations must be submitted in writing via email
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      Full refund available up to 7 days before workshop date
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      50% refund available 3-7 days before workshop date
                    </li>
                    <li className="flex items-start">
                      <AlertTriangle className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                      No refund for cancellations within 48 hours of workshop
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-yellow-400 mb-3">Event Cancellation</h3>
                  <p className="text-blue-200">
                    NCCROBOTICS reserves the right to cancel or postpone the workshop due to unforeseen circumstances. 
                    In such cases, participants will receive full refunds or the option to transfer to a future workshop.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Liability & Safety */}
            <motion.div
              className="bg-gradient-to-br from-orange-500/10 to-red-600/10 rounded-3xl border-2 border-orange-500/20 p-8"
              variants={itemVariants}
            >
              <div className="flex items-center mb-6">
                <AlertTriangle className="w-8 h-8 text-yellow-400 mr-4" />
                <h2 className="text-3xl font-bold text-white">Liability & Safety</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-yellow-400 mb-3">Assumption of Risk</h3>
                  <p className="text-blue-200 mb-4">
                    Participants acknowledge that robotics activities involve inherent risks and agree to:
                  </p>
                  <ul className="space-y-2 text-blue-200">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      Follow all safety instructions and guidelines
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      Use protective equipment when required
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      Report any injuries or unsafe conditions immediately
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-yellow-400 mb-3">Limitation of Liability</h3>
                  <p className="text-blue-200">
                    NCCROBOTICS provides the workshop "as is" and makes no warranties regarding outcomes or results. 
                    Our liability is limited to the registration fee paid by the participant.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Changes to Terms */}
            <motion.div
              className="bg-gradient-to-br from-yellow-500/10 to-orange-600/10 rounded-3xl border-2 border-yellow-500/20 p-8 text-center"
              variants={itemVariants}
            >
              <h2 className="text-3xl font-bold text-yellow-400 mb-6">Changes to Terms</h2>
              <p className="text-blue-200 mb-6">
                We reserve the right to modify these terms at any time. Significant changes will be communicated 
                to registered participants via email. Continued participation constitutes acceptance of updated terms.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/privacy">
                  <motion.button
                    className="bg-transparent border-2 border-yellow-400 text-yellow-400 px-8 py-3 rounded-xl font-bold hover:bg-yellow-400 hover:text-black transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Privacy Policy
                  </motion.button>
                </Link>
                <Link href="/register">
                  <motion.button
                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-8 py-3 rounded-xl font-bold hover:from-yellow-300 hover:to-yellow-500 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Register Now
                  </motion.button>
                </Link>
              </div>
            </motion.div>

          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfServicePage;
