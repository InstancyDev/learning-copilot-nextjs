// Corrected SSOAuthService.ts - Eliminates "MCP server health check failed" error

import { API_CONFIG } from '@/config/api.config';
import type { UserContext } from '@/types';
import { mcpClientService } from '@/services/McpClientService';

interface SSOUserData {
  UserID: number;
  OrgUnitID: number;
  UserPrivileges: any[];
  UserRoles: Array<{
    RoleID: number;
    Name: string;
  }>;
  UserCMSGroups: Array<{
    CMSGroupID: number;
    Name: string;
    CMGroupID: number;
  }>;
  EmailAddress: string;
  JwtToken: string;
  FirstName: string;
  LastName: string;
  IsClarizenUser: string;
  UserDisplayName: string;
  AccountType: number;
  SiteID: number;
  CMSGroupID: number;
  SessionID: string;
  SendMessage: number;
  ExternalUser: number;
  Membership: number;
  Picture: string;
  Language: string;
  Country: string;
  NotifiyMessage: string;
  AutoLaunchContent: string;
  UserTimeZone: string;
  IsGroupExpired: number;
  UserLockedtime: number;
  UserLogin: string;
  IsSysAdminUser: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserContext | null;
  error: string | null;
  isLoading: boolean;
  mcpConnected: boolean;
  mcpInitializing: boolean;
}

export class SSOAuthService {
  private state: AuthState = {
    isAuthenticated: false,
    user: null,
    error: null,
    isLoading: false,
    mcpConnected: false,
    mcpInitializing: false
  };
  
  private listeners: Array<(state: AuthState) => void> = [];
  private storageKey: string;

  constructor() {
    this.storageKey = `userContext_${window.location.origin}`;
    this.initializeFromSessionStorage();
  }

  // FIXED: Initialize authentication state without throwing MCP errors
  private async initializeFromSessionStorage() {
    if (typeof window === 'undefined') return;

    try {
      const ssoData = sessionStorage.getItem(this.storageKey);
      
      if (ssoData) {
        const userData: SSOUserData = JSON.parse(ssoData);
        const userContext = this.transformSSODataToUserContext(userData);
        
        // Set authenticated state immediately
        this.setState({
          isAuthenticated: true,
          user: userContext,
          error: null,
          isLoading: false
        });
        
        console.log('✅ Restored SSO authentication from session storage');
        
        // FIXED: Initialize MCP in background without blocking SSO
        this.initializeMcpConnectionSafely(userContext);
        
        this.notifyListeners();
      } else {
        console.warn('No SSO session data found');
      }
    } catch (error) {
      console.error('Failed to restore SSO authentication from session storage:', error);
      this.clearSessionStorage();
    }
  }

  // FIXED: Safe MCP initialization that never throws errors
  private async initializeMcpConnectionSafely(userContext: UserContext) {
    try {
      this.setState({ mcpInitializing: true });
      
      console.log('🔄 Starting MCP connection initialization for user:', userContext.UserDisplayName);
      
      // Set user context in MCP client
      mcpClientService.setUserContext(userContext);
      
      // FIXED: Health check with timeout and fallback
      const healthCheckPromise = this.performSafeHealthCheck();
      const timeoutPromise = new Promise<boolean>((resolve) => {
        setTimeout(() => resolve(false), 10000); // 10 second timeout
      });
      
      const isHealthy = await Promise.race([healthCheckPromise, timeoutPromise]);
      
      if (isHealthy) {
        // Try to initialize MCP client
        try {
          await mcpClientService.initialize();
          
          this.setState({
            mcpConnected: true,
            mcpInitializing: false
          });
          
          console.info('✅ MCP connection initialized successfully');
        } catch (initError) {
          console.warn('⚠️ MCP initialization failed, continuing without MCP:', initError);
          this.setMcpDisconnectedState('MCP initialization failed');
        }
      } else {
        console.warn('⚠️ MCP health check failed or timed out, continuing without MCP');
        this.setMcpDisconnectedState('MCP server not accessible');
      }
      
    } catch (error) {
      console.warn('⚠️ MCP connection setup failed, continuing without MCP:', error);
      this.setMcpDisconnectedState('MCP connection setup failed');
    }
  }

