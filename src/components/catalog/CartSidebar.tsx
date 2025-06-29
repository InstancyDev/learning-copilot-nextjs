// CartSidebar.tsx - Sliding cart panel
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ShoppingCart, 
  Trash2, 
  CreditCard, 
  Package,
  Loader2,
  AlertCircle,
  CheckCircle,
  Eye,
  BookOpen
} from 'lucide-react';
import type { CatalogItem, UserContext } from '@/types';
import { catalogMCPServer } from '@/mcp/catalog-server';
import { AlertSystem } from '@/components/common/AlertSystem';
import { useAlerts } from '@/components/common/useAlerts';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserContext;
  onItemRemoved?: (itemId: string) => void;
  onNavigate?: (page: string) => void; // Add navigation callback
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  onItemRemoved,
  onNavigate 
}) => {
  const [cartItems, setCartItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Auto-close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      // Don't prevent body scroll - allow background interaction
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Load cart items when sidebar opens
  useEffect(() => {
    if (isOpen) {
      loadCartItems();
    }
  }, [isOpen]);

  const loadCartItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await catalogMCPServer.callTool('get_cart_items', { limit: 50 }, user);
      setCartItems(items);
    } catch (error) {
      setError('Failed to load cart items');
      console.error('Failed to load cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    setRemovingItemId(itemId);
    try {
      const response = await catalogMCPServer.callTool('remove_from_cart', { itemId }, user);
      if (response.success) {
        setCartItems(prev => prev.filter(item => item.id !== itemId));
        onItemRemoved?.(itemId);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('Failed to remove item from cart');
      console.error('Failed to remove from cart:', error);
    } finally {
      setRemovingItemId(null);
    }
  };

  const goToCheckout = () => {
    // Close the sidebar first
    onClose();
    // Navigate to checkout or cart page
    // You can implement this based on your checkout flow
    console.log('Navigating to checkout...');
    // Example: onNavigate?.('checkout');
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price?.amount || 0), 0);

  if (!isOpen) return null;

  return (
    <>
      {/* Sidebar - No backdrop, just the sidebar itself */}
      <div 
        ref={sidebarRef}
        className={`fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col border-l border-gray-200 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Shopping Cart</h2>
            <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
              {cartItems.length}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2">Loading cart...</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Your cart is empty</p>
              <p className="text-sm text-gray-400 mt-1">Add some courses to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map(item => (
                <div key={item.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="flex gap-3">
                    <img 
                      src="https://ionicframework.com/docs/img/demos/thumbnail.svg"
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm line-clamp-2">{item.title}</h3>
                      <p className="text-xs text-gray-600 mt-1">{item.contentType}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-semibold text-blue-600">
                          ${item.price?.amount || 0}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          disabled={removingItemId === item.id}
                          className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                        >
                          {removingItemId === item.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t p-4 space-y-3 flex-shrink-0 bg-white">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total:</span>
              <span className="text-xl font-bold text-blue-600">${totalAmount}</span>
            </div>
            <button 
              onClick={goToCheckout}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
            >
              <CreditCard className="w-5 h-5" />
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// MyLearningSidebar.tsx - Sliding my learning panel
interface MyLearningSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserContext;
  onItemRemoved?: (itemId: string) => void;
  onNavigate?: (page: string) => void; // Add navigation callback
}

export const MyLearningSidebar: React.FC<MyLearningSidebarProps> = ({ 
  isOpen, 
  onClose, 
  user, 
  onItemRemoved,
  onNavigate 
}) => {
  const [learningItems, setLearningItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Auto-close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      // Don't prevent body scroll - allow background interaction
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      loadLearningItems();
    }
  }, [isOpen]);

  const loadLearningItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await catalogMCPServer.callTool('get_my_learning', { limit: 50 }, user);
      setLearningItems(items);
    } catch (error) {
      setError('Failed to load learning items');
      console.error('Failed to load learning items:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromLearning = async (itemId: string) => {
    setRemovingItemId(itemId);
    try {
      const response = await catalogMCPServer.callTool('remove_from_my_learning', { itemId }, user);
      if (response.success) {
        setLearningItems(prev => prev.filter(item => item.id !== itemId));
        onItemRemoved?.(itemId);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('Failed to remove item from learning');
      console.error('Failed to remove from learning:', error);
    } finally {
      setRemovingItemId(null);
    }
  };

  const viewContent = async (item: CatalogItem) => {
    try {
      // For learning items, try to get direct view URL or open in learning environment
      if (item.directViewUrl) {
        window.open(item.directViewUrl, '_blank');
      } else {
        // Generate learning environment URL
        const learningUrl = `https://learning-environment.example.com/${item.id}`;
        window.open(learningUrl, '_blank');
      }
    } catch (error) {
      console.error('Failed to view content:', error);
    }
  };

  const goToMyLearning = () => {
    // Close the sidebar first
    onClose();
    // Use the navigation callback to switch to My Learning component
    if (onNavigate) {
      onNavigate('my-learning');
    } else {
      // Fallback for standalone usage
      console.warn('Navigation callback not provided, using fallback navigation');
      window.location.href = '/my-learning';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Sidebar - No backdrop, just the sidebar itself */}
      <div 
        ref={sidebarRef}
        className={`fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col border-l border-gray-200 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold">My Learning</h2>
            <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
              {learningItems.length}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-green-600" />
              <span className="ml-2">Loading learning items...</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          ) : learningItems.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No learning items yet</p>
              <p className="text-sm text-gray-400 mt-1">Add courses to start learning!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {learningItems.map(item => (
                <div key={item.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                  <div className="flex gap-3">
                    <img 
                      src="https://ionicframework.com/docs/img/demos/thumbnail.svg"
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm line-clamp-2">{item.title}</h3>
                      <p className="text-xs text-gray-600 mt-1">{item.contentType}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => viewContent(item)}
                          className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </button>
                        <button
                          onClick={() => removeFromLearning(item.id)}
                          disabled={removingItemId === item.id}
                          className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                        >
                          {removingItemId === item.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {learningItems.length > 0 && (
          <div className="border-t p-4 space-y-3 flex-shrink-0 bg-white">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total Items:</span>
              <span className="text-xl font-bold text-green-600">{learningItems.length}</span>
            </div>
            <button 
              onClick={goToMyLearning}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              Go to My Learning
            </button>
          </div>
        )}
      </div>
    </>
  );
};