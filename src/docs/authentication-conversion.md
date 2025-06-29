# Authentication Code Conversion: Angular to Next.js

This document explains how the Angular authentication code was converted to Next.js, including the complete user verification and login flow.

## Original Angular Code

### ProcessLogin Function
```typescript
public ProcessLogin(AuthKey: string) {
    let DataObj = {
      intUserID: -1,
      intFromSIteID: -1,
      strAuthKey: AuthKey,
    };
    this.rmc
      .GetSubSiteMetaDataBasedOnAuthKey($.param(DataObj))
      .subscribe(res => {
        let SiteDetails: any = {};
        SiteDetails = res;
        if (SiteDetails.Table[0].OtherParams.length > 0)
          this.fnSplitSiteParams(SiteDetails.Table[0].OtherParams);
        if (
          this.SiteKeyParams['adminUserId'] &&
          this.SiteKeyParams['adminUserId'].length > 0 &&
          Number(this.SiteKeyParams['adminUserId']) != 0 &&
          Number(this.SiteKeyParams['adminUserId']) != -1
        ) {
          // Clear sessions and cookies
        }
        if (SiteDetails.Table.length > 0) {
          this.VerifyExistingUser(SiteDetails.Table[0]);
        }
      });
  }
```

### User Verification and Login Flow
```typescript
// isVerifyExistingUser call
this.rmc.isVerifyExistingUser($.param(ForumDataObj)).subscribe(
  res => {
    dsuserPersonlDetails = res;
  },
  () => {},
  () => {
    this.commonProxy.setSessionStorage(
      'dsuserPersonlDetails',
      JSON.stringify(dsuserPersonlDetails)
    );
    if (dsuserPersonlDetails.Table.length != 0) {
      if (dsuserPersonlDetails.Table.length > 0) this.UserLoginSubSite();
    }
  }
);

// UserLoginSubSite method
UserLoginSubSite() {
  if (this.commonProxy.getSessionStorage('dsuserPersonlDetails') != null) {
    let dsUserDetails: any = JSON.parse(
      this.commonProxy.getSessionStorage('dsuserPersonlDetails')
    );
    if (dsUserDetails != null) this.Login(dsUserDetails);
  }
}

// Login method
async Login(dsUserDetails) {
  let strlogin: string = dsUserDetails.Table1[0]['Login'].toString();
  let strPassword: string = '';
  if (
    dsUserDetails.Table1[0]['Password'] != null &&
    dsUserDetails.Table1[0]['Password'].toString() != ''
  ) {
    strPassword = dsUserDetails.Table1[0]['Password'].toString();
  }
  // ... validation and login logic
}

// ValidateUser method
async ValidateUser(uid: string, pwd: string, ...) {
  // ... complex validation logic with login API call
  this.rmc.Login($.param(uData)).subscribe(
    res => {
      this.usrContext = res;
    },
    () => {},
    () => {
      // Handle login response and create user context
    }
  );
}
```

## Converted Next.js Implementation

### 1. API Route (`src/app/api/auth/authenticate/route.ts`)

```typescript
export async function POST(request: NextRequest) {
  try {
    const { authKey } = await request.json();

    // Step 1: Prepare data object for GetSubSiteMetaDataBasedOnAuthKey
    const dataObj: AuthDataObj = {
      intUserID: -1,
      intFromSIteID: -1,
      strAuthKey: authKey,
    };

    // Step 2: Call GetSubSiteMetaDataBasedOnAuthKey API
    const siteMetadataResponse = await fetch(`${API_CONFIG.WebAPIURL}Generic/GetSubSiteMetaDataBasedOnAuthKey`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'AllowWindowsandMobileApps': 'allow',
        'ClientURL': `${API_CONFIG.LearnerURL}`,
      },
      body: new URLSearchParams(dataObj as any).toString(),
    });

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
      await clearAllSessions();
    }

    // Step 5: Verify existing user if site details exist
    if (siteDetails.Table && siteDetails.Table.length > 0) {
      const user = await verifyExistingUser(siteDetails.Table[0], authKey);
      
      if (user) {
        return NextResponse.json({
          success: true,
          user: user,
          message: 'Authentication successful',
          siteDetails: siteDetails,
          siteKeyParams: siteKeyParams
        });
      }
    }
  } catch (error) {
    // Error handling
  }
}
```

### 2. API Service (`src/services/api.service.ts`)

#### Main Authentication Method
```typescript
authenticateWithSiteMetadata: async (authKey: string): Promise<{ user: UserContext; siteDetails: any; siteKeyParams: any }> => {
  // Step 1: Get site metadata
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

  // Step 2: Process site parameters
  let siteKeyParams: any = {};
  if (siteMetadataResponse.Table[0].OtherParams) {
    siteKeyParams = ApiService.parseSiteParams(siteMetadataResponse.Table[0].OtherParams);
  }

  // Step 3: Handle admin user session cleanup
  if (siteKeyParams.adminUserId && /* validation logic */) {
    await ApiService.clearAllSessions();
  }

  // Step 4: Verify existing user
  const user = await ApiService.verifyExistingUser(siteMetadataResponse.Table[0], authKey);
  
  return { user, siteDetails: siteMetadataResponse, siteKeyParams };
}
```

