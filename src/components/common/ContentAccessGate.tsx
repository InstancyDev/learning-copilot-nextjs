// components/common/ContentAccessGate.tsx
import React from 'react';
import { Lock, Crown, Star, Zap, ArrowRight, Shield } from 'lucide-react';

interface ContentAccessGateProps {
  requiredTier: 'free' | 'paid';
  currentTier: 'free' | 'paid';
  onUpgrade: () => void;
  children: React.ReactNode;
  showUpgradePrompt?: boolean;
  contentType?: string;
  contentTitle?: string;
}

export const ContentAccessGate: React.FC<ContentAccessGateProps> = ({
  requiredTier,
  currentTier,
  onUpgrade,
  children,
  showUpgradePrompt = true,
  contentType = 'content',
  contentTitle = ''
}) => {
  const tierHierarchy = { free: 0, paid: 1 };
  const hasAccess = tierHierarchy[currentTier] >= tierHierarchy[requiredTier];

  const getTierIcon = (tier: string) => {
    switch (tier) {     
      case 'paid': return <Zap className="w-6 h-6 text-blue-600" />;
      default: return <Lock className="w-6 h-6 text-gray-600" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {       
      case 'paid': return 'from-blue-500 to-blue-700';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {     
      case 'paid': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTierFeatures = (tier: string): string[] => {
    switch (tier) { 
      case 'paid':
        return [
          'Access to premium courses',
          'Basic progress tracking',
          'Email support',
          'Mobile app access',
          'Basic certificates'
        ];
      default:
        return ['Limited access', 'Basic features'];
    }
  };

  if (hasAccess) {
    return <>{children}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  return (
    <div className="relative">
      {/* Blurred Content Preview */}
      <div className="filter blur-sm pointer-events-none opacity-30 select-none">
        {children}
      </div>
      
      {/* Upgrade Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-95 backdrop-blur-sm">
        <div className="text-center p-8 max-w-md mx-4">
          {/* Icon and Badge */}
          <div className="relative mb-6">
            <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${getTierColor(requiredTier)} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
              {getTierIcon(requiredTier)}
            </div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getTierBadgeColor(requiredTier)}`}>
              <Shield className="w-3 h-3 mr-1" />
              {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} Required
            </div>
          </div>
          
          {/* Heading */}
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Unlock Premium {contentType}
          </h3>
          
          {/* Content Title */}
          {contentTitle && (
            <p className="text-gray-600 text-sm mb-4 italic">
              "{contentTitle}"
            </p>
          )}
          
          {/* Description */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            This premium {contentType} requires a{' '}
            <span className="font-semibold text-gray-900 capitalize">{requiredTier}</span> subscription. 
            Upgrade now to unlock this content and enjoy all the benefits of your new plan.
          </p>
          
          {/* Features Preview */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">
              What you'll get with {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)}:
            </h4>
            <ul className="space-y-2">
              {getTierFeatures(requiredTier).slice(0, 3).map((feature, index) => (
                <li key={index} className="flex items-center text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 flex-shrink-0"></div>
                  {feature}
                </li>
              ))}
              {getTierFeatures(requiredTier).length > 3 && (
                <li className="text-sm text-gray-500 italic">
                  + {getTierFeatures(requiredTier).length - 3} more features
                </li>
              )}
            </ul>
          </div>
          
          {/* Current Plan Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-2">
              <span>Current plan:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTierBadgeColor(currentTier)}`}>
                {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}
              </span>
            </div>
          </div>
          
          {/* Action Button */}
          <button
            onClick={onUpgrade}
            className={`w-full bg-gradient-to-r ${getTierColor(requiredTier)} text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2`}
          >
            <span>Upgrade to {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          {/* Trust Indicators */}
          <div className="mt-4 text-xs text-gray-500">
            <div className="flex items-center justify-center gap-3">
              <span>🔒 Secure</span>
              <span>↩️ Cancel Anytime</span>
              <span>⚡ Instant Access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};