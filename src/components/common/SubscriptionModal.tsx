// components/common/SubscriptionModal.tsx
import React, { useState } from 'react';
import { X, AlertCircle, RefreshCw } from 'lucide-react';
import { SubscriptionPlanCard } from '@/components/common/SubscriptionPlanCard';
import { SubscriptionComparison } from '@/components/common/SubscriptionComparison';
import { SubscriptionModalHeader } from '@/components/common/SubscriptionModalHeader';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (productId: string) => Promise<{ success: boolean; error?: string }>;
  onRestore: () => Promise<{ success: boolean; error?: string }>;
  userHasPaidPlan?: boolean;
  loading?: boolean;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onPurchase,
  onRestore,
  userHasPaidPlan = false,
  loading = false
}) => {
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePurchase = async () => {
    setPurchasing(true);
    setError(null);
    
    try {
      const result = await onPurchase('paid');
      if (result.success) {
        onClose();
      } else {
        setError(result.error || 'Purchase failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    setError(null);
    
    try {
      const result = await onRestore();
      if (result.success) {
        onClose();
      } else {
        setError(result.error || 'Restore failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Restore failed');
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <SubscriptionModalHeader onClose={onClose} />

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-red-700">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="p-6">
          {/* Subscription Plans */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Choose Your Plan
              </h2>
              <p className="text-gray-600">
                {userHasPaidPlan 
                  ? 'You currently have premium access to all features'
                  : 'Upgrade to premium for unlimited access to all courses and features'
                }
              </p>
            </div>

            <SubscriptionPlanCard
              userHasPaidPlan={userHasPaidPlan}
              isPurchasing={purchasing}
              onPurchase={handlePurchase}
              loading={loading}
            />
          </div> 

          {/* Restore Purchases */}
          <div className="mt-8 text-center border-t pt-6">
            <button
              onClick={handleRestore}
              disabled={restoring}
              className="text-blue-600 hover:text-blue-700 text-sm underline disabled:opacity-50 transition-colors"
            >
              {restoring ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Restoring...
                </span>
              ) : (
                'Restore Previous Purchases'
              )}
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Already purchased? Restore your subscription here
            </p>
          </div> 
        </div>
      </div>
    </div>
  );
};