'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  AlertTriangle, 
  Users, 
  Send, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  CreditCard, 
  ArrowLeft,
  Bot,
  FileText,
  Eye,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { databases, DATABASE_ID, USERS_COLLECTION_ID, REGISTRATIONS_COLLECTION_ID } from '@/lib/appwrite';
import { Query } from 'appwrite';
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
  userId?: string;
  phone?: string;
  institution?: string;
  studentId?: string;
}

const AdminPaymentWarnings = () => {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
  const [pendingPaymentUsers, setPendingPaymentUsers] = useState<RegistrationData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<RegistrationData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [sendingEmails, setSendingEmails] = useState(false);
  const [emailsSent, setEmailsSent] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is admin
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (!isAdmin) {
      toast.error('Access denied. Admin privileges required.');
      router.push('/');
      return;
    }
    
    fetchPendingPaymentUsers();
  }, [user, isAdmin, router]);

  useEffect(() => {
    // Apply search filter
    let filtered = pendingPaymentUsers;

    if (searchTerm) {
      filtered = filtered.filter(reg => 
        reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.registrationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.institution?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [pendingPaymentUsers, searchTerm]);

  const fetchPendingPaymentUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch all registrations
      const registrationsResponse = await databases.listDocuments(
        DATABASE_ID,
        REGISTRATIONS_COLLECTION_ID,
        [Query.orderDesc('$createdAt')]
      );

      // Fetch all users to get user details
      const usersResponse = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID
      );

      // Create a map of users for quick lookup
      const usersMap = new Map();
      usersResponse.documents.forEach(user => {
        usersMap.set(user.$id, user);
      });

      // Process registrations and filter for pending payments
      const processedRegistrations: RegistrationData[] = registrationsResponse.documents.map(registration => {
        const user = usersMap.get(registration.userId);
        
        // Parse personal info if available
        let parsedPersonalInfo = {};
        try {
          if (registration.personalInfo) {
            parsedPersonalInfo = JSON.parse(registration.personalInfo);
          }
        } catch (parseError) {
          console.log('Could not parse personal info for registration:', registration.$id);
        }

        return {
          registrationId: registration.registrationId || registration.$id,
          name: user?.name || 'Unknown User',
          email: user?.email || 'No email provided',
          eventType: registration.eventType || 'NCC Robotics Workshop 2025',
          status: registration.status || 'pending',
          paymentStatus: registration.paymentStatus || 'pending',
          submittedAt: registration.submittedAt || registration.$createdAt,
          registrationFee: registration.registrationFee || 100,
          parsedPersonalInfo,
          userId: registration.userId,
          phone: (parsedPersonalInfo as any).phone || 'N/A',
          institution: (parsedPersonalInfo as any).institution || 'N/A',
          studentId: (parsedPersonalInfo as any).studentId || 'N/A'
        };
      });

      // Filter for users with pending payments
      const pendingUsers = processedRegistrations.filter(reg => 
        reg.paymentStatus?.toLowerCase() === 'pending' || 
        reg.paymentStatus?.toLowerCase() === 'failed' ||
        !reg.paymentStatus
      );

      setRegistrations(processedRegistrations);
      setPendingPaymentUsers(pendingUsers);
      toast.success(`Found ${pendingUsers.length} users with pending payments`);
    } catch (error) {
      console.error('Error fetching pending payment users:', error);
      setError('Failed to fetch user data. Please try again.');
      toast.error('Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (registrationId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(registrationId)) {
      newSelected.delete(registrationId);
    } else {
      newSelected.add(registrationId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(user => user.registrationId)));
    }
  };

  const sendPaymentWarningEmails = async () => {
    if (selectedUsers.size === 0) {
      toast.error('Please select at least one user to send payment warnings to.');
      return;
    }

    const selectedUserData = filteredUsers.filter(user => selectedUsers.has(user.registrationId));
    
    try {
      setSendingEmails(true);
      setEmailsSent(0);
      
      const emailPromises = selectedUserData.map(async (user, index) => {
        try {
          // Add delay between emails to avoid rate limiting
          if (index > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }

          const response = await fetch('/api/send-payment-warning', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              to: user.email,
              name: user.name,
              registrationId: user.registrationId,
              amount: user.registrationFee || 100,
              dueDate: 'Within 7 days'
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to send email to ${user.name}`);
          }

          const result = await response.json();
          console.log(`Payment warning email sent to ${user.name}:`, result);
          
          setEmailsSent(prev => prev + 1);
          return { success: true, user: user.name, email: user.email };
        } catch (error: any) {
          console.error(`Error sending email to ${user.name}:`, error);
          return { success: false, user: user.name, email: user.email, error: error.message };
        }
      });

      const results = await Promise.all(emailPromises);
      
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);

      if (successful.length > 0) {
        toast.success(`Payment warning emails sent successfully to ${successful.length} user(s)!`, {
          duration: 5000
        });
      }

      if (failed.length > 0) {
        toast.error(`Failed to send emails to ${failed.length} user(s). Check console for details.`, {
          duration: 5000
        });
        console.error('Failed email sends:', failed);
      }

      // Clear selections after sending
      setSelectedUsers(new Set());
      
    } catch (error: any) {
      console.error('Error sending payment warning emails:', error);
      toast.error(`Failed to send payment warning emails: ${error.message}`);
    } finally {
      setSendingEmails(false);
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'approved':
        return 'text-green-400';
      case 'pending':
      case 'verification_pending':
        return 'text-yellow-400';
      case 'failed':
      case 'rejected':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'pending':
      case 'verification_pending':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'failed':
      case 'rejected':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white overflow-hidden relative">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-red-500/10" />
        </div>
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] relative z-10">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl font-semibold text-white">Loading Payment Data...</p>
            <p className="text-gray-400 mt-2">Fetching users with pending payments</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white overflow-hidden relative">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-red-600/10" />
        </div>
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] relative z-10">
          <div className="text-center p-8 max-w-md">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Error Loading Data</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors"
            >
              Try Again
            </button>
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
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-red-500/10" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-yellow-400/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <motion.button
                onClick={() => router.push('/admin')}
                className="mr-4 p-2 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-6 h-6 text-yellow-400" />
              </motion.button>
              <div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl mb-4"
                >
                  <AlertTriangle className="w-8 h-8 text-white" />
                </motion.div>
                <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-wider">
                  Payment <span className="text-red-400">Warnings</span>
                </h1>
                <p className="text-gray-400 font-medium text-lg">
                  Send payment reminder emails to users with pending payments
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <motion.button
                onClick={fetchPendingPaymentUsers}
                className="group relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-blue-600 text-white font-black py-3 px-6 rounded-xl flex items-center transition-all duration-300 uppercase tracking-wider shadow-lg shadow-blue-500/30">
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Refresh Data
                </div>
              </motion.button>

              <motion.button
                onClick={sendPaymentWarningEmails}
                disabled={selectedUsers.size === 0 || sendingEmails}
                className="group relative"
                whileHover={{ scale: selectedUsers.size > 0 && !sendingEmails ? 1.05 : 1 }}
                whileTap={{ scale: selectedUsers.size > 0 && !sendingEmails ? 0.95 : 1 }}
              >
                <div className={`absolute inset-0 bg-gradient-to-r rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity ${
                  selectedUsers.size > 0 && !sendingEmails 
                    ? 'from-red-500 to-orange-500' 
                    : 'from-gray-600 to-gray-700'
                }`}></div>
                <div className={`relative font-black py-3 px-6 rounded-xl flex items-center transition-all duration-300 uppercase tracking-wider shadow-lg ${
                  selectedUsers.size > 0 && !sendingEmails
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-red-500/30 cursor-pointer'
                    : 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-400 cursor-not-allowed'
                }`}>
                  {sendingEmails ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Sending... ({emailsSent})
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Warnings ({selectedUsers.size})
                    </>
                  )}
                </div>
              </motion.button>
            </div>
          </div>

          {/* Stats and Search */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Total Pending Card */}
            <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-xl p-4 text-center">
              <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-400">{pendingPaymentUsers.length}</div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">Pending Payments</div>
            </div>

            {/* Selected Card */}
            <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl p-4 text-center">
              <Mail className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-400">{selectedUsers.size}</div>
              <div className="text-sm text-gray-400 uppercase tracking-wider">Selected</div>
            </div>

            {/* Search */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users with pending payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
              />
            </div>
          </div>

          {/* Select All Toggle */}
          {filteredUsers.length > 0 && (
            <div className="mb-6">
              <motion.button
                onClick={handleSelectAll}
                className="flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`w-5 h-5 border-2 border-yellow-400 rounded flex items-center justify-center ${
                  selectedUsers.size === filteredUsers.length ? 'bg-yellow-400' : 'bg-transparent'
                }`}>
                  {selectedUsers.size === filteredUsers.length && (
                    <CheckCircle className="w-3 h-3 text-black" />
                  )}
                </div>
                <span className="font-medium">
                  {selectedUsers.size === filteredUsers.length ? 'Deselect All' : 'Select All'} 
                  ({filteredUsers.length} users)
                </span>
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Users Grid */}
        {filteredUsers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">
              {pendingPaymentUsers.length === 0 ? 'All payments are up to date!' : 'No users found'}
            </h3>
            <p className="text-gray-500">
              {pendingPaymentUsers.length === 0 
                ? 'Great job! All registered users have completed their payments.' 
                : 'Try adjusting your search criteria'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.registrationId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gray-900 rounded-2xl shadow-xl p-6 border-2 transition-all duration-300 relative overflow-hidden group cursor-pointer ${
                  selectedUsers.has(user.registrationId)
                    ? 'border-yellow-500 bg-yellow-500/5'
                    : 'border-gray-700 hover:border-red-500/50'
                }`}
                onClick={() => handleSelectUser(user.registrationId)}
              >
                {/* Selection Indicator */}
                <div className="absolute top-4 right-4 z-20">
                  <div className={`w-6 h-6 border-2 rounded-full flex items-center justify-center transition-all ${
                    selectedUsers.has(user.registrationId)
                      ? 'border-yellow-400 bg-yellow-400'
                      : 'border-gray-500 bg-transparent group-hover:border-yellow-400'
                  }`}>
                    {selectedUsers.has(user.registrationId) && (
                      <CheckCircle className="w-4 h-4 text-black" />
                    )}
                  </div>
                </div>

                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
                  <div className="absolute top-4 left-4">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                  </div>
                </div>
                
                <div className="relative z-10">
                  {/* Payment Status Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      {getPaymentStatusIcon(user.paymentStatus)}
                      <span className={`ml-2 font-bold uppercase text-sm ${getPaymentStatusColor(user.paymentStatus)}`}>
                        {user.paymentStatus || 'Pending'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`/verify/${user.registrationId}`, '_blank');
                        }}
                        className="p-2 rounded-lg bg-gray-800 hover:bg-yellow-500 hover:text-black transition-all duration-300"
                        title="View Registration"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Registration ID */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Registration ID</p>
                    <p className="text-yellow-400 font-bold text-sm">{user.registrationId}</p>
                  </div>

                  {/* User Details */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Name</p>
                      <p className="text-white font-medium">{user.name}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Email</p>
                      <p className="text-white font-medium text-sm break-all">{user.email}</p>
                    </div>

                    {user.phone !== 'N/A' && (
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Phone</p>
                        <p className="text-white font-medium">{user.phone}</p>
                      </div>
                    )}

                    {user.institution !== 'N/A' && (
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Institution</p>
                        <p className="text-white font-medium text-sm">{user.institution}</p>
                      </div>
                    )}

                    {/* Payment Amount */}
                    <div className="pt-3 border-t border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Amount Due</p>
                          <p className="text-red-400 font-bold text-lg">৳{user.registrationFee || 100}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Days Since Registration</p>
                          <p className="text-white font-bold">
                            {Math.floor((Date.now() - new Date(user.submittedAt).getTime()) / (1000 * 60 * 60 * 24))} days
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Registration Date */}
                    <div className="pt-2">
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Registration Date</p>
                      <p className="text-white font-medium text-sm">
                        {new Date(user.submittedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminPaymentWarnings;
