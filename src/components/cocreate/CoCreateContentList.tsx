'use client';

import React, { useState, useEffect } from 'react';
import { Search, Star, MoreVertical, FileText, Video, HelpCircle, BookOpen, Filter, Plus, X, Bot, Headphones, Link, Upload, Calendar, Users, Map, Zap, AlertCircle, RefreshCw, Edit, Trash2, Share2, Copy, Eye, Download, ChevronLeft, ChevronRight, Maximize2, Minimize2, ExternalLink } from 'lucide-react';
import type { UserContext } from '@/types'; 
import RoleplayDialog from './RoleplayDialog';
import { ApiService, CoCreateKnowledgebaseListParams, getSiteConfigValue, shareCoCreateKnowledgeBase, getCourseBotDetailsAPI } from "@/services/api.service";
import { API_CONFIG } from '@/config/api.config';
import AITutorCreationDialog from '@/components/ai-assistant/AITutorCreationDialog';
import FlowiseFullPageAIAssistant from '@/components/ai-assistant/FlowiseFullPageAIAssistant';
import { useAlerts } from '@/components/common/useAlerts';
import { EnhancedModalContentView } from '../common/EnhancedModalContentView';

interface KnowledgeItem {
  ContentID: string;
  ContentName: string;
  Title: string;
  AuthorDisplayName: string;
  ContentType: string;
  TotalRatings: string;
  ThumbnailImagePath: string;
  ShortDescription: string;
  CreatedOn: string;
  Tags: string;
  ContentSkills: Array<{
    CategoryID: number;
    CategoryName: string;
  }>;
  ViewLink: string;
  DetailsLink: string;
  ScoID: number;
  ContentTypeId: number;
  RatingID: string;
  FolderPath: string;
}

interface ContentType {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  onClick?: () => void;
}

interface PaginationInfo {
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

interface CoCreateContentProps {
  user: UserContext;
  onNavigate?: (view: string) => void;
}

const CoCreateContent: React.FC<CoCreateContentProps> = ({ user, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'shared' | 'my'>('shared');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFabExpanded, setIsFabExpanded] = useState(false);
  const [selectedContentType, setSelectedContentType] = useState<ContentType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRoleplayModalOpen, setIsRoleplayModalOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  
  // View and filter state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFilters, setSelectedFilters] = useState({
    contentType: '',
    skills: [] as string[],
    tags: [] as string[],
    rating: '',
    dateRange: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // API state management
  const [sharedKnowledge, setSharedKnowledge] = useState<KnowledgeItem[]>([]);
  const [myKnowledge, setMyKnowledge] = useState<KnowledgeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<{shared: Date | null, my: Date | null}>({
    shared: null,
    my: null
  });

  // Pagination state
  const [sharedPagination, setSharedPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalItems: 0,
    totalPages: 0
  });

