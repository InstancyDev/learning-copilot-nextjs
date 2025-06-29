// Complete Authentication Flow Example
// This demonstrates the full authentication process converted from Angular to Next.js

import { ApiService } from '@/services/api.service';
import { useAuth } from '@/components/providers/AuthProvider';
import { API_CONFIG } from '@/config/api.config';

// Example 1: Complete authentication flow with detailed logging
export const completeAuthenticationFlow = async (authKey: string) => {
  try {
    console.log('=== Starting Complete Authentication Flow ===');
    
    // Step 1: Authenticate with site metadata (includes user verification and login)
    const { user, siteDetails, siteKeyParams } = await ApiService.auth.authenticateWithSiteMetadata(authKey);
    
    console.log('✅ Authentication completed successfully!');
    console.log('👤 User:', user);
    console.log('🏢 Site Details:', siteDetails);
    console.log('🔑 Site Key Parameters:', siteKeyParams);
    
    return { user, siteDetails, siteKeyParams };
  } catch (error) {
    console.error('❌ Authentication failed:', error);
    throw error;
  }
};

// Example 2: Step-by-step authentication for debugging
export const stepByStepAuthentication = async (authKey: string) => {
  try {
    console.log('=== Step-by-Step Authentication Debug ===');
    
    // Step 1: Get site metadata
    console.log('Step 1: Getting site metadata...');
    const dataObj = {
      intUserID: -1,
      intFromSIteID: -1,
      strAuthKey: authKey,
    };
    
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
    
    console.log('Site metadata response:', siteMetadataResponse);
    
    if (!siteMetadataResponse.Table || siteMetadataResponse.Table.length === 0) {
      throw new Error('No site details found');
    }
    
    // Step 2: Parse site parameters
    console.log('Step 2: Parsing site parameters...');
    let siteKeyParams: any = {};
    
    if (siteMetadataResponse.Table[0].OtherParams) {
      siteKeyParams = ApiService.parseSiteParams(siteMetadataResponse.Table[0].OtherParams);
      console.log('Parsed site parameters:', siteKeyParams);
    }
    
    // Step 3: Check admin user and clear sessions if needed
    console.log('Step 3: Checking admin user...');
    if (
      siteKeyParams.adminUserId &&
      siteKeyParams.adminUserId.length > 0 &&
      Number(siteKeyParams.adminUserId) !== 0 &&
      Number(siteKeyParams.adminUserId) !== -1
    ) {
      console.log('Admin user detected, clearing sessions...');
      await ApiService.clearAllSessions();
    }
    
    // Step 4: Get user personal details
    console.log('Step 4: Getting user personal details...');
    
    // Build query parameters for GET request
    const userQueryParams = new URLSearchParams({
      intUserID: siteMetadataResponse.Table[0].UserID,
      intSiteID: siteMetadataResponse.Table[0].FromSiteID,
      intSubSiteID: siteMetadataResponse.Table[0].FromSiteID,
    } as any).toString();
    
    const userDetails = await ApiService.fetch(
      `${API_CONFIG.WebAPIURL}User/isVerifyExistingUser?${userQueryParams}`,
      {
        method: 'GET',
        headers: { 
          'AllowWindowsandMobileApps': 'allow',
          'ClientURL': `${API_CONFIG.LearnerURL}`,
        },
        // No body for GET requests
      }
    );
    
    console.log('User details response:', userDetails);
    
    // Step 5: Login user
    console.log('Step 5: Logging in user...');
    const userContext = await ApiService.loginUserWithDetails(userDetails);
    
    if (userContext) {
      console.log('✅ User login successful!');
      console.log('User context:', userContext);
      return { user: userContext, siteDetails: siteMetadataResponse, siteKeyParams };
    } else {
      throw new Error('User login failed');
    }
    
  } catch (error) {
    console.error('❌ Step-by-step authentication failed:', error);
    throw error;
  }
};

