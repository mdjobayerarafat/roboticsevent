'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import toast from 'react-hot-toast';
import { account } from '@/lib/appwrite';

export default function VerifyRegistrationPage() {
  const { register, login } = useAuth();
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testRegistration = async () => {
    setLoading(true);
    setResult('Testing registration...');
    
    try {
      // Test email and password
      const email = `test${Date.now()}@example.com`;
      const password = 'Password123!';
      const name = 'Test User';
      
      // Attempt to register
      const success = await register(email, password, name);
      
      if (success) {
        setResult(`Registration successful for ${email}. Now testing login...`);
        
        // Try to login with the same credentials
        const loginSuccess = await login(email, password);
        
        if (loginSuccess) {
          setResult(prev => `${prev}\nLogin successful! Registration and authentication are working correctly.`);
        } else {
          setResult(prev => `${prev}\nLogin failed. Registration completed but authentication has issues.`);
        }
      } else {
        setResult('Registration failed. Check console for errors.');
      }
    } catch (error: any) {
      console.error('Test error:', error);
      setResult(`Error: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  const checkConfiguration = async () => {
    setLoading(true);
    setResult('Checking Appwrite configuration...');
    
    try {
      // Check if we can access the account service
      const accountInfo = await account.get();
      setResult(`Appwrite configuration looks good! Connected to account: ${accountInfo.$id}`);
    } catch (error: any) {
      console.error('Configuration error:', error);
      setResult(`Configuration error: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Registration Verification Tool</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Test Registration Process</h2>
          <p className="text-gray-600 mb-4">
            This will create a test user with a random email to verify the registration process works.
          </p>
          <button
            onClick={testRegistration}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Testing...' : 'Test Registration'}
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Check Appwrite Configuration</h2>
          <p className="text-gray-600 mb-4">
            Verify that your Appwrite configuration is correct.
          </p>
          <button
            onClick={checkConfiguration}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? 'Checking...' : 'Check Configuration'}
          </button>
        </div>
      </div>
      
      {result && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Results:</h2>
          <pre className="whitespace-pre-wrap">{result}</pre>
        </div>
      )}
    </div>
  );
}
