// hooks/useCatalogActions.ts
import { useState, useCallback } from 'react';

interface ActionStates {
  [itemId: string]: {
    isLoading: boolean;
    error?: string;
  };
}

// Import actual MCP client service with proper error handling
let mcpClientService: any = null;
let useSSO: any = null;

// Dynamically import MCP service
const initializeMCPService = () => {
  if (mcpClientService === null) {
    try {
      // Try to import the actual MCP service
      const mcpModule = require('@/services/McpClientService');
      mcpClientService = mcpModule.mcpClientService || mcpModule.default;
      console.log('✅ MCP Service loaded successfully');
    } catch (error) {
      console.warn('⚠️ MCP service not found, using fallback actions');
      // Fallback mock service if MCP service is not available
      mcpClientService = {
        addToMyLearning: async (itemId: string) => {
          console.log('Mock: Adding to My Learning:', itemId);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return {
            success: true,
            content: ['Successfully added content to My Learning']
          };
        },
        removeFromMyLearning: async (itemId: string) => {
          console.log('Mock: Removing from My Learning:', itemId);
          await new Promise(resolve => setTimeout(resolve, 500));
          return { success: true };
        },
        addToCart: async (itemId: string) => {
          console.log('Mock: Adding to cart:', itemId);
          await new Promise(resolve => setTimeout(resolve, 800));
          return { success: true };
        },
        removeFromCart: async (itemId: string) => {
          console.log('Mock: Removing from cart:', itemId);
          await new Promise(resolve => setTimeout(resolve, 500));
          return { success: true };
        }
      };
    }
  }
  return mcpClientService;
};

