import { NextRequest, NextResponse } from 'next/server';
import type { UserContext } from '@/types';
import { API_CONFIG } from '@/config/api.config';

// Interface for the data object sent to the API
interface AuthDataObj {
  intUserID: number;
  intFromSIteID: number;
  strAuthKey: string;
}

// Interface for site details response
interface SiteDetails {
  Table: Array<{
    OtherParams: string;
    // Add other properties as needed based on your API response
  }>;
}

// Interface for site key parameters
interface SiteKeyParams {
  adminUserId?: string;
  [key: string]: string | undefined;
}

export async function POST(request: NextRequest) {
  try {
    const { authKey } = await request.json();

    if (!authKey) {
      return NextResponse.json(
        { success: false, message: 'AuthKey is required' },
        { status: 400 }
      );
    }

    // Clean the authKey to remove any quotes that might have been added
    const cleanAuthKey = authKey.replace(/^["']|["']$/g, '');

    // Step 1: Prepare data object for GetSubSiteMetaDataBasedOnAuthKey
    const dataObj: AuthDataObj = {
      intUserID: -1,
      intFromSIteID: -1,
      strAuthKey: cleanAuthKey,
    };

    // Step 2: Call GetSubSiteMetaDataBasedOnAuthKey API
    const siteMetadataResponse = await fetch(`${API_CONFIG.WebAPIURL}GetSubSiteMetaDataBasedOnAuthKey`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(dataObj as any).toString(),
    });

    if (!siteMetadataResponse.ok) {
      throw new Error(`Site metadata API failed: ${siteMetadataResponse.status}`);
    }

    const siteDetails: SiteDetails = await siteMetadataResponse.json();

    // Step 3: Process site parameters if they exist
    let siteKeyParams: SiteKeyParams = {};
    
    if (siteDetails.Table && siteDetails.Table.length > 0 && siteDetails.Table[0].OtherParams) {
      siteKeyParams = parseSiteParams(siteDetails.Table[0].OtherParams);
    }

    // Step 4: Handle admin user session cleanup
    if (
      siteKeyParams.adminUserId &&
      siteKeyParams.adminUserId.length > 0 &&
      Number(siteKeyParams.adminUserId) !== 0 &&
      Number(siteKeyParams.adminUserId) !== -1
    ) {
      // Clear all session items and cookies
      await clearAllSessions();
    }

    // Step 5: Verify existing user if site details exist
    if (siteDetails.Table && siteDetails.Table.length > 0) {
      const user = await verifyExistingUser(siteDetails.Table[0], cleanAuthKey);
      
      if (user) {
        return NextResponse.json({
          success: true,
          user: user,
          message: 'Authentication successful',
          siteDetails: siteDetails,
          siteKeyParams: siteKeyParams // Include site parameters in response
        });
      } else {
        return NextResponse.json(
          { success: false, message: 'User verification failed' },
          { status: 401 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, message: 'No site details found for the provided auth key' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to parse site parameters
function parseSiteParams(otherParams: string): SiteKeyParams {
  const params: SiteKeyParams = {};
  
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
}

// Helper function to clear all sessions and cookies
async function clearAllSessions(): Promise<void> {
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
}

// Helper function to verify existing user
async function verifyExistingUser(siteTable: any, authKey: string): Promise<UserContext | null> {
  try {
    // Call your user verification API
    const verifyResponse = await fetch(`${API_CONFIG.WebAPIURL}VerifyExistingUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        siteData: siteTable,
        authKey: authKey,
      }),
    });

    if (!verifyResponse.ok) {
      throw new Error(`User verification failed: ${verifyResponse.status}`);
    }

    const userData = await verifyResponse.json();
    
    if (userData.success && userData.user) {
      // Transform the response to match UserContext interface
      const user: UserContext = {
        UserID: userData.user.UserID || 1,
        OrgUnitID: userData.user.OrgUnitID || 1,
        UserPrivileges: userData.user.UserPrivileges || [],
        UserRoles: userData.user.UserRoles || [{ RoleID: 1, Name: 'Learner' }],
        UserCMSGroups: userData.user.UserCMSGroups || [],
        EmailAddress: userData.user.EmailAddress || 'user@example.com',
        JwtToken: userData.user.JwtToken || 'mock-jwt-token',
        FirstName: userData.user.FirstName || 'John',
        LastName: userData.user.LastName || 'Doe',
        IsClarizenUser: userData.user.IsClarizenUser || '0',
        UserDisplayName: userData.user.UserDisplayName || 'John Doe',
        AccountType: userData.user.AccountType || 1,
        SiteID: userData.user.SiteID || 1,
        CMSGroupID: userData.user.CMSGroupID || 1,
        SessionID: userData.user.SessionID || 'mock-session-id',
        SendMessage: userData.user.SendMessage || 1,
        ExternalUser: userData.user.ExternalUser || 0,
        Membership: userData.user.Membership || 1,
        Picture: userData.user.Picture || '',
        Language: userData.user.Language || 'en',
        Country: userData.user.Country || 'US',
        NotifiyMessage: userData.user.NotifiyMessage || '',
        AutoLaunchContent: userData.user.AutoLaunchContent || '0',
        UserTimeZone: userData.user.UserTimeZone || 'UTC',
        IsGroupExpired: userData.user.IsGroupExpired || 0,
        UserLockedtime: userData.user.UserLockedtime || 0,
        UserLogin: userData.user.UserLogin || 'johndoe',
        IsSysAdminUser: userData.user.IsSysAdminUser || false
      };
      
      return user;
    }
    
    return null;
  } catch (error) {
    console.error('Error verifying existing user:', error);
    return null;
  }
} 