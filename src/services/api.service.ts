import { API_CONFIG } from '@/config/api.config';
import type { UserContext } from '@/types';
import { sessionUtils } from '@/utils/auth';

// Base API service with centralized configuration
export const ApiService = {
  // Generic fetch method with error handling
  async fetch(endpoint: string, options: RequestInit = {}): Promise<any> {
    try {
      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  },

  // Authentication methods
  auth: {
    authenticate: async (authKey: string): Promise<UserContext> => {
      const endpoint = `${API_CONFIG.WebAPIURL}${API_CONFIG.endpoints.authenticate}`;
      const response = await ApiService.fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ authKey }),
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Authentication failed');
      }
      
      return response.user;
    },

    // New method that matches the converted Angular logic
    authenticateWithSiteMetadata: async (authKey: string): Promise<{ user: UserContext; siteDetails: any; siteKeyParams: any }> => {
      // Clean the authKey to remove any quotes that might have been added
      const cleanAuthKey = authKey.replace(/^["']|["']$/g, '');
      
      // Step 1: Prepare data object for GetSubSiteMetaDataBasedOnAuthKey
      const dataObj = {
        intUserID: -1,
        intFromSIteID: -1,
        strAuthKey: cleanAuthKey,
      };

      // Step 2: Call GetSubSiteMetaDataBasedOnAuthKey API
      const siteMetadataResponse = await ApiService.fetch(
        `${API_CONFIG.WebAPIURL}Generic/GetSubSiteMetaDataBasedOnAuthKey`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'AllowWindowsandMobileApps': 'allow',
            'ClientURL': `${API_CONFIG.LearnerURL}`,
          },
          body: new URLSearchParams(dataObj as any).toString(),
        }
      );

      if (!siteMetadataResponse.Table || siteMetadataResponse.Table.length === 0) {
        throw new Error('No site details found for the provided auth key');
      }

      const siteDetails = siteMetadataResponse;

      // Step 3: Process site parameters if they exist
      let siteKeyParams: any = {};
      
      if (siteDetails.Table[0].OtherParams) {
        siteKeyParams = ApiService.parseSiteParams(siteDetails.Table[0].OtherParams);
      }

      // Step 4: Handle admin user session cleanup
      if (
        siteKeyParams.adminUserId &&
        siteKeyParams.adminUserId.length > 0 &&
        Number(siteKeyParams.adminUserId) !== 0 &&
        Number(siteKeyParams.adminUserId) !== -1
      ) {
        // Clear all session items and cookies
        await ApiService.clearAllSessions();
      }

      // Step 5: Verify existing user
      const user = await ApiService.verifyExistingUser(siteDetails.Table[0], cleanAuthKey);
      
      if (!user) {
        throw new Error('User verification failed');
      }

      return { user, siteDetails, siteKeyParams };
    },

    login: async (credentials: { email: string; password: string }): Promise<UserContext> => {
      const endpoint = `${API_CONFIG.WebAPIURL}${API_CONFIG.endpoints.login}`;
      const response = await ApiService.fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      return response.user;
    },

    logout: async (): Promise<void> => {
      const endpoint = `${API_CONFIG.WebAPIURL}${API_CONFIG.endpoints.logout}`;
      await ApiService.fetch(endpoint, { method: 'POST' });
    },

    refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
      const endpoint = `${API_CONFIG.WebAPIURL}${API_CONFIG.endpoints.refreshToken}`;
      const response = await ApiService.fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
      
      return response;
    }
  },

  // User management methods
  user: {
    getProfile: async (): Promise<UserContext> => {
      const endpoint = `${API_CONFIG.WebAPIURL}${API_CONFIG.endpoints.userProfile}`;
      return await ApiService.fetch(endpoint);
    },

    updatePreferences: async (preferences: any): Promise<void> => {
      const endpoint = `${API_CONFIG.WebAPIURL}${API_CONFIG.endpoints.userPreferences}`;
      await ApiService.fetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify(preferences),
      });
    }
  },

  // Learning content methods
  learning: {
    getCourses: async (): Promise<any[]> => {
      const endpoint = `${API_CONFIG.WebAPIURL}${API_CONFIG.endpoints.courses}`;
      return await ApiService.fetch(endpoint);
    },

    getMyLearning: async (): Promise<any[]> => {
      const endpoint = `${API_CONFIG.WebAPIURL}${API_CONFIG.endpoints.myLearning}`;
      return await ApiService.fetch(endpoint);
    },

    getCatalog: async (): Promise<any[]> => {
      const endpoint = `${API_CONFIG.WebAPIURL}${API_CONFIG.endpoints.catalog}`;
      return await ApiService.fetch(endpoint);
    },

    getCommunities: async (): Promise<any[]> => {
      const endpoint = `${API_CONFIG.WebAPIURL}${API_CONFIG.endpoints.communities}`;
      return await ApiService.fetch(endpoint);
    }
  },

  // AI Agent methods
  ai: {
    chat: async (message: string): Promise<any> => {
      const endpoint = `${API_CONFIG.AIAgentURL}/api/v1/${API_CONFIG.endpoints.aiChat}`;
      return await ApiService.fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
    },

    generate: async (prompt: string): Promise<any> => {
      const endpoint = `${API_CONFIG.AIAgentURL}/api/v1/${API_CONFIG.endpoints.aiGenerate}`;
      return await ApiService.fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ prompt }),
      });
    },

    createRoleplay: async (params: any): Promise<any> => {
      const endpoint = `${API_CONFIG.AIAgentURL}/api/v1/${API_CONFIG.endpoints.aiRoleplay}`;
      return await ApiService.fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(params),
      });
    }
  },

  // Admin methods
  admin: {
    getUsers: async (): Promise<any[]> => {
      const endpoint = `${API_CONFIG.AdminURL}${API_CONFIG.endpoints.adminUsers}`;
      return await ApiService.fetch(endpoint);
    },

    getCourses: async (): Promise<any[]> => {
      const endpoint = `${API_CONFIG.AdminURL}${API_CONFIG.endpoints.adminCourses}`;
      return await ApiService.fetch(endpoint);
    },

    getReports: async (): Promise<any[]> => {
      const endpoint = `${API_CONFIG.AdminURL}${API_CONFIG.endpoints.adminReports}`;
      return await ApiService.fetch(endpoint);
    }
  },

  // Helper methods for authentication
  parseSiteParams: (otherParams: string): any => {
    const params: any = {};
    
    try {
      // Assuming OtherParams is a string that can be parsed as key-value pairs
      // You may need to adjust this based on the actual format of OtherParams
      const paramPairs = otherParams.split('&');
      
      paramPairs.forEach(pair => {
        const [key, value] = pair.split('=');
        if (key && value) {
          params[decodeURIComponent(key)] = decodeURIComponent(value);
        }
      });
    } catch (error) {
      console.error('Error parsing site parameters:', error);
    }
    
    return params;
  },

  clearAllSessions: async (): Promise<void> => {
    try {
      // This would typically be handled by your session management system
      // For now, we'll log what should be cleared
      console.log('Clearing sessions and cookies for admin user');
      
      // In a real implementation, you would:
      // 1. Clear session storage items
      // 2. Clear cookies
      // 3. Clear any server-side sessions
      
      const itemsToClear = [
        'userContext_' + API_CONFIG.LearnerURL,
        'userContext_' + 'SiteID', // Replace with actual site ID
        'ReviewProfilefiledCompleted',
        'Selectedgameid',
        'sessionsecureauthkey',
        'frommainsite',
        'UserSessionID',
        'ASP.NET_SessionId',
        'GetUserSessionIDWhenLearnerLogout',
        'RedirectURLfromLogin',
        'contentaccesscookie'
      ];
      
      console.log('Items to clear:', itemsToClear);
      
    } catch (error) {
      console.error('Error clearing sessions:', error);
    }
  },

  verifyExistingUser: async (siteTable: any, authKey: string): Promise<UserContext | null> => {
    try {
      // Step 1: Get user personal details
      let dataObj = {
        intUserID: siteTable.UserID,
        intSiteID: siteTable.FromSiteID,
        intSubSiteID: siteTable.FromSiteID,
      };

      console.log('Step 1: Getting user personal details...');
      
      // Build query parameters for GET request
      const queryParams = new URLSearchParams(dataObj as any).toString();
      const userDetailsResponse = await ApiService.fetch(
        `${API_CONFIG.WebAPIURL}User/isVerifyExistingUser?${queryParams}`,
        {
          method: 'GET',
          headers: { 
            'AllowWindowsandMobileApps': 'allow',
            'ClientURL': `${API_CONFIG.LearnerURL}`,
          },
          // No body for GET requests
        }
      );

      console.log('User details response:', userDetailsResponse);

      // Store user details in session storage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('dsuserPersonlDetails', JSON.stringify(userDetailsResponse));
      }

      // Step 2: Check if user details exist
      if (!userDetailsResponse.Table || userDetailsResponse.Table.length === 0) {
        console.log('No user details found');
        return null;
      }

      // Step 3: Login user and get user context
      const userContext = await ApiService.loginUserWithDetails(userDetailsResponse);
      
      if (userContext) {
        console.log('User login successful, user context created');
        return userContext;
      }

      return null;
    } catch (error) {
      console.error('Error verifying existing user:', error);
      return null;
    }
  },

  // New method to handle user login with details
  loginUserWithDetails: async (dsUserDetails: any): Promise<UserContext | null> => {
    try {
      console.log('Step 2: Logging in user with details...');
      
      // Extract login credentials
      const strlogin = dsUserDetails.Table1?.[0]?.Login?.toString() || '';
      let strPassword = '';
      
      if (dsUserDetails.Table1?.[0]?.Password != null && 
          dsUserDetails.Table1[0].Password.toString() !== '') {
        strPassword = dsUserDetails.Table1[0].Password.toString();
      }

      console.log('Login credentials extracted:', { login: strlogin, hasPassword: !!strPassword });

      // Step 3: Validate user and get user context
      const userContext = await ApiService.validateUserAndLogin(strlogin, strPassword);
      
      if (userContext) {
        console.log('User validation and login successful');
        return userContext;
      }

      return null;
    } catch (error) {
      console.error('Error in loginUserWithDetails:', error);
      return null;
    }
  },

  // New method to validate user and perform login
  validateUserAndLogin: async (loginId: string, password: string): Promise<UserContext | null> => {
    try {
      console.log('Step 3: Validating user and performing login...');

      // Check if user context already exists in session
      const existingUserContext = sessionUtils.getUserFromSession();
      if (existingUserContext) {
        console.log('User context already exists in session');
        return existingUserContext;
      }

      // Prepare login data
      const uData = {
        LoginID: btoa(loginId),
        Password: btoa(password),
        RequestURL: typeof window !== 'undefined' ? API_CONFIG.LearnerURL : '',
        ApplicationURL: API_CONFIG.AdminURL,
        RemainingDaysToChangePassword: 1,
        IsEncrypted: true,
        LoginAsLearnerAdminUserID: 0, // Will be set based on site params
        SSOSessionID: '', // Will be set if SAML session exists
      };

      // Check for SAML session
      if (typeof window !== 'undefined') {
        const samlSession = document.cookie
          .split('; ')
          .find(row => row.startsWith('SAML_User_Session='))
          ?.split('=')[1];
        
        if (samlSession) {
          uData.SSOSessionID = samlSession;
          uData.Password = btoa(''); // Clear password for SAML
        }
      }

      // Check for admin user ID from site params
      const siteParams = sessionStorage.getItem('siteParams');
      if (siteParams) {
        const params = JSON.parse(siteParams);
        if (params.adminUserId && 
            params.adminUserId.length > 0 && 
            Number(params.adminUserId) !== 0 && 
            Number(params.adminUserId) !== -1) {
          uData.LoginAsLearnerAdminUserID = Number(params.adminUserId);
        }
      }

      console.log('Login data prepared:', { ...uData, LoginID: '***', Password: '***' });

      // Perform login
      const loginResponse = await ApiService.fetch(
        `${API_CONFIG.WebAPIURL}AngularLMS/Login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'AllowWindowsandMobileApps': 'allow',
            'ClientURL': `${API_CONFIG.LearnerURL}`,
          },
          body: new URLSearchParams(uData as any).toString(),
        }
      );

      console.log('Login response received:', loginResponse);

      // Handle different login response scenarios
      if (loginResponse && typeof loginResponse === 'object' && loginResponse.UserID) {
        // Successful login - create user context
        const userContext: UserContext = {
          UserID: loginResponse.UserID || 1,
          OrgUnitID: loginResponse.OrgUnitID || 1,
          UserPrivileges: loginResponse.UserPrivileges || [],
          UserRoles: loginResponse.UserRoles || [{ RoleID: 1, Name: 'Learner' }],
          UserCMSGroups: loginResponse.UserCMSGroups || [],
          EmailAddress: loginResponse.EmailAddress || loginResponse.LoginID || 'user@example.com',
          JwtToken: loginResponse.JwtToken || loginResponse.SessionID || 'mock-jwt-token',
          FirstName: loginResponse.FirstName || 'John',
          LastName: loginResponse.LastName || 'Doe',
          IsClarizenUser: loginResponse.IsClarizenUser || '0',
          UserDisplayName: loginResponse.UserDisplayName || `${loginResponse.FirstName || 'John'} ${loginResponse.LastName || 'Doe'}`,
          AccountType: loginResponse.AccountType || 1,
          SiteID: loginResponse.SiteID || 1,
          CMSGroupID: loginResponse.CMSGroupID || 1,
          SessionID: loginResponse.SessionID || 'mock-session-id',
          SendMessage: loginResponse.SendMessage || 1,
          ExternalUser: loginResponse.ExternalUser || 0,
          Membership: loginResponse.Membership || 1,
          Picture: loginResponse.Picture || '',
          Language: loginResponse.Language || 'en',
          Country: loginResponse.Country || 'US',
          NotifiyMessage: loginResponse.NotifiyMessage || '',
          AutoLaunchContent: loginResponse.AutoLaunchContent || '0',
          UserTimeZone: loginResponse.UserTimeZone || 'UTC',
          IsGroupExpired: loginResponse.IsGroupExpired || 0,
          UserLockedtime: loginResponse.UserLockedtime || 0,
          UserLogin: loginResponse.UserLogin || loginResponse.LoginID || 'johndoe',
          IsSysAdminUser: loginResponse.IsSysAdminUser || false
        };

        // Save user context to session
        sessionUtils.saveUserToSession(userContext);
        
        console.log('User context created and saved:', userContext);
        return userContext;

      } else if (loginResponse && typeof loginResponse === 'string') {
        // Handle string responses (error messages)
        const responseStr = loginResponse.toString();
        
        if (responseStr.startsWith('redirecttopayment')) {
          throw new Error('Your membership is expired. Please contact administrator.');
        } else if (responseStr.startsWith('userdeactivated')) {
          throw new Error('Your account has been deactivated.');
        } else if (responseStr.startsWith('Userislocked')) {
          throw new Error('Your account is locked due to multiple failed login attempts.');
        } else {
          throw new Error(`Login failed: ${responseStr}`);
        }

      } else {
        // Handle other error scenarios
        throw new Error('Login failed: Invalid response from server');
      }

    } catch (error) {
      console.error('Error in validateUserAndLogin:', error);
      throw error;
    }
  },

  // --- Co-Create Knowledgebase API ---
  coCreate: {
    getKnowledgebaseList: async (
      params: CoCreateKnowledgebaseListParams
    ): Promise<any> => {
      // Get user/session info
      const user = sessionUtils.getUserFromSession();
      if (!user) throw new Error('User not authenticated');

      const query = new URLSearchParams({
        userId: params.userId.toString(),
        folderId: params.folderId.toString(),
        pageno: params.pageno.toString(),
        cmsGroupId: params.cmsGroupId.toString(),
        componentId: (params.componentId ?? 0).toString(),
        additionalFilter: params.additionalFilter ?? '',
      }).toString();

      const endpoint = `${API_CONFIG.WebAPIURL}MobileLMS/GetCoCreateKnowledgebaseList?${query}`;

      return await ApiService.fetch(endpoint, {
        method: 'GET',
        headers: {
          accept: '*/*',
          'content-type': 'application/json',
          authorization: `Bearer ${user.JwtToken}`,
          clientapiurl: API_CONFIG.WebAPIURL,
          clienturl: API_CONFIG.LearnerURL,
          locale: user.Language || 'en-us',
          orgunitid: user.OrgUnitID?.toString() || '',
          siteid: user.SiteID?.toString() || '',
          userid: user.UserID?.toString() || '',
          "AllowWindowsandMobileApps": "allow",
        },
      });
    },
  },
};

// Legacy RoleplayService for backward compatibility
export const RoleplayService = {
  generateWithAI: async (body: any): Promise<any> => {
    console.log('Mock generateWithAI called with:', body);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
    // Return a mock response structure based on the reference code
    return {
      data: {
        json: {
          LearningObjective: 'Mock Learning Objective from AI',
          ScenarioDescription: 'Mock scenario description from AI.',
          LearnerRoleDescription: 'You are a mock learner.',
          SimulatedParticipantName: 'Mock AI Participant',
          SimulatedParticipantRoleDescription: 'A mock participant that is angry.',
          SimulatedParticipantOpeningStatement: 'This is a mock outrage!',
          SimulatedParticipantTone: 'Angry',
          GuideName: 'Mock AI Guide',
          GuideDescription: 'A mock guide to help you.',
          GuideTone: 'Helpful',
          WelcomeMessage: 'Welcome to the mock roleplay!',
          RolePlayCompletionMessage: 'You have completed the mock roleplay.',
          ConclusionMessage: 'This is the mock conclusion.',
          EvaluationIntroMessage: 'Let\'s evaluate your mock performance.'
        }
      }
    };
  }
};

// --- Co-Create Knowledgebase API ---
export interface CoCreateKnowledgebaseListParams {
  userId: number;
  folderId: number;
  pageno: number;
  cmsGroupId: number;
  componentId?: number;
  additionalFilter?: string;
}

// --- Site Configuration Service ---
let siteConfigCache: Array<{ ConfigKeyID: number; Name: string; KeyValue: string }> | null = null;

export async function fetchSiteConfigurations() {
  const user = sessionUtils.getUserFromSession();
  if (!user) throw new Error('User not authenticated');

  // Try to get from sessionStorage first
  if (typeof window !== 'undefined') {
    const cached = sessionStorage.getItem('siteConfigCache');
    if (cached) {
      siteConfigCache = JSON.parse(cached);
      return siteConfigCache;
    }
  }

  const endpoint = `${API_CONFIG.WebAPIURL}SiteInfo/Configurations`;
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      accept: '*/*',
      authorization: `Bearer ${user.JwtToken || ''}`,
      clienturl: API_CONFIG.LearnerURL,
      isfromdesktop: 'true',
      locale: user.Language || 'en-us',
      siteid: user.SiteID?.toString() || '',
      userid: user.UserID?.toString() || '-1',
      "AllowWindowsandMobileApps": "allow",
    },
  });
  if (!response.ok) throw new Error('Failed to fetch site configurations');
  const configList = await response.json();
  siteConfigCache = configList;
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('siteConfigCache', JSON.stringify(configList));
  }
  return configList;
}

export function getSiteConfigValue(name: string): string | null {
  if (!siteConfigCache && typeof window !== 'undefined') {
    const cached = sessionStorage.getItem('siteConfigCache');
    if (cached) {
      siteConfigCache = JSON.parse(cached);
    }
  }
  if (!siteConfigCache) return null;
  const found = siteConfigCache.find(cfg => cfg.Name === name);
  return found ? found.KeyValue : null;
}

// Share Co-Create Knowledge Base API
export async function shareCoCreateKnowledgeBase({
  contentId,
  folderPath,
  startPage,
  objectTypeId,
  assignComponentId
}: {
  contentId: string;
  folderPath: string;
  startPage: string;
  objectTypeId: number;
  assignComponentId: number;
}) {
  const user = sessionUtils.getUserFromSession();
  if (!user) throw new Error('User not authenticated');

  const endpoint = `${API_CONFIG.AdminURL}LMEditorApi/api/NativeAuthoring/ShareCoCreateKnowledgeBase`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 
      'content-type': 'application/json; charset=utf-8', 
      siteid: user.SiteID?.toString() || '',
      // user-agent is set by browser
    },
    body: JSON.stringify({
      contentId,
      folderPath,
      startPage,
      objectTypeId,
      assignComponentId
    })
  });
  if (!response.ok) throw new Error('Failed to share knowledge');
  return response.json();
}

// Generate Roleplay with AI
export async function generateRoleplayWithAI({
  question,
  promptValues,
  overrideConfig
}: {
  question: string;
  promptValues: any;
  overrideConfig?: any;
}) {
  const user = sessionUtils.getUserFromSession();
  if (!user) throw new Error('User not authenticated');
  const rolePlayMetadataGenerationFlowId = await getRolePlayAssistantFlowId(user.OrgUnitID, user.JwtToken, 'roleplay_metadata_generation');
  const endpoint = `${API_CONFIG.AIAgentURL}/api/v1/prediction/${rolePlayMetadataGenerationFlowId}`;
  const token = user.JwtToken;
  const body = {
    question,
    overrideConfig: {
      vars: {
        clientUrl: `${API_CONFIG.LearnerURL}`,
        AllowWindowsandMobileApps: 'allow',
        siteId: String(user.SiteID),
        Locale: user.Language || 'en-us',
        userId: String(user.UserID),
        authorizationCode: `Bearer ${token}`,
        webAPIURL: `${API_CONFIG.WebAPIURL}`,
      },
      promptValues,
      ...overrideConfig,
    }
  };
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 
      'AllowWindowsandMobileApps': 'allow',
      Authorization: `Bearer ${token}`,
      ClientApiURL: `${API_CONFIG.WebAPIURL}`,
      ClientURL: `${API_CONFIG.LearnerURL}`,
      Locale: user.Language || 'en-us',
      OrgUnitID: String(user.OrgUnitID),
      SiteID: String(user.SiteID),
      UserID: String(user.UserID),
      'content-type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error('Failed to generate roleplay with AI');
  const data = await response.json();
  return data.json;
}

// Save Roleplay Content (CreateNewContentItem)
export async function saveRoleplayContent(form: {
  ContentID?: string;
  topic?: string;
  size?: string;
  Language: string;
  kbId?: string;
  authorName: string;
  JWVideoDetails?: string;
  JWfileName?: string;
  fileName?: string;
  additionalData: any;
  FolderID: string | number;
  CMSGroupID: string | number;
  ActionType: string;
  ThumbnailImageName?: string;
  CategoryType: string;
  ObjectTypeID: string | number;
  UserID: string | number;
  SiteID: string | number;
  MediaTypeID: string | number;
  isContentShared: string;
  formData: any;
  ThumbnailImage?: string | null;
  Categories: string;
  UnAssignCategories?: string;
}) {
  const user = sessionUtils.getUserFromSession();
  if (!user) throw new Error('User not authenticated');
  const endpoint = `${API_CONFIG.AdminURL}LMEditorApi/api/NativeAuthoring/CreateNewContentItem`;
  const fd = new FormData();
  fd.append('ContentID', form.ContentID || '');
  fd.append('topic', form.topic || '');
  fd.append('size', form.size || '');
  fd.append('Language', form.Language);
  fd.append('kbId', form.kbId || '');
  fd.append('authorName', form.authorName);
  fd.append('JWVideoDetails', form.JWVideoDetails || '');
  fd.append('JWfileName', form.JWfileName || '');
  fd.append('fileName', form.fileName || '');
  fd.append('additionalData', typeof form.additionalData === 'string' ? form.additionalData : JSON.stringify(form.additionalData));
  fd.append('FolderID', String(form.FolderID));
  fd.append('CMSGroupID', String(form.CMSGroupID));
  fd.append('ActionType', form.ActionType);
  fd.append('ThumbnailImageName', form.ThumbnailImageName || '');
  fd.append('CategoryType', form.CategoryType);
  fd.append('ObjectTypeID', String(form.ObjectTypeID));
  fd.append('UserID', String(form.UserID));
  fd.append('SiteID', String(form.SiteID));
  fd.append('MediaTypeID', String(form.MediaTypeID));
  fd.append('isContentShared', form.isContentShared);
  fd.append('formData', typeof form.formData === 'string' ? form.formData : JSON.stringify(form.formData));
  fd.append('ThumbnailImage', form.ThumbnailImage || '');
  fd.append('Categories', form.Categories);
  fd.append('UnAssignCategories', form.UnAssignCategories || '');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      // 'content-type' is omitted so browser sets the correct boundary
      siteid: String(user.SiteID),
      // user-agent is set by browser
    },
    body: fd,
  });
  if (!response.ok) throw new Error('Failed to save roleplay content');

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  } else {
    const text = await response.text();
    // Try to parse as JSON, if fails, return as { contentId: text }
    try {
      return JSON.parse(text);
    } catch {
      return { contentId: text };
    }
  }
}

// Get Content Keywords (Tags)
export async function getContentKeywords() {
  const user = sessionUtils.getUserFromSession();
  if (!user) throw new Error('User not authenticated');

  const endpoint = `${API_CONFIG.WebAPIURL}MobileLMS/GetContentKeywords?SiteID=${user.SiteID}&userId=${user.UserID}`;
  
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: { 
      'content-type': 'application/json',
      authorization: `Bearer ${user.JwtToken}`,
      clientapiurl: API_CONFIG.WebAPIURL,
      clienturl: API_CONFIG.LearnerURL,
      locale: user.Language || 'en-us',
      orgunitid: String(user.OrgUnitID),
      siteid: String(user.SiteID),
      userid: String(user.UserID),
      "AllowWindowsandMobileApps": "allow",
    },
  });

  if (!response.ok) throw new Error('Failed to fetch content keywords');
  const data = await response.json();
  return data.Table.map((item: { Keyword: string }) => item.Keyword);
}

// Get User Skills
export async function getUserSkills() {
  const user = sessionUtils.getUserFromSession();
  if (!user) throw new Error('User not authenticated');

  const endpoint = `${API_CONFIG.WebAPIURL}AsktheExpert/GetUserQuestionSkills?aintSiteID=${user.SiteID}&astrType=all`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${user.JwtToken}`,
      clientapiurl: API_CONFIG.WebAPIURL,
      clienturl: API_CONFIG.LearnerURL,
      locale: user.Language || 'en-us',
      orgunitid: String(user.OrgUnitID),
      siteid: String(user.SiteID),
      userid: String(user.UserID),
      "allowwindowsandmobileapps": "allow",
    },
  });

  if (!response.ok) throw new Error('Failed to fetch user skills');
  const data = await response.json();
  return data.Table; // Return the full array of skill objects
}