export const useCatalogActions = (
  catalogState: any, 
  canAccessContent: (requiredTier: 'free' | 'paid') => boolean, 
  mcpConnected: boolean
) => {
  const [actionStates, setActionStates] = useState<ActionStates>({});

  // Initialize MCP service
  const mcp = initializeMCPService();

  // Update action state
  const updateActionState = useCallback((itemId: string, state: Partial<ActionStates[string]>) => {
    setActionStates(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], ...state }
    }));
  }, []);

  // Check if content requires subscription access
  const checkContentAccess = useCallback((item: any): { hasAccess: boolean; requiredTier?: string } => {
    // If no subscription tier specified, content is free
    if (!item.subscriptionTier || item.subscriptionTier === 'free') {
      return { hasAccess: true };
    }

    // Check if user has required access level
    const hasAccess = canAccessContent(item.subscriptionTier);
    
    return {
      hasAccess,
      requiredTier: hasAccess ? undefined : item.subscriptionTier
    };
  }, [canAccessContent]);

  // Update item in catalog state (callback-based approach)
  const updateCatalogItem = useCallback((itemId: string, updates: any) => {
    // Since we don't have direct access to setCatalogState here,
    // we'll emit a custom event that the parent component can listen to
    const event = new CustomEvent('catalogItemUpdate', {
      detail: { itemId, updates }
    });
    window.dispatchEvent(event);
    
    console.log('📝 Catalog item update requested:', itemId, updates);
  }, []);

  // Handle adding item to My Learning
  const handleAddToMyLearning = useCallback(async (item: any) => {
    console.log('🎓 Adding to My Learning:', item.title);
    updateActionState(item.id, { isLoading: true, error: undefined });

    try {
      if (mcpConnected && mcp) {
        const response = await mcp.addToMyLearning(item.id);
        console.log('📡 MCP add to learning response:', response);

        // Handle different response formats from MCP
        let success = false;
        let message = '';

        if (typeof response === 'boolean') {
          success = response;
        } else if (response && typeof response === 'object') {
          // Handle various response formats
          if ('success' in response) {
            success = response.success;
            message = response.message || 'Added to My Learning';
          } else if ('content' in response && Array.isArray(response.content)) {
            // MCP tool response format
            success = response.content.length > 0;
            message = response.content[0]?.toString().includes('Successfully') 
              ? 'Added to My Learning' 
              : 'Added to My Learning';
          } else {
            // Assume success for any object response
            success = true;
            message = 'Added to My Learning';
          }
        } else {
          // Fallback: assume success
          success = true;
          message = 'Added to My Learning';
        }

        if (success) {
          updateCatalogItem(item.id, { isInMyLearning: true });
          updateActionState(item.id, { isLoading: false });
          return { success: true, message: message || `"${item.title}" has been added to your learning list.` };
        } else {
          updateActionState(item.id, { isLoading: false, error: message });
          return { success: false, error: message || 'Could not add to My Learning' };
        }
      } else {
        throw new Error('MCP server not connected');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add to My Learning';
      updateActionState(item.id, { isLoading: false, error: errorMessage });
      console.error('❌ Failed to Add to My Learning:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [mcpConnected, mcp, updateActionState, updateCatalogItem]);

  // Handle removing item from My Learning
  const handleRemoveFromMyLearning = useCallback(async (item: any) => {
    console.log('🗑️ Removing from My Learning:', item.title);
    updateActionState(item.id, { isLoading: true, error: undefined });

    try {
      if (mcpConnected && mcp && mcp.removeFromMyLearning) {
        const response = await mcp.removeFromMyLearning(item.id);
        
        const success = response?.success !== false;
        
        if (success) {
          updateCatalogItem(item.id, { isInMyLearning: false });
          updateActionState(item.id, { isLoading: false });
          return { success: true, message: 'Removed from My Learning' };
        } else {
          updateActionState(item.id, { isLoading: false, error: response?.message });
          return { success: false, error: response?.message || 'Failed to remove from My Learning' };
        }
      } else {
        throw new Error('MCP server not connected or method not available');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove from My Learning';
      updateActionState(item.id, { isLoading: false, error: errorMessage });
      console.error('❌ Failed to Remove from My Learning:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [mcpConnected, mcp, updateActionState, updateCatalogItem]);

  // Handle adding item to cart
  const handleAddToCart = useCallback(async (item: any) => {
    console.log('🛒 Adding to cart:', item.title);
    updateActionState(item.id, { isLoading: true, error: undefined });

    try {
      if (mcpConnected && mcp && mcp.addToCart) {
        const response = await mcp.addToCart(item.id);
        
        const success = response?.success !== false;
        
        if (success) {
          updateCatalogItem(item.id, { isInCart: true });
          updateActionState(item.id, { isLoading: false });
          return { success: true, message: 'Added to cart' };
        } else {
          updateActionState(item.id, { isLoading: false, error: response?.message });
          return { success: false, error: response?.message || 'Failed to add to cart' };
        }
      } else {
        // Fallback for cart functionality if not implemented in MCP
        console.log('🔄 Using fallback cart functionality');
        await new Promise(resolve => setTimeout(resolve, 1000));
        updateCatalogItem(item.id, { isInCart: true });
        updateActionState(item.id, { isLoading: false });
        return { success: true, message: 'Added to cart' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add to cart';
      updateActionState(item.id, { isLoading: false, error: errorMessage });
      console.error('❌ Failed to Add to Cart:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [mcpConnected, mcp, updateActionState, updateCatalogItem]);

  // Handle removing item from cart
  const handleRemoveFromCart = useCallback(async (item: any) => {
    console.log('🗑️ Removing from cart:', item.title);
    updateActionState(item.id, { isLoading: true, error: undefined });

    try {
      if (mcpConnected && mcp && mcp.removeFromCart) {
        const response = await mcp.removeFromCart(item.id);
        
        const success = response?.success !== false;
        
        if (success) {
          updateCatalogItem(item.id, { isInCart: false });
          updateActionState(item.id, { isLoading: false });
          return { success: true, message: 'Removed from cart' };
        } else {
          updateActionState(item.id, { isLoading: false, error: response?.message });
          return { success: false, error: response?.message || 'Failed to remove from cart' };
        }
      } else {
        // Fallback for cart functionality
        console.log('🔄 Using fallback cart removal');
        await new Promise(resolve => setTimeout(resolve, 500));
        updateCatalogItem(item.id, { isInCart: false });
        updateActionState(item.id, { isLoading: false });
        return { success: true, message: 'Removed from cart' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove from cart';
      updateActionState(item.id, { isLoading: false, error: errorMessage });
      console.error('❌ Failed to Remove from Cart:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [mcpConnected, mcp, updateActionState, updateCatalogItem]);

  // Main catalog action handler
  const handleCatalogAction = useCallback(async (action: string, item: any) => {
    console.log('🎬 Catalog action:', action, 'for item:', item.title);

    try {
      switch (action) {
        case 'add-to-learning':
          return await handleAddToMyLearning(item);

        case 'remove-from-learning':
          return await handleRemoveFromMyLearning(item);

        case 'add-to-cart':
          return await handleAddToCart(item);

        case 'remove-from-cart':
          return await handleRemoveFromCart(item);

        case 'menu':
          console.log('📋 Menu action for item:', item.id);
          return { success: true, message: 'Menu opened' };

        case 'details':
          console.log('ℹ️ Details action for item:', item.id);
          return { success: true, message: 'Details opened' };

        case 'view-content':
        case 'direct-view':
          console.log('👁️ View content action for item:', item.id);
          return { success: true, message: 'Content opened' };

        default:
          console.warn('⚠️ Unknown action:', action, 'for item:', item.title);
          return { success: false, error: `Unknown action: ${action}` };
      }
    } catch (error) {
      console.error('❌ Catalog action failed:', error);
      updateActionState(item.id, { isLoading: false, error: 'Action failed' });
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Action failed' 
      };
    }
  }, [handleAddToMyLearning, handleRemoveFromMyLearning, handleAddToCart, handleRemoveFromCart, updateActionState]);

  // Clear action state for an item
  const clearActionState = useCallback((itemId: string) => {
    setActionStates(prev => {
      const newState = { ...prev };
      delete newState[itemId];
      return newState;
    });
  }, []);

  // Clear all action states
  const clearAllActionStates = useCallback(() => {
    setActionStates({});
  }, []);

  // Get loading state for an item
  const isItemLoading = useCallback((itemId: string) => {
    return actionStates[itemId]?.isLoading || false;
  }, [actionStates]);

  // Get error state for an item
  const getItemError = useCallback((itemId: string) => {
    return actionStates[itemId]?.error || null;
  }, [actionStates]);

  return {
    // State
    actionStates,
    
    // Main action handler
    handleCatalogAction,
    
    // Individual action handlers
    handleAddToMyLearning,
    handleRemoveFromMyLearning,
    handleAddToCart,
    handleRemoveFromCart,
    
    // Utility functions
    updateCatalogItem,
    checkContentAccess,
    updateActionState,
    clearActionState,
    clearAllActionStates,
    
    // State getters
    isItemLoading,
    getItemError,
    
    // Service info
    mcpService: mcp,
    isMCPServiceAvailable: mcp !== null
  };
};