// src/mcp/catalog-server.ts
// Complete MCP Server implementation for Learning Catalog with ViewType support and My Learning

import type { UserContext } from '@/types';
import type { 
  CatalogItem, 
  CatalogResource, 
  CatalogTool, 
  SearchFilters, 
  SearchResult
} from '@/types/Catalog';
import type { LearningTabType, LearningFilters } from '@/types/Learning';

import { CONTENT_TYPES } from '@/types/index';
import { LearningItem } from '@/types/Learning';
// Import learning service
import { LearningService } from '@/components/mycatalog/LearningService';

// Enhanced mock catalog data with ViewType
const enhanceCatalogDataWithViewType = (items: any[]): CatalogItem[] => {
  return items.map((item, index) => {
    // Determine ViewType based on content type and business logic
    let viewType: 1 | 2 | 3;
    let directViewUrl: string | undefined;
    let isInMyLearning = false;
    let isInCart = false;

    // Business logic for ViewType assignment
    if (item.contentTypeId === 36 || item.contentTypeId === 11 || item.contentTypeId === 14) {
      // Webpage, Video, or Document content - Direct View
      viewType = 1;
      
      // Generate appropriate direct view URLs
      switch (item.contentTypeId) {
        case 36: // Webpage
          directViewUrl = `https://web-viewer.example.com/${item.id}`;
          break;
        case 11: // Video
          directViewUrl = `https://video-player.example.com/${item.id}`;
          break;
        case 14: // Document
          directViewUrl = `https://doc-viewer.example.com/${item.id}`;
          break;
        default:
          directViewUrl = `https://content-viewer.example.com/${item.id}`;
      }
    } else if (item.price && item.price.amount > 0) {
      // Paid content - Add to Cart
      viewType = 3;
    } else {
      // Free content - Add to My Learning
      viewType = 2;
      // Simulate some items already in learning for demo
      isInMyLearning = index % 7 === 0;
    }

    // Simulate some items already in cart for demo
    if (viewType === 3) {
      isInCart = index % 9 === 0;
    }

    return {
      ...item,
      viewType,
      directViewUrl,
      isInMyLearning,
      isInCart
    };
  });
};


// MCP Catalog Server Class with Enhanced Functionality
export class CatalogMCPServer {
  private catalogData: CatalogItem[] = [];
 
  // MCP Resources - provide catalog data context
  getResources(): CatalogResource[] {
    return [
      {
        uri: 'catalog://items',
        name: 'Catalog Items',
        description: 'Complete list of available learning items in the catalog',
        mimeType: 'application/json'
      },
      {
        uri: 'catalog://categories',
        name: 'Catalog Categories',
        description: 'Available categories for filtering catalog items',
        mimeType: 'application/json'
      },
      {
        uri: 'catalog://content-types',
        name: 'Content Types',
        description: 'Available Instancy content types with IDs',
        mimeType: 'application/json'
      },
      {
        uri: 'catalog://learning-paths',
        name: 'Learning Paths',
        description: 'Available learning paths and their content structure',
        mimeType: 'application/json'
      },
      {
        uri: 'catalog://stats',
        name: 'Catalog Statistics',
        description: 'Statistical information about the catalog',
        mimeType: 'application/json'
      },
      {
        uri: 'catalog://viewtype-stats',
        name: 'ViewType Statistics',
        description: 'Statistics about ViewType distribution',
        mimeType: 'application/json'
      },
      {
        uri: 'catalog://my-learning',
        name: 'My Learning Data',
        description: 'User-specific learning data and progress',
        mimeType: 'application/json'
      },
      {
        uri: 'catalog://learning-analytics',
        name: 'Learning Analytics',
        description: 'Advanced learning analytics and insights',
        mimeType: 'application/json'
      }
    ];
  }