// Add this function near other AI-related functions
/**
 * Calls the Instancy AI background image generation API.
 * @param {object} params - The parameters for the API call.
 * @param {string} params.description - The image description for AI generation.
 * @returns {Promise<any>} The API response JSON.
 */
export async function generateBackgroundImageWithAI({ description }: { description: string }): Promise<any> {
  const user = sessionUtils.getUserFromSession();
  if (!user) throw new Error('User not authenticated');
  const resp = await fetch(`${API_CONFIG.AdminURL}LMEditorApi/api//NativeAuthoring/ThumbnailGenerate`, {
    method: 'POST',
    headers: { 
      'allowwindowsandmobileapps': 'allow',
      'authorization': `Bearer ${user.JwtToken}`,
      'clientapiurl': API_CONFIG.WebAPIURL,
      'clienturl': API_CONFIG.LearnerURL,
      'content-type': 'application/json; charset=utf-8',
      'locale': user.Language || 'en-us',
      'orgunitid': String(user.OrgUnitID), 
      'siteid': String(user.SiteID), 
      'userid': String(user.UserID),
    },
    body: JSON.stringify({
      content: description,
      aspect_ratio: '',
      image_type: '',
      title: '',
      output_file_path: '',
      client_url: API_CONFIG.LearnerURL,
      style: 'Flat Design',
      requestedBy: user.UserID,
      userId: user.UserID,
      siteId: user.SiteID,
      isLearningModule: '0', 
    }),
  });
  return await resp.json();
}

