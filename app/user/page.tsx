'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Calendar, 
  FileText, 
  Download, 
  Edit3, 
  Save, 
  X, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Bell,
  Settings,
  LogOut,
  Upload,
  Eye,
  ExternalLink,
  Shield,
  FileImage,
  CreditCard,
  CircuitBoard,
  Cpu,
  Bot
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { 
  databases, 
  storage,
  DATABASE_ID, 
  REGISTRATIONS_COLLECTION_ID, 
  USERS_COLLECTION_ID,
  DOCUMENTS_BUCKET_ID,
  ANNOUNCEMENTS_COLLECTION_ID,
  RESOURCES_COLLECTION_ID,
  STUDENT_ID_BUCKET_ID,
  PAYMENT_SCREENSHOT_BUCKET_ID,
  Registration
} from '@/lib/appwrite';
import { Query, ID } from 'appwrite';
import Image from 'next/image';

interface UserRegistration {
  $id: string;
  userId: string;
  registrationId: string;
  eventType: string;
  personalInfo: string; // JSON string
  documents: string; // JSON string
  paymentStatus: string;
  status: string;
  submittedAt: string;
  registrationFee: number;
  paymentScreenshotFileId?: string; // Reference to payment screenshot in paymentss bucket
  studentIdFileId?: string; // Reference to student ID in id proof bucket
  parsedPersonalInfo?: {
    fullName: string;
    email: string;
    phone: string;
    institution: string;
    studentId: string;
    emergencyContact: string;
  };
  parsedDocuments?: {
    studentId?: string;
    paymentScreenshot?: string;
  };
  studentIdUrl?: string;
  paymentScreenshotUrl?: string;
}

interface UserProfile {
  $id: string;
  name: string;
  email: string;
  phone?: string;
  institution?: string;
  studentId?: string;
  role: string;
  isVerified: boolean;
  studentIdFileId?: string;    // ID of the Student ID file in id proof bucket
  paymentScreenshotFileId?: string;  // ID of the payment screenshot in paymentss bucket
  studentIdUrl?: string;       // Generated preview URL for student ID
  paymentScreenshotUrl?: string; // Generated preview URL for payment screenshot
}

interface Announcement {
  $id: string;
  title: string;
  content: string;
  $createdAt: string;
  type: 'info' | 'warning' | 'success' | 'error';
}

