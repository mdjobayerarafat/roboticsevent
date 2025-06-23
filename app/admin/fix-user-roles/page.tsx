'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { databases, DATABASE_ID, USERS_COLLECTION_ID } from '@/lib/appwrite';
import { Query } from 'appwrite';
import toast from 'react-hot-toast';
import { AlertCircle, UserCheck, Users } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Run this page only if you're an admin to fix user roles

const FixUserRolesPage = () => {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);  const [guestUsers, setGuestUsers] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<{
    success: number;
    failed: number;
    details: {
      id: string;
      name: string;
      status: string;
      error?: string;
    }[];
  } | null>(null);

  useEffect(() => {
    // Check if user is admin
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (!isAdmin) {
      router.push('/user');
      return;
    }
    
    fetchGuestUsers();
  }, [user, isAdmin, router]);

  const fetchGuestUsers = async () => {
    try {
      setLoading(true);
      const response = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [
          Query.equal("role", "guests")
        ]
      );
      
      setGuestUsers(response.documents);
    } catch (error) {
      console.error('Error fetching guest users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRoles = async () => {
    if (guestUsers.length === 0) {
      toast.success('No guest users to update');
      return;
    }
    
    setProcessing(true);    const result = {
      success: 0,
      failed: 0,
      details: [] as Array<{
        id: string;
        name: string;
        status: string;
        error?: string;
      }>
    };
    
    try {
      for (const user of guestUsers) {
        try {
          await databases.updateDocument(
            DATABASE_ID,
            USERS_COLLECTION_ID,
            user.$id,
            {
              role: 'user'
            }
          );
          result.success++;
          result.details.push({
            id: user.$id,
            name: user.name,
            status: 'success'
          });        } catch (err) {
          const error = err as Error;
          result.failed++;
          result.details.push({
            id: user.$id,
            name: user.name,
            status: 'failed',
            error: error.message || 'Unknown error'
          });
        }
      }
      
      setResults(result);
      toast.success(`Updated ${result.success} users successfully. ${result.failed} updates failed.`);
      
      // Refresh the list after updates
      fetchGuestUsers();
    } catch (error) {
      console.error('Error updating user roles:', error);
      toast.error('Failed to update user roles');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Fix User Roles</h1>
          
          <div className="mb-8">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <div className="flex">
                <AlertCircle className="h-6 w-6 text-blue-500 mr-3" />
                <div>
                  <h3 className="text-blue-800 font-medium">Why use this tool?</h3>
                  <p className="text-blue-700 mt-1">
                    This tool will fix the "User (role: guests) missing scope (account)" error by changing all users with the role 'guests' to have the role 'user' instead.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <div className="flex">
                <AlertCircle className="h-6 w-6 text-yellow-500 mr-3" />
                <div>
                  <h3 className="text-yellow-800 font-medium">Important Note</h3>
                  <p className="text-yellow-700 mt-1">
                    This action will update user roles in your database. It's recommended to backup your data before proceeding.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Users className="mr-2 h-5 w-5" /> Users with 'guests' role
            </h2>
            
            {guestUsers.length === 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <UserCheck className="h-5 w-5 text-green-500 mr-3" />
                  <p className="text-green-700">
                    No users with 'guests' role found. All users have the correct role.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-4">
                  Found {guestUsers.length} user(s) with the role 'guests'. Click the button below to update them to 'user' role.
                </p>
                
                <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {guestUsers.map((user) => (
                        <tr key={user.$id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.$id.substring(0, 8)}...</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              {user.role}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={updateUserRoles}
                    disabled={processing}
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? 'Updating...' : `Update ${guestUsers.length} Users to 'user' Role`}
                  </button>
                </div>
              </>
            )}
          </div>
          
          {results && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Results</h2>
              
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mr-3">
                    Success: {results.success}
                  </div>
                  <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    Failed: {results.failed}
                  </div>
                </div>
                
                {results.details.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Details:</h3>
                    <ul className="space-y-2">
                      {results.details.map((detail, index) => (
                        <li key={index} className={`text-sm p-2 rounded ${detail.status === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          {detail.name} ({detail.id.substring(0, 8)}...): {detail.status === 'success' ? 'Updated' : `Failed - ${detail.error}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default FixUserRolesPage;
