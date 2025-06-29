// components/layout/EnterpriseLayout.tsx - Updated with MCP status and retry mechanism

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Bot,
  BookOpen,
  Book,
  Users,
  Settings,
  BarChart3,
  Edit,
  Award,
  Calendar,
  Bell,
  HelpCircle,
  MessageSquare,
  ChevronLeft,
  Search,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  FileText,
  PieChart,
  Sparkles,
  Shield,
  Loader2,
  AlertCircle,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

import type { UserContext } from '@/types';
import { roleUtils, userUtils } from '@/utils/auth';
import { getBotDetails } from '@/services/api.service';

// Import your existing components - Updated imports
import CatalogListing from '@/components/catalog/CatalogListing';
// Alternative import if you're using the index.ts file:
// import { CatalogListing } from '@/components/catalog';

import MyLearning from '@/components/mycatalog/MyLearning';
  import CoCreateContentList from '@/components/cocreate/CoCreateContentList'; 
import FlowiseFullPageAIAssistant from '@/components/ai-assistant/FlowiseFullPageAIAssistant';
import { API_CONFIG } from '@/config/api.config';
import TavusStreamingAvatar from '@/components/TavusStreamingAvatar';
import { TavusPersonaConfig, SimpleTavusPersonaConfig } from '@/types/tavus';

const simplePersonaConfig: TavusPersonaConfig = {
  persona_name: 'Advanced Life Coach',
  system_prompt: 'You are a dedicated life coach who specializes in helping people achieve their goals and overcome obstacles.',
  pipeline_mode: 'full',
  context: 'You have experience in goal setting, motivation, and personal development.',
  default_replica_id: process.env.NEXT_PUBLIC_TAVUS_REPLICA_ID, // Make sure this is passed
};

// Simple navigation configuration
const navigationConfig = {
  navigation: {
    brand: {
      name: "Learning Portal",
      version: "v2.0"
    },
    menuItems: [
      {
        id: "ai-agent",
        title: "AI Assistant",
        icon: "bot",
        type: "embedded" as const,
        component: "AIAssistant" as const,
        embeddedConfig: {
          url: "https://your-flowise-instance.com/chatflow/your-chatflow-id",
          showHeader: false
        },
        requiredRoles: ["Learner", "Author", "Admin", "Site Admin"],
        description: "Get instant help with AI-powered assistance",
        requiresMcp: false // AI Agent doesn't require MCP
      },
      {
        id: "catalog",
        title: "Learning Catalog",
        icon: "bookOpen",
        type: "component" as const,
        component: "CatalogListing",
        requiredRoles: ["Learner", "Author", "Admin", "Site Admin"],
        description: "Browse and discover learning content",
        requiresMcp: true // Catalog requires MCP
      },
      {
        id: "my-learning",
        title: "My Learning",
        icon: "book",
        type: "component" as const,
        component: "MyLearning",
        requiredRoles: ["Learner", "Author", "Admin", "Site Admin"],
        description: "Track your learning progress and continue courses",
        requiresMcp: true // My Learning requires MCP
      },
      {
        id: "co-create",
        title: "Co-Create Knowledge",
        icon: "sparkles",
        type: "component" as const,
        component: "CoCreate",
        requiredRoles: ["Learner", "Author", "Admin", "Site Admin"],
        description: "Collaborate on content creation with AI",
        requiresMcp: true // Co-Create requires MCP
      }
    ] as NavigationItem[]
  }
};

// Icon mapping
const iconMap = {
  bot: Bot,
  bookOpen: BookOpen,
  book: Book,
  users: Users,
  settings: Settings,
  barChart3: BarChart3,
  edit: Edit,
  award: Award,
  calendar: Calendar,
  bell: Bell,
  helpCircle: HelpCircle,
  messageSquare: MessageSquare,
  fileText: FileText,
  pieChart: PieChart,
  sparkles: Sparkles,
  shield: Shield
};

interface NavigationItem {
  id: string;
  title: string;
  icon: string;
  type: 'component' | 'embedded';
  component?: string;
  embeddedConfig?: {
    url: string;
    showHeader: boolean;
    type?: 'flowise'; // Added type for embedded content
  };
  requiredRoles: string[];
  description: string;
  requiresMcp?: boolean;
}

