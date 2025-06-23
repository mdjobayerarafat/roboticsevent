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

  // Simple role normalization
  const normalizeRole = (role: any): 'user' | 'admin' | 'guest' => {
    if (typeof role !== 'string') return 'user';
    
    const normalized = role.toLowerCase().trim();
    if (normalized === 'admin') return 'admin';
    if (normalized === 'guest' || normalized === 'guests') return 'guest';
    return 'user'; // Default to user
  };

  // Check authentication on app start
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('Checking authentication...');
      
      const session = await account.get();
      if (!session) {
        setUser(null);
        return;
      }

      console.log('Session found for user:', session.$id);
      
      // Get user profile
      try {
        const userProfile = await databases.getDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          session.$id
        );
        
        console.log('Profile found, role:', userProfile.role);
        
        // Set user with normalized role
        const normalizedRole = normalizeRole(userProfile.role);
        setUser({...userProfile, role: normalizedRole} as unknown as User);
        
      } catch (profileError: any) {
        console.log('Profile not found, creating...');
        
        // Create profile if missing
        try {
          const newProfile = await databases.createDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            session.$id,
            {
              name: session.name || 'User',
              email: session.email || '',
              role: 'user',
              isVerified: true,
              studentIdFileId: '',
              paymentScreenshotFileId: ''
            }
          );
          console.log('Profile created');
          setUser(newProfile as unknown as User);
        } catch (createError) {
          console.error('Failed to create profile:', createError);
          // Clear session if can't create profile
          try {
            await account.deleteSession('current');
          } catch {}
          setUser(null);
        }
      }
    } catch (error: any) {
      console.log('No valid session');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('Attempting login for:', email);
      
      // Clear any existing session
      try {
        await account.deleteSession('current');
      } catch {}
      
      // Create new session
      await account.createEmailSession(email, password);
      console.log('Session created');
      
      // Get session info
      const session = await account.get();
      console.log('Session verified:', session.$id);
      
      // Get or create user profile
      try {
        const userProfile = await databases.getDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          session.$id
        );
        
        console.log('Profile found, role:', userProfile.role);
        const normalizedRole = normalizeRole(userProfile.role);
        setUser({...userProfile, role: normalizedRole} as unknown as User);
        
      } catch (profileError) {
        console.log('Creating user profile...');
        
        // Create profile
        const newProfile = await databases.createDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          session.$id,
          {
            name: session.name || 'User',
            email: session.email || email,
            role: 'user',
            isVerified: true,
            studentIdFileId: '',
            paymentScreenshotFileId: ''
          }
        );
        console.log('Profile created');
        setUser(newProfile as unknown as User);
      }
      
      toast.success('Login successful!');
      return true;
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error?.message?.includes('Invalid credentials')) {
        toast.error('Invalid email or password');
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
      console.log('Creating account for:', email);
      
      // Create account
      const response = await account.create('unique()', email, password, name);
      console.log('Account created:', response.$id);
      
      // Create profile
      const userProfile = await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        response.$id,
        {
          name,
          email,
          role: 'user',
          isVerified: true,
          studentIdFileId: '',
          paymentScreenshotFileId: ''
        }
      );
      console.log('Profile created');
      
      // Login immediately
      await account.createEmailSession(email, password);
      setUser(userProfile as unknown as User);
      
      // Create basic registration entry
      const registrationId = `NCC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      try {
        await databases.createDocument(
          DATABASE_ID,
          REGISTRATIONS_COLLECTION_ID,
          ID.unique(),
          {
            userId: response.$id,
            eventType: 'both',
            personalInfo: JSON.stringify({ fullName: name, email }),
            documents: JSON.stringify({}),
            registrationId,
            status: 'incomplete',
            paymentStatus: 'pending',
            submittedAt: new Date().toISOString(),
          }
        );
      } catch (regError) {
        console.log('Registration entry creation failed, but user created');
      }
      
      toast.success('Account created successfully!');
      return true;
      
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error?.message?.includes('already exists')) {
        toast.error('An account with this email already exists');
      } else {
        toast.error('Registration failed. Please try again.');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('Logging out...');
      setUser(null);
      
      try {
        await account.deleteSession('current');
      } catch (error) {
        console.log('Session already cleared');
      }
      
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Logout error:', error);
      setUser(null);
      toast.success('Logged out successfully');
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
      toast.error('Failed to update profile');
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
      toast.error('Failed to send reset email');
      return false;
    }
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
