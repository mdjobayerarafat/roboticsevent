'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Users, Database, FileText, AlertCircle, Check, Mail, Phone } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

const PrivacyPolicyPage = () => {
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

  const sections = [
    {
      id: 'information-collection',
      title: 'Information We Collect',
      icon: Database,
      content: [
        {
          subtitle: 'Personal Information',
          items: [
            'Full name and email address',
            'Phone number and emergency contact details',
            'Educational institution and student ID',
            'Event preferences and dietary restrictions',
            'T-shirt size for workshop materials'
          ]
        },
        {
          subtitle: 'Verification Documents',
          items: [
            'Student ID card or institutional proof',
            'Payment confirmation screenshots',
            'Registration forms and related documents'
          ]
        },
        {
          subtitle: 'Technical Information',
          items: [
            'IP address and browser information',
            'Login timestamps and session data',
            'User interaction analytics for service improvement'
          ]
        }
      ]
    },
    {
      id: 'information-use',
      title: 'How We Use Your Information',
      icon: Eye,
      content: [
        {
          subtitle: 'Workshop Administration',
          items: [
            'Processing and confirming your workshop registration',
            'Verifying payment status and student eligibility',
            'Generating registration certificates and confirmations',
            'Organizing workshop materials and seating arrangements'
          ]
        },
        {
          subtitle: 'Communication',
          items: [
            'Sending important workshop updates and announcements',
            'Providing technical support and customer service',
            'Sharing workshop resources and educational materials',
            'Emergency notifications if workshop details change'
          ]
        },
        {
          subtitle: 'Event Management',
          items: [
            'Creating attendee lists for security and logistics',
            'Organizing group activities and team assignments',
            'Ensuring compliance with safety and educational standards'
          ]
        }
      ]
    },
    {
      id: 'data-protection',
      title: 'Data Protection & Security',
      icon: Shield,
      content: [
        {
          subtitle: 'Security Measures',
          items: [
            'End-to-end encryption for all sensitive data transmission',
            'Secure cloud storage with Appwrite backend services',
            'Role-based access control for administrative functions',
            'Regular security audits and vulnerability assessments'
          ]
        },
        {
          subtitle: 'Data Access Controls',
          items: [
            'Only authorized staff can access participant information',
            'Admin users are verified and trained on data protection',
            'Document uploads are stored in secure, isolated buckets',
            'User dashboards show only individual participant data'
          ]
        }
      ]
    },
    {
      id: 'data-sharing',
      title: 'Information Sharing',
      icon: Users,
      content: [
        {
          subtitle: 'Third-Party Services',
          items: [
            'Appwrite cloud services for secure data storage and authentication',
            'Payment processing services for registration fee verification',
            'Email service providers for workshop communications',
            'PDF generation services for certificates and confirmations'
          ]
        },
        {
          subtitle: 'Educational Partners',
          items: [
            'Workshop instructors and mentors (name and contact only)',
            'Educational institutions for academic credit verification',
            'Industry partners for internship and career opportunities (with consent)'
          ]
        },
        {
          subtitle: 'We Never Share',
          items: [
            'Complete personal profiles with unauthorized parties',
            'Financial information or payment details',
            'Student ID documents or verification files',
            'Personal contact information for marketing purposes'
          ]
        }
      ]
    },
    {
      id: 'data-retention',
      title: 'Data Retention',
      icon: FileText,
      content: [
        {
          subtitle: 'During Workshop Period',
          items: [
            'All registration data maintained until workshop completion',
            'Documents and verification files kept for attendance tracking',
            'Communication logs preserved for customer support'
          ]
        },
        {
          subtitle: 'Post-Workshop',
          items: [
            'Attendance records kept for 1 year for certificate verification',
            'Contact information retained for 6 months for follow-up surveys',
            'Payment records maintained as required by financial regulations',
            'Uploaded documents deleted after 90 days unless consent given'
          ]
        },
        {
          subtitle: 'Account Deletion',
          items: [
            'You can request complete data deletion at any time',
            'All personal information removed within 30 days of request',
            'Anonymized analytics data may be retained for service improvement'
          ]
        }
      ]
    },
    {
      id: 'user-rights',
      title: 'Your Rights',
      icon: Lock,
      content: [
        {
          subtitle: 'Access & Control',
          items: [
            'View and download all your personal data through your dashboard',
            'Update your profile information and preferences anytime',
            'Request copies of documents you\'ve uploaded',
            'Opt out of non-essential communications'
          ]
        },
        {
          subtitle: 'Data Portability',
          items: [
            'Export your registration data in PDF format',
            'Request structured data files for transfer to other services',
            'Download workshop certificates and completion records'
          ]
        },
        {
          subtitle: 'Withdrawal & Deletion',
          items: [
            'Withdraw consent for data processing at any time',
            'Request immediate deletion of uploaded documents',
            'Close your account and remove all associated data'
          ]
        }
      ]
    }
  ];

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
              className="inline-flex items-center bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 border border-yellow-400/20 rounded-full px-6 py-3 mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Shield className="w-5 h-5 text-yellow-400 mr-2" />
              <span className="text-yellow-400 font-medium">Your Privacy Matters</span>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              PRIVACY POLICY
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-blue-200 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              We are committed to protecting your personal information and being transparent about how we collect, use, and safeguard your data during the NCC Robotics Workshop.
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

        {/* Quick Overview */}
        <motion.section
          className="py-16 px-6"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-3xl border-2 border-blue-500/20 p-8 mb-16"
              variants={itemVariants}
            >
              <div className="flex items-start mb-6">
                <AlertCircle className="w-8 h-8 text-yellow-400 mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-4">Quick Overview</h2>
                  <div className="grid md:grid-cols-2 gap-6 text-blue-200">
                    <div>
                      <h3 className="font-semibold text-white mb-2">What We Collect:</h3>
                      <ul className="space-y-1 text-sm">
                        <li>• Registration and contact information</li>
                        <li>• Student verification documents</li>
                        <li>• Payment confirmation details</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">Why We Collect It:</h3>
                      <ul className="space-y-1 text-sm">
                        <li>• Workshop registration and verification</li>
                        <li>• Communication and support</li>
                        <li>• Event logistics and safety</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Detailed Sections */}
        <motion.section
          className="py-16 px-6"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          <div className="max-w-6xl mx-auto">
            <div className="space-y-16">
              {sections.map((section, index) => (
                <motion.div
                  key={section.id}
                  id={section.id}
                  className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-3xl border-2 border-gray-700/30 p-8"
                  variants={itemVariants}
                  viewport={{ once: true }}
                  whileInView="animate"
                  initial="initial"
                >
                  <div className="flex items-center mb-8">
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-3 rounded-2xl mr-4">
                      <section.icon className="w-8 h-8 text-black" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">{section.title}</h2>
                  </div>

                  <div className="space-y-8">
                    {section.content.map((subsection, subIndex) => (
                      <div key={subIndex}>
                        <h3 className="text-xl font-semibold text-yellow-400 mb-4">
                          {subsection.subtitle}
                        </h3>
                        <div className="grid gap-3">
                          {subsection.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex items-start">
                              <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                              <span className="text-blue-200">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Contact Section */}
        <motion.section
          className="py-16 px-6"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="bg-gradient-to-br from-yellow-500/10 to-orange-600/10 rounded-3xl border-2 border-yellow-500/20 p-8 text-center"
              variants={itemVariants}
            >
              <h2 className="text-3xl font-bold text-yellow-400 mb-6">Questions About Privacy?</h2>
              <p className="text-blue-200 mb-8 max-w-2xl mx-auto">
                If you have any questions about this privacy policy, how we handle your data, or want to exercise your rights, please don't hesitate to contact us.
              </p>              <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-8">
                <div className="flex items-center">
                  <Mail className="w-6 h-6 text-yellow-400 mr-3" />
                  <span className="text-white">ncc.robotics.segment@gmail.com</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-6 h-6 text-yellow-400 mr-3" />
                  <span className="text-white">+880 1718-360044</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/register">
                  <motion.button
                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-8 py-3 rounded-xl font-bold hover:from-yellow-300 hover:to-yellow-500 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Register for Workshop
                  </motion.button>
                </Link>
                <Link href="/user">
                  <motion.button
                    className="bg-transparent border-2 border-yellow-400 text-yellow-400 px-8 py-3 rounded-xl font-bold hover:bg-yellow-400 hover:text-black transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Access Your Data
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Data Rights Summary */}
        <motion.section
          className="py-16 px-6"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          <div className="max-w-6xl mx-auto">
            <motion.h2
              className="text-3xl font-bold text-center text-yellow-400 mb-12"
              variants={itemVariants}
            >
              Your Data Rights at a Glance
            </motion.h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Eye,
                  title: 'Right to Access',
                  description: 'View all your personal data through your dashboard or request a complete copy.',
                  action: 'Login to Dashboard'
                },
                {
                  icon: FileText,
                  title: 'Right to Portability',
                  description: 'Export your data in PDF format or request structured data files.',
                  action: 'Download Data'
                },
                {
                  icon: Shield,
                  title: 'Right to Deletion',
                  description: 'Request complete removal of your personal information from our systems.',
                  action: 'Contact Support'
                }
              ].map((right, index) => (
                <motion.div
                  key={index}
                  className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-2xl border border-gray-700/30 p-6 text-center"
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.05,
                    transition: { duration: 0.2 }
                  }}
                >
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-4 rounded-2xl inline-block mb-4">
                    <right.icon className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{right.title}</h3>
                  <p className="text-blue-200 mb-4">{right.description}</p>
                  <button className="text-yellow-400 font-semibold hover:text-yellow-300 transition-colors">
                    {right.action} →
                  </button>
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

export default PrivacyPolicyPage;
