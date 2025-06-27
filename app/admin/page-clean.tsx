'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Bell, 
  Settings, 
  BarChart3, 
  FileText, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock,
  Plus,
  Send,
  Package,
  AlertCircle,
  X,
  ExternalLink,
  User,
  Calendar,
  Bot,
  Shield,
  CreditCard,
  Building,
  TrendingUp
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { databases, storage, DATABASE_ID, USERS_COLLECTION_ID, ANNOUNCEMENTS_COLLECTION_ID, RESOURCES_COLLECTION_ID, RESOURCES_BUCKET_ID, REGISTRATIONS_COLLECTION_ID, STUDENT_ID_BUCKET_ID, PAYMENT_SCREENSHOT_BUCKET_ID } from '@/lib/appwrite';
import { Query, ID } from 'appwrite';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// TypeScript declaration for jsPDF autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  institution: string;
  studentId: string;
  status: 'pending' | 'approved' | 'rejected' | 'pending_verification';
  role: 'user' | 'admin';
  events: string[];
  registrationId?: string;
  paymentStatus?: 'pending' | 'verification_pending' | 'approved' | 'rejected';
  studentIdFileId?: string;
  paymentScreenshotFileId?: string;
  verificationCode?: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success';
  date: string;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'video' | 'zip';
  url: string;
  uploadDate: string;
  file?: File;
}

interface Stats {
  totalUsers: number;
  approvedUsers: number;
  pendingUsers: number;
  rejectedUsers: number;
  totalAnnouncements: number;
  totalResources: number;
}

