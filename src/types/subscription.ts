// types/subscription.ts
export interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  isPopular?: boolean;
  billingPeriod: 'monthly' | 'yearly';
  maxUsers?: number;
  apiAccess?: boolean;
  customIntegrations?: boolean;
  prioritySupport?: boolean;
}

export interface SubscriptionStatus {
  isActive: boolean;
  currentTier: string | null;
  expirationDate: Date | null;
  willRenew: boolean;
  isInGracePeriod: boolean;
  entitlements: string[];
  billingCycle?: 'monthly' | 'yearly';
  nextBillingDate?: Date | null;
  cancelAtPeriodEnd?: boolean;
}

export interface SubscriptionFeature {
  id: string;
  name: string;
  description: string;
  includedInTiers: ('free' | 'paid')[];
  limitType?: 'boolean' | 'numeric' | 'unlimited';
  limits?: {
    basic?: number;
    premium?: number;
    enterprise?: number | 'unlimited';
  };
}

export interface UserSubscription {
  id: string;
  userId: string;
  tier: 'free' | 'paid';
  status: 'active' | 'cancelled' | 'expired' | 'grace_period' | 'trial';
  startDate: string;
  endDate: string | null;
  autoRenew: boolean;
  features: string[];
  trialEndsAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string;
  billingInfo?: {
    amount: number;
    currency: string;
    interval: 'month' | 'year';
    nextBillingDate: string;
  };
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: 'paid';
  description: string;
  price: {
    monthly: number;
    yearly: number;
    currency: string;
  };
  features: SubscriptionFeature[];
  limits: {
    maxCourses?: number | 'unlimited';
    maxUsers?: number | 'unlimited';
    storageGB?: number | 'unlimited';
    apiCallsPerMonth?: number | 'unlimited';
    supportLevel: 'community' | 'email' | 'priority' | 'dedicated';
  };
  popular?: boolean;
  trialDays?: number;
}

export interface ContentAccess {
  requiredTier: 'free' | 'paid';
  isPremium: boolean;
  isExclusive?: boolean;
  earlyAccess?: boolean;
  requiredFeatures?: string[];
}

export interface SubscriptionEvent {
  id: string;
  type: 'subscription_started' | 'subscription_renewed' | 'subscription_cancelled' | 'subscription_expired' | 'tier_upgraded' | 'tier_downgraded';
  userId: string;
  subscriptionId: string;
  timestamp: string;
  data: {
    previousTier?: string;
    newTier?: string;
    reason?: string;
    amount?: number;
    currency?: string;
  };
}

export interface SubscriptionAnalytics {
  totalSubscribers: number;
  activeSubscribers: number;
  churnRate: number;
  monthlyRecurringRevenue: number;
  averageRevenuePerUser: number;
  subscriptionsByTier: {
    basic: number;
    premium: number;
    enterprise: number;
  };
  conversionRates: {
    freeToBasic: number;
    basicToPremium: number;
    premiumToEnterprise: number;
  };
  retentionRates: {
    month1: number;
    month3: number;
    month6: number;
    month12: number;
  };
}

// Extended CatalogItem interface to include subscription information
export interface CatalogItemWithSubscription {
  id: string;
  title: string;
  description: string;
  // ... other existing CatalogItem properties
  subscriptionTier?: 'free' | 'paid';
  isPremiumContent?: boolean;
  requiresSubscription?: boolean;
  contentAccess?: ContentAccess;
  earlyAccessDate?: string;
  exclusiveUntil?: string;
}

// Subscription hook return type
export interface UseSubscriptionReturn {
  // State
  subscriptionStatus: SubscriptionStatus | null;
  offerings: any[];
  accessLevel: 'free' | 'paid';
  loading: boolean;
  error: string | null;
  initialized: boolean;
  
