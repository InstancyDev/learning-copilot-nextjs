// components/common/SubscriptionModalHeader.tsx
import React from 'react';
import { X } from 'lucide-react';

interface SubscriptionModalHeaderProps {
  onClose: () => void;
}

export const SubscriptionModalHeader: React.FC<SubscriptionModalHeaderProps> = ({
  onClose
}) => {
  return (
    <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Upgrade Your Learning</h2>
        <p className="text-gray-600 mt-2">Choose the plan that's right for you and unlock premium features</p>
      </div>
      <button
        onClick={onClose}
        className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
        aria-label="Close modal"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};