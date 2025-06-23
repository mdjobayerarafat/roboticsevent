import { Client, Account, Databases, Storage, Functions } from 'appwrite';

const client = new Client();

// Appwrite configuration - Replace with your actual Appwrite project details
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://aibackend.cloud/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '685710e600212af697a3');

// Initialize Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

// Database and Collection IDs - Replace with your actual IDs
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'robotics-workshop-db';
export const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || 'users';
export const REGISTRATIONS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_REGISTRATIONS_COLLECTION_ID || 'registrations';
export const RESOURCES_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_RESOURCES_COLLECTION_ID || '685912df00327eef53ab';
export const ANNOUNCEMENTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_ANNOUNCEMENTS_COLLECTION_ID || '68591008003aabe45da5';
export const SWAG_REQUESTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_SWAG_REQUESTS_COLLECTION_ID || 'swag-requests';

// Storage Bucket IDs
export const DOCUMENTS_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_DOCUMENTS_BUCKET_ID || 'documents';
export const RESOURCES_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_RESOURCES_BUCKET_ID || '6857cfef000cc1a0ae39';
export const AVATARS_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_AVATARS_BUCKET_ID || 'avatars';
export const STUDENT_ID_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_STUDENT_ID_BUCKET_ID || '6857cbf3002fcad8dc10'; // id proof bucket
export const PAYMENT_SCREENSHOT_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_PAYMENT_SCREENSHOT_BUCKET_ID || '6857cbfd0023abf8876e'; // paymentss bucket

// Function IDs
export const PDF_GENERATOR_FUNCTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PDF_FUNCTION_ID || 'pdf-generator';
export const EMAIL_NOTIFICATION_FUNCTION_ID = process.env.NEXT_PUBLIC_APPWRITE_EMAIL_FUNCTION_ID || 'email-notifications';

export { client };

// Types for better TypeScript support
export interface User {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  name: string;
  email: string;
  phone?: string;
  institution?: string;
  studentId?: string;
  role: 'user' | 'admin' | 'guest';
  avatar?: string;
  isVerified: boolean;
  studentIdFileId?: string;    // ID of the Student ID file in the id proof bucket
  paymentScreenshotFileId?: string;  // ID of the payment screenshot in the paymentss bucket
}

export interface Registration {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;
  eventType: 'workshop' | 'competition' | 'both';
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    institution: string;
    studentId: string;
    emergencyContact: string;
  };
  documents: {
    studentId?: string;
    paymentScreenshot?: string;
  };
  paymentStatus: 'pending' | 'verification_pending' | 'verified' | 'rejected' | 'completed' | 'failed';
  studentIdFileId?: string;        // ID of file in id proof bucket (6857cbf3002fcad8dc10)
  paymentScreenshotFileId?: string; // ID of file in paymentss bucket (6857cbfd0023abf8876e)
  registrationId: string;
  status: 'pending' | 'pending_verification' | 'approved' | 'rejected';
  submittedAt?: string;
  registrationFee?: number;
}

export interface Resource {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: 'pdf' | 'zip' | 'video' | 'link';
  uploadedBy: string;
  isPublic: boolean;
  tags: string[];
}

export interface Announcement {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  imageUrl?: string;
  videoUrl?: string;
  isActive: boolean;
  createdBy: string;
  targetAudience: 'all' | 'registered' | 'admins';
}

export interface SwagRequest {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  userId: string;
  requestType: 'tshirt' | 'stickers' | 'kit' | 'all';
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  status: 'pending' | 'approved' | 'shipped' | 'delivered';
  trackingNumber?: string;
  approvedBy?: string;
  notes?: string;
}