/**
 * Fetches the flowID for rolePlay_Assistant_llm from the AI configuration API.
 * Uses sessionStorage to cache aiConfigurations by orgUnitId.
 * @param {string|number} orgUnitId - The OrgUnitID to use in the API call.
 * @param {string} jwtToken - The user's JWT token for authorization.
 * @param {string} flowType - The flowType to look for.
 * @returns {Promise<string|null>} The flowID if found, otherwise null.
 */
export async function getRolePlayAssistantFlowId(orgUnitId: string | number, jwtToken: string, flowType: string): Promise<string | null> {
  const storageKey = `aiConfigurations_${orgUnitId}`;
  let aiConfigurations: any[] | null = null;

  // Try to get from sessionStorage
  const cached = typeof window !== 'undefined' ? sessionStorage.getItem(storageKey) : null;
  if (cached) {
    try {
      aiConfigurations = JSON.parse(cached);
    } catch (e) {
      aiConfigurations = null;
    }
  }

  // If not cached, fetch from API and cache
  if (!aiConfigurations) {
    const resp = await fetch(`${API_CONFIG.AdminURL}LMEditorApi/api/ContentGenerator/GetContentGenerationConfigurations/${orgUnitId}`, {
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
      },
    });
    const data = await resp.json();
    if (data && Array.isArray(data.aiConfigurations)) {
      aiConfigurations = data.aiConfigurations;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(storageKey, JSON.stringify(aiConfigurations));
      }
    } else {
      aiConfigurations = [];
    }
  }

  // Find the config for the given flowType
  const configsArr = Array.isArray(aiConfigurations) ? aiConfigurations : [];
  const config = configsArr.find((c: any) => c.flowType === flowType);
  return config ? config.flowID : null;
}

