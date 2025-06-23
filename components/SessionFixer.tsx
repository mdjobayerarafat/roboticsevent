import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, LogOut, CheckCircle } from 'lucide-react';
import { account } from '@/lib/appwrite';
import toast from 'react-hot-toast';

interface SessionFixerProps {
  onSessionCleared?: () => void;
}

export const SessionFixer: React.FC<SessionFixerProps> = ({ onSessionCleared }) => {
  const [isFixing, setIsFixing] = useState(false);
  const [showFixer, setShowFixer] = useState(false);

  const clearSession = async () => {
    setIsFixing(true);
    try {
      console.log('Clearing corrupted session...');
      
      // Clear current session
      try {
        await account.deleteSession('current');
        console.log('Session cleared successfully');
      } catch (error) {
        console.log('No session to clear or already cleared');
      }
      
      // Clear all sessions to be thorough
      try {
        await account.deleteSessions();
        console.log('All sessions cleared');
      } catch (error) {
        console.log('Unable to clear all sessions, but current session cleared');
      }
      
      toast.success('Session cleared! Please log in again.');
      
      if (onSessionCleared) {
        onSessionCleared();
      }
      
      // Refresh the page to reset authentication state
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error: any) {
      console.error('Error clearing session:', error);
      toast.error('Error clearing session. Please try refreshing the page.');
    } finally {
      setIsFixing(false);
    }
  };

  if (!showFixer) {
    return (
      <button
        onClick={() => setShowFixer(true)}
        className="inline-flex items-center px-3 py-1 text-sm bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 rounded-md transition-colors"
      >
        <AlertTriangle className="w-4 h-4 mr-1" />
        Fix Login Issues
      </button>
    );
  }

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm p-4 rounded-lg border border-yellow-500/20">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-400 mb-1">
            Authentication Issue Detected
          </h3>
          <p className="text-sm text-gray-300 mb-3">
            You're experiencing a permission error. This usually happens when your login session 
            becomes corrupted. Click below to clear your session and fix the issue.
          </p>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={clearSession}
              disabled={isFixing}
              className="inline-flex items-center px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-gray-900 text-sm font-medium rounded-md transition-colors"
            >
              {isFixing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                  Fixing...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-1" />
                  Clear Session & Fix
                </>
              )}
            </button>
            
            <button
              onClick={() => setShowFixer(false)}
              className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
          
          <div className="mt-3 p-2 bg-gray-900/50 rounded text-xs text-gray-400">
            <div className="flex items-center mb-1">
              <CheckCircle className="w-3 h-3 mr-1 text-green-400" />
              This will safely log you out
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-3 h-3 mr-1 text-green-400" />
              You can log back in immediately after
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionFixer;