  // FIXED: Safe health check that never throws
  private async performSafeHealthCheck(): Promise<boolean> {
    try {
      // Use the enhanced health check from mcpClientService
      const result: any = await mcpClientService.healthCheck();
      return result === true || (typeof result === 'object' && result.isHealthy === true);
    } catch (error) {
      console.warn('Health check failed safely:', error);
      return false;
    }
  }

  // Helper to set MCP disconnected state
  private setMcpDisconnectedState(reason: string) {
    this.setState({
      mcpConnected: false,
      mcpInitializing: false,
      error: `MCP unavailable: ${reason}. Some features may be limited.`
    });
  }

  // Transform SSO data to UserContext format
  private transformSSODataToUserContext(ssoData: SSOUserData): UserContext {
    return {
      UserID: ssoData.UserID,
      SiteID: ssoData.SiteID,
      OrgUnitID: ssoData.OrgUnitID,
      UserRoles: ssoData.UserRoles.map(role => ({
        RoleID: role.RoleID,
        Name: role.Name
      })),
      JwtToken: ssoData.JwtToken,
      SessionID: ssoData.SessionID,
      UserDisplayName: ssoData.UserDisplayName,
      EmailAddress: ssoData.EmailAddress,
      Picture: ssoData.Picture?.startsWith('/') 
        ? `${window.location.origin}${ssoData.Picture}` 
        : ssoData.Picture,
      FirstName: ssoData.FirstName,
      LastName: ssoData.LastName,
      Language: ssoData.Language,
      UserTimeZone: ssoData.UserTimeZone,
      UserLogin: ssoData.UserLogin,
      IsSysAdminUser: ssoData.IsSysAdminUser,
      UserCMSGroups: ssoData.UserCMSGroups,
      UserPrivileges: ssoData.UserPrivileges,
      IsClarizenUser: ssoData.IsClarizenUser,
      AccountType: ssoData.AccountType,
      CMSGroupID: ssoData.CMSGroupID,
      SendMessage: ssoData.SendMessage,
      ExternalUser: ssoData.ExternalUser,
      Membership: ssoData.Membership,
      NotifiyMessage: ssoData.NotifiyMessage,
      AutoLaunchContent: ssoData.AutoLaunchContent,
      IsGroupExpired: ssoData.IsGroupExpired,
      UserLockedtime: ssoData.UserLockedtime,
      Country: ssoData.Country
    };
  }

  // Subscribe to auth state changes
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners of state changes
  private notifyListeners() {
    this.listeners.forEach(listener => listener({ ...this.state }));
  }