// Example 3: Authentication with error handling and retry logic
export const robustAuthentication = async (authKey: string, maxRetries: number = 3) => {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Authentication attempt ${attempt}/${maxRetries}...`);
      
      const result = await ApiService.auth.authenticateWithSiteMetadata(authKey);
      
      console.log(`✅ Authentication successful on attempt ${attempt}!`);
      return result;
      
    } catch (error) {
      lastError = error as Error;
      console.error(`❌ Authentication attempt ${attempt} failed:`, error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('membership is expired')) {
          throw new Error('Your membership has expired. Please contact your administrator.');
        } else if (error.message.includes('account is locked')) {
          throw new Error('Your account is locked. Please contact support.');
        } else if (error.message.includes('account has been deactivated')) {
          throw new Error('Your account has been deactivated.');
        }
      }
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`Authentication failed after ${maxRetries} attempts. Last error: ${lastError?.message}`);
};

// Example 4: Authentication with custom session management
export const authenticationWithCustomSession = async (authKey: string) => {
  try {
    console.log('=== Authentication with Custom Session Management ===');
    
    // Perform authentication
    const { user, siteDetails, siteKeyParams } = await ApiService.auth.authenticateWithSiteMetadata(authKey);
    
    // Custom session storage
    if (typeof window !== 'undefined') {
      // Store additional session data
      sessionStorage.setItem('authenticationTimestamp', new Date().toISOString());
      sessionStorage.setItem('authKey', authKey);
      sessionStorage.setItem('siteDetails', JSON.stringify(siteDetails));
      sessionStorage.setItem('siteKeyParams', JSON.stringify(siteKeyParams));
      
      // Store user-specific data
      sessionStorage.setItem('userID', user.UserID.toString());
      sessionStorage.setItem('userEmail', user.EmailAddress);
      sessionStorage.setItem('userRole', user.UserRoles[0]?.Name || 'Learner');
      
      console.log('✅ Custom session data stored');
    }
    
    return { user, siteDetails, siteKeyParams };
    
  } catch (error) {
    console.error('❌ Authentication with custom session failed:', error);
    throw error;
  }
};

// Example 5: Authentication status monitoring hook
export const useAuthenticationStatus = () => {
  const { user, loading, error } = useAuth();
  
  const getAuthenticationInfo = () => {
    if (typeof window === 'undefined') return null;
    
    return {
      timestamp: sessionStorage.getItem('authenticationTimestamp'),
      authKey: sessionStorage.getItem('authKey'),
      siteDetails: sessionStorage.getItem('siteDetails'),
      siteKeyParams: sessionStorage.getItem('siteKeyParams'),
      userDetails: sessionStorage.getItem('dsuserPersonlDetails'),
    };
  };
  
  const clearAuthenticationData = () => {
    if (typeof window === 'undefined') return;
    
    const itemsToClear = [
      'authenticationTimestamp',
      'authKey',
      'siteDetails',
      'siteKeyParams',
      'userDetails',
      'dsuserPersonlDetails',
      'siteParams'
    ];
    
    itemsToClear.forEach(item => {
      sessionStorage.removeItem(item);
    });
    
    console.log('🧹 Authentication data cleared');
  };
  
  return {
    user,
    loading,
    error,
    authenticationInfo: getAuthenticationInfo(),
    clearAuthenticationData
  };
};

// Example 6: Authentication with role-based access control
export const authenticationWithRBAC = async (authKey: string, requiredRoles?: string[]) => {
  try {
    console.log('=== Authentication with Role-Based Access Control ===');
    
    const { user, siteDetails, siteKeyParams } = await ApiService.auth.authenticateWithSiteMetadata(authKey);
    
    // Check if user has required roles
    if (requiredRoles && requiredRoles.length > 0) {
      const userRoles = user.UserRoles.map(role => role.Name);
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
      
      if (!hasRequiredRole) {
        throw new Error(`Access denied. Required roles: ${requiredRoles.join(', ')}. User roles: ${userRoles.join(', ')}`);
      }
      
      console.log(`✅ User has required roles: ${requiredRoles.join(', ')}`);
    }
    
    return { user, siteDetails, siteKeyParams };
    
  } catch (error) {
    console.error('❌ Authentication with RBAC failed:', error);
    throw error;
  }
};

// Example 7: Authentication with site-specific validation
export const authenticationWithSiteValidation = async (authKey: string) => {
  try {
    console.log('=== Authentication with Site-Specific Validation ===');
    
    const { user, siteDetails, siteKeyParams } = await ApiService.auth.authenticateWithSiteMetadata(authKey);
    
    // Validate site access
    if (siteDetails.Table && siteDetails.Table.length > 0) {
      const siteData = siteDetails.Table[0];
      
      // Check if user has access to this specific site
      if (siteData.SiteID && user.SiteID !== siteData.SiteID) {
        throw new Error(`User does not have access to site ID: ${siteData.SiteID}`);
      }
      
      // Check site-specific parameters
      if (siteKeyParams.requireApproval === 'true' && user.ExternalUser === 1) {
        console.log('⚠️ External user requires approval');
      }
      
      console.log(`✅ Site validation passed for site ID: ${siteData.SiteID}`);
    }
    
    return { user, siteDetails, siteKeyParams };
    
  } catch (error) {
    console.error('❌ Authentication with site validation failed:', error);
    throw error;
  }
};

// Example 8: Authentication with performance monitoring
export const authenticationWithPerformanceMonitoring = async (authKey: string) => {
  const startTime = performance.now();
  
  try {
    console.log('=== Authentication with Performance Monitoring ===');
    
    const result = await ApiService.auth.authenticateWithSiteMetadata(authKey);
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`⏱️ Authentication completed in ${duration.toFixed(2)}ms`);
    
    // Log performance metrics
    if (typeof window !== 'undefined') {
      const metrics = {
        timestamp: new Date().toISOString(),
        duration: duration,
        authKey: authKey,
        success: true
      };
      
      sessionStorage.setItem('authPerformanceMetrics', JSON.stringify(metrics));
    }
    
    return result;
    
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.error(`❌ Authentication failed after ${duration.toFixed(2)}ms:`, error);
    
    // Log error metrics
    if (typeof window !== 'undefined') {
      const metrics = {
        timestamp: new Date().toISOString(),
        duration: duration,
        authKey: authKey,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      sessionStorage.setItem('authPerformanceMetrics', JSON.stringify(metrics));
    }
    
    throw error;
  }
}; 