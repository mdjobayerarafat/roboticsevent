'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import { Download, ExternalLink } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const TestQRCode = () => {
  const [registrationId, setRegistrationId] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationUrl, setVerificationUrl] = useState('');

  const generateTestQRCode = async () => {
    if (!registrationId.trim()) {
      alert('Please enter a registration ID');
      return;
    }

    try {
      const baseUrl = window.location.origin;
      const verifyUrl = `${baseUrl}/verify/${registrationId.trim()}`;
      
      setVerificationUrl(verifyUrl);
      
      const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      
      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Failed to generate QR code');
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.download = `test-qr-${registrationId}.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-yellow-600/10" />
      </div>

      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-black text-white mb-4 uppercase tracking-wider">
            Test QR Code <span className="text-yellow-400">Generator</span>
          </h1>
          <p className="text-gray-400 font-medium text-lg">
            Generate test QR codes for registration verification
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900 rounded-3xl shadow-2xl p-8 border-2 border-gray-700"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Registration ID
              </label>
              <input
                type="text"
                value={registrationId}
                onChange={(e) => setRegistrationId(e.target.value)}
                placeholder="Enter registration ID (e.g., NCC-2025-001 or document ID)"
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl border border-gray-600 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
              />
              <p className="text-xs text-gray-500 mt-2">
                Enter either a registration ID from the database or a document ID
              </p>
            </div>

            <motion.button
              onClick={generateTestQRCode}
              className="w-full group relative"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-black py-3 px-6 rounded-xl transition-all duration-300 uppercase tracking-wider shadow-lg shadow-yellow-500/30">
                Generate QR Code
              </div>
            </motion.button>

            {verificationUrl && (
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <label className="block text-sm font-medium text-blue-300 mb-2">
                  Verification URL
                </label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 text-blue-200 text-sm bg-blue-900/20 p-2 rounded">
                    {verificationUrl}
                  </code>
                  <button
                    onClick={() => window.open(verificationUrl, '_blank')}
                    className="p-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {qrCodeUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4"
              >
                <div className="bg-white p-4 rounded-xl inline-block">
                  <img src={qrCodeUrl} alt="QR Code" className="max-w-full" />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    onClick={downloadQRCode}
                    className="px-6 py-3 bg-green-500/20 text-green-400 rounded-xl hover:bg-green-500/30 transition-all duration-300 flex items-center justify-center font-bold uppercase tracking-wider border border-green-500/30"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download QR Code
                  </motion.button>
                  
                  <motion.button
                    onClick={() => window.open(verificationUrl, '_blank')}
                    className="px-6 py-3 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-all duration-300 flex items-center justify-center font-bold uppercase tracking-wider border border-blue-500/30"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Test Verification
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl"
        >
          <h3 className="text-lg font-bold text-yellow-400 mb-3">Instructions:</h3>
          <ul className="text-gray-300 space-y-2 text-sm">
            <li>1. Enter a registration ID from your database</li>
            <li>2. Click "Generate QR Code" to create a test QR code</li>
            <li>3. Scan the QR code with your phone's camera or QR code app</li>
            <li>4. The QR code should open the verification URL in your browser</li>
            <li>5. The verification page should display the registration details</li>
          </ul>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TestQRCode;
