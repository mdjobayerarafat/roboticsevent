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
  AlertTriangle,
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
  registrationDate: string;
  status: 'pending' | 'approved' | 'rejected';
  role?: 'user' | 'admin'; // Add role field
  events: string[];
  documents: {
    id: string;
    academic: string;
    status: 'pending' | 'approved' | 'rejected';
  };
  // Additional fields for admin management
  paymentStatus?: 'pending' | 'verification_pending' | 'approved' | 'rejected';
  studentIdFileId?: string;
  paymentScreenshotFileId?: string;
  registrationId?: string;
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
  file?: File;
  url?: string;
 uploadDate: string;
}

interface Stats {
  totalUsers: number;
  approvedUsers: number;
  pendingUsers: number;
  rejectedUsers: number;
  totalEvents: number;
  documentsToReview: number;
}

const AdminPanel = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'users' | 'announcements' | 'resources' | 'stats' | 'management'>('users');
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const [currentImageTitle, setCurrentImageTitle] = useState<string>('');
  const [showUserDashboard, setShowUserDashboard] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserData, setSelectedUserData] = useState<any>(null);
  const [selectedUserRegistration, setSelectedUserRegistration] = useState<any>(null);

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }
    fetchAdminData();
  }, [user, router]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, statusFilter]);

  // Expose admin utilities to global scope for console access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).databases = databases;
      (window as any).storage = storage;
      (window as any).DATABASE_ID = DATABASE_ID;
      (window as any).USERS_COLLECTION_ID = USERS_COLLECTION_ID;
      (window as any).ANNOUNCEMENTS_COLLECTION_ID = ANNOUNCEMENTS_COLLECTION_ID;
      (window as any).RESOURCES_COLLECTION_ID = RESOURCES_COLLECTION_ID;
      (window as any).RESOURCES_BUCKET_ID = RESOURCES_BUCKET_ID;
      (window as any).Query = Query;
      (window as any).ID = ID;
      
      // Admin utility function
      (window as any).setUserAsAdmin = async (userEmail: string) => {
        try {
          console.log(`Setting user ${userEmail} as admin...`);
          
          const userQuery = await databases.listDocuments(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            [Query.equal("email", userEmail)]
          );
          
          if (userQuery.documents.length === 0) {
            console.error('User not found with email:', userEmail);
            return;
          }
          
          const user = userQuery.documents[0];
          console.log('Found user:', user.name, user.email);
          
          const updatedUser = await databases.updateDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            user.$id,
            { role: 'admin' }
          );
          
          console.log('✅ Successfully updated user role to admin!');
          console.log('User details:', {
            id: updatedUser.$id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role
          });
          
          // Refresh the page data
          fetchAdminData();
          return updatedUser;
        } catch (error) {
          console.error('❌ Error setting user as admin:', error);
          throw error;
        }
      };
      
      // Admin utility for creating announcements
      (window as any).createAnnouncement = async (title: string, content: string, type: 'info' | 'warning' | 'success' = 'info') => {
        try {
          console.log(`Creating announcement: ${title}`);
          
          const newAnnouncement = await databases.createDocument(
            DATABASE_ID,
            ANNOUNCEMENTS_COLLECTION_ID,
            ID.unique(),
            {
              title,
              content,
              type,
              createdBy: 'admin',
              isActive: true
            }
          );
          
          console.log('✅ Successfully created announcement!');
          console.log('Announcement details:', {
            id: newAnnouncement.$id,
            title: newAnnouncement.title,
            content: newAnnouncement.content,
            type: newAnnouncement.type
          });
          
          // Refresh the page data
          fetchAdminData();
          return newAnnouncement;
        } catch (error) {
          console.error('❌ Error creating announcement:', error);
          throw error;
        }
      };
      
      // Admin utility for editing announcements
      (window as any).editAnnouncement = async (announcementId: string, title: string, content: string, type: 'info' | 'warning' | 'success' = 'info') => {
        try {
          console.log(`Editing announcement: ${announcementId}`);
          
          const updatedAnnouncement = await databases.updateDocument(
            DATABASE_ID,
            ANNOUNCEMENTS_COLLECTION_ID,
            announcementId,
            {
              title,
              content,
              type
            }
          );
          
          console.log('✅ Successfully updated announcement!');
          console.log('Updated announcement details:', {
            id: updatedAnnouncement.$id,
            title: updatedAnnouncement.title,
            content: updatedAnnouncement.content,
            type: updatedAnnouncement.type
          });
          
          // Refresh the page data
          fetchAdminData();
          return updatedAnnouncement;
        } catch (error) {
          console.error('❌ Error updating announcement:', error);
          throw error;
        }
      };
      
      // Admin utility for deleting announcements
      (window as any).deleteAnnouncement = async (announcementId: string) => {
        try {
          console.log(`Deleting announcement: ${announcementId}`);
          
          await databases.deleteDocument(
            DATABASE_ID,
            ANNOUNCEMENTS_COLLECTION_ID,
            announcementId
          );
          
          console.log('✅ Successfully deleted announcement!');
          
          // Refresh the page data
          fetchAdminData();
          return true;
        } catch (error) {
          console.error('❌ Error deleting announcement:', error);
          throw error;
        }
      };
      
      // Admin utility for creating resources
      (window as any).createResource = async (title: string, description: string, type: 'pdf' | 'video' | 'zip' = 'pdf', url?: string) => {
        try {
          console.log(`Creating resource: ${title}`);
          
          const newResource = await databases.createDocument(
            DATABASE_ID,
            RESOURCES_COLLECTION_ID,
            ID.unique(),
            {
              title,
              description,
              type,
              url: url || '',
              createdBy: 'admin',
              isActive: true,
              downloadCount: 0
            }
          );
          
          console.log('✅ Successfully created resource!');
          console.log('Resource details:', {
            id: newResource.$id,
            title: newResource.title,
            description: newResource.description,
            type: newResource.type,
            url: newResource.url
          });
          
          // Refresh the page data
          fetchAdminData();
          return newResource;
        } catch (error) {
          console.error('❌ Error creating resource:', error);
          throw error;
        }
      };
      
      // Admin utility for deleting resources
      (window as any).deleteResource = async (resourceId: string) => {
        try {
          console.log(`Deleting resource: ${resourceId}`);
          
          // Get resource details first to get file ID
          const resourceDoc = await databases.getDocument(
            DATABASE_ID,
            RESOURCES_COLLECTION_ID,
            resourceId
          );
          
          // Delete file from storage if it exists
          if (resourceDoc.fileId) {
            try {
              await storage.deleteFile(RESOURCES_BUCKET_ID, resourceDoc.fileId);
              console.log('File deleted from storage');
            } catch (fileError) {
              console.error('Error deleting file from storage:', fileError);
              // Continue with document deletion even if file deletion fails
            }
          }
          
          // Delete resource document
          await databases.deleteDocument(
            DATABASE_ID,
            RESOURCES_COLLECTION_ID,
            resourceId
          );
          
          setResources(prev => prev.filter(res => res.id !== resourceId));
          toast.success('Resource deleted successfully!');
        } catch (error) {
          console.error('Error deleting resource:', error);
          toast.error('Failed to delete resource');
        }
      };
      
      // Admin utility for testing bucket permissions
      (window as any).testResourcesBucket = async () => {
        try {
          console.log('Testing resources bucket permissions...');
          console.log('Bucket ID:', RESOURCES_BUCKET_ID);
          
          // Try to list files in the bucket
          const files = await storage.listFiles(RESOURCES_BUCKET_ID);
          console.log('✅ Bucket accessible! Files found:', files.total);
          console.log('Files:', files.files.map(f => ({ id: f.$id, name: f.name, size: f.sizeOriginal })));
          
          return { success: true, filesCount: files.total };
        } catch (error: any) {
          console.error('❌ Error accessing bucket:', error);
          
          if (error?.message?.includes('permission')) {
            console.log('� Solution: Check bucket permissions in Appwrite Console');
            console.log('Required permissions for admins:');
            console.log('- Read: users, admins');
            console.log('- Create: admins');
            console.log('- Update: admins');
            console.log('- Delete: admins');
          }
          
          throw error;
        }
      };
      
      // Admin utility for testing collection permissions
      (window as any).testResourcesCollection = async () => {
        try {
          console.log('Testing resources collection permissions...');
          console.log('Collection ID:', RESOURCES_COLLECTION_ID);
          
          // Try to list documents in the collection
          const docs = await databases.listDocuments(DATABASE_ID, RESOURCES_COLLECTION_ID);
          console.log('✅ Collection accessible! Documents found:', docs.total);
          console.log('Documents:', docs.documents.map(d => ({ id: d.$id, title: d.title, type: d.type })));
          
          return { success: true, documentsCount: docs.total };
        } catch (error: any) {
          console.error('❌ Error accessing collection:', error);
          
          if (error?.message?.includes('permission')) {
            console.log('💡 Solution: Check collection permissions in Appwrite Console');
          }
          
          throw error;
        }
      };
      
      // Admin utility for testing payment screenshots bucket
      (window as any).testPaymentScreenshotsBucket = async () => {
        try {
          console.log('Testing payment screenshots bucket permissions...');
          console.log('Bucket ID:', PAYMENT_SCREENSHOT_BUCKET_ID);
          
          // Try to list files in the bucket
          const files = await storage.listFiles(PAYMENT_SCREENSHOT_BUCKET_ID);
          console.log('✅ Payment screenshots bucket accessible! Files found:', files.total);
          console.log('Payment screenshots:', files.files.map(f => ({ 
            id: f.$id, 
            name: f.name, 
            size: f.sizeOriginal,
            mimeType: f.mimeType,
            chunksUploaded: f.chunksUploaded
          })));
          
          return { success: true, filesCount: files.total, files: files.files };
        } catch (error: any) {
          console.error('❌ Error accessing payment screenshots bucket:', error);
          
          if (error?.message?.includes('permission')) {
            console.log('💡 Solution: Check payment screenshots bucket permissions in Appwrite Console');
            console.log('Required permissions for admins:');
            console.log('- Read: users, admins');
            console.log('- Create: users, admins');
            console.log('- Update: admins');
            console.log('- Delete: admins');
          }
          
          throw error;
        }
      };
      
      // Admin utility for testing student ID bucket
      (window as any).testStudentIdBucket = async () => {
        try {
          console.log('Testing student ID bucket permissions...');
          console.log('Bucket ID:', STUDENT_ID_BUCKET_ID);
          
          // Try to list files in the bucket
          const files = await storage.listFiles(STUDENT_ID_BUCKET_ID);
          console.log('✅ Student ID bucket accessible! Files found:', files.total);
          console.log('Student IDs:', files.files.map(f => ({ 
            id: f.$id, 
            name: f.name, 
            size: f.sizeOriginal,
            mimeType: f.mimeType
          })));
          
          return { success: true, filesCount: files.total, files: files.files };
        } catch (error: any) {
          console.error('❌ Error accessing student ID bucket:', error);
          
          if (error?.message?.includes('permission')) {
            console.log('💡 Solution: Check student ID bucket permissions in Appwrite Console');
          }
          
          throw error;
        }
      };
      
      // Admin utility to check users with payment screenshots
      (window as any).checkUsersWithPaymentScreenshots = async () => {
        try {
          console.log('Checking users with payment screenshots...');
          
          // Get all registrations
          const registrationsResponse = await databases.listDocuments(
            DATABASE_ID,
            REGISTRATIONS_COLLECTION_ID
          );
          
          console.log(`Total registrations: ${registrationsResponse.documents.length}`);
          
          const usersWithScreenshots = [];
          const usersWithDocuments = [];
          
          for (const registration of registrationsResponse.documents) {
            let hasScreenshot = false;
            let screenshotSource = '';
            let screenshotId = '';
            
            // Check direct paymentScreenshotFileId
            if (registration.paymentScreenshotFileId) {
              hasScreenshot = true;
              screenshotSource = 'paymentScreenshotFileId';
              screenshotId = registration.paymentScreenshotFileId;
            }
            
            // Check documents field
            if (registration.documents && !hasScreenshot) {
              try {
                const parsedDocs = JSON.parse(registration.documents);
                if (parsedDocs.paymentScreenshot) {
                  hasScreenshot = true;
                  screenshotSource = 'documents.paymentScreenshot';
                  screenshotId = parsedDocs.paymentScreenshot;
                  usersWithDocuments.push({
                    userId: registration.userId,
                    registrationId: registration.$id,
                    screenshotId: screenshotId
                  });
                }
              } catch (err) {
                // Ignore parsing errors
              }
            }
            
            if (hasScreenshot) {
              usersWithScreenshots.push({
                userId: registration.userId,
                registrationId: registration.$id,
                screenshotSource: screenshotSource,
                screenshotId: screenshotId
              });
            }
          }
          
          console.log(`✅ Users with payment screenshots: ${usersWithScreenshots.length}`);
          console.log('Details:', usersWithScreenshots);
          
          if (usersWithDocuments.length > 0) {
            console.log(`📋 Users with screenshots in documents field: ${usersWithDocuments.length}`);
            console.log('These may need migration to paymentScreenshotFileId field');
          }
          
          return {
            total: usersWithScreenshots.length,
            users: usersWithScreenshots,
            documentsField: usersWithDocuments
          };
        } catch (error) {
          console.error('❌ Error checking payment screenshots:', error);
          throw error;
        }
      };
      
      console.log('🔧 Admin utilities loaded!');
      console.log('Use: setUserAsAdmin("user@example.com")');
      console.log('Use: createAnnouncement("Title", "Content", "info")');
      console.log('Use: editAnnouncement("announcementId", "New Title", "New Content", "warning")');
      console.log('Use: deleteAnnouncement("announcementId")');
      console.log('Use: createResource("Title", "Description", "pdf", "optional-url")');
      console.log('Use: deleteResource("resourceId")');
      console.log('Use: testResourcesBucket()');
      console.log('Use: testResourcesCollection()');
      console.log('Use: testPaymentScreenshotsBucket()');
      console.log('Use: testStudentIdBucket()');
      console.log('Use: checkUsersWithPaymentScreenshots()');
    }
  }, []);

  const fetchAdminData = async () => {
    try {
      // Fetch real users from Appwrite
      const usersResponse = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID
      );
      
      // Fetch registrations to get additional user data
      const registrationsResponse = await databases.listDocuments(
        DATABASE_ID,
        REGISTRATIONS_COLLECTION_ID
      );
      
      // Create a map of user registrations
      const registrationsMap = new Map();
      registrationsResponse.documents.forEach(reg => {
        if (reg.userId) {
          registrationsMap.set(reg.userId, reg);
        }
      });
      
      // Convert Appwrite documents to User interface
      const appwriteUsers: User[] = usersResponse.documents.map(doc => {
        const registration = registrationsMap.get(doc.$id);
        
        // Debug logging for payment screenshots
        if (registration?.paymentScreenshotFileId) {
          console.log(`User ${doc.name} has payment screenshot:`, {
            userId: doc.$id,
            name: doc.name,
            email: doc.email,
            paymentScreenshotFileId: registration.paymentScreenshotFileId,
            registrationId: registration.$id
          });
        }
        
        // Check if user has payment screenshot in parsed documents
        let hasPaymentScreenshot = false;
        let paymentScreenshotFileId = registration?.paymentScreenshotFileId || '';
        
        if (registration?.documents) {
          try {
            const parsedDocuments = JSON.parse(registration.documents);
            if (parsedDocuments?.paymentScreenshot && !paymentScreenshotFileId) {
              paymentScreenshotFileId = parsedDocuments.paymentScreenshot;
              hasPaymentScreenshot = true;
              console.log(`User ${doc.name} has payment screenshot in documents:`, paymentScreenshotFileId);
            }
          } catch (err) {
            console.log('Error parsing documents for user', doc.name, err);
          }
        }
        
        if (paymentScreenshotFileId) {
          hasPaymentScreenshot = true;
        }
        
        return {
          id: doc.$id,
          name: doc.name || 'Unknown',
          email: doc.email || '',
          phone: doc.phone || '',
          institution: doc.institution || '',
          studentId: doc.studentId || '',
          registrationDate: doc.$createdAt?.split('T')[0] || '2024-12-20',
          status: registration?.status || 'pending',
          role: doc.role || 'user',
          events: [], // This would need to be fetched from registrations
          documents: { id: 'doc1', academic: 'pending', status: 'pending' },
          paymentStatus: registration?.paymentStatus || 'pending',
          studentIdFileId: registration?.studentIdFileId || '',
          paymentScreenshotFileId: paymentScreenshotFileId,
          registrationId: registration?.$id || ''
        };
      });

      setUsers(appwriteUsers);
      
      const mockStats: Stats = {
        totalUsers: appwriteUsers.length,
        approvedUsers: appwriteUsers.filter(u => u.status === 'approved').length,
        pendingUsers: appwriteUsers.filter(u => u.status === 'pending').length,
        rejectedUsers: appwriteUsers.filter(u => u.status === 'rejected').length,
        totalEvents: 2,
        documentsToReview: appwriteUsers.filter(u => u.documents.status === 'pending').length
      };

      // Fetch real announcements from Appwrite
      try {
        const announcementsResponse = await databases.listDocuments(
          DATABASE_ID,
          ANNOUNCEMENTS_COLLECTION_ID,
          [Query.orderDesc('$createdAt')] // Order by newest first
        );
        
        const appwriteAnnouncements: Announcement[] = announcementsResponse.documents.map(doc => ({
          id: doc.$id,
          title: doc.title || '',
          content: doc.content || '',
          type: doc.type || 'info',
          date: doc.$createdAt?.split('T')[0] || new Date().toISOString().split('T')[0]
        }));
        
        setAnnouncements(appwriteAnnouncements);
      } catch (announcementError) {
        console.error('Error fetching announcements:', announcementError);
        // Fallback to mock data if announcements fetch fails
        const mockAnnouncements: Announcement[] = [
          {
            id: '1',
            title: 'Workshop Schedule Updated',
            content: 'The main robotics workshop has been moved to 10:00 AM - 4:00 PM on June 30th.',
            type: 'info',
            date: '2024-12-20'
          }
        ];
        setAnnouncements(mockAnnouncements);
      }

      // Fetch real resources from Appwrite
      try {
        const resourcesResponse = await databases.listDocuments(
          DATABASE_ID,
          RESOURCES_COLLECTION_ID,
          [Query.orderDesc('$createdAt')] // Order by newest first
        );
        
        const appwriteResources: Resource[] = resourcesResponse.documents.map(doc => ({
          id: doc.$id,
          title: doc.title || '',
          description: doc.description || '',
          type: doc.type || 'pdf',
          url: doc.url || '',
          uploadDate: doc.$createdAt?.split('T')[0] || new Date().toISOString().split('T')[0]
        }));
        
        setResources(appwriteResources);
      } catch (resourceError) {
        console.error('Error fetching resources:', resourceError);
        // Fallback to mock data if resources fetch fails
        const mockResources: Resource[] = [
          {
            id: '1',
            title: 'Workshop Preparation Guide',
            description: 'Essential preparation materials for the robotics workshop',
            type: 'pdf',
            url: '/resources/prep-guide.pdf',
            uploadDate: '2024-12-18'
          }
        ];
        setResources(mockResources);
      }

      setStats(mockStats);
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
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      toast.success(`User ${newStatus} successfully!`);
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const exportUsersPDF = async () => {
    let loadingToast: any;
    let exportUsers: User[] = [];
    
    try {
      // Validate data before proceeding
      console.log('Starting PDF export...');
      console.log('Users array:', users.length);
      console.log('Filtered users array:', filteredUsers.length);
      
      if (!users || users.length === 0) {
        toast.error('No user data available. Please wait for data to load.');
        return;
      }
      
      // Use users array if filteredUsers is empty, but exclude admin users
      const allUsers = filteredUsers.length > 0 ? filteredUsers : users;
      exportUsers = allUsers.filter(user => user.role !== 'admin');
      console.log('Total users:', allUsers.length);
      console.log('Exporting non-admin users count:', exportUsers.length);
      console.log('Admin users excluded:', allUsers.length - exportUsers.length);
      
      if (exportUsers.length === 0) {
        toast.error('No non-admin users found to export.');
        return;
      }
      
      // Show loading toast
      loadingToast = toast.loading('Generating themed PDF report...');
      
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth(); // 210mm for A4
      const pageHeight = doc.internal.pageSize.getHeight(); // 297mm for A4
      
      console.log(`PDF dimensions: ${pageWidth}mm x ${pageHeight}mm`);
      
      // Theme colors (RGB values)
      const colors = {
        primary: [248, 250, 252],     // slate-50 (background)
        dark: [15, 23, 42],           // slate-900 (dark background)
        accent: [234, 179, 8],        // yellow-500 (accent)
        accentLight: [254, 240, 138], // yellow-200 (lighter accent)
        blue: [59, 130, 246],         // blue-500
        green: [34, 197, 94],         // green-500
        orange: [249, 115, 22],       // orange-500
        purple: [147, 51, 234],       // purple-500
        text: [30, 41, 59],           // slate-800
        lightText: [100, 116, 139],   // slate-500
        cardBg: [51, 65, 85]          // slate-700
      };

      // A4 margins
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2); // 180mm content width

      // Dark background
      doc.setFillColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // Add decorative circles with accent colors
      doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      doc.circle(pageWidth - 30, 30, 20, 'F');
      
      doc.setFillColor(colors.blue[0], colors.blue[1], colors.blue[2]);
      doc.circle(30, pageHeight - 30, 15, 'F');
      
      doc.setFillColor(colors.purple[0], colors.purple[1], colors.purple[2]);
      doc.circle(pageWidth - 20, pageHeight - 40, 12, 'F');

      // Try to add robot text in header (fallback text)
      try {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
        doc.text('ROBOT', pageWidth - 55, 35);
      } catch (error) {
        console.log('Could not add robot text');
      }

      // Header section with improved design
      doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      doc.roundedRect(margin, margin, contentWidth, 35, 6, 6, 'F');

      // Main title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.text('NCC ROBOTICS WORKSHOP 2025', pageWidth / 2, margin + 15, { align: 'center' });

      // Subtitle
      doc.setFontSize(12);
      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.text('REGISTERED USERS REPORT', pageWidth / 2, margin + 25, { align: 'center' });

      // Export info section
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.text(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, margin, margin + 40);
      doc.text(`Admin: ${user?.name || 'System Admin'}`, pageWidth - margin - 30, margin + 40);

      // Info section with optimized stats cards
      const cardY = margin + 50;
      const cardHeight = 20;
      const cardWidth = (contentWidth - 15) / 4; // 4 cards with 5mm spacing each
      const cardSpacing = 5;
      
      const totalUsers = exportUsers.length;
      const approvedCount = exportUsers.filter(u => u.status === 'approved').length;
      const pendingCount = exportUsers.filter(u => u.status === 'pending').length;
      const rejectedCount = exportUsers.filter(u => u.status === 'rejected').length;

      // Total Users Card (Blue)
      doc.setFillColor(colors.blue[0], colors.blue[1], colors.blue[2]);
      doc.roundedRect(margin, cardY, cardWidth, cardHeight, 3, 3, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text(totalUsers.toString(), margin + 3, cardY + 10);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('Total Users', margin + 3, cardY + 16);

      // Approved Users Card (Green)
      const card2X = margin + cardWidth + cardSpacing;
      doc.setFillColor(colors.green[0], colors.green[1], colors.green[2]);
      doc.roundedRect(card2X, cardY, cardWidth, cardHeight, 3, 3, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text(approvedCount.toString(), card2X + 3, cardY + 10);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('Approved', card2X + 3, cardY + 16);

      // Pending Users Card (Orange)
      const card3X = margin + (cardWidth + cardSpacing) * 2;
      doc.setFillColor(colors.orange[0], colors.orange[1], colors.orange[2]);
      doc.roundedRect(card3X, cardY, cardWidth, cardHeight, 3, 3, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text(pendingCount.toString(), card3X + 3, cardY + 10);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('Pending', card3X + 3, cardY + 16);

      // Rejected Users Card (Purple)
      const card4X = margin + (cardWidth + cardSpacing) * 3;
      doc.setFillColor(colors.purple[0], colors.purple[1], colors.purple[2]);
      doc.roundedRect(card4X, cardY, cardWidth, cardHeight, 3, 3, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text(rejectedCount.toString(), card4X + 3, cardY + 10);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('Rejected', card4X + 3, cardY + 16);

      // Table section header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.text('USER DETAILS', margin, cardY + 28);

      // Create manual table with proper A4 sizing and improved formatting
      const tableStartY = cardY + 35;
      const rowHeight = 10; // Increased row height for better padding
      const tableWidth = contentWidth;
      
      // Better column width distribution for improved readability
      const colWidths = [12, 35, 55, 35, 25, 18]; // Total: 180mm
      const totalColWidth = colWidths.reduce((sum, width) => sum + width, 0);
      const headers = ['#', 'Name', 'Email', 'Institution', 'Phone', 'Status'];
      
      // Helper function to fit text within column width at given font size
      const fitTextInColumn = (text: string, colWidth: number, fontSize: number) => {
        if (!text || text === 'N/A') return text || 'N/A';
        
        const maxWidth = colWidth - 4; // 4mm total padding (2mm each side)
        let truncatedText = text;
        
        while (doc.getStringUnitWidth(truncatedText) * fontSize / doc.internal.scaleFactor > maxWidth) {
          if (truncatedText.length <= 4) break;
          truncatedText = truncatedText.substring(0, truncatedText.length - 4) + '...';
        }
        
        return truncatedText;
      };
      
      // Table header background with better styling
      doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      doc.roundedRect(margin, tableStartY, totalColWidth, rowHeight + 3, 2, 2, 'F');
      
      // Table headers with improved typography
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      
      let xPos = margin;
      headers.forEach((header, index) => {
        if (index === 0 || index === 5) {
          // Center align # and Status headers
          const colCenter = xPos + (colWidths[index] / 2);
          doc.text(header, colCenter, tableStartY + 7.5, { align: 'center' });
        } else {
          // Left align other headers with padding
          doc.text(header, xPos + 2, tableStartY + 7.5);
        }
        xPos += colWidths[index];
      });
      
      // Table border
      doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      doc.setLineWidth(1);
      doc.rect(margin, tableStartY, totalColWidth, rowHeight + 3);
      
      // Function to add page header on new pages
      const addPageHeader = (pageNum: number, totalPages: number) => {
        // Dark background
        doc.setFillColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');

        // Add decorative circles
        doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
        doc.circle(pageWidth - 30, 30, 20, 'F');
        
        doc.setFillColor(colors.blue[0], colors.blue[1], colors.blue[2]);
        doc.circle(30, pageHeight - 30, 15, 'F');

        // Header section
        doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
        doc.roundedRect(margin, margin, contentWidth, 25, 6, 6, 'F');

        // Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        doc.text('NCC ROBOTICS WORKSHOP 2025', pageWidth / 2, margin + 10, { align: 'center' });

        // Page info
        doc.setFontSize(8);
        doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        doc.text(`Page ${pageNum} of ${totalPages} | User Verification Report`, pageWidth / 2, margin + 18, { align: 'center' });

        // Table header
        const newTableStartY = margin + 35;
        doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
        doc.roundedRect(margin, newTableStartY, totalColWidth, rowHeight + 3, 2, 2, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        
        let xPos = margin;
        headers.forEach((header, index) => {
          if (index === 0 || index === 5) {
            const colCenter = xPos + (colWidths[index] / 2);
            doc.text(header, colCenter, newTableStartY + 7.5, { align: 'center' });
          } else {
            doc.text(header, xPos + 2, newTableStartY + 7.5);
          }
          xPos += colWidths[index];
        });
        
        doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
        doc.setLineWidth(1);
        doc.rect(margin, newTableStartY, totalColWidth, rowHeight + 3);

        return newTableStartY;
      };

      // Calculate rows per page dynamically and total pages
      const maxRowsPerPage = Math.floor((pageHeight - tableStartY - 70) / rowHeight);
      const totalPages = Math.ceil(exportUsers.length / maxRowsPerPage);
      console.log(`Max rows per page: ${maxRowsPerPage}`);
      console.log(`Total users to export: ${exportUsers.length}`);
      console.log(`Total pages needed: ${totalPages}`);
      
      // Paginate through all users
      let currentPage = 1;
      let currentTableStartY = tableStartY;
      let userIndex = 0;
      let rowsOnCurrentPage = 0;
      
      // Table rows with improved formatting and pagination
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      
      while (userIndex < exportUsers.length) {
        const user = exportUsers[userIndex];
        
        // Check if we need a new page
        if (rowsOnCurrentPage >= maxRowsPerPage && userIndex < exportUsers.length) {
          // Add new page
          doc.addPage();
          currentPage++;
          currentTableStartY = addPageHeader(currentPage, totalPages);
          rowsOnCurrentPage = 0;
          console.log(`Added page ${currentPage} for user ${userIndex + 1}`);
        }
        
        const yPos = currentTableStartY + rowHeight + 3 + (rowsOnCurrentPage * rowHeight);
        
        // Alternate row background with better contrast
        if (rowsOnCurrentPage % 2 === 0) {
          doc.setFillColor(colors.cardBg[0], colors.cardBg[1], colors.cardBg[2]);
        } else {
          doc.setFillColor(30, 41, 59); // slate-800
        }
        doc.rect(margin, yPos, totalColWidth, rowHeight, 'F');
        
        // Row border (subtle horizontal line)
        doc.setDrawColor(71, 85, 105);
        doc.setLineWidth(0.2);
        doc.line(margin, yPos + rowHeight, margin + totalColWidth, yPos + rowHeight);
        
        // Column separators with proper height
        doc.setDrawColor(71, 85, 105);
        doc.setLineWidth(0.3);
        let separatorX = margin;
        colWidths.forEach((width, colIndex) => {
          separatorX += width;
          if (colIndex < colWidths.length - 1) {
            doc.line(separatorX, currentTableStartY, separatorX, yPos + rowHeight);
          }
        });
        
        // Row data with improved text fitting and alignment
        let dataXPos = margin;
        const rawData = [
          (userIndex + 1).toString(), // Use global userIndex for continuous numbering
          user.name || 'N/A',
          user.email || 'N/A',
          user.institution || 'N/A',
          user.phone || 'N/A',
          (user.status || 'pending').toUpperCase()
        ];
        
        rawData.forEach((data, colIndex) => {
          const fittedData = fitTextInColumn(data, colWidths[colIndex], 8);
          
          if (colIndex === 0 || colIndex === 5) {
            // Center align # and Status columns
            const colCenter = dataXPos + (colWidths[colIndex] / 2);
            doc.text(fittedData, colCenter, yPos + 6.5, { align: 'center' });
          } else {
            // Left align other columns with proper padding
            doc.text(fittedData, dataXPos + 2, yPos + 6.5);
          }
          dataXPos += colWidths[colIndex];
        });
        
        userIndex++;
        rowsOnCurrentPage++;
      }

      // Final table border for the last page
      doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      doc.setLineWidth(1);
      const finalTableHeight = (rowsOnCurrentPage * rowHeight) + rowHeight + 3;
      doc.rect(margin, currentTableStartY, totalColWidth, finalTableHeight);

      // Table summary on the last page
      const tableEndY = currentTableStartY + (rowsOnCurrentPage * rowHeight) + rowHeight + 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(colors.lightText[0], colors.lightText[1], colors.lightText[2]);
      
      doc.text(`All ${exportUsers.length} registered users shown across ${currentPage} page${currentPage > 1 ? 's' : ''}`, margin, tableEndY);
      
      console.log(`PDF generation completed: ${exportUsers.length} users across ${currentPage} pages`);

      // Footer section
      const footerY = pageHeight - 30;
      
      // Footer background
      doc.setFillColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.rect(0, footerY - 5, pageWidth, 40, 'F');
      
      // Decorative accent line
      doc.setDrawColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      doc.setLineWidth(2);
      doc.line(15, footerY, pageWidth - 15, footerY);

      // Footer content
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(colors.accent[0], colors.accent[1], colors.accent[2]);
      doc.text('NCC ROBOTICS WORKSHOP 2025', pageWidth / 2, footerY + 10, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(colors.lightText[0], colors.lightText[1], colors.lightText[2]);
      doc.text('Generated by Admin Panel', 15, footerY + 18);
      doc.text(`Export Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 15, footerY + 25);
      doc.text(`Total Registered Users: ${totalUsers}`, pageWidth - 80, footerY + 18);
      doc.text(`Report Generated at: ${new Date().toLocaleString()}`, pageWidth - 80, footerY + 25);

      // Save with descriptive filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `NCC_Robotics_Users_Report_${timestamp}_${totalUsers}users.pdf`;
      
      console.log('Saving PDF:', filename);
      doc.save(filename);
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success(`PDF exported successfully! (${totalUsers} users included)`, {
        duration: 4000
      });
      
      console.log('PDF export completed successfully');
      
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      });
      
      // Dismiss loading toast if it exists
      if (loadingToast) {
        toast.dismiss(loadingToast);
      }
      
      // Try simple fallback PDF generation
      try {
        console.log('Attempting fallback PDF generation...');
        
        const doc = new jsPDF();
        
        // Simple header
        doc.setFontSize(20);
        doc.text('NCC ROBOTICS WORKSHOP 2025', 20, 20);
        doc.setFontSize(14);
        doc.text('Registered Users Report', 20, 30);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 40);
        doc.text(`Total Users: ${exportUsers.length}`, 20, 50);
        
        // Simple list of users
        let yPos = 70;
        doc.setFontSize(8);
        
        exportUsers.slice(0, 30).forEach((user, index) => {
          if (yPos > 280) { // Start new page if needed
            doc.addPage();
            yPos = 20;
          }
          
          const userLine = `${index + 1}. ${user.name || 'N/A'} - ${user.email || 'N/A'} - ${user.status || 'pending'}`;
          doc.text(userLine.substring(0, 80), 20, yPos); // Truncate to fit
          yPos += 8;
        });
        
        const filename = `NCC_Users_Simple_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
        
        toast.success(`PDF exported successfully (${exportUsers.length} users) - Simple format`);
        
      } catch (fallbackError: any) {
        console.error('Fallback PDF generation also failed:', fallbackError);
        toast.error(`Failed to export PDF: ${error?.message || 'Unknown error'}`);
      }
    }
  };

  const updateUserRole = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      // Update user role in Appwrite
      await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        {
          role: newRole
        }
      );
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      toast.success(`User role updated to ${newRole}!`);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const updateUserPaymentStatus = async (userId: string, registrationId: string, newPaymentStatus: string) => {
    try {
      if (!registrationId) {
        toast.error('No registration found for this user');
        return;
      }
      
      // Update payment status in registration document
      await databases.updateDocument(
        DATABASE_ID,
        REGISTRATIONS_COLLECTION_ID,
        registrationId,
        {
          paymentStatus: newPaymentStatus
        }
      );
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, paymentStatus: newPaymentStatus as any } : user
      ));
      toast.success(`Payment status updated to ${newPaymentStatus}!`);
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    }
  };

  const updateUserRegistrationStatus = async (userId: string, registrationId: string, newStatus: string) => {
    try {
      if (!registrationId) {
        toast.error('No registration found for this user');
        return;
      }
      
      // Update status in registration document
      await databases.updateDocument(
        DATABASE_ID,
        REGISTRATIONS_COLLECTION_ID,
        registrationId,
        {
          status: newStatus
        }
      );
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status: newStatus as any } : user
      ));
      
      toast.success(`Registration status updated to ${newStatus}!`);
      
      // If status is approved, offer to send welcome email
      if (newStatus === 'approved') {
        const user = users.find(u => u.id === userId);
        if (user) {
          // Show toast with option to send welcome email
          toast((t) => (
            <div className="flex flex-col space-y-2">
              <span className="font-medium">User approved successfully!</span>
              <span className="text-sm text-gray-600">Send welcome email to {user.name}?</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                    sendWelcomeEmail(user.email, user.name, registrationId);
                  }}
                  className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                >
                  Send Email
                </button>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="px-3 py-1 bg-gray-400 text-white text-sm rounded hover:bg-gray-500 transition-colors"
                >
                  Skip
                </button>
              </div>
            </div>
          ), {
            duration: 10000,
            position: 'top-center',
          });
        }
      }
    } catch (error) {
      console.error('Error updating registration status:', error);
      toast.error('Failed to update registration status');
    }
  };

  const sendWelcomeEmail = async (email: string, name: string, registrationId: string) => {
    try {
      const loadingToast = toast.loading('Sending welcome email...');
      
      const response = await fetch('/api/send-welcome-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          registrationId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send welcome email');
      }

      const result = await response.json();
      toast.dismiss(loadingToast);
      toast.success(`Welcome email sent successfully to ${name}!`, {
        duration: 5000,
        icon: '📧',
      });
      
      console.log('Welcome email sent:', result);
    } catch (error: any) {
      console.error('Error sending welcome email:', error);
      toast.error(`Failed to send welcome email: ${error.message}`);
    }
  };

  const viewUserImage = async (fileId: string, bucketId: string, title: string) => {
    try {
      console.log(`Attempting to view ${title}:`, { fileId, bucketId });
      
      if (!fileId) {
        console.warn(`No fileId provided for ${title}`);
        toast.error(`No ${title.toLowerCase()} uploaded for this user`);
        return;
      }
      
      if (!bucketId) {
        console.error(`No bucketId provided for ${title}`);
        toast.error(`Configuration error: Missing bucket ID`);
        return;
      }
      
      console.log(`Getting file preview for ${title}...`);
      
      // Get file preview URL
      const fileUrl = storage.getFilePreview(bucketId, fileId);
      
      console.log(`Generated preview URL:`, fileUrl.toString());
      
      // Show in modal instead of new window
      setCurrentImageUrl(fileUrl.toString());
      setCurrentImageTitle(title);
      setShowImageModal(true);
      
      toast.success(`${title} loaded successfully`);
    } catch (error: any) {
      console.error(`Error viewing ${title}:`, error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        type: error?.type,
        fileId,
        bucketId
      });
      
      if (error?.message?.includes('permission')) {
        toast.error(`Permission denied: Unable to access ${title.toLowerCase()}`);
      } else if (error?.message?.includes('document')) {
        toast.error(`File not found: ${title} may have been deleted`);
      } else {
        toast.error(`Failed to view ${title}: ${error?.message || 'Unknown error'}`);
      }
    }
  };

  const viewUserDashboard = async (user: User) => {
    try {
      console.log('Loading user dashboard for:', user.name, user.email);
      setSelectedUser(user);
      
      // Fetch user profile
      const userProfileData = await databases.getDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        user.id
      );
      
      setSelectedUserData(userProfileData);
      
      // Fetch user registration
      const registrationsResponse = await databases.listDocuments(
        DATABASE_ID,
        REGISTRATIONS_COLLECTION_ID,
        [Query.equal("userId", user.id)]
      );
      
      let registration = null;
      if (registrationsResponse.documents.length > 0) {
        registration = registrationsResponse.documents[0];
        
        // Parse JSON strings
        try {
          registration.parsedPersonalInfo = JSON.parse(registration.personalInfo);
        } catch (err) {
          registration.parsedPersonalInfo = {
            fullName: user.name,
            email: user.email,
            phone: '',
            institution: '',
            studentId: '',
            emergencyContact: ''
          };
        }
        
        try {
          registration.parsedDocuments = JSON.parse(registration.documents);
        } catch (err) {
          registration.parsedDocuments = {};
        }
        
        // Merge user profile file IDs with registration data for comprehensive document checking
        // Priority: 1. User profile file IDs, 2. Registration file IDs, 3. Parsed documents
        const studentIdFileId = userProfileData.studentIdFileId || registration.studentIdFileId || registration.parsedDocuments?.studentId;
        const paymentScreenshotFileId = userProfileData.paymentScreenshotFileId || registration.paymentScreenshotFileId || registration.parsedDocuments?.paymentScreenshot;
        
        // Update registration object with merged file IDs
        registration.studentIdFileId = studentIdFileId;
        registration.paymentScreenshotFileId = paymentScreenshotFileId;
        
        // Get document URLs like in user page
        if (studentIdFileId) {
          try {
            registration.studentIdUrl = storage.getFilePreview(STUDENT_ID_BUCKET_ID, studentIdFileId, 2000, 2000, 'center', 100).href;
          } catch (err) {
            console.error('Error getting student ID URL:', err);
          }
        }
        
        if (paymentScreenshotFileId) {
          try {
            registration.paymentScreenshotUrl = storage.getFilePreview(PAYMENT_SCREENSHOT_BUCKET_ID, paymentScreenshotFileId, 2000, 2000, 'center', 100).href;
          } catch (err) {
            console.error('Error getting payment screenshot URL:', err);
          }
        }
      }
      
      setSelectedUserRegistration(registration);
      setShowUserDashboard(true);
      
      // Add detailed logging for debugging document display
      console.log('=== USER DASHBOARD DEBUG ===');
      console.log('User:', user.name);
      console.log('User Profile Data:', userProfileData);
      console.log('Registration data:', registration);
      console.log('Student ID File ID (merged):', registration?.studentIdFileId);
      console.log('Payment Screenshot File ID (merged):', registration?.paymentScreenshotFileId);
      console.log('User Profile studentIdFileId:', userProfileData?.studentIdFileId);
      console.log('User Profile paymentScreenshotFileId:', userProfileData?.paymentScreenshotFileId);
      console.log('Parsed Documents:', registration?.parsedDocuments);
      console.log('Student ID URL:', registration?.studentIdUrl);
      console.log('Payment Screenshot URL:', registration?.paymentScreenshotUrl);
      console.log('=== END DEBUG ===');
      
      toast.success(`Loaded dashboard for ${user.name}`);
    } catch (error) {
      console.error('Error loading user dashboard:', error);
      toast.error('Failed to load user dashboard');
    }
  };

  const createAnnouncement = async (announcement: Omit<Announcement, 'id' | 'date'>) => {
    try {
      // Create announcement in Appwrite
      const newAnnouncement = await databases.createDocument(
        DATABASE_ID,
        ANNOUNCEMENTS_COLLECTION_ID,
        ID.unique(),
        {
          title: announcement.title,
          content: announcement.content,
          type: announcement.type,
          createdBy: user?.$id || '',
          isActive: true
        }
      );
      
      // Convert to local format and add to state
      const formattedAnnouncement: Announcement = {
        id: newAnnouncement.$id,
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        type: newAnnouncement.type,
        date: newAnnouncement.$createdAt?.split('T')[0] || new Date().toISOString().split('T')[0]
      };
      
      setAnnouncements(prev => [formattedAnnouncement, ...prev]);
      toast.success('Announcement created successfully!');
      setShowAnnouncementModal(false);
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast.error('Failed to create announcement');
    }
  };

  const uploadResource = async (resource: Omit<Resource, 'id' | 'uploadDate'>) => {
    try {
      console.log('Starting resource upload...', { 
        title: resource.title, 
        type: resource.type, 
        hasFile: !!resource.file,
        fileName: resource.file?.name,
        fileSize: resource.file?.size
      });
      
      let fileUrl = resource.url || '';
      let fileId = '';
      
      // If a file is provided, upload it to Appwrite Storage
      if (resource.file) {
        try {
          console.log('Uploading file to bucket:', RESOURCES_BUCKET_ID);
          
          const fileUpload = await storage.createFile(
            RESOURCES_BUCKET_ID,
            ID.unique(),
            resource.file
          );
          
          fileId = fileUpload.$id;
          console.log('File uploaded with ID:', fileId);
          
          // Get file view URL (for downloads)
          try {
            fileUrl = storage.getFileView(RESOURCES_BUCKET_ID, fileUpload.$id).href;
            console.log('Generated file URL:', fileUrl);
          } catch (urlError) {
            console.warn('Failed to generate file URL, using file ID instead:', urlError);
            fileUrl = `${RESOURCES_BUCKET_ID}/${fileUpload.$id}`;
          }
          
          console.log('File uploaded successfully:', { fileId, fileUrl });
        } catch (fileError: any) {
          console.error('Error uploading file:', fileError);
          
          // Provide more specific error messages
          if (fileError?.message?.includes('permission')) {
            toast.error('Permission denied: Check bucket permissions for admin users');
          } else if (fileError?.message?.includes('size')) {
            toast.error('File too large: Maximum file size exceeded');
          } else if (fileError?.message?.includes('type')) {
            toast.error('Invalid file type: Please check allowed file types');
          } else {
            toast.error(`File upload failed: ${fileError?.message || 'Unknown error'}`);
          }
          return;
        }
      }
      
      console.log('Creating resource document...');
      
      // Create resource document in Appwrite
      const newResource = await databases.createDocument(
        DATABASE_ID,
        RESOURCES_COLLECTION_ID,
        ID.unique(),
        {
          title: resource.title,
          description: resource.description,
          type: resource.type,
          url: fileUrl,
          fileId: fileId,
          createdBy: user?.$id || 'admin',
          isActive: true,
          fileSize: resource.file?.size || 0,
          downloadCount: 0
        }
      );
      
      console.log('Resource document created:', newResource.$id);
      
      // Convert to local format and add to state
      const formattedResource: Resource = {
        id: newResource.$id,
        title: newResource.title,
        description: newResource.description,
        type: newResource.type,
        url: newResource.url,
        uploadDate: newResource.$createdAt?.split('T')[0] || new Date().toISOString().split('T')[0]
      };
      
      setResources(prev => [formattedResource, ...prev]);
      toast.success('Resource uploaded successfully!');
      setShowResourceModal(false);
    } catch (error: any) {
      console.error('Error uploading resource:', error);
      
      // Provide specific error messages based on the error type
      if (error?.message?.includes('permission')) {
        toast.error('Permission denied: Admin access required for resource uploads');
      } else if (error?.message?.includes('collection')) {
        toast.error('Database error: Resources collection not found or inaccessible');
      } else if (error?.message?.includes('network')) {
        toast.error('Network error: Please check your internet connection');
      } else {
        toast.error(`Failed to upload resource: ${error?.message || 'Unknown error occurred'}`);
      }
    }
  };

  const deleteAnnouncement = async (announcementId: string) => {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        ANNOUNCEMENTS_COLLECTION_ID,
        announcementId
      );
      
      setAnnouncements(prev => prev.filter(ann => ann.id !== announcementId));
      toast.success('Announcement deleted successfully!');
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement');
    }
  };

  const editAnnouncement = async (announcementId: string, updatedData: Omit<Announcement, 'id' | 'date'>) => {
    try {
      // Update announcement in Appwrite
      const updatedAnnouncement = await databases.updateDocument(
        DATABASE_ID,
        ANNOUNCEMENTS_COLLECTION_ID,
        announcementId,
        {
          title: updatedData.title,
          content: updatedData.content,
          type: updatedData.type
        }
      );
      
      // Convert to local format and update state
      const formattedAnnouncement: Announcement = {
        id: updatedAnnouncement.$id,
        title: updatedAnnouncement.title,
        content: updatedAnnouncement.content,
        type: updatedAnnouncement.type,
        date: updatedAnnouncement.$createdAt?.split('T')[0] || new Date().toISOString().split('T')[0]
      };
      
      setAnnouncements(prev => prev.map(ann => 
        ann.id === announcementId ? formattedAnnouncement : ann
      ));
      toast.success('Announcement updated successfully!');
      setEditingAnnouncement(null);
    } catch (error) {
      console.error('Error updating announcement:', error);
      toast.error('Failed to update announcement');
    }
  };

  const deleteResource = async (resourceId: string) => {
    try {
      // Get resource details first to get file ID
      const resourceDoc = await databases.getDocument(
        DATABASE_ID,
        RESOURCES_COLLECTION_ID,
        resourceId
      );
      
      // Delete file from storage if it exists
      if (resourceDoc.fileId) {
        try {
          await storage.deleteFile(RESOURCES_BUCKET_ID, resourceDoc.fileId);
          console.log('File deleted from storage');
        } catch (fileError) {
          console.error('Error deleting file from storage:', fileError);
          // Continue with document deletion even if file deletion fails
        }
      }
      
      // Delete resource document
      await databases.deleteDocument(
        DATABASE_ID,
        RESOURCES_COLLECTION_ID,
        resourceId
      );
      
      setResources(prev => prev.filter(res => res.id !== resourceId));
      toast.success('Resource deleted successfully!');
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource');
    }
  };

  // Utility functions for status
  const getStatusClass = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'approved':
      case 'verified':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'pending_verification':
      case 'verification_pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'approved':
      case 'verified':
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
      case 'pending_verification':
      case 'verification_pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'rejected':
      case 'failed':
        return <X className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
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
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-600/5 rounded-full blur-3xl" />
      </div>

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none pt-32">
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 left-20 w-32 h-32 opacity-5"
        >
          <Settings className="w-full h-full text-yellow-500" />
        </motion.div>
        <motion.div
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-20 right-20 w-24 h-24 opacity-5"
        >
          <Users className="w-full h-full text-yellow-500" />
        </motion.div>
        
        {/* Large Background Text */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center z-0 pt-32"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
        >
          <motion.h1 
            className="text-[8rem] md:text-[12rem] lg:text-[16rem] font-black leading-none tracking-tighter select-none pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
          >
            <span className="block bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent opacity-5">ADMIN</span>
            <span className="block bg-gradient-to-r from-blue-400 to-cyan-600 bg-clip-text text-transparent opacity-5 -mt-8">PANEL</span>
          </motion.h1>
        </motion.div>
      </div>

      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pt-24 sm:pt-28 lg:pt-32 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gray-900 rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border-2 border-gray-700 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-4">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
              </div>
              <div className="absolute bottom-4 left-4">
                <Settings className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-400" />
              </div>
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
                <div className="flex-1">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl sm:rounded-2xl mb-4 sm:mb-6"
                  >
                    <Shield className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-black" />
                  </motion.div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-2 sm:mb-4 uppercase tracking-wider">
                    Admin <span className="text-yellow-400">Control Panel</span>
                  </h1>
                  <p className="text-gray-400 font-medium text-sm sm:text-base lg:text-lg">
                    Manage users, announcements, and workshop resources
                  </p>
                </div>
                
                {/* Action Buttons - Responsive */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                  <motion.button
                    onClick={() => router.push('/admin/verify-all')}
                    className="group relative w-full sm:w-auto"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative bg-gradient-to-r from-blue-400 to-blue-500 text-white font-black py-3 px-4 sm:px-6 rounded-xl flex items-center justify-center transition-all duration-300 uppercase tracking-wider shadow-lg shadow-blue-500/30">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      <span className="hidden sm:inline">All Verifications</span>
                      <span className="sm:hidden">Verify All</span>
                    </div>
                  </motion.button>
                  
                  <motion.button
                    onClick={() => router.push('/admin/payment-warnings')}
                    className="group relative w-full sm:w-auto"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative bg-gradient-to-r from-red-500 to-orange-500 text-white font-black py-3 px-4 sm:px-6 rounded-xl flex items-center justify-center transition-all duration-300 uppercase tracking-wider shadow-lg shadow-red-500/30">
                      <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      <span className="hidden sm:inline">Payment Warnings</span>
                      <span className="sm:hidden">Warnings</span>
                    </div>
                  </motion.button>
                  
                  <motion.button
                    onClick={exportUsersPDF}
                    className="group relative w-full sm:w-auto"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-black py-3 px-4 sm:px-6 rounded-xl flex items-center justify-center transition-all duration-300 uppercase tracking-wider shadow-lg shadow-yellow-500/30">
                      <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      <span className="hidden sm:inline">Export Themed PDF</span>
                      <span className="sm:hidden">Export PDF</span>
                    </div>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <motion.div 
              className="bg-gray-900 rounded-2xl shadow-2xl p-6 border-2 border-gray-700 relative overflow-hidden"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10" />
              <div className="relative z-10">
                <div className="flex items-center">
                  <motion.div 
                    className="p-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl"
                    initial={{ rotate: -180 }}
                    animate={{ rotate: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <Users className="w-6 h-6 text-white" />
                  </motion.div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Users</p>
                    <motion.p 
                      className="text-2xl font-black text-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: "spring" }}
                    >
                      {stats.totalUsers}
                    </motion.p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-gray-900 rounded-2xl shadow-2xl p-6 border-2 border-gray-700 relative overflow-hidden"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/10" />
              <div className="relative z-10">
                <div className="flex items-center">
                  <motion.div 
                    className="p-3 bg-gradient-to-r from-green-400 to-green-500 rounded-xl"
                    initial={{ rotate: -180 }}
                    animate={{ rotate: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    <CheckCircle className="w-6 h-6 text-white" />
                  </motion.div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Approved</p>
                    <motion.p 
                      className="text-2xl font-black text-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring" }}
                    >
                      {stats.approvedUsers}
                    </motion.p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-gray-900 rounded-2xl shadow-2xl p-6 border-2 border-gray-700 relative overflow-hidden"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-yellow-600/10" />
              <div className="relative z-10">
                <div className="flex items-center">
                  <motion.div 
                    className="p-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl"
                    initial={{ rotate: -180 }}
                    animate={{ rotate: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    <Clock className="w-6 h-6 text-black" />
                  </motion.div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Pending</p>
                    <motion.p 
                      className="text-2xl font-black text-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6, type: "spring" }}
                    >
                      {stats.pendingUsers}
                    </motion.p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-gray-900 rounded-2xl shadow-2xl p-6 border-2 border-gray-700 relative overflow-hidden"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/10" />
              <div className="relative z-10">
                <div className="flex items-center">
                  <motion.div 
                    className="p-3 bg-gradient-to-r from-purple-400 to-purple-500 rounded-xl"
                    initial={{ rotate: -180 }}
                    animate={{ rotate: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                  >
                    <FileText className="w-6 h-6 text-white" />
                  </motion.div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Documents to Review</p>
                    <motion.p 
                      className="text-2xl font-black text-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7, type: "spring" }}
                    >
                      {stats.documentsToReview}
                    </motion.p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900 rounded-3xl shadow-2xl mb-8 border-2 border-gray-700 relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 right-4">
              <BarChart3 className="w-8 h-8 text-yellow-400" />
            </div>
            <div className="absolute bottom-4 left-4">
              <Settings className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          
          <div className="relative z-10">
            <div className="border-b border-gray-700">
              {/* Desktop Navigation */}
              <nav className="hidden lg:flex space-x-8 px-8 py-4">
                {[
                  { id: 'users', label: 'Users', icon: Users },
                  { id: 'announcements', label: 'Announcements', icon: Bell },
                  { id: 'resources', label: 'Resources', icon: Upload },
                  { id: 'stats', label: 'Statistics', icon: BarChart3 },
                  { id: 'management', label: 'User Management', icon: Settings }
                ].map(({ id, label, icon: Icon }, index) => (
                  <motion.button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`flex items-center py-4 px-4 border-b-2 font-black text-sm uppercase tracking-wider transition-all duration-300 ${
                      activeTab === id
                        ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10 rounded-t-xl'
                        : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600 hover:bg-gray-800/50 rounded-t-xl'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      initial={{ rotate: 0 }}
                      animate={{ rotate: activeTab === id ? 360 : 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className="w-5 h-5 mr-2" />
                    </motion.div>
                    {label}
                  </motion.button>
                ))}
              </nav>
              
              {/* Mobile/Tablet Navigation */}
              <nav className="lg:hidden px-4 py-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'users', label: 'Users', icon: Users, shortLabel: 'Users' },
                    { id: 'announcements', label: 'Announcements', icon: Bell, shortLabel: 'News' },
                    { id: 'resources', label: 'Resources', icon: Upload, shortLabel: 'Files' },
                    { id: 'stats', label: 'Statistics', icon: BarChart3, shortLabel: 'Stats' },
                    { id: 'management', label: 'User Management', icon: Settings, shortLabel: 'Manage' }
                  ].map(({ id, label, shortLabel, icon: Icon }, index) => (
                    <motion.button
                      key={id}
                      onClick={() => setActiveTab(id as any)}
                      className={`flex flex-col sm:flex-row items-center justify-center sm:justify-start p-3 sm:p-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 ${
                        activeTab === id
                          ? 'bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500/50'
                          : 'bg-gray-800/50 text-gray-400 border-2 border-gray-700 hover:text-gray-200 hover:border-gray-600 hover:bg-gray-800'
                      }`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.div
                        initial={{ rotate: 0 }}
                        animate={{ rotate: activeTab === id ? 360 : 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-1 sm:mb-0 sm:mr-2"
                      >
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </motion.div>
                      <span className="hidden sm:inline">{label}</span>
                      <span className="sm:hidden">{shortLabel}</span>
                    </motion.button>
                  ))}
                </div>
              </nav>
            </div>

            <div className="p-4 sm:p-6 lg:p-8">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'users' && (
                  <UsersTab
                    users={filteredUsers}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    onUpdateStatus={updateUserStatus}
                    onUpdateUserRole={updateUserRole}
                    onUpdatePaymentStatus={updateUserPaymentStatus}
                    onUpdateRegistrationStatus={updateUserRegistrationStatus}
                    onViewUserImage={viewUserImage}
                    onViewUserDashboard={viewUserDashboard}
                    onSendWelcomeEmail={sendWelcomeEmail}
                  />
                )}
                
                {activeTab === 'announcements' && (
                  <AnnouncementsTab
                    announcements={announcements}
                    onCreateAnnouncement={() => setShowAnnouncementModal(true)}
                    onEditAnnouncement={setEditingAnnouncement}
                    onDeleteAnnouncement={deleteAnnouncement}
                  />
                )}
                
                {activeTab === 'resources' && (
                  <ResourcesTab
                    resources={resources}
                    onUploadResource={() => setShowResourceModal(true)}
                    onDeleteResource={deleteResource}
                  />
                )}
                
                {activeTab === 'stats' && (
                  <StatsTab users={users} />
                )}
                
                {activeTab === 'management' && (
                  <UserManagementTab
                    users={users}
                    onUpdateUserRole={updateUserRole}
                  />
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      {showAnnouncementModal && (
        <AnnouncementModal
          onClose={() => setShowAnnouncementModal(false)}
          onSubmit={createAnnouncement}
        />
      )}
      
      {editingAnnouncement && (
        <AnnouncementModal
          onClose={() => setEditingAnnouncement(null)}
          onSubmit={(updatedData) => editAnnouncement(editingAnnouncement.id, updatedData)}
          initialData={editingAnnouncement}
          isEditing={true}
        />
      )}
      
      {showResourceModal && (
        <ResourceModal
          onClose={() => setShowResourceModal(false)}
          onSubmit={uploadResource}
        />
      )}
      
      {/* Image Preview Modal */}
      {showImageModal && currentImageUrl && (
        <motion.div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-gray-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border-2 border-gray-700"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
          >
            <div className="p-6 border-b border-gray-700 flex items-center justify-between bg-gray-800">
              <motion.h3 
                className="text-xl font-black text-white uppercase tracking-wider"
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {currentImageTitle}
              </motion.h3>
              <motion.button
                onClick={() => setShowImageModal(false)}
                className="text-gray-400 hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-gray-700"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>
            <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-black">
              <motion.img
                src={currentImageUrl}
                alt={currentImageTitle}
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                onError={(e) => {
                  console.error('Image failed to load:', currentImageUrl);
                  toast.error('Failed to load image');
                }}
              />
            </div>
            <div className="p-6 border-t border-gray-700 bg-gray-800 flex justify-between">
              <motion.button
                onClick={() => window.open(currentImageUrl, '_blank')}
                className="group relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-blue-400 to-blue-500 text-white font-black py-3 px-6 rounded-xl flex items-center transition-all duration-300 uppercase tracking-wider">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in New Tab
                </div>
              </motion.button>
              <motion.button
                onClick={() => setShowImageModal(false)}
                className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-black uppercase tracking-wider"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {/* User Dashboard Modal */}
      {showUserDashboard && selectedUserRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-black rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col shadow-2xl border-2 border-gray-700">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-700 flex items-center justify-between bg-gray-900">
              <div className="flex items-center">
                <Eye className="w-6 h-6 text-yellow-400 mr-3" />
                <h3 className="text-xl font-bold text-white">User Dashboard - {selectedUserData?.name}</h3>
              </div>
              <button
                onClick={() => setShowUserDashboard(false)}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-auto bg-black text-white">
              <div className="p-6">
                {/* Background Effects */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-yellow-600/10" />
                  <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-yellow-400/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '3s' }} />
                </div>

                {/* Welcome Section */}
                <div className="mb-8 relative z-10">
                  <div className="bg-gray-900 rounded-3xl shadow-2xl p-8 border-2 border-gray-700 relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-4 right-4">
                        <Bot className="w-8 h-8 text-yellow-400" />
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <Shield className="w-6 h-6 text-yellow-400" />
                      </div>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl mb-6">
                            <User className="w-8 h-8 text-black" />
                          </div>
                          <h1 className="text-4xl font-black text-white mb-4 uppercase tracking-wider">
                            User Dashboard: <span className="text-yellow-400">{selectedUserData?.name}!</span>
                          </h1>
                          <p className="text-gray-400 font-medium text-lg">
                            {selectedUserData?.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column - Profile & Registration */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* Profile Information */}
                    <div className="bg-gray-900 rounded-3xl shadow-2xl p-8 border-2 border-gray-700 relative overflow-hidden">
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-4 right-4">
                          <User className="w-8 h-8 text-yellow-400" />
                        </div>
                        <div className="absolute bottom-4 left-4">
                          <Settings className="w-6 h-6 text-yellow-400" />
                        </div>
                      </div>
                      
                      <div className="relative z-10">
                        <h2 className="text-3xl font-black text-white flex items-center mb-8 uppercase tracking-wider">
                          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl mr-4">
                            <User className="w-6 h-6 text-black" />
                          </div>
                          Profile <span className="text-yellow-400">Information</span>
                        </h2>
                        
                        {/* Profile Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase tracking-wider">Full Name</label>
                              <div className="bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white font-medium">
                                {selectedUserData?.name || 'Not provided'}
                              </div>
                            </div>
                            <div>
                              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase tracking-wider">Email</label>
                              <div className="bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white font-medium">
                                {selectedUserData?.email || 'Not provided'}
                              </div>
                            </div>
                            <div>
                              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase tracking-wider">Phone</label>
                              <div className="bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white font-medium">
                                {selectedUserRegistration?.parsedPersonalInfo?.phone || selectedUserData?.phone || 'Not provided'}
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase tracking-wider">Institution</label>
                              <div className="bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white font-medium">
                                {selectedUserRegistration?.parsedPersonalInfo?.institution || selectedUserData?.institution || 'Not provided'}
                              </div>
                            </div>
                            <div>
                              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase tracking-wider">Student ID</label>
                              <div className="bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white font-medium">
                                {selectedUserRegistration?.parsedPersonalInfo?.studentId || selectedUserData?.studentId || 'Not provided'}
                              </div>
                            </div>
                            <div>
                              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase tracking-wider">Emergency Contact</label>
                              <div className="bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white font-medium">
                                {selectedUserRegistration?.parsedPersonalInfo?.emergencyContact || 'Not provided'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Registration Status */}
                    <div className="bg-gray-900 rounded-3xl shadow-2xl p-8 border-2 border-gray-700 relative overflow-hidden">
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-4 right-4">
                          <Calendar className="w-8 h-8 text-yellow-400" />
                        </div>
                        <div className="absolute bottom-4 left-4">
                          <CheckCircle className="w-6 h-6 text-yellow-400" />
                        </div>
                      </div>
                      
                      <div className="relative z-10">
                        <h2 className="text-3xl font-black text-white flex items-center mb-8 uppercase tracking-wider">
                          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl mr-4">
                            <Calendar className="w-6 h-6 text-black" />
                          </div>
                          Registration <span className="text-yellow-400">Status</span>
                        </h2>
                        
                        <div className="space-y-6">
                          <div className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-2xl border-2 border-blue-500/30">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                {getStatusIcon(selectedUserRegistration?.status)}
                                <div className="ml-4">
                                  <h3 className="font-black text-blue-300 text-lg uppercase tracking-wider">
                                    Registration {(selectedUserRegistration?.status || 'unknown').charAt(0).toUpperCase() + (selectedUserRegistration?.status || 'unknown').slice(1)}
                                  </h3>
                                  <p className="text-blue-200 font-medium">
                                    Registration ID: <span className="text-yellow-400 font-black">{selectedUserRegistration?.registrationId || 'N/A'}</span>
                                  </p>
                                  <p className="text-blue-200 font-medium">
                                    Submitted: {selectedUserRegistration?.submittedAt ? new Date(selectedUserRegistration.submittedAt).toLocaleDateString() : 'N/A'}
                                  </p>
                                </div>
                              </div>
                              <span className={`px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wider ${getStatusClass(selectedUserRegistration?.status || 'unknown')}`}>
                                {selectedUserRegistration?.status || 'Unknown'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-2xl border-2 border-green-500/30">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                {getStatusIcon(selectedUserRegistration?.paymentStatus)}
                                <div className="ml-4">
                                  <h3 className="font-black text-green-300 text-lg uppercase tracking-wider">
                                    Payment {(selectedUserRegistration?.paymentStatus || 'unknown').charAt(0).toUpperCase() + (selectedUserRegistration?.paymentStatus || 'unknown').slice(1)}
                                  </h3>
                                  <p className="text-green-200 font-medium">
                                    {selectedUserRegistration?.registrationFee ? 
                                      `Registration Fee: ${selectedUserRegistration.registrationFee} BDT` : 
                                      'Registration Fee: 1000 BDT'
                                    }
                                  </p>
                                </div>
                              </div>
                              <span className={`px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wider ${getStatusClass(selectedUserRegistration?.paymentStatus || 'unknown')}`}>
                                {selectedUserRegistration?.paymentStatus || 'Unknown'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="p-6 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 rounded-2xl border-2 border-yellow-500/30">
                            <h3 className="font-black text-yellow-300 text-lg mb-4 uppercase tracking-wider">Event Type</h3>
                            <div className="inline-block px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black rounded-xl font-black uppercase tracking-wider shadow-lg shadow-yellow-500/30">
                              {selectedUserRegistration?.eventType || 'Unknown Event'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Document Status */}
                    <div className="bg-gray-900 rounded-3xl shadow-2xl p-8 border-2 border-gray-700 relative overflow-hidden">
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-4 right-4">
                          <FileText className="w-8 h-8 text-yellow-400" />
                        </div>
                        <div className="absolute bottom-4 left-4">
                          <Upload className="w-6 h-6 text-yellow-400" />
                        </div>
                      </div>
                      
                      <div className="relative z-10">
                        <h2 className="text-3xl font-black text-white flex items-center mb-8 uppercase tracking-wider">
                          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl mr-4">
                            <FileText className="w-6 h-6 text-black" />
                          </div>
                          Document <span className="text-yellow-400">Status</span>
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Student ID Document */}
                          <div className="border border-gray-600 rounded-md p-4 bg-gray-800/50">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-white">Student ID</h4>
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                selectedUserRegistration?.studentIdFileId
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {selectedUserRegistration?.studentIdFileId ? 'UPLOADED' : 'NOT UPLOADED'}
                              </span>
                            </div>
                            {selectedUserRegistration?.studentIdFileId && (
                              <button 
                                className="mt-2 flex items-center text-sm text-yellow-400 hover:text-yellow-300"
                                onClick={() => {
                                  if (selectedUserRegistration?.studentIdFileId) {
                                    window.open(storage.getFilePreview(STUDENT_ID_BUCKET_ID, selectedUserRegistration.studentIdFileId, 2000, 2000, 'center', 100).href, '_blank');
                                  }
                                }}
                              >
                                <Eye className="w-4 h-4 mr-1" /> View Document
                              </button>
                            )}
                            {selectedUserRegistration?.studentIdFileId && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-400">
                                  File ID: {selectedUserRegistration.studentIdFileId.substring(0, 8)}...
                                </p>
                              </div>
                            )}
                          </div>
                          
                          {/* Payment Screenshot */}
                          <div className="border border-gray-600 rounded-md p-4 bg-gray-800/50">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-white">Payment Screenshot</h4>
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                selectedUserRegistration?.paymentScreenshotFileId
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {selectedUserRegistration?.paymentScreenshotFileId ? 'UPLOADED' : 'NOT UPLOADED'}
                              </span>
                            </div>
                            {selectedUserRegistration?.paymentScreenshotFileId && (
                              <button 
                                className="mt-2 flex items-center text-sm text-yellow-400 hover:text-yellow-300"
                                onClick={() => {
                                  if (selectedUserRegistration?.paymentScreenshotFileId) {
                                    window.open(storage.getFilePreview(PAYMENT_SCREENSHOT_BUCKET_ID, selectedUserRegistration.paymentScreenshotFileId, 2000, 2000, 'center', 100).href, '_blank');
                                  }
                                }}
                              >
                                <Eye className="w-4 h-4 mr-1" /> View Document
                              </button>
                            )}
                            {selectedUserRegistration?.paymentScreenshotFileId && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-400">
                                  File ID: {selectedUserRegistration.paymentScreenshotFileId.substring(0, 8)}...
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Announcements & Resources */}
                  <div className="space-y-8">
                    {/* Announcements */}
                    <div className="bg-gray-900 rounded-3xl shadow-2xl p-8 border-2 border-gray-700 relative overflow-hidden">
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-4 right-4">
                          <Bell className="w-8 h-8 text-yellow-400" />
                        </div>
                        <div className="absolute bottom-4 left-4">
                          <Settings className="w-6 h-6 text-yellow-400" />
                        </div>
                      </div>
                      
                      <div className="relative z-10">
                        <h2 className="text-3xl font-black text-white flex items-center mb-8 uppercase tracking-wider">
                          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl mr-4">
                            <Bell className="w-6 h-6 text-black" />
                          </div>
                          <span className="text-yellow-400">Announcements</span>
                        </h2>
                        
                        <div className="space-y-6">
                          {announcements.length > 0 ? (
                            announcements.slice(0, 3).map((announcement, index) => (
                              <div key={announcement.id} className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl border-2 border-gray-600">
                                <div className="flex items-start justify-between mb-4">
                                  <h3 className="font-black text-white text-lg uppercase tracking-wider">{announcement.title}</h3>
                                  <span className={`px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wider ${
                                    announcement.type === 'info' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                    announcement.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                    announcement.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                    'bg-red-500/20 text-red-400 border border-red-500/30'
                                  }`}>
                                    {announcement.type}
                                  </span>
                                </div>
                                <p className="text-gray-300 font-medium mb-4 leading-relaxed">{announcement.content}</p>
                                <p className="text-gray-500 text-sm font-mono">{new Date(announcement.date).toLocaleString()}</p>
                              </div>
                            ))
                          ) : (
                            <div className="p-8 bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl border-2 border-gray-600">
                              <div className="text-center">
                                <Bell className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                <p className="text-gray-400 font-medium text-lg">No announcements available</p>
                                <p className="text-gray-500 text-sm mt-2">Check back later for important updates</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Resources */}
                    <div className="bg-gray-900 rounded-3xl shadow-2xl p-8 border-2 border-gray-700 relative overflow-hidden">
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-4 right-4">
                          <Download className="w-8 h-8 text-yellow-400" />
                        </div>
                        <div className="absolute bottom-4 left-4">
                          <FileText className="w-6 h-6 text-yellow-400" />
                        </div>
                      </div>
                      
                      <div className="relative z-10">
                        <h2 className="text-3xl font-black text-white flex items-center mb-8 uppercase tracking-wider">
                          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl mr-4">
                            <Download className="w-6 h-6 text-black" />
                          </div>
                          Workshop <span className="text-yellow-400">Resources</span>
                        </h2>
                        
                        <div className="space-y-6">
                          {resources.length > 0 ? (
                            resources.slice(0, 3).map((resource, index) => (
                              <div key={resource.id} className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl border-2 border-gray-600">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex-1">
                                    <h3 className="font-black text-white text-lg uppercase tracking-wider mb-2">{resource.title}</h3>
                                    <p className="text-gray-300 font-medium mb-3 leading-relaxed">{resource.description}</p>
                                    <p className="text-gray-500 text-sm font-mono">Uploaded: {new Date(resource.uploadDate).toLocaleDateString()}</p>
                                  </div>
                                  <div className="flex items-center space-x-3 ml-4">
                                    <span className={`px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wider ${
                                      resource.type === 'pdf' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                      resource.type === 'video' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                                      'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                    }`}>
                                      {resource.type}
                                    </span>
                                    {resource.url && (
                                      <button
                                        onClick={() => window.open(resource.url, '_blank')}
                                        className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-black text-sm rounded-xl uppercase tracking-wider hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 flex items-center"
                                      >
                                        <Download className="w-4 h-4 mr-2" />
                                        Download
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-8 bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl border-2 border-gray-600">
                              <div className="text-center">
                                <Download className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                <p className="text-gray-400 font-medium text-lg">No resources available</p>
                                <p className="text-gray-500 text-sm mt-2">Workshop materials and resources will be available shortly</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                                       </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-700 bg-gray-900 flex justify-end">
              <motion.button
                onClick={() => setShowUserDashboard(false)}
                className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-black uppercase tracking-wider"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Close Dashboard
              </motion.button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

// Users Tab Component
const UsersTab = ({ 
  users, 
  searchTerm, 
  setSearchTerm, 
  statusFilter, 
  setStatusFilter, 
  onUpdateStatus,
  onUpdateUserRole,
  onUpdatePaymentStatus,
  onUpdateRegistrationStatus,
  onViewUserImage,
  onViewUserDashboard,
  onSendWelcomeEmail
}: {
  users: User[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  onUpdateStatus: (userId: string, status: 'approved' | 'rejected') => void;
  onUpdateUserRole: (userId: string, role: 'user' | 'admin') => void;
  onUpdatePaymentStatus: (userId: string, registrationId: string, paymentStatus: string) => void;
  onUpdateRegistrationStatus: (userId: string, registrationId: string, status: string) => void;
  onViewUserImage: (fileId: string, bucketId: string, title: string) => void;
  onViewUserDashboard: (user: User) => void;
  onSendWelcomeEmail: (email: string, name: string, registrationId: string) => void;
}) => {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <motion.div 
        className="bg-gray-900 rounded-3xl shadow-2xl p-8 border-2 border-gray-700 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 right-4">
            <Users className="w-8 h-8 text-yellow-400" />
          </div>
          <div className="absolute bottom-4 left-4">
            <Search className="w-6 h-6 text-yellow-400" />
          </div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl mb-6"
              >
                <Users className="w-8 h-8 text-black" />
              </motion.div>
              <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-wider">
                User <span className="text-yellow-400">Management</span>
              </h3>
              <p className="text-gray-400 font-medium text-lg">
                Manage and review all registered users and their documents
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div 
        className="bg-gray-900 rounded-2xl shadow-2xl p-6 border-2 border-gray-700 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 right-4">
            <Filter className="w-6 h-6 text-yellow-400" />
          </div>
        </div>
        
        <div className="relative z-10">
          <h4 className="text-xl font-black text-white mb-4 uppercase tracking-wider flex items-center">
            <Filter className="w-6 h-6 text-yellow-400 mr-3" />
            Search & <span className="text-yellow-400 ml-2">Filter</span>
          </h4>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users by name, email, or institution..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none transition-colors font-medium"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-white focus:border-yellow-500 focus:outline-none transition-colors font-medium"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Users Cards */}
      <motion.div 
        className="bg-gray-900 rounded-3xl shadow-2xl p-8 border-2 border-gray-700 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 right-4">
            <Users className="w-8 h-8 text-yellow-400" />
          </div>
          <div className="absolute bottom-4 left-4">
            <Shield className="w-6 h-6 text-yellow-400" />
          </div>
        </div>
        
        <div className="relative z-10">
          <h4 className="text-2xl font-black text-white mb-6 uppercase tracking-wider flex items-center">
            <Users className="w-7 h-7 text-yellow-400 mr-3" />
            Registered <span className="text-yellow-400 ml-2">Users</span>
          </h4>
          
          {/* Desktop Table View */}
          <div className="hidden xl:block overflow-x-auto">
            <div className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700">
              <div className="bg-gray-700 px-6 py-4">
                <div className="grid grid-cols-5 gap-4 text-xs font-black text-gray-300 uppercase tracking-wider">
                  <div>User Info</div>
                  <div>Institution</div>
                  <div>Status</div>
                  <div>Payment</div>
                  <div>Actions</div>
                </div>
              </div>
              <div className="divide-y divide-gray-700">
                {users.map((user, index) => (
                  <motion.div 
                    key={user.id} 
                    className="grid grid-cols-5 gap-4 items-center px-6 py-4 hover:bg-gray-700/50 transition-colors group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                  >
                    <div>
                      <div className="text-sm font-black text-white uppercase tracking-wider">{user.name}</div>
                      <div className="text-sm text-gray-400 font-medium">{user.email}</div>
                      <div className="text-sm text-gray-500 font-medium">{user.phone}</div>
                    </div>
                    <div>
                      <div className="text-sm text-white font-medium">{user.institution}</div>
                      <div className="text-sm text-gray-400 font-medium">ID: {user.studentId}</div>
                    </div>
                    <div>
                      <select
                        value={user.status}
                        onChange={(e) => onUpdateRegistrationStatus(user.id, user.registrationId || '', e.target.value)}
                        className="text-xs bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-yellow-500 focus:outline-none transition-colors font-medium w-full"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="pending_verification">Pending Verification</option>
                      </select>
                    </div>
                    <div>
                      <select
                        value={user.paymentStatus || 'pending'}
                        onChange={(e) => onUpdatePaymentStatus(user.id, user.registrationId || '', e.target.value)}
                        className="text-xs bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-yellow-500 focus:outline-none transition-colors font-medium w-full"
                      >
                        <option value="pending">Pending</option>
                        <option value="verification_pending">Verification Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <motion.button 
                          onClick={() => onViewUserDashboard(user)}
                          className="p-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/30 transition-all duration-300" 
                          title="View User Dashboard"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        {user.status === 'pending' && (
                          <>
                            <motion.button
                              onClick={() => onUpdateStatus(user.id, 'approved')}
                              className="p-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-all duration-300"
                              title="Approve User"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              onClick={() => onUpdateStatus(user.id, 'rejected')}
                              className="p-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all duration-300"
                              title="Reject User"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <XCircle className="w-4 h-4" />
                            </motion.button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Tablet View */}
          <div className="hidden md:block xl:hidden overflow-x-auto">
            <div className="space-y-4">
              {users.map((user, index) => (
                <motion.div 
                  key={user.id} 
                  className="bg-gray-800 rounded-2xl p-6 border-2 border-gray-700 relative overflow-hidden group hover:border-yellow-500/50 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <motion.div 
                          className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          <span className="text-black font-black text-lg">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </motion.div>
                        <div>
                          <h5 className="text-lg font-black text-white uppercase tracking-wider">{user.name}</h5>
                          <p className="text-gray-400 font-medium">{user.email}</p>
                          <p className="text-gray-500 text-sm font-medium">{user.phone}</p>
                        </div>
                      </div>
                      <motion.button 
                        onClick={() => onViewUserDashboard(user)}
                        className="p-3 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-xl hover:bg-yellow-500/30 transition-all duration-300" 
                        title="View User Dashboard"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Eye className="w-5 h-5" />
                      </motion.button>
                    </div>

                    <div className="bg-gray-700/50 rounded-xl p-4 mb-4">
                      <div className="text-white font-medium">{user.institution}</div>
                      <div className="text-gray-400 text-sm font-medium">Student ID: {user.studentId}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Registration Status</label>
                        <select
                          value={user.status}
                          onChange={(e) => onUpdateRegistrationStatus(user.id, user.registrationId || '', e.target.value)}
                          className="w-full text-sm bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-yellow-500 focus:outline-none transition-colors font-medium"
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                          <option value="pending_verification">Pending Verification</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Payment Status</label>
                        <select
                          value={user.paymentStatus || 'pending'}
                          onChange={(e) => onUpdatePaymentStatus(user.id, user.registrationId || '', e.target.value)}
                          className="w-full text-sm bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-yellow-500 focus:outline-none transition-colors font-medium"
                        >
                          <option value="pending">Pending</option>
                          <option value="verification_pending">Verification Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </div>

                    {user.status === 'pending' && (
                      <div className="flex items-center space-x-3">
                        <motion.button
                          onClick={() => onUpdateStatus(user.id, 'approved')}
                          className="flex-1 p-3 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl hover:bg-green-500/30 transition-all duration-300 font-bold uppercase tracking-wider text-sm"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <CheckCircle className="w-4 h-4 mr-2 inline" />
                          Approve
                        </motion.button>
                        <motion.button
                          onClick={() => onUpdateStatus(user.id, 'rejected')}
                          className="flex-1 p-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-all duration-300 font-bold uppercase tracking-wider text-sm"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <XCircle className="w-4 h-4 mr-2 inline" />
                          Reject
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {users.map((user, index) => (
              <motion.div 
                key={user.id} 
                className="bg-gray-800 rounded-2xl p-6 border-2 border-gray-700 relative overflow-hidden group hover:border-yellow-500/50 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                whileHover={{ scale: 1.02 }}
              >
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10 space-y-4">
                  {/* User Info */}
                  <div className="flex items-center space-x-4">
                    <motion.div 
                      className="w-14 h-14 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <span className="text-black font-black text-xl">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-lg font-black text-white uppercase tracking-wider truncate">{user.name}</h5>
                      <p className="text-gray-400 font-medium text-sm truncate">{user.email}</p>
                      <p className="text-gray-500 text-sm font-medium">{user.phone}</p>
                    </div>
                  </div>

                  {/* Institution */}
                  <div className="bg-gray-700/50 rounded-xl p-4">
                    <div className="text-white font-medium text-sm truncate">{user.institution}</div>
                    <div className="text-gray-400 text-sm font-medium">Student ID: {user.studentId}</div>
                  </div>

                  {/* Status Controls */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Registration Status</label>
                      <select
                        value={user.status}
                        onChange={(e) => onUpdateRegistrationStatus(user.id, user.registrationId || '', e.target.value)}
                        className="w-full text-sm bg-gray-700 border border-gray-600 rounded-lg px-3 py-3 text-white focus:border-yellow-500 focus:outline-none transition-colors font-medium"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="pending_verification">Pending Verification</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">Payment Status</label>
                      <select
                        value={user.paymentStatus || 'pending'}
                        onChange={(e) => onUpdatePaymentStatus(user.id, user.registrationId || '', e.target.value)}
                        className="w-full text-sm bg-gray-700 border border-gray-600 rounded-lg px-3 py-3 text-white focus:border-yellow-500 focus:outline-none transition-colors font-medium"
                      >
                        <option value="pending">Pending</option>
                        <option value="verification_pending">Verification Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3">
                    <motion.button 
                      onClick={() => onViewUserDashboard(user)}
                      className="w-full p-3 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-xl hover:bg-yellow-500/30 transition-all duration-300 font-bold uppercase tracking-wider text-sm" 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Eye className="w-4 h-4 mr-2 inline" />
                      View Dashboard
                    </motion.button>
                    
                    {user.status === 'pending' && (
                      <div className="grid grid-cols-2 gap-3">
                        <motion.button
                          onClick={() => onUpdateStatus(user.id, 'approved')}
                          className="p-3 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl hover:bg-green-500/30 transition-all duration-300 font-bold uppercase tracking-wider text-sm"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <CheckCircle className="w-4 h-4 mr-2 inline" />
                          Approve
                        </motion.button>
                        <motion.button
                          onClick={() => onUpdateStatus(user.id, 'rejected')}
                          className="p-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-all duration-300 font-bold uppercase tracking-wider text-sm"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <XCircle className="w-4 h-4 mr-2 inline" />
                          Reject
                        </motion.button>
                      </div>
                    )}

                    {user.status === 'approved' && (
                      <motion.button
                        onClick={() => onSendWelcomeEmail(user.email, user.name, user.registrationId || '')}
                        className="w-full p-3 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl hover:bg-blue-500/30 transition-all duration-300 font-bold uppercase tracking-wider text-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Send className="w-4 h-4 mr-2 inline" />
                        Send Welcome Email
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {users.length === 0 && (
            <motion.div 
              className="text-center py-12 bg-gray-800/50 rounded-2xl border-2 border-gray-700"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 font-medium text-lg">No users found</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filter criteria</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Announcements Tab Component
const AnnouncementsTab = ({ 
  announcements, 
  onCreateAnnouncement,
  onEditAnnouncement,
  onDeleteAnnouncement
}: {
  announcements: Announcement[];
  onCreateAnnouncement: () => void;
  onEditAnnouncement: (announcement: Announcement) => void;
  onDeleteAnnouncement: (announcementId: string) => void;
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Announcements</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCreateAnnouncement}
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold px-4 py-2 rounded-lg transition-all duration-200 flex items-center shadow-lg"
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
            className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm hover:border-yellow-500/30 transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-bold text-white text-lg">{announcement.title}</h4>
                <p className="text-gray-300 mt-2 leading-relaxed">{announcement.content}</p>
                <p className="text-gray-500 text-sm mt-3">Posted: {announcement.date}</p>
              </div>
              <div className="flex items-center space-x-3 ml-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  announcement.type === 'info' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                  announcement.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                  'bg-green-500/20 text-green-400 border border-green-500/30'
                }`}>
                  {announcement.type.toUpperCase()}
                </span>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onEditAnnouncement(announcement)}
                  className="text-gray-400 hover:text-yellow-400 p-2 rounded-lg hover:bg-yellow-500/10 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onDeleteAnnouncement(announcement.id)} 
                  className="text-gray-400 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
        
        {announcements.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <Bell className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No announcements yet</p>
            <p className="text-gray-500 text-sm mt-2">Create your first announcement to get started</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// Resources Tab Component
const ResourcesTab = ({ 
  resources, 
  onUploadResource,
  onDeleteResource
}: {
  resources: Resource[];
  onUploadResource: () => void;
  onDeleteResource: (resourceId: string) => void;
}) => {
  const handleDownload = (resource: Resource) => {
    if (resource.url) {
      window.open(resource.url, '_blank');
    } else {
      toast.error('No download URL available');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Resources</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onUploadResource}
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold px-4 py-2 rounded-lg transition-all duration-200 flex items-center shadow-lg"
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
            className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm hover:border-yellow-500/30 transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-4">
              <h4 className="font-bold text-white text-lg group-hover:text-yellow-400 transition-colors">{resource.title}</h4>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                resource.type === 'pdf' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                resource.type === 'video' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                {resource.type.toUpperCase()}
              </span>
            </div>
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">{resource.description}</p>
            <p className="text-gray-500 text-xs mb-4">Uploaded: {new Date(resource.uploadDate).toLocaleDateString()}</p>
            <div className="flex items-center space-x-2">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDownload(resource)}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium px-3 py-1 rounded-lg transition-all duration-200 flex items-center text-sm"
              >
                <Download className="w-3 h-3 mr-1" />
                Download
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-gray-400 hover:text-yellow-400 p-2 rounded-lg hover:bg-yellow-500/10 transition-colors"
              >
                <Edit className="w-4 h-4" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onDeleteResource(resource.id)}
                className="text-gray-400 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        ))}
        
        {resources.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="col-span-full text-center py-12"
          >
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No resources available</p>
            <p className="text-gray-500 text-sm mt-2">Upload your first resource to get started</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// Stats Tab Component
const StatsTab = ({ users }: { users: User[] }) => {
  const eventStats = users.reduce((acc, user) => {
    user.events.forEach(event => {
      acc[event] = (acc[event] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const institutionStats = users.reduce((acc, user) => {
    acc[user.institution] = (acc[user.institution] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate total registrations and other metrics
  const totalUsers = users.length;
  const totalEvents = Object.keys(eventStats).length;
  const totalInstitutions = Object.keys(institutionStats).length;
  const averageEventsPerUser = totalUsers > 0 ? (users.reduce((sum, user) => sum + user.events.length, 0) / totalUsers).toFixed(1) : '0';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/30 border border-yellow-500/30 rounded-xl p-6 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-400/80 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold text-white">{totalUsers}</p>
            </div>
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <Users className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-br from-blue-500/20 to-blue-600/30 border border-blue-500/30 rounded-xl p-6 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400/80 text-sm font-medium">Total Events</p>
              <p className="text-3xl font-bold text-white">{totalEvents}</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gradient-to-br from-green-500/20 to-green-600/30 border border-green-500/30 rounded-xl p-6 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400/80 text-sm font-medium">Institutions</p>
              <p className="text-3xl font-bold text-white">{totalInstitutions}</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Building className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gradient-to-br from-purple-500/20 to-purple-600/30 border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-400/80 text-sm font-medium">Avg Events/User</p>
              <p className="text-3xl font-bold text-white">{averageEventsPerUser}</p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Event Registration Stats */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Calendar className="h-5 w-5 text-yellow-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Event Registrations</h3>
          </div>
          
          <div className="space-y-4">
            {Object.entries(eventStats).length > 0 ? (
              Object.entries(eventStats)
                .sort(([,a], [,b]) => b - a)
                .map(([event, count], index) => (
                  <motion.div
                    key={event}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/30 hover:border-yellow-500/30 transition-colors group"
                  >
                    <span className="text-gray-300 group-hover:text-white transition-colors">{event}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-yellow-400">{count}</span>
                      <span className="text-gray-400 text-sm">users</span>
                    </div>
                  </motion.div>
                ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No event registrations yet</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Institution Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Building className="h-5 w-5 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Institution Distribution</h3>
          </div>
          
          <div className="space-y-4">
            {Object.entries(institutionStats).length > 0 ? (
              Object.entries(institutionStats)
                .sort(([,a], [,b]) => b - a)
                .map(([institution, count], index) => (
                  <motion.div
                    key={institution}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/30 hover:border-green-500/30 transition-colors group"
                  >
                    <span className="text-gray-300 group-hover:text-white transition-colors truncate mr-2">{institution}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-bold text-green-400">{count}</span>
                      <span className="text-gray-400 text-sm">users</span>
                    </div>
                  </motion.div>
                ))
            ) : (
              <div className="text-center py-8">
                <Building className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No institution data yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Registration Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <TrendingUp className="h-5 w-5 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Registration Analytics</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/30">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Most Popular Event</h4>
            {Object.keys(eventStats).length > 0 ? (
              <div>
                <p className="text-lg font-bold text-white">
                  {Object.entries(eventStats).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
                </p>
                <p className="text-sm text-yellow-400">
                  {Object.entries(eventStats).sort(([,a], [,b]) => b - a)[0]?.[1] || 0} registrations
                </p>
              </div>
            ) : (
              <p className="text-lg text-gray-500">No data</p>
            )}
          </div>

          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/30">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Top Institution</h4>
            {Object.keys(institutionStats).length > 0 ? (
              <div>
                <p className="text-lg font-bold text-white truncate">
                  {Object.entries(institutionStats).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
                </p>
                <p className="text-sm text-green-400">
                  {Object.entries(institutionStats).sort(([,a], [,b]) => b - a)[0]?.[1] || 0} users
                </p>
              </div>
            ) : (
              <p className="text-lg text-gray-500">No data</p>
            )}
          </div>

          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/30">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Engagement Rate</h4>
            <p className="text-lg font-bold text-white">{averageEventsPerUser}</p>
            <p className="text-sm text-purple-400">events per user</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
          <div className="flex items-start gap-3">
            <BarChart3 className="h-5 w-5 text-blue-400 mt-0.5" />
            <div>
              <h4 className="text-white font-medium mb-1">Future Analytics</h4>
              <p className="text-gray-400 text-sm">
                Advanced registration analytics, timeline charts, and trend analysis will be displayed here.
                This includes daily registration counts, peak registration times, geographic distribution, and engagement patterns.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Announcement Modal Component
const AnnouncementModal = ({ 
  onClose, 
  onSubmit,
  initialData,
  isEditing = false
}: {
  onClose: () => void;
  onSubmit: (announcement: Omit<Announcement, 'id' | 'date'>) => void;
  initialData?: Announcement;
  isEditing?: boolean;
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    type: (initialData?.type || 'info') as 'info' | 'warning' | 'success'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;
    onSubmit(formData);
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-gray-900 rounded-3xl p-8 w-full max-w-md mx-4 border-2 border-gray-700 shadow-2xl"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", damping: 20 }}
      >
        <div className="mb-6">
          <motion.h3 
            className="text-2xl font-black text-white mb-2 uppercase tracking-wider"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {isEditing ? 'Edit' : 'Create'} <span className="text-yellow-400">Announcement</span>
          </motion.h3>
          <p className="text-gray-400">Share important updates with workshop participants</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-gray-300 text-sm font-bold mb-2 uppercase tracking-wider">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300"
              placeholder="Enter announcement title"
              required
            />
          </motion.div>
          
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-gray-300 text-sm font-bold mb-2 uppercase tracking-wider">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300"
            >
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="success">Success</option>
            </select>
          </motion.div>
          
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-gray-300 text-sm font-bold mb-2 uppercase tracking-wider">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 resize-none h-32"
              placeholder="Enter announcement content"
              required
            />
          </motion.div>
          
          <div className="flex space-x-4">
            <motion.button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-600 text-gray-300 rounded-xl hover:border-gray-500 hover:text-gray-200 transition-all duration-300 font-black uppercase tracking-wider"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              className="group relative flex-1"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-black py-3 px-6 rounded-xl transition-all duration-300 uppercase tracking-wider flex items-center justify-center">
                <Send className="w-4 h-4 mr-2" />
                {isEditing ? 'Update' : 'Create'}
              </div>
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Resource Modal Component
const ResourceModal = ({ 
  onClose, 
  onSubmit 
}: {
  onClose: () => void;
  onSubmit: (resource: Omit<Resource, 'id' | 'uploadDate'>) => void;
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'pdf' as 'pdf' | 'video' | 'zip',
    file: null as File | null
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;
    onSubmit({
      title: formData.title,
      description: formData.description,
      type: formData.type,
      file: formData.file || undefined
    });
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-gray-900 rounded-3xl p-8 w-full max-w-md mx-4 border-2 border-gray-700 shadow-2xl"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", damping: 20 }}
      >
        <div className="mb-6">
          <motion.h3 
            className="text-2xl font-black text-white mb-2 uppercase tracking-wider"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Upload <span className="text-yellow-400">Resource</span>
          </motion.h3>
          <p className="text-gray-400">Share workshop materials and resources</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-gray-300 text-sm font-bold mb-2 uppercase tracking-wider">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300"
              placeholder="Enter resource title"
              required
            />
          </motion.div>
          
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-gray-300 text-sm font-bold mb-2 uppercase tracking-wider">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300"
            >
              <option value="pdf">PDF</option>
              <option value="video">Video</option>
              <option value="zip">ZIP Archive</option>
            </select>
          </motion.div>
          
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-gray-300 text-sm font-bold mb-2 uppercase tracking-wider">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300 resize-none h-24"
              placeholder="Enter resource description"
              required
            />
          </motion.div>
          
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <label className="block text-gray-300 text-sm font-bold mb-2 uppercase tracking-wider">File</label>
            <input
              type="file"
              onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
              className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 file:text-black hover:file:bg-yellow-400 file:cursor-pointer cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300"
              accept={formData.type === 'pdf' ? '.pdf' : formData.type === 'video' ? 'video/*' : '.zip,.rar'}
            />
          </motion.div>
          
          <div className="flex space-x-4">
            <motion.button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-600 text-gray-300 rounded-xl hover:border-gray-500 hover:text-gray-200 transition-all duration-300 font-black uppercase tracking-wider"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              className="group relative flex-1"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-black py-3 px-6 rounded-xl transition-all duration-300 uppercase tracking-wider flex items-center justify-center">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </div>
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// User Management Tab Component
const UserManagementTab = ({ 
  users, 
  onUpdateUserRole 
}: {
  users: User[];
  onUpdateUserRole: (userId: string, role: 'user' | 'admin') => void;
}) => {
  const [searchEmail, setSearchEmail] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(users);

  React.useEffect(() => {
    if (searchEmail) {
      setFilteredUsers(users.filter(user => 
        user.email.toLowerCase().includes(searchEmail.toLowerCase()) ||
        user.name.toLowerCase().includes(searchEmail.toLowerCase())
      ));
    } else {
      setFilteredUsers(users);
    }
  }, [searchEmail, users]);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <motion.div 
        className="bg-gray-900 rounded-3xl shadow-2xl p-8 border-2 border-gray-700 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 right-4">
            <Settings className="w-8 h-8 text-yellow-400" />
          </div>
          <div className="absolute bottom-4 left-4">
            <Shield className="w-6 h-6 text-yellow-400" />
          </div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl mb-6"
              >
                <Settings className="w-8 h-8 text-black" />
              </motion.div>
              <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-wider">
                User Role <span className="text-yellow-400">Management</span>
              </h3>
              <p className="text-gray-400 font-medium text-lg">
                Manage user permissions and admin access across the platform
              </p>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Search Users */}
      <motion.div 
        className="bg-gray-900 rounded-2xl shadow-2xl p-6 border-2 border-gray-700 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 right-4">
            <Search className="w-6 h-6 text-yellow-400" />
          </div>
        </div>
        
        <div className="relative z-10">
          <h4 className="text-xl font-black text-white mb-4 uppercase tracking-wider flex items-center">
            <Search className="w-6 h-6 text-yellow-400 mr-3" />
            Search <span className="text-yellow-400 ml-2">Users</span>
          </h4>
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none transition-colors font-medium"
            />
          </div>
        </div>
      </motion.div>

      {/* Users List */}
      <motion.div 
        className="bg-gray-900 rounded-3xl shadow-2xl p-8 border-2 border-gray-700 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 right-4">
            <Users className="w-8 h-8 text-yellow-400" />
          </div>
          <div className="absolute bottom-4 left-4">
            <Shield className="w-6 h-6 text-yellow-400" />
          </div>
        </div>
        
        <div className="relative z-10">
          <h4 className="text-2xl font-black text-white mb-6 uppercase tracking-wider flex items-center">
            <Users className="w-7 h-7 text-yellow-400 mr-3" />
            All <span className="text-yellow-400 ml-2">Users</span>
          </h4>
          
          <div className="space-y-4">
            {filteredUsers.map((user, index) => (
              <motion.div 
                key={user.id} 
                className="bg-gray-800 rounded-2xl p-6 border-2 border-gray-700 relative overflow-hidden group hover:border-yellow-500/50 transition-all duration-300"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                whileHover={{ scale: 1.02 }}
              >
                {/* Background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <motion.div 
                        className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <span className="text-black font-black text-lg">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </motion.div>
                      <div>
                        <h5 className="text-lg font-black text-white uppercase tracking-wider">{user.name}</h5>
                        <p className="text-gray-400 font-medium">{user.email}</p>
                        <p className="text-gray-500 text-sm font-medium">{user.institution}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wider ${
                      (user as any).role === 'admin' 
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                        : 'bg-gray-700/50 text-gray-300 border border-gray-600'
                    }`}>
                      {(user as any).role || 'user'}
                    </span>
                    
                    {(user as any).role !== 'admin' && (
                      <motion.button
                        onClick={() => onUpdateUserRole(user.id, 'admin')}
                        className="group relative"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-500 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative bg-gradient-to-r from-purple-400 to-purple-500 text-white font-black py-2 px-4 rounded-xl transition-all duration-300 uppercase tracking-wider text-sm">
                          Make Admin
                        </div>
                      </motion.button>
                    )}
                    
                    {(user as any).role === 'admin' && (
                      <motion.button
                        onClick={() => onUpdateUserRole(user.id, 'user')}
                        className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-black uppercase tracking-wider text-sm border border-gray-500"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Remove Admin
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {filteredUsers.length === 0 && (
            <motion.div 
              className="text-center py-12 bg-gray-800/50 rounded-2xl border-2 border-gray-700"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 font-medium text-lg">No users found</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your search criteria</p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Admin Instructions */}
      <motion.div 
        className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-2 border-yellow-500/30 rounded-3xl p-8 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 right-4">
            <AlertCircle className="w-8 h-8 text-yellow-400" />
          </div>
          <div className="absolute bottom-4 left-4">
            <Settings className="w-6 h-6 text-yellow-400" />
          </div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-start space-x-4">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <AlertCircle className="w-8 h-8 text-yellow-400 mt-1" />
            </motion.div>
            <div className="flex-1">
              <h4 className="text-xl font-black text-yellow-300 mb-3 uppercase tracking-wider">
                Admin Role Instructions
              </h4>
              <p className="text-yellow-200 font-medium mb-4 leading-relaxed">
                To manually set a user as admin in Appwrite Console:
              </p>
              <ol className="text-yellow-200 font-medium space-y-2 list-decimal list-inside leading-relaxed">
                <li>Go to your <span className="text-yellow-400 font-black">Appwrite Console</span></li>
                <li>Navigate to <span className="text-yellow-400 font-black">Databases → Users Collection</span></li>
                <li>Find the user document and <span className="text-yellow-400 font-black">edit it</span></li>
                <li>Change the <span className="text-yellow-400 font-black">"role"</span> field from "user" to "admin"</li>
                <li>Save the changes</li>
                <li>The user will be redirected to admin panel on next login</li>
              </ol>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminPanel;