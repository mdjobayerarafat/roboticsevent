'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { account, databases, DATABASE_ID, USERS_COLLECTION_ID, REGISTRATIONS_COLLECTION_ID } from '@/lib/appwrite';
import { Models, ID } from 'appwrite';
import toast from 'react-hot-toast';

interface User {
  $id: string;
  name: string;
  email: string;
  phone?: string;
  institution?: string;
  studentId?: string;
  role: 'user' | 'admin' | 'guest';
  avatar?: string;
  isVerified: boolean;
  studentIdFileId?: string;
  paymentScreenshotFileId?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'admin';

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuth();
  }, []);

  const clearInvalidSession = async () => {
    try {
      console.log('Clearing invalid or corrupted session...');
      await account.deleteSession('current');
    } catch (error) {
      console.log('No session to clear or already cleared');
    }
  };

  const validateConnection = async (): Promise<boolean> => {
    try {
      // Test connection to Appwrite
      await account.get();
      return true;
    } catch (error: any) {
      console.error('Connection validation failed:', error);
      
      if (error?.message?.includes('network') || 
          error?.message?.includes('fetch') ||
          error?.message?.includes('connection') ||
          error?.code === 0) {
        return false;
      }
      
      // If it's just a session issue, connection is fine
      return true;
    }
  };

  const checkAuth = async () => {
    try {
      console.log('Checking authentication status...');
      
      // First validate connection
      const connectionValid = await validateConnection();
      if (!connectionValid) {
        console.error('Unable to connect to authentication service');
        setUser(null);
        setLoading(false);
        return;
      }

      let session;
      try {
        session = await account.get();
      } catch (sessionError: any) {
        console.error('Initial session error:', sessionError);
        
        // Handle specific permission/role issues
        if (sessionError?.message?.includes('missing scope') || 
            sessionError?.message?.includes('guests') ||
            sessionError?.message?.includes('guest') ||
            sessionError?.type === 'user_unauthorized') {
          console.log('Permission error detected, clearing session');
          await clearInvalidSession();
          setUser(null);
          setLoading(false);
          return;
        }
        
        // For other session errors, treat as no session
        setUser(null);
        setLoading(false);
        return;
      }

      if (!session) {
        setUser(null);
        setLoading(false);
        return;
      }

      console.log('Active session found for user:', session.$id);
      
      // Get user profile from database
      try {
        const userProfile = await databases.getDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          session.$id
        );
        console.log('User profile retrieved:', userProfile.$id, 'Role:', userProfile.role);
        
        // Validate and normalize the user role
        const normalizedRole = validateAndNormalizeRole(userProfile.role);
        
        // If user has guest role, upgrade to user role (unless they're specifically meant to be guests)
        if (shouldUpgradeGuestRole(userProfile.role)) {
          console.log(`Updating user role from '${userProfile.role}' to 'user'`);
          try {
            const updatedProfile = await databases.updateDocument(
              DATABASE_ID,
              USERS_COLLECTION_ID,
              session.$id,
              {
                role: 'user'
              }
            );
            setUser({...userProfile, role: 'user'} as unknown as User);
          } catch (updateError) {
            console.error('Failed to update user role:', updateError);
            // Set with normalized role even if update fails
            setUser({...userProfile, role: normalizedRole} as unknown as User);
          }
        } else {
          // Set with normalized role
          setUser({...userProfile, role: normalizedRole} as unknown as User);
        }
      } catch (profileError: any) {
        console.error('Error retrieving user profile:', profileError);
        
        // If profile doesn't exist but we have a valid session, create profile
        if (profileError?.type === 'document_not_found') {
          try {
            console.log('Creating missing user profile for:', session.$id);
            const newProfile = await databases.createDocument(
              DATABASE_ID,
              USERS_COLLECTION_ID,
              session.$id,
              {
                name: session.name || 'User',
                email: session.email || '',
                role: 'user', // Default to 'user' instead of 'guest'
                isVerified: true,
                $id: session.$id,
                studentIdFileId: '',
                paymentScreenshotFileId: ''
              }
            );
            console.log('Created new user profile:', newProfile.$id);
            setUser(newProfile as unknown as User);
          } catch (createError) {
            console.error('Failed to create user profile:', createError);
            // If we can't create a profile, clear the session
            await clearInvalidSession();
            setUser(null);
          }
        } else {
          // For other profile errors, clear the session
          await clearInvalidSession();
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Authentication check error:', error);
      await clearInvalidSession();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('Attempting login for:', email);
      
      // First validate connection
      const connectionValid = await validateConnection();
      if (!connectionValid) {
        toast.error('Unable to establish secure connection. Please check your internet connection and try again.');
        return false;
      }
      
      // Clear any existing sessions first to avoid conflicts
      try {
        await account.deleteSession('current');
      } catch (error) {
        console.log('No existing session to clear');
      }
      
      // Create new session with retry mechanism
      let sessionCreated = false;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries && !sessionCreated) {
        try {
          await account.createEmailSession(email, password);
          sessionCreated = true;
          console.log('Email session created successfully');
        } catch (sessionError: any) {
          console.error(`Session creation attempt ${retryCount + 1} failed:`, sessionError);
          
          if (sessionError?.message?.includes('Invalid credentials')) {
            toast.error('Invalid email or password');
            return false;
          }
          
          if (sessionError?.message?.includes('network') || 
              sessionError?.message?.includes('fetch') ||
              sessionError?.code === 0) {
            retryCount++;
            if (retryCount < maxRetries) {
              console.log(`Retrying session creation (${retryCount}/${maxRetries})...`);
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          } else {
            throw sessionError;
          }
        }
      }
      
      if (!sessionCreated) {
        toast.error('Unable to establish secure connection. Please try again.');
        return false;
      }
      
      // Get user session with retry mechanism
      let session;
      retryCount = 0;
      
      while (retryCount < maxRetries) {
        try {
          session = await account.get();
          if (session) break;
        } catch (sessionError: any) {
          console.error(`Session retrieval attempt ${retryCount + 1} failed:`, sessionError);
          
          if (sessionError?.message?.includes('missing scope') || 
              sessionError?.message?.includes('guests') ||
              sessionError?.message?.includes('guest') ||
              sessionError?.type === 'user_unauthorized') {
            console.log('Permission error on login, clearing session and retrying');
            await clearInvalidSession();
            
            if (retryCount < maxRetries - 1) {
              // Wait a bit before retrying
              await new Promise(resolve => setTimeout(resolve, 1000));
              // Try creating session again
              try {
                await account.createEmailSession(email, password);
              } catch (retryError) {
                console.error('Retry session creation failed:', retryError);
              }
            }
          }
          retryCount++;
        }
      }
      
      if (!session) {
        throw new Error('Failed to establish valid session after multiple attempts');
      }
      
      console.log('User session established:', session.$id);
      
      try {
        // Get user profile from database
        const userProfile = await databases.getDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          session.$id
        );
        
        console.log('User profile retrieved:', userProfile.$id, 'Role:', userProfile.role);
        
        // Validate and normalize the user role
        const normalizedRole = validateAndNormalizeRole(userProfile.role);
        
        // If user has guest role, upgrade to user role
        if (shouldUpgradeGuestRole(userProfile.role)) {
          console.log(`Updating user role from '${userProfile.role}' to 'user'`);
          try {
            const updatedProfile = await databases.updateDocument(
              DATABASE_ID,
              USERS_COLLECTION_ID,
              session.$id,
              {
                role: 'user'
              }
            );
            setUser({...userProfile, role: 'user'} as unknown as User);
          } catch (updateError) {
            console.error('Failed to update user role:', updateError);
            setUser({...userProfile, role: normalizedRole} as unknown as User);
          }
        } else {
          setUser({...userProfile, role: normalizedRole} as unknown as User);
        }
        
        toast.success('Login successful!');
        return true;
      } catch (profileError: any) {
        console.error('Error retrieving user profile:', profileError);
        
        // If profile doesn't exist, create one
        if (profileError?.type === 'document_not_found') {
          try {
            console.log('Creating missing user profile for:', session.$id);
            const newProfile = await databases.createDocument(
              DATABASE_ID,
              USERS_COLLECTION_ID,
              session.$id,
              {
                name: session.name || 'User',
                email: session.email || email,
                role: 'user', // Default to 'user' role
                isVerified: true,
                $id: session.$id,
                studentIdFileId: '', // Initialize empty Student ID file ID 
                paymentScreenshotFileId: '' // Initialize empty Payment Screenshot file ID
              }
            );
            console.log('Created new user profile:', newProfile.$id);
            setUser(newProfile as unknown as User);
            toast.success('Login successful!');
            return true;
          } catch (createError) {
            console.error('Failed to create user profile:', createError);
            toast.error('Error setting up your account. Please try again.');
            await clearInvalidSession();
            return false;
          }
        } else {
          throw profileError;
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error?.message?.includes('Invalid credentials')) {
        toast.error('Invalid email or password');
      } else if (error?.message?.includes('missing scope') || 
                 error?.message?.includes('guests') ||
                 error?.message?.includes('guest') ||
                 error?.type === 'user_unauthorized') {
        toast.error('Permission error. Please contact admin or try again.');
        await clearInvalidSession();
      } else if (error?.message?.includes('Failed to establish valid session')) {
        toast.error('Unable to establish secure connection. Please try again.');
      } else if (error?.message?.includes('network') || 
                 error?.message?.includes('fetch') ||
                 error?.code === 0) {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error('Login failed. Please try again.');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      console.log('Creating new account for:', email);
      
      // Create account
      const response = await account.create('unique()', email, password, name);
      console.log('Account created with ID:', response.$id);
      
      // Create user profile in database
      const userProfile = await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        response.$id,
        {
          name,
          email,
          role: 'user', // Default to 'user' instead of 'guest'
          isVerified: true, // Set to true since we can't verify via email (SMTP disabled)
          $id: response.$id,
          studentIdFileId: '', // Initialize empty Student ID file ID
          paymentScreenshotFileId: '' // Initialize empty Payment Screenshot file ID
        }
      );
      console.log('User profile created:', userProfile.$id);
      
      // Log in the user immediately after registration to establish a session
      const session = await account.createEmailSession(email, password);
      console.log('Email session created:', session.$id);
      
      // Also create a basic registration entry with a unique registration ID
      const registrationId = `NCC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      try {
        console.log('Creating basic registration entry for user:', response.$id);
        const registration = await databases.createDocument(
          DATABASE_ID,
          REGISTRATIONS_COLLECTION_ID,
          ID.unique(),
          {
            userId: response.$id,
            eventType: 'both', // Default to both events
            personalInfo: JSON.stringify({
              fullName: name,
              email: email
            }),
            documents: JSON.stringify({}), // Initialize empty documents object
            registrationId,
            status: 'incomplete',  // Mark as incomplete until they finish the process
            paymentStatus: 'pending',
            submittedAt: new Date().toISOString(),
          }
        );
        console.log('Basic registration entry created:', registration.$id);
      } catch (regError) {
        console.error('Failed to create registration entry:', regError);
        // We'll continue even if registration creation fails, as the user account is created
      }
      
      // Send verification email
      // Commenting out the verification email since SMTP is disabled
      // await account.createVerification('http://localhost:3000/verify');
      
      toast.success('Registration successful!');
      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('Logging out user...');
      setLoading(true);
      
      // Clear user state immediately to prevent UI issues
      setUser(null);
      
      // Delete session from Appwrite
      try {
        await account.deleteSession('current');
        console.log('Session deleted successfully');
      } catch (sessionError: any) {
        console.error('Error deleting session:', sessionError);
        // Even if session deletion fails, we still want to clear local state
      }
      
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      // Still clear local state even if logout fails
      setUser(null);
      toast.success('Logged out successfully');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const updatedProfile = await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        user.$id,
        data
      );
      
      setUser(updatedProfile as unknown as User);
      toast.success('Profile updated successfully');
      return true;
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast.error(error.message || 'Failed to update profile');
      return false;
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      await account.createRecovery(email, 'http://localhost:3000/reset-password');
      toast.success('Password reset email sent!');
      return true;
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast.error(error.message || 'Failed to send reset email');
      return false;
    }
  };

  // Role validation and normalization
  const validateAndNormalizeRole = (role: any): 'user' | 'admin' | 'guest' => {
    if (typeof role !== 'string') return 'guest';
    
    const normalizedRole = role.toLowerCase().trim();
    
    if (normalizedRole === 'admin') return 'admin';
    if (normalizedRole === 'user') return 'user';
    
    // Treat 'guests', 'guest', or any other value as 'guest'
    return 'guest';
  };

  // Check if a role needs to be upgraded from guest to user
  const shouldUpgradeGuestRole = (role: string): boolean => {
    const normalizedRole = validateAndNormalizeRole(role);
    return normalizedRole === 'guest';
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    resetPassword,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}