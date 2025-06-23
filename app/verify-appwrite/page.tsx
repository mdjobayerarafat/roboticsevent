'use client';

import { useEffect, useState } from 'react';
import { client, storage, DOCUMENTS_BUCKET_ID } from '@/lib/appwrite';

export default function AppwriteVerifier() {
  const [status, setStatus] = useState({ checking: true, connected: false, error: '' });
  const [projectDetails, setProjectDetails] = useState({
    projectId: '',
    endpoint: '',
    bucketExists: false
  });

  useEffect(() => {
    async function checkConnection() {
      try {
        setStatus({ checking: true, connected: false, error: '' });
        
        // Get Appwrite client config
        const endpoint = client.config.endpoint;
        const projectId = client.config.project;
        
        setProjectDetails(prev => ({
          ...prev,
          projectId,
          endpoint
        }));
        
        console.log('Checking connection to Appwrite with:', { endpoint, projectId });
        
        try {
          // Try to access the documents bucket by listing files
          // This will throw an error if the bucket doesn't exist or project ID is wrong
          try {
            // Just try to list files - we don't care about the result, just if it throws
            await storage.listFiles(DOCUMENTS_BUCKET_ID);
            
            setProjectDetails(prev => ({
              ...prev,
              bucketExists: true
            }));
          } catch (bucketError: any) {
            console.log('Bucket check error:', bucketError);
            
            // If we get a specific error about the bucket not found, we know the project exists
            // but the bucket doesn't
            const connected = bucketError?.message?.includes('Bucket with the requested ID') || false;
            
            setProjectDetails(prev => ({
              ...prev,
              bucketExists: false
            }));
            
            if (!connected) {
              throw bucketError; // Re-throw if it's not a bucket-specific error
            }
          }
          
          setStatus({ 
            checking: false, 
            connected: true, 
            error: ''
          });
        } catch (error: any) {
          console.error('Appwrite connection error:', error);
          setStatus({ 
            checking: false, 
            connected: false, 
            error: error.message || 'Failed to connect to Appwrite'
          });
        }
      } catch (err: any) {
        console.error('Unexpected error:', err);
        setStatus({ 
          checking: false, 
          connected: false, 
          error: err.message || 'Unknown error occurred'
        });
      }
    }

    checkConnection();
  }, []);

  return (
    <div className="bg-gray-900 text-white p-8 rounded-xl border border-yellow-500/30 shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Appwrite Connection Status</h2>
      
      {status.checking ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full"></div>
          <p>Checking Appwrite connection...</p>
        </div>
      ) : status.connected ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-green-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="font-bold">Connected to Appwrite successfully!</p>
          </div>
            <div className="mt-4 space-y-2 bg-gray-800 p-4 rounded-lg">
            <p><span className="text-gray-400">Endpoint:</span> {projectDetails.endpoint}</p>
            <p><span className="text-gray-400">Project ID:</span> {projectDetails.projectId}</p>
            <p><span className="text-gray-400">Env Project ID:</span> {process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'Not found in env'}</p>
            <p className={projectDetails.bucketExists ? "text-green-400" : "text-red-400"}>
              Documents Bucket ({DOCUMENTS_BUCKET_ID}): {projectDetails.bucketExists ? "Found" : "Not Found"}
            </p>
          </div>
          
          {!projectDetails.bucketExists && (
            <div className="mt-4 bg-red-900/50 border border-red-500/30 p-4 rounded-lg">
              <p className="font-bold text-red-400">Warning: Documents Bucket Not Found</p>
              <p className="mt-2 text-sm">
                The bucket ID "{DOCUMENTS_BUCKET_ID}" does not exist in your Appwrite project.
                This will cause file uploads to fail. Please create this bucket in your Appwrite console.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-red-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <p className="font-bold">Failed to connect to Appwrite</p>
          </div>
          
          <div className="mt-4 space-y-2 bg-gray-800 p-4 rounded-lg">
            <p><span className="text-gray-400">Endpoint:</span> {projectDetails.endpoint}</p>
            <p><span className="text-gray-400">Project ID:</span> {projectDetails.projectId}</p>
            <p><span className="text-gray-400">Error:</span> {status.error}</p>
          </div>
          
          <div className="mt-4 bg-red-900/50 border border-red-500/30 p-4 rounded-lg">
            <p className="font-bold text-red-400">Troubleshooting Steps:</p>
            <ol className="list-decimal list-inside mt-2 space-y-2 text-sm">
              <li>Verify your Project ID in .env.local and .env files</li>
              <li>Ensure your Appwrite project exists and is active</li>
              <li>Check if your project has the necessary API keys and permissions</li>
              <li>Verify that the CORS settings in Appwrite allow requests from your domain</li>
              <li>Make sure the storage service is enabled in your project</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
