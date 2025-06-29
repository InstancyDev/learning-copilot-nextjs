// API Configuration - Centralized URL management
export const API_CONFIG = {
  // Base URLs for different services
  //AdminURL: 'https://development-admin.instancy.com/',
  //WebAPIURL: 'https://developmentapi.instancy.com/api/',
  //LearnerURL: 'http://development.instancy.com',
  //AIAgentURL: 'http://localhost:8080/api/v1',

  //AdminURL: 'https://qalearning-admin.instancy.com/',
  //WebAPIURL: 'https://qalearningapi.instancy.com/api/',
  //LearnerURL: 'http://qalearning.instancy.com',
  //AIAgentURL: 'https://qaaiagentstudio.instancy.com:4500',
  //AIAgentScriptSrc: 'https://instancycommoncontent.blob.core.windows.net/flowise-embed/1.2.5.3/dist/web.js',
  //LogOutURL: 'http://localhost:61286/',

  AdminURL: process.env.NEXT_PUBLIC_ADMIN_URL || 'https://enterprisedemo-admin.instancy.com/',
  WebAPIURL: process.env.NEXT_PUBLIC_WEB_API_URL || 'https://edemowebapi.instancy.com/api/',
  LearnerURL: process.env.NEXT_PUBLIC_LEARNER_URL || 'http://enterprisedemo.instancy.com',
  AIAgentURL: process.env.NEXT_PUBLIC_AI_AGENT_URL || 'https://edemoaiagentstudio.instancy.com:4500',
  AIAgentScriptSrc: process.env.NEXT_PUBLIC_AI_AGENT_SCRIPT_URL || 'https://instancycommoncontent.blob.core.windows.net/flowise-embed/1.2.5.3/dist/web.js',
  LogOutURL: process.env.NEXT_PUBLIC_LOGOUT_URL || 'https://learnova.instancy.com/',
  TAVUS_API_KEY: process.env.NEXT_PUBLIC_TAVUS_API_KEY || '085dfa46150b40f0a4f072eac2b994d7',
  NEXT_JS_URL:  process.env.NEXT_PUBLIC_NEXTJS_URL || 'https://learnova.instancy.com/',
  
  // Environment-based configuration
  get isDevelopment() {
    return process.env.NODE_ENV === 'development';
  },
  
  get isProduction() {
    return process.env.NODE_ENV === 'production';
  },
  
  // Helper methods for constructing full URLs
  getAuthEndpoint: () => `${API_CONFIG.WebAPIURL}auth/authenticate`,
  getAdminEndpoint: (path: string) => `${API_CONFIG.AdminURL}${path}`,
  getLearnerEndpoint: (path: string) => `${API_CONFIG.LearnerURL}/${path}`,
  getAIAgentEndpoint: (path: string) => `${API_CONFIG.AIAgentURL}/api/v1/${path}`,
  
  // Common API endpoints
  endpoints: {
    // Authentication
    authenticate: 'Generic/GetSubSiteMetaDataBasedOnAuthKey',
    login: 'auth/login',
    logout: 'auth/logout',
    refreshToken: 'auth/refresh',
    
    // User management
    userProfile: 'user/profile',
    userPreferences: 'user/preferences',
    
    // Learning content
    courses: 'courses',
    myLearning: 'mylearning',
    catalog: 'catalog',
    communities: 'communities',
    
    // AI Agent
    aiChat: 'chat',
    aiGenerate: 'generate',
    aiRoleplay: 'roleplay',
    
    // Admin
    adminUsers: 'admin/users',
    adminCourses: 'admin/courses',
    adminReports: 'admin/reports'
  }
};

// Type definitions for better TypeScript support
export interface ApiEndpoints {
  authenticate: string;
  login: string;
  logout: string;
  refreshToken: string;
  userProfile: string;
  userPreferences: string;
  courses: string;
  myLearning: string;
  catalog: string;
  communities: string;
  aiChat: string;
  aiGenerate: string;
  aiRoleplay: string;
  adminUsers: string;
  adminCourses: string;
  adminReports: string;
}

// Export individual URLs for direct access
export const {
  AdminURL,
  WebAPIURL,
  LearnerURL,
  AIAgentURL,
  AIAgentScriptSrc,
  TAVUS_API_KEY,
  LogOutURL,
  NEXT_JS_URL
} = API_CONFIG;

// Export endpoints for direct access
export const {
  endpoints
} = API_CONFIG; 