  const [myPagination, setMyPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalItems: 0,
    totalPages: 0
  });

  // Add state for share modal
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareItem, setShareItem] = useState<any>(null);
  const [isShareLoading, setIsShareLoading] = useState(false);

  const { showSuccess, showError } = useAlerts();

  // Content creation options
  const contentTypes: ContentType[] = [
    {
      id: 'ai-tutor',
      name: 'AI Tutor',
      icon: <Bot className="w-5 h-5" />,
      color: 'bg-purple-500',
      description: 'Create an AI-powered tutoring session',
    },
    // {
    //   id: 'flashcards',
    //   name: 'Flashcards',
    //   icon: <BookOpen className="w-5 h-5" />,
    //   color: 'bg-blue-500',
    //   description: 'Create interactive flashcard sets'
    // },
    // {
    //   id: 'quiz',
    //   name: 'Quiz',
    //   icon: <HelpCircle className="w-5 h-5" />,
    //   color: 'bg-green-500',
    //   description: 'Build knowledge assessment quizzes'
    // },
    // {
    //   id: 'podcast',
    //   name: 'Podcast Episode',
    //   icon: <Headphones className="w-5 h-5" />,
    //   color: 'bg-orange-500',
    //   description: 'Record or upload podcast content'
    // },
    // {
    //   id: 'article',
    //   name: 'Article',
    //   icon: <FileText className="w-5 h-5" />,
    //   color: 'bg-indigo-500',
    //   description: 'Write informative articles'
    // },
    // {
    //   id: 'video',
    //   name: 'Video',
    //   icon: <Video className="w-5 h-5" />,
    //   color: 'bg-red-500',
    //   description: 'Upload or create video content'
    // },
    // {
    //   id: 'reference-link',
    //   name: 'Reference Link',
    //   icon: <Link className="w-5 h-5" />,
    //   color: 'bg-cyan-500',
    //   description: 'Share external resources'
    // },
    // {
    //   id: 'documents',
    //   name: 'Documents',
    //   icon: <Upload className="w-5 h-5" />,
    //   color: 'bg-gray-500',
    //   description: 'Upload documents and files'
    // },
    // {
    //   id: 'event',
    //   name: 'Event',
    //   icon: <Calendar className="w-5 h-5" />,
    //   color: 'bg-pink-500',
    //   description: 'Schedule learning events'
    // },
    {
      id: 'roleplay',
      name: 'Roleplay',
      icon: <Users className="w-5 h-5" />,
      color: 'bg-teal-500',
      description: 'Create interactive roleplay scenarios'
    }
    // {
    //   id: 'learning-path',
    //   name: 'Learning Path',
    //   icon: <Map className="w-5 h-5" />,
    //   color: 'bg-amber-500',
    //   description: 'Design structured learning journeys'
    // },
    // {
    //   id: 'microlearning',
    //   name: 'Microlearning',
    //   icon: <Zap className="w-5 h-5" />,
    //   color: 'bg-lime-500',
    //   description: 'Create bite-sized learning modules'
    // }
  ];

  // Available skills options
  const skillsOptions = [
    'Communication',
    'Leadership',
    'Problem Solving',
    'Customer Service',
    'Sales',
    'Negotiation',
    'Conflict Resolution',
    'Team Management',
    'Public Speaking',
    'Critical Thinking',
    'Decision Making',
    'Emotional Intelligence'
  ];

  // Available tags options
  const tagsOptions = [
    'Business',
    'Healthcare',
    'Education',
    'Technology',
    'Finance',
    'Retail',
    'Manufacturing',
    'Hospitality',
    'Government',
    'Non-profit',
    'Beginner',
    'Intermediate',
    'Advanced'
  ];

  // Content type filter options
  const contentTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'article', label: 'Article' },
    { value: 'video', label: 'Video' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'flashcards', label: 'Flashcards' },
    { value: 'microlearning', label: 'Microlearning' },
    { value: 'podcast', label: 'Podcast' },
    { value: 'roleplay', label: 'Roleplay' }
  ];

  // Rating filter options
  const ratingOptions = [
    { value: '', label: 'All Ratings' },
    { value: '4.5', label: '4.5+ Stars' },
    { value: '4.0', label: '4.0+ Stars' },
    { value: '3.5', label: '3.5+ Stars' },
    { value: '3.0', label: '3.0+ Stars' }
  ];

  // Date range filter options
  const dateRangeOptions = [
    { value: '', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  // Mock API functions - replace with actual API calls
  const fetchSharedKnowledge = async (page: number = 1, forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const params: CoCreateKnowledgebaseListParams = {
        userId: user.UserID,
        folderId: Number(getSiteConfigValue('CoCreateKnowledgeDefaultFolderID')) || 1403, // or dynamic if needed
        pageno: page,
        cmsGroupId: Number(getSiteConfigValue('CoCreateKnowledgeDefaultCMSGroupID')) || 80, //user.CMSGroupID,
        componentId: 328, // Shared Knowledge
      };
      const result = await ApiService.coCreate.getKnowledgebaseList(params);
      setSharedKnowledge(result?.CourseList || []);
      setSharedPagination({
        currentPage: page,
        totalItems: result?.CourseCount || 0,
        totalPages: result?.CourseCount ? Math.ceil(result.CourseCount / 10) : 0,
      });
      setLastFetch((prev) => ({ ...prev, shared: new Date() }));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch shared knowledge');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyKnowledge = async (page: number = 1, forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const params: CoCreateKnowledgebaseListParams = {
        userId: user.UserID,
        folderId: Number(getSiteConfigValue('CoCreateKnowledgeDefaultFolderID')) || 1403, // or dynamic if needed
        pageno: page,
        cmsGroupId: Number(getSiteConfigValue('CoCreateKnowledgeDefaultCMSGroupID')) || 80, //user.CMSGroupID,
        componentId: 0, // My Knowledge
      };
      const result = await ApiService.coCreate.getKnowledgebaseList(params);
      setMyKnowledge(result?.CourseList || []);
      setMyPagination({
        currentPage: page,
        totalItems: result?.CourseCount || 0,
        totalPages: result?.CourseCount ? Math.ceil(result.CourseCount / 10) : 0,
      });
      setLastFetch((prev) => ({ ...prev, my: new Date() }));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch my knowledge');
    } finally {
      setIsLoading(false);
    }
  };

  // On mount, fetch for the default tab
  useEffect(() => {
    if (activeTab === 'shared') {
      fetchSharedKnowledge(1);
    } else {
      fetchMyKnowledge(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When tab changes, fetch for the selected tab
  const handleTabChange = (tab: 'shared' | 'my') => {
    setActiveTab(tab);
    if (tab === 'shared') {
      fetchSharedKnowledge(1, true);
    } else {
      fetchMyKnowledge(1, true);
    }
  };

  // When paginating, fetch for the current tab
  const handlePageChange = (page: number) => {
    if (activeTab === 'shared') {
      fetchSharedKnowledge(page);
    } else {
      fetchMyKnowledge(page);
    }
  };

  // Get current pagination info
  const getCurrentPagination = (): PaginationInfo => {
    return activeTab === 'shared' ? sharedPagination : myPagination;
  };

  // Transform API data to display format
  const transformApiData = (apiData: KnowledgeItem[]) => {
    debugger;
    return apiData.map(item => ({
      id: item.ContentID,
      type: item.ContentType,
      title: item.ContentName || item.Title,
      author: item.AuthorDisplayName,
      rating: item.TotalRatings ? parseFloat(item.TotalRatings) || 0 : 0,
      totalRatings: item.RatingID ? parseInt(item.RatingID) || 0 : 0,
      thumbnail: API_CONFIG.LearnerURL.replace('http://', 'https://') + item.ThumbnailImagePath,
      description: item.ShortDescription,
      createdOn: item.CreatedOn,
      tags: item.Tags,
      skills: item.ContentSkills || [],
      viewLink: item.ViewLink,
      detailsLink: item.DetailsLink,
      scoId: item.ScoID,
      contentTypeId: item.ContentTypeId,
      folderPath: item.FolderPath
    }));
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'article':
        return <FileText className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'quiz':
        return <HelpCircle className="w-4 h-4" />;
      case 'flashcards':
        return <BookOpen className="w-4 h-4" />;
      case 'microlearning':
        return <Zap className="w-4 h-4" />;
      case 'podcast':
        return <Headphones className="w-4 h-4" />;
      case 'roleplay':
        return <Users className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'article':
        return 'bg-blue-100 text-blue-700';
      case 'video':
        return 'bg-red-100 text-red-700';
      case 'quiz':
        return 'bg-green-100 text-green-700';
      case 'flashcards':
        return 'bg-purple-100 text-purple-700';
      case 'microlearning':
        return 'bg-orange-100 text-orange-700';
      case 'podcast':
        return 'bg-pink-100 text-pink-700';
      case 'roleplay':
        return 'bg-teal-100 text-teal-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const renderStars = (rating: number) => {
    const numericRating = Math.min(Math.max(rating, 0), 5);
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= numericRating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // Fixed Thumbnail Component
  const FixedThumbnail: React.FC<{ 
    src: string | null; 
    alt: string; 
    type: string;
    className?: string;
  }> = ({ src, alt, type, className = '' }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const handleImageError = () => {
      setImageError(true);
      setImageLoaded(false);
    };

    const handleImageLoad = () => {
      setImageLoaded(true);
      setImageError(false);
    };

    return (
      <div className={`relative w-[300px] h-[180px] bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 ${className}`}>
        {src && !imageError ? (
          <>
            <img
              src={src}
              alt={alt}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onError={handleImageError}
              onLoad={handleImageLoad}
              style={{
                objectPosition: 'center',
                objectFit: 'cover'
              }}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="animate-pulse">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    {getTypeIcon(type)}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-sm mb-3 mx-auto">
                {getTypeIcon(type)}
              </div>
              <span className="text-xs text-gray-500 font-medium">{type}</span>
            </div>
          </div>
        )}
        
        {/* Content type badge overlay */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(type)} bg-opacity-90 backdrop-blur-sm`}>
            {getTypeIcon(type)}
            {type}
          </span>
        </div>
      </div>
    );
  };

  // Pagination Component
  const PaginationControls: React.FC = () => {
    const pagination = getCurrentPagination();
    const { currentPage, totalPages, totalItems } = pagination;

    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        }
      }
      
      return pages;
    };

    return (
      <div className="flex items-center justify-center mt-8 gap-2">
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="px-3 py-2 border text-gray-600 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
              disabled={page === '...' || isLoading}
              className={`px-3 py-2 border rounded-lg transition-colors ${
                page === currentPage
                  ? 'bg-blue-600 text-white border-blue-600'
                  : page === '...'
                  ? 'text-gray-400 cursor-default'
                  : 'text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className="px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    );
  };

  const handleContentTypeSelect = (contentType: ContentType) => {
    debugger;
    setSelectedContentType(contentType);
    setIsFabExpanded(false);
    
    // Open specific modal for roleplay
    if (contentType.id === 'roleplay') {
      setIsRoleplayModalOpen(true);
    }
    else if (contentType.id === 'ai-tutor') {
      setAITutorDialogOpen(true);
    }
    else {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedContentType(null);
  };

  const handleCloseRoleplayModal = () => {
    setIsRoleplayModalOpen(false);
  };

  const handleCreateContent = async () => {
    console.log('Creating content:', selectedContentType);
    
    try {
      if (selectedContentType) {
        // Mock content creation - replace with actual API call
        console.log('Content created successfully');
        handleCloseModal();
        
        // Refresh data after creation
        if (activeTab === 'shared') {
          fetchSharedKnowledge(sharedPagination.currentPage, true);
        } else {
          fetchMyKnowledge(myPagination.currentPage, true);
        }
      }
    } catch (error) {
      console.error('Error creating content:', error);
    }
  };

  const handleRefresh = () => {
    if (activeTab === 'shared') {
      fetchSharedKnowledge(sharedPagination.currentPage, true);
    } else {
      fetchMyKnowledge(myPagination.currentPage, true);
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
  // Handle dropdown menu actions
  const handleDropdownAction = async (action: string, itemId: string) => {
    debugger;
    const item = currentData.find((i) => i.id === itemId); 
    console.log(`Action: ${action} for item: ${itemId}`);
    setOpenDropdownId(null);
    
    try {
      switch (action) {
        case 'edit':
          console.log('Edit action');
          break;
        case 'duplicate':
          console.log('Duplicate action');
          break;
        case 'download':
          console.log('Download action');
          break;
        case 'delete':
          console.log('Delete action');
          // Refresh data after deletion
          if (activeTab === 'shared') {
            fetchSharedKnowledge(sharedPagination.currentPage, true);
          } else {
            fetchMyKnowledge(myPagination.currentPage, true);
          }
          break;
        case 'editmetadata':
          console.log('Edit Metadata action');
          break;
        case 'preview':
          if (item?.type?.toLowerCase() === 'ai tutor') {
            handlePreviewAITutorEnhanced(item);
          }
          break;
        case 'view':
          debugger;
          if (!item) break;
          if (item.contentTypeId === 699) { 
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
          }
          else if(item.contentTypeId === 697){
            // Tavus API call with error handling
            try {
              if(!sessionStorage.getItem('tavus_conversation')){
                await createTavusConversation('rb17cf590e15');
              }              
            } catch (err) {
              // Optionally show an error to the user here 
              console.log('Error creating Tavus conversation:', err); 
            }
            handlePreviewAITutorEnhanced(item);
          }
          else {
            // fallback: open in new tab as before
            window.open(item.viewLink || '#', '_blank');
          }
          break;
        case 'share':
          setShareItem(item);
          setIsShareModalOpen(true);
          setOpenDropdownId(null);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdownId(null);
    };

    if (openDropdownId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdownId]);

  // Filter data based on selected filters
  const applyFilters = (data: any[]) => {
    return data.filter(item => {
      // Content type filter
      if (selectedFilters.contentType && item.type.toLowerCase() !== selectedFilters.contentType.toLowerCase()) {
        return false;
      }

      // Skills filter
      if (selectedFilters.skills.length > 0) {
        const itemSkills = item.skills.map((s: any) => s.CategoryName.toLowerCase());
        const hasMatchingSkill = selectedFilters.skills.some(skill => 
          itemSkills.includes(skill.toLowerCase())
        );
        if (!hasMatchingSkill) return false;
      }

      // Tags filter
      if (selectedFilters.tags.length > 0) {
        const itemTags = item.tags ? item.tags.toLowerCase() : '';
        const hasMatchingTag = selectedFilters.tags.some(tag => 
          itemTags.includes(tag.toLowerCase())
        );
        if (!hasMatchingTag) return false;
      }

      // Rating filter
      if (selectedFilters.rating && item.rating < parseFloat(selectedFilters.rating)) {
        return false;
      }

      // Date range filter
      if (selectedFilters.dateRange) {
        const itemDate = new Date(item.createdOn);
        const now = new Date();
        let startDate = new Date();

        switch (selectedFilters.dateRange) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case 'quarter':
            startDate.setMonth(now.getMonth() - 3);
            break;
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }

        if (itemDate < startDate) return false;
      }

      return true;
    });
  };

  // Handle filter changes
  const handleFilterChange = (filterType: string, value: any) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedFilters({
      contentType: '',
      skills: [],
      tags: [],
      rating: '',
      dateRange: ''
    });
  };

  // Get current data based on active tab
  const currentRawData = activeTab === 'shared' ? sharedKnowledge : myKnowledge;
  const currentData = transformApiData(currentRawData);
  
  // Filter data based on search query and selected filters
  const filteredData = applyFilters(currentData.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.tags && item.tags.toLowerCase().includes(searchQuery.toLowerCase()))
  ));

  const onShareKnowledgeClick = async () => {
    if (!shareItem) return;
    setIsShareLoading(true);
    try {
      await shareCoCreateKnowledgeBase({
        contentId: shareItem.id,
        folderPath: shareItem.folderPath || '',
        startPage: shareItem.startpage || '',
        objectTypeId: shareItem.contentTypeId,
        assignComponentId: 328
      });
      setIsShareModalOpen(false);
      setShareItem(null);
      showSuccess('Knowledge Shared', 'Knowledge shared successfully!');
      fetchMyKnowledge(myPagination.currentPage, true);
    } catch (err: any) {
      showError('Share Failed', 'Failed to share knowledge: ' + (err.message || 'Unknown error'));
    } finally {
      setIsShareLoading(false);
    }
  };

  const [isAITutorDialogOpen, setAITutorDialogOpen] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [botDetails, setBotDetails] = useState<any>(null); 
  const aiTutorDiaogOpen = () => {
    setAITutorDialogOpen(false);
    handleRefresh();
  }

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<any>(null);
  const [embeddedComponent, setEmbeddedComponent] = useState<React.ReactNode | null>(null);

  const handlePreviewRolePlay = (item: any) => {
    // Build the URL from item metadata or use a static one for testing
    const url = `${window.location.origin}/learning-app/roleplay/index.html?FolderPath=${item?.folderPath}&ContentID=${item?.id}&PreviewPath=lcms&version=401409`;
    setPreviewUrl(url);
    setPreviewItem(item);
    setEmbeddedComponent(null);
    setIsPreviewOpen(true);
  };

  // New function to handle AI Tutor preview with EnhancedModalContentView
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
      // const aiTutorComponent = (
      //   <FlowiseFullPageAIAssistant
      //     BotDetails={botResponse}
      //     mode="ai-tutor"
      //     contentId={item.id.toLowerCase()}
      //     userContext={user}
      //     apiHost={API_CONFIG.AIAgentURL}
      //     userAvatarImage={API_CONFIG.LearnerURL.replace('http://', 'https://') + user.Picture}
      //   />
      // );
      
      // setEmbeddedComponent(aiTutorComponent);
      // setPreviewItem(item);
      // setPreviewUrl(null);
      // setIsPreviewOpen(true);


      const url = `${window.location.origin}/learning-app/chatbotplay/index.html?FolderPath=${item?.folderPath}&ContentID=${item?.id}&PreviewPath=lcms&version=401409`;
      setPreviewUrl(url);
      setPreviewItem(item);
      setEmbeddedComponent(null);
      setIsPreviewOpen(true);
    } catch (error) {
      console.error('Error fetching bot details:', error);
      showError('Preview Failed', 'Failed to load AI Tutor details. Please try again.');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto relative">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Co-Create Knowledge</h1>
              <p className="text-gray-600">Collaborate with peers and experts to create valuable learning content.</p>
            </div>
            {/* View Toggle */}
            <div className="flex items-center bg-white border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Grid View"
              >
                <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                  <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                  <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                </div>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="List View"
              >
                <div className="w-4 h-4 flex flex-col gap-0.5">
                  <div className="w-full h-1 bg-current rounded-sm"></div>
                  <div className="w-full h-1 bg-current rounded-sm"></div>
                  <div className="w-full h-1 bg-current rounded-sm"></div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error Loading Data</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="text-sm text-red-600 hover:text-red-800 underline mt-2"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => handleTabChange('shared')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'shared'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Shared Knowledge
                {sharedKnowledge.length > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {sharedPagination.totalItems || sharedKnowledge.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => handleTabChange('my')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'my'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Knowledge
                {myKnowledge.length > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {myPagination.totalItems || myKnowledge.length}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search knowledge content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            {/* Filter Button */}
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                showFilters 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filter</span>
              {(selectedFilters.contentType || selectedFilters.skills.length > 0 || selectedFilters.tags.length > 0 || selectedFilters.rating || selectedFilters.dateRange) && (
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            
            {filteredData.length !== currentData.length && (
              <span className="text-sm text-gray-500">
                {filteredData.length} of {currentData.length} items
              </span>
            )}
          </div>
        </div>

        {/* Results Summary */}
        {!isLoading && filteredData.length > 0 && (
          <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
            <div>
              Showing {filteredData.length} of {getCurrentPagination().totalItems} results
              {searchQuery && (
                <span className="ml-2">
                  for "<span className="font-medium">{searchQuery}</span>"
                </span>
              )}
            </div>
            {filteredData.length > 0 && (
              <div className="text-gray-500">
                Page {getCurrentPagination().currentPage} of {getCurrentPagination().totalPages}
              </div>
            )}
          </div>
        )}

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear All
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Content Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
                <select
                  value={selectedFilters.contentType}
                  onChange={(e) => handleFilterChange('contentType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {contentTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <select
                  value={selectedFilters.rating}
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {ratingOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select
                  value={selectedFilters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {dateRangeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Skills Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
                  {skillsOptions.map(skill => (
                    <label key={skill} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFilters.skills.includes(skill)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleFilterChange('skills', [...selectedFilters.skills, skill]);
                          } else {
                            handleFilterChange('skills', selectedFilters.skills.filter(s => s !== skill));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{skill}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Content</h3>
              <p className="text-gray-600">
                Fetching {activeTab === 'shared' ? 'shared' : 'your'} knowledge content...
              </p>
            </div>
          </div>
        )}

        {/* Content Grid with Fixed Thumbnails */}
        {!isLoading && (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredData.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 group flex flex-col h-full"
                  >
                    {/* Fixed 300x300 Thumbnail */}
                    <FixedThumbnail
                      src={item.thumbnail}
                      alt={item.title}
                      type={item.type}
                      className="flex-shrink-0"
                    />

                    {/* Content - Flex grow to fill available space */}
                    <div className="p-4 flex flex-col flex-grow relative">
                      {/* Title */}
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
                        {item.title}
                      </h3>

                      {/* Author */}
                      <p className="text-sm text-gray-600 mb-3">{item.author}</p>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-4">
                        {item.rating > 0 ? (
                          <>
                            <span className="text-sm font-medium text-gray-900">{item.rating.toFixed(1)}</span>
                            {renderStars(item.rating)}
                            {item.totalRatings > 0 && (
                              <span className="text-xs text-gray-500">({item.totalRatings})</span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-gray-500">No ratings yet</span>
                        )}
                      </div>

                      {/* Skills/Tags - Flex grow to push buttons to bottom */}
                      <div className="flex-grow">
                        {item.skills.length > 0 && (
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-1">
                              {item.skills.slice(0, 2).map((skill: any, index: number) => (
                                <span
                                  key={index}
                                  className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                >
                                  {skill.CategoryName}
                                </span>
                              ))}
                              {item.skills.length > 2 && (
                                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                  +{item.skills.length - 2} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons Container - Always at bottom */}
                      <div className="flex items-center justify-end gap-2 mt-auto pt-4">
                        {activeTab === 'my' ? (
                          <>
                            {/* My Knowledge Actions */}
                            <a
                              href={item.detailsLink && item.detailsLink !== '' ? item.detailsLink : `/details/${item.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <button className="bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                                Details
                              </button>
                            </a>
                            
                            
                            {/*{item.type?.toLowerCase() === 'ai tutor' && (
                              <button
                                onClick={() => handlePreviewAITutor(item)}
                                disabled={isPreviewLoading}
                                className="bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                              >
                                {isPreviewLoading ? 'Loading...' : 'Preview'}
                              </button>
                            )}*/}
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdownId(openDropdownId === item.id ? null : item.id);
                                }}
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors shadow-sm border border-gray-200 bg-white"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              {openDropdownId === item.id && (
                                <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                  <button 
                                    onClick={() => handleDropdownAction('view', item.id)} 
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                    <Eye className="w-4 h-4" />
                                    View
                                  </button>
                                  <button
                                    onClick={() => handleDropdownAction('editmetadata', item.id)}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                  >
                                    <Edit className="w-4 h-4" />
                                    Edit Metadata
                                  </button>
                                  <button
                                    onClick={() => handleDropdownAction('edit', item.id)}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                  >
                                    <Edit className="w-4 h-4" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDropdownAction('share', item.id)}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                  >
                                    <Share2 className="w-4 h-4" />
                                    Share
                                  </button>
                                  <div className="border-t border-gray-100 my-1"></div>
                                  <button
                                    onClick={() => handleDropdownAction('delete', item.id)}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Shared Knowledge Actions */}
                            <button 
                              onClick={() => handleDropdownAction('view', item.id)} 
                              className="bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"> 
                              View
                            </button>
                            {/* <a href={item.viewLink || '#'} target="_blank" rel="noopener noreferrer">
                              <button className="bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                                View
                              </button>
                            </a> */}
                            <a
                              href={item.detailsLink && item.detailsLink !== '' ? item.detailsLink : `/details/${item.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <button className="bg-gray-100 text-gray-800 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors shadow-sm border border-gray-200">
                                Details
                              </button>
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-4">
                {filteredData.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex">
                      {/* Thumbnail */}
                      <div className="w-48 h-32 flex-shrink-0">
                        <FixedThumbnail
                          src={item.thumbnail}
                          alt={item.title}
                          type={item.type}
                          className="w-full h-full"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4 flex flex-col">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg mb-1">
                              {item.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">by {item.author}</p>
                            
                            {/* Rating */}
                            <div className="flex items-center gap-2 mb-3">
                              {item.rating > 0 ? (
                                <>
                                  <span className="text-sm font-medium text-gray-900">{item.rating.toFixed(1)}</span>
                                  {renderStars(item.rating)}
                                  {item.totalRatings > 0 && (
                                    <span className="text-xs text-gray-500">({item.totalRatings})</span>
                                  )}
                                </>
                              ) : (
                                <span className="text-xs text-gray-500">No ratings yet</span>
                              )}
                            </div>

                            {/* Skills */}
                            {item.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {item.skills.slice(0, 3).map((skill: any, index: number) => (
                                  <span
                                    key={index}
                                    className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                  >
                                    {skill.CategoryName}
                                  </span>
                                ))}
                                {item.skills.length > 3 && (
                                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                    +{item.skills.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 ml-4">
                            {activeTab === 'my' ? (
                              <>
                                {/* My Knowledge Actions */}
                                <a
                                  href={item.detailsLink && item.detailsLink !== '' ? item.detailsLink : `/details/${item.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <button className="bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                                    Details
                                  </button>
                                </a>
                                
                                {/* Preview button for AI Tutor */}
                                {/*{item.type?.toLowerCase() === 'ai tutor' && (
                                  <button
                                    onClick={() => handlePreviewAITutor(item)}
                                    disabled={isPreviewLoading}
                                    className="bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                                  >
                                    {isPreviewLoading ? 'Loading...' : 'Preview'}
                                  </button>
                                )}*/}
                                <div className="relative">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenDropdownId(openDropdownId === item.id ? null : item.id);
                                    }}
                                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors shadow-sm border border-gray-200 bg-white"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </button>
                                  {openDropdownId === item.id && (
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                      <button 
                                        onClick={() => handleDropdownAction('view', item.id)} 
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                        <Eye className="w-4 h-4" />
                                        View
                                      </button>
                                      <button
                                        onClick={() => handleDropdownAction('editmetadata', item.id)}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                      >
                                        <Edit className="w-4 h-4" />
                                        Edit Metadata
                                      </button>
                                      <button
                                        onClick={() => handleDropdownAction('edit', item.id)}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                      >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleDropdownAction('share', item.id)}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                      >
                                        <Share2 className="w-4 h-4" />
                                        Share
                                      </button>
                                      <div className="border-t border-gray-100 my-1"></div>
                                      <button
                                        onClick={() => handleDropdownAction('delete', item.id)}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </>
                            ) : (
                              <>
                                {/* Shared Knowledge Actions */}
                                <button 
                                  onClick={() => handleDropdownAction('view', item.id)} 
                                  className="bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"> 
                                  View
                                </button>
                                {/* <a href={item.viewLink || '#'} target="_blank" rel="noopener noreferrer">
                                  <button className="bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                                    View
                                  </button>
                                </a> */}
                                <a
                                  href={item.detailsLink && item.detailsLink !== '' ? item.detailsLink : `/details/${item.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <button className="bg-gray-100 text-gray-800 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors shadow-sm border border-gray-200">
                                    Details
                                  </button>
                                </a>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            <PaginationControls />
          </>
        )}

        {/* Empty State */}
        {!isLoading && filteredData.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {searchQuery ? (
                <Search className="w-8 h-8 text-gray-400" />
              ) : (
                <BookOpen className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No content found' : 'No content available'}
            </h3>
            <p className="text-gray-600">
              {searchQuery
                ? `No results found for "${searchQuery}". Try adjusting your search.`
                : `No ${activeTab === 'shared' ? 'shared' : 'personal'} knowledge content available.`}
            </p>
            {!searchQuery && activeTab === 'my' && (
              <button
                onClick={() => setIsFabExpanded(true)}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Content
              </button>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) */}
      {activeTab === 'my' && (
        <div className="fixed bottom-6 right-6 z-50">
          {/* Expanded Content Options */}
          {isFabExpanded && (
            <div className="absolute bottom-16 right-0 mb-2">
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 w-64 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-1 gap-1">
                  {contentTypes.map((contentType) => (
                    <button
                      key={contentType.id}
                      onClick={() => handleContentTypeSelect(contentType)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left w-full"
                    >
                      <div className={`${contentType.color} text-white p-2 rounded-lg flex-shrink-0`}>
                        {contentType.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm">{contentType.name}</div>
                        <div className="text-xs text-gray-500 truncate">{contentType.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main FAB Button */}
          <button
            onClick={() => setIsFabExpanded(!isFabExpanded)}
            className={`${
              isFabExpanded ? 'bg-gray-600' : 'bg-blue-600'
            } text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform ${
              isFabExpanded ? 'rotate-45' : 'hover:scale-105'
            }`}
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Overlay for FAB */}
      {isFabExpanded && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsFabExpanded(false)}
        />
      )}

      {/* Content Creation Modal */}
      {isModalOpen && selectedContentType && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={handleCloseModal}
            />

            {/* Modal panel */}
            <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`${selectedContentType.color} text-white p-3 rounded-lg`}>
                    {selectedContentType.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Create {selectedContentType.name}
                    </h3>
                    <p className="text-sm text-gray-600">{selectedContentType.description}</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="space-y-6">
                {/* Title Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    placeholder={`Enter ${selectedContentType.name.toLowerCase()} title...`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Description Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    placeholder={`Describe your ${selectedContentType.name.toLowerCase()}...`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select a category...</option>
                    <option value="technology">Technology</option>
                    <option value="business">Business</option>
                    <option value="science">Science</option>
                    <option value="arts">Arts & Humanities</option>
                    <option value="health">Health & Wellness</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Tags Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    placeholder="Add tags separated by commas..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tags help others discover your content
                  </p>
                </div>

                {/* Visibility Settings */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visibility
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="visibility"
                        value="public"
                        defaultChecked
                        className="mr-2 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Public - Anyone can view</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="visibility"
                        value="private"
                        className="mr-2 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Private - Only you can view</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="visibility"
                        value="shared"
                        className="mr-2 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Shared - Specific people can view</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateContent}
                  className={`px-6 py-2 text-sm font-medium text-white ${selectedContentType.color} rounded-lg hover:opacity-90 transition-opacity`}
                >
                  Create {selectedContentType.name}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Roleplay Creation Modal */}
      <RoleplayDialog
        isOpen={isRoleplayModalOpen}
        onClose={handleCloseRoleplayModal}
        onGenerate={(data) => { aiTutorDiaogOpen(); }}
      />

      {/* Share Knowledge Modal */}
      {isShareModalOpen && shareItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => { setIsShareModalOpen(false); setShareItem(null); }}
        >
          <div 
            className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">Share Knowledge</h2>
            <p className="mb-6">Are you sure you want to share the "{shareItem.title}" with your knowledge?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setIsShareModalOpen(false); setShareItem(null); }}
                className="px-4 py-2 rounded border border-blue-600 text-blue-600 bg-white hover:bg-blue-50"
                disabled={isShareLoading}
              >
                Cancel
              </button>
              <button
                onClick={onShareKnowledgeClick}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300"
                disabled={isShareLoading}
              >
                {isShareLoading ? 'Sharing...' : 'Share'}
              </button>
            </div>
          </div>
        </div>
      )}

      <AITutorCreationDialog
        open={isAITutorDialogOpen}
        onClose={() => setAITutorDialogOpen(false)}
        onGenerate={(data) => { aiTutorDiaogOpen(); }}
      />

      {/* Preview Dialog for Role Play and AI Tutor */}
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

export default CoCreateContent; 