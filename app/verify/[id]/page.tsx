'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  User, 
  Calendar, 
  CreditCard,
  FileText,
  Download,
  Bot,
  Shield,
  ExternalLink
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { databases, DATABASE_ID, REGISTRATIONS_COLLECTION_ID, USERS_COLLECTION_ID } from '@/lib/appwrite';
import { Query } from 'appwrite';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';

interface RegistrationData {
  registrationId: string;
  name: string;
  email: string;
  eventType: string;
  status: string;
  paymentStatus: string;
  submittedAt: string;
  registrationFee?: number;
  parsedPersonalInfo?: any;
}

const VerifyRegistration = () => {
  const params = useParams();
  const registrationId = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (registrationId) {
      fetchRegistrationData();
    } else {
      setError('No registration ID provided in QR code');
      setLoading(false);
    }
  }, [registrationId]);

  const fetchRegistrationData = async () => {
    try {
      console.log('=== QR CODE VERIFICATION DEBUG ===');
      console.log('Registration ID from QR code:', registrationId);
      console.log('Full URL params:', params);
      
      // Try to find by registration ID first
      let registrationResponse = await databases.listDocuments(
        DATABASE_ID,
        REGISTRATIONS_COLLECTION_ID,
        [Query.equal("registrationId", registrationId)]
      );
      
      console.log('Search by registrationId result:', registrationResponse);

      // If not found by registrationId, try by document ID
      if (registrationResponse.documents.length === 0) {
        console.log('Not found by registrationId, trying document ID...');
        try {
          const directDoc = await databases.getDocument(
            DATABASE_ID,
            REGISTRATIONS_COLLECTION_ID,
            registrationId
          );
          console.log('Found by document ID:', directDoc);
          registrationResponse = { documents: [directDoc], total: 1 };
        } catch (directError) {
          console.log('Could not find by document ID either:', directError);
        }
      }

      if (registrationResponse.documents.length === 0) {
        console.log('❌ Registration not found anywhere');
        setError('Registration not found. Please check your QR code or registration ID.');
        setLoading(false);
        return;
      }

      const registration = registrationResponse.documents[0];
      console.log('✅ Found registration:', registration);

      // Get user details
      let userName = 'Unknown User';
      let userEmail = 'No email provided';
      
      if (registration.userId) {
        try {
          const userDoc = await databases.getDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            registration.userId
          );
          userName = userDoc.name || 'Unknown User';
          userEmail = userDoc.email || 'No email provided';
        } catch (userError) {
          console.log('Could not fetch user details:', userError);
        }
      }

      // Parse personal info if available
      let parsedPersonalInfo = {};
      try {
        if (registration.personalInfo) {
          parsedPersonalInfo = JSON.parse(registration.personalInfo);
        }
      } catch (parseError) {
        console.log('Could not parse personal info');
      }

      const verificationData: RegistrationData = {
        registrationId: registration.registrationId || registration.$id,
        name: userName,
        email: userEmail,
        eventType: registration.eventType || 'NCC Robotics Workshop 2025',
        status: registration.status || 'pending',
        paymentStatus: registration.paymentStatus || 'pending',
        submittedAt: registration.submittedAt || registration.$createdAt,
        registrationFee: registration.registrationFee || 100,
        parsedPersonalInfo
      };

      setRegistrationData(verificationData);
      toast.success('Registration verified successfully!');
    } catch (error) {
      console.error('Error verifying registration:', error);
      setError('Failed to verify registration. Please try again.');
      toast.error('Failed to verify registration');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'verified':
      case 'completed':
        return 'text-green-400';
      case 'pending':
      case 'pending_verification':
        return 'text-yellow-400';
      case 'rejected':
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'verified':
      case 'completed':
        return <CheckCircle className="w-8 h-8 text-green-400" />;
      case 'pending':
      case 'pending_verification':
        return <Clock className="w-8 h-8 text-yellow-400" />;
      case 'rejected':
      case 'failed':
        return <AlertCircle className="w-8 h-8 text-red-400" />;
      default:
        return <AlertCircle className="w-8 h-8 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white overflow-hidden relative">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-yellow-600/10" />
        </div>
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] relative z-10">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl font-semibold text-white">Verifying Registration...</p>
            <p className="text-gray-400 mt-2">Please wait while we verify your QR code</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !registrationData) {
    return (
      <div className="min-h-screen bg-black text-white overflow-hidden relative">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-red-600/10" />
        </div>
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] relative z-10">
          <div className="text-center p-8 max-w-md">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <p className="text-sm text-gray-500">Registration ID: {registrationId}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-yellow-600/10" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-yellow-400/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-3xl mb-6"
          >
            <Shield className="w-10 h-10 text-black" />
          </motion.div>
          <h1 className="text-4xl font-black text-white mb-4 uppercase tracking-wider">
            Registration <span className="text-yellow-400">Verified</span>
          </h1>
          <p className="text-gray-400 font-medium text-lg">
            QR Code Verification for NCC Robotics Workshop 2025
          </p>
        </motion.div>

        {/* Main Verification Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900 rounded-3xl shadow-2xl p-8 border-2 border-gray-700 relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 right-4">
              <Bot className="w-8 h-8 text-yellow-400" />
            </div>
            <div className="absolute bottom-4 left-4">
              <CheckCircle className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          
          <div className="relative z-10">
            {/* Status Header */}
            <div className="flex items-center justify-center mb-8">
              {getStatusIcon(registrationData.status)}
              <div className="ml-4 text-center">
                <h2 className="text-2xl font-black text-white uppercase tracking-wider">
                  Registration Status: <span className={getStatusColor(registrationData.status)}>
                    {registrationData.status.charAt(0).toUpperCase() + registrationData.status.slice(1)}
                  </span>
                </h2>
                <p className="text-gray-400 mt-2">
                  ID: <span className="text-yellow-400 font-black">{registrationData.registrationId}</span>
                </p>
              </div>
            </div>

            {/* Participant Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <motion.div 
                  className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-2xl border border-blue-500/30"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center mb-4">
                    <User className="w-6 h-6 text-blue-400 mr-3" />
                    <h3 className="font-black text-blue-300 text-lg uppercase tracking-wider">Participant Details</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-400">Full Name</label>
                      <p className="text-white font-medium">{registrationData.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400">Email</label>
                      <p className="text-white font-medium">{registrationData.email}</p>
                    </div>
                    {registrationData.parsedPersonalInfo?.phone && (
                      <div>
                        <label className="text-sm font-medium text-gray-400">Phone</label>
                        <p className="text-white font-medium">{registrationData.parsedPersonalInfo.phone}</p>
                      </div>
                    )}
                    {registrationData.parsedPersonalInfo?.institution && (
                      <div>
                        <label className="text-sm font-medium text-gray-400">Institution</label>
                        <p className="text-white font-medium">{registrationData.parsedPersonalInfo.institution}</p>
                      </div>
                    )}
                    {registrationData.parsedPersonalInfo?.studentId && (
                      <div>
                        <label className="text-sm font-medium text-gray-400">Student ID</label>
                        <p className="text-white font-medium">{registrationData.parsedPersonalInfo.studentId}</p>
                      </div>
                    )}
                  </div>
                </motion.div>

                <motion.div 
                  className="p-6 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 rounded-2xl border border-yellow-500/30"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center mb-4">
                    <Calendar className="w-6 h-6 text-yellow-400 mr-3" />
                    <h3 className="font-black text-yellow-300 text-lg uppercase tracking-wider">Event Information</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-400">Event Type</label>
                      <p className="text-white font-medium">{registrationData.eventType}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400">Registration Date</label>
                      <p className="text-white font-medium">
                        {new Date(registrationData.submittedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400">Registration Fee</label>
                      <p className="text-white font-medium">৳{registrationData.registrationFee}</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <motion.div 
                  className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-2xl border border-green-500/30"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex items-center mb-4">
                    <CreditCard className="w-6 h-6 text-green-400 mr-3" />
                    <h3 className="font-black text-green-300 text-lg uppercase tracking-wider">Payment Status</h3>
                  </div>
                  <div className="text-center">
                    <div className={`inline-block px-6 py-3 rounded-xl font-black uppercase tracking-wider ${
                      registrationData.paymentStatus === 'completed' || registrationData.paymentStatus === 'approved' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : registrationData.paymentStatus === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {registrationData.paymentStatus}
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-2xl border border-purple-500/30"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="flex items-center mb-4">
                    <FileText className="w-6 h-6 text-purple-400 mr-3" />
                    <h3 className="font-black text-purple-300 text-lg uppercase tracking-wider">Verification Details</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-400">Verified At</label>
                      <p className="text-white font-medium">
                        {new Date().toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400">Verification Method</label>
                      <p className="text-white font-medium">QR Code Scan</p>
                    </div>
                    <div className="pt-3">
                      <div className="flex items-center text-green-400">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium">Registration Authentic</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Footer Actions */}
            <motion.div 
              className="mt-8 pt-6 border-t border-gray-600 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <p className="text-gray-400 mb-4">
                This registration has been verified for the NCC Robotics Workshop 2025
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  onClick={() => window.print()}
                  className="group relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-black py-3 px-6 rounded-xl flex items-center transition-all duration-300 uppercase tracking-wider shadow-lg shadow-yellow-500/30">
                    <Download className="w-5 h-5 mr-2" />
                    Print Verification
                  </div>
                </motion.button>
                <motion.button
                  onClick={() => window.history.back()}
                  className="px-6 py-3 border-2 border-gray-600 text-gray-300 rounded-xl hover:border-yellow-500 hover:text-yellow-400 transition-all duration-300 flex items-center justify-center font-black uppercase tracking-wider"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Go Back
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
};

export default VerifyRegistration;