const AdminPanel = () => {
  const { user } = useAuth();
  const router = useRouter();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'announcements' | 'resources' | 'stats' | 'management'>('users');
  
  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal states
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  
  // Image modal states
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [currentImageTitle, setCurrentImageTitle] = useState('');
  
  // User dashboard modal states
  const [showUserDashboard, setShowUserDashboard] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserData, setSelectedUserData] = useState<any>(null);
  const [selectedUserRegistration, setSelectedUserRegistration] = useState<any>(null);

  // Check admin access
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (user.role !== 'admin') {
      toast.error('Access denied. Admin role required.');
      router.push('/');
      return;
    }
    
    fetchAdminData();
  }, [user, router]);

  // Filter users when search term or status filter changes
  useEffect(() => {
    filterUsers();
  }, [searchTerm, statusFilter, users]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch users and registrations
      const [usersResponse, registrationsResponse, announcementsResponse, resourcesResponse] = await Promise.all([
        databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [Query.limit(100)]),
        databases.listDocuments(DATABASE_ID, REGISTRATIONS_COLLECTION_ID, [Query.limit(100)]),
        databases.listDocuments(DATABASE_ID, ANNOUNCEMENTS_COLLECTION_ID, [Query.limit(50)]),
        databases.listDocuments(DATABASE_ID, RESOURCES_COLLECTION_ID, [Query.limit(50)])
      ]);

      // Process users data
      const processedUsers: User[] = usersResponse.documents.map((userDoc: any) => {
        const registration = registrationsResponse.documents.find((reg: any) => reg.userId === userDoc.$id);
        
        return {
          id: userDoc.$id,
          name: userDoc.name || '',
          email: userDoc.email || '',
          phone: userDoc.phone || '',
          institution: userDoc.institution || '',
          studentId: userDoc.studentId || '',
          status: registration?.status || 'pending',
          role: userDoc.role || 'user',
          events: registration?.events || [],
          registrationId: registration?.$id,
          paymentStatus: registration?.paymentStatus || 'pending',
          studentIdFileId: registration?.studentIdFileId || userDoc.studentIdFileId,
          paymentScreenshotFileId: registration?.paymentScreenshotFileId || userDoc.paymentScreenshotFileId,
          verificationCode: registration?.verificationCode
        };
      });

      // Process announcements
      const processedAnnouncements: Announcement[] = announcementsResponse.documents.map((doc: any) => ({
        id: doc.$id,
        title: doc.title,
        content: doc.content,
        type: doc.type,
        date: doc.$createdAt?.split('T')[0] || new Date().toISOString().split('T')[0]
      }));

      // Process resources
      const processedResources: Resource[] = resourcesResponse.documents.map((doc: any) => ({
        id: doc.$id,
        title: doc.title,
        description: doc.description,
        type: doc.type,
        url: doc.url,
        uploadDate: doc.$createdAt?.split('T')[0] || new Date().toISOString().split('T')[0]
      }));

      // Calculate stats
      const statsData: Stats = {
        totalUsers: processedUsers.length,
        approvedUsers: processedUsers.filter(u => u.status === 'approved').length,
        pendingUsers: processedUsers.filter(u => u.status === 'pending').length,
        rejectedUsers: processedUsers.filter(u => u.status === 'rejected').length,
        totalAnnouncements: processedAnnouncements.length,
        totalResources: processedResources.length
      };

      // Update state
      setUsers(processedUsers);
      setAnnouncements(processedAnnouncements);
      setResources(processedResources);
      setStats(statsData);

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.institution.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  };

  const updateUserStatus = async (userId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user?.registrationId) {
        toast.error('Registration ID not found');
        return;
      }

      await databases.updateDocument(
        DATABASE_ID,
        REGISTRATIONS_COLLECTION_ID,
        user.registrationId,
        { status: newStatus }
      );

      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, status: newStatus } : u
      ));

      toast.success(`User ${newStatus}!`);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="spinner w-12 h-12 border-4 border-blue-600 border-t-transparent" />
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pt-24 sm:pt-28 lg:pt-32 relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="text-center mb-8">
            <motion.h1
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-6xl font-black text-white mb-4 uppercase tracking-wider"
            >
              Admin <span className="text-yellow-400">Dashboard</span>
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-xl text-gray-400 font-medium"
            >
              Manage NCC Robotics Workshop 2025
            </motion.p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900 rounded-2xl p-6 border-2 border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 font-medium">Total Users</p>
                  <p className="text-3xl font-black text-white">{stats.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-yellow-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900 rounded-2xl p-6 border-2 border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 font-medium">Approved</p>
                  <p className="text-3xl font-black text-green-400">{stats.approvedUsers}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-900 rounded-2xl p-6 border-2 border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 font-medium">Pending</p>
                  <p className="text-3xl font-black text-yellow-400">{stats.pendingUsers}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </motion.div>
          </div>
        )}

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900 rounded-3xl shadow-2xl mb-8 border-2 border-gray-700 relative overflow-hidden"
        >
          <div className="p-6">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'users', label: 'Users', icon: Users },
                { id: 'announcements', label: 'Announcements', icon: Bell },
                { id: 'resources', label: 'Resources', icon: FileText },
                { id: 'stats', label: 'Statistics', icon: BarChart3 },
                { id: 'management', label: 'Management', icon: Settings }
              ].map(({ id, label, icon: Icon }) => (
                <motion.button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center px-6 py-3 rounded-xl font-bold uppercase tracking-wider transition-all duration-300 ${
                    activeTab === id
                      ? 'bg-yellow-500 text-black'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {label}
                </motion.button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="mt-6">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'users' && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-black text-white">User Management</h3>
                    
                    {/* Search and Filter */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Search users..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none transition-colors"
                        />
                      </div>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-yellow-500 focus:outline-none transition-colors"
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    {/* Users List */}
                    <div className="space-y-4">
                      {filteredUsers.map((user, index) => (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gray-800 rounded-2xl p-6 border-2 border-gray-700 hover:border-yellow-500/50 transition-all duration-300"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="text-lg font-black text-white">{user.name}</h4>
                              <p className="text-gray-400">{user.email}</p>
                              <p className="text-gray-500 text-sm">{user.institution}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                user.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                user.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {user.status}
                              </span>
                            </div>
                          </div>
                          
                          {user.status === 'pending' && (
                            <div className="flex gap-3">
                              <motion.button
                                onClick={() => updateUserStatus(user.id, 'approved')}
                                className="flex-1 p-3 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl hover:bg-green-500/30 transition-all duration-300 font-bold uppercase tracking-wider"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <CheckCircle className="w-4 h-4 mr-2 inline" />
                                Approve
                              </motion.button>
                              <motion.button
                                onClick={() => updateUserStatus(user.id, 'rejected')}
                                className="flex-1 p-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-all duration-300 font-bold uppercase tracking-wider"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <XCircle className="w-4 h-4 mr-2 inline" />
                                Reject
                              </motion.button>
                            </div>
                          )}
                        </motion.div>
                      ))}
                      
                      {filteredUsers.length === 0 && (
                        <div className="text-center py-12">
                          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400 text-lg">No users found</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {activeTab === 'announcements' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-2xl font-black text-white">Announcements</h3>
                      <motion.button
                        onClick={() => setShowAnnouncementModal(true)}
                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold px-4 py-2 rounded-lg transition-all duration-200 flex items-center shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Announcement
                      </motion.button>
                    </div>
                    
                    <div className="space-y-4">
                      {announcements.map((announcement, index) => (
                        <motion.div
                          key={announcement.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="bg-gray-800 rounded-2xl p-6 border-2 border-gray-700"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-bold text-white text-lg">{announcement.title}</h4>
                              <p className="text-gray-300 mt-2">{announcement.content}</p>
                              <p className="text-gray-500 text-sm mt-3">Posted: {announcement.date}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ml-4 ${
                              announcement.type === 'info' ? 'bg-blue-500/20 text-blue-400' :
                              announcement.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {announcement.type.toUpperCase()}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                      
                      {announcements.length === 0 && (
                        <div className="text-center py-12">
                          <Bell className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400 text-lg">No announcements yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {activeTab === 'resources' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-2xl font-black text-white">Resources</h3>
                      <motion.button
                        onClick={() => setShowResourceModal(true)}
                        className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold px-4 py-2 rounded-lg transition-all duration-200 flex items-center shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Resource
                      </motion.button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {resources.map((resource, index) => (
                        <motion.div
                          key={resource.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="bg-gray-800 rounded-2xl p-6 border-2 border-gray-700 hover:border-yellow-500/30 transition-all duration-300"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <FileText className="w-8 h-8 text-yellow-400" />
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                              resource.type === 'pdf' ? 'bg-red-500/20 text-red-400' :
                              resource.type === 'video' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-purple-500/20 text-purple-400'
                            }`}>
                              {resource.type}
                            </span>
                          </div>
                          <h4 className="font-bold text-white mb-2">{resource.title}</h4>
                          <p className="text-gray-400 text-sm mb-4">{resource.description}</p>
                          <p className="text-gray-500 text-xs">Uploaded: {resource.uploadDate}</p>
                        </motion.div>
                      ))}
                      
                      {resources.length === 0 && (
                        <div className="col-span-full text-center py-12">
                          <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400 text-lg">No resources yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {activeTab === 'stats' && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-black text-white">Statistics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/30 border border-yellow-500/30 rounded-xl p-6">
                        <Users className="w-8 h-8 text-yellow-400 mb-4" />
                        <p className="text-3xl font-black text-white">{stats?.totalUsers || 0}</p>
                        <p className="text-yellow-400 font-medium">Total Users</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-500/20 to-green-600/30 border border-green-500/30 rounded-xl p-6">
                        <CheckCircle className="w-8 h-8 text-green-400 mb-4" />
                        <p className="text-3xl font-black text-white">{stats?.approvedUsers || 0}</p>
                        <p className="text-green-400 font-medium">Approved</p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/30 border border-blue-500/30 rounded-xl p-6">
                        <Bell className="w-8 h-8 text-blue-400 mb-4" />
                        <p className="text-3xl font-black text-white">{stats?.totalAnnouncements || 0}</p>
                        <p className="text-blue-400 font-medium">Announcements</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/30 border border-purple-500/30 rounded-xl p-6">
                        <Package className="w-8 h-8 text-purple-400 mb-4" />
                        <p className="text-3xl font-black text-white">{stats?.totalResources || 0}</p>
                        <p className="text-purple-400 font-medium">Resources</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'management' && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-black text-white">User Management</h3>
                    <div className="bg-gray-800 rounded-2xl p-6 border-2 border-gray-700">
                      <h4 className="text-lg font-bold text-white mb-4">Admin Access Instructions</h4>
                      <p className="text-gray-400 mb-4">To grant admin access to a user:</p>
                      <ol className="list-decimal list-inside space-y-2 text-gray-300">
                        <li>Go to your Appwrite Console</li>
                        <li>Navigate to Databases → Users Collection</li>
                        <li>Find the user document and edit it</li>
                        <li>Change the "role" field from "user" to "admin"</li>
                        <li>Save the changes</li>
                        <li>The user will be redirected to admin panel on next login</li>
                      </ol>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminPanel;
