// Examples of how to use the centralized API configuration
// This file demonstrates various ways to use the API_CONFIG and ApiService

import { API_CONFIG, AdminURL, WebAPIURL, LearnerURL, AIAgentURL } from '@/config/api.config';
import { ApiService } from '@/services/api.service';

// Example 1: Direct URL access
export const urlExamples = {
  // Access individual URLs
  adminUrl: AdminURL, // "https://development-admin.instancy.com/"
  webApiUrl: WebAPIURL, // "https://developmentapi.instancy.com/api/"
  learnerUrl: LearnerURL, // "http://development.instancy.com"
  aiAgentUrl: AIAgentURL, // "http://localhost:8080/api/v1"
  
  // Use helper methods
  authEndpoint: API_CONFIG.getAuthEndpoint(),
  adminUsersEndpoint: API_CONFIG.getAdminEndpoint('admin/users'),
  learnerCoursesEndpoint: API_CONFIG.getLearnerEndpoint('courses'),
  aiChatEndpoint: API_CONFIG.getAIAgentEndpoint('chat'),
};

// Example 2: Using ApiService for authentication
export const authenticationExamples = async () => {
  try {
    // Authenticate with authKey
    const user = await ApiService.auth.authenticate('your-auth-key');
    console.log('Authenticated user:', user);
    
    // Login with credentials
    const loggedInUser = await ApiService.auth.login({
      email: 'user@example.com',
      password: 'password'
    });
    
    // Logout
    await ApiService.auth.logout();
    
    // Refresh token
    const newToken = await ApiService.auth.refreshToken('refresh-token');
    
  } catch (error) {
    console.error('Authentication error:', error);
  }
};

// Example 3: Using ApiService for user management
export const userManagementExamples = async () => {
  try {
    // Get user profile
    const profile = await ApiService.user.getProfile();
    console.log('User profile:', profile);
    
    // Update user preferences
    await ApiService.user.updatePreferences({
      language: 'en',
      timezone: 'UTC',
      notifications: true
    });
    
  } catch (error) {
    console.error('User management error:', error);
  }
};

// Example 4: Using ApiService for learning content
export const learningContentExamples = async () => {
  try {
    // Get all courses
    const courses = await ApiService.learning.getCourses();
    console.log('Available courses:', courses);
    
    // Get user's learning progress
    const myLearning = await ApiService.learning.getMyLearning();
    console.log('My learning:', myLearning);
    
    // Get catalog
    const catalog = await ApiService.learning.getCatalog();
    console.log('Catalog:', catalog);
    
    // Get communities
    const communities = await ApiService.learning.getCommunities();
    console.log('Communities:', communities);
    
  } catch (error) {
    console.error('Learning content error:', error);
  }
};

// Example 5: Using ApiService for AI Agent
export const aiAgentExamples = async () => {
  try {
    // Chat with AI
    const chatResponse = await ApiService.ai.chat('Hello, how can you help me?');
    console.log('AI Chat response:', chatResponse);
    
    // Generate content
    const generatedContent = await ApiService.ai.generate('Create a learning objective');
    console.log('Generated content:', generatedContent);
    
    // Create roleplay
    const roleplay = await ApiService.ai.createRoleplay({
      scenario: 'Customer service training',
      difficulty: 'intermediate'
    });
    console.log('Roleplay created:', roleplay);
    
  } catch (error) {
    console.error('AI Agent error:', error);
  }
};

// Example 6: Using ApiService for admin functions
export const adminExamples = async () => {
  try {
    // Get all users (admin only)
    const users = await ApiService.admin.getUsers();
    console.log('All users:', users);
    
    // Get all courses (admin only)
    const courses = await ApiService.admin.getCourses();
    console.log('All courses:', courses);
    
    // Get reports (admin only)
    const reports = await ApiService.admin.getReports();
    console.log('Reports:', reports);
    
  } catch (error) {
    console.error('Admin error:', error);
  }
};

// Example 7: Custom API calls using the base fetch method
export const customApiExamples = async () => {
  try {
    // Custom endpoint using WebAPIURL
    const customEndpoint = `${WebAPIURL}custom/endpoint`;
    const response = await ApiService.fetch(customEndpoint, {
      method: 'POST',
      body: JSON.stringify({ customData: 'value' })
    });
    
    // Custom endpoint using AIAgentURL
    const aiCustomEndpoint = `${AIAgentURL}/custom/ai/endpoint`;
    const aiResponse = await ApiService.fetch(aiCustomEndpoint, {
      method: 'GET'
    });
    
  } catch (error) {
    console.error('Custom API error:', error);
  }
};

// Example 8: Environment-based configuration
export const environmentExamples = () => {
  console.log('Is development:', API_CONFIG.isDevelopment);
  console.log('Is production:', API_CONFIG.isProduction);
  
  // You can conditionally use different URLs based on environment
  if (API_CONFIG.isDevelopment) {
    console.log('Using development URLs');
  } else {
    console.log('Using production URLs');
  }
};

// Example 9: Using endpoints object
export const endpointsExamples = () => {
  console.log('Auth endpoint:', API_CONFIG.endpoints.authenticate);
  console.log('Login endpoint:', API_CONFIG.endpoints.login);
  console.log('Courses endpoint:', API_CONFIG.endpoints.courses);
  console.log('AI Chat endpoint:', API_CONFIG.endpoints.aiChat);
}; 