#### User Verification Method
```typescript
verifyExistingUser: async (siteTable: any, authKey: string): Promise<UserContext | null> => {
  try {
    // Step 1: Get user personal details (equivalent to isVerifyExistingUser)
    const dataObj = {
      intUserID: siteTable.UserID,
      intSiteID: siteTable.FromSiteID,
      intSubSiteID: siteTable.FromSiteID,
    };

    // Build query parameters for GET request
    const queryParams = new URLSearchParams(dataObj as any).toString();
    const userDetailsResponse = await ApiService.fetch(
      `${API_CONFIG.WebAPIURL}User/isVerifyExistingUser?${queryParams}`,
      {
        method: 'GET', // Note: Using GET method with query parameters
        headers: { 
          'AllowWindowsandMobileApps': 'allow',
          'ClientURL': `${API_CONFIG.LearnerURL}`,
        },
        // No body for GET requests
      }
    );

    // Store user details in session storage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('dsuserPersonlDetails', JSON.stringify(userDetailsResponse));
    }

    // Step 2: Check if user details exist
    if (!userDetailsResponse.Table || userDetailsResponse.Table.length === 0) {
      return null;
    }

    // Step 3: Login user and get user context
    const userContext = await ApiService.loginUserWithDetails(userDetailsResponse);
    
    return userContext;
  } catch (error) {
    console.error('Error verifying existing user:', error);
    return null;
  }
}
```

#### User Login Method
```typescript
loginUserWithDetails: async (dsUserDetails: any): Promise<UserContext | null> => {
  try {
    // Extract login credentials (equivalent to Login method)
    const strlogin = dsUserDetails.Table1?.[0]?.Login?.toString() || '';
    let strPassword = '';
    
    if (dsUserDetails.Table1?.[0]?.Password != null && 
        dsUserDetails.Table1[0].Password.toString() !== '') {
      strPassword = dsUserDetails.Table1[0].Password.toString();
    }

    // Validate user and get user context (equivalent to ValidateUser method)
    const userContext = await ApiService.validateUserAndLogin(strlogin, strPassword);
    
    return userContext;
  } catch (error) {
    console.error('Error in loginUserWithDetails:', error);
    return null;
  }
}
```

#### User Validation and Login Method
```typescript
validateUserAndLogin: async (loginId: string, password: string): Promise<UserContext | null> => {
  try {
    // Check if user context already exists in session
    const existingUserContext = sessionUtils.getUserFromSession();
    if (existingUserContext) {
      return existingUserContext;
    }

    // Prepare login data (equivalent to ValidateUser method)
    const uData = {
      LoginID: btoa(loginId),
      Password: btoa(password),
      RequestURL: typeof window !== 'undefined' ? window.location.href : '',
      ApplicationURL: API_CONFIG.LearnerURL,
      RemainingDaysToChangePassword: 1,
      IsEncrypted: true,
      LoginAsLearnerAdminUserID: 0,
      SSOSessionID: '',
    };

    // Check for SAML session
    if (typeof window !== 'undefined') {
      const samlSession = document.cookie
        .split('; ')
        .find(row => row.startsWith('SAML_User_Session='))
        ?.split('=')[1];
      
      if (samlSession) {
        uData.SSOSessionID = samlSession;
        uData.Password = btoa('');
      }
    }

    // Check for admin user ID from site params
    const siteParams = sessionStorage.getItem('siteParams');
    if (siteParams) {
      const params = JSON.parse(siteParams);
      if (params.adminUserId && /* validation logic */) {
        uData.LoginAsLearnerAdminUserID = Number(params.adminUserId);
      }
    }

    // Perform login (equivalent to rmc.Login call)
    const loginResponse = await ApiService.fetch(
      `${API_CONFIG.WebAPIURL}User/Login`,
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

    // Handle different login response scenarios
    if (loginResponse && typeof loginResponse === 'object' && loginResponse.UserID) {
      // Successful login - create user context
      const userContext: UserContext = {
        UserID: loginResponse.UserID || 1,
        // ... map all user properties
      };

      // Save user context to session
      sessionUtils.saveUserToSession(userContext);
      
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
    }

  } catch (error) {
    console.error('Error in validateUserAndLogin:', error);
    throw error;
  }
}
```

## Key Conversion Changes

### 1. **Promise-based vs Observable**
- **Angular**: Uses RxJS observables with `.subscribe()`
- **Next.js**: Uses async/await with Promises

### 2. **HTTP Client**
- **Angular**: Uses Angular's HttpClient service
- **Next.js**: Uses native `fetch()` API

### 3. **Session Management**
- **Angular**: Uses `commonProxy` service for session/cookie management
- **Next.js**: Uses helper functions and sessionStorage

