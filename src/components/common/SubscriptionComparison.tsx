// components/common/SubscriptionComparison.tsx
import React from 'react';
import { Check, X } from 'lucide-react';

interface ComparisonFeature {
  feature: string;
  free: string | boolean;
  basic: string | boolean;
  premium: string | boolean;
  enterprise: string | boolean;
}

export const SubscriptionComparison: React.FC = () => {
  const features: ComparisonFeature[] = [
    {
      feature: 'Course Access',
      free: '5 courses',
      basic: '50 courses',
      premium: 'Unlimited',
      enterprise: 'Unlimited'
    },
    {
      feature: 'Video Quality',
      free: '720p',
      basic: '1080p',
      premium: '4K',
      enterprise: '4K'
    },
    {
      feature: 'Offline Downloads',
      free: false,
      basic: true,
      premium: true,
      enterprise: true
    },
    {
      feature: 'Progress Analytics',
      free: 'Basic',
      basic: 'Basic',
      premium: 'Advanced',
      enterprise: 'Advanced + Custom'
    },
    {
      feature: 'Certificates',
      free: false,
      basic: 'Basic',
      premium: 'Professional',
      enterprise: 'Custom Branded'
    },
    {
      feature: 'Support',
      free: 'Community',
      basic: 'Email',
      premium: 'Priority Email',
      enterprise: 'Dedicated Manager'
    },
    {
      feature: 'Team Management',
      free: false,
      basic: false,
      premium: false,
      enterprise: true
    },
    {
      feature: 'API Access',
      free: false,
      basic: false,
      premium: false,
      enterprise: true
    },
    {
      feature: 'Custom Integrations',
      free: false,
      basic: false,
      premium: false,
      enterprise: true
    },
    {
      feature: 'White Label',
      free: false,
      basic: false,
      premium: false,
      enterprise: true
    },
    {
      feature: 'SLA Guarantee',
      free: false,
      basic: false,
      premium: false,
      enterprise: '99.9%'
    }
  ];

  const renderCell = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-green-600 mx-auto" />
      ) : (
        <X className="w-5 h-5 text-gray-400 mx-auto" />
      );
    }
    return <span className="text-sm">{value}</span>;
  };

  const getColumnHeaderClass = (tier: string) => {
    const baseClass = "text-center py-4 px-4 font-semibold";
    switch (tier) {
      case 'free':
        return `${baseClass} text-gray-700`;
      case 'paid':
        return `${baseClass} text-blue-700`;      
      default:
        return baseClass;
    }
  };

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold text-center mb-8">Compare All Plans</h3>
      
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden">
          <thead>
            <tr className="border-b-2 border-gray-200 bg-gray-50">
              <th className="text-left py-4 px-4 font-semibold text-gray-900">Features</th>
              <th className={getColumnHeaderClass('free')}>Free</th>
              <th className={getColumnHeaderClass('paid')}>Basic</th>
            </tr>
          </thead>
          <tbody>
            {features.map((row, index) => (
              <tr 
                key={index} 
                className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                }`}
              >
                <td className="py-4 px-4 font-medium text-gray-900">{row.feature}</td>
                <td className="py-4 px-4 text-center">{renderCell(row.free)}</td>
                <td className="py-4 px-4 text-center">{renderCell(row.basic)}</td>
                <td className="py-4 px-4 text-center bg-yellow-25">{renderCell(row.premium)}</td>
                <td className="py-4 px-4 text-center">{renderCell(row.enterprise)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-6">
        {['free', 'paid'].map((tier) => (
          <div key={tier} className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-center mb-4 capitalize">
              {tier} Plan
            </h4>
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <span className="text-sm font-medium text-gray-700">
                    {feature.feature}
                  </span>
                  <div className="flex items-center">
                    {renderCell(feature[tier as keyof ComparisonFeature] as string | boolean)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Feature Highlights */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 mb-2">99.9%</div>
          <div className="text-sm text-blue-800">Uptime Guarantee</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600 mb-2">24/7</div>
          <div className="text-sm text-green-800">Enterprise Support</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600 mb-2">API</div>
          <div className="text-sm text-purple-800">Full Integration Access</div>
        </div>
      </div>
    </div>
  );
};