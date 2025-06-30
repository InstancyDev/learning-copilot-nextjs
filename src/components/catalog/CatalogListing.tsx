// Updated CatalogListing.tsx - Main Component with Single Alert Prevention
'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Loader2, AlertCircle, WifiOff, Import } from 'lucide-react';

// Import types and services
import type { UserContext } from '@/types';
import type { CatalogItem } from '@/types/index';

// Import RevenueCat integration
import { useSubscription } from '@/hooks/useSubscription';
import { SubscriptionModal } from '@/components/common/SubscriptionModal';
import { ContentAccessGate } from '@/components/common/ContentAccessGate';
import { revenueCatService } from '@/services/RevenueCatService';
import { EnhancedModalContentView } from '@/components/common/EnhancedModalContentView'

// Import AI Assistant components for AI Tutor functionality
import FlowiseFullPageAIAssistant from '@/components/ai-assistant/FlowiseFullPageAIAssistant';

// Import API service for bot details
import { getCourseBotDetailsAPI } from "@/services/api.service";
import { API_CONFIG } from '@/config/api.config';

// Import sub-components
import { CatalogHeader } from './CatalogHeader';
import { CatalogFilters } from './CatalogFilters';
import { CommonFilters } from '@/components/common/CommonFilters';
import { CatalogGrid } from './CatalogGrid';
import { CatalogModals } from './CatalogModals';
import { CatalogSidebars } from './CatalogSidebars';
import { AlertSystem, useAlerts } from './CatalogAlerts';

// Import hooks and services
import { useCatalogData } from '@/hooks/useCatalogData';
import { useCatalogActions } from '@/hooks/useCatalogActions';

interface Category {
  CategoryID: string;
  CategoryName: string;
}

// Type definitions
interface FilterValues {
  query: string;
  category: string;
  contentTypeId: string;
  contentType: string;
  difficulty: string;
  author: string;
  rating: string;
  duration: string;
  status: string;
  tags: string[];
  sortBy: string;
  sortOrder: string;
}

interface CatalogListingProps {
  user: UserContext;
  onNavigate?: (page: string) => void;
}

const CatalogListing: React.FC<CatalogListingProps> = ({ user, onNavigate }) => {
  // RevenueCat subscription hook
  const {
    subscriptionStatus,
    offerings,
    accessLevel,
    loading: subscriptionLoading,
    error: subscriptionError,
    initialized: subscriptionInitialized,
    purchasePackage,
    restorePurchases,
    canAccessContent,
    getSubscriptionInfo,
    isSubscriptionExpiringSoon
  } = useSubscription();

  // Custom hooks for data and actions
  const {
    catalogState,
    setCatalogState,
    filters,
    setFilters,
    categories,
    contentTypes,
    currentPage,
    setCurrentPage,
    searchCatalog,
    mcpConnected,
    retryMcpConnection
  } = useCatalogData(user);

  const {
    actionStates,
    handleCatalogAction,
    checkContentAccess,
    isItemLoading,
    getItemError,
    clearActionState
  } = useCatalogActions(catalogState, canAccessContent, mcpConnected);

  // UI State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Sidebar states
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const [showMyLearningSidebar, setShowMyLearningSidebar] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [myLearningCount, setMyLearningCount] = useState(0);
  
  // Modal states
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  
  // AI Tutor and Role Play preview states
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<any>(null);
  const [embeddedComponent, setEmbeddedComponent] = useState<React.ReactNode | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [botDetails, setBotDetails] = useState<any>(null);
  
  // Alert system
  const { alerts, dismissAlert, showSuccess, showError, showInfo } = useAlerts();

  // Track if subscription expiration alert has been shown
  const expirationAlertShown = useRef(false);

  // Check if user has paid plan (simplified logic)
  const userHasPaidPlan = useMemo(() => {
    return Boolean(subscriptionStatus?.currentTier && 
                   subscriptionStatus.currentTier !== 'free' && 
                   subscriptionStatus.currentTier !== 'none');
  }, [subscriptionStatus]);

  // Update catalog item in state
  const updateCatalogItem = useCallback((itemId: string, updates: Partial<CatalogItem>) => {
    setCatalogState((prev: typeof catalogState) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    }));
  }, [setCatalogState, catalogState]);

  // Listen for catalog item updates from actions hook
  useEffect(() => {
    const handleCatalogItemUpdate = (event: CustomEvent) => {
      const { itemId, updates } = event.detail;
      updateCatalogItem(itemId, updates);
    };

    window.addEventListener('catalogItemUpdate', handleCatalogItemUpdate as EventListener);
    
    return () => {
      window.removeEventListener('catalogItemUpdate', handleCatalogItemUpdate as EventListener);
    };
  }, [updateCatalogItem]);

  // Initialize RevenueCat
  useEffect(() => {
    const initializeRevenueCat = async () => {
      try {
        await revenueCatService.initialize(
          process.env.NEXT_PUBLIC_REVENUECAT_API_KEY || 'mock-api-key',
          String(user.UserID)
        );
      } catch (error) {
        console.error('Failed to initialize RevenueCat:', error);
        showError('Subscription Service', 'Failed to initialize subscription service');
      }
    };

    if (user.UserID) {
      initializeRevenueCat();
    }
  }, [user.UserID, showError]);

  // Show subscription expiration warning (only once)
  useEffect(() => {
    if (subscriptionInitialized && 
        isSubscriptionExpiringSoon() && 
        !expirationAlertShown.current) {
      
      const info = getSubscriptionInfo();
      showInfo(
        'Subscription Expiring',
        `Your ${info.tier} subscription expires in ${info.daysUntilExpiration} days. Renew now to continue enjoying premium features.`
      );
      
      // Mark that we've shown the alert
      expirationAlertShown.current = true;
    }
  }, [subscriptionInitialized, isSubscriptionExpiringSoon, getSubscriptionInfo, showInfo]);

  // Reset expiration alert flag when subscription status changes significantly
  useEffect(() => {
    // Reset the flag if subscription becomes active or tier changes
    if (subscriptionStatus?.isActive && subscriptionStatus?.currentTier !== 'free') {
      expirationAlertShown.current = false;
    }
  }, [subscriptionStatus?.isActive, subscriptionStatus?.currentTier]);

  // Handle filter changes with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCatalog(filters, currentPage);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters, currentPage, searchCatalog]);

  // Handle subscription upgrade
  const handleUpgradeSubscription = () => {
    setShowSubscriptionModal(true);
  };

  // Handle subscription purchase (simplified for single premium plan)
  const handleSubscriptionPurchase = async (productId: string) => {
    try {      
      // For production, use the new purchaseProductById method
      const result = await revenueCatService.purchaseProductById(productId);
      
      if (result.success) {
        showSuccess(
          'Subscription Activated!', 
          'Welcome to premium! You now have unlimited access to all courses and features.'
        );
        return { success: true };
      } else {
        return { 
          success: false, 
          error: result.error || 'Purchase failed. Please try again.' 
        };
      }
    } catch (error) {
      console.error('Purchase error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Purchase failed. Please try again.' 
      };
    }
  };

  // Handle restore purchases
  const handleRestorePurchases = async () => {
    try {
      const result = await restorePurchases();
      
      if (result.success) {
        showSuccess(
          'Purchases Restored!', 
          'Your subscription has been successfully restored.'
        );
        return { success: true };
      } else {
        return { 
          success: false, 
          error: result.error || 'No previous purchases found' 
        };
      }
    } catch (error) {
      console.error('Restore error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Restore failed. Please try again.' 
      };
    }
  };

  async function createTavusConversation(replica_id: string) {
    try {
      const response = await fetch('https://tavusapi.com/v2/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_CONFIG.TAVUS_API_KEY,
        },
        body: JSON.stringify({ replica_id }),
      });

      let data = await response.json();

      if (data && data.message) {
        data = {
          "conversation_id": "",
          "conversation_name": "",
          "conversation_url": "",
          "status": "",
          "callback_url": "",
          "created_at": ""
        }
      }
  
      if (!response.ok) {
        data = {
          "conversation_id": "",
          "conversation_name": "",
          "conversation_url": "",
          "status": "",
          "callback_url": "",
          "created_at": ""
        }
      }
  
      sessionStorage.setItem('tavus_conversation', JSON.stringify(data)); 
      return data;
    } catch (error) {
      console.error('Tavus API error:', error);
      throw error;
    }
  }

  // Handle item actions with subscription gating and proper feedback
  const handleItemAction = async (action: string, item: CatalogItem) => {
    const accessCheck = checkContentAccess(item);
    
    if (!accessCheck.hasAccess && (action === 'view-content' || action === 'direct-view')) {
      showInfo(
        'Premium Content',
        `This content requires premium subscription. Please upgrade to access.`
      );
      setShowSubscriptionModal(true);
      return;
    }

    switch (action) {
      case 'details':
        setSelectedItem(item);
        setShowDetailModal(true);
        break;

      case 'view-content':
      case 'direct-view':
        // Check if it's AI Tutor or Role Play content and handle accordingly
        if (item.contentTypeId === 697) {
          // Tavus API call with error handling
          try {
            if(!sessionStorage.getItem('tavus_conversation')){
              await createTavusConversation('rb17cf590e15');
            }              
          } catch (err) {
            // Optionally show an error to the user here 
            console.log('Error creating Tavus conversation:', err); 
          }
          // AI Tutor content
          handlePreviewAITutorEnhanced(item);
        } else if (item.contentTypeId === 699) {
          // Role Play content
          const hostname = new URL(API_CONFIG.AdminURL).hostname;
          const userContextObject = {
            UserID: user?.UserID,
            FirstName: user?.FirstName,
            SiteID: user?.SiteID,
            JwtToken: user?.JwtToken,
            jsWebAPIUrl: API_CONFIG.WebAPIURL, 
            ClientURL: API_CONFIG.LearnerURL,
            EmailAddress: user?.EmailAddress,
            OrgUnitID: user?.OrgUnitID,
            Language: user?.Language,
            SessionID: user?.SessionID,
          };
          const key = "userContext_https://" + window.location.hostname;
          sessionStorage.setItem(key, JSON.stringify(userContextObject));
          // Tavus API call with error handling
          try {
            if(!sessionStorage.getItem('tavus_conversation')){
              await createTavusConversation('rb17cf590e15');
            }              
          } catch (err) {
            // Optionally show an error to the user here 
            console.log('Error creating Tavus conversation:', err); 
          }
          handlePreviewRolePlay(item);
        } else {
          // Default content modal
          setSelectedItem(item);
          setShowContentModal(true);
        }
        break;

      case 'upgrade-subscription':
        setShowSubscriptionModal(true);
        break;

      default:
        // Handle other actions through the actions hook
        try {
          const result = await handleCatalogAction(action, item);
          
          if (result.success) {
            if (action === 'add-to-learning') {
              setMyLearningCount(prev => prev + 1);
              showSuccess('Added to My Learning!', result.message || `"${item.title}" has been added to your learning list.`);
            } else if (action === 'add-to-cart') {
              setCartItemCount(prev => prev + 1);
              showSuccess('Added to Cart!', result.message || `"${item.title}" has been added to your cart.`);
            } else if (action === 'remove-from-learning') {
              setMyLearningCount(prev => Math.max(0, prev - 1));
              showInfo('Item Removed', result.message || 'Item has been removed from your learning list');
            } else if (action === 'remove-from-cart') {
              setCartItemCount(prev => Math.max(0, prev - 1));
              showInfo('Item Removed', result.message || 'Item has been removed from your cart');
            }
          } else {
            showError('Action Failed', result.error || 'Failed to perform action. Please try again.');
          }
        } catch (error) {
          showError('Action Failed', 'An unexpected error occurred. Please try again.');
        }
        break;
    }
  };

  // Handle item removal from sidebars
  const handleItemRemovedFromCart = (itemId: string) => {
    updateCatalogItem(itemId, { isInCart: false });
    setCartItemCount(prev => Math.max(0, prev - 1));
    showInfo('Item Removed', 'Item has been removed from your cart');
  };

  const handleItemRemovedFromLearning = (itemId: string) => {
    updateCatalogItem(itemId, { isInMyLearning: false });
    setMyLearningCount(prev => Math.max(0, prev - 1));
    showInfo('Item Removed', 'Item has been removed from your learning list');
  };

  // Handle AI Tutor preview with EnhancedModalContentView
  const handlePreviewAITutorEnhanced = async (item: any) => {
    setIsPreviewLoading(true);
    try {
      const hostname = new URL(API_CONFIG.AdminURL).hostname;
      const userContextObject = {
        UserID: user?.UserID,
        FirstName: user?.FirstName,
        SiteID: user?.SiteID,
        JwtToken: user?.JwtToken,
        jsWebAPIUrl: API_CONFIG.WebAPIURL, 
        ClientURL: API_CONFIG.LearnerURL,
        EmailAddress: user?.EmailAddress,
        OrgUnitID: user?.OrgUnitID,
        Language: user?.Language,
        SessionID: user?.SessionID,
      };
      const key = "userContext_https://" + window.location.hostname;
      sessionStorage.setItem(key, JSON.stringify(userContextObject));

      // Call the API to get bot details
      const botResponse = await getCourseBotDetailsAPI(item.id);
      setBotDetails(botResponse);

      sessionStorage.setItem('chatbotplay_userContext', JSON.stringify(botResponse));
      
      // Create the FlowiseFullPageAIAssistant component
       const aiTutorComponent = (
         <FlowiseFullPageAIAssistant
           BotDetails={botResponse}
           mode="ai-tutor"
           contentId={item.id.toLowerCase()}
           userContext={user}
           apiHost={API_CONFIG.AIAgentURL}
           userAvatarImage={API_CONFIG.LearnerURL.replace('http://', 'https://') + user.Picture}
         />
       );
    
       setEmbeddedComponent(aiTutorComponent);
       setPreviewItem(item);
       setPreviewUrl(null);
       setIsPreviewOpen(true);

      //const url = `${window.location.origin}/learning-app/chatbotplay/index.html?FolderPath=${item?.folderPath}&ContentID=${item?.id}&PreviewPath=lcms&version=401409`;
      //setPreviewUrl(url);
      //setPreviewItem(item);
      //setEmbeddedComponent(null);
      //setIsPreviewOpen(true);

    } catch (error) {
      console.error('Error fetching bot details:', error);
      showError('Preview Failed', 'Failed to load AI Tutor details. Please try again.');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Handle Role Play preview
  const handlePreviewRolePlay = (item: any) => {
    // Build the URL from item metadata or use a static one for testing
    const url = `${window.location.origin}/learning-app/roleplay/index.html?FolderPath=${item?.folderPath}&ContentID=${item?.id}&PreviewPath=lcms&version=401409`;
    setPreviewUrl(url);
    setPreviewItem(item);
    setEmbeddedComponent(null);
    setIsPreviewOpen(true);
  };

  // Loading state
  if (catalogState.loading && catalogState.items.length === 0) {
    return (
      <div className="flex-1 bg-gray-50 overflow-y-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />            
            <p className="text-gray-600">Fetching my learning content...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (catalogState.error) {
    return (
      <div className="flex-1 bg-gray-50 overflow-y-auto">
        <div className="text-center py-12">
          <div className="mb-4">
            {mcpConnected ? (
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
            ) : (
              <WifiOff className="w-16 h-16 text-red-500 mx-auto" />
            )}
          </div>
          <div className="text-red-600 mb-2">
            {mcpConnected ? 'Error loading catalog' : 'MCP Server Disconnected'}
          </div>
          <div className="text-gray-600 mb-4">{catalogState.error}</div>
          <div className="space-y-2">
            <button
              onClick={() => searchCatalog(filters, currentPage)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mr-2"
            >
              Try Again
            </button>
            {!mcpConnected && (
              <button
                onClick={retryMcpConnection}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Reconnect to MCP
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto">
      {/* Alert System */}
      <AlertSystem alerts={alerts} onDismiss={dismissAlert} />
      
      {/* Header */}
      <CatalogHeader
        mcpConnected={mcpConnected}
        subscriptionStatus={subscriptionStatus}
        subscriptionLoading={subscriptionLoading}
        accessLevel={accessLevel}
        getSubscriptionInfo={getSubscriptionInfo}
        onUpgradeSubscription={handleUpgradeSubscription}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        userHasPaidPlan={userHasPaidPlan}
      />

      {/* Filters */}
      <CatalogFilters
        filters={filters}
        categories={categories as Category[]}
        contentTypes={contentTypes}
        catalogItems={catalogState.items}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onFilterChange={(key, value) => {
          setFilters(prev => ({ ...prev, [key]: value }));
          setCurrentPage(1);
        }}
        onClearFilters={() => {
          setFilters({
            query: '',
            category: '',
            contentTypeId: '',
            contentType: '',
            difficulty: '',
            author: '',
            rating: '',
            duration: '',
            status: '',
            tags: [],
            sortBy: 'recent',
            sortOrder: 'desc'
          });
          setCurrentPage(1);
        }}
        catalogState={catalogState}
        accessLevel={accessLevel}
        checkContentAccess={checkContentAccess}
        onUpgradeSubscription={handleUpgradeSubscription}
      />

      {/* Content Grid */}
      <CatalogGrid
        catalogState={catalogState}
        viewMode={viewMode}
        accessLevel={accessLevel}
        checkContentAccess={checkContentAccess}
        onItemAction={handleItemAction}
        onUpgradeSubscription={handleUpgradeSubscription}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        mcpConnected={mcpConnected}
        onRetryMcp={retryMcpConnection}
        isItemLoading={false}
        getItemError={getItemError}
      />

      {/* Sidebars */}
      <CatalogSidebars
        user={user}
        showCartSidebar={showCartSidebar}
        onCloseCartSidebar={() => setShowCartSidebar(false)}
        showMyLearningSidebar={showMyLearningSidebar}
        onCloseMyLearningSidebar={() => setShowMyLearningSidebar(false)}
        onNavigate={onNavigate}
        onItemRemovedFromCart={handleItemRemovedFromCart}
        onItemRemovedFromLearning={handleItemRemovedFromLearning}
      />

      {/* Simplified Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onPurchase={handleSubscriptionPurchase}
        onRestore={handleRestorePurchases}
        userHasPaidPlan={userHasPaidPlan}
        loading={subscriptionLoading}
      />

      {/* Content Modals */}
      <CatalogModals
        selectedItem={selectedItem}
        showDetailModal={showDetailModal}
        showContentModal={showContentModal}
        onCloseDetailModal={() => {
          setShowDetailModal(false);
          setSelectedItem(null);
        }}
        onCloseContentModal={() => {
          setShowContentModal(false);
          setSelectedItem(null);
        }}
        onLaunchContent={(item) => {
          setShowDetailModal(false);
          setShowContentModal(true);
        }}
      />
      
      {selectedItem && (
        <EnhancedModalContentView
          item={selectedItem}
          isOpen={showContentModal}
          onClose={() => {
            setShowContentModal(false);
            setSelectedItem(null);
          }}
          hideHeaderFooter={true}
          showCloseButton={true}
        />
      )}

      {/* AI Tutor and Role Play Preview Modal */}
      {isPreviewOpen && previewItem && (previewUrl || embeddedComponent) && (
        <EnhancedModalContentView
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false);
            setPreviewUrl(null);
            setEmbeddedComponent(null);
          }}
          item={previewItem}
          previewUrl={previewUrl || undefined}
          embeddedComponent={embeddedComponent}
        />
      )}
    </div>
  );
};

export default CatalogListing;