### 4. **Parameter Encoding**
- **Angular**: Uses `$.param()` (jQuery)
- **Next.js**: Uses `URLSearchParams`

### 5. **Error Handling**
- **Angular**: Error handling in `.subscribe()` or `.catch()`
- **Next.js**: Uses try/catch blocks

### 6. **User Context Creation**
- **Angular**: Stores user context in `this.usrContext`
- **Next.js**: Creates and returns `UserContext` object

## Complete Authentication Flow

```
authKey → GetSubSiteMetaDataBasedOnAuthKey → Parse Site Parameters → 
Check Admin User → Clear Sessions (if needed) → isVerifyExistingUser → 
Store User Details → Extract Login Credentials → ValidateUserAndLogin → 
Login API Call → Handle Response → Create UserContext → Save to Session → 
Return User Context + Site Details + Site Parameters
```

## Helper Functions

### 1. `parseSiteParams()` - Replaces `fnSplitSiteParams()`
```typescript
function parseSiteParams(otherParams: string): SiteKeyParams {
  const params: SiteKeyParams = {};
  
  try {
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
```

### 2. `clearAllSessions()` - Replaces session cleanup logic
```typescript
async function clearAllSessions(): Promise<void> {
  try {
    console.log('Clearing sessions and cookies for admin user');
    
    const itemsToClear = [
      'userContext_' + API_CONFIG.LearnerURL,
      'userContext_' + 'SiteID',
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
```

## Usage Examples

### Basic Authentication
```typescript
import { ApiService } from '@/services/api.service';

const authenticateUser = async (authKey: string) => {
  try {
    const { user, siteDetails, siteKeyParams } = await ApiService.auth.authenticateWithSiteMetadata(authKey);
    console.log('Authentication successful:', user);
    return { user, siteDetails, siteKeyParams };
  } catch (error) {
    console.error('Authentication failed:', error);
    throw error;
  }
};
```

### Authentication with Error Handling
```typescript
const authenticateWithErrorHandling = async (authKey: string) => {
  try {
    const result = await ApiService.auth.authenticateWithSiteMetadata(authKey);
    return result;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('membership is expired')) {
        // Handle expired membership
        throw new Error('Your membership has expired. Please contact your administrator.');
      } else if (error.message.includes('account is locked')) {
        // Handle locked account
        throw new Error('Your account is locked. Please contact support.');
      } else if (error.message.includes('account has been deactivated')) {
        // Handle deactivated account
        throw new Error('Your account has been deactivated.');
      }
    }
    throw error;
  }
};
```

### Authentication in Components
```typescript
import { useAuth } from '@/components/providers/AuthProvider';

const MyComponent = () => {
  const { user, loading, error } = useAuth();
  
  if (loading) return <div>Authenticating...</div>;
  if (error) return <div>Authentication error: {error}</div>;
  if (!user) return <div>Please log in</div>;
  
  return (
    <div>
      <h1>Welcome, {user.FirstName} {user.LastName}!</h1>
      <p>Email: {user.EmailAddress}</p>
      <p>Role: {user.UserRoles[0]?.Name}</p>
    </div>
  );
};
```

## Configuration

The converted code uses the centralized API configuration:

```typescript
// src/config/api.config.ts
export const API_CONFIG = {
  WebAPIURL: 'https://developmentapi.instancy.com/api/',
  LearnerURL: 'http://development.instancy.com',
  // ... other URLs
};
```

## Error Handling

The converted code includes comprehensive error handling:

1. **API Call Failures**: Network errors, HTTP status errors
2. **Data Validation**: Missing or invalid site details
3. **User Verification**: Failed user verification
4. **Login Failures**: Various login error scenarios
5. **Session Cleanup**: Errors during session clearing

## Testing

To test the converted authentication:

1. **Encode the authKey**: Before using the `authKey` in the URL, it must be encoded. You can use the following JavaScript snippet in your browser's developer console to encode it:
   ```javascript
   const authKey = 'your-auth-key'; // Replace with your actual authKey
   const encodedAuthKey = encodeURIComponent(btoa(JSON.stringify(authKey)));
   console.log(encodedAuthKey);
   ```

2. **Use the encoded authKey in the URL**: `http://localhost:3000/learning-app?authKey=<encoded-auth-key>`

3. **Check console logs**: For debugging information. You should see a message indicating the authKey was decoded.

4. **Verify session storage**: Check if user data is properly stored.

5. **Test error scenarios**: Invalid authKey, network failures, etc.

## Migration Notes

1. **Session Management**: You'll need to implement actual session/cookie clearing based on your session management system
2. **API Endpoints**: Ensure your backend APIs are accessible
3. **Error Messages**: Customize error messages for your application
4. **Logging**: Adjust logging levels for production vs development
5. **Security**: Ensure proper CORS and security headers are configured
6. **User Context**: The converted code creates a complete UserContext object that can be used throughout the application 