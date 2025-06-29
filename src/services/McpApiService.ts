// src/services/UpdatedMcpApiService.ts
// Updated MCP API Service to work with your actual API response format

import type { UserContext } from '@/types';
import type { CatalogItem } from '@/types/Catalog';
import type { LearningItem } from '@/types/Learning'; 
import { API_CONFIG } from '@/config/api.config';
// Your actual API response structure
interface InstancyApiResponse {
  CourseList: InstancyCourseItem[];
  CourseCount: number;
  CategoryDTO: any[];
}

interface InstancyCourseItem {
  ContentID: string;
  Title: string;
  ShortDescription: string;
  ContentTypeId: number;
  ContentType: string;
  AuthorDisplayName: string;
  ThumbnailImagePath: string;
  RatingID: string;
  TotalRatings: string;
  NoofUsersEnrolled: string;
  ViewType: number;
  AddLink: string;
  DetailsLink: string;
  ViewLink: string;
  DetailspopupTags: string;
  isContentEnrolled: string;
  ContentStatus: string;
  PercentCompleted: string;
  PercentCompletedClass: string;
  CreatedOn: string;
  Duration: string;
  Credits: string;
  Currency: string;
  SalePrice: string;
  ListPrice: string;
  FreePrice: string;
  isaddtomylearninglogo: string;
  AddLinkTitle: string;
  SiteId: number;
  ScoID: string;
  FolderPath?: string;
  // ... many other properties from your API response
}