export async function getBotDetails(siteId: number) {
  const user = sessionUtils.getUserFromSession();
  if (!user) throw new Error('User not authenticated');
  const response = await fetch(`${API_CONFIG.WebAPIURL}Bot/GetSiteBotDetails?intSiteID=${siteId}`, {
    headers: { 
      'allowwindowsandmobileapps': 'allow',
      'authorization': `Bearer ${user.JwtToken}`,
      'clienturl': API_CONFIG.LearnerURL, 
      'isfromdesktop': 'true',
      'locale': user.Language || 'en-us', 
      'siteid': String(user.SiteID),
      'userid': String(user.UserID)
    }
  });
  if (!response.ok) throw new Error('Failed to fetch bot details');
  return response.json();
}

/**
 * Generate topics using external AI API
 * @param params { learning_objective, title, numberofTopics, audience, tone, description }
 */
export async function generateTopicsWithAI({
  learning_objective,
  title,
  numberofTopics,
  audience = '',
  tone = '',
  description
}: {
  learning_objective: string;
  title: string;
  numberofTopics: string;
  audience?: string;
  tone?: string;
  description: string;
}) {
  const user = sessionUtils.getUserFromSession();
  if (!user) throw new Error('User not authenticated');
  const topicFlowId = await getRolePlayAssistantFlowId(user.OrgUnitID, user.JwtToken, 'ai_tutor_topic_llm');
  const endpoint = `${API_CONFIG.AIAgentURL}/api/v1/prediction/${topicFlowId}`;

  const body = {
    question: 'generate',
    overrideConfig: {
      vars: {
        clientUrl: API_CONFIG.LearnerURL,
        AllowWindowsandMobileApps: 'allow',
        siteId: String(user.SiteID),
        Locale: user.Language || 'en-us',
        userId: String(user.UserID),
        authorizationCode: `Bearer ${user.JwtToken}`,
        webAPIURL: API_CONFIG.WebAPIURL,
        Language: user.Language || 'en-us',
        categoryId: '0',
        emailId: user.EmailAddress,
        orgUnitId: String(user.OrgUnitID),
      },
      promptValues: {
        learning_objective,
        title,
        numberofTopics,
        audience,
        tone,
        description
      }
    }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 
      'AllowWindowsandMobileApps': 'allow',
      'Authorization': `Bearer ${user.JwtToken}`,
      'ClientApiURL': API_CONFIG.WebAPIURL,
      'ClientURL': API_CONFIG.LearnerURL, 
      'Locale': user.Language || 'en-us',
      'OrgUnitID': String(user.OrgUnitID), 
      'SiteID': String(user.SiteID), 
      'UserID': String(user.UserID),
      'content-type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error('Failed to generate topics');
  }

  return await response.json();
}

