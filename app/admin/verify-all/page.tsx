'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Users, 
  Download, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  User, 
  Calendar, 
  CreditCard, 
  FileText, 
  ExternalLink,
  ArrowLeft,
  Eye,
  Bot
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { databases, DATABASE_ID, USERS_COLLECTION_ID, REGISTRATIONS_COLLECTION_ID } from '@/lib/appwrite';
import { Query } from 'appwrite';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// TypeScript declaration for jsPDF autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

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

const AdminVerifyAll = () => {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<RegistrationData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
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
    
    fetchAllRegistrations();
  }, [user, isAdmin, router]);

  useEffect(() => {
    // Apply filters
    let filtered = registrations;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(reg => 
        reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.registrationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.institution?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(reg => reg.status.toLowerCase() === statusFilter);
    }

    // Payment filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(reg => reg.paymentStatus.toLowerCase() === paymentFilter);
    }

    setFilteredRegistrations(filtered);
  }, [registrations, searchTerm, statusFilter, paymentFilter]);

  const fetchAllRegistrations = async () => {
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

      // Process registrations with user details
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

      setRegistrations(processedRegistrations);
      toast.success(`Loaded ${processedRegistrations.length} registrations`);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setError('Failed to fetch registrations. Please try again.');
      toast.error('Failed to fetch registrations');
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
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'pending':
      case 'pending_verification':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'rejected':
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const downloadAllVerificationsPDF = () => {
    try {
      console.log('Starting PDF generation...');
      console.log('Filtered registrations count:', filteredRegistrations.length);
      
      if (filteredRegistrations.length === 0) {
        toast.error('No registrations to export. Please check your filters.');
        return;
      }
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Website theme colors (matching your black/yellow design)
      const colors = {
        black: [0, 0, 0],           // Pure black background
        darkGray: [15, 23, 42],     // Dark gray sections
        yellow: [255, 193, 7],      // Yellow accent (matching header)
        yellowLight: [255, 235, 59], // Light yellow
        white: [255, 255, 255],     // White text
        gray: [107, 114, 128],      // Gray text
        success: [34, 197, 94],     // Green for approved
        warning: [251, 191, 36],    // Yellow for pending
        danger: [239, 68, 68],      // Red for rejected
        blue: [59, 130, 246]        // Blue accent
      };

      // Dark background matching website
      doc.setFillColor(colors.black[0], colors.black[1], colors.black[2]);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // Header section with yellow accent
      const headerHeight = 50;
      doc.setFillColor(colors.yellow[0], colors.yellow[1], colors.yellow[2]);
      doc.rect(0, 0, pageWidth, headerHeight, 'F');
      
      // Main title in black (on yellow background)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
      doc.text('NCC ROBOTICS WORKSHOP 2025', pageWidth / 2, 20, { align: 'center' });
      
      // Subtitle
      doc.setFontSize(14);
      doc.text('ALL USER VERIFICATIONS REPORT', pageWidth / 2, 32, { align: 'center' });
      
      // Generation info
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 42, { align: 'center' });

      // Stats section with cards
      const statsY = headerHeight + 10;
      const cardWidth = 45;
      const cardHeight = 25;
      const cardSpacing = 5;
      const startX = (pageWidth - (cardWidth * 4 + cardSpacing * 3)) / 2;
      
      const approvedCount = filteredRegistrations.filter(r => (r.status || '').toLowerCase() === 'approved').length;
      const pendingCount = filteredRegistrations.filter(r => (r.status || '').toLowerCase() === 'pending').length;
      const rejectedCount = filteredRegistrations.filter(r => (r.status || '').toLowerCase() === 'rejected').length;
      const totalCount = filteredRegistrations.length;

      // Total Users Card
      doc.setFillColor(colors.blue[0], colors.blue[1], colors.blue[2]);
      doc.roundedRect(startX, statsY, cardWidth, cardHeight, 3, 3, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
      doc.text(totalCount.toString(), startX + cardWidth/2, statsY + 12, { align: 'center' });
      doc.setFontSize(8);
      doc.text('TOTAL USERS', startX + cardWidth/2, statsY + 20, { align: 'center' });

      // Approved Users Card
      const card2X = startX + cardWidth + cardSpacing;
      doc.setFillColor(colors.success[0], colors.success[1], colors.success[2]);
      doc.roundedRect(card2X, statsY, cardWidth, cardHeight, 3, 3, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
      doc.text(approvedCount.toString(), card2X + cardWidth/2, statsY + 12, { align: 'center' });
      doc.setFontSize(8);
      doc.text('APPROVED', card2X + cardWidth/2, statsY + 20, { align: 'center' });

      // Pending Users Card
      const card3X = startX + (cardWidth + cardSpacing) * 2;
      doc.setFillColor(colors.warning[0], colors.warning[1], colors.warning[2]);
      doc.roundedRect(card3X, statsY, cardWidth, cardHeight, 3, 3, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
      doc.text(pendingCount.toString(), card3X + cardWidth/2, statsY + 12, { align: 'center' });
      doc.setFontSize(8);
      doc.text('PENDING', card3X + cardWidth/2, statsY + 20, { align: 'center' });

      // Rejected Users Card
      const card4X = startX + (cardWidth + cardSpacing) * 3;
      doc.setFillColor(colors.danger[0], colors.danger[1], colors.danger[2]);
      doc.roundedRect(card4X, statsY, cardWidth, cardHeight, 3, 3, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
      doc.text(rejectedCount.toString(), card4X + cardWidth/2, statsY + 12, { align: 'center' });
      doc.setFontSize(8);
      doc.text('REJECTED', card4X + cardWidth/2, statsY + 20, { align: 'center' });

      // Function to add page header on new pages
      const addPageHeader = (pageNum: number, totalPages: number) => {
        // Dark background
        doc.setFillColor(colors.black[0], colors.black[1], colors.black[2]);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');

        // Header section with yellow accent
        const headerHeight = 35;
        doc.setFillColor(colors.yellow[0], colors.yellow[1], colors.yellow[2]);
        doc.rect(0, 0, pageWidth, headerHeight, 'F');
        
        // Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
        doc.text('NCC ROBOTICS WORKSHOP 2025', pageWidth / 2, 12, { align: 'center' });
        
        // Page info
        doc.setFontSize(10);
        doc.text(`Page ${pageNum} of ${totalPages} | All User Verifications`, pageWidth / 2, 22, { align: 'center' });
        
        doc.setFontSize(8);
        doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 30, { align: 'center' });

        return headerHeight + 10; // Return where content should start
      };

      console.log('Preparing table data...');
      
      // Table section
      const tableStartY = statsY + cardHeight + 15;
      
      // Table title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
      doc.text('REGISTRATION DETAILS', 20, tableStartY - 5);

      // Function to truncate text
      const truncate = (text: string, maxLength: number) => {
        if (!text || text === 'N/A') return text || 'N/A';
        return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
      };

      // Calculate how many rows can fit per page
      const rowHeight = 8;
      const availableHeight = pageHeight - 100; // Reserve space for header and footer
      const maxRowsPerPage = Math.floor(availableHeight / rowHeight);
      const totalPages = Math.ceil(filteredRegistrations.length / maxRowsPerPage);
      
      console.log(`Total registrations: ${filteredRegistrations.length}`);
      console.log(`Max rows per page: ${maxRowsPerPage}`);
      console.log(`Total pages needed: ${totalPages}`);

      // Use autoTable with pagination
      console.log('Adding table to PDF with pagination...');

      try {
        // Prepare all table data (not limited to 30)
        const allTableData = filteredRegistrations.map((reg, index) => {
          try {
            return [
              (index + 1).toString(),
              truncate(reg.name || 'N/A', 20),
              truncate(reg.email || 'N/A', 25),
              truncate(reg.institution || 'N/A', 20),
              (reg.status || 'pending').toUpperCase(),
              (reg.paymentStatus || 'pending').toUpperCase()
            ];
          } catch (regError: any) {
            console.error(`Error processing registration ${index}:`, regError);
            return ['Error', 'Error processing data', 'Error', 'Error', 'Error', 'Error'];
          }
        });

        // Add table with pagination support
        doc.autoTable({
          startY: tableStartY,
          head: [['#', 'Name', 'Email', 'Institution', 'Status', 'Payment']],
          body: allTableData,
          theme: 'plain',
          headStyles: { 
            fillColor: [255, 193, 7], // Yellow header
            textColor: [0, 0, 0],     // Black text
            fontStyle: 'bold',
            fontSize: 9,
            halign: 'center'
          },
          bodyStyles: {
            fillColor: [15, 23, 42],  // Dark gray rows
            textColor: [255, 255, 255], // White text
            fontSize: 7,
            cellPadding: 2
          },
          alternateRowStyles: {
            fillColor: [30, 41, 59]   // Slightly lighter gray for alternate rows
          },
          columnStyles: {
            0: { cellWidth: 15, halign: 'center' },  // #
            1: { cellWidth: 35, halign: 'left' },    // Name
            2: { cellWidth: 50, halign: 'left' },    // Email
            3: { cellWidth: 35, halign: 'left' },    // Institution
            4: { cellWidth: 25, halign: 'center' },  // Status
            5: { cellWidth: 25, halign: 'center' }   // Payment
          },
          tableLineColor: [255, 193, 7], // Yellow borders
          tableLineWidth: 0.5,
          margin: { left: 20, right: 20 },
          showHead: 'everyPage',  // Show header on every page
          didDrawPage: function (data: any) {
            // Add custom page header if this is not the first page
            if (data.pageNumber > 1) {
              const currentPageNum = data.pageNumber;
              addPageHeader(currentPageNum, totalPages);
            }
          }
        });
        console.log(`Table added successfully with ${allTableData.length} rows across multiple pages`);
      } catch (tableError: any) {
        console.error('Error adding table:', tableError);
        
        // Enhanced fallback with pagination
        let currentPage = 1;
        let yPosition = tableStartY;
        let currentPageStartY = tableStartY;
        let itemsOnCurrentPage = 0;
        
        // Table header for first page
        doc.setFillColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
        doc.rect(20, yPosition, pageWidth - 40, 15, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(colors.yellow[0], colors.yellow[1], colors.yellow[2]);
        doc.text('REGISTRATION LIST', 22, yPosition + 10);
        yPosition += 20;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
        
        filteredRegistrations.forEach((reg, index) => {
          // Check if we need a new page
          if (yPosition > pageHeight - 50 && index < filteredRegistrations.length - 1) {
            // Add new page
            doc.addPage();
            currentPage++;
            currentPageStartY = addPageHeader(currentPage, Math.ceil(filteredRegistrations.length / maxRowsPerPage));
            yPosition = currentPageStartY + 20;
            itemsOnCurrentPage = 0;
            
            // Add table header on new page
            doc.setFillColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
            doc.rect(20, yPosition - 15, pageWidth - 40, 15, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(colors.yellow[0], colors.yellow[1], colors.yellow[2]);
            doc.text('REGISTRATION LIST (continued)', 22, yPosition - 5);
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
          }
          
          // Alternate row background
          if (itemsOnCurrentPage % 2 === 0) {
            doc.setFillColor(colors.darkGray[0], colors.darkGray[1], colors.darkGray[2]);
            doc.rect(20, yPosition - 3, pageWidth - 40, 8, 'F');
          }
          
          const statusColor = (reg.status || '').toLowerCase() === 'approved' ? colors.success :
                             (reg.status || '').toLowerCase() === 'pending' ? colors.warning : colors.danger;
          
          doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
          doc.text(`${index + 1}.`, 22, yPosition);
          doc.text(truncate(reg.name || 'N/A', 15), 30, yPosition);
          doc.text(truncate(reg.email || 'N/A', 20), 80, yPosition);
          
          // Status with color
          doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
          doc.text((reg.status || 'pending').toUpperCase(), 150, yPosition);
          
          yPosition += 8;
          itemsOnCurrentPage++;
        });
        
        console.log(`Fallback table completed: ${filteredRegistrations.length} registrations across ${currentPage} pages`);
      }

      // Footer section
      const footerY = pageHeight - 30;
      
      // Footer background
      doc.setFillColor(colors.yellow[0], colors.yellow[1], colors.yellow[2]);
      doc.rect(0, footerY, pageWidth, 30, 'F');
      
      // Footer content
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(colors.black[0], colors.black[1], colors.black[2]);
      doc.text('NCC ROBOTICS WORKSHOP 2025', pageWidth / 2, footerY + 12, { align: 'center' });
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`All ${filteredRegistrations.length} registrations included | Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, footerY + 20, { align: 'center' });

      console.log('Saving PDF...');
      
      // Save the PDF
      const fileName = `NCC_Robotics_All_Verifications_${new Date().toISOString().split('T')[0]}_${filteredRegistrations.length}users.pdf`;
      doc.save(fileName);
      
      console.log('PDF saved successfully:', fileName);
      toast.success(`PDF downloaded successfully! All ${filteredRegistrations.length} registrations included across multiple pages`);
      
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      });
      
      // More specific error message
      if (error?.message?.includes('autoTable')) {
        toast.error('PDF generation failed: Table formatting error. Try with fewer registrations.');
      } else if (error?.message?.includes('jsPDF')) {
        toast.error('PDF generation failed: Library error. Please try again.');
      } else {
        toast.error(`Failed to generate PDF: ${error?.message || 'Unknown error'}`);
      }
    }
  };

  const viewIndividualVerification = (registrationId: string) => {
    window.open(`/verify/${registrationId}`, '_blank');
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
            <p className="text-xl font-semibold text-white">Loading All Verifications...</p>
            <p className="text-gray-400 mt-2">Please wait while we fetch all registration data</p>
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
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-yellow-600/10" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" />
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
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-3xl mb-4"
                >
                  <Shield className="w-8 h-8 text-black" />
                </motion.div>
                <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-wider">
                  All User <span className="text-yellow-400">Verifications</span>
                </h1>
                <p className="text-gray-400 font-medium text-lg">
                  Admin Panel - NCC Robotics Workshop 2025
                </p>
              </div>
            </div>
            
            <motion.button
              onClick={downloadAllVerificationsPDF}
              className="group relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-black py-3 px-6 rounded-xl flex items-center transition-all duration-300 uppercase tracking-wider shadow-lg shadow-yellow-500/30">
                <Download className="w-5 h-5 mr-2" />
                Download All PDF
              </div>
            </motion.button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search registrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors appearance-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Payment Filter */}
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors appearance-none cursor-pointer"
              >
                <option value="all">All Payments</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-center bg-gray-800 rounded-xl px-4 py-3 border border-gray-600">
              <Users className="w-5 h-5 text-yellow-400 mr-2" />
              <span className="text-white font-medium">
                {filteredRegistrations.length} / {registrations.length} registrations
              </span>
            </div>
          </div>
        </motion.div>

        {/* Registrations Grid */}
        {filteredRegistrations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Bot className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">No registrations found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredRegistrations.map((registration, index) => (
              <motion.div
                key={registration.registrationId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900 rounded-2xl shadow-xl p-6 border-2 border-gray-700 hover:border-yellow-500/50 transition-all duration-300 relative overflow-hidden group"
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
                  <div className="absolute top-4 right-4">
                    <Bot className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
                
                <div className="relative z-10">
                  {/* Status Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      {getStatusIcon(registration.status)}
                      <span className={`ml-2 font-bold uppercase text-sm ${getStatusColor(registration.status)}`}>
                        {registration.status}
                      </span>
                    </div>
                    <button
                      onClick={() => viewIndividualVerification(registration.registrationId)}
                      className="p-2 rounded-lg bg-gray-800 hover:bg-yellow-500 hover:text-black transition-all duration-300 group"
                      title="View Individual Verification"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Registration ID */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Registration ID</p>
                    <p className="text-yellow-400 font-bold text-sm">{registration.registrationId}</p>
                  </div>

                  {/* User Details */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Name</p>
                      <p className="text-white font-medium">{registration.name}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Email</p>
                      <p className="text-white font-medium text-sm break-all">{registration.email}</p>
                    </div>

                    {registration.phone !== 'N/A' && (
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Phone</p>
                        <p className="text-white font-medium">{registration.phone}</p>
                      </div>
                    )}

                    {registration.institution !== 'N/A' && (
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Institution</p>
                        <p className="text-white font-medium text-sm">{registration.institution}</p>
                      </div>
                    )}

                    {registration.studentId !== 'N/A' && (
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Student ID</p>
                        <p className="text-white font-medium">{registration.studentId}</p>
                      </div>
                    )}

                    {/* Payment Status */}
                    <div className="pt-3 border-t border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Payment</p>
                          <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                            registration.paymentStatus === 'completed' || registration.paymentStatus === 'approved' 
                              ? 'bg-green-500/20 text-green-400'
                              : registration.paymentStatus === 'pending'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {registration.paymentStatus}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Fee</p>
                          <p className="text-white font-bold">৳{registration.registrationFee}</p>
                        </div>
                      </div>
                    </div>

                    {/* Registration Date */}
                    <div className="pt-2">
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Registration Date</p>
                      <p className="text-white font-medium text-sm">
                        {new Date(registration.submittedAt).toLocaleDateString('en-US', {
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

export default AdminVerifyAll;
