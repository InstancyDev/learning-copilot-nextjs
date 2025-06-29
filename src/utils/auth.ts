import type { UserContext, UserRole } from '@/types';

/**
 * Session management utilities
 */
export const sessionUtils = {
  getSessionKey: (): string => {
    if (typeof window === 'undefined') return '';
    return `userContext_${window.location.origin}`;
  },

  getUserFromSession: (): UserContext | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const sessionKey = sessionUtils.getSessionKey();
      const userContext = sessionStorage.getItem(sessionKey);
      return userContext ? JSON.parse(userContext) as UserContext : null;
    } catch (error) {
      console.error('Error getting user from session:', error);
      return null;
    }
  },

  saveUserToSession: (userContext: UserContext): void => {
    if (typeof window === 'undefined') return;
    
    try {
      const sessionKey = sessionUtils.getSessionKey();
      sessionStorage.setItem(sessionKey, JSON.stringify(userContext));
    } catch (error) {
      console.error('Error saving user to session:', error);
    }
  },

  clearUserSession: (): void => {
    if (typeof window === 'undefined') return;
    
    try {
      const sessionKey = sessionUtils.getSessionKey();
      sessionStorage.removeItem(sessionKey);
    } catch (error) {
      console.error('Error clearing user session:', error);
    }
  }
};

/**
 * Role-based access control utilities
 */
export const roleUtils = {
  hasRole: (userRoles: UserRole[], requiredRoles?: string[]): boolean => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    if (!userRoles || userRoles.length === 0) return false;
    
    const userRoleNames = userRoles.map(role => role.Name);
    return requiredRoles.some(role => userRoleNames.includes(role));
  },

  hasAnyRole: (userRoles: UserRole[], roles: string[]): boolean => {
    if (!userRoles || userRoles.length === 0) return false;
    
    const userRoleNames = userRoles.map(role => role.Name);
    return roles.some(role => userRoleNames.includes(role));
  },

  hasAllRoles: (userRoles: UserRole[], roles: string[]): boolean => {
    if (!userRoles || userRoles.length === 0) return false;
    
    const userRoleNames = userRoles.map(role => role.Name);
    return roles.every(role => userRoleNames.includes(role));
  },

  getHighestPriorityRole: (userRoles: UserRole[]): string => {
    if (!userRoles || userRoles.length === 0) return 'User';
    
    const rolePriority = ['Site Admin', 'Admin', 'Manager', 'Instructor', 'Author', 'Learner'];
    
    for (const priorityRole of rolePriority) {
      if (userRoles.some(role => role.Name === priorityRole)) {
        return priorityRole;
      }
    }
    
    return userRoles[0].Name;
  },

  isAdmin: (userRoles: UserRole[]): boolean => {
    return roleUtils.hasAnyRole(userRoles, ['Admin', 'Site Admin']);
  },

  isSiteAdmin: (userRoles: UserRole[]): boolean => {
    return roleUtils.hasRole(userRoles, ['Site Admin']);
  }
};

/**
 * User display utilities
 */
export const userUtils = {
  getDisplayName: (user: UserContext): string => {
    if (user.UserDisplayName) return user.UserDisplayName;
    if (user.FirstName && user.LastName) return `${user.FirstName} ${user.LastName}`;
    if (user.FirstName) return user.FirstName;
    return user.EmailAddress || user.UserLogin || 'User';
  },

  getInitials: (user: UserContext): string => {
    const displayName = userUtils.getDisplayName(user);
    const names = displayName.split(' ');
    
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
    }
    
    return displayName.charAt(0).toUpperCase();
  },

  getRoleDisplayName: (user: UserContext): string => {
    return roleUtils.getHighestPriorityRole(user.UserRoles);
  }
};

/**
 * Authentication validation utilities
 */
export const authUtils = {
  isAuthenticated: (user: UserContext | null): boolean => {
    return !!(user && user.JwtToken && user.SessionID);
  },

  isTokenValid: (jwtToken: string): boolean => {
    try {
      // Basic JWT token structure validation
      const parts = jwtToken.split('.');
      return parts.length === 3;
    } catch {
      return false;
    }
  },

  shouldRefreshToken: (user: UserContext): boolean => {
    // Add your token expiry logic here
    // This is a placeholder implementation
    return false;
  }
};