export async function createContentItemAndAIAgent({
  contentPayload, // for saveRoleplayContent (multipart/form-data)
  aiAgentPayload // for CreateNativeAIAgent (JSON)
}: {
  contentPayload: any;
  aiAgentPayload: any;
}) {
  // First API: CreateNewContentItem
  const contentResp = await saveRoleplayContent(contentPayload);
  debugger;
  // If contentId is needed in the second payload, inject it
  if (contentResp && contentResp.contentId && aiAgentPayload) {
    aiAgentPayload.contentId = contentResp.contentId;
  }
  // Second API: CreateNativeAIAgent
  const user = sessionUtils.getUserFromSession();
  if (!user) throw new Error('User not authenticated');
  const endpoint = `${API_CONFIG.WebAPIURL}MobileLMS/CreateNativeAIAgent`;
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: { 
      'allowwindowsandmobileapps': 'allow',
      'authorization': `Bearer ${user.JwtToken}`,
      'clientapiurl': API_CONFIG.WebAPIURL,
      'clienturl': API_CONFIG.LearnerURL,
      'content-type': 'application/json; charset=utf-8',
      'locale': user.Language || 'en-us',
      'orgunitid': String(user.OrgUnitID), 
      'siteid': String(user.SiteID), 
      'userid': String(user.UserID),
    },
    body: JSON.stringify(aiAgentPayload),
  });
  if (!resp.ok) throw new Error('Failed to create AI Agent');
  const aiAgentResp = await resp.json();
  return { contentResp, aiAgentResp };
}

