# API Configuration Documentation

This directory contains centralized configuration for all API endpoints and services used in the Learning Copilot application.

## Files

- `api.config.ts` - Main configuration file with all URLs and endpoints
- `README.md` - This documentation file

## Configuration Overview

The application uses four main service URLs:

- **AdminURL**: `https://development-admin.instancy.com/` - Admin panel and administrative functions
- **WebAPIURL**: `https://developmentapi.instancy.com/api/` - Main web API for authentication and data
- **LearnerURL**: `http://development.instancy.com` - Learner portal and content
- **AIAgentURL**: `http://localhost:8080/api/v1` - AI agent services

## Authentication Architecture

The application uses a centralized authentication system with the following flow:

### 1. **Layout-Level Authentication** (`src/app/layout.tsx`)

Authentication is handled at the root layout level using `AuthProvider`:

```typescript
// src/app/layout.tsx
import { AuthProvider } from "@/components/providers/AuthProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 2. **Authentication Provider** (`src/components/providers/AuthProvider.tsx`)

The `AuthProvider` handles all authentication logic:

- **URL Parameter Extraction**: Extracts `authKey` from URL query parameters
- **API Authentication**: Makes API call to authenticate with authKey
- **Session Management**: Saves/restores user session
- **Error Handling**: Manages authentication errors and loading states
- **Context Provision**: Provides authentication context to all child components

### 3. **Component Usage** (`src/components/LearningCopilot.tsx`)

Components use the authentication context instead of handling auth themselves:

```typescript
import { useAuth } from '@/components/providers/AuthProvider';

const LearningCopilot: React.FC = () => {
  const { user, logout } = useAuth();
  
  return (
    <EnterpriseLayout
      user={user!}
      onLogout={logout}
      initialView="ai-agent"
    />
  );
};
```

## Usage Examples

### 1. Direct URL Access

```typescript
import { AdminURL, WebAPIURL, LearnerURL, AIAgentURL } from '@/config/api.config';

// Use individual URLs
const adminEndpoint = `${AdminURL}admin/users`;
const apiEndpoint = `${WebAPIURL}auth/login`;
const learnerEndpoint = `${LearnerURL}/courses`;
const aiEndpoint = `${AIAgentURL}/chat`;
```

### 2. Using Helper Methods

```typescript
import { API_CONFIG } from '@/config/api.config';

// Helper methods for constructing full URLs
const authEndpoint = API_CONFIG.getAuthEndpoint();
const adminUsersEndpoint = API_CONFIG.getAdminEndpoint('admin/users');
const learnerCoursesEndpoint = API_CONFIG.getLearnerEndpoint('courses');
const aiChatEndpoint = API_CONFIG.getAIAgentEndpoint('chat');
```

### 3. Using ApiService (Recommended)

```typescript
import { ApiService } from '@/services/api.service';

// Authentication
const user = await ApiService.auth.authenticate('auth-key');
await ApiService.auth.login({ email: 'user@example.com', password: 'password' });
await ApiService.auth.logout();

// User management
const profile = await ApiService.user.getProfile();
await ApiService.user.updatePreferences({ language: 'en' });

// Learning content
const courses = await ApiService.learning.getCourses();
const myLearning = await ApiService.learning.getMyLearning();
const catalog = await ApiService.learning.getCatalog();

// AI Agent
const chatResponse = await ApiService.ai.chat('Hello');
const generatedContent = await ApiService.ai.generate('Create a learning objective');
const roleplay = await ApiService.ai.createRoleplay({ scenario: 'Customer service' });

// Admin functions
const users = await ApiService.admin.getUsers();
const reports = await ApiService.admin.getReports();
```

### 4. Using Authentication Context in Components

```typescript
import { useAuth } from '@/components/providers/AuthProvider';

