// hooks/useCatalogData.ts
import { useState, useEffect, useCallback } from 'react';
import { json } from 'stream/consumers';

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

  interface Category {
  CategoryID: string;
  CategoryName: string;
}

interface CatalogState {
  items: any[];
  total: number;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
}

// Import your actual MCP service
// Replace this import path with your actual MCP service location
let mcpClientService: any;

try {
  // Try to import the actual MCP service
  mcpClientService = require('@/services/McpClientService').mcpClientService;
} catch (error) {
  console.warn('MCP service not found, using fallback');
  // Fallback mock service if MCP service is not available
  mcpClientService = {
    getCatalogCategories: async () => ['Technology', 'Business', 'Design', 'Marketing'],
    searchCatalog: async (params: any) => ({
      items: [
        {
          id: '1',
          title: 'React Advanced Concepts',
          description: 'Deep dive into advanced React patterns and best practices',
          contentType: 'Course',
          subscriptionTier: 'premium',
          author: { name: 'John Doe' },
          rating: { average: 4.5, count: 150 },
          tags: ['React', 'JavaScript', 'Frontend'],
          thumbnail: 'https://via.placeholder.com/300x200',
          price: { amount: 49.99, currency: 'USD' },
          isInMyLearning: false,
          isInCart: false,
          viewType: 2
        },
        {
          id: '2',
          title: 'TypeScript Fundamentals',
          description: 'Learn TypeScript from basics to advanced concepts',
          contentType: 'Course',
          subscriptionTier: 'basic',
          author: { name: 'Jane Smith' },
          rating: { average: 4.8, count: 200 },
          tags: ['TypeScript', 'JavaScript'],
          thumbnail: 'https://via.placeholder.com/300x200',
          price: { amount: 29.99, currency: 'USD' },
          isInMyLearning: false,
          isInCart: false,
          viewType: 2
        },
        {
          id: '3',
          title: 'Free JavaScript Basics',
          description: 'Introduction to JavaScript programming',
          contentType: 'Course',
          subscriptionTier: 'free',
          author: { name: 'Bob Johnson' },
          rating: { average: 4.2, count: 500 },
          tags: ['JavaScript', 'Beginner'],
          thumbnail: 'https://via.placeholder.com/300x200',
          price: { amount: 0, currency: 'USD' },
          isInMyLearning: false,
          isInCart: false,
          viewType: 2
        }
      ],
      total: 3,
      hasMore: false
    })
  };
}

// Import SSO service for MCP connection status
let useSSO: any;
try {
  useSSO = require('@/services/SSOAuthService').useSSO;
} catch (error) {
  console.warn('SSO service not found, using fallback');
  useSSO = () => ({ mcpConnected: true, retryMcpConnection: async () => true });
}

