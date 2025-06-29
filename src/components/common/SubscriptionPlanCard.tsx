// components/common/SubscriptionPlanCard.tsx
import React from 'react';
import { Check, Crown, RefreshCw } from 'lucide-react';

interface SubscriptionPlanCardProps {
  userHasPaidPlan?: boolean;
  isPurchasing: boolean;
  onPurchase: () => void;
  loading?: boolean;
}

export const SubscriptionPlanCard: React.FC<SubscriptionPlanCardProps> = ({
  userHasPaidPlan = false,
  isPurchasing,
  onPurchase,
  loading = false
}) => {
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        'Limited course access',
        'Basic progress tracking',
        'Community support',
        'Basic certificates'
      ],
      isCurrentPlan: !userHasPaidPlan,
      gradient: 'from-gray-500 to-gray-700',
      icon: <Check className="w-5 h-5 text-gray-600" />
    },
    {
      id: 'paid',
      productId: 'paid',
      name: 'Paid',
      price: '$9.99',
      period: 'month',
      features: [
        'Unlimited course access',
        'Advanced learning features',
        'Priority email support',
        'Downloadable resources',
        'Professional certificates',
        'Progress analytics',
        'Mobile app access',
        'Ad-free experience'
      ],
      isCurrentPlan: userHasPaidPlan,
      gradient: 'from-blue-500 to-purple-500',
      icon: <Crown className="w-5 h-5 text-purple-600" />,
      isPopular: true
    }
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={`relative border-2 rounded-xl p-6 transition-all hover:shadow-lg ${
            plan.isPopular
              ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 scale-105'
              : 'border-gray-200 bg-white hover:border-gray-300'
          } ${plan.isCurrentPlan ? 'ring-2 ring-green-500 bg-green-50' : ''}`}
        >
          {/* Popular Badge */}
          {plan.isPopular && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                Most Popular
              </span>
            </div>
          )}
          
          {/* Current Plan Badge */}
          {plan.isCurrentPlan && (
            <div className="absolute -top-3 right-4">
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <Check className="w-3 h-3" />
                Current Plan
              </span>
            </div>
          )}

          {/* Plan Header */}
          <div className="text-center mb-6">
            <h4 className="text-xl font-bold text-gray-900 mb-2">
              {plan.name}
            </h4>
            
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {plan.price}
            </div>
            <div className="text-sm text-gray-500">
              per {plan.period}
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-3 mb-6">
            {plan.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-sm text-gray-700 leading-relaxed">{feature}</span>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <button
            onClick={() => plan.id === 'paid' && onPurchase()}
            disabled={plan.isCurrentPlan || (plan.id === 'paid' && (isPurchasing || loading))}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all transform hover:scale-105 disabled:transform-none ${
              plan.isCurrentPlan
                ? 'bg-green-100 text-green-800 cursor-not-allowed'
                : plan.id === 'free'
                ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
                : isPurchasing
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : `bg-gradient-to-r ${plan.gradient} text-white shadow-lg hover:shadow-xl`
            }`}
          >
            {plan.id === 'paid' && isPurchasing ? (
              <div className="flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Processing...
              </div>
            ) : plan.isCurrentPlan ? (
              <div className="flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                Current Plan
              </div>
            ) : plan.id === 'free' ? (
              'Free Plan'
            ) : (
              `Upgrade to ${plan.name}`
            )}
          </button>

          {/* Value Proposition */}
          {!plan.isCurrentPlan && plan.id === 'paid' && (
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500">
                Cancel anytime • 30-day money back guarantee
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};