const MyComponent: React.FC = () => {
  const { user, logout, loading, error } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>Please log in</div>;

  return (
    <div>
      <h1>Welcome, {user.FirstName}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

### 5. Environment Detection

```typescript
import { API_CONFIG } from '@/config/api.config';

if (API_CONFIG.isDevelopment) {
  console.log('Using development URLs');
} else {
  console.log('Using production URLs');
}
```

### 6. Custom API Calls

```typescript
import { ApiService } from '@/services/api.service';
import { WebAPIURL } from '@/config/api.config';

// Custom endpoint using the base fetch method
const customEndpoint = `${WebAPIURL}custom/endpoint`;
const response = await ApiService.fetch(customEndpoint, {
  method: 'POST',
  body: JSON.stringify({ data: 'value' })
});
```

## Available Endpoints

### Authentication
- `authenticate` - Authenticate with authKey
- `login` - Login with credentials
- `logout` - Logout user
- `refreshToken` - Refresh access token

### User Management
- `userProfile` - Get user profile
- `userPreferences` - Update user preferences

### Learning Content
- `courses` - Get available courses
- `myLearning` - Get user's learning progress
- `catalog` - Get learning catalog
- `communities` - Get learning communities

### AI Agent
- `aiChat` - Chat with AI
- `aiGenerate` - Generate content
- `aiRoleplay` - Create roleplay scenarios

### Admin
- `adminUsers` - Get all users (admin only)
- `adminCourses` - Get all courses (admin only)
- `adminReports` - Get reports (admin only)

## Deployment Configuration

### IIS Sub-Application

For deployment as a sub-application in IIS, update `next.config.js`:

```javascript
const nextConfig = {
  basePath: '/your-sub-app-path', // Change this to your IIS path
  output: 'export',
  // ... other config
};
```

### Environment Variables

You can override URLs using environment variables:

```bash
# .env.local
NEXT_PUBLIC_ADMIN_URL=https://your-admin-url.com/
NEXT_PUBLIC_WEB_API_URL=https://your-api-url.com/api/
NEXT_PUBLIC_LEARNER_URL=https://your-learner-url.com
NEXT_PUBLIC_AI_AGENT_URL=https://your-ai-agent-url.com/api/v1
```

## Authentication Flow

1. **App Initialization**: `AuthProvider` initializes in `layout.tsx`
2. **URL Parameter**: Extract `authKey` from URL query parameters
3. **API Call**: Make POST request to `${WebAPIURL}auth/authenticate` with authKey
4. **Session Storage**: Save authenticated user to session storage
5. **URL Cleanup**: Remove authKey from URL for security
6. **Context Provision**: Provide authentication context to all components
7. **Fallback**: If no authKey, fall back to existing session or login screen

## Error Handling

All API calls include proper error handling:

```typescript
try {
  const user = await ApiService.auth.authenticate('auth-key');
  // Handle success
} catch (error) {
  console.error('Authentication failed:', error);
  // Handle error (show user-friendly message, redirect, etc.)
}
```

## Best Practices

1. **Use AuthProvider**: Authentication is handled centrally at the layout level
2. **Use useAuth Hook**: Access authentication state in components using `useAuth()`
3. **Use ApiService**: Prefer using `ApiService` methods over direct URL construction
4. **Error Handling**: Always wrap API calls in try-catch blocks
5. **Loading States**: Show loading indicators during API calls
6. **Session Management**: Use the existing session utilities for user state
7. **Environment Awareness**: Use environment detection for different configurations

## Migration Guide

If you have existing code using hardcoded URLs:

### Before
```typescript
const response = await fetch('https://developmentapi.instancy.com/api/auth/login', {
  method: 'POST',
  body: JSON.stringify(credentials)
});
```

### After
```typescript
const user = await ApiService.auth.login(credentials);
```

This approach provides better maintainability, type safety, and centralized configuration management.

## Authentication Context API

The `useAuth()` hook provides the following:

```typescript
interface AuthContextType {
  user: UserContext | null;           // Current authenticated user
  loading: boolean;                   // Authentication loading state
  error: string | null;               // Authentication error message
  login: (userContext: UserContext) => void;  // Login function
  logout: () => void;                 // Logout function
  clearError: () => void;             // Clear error function
}
```

## Examples

See `src/examples/auth-context-usage.tsx` for comprehensive examples of how to use the authentication context in different scenarios. 