interface AppwriteResource {
  $id: string;
  title: string;
  description: string;
  type: 'pdf' | 'video' | 'zip';
  url?: string;
  $createdAt: string;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'video' | 'zip';
  url: string;
  uploadDate: string;
}

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRegistration, setUserRegistration] = useState<UserRegistration | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [resources, setResources] = useState<AppwriteResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showStudentIdModal, setShowStudentIdModal] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchUserData();
  }, [user, router]);

  const fetchUserData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log('Fetching user data for:', user.$id);
      
      // 1. Fetch user profile
      const userProfileData = await databases.getDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        user.$id
      );
      
      console.log('User profile retrieved:', userProfileData.$id);
      
      // Generate preview URLs for profile documents
      const profileData = userProfileData as any as UserProfile;
      
      // Generate Student ID URL if file exists
      if (profileData.studentIdFileId) {
        try {
          console.log('Generating student ID URL from profile:', profileData.studentIdFileId);
          (profileData as any).studentIdUrl = storage.getFilePreview(
            STUDENT_ID_BUCKET_ID, // id proof bucket
            profileData.studentIdFileId,
            2000, // width
            2000, // height
            'center', // crop
            100 // quality
          ).href;
          console.log('Student ID URL generated from profile:', (profileData as any).studentIdUrl);
        } catch (err) {
          console.error('Error generating student ID URL from profile:', err);
        }
      }
      
      // Generate Payment Screenshot URL if file exists
      if (profileData.paymentScreenshotFileId) {
        try {
          console.log('Generating payment screenshot URL from profile:', profileData.paymentScreenshotFileId);
          (profileData as any).paymentScreenshotUrl = storage.getFilePreview(
            PAYMENT_SCREENSHOT_BUCKET_ID, // paymentss bucket
            profileData.paymentScreenshotFileId,
            2000, // width
            2000, // height
            'center', // crop
            100 // quality
          ).href;
          console.log('Payment screenshot URL generated from profile:', (profileData as any).paymentScreenshotUrl);
        } catch (err) {
          console.error('Error generating payment screenshot URL from profile:', err);
        }
      }
      
      setUserProfile(profileData);
      
      // 2. Fetch user registration
      try {
        console.log('Fetching registration for user:', user.$id);
        const registrationsResponse = await databases.listDocuments(
          DATABASE_ID,
          REGISTRATIONS_COLLECTION_ID,
          [
            Query.equal("userId", user.$id)
          ]
        );
        
        if (registrationsResponse.documents.length > 0) {
          console.log('Registration found:', registrationsResponse.documents[0].$id);
          const registration = registrationsResponse.documents[0] as unknown as UserRegistration;
          
          // Parse JSON strings to objects
          try {
            registration.parsedPersonalInfo = JSON.parse(registration.personalInfo);
            console.log('Successfully parsed personalInfo');
          } catch (err) {
            console.error('Error parsing personalInfo:', err);
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
            console.log('Successfully parsed documents, content:', registration.parsedDocuments);
          } catch (err) {
            console.error('Error parsing documents:', err);
            registration.parsedDocuments = {};
          }
          
          // Get document preview URLs if available
          // First, check for Student ID in studentIdFileId field
          if (registration.studentIdFileId) {
            try {
              console.log('Getting student ID preview from studentIdFileId:', registration.studentIdFileId);
              // Use the id proof bucket
              registration.studentIdUrl = storage.getFilePreview(
                STUDENT_ID_BUCKET_ID, // id proof bucket
                registration.studentIdFileId,
                2000, // width
                2000, // height
                'center', // crop
                100 // quality
              ).href;
              console.log('Student ID URL generated:', registration.studentIdUrl);
            } catch (err) {
              console.error('Error getting student ID preview from studentIdFileId:', err);
            }
          } 
          // Fallback to parsedDocuments.studentId if available
          else if (registration.parsedDocuments?.studentId) {
            try {
              console.log('Fallback: Getting student ID from parsedDocuments:', registration.parsedDocuments.studentId);
              registration.studentIdUrl = storage.getFilePreview(
                STUDENT_ID_BUCKET_ID, // id proof bucket
                registration.parsedDocuments.studentId,
                2000, // width
                2000, // height
                'center', // crop
                100 // quality
              ).href;
              console.log('Student ID URL generated from parsedDocuments:', registration.studentIdUrl);
            } catch (err) {
              console.error('Error getting student ID preview from parsedDocuments:', err);
            }
          }
          
          // Check for paymentScreenshotFileId field directly in the registration
          if (registration.paymentScreenshotFileId) {
            try {
              console.log('Getting payment screenshot preview using paymentScreenshotFileId:', registration.paymentScreenshotFileId);
              registration.paymentScreenshotUrl = storage.getFilePreview(
                PAYMENT_SCREENSHOT_BUCKET_ID, // paymentss bucket
                registration.paymentScreenshotFileId,
                2000, // width
                2000, // height
                'center', // crop
                100 // quality
              ).href;
              console.log('Payment screenshot URL generated from paymentScreenshotFileId:', registration.paymentScreenshotUrl);
            } catch (err) {
              console.error('Error getting payment screenshot preview from paymentScreenshotFileId:', err);
            }
          } 
          // Fallback to parsedDocuments.paymentScreenshot if paymentScreenshotFileId is not available
          else if (registration.parsedDocuments?.paymentScreenshot) {
            try {
              console.log('Fallback: Getting payment screenshot from parsedDocuments:', registration.parsedDocuments.paymentScreenshot);
              registration.paymentScreenshotUrl = storage.getFilePreview(
                PAYMENT_SCREENSHOT_BUCKET_ID, // paymentss bucket
                registration.parsedDocuments.paymentScreenshot,
                2000, // width
                2000, // height
                'center', // crop
                100 // quality
              ).href;
              console.log('Payment screenshot URL generated from parsedDocuments:', registration.paymentScreenshotUrl);
            } catch (err) {
              console.error('Error getting payment screenshot preview from parsedDocuments:', err);
            }
          }
          
          // Add more detailed logging for debugging image URLs
          if (registration.studentIdFileId || registration.parsedDocuments?.studentId || 
              registration.paymentScreenshotFileId || registration.parsedDocuments?.paymentScreenshot) {
            console.log('=== IMAGE URL DIAGNOSTICS ===');
            console.log('Student ID File ID (id proof bucket):', registration.studentIdFileId || registration.parsedDocuments?.studentId);
            console.log('Payment Screenshot File ID (paymentss bucket):', registration.paymentScreenshotFileId || registration.parsedDocuments?.paymentScreenshot);
            console.log('Student ID URL:', registration.studentIdUrl);
            console.log('Payment Screenshot URL:', registration.paymentScreenshotUrl);
            
            // Show URLs in a more visible way for debugging
            if (registration.studentIdUrl) {
              console.log('%c Student ID Preview URL ', 'background: #3498db; color: #fff; padding: 2px 5px;');
              console.log(registration.studentIdUrl);
            }
            
            if (registration.paymentScreenshotUrl) {
              console.log('%c Payment Screenshot Preview URL ', 'background: #2ecc71; color: #fff; padding: 2px 5px;');
              console.log(registration.paymentScreenshotUrl);
            }
            console.log('=== END DIAGNOSTICS ===');
          }
          
          setUserRegistration(registration);
        } else {
          console.log('No registration found for this user');
        }
      } catch (registrationError) {
        console.error('Error fetching registration:', registrationError);
      }
      
      // 3. Fetch announcements
      try {
        console.log('Fetching announcements');
        const announcementsResponse = await databases.listDocuments(
          DATABASE_ID,
          ANNOUNCEMENTS_COLLECTION_ID,
          [
            Query.orderDesc('$createdAt'),
            Query.limit(5)
          ]
        );
        
        console.log('Announcements retrieved:', announcementsResponse.documents.length);
        setAnnouncements(announcementsResponse.documents as unknown as Announcement[]);
      } catch (announcementsError) {
        console.error('Error fetching announcements:', announcementsError);
        setAnnouncements([]);
      }
      
      // 4. Fetch resources
      try {
        console.log('Fetching resources');
        const resourcesResponse = await databases.listDocuments(
          DATABASE_ID,
          RESOURCES_COLLECTION_ID,
          [
            Query.orderDesc('$createdAt'),
            Query.limit(10)
          ]
        );
        
        console.log('Resources retrieved:', resourcesResponse.documents.length);
        setResources(resourcesResponse.documents as unknown as AppwriteResource[]);
      } catch (resourcesError) {
        console.error('Error fetching resources:', resourcesError);
        setResources([]);
      }
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const generateRegistrationPDF = async () => {
    if (!userProfile || !userRegistration) return;

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
      doc.text('NCC ROBOTICS WORKSHOP 2025', 105, 25, { align: 'center' });
      
      // Subtitle
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.text('REGISTRATION CONFIRMATION', 105, 40, { align: 'center' });
      
      // Registration ID header with yellow accent
      doc.setFillColor(255, 215, 0, 0.2); // Semi-transparent yellow
      doc.rect(15, 60, 180, 15, 'F');
      doc.setFontSize(14);
      doc.setTextColor(255, 215, 0); // Yellow text
      doc.setFont("helvetica", "bold");
      doc.text(`REGISTRATION ID: ${userRegistration.registrationId}`, 105, 70, { align: 'center' });
      
      // Participant Information Section
      doc.setFontSize(16);
      doc.setTextColor(255, 215, 0); // Yellow headers
      doc.setFont("helvetica", "bold");
      doc.text('PARTICIPANT INFORMATION', 20, 90);
      
      // Draw a yellow line under the header
      doc.setDrawColor(255, 215, 0);
      doc.setLineWidth(2);
      doc.line(20, 95, 190, 95);
      
      // Participant details with white text
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255); // White text
      doc.setFont("helvetica", "normal");
      
      const participantInfo = [
        `Name: ${userProfile.name}`,
        `Email: ${userProfile.email}`,
        `Phone: ${userRegistration.parsedPersonalInfo?.phone || 'Not provided'}`,
        `Institution: ${userRegistration.parsedPersonalInfo?.institution || 'Not provided'}`,
        `Student ID: ${userRegistration.parsedPersonalInfo?.studentId || 'Not provided'}`,
        `Registration Date: ${new Date(userRegistration.submittedAt).toLocaleDateString()}`,
        `Status: ${userRegistration.status.toUpperCase()}`
      ];
      
      let yPos = 110;
      participantInfo.forEach((info) => {
        doc.text(info, 25, yPos);
        yPos += 12;
      });
      
      // Event Information Section
      doc.setFontSize(16);
      doc.setTextColor(255, 215, 0); // Yellow headers
      doc.setFont("helvetica", "bold");
      doc.text('EVENT INFORMATION', 20, yPos + 10);
      
      // Draw a yellow line under the header
      doc.setDrawColor(255, 215, 0);
      doc.setLineWidth(2);
      doc.line(20, yPos + 15, 190, yPos + 15);
      
      // Event details
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255); // White text
      doc.setFont("helvetica", "normal");
      doc.text(`Event Type: ${userRegistration.eventType.toUpperCase()}`, 25, yPos + 30);
      doc.text(`Registration Fee: ${userRegistration.registrationFee || 1000} BDT`, 25, yPos + 45);
      doc.text(`Payment Status: ${userRegistration.paymentStatus.toUpperCase()}`, 25, yPos + 60);
      
      // Generate QR Code with direct verification URL
      const verificationUrl = `${window.location.origin}/verify/${userRegistration.registrationId}`;
      console.log('Generated QR verification URL:', verificationUrl);
      
      // Generate QR code as data URL - Use direct URL instead of JSON for better scanner compatibility
      const qrCodeDataURL = await QRCode.toDataURL(verificationUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M' // Medium error correction for better scanning
      });
      
      // Add QR code to PDF
      doc.addImage(qrCodeDataURL, 'PNG', 140, 110, 50, 50);
      
      // QR code border with yellow accent
      doc.setDrawColor(255, 215, 0);
      doc.setLineWidth(3);
      doc.rect(140, 110, 50, 50, 'S');
      
      // QR code label
      doc.setFontSize(10);
      doc.setTextColor(255, 215, 0);
      doc.setFont("helvetica", "bold");
      doc.text('SCAN QR CODE', 165, 170, { align: 'center' });
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "normal");
      doc.text('to verify registration', 165, 180, { align: 'center' });
      
      // Instructions Section
      doc.setFillColor(255, 215, 0, 0.1); // Very light yellow background
      doc.rect(15, 200, 180, 40, 'F');
      
      doc.setFontSize(14);
      doc.setTextColor(255, 215, 0); // Yellow headers
      doc.setFont("helvetica", "bold");
      doc.text('IMPORTANT INSTRUCTIONS', 20, 215);
      
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255); // White text
      doc.setFont("helvetica", "normal");
      doc.text('• Please bring this confirmation and a valid photo ID to the workshop venue', 25, 225);
      doc.text('• Arrive 30 minutes before the scheduled workshop time', 25, 235);
      doc.text('• Scan the QR code above to verify your registration online', 25, 245);
      doc.text('• For questions or support, contact: support@nccrobotics.com', 25, 255);
      
      // Footer with website theme colors
      doc.setFillColor(255, 215, 0); // Yellow footer
      doc.rect(0, 270, 210, 27, 'F');
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0); // Black text on yellow
      doc.setFont("helvetica", "bold");
      doc.text('NCC ROBOTICS WORKSHOP 2025', 105, 285, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text('Powering the Future with Robotics Innovation', 105, 292, { align: 'center' });
      
      // Save the PDF
      doc.save(`NCC_Robotics_Registration_${userProfile.name.replace(/\s+/g, '_')}.pdf`);
      toast.success('Registration PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  const handleProfileUpdate = async (updatedData: Partial<UserProfile>) => {
    if (!userProfile) return;
    
    try {
      const updatedProfile = await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userProfile.$id,
        updatedData
      );
      
      setUserProfile({...userProfile, ...updatedData});
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    }
  };
  
  // File upload function for user profile
  const handleFileUpload = async (type: 'studentId' | 'paymentScreenshot', file: File) => {
    if (!userProfile) return;
    
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a valid file (JPEG, PNG, or PDF)');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      // Create a toastId to manage the loading state
      const toastId = toast.loading(`Uploading ${type === 'studentId' ? 'Student ID' : 'Payment Screenshot'}...`);
      
      try {
        // Determine which bucket to use based on the file type
        const bucketId = type === 'studentId' 
          ? STUDENT_ID_BUCKET_ID // id proof bucket
          : PAYMENT_SCREENSHOT_BUCKET_ID; // paymentss bucket
        
        console.log(`Uploading ${type} to bucket: ${bucketId}`);
        
        // Upload the file to the appropriate bucket
        const response = await storage.createFile(
          bucketId,
          ID.unique(),
          file
        );
        
        // Update the user profile with the new file ID
        const updatedData: Partial<UserProfile> = {};
        if (type === 'studentId') {
          updatedData.studentIdFileId = response.$id;
        } else {
          updatedData.paymentScreenshotFileId = response.$id;
        }
        
        // Update the user profile in the database
        await handleProfileUpdate(updatedData);
        
        // Also update registration if it exists
        if (userRegistration) {
          try {
            const registrationUpdate: any = {};
            if (type === 'studentId') {
              registrationUpdate.studentIdFileId = response.$id;
            } else {
              registrationUpdate.paymentScreenshotFileId = response.$id;
            }
            
            // Also update the documents field for backward compatibility
            registrationUpdate.documents = JSON.stringify({
              ...userRegistration.parsedDocuments,
              [type]: response.$id
            });
            
            await databases.updateDocument(
              DATABASE_ID,
              REGISTRATIONS_COLLECTION_ID,
              userRegistration.$id,
              registrationUpdate
            );
            
            // Update local state with new file
            if (type === 'studentId') {
              userRegistration.studentIdFileId = response.$id;
              userRegistration.studentIdUrl = storage.getFilePreview(
                STUDENT_ID_BUCKET_ID,
                response.$id,
                2000,
                2000,
                'center',
                100
              ).href;
            } else {
              userRegistration.paymentScreenshotFileId = response.$id;
              userRegistration.paymentScreenshotUrl = storage.getFilePreview(
                PAYMENT_SCREENSHOT_BUCKET_ID,
                response.$id,
                2000,
                2000,
                'center',
                100
              ).href;
            }
            
            setUserRegistration({...userRegistration});
          } catch (registrationError) {
            console.error('Failed to update registration document:', registrationError);
          }
        }
        
        toast.dismiss(toastId);
        toast.success(`${type === 'studentId' ? 'Student ID' : 'Payment Screenshot'} uploaded successfully`);
      } catch (uploadError: any) {
        toast.dismiss(toastId);
        console.error('File upload error:', uploadError);
        
        if (uploadError?.message?.includes('missing scope')) {
          toast.error('Permission error: You need to be logged in properly to upload files.');
        } else {
          toast.error(`Upload failed: ${uploadError?.message || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Unexpected error in file upload process:', error);
      toast.error('An unexpected error occurred. Please try again.');
    }
  };
  
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Session Expired</h2>
          <p className="text-gray-600 mb-6">Your session has expired or you're not logged in. Please log in again to access your dashboard.</p>
          <button 
            onClick={() => router.push('/login')}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="spinner w-12 h-12 border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
            <p className="text-gray-600">Unable to load your profile information.</p>
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
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-600/5 rounded-full blur-3xl" />
      </div>

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none pt-32">
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 left-20 w-32 h-32 opacity-5"
        >
          <CircuitBoard className="w-full h-full text-yellow-500" />
        </motion.div>
        <motion.div
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-20 right-20 w-24 h-24 opacity-5"
        >
          <Cpu className="w-full h-full text-yellow-500" />
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
            <span className="block bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent opacity-5">USER</span>
            <span className="block bg-gradient-to-r from-blue-400 to-cyan-600 bg-clip-text text-transparent opacity-5 -mt-8">PORTAL</span>
          </motion.h1>
        </motion.div>
      </div>

      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32 relative z-10">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
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
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl mb-6"
                  >
                    <User className="w-8 h-8 text-black" />
                  </motion.div>
                  <h1 className="text-4xl font-black text-white mb-4 uppercase tracking-wider">
                    Welcome back, <span className="text-yellow-400">{userProfile.name}!</span>
                  </h1>
                  <p className="text-gray-400 font-medium text-lg">
                    Manage your robotics workshop registration and profile
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-4">
                  <motion.button
                    onClick={generateRegistrationPDF}
                    className="group relative"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-black py-3 px-6 rounded-xl flex items-center transition-all duration-300 uppercase tracking-wider shadow-lg shadow-yellow-500/30">
                      <Download className="w-5 h-5 mr-2" />
                      Download PDF
                    </div>
                  </motion.button>
                  <motion.button
                    onClick={handleLogout}
                    className="px-6 py-3 border-2 border-gray-600 text-gray-300 rounded-xl hover:border-yellow-500 hover:text-yellow-400 transition-all duration-300 flex items-center font-black uppercase tracking-wider"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Logout
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile & Registration */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900 rounded-3xl shadow-2xl p-8 border-2 border-gray-700 relative overflow-hidden"
            >
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
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-black text-white flex items-center uppercase tracking-wider">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl mr-4"
                    >
                      <User className="w-6 h-6 text-black" />
                    </motion.div>
                    Profile <span className="text-yellow-400">Information</span>
                  </h2>
                  <motion.button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-6 py-3 border-2 border-gray-600 text-gray-300 rounded-xl hover:border-yellow-500 hover:text-yellow-400 transition-all duration-300 flex items-center font-black uppercase tracking-wider"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isEditing ? (
                      <><X className="w-4 h-4 mr-2" /> Cancel</>
                    ) : (
                      <><Edit3 className="w-4 h-4 mr-2" /> Edit</>
                    )}
                  </motion.button>
                </div>
                
                <ProfileForm
                  profile={userProfile}
                  isEditing={isEditing}
                  onSave={handleProfileUpdate}
                  onFileUpload={handleFileUpload}
                />
              </div>
            </motion.div>

            {/* Registration Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900 rounded-3xl shadow-2xl p-8 border-2 border-gray-700 relative overflow-hidden"
            >
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
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl mr-4"
                  >
                    <Calendar className="w-6 h-6 text-black" />
                  </motion.div>
                  Registration <span className="text-yellow-400">Status</span>
                </h2>
                
                <div className="space-y-6">
                  {userRegistration ? (
                    <>
                      <motion.div 
                        className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-2xl border-2 border-blue-500/30"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {getStatusIcon(userRegistration.status)}
                            <div className="ml-4">
                              <h3 className="font-black text-blue-300 text-lg uppercase tracking-wider">
                                Registration {userRegistration.status.charAt(0).toUpperCase() + userRegistration.status.slice(1)}
                              </h3>
                              <p className="text-blue-200 font-medium">
                                Registration ID: <span className="text-yellow-400 font-black">{userRegistration.registrationId}</span>
                              </p>
                              <p className="text-blue-200 font-medium">
                                Submitted: {new Date(userRegistration.submittedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <motion.span 
                            className={`px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wider ${getStatusClass(userRegistration.status)}`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5 }}
                          >
                            {userRegistration.status}
                          </motion.span>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-2xl border-2 border-green-500/30"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {getStatusIcon(userRegistration.paymentStatus)}
                            <div className="ml-4">
                              <h3 className="font-black text-green-300 text-lg uppercase tracking-wider">
                                Payment {userRegistration.paymentStatus.charAt(0).toUpperCase() + userRegistration.paymentStatus.slice(1)}
                              </h3>
                              <p className="text-green-200 font-medium">
                                {userRegistration.registrationFee ? 
                                  `Registration Fee: ${userRegistration.registrationFee} BDT` : 
                                  'Registration Fee: ৳100'
                                }
                              </p>
                            </div>
                          </div>
                          <motion.span 
                            className={`px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wider ${getStatusClass(userRegistration.paymentStatus)}`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.6 }}
                          >
                            {userRegistration.paymentStatus}
                          </motion.span>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        className="p-6 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 rounded-2xl border-2 border-yellow-500/30"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <h3 className="font-black text-yellow-300 text-lg mb-4 uppercase tracking-wider">Event Type</h3>
                        <motion.div 
                          className="inline-block px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black rounded-xl font-black uppercase tracking-wider shadow-lg shadow-yellow-500/30"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.7 }}
                        >
                          {userRegistration.eventType}
                        </motion.div>
                      </motion.div>
                    </>
                  ) : (
                    <motion.div 
                      className="p-6 bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-2xl border-2 border-red-500/30"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="flex items-center">
                        <AlertCircle className="w-8 h-8 text-red-400 mr-4" />
                        <div>
                          <h3 className="font-black text-red-300 text-lg uppercase tracking-wider">Registration Not Found</h3>
                          <p className="text-red-200 font-medium mb-4">
                            You haven't completed your registration yet.
                          </p>
                          <motion.button 
                            onClick={() => router.push('/register')}
                            className="group relative"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-black py-3 px-6 rounded-xl transition-all duration-300 uppercase tracking-wider shadow-lg shadow-yellow-500/30">
                              Complete Registration
                            </div>
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Payment Information (Always Visible) */}
                  <motion.div 
                    className="p-6 bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 rounded-2xl border-2 border-yellow-500/30"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex items-start">
                      <CreditCard className="w-6 h-6 text-yellow-400 mt-1 mr-4 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="text-lg font-black text-yellow-400 mb-3 uppercase tracking-wider">Payment Information</h3>
                        <p className="text-gray-300 mb-4">Registration Fee: <span className="text-yellow-400 font-black">৳100</span></p>
                        <p className="text-gray-300 mb-4">Please make payment to the following account:</p>
                        
                        <div className="bg-black/30 rounded-xl p-4 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <p><span className="text-yellow-400 font-black">Account Name:</span> <span className="text-white">NCC Robotics</span></p>
                              <p><span className="text-yellow-400 font-black">Account No:</span> <span className="text-white">01718360044</span></p>
                              <p><span className="text-yellow-400 font-black">Bank:</span> <span className="text-white">Bikash Mobile Banking</span></p>
                            </div>
                            <div className="space-y-2">
                              <p><span className="text-yellow-400 font-black">Type:</span> <span className="text-white">Personal</span></p>
                              <p><span className="text-yellow-400 font-black">Reference:</span> <span className="text-white">Your Name + ROBOTICS2025</span></p>
                              <p><span className="text-yellow-400 font-black">Amount:</span> <span className="text-white">৳100</span></p>
                            </div>
                          </div>
                          <div className="mt-4 pt-3 border-t border-gray-600">
                            <p className="text-sm text-gray-400">
                              <span className="text-yellow-400 font-bold">Important:</span> Please include your full name and "ROBOTICS2025" in the transaction reference/note field.
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                          <p className="text-blue-300 text-sm font-medium">
                            <span className="font-bold">Note:</span> After completing registration and payment, upload your payment screenshot for verification.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Document Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-900 rounded-3xl shadow-2xl p-8 border-2 border-gray-700 relative overflow-hidden"
            >
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
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-black text-white flex items-center uppercase tracking-wider">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl mr-4"
                    >
                      <FileText className="w-6 h-6 text-black" />
                    </motion.div>
                    Document <span className="text-yellow-400">Status</span>
                  </h2>
                  <motion.button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-6 py-3 border-2 border-gray-600 text-gray-300 rounded-xl hover:border-yellow-500 hover:text-yellow-400 transition-all duration-300 flex items-center font-black uppercase tracking-wider"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Files
                  </motion.button>
                </div>
                
                {userProfile ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Student ID Document */}
                    <motion.div 
                      className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl border border-gray-600"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="flex items-center mb-4">
                        <FileText className="w-6 h-6 text-purple-400 mr-3" />
                        <h3 className="font-black text-white text-lg uppercase tracking-wider">Student ID</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Document Status</label>
                          <div className="flex items-center space-x-3">
                            <motion.span 
                              className={`px-3 py-1 rounded-lg text-sm font-bold ${
                                userProfile.studentIdFileId 
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.6 }}
                            >
                              {userProfile.studentIdFileId ? 'Uploaded' : 'Not Uploaded'}
                            </motion.span>
                            {userProfile.studentIdFileId && (
                              <motion.button
                                onClick={() => setShowStudentIdModal(true)}
                                className="p-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-all duration-300"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Eye className="w-4 h-4" />
                              </motion.button>
                            )}
                          </div>
                        </div>
                        
                        {userProfile.studentIdFileId && (
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">File ID</label>
                            <p className="text-gray-400 font-mono text-sm bg-gray-800 p-2 rounded">
                              {userProfile.studentIdFileId.substring(0, 12)}...
                            </p>
                          </div>
                        )}
                        
                        {!userProfile.studentIdFileId && (
                          <div className="mt-4">
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload('studentId', file);
                              }}
                              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 file:text-black hover:file:bg-yellow-400 file:cursor-pointer cursor-pointer"
                            />
                            <p className="text-xs text-gray-500 mt-2">Upload your student ID (JPG, PNG, or PDF, max 5MB)</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                    
                    {/* Payment Screenshot */}
                    <motion.div 
                      className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl border border-gray-600"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="flex items-center mb-4">
                        <CreditCard className="w-6 h-6 text-green-400 mr-3" />
                        <h3 className="font-black text-white text-lg uppercase tracking-wider">Payment Screenshot</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Payment Status</label>
                          <div className="flex items-center space-x-3">
                            <motion.span 
                              className={`px-3 py-1 rounded-lg text-sm font-bold ${
                                userProfile.paymentScreenshotFileId
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.7 }}
                            >
                              {userProfile.paymentScreenshotFileId ? 'Uploaded' : 'Not Uploaded'}
                            </motion.span>
                            {userProfile.paymentScreenshotFileId && (
                              <motion.button
                                onClick={() => setShowPaymentModal(true)}
                                className="p-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-all duration-300"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Eye className="w-4 h-4" />
                              </motion.button>
                            )}
                          </div>
                        </div>
                        
                        {userProfile.paymentScreenshotFileId && (
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">File ID</label>
                            <p className="text-gray-400 font-mono text-sm bg-gray-800 p-2 rounded">
                              {userProfile.paymentScreenshotFileId.substring(0, 12)}...
                            </p>
                          </div>
                        )}
                        
                        {!userProfile.paymentScreenshotFileId && (
                          <div className="mt-4">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload('paymentScreenshot', file);
                              }}
                              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 file:text-black hover:file:bg-yellow-400 file:cursor-pointer cursor-pointer"
                            />
                            <p className="text-xs text-gray-500 mt-2">Upload payment screenshot (JPG or PNG, max 5MB)</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                ) : (
                  <motion.div 
                    className="p-6 bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-2xl border-2 border-red-500/30"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex items-center">
                      <AlertCircle className="w-8 h-8 text-red-400 mr-4" />
                      <div>
                        <h3 className="font-black text-red-300 text-lg uppercase tracking-wider">No Profile Found</h3>
                        <p className="text-red-200 font-medium">
                          Unable to load document information from your profile.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

          </div>

          {/* Right Column - Announcements & Resources */}
          <div className="space-y-8">
            {/* Announcements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl border-2 border-gray-600 relative overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-600">
                <h2 className="text-2xl font-black text-yellow-400 flex items-center uppercase tracking-wider">
                  <Bell className="w-8 h-8 mr-3" />
                  ANNOUNCEMENTS
                </h2>
              </div>
              
              {/* Content */}
              <div className="p-6">
                {announcements.length > 0 ? (
                  <div className="space-y-4">
                    {announcements.map((announcement, index) => (
                      <motion.div 
                        key={announcement.$id} 
                        className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-4 border border-gray-600"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-bold text-white text-lg uppercase tracking-wider">{announcement.title}</h3>
                          <div className="flex items-center space-x-2">
                            <motion.span 
                              className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                                announcement.type === 'info' ? 'bg-blue-500/20 text-blue-400' :
                                announcement.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                                announcement.type === 'success' ? 'bg-green-500/20 text-green-400' :
                                'bg-red-500/20 text-red-400'
                              }`}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.7 + index * 0.1 }}
                            >
                              {announcement.type}
                            </motion.span>
                            {/* Toggle Switch */}
                            <div className="w-12 h-6 bg-gray-600 rounded-full relative">
                              <div className="w-5 h-5 bg-red-500 rounded-full absolute top-0.5 right-0.5"></div>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm mb-3 leading-relaxed">{announcement.content}</p>
                        <p className="text-gray-500 text-xs">{new Date(announcement.$createdAt).toLocaleString()}</p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div 
                    className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-6 border border-gray-600"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="text-center">
                      <Bell className="w-8 h-8 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400 font-medium">No announcements available</p>
                      <p className="text-gray-500 text-sm mt-1">Check back later for important updates</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Resources */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl border-2 border-gray-600 relative overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-600">
                <h2 className="text-2xl font-black text-yellow-400 flex items-center uppercase tracking-wider">
                  <Download className="w-8 h-8 mr-3" />
                  WORKSHOP<span className="text-white">RESOU</span>
                </h2>
              </div>
              {/* Content */}
              <div className="p-6">
                {resources.length > 0 ? (
                  <div className="space-y-4">
                    {resources.map((resource, index) => (
                      <motion.div 
                        key={resource.$id} 
                        className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-4 border border-gray-600"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-white text-lg uppercase tracking-wider mb-2">{resource.title}</h3>
                            <p className="text-gray-300 text-sm mb-2 leading-relaxed">{resource.description}</p>
                            <p className="text-gray-500 text-xs">Uploaded: {new Date(resource.$createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center space-x-3 ml-4">
                            <motion.span 
                              className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                                resource.type === 'pdf' ? 'bg-red-500/20 text-red-400' :
                                resource.type === 'video' ? 'bg-purple-500/20 text-purple-400' :
                                'bg-gray-500/20 text-gray-400'
                              }`}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.8 + index * 0.1 }}
                            >
                              {resource.type}
                            </motion.span>
                            {resource.url && (
                              <motion.button
                                onClick={() => window.open(resource.url, '_blank')}
                                className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold text-xs rounded-lg uppercase tracking-wider hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 flex items-center"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.9 + index * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                DOWNLOAD
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div 
                    className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-6 border border-gray-600"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="text-center">
                      <Download className="w-8 h-8 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400 font-medium">No resources available</p>
                      <p className="text-gray-500 text-sm mt-1">Workshop materials and resources will be available shortly</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      <Footer />

      {/* Document Preview Modals */}
      {showPaymentModal && userProfile?.paymentScreenshotFileId && (userProfile as any)?.paymentScreenshotUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Payment Screenshot</h3>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
              <div className="relative max-w-full max-h-[70vh]">
                <Image 
                  src={(userProfile as any)?.paymentScreenshotUrl}
                  alt="Payment Screenshot"
                  width={1200}
                  height={800}
                  className="max-h-[70vh] object-contain"
                  onError={() => {
                    console.error('Failed to load payment screenshot from profile:', (userProfile as any)?.paymentScreenshotUrl);
                    toast.error('Failed to load Payment Screenshot. The file may be missing or you may not have permission to view it.');
                  }}
                />
              </div>
            </div>
            <div className="p-4 border-t flex justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Payment File: <span className="font-medium text-blue-600">
                    {userProfile?.paymentScreenshotFileId ? 'Uploaded' : 'Not uploaded'}
                  </span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  File ID: {userProfile?.paymentScreenshotFileId || 'Not available'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Bucket ID: {PAYMENT_SCREENSHOT_BUCKET_ID} (paymentss bucket)
                </p>
              </div>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showStudentIdModal && userProfile?.studentIdFileId && (userProfile as any)?.studentIdUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Student ID</h3>
              <button 
                onClick={() => setShowStudentIdModal(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
              <div className="relative max-w-full max-h-[70vh]">
                <Image 
                  src={(userProfile as any)?.studentIdUrl}
                  alt="Student ID"
                  width={1200}
                  height={800}
                  className="max-h-[70vh] object-contain"
                  onError={() => {
                    console.error('Failed to load student ID image from profile:', (userProfile as any)?.studentIdUrl);
                    toast.error('Failed to load Student ID image. The file may be missing or you may not have permission to view it.');
                  }}
                />
              </div>
            </div>
            <div className="p-4 border-t flex justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Document File: <span className="font-medium text-blue-600">
                    {userProfile?.studentIdFileId ? 'Uploaded' : 'Not uploaded'}
                  </span>
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  File ID: {userProfile?.studentIdFileId || 'Not available'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Bucket ID: {STUDENT_ID_BUCKET_ID} (id proof bucket)
                </p>
              </div>
              <button 
                onClick={() => setShowStudentIdModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Profile Form Component
const ProfileForm = ({ 
  profile, 
  isEditing, 
  onSave,
  onFileUpload
}: { 
  profile: UserProfile; 
  isEditing: boolean; 
  onSave: (data: Partial<UserProfile>) => void;
  onFileUpload: (type: 'studentId' | 'paymentScreenshot', file: File) => void;
}) => {
  const [formData, setFormData] = useState({
    name: profile.name,
    phone: profile.phone || '',
    institution: profile.institution || '',
    studentId: profile.studentId || ''
  });

  const handleSave = () => {
    onSave(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'studentId' | 'paymentScreenshot') => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(type, file);
    }
  };

  if (!isEditing) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
          <p className="text-white font-medium">{profile.name}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
          <p className="text-white font-medium">{profile.email}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
          <p className="text-white font-medium">{profile.phone || 'Not provided'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Institution</label>
          <p className="text-white font-medium">{profile.institution || 'Not provided'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Student ID</label>
          <p className="text-white font-medium">{profile.studentId || 'Not provided'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Account Status</label>
          <p className="text-white font-medium">
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
              profile.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {profile.isVerified ? 'VERIFIED' : 'PENDING VERIFICATION'}
            </span>
          </p>
        </div>
        
        {/* Document Status Section */}
        <div className="col-span-1 md:col-span-2 mt-4">
          <h3 className="text-lg font-medium text-white mb-3">Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-600 rounded-md p-4 bg-gray-800/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-white">Student ID</h4>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  profile.studentIdFileId ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {profile.studentIdFileId ? 'UPLOADED' : 'NOT UPLOADED'}
                </span>
              </div>
              {profile.studentIdFileId && (
                <button 
                  className="mt-2 flex items-center text-sm text-yellow-400 hover:text-yellow-300"
                  onClick={() => {
                    if (profile.studentIdFileId) {
                      window.open(storage.getFilePreview(STUDENT_ID_BUCKET_ID, profile.studentIdFileId, 2000, 2000, 'center', 100).href, '_blank');
                    }
                  }}
                >
                  <Eye className="w-4 h-4 mr-1" /> View Document
                </button>
              )}
            </div>
            
            <div className="border border-gray-600 rounded-md p-4 bg-gray-800/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-white">Payment Screenshot</h4>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  profile.paymentScreenshotFileId ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {profile.paymentScreenshotFileId ? 'UPLOADED' : 'NOT UPLOADED'}
                </span>
              </div>
              {profile.paymentScreenshotFileId && (
                <button 
                  className="mt-2 flex items-center text-sm text-yellow-400 hover:text-yellow-300"
                  onClick={() => {
                    if (profile.paymentScreenshotFileId) {
                      window.open(storage.getFilePreview(PAYMENT_SCREENSHOT_BUCKET_ID, profile.paymentScreenshotFileId, 2000, 2000, 'center', 100).href, '_blank');
                    }
                  }}
                >
                  <Eye className="w-4 h-4 mr-1" /> View Document
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-gray-400 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Institution</label>
          <input
            type="text"
            value={formData.institution}
            onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Student ID Number</label>
          <input
            type="text"
            value={formData.studentId}
            onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>
      </div>
      
      {/* Document Upload Section */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-white mb-4">Document Upload</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student ID Upload */}
          <div className="border border-gray-600 rounded-md p-4 bg-gray-800/50">
            <h4 className="font-medium mb-2 text-white">Upload Student ID</h4>
            <p className="text-sm text-gray-300 mb-4">Upload a clear image of your student ID card or any institution ID.</p>
            
            <div className="flex items-center justify-between mb-2">
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                profile.studentIdFileId ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {profile.studentIdFileId ? 'UPLOADED' : 'NOT UPLOADED'}
              </span>
              
              {profile.studentIdFileId && (
                <button 
                  type="button"
                  className="text-sm text-yellow-400 hover:text-yellow-300 flex items-center"
                  onClick={() => {
                    if (profile.studentIdFileId) {
                      window.open(storage.getFilePreview(STUDENT_ID_BUCKET_ID, profile.studentIdFileId, 2000, 2000, 'center', 100).href, '_blank');
                    }
                  }}
                >
                  <Eye className="w-4 h-4 mr-1" /> View
                </button>
              )}
            </div>
            
            <div className="mt-4">
              <label className="inline-flex items-center px-4 py-2 border border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                Choose File
                <input 
                  type="file" 
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, 'studentId')}
                />
              </label>
              <p className="mt-2 text-xs text-gray-400">Accepted formats: JPG, PNG, PDF (max 5MB)</p>
            </div>
          </div>
          
          {/* Payment Screenshot Upload */}
          <div className="border border-gray-600 rounded-md p-4 bg-gray-800/50">
            <h4 className="font-medium mb-2 text-white">Upload Payment Screenshot</h4>
            <p className="text-sm text-gray-300 mb-4">Upload a screenshot of your payment confirmation or receipt.</p>
            
            <div className="flex items-center justify-between mb-2">
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                profile.paymentScreenshotFileId ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {profile.paymentScreenshotFileId ? 'UPLOADED' : 'NOT UPLOADED'}
              </span>
              
              {profile.paymentScreenshotFileId && (
                <button 
                  type="button"
                  className="text-sm text-yellow-400 hover:text-yellow-300 flex items-center"
                  onClick={() => {
                    if (profile.paymentScreenshotFileId) {
                      window.open(storage.getFilePreview(PAYMENT_SCREENSHOT_BUCKET_ID, profile.paymentScreenshotFileId, 2000, 2000, 'center', 100).href, '_blank');
                    }
                  }}
                >
                  <Eye className="w-4 h-4 mr-1" /> View
                </button>
              )}
            </div>
            
            <div className="mt-4">
              <label className="inline-flex items-center px-4 py-2 border border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                Choose File
                <input 
                  type="file" 
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, 'paymentScreenshot')}
                />
              </label>
              <p className="mt-2 text-xs text-gray-400">Accepted formats: JPG, PNG, PDF (max 5MB)</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end mt-6">
        <button 
          type="button"
          onClick={handleSave}
          className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-black rounded-xl hover:from-yellow-300 hover:to-yellow-400 flex items-center transition-all duration-300 uppercase tracking-wider shadow-lg shadow-yellow-500/30"
        >
          <Save className="w-4 h-4 mr-2" /> Save Changes
        </button>
      </div>
    </div>
  );
};

export default UserDashboard;