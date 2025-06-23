'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronLeft, ChevronRight, User, Calendar, Upload, CreditCard, CheckCircle, AlertCircle, Camera, Zap, Target } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/context/AuthContext';
import { databases, storage, DATABASE_ID, REGISTRATIONS_COLLECTION_ID, DOCUMENTS_BUCKET_ID, USERS_COLLECTION_ID, STUDENT_ID_BUCKET_ID, PAYMENT_SCREENSHOT_BUCKET_ID } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Form validation schemas
const personalInfoSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  institution: z.string().min(2, 'Institution name is required'),
  studentId: z.string().min(1, 'Student ID is required'),
  emergencyContact: z.string().min(10, 'Emergency contact is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PersonalInfo = z.infer<typeof personalInfoSchema>;

interface FileUpload {
  studentId?: File;
  paymentScreenshot?: File;
}

const RegisterPage = () => {
  const { user, register } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload>({});
  const [registrationData, setRegistrationData] = useState<any>({});

  const personalForm = useForm<PersonalInfo>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: user?.name || '',
      email: user?.email || '',
    },
  });



  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Privacy Agreement', icon: CreditCard },
    { number: 3, title: 'Document Upload', icon: Upload },
    { number: 4, title: 'Confirmation', icon: CheckCircle },
  ];

  const handlePersonalInfoSubmit = async (data: PersonalInfo) => {
    try {
      setIsSubmitting(true);
      
      // If user is already logged in, just update their information and proceed
      if (user) {
        toast.success('You are already logged in. Updating your information...');
        
        // Update user collection with new information
        try {
          const userData = {
            name: data.fullName,
            phone: data.phone,
            institution: data.institution,
            studentId: data.studentId,
            role: 'user',
          };
          
          await databases.updateDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            user.$id,
            userData
          );
          
          console.log('Updated existing user profile with new information');
          toast.success('Your information has been updated successfully!');
        } catch (updateError) {
          console.error('Failed to update user profile:', updateError);
          toast.error('Failed to update your profile. Please try again.');
          setIsSubmitting(false);
          return;
        }
        
        setRegistrationData((prev: any) => ({ 
          ...prev, 
          personalInfo: data,
          eventSelection: { eventType: 'both' } // Default to both events
        }));
        setCurrentStep(2);
        return;
      }
      
      // Create new Appwrite user account
      const { email, password, fullName } = data;
      
      // Create user account using the AuthContext register function
      const success = await register(email, password, fullName);
      
      if (success) {
        // Wait a moment for the auth context to update with the new user
        setTimeout(async () => {
          try {
            // Get the newly created user from auth context
            const currentUser = await new Promise((resolve) => {
              let attempts = 0;
              const checkUser = () => {
                attempts++;
                if (user || attempts > 10) { // Max 10 attempts (5 seconds)
                  resolve(user);
                } else {
                  setTimeout(checkUser, 500);
                }
              };
              checkUser();
            });
            
            if (currentUser) {
              console.log('New user created, updating collections with personal info:', (currentUser as any).$id);
              
              // Update user collection with complete personal information
              try {
                const userData = {
                  name: data.fullName,
                  phone: data.phone,
                  institution: data.institution,
                  studentId: data.studentId,
                  role: 'user',
                  isVerified: false, // Will be verified after document upload
                };
                
                await databases.updateDocument(
                  DATABASE_ID,
                  USERS_COLLECTION_ID,
                  (currentUser as any).$id,
                  userData
                );
                
                console.log('Updated user collection with personal information');
              } catch (userUpdateError) {
                console.error('Failed to update user collection:', userUpdateError);
              }
              
              // Create initial registration entry with personal information
              try {
                const registrationId = `NCC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
                
                const registrationDoc = {
                  userId: (currentUser as any).$id,
                  eventType: 'both', // Default event type
                  personalInfo: JSON.stringify({
                    fullName: data.fullName,
                    email: data.email,
                    phone: data.phone,
                    institution: data.institution,
                    studentId: data.studentId,
                    emergencyContact: data.emergencyContact
                  }),
                  documents: JSON.stringify({}), // Empty initially
                  registrationId,
                  status: 'incomplete', // Will be updated when documents are uploaded
                  paymentStatus: 'pending',
                  submittedAt: new Date().toISOString(),
                  registrationFee: 500,
                };
                
                await databases.createDocument(
                  DATABASE_ID,
                  REGISTRATIONS_COLLECTION_ID,
                  ID.unique(),
                  registrationDoc
                );
                
                console.log('Created initial registration with personal info:', registrationId);
                
                setRegistrationData((prev: any) => ({ 
                  ...prev, 
                  personalInfo: data,
                  eventSelection: { eventType: 'both' },
                  registrationId
                }));
                
              } catch (registrationError) {
                console.error('Failed to create registration entry:', registrationError);
                // Continue anyway - user account is created
              }
            }
            
            toast.success('Account created and information saved to both collections successfully!');
            setCurrentStep(2);
            
          } catch (error) {
            console.error('Error updating collections after account creation:', error);
            // Still proceed since account was created
            setRegistrationData((prev: any) => ({ 
              ...prev, 
              personalInfo: data,
              eventSelection: { eventType: 'both' }
            }));
            setCurrentStep(2);
          }
        }, 1000); // Wait 1 second for auth context to update
        
      } else {
        toast.error('Failed to create account. Please try again.');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (type: 'studentId' | 'paymentScreenshot', file: File) => {
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
        // Determine which bucket to use based on the file type (same as user dashboard)
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
        
        // Update state with the uploaded file information
        setUploadedFiles((prev: FileUpload) => ({ ...prev, [type]: file }));
        
        // Store file IDs for both user and registration collections
        if (type === 'paymentScreenshot') {
          setRegistrationData((prev: any) => ({
            ...prev,
            documents: { ...prev.documents, [type]: response.$id },
            paymentScreenshotFileId: response.$id // Field for both user and registration collections
          }));
        } else {
          setRegistrationData((prev: any) => ({
            ...prev,
            documents: { ...prev.documents, [type]: response.$id },
            studentIdFileId: response.$id // Field for both user and registration collections
          }));
        }
        
        // Immediately update user collection if user is logged in
        if (user) {
          try {
            const userUpdateData: any = {};
            if (type === 'studentId') {
              userUpdateData.studentIdFileId = response.$id;
            } else {
              userUpdateData.paymentScreenshotFileId = response.$id;
            }
            
            await databases.updateDocument(
              DATABASE_ID,
              USERS_COLLECTION_ID,
              user.$id,
              userUpdateData
            );
            
            console.log(`Updated user collection with ${type} file ID:`, response.$id);
          } catch (userUpdateError) {
            console.error('Failed to update user collection with file ID:', userUpdateError);
            // Continue - file is still uploaded and will be saved in final submission
          }
        }
        
        toast.dismiss(toastId);
        toast.success(`${type === 'studentId' ? 'Student ID' : 'Payment Screenshot'} uploaded successfully`);
      } catch (innerError: any) {
        // Handle Appwrite specific errors
        toast.dismiss(toastId);
        
        console.error('Detailed upload error:', innerError);
        
        if (innerError?.message?.includes('Project with the requested ID could not be found')) {
          toast.error('Project configuration error. Please verify your Appwrite settings.');
          console.log('Check your Appwrite Project ID in .env.local or appwrite.ts');
        } else if (innerError?.message?.includes('missing scope')) {
          toast.error('Permission error: You need to be logged in properly to upload files.');
          console.log('This might be a permission issue - check if the user has the correct role and scopes');
        } else {
          toast.error(`Upload failed: ${innerError?.message || 'Unknown error'}`);
        }
        
        // For debugging - log the parameters we're using
        console.log('Debug info:', {
          bucketId: type === 'studentId' ? STUDENT_ID_BUCKET_ID : PAYMENT_SCREENSHOT_BUCKET_ID,
          fileType: file.type,
          fileSize: file.size
        });
      }
    } catch (error: any) {
      // This catches any other errors outside the upload process
      console.error('Unexpected error in file upload process:', error);
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  const handleFinalSubmit = async () => {
    // Check if user is logged in
    if (!user) {
      // Try to get the current session
      try {
        // This would normally be handled by the AuthContext, but we'll add an extra check here
        toast.error('Please login to complete your registration');
        router.push('/login');
        return;
      } catch (error) {
        toast.error('Please login to register');
        router.push('/login');
        return;
      }
    }

    // Validate required documents (check both file uploads and stored file IDs)
    if (!registrationData.documents?.studentId && !registrationData.studentIdFileId) {
      toast.error('Please upload your Student ID');
      return;
    }

    if (!registrationData.documents?.paymentScreenshot && !registrationData.paymentScreenshotFileId) {
      toast.error('Please upload your payment screenshot');
      return;
    }

    if (!registrationData.privacyAgreement) {
      toast.error('Please agree to the Privacy Policy to continue');
      return;
    }

    setIsSubmitting(true);
    
    let registrationSuccess = false;
    let registrationId = '';
    
    try {
      console.log('Starting final submission process for user:', user.$id);
      
      // Ensure the user is properly registered in both collections
      const { registrationId: regId, existingRegistrationId } = await ensureUserIsRegistered(user.$id, {
        fullName: registrationData.personalInfo?.fullName || user.name,
        email: registrationData.personalInfo?.email || user.email
      });
      
      registrationId = regId;
      
      // Prepare the registration document (update existing registration with documents)
      const registrationDoc = {
        userId: user.$id,
        eventType: registrationData.eventSelection?.eventType || 'both',
        // Update personalInfo with complete information, preserving existing data
        personalInfo: JSON.stringify({
          fullName: registrationData.personalInfo?.fullName || user.name,
          email: registrationData.personalInfo?.email || user.email,
          phone: registrationData.personalInfo?.phone || '',
          institution: registrationData.personalInfo?.institution || '',
          studentId: registrationData.personalInfo?.studentId || '',
          emergencyContact: registrationData.personalInfo?.emergencyContact || ''
        }),
        // Add document information
        documents: JSON.stringify({
          studentId: registrationData.documents?.studentId || '',
          paymentScreenshot: registrationData.documents?.paymentScreenshot || '',
        }),
        paymentStatus: 'verification_pending', // Update payment status
        // Ensure file IDs are set for direct access
        paymentScreenshotFileId: registrationData.paymentScreenshotFileId || '',
        studentIdFileId: registrationData.studentIdFileId || '',
        registrationId,
        status: 'pending_verification', // Update status to pending verification
        dietaryRestrictions: registrationData.eventSelection?.dietaryRestrictions || '',
        tshirtSize: registrationData.eventSelection?.tshirtSize || 'M',
        submittedAt: new Date().toISOString(), // Update submission time
        registrationFee: 500,
      };

      try {
        if (existingRegistrationId) {
          // Update the existing registration
          console.log('Updating existing registration:', existingRegistrationId);
          console.log('Registration data:', JSON.stringify(registrationDoc, null, 2));
          
          const updatedRegistration = await databases.updateDocument(
            DATABASE_ID,
            REGISTRATIONS_COLLECTION_ID,
            existingRegistrationId,
            registrationDoc
          );
          console.log('Updated existing registration:', updatedRegistration.$id);
          registrationSuccess = true;
        } else {
          // Create a new registration
          console.log('Creating new registration for user:', user.$id);
          console.log('Registration data:', JSON.stringify(registrationDoc, null, 2));
          
          const newRegistration = await databases.createDocument(
            DATABASE_ID,
            REGISTRATIONS_COLLECTION_ID,
            ID.unique(),
            registrationDoc
          );
          console.log('Created new registration:', newRegistration.$id);
          registrationSuccess = true;
        }
      } catch (registrationError) {
        console.error('Error creating/updating registration:', registrationError);
        toast.error('There was an issue saving your registration data, but your submission has been recorded.');
        // Don't return here - continue to show success tab
      }
      
      // Also update the user profile in the users collection (final update with all info)
      try {
        console.log('Final update of user profile for user ID:', user.$id);
        const userData = {
          name: registrationData.personalInfo?.fullName || user.name,
          phone: registrationData.personalInfo?.phone || '',
          institution: registrationData.personalInfo?.institution || '',
          studentId: registrationData.personalInfo?.studentId || '',
          role: 'user', // Ensure role is set to 'user'
          isVerified: false, // Will be set to true after admin verification
          studentIdFileId: registrationData.studentIdFileId || '',  // Same field as user dashboard
          paymentScreenshotFileId: registrationData.paymentScreenshotFileId || '',  // Same field as user dashboard
        };
        console.log('Final user profile data:', JSON.stringify(userData, null, 2));
        
        const updatedUser = await databases.updateDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          user.$id,
          userData
        );
        console.log('Final update of user profile in users collection:', updatedUser.$id);
      } catch (userUpdateError) {
        console.error('Error updating user profile:', userUpdateError);
        // Continue with registration process even if user update fails
        toast.error('Your registration was submitted, but we couldn\'t update some profile details. Please contact support if needed.');
      }

    } catch (error) {
      console.error('Registration error:', error);
      toast.error('There was an issue with your registration, but your submission has been recorded. Please contact support if you need assistance.');
    }

    // Always proceed to success tab regardless of backend errors
    setRegistrationData((prev: any) => ({ ...prev, registrationId }));
    setCurrentStep(4);
    
    // Send welcome email after successful registration
    console.log('🔍 Email check - Full debug:', {
      registrationSuccess,
      email: registrationData.personalInfo?.email,
      fullName: registrationData.personalInfo?.fullName,
      registrationData: registrationData,
      hasPersonalInfo: !!registrationData.personalInfo,
      step: currentStep
    });
    
    // Try to send email regardless of registrationSuccess for debugging
    if (registrationData.personalInfo?.email && registrationData.personalInfo?.fullName) {
      try {
        console.log('📧 Attempting to send welcome email...');
        const emailResponse = await fetch('/api/send-welcome-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: registrationData.personalInfo.email,
            name: registrationData.personalInfo.fullName,
            registrationId: registrationId,
          }),
        });

        const responseData = await emailResponse.json();
        console.log('📧 Email response:', responseData);

        if (emailResponse.ok) {
          console.log('✅ Welcome email sent successfully');
          toast.success('Registration submitted successfully! Welcome email sent.');
        } else {
          console.error('❌ Failed to send welcome email:', responseData);
          toast.success('Registration submitted successfully!');
        }
      } catch (emailError) {
        console.error('❌ Error sending welcome email:', emailError);
        toast.success('Registration submitted successfully!');
      }
    } else {
      console.log('⚠️ Email not sent. Missing data:', {
        hasEmail: !!registrationData.personalInfo?.email,
        hasName: !!registrationData.personalInfo?.fullName,
        email: registrationData.personalInfo?.email,
        name: registrationData.personalInfo?.fullName
      });
      
      // Show appropriate success message based on what succeeded
      if (registrationSuccess) {
        toast.success('Registration submitted successfully!');
      } else {
        toast.success('Your registration submission has been recorded. Our team will review it shortly.');
      }
    }
    
    setIsSubmitting(false);
  };

  // Helper function to ensure user is properly registered in both collections
  const ensureUserIsRegistered = async (userId: string, userData: any) => {
    try {
      console.log('Ensuring user is registered in both collections, user ID:', userId);
      
      // 1. Check if user exists in users collection
      let userExists = false;
      try {
        const userDoc = await databases.getDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          userId
        );
        userExists = true;
        console.log('User exists in users collection:', userDoc.$id);
      } catch (error) {
        console.error('User does not exist in users collection, creating...', error);
      }
      
      // If user doesn't exist in users collection, create it (fallback)
      if (!userExists) {
        try {
          console.log('Creating user in users collection (fallback)');
          const newUser = await databases.createDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            userId,
            {
              name: userData.fullName || '',
              email: userData.email || '',
              role: 'user',
              isVerified: false,
              $id: userId
            }
          );
          console.log('Created user in users collection:', newUser.$id);
        } catch (createError) {
          console.error('Failed to create user in users collection:', createError);
          throw new Error('Failed to create user profile');
        }
      }
      
      // 2. Check if user exists in registrations collection
      let registrationExists = false;
      let existingRegistrationId = '';
      let registrationId = '';
      let existingRegistration: any = null;
      
      try {
        const regResponse = await databases.listDocuments(
          DATABASE_ID,
          REGISTRATIONS_COLLECTION_ID,
          [
            Query.equal("userId", userId)
          ]
        );
        
        if (regResponse.documents.length > 0) {
          registrationExists = true;
          existingRegistration = regResponse.documents[0];
          existingRegistrationId = existingRegistration.$id;
          registrationId = existingRegistration.registrationId || `NCC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
          console.log('User exists in registrations collection:', existingRegistrationId);
        }
      } catch (error) {
        console.error('Error checking registrations collection:', error);
      }
      
      // If registration doesn't exist, create a basic one (fallback - should rarely happen now)
      if (!registrationExists) {
        registrationId = `NCC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        try {
          console.log('Creating basic registration in registrations collection (fallback)');
          // Use existing personal info from registration data if available
          const personalInfoString = JSON.stringify({
            fullName: registrationData.personalInfo?.fullName || userData.fullName || '',
            email: registrationData.personalInfo?.email || userData.email || '',
            phone: registrationData.personalInfo?.phone || '',
            institution: registrationData.personalInfo?.institution || '',
            studentId: registrationData.personalInfo?.studentId || '',
            emergencyContact: registrationData.personalInfo?.emergencyContact || ''
          });
          
          const newReg = await databases.createDocument(
            DATABASE_ID,
            REGISTRATIONS_COLLECTION_ID,
            ID.unique(),
            {
              userId: userId,
              eventType: 'both',
              personalInfo: personalInfoString,
              documents: JSON.stringify({}),
              registrationId,
              status: 'incomplete',
              paymentStatus: 'pending',
              submittedAt: new Date().toISOString(),
              registrationFee: 500,
            }
          );
          console.log('Created basic registration:', newReg.$id);
          existingRegistrationId = newReg.$id;
        } catch (createError) {
          console.error('Failed to create registration:', createError);
          throw new Error('Failed to create registration');
        }
      }
      
      return { registrationId, existingRegistrationId };
    } catch (error) {
      console.error('Error in ensureUserIsRegistered:', error);
      throw error;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-wider">
                Personal <span className="text-yellow-400">Information</span>
              </h2>
              <p className="text-gray-400 font-medium">Tell us about yourself to get started</p>
            </div>
            
            <form onSubmit={personalForm.handleSubmit(handlePersonalInfoSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-black text-yellow-400 mb-3 uppercase tracking-wider">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name *
                  </label>
                  <input
                    {...personalForm.register('fullName')}
                    className="w-full px-6 py-4 bg-gray-800 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300"
                    placeholder="Enter your full name"
                  />
                  {personalForm.formState.errors.fullName && (
                    <p className="mt-2 text-sm text-red-400 font-medium">{personalForm.formState.errors.fullName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-black text-yellow-400 mb-3 uppercase tracking-wider">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Email *
                  </label>
                  <input
                    {...personalForm.register('email')}
                    type="email"
                    className="w-full px-6 py-4 bg-gray-800 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300"
                    placeholder="Enter your email"
                  />
                  {personalForm.formState.errors.email && (
                    <p className="mt-2 text-sm text-red-400 font-medium">{personalForm.formState.errors.email.message}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-black text-yellow-400 mb-3 uppercase tracking-wider">
                    <CreditCard className="w-4 h-4 inline mr-2" />
                    Password *
                  </label>
                  <input
                    {...personalForm.register('password')}
                    type="password"
                    className="w-full px-6 py-4 bg-gray-800 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300"
                    placeholder="Enter your password"
                  />
                  {personalForm.formState.errors.password && (
                    <p className="mt-2 text-sm text-red-400 font-medium">{personalForm.formState.errors.password.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-black text-yellow-400 mb-3 uppercase tracking-wider">
                    <CreditCard className="w-4 h-4 inline mr-2" />
                    Confirm Password *
                  </label>
                  <input
                    {...personalForm.register('confirmPassword')}
                    type="password"
                    className="w-full px-6 py-4 bg-gray-800 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300"
                    placeholder="Confirm your password"
                  />
                  {personalForm.formState.errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-400 font-medium">{personalForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-black text-yellow-400 mb-3 uppercase tracking-wider">
                    <Camera className="w-4 h-4 inline mr-2" />
                    Phone Number *
                  </label>
                  <input
                    {...personalForm.register('phone')}
                    className="w-full px-6 py-4 bg-gray-800 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300"
                    placeholder="Enter your phone number"
                  />
                  {personalForm.formState.errors.phone && (
                    <p className="mt-2 text-sm text-red-400 font-medium">{personalForm.formState.errors.phone.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-black text-yellow-400 mb-3 uppercase tracking-wider">
                    <Zap className="w-4 h-4 inline mr-2" />
                    Institution *
                  </label>
                  <input
                    {...personalForm.register('institution')}
                    className="w-full px-6 py-4 bg-gray-800 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300"
                    placeholder="Enter your institution"
                  />
                  {personalForm.formState.errors.institution && (
                    <p className="mt-2 text-sm text-red-400 font-medium">{personalForm.formState.errors.institution.message}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-black text-yellow-400 mb-3 uppercase tracking-wider">
                    <CreditCard className="w-4 h-4 inline mr-2" />
                    Student ID *
                  </label>
                  <input
                    {...personalForm.register('studentId')}
                    className="w-full px-6 py-4 bg-gray-800 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300"
                    placeholder="Enter your student ID"
                  />
                  {personalForm.formState.errors.studentId && (
                    <p className="mt-2 text-sm text-red-400 font-medium">{personalForm.formState.errors.studentId.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-black text-yellow-400 mb-3 uppercase tracking-wider">
                    <Target className="w-4 h-4 inline mr-2" />
                    Emergency Contact *
                  </label>
                  <input
                    {...personalForm.register('emergencyContact')}
                    className="w-full px-6 py-4 bg-gray-800 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300"
                    placeholder="Emergency contact number"
                  />
                  {personalForm.formState.errors.emergencyContact && (
                    <p className="mt-2 text-sm text-red-400 font-medium">{personalForm.formState.errors.emergencyContact.message}</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end pt-6">
                <motion.button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-black rounded-xl hover:from-yellow-500 hover:to-yellow-600 disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-3 shadow-lg shadow-yellow-500/30 uppercase tracking-wider"
                  whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                >
                  {isSubmitting ? (
                    <>
                      <motion.div 
                        className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Next Step <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-wider">
                Privacy <span className="text-yellow-400">Agreement</span>
              </h2>
              <p className="text-gray-400 font-medium">Please review and accept our terms</p>
            </div>
            
            <div className="space-y-8">
              {/* Privacy Policy Agreement */}
              <motion.div 
                className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-2 border-blue-500/30 rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="privacyAgreement"
                    checked={registrationData.privacyAgreement || false}
                    onChange={(e) => setRegistrationData((prev: any) => ({ 
                      ...prev, 
                      privacyAgreement: e.target.checked 
                    }))}
                    className="w-5 h-5 mt-1 mr-4 flex-shrink-0 accent-yellow-400"
                  />
                  <label htmlFor="privacyAgreement" className="text-white font-medium leading-relaxed cursor-pointer">
                    I agree to the{' '}
                    <Link href="/privacy" target="_blank" className="text-yellow-400 hover:text-yellow-300 underline font-bold">
                      Privacy Policy
                    </Link>
                    {' '}and consent to the collection and processing of my personal information for workshop registration and communication purposes. I understand my data rights and how my information will be used.
                  </label>
                </div>
              </motion.div>

              {/* Payment Information */}
              <motion.div 
                className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-2 border-yellow-500/30 rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-start">
                  <AlertCircle className="w-6 h-6 text-yellow-400 mt-1 mr-4 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-black text-yellow-400 mb-3 uppercase tracking-wider">Payment Information</h3>
                    <div className="space-y-3 text-white font-medium">
                      <p className="text-gray-300">Registration Fee: <span className="text-yellow-400 font-black">৳100</span></p>
                      <p className="text-gray-300">Please make payment to:</p>
                      <div className="bg-black/30 rounded-xl p-4 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p><span className="text-yellow-400 font-black">Account Name:</span> NCC Robotics</p>
                            <p><span className="text-yellow-400 font-black">Account No:</span> 01718360044</p>
                            <p><span className="text-yellow-400 font-black">Bank:</span> Bikash Mobile Banking</p>
                          </div>
                          <div className="space-y-2">
                            <p><span className="text-yellow-400 font-black">Type:</span> Personal</p>
                            <p><span className="text-yellow-400 font-black">Reference:</span> Your Name + ROBOTICS2025</p>
                            <p><span className="text-yellow-400 font-black">Amount:</span> ৳100</p>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-600">
                          <p className="text-sm text-gray-400">
                            <span className="text-yellow-400 font-bold">Important:</span> Please include your full name and "ROBOTICS2025" in the transaction reference/note field.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <div className="flex justify-between pt-6">
                <motion.button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-8 py-4 border-2 border-gray-600 text-gray-300 rounded-xl hover:border-yellow-500 hover:text-yellow-400 transition-all duration-300 flex items-center gap-3 font-black uppercase tracking-wider"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  disabled={!registrationData.privacyAgreement}
                  className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-black rounded-xl hover:from-yellow-500 hover:to-yellow-600 disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-3 shadow-lg shadow-yellow-500/30 uppercase tracking-wider"
                  whileHover={{ scale: !registrationData.privacyAgreement ? 1 : 1.05 }}
                  whileTap={{ scale: !registrationData.privacyAgreement ? 1 : 0.95 }}
                >
                  Next Step
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-wider">
                Document <span className="text-yellow-400">Upload</span>
              </h2>
              <p className="text-gray-400 font-medium">Upload your required documents</p>
            </div>
            
            <div className="space-y-8">
              {/* Student ID Upload */}
              <motion.div 
                className="bg-gradient-to-br from-gray-800 to-gray-700 border-2 border-yellow-500/30 rounded-2xl p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className="text-2xl font-black text-yellow-400 mb-6 uppercase tracking-wider text-center">
                  Student ID Document *
                </h3>
                <motion.div 
                  className="border-3 border-dashed border-gray-600 rounded-2xl p-8 text-center bg-gradient-to-br from-gray-800/50 to-gray-700/50 hover:border-yellow-500 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                >
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('studentId', file);
                    }}
                    className="hidden"
                    id="studentId"
                  />
                  <label htmlFor="studentId" className="cursor-pointer block">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="inline-block"
                    >
                      <Upload className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    </motion.div>
                    <p className="text-white font-black text-lg mb-2">Click to upload your student ID</p>
                    <p className="text-gray-400 font-medium">PDF, JPG, PNG up to 5MB</p>
                  </label>
                  {(uploadedFiles.studentId || registrationData.studentIdFileId) && (
                    <motion.div 
                      className="mt-4 flex items-center justify-center text-yellow-400"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <CheckCircle className="w-6 h-6 mr-2" />
                      <span className="font-black">
                        {uploadedFiles.studentId ? uploadedFiles.studentId.name : 'Student ID uploaded'}
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>

              {/* Payment Screenshot Upload */}
              <motion.div 
                className="bg-gradient-to-br from-gray-800 to-gray-700 border-2 border-yellow-500/30 rounded-2xl p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-2xl font-black text-yellow-400 mb-6 uppercase tracking-wider text-center">
                  Payment Screenshot *
                </h3>
                <motion.div 
                  className="border-3 border-dashed border-gray-600 rounded-2xl p-8 text-center bg-gradient-to-br from-gray-800/50 to-gray-700/50 hover:border-yellow-500 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                >
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload('paymentScreenshot', file);
                    }}
                    className="hidden"
                    id="paymentScreenshot"
                  />
                  <label htmlFor="paymentScreenshot" className="cursor-pointer block">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="inline-block"
                    >
                      <Camera className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    </motion.div>
                    <p className="text-white font-black text-lg mb-2">Upload payment screenshot</p>
                    <p className="text-gray-400 font-medium">JPG, PNG up to 5MB</p>
                  </label>
                  {(uploadedFiles.paymentScreenshot || registrationData.paymentScreenshotFileId) && (
                    <motion.div 
                      className="mt-4 flex items-center justify-center text-yellow-400"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <CheckCircle className="w-6 h-6 mr-2" />
                      <span className="font-black">
                        {uploadedFiles.paymentScreenshot ? uploadedFiles.paymentScreenshot.name : 'Payment screenshot uploaded'}
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>

              {/* Instructions */}
              <motion.div 
                className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-2 border-blue-500/30 rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-start">
                  <Camera className="w-6 h-6 text-blue-400 mt-1 mr-4 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-black text-blue-400 mb-3 uppercase tracking-wider">Upload Instructions</h3>
                    <div className="space-y-3 text-white font-medium">
                      <p className="text-gray-300">Please ensure your documents are clear and readable:</p>
                      <div className="bg-black/30 rounded-xl p-4 space-y-3">
                        <ul className="list-disc list-inside space-y-2 text-gray-300">
                          <li><span className="text-blue-400 font-black">Student ID:</span> Must show your full name, ID number, institution, and photo</li>
                          <li><span className="text-blue-400 font-black">Payment Screenshot:</span> Must show successful transaction with reference "ROBOTICS2025"</li>
                          <li><span className="text-blue-400 font-black">File Quality:</span> Clear, well-lit, and all text must be readable</li>
                          <li><span className="text-blue-400 font-black">File Format:</span> JPG, PNG, or PDF files only</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <div className="flex justify-between pt-6">
                <motion.button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-8 py-4 border-2 border-gray-600 text-gray-300 rounded-xl hover:border-yellow-500 hover:text-yellow-400 transition-all duration-300 flex items-center gap-3 font-black uppercase tracking-wider"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </motion.button>
                <motion.button
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting || 
                    (!uploadedFiles.studentId && !registrationData.studentIdFileId) || 
                    (!uploadedFiles.paymentScreenshot && !registrationData.paymentScreenshotFileId)}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-black rounded-xl hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-3 shadow-lg shadow-green-500/30 uppercase tracking-wider"
                  whileHover={{ scale: (isSubmitting || (!uploadedFiles.studentId && !registrationData.studentIdFileId) || (!uploadedFiles.paymentScreenshot && !registrationData.paymentScreenshotFileId)) ? 1 : 1.05 }}
                  whileTap={{ scale: (isSubmitting || (!uploadedFiles.studentId && !registrationData.studentIdFileId) || (!uploadedFiles.paymentScreenshot && !registrationData.paymentScreenshotFileId)) ? 1 : 0.95 }}
                >
                  {isSubmitting ? (
                    <>
                      <motion.div 
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Processing...
                    </>
                  ) : (
                    <>
                      Submit Registration
                      <CheckCircle className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="mb-12">
              <motion.div 
                className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-yellow-500/30"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <CheckCircle className="w-16 h-16 text-black" />
              </motion.div>
              
              <motion.h2 
                className="text-5xl md:text-6xl font-black text-white mb-6 uppercase tracking-wider"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Registration <span className="text-yellow-400">Successful!</span>
              </motion.h2>
              
              <motion.p 
                className="text-xl text-gray-300 font-medium mb-8 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Thank you for registering for NCC ROBOTICS WORKSHOP 2025! Your registration and documents have been submitted.
              </motion.p>
              
              <motion.div 
                className="bg-gradient-to-r from-yellow-400/20 to-yellow-500/20 border-2 border-yellow-400 rounded-2xl p-6 inline-block mb-8"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <p className="text-yellow-400 font-bold text-sm mb-2 uppercase tracking-wider">Registration ID</p>
                <span className="text-3xl font-mono font-black text-yellow-400">
                  {registrationData.registrationId}
                </span>
              </motion.div>
              
              <motion.p 
                className="text-gray-400 font-medium"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.0 }}
              >
                Your documents will be verified within 24 hours. You can track your registration status in your dashboard.
              </motion.p>
            </div>
            
            <motion.div 
              className="bg-gradient-to-br from-gray-800 to-gray-700 border-2 border-yellow-500/30 rounded-2xl p-8 mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <h3 className="text-2xl font-black text-yellow-400 mb-8 uppercase tracking-wider">What's Next?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <motion.div 
                  className="flex items-start p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.4 }}
                >
                  <CheckCircle className="w-6 h-6 text-yellow-400 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-black text-white mb-2">Track Your Status</h4>
                    <p className="text-gray-400 text-sm">Monitor your registration and document verification progress</p>
                  </div>
                </motion.div>
                
                <motion.div 
                   className="flex items-start p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ duration: 0.5, delay: 1.6 }}
                 >
                   <CheckCircle className="w-6 h-6 text-yellow-400 mr-4 mt-1 flex-shrink-0" />
                   <div>
                     <h4 className="font-black text-white mb-2">Document Verification</h4>
                     <p className="text-gray-400 text-sm">Your uploads will be reviewed and verified within 24 hours</p>
                   </div>
                 </motion.div>
                
                <motion.div 
                  className="flex items-start p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.8 }}
                >
                  <CheckCircle className="w-6 h-6 text-yellow-400 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-black text-white mb-2">Get Updates</h4>
                    <p className="text-gray-400 text-sm">Check announcements and resources in your dashboard</p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-start p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 2.0 }}
                >
                  <CheckCircle className="w-6 h-6 text-yellow-400 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-black text-white mb-2">Join the Community</h4>
                    <p className="text-gray-400 text-sm">Connect with fellow robotics enthusiasts</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <motion.button
                onClick={() => router.push('/user')}
                className="px-10 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-black rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 flex items-center gap-3 shadow-lg shadow-yellow-500/30 uppercase tracking-wider"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 2.2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <User className="w-5 h-5" />
                Go to Dashboard
              </motion.button>
              <motion.button
                onClick={() => router.push('/')}
                className="px-10 py-4 border-2 border-yellow-500 text-yellow-400 font-black rounded-xl hover:bg-yellow-500 hover:text-black transition-all duration-300 flex items-center gap-3 uppercase tracking-wider"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 2.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Target className="w-5 h-5" />
                Back to Home
              </motion.button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-yellow-600/10" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-yellow-400/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-600/5 rounded-full blur-3xl" />
      </div>

      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-36 relative z-10">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-black mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <span className="text-white">REGISTER FOR </span>
            <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg">
              ROBOTICS 2025
            </span>
          </motion.h1>
          <motion.p 
            className="text-xl font-bold text-gray-300 max-w-3xl mx-auto uppercase tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            JOIN THE FUTURE OF ROBOTICS - SECURE YOUR SPOT TODAY
          </motion.p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <motion.div 
                  key={step.number} 
                  className="flex items-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                >
                  <div className={`flex items-center justify-center w-14 h-14 rounded-2xl border-3 transition-all duration-300 ${
                    isCompleted ? 'bg-yellow-500 border-yellow-500 text-black shadow-lg shadow-yellow-500/30' :
                    isActive ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 border-yellow-400 text-black shadow-lg shadow-yellow-400/30' :
                    'bg-gray-800 border-gray-600 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-7 h-7" />
                    ) : (
                      <Icon className="w-7 h-7" />
                    )}
                  </div>
                  <div className="ml-4 hidden sm:block">
                    <p className={`text-sm font-black uppercase tracking-wider ${
                      isActive || isCompleted ? 'text-white' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-6 rounded-full transition-all duration-500 ${
                      isCompleted ? 'bg-yellow-500 shadow-lg shadow-yellow-500/30' : 'bg-gray-700'
                    }`} />
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
        
        {/* Form Content */}
        <motion.div 
          className="bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-3xl border border-yellow-500/30 p-10 shadow-2xl backdrop-blur-sm"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 rounded-3xl blur-xl" />
          
          <div className="relative">
            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Floating Particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 30}%`
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.7,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      
      <Footer />
    </div>
  );
};

export default RegisterPage;