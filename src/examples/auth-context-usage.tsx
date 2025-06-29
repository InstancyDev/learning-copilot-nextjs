// Examples of how to use the authentication context in different components
// This file demonstrates how to access user data and authentication functions from any component

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { userUtils } from '@/utils/auth';

// Example 1: Simple component that displays user information
export const UserProfileComponent: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return <div>No user data available</div>;
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">User Profile</h3>
      <div className="space-y-2">
        <p><strong>Name:</strong> {userUtils.getDisplayName(user)}</p>
        <p><strong>Email:</strong> {user.EmailAddress}</p>
        <p><strong>Role:</strong> {userUtils.getRoleDisplayName(user)}</p>
        <p><strong>User ID:</strong> {user.UserID}</p>
      </div>
      <button
        onClick={logout}
        className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  );
};

// Example 2: Component that shows different content based on user role
export const RoleBasedComponent: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Please log in to view this content</div>;
  }

  const isAdmin = user.UserRoles.some(role => role.Name === 'Admin' || role.Name === 'Site Admin');
  const isLearner = user.UserRoles.some(role => role.Name === 'Learner');

  return (
    <div className="p-4">
      {isAdmin && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900">Admin Panel</h3>
          <p className="text-blue-700">Welcome, Administrator! You have access to all features.</p>
          <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded">
            Manage Users
          </button>
        </div>
      )}
      
      {isLearner && (
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900">Learning Dashboard</h3>
          <p className="text-green-700">Welcome, Learner! Continue your learning journey.</p>
          <button className="mt-2 bg-green-600 text-white px-4 py-2 rounded">
            View Courses
          </button>
        </div>
      )}
    </div>
  );
};

// Example 3: Component that handles authentication states
export const AuthStatusComponent: React.FC = () => {
  const { user, loading, error, clearError } = useAuth();

  if (loading) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Loading authentication...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800 mb-2">Authentication Error: {error}</p>
        <button
          onClick={clearError}
          className="bg-red-600 text-white px-3 py-1 rounded text-sm"
        >
          Dismiss
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-800">Not authenticated</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <p className="text-green-800">
        Authenticated as: {userUtils.getDisplayName(user)}
      </p>
    </div>
  );
};

// Example 4: Hook for conditional rendering based on authentication
export const useAuthGuard = (requiredRoles?: string[]) => {
  const { user, loading } = useAuth();

  if (loading) {
    return { canAccess: false, reason: 'loading' as const };
  }

  if (!user) {
    return { canAccess: false, reason: 'unauthenticated' as const };
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = user.UserRoles.some(role => 
      requiredRoles.includes(role.Name)
    );
    
    if (!hasRequiredRole) {
      return { canAccess: false, reason: 'insufficient_permissions' as const };
    }
  }

  return { canAccess: true, reason: 'authorized' as const };
};

// Example 5: Protected component using the auth guard
interface ProtectedComponentProps {
  requiredRoles?: string[];
}

export const ProtectedComponent: React.FC<ProtectedComponentProps> = ({ requiredRoles }) => {
  const { canAccess, reason } = useAuthGuard(requiredRoles);

  if (!canAccess) {
    switch (reason) {
      case 'loading':
        return <div>Loading...</div>;
      case 'unauthenticated':
        return <div>Please log in to access this content</div>;
      case 'insufficient_permissions':
        return <div>You don't have permission to access this content</div>;
      default:
        return <div>Access denied</div>;
    }
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Protected Content</h3>
      <p>This content is only visible to authorized users.</p>
    </div>
  );
};

// Example 6: Component that uses authentication for API calls
export const DataFetchingComponent: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // You can use the user's JWT token for authenticated API calls
      const response = await fetch('/api/user/data', {
        headers: {
          'Authorization': `Bearer ${user.JwtToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  if (!user) {
    return <div>Please log in to view data</div>;
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2">User Data</h3>
      {loading ? (
        <p>Loading data...</p>
      ) : (
        <pre className="bg-gray-100 p-2 rounded text-sm">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
};

// Example 7: Navigation component that shows different menu items based on user role
export const NavigationComponent: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return null; // Don't show navigation for unauthenticated users
  }

  const isAdmin = user.UserRoles.some(role => role.Name === 'Admin' || role.Name === 'Site Admin');
  const isInstructor = user.UserRoles.some(role => role.Name === 'Instructor');

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <a href="/dashboard" className="hover:text-gray-300">Dashboard</a>
          <a href="/courses" className="hover:text-gray-300">Courses</a>
          <a href="/mylearning" className="hover:text-gray-300">My Learning</a>
          
          {isInstructor && (
            <a href="/instructor" className="hover:text-gray-300">Instructor Panel</a>
          )}
          
          {isAdmin && (
            <a href="/admin" className="hover:text-gray-300">Admin Panel</a>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <span>Welcome, {userUtils.getDisplayName(user)}</span>
          <button
            onClick={logout}
            className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}; 