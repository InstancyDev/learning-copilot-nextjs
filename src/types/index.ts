// User Types
export interface UserRole {
  RoleID: number;
  Name: string;
}

export interface UserCMSGroup {
  CMSGroupID: number;
  Name: string;
  CMGroupID: number;
}

export interface UserContext {
  UserID: number;
  OrgUnitID: number;
  UserPrivileges: any[];
  UserRoles: UserRole[];
  UserCMSGroups: UserCMSGroup[];
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

// Navigation Types
export interface NavigationItem {
  id: string;
  title: string;
  icon: string;
  url: string;
  active: boolean;
  requiredRoles?: string[];
}

export interface MenuData {
  navigation: NavigationItem[];
}

// API Types
export interface ApiEndpoints {
  login: string;
  logout: string;
  userProfile: string;
  courses: string;
  myLearning: string;
  communities: string;
}

export interface ApiConfig {
  baseUrl: string;
  sessionStorageKey: string;
  endpoints: ApiEndpoints;
}

// Client Configuration Types
export interface ClientConfig {
  clientURL: string;
  contentPath: string;
  getLogoUrl: (siteID: number) => string;
  getDefaultLogoUrl: () => string;
}

// Component Props Types
export interface LoginPageProps {
  onLogin: (userContext: UserContext) => void;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Utility Types
export type IconName = 'sparkles' | 'bookOpen' | 'book' | 'users' | 'settings' | 'bot';

export type MenuActiveState = 'ai-agent' | 'co-create' | 'my-learning' | 'catalog' | 'communities' | 'admin';

// Hook Types
export interface UseAuthReturn {
  user: UserContext | null;
  isLoggedIn: boolean;
  login: (userContext: UserContext) => void;
  logout: () => void;
  loading: boolean;
}

// API Call Options
export interface ApiCallOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: string;
}

// Environment Variables (for type safety)
export interface EnvironmentVariables {
  NEXT_PUBLIC_CLIENT_URL: string;
  NEXT_PUBLIC_API_BASE_URL: string;
  NEXT_PUBLIC_FLOWISE_API_HOST: string;
  NEXT_PUBLIC_FLOWISE_CHATFLOW_ID: string;
}
export * from './Catalog';