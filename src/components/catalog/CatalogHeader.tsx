// components/catalog/CatalogHeader.tsx
import React from 'react';
import { Grid, List, Wifi, WifiOff, Crown, Loader2 } from 'lucide-react';
import { SubscriptionStatusBadge } from '@/components/common/SubscriptionStatusBadge';

interface CatalogHeaderProps {
  mcpConnected: boolean;
  subscriptionStatus: any;
  subscriptionLoading: boolean;
  accessLevel: 'free' | 'paid';
  getSubscriptionInfo: () => any;
  onUpgradeSubscription: () => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  userHasPaidPlan: boolean; // Make this required instead of optional
}

export const CatalogHeader: React.FC<CatalogHeaderProps> = ({
  mcpConnected,
  subscriptionStatus,
  subscriptionLoading,
  accessLevel,
  getSubscriptionInfo,
  onUpgradeSubscription,
  viewMode,
  onViewModeChange,
  userHasPaidPlan
}) => {
  // Render subscription status indicator
  const renderSubscriptionStatus = () => {
    if (subscriptionLoading) {
      return (
        <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          <Loader2 className="w-3 h-3 animate-spin" />
          Loading...
        </div>
      );
    }

    if (!subscriptionStatus) return null;

    const subscriptionInfo = getSubscriptionInfo();

    return (
      <SubscriptionStatusBadge
        tier={subscriptionInfo.tier as any}
        isActive={subscriptionStatus.isActive}
        isExpiring={subscriptionInfo.isExpiringSoon}
        daysUntilExpiration={subscriptionInfo.daysUntilExpiration}
        onClick={onUpgradeSubscription}
        showUpgradePrompt={!subscriptionStatus.isActive || subscriptionInfo.tier === 'free'}
      />
    );
  };

  // Determine if we should show the upgrade button
  const shouldShowUpgradeButton = () => {
    // Don't show if user has a paid plan
    if (userHasPaidPlan) return false;
    
    // Don't show if subscription is active and not free tier
    if (subscriptionStatus?.isActive && 
        subscriptionStatus?.currentTier && 
        subscriptionStatus.currentTier !== 'free' && 
        subscriptionStatus.currentTier !== 'none') {
      return false;
    }
    
    // Don't show if access level is paid
    if (accessLevel === 'paid') return false;
    
    // Show for free users or inactive subscriptions
    return true;
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Learning Catalog</h1>
              
              {/* MCP Connection Status 
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                mcpConnected 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {mcpConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {mcpConnected ? 'MCP Connected' : 'MCP Disconnected'}
              </div>*/}
              
              {/* Subscription Status */}
              {renderSubscriptionStatus()}
            </div>
            <p className="text-gray-600">
              Discover courses, certifications, and learning materials
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Subscription Upgrade Button - Only show for free users 
            {shouldShowUpgradeButton() && (
              <button
                onClick={onUpgradeSubscription}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg"
              >
                <Crown className="w-4 h-4" />
                Upgrade to Premium
              </button>
            )}*/}

            {/* View Mode Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                aria-label="Grid view"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                aria-label="List view"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};