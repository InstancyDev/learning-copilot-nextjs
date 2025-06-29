// hooks/useSubscription.ts
import { useState, useEffect, useCallback } from 'react';
import { revenueCatService, SubscriptionStatus } from '@/services/RevenueCatService';
import {Offerings, Package} from '@revenuecat/purchases-js';

export const useSubscription = () => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [offerings, setOfferings] = useState<Offerings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessLevel, setAccessLevel] = useState<'free' | 'paid'>('free');
  const [initialized, setInitialized] = useState(false);

  // Load subscription data
  const loadSubscriptionData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [status, offeringsData, level] = await Promise.all([
        revenueCatService.getSubscriptionStatus(), 
        revenueCatService.getOfferings(),
        revenueCatService.getAccessLevel()
      ]);
      
      setSubscriptionStatus(status);
      setOfferings(offeringsData);
      setAccessLevel(level);
      setInitialized(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscription data');
      console.error('Failed to load subscription data:', err);
      
      // Set default values on error
      setSubscriptionStatus({
        isActive: false,
        currentTier: null,
        expirationDate: null,
        willRenew: false,
        isInGracePeriod: false,
        entitlements: []
      });
      setAccessLevel('free');
      setInitialized(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Purchase a package
  const purchasePackage = useCallback(async (packageToPurchase: Package) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await revenueCatService.purchasePackage(packageToPurchase);
      
      if (result.success) {
        // Reload subscription data after successful purchase
        await loadSubscriptionData();
        return { success: true };
      } else {
        setError(result.error || 'Purchase failed');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Purchase failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [loadSubscriptionData]);

  // Restore purchases
  const restorePurchases = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await revenueCatService.restorePurchases();
      
      if (result.success) {
        await loadSubscriptionData();
        return { success: true };
      } else {
        setError(result.error || 'Restore failed');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Restore failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [loadSubscriptionData]);

  // Check if user can access specific content
  const canAccessContent = useCallback((requiredTier: 'free' | 'paid') => {
    const tierHierarchy = { free: 0, paid: 1};
    return tierHierarchy[accessLevel] >= tierHierarchy[requiredTier];
  }, [accessLevel]);

  // Get subscription features for current tier
  const getSubscriptionFeatures = useCallback(() => {
    switch (accessLevel) {       
      case 'paid':
        return [
          'Access to premium courses',
          'Basic analytics',
          'Email support',
          'Mobile access',
          'Progress tracking',
          'Basic certificates'
        ];
      default:
        return [
          'Limited course access',
          'Basic features',
          'Community support'
        ];
    }
  }, [accessLevel]);

  // Check if subscription is expiring soon (within 7 days)
  const isSubscriptionExpiringSoon = useCallback(() => {
    if (!subscriptionStatus?.expirationDate || !subscriptionStatus.isActive) {
      return false;
    }
    
    const now = new Date();
    const expirationDate = new Date(subscriptionStatus.expirationDate);
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysUntilExpiration <= 7 && daysUntilExpiration > 0;
  }, [subscriptionStatus]);

  // Get subscription info for display
  const getSubscriptionInfo = useCallback(() => {
    if (!subscriptionStatus) {
      return {
        tier: 'free',
        status: 'No subscription',
        expiresAt: null,
        willRenew: false,
        isExpiringSoon: false,
        daysUntilExpiration: null
      };
    }

    let daysUntilExpiration = null;
    if (subscriptionStatus.expirationDate) {
      const now = new Date();
      const expirationDate = new Date(subscriptionStatus.expirationDate);
      daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    return {
      tier: subscriptionStatus.currentTier || 'free',
      status: subscriptionStatus.isActive ? 'Active' : 'Inactive',
      expiresAt: subscriptionStatus.expirationDate,
      willRenew: subscriptionStatus.willRenew,
      isExpiringSoon: isSubscriptionExpiringSoon(),
      daysUntilExpiration,
      isInGracePeriod: subscriptionStatus.isInGracePeriod
    };
  }, [subscriptionStatus, isSubscriptionExpiringSoon]);

  // Initialize on mount with delay to ensure RevenueCat is ready
  useEffect(() => {
    const initTimer = setTimeout(() => {
      loadSubscriptionData();
    }, 1000); // Give RevenueCat time to initialize

    return () => clearTimeout(initTimer);
  }, [loadSubscriptionData]);

  return {
    // State
    subscriptionStatus,
    offerings,
    accessLevel,
    loading,
    error,
    initialized,
    
    // Actions
    purchasePackage,
    restorePurchases,
    reload: loadSubscriptionData,
    
    // Utilities
    canAccessContent,
    getSubscriptionFeatures,
    isSubscriptionExpiringSoon,
    getSubscriptionInfo
  };
};