export async function initiateBackgroundProcess({
  contentID,
  folderPath,
  createdBy,
  totalPages,
  AdditionalData,
  siteID,
  folderID,
  CMSGroupID,
  locale,
  objectTypeID,
  mediaTypeID,
  jwtToken,
}: {
  contentID: string;
  folderPath: string;
  createdBy: string | number;
  totalPages: string | number;
  AdditionalData: any;
  siteID: string | number;
  folderID: string | number;
  CMSGroupID: string | number;
  locale: string;
  objectTypeID: string | number;
  mediaTypeID: string | number;
  jwtToken: string;
}) {
  const formData = new FormData();
  formData.append('contentID', contentID);
  formData.append('folderPath', folderPath);
  formData.append('createdBy', String(createdBy));
  formData.append('totalPages', String(totalPages));
  formData.append('AdditionalData', typeof AdditionalData === 'string' ? AdditionalData : JSON.stringify(AdditionalData));
  formData.append('siteID', String(siteID));
  formData.append('folderID', String(folderID));
  formData.append('CMSGroupID', String(CMSGroupID));
  formData.append('locale', locale);
  formData.append('objectTypeID', String(objectTypeID));
  formData.append('mediaTypeID', String(mediaTypeID));

  const resp = await fetch(`${API_CONFIG.AdminURL}LMEditorApi/api/LearningModule/InitiateBackgroundProcess`, {
    method: 'POST',
    headers: { 
      'adminurl': API_CONFIG.AdminURL,
      'allowwindowsandmobileapps': 'allow',
      'authorization': `Bearer ${jwtToken}`,
      'authorizationcode': `Bearer ${jwtToken}`,
      'clientapiurl': API_CONFIG.WebAPIURL,
      'clienturl': API_CONFIG.LearnerURL,
      'locale': locale,
      'orgunitid': String(siteID), 
      'siteid': String(siteID), 
      'userid': String(createdBy),
      'x-request-from': 'internal',
    },
    body: formData,
  });
  if (!resp.ok) throw new Error('Failed to initiate background process');
  return await resp.json();
}

