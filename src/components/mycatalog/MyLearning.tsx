// MyLearning.tsx - Updated for MCP POST Integration with get_my_learning_objects_post

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Loader2,
  BookMarked,
  PlayCircle,
  PauseCircle,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  BookOpen,
  RotateCcw,
  Grid,
  List,
  Eye,
  Wifi,
  WifiOff
} from 'lucide-react';

import type { UserContext } from '@/types';
import type { 
  LearningItem, 
  LearningStats, 
  LearningTabType,
  LearningListResponse 
} from '@/types/Learning';

// Import unified components
import { UnifiedLearningCard } from '@/components/common/UnifiedLearningCard';
import { CommonFilters, FilterValues, FilterOptions } from '@/components/common/CommonFilters';
import { EnhancedModalContentView } from '@/components/common/EnhancedModalContentView';
import { ContentDetailModal } from '@/components/common/ContentDetailModal';
import { LearningStatsComponent } from '@/components/mycatalog/LearningStats';
import { DueDatesView } from '@/components/mycatalog/DueDatesView';

// Import AI Assistant components for AI Tutor functionality
import FlowiseFullPageAIAssistant from '@/components/ai-assistant/FlowiseFullPageAIAssistant';

// Import MCP-enabled learning service
import { LearningService } from '@/components/mycatalog/LearningService';
// Import MCP client (already initialized during login)
import { mcpClientService } from '@/services/McpClientService';
import { useSSO } from '@/services/SSOAuthService';

// Import API service for bot details
import { getCourseBotDetailsAPI } from "@/services/api.service";
import { API_CONFIG } from '@/config/api.config';

// Alert system for notifications
import { AlertSystem } from '@/components/common/AlertSystem';
import { useAlerts } from '@/components/common/useAlerts';

interface MyLearningProps {
  user: UserContext;
  onNavigate?: (page: string) => void;
}