  // MCP Tools - provide catalog operations
  getTools(): CatalogTool[] {
    return [
      // EXISTING CATALOG TOOLS
      {
        name: 'search_catalog',
        description: 'Search catalog items by query, category, content type, or difficulty',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query for title, description, or tags'
            },
            category: {
              type: 'string',
              description: 'Filter by category'
            },
            contentTypeId: {
              type: 'number',
              description: 'Filter by Instancy content type ID'
            },
            contentType: {
              type: 'string',
              description: 'Filter by content type name'
            },
            difficulty: {
              type: 'string',
              enum: ['beginner', 'intermediate', 'advanced'],
              description: 'Filter by difficulty level'
            },
            author: {
              type: 'string',
              description: 'Filter by author name'
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Filter by tags'
            },
            viewType: {
              type: 'number',
              enum: [1, 2, 3],
              description: 'Filter by ViewType (1: Direct View, 2: My Learning, 3: Cart)'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results to return',
              default: 10
            },
            offset: {
              type: 'number',
              description: 'Number of results to skip for pagination',
              default: 0
            },
            sortBy: {
              type: 'string',
              enum: ['title', 'rating', 'enrollment', 'createdAt', 'duration', 'viewType'],
              description: 'Sort results by field'
            },
            sortOrder: {
              type: 'string',
              enum: ['asc', 'desc'],
              description: 'Sort order',
              default: 'desc'
            }
          }
        }
      },
      
      {
        name: 'get_catalog_item',
        description: 'Get detailed information about a specific catalog item',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The unique identifier of the catalog item'
            }
          },
          required: ['id']
        }
      },

      // EXISTING MY LEARNING TOOLS
      {
        name: 'add_to_my_learning',
        description: 'Add a catalog item to user\'s learning list (ViewType 2)',
        inputSchema: {
          type: 'object',
          properties: {
            itemId: {
              type: 'string',
              description: 'The unique identifier of the catalog item'
            }
          },
          required: ['itemId']
        }
      },
      {
        name: 'add_to_cart',
        description: 'Add a catalog item to user\'s shopping cart (ViewType 3)',
        inputSchema: {
          type: 'object',
          properties: {
            itemId: {
              type: 'string',
              description: 'The unique identifier of the catalog item'
            }
          },
          required: ['itemId']
        }
      },
      {
        name: 'get_direct_view_url',
        description: 'Get direct view URL for a catalog item (ViewType 1)',
        inputSchema: {
          type: 'object',
          properties: {
            itemId: {
              type: 'string',
              description: 'The unique identifier of the catalog item'
            }
          },
          required: ['itemId']
        }
      },
      {
        name: 'get_my_learning',
        description: 'Get user\'s learning list',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Maximum number of results to return',
              default: 20
            }
          }
        }
      },
      {
        name: 'get_cart_items',
        description: 'Get user\'s cart items',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Maximum number of results to return',
              default: 20
            }
          }
        }
      },
      {
        name: 'remove_from_my_learning',
        description: 'Remove an item from user\'s learning list',
        inputSchema: {
          type: 'object',
          properties: {
            itemId: {
              type: 'string',
              description: 'The unique identifier of the catalog item'
            }
          },
          required: ['itemId']
        }
      },
      {
        name: 'remove_from_cart',
        description: 'Remove an item from user\'s cart',
        inputSchema: {
          type: 'object',
          properties: {
            itemId: {
              type: 'string',
              description: 'The unique identifier of the catalog item'
            }
          },
          required: ['itemId']
        }
      },
      {
        name: 'get_catalog_categories',
        description: 'Get all available categories in the catalog',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'get_content_types',
        description: 'Get all Instancy content types with their IDs',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'get_viewtype_stats',
        description: 'Get statistics about ViewType distribution',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },

      // NEW ENHANCED MY LEARNING TOOLS
      {
        name: 'get_my_learning_detailed',
        description: 'Get detailed my learning data with statistics and filtering',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'number',
              description: 'User ID (optional, will use context if not provided)'
            },
            tab: {
              type: 'string',
              enum: ['all', 'due-dates', 'not-started', 'in-progress', 'registered', 'completed', 'pending-review'],
              description: 'Filter by learning status tab'
            },
            filters: {
              type: 'object',
              description: 'Additional filters for search, category, etc.'
            }
          }
        }
      },
      {
        name: 'start_learning',
        description: 'Start learning a specific item',
        inputSchema: {
          type: 'object',
          properties: {
            itemId: {
              type: 'string',
              description: 'The unique identifier of the learning item'
            }
          },
          required: ['itemId']
        }
      },
      {
        name: 'continue_learning',
        description: 'Continue learning a previously started item',
        inputSchema: {
          type: 'object',
          properties: {
            itemId: {
              type: 'string',
              description: 'The unique identifier of the learning item'
            }
          },
          required: ['itemId']
        }
      },
      {
        name: 'update_learning_progress',
        description: 'Update progress for a learning item',
        inputSchema: {
          type: 'object',
          properties: {
            itemId: {
              type: 'string',
              description: 'The unique identifier of the learning item'
            },
            progress: {
              type: 'number',
              description: 'Progress percentage (0-100)'
            },
            metadata: {
              type: 'object',
              description: 'Additional metadata like time spent, bookmarks, etc.'
            }
          },
          required: ['itemId', 'progress']
        }
      },
      {
        name: 'get_learning_url',
        description: 'Get URL for accessing learning content',
        inputSchema: {
          type: 'object',
          properties: {
            itemId: {
              type: 'string',
              description: 'The unique identifier of the learning item'
            },
            action: {
              type: 'string',
              enum: ['start', 'continue', 'review'],
              description: 'Type of access action'
            }
          },
          required: ['itemId']
        }
      },
      {
        name: 'get_learning_analytics',
        description: 'Get learning analytics and insights for the user',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'get_learning_due_dates',
        description: 'Get learning items with due dates organized by urgency',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'get_learning_calendar',
        description: 'Get learning calendar view for a specific month',
        inputSchema: {
          type: 'object',
          properties: {
            month: {
              type: 'number',
              description: 'Month (0-11, optional, defaults to current month)'
            },
            year: {
              type: 'number',
              description: 'Year (optional, defaults to current year)'
            }
          }
        }
      }
    ];
  }

  // Resource handlers
  async readResource(uri: string, userContext?: UserContext): Promise<any> {
    switch (uri) {
      case 'catalog://items':
        return this.getAllItems(userContext);
      
      case 'catalog://categories':
        return this.getCategories();
      
      case 'catalog://content-types':
        return this.getContentTypes();
      
      case 'catalog://learning-paths':
        return this.getLearningPaths(userContext);
      
      case 'catalog://stats':
        return this.getStatistics();
      
      case 'catalog://viewtype-stats':
        return this.getViewTypeStatistics();

      case 'catalog://my-learning':
        return this.getMyLearningResource(userContext);

      case 'catalog://learning-analytics':
        return this.getLearningAnalytics(userContext);

      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  }

  // Tool handlers
  async callTool(name: string, arguments_: any, userContext?: UserContext): Promise<any> {
    switch (name) {
      // EXISTING CATALOG TOOLS
      case 'search_catalog':
        return this.searchCatalog(arguments_, userContext);
      
      case 'get_catalog_item':
        return this.getCatalogItem(arguments_.id, userContext);
      
      case 'add_to_my_learning':
        return this.addToMyLearning(arguments_.itemId, userContext);
      
      case 'add_to_cart':
        return this.addToCart(arguments_.itemId, userContext);
      
      case 'get_direct_view_url':
        return this.getDirectViewUrl(arguments_.itemId, userContext);
      
      case 'get_my_learning':
        return this.getMyLearning(arguments_.limit, userContext);
      
      case 'get_cart_items':
        return this.getCartItems(arguments_.limit, userContext);
      
      case 'remove_from_my_learning':
        return this.removeFromMyLearning(arguments_.itemId, userContext);
      
      case 'remove_from_cart':
        return this.removeFromCart(arguments_.itemId, userContext);
      
      case 'get_catalog_categories':
        return this.getCategories();
      
      case 'get_content_types':
        return this.getContentTypes();
      
      case 'get_viewtype_stats':
        return this.getViewTypeStatistics();

      // NEW ENHANCED MY LEARNING TOOLS
      case 'get_my_learning_detailed':
        return this.getMyLearningDetailed(
          arguments_.userId || userContext?.UserID,
          arguments_.tab,
          arguments_.filters,
          userContext
        );
      
      case 'start_learning':
        return this.startLearning(arguments_.itemId, userContext);
      
      case 'continue_learning':
        return this.continueLearning(arguments_.itemId, userContext);
      
      case 'update_learning_progress':
        return this.updateLearningProgress(
          arguments_.itemId,
          arguments_.progress,
          arguments_.metadata,
          userContext
        );
      
      case 'get_learning_url':
        return this.getLearningUrl(arguments_.itemId, arguments_.action, userContext);
      
      case 'get_learning_analytics':
        return this.getLearningAnalytics(userContext);
      
      case 'get_learning_due_dates':
        return this.getLearningDueDates(userContext);
      
      case 'get_learning_calendar':
        return this.getLearningCalendar(arguments_.month, arguments_.year, userContext);
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  // EXISTING IMPLEMENTATION METHODS
  private async getAllItems(userContext?: UserContext): Promise<CatalogItem[]> {
    return this.catalogData.filter(item => item.status === 'published');
  }

  private async searchCatalog(params: SearchFilters & { viewType?: 1 | 2 | 3 }, userContext?: UserContext): Promise<SearchResult> {
    let filteredItems = this.catalogData.filter(item => item.status === 'published');

    // Apply filters
    if (params.query) {
      const query = params.query.toLowerCase();
      filteredItems = filteredItems.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query)) ||
        item.author.name.toLowerCase().includes(query)
      );
    }

    if (params.category) {
      filteredItems = filteredItems.filter(item => 
        item.category && params.category &&
        item.category.toLowerCase() === params.category.toLowerCase()
      );
    }

    if (params.contentTypeId && params.contentTypeId !== undefined && params.contentTypeId !== -1) {      
      filteredItems = filteredItems.filter(item => item.contentTypeId === params.contentTypeId);
    }

    if (params.contentType) {
      filteredItems = filteredItems.filter(item => 
        item.contentType &&
        params.contentType &&
        item.contentType.toLowerCase() === params.contentType.toLowerCase()
      );
    }

    if (params.difficulty) {
      filteredItems = filteredItems.filter(item => item.difficulty === params.difficulty);
    }

    if (params.author) {
      filteredItems = filteredItems.filter(item => 
        params.author && item.author.name.toLowerCase().includes(params.author.toLowerCase())
      );
    }

    if (params.tags && params.tags.length > 0) {
      filteredItems = filteredItems.filter(item =>
        params.tags!.some((tag: string) => 
          item.tags.some(itemTag => itemTag.toLowerCase().includes(tag.toLowerCase()))
        )
      );
    }

    // ViewType filter
    if (params.viewType) {
      filteredItems = filteredItems.filter(item => item.viewType === params.viewType);
    }

    // Apply sorting
    if (params.sortBy) {
      filteredItems.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (params.sortBy) {
          case 'title':
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          case 'rating':
            aValue = a.rating.average;
            bValue = b.rating.average;
            break;
          case 'enrollment':
            aValue = a.enrollment.enrolled;
            bValue = b.enrollment.enrolled;
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          case 'duration':
            aValue = a.duration;
            bValue = b.duration;
            break;
          case 'viewType':
            aValue = a.viewType;
            bValue = b.viewType;
            break;
          default:
            aValue = a.createdAt;
            bValue = b.createdAt;
        }

        if (params.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    // Apply pagination
    const total = filteredItems.length;
    const offset = params.offset || 0;
    const limit = params.limit || 10;
    const paginatedItems = filteredItems.slice(offset, offset + limit);

    return {
      items: paginatedItems,
      total,
      hasMore: offset + limit < total
    };
  }

  private async getCatalogItem(id: string, userContext?: UserContext): Promise<CatalogItem | null> {
    return this.catalogData.find(item => item.id === id && item.status === 'published') || null;
  }

  // ViewType action implementations
  private async addToMyLearning(itemId: string, userContext?: UserContext): Promise<{ success: boolean; message: string }> {
    const item = this.catalogData.find(item => item.id === itemId);
    
    if (!item) {
      throw new Error('Item not found');
    }

    if (item.viewType !== 2) {
      return {
        success: false,
        message: 'This item cannot be added to My Learning. It may require direct viewing or purchase.'
      };
    }

    if (item.isInMyLearning) {
      return {
        success: false,
        message: 'Item is already in your learning list'
      };
    }

    // Update the item in catalog data
    const itemIndex = this.catalogData.findIndex(catalogItem => catalogItem.id === itemId);
    if (itemIndex !== -1) {
      this.catalogData[itemIndex] = {
        ...this.catalogData[itemIndex],
        isInMyLearning: true
      };
    }

    return {
      success: true,
      message: 'Item added to your learning list successfully'
    };
  }

  private async addToCart(itemId: string, userContext?: UserContext): Promise<{ success: boolean; message: string }> {
    const item = this.catalogData.find(item => item.id === itemId);
    
    if (!item) {
      throw new Error('Item not found');
    }

    if (item.viewType !== 3) {
      return {
        success: false,
        message: 'This item cannot be added to cart. It may be free content or require direct viewing.'
      };
    }

    if (item.isInCart) {
      return {
        success: false,
        message: 'Item is already in your cart'
      };
    }

    // Update the item in catalog data
    const itemIndex = this.catalogData.findIndex(catalogItem => catalogItem.id === itemId);
    if (itemIndex !== -1) {
      this.catalogData[itemIndex] = {
        ...this.catalogData[itemIndex],
        isInCart: true
      };
    }

    return {
      success: true,
      message: 'Item added to cart successfully'
    };
  }

  private async getDirectViewUrl(itemId: string, userContext?: UserContext): Promise<{ url: string; openInNewTab: boolean }> {
    const item = this.catalogData.find(item => item.id === itemId);
    
    if (!item) {
      throw new Error('Item not found');
    }

    if (item.viewType !== 1) {
      throw new Error('This item does not support direct view. Please add it to My Learning or Cart instead.');
    }

    return {
      url: item.directViewUrl || `https://content-viewer.example.com/${itemId}`,
      openInNewTab: true
    };
  }

  private async getMyLearning(limit: number = 20, userContext?: UserContext): Promise<CatalogItem[]> {
    return this.catalogData
      .filter(item => item.status === 'published' && item.isInMyLearning === true)
      .slice(0, limit);
  }

  private async getCartItems(limit: number = 20, userContext?: UserContext): Promise<CatalogItem[]> {
    return this.catalogData
      .filter(item => item.status === 'published' && item.isInCart === true)
      .slice(0, limit);
  }

  private async removeFromMyLearning(itemId: string, userContext?: UserContext): Promise<{ success: boolean; message: string }> {
    const itemIndex = this.catalogData.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      return { success: false, message: 'Item not found' };
    }

    this.catalogData[itemIndex] = {
      ...this.catalogData[itemIndex],
      isInMyLearning: false
    };

    return { success: true, message: 'Item removed from your learning list' };
  }

  private async removeFromCart(itemId: string, userContext?: UserContext): Promise<{ success: boolean; message: string }> {
    const itemIndex = this.catalogData.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      return { success: false, message: 'Item not found' };
    }

    this.catalogData[itemIndex] = {
      ...this.catalogData[itemIndex],
      isInCart: false
    };

    return { success: true, message: 'Item removed from your cart' };
  }

  private getCategories(): string[] {
    const categories = [...new Set(this.catalogData.map(item => item.category))];
    return categories.sort();
  }

  private getContentTypes(): typeof CONTENT_TYPES {
    return CONTENT_TYPES;
  }

  private async getLearningPaths(userContext?: UserContext): Promise<CatalogItem[]> {
    return this.catalogData.filter(item => 
      item.contentTypeId === 10 && 
      item.status === 'published'
    );
  }

  private getStatistics(groupBy?: string): any {
    const publishedItems = this.catalogData.filter(item => item.status === 'published');
    
    const stats = {
      totalItems: publishedItems.length,
      totalEnrollments: publishedItems.reduce((sum, item) => sum + item.enrollment.enrolled, 0),
      averageRating: publishedItems.reduce((sum, item) => sum + item.rating.average, 0) / publishedItems.length,
      contentTypeCounts: Object.entries(CONTENT_TYPES).map(([id, name]) => ({
        contentTypeId: parseInt(id),
        contentType: name,
        count: publishedItems.filter(item => item.contentTypeId === parseInt(id)).length
      })).filter(ct => ct.count > 0)
    };

    return stats;
  }

  private getViewTypeStatistics(): {
    total: number;
    directView: { count: number; percentage: number; description: string };
    myLearning: { count: number; percentage: number; description: string };
    cart: { count: number; percentage: number; description: string };
    activeInMyLearning: number;
    activeInCart: number;
  } {
    const publishedItems = this.catalogData.filter(item => item.status === 'published');
    const total = publishedItems.length;
    
    const directViewCount = publishedItems.filter(item => item.viewType === 1).length;
    const myLearningCount = publishedItems.filter(item => item.viewType === 2).length;
    const cartCount = publishedItems.filter(item => item.viewType === 3).length;
    
    const activeInMyLearning = publishedItems.filter(item => item.isInMyLearning === true).length;
    const activeInCart = publishedItems.filter(item => item.isInCart === true).length;

    return {
      total,
      directView: {
        count: directViewCount,
        percentage: total > 0 ? Math.round((directViewCount / total) * 100) : 0,
        description: 'Content that can be viewed directly (videos, webpages, documents)'
      },
      myLearning: {
        count: myLearningCount,
        percentage: total > 0 ? Math.round((myLearningCount / total) * 100) : 0,
        description: 'Free content that can be added to learning lists'
      },
      cart: {
        count: cartCount,
        percentage: total > 0 ? Math.round((cartCount / total) * 100) : 0,
        description: 'Paid content that requires purchase'
      },
      activeInMyLearning,
      activeInCart
    };
  }

  // NEW ENHANCED MY LEARNING METHODS

  /**
   * Get detailed learning data with statistics
   */
  private async getMyLearningDetailed(
    userId: number,
    tab?: LearningTabType,
    filters?: LearningFilters,
    userContext?: UserContext
  ): Promise<any> {
    try {
      return await LearningService.getMyLearning(userContext!, tab, filters);
    } catch (error) {
      console.error('Error getting detailed learning data:', error);
      throw error;
    }
  }

  /**
   * Start learning an item
   */
  private async startLearning(itemId: string, userContext?: UserContext): Promise<any> {
    if (!userContext) {
      throw new Error('User context required');
    }
    
    try {
      return await LearningService.startLearning(itemId, userContext);
    } catch (error) {
      console.error('Error starting learning:', error);
      throw error;
    }
  }

  /**
   * Continue learning an item
   */
  private async continueLearning(itemId: string, userContext?: UserContext): Promise<any> {
    if (!userContext) {
      throw new Error('User context required');
    }
    
    try {
      return await LearningService.continueLearning(itemId, userContext);
    } catch (error) {
      console.error('Error continuing learning:', error);
      throw error;
    }
  }

  /**
   * Update learning progress
   */
  private async updateLearningProgress(
    itemId: string,
    progress: number,
    metadata?: Record<string, any>,
    userContext?: UserContext
  ): Promise<any> {
    if (!userContext) {
      throw new Error('User context required');
    }
    
    try {
      return await LearningService.updateProgress(itemId, progress, userContext, metadata);
    } catch (error) {
      console.error('Error updating learning progress:', error);
      throw error;
    }
  }

  /**
   * Get learning URL for content viewing
   */
  private async getLearningUrl(
    itemId: string,
    action: string,
    userContext?: UserContext
  ): Promise<any> {
    try {
      // Find the item in catalog
      const item = this.catalogData.find(item => item.id === itemId);
      
      if (!item) {
        throw new Error('Item not found');
      }

      // Generate URL based on content type and action
      const baseUrl = process.env.NEXT_PUBLIC_LEARNING_BASE_URL || '/learning';
      let url: string;
      
      switch (item.contentTypeId) {
        case 8: // Learning Module
          url = `${baseUrl}/module/${itemId}${action === 'continue' ? '?resume=true' : ''}`;
          break;
        case 9: // Assessment
          url = `${baseUrl}/assessment/${itemId}`;
          break;
        case 11: // Video
          url = `${baseUrl}/video/${itemId}`;
          break;
        case 14: // Document
          url = `${baseUrl}/document/${itemId}`;
          break;
        case 26: // eLearning Course
          url = `${baseUrl}/course/${itemId}${action === 'continue' ? '?resume=true' : ''}`;
          break;
        case 70: // Event
          url = `${baseUrl}/event/${itemId}`;
          break;
        default:
          url = item.directViewUrl || `${baseUrl}/content/${itemId}`;
      }

      return {
        success: true,
        url,
        openInNewTab: true
      };
    } catch (error) {
      console.error('Error getting learning URL:', error);
      return {
        success: false,
        message: 'Failed to get learning URL'
      };
    }
  }

  /**
   * Get learning analytics and insights
   */
  private async getLearningAnalytics(userContext?: UserContext): Promise<any> {
    if (!userContext) {
      throw new Error('User context required');
    }

    try {
      const learningData = await LearningService.getMyLearning(userContext);
      const items = learningData.items;
      
      // Calculate various analytics
      const analytics = {
        overview: learningData.stats,
        
        // Weekly progress (mock data for demo)
        weeklyProgress: this.generateWeeklyProgress(items),
        
        // Category breakdown
        categoryBreakdown: this.calculateCategoryBreakdown(items),
        
        // Time spent by content type
        timeByContentType: this.calculateTimeByContentType(items),
        
        // Completion trends
        completionTrends: this.calculateCompletionTrends(items),
        
        // Recommendations
        recommendations: this.generateRecommendations(items, userContext)
      };

      return analytics;
    } catch (error) {
      console.error('Error getting learning analytics:', error);
      throw error;
    }
  }

  /**
   * Get learning items with due dates
   */
  private async getLearningDueDates(userContext?: UserContext): Promise<any> {
    if (!userContext) {
      throw new Error('User context required');
    }
    
    try {
      const learningData = await LearningService.getMyLearning(userContext, 'due-dates');
      
      // Additional processing for calendar view
      const now = new Date();
      const calendar: {
        overdue: LearningItem[];
        today: LearningItem[];
        tomorrow: LearningItem[];
        thisWeek: LearningItem[];
        nextWeek: LearningItem[];
        thisMonth: LearningItem[];
        upcoming: LearningItem[];
      } = {
        overdue: [],
        today: [],
        tomorrow: [],
        thisWeek: [],
        nextWeek: [],
        thisMonth: [],
        upcoming: []
      };

      learningData.items.forEach((item: LearningItem) => {
        const dueDate = new Date(item.nextDueDate || item.dueDate!);
        const timeDiff = dueDate.getTime() - now.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        if (timeDiff < 0) {
          calendar.overdue.push(item);
        } else if (daysDiff === 0) {
          calendar.today.push(item);
        } else if (daysDiff === 1) {
          calendar.tomorrow.push(item);
        } else if (daysDiff <= 7) {
          calendar.thisWeek.push(item);
        } else if (daysDiff <= 14) {
          calendar.nextWeek.push(item);
        } else if (daysDiff <= 30) {
          calendar.thisMonth.push(item);
        } else {
          calendar.upcoming.push(item);
        }
      });

      return {
        ...learningData,
        calendar
      };
    } catch (error) {
      console.error('Error getting learning due dates:', error);
      throw error;
    }
  }

  /**
   * Get learning calendar for specific month
   */
  private async getLearningCalendar(
    month?: number,
    year?: number,
    userContext?: UserContext
  ): Promise<any> {
    if (!userContext) {
      throw new Error('User context required');
    }

    try {
      const learningData = await LearningService.getMyLearning(userContext);
      const targetDate = new Date(year || new Date().getFullYear(), month || new Date().getMonth());
      const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

      // Filter items with due dates in the target month
      const monthItems = learningData.items.filter(item => {
        const dueDate = item.nextDueDate || item.dueDate;
        if (!dueDate) return false;
        
        const itemDate = new Date(dueDate);
        return itemDate >= startOfMonth && itemDate <= endOfMonth;
      });

      // Group by day
      const calendarDays: Record<number, LearningItem[]> = {};
      monthItems.forEach(item => {
        const dueDate = new Date(item.nextDueDate || item.dueDate!);
        const dayKey = dueDate.getDate();
        
        if (!calendarDays[dayKey]) {
          calendarDays[dayKey] = [];
        }
        calendarDays[dayKey].push(item);
      });

      return {
        month: targetDate.getMonth(),
        year: targetDate.getFullYear(),
        days: calendarDays,
        totalItems: monthItems.length,
        itemsByStatus: {
          events: monthItems.filter(item => item.contentTypeId === 70).length,
          assignments: monthItems.filter(item => item.contentTypeId === 694).length,
          assessments: monthItems.filter(item => item.contentTypeId === 9).length,
          other: monthItems.filter(item => ![70, 694, 9].includes(item.contentTypeId)).length
        }
      };
    } catch (error) {
      console.error('Error getting learning calendar:', error);
      throw error;
    }
  }

  /**
   * Get My Learning resource data
   */
  private async getMyLearningResource(userContext?: UserContext): Promise<any> {
    if (!userContext) {
      throw new Error('User context required');
    }

    try {
      return await LearningService.getMyLearning(userContext);
    } catch (error) {
      console.error('Error getting my learning resource:', error);
      throw error;
    }
  }

  // HELPER METHODS FOR ANALYTICS

  /**
   * Generate weekly progress data
   */
  private generateWeeklyProgress(items: any[]): any[] {
    const weeks = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      // Mock calculation - in real app, would query actual progress data
      const progressCount = Math.floor(Math.random() * 5) + 1;
      const completionCount = Math.floor(Math.random() * 3);
      
      weeks.push({
        week: weekStart.toISOString().split('T')[0],
        progress: progressCount,
        completions: completionCount,
        timeSpent: (progressCount + completionCount) * 30 // rough estimate
      });
    }
    
    return weeks;
  }

  /**
   * Calculate category breakdown
   */
  private calculateCategoryBreakdown(items: any[]): any[] {
    const categoryMap = new Map();
    
    items.forEach(item => {
      const category = item.category || 'Other';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          category,
          total: 0,
          completed: 0,
          inProgress: 0,
          timeSpent: 0
        });
      }
      
      const categoryData = categoryMap.get(category);
      categoryData.total++;
      
      if (item.learningStatus === 'completed') {
        categoryData.completed++;
      } else if (item.learningStatus === 'in-progress') {
        categoryData.inProgress++;
      }
      
      categoryData.timeSpent += item.actualTimeSpent || 0;
    });
    
    return Array.from(categoryMap.values());
  }

  /**
   * Calculate time spent by content type
   */
  private calculateTimeByContentType(items: any[]): any[] {
    const typeMap = new Map();
    
    items.forEach(item => {
      const contentType = item.contentType || 'Other';
      if (!typeMap.has(contentType)) {
        typeMap.set(contentType, {
          contentType,
          totalTime: 0,
          itemCount: 0,
          averageTime: 0
        });
      }
      
      const typeData = typeMap.get(contentType);
      typeData.totalTime += item.actualTimeSpent || 0;
      typeData.itemCount++;
      typeData.averageTime = Math.round(typeData.totalTime / typeData.itemCount);
    });
    
    return Array.from(typeMap.values());
  }

  /**
   * Calculate completion trends
   */
  private calculateCompletionTrends(items: any[]): any {
    const last30Days = items.filter(item => {
      if (!item.completedAt) return false;
      const completedDate = new Date(item.completedAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return completedDate >= thirtyDaysAgo;
    });
    
    const last7Days = last30Days.filter(item => {
      const completedDate = new Date(item.completedAt);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return completedDate >= sevenDaysAgo;
    });
    
    return {
      last7Days: last7Days.length,
      last30Days: last30Days.length,
      trend: last7Days.length > (last30Days.length / 4) ? 'up' : 'down'
    };
  }

  /**
   * Generate personalized recommendations
   */
  private generateRecommendations(items: any[], userContext: UserContext): any[] {
    // Simple recommendation logic based on user's learning patterns
    const userCategories = [...new Set(items.map(item => item.category))];
    const userRoles = userContext.UserRoles.map(role => role.Name);
    
    // Mock recommendations - in real app, would use ML/AI
    const recommendations = [];
    
    if (userRoles.includes('Developer') || userCategories.includes('Programming')) {
      recommendations.push({
        id: 'rec-1',
        title: 'Advanced JavaScript Patterns',
        reason: 'Based on your programming interests',
        category: 'Programming',
        estimatedTime: '3 hours'
      });
    }
    
    if (userRoles.includes('Manager') || userCategories.includes('Leadership')) {
      recommendations.push({
        id: 'rec-2',
        title: 'Team Leadership Essentials',
        reason: 'Recommended for your role',
        category: 'Leadership',
        estimatedTime: '2 hours'
      });
    }

    if (userCategories.includes('Data Science')) {
      recommendations.push({
        id: 'rec-3',
        title: 'Advanced Machine Learning Techniques',
        reason: 'Continue your data science journey',
        category: 'Data Science',
        estimatedTime: '4 hours'
      });
    }

    if (userRoles.includes('Admin') || userRoles.includes('Site Admin')) {
      recommendations.push({
        id: 'rec-4',
        title: 'System Administration Best Practices',
        reason: 'Enhance your admin skills',
        category: 'System Administration',
        estimatedTime: '2.5 hours'
      });
    }

    // Add some general recommendations
    recommendations.push({
      id: 'rec-5',
      title: 'Communication Skills for Remote Teams',
      reason: 'Popular in your organization',
      category: 'Soft Skills',
      estimatedTime: '1.5 hours'
    });
    
    return recommendations.slice(0, 5); // Return top 5 recommendations
  }

  // UTILITY METHODS

  /**
   * Get content type by ID
   */
  public getContentTypeById(id: number): string {
    return CONTENT_TYPES[id as keyof typeof CONTENT_TYPES] || 'Unknown';
  }

  /**
   * Get content type ID by name
   */
  public getContentTypeId(name: string): number | null {
    const entry = Object.entries(CONTENT_TYPES).find(([_, typeName]) => 
      typeName.toLowerCase() === name.toLowerCase()
    );
    return entry ? parseInt(entry[0]) : null;
  }

  /**
   * Method to manually update ViewType for an item (admin function)
   */
  public updateItemViewType(itemId: string, viewType: 1 | 2 | 3, customUrl?: string): boolean {
    const itemIndex = this.catalogData.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      return false;
    }

    const item = this.catalogData[itemIndex];
    
    // Reset all ViewType-related properties
    const updatedItem: CatalogItem = {
      ...item,
      viewType,
      directViewUrl: undefined,
      isInMyLearning: false,
      isInCart: false
    };

    // Set appropriate properties based on new ViewType
    switch (viewType) {
      case 1:
        if (customUrl) {
          updatedItem.directViewUrl = customUrl;
        } else {
          // Generate default URL based on content type
          switch (item.contentTypeId) {
            case 36: // Webpage
              updatedItem.directViewUrl = `https://web-viewer.example.com/${itemId}`;
              break;
            case 11: // Video
              updatedItem.directViewUrl = `https://video-player.example.com/${itemId}`;
              break;
            case 14: // Document
              updatedItem.directViewUrl = `https://doc-viewer.example.com/${itemId}`;
              break;
            default:
              updatedItem.directViewUrl = `https://content-viewer.example.com/${itemId}`;
          }
        }
        break;
      case 2:
        // No additional properties needed for My Learning
        break;
      case 3:
        // Ensure item has price for cart ViewType
        if (!item.price || item.price.amount <= 0) {
          console.warn(`Item ${itemId} set to Cart ViewType but has no price`);
        }
        break;
    }

    this.catalogData[itemIndex] = updatedItem;
    return true;
  }

  /**
   * Method to bulk update ViewTypes based on business rules
   */
  public applyBusinessRulesForViewTypes(): number {
    let updatedCount = 0;
    
    this.catalogData.forEach((item, index) => {
      let newViewType: 1 | 2 | 3;
      
      // Apply business logic
      if (item.contentTypeId === 36 || item.contentTypeId === 11 || item.contentTypeId === 14) {
        newViewType = 1; // Direct View
      } else if (item.price && item.price.amount > 0) {
        newViewType = 3; // Cart
      } else {
        newViewType = 2; // My Learning
      }
      
      if (item.viewType !== newViewType) {
        this.updateItemViewType(item.id, newViewType);
        updatedCount++;
      }
    });
    
    return updatedCount;
  }

  /**
   * Get items by ViewType
   */
  public getItemsByViewType(viewType: 1 | 2 | 3, limit?: number): CatalogItem[] {
    const items = this.catalogData.filter(item => 
      item.status === 'published' && item.viewType === viewType
    );
    
    return limit ? items.slice(0, limit) : items;
  }

  /**
   * Get recommendations based on ViewType
   */
  public getRecommendationsByViewType(userContext: UserContext, viewType?: 1 | 2 | 3, limit: number = 5): CatalogItem[] {
    const publishedItems = this.catalogData.filter(item => item.status === 'published');
    
    // Filter by ViewType if specified
    const filteredItems = viewType 
      ? publishedItems.filter(item => item.viewType === viewType)
      : publishedItems;

    // Simple recommendation based on user roles and high ratings
    const userRoleNames = userContext.UserRoles.map(role => role.Name);
    let recommendedCategories: string[] = [];

    if (userRoleNames.includes('Author')) {
      recommendedCategories.push('Programming', 'Web Development', 'Content Creation');
    }
    if (userRoleNames.includes('Admin') || userRoleNames.includes('Site Admin')) {
      recommendedCategories.push('Project Management', 'Leadership', 'Security');
    }
    if (userRoleNames.includes('Learner')) {
      recommendedCategories.push('Programming', 'Data Science', 'Business Analytics');
    }

    const recommendations = filteredItems
      .filter(item => {
        // Include items from recommended categories or high-rated items
        return recommendedCategories.some(cat => 
          item.category.toLowerCase().includes(cat.toLowerCase())
        ) || item.rating.average >= 4.5;
      })
      .sort((a, b) => b.rating.average - a.rating.average)
      .slice(0, limit);

    return recommendations;
  }

  /**
   * Validation method to check ViewType consistency
   */
  public validateViewTypeConsistency(): {
    valid: boolean;
    issues: Array<{
      itemId: string;
      title: string;
      issue: string;
      suggestion: string;
    }>;
  } {
    const issues: Array<{
      itemId: string;
      title: string;
      issue: string;
      suggestion: string;
    }> = [];

    this.catalogData.forEach(item => {
      switch (item.viewType) {
        case 1: // Direct View
          if (!item.directViewUrl) {
            issues.push({
              itemId: item.id,
              title: item.title,
              issue: 'Direct View item missing directViewUrl',
              suggestion: 'Add a valid directViewUrl or change ViewType'
            });
          }
          if (item.isInMyLearning || item.isInCart) {
            issues.push({
              itemId: item.id,
              title: item.title,
              issue: 'Direct View item should not be in My Learning or Cart',
              suggestion: 'Reset isInMyLearning and isInCart to false'
            });
          }
          break;

        case 2: // My Learning
          if (item.directViewUrl) {
            issues.push({
              itemId: item.id,
              title: item.title,
              issue: 'My Learning item should not have directViewUrl',
              suggestion: 'Remove directViewUrl or change ViewType to Direct View'
            });
          }
          if (item.isInCart) {
            issues.push({
              itemId: item.id,
              title: item.title,
              issue: 'My Learning item should not be in Cart',
              suggestion: 'Reset isInCart to false'
            });
          }
          break;

        case 3: // Cart
          if (!item.price || item.price.amount <= 0) {
            issues.push({
              itemId: item.id,
              title: item.title,
              issue: 'Cart item must have a valid price',
              suggestion: 'Add a price or change ViewType to My Learning'
            });
          }
          if (item.directViewUrl) {
            issues.push({
              itemId: item.id,
              title: item.title,
              issue: 'Cart item should not have directViewUrl',
              suggestion: 'Remove directViewUrl or change ViewType to Direct View'
            });
          }
          if (item.isInMyLearning) {
            issues.push({
              itemId: item.id,
              title: item.title,
              issue: 'Cart item should not be in My Learning',
              suggestion: 'Reset isInMyLearning to false'
            });
          }
          break;
      }
    });

    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Method to fix ViewType issues automatically
   */
  public autoFixViewTypeIssues(): number {
    const validation = this.validateViewTypeConsistency();
    let fixedCount = 0;

    validation.issues.forEach(issue => {
      const item = this.catalogData.find(item => item.id === issue.itemId);
      if (!item) return;

      const itemIndex = this.catalogData.findIndex(catalogItem => catalogItem.id === issue.itemId);
      if (itemIndex === -1) return;

      let wasFixed = false;

      // Apply automatic fixes based on issue type
      if (issue.issue.includes('missing directViewUrl') && item.viewType === 1) {
        // Generate directViewUrl for Direct View items
        let directViewUrl: string;
        switch (item.contentTypeId) {
          case 36:
            directViewUrl = `https://web-viewer.example.com/${item.id}`;
            break;
          case 11:
            directViewUrl = `https://video-player.example.com/${item.id}`;
            break;
          case 14:
            directViewUrl = `https://doc-viewer.example.com/${item.id}`;
            break;
          default:
            directViewUrl = `https://content-viewer.example.com/${item.id}`;
        }
        
        this.catalogData[itemIndex] = {
          ...this.catalogData[itemIndex],
          directViewUrl
        };
        wasFixed = true;
      }

      // Reset invalid flags
      if (issue.issue.includes('should not be in My Learning')) {
        this.catalogData[itemIndex] = {
          ...this.catalogData[itemIndex],
          isInMyLearning: false
        };
        wasFixed = true;
      }

      if (issue.issue.includes('should not be in Cart')) {
        this.catalogData[itemIndex] = {
          ...this.catalogData[itemIndex],
          isInCart: false
        };
        wasFixed = true;
      }

      if (issue.issue.includes('should not have directViewUrl')) {
        this.catalogData[itemIndex] = {
          ...this.catalogData[itemIndex],
          directViewUrl: undefined
        };
        wasFixed = true;
      }

      if (wasFixed) {
        fixedCount++;
      }
    });

    return fixedCount;
  }
}

// Export singleton instance
export const catalogMCPServer = new CatalogMCPServer();
