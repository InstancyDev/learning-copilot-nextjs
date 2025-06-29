// components/common/SubscriptionStatusBadge.tsx
import React from 'react';
import { Crown, Star, Zap, Lock, AlertTriangle, Check } from 'lucide-react';

interface SubscriptionStatusBadgeProps {
  tier: 'free' | 'paid';
  isActive?: boolean;
  isExpiring?: boolean;
  daysUntilExpiration?: number | null;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showUpgradePrompt?: boolean;
}

export const SubscriptionStatusBadge: React.FC<SubscriptionStatusBadgeProps> = ({
  tier,
  isActive = true,
  isExpiring = false,
  daysUntilExpiration,
  onClick,
  size = 'md',
  showUpgradePrompt = true
}) => {
  const getTierIcon = () => {
    const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
    
    if (isExpiring) {
      return <AlertTriangle className={`${iconSize} text-orange-600`} />;
    }
    
    if (!isActive && tier !== 'free') {
      return <Lock className={`${iconSize} text-gray-600`} />;
    }
    
    switch (tier) {     
      case 'paid': return <Zap className={`${iconSize} text-blue-600`} />;
      default: return showUpgradePrompt ? <Lock className={`${iconSize} text-gray-600`} /> : <Check className={`${iconSize} text-green-600`} />;
    }
  };

  const getBadgeStyles = () => {
    const baseStyles = 'inline-flex items-center gap-2 rounded-full font-medium transition-all';
    
    const sizeStyles = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1 text-xs',
      lg: 'px-4 py-2 text-sm'
    };
    
    if (isExpiring) {
      return `${baseStyles} ${sizeStyles[size]} bg-orange-100 text-orange-800 border border-orange-200 hover:bg-orange-200`;
    }
    
    if (!isActive && tier !== 'free') {
      return `${baseStyles} ${sizeStyles[size]} bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200`;
    }
    
    switch (tier) {      
      case 'paid':
        return `${baseStyles} ${sizeStyles[size]} bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200`;
      default:
        return showUpgradePrompt 
          ? `${baseStyles} ${sizeStyles[size]} bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 cursor-pointer`
          : `${baseStyles} ${sizeStyles[size]} bg-green-100 text-green-800 border border-green-200`;
    }
  };

  const getDisplayText = () => {
    if (isExpiring && daysUntilExpiration !== null && daysUntilExpiration !== undefined) {
      if (daysUntilExpiration <= 0) {
        return 'Expired';
      } else if (daysUntilExpiration === 1) {
        return 'Expires Tomorrow';
      } else {
        return `${daysUntilExpiration} Days Left`;
      }
    }
    
    if (!isActive && tier !== 'free') {
      return `${tier.charAt(0).toUpperCase() + tier.slice(1)} (Inactive)`;
    }
    
    if (tier === 'free' && showUpgradePrompt) {
      return 'Free - Upgrade';
    }
    
    return `${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`;
  };

  const badge = (
    <span className={getBadgeStyles()}>
      {getTierIcon()}
      <span>{getDisplayText()}</span>
    </span>
  );

  if (onClick || (tier === 'free' && showUpgradePrompt)) {
    return (
      <button 
        onClick={onClick}
        className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded-full"
      >
        {badge}
      </button>
    );
  }

  return badge;
};

// Subscription Status Card for detailed view
interface SubscriptionStatusCardProps {
  tier: 'free' | 'paid';
  isActive?: boolean;
  expirationDate?: Date | null;
  willRenew?: boolean;
  onUpgrade?: () => void;
  onManage?: () => void;
}

export const SubscriptionStatusCard: React.FC<SubscriptionStatusCardProps> = ({
  tier,
  isActive = true,
  expirationDate,
  willRenew = false,
  onUpgrade,
  onManage
}) => {
  const getTierInfo = () => {
    switch (tier) { 
      case 'paid':
        return {
          name: 'Basic',
          color: 'blue',
          icon: <Zap className="w-6 h-6 text-blue-600" />,
          features: ['Premium courses', 'Basic analytics', 'Email support', 'Mobile access']
        };
      default:
        return {
          name: 'Free',
          color: 'gray',
          icon: <Lock className="w-6 h-6 text-gray-600" />,
          features: ['Limited access', 'Basic features', 'Community support']
        };
    }
  };

  const tierInfo = getTierInfo();
  const isExpiring = expirationDate ? new Date(expirationDate).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000 : false;

  return (
    <div className={`bg-white border-2 rounded-xl p-6 ${isActive && tier !== 'free' ? `border-${tierInfo.color}-200 bg-${tierInfo.color}-50` : 'border-gray-200'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full bg-${tierInfo.color}-100 flex items-center justify-center`}>
            {tierInfo.icon}
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">{tierInfo.name} Plan</h3>
            <p className={`text-sm ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
              {isActive ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>
        
        {isExpiring && (
          <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
            Expiring Soon
          </div>
        )}
      </div>

      {/* Expiration Info */}
      {expirationDate && isActive && (
        <div className="mb-4 p-3 bg-white rounded-lg border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {willRenew ? 'Renews on' : 'Expires on'}
            </span>
            <span className="font-medium">
              {expirationDate.toLocaleDateString()}
            </span>
          </div>
          {!willRenew && (
            <p className="text-xs text-orange-600 mt-1">
              Your subscription will not auto-renew
            </p>
          )}
        </div>
      )}

      {/* Features */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-2">Included Features</h4>
        <ul className="space-y-1">
          {tierInfo.features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm text-gray-600">
              <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        {tier === 'free' && onUpgrade && (
          <button
            onClick={onUpgrade}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Upgrade Plan
          </button>
        )}
        
        {tier !== 'free' && tier !== 'paid' && onUpgrade && (
          <button
            onClick={onUpgrade}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-700 text-white py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Upgrade to Higher Tier
          </button>
        )}
        
        {isActive && tier !== 'free' && onManage && (
          <button
            onClick={onManage}
            className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Manage Subscription
          </button>
        )}
      </div>
    </div>
  );
};