// API Configuration
interface McpApiConfig {
  baseUrl: string;
  clientUrl: string;
  timeout: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export class UpdatedMcpApiService {
  private config: McpApiConfig;
  private userContext: UserContext | null = null;

  constructor(config: McpApiConfig) {
    this.config = config;
  }

  // Set user context for authentication
  setUserContext(userContext: UserContext) {
    this.userContext = userContext;
  }

  // Generic API call method
  private async callApi<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
    if (!this.userContext) {
      throw new Error('User context not set. Please authenticate first.');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'ClientURL': this.config.clientUrl,
      'UserID': this.userContext.UserID.toString(),
      'SiteID': this.userContext.SiteID.toString(),
    };

    // Add authorization token
    if (this.userContext.JwtToken) {
      headers['Authorization'] = `Bearer ${this.userContext.JwtToken}`;
    }

    try {
      const url = `${this.config.baseUrl}${endpoint}`;
      console.debug('API Call:', { url, method, headers });

      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(this.config.timeout)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.debug('API Response:', data);
      
      return data;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  // Search catalog using your API structure
  async searchCatalog(params: {
    pageIndex?: number;
    pageSize?: number;
    searchText?: string;
    categories?: string;
    objectTypes?: string;
    sortBy?: string;
    additionalFilter?: string;
  } = {}): Promise<{ items: CatalogItem[]; total: number; hasMore: boolean }> {
    try {
      // Construct query parameters for your API
      const queryParams = new URLSearchParams({
        pageIndex: (params.pageIndex || 1).toString(),
        pageSize: (params.pageSize || 10).toString(),
        searchStr: params.searchText || '',
        ComponentID: '1',
        ComponentInsID: '3131',
        UserID: this.userContext?.UserID.toString() || '1',
        SiteID: this.userContext?.SiteID.toString() || '374',
        OrgUnitID: this.userContext?.SiteID?.toString() || '374',
        Locale: 'en-us',
        categories: params.categories || '',
        objecttypes: params.objectTypes || '',
        sortBy: params.sortBy || '',
        additionalFilter: params.additionalFilter || ''
      });

      const endpoint = `/api/catalog/getCatalogObjects?${queryParams.toString()}`;
      const result: InstancyApiResponse = await this.callApi(endpoint);

      return {
        items: this.transformCatalogItems(result.CourseList || []),
        total: result.CourseCount || 0,
        hasMore: (params.pageIndex || 1) * (params.pageSize || 10) < (result.CourseCount || 0)
      };
    } catch (error) {
      console.error('Search catalog failed:', error);
      throw error;
    }
  }

  // Get catalog item details
  async getCatalogItemDetails(contentId: string): Promise<CatalogItem> {
    try {
      const queryParams = new URLSearchParams({
        contentId,
        siteId: this.userContext?.SiteID.toString() || '374',
        userId: this.userContext?.UserID.toString() || '1',
        locale: 'en-us',
        componentId: '1',
        componentInsId: '3131',
        orgUnitId: this.userContext?.SiteID?.toString() || '374'
      });

      const endpoint = `/api/catalog/getCatalogObjectDetails?${queryParams.toString()}`;
      const result = await this.callApi(endpoint);
      
      return this.transformCatalogItem(result as InstancyCourseItem);
    } catch (error) {
      console.error('Get catalog item details failed:', error);
      throw error;
    }
  }

  // Add to My Learning
  async addToMyLearning(contentId: string): Promise<ApiResponse<any>> {
    try {
      const body = {
        userId: this.userContext?.UserID || 1,
        siteId: this.userContext?.SiteID || 374,
        selectedContent: contentId,
        componentId: 1,
        componentInsId: 3131,
        locale: 'en-us',
        orgUnitId: this.userContext?.SiteID || 374,
        additionalParams: '',
        outputType: 'HTML',
        multiInstanceEventEnroll: false
      };

      const result = await this.callApi('/api/catalog/addToMyLearning', 'POST', body) as { IsSuccess?: boolean; Message?: string; [key: string]: any };
      
      return {
        success: result.IsSuccess || true,
        message: result.Message || 'Item added to My Learning',
        data: result
      };
    } catch (error) {
      console.error('Add to My Learning failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add to My Learning'
      };
    }
  }

  // Get My Learning items
  async getMyLearning(params: {
    pageIndex?: number;
    pageSize?: number;
    searchText?: string;
    source?: string;
    type?: string;
    sortBy?: string;
  } = {}): Promise<{ items: LearningItem[]; total: number; hasMore: boolean }> {
    try {
      const queryParams = new URLSearchParams({
        pageIndex: (params.pageIndex || 1).toString(),
        pageSize: (params.pageSize || 10).toString(),
        searchStr: params.searchText || '',
        source: params.source || '',
        type: params.type || '',
        sortBy: params.sortBy || '',
        componentId: '3',
        userId: this.userContext?.UserID.toString() || '1',
        siteId: this.userContext?.SiteID.toString() || '374',
        orgUnitId: this.userContext?.SiteID?.toString() || '374',
        locale: 'en-us'
      });

      const endpoint = `/api/learning/getMyLearningObjects?${queryParams.toString()}`;
      const result: InstancyApiResponse = await this.callApi(endpoint);

      return {
        items: this.transformLearningItems(result.CourseList || []),
        total: result.CourseCount || 0,
        hasMore: (params.pageIndex || 1) * (params.pageSize || 10) < (result.CourseCount || 0)
      };
    } catch (error) {
      console.error('Get My Learning failed:', error);
      throw error;
    }
  }

  // Get catalog categories
  async getCatalogCategories(): Promise<string[]> {
    try {
      const queryParams = new URLSearchParams({
        type: 'category',
        componentId: '1',
        siteId: this.userContext?.SiteID.toString() || '374',
        userId: this.userContext?.UserID.toString() || '1',
        locale: 'en-us'
      });

      const endpoint = `/api/catalog/getCategoriesForBrowse?${queryParams.toString()}`;
      const result = await this.callApi(endpoint);
      
      return (result as any[]).map((cat: any) => cat.Name || cat.name).filter(Boolean);
    } catch (error) {
      console.error('Get catalog categories failed:', error);
      return [];
    }
  }

  // Transform API response to CatalogItem format
  private transformCatalogItems(apiItems: InstancyCourseItem[]): CatalogItem[] {
    return apiItems.map(item => this.transformCatalogItem(item));
  }

  private transformCatalogItem(apiItem: InstancyCourseItem): CatalogItem {
    // Parse tags from DetailspopupTags
    const tags = apiItem.DetailspopupTags 
      ? apiItem.DetailspopupTags.split(',').map(tag => tag.trim()).filter(Boolean)
      : [];

    // Parse enrollment count
    const enrollmentCount = parseInt(apiItem.NoofUsersEnrolled) || 0;

    // Parse rating
    const rating = parseFloat(apiItem.RatingID) || 0;
    const totalRatings = parseInt(apiItem.TotalRatings) || 0;

    // Determine price
    let price: { amount: number; currency: string } | undefined;
    if (apiItem.SalePrice && parseFloat(apiItem.SalePrice) > 0) {
      price = {
        amount: parseFloat(apiItem.SalePrice),
        currency: apiItem.Currency || 'USD'
      };
    } else if (apiItem.ListPrice && parseFloat(apiItem.ListPrice) > 0) {
      price = {
        amount: parseFloat(apiItem.ListPrice),
        currency: apiItem.Currency || 'USD'
      };
    }

    // Build thumbnail image URL
    const thumbnailImagePath = apiItem.ThumbnailImagePath?.startsWith('/') 
      ? `${window.location.origin}${apiItem.ThumbnailImagePath}`
      : apiItem.ThumbnailImagePath || '/api/placeholder/300/200';

    return {
      id: apiItem.ContentID,
      title: apiItem.Title || 'Untitled',
      description: apiItem.ShortDescription || '',
      contentTypeId: apiItem.ContentTypeId || 8,
      contentType: apiItem.ContentType || 'Learning Module',
      category: this.extractCategoryFromTags(tags) || 'General',
      difficulty: this.mapDifficultyFromTags(tags),
      duration: this.parseDuration(apiItem.Duration) || 60,
      thumbnail: thumbnailImagePath,
      author: {
        id: `author-${apiItem.SiteId}`,
        name: apiItem.AuthorDisplayName || 'Unknown Author',
        avatar: '/api/placeholder/40/40'
      },
      tags,
      rating: {
        average: rating,
        count: totalRatings
      },
      enrollment: {
        enrolled: enrollmentCount
      },
      status: 'published',
      createdAt: apiItem.CreatedOn || new Date().toISOString(),
      updatedAt: apiItem.CreatedOn || new Date().toISOString(),
      price,
      prerequisites: [],
      learningObjectives: [],
      metadata: {
        estimatedCompletionTime: apiItem.Duration || 'Varies',
        certificateAvailable: false
      },
      pathItems: [],
      isPartOfPath: [],
      viewType: apiItem.ViewType as (1 | 2 | 3) || 2,
      directViewUrl: apiItem.ViewLink || undefined,
      isInMyLearning: apiItem.isContentEnrolled === 'True' || apiItem.isaddtomylearninglogo === '1',
      isInCart: false,
      folderPath: apiItem.FolderPath
    };
  }

  private transformLearningItems(apiItems: InstancyCourseItem[]): LearningItem[] {
    return apiItems.map(item => this.transformLearningItem(item));
  }

  private transformLearningItem(apiItem: InstancyCourseItem): LearningItem {
    const baseItem = this.transformCatalogItem(apiItem);
    
    // Parse progress
    const progress = parseInt(apiItem.PercentCompleted) || 0;
    
    // Parse learning status from ContentStatus
    const learningStatus = this.mapLearningStatusFromContentStatus(apiItem.ContentStatus, apiItem.PercentCompletedClass);
    
    return {
      ...baseItem,
      learningStatus,
      progress,
      score: undefined, // Would need to be in API response
      completionStatus: this.mapCompletionStatusFromClass(apiItem.PercentCompletedClass),
      lastAccessed: undefined, // Would need to be in API response
      completedAt: undefined, // Would need to be in API response
      enrolledAt: '', // Would need to be in API response
      dueDate: undefined, // Would need to be in API response
      nextDueDate: undefined, // Would need to be in API response
      isOverdue: false,
      daysToDue: 0,
      actualTimeSpent: 0,
      estimatedTimeRemaining: undefined,
      certificateEarned: false,
      instructor: undefined,
      location: undefined
    };
  }

  // Helper methods for data transformation
  private extractCategoryFromTags(tags: string[]): string {
    // Try to find a category-like tag
    const categoryKeywords = ['programming', 'web development', 'data science', 'management', 'design', 'marketing'];
    for (const tag of tags) {
      const lowercaseTag = tag.toLowerCase();
      for (const keyword of categoryKeywords) {
        if (lowercaseTag.includes(keyword)) {
          return keyword.charAt(0).toUpperCase() + keyword.slice(1);
        }
      }
    }
    return 'General';
  }

  private mapDifficultyFromTags(tags: string[]): 'beginner' | 'intermediate' | 'advanced' {
    const tagString = tags.join(' ').toLowerCase();
    if (tagString.includes('beginner') || tagString.includes('basic') || tagString.includes('intro')) {
      return 'beginner';
    }
    if (tagString.includes('advanced') || tagString.includes('expert') || tagString.includes('master')) {
      return 'advanced';
    }
    return 'intermediate';
  }

  private parseDuration(duration: string): number {
    if (!duration) return 60;
    
    // Try to extract numbers from duration string
    const matches = duration.match(/\d+/);
    if (matches) {
      return parseInt(matches[0]);
    }
    
    return 60; // Default duration
  }

  private mapLearningStatusFromContentStatus(
    contentStatus: string,
    percentCompletedClass: string
  ): 'not attempted'|'incomplete' | 'registered' | 'completed' | 'grade' |'attended'| 'notattended'|'passed'|'failed'|'completed' {
    if (!contentStatus && !percentCompletedClass) return 'not attempted';

    const statusLower = contentStatus.toLowerCase();
    const classLower = percentCompletedClass?.toLowerCase() || '';

    if (statusLower.includes('completed') || classLower.includes('complete')) {
      return 'completed';
    }
    if (statusLower.includes('progress') || classLower.includes('progress')) {
      return 'incomplete';
    }
    if (statusLower.includes('registered') || statusLower.includes('enrolled')) {
      return 'registered';
    }
    if (statusLower.includes('pending') || statusLower.includes('review')) {
      return 'grade';
    }

    return 'incomplete';
  }

  private mapCompletionStatusFromClass(
    percentCompletedClass: string
  ): 'completed' | 'grade' |'attended'| 'notattended'|'passed'|'failed'| undefined {
    if (!percentCompletedClass) return undefined;

    const classLower = percentCompletedClass.toLowerCase();

    if (classLower.includes('passed')) return 'passed';
    if (classLower.includes('failed')) return 'failed';
    if (classLower.includes('attended')) return 'attended';
    if (classLower.includes('not-attended')) return undefined;

    return undefined;
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/health`, {
        method: 'GET',
        headers: {
          'ClientURL': this.config.clientUrl
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Factory function to create updated MCP API service
export function createUpdatedMcpApiService(config: Partial<McpApiConfig> = {}): UpdatedMcpApiService {
  const defaultConfig: McpApiConfig = {
    baseUrl: API_CONFIG.LearnerURL || 'http://localhost:5000',
    clientUrl: API_CONFIG.LearnerURL || 'http://localhost:3000',
    timeout: 30000,
    ...config
  };

  return new UpdatedMcpApiService(defaultConfig);
}

// Singleton instance
export const updatedMcpApiService = createUpdatedMcpApiService();