/**
 * Calls the fixed AI Tutor prediction API as per the provided cURL.
 * @param payload The JSON body to send in the request.
 * @returns The API response as JSON.
 */
export async function callFixedAITutorPredictionAPI(payload: any) {
  const user = sessionUtils.getUserFromSession();
  if (!user) throw new Error('User not authenticated');
  const topicNodeLLMFlowId = await getRolePlayAssistantFlowId(user.OrgUnitID, user.JwtToken, 'ai_tutor_topic_nodes_llm');
  const response = await fetch(
    `${API_CONFIG.AIAgentURL}/api/v1/prediction/${topicNodeLLMFlowId}`,
    {
      method: 'POST',
      headers: { 
        'AllowWindowsandMobileApps': 'allow',
        'Authorization': `Bearer ${user.JwtToken}`,
        'ClientApiURL': API_CONFIG.WebAPIURL,
        'ClientURL': API_CONFIG.LearnerURL, 
        'Locale': user.Language || 'en-us',
        'OrgUnitID': String(user.OrgUnitID), 
        'SiteID': String(user.SiteID),
        'UserID': String(user.UserID),
        'content-type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to get AI Tutor prediction');
  }

  return await response.json();
}

/**
 * Calls the GenerateAITopicNodes API after AI Tutor prediction.
 * @param params - The parameters for the API call.
 * @param params.json - The JSON array from the prediction response.
 * @param params.imageEnabled - Boolean flag for image generation.
 * @returns The API response as JSON.
 */
export async function generateAITopicNodesAPI({ json, imageEnabled }: { json: any; imageEnabled: boolean }) {
  const user = sessionUtils.getUserFromSession();
  if (!user) throw new Error('User not authenticated');

  const endpoint = `${API_CONFIG.AdminURL}LMEditorApi/api//ContentGenerator/GenerateAITopicNodes`;

  const headers = { 
    'allowwindowsandmobileapps': 'allow',
    'authorization': `Bearer ${user.JwtToken}`,
    'clientapiurl': API_CONFIG.WebAPIURL,
    'clienturl': API_CONFIG.LearnerURL,
    'content-type': 'application/json; charset=utf-8',
    'locale': user.Language || 'en-us',
    'orgunitid': String(user.OrgUnitID), 
    'siteid': String(user.SiteID), 
    'userid': String(user.UserID),
  };

  const body = {
    Json: json,
    imageEnabled: imageEnabled
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error('Failed to generate AI Topic Nodes');
  }

  return await response.json();
}

/**
 * Calls the image generation API for a given prompt, size, and style.
 * @param params - The parameters for the API call.
 * @param params.question - The image prompt/description.
 * @param params.size - The image size (e.g., '1024x1024').
 * @param params.style - The image style (e.g., 'Flat design').
 * @returns The API response as JSON.
 */
export async function generateAITopicNodeImageAPI({ question, size, style }: { question: string; size: string; style: string }) {
  const user = sessionUtils.getUserFromSession();
  if (!user) throw new Error('User not authenticated');
  // Use the fixed flowId from the cURL
  const imageGenerationFlowId = await getRolePlayAssistantFlowId(user.OrgUnitID, user.JwtToken, 'image_generation'); 
  const endpoint = `${API_CONFIG.AIAgentURL}/api/v1/prediction/${imageGenerationFlowId}`;
  const body = {
    question,
    overrideConfig: {
      vars: {
        clientUrl: API_CONFIG.LearnerURL,
        AllowWindowsandMobileApps: 'allow',
        siteId: String(user.SiteID),
        Locale: user.Language || 'en-us',
        userId: String(user.UserID),
        authorizationCode: `Bearer ${user.JwtToken}`,
        webAPIURL: API_CONFIG.WebAPIURL,
        Language: user.Language || 'en-us',
        categoryId: '0',
        emailId: user.EmailAddress || '',
        orgUnitId: String(user.OrgUnitID),
      },
      functionInputVariables: {
        size,
        style,
      },
    },
  };
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 
      'AllowWindowsandMobileApps': 'allow',
      'Authorization': `Bearer ${user.JwtToken}`,
      'ClientApiURL': API_CONFIG.WebAPIURL,
      'ClientURL': API_CONFIG.LearnerURL,
      'Locale': user.Language || 'en-us',
      'OrgUnitID': String(user.OrgUnitID), 
      'SiteID': String(user.SiteID),
      'UserID': String(user.UserID),
      'content-type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error('Failed to generate topic node image');
  }
  return await response.json();
}