interface EnterpriseLayoutProps {
  user: UserContext;
  onLogout: () => void;
  initialView?: string;
  // Add MCP-related props
  mcpConnected?: boolean;
  mcpInitializing?: boolean;
  mcpError?: string | null;
  onRetryMcp?: () => Promise<boolean>;
}

export const EnterpriseLayout: React.FC<EnterpriseLayoutProps> = ({ 
  user, 
  onLogout,
  initialView = 'ai-agent',
  mcpConnected = false,
  mcpInitializing = false,
  mcpError = null,
  onRetryMcp
}) => {
  const [activeMenuItem, setActiveMenuItem] = useState<string>(initialView);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMcpDetails, setShowMcpDetails] = useState(false);
  const [mcpRetrying, setMcpRetrying] = useState(false);
  const [mcpRetrySuccess, setMcpRetrySuccess] = useState<boolean | null>(null);

  // --- AI Assistant Integration ---
  const [botDetails, setBotDetails] = useState<any>(null);
  const [botLoading, setBotLoading] = useState(true);

  useEffect(() => {
    const fetchBotDetails = async () => {
      setBotLoading(true);
      try {
        const data = await getBotDetails(user.SiteID);
        setBotDetails(data);
      } catch (err) {
        setBotDetails(null);
      } finally {
        setBotLoading(false);
      }
    };
    fetchBotDetails();
  }, [user.SiteID]);

  // Map userContext for AIAssistant
  const userContextForAI = {
    jwtToken: user.JwtToken,
    email: user.EmailAddress,
    clientUrl: API_CONFIG.LearnerURL,
    siteId: user.SiteID,
    userId: user.UserID,
    orgUnitId: user.OrgUnitID,
    locale: user.Language,
    webAPIUrl: API_CONFIG.WebAPIURL, // Fill in if you have a value
    sessionId: user.SessionID,
  };

  // Set your Flowise API host
  const apiHost = API_CONFIG.AIAgentURL; // Replace with your actual API host

  // Filter navigation items based on user roles using your existing roleUtils
  const filteredMenuItems = useMemo(() => {
    return navigationConfig.navigation.menuItems.filter(item => 
      roleUtils.hasRole(user.UserRoles, item.requiredRoles)
    );
  }, [user.UserRoles]);

  // Check if current active item requires MCP
  const activeItemRequiresMcp = useMemo(() => {
    const activeItem = filteredMenuItems.find(item => item.id === activeMenuItem);
    return activeItem?.requiresMcp || false;
  }, [activeMenuItem, filteredMenuItems]);

  // Handle menu item click with MCP check
  const handleMenuClick = (item: NavigationItem) => {
    // Check if item requires MCP and MCP is not connected
    if (item.requiresMcp && !mcpConnected) {
      setShowMcpDetails(true);
      return;
    }

    setActiveMenuItem(item.id);
    setLoading(true);

    // Simulate loading
    setTimeout(() => setLoading(false), 200);
  };

  // Handle MCP retry
  const handleMcpRetry = async () => {
    if (!onRetryMcp) return;

    setMcpRetrying(true);
    setMcpRetrySuccess(null);

    try {
      const success = await onRetryMcp();
      setMcpRetrySuccess(success);

      if (success) {
        setShowMcpDetails(false);
        // If we were trying to access an MCP-dependent feature, navigate to it now
        const activeItem = filteredMenuItems.find(item => item.id === activeMenuItem);
        if (activeItem?.requiresMcp) {
          setLoading(true);
          setTimeout(() => setLoading(false), 200);
        }
      }
    } catch (error) {
      console.error('MCP retry failed:', error);
      setMcpRetrySuccess(false);
    } finally {
      setMcpRetrying(false);

      // Clear success/failure message after 3 seconds
      setTimeout(() => setMcpRetrySuccess(null), 3000);
    }
  };

  // Get icon component
  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent || BookOpen;
  };

  // Render menu item with MCP status indication
  const renderMenuItem = (item: NavigationItem) => {
    const IconComponent = getIcon(item.icon);
    const isActive = activeMenuItem === item.id;
    const requiresMcp = item.requiresMcp || false;
    const isDisabled = requiresMcp && !mcpConnected;

    return (
      <div key={item.id} className="relative">
        <button
          onClick={() => handleMenuClick(item)}
          disabled={isDisabled}
          className={`
            w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-all duration-200 relative
            ${isActive
              ? 'bg-blue-600 text-white shadow-md'
              : isDisabled
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }
            ${sidebarCollapsed ? 'justify-center px-2' : ''}
          `}
          title={sidebarCollapsed ? item.title : ''}
        >
          <IconComponent className="w-5 h-5 flex-shrink-0" />

          {!sidebarCollapsed && (
            <>
              <span className="flex-1 truncate">{item.title}</span>

              {/* MCP requirement indicator */}
              {requiresMcp && (
                <div className={`flex-shrink-0 ${isActive ? 'text-blue-200' : 'text-gray-400'}`}>
                  {mcpConnected ? (
                    <Wifi className="w-3 h-3" />
                  ) : (
                    <WifiOff className="w-3 h-3" />
                  )}
                </div>
              )}
            </>
          )}
        </button>

        {/* MCP requirement tooltip for collapsed sidebar */}
        {sidebarCollapsed && requiresMcp && !mcpConnected && (
          <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap pointer-events-none">
            Requires MCP Connection
          </div>
        )}
      </div>
    );
  };

  // Render MCP status component
  const renderMcpStatus = () => {
    if (sidebarCollapsed) return null;

    return (
      <div className="px-4 pb-4">
        <div className={`
          bg-gray-50 rounded-lg p-3 border-l-4 transition-colors
          ${mcpConnected
            ? 'border-green-500'
            : mcpInitializing
              ? 'border-yellow-500'
              : 'border-red-500'
          }
        `}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {mcpInitializing ? (
                <Loader2 className="w-4 h-4 animate-spin text-yellow-600" />
              ) : mcpConnected ? (
                <Wifi className="w-4 h-4 text-green-600" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-600" />
              )}

              <span className={`text-sm font-medium ${mcpConnected ? 'text-green-800' :
                  mcpInitializing ? 'text-yellow-800' : 'text-red-800'
                }`}>
                MCP Server
              </span>
            </div>

            <button
              onClick={() => setShowMcpDetails(!showMcpDetails)}
              className="text-gray-500 hover:text-gray-700"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${showMcpDetails ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className={`text-xs ${mcpConnected ? 'text-green-700' :
              mcpInitializing ? 'text-yellow-700' : 'text-red-700'
            }`}>
            {mcpInitializing ? 'Connecting...' :
              mcpConnected ? 'Connected' : 'Disconnected'}
          </div>

          {/* Detailed MCP status */}
          {showMcpDetails && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              {mcpError && (
                <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-3 h-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-yellow-800">Connection Issue</div>
                      <div className="text-yellow-700 mt-1">{mcpError}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Features that require MCP */}
              <div className="mb-3">
                <div className="text-xs font-medium text-gray-700 mb-1">MCP-Dependent Features:</div>
                <div className="space-y-1">
                  {filteredMenuItems
                    .filter(item => item.requiresMcp)
                    .map(item => (
                      <div key={item.id} className="flex items-center gap-2 text-xs">
                        {getIcon(item.icon)({ className: "w-3 h-3" })}
                        <span className={mcpConnected ? 'text-green-700' : 'text-red-700'}>
                          {item.title}
                        </span>
                        {mcpConnected ? (
                          <CheckCircle className="w-3 h-3 text-green-600" />
                        ) : (
                          <X className="w-3 h-3 text-red-600" />
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* Retry button */}
              {!mcpConnected && !mcpInitializing && onRetryMcp && (
                <button
                  onClick={handleMcpRetry}
                  disabled={mcpRetrying}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded text-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {mcpRetrying ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3" />
                  )}
                  {mcpRetrying ? 'Connecting...' : 'Retry Connection'}
                </button>
              )}

              {/* Retry result */}
              {mcpRetrySuccess !== null && (
                <div className={`mt-2 p-2 rounded text-xs flex items-center gap-2 ${mcpRetrySuccess
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                  }`}>
                  {mcpRetrySuccess ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <X className="w-3 h-3" />
                  )}
                  {mcpRetrySuccess ? 'Connection successful!' : 'Connection failed'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Component renderer helper function
  const renderComponent = (component: string) => {
    switch (component) {
      case 'CatalogListing':
        return (
          <CatalogListing
            user={user}
            onNavigate={setActiveMenuItem}
          />
        );

      case 'MyLearning':
        return (
          <MyLearning
            user={user}
            onNavigate={setActiveMenuItem}
          />
        );

      case 'CoCreate':
        return (
          <CoCreateContentList
            user={user}
            onNavigate={setActiveMenuItem}
          />
        );

      default:
        return null;
    }
  };

  // Render active content with MCP check
  const renderActiveContent = () => {
    const activeItem = filteredMenuItems.find(item => item.id === activeMenuItem);   

    if (!activeItem) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">Content Not Found</h3>
            <p className="text-gray-600">The requested content could not be loaded.</p>
          </div>
        </div>
      );
    }

    // Check if feature requires MCP but MCP is not connected
    if (activeItem.requiresMcp && !mcpConnected) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <WifiOff className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">MCP Connection Required</h3>
            <p className="text-gray-600 mb-6">
              "{activeItem.title}" requires an active MCP server connection to function properly.
            </p>

            {mcpError && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="text-left">
                    <h4 className="text-sm font-medium text-yellow-800">Connection Error</h4>
                    <p className="text-sm text-yellow-700 mt-1">{mcpError}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {onRetryMcp && (
                <button
                  onClick={handleMcpRetry}
                  disabled={mcpRetrying || mcpInitializing}
                  className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {mcpRetrying || mcpInitializing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {mcpRetrying ? 'Connecting...' : mcpInitializing ? 'Initializing...' : 'Retry MCP Connection'}
                </button>
              )}

              <button
                onClick={() => setActiveMenuItem('ai-agent')}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Go to AI Assistant (No MCP Required)
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading {activeItem.title}...</p>
          </div>
        </div>
      );
    }
    // Handle component-based content using the new helper function
    if (activeItem.component) {
      const componentToRender = renderComponent(activeItem.component);
      if (componentToRender) {
        return componentToRender;
      }
    }

    // Handle component-based content - FIXED: Remove overflow-y-auto from wrapper
    switch (activeItem.component) {
      case 'AIAssistant':
        return (
          <div className="h-full w-full flex flex-col">
            {/* <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
              <h1 className="text-2xl font-bold text-gray-900">{activeItem.title}</h1>
              <p className="text-gray-600">{activeItem.description}</p>
            </div> */}
            <div className="flex-1 min-h-0 relative">
              <div className="absolute inset-0">
                <FlowiseFullPageAIAssistant
                  BotDetails={botDetails}
                  userContext={userContextForAI}
                  welcomeMessage="Welcome to the AI Assistant!"
                  starterPrompts={["How can I help you today?"]}
                  userAvatarImage={API_CONFIG.LearnerURL.replace('http://', 'https://') + user.Picture}
                  apiHost={apiHost}
                />
              </div>
            </div>
          </div>
        );

      case 'CatalogListing':
        return <CatalogListing user={user} onNavigate={setActiveMenuItem} />;
      
      case 'MyLearning':
        return <MyLearning user={user} onNavigate={setActiveMenuItem} />;
      
      case 'Communities':
        return (
          <div className="h-full overflow-y-auto">
            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Communities</h1>
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Communities Coming Soon</h3>
                <p className="text-gray-600">Connect and collaborate with your peers.</p>
              </div>
              
              {/* Add more content to test scrolling */}
              <div className="mt-8 space-y-4">
                {Array.from({ length: 10 }, (_, i) => (
                  <div key={i} className="bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-900">Community Feature {i + 1}</h4>
                    <p className="text-gray-600">This is a placeholder for community feature {i + 1}. More content will be added here.</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'LearningAnalytics':
        return (
          <div className="h-full overflow-y-auto">
            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Learning Analytics</h1>
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center mb-8">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
                <p className="text-gray-600">Detailed insights into your learning progress.</p>
              </div>
              
              {/* Add content to test scrolling */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 12 }, (_, i) => (
                  <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Analytics Widget {i + 1}</h4>
                    <div className="h-32 bg-gray-100 rounded mb-4 flex items-center justify-center">
                      <BarChart3 className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600">Sample analytics data visualization placeholder.</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'ContentCreation':
        return (
          <div className="h-full overflow-y-auto">
            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Content Creation</h1>
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center mb-8">
                <Edit className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Amazing Content</h3>
                <p className="text-gray-600">Build engaging learning experiences.</p>
              </div>
              
              {/* Add form-like content to test scrolling */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Creation Tools</h3>
                <div className="space-y-6">
                  {Array.from({ length: 8 }, (_, i) => (
                    <div key={i} className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Creation Tool {i + 1}</h4>
                      <p className="text-gray-600 mb-4">Description of content creation tool {i + 1}.</p>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Use Tool
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'CoCreate':
        return <CoCreateContentList user={user} onNavigate={setActiveMenuItem} />;
      
      case 'Administration':
        return (
          <div className="h-full overflow-y-auto">
            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Administration</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <Users className="w-8 h-8 text-blue-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">User Management</h3>
                  <p className="text-gray-600">Manage users, roles, and permissions.</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <FileText className="w-8 h-8 text-green-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Content Management</h3>
                  <p className="text-gray-600">Manage learning content and resources.</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <Settings className="w-8 h-8 text-purple-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">System Settings</h3>
                  <p className="text-gray-600">Configure system-wide settings.</p>
                </div>
              </div>
              
              {/* Add more admin content to test scrolling */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                <div className="space-y-4">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-gray-900">System Component {i + 1}</span>
                      <span className="text-green-600 font-medium">Operational</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      
      default: {
        const IconComponent = getIcon(activeItem.icon);
        return (
          <div className="h-full overflow-y-auto">
            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">{activeItem.title}</h1>
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <IconComponent className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{activeItem.title}</h3>
                <p className="text-gray-600">{activeItem.description}</p>
              </div>
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className={`
        bg-white border-r border-gray-200 transition-all duration-300 flex flex-col flex-shrink-0
        ${sidebarCollapsed ? 'w-20' : 'w-80'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          {!sidebarCollapsed && (
            <div className="flex items-center justify-center w-150">
              <img
                src="/learning-app/assets/logo.png"
                alt="Logo"
                className="h-auto w-auto" style={{height: 70, alignItems: 'center'}}/>
            </div>
          )}

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        <div className="px-4 py-2"></div>

        {/* MCP Status Section 
        {renderMcpStatus()}*/}

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-2">
            {filteredMenuItems.map(item => renderMenuItem(item))}
          </nav>
        </div>

        {/* User Menu */}
        <div className="border-t border-gray-200 p-4 flex-shrink-0">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`
                w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors
                ${sidebarCollapsed ? 'justify-center' : ''}
              `}
              title={sidebarCollapsed ? userUtils.getDisplayName(user) : ''}
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-medium text-sm">
                  {userUtils.getInitials(user)}
                </span>
              </div>

              {!sidebarCollapsed && (
                <>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium text-gray-900 truncate">{userUtils.getDisplayName(user)}</p>
                    <p className="text-sm text-gray-500 truncate">{roleUtils.getHighestPriorityRole(user.UserRoles)}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${showUserMenu ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>

            {/* User Dropdown */}
            {showUserMenu && !sidebarCollapsed && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                {/* Profile button - commented out for now
                <button
                  onClick={() => {
                    console.log('Profile clicked');
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 text-sm"
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </button>
                */}
                
                {/* Settings button - commented out for now
                <button
                  onClick={() => {
                    console.log('Settings clicked');
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 text-sm"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
                */}
                
                {/* Divider - commented out since buttons above are commented
                <hr className="my-2" />
                */}
                <button
                  onClick={() => {
                    onLogout();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-100 text-red-600 text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Add the footer here */}
        <footer className="mt-4 px-4 pb-4">
          <p className="text-sm text-center font-semibold text-gray-500" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
            Built with <a href="https://bolt.new" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">Bolt.new</a>
          </p>
        </footer>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 overflow-auto">
          {renderActiveContent()}
        </main>
      </div>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  );
};