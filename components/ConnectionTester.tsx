import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { account, databases, DATABASE_ID, USERS_COLLECTION_ID } from '@/lib/appwrite';
import toast from 'react-hot-toast';

interface ConnectionStatus {
  appwrite: boolean;
  database: boolean;
  overall: boolean;
  latency: number | null;
}

export const ConnectionTester: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    appwrite: false,
    database: false,
    overall: false,
    latency: null
  });
  const [testing, setTesting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const testConnection = async () => {
    setTesting(true);
    const startTime = Date.now();
    
    const newStatus: ConnectionStatus = {
      appwrite: false,
      database: false,
      overall: false,
      latency: null
    };

    try {
      // Test Appwrite account service
      console.log('Testing Appwrite connection...');
      try {
        await account.get();
        newStatus.appwrite = true;
        console.log('✅ Appwrite account service accessible');
      } catch (error: any) {
        console.log('⚠️ Appwrite account service test result:', error.message);
        // Even if we get an auth error, it means the service is reachable
        if (error?.type !== 'network_error' && error?.code !== 0) {
          newStatus.appwrite = true;
        }
      }

      // Test database connectivity
      console.log('Testing database connection...');
      try {
        await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID);
        newStatus.database = true;
        console.log('✅ Database accessible');
      } catch (error: any) {
        console.log('⚠️ Database test result:', error.message);
        // Even if we get permission errors, it means database is reachable
        if (error?.type !== 'network_error' && error?.code !== 0) {
          newStatus.database = true;
        }
      }

      newStatus.latency = Date.now() - startTime;
      newStatus.overall = newStatus.appwrite && newStatus.database;

      setStatus(newStatus);

      if (newStatus.overall) {
        toast.success('Connection test successful!');
      } else {
        toast.error('Connection issues detected');
      }

    } catch (error) {
      console.error('Connection test failed:', error);
      toast.error('Connection test failed');
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    // Run initial test
    testConnection();
  }, []);

  const getStatusIcon = (isConnected: boolean) => {
    if (isConnected) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <AlertCircle className="w-4 h-4 text-red-500" />;
  };

  const getLatencyColor = (latency: number | null) => {
    if (!latency) return 'text-gray-400';
    if (latency < 500) return 'text-green-400';
    if (latency < 1000) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {status.overall ? (
            <Wifi className="w-5 h-5 text-green-400" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-400" />
          )}
          <span className="text-sm font-medium text-white">
            Connection Status
          </span>
        </div>
        
        <button
          onClick={testConnection}
          disabled={testing}
          className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm rounded-md transition-colors"
        >
          {testing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span>Test</span>
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            {getStatusIcon(status.appwrite)}
            <span className="text-gray-300">Appwrite Service</span>
          </div>
          <span className={status.appwrite ? 'text-green-400' : 'text-red-400'}>
            {status.appwrite ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            {getStatusIcon(status.database)}
            <span className="text-gray-300">Database</span>
          </div>
          <span className={status.database ? 'text-green-400' : 'text-red-400'}>
            {status.database ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {status.latency && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-300">Response Time</span>
            <span className={getLatencyColor(status.latency)}>
              {status.latency}ms
            </span>
          </div>
        )}
      </div>

      <button
        onClick={() => setShowDetails(!showDetails)}
        className="mt-3 text-xs text-gray-400 hover:text-gray-300 transition-colors"
      >
        {showDetails ? 'Hide Details' : 'Show Details'}
      </button>

      {showDetails && (
        <div className="mt-3 p-3 bg-gray-900/50 rounded text-xs text-gray-400">
          <div className="mb-2 font-medium text-gray-300">Troubleshooting Tips:</div>
          <ul className="space-y-1 list-disc list-inside">
            <li>Check your internet connection</li>
            <li>Try refreshing the page</li>
            <li>Clear browser cache and cookies</li>
            <li>Disable VPN if active</li>
            <li>Check if firewall is blocking connections</li>
          </ul>
          
          {!status.overall && (
            <div className="mt-2 p-2 bg-red-500/10 rounded border border-red-500/20">
              <div className="text-red-400 font-medium">Connection Failed</div>
              <div className="text-red-300">
                Unable to connect to authentication services. Please check your connection and try again.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ConnectionTester;
