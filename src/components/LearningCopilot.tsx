// Updated LearningCopilot.tsx - Pass MCP status to EnterpriseLayout

'use client';

import React, { useState, useEffect } from 'react';
import { useSSO } from '@/services/SSOAuthService';
import { EnterpriseLayout } from '@/components/layout/EnterpriseLayout';
import { Loader2, Wifi, WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';

interface LearningCopilotProps {
  initialView?: string;
}

export const LearningCopilot: React.FC<LearningCopilotProps> = ({ initialView = 'ai-agent' }) => {
  const { 
    user, 
    logout, 
    isAuthenticated,
    mcpConnected,
    mcpInitializing,
    retryMcpConnection,
    error
  } = useSSO();
  
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize app when user and MCP are ready
  useEffect(() => {
    if (user && !mcpInitializing) {
      setIsInitialized(true);
      console.info('Application initialized with user:', user.UserDisplayName, 'MCP Connected:', mcpConnected);
    }
  }, [user, mcpInitializing, mcpConnected]);

  const handleLogout = () => {
    console.info('User logout initiated');
    logout();
  };

  const handleRetryMcp = async (): Promise<boolean> => {
    console.info('Retrying MCP connection...');
    const success = await retryMcpConnection();
    if (success) {
      console.info('MCP connection retry successful');
    } else {
      console.warn('MCP connection retry failed');
    }
    return success;
  };

  // Show loading state during authentication and MCP initialization
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Loading Learning Copilot
          </h2>
          <p className="text-gray-600">Authenticating via SSO...</p>
        </div>
      </div>
    );
  }

  // Show MCP initialization status
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="mb-6">
            {mcpInitializing ? (
              <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto" />
            ) : mcpConnected ? (
              <Wifi className="w-16 h-16 text-green-600 mx-auto" />
            ) : (
              <WifiOff className="w-16 h-16 text-red-600 mx-auto" />
            )}
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            {mcpInitializing ? 'Connecting to Learning Platform' : 
             mcpConnected ? 'Connection Established' : 'Connection Failed'}
          </h2>
          
          <div className="space-y-2 mb-6">
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="text-gray-600">User:</span>
              <span className="font-medium text-gray-900">{user?.UserDisplayName}</span>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="text-gray-600">MCP Server:</span>
              <div className={`flex items-center gap-1 ${
                mcpInitializing ? 'text-yellow-600' :
                mcpConnected ? 'text-green-600' : 'text-red-600'
              }`}>
                {mcpInitializing ? <Loader2 className="w-4 h-4 animate-spin" /> :
                 mcpConnected ? <Wifi className="w-4 h-4" /> :
                 <WifiOff className="w-4 h-4" />}
                <span>
                  {mcpInitializing ? 'Connecting...' :
                   mcpConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>

          {/* Show initialization steps */}
          <div className="bg-white rounded-lg border p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Initialization Progress</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">SSO Authentication</span>
                <span className="text-green-600 font-medium">✓ Complete</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">User Context Setup</span>
                <span className="text-green-600 font-medium">✓ Complete</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">MCP Server Connection</span>
                <span className={`font-medium ${
                  mcpInitializing ? 'text-yellow-600' :
                  mcpConnected ? 'text-green-600' : 'text-red-600'
                }`}>
                  {mcpInitializing ? '⏳ Connecting...' :
                   mcpConnected ? '✓ Complete' : '✗ Failed'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Learning Platform Ready</span>
                <span className={`font-medium ${
                  isInitialized ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {isInitialized ? '✓ Complete' : '⏳ Waiting...'}
                </span>
              </div>
            </div>
          </div>

          {/* Error handling */}
          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-left">
                  <h4 className="text-sm font-medium text-yellow-800">Connection Warning</h4>
                  <p className="text-sm text-yellow-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          {!mcpConnected && !mcpInitializing && (
            <div className="space-y-3">
              <button
                onClick={handleRetryMcp}
                className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Retry MCP Connection
              </button>
              
              <button
                onClick={() => setIsInitialized(true)}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Continue Without MCP
              </button>
              
              <p className="text-xs text-gray-500">
                Some features may be limited without MCP connection
              </p>
            </div>
          )}

          {/* Auto-continue when MCP connects */}
          {mcpConnected && !mcpInitializing && (
            <div className="space-y-3">
              <div className="text-green-600 text-sm font-medium">
                🎉 Successfully connected to Instancy Learning Platform!
              </div>
              <button
                onClick={() => setIsInitialized(true)}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Enter Learning Copilot
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600">Please log in to access the learning platform.</p>
        </div>
      </div>
    );
  }

  // Pass MCP status and retry mechanism to EnterpriseLayout
  return (
    <EnterpriseLayout
      user={user}
      onLogout={handleLogout}
      initialView={initialView}
      mcpConnected={mcpConnected}
      mcpInitializing={mcpInitializing}
      mcpError={error}
      onRetryMcp={handleRetryMcp}
    />
  );
};