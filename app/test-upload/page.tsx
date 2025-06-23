'use client';

import { useState } from 'react';
import { storage, DOCUMENTS_BUCKET_ID } from '@/lib/appwrite';
import { ID } from 'appwrite';
import toast from 'react-hot-toast';

export default function TestUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    fileId?: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      console.log('Starting file upload to Appwrite...');
      console.log('Bucket ID:', DOCUMENTS_BUCKET_ID);
      console.log('File:', file.name, file.type, file.size);

      const response = await storage.createFile(
        DOCUMENTS_BUCKET_ID,
        ID.unique(),
        file
      );

      console.log('Upload successful:', response);
      
      setUploadResult({
        success: true,
        message: 'File uploaded successfully!',
        fileId: response.$id
      });
      
      toast.success('File uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      
      setUploadResult({
        success: false,
        message: error?.message || 'An unknown error occurred'
      });
      
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Appwrite File Upload Test</h1>
        
        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Upload a File</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Select a file
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="bg-gray-700 rounded-lg p-2 w-full"
            />
          </div>
          
          {file && (
            <div className="mb-4 p-3 bg-gray-700 rounded-lg">
              <p><span className="text-gray-400">Name:</span> {file.name}</p>
              <p><span className="text-gray-400">Type:</span> {file.type}</p>
              <p><span className="text-gray-400">Size:</span> {Math.round(file.size / 1024)} KB</p>
            </div>
          )}
          
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            {isUploading ? 'Uploading...' : 'Upload to Appwrite'}
          </button>
        </div>
        
        {uploadResult && (
          <div className={`rounded-xl p-6 ${uploadResult.success ? 'bg-green-900/50 border border-green-500' : 'bg-red-900/50 border border-red-500'}`}>
            <h2 className="text-xl font-bold mb-2">
              {uploadResult.success ? 'Upload Successful!' : 'Upload Failed'}
            </h2>
            
            <p className="mb-2">{uploadResult.message}</p>
            
            {uploadResult.success && uploadResult.fileId && (
              <p className="mt-4">
                <span className="text-gray-400">File ID:</span> {uploadResult.fileId}
              </p>
            )}
            
            {!uploadResult.success && (
              <div className="mt-4 text-sm">
                <p className="font-bold mb-2">Troubleshooting:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Check that your Appwrite project ID is correct</li>
                  <li>Verify that the storage bucket exists in your Appwrite project</li>
                  <li>Make sure the bucket has appropriate permissions set</li>
                  <li>Check browser console for detailed error information</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