  // Update state and notify listeners
  private setState(updates: Partial<AuthState>) {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  // Get current auth state
  getState(): AuthState {
    return { ...this.state };
  }

  // Get current user
  getCurrentUser(): UserContext | null {
    return this.state.user;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.state.isAuthenticated && this.state.user !== null;
  }

  // Check if MCP is connected
  isMcpConnected(): boolean {
    return this.state.mcpConnected;
  }

  // Check if MCP is initializing
  isMcpInitializing(): boolean {
    return this.state.mcpInitializing;
  }

  // FIXED: Safe MCP connection retry
  async retryMcpConnection(): Promise<boolean> {
    if (!this.state.user) {
      console.warn('Cannot retry MCP connection - no user context');
      return false;
    }

    try {
      console.log('🔄 Manual MCP connection retry initiated');
      
      // Clear any error state
      this.setState({ error: null });
      
      // Try safe initialization again
      await this.initializeMcpConnectionSafely(this.state.user);
      
      return this.state.mcpConnected;
    } catch (error) {
      console.warn('Manual MCP connection retry failed:', error);
      this.setMcpDisconnectedState('Retry failed');
      return false;
    }
  }

  // Refresh user data from session storage and reinitialize MCP if needed
  async refreshFromSession(): Promise<boolean> {
    try {
      const ssoData = sessionStorage.getItem(this.storageKey);
      
      if (ssoData) {
        const userData: SSOUserData = JSON.parse(ssoData);
        const userContext = this.transformSSODataToUserContext(userData);
        
        this.setState({
          isAuthenticated: true,
          user: userContext,
          error: null
        });
        
        // Reinitialize MCP if not connected
        if (!this.state.mcpConnected) {
          this.initializeMcpConnectionSafely(userContext);
        }
        
        console.info('Refreshed SSO authentication from session storage');
        return true;
      } else {
        this.logout();
        return false;
      }
    } catch (error) {
      console.error('Failed to refresh SSO authentication:', error);
      this.logout();
      return false;
    }
  }

  // Login method for manual authentication
  async login(userContext: UserContext): Promise<void> {
    try {
      this.setState({
        isLoading: true,
        error: null
      });

      // Save user context
      this.setState({
        isAuthenticated: true,
        user: userContext,
        isLoading: false
      });

      // Save to session storage
      sessionStorage.setItem(this.storageKey, JSON.stringify(userContext));

      // Initialize MCP connection safely
      this.initializeMcpConnectionSafely(userContext);

      console.info('Manual login completed');
    } catch (error) {
      console.error('Login failed:', error);
      this.setState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed'
      });
    }
  }

  // Logout and clear session
  logout(): void {
    console.info('Logging out SSO user and disconnecting MCP');

    this.setState({
      isAuthenticated: false,
      user: null,
      error: null,
      isLoading: false,
      mcpConnected: false,
      mcpInitializing: false
    });

    this.clearSessionStorage();
    
    // Clear MCP client user context safely
    try {
      mcpClientService.setUserContext(null as any);
    } catch (error) {
      console.warn('Error clearing MCP user context:', error);
    }
    
    // Redirect to SSO logout or login page
    const ssoLogoutUrl = API_CONFIG.LogOutURL || '/login';
    window.location.href = ssoLogoutUrl;
  }

  // Clear session storage
  private clearSessionStorage() {
    if (typeof window === 'undefined') return;

    try {
      sessionStorage.removeItem(this.storageKey);
      console.debug('SSO session data cleared');
    } catch (error) {
      console.error('Failed to clear SSO session data:', error);
    }
  }

  // Check if user has specific role
  hasRole(roleName: string): boolean {
    if (!this.state.user) return false;
    
    return this.state.user.UserRoles.some(role => 
      role.Name.toLowerCase() === roleName.toLowerCase()
    );
  }

  // Check if user has any of the specified roles
  hasAnyRole(roleNames: string[]): boolean {
    if (!this.state.user) return false;
    
    return roleNames.some(roleName => this.hasRole(roleName));
  }

  // Get user roles
  getUserRoles(): string[] {
    if (!this.state.user) return [];
    
    return this.state.user.UserRoles.map(role => role.Name);
  }

  // Check if user is system admin
  isSysAdmin(): boolean {
    return this.state.user?.IsSysAdminUser || false;
  }

  // Get user CMS groups
  getUserCMSGroups(): any[] {
    return this.state.user?.UserCMSGroups || [];
  }

  // Listen for storage changes
  private setupStorageListener() {
    if (typeof window === 'undefined') return;

    window.addEventListener('storage', (event) => {
      if (event.key === this.storageKey) {
        console.info('SSO session storage changed, refreshing authentication');
        this.refreshFromSession();
      }
    });
  }

  // Initialize storage listener
  init() {
    this.setupStorageListener();
  }
}

// Create singleton instance
export const ssoAuthService = new SSOAuthService();

// React hook for using SSO auth service
import { useState, useEffect } from 'react';

export function useSSO() {
  const [authState, setAuthState] = useState<AuthState>(ssoAuthService.getState());

  useEffect(() => {
    ssoAuthService.init();
    const unsubscribe = ssoAuthService.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  return {
    ...authState,
    refreshFromSession: ssoAuthService.refreshFromSession.bind(ssoAuthService),
    retryMcpConnection: ssoAuthService.retryMcpConnection.bind(ssoAuthService),
    logout: ssoAuthService.logout.bind(ssoAuthService),
    hasRole: ssoAuthService.hasRole.bind(ssoAuthService),
    hasAnyRole: ssoAuthService.hasAnyRole.bind(ssoAuthService),
    getUserRoles: ssoAuthService.getUserRoles.bind(ssoAuthService),
    isSysAdmin: ssoAuthService.isSysAdmin.bind(ssoAuthService),
    getUserCMSGroups: ssoAuthService.getUserCMSGroups.bind(ssoAuthService),
    isMcpConnected: ssoAuthService.isMcpConnected.bind(ssoAuthService),
    isMcpInitializing: ssoAuthService.isMcpInitializing.bind(ssoAuthService)
  };
}