  // Actions
  purchasePackage: (pkg: any) => Promise<{ success: boolean; error?: string }>;
  restorePurchases: () => Promise<{ success: boolean; error?: string }>;
  reload: () => Promise<void>;
  
  // Utilities
  canAccessContent: (requiredTier: 'free' | 'paid') => boolean;
  getSubscriptionFeatures: () => string[];
  isSubscriptionExpiringSoon: () => boolean;
  getSubscriptionInfo: () => {
    tier: string;
    status: string;
    expiresAt: Date | null;
    willRenew: boolean;
    isExpiringSoon: boolean;
    daysUntilExpiration: number | null;
    isInGracePeriod?: boolean;
  };
}

// RevenueCat specific types
export interface RevenueCatCustomerInfo {
  entitlements: {
    active: { [key: string]: RevenueCatEntitlement };
    all: { [key: string]: RevenueCatEntitlement };
  };
  activeSubscriptions: string[];
  allPurchasedProductIdentifiers: string[];
  nonSubscriptionTransactions: any[];
  originalApplicationVersion: string | null;
  originalPurchaseDate: string | null;
  requestDate: string;
  firstSeen: string;
  originalAppUserId: string;
  managementURL: string | null;
}

export interface RevenueCatEntitlement {
  identifier: string;
  isActive: boolean;
  willRenew: boolean;
  latestPurchaseDate: string;
  originalPurchaseDate: string;
  expirationDate: string | null;
  store: string;
  productIdentifier: string;
  isSandbox: boolean;
  unsubscribeDetectedAt: string | null;
  billingIssueDetectedAt: string | null;
  isInGracePeriod?: boolean;
}

export interface RevenueCatPackage {
  identifier: string;
  packageType: string;
  product: {
    identifier: string;
    description: string;
    title: string;
    price: number;
    priceString: string;
    currencyCode: string;
    subscriptionPeriod?: string;
    introPrice?: {
      price: number;
      priceString: string;
      period: string;
      cycles: number;
    };
  };
  offeringIdentifier: string;
}

export interface RevenueCatOffering {
  identifier: string;
  serverDescription: string;
  metadata: { [key: string]: any };
  availablePackages: RevenueCatPackage[];
  lifetime: RevenueCatPackage | null;
  annual: RevenueCatPackage | null;
  sixMonth: RevenueCatPackage | null;
  threeMonth: RevenueCatPackage | null;
  twoMonth: RevenueCatPackage | null;
  monthly: RevenueCatPackage | null;
  weekly: RevenueCatPackage | null;
}

// Subscription configuration
export interface SubscriptionConfig {
  revenueCatApiKey: string;
  environment: 'development' | 'staging' | 'production';
  enableMockData: boolean;
  defaultTier: 'free' | 'paid';
  trialEnabled: boolean;
  trialDays: number;
  gracePeriodDays: number;
  entitlements: {
    basic: string;
    premium: string;
    enterprise: string;
  };
  features: {
    [key: string]: {
      name: string;
      description: string;
      tiers: string[];
    };
  };
}

// Error types
export interface SubscriptionError {
  code: string;
  message: string;
  type: 'network' | 'payment' | 'auth' | 'validation' | 'unknown';
  retryable: boolean;
}

// Webhook types for subscription events
export interface SubscriptionWebhookPayload {
  event_type: string;
  api_version: string;
  event: {
    id: string;
    created_at_ms: number;
    customer_info: RevenueCatCustomerInfo;
    product_id: string;
    period_type: 'NORMAL' | 'TRIAL' | 'INTRO';
    purchased_at_ms: number;
    expiration_at_ms: number | null;
    environment: 'SANDBOX' | 'PRODUCTION';
    entitlement_id: string | null;
    entitlement_ids: string[];
    transaction_id: string;
    original_transaction_id: string;
    is_family_share: boolean;
    country_code: string;
    app_user_id: string;
    aliases: string[];
    original_app_user_id: string;
  };
}

// No default export needed for types/interfaces.