export const useCatalogData = (user: any) => {
  const [catalogState, setCatalogState] = useState<CatalogState>({
    items: [],
    total: 0,
    hasMore: false,
    loading: true,
    error: null
  }); 

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


  const [categories, setCategories] = useState<Category[]>([]);
  const [contentTypes, setContentTypes] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);

  // Use actual SSO service for MCP connection status
  const { mcpConnected, retryMcpConnection } = useSSO();

  const itemsPerPage = 12;

  // Helper function to safely extract catalog search result from MCP response
  const extractCatalogResultFromMcpResponse = (response: any): { items: any[], total: number, hasMore: boolean } => {
    try {
      // If response is already in expected format
      if (response?.items && Array.isArray(response.items)) {
        return {
          items: response.items,
          total: response.total || response.items.length,
          hasMore: response.hasMore || false
        };
      }
      
      // If response has content property
      if (response?.content) {
        if (Array.isArray(response.content)) {
          return {
            items: response.content,
            total: response.content.length,
            hasMore: false
          };
        }
        
        // If content is an object with text property (MCP tool response)
        if (response.content.text) {
          try {
            const parsed = JSON.parse(response.content.text);
            return extractCatalogResultFromMcpResponse(parsed);
          } catch {
            console.warn('Could not parse MCP text response');
          }
        }
      }
      
      // If response has result property
      if (response?.result) {
        return extractCatalogResultFromMcpResponse(response.result);
      }
      
      // If response is an array (assume it's the items)
      if (Array.isArray(response)) {
        return {
          items: response,
          total: response.length,
          hasMore: false
        };
      }
      
      console.warn('Unexpected MCP response format for catalog search:', response);
      return { items: [], total: 0, hasMore: false };
    } catch (error) {
      console.error('Error extracting catalog result from MCP response:', error);
      return { items: [], total: 0, hasMore: false };
    }
  };

  // Load categories from MCP when connected
  useEffect(() => {
    const loadCategories = async () => {
      if (!mcpConnected) return;
      
      try {
        console.log('Loading categories from MCP...');
        const response = await mcpClientService.getCatalogCategories();
        console.log('Raw MCP categories response:', response);         
        setCategories(response);
      } catch (error) {
        console.error('Failed to load categories from MCP:', error);
        // Set fallback categories
        setCategories([
          { CategoryID: '1', CategoryName: 'Technology' },
          { CategoryID: '2', CategoryName: 'Business' },
          { CategoryID: '3', CategoryName: 'Design' },
          { CategoryID: '4', CategoryName: 'Marketing' }
        ]);
      }
    };

    loadCategories();
  }, [mcpConnected]);

  // Load content types
  useEffect(() => {
    const loadContentTypes = async () => {
      const CONTENT_TYPES = {
        8: 'Learning Module',
        9: 'Assessment',
        10: 'Learning Path',
        11: 'Video and Audio',
        14: 'Documents',
        20: 'Glossary',
        21: 'HTML Package',
        26: 'eLearning Course',
        27: 'AICC',
        28: 'Reference',
        36: 'Webpage',
        52: 'Certificate',
        70: 'Event',
        102: 'xAPI',
        689: 'Physical Product',
        693: 'cmi5',
        694: 'Assignment',
        695: 'AR Module',
        696: 'VR Module',
        697: 'Chatbot',
        698: 'User Guide',
        699: 'Role Play',
        700: 'Flashcards'
      };
      
      setContentTypes(CONTENT_TYPES);
    };

    loadContentTypes();
  }, []);

  // Search catalog using actual MCP
  const searchCatalog = useCallback(async (searchFilters: FilterValues, page: number = 1) => {
    setCatalogState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const offset = (page - 1) * itemsPerPage;
      
      // Convert FilterValues to MCP search parameters
      const searchParams: any = {
        limit: itemsPerPage,
        offset
      };

      // Add filters only if they have values
      if (searchFilters.query && searchFilters.query.trim()) {
        searchParams.query = searchFilters.query.trim();
      }

      if (searchFilters.category && searchFilters.category.trim()) {
        searchParams.category = searchFilters.category.trim();
      }

      if (searchFilters.contentTypeId && searchFilters.contentTypeId !== '') {
        const contentTypeId = typeof searchFilters.contentTypeId === 'string' 
          ? parseInt(searchFilters.contentTypeId) 
          : searchFilters.contentTypeId;
        if (!isNaN(contentTypeId) && contentTypeId > 0) {
          searchParams.contentType = contentTypeId;
        }
      }

      if (searchFilters.difficulty && searchFilters.difficulty.trim()) {
        searchParams.difficulty = searchFilters.difficulty.trim();
      }

      if (searchFilters.author && searchFilters.author.trim()) {
        searchParams.searchText = searchFilters.author.trim();
      }

      if (searchFilters.rating && searchFilters.rating !== '') {
        const rating = typeof searchFilters.rating === 'string' 
          ? parseFloat(searchFilters.rating) 
          : searchFilters.rating;
        if (!isNaN(rating) && rating > 0) {
          searchParams.rating = rating;
        }
      }

      if (searchFilters.tags && Array.isArray(searchFilters.tags) && searchFilters.tags.length > 0) {
        searchParams.tags = searchFilters.tags;
      }

      if (searchFilters.sortBy && searchFilters.sortBy !== 'recent') {
        searchParams.sortBy = searchFilters.sortBy;
        searchParams.sortOrder = searchFilters.sortOrder || 'desc';
      }

      console.log('Search params being sent to MCP:', searchParams);

      if (mcpConnected) {
        const response = await mcpClientService.searchCatalog(searchParams);
        console.log('Raw MCP search response:', response);
        
        const result = extractCatalogResultFromMcpResponse(response);
        console.log('Extracted catalog result:', result);
        
        setCatalogState({
          items: result.items,
          total: result.total,
          hasMore: result.hasMore,
          loading: false,
          error: null
        });
      } else {
        // Fallback to show connection error
        setCatalogState(prev => ({
          ...prev,
          loading: false,
          error: 'MCP server not connected. Please retry connection.'
        }));
      }

      // Clear action states when loading new items
    } catch (error) {
      console.error('Search catalog error:', error);
      setCatalogState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load catalog'
      }));
    }
  }, [mcpConnected, itemsPerPage]);

  return {
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
  };
};