export async function saveBase64ToFileAPI({
  base64String,
  extension = ".png",
  adminUrl = API_CONFIG.LearnerURL
}: {
  base64String: string;
  extension?: string;
  adminUrl?: string;
}) {
  const endpoint = `${API_CONFIG.AdminURL}LMEditorApi/api/NativeAuthoring/SaveBase64ToFile`;
  const body = {
    adminUrl,
    extension,
    base64String,
  };
  const resp = await fetch(endpoint, {
    method: "POST",
    headers: { 
      "content-type": "application/json; charset=utf-8", 
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) throw new Error("Failed to save base64 to file");
  return await resp.text();
}

export async function saveTopicListAPI({
  flowId,
  topicName,
  topicDescription,
  topicType = 'User',
  triggerPhrases,
  status = 1,
  nodes,
  edges,
  user
}: {
  flowId: string;
  topicName: string;
  topicDescription: string;
  topicType?: string;
  triggerPhrases: string;
  status?: number;
  nodes: string;
  edges?: string;
  user: any;
}) {
  const endpoint = `${API_CONFIG.AIAgentURL}/api/v1/topic-list`;
  const body = {
    flowId,
    topicName,
    topicDescription,
    topicType,
    triggerPhrases,
    status,
    nodes,
    edges
  };
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: { 
      'AllowWindowsandMobileApps': 'allow',
      'Authorization': `Bearer ${user.JwtToken}`,
      'ClientApiURL': API_CONFIG.WebAPIURL,
      'ClientURL': API_CONFIG.LearnerURL,
      'Locale': user.Language || 'en-us',
      'OrgUnitID': String(user.OrgUnitID),
      'SiteID': String(user.SiteID),
      'UserID': String(user.UserID),
      'content-type': 'application/json; charset=utf-8',
      'isFromNativeApp': 'true',
      'x-request-from': 'internal',
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) throw new Error('Failed to save topic list');
  return resp.json();
}

export async function getCourseBotDetailsAPI(courseBotId: string) {
  const user = sessionUtils.getUserFromSession();
  if (!user) throw new Error('User not authenticated');
  
  const endpoint = `${API_CONFIG.WebAPIURL}Bot/GetCourseBotDetails?CourseBotID=${courseBotId}`;
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: { 
      'allowwindowsandmobileapps': 'allow',
      'clienturl': API_CONFIG.LearnerURL,
      'content-type': 'application/json',
      'locale': user.Language || 'en-us',
      'origin': API_CONFIG.LearnerURL,
      'referer': API_CONFIG.LearnerURL,
      'siteid': String(user.SiteID),
      'userid': String(user.UserID),
    },
  });
  
  if (!response.ok) throw new Error('Failed to fetch course bot details');
  return response.json();
}

export async function generateThumbnailWithAI({
  content,
  style,
  aspect_ratio = '',
  image_type = '',
  title = '',
  output_file_path = '',
  isLearningModule = '0',
}: {
  content: string;
  style: string;
  aspect_ratio?: string;
  image_type?: string;
  title?: string;
  output_file_path?: string;
  isLearningModule?: string;
}) {
  const user = sessionUtils.getUserFromSession();
  if (!user) throw new Error('User not authenticated');
  const endpoint = `${API_CONFIG.AdminURL}LMEditorApi/api//NativeAuthoring/ThumbnailGenerate`;
  const body = {
    content,
    aspect_ratio,
    image_type,
    title,
    output_file_path,
    client_url: API_CONFIG.LearnerURL,
    style,
    requestedBy: user.UserID,
    userId: user.UserID,
    siteId: user.SiteID,
    isLearningModule,
  };
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: { 
      'allowwindowsandmobileapps': 'allow',
      'authorization': `Bearer ${user.JwtToken}`,
      'clientapiurl': API_CONFIG.WebAPIURL,
      'clienturl': API_CONFIG.LearnerURL,
      'content-type': 'application/json; charset=utf-8',
      'locale': user.Language || 'en-us',
      'orgunitid': String(user.OrgUnitID),
      'origin': API_CONFIG.LearnerURL,
      'referer': API_CONFIG.LearnerURL,
      'siteid': String(user.SiteID),
      'userid': String(user.UserID),
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) throw new Error('Failed to generate thumbnail with AI');
  return await resp.json();
} 
export async function SaveContentJSONData({
  contentId,
  folderPath,
  contentData,
  objectTypeId,
  userID,
  fileData
}: {
  contentId: string;
  folderPath: string;
  contentData: string;
  objectTypeId: number;
  userID: number;
  fileData: string;
}) {
  const user = sessionUtils.getUserFromSession();
  if (!user) throw new Error('User not authenticated');

  const endpoint = `${API_CONFIG.AdminURL}LMEditorApi/api/CreateContent/SaveContentJSON`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 
      'content-type': 'application/json; charset=utf-8', 
      siteid: user.SiteID?.toString() || '',
      // user-agent is set by browser
    },
    body: JSON.stringify({
      contentId,
      folderPath,
      contentData,
      objectTypeId,
      userID,
      fileData
    })
  });
  if (!response.ok) throw new Error('Failed to share knowledge');
  return response.json();
}

export async function saveBackgroundImageData({
  FolderID,
  UserID,
  SiteID,
  CMSGroupID,
  ImageStream,
  ImageName
}: {
  FolderID: number | string,
  UserID: number | string,
  SiteID: number | string,
  CMSGroupID: number | string,
  ImageStream: string,
  ImageName: string
}) {
  const endpoint = `${API_CONFIG.AdminURL}LMEditorApi/api/CreateContent/SaveImageData/`;
  const body = {
    FolderID,
    UserID,
    SiteID,
    CMSGroupID,
    ImageStream,
    ImageName
  };
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error('Failed to save image');
  return response.json();
}