const MyLearning: React.FC<MyLearningProps> = ({ user, onNavigate }) => {
  // Get MCP connection status
  const { mcpConnected, retryMcpConnection } = useSSO();
  
  const [activeTab, setActiveTab] = useState<LearningTabType>('all');
   const [categories, setCategories] = useState<string[]>([]);
  const [learningData, setLearningData] = useState<LearningListResponse | null>(null);
  const [allLearningData, setAllLearningData] = useState<LearningListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Updated filters using common filter interface
  const [filters, setFilters] = useState<FilterValues>({
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
  
  // Modal states
  const [selectedItem, setSelectedItem] = useState<LearningItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  
  // AI Tutor and Role Play preview states
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<any>(null);
  const [embeddedComponent, setEmbeddedComponent] = useState<React.ReactNode | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [botDetails, setBotDetails] = useState<any>(null);
  
  // Tab counts - calculated from ALL data, not filtered data
  const [tabCounts, setTabCounts] = useState<Record<LearningTabType, number>>({
    'all': 0,
    'due-dates': 0,
    'not-started': 0,
    'in-progress': 0,
    'registered': 0,
    'completed': 0,
    'pending-review': 0
  });

  // Alert system
  const { alerts, dismissAlert, showSuccess, showError, showInfo } = useAlerts();

  // Extract filter options from current filtered data
  const getFilterOptions = (): FilterOptions => {
    const items = learningData?.items || [];
    
    return {
      categories: categories,
      contentTypes: [...new Set(items.map(item => ({ 
        id: item.contentTypeId, 
        name: item.contentType 
      })))].filter((value, index, self) => 
        index === self.findIndex(t => t.id === value.id)
      ).sort((a, b) => a.name.localeCompare(b.name)),
      authors: [...new Set(items.map(item => item.author.name))].sort(),
      difficulties: [...new Set(items.map(item => item.difficulty))].sort(),
      tags: [...new Set(items.flatMap(item => item.tags || []))].sort(),
      statuses: [
        { value: 'not-started', label: 'Not Started', color: 'blue' },
        { value: 'in-progress', label: 'In Progress', color: 'yellow' },
        { value: 'completed', label: 'Completed', color: 'green' },
        { value: 'registered', label: 'Registered', color: 'purple' },
        { value: 'pending-review', label: 'Pending Review', color: 'orange' }
      ]
    };
  };

  // Calculate tab counts from ALL unfiltered data
  const calculateTabCounts = useCallback((allData: LearningListResponse | null): Record<LearningTabType, number> => {
    if (!allData?.items) {
      return {
        'all': 0,
        'due-dates': 0,
        'not-started': 0,
        'in-progress': 0,
        'registered': 0,
        'completed': 0,
        'pending-review': 0
      };
    }

    const items = allData.items;
    const now = new Date();
    
    // Calculate due dates count from items that have due dates
    const dueDateItems = items.filter(item => {
      const dueDate = item.nextDueDate || item.dueDate;
      if (!dueDate) return false;
      
      const dueDateObj = new Date(dueDate);
      const timeDiff = dueDateObj.getTime() - now.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      // Include overdue items AND items due within 30 days
      return timeDiff < 0 || daysDiff <= 30;
    });

    return {
      'all': items.length,
      'due-dates': dueDateItems.length,
      'not-started': items.filter(item => item.learningStatus === 'not attempted').length,
      'in-progress': items.filter(item => item.learningStatus === 'incomplete').length,
      'registered': items.filter(item => item.learningStatus === 'registered').length,
      'completed': items.filter(item => item.learningStatus === 'completed').length,
      'pending-review': items.filter(item => item.learningStatus === 'grade').length
    };
  }, []);

  // Load learning data with MCP POST integration
  const loadMyLearningData = useCallback(async (tab: LearningTabType = 'all', currentFilters: FilterValues = filters) => {
    if (!mcpConnected) {
      setError('MCP server not connected. Please retry connection.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Loading My Learning data via MCP POST method...', { tab, currentFilters });

      // Always load ALL data first to calculate accurate tab counts using POST method
      console.log('📊 Loading ALL learning data for tab counts...');
      const allDataResponse = await LearningService.getMyLearning(user, 'all', {});
      setAllLearningData(allDataResponse);
      
      // Calculate and set tab counts from all data
      const newTabCounts = calculateTabCounts(allDataResponse);
      setTabCounts(newTabCounts);
      console.log('✅ Tab counts calculated:', newTabCounts);
      
      // Now load filtered data for the current tab using POST method
      console.log('🎯 Loading filtered data for tab:', tab);
      const filteredResponse = await LearningService.getMyLearning(user, tab, currentFilters);
      setLearningData(filteredResponse);

      console.log('✅ My Learning data loaded successfully via POST method:', {
        allItems: allDataResponse.items.length,
        filteredItems: filteredResponse.items.length,
        tabCounts: newTabCounts,
        method: 'POST (get_my_learning_objects_post)'
      });
      
    } catch (error) {
      console.error('❌ Failed to load learning data via MCP POST method:', error);
      setError(error instanceof Error ? error.message : 'Failed to load learning data. Please try again.');
      
      // Show user-friendly error
      showError(
        'Failed to Load Learning Content',
        'Could not connect to the learning server via POST method. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [user, filters, calculateTabCounts, mcpConnected, showError]);

  // Load data on mount and when MCP connection changes
  useEffect(() => {
    if (mcpConnected) {
      console.log('🚀 MCP connected, loading My Learning data via POST method...');
      loadMyLearningData(activeTab, filters);
    } else {
      console.log('🔌 MCP disconnected, clearing data...');
      // Clear data when MCP disconnects
      setLearningData(null);
      setAllLearningData(null);
      setTabCounts({
        'all': 0,
        'due-dates': 0,
        'not-started': 0,
        'in-progress': 0,
        'registered': 0,
        'completed': 0,
        'pending-review': 0
      });
      setLoading(false);
    }
  }, [mcpConnected]); // Depend on MCP connection


   // Load categories from MCP when connected
    useEffect(() => {
      const loadCategories = async () => {
        if (!mcpConnected) return;
        
        try {
          console.log('Loading categories from MCP...');
          const response = await  mcpClientService.getCatalogCategories();
          console.log('Raw MCP categories response:', response);  
          
          setCategories(response);
        } catch (error) {
          console.error('Failed to load categories from MCP:', error);        
        }
      };
  
      loadCategories();
    }, [mcpConnected]);

  // Load data when tab changes
  useEffect(() => {
    if (mcpConnected) {
      console.log('📑 Tab changed to:', activeTab, '- reloading data via POST method...');
      loadMyLearningData(activeTab, filters);
    }
  }, [activeTab]); // Only depend on activeTab

  // Separate effect for filter changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!loading && mcpConnected) { // Don't apply filters during initial load or when disconnected
        console.log('🔧 Filters changed, reloading data via POST method...', filters);
        loadMyLearningData(activeTab, filters);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [filters]); // Only depend on filters

  const handleRefresh = async () => {
    if (!mcpConnected) {
      showError('MCP Disconnected', 'Cannot refresh while MCP server is disconnected');
      return;
    }

    setRefreshing(true);
    console.log('🔄 Manual refresh triggered - clearing cache and reloading via POST method...');
    
    // Clear cache before refreshing
    LearningService.clearCache();
    
    await loadMyLearningData(activeTab, filters);
    setRefreshing(false);
    
    showSuccess('Refreshed', 'Learning content has been refreshed via POST method');
  };

  // Handle MCP reconnection
  const handleRetryMcp = async () => {
    try {
      showInfo('Connecting...', 'Attempting to reconnect to MCP server');
      const success = await retryMcpConnection();
      
      if (success) {
        showSuccess('MCP Connected', 'Successfully reconnected to MCP server');
        console.log('🔗 MCP reconnected, reloading data via POST method...');
        // Reload learning data
        await loadMyLearningData(activeTab, filters);
      } else {
        showError('Connection Failed', 'Failed to reconnect to MCP server');
      }
    } catch (error) {
      showError('Connection Error', 'Error occurred while reconnecting to MCP');
    }
  };

  // Handle tab change
  const handleTabChange = (newTab: LearningTabType) => {
    console.log('📑 Changing tab from', activeTab, 'to', newTab);
    setActiveTab(newTab);
    // Clear status filter when changing tabs to avoid conflicts
    if (filters.status && newTab !== 'all') {
      setFilters(prev => ({ ...prev, status: '' }));
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterValues, value: any) => {
    console.log('🔧 Filter change:', key, value, '- will trigger POST method reload');
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleClearFilters = () => {
    console.log('🧹 Clearing all filters - will trigger POST method reload');
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

  // Handle learning actions with MCP integration
  const handleLearningAction = async (action: string, item: LearningItem) => {
    debugger;
    if (!mcpConnected) {
      showError('MCP Disconnected', 'Cannot perform action while MCP server is disconnected');
      return;
    }

    try {
      console.log('🎯 Learning action:', action, 'for item:', item.title, '- using MCP POST method context');

      switch (action) {
        case 'details':
          setSelectedItem(item);
          setShowDetailModal(true);
          break;

        case 'view-content':
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

        case 'start':
          console.log('🚀 Starting learning:', item.title, '- via MCP');
          const startResult = await LearningService.startLearning(item.id, user);
          
          if (startResult.success) {
            setSelectedItem(item);
            setShowContentModal(true);
            showSuccess('Learning Started', `Started "${item.title}"`);
            // Refresh data to show updated status via POST method
            await loadMyLearningData(activeTab, filters);
          } else {
            showError('Failed to Start', startResult.message);
          }
          break;

        case 'continue':
          console.log('▶️ Continuing learning:', item.title, '- via MCP');
          const continueResult = await LearningService.continueLearning(item.id, user);
          
          if (continueResult.success) {
            setSelectedItem(item);
            setShowContentModal(true);
            showSuccess('Continuing Learning', `Resumed "${item.title}"`);
          } else {
            showError('Failed to Continue', continueResult.message);
          }
          break;

        case 'review':
          console.log('👁️ Reviewing:', item.title);
          setSelectedItem(item);
          setShowContentModal(true);
          break;

        case 'menu':
          console.log('📋 Menu action for item:', item.id);
          break;

        default:
          console.log('❓ Unknown action:', action);
      }
    } catch (error) {
      console.error('❌ Learning action failed:', error);
      showError('Action Failed', 'Failed to perform action. Please try again.');
    }
  };

  const handleProgressUpdate = async (progress: number, timeSpent: number) => {
    if (selectedItem && mcpConnected) {
      try {
        console.log('📊 Updating progress via MCP:', { progress, timeSpent });
        
        const result = await LearningService.updateProgress(
          selectedItem.id, 
          progress, 
          user, 
          { timeSpent }
        );

        if (result.success) {
          // Refresh data to show updated progress via POST method
          await loadMyLearningData(activeTab, filters);
          showSuccess('Progress Updated', `Progress saved: ${progress}%`);
        } else {
          showError('Failed to Update Progress', result.message);
        }
      } catch (error) {
        console.error('❌ Failed to update progress:', error);
        showError('Progress Update Failed', 'Could not save progress. Please try again.');
      }
    }
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

  // Get due dates items with proper filtering
  const getDueDatesItems = (): LearningItem[] => {
    if (!allLearningData?.items) return [];
    
    const now = new Date();
    
    return allLearningData.items
      .filter(item => {
        const dueDate = item.nextDueDate || item.dueDate;
        return dueDate; // Only items with due dates
      })
      .map(item => {
        const dueDate = new Date(item.nextDueDate || item.dueDate!);
        const timeDiff = dueDate.getTime() - now.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        return {
          ...item,
          isOverdue: timeDiff < 0,
          daysToDue: daysDiff
        };
      })
      .sort((a, b) => {
        // Sort by urgency: overdue first, then by due date
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;
        
        const aDate = new Date(a.nextDueDate || a.dueDate!);
        const bDate = new Date(b.nextDueDate || b.dueDate!);
        return aDate.getTime() - bDate.getTime();
      });
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 overflow-y-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-gray-600">Loading your learning content...</p>
            {/*<p className="text-sm text-gray-400 mt-1">
              {mcpConnected ? 'Connected to MCP server (POST method)' : 'Connecting to MCP server...'}
            </p>*/}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !mcpConnected) {
    return (
      <div className="flex-1 bg-gray-50 overflow-y-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="mb-4">
              {mcpConnected ? (
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
              ) : (
                <WifiOff className="w-16 h-16 text-red-500 mx-auto" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {mcpConnected ? 'Error Loading Content' : 'MCP Server Disconnected'}
            </h3>
            <p className="text-gray-600 mb-4">
              {error || 'Cannot load learning content while MCP server is disconnected'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Using MCP POST method: get_my_learning_objects_post
            </p>
            <div className="space-x-3">
              <button
                onClick={() => mcpConnected ? loadMyLearningData(activeTab, filters) : handleRetryMcp()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {mcpConnected ? 'Try Again' : 'Reconnect to MCP'}
              </button>
              {mcpConnected && (
                <button
                  onClick={() => setError(null)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Alert System */}
      <AlertSystem alerts={alerts} onDismiss={dismissAlert} />
      
      <div className="flex-1 bg-gray-50 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">My Learning</h1>
                  {/* MCP Connection Status with POST method indicator 
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                    mcpConnected 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {mcpConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    {mcpConnected ? 'MCP Connected (POST)' : 'MCP Disconnected'}
                  </div>*/}
                </div>
                <p className="text-gray-600">
                  Track your learning progress and continue your journey
                </p>
                {/*<p className="text-xs text-gray-500 mt-1">
                  Using enhanced POST method: get_my_learning_objects_post
                </p>*/}
              </div>

              <div className="flex items-center gap-4">
               {/* <button
                  onClick={handleRefresh}
                  disabled={refreshing || !mcpConnected}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>

                {!mcpConnected && (
                  <button
                    onClick={handleRetryMcp}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Reconnect
                  </button>
                )}*/}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${
                      viewMode === 'grid' 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${
                      viewMode === 'list' 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            {allLearningData?.stats && (
              <div className="mb-6">
                <LearningStatsComponent stats={allLearningData.stats} />
              </div>
            )}

            {/* Common Filters */}
            <div className="mb-6">
              <CommonFilters
                filters={filters}
                filterOptions={getFilterOptions()}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters(!showFilters)}
                context="my-learning"
                searchPlaceholder="Search your learning content..."
              />
            </div>

            {/* Tabs with Fixed Counts */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
              {[
                { id: 'all', label: 'All', icon: BookOpen },
                { id: 'due-dates', label: 'Due Dates', icon: Clock },
                { id: 'not-started', label: 'Not Started', icon: PlayCircle },
                { id: 'in-progress', label: 'In Progress', icon: PauseCircle },
                { id: 'registered', label: 'Registered', icon: Calendar },
                { id: 'completed', label: 'Completed', icon: CheckCircle },
                { id: 'pending-review', label: 'Pending Review', icon: AlertCircle }
              ].map((tab) => {
                const IconComponent = tab.icon;
                const count = tabCounts[tab.id as LearningTabType];
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id as LearningTabType)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="font-medium">{tab.label}</span>
                    {count > 0 && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        activeTab === tab.id 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {count}
                      </span>
                    )}
                    {tab.id === 'due-dates' && (allLearningData?.stats?.overdue ?? 0) > 0 && (
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          {!learningData?.items || learningData.items.length === 0 ? (
            <div className="text-center py-12">
              <BookMarked className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No {activeTab === 'all' ? 'learning' : activeTab === 'due-dates' ? 'items with due dates' : activeTab.replace('-', ' ')} items found
              </h3>
              <p className="text-gray-600 mb-4">
                {filters.query 
                  ? `No items match your search "${filters.query}"`
                  : activeTab === 'all' 
                    ? "You don't have any learning items yet."
                    : activeTab === 'due-dates'
                      ? "No items have upcoming due dates."
                      : `You don't have any ${activeTab.replace('-', ' ')} learning items yet.`
                }
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Data loaded via POST method: get_my_learning_objects_post
              </p>
              {(activeTab === 'not-started' || activeTab === 'all') && !filters.query && (
                <button
                  onClick={() => onNavigate?.('catalog')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Learning Catalog
                </button>
              )}
              {!mcpConnected && (
                <div className="mt-4">
                  <button
                    onClick={handleRetryMcp}
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    Reconnect to MCP Server
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Results Summary */}
              <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
                <div>
                  Showing {learningData.items.length} learning items
                  {filters.query && (
                    <span className="ml-2">
                      for "<span className="font-medium">{filters.query}</span>"
                    </span>
                  )}
                  {/* MCP POST Status info */}
                  <span className="ml-4 text-xs text-gray-400">
                    (MCP POST: {mcpConnected ? 'Connected' : 'Disconnected'})
                  </span>
                </div>
                {learningData.items.length > 0 && (
                  <div className="text-gray-500">
                    Sorted by {filters.sortBy.replace('-', ' ')}
                  </div>
                )}
              </div>

              {/* Learning Items Grid/List or Due Dates View */}
              {activeTab === 'due-dates' ? (
                <DueDatesView 
                  items={getDueDatesItems()}
                  onAction={handleLearningAction}
                />
              ) : (
                <div className={`
                  ${viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                    : 'space-y-4'
                  }
                `}>
                  {learningData.items.map((item, index) => (
                    <UnifiedLearningCard
                      key={`learning-post-${item.id}-${index}`}
                      item={item}
                      viewMode={viewMode}
                      onAction={(action, unifiedItem) => {
                        handleLearningAction(action, unifiedItem as LearningItem);
                      }}
                      context="my-learning"
                      showDetailsButton={true}
                      hideFloatingButtons={true}
                    />
                  ))}
                </div>
              )}

              {/* Loading Indicator */}
              {refreshing && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Refreshing via POST method...</span>
                </div>
              )}

              {/* Load More / Pagination */}
              {learningData.hasMore && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => {
                      console.log('Load more items via POST method...');
                      // TODO: Implement pagination for POST method
                    }}
                    disabled={!mcpConnected}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                  >
                    Load More Items
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Content Modal with Hidden Header/Footer */}
      {selectedItem && (
        <>
          {/* Detail Modal */}
          <ContentDetailModal
            item={selectedItem}
            isOpen={showDetailModal}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedItem(null);
            }}

            onLaunch={(item) => {
              setShowDetailModal(false);
              setShowContentModal(true);
            }}
            context="my-learning"
          />

          {/* Content Viewing Modal */}
          <EnhancedModalContentView
            item={selectedItem}
            isOpen={showContentModal}
            onClose={() => {
              setShowContentModal(false);
              setSelectedItem(null);
            }}
            //onProgressUpdate={handleProgressUpdate}
            hideHeaderFooter={true}
            showCloseButton={true}
          />
        </>
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
    </>
  );
};

export default MyLearning;
