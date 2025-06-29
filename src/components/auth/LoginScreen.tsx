// components/auth/LoginScreen.tsx - Hardcoded login for development

'use client';

import React, { useState } from 'react';
import { LogIn, User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import type { UserContext } from '@/types';

interface LoginScreenProps {
  onLogin: (userContext: UserContext) => void;
}

// Hardcoded sample users for development
const SAMPLE_USERS: Record<string, UserContext> = {
  'admin@company.com': {
    UserID: 1,
    OrgUnitID: 1,
    UserPrivileges: [],
    UserRoles: [
      { RoleID: 1, Name: 'Site Admin' },
      { RoleID: 2, Name: 'Admin' },
      { RoleID: 3, Name: 'Author' },
      { RoleID: 4, Name: 'Learner' }
    ],
    UserCMSGroups: [
      { CMSGroupID: 1, Name: 'Administrators', CMGroupID: 1 }
    ],
    EmailAddress: 'admin@company.com',
    JwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkFkbWluIFVzZXIiLCJpYXQiOjE2MzQyMzQwMDB9.sample-jwt-token-admin',
    FirstName: 'Admin',
    LastName: 'User',
    IsClarizenUser: 'false',
    UserDisplayName: 'Admin User',
    AccountType: 1,
    SiteID: 1,
    CMSGroupID: 1,
    SessionID: 'admin-session-' + Date.now(),
    SendMessage: 1,
    ExternalUser: 0,
    Membership: 1,
    Picture: '',
    Language: 'en-US',
    Country: 'US',
    NotifiyMessage: '',
    AutoLaunchContent: '',
    UserTimeZone: 'UTC',
    IsGroupExpired: 0,
    UserLockedtime: 0,
    UserLogin: 'admin',
    IsSysAdminUser: true
  },
  'author@company.com': {
    UserID: 2,
    OrgUnitID: 1,
    UserPrivileges: [],
    UserRoles: [
      { RoleID: 3, Name: 'Author' },
      { RoleID: 4, Name: 'Learner' }
    ],
    UserCMSGroups: [
      { CMSGroupID: 2, Name: 'Content Authors', CMGroupID: 2 }
    ],
    EmailAddress: 'author@company.com',
    JwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwibmFtZSI6IkF1dGhvciBVc2VyIiwiaWF0IjoxNjM0MjM0MDAwfQ.sample-jwt-token-author',
    FirstName: 'Content',
    LastName: 'Author',
    IsClarizenUser: 'false',
    UserDisplayName: 'Content Author',
    AccountType: 2,
    SiteID: 1,
    CMSGroupID: 2,
    SessionID: 'author-session-' + Date.now(),
    SendMessage: 1,
    ExternalUser: 0,
    Membership: 1,
    Picture: '',
    Language: 'en-US',
    Country: 'US',
    NotifiyMessage: '',
    AutoLaunchContent: '',
    UserTimeZone: 'UTC',
    IsGroupExpired: 0,
    UserLockedtime: 0,
    UserLogin: 'author',
    IsSysAdminUser: false
  },
  'learner@company.com': {
    UserID: 3,
    OrgUnitID: 1,
    UserPrivileges: [],
    UserRoles: [
      { RoleID: 4, Name: 'Learner' }
    ],
    UserCMSGroups: [
      { CMSGroupID: 3, Name: 'Learners', CMGroupID: 3 }
    ],
    EmailAddress: 'learner@company.com',
    JwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzIiwibmFtZSI6IkxlYXJuZXIgVXNlciIsImlhdCI6MTYzNDIzNDAwMH0.sample-jwt-token-learner',
    FirstName: 'John',
    LastName: 'Learner',
    IsClarizenUser: 'false',
    UserDisplayName: 'John Learner',
    AccountType: 3,
    SiteID: 1,
    CMSGroupID: 3,
    SessionID: 'learner-session-' + Date.now(),
    SendMessage: 1,
    ExternalUser: 0,
    Membership: 1,
    Picture: '',
    Language: 'en-US',
    Country: 'US',
    NotifiyMessage: '',
    AutoLaunchContent: '',
    UserTimeZone: 'UTC',
    IsGroupExpired: 0,
    UserLockedtime: 0,
    UserLogin: 'learner',
    IsSysAdminUser: false
  },
  'manager@company.com': {
    UserID: 4,
    OrgUnitID: 1,
    UserPrivileges: [],
    UserRoles: [
      { RoleID: 2, Name: 'Admin' },
      { RoleID: 4, Name: 'Learner' }
    ],
    UserCMSGroups: [
      { CMSGroupID: 4, Name: 'Managers', CMGroupID: 4 }
    ],
    EmailAddress: 'manager@company.com',
    JwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0IiwibmFtZSI6Ik1hbmFnZXIgVXNlciIsImlhdCI6MTYzNDIzNDAwMH0.sample-jwt-token-manager',
    FirstName: 'Sarah',
    LastName: 'Manager',
    IsClarizenUser: 'false',
    UserDisplayName: 'Sarah Manager',
    AccountType: 2,
    SiteID: 1,
    CMSGroupID: 4,
    SessionID: 'manager-session-' + Date.now(),
    SendMessage: 1,
    ExternalUser: 0,
    Membership: 1,
    Picture: '',
    Language: 'en-US',
    Country: 'US',
    NotifiyMessage: '',
    AutoLaunchContent: '',
    UserTimeZone: 'UTC',
    IsGroupExpired: 0,
    UserLockedtime: 0,
    UserLogin: 'manager',
    IsSysAdminUser: false
  }
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const userContext = SAMPLE_USERS[email.toLowerCase()];
      
      if (!userContext) {
        setError('Invalid email or password. Try one of the sample accounts.');
        setLoading(false);
        return;
      }

      // In real application, you would verify password here
      // For development, we accept any password for the sample users
      
      console.log('Login successful for:', userContext.UserDisplayName);
      onLogin(userContext);
      
    } catch (error) {
      console.error('Login failed:', error);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (email: string) => {
    setEmail(email);
    setPassword('password'); // Set any password for development
    setSelectedUser(email);
    setError('');
  };

  const getSampleUserInfo = (email: string) => {
    const user = SAMPLE_USERS[email];
    return {
      name: user.UserDisplayName,
      roles: user.UserRoles.map(r => r.Name).join(', ')
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-gray-600">Sign in to your learning portal</p>
          <div className="mt-2 text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-md">
            🔧 Development Mode - Using hardcoded sample users
          </div>
        </div>

        {/* Quick Login Options */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Login (Development)</h3>
          <div className="space-y-2">
            {Object.keys(SAMPLE_USERS).map((email) => {
              const userInfo = getSampleUserInfo(email);
              return (
                <button
                  key={email}
                  onClick={() => handleQuickLogin(email)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedUser === email
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm text-gray-900">{userInfo.name}</div>
                      <div className="text-xs text-gray-500">{email}</div>
                      <div className="text-xs text-blue-600">{userInfo.roles}</div>
                    </div>
                    <LogIn className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        {/* Development Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">Development Notes:</h4>
          <ul className="text-xs text-yellow-700 space-y-1">
            <li>• Any password works for the sample accounts</li>
            <li>• Click quick login buttons for instant access</li>
            <li>• Each user has different role permissions</li>
            <li>• Session data is stored using your existing sessionUtils</li>
            <li>• Replace this with SSO when ready for production</li>
          </ul>
        </div>
      </div>
    </div>
  );
};