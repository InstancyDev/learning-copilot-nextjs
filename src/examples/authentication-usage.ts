// Examples of using the new authentication method that matches the converted Angular logic
// This file demonstrates the complete authentication flow with site metadata

import { ApiService } from '@/services/api.service';
import { useAuth } from '@/components/providers/AuthProvider';
import { API_CONFIG } from '@/config/api.config';

// Example 1: Using the new authentication method directly
export const authenticateWithSiteMetadata = async (authKey: string) => {
  try {
    console.log('Starting authentication with site metadata...');
    
    // This method replicates the Angular ProcessLogin function
    const { user, siteDetails } = await ApiService.auth.authenticateWithSiteMetadata(authKey);
    
    console.log('Authentication successful!');
    console.log('User:', user);
    console.log('Site Details:', siteDetails);
    
    return { user, siteDetails };
  } catch (error) {
    console.error('Authentication failed:', error);
    throw error;
  }
};

// Example 2: Complete authentication flow in a component
export const useAuthenticationFlow = () => {
  const { user, login, logout, loading, error } = useAuth();
  
  const authenticateUser = async (authKey: string) => {
    try {
      // This will automatically handle:
      // 1. GetSubSiteMetaDataBasedOnAuthKey call
      // 2. Site parameter parsing
      // 3. Admin user session cleanup
      // 4. User verification
      // 5. Session storage
      const { user: authenticatedUser, siteDetails } = await ApiService.auth.authenticateWithSiteMetadata(authKey);
      
      // The AuthProvider will automatically handle the login
      login(authenticatedUser);
      
      return { user: authenticatedUser, siteDetails };
    } catch (error) {
      console.error('Authentication flow failed:', error);
      throw error;
    }
  };
  
  return {
    user,
    authenticateUser,
    logout,
    loading,
    error
  };
};

// Example 3: Manual step-by-step authentication (for debugging)
export const manualAuthenticationSteps = async (authKey: string) => {
  try {
    // Clean the authKey to remove any quotes that might have been added
    const cleanAuthKey = authKey.replace(/^["']|["']$/g, '');
    
    console.log('Step 1: Preparing data object...');
    const dataObj = {
      intUserID: -1,
      intFromSIteID: -1,
      strAuthKey: cleanAuthKey,
    };
    
    console.log('Step 2: Calling GetSubSiteMetaDataBasedOnAuthKey...');
    const siteMetadataResponse = await ApiService.fetch(
      `${API_CONFIG.WebAPIURL}GetSubSiteMetaDataBasedOnAuthKey`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(dataObj as any).toString(),
      }
    );
    
    console.log('Site metadata response:', siteMetadataResponse);
    
    if (!siteMetadataResponse.Table || siteMetadataResponse.Table.length === 0) {
      throw new Error('No site details found for the provided auth key');
    }
    
    console.log('Step 3: Parsing site parameters...');
    let siteKeyParams: any = {};
    
    if (siteMetadataResponse.Table[0].OtherParams) {
      siteKeyParams = ApiService.parseSiteParams(siteMetadataResponse.Table[0].OtherParams);
      console.log('Site key parameters:', siteKeyParams);
    }
    
    console.log('Step 4: Checking admin user session cleanup...');
    if (
      siteKeyParams.adminUserId &&
      siteKeyParams.adminUserId.length > 0 &&
      Number(siteKeyParams.adminUserId) !== 0 &&
      Number(siteKeyParams.adminUserId) !== -1
    ) {
      console.log('Admin user detected, clearing sessions...');
      await ApiService.clearAllSessions();
    }
    
    console.log('Step 5: Verifying existing user...');
    const user = await ApiService.verifyExistingUser(siteMetadataResponse.Table[0], cleanAuthKey);
    
    if (!user) {
      throw new Error('User verification failed');
    }
    
    console.log('Authentication completed successfully!');
    return { user, siteDetails: siteMetadataResponse };
    
  } catch (error) {
    console.error('Manual authentication failed:', error);
    throw error;
  }
}; 