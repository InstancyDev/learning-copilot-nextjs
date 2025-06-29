// services/RevenueCatService.ts
import { Purchases,CustomerInfo, Package, Offerings, EntitlementInfo} from '@revenuecat/purchases-js';

  
  
export interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  isPopular?: boolean;
  billingPeriod: 'monthly' | 'yearly';
}

export interface SubscriptionStatus {
  isActive: boolean;
  currentTier: string | null;
  expirationDate: Date | null;
  willRenew: boolean;
  isInGracePeriod: boolean;
  entitlements: string[];
}

class RevenueCatService {
  private initialized = false;
  private customerInfo: CustomerInfo | null = null;
  private purchasesInstance: any = null;

  async initialize(apiKey: string, userId?: string): Promise<void> {
    try {
      if (this.initialized) return;

      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        throw new Error('RevenueCat web SDK only works in browser environment');
      }

      // Configure RevenueCat for web - Web SDK uses static configure method
      this.purchasesInstance = Purchases.configure(apiKey, userId || 'anonymous_user');

      // Get initial customer info
      try {
        this.customerInfo = await Purchases.getSharedInstance().getCustomerInfo();
      } catch (error) {
        console.warn('Could not get initial customer info:', error);
        // Continue initialization even if we can't get customer info initially
      }
      
      this.initialized = true;
      console.log('RevenueCat initialized successfully');
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
      throw error;
    }
  } 
  async getOfferings(): Promise<Offerings | null> {
    if (!this.initialized) {
      throw new Error('RevenueCat not initialized');
    }

    try {
      const offerings = await Purchases.getSharedInstance().getOfferings();
        
      if (offerings.current !== null && offerings.current.availablePackages.length !== 0)
        {            
            console.log(offerings.current.availablePackages);
            return offerings;
        } 
    } catch (error) {
      console.error('Failed to get offerings:', error);      
      return null; // Return null if offerings cannot be fetched
    }
    return null;
  }

  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    try {
      const customerInfo = await Purchases.getSharedInstance().getCustomerInfo();    
      // Check active entitlements
      const activeEntitlements = Object.keys(customerInfo.entitlements.active || {});
      console.log('Customer info:', customerInfo);
      console.log('Active entitlements:', activeEntitlements);
      const isActive = activeEntitlements.length > 0;
      
      let currentTier: string | null = null;
      let expirationDate: Date | null = null;
      let willRenew = false;
      let isInGracePeriod = false;

      if (isActive && activeEntitlements.length > 0) {
        // Get the primary entitlement (assuming first one is primary)
        const primaryEntitlementKey = activeEntitlements[0];
        const primaryEntitlement = customerInfo.entitlements.active[primaryEntitlementKey];
        
        if (primaryEntitlement) {
          currentTier = primaryEntitlement.identifier;
          expirationDate = primaryEntitlement.expirationDate ? new Date(primaryEntitlement.expirationDate) : null;
          willRenew = primaryEntitlement.willRenew || false;          
        }

      }

      return {
        isActive,
        currentTier,
        expirationDate,
        willRenew,
        isInGracePeriod,
        entitlements: activeEntitlements
      };
    } catch (error) {
      console.error('Failed to get subscription status:', error);
      return {
        isActive: false,
        currentTier: null,
        expirationDate: null,
        willRenew: false,
        isInGracePeriod: false,
        entitlements: []
      };
    }
  }

  async purchasePackage(packageToPurchase: Package): Promise<{
    success: boolean;
    customerInfo?: CustomerInfo;
    error?: string;
  }> {
    try {
      if (!this.initialized) {
        throw new Error('RevenueCat not initialized');
      }

      console.log('Attempting to purchase package:', packageToPurchase);

      // For web SDK, use the correct purchase method syntax
      // The Web SDK expects just the package object, not wrapped in rcPackage
      const result = await Purchases.getSharedInstance().purchase({rcPackage: packageToPurchase});
      
      console.log('Purchase result:', result);
      
      // Update customer info after purchase
      this.customerInfo = await  Purchases.getSharedInstance().getCustomerInfo();
      
      return {
        success: true,
        ...(this.customerInfo ? { customerInfo: this.customerInfo } : {})
      };
    } catch (error: any) {
      console.error('Purchase failed:', error);
      
      // Handle user cancellation
      if (error.code === 'USER_CANCELLED' || error.message?.includes('cancelled')) {
        return {
          success: false,
          error: 'Purchase was cancelled'
        };
      }
      
      return {
        success: false,
        error: error.message || 'Purchase failed'
      };
    }
  }

  // Add method to purchase by product ID directly
  async purchaseProductById(productId: string): Promise<{
    success: boolean;
    customerInfo?: CustomerInfo;
    error?: string;
  }> {
    try {
      if (!this.initialized) {
        throw new Error('RevenueCat not initialized');
      }

       const offerings = await Purchases.getSharedInstance().getOfferings();
        if (
            offerings.current !== null &&
            offerings.current.availablePackages.length !== 0
        ) {
            console.log('Available packages:', offerings.current.availablePackages);
            const targetPackage = offerings.current.availablePackages.find(
                (pkg: Package) => pkg.identifier === '$rc_monthly');
            if (!targetPackage) {
                throw new Error(`Package with product ID ${productId} not found`);
            }
             return await this.purchasePackage(targetPackage);
            
        }
        else {
            return {
            success: false,
            error: 'Purchase failed'
        };
        }
    } catch (error: any) {
      console.error('Purchase by product ID failed:', error);
      return {
        success: false,
        error: error.message || 'Purchase failed'
      };
    }
  }

  async restorePurchases(): Promise<{
    success: boolean;
    customerInfo?: CustomerInfo;
    error?: string;
  }> {
    try {
      if (!this.initialized) {
        throw new Error('RevenueCat not initialized');
      }

      // Web SDK restore method - just refresh customer info
      const customerInfo = await this.purchasesInstance.getCustomerInfo();
      this.customerInfo = customerInfo;
      
      return {
        success: true,
        customerInfo
      };
    } catch (error: any) {
      console.error('Restore purchases failed:', error);
      return {
        success: false,
        error: error.message || 'Restore failed'
      };
    }
  }   
  async checkEntitlement(entitlementId: string): Promise<boolean> {
    try {
      const customerInfo = await Purchases.getSharedInstance().getCustomerInfo();
      return entitlementId in (customerInfo.entitlements.active || {});
    } catch (error) {
      console.error('Failed to check entitlement:', error);
      return false;
    }
  }

  // Helper method to check if user can access premium content
  async canAccessPremiumContent(): Promise<boolean> {
    return await this.checkEntitlement('Instancy');
  }

  // Helper method to check specific tier access
  async hasSubscriptionTier(tier: string): Promise<boolean> {
    return await this.checkEntitlement('Instancy');
  }

  // Get user's subscription tier hierarchy
  async getAccessLevel(): Promise<'free' | 'paid' > {
    try {
      const status = await this.getSubscriptionStatus();
      
      if (!status.isActive) return 'free';
      
      // Check tiers in order of hierarchy
      if (await this.checkEntitlement('instancy')) return 'paid'; 
      return 'free';
    } catch (error) {
      console.error('Failed to get access level:', error);
      return 'free';
    }
  }  
}

export const revenueCatService = new RevenueCatService();