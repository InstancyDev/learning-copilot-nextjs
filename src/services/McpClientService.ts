// Complete Fixed McpClientService.ts - Updated with callTool method for LearningService

import type { UserContext } from '@/types';
import type { CatalogItem, SearchFilters, SearchResult } from '@/types/Catalog';
import type { LearningItem, LearningListResponse } from '@/types/Learning';
import { API_CONFIG } from '@/config/api.config';

interface McpRequest {
  jsonrpc: string;
  id: string | number;
  method: string;
  params?: any;
}

interface McpResponse {
  jsonrpc: string;
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

interface McpToolCall {
  name: string;
  arguments: Record<string, any>;
}

export class McpClientService {
  private baseUrl: string;
  private userContext: UserContext | null = null;
  private requestId = 0;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || `${API_CONFIG.WebAPIURL}mcp`;
  }

  setUserContext(userContext: UserContext) {
    this.userContext = userContext;
  }

  private generateRequestId(): number {
    return ++this.requestId;
  }

  private async makeRequest(method: string, params?: any): Promise<any> {
    if (!this.userContext) {
      throw new Error('User context not set. Please authenticate first.');
    }

    const request: McpRequest = {
      jsonrpc: "2.0",
      id: this.generateRequestId(),
      method,
      params
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'ClientURL': API_CONFIG.LearnerURL || window.location.origin,
      'UserID': this.userContext.UserID.toString(),
      'SiteID': this.userContext.SiteID.toString(),
    };

    // Add authorization using the JWT token
    if (this.userContext.JwtToken) {
      headers['Authorization'] = `Bearer ${this.userContext.JwtToken}`;
    }

    try {
      console.log('MCP Request:', { url: this.baseUrl, method, params, headers });

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const mcpResponse: McpResponse = await response.json();
      console.log('MCP Response:', mcpResponse);

      if (mcpResponse.error) {
        throw new Error(`MCP Error ${mcpResponse.error.code}: ${mcpResponse.error.message}`);
      }

      return mcpResponse.result;
    } catch (error) {
      console.error('MCP request failed:', error);
      throw error;
    }
  }

  /**
   * Public method to call MCP tools - Used by LearningService and other services
   */
  async callTool(toolCall: McpToolCall): Promise<any> {
    console.log('🔧 Calling MCP tool:', toolCall.name, 'with arguments:', toolCall.arguments);
    
    try {
      const result = await this.makeRequest('tools/call', {
        name: toolCall.name,
        arguments: toolCall.arguments
      });
      
      console.log('✅ MCP tool result for', toolCall.name, ':', result);
      return result;
    } catch (error) {
      console.error('❌ MCP tool call failed for', toolCall.name, ':', error);
      throw error;
    }
  }

  // Initialize connection
  async initialize(): Promise<any> {
    return this.makeRequest('initialize', {
      protocolVersion: "2024-11-05",
      clientInfo: {
        name: "Learning Copilot",
        version: "1.0.0"
      },
      capabilities: {
        tools: {}
      }
    });
  }

  // List available tools
  async listTools(): Promise<any> {
    return this.makeRequest('tools/list');
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl.replace('/api/mcp', '/api/mcp/health')}`, {
        method: 'GET',
        headers: {
          'ClientURL': API_CONFIG.LearnerURL || window.location.origin
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // CATALOG OPERATIONS using MCP tools

  /**
   * Search catalog using MCP get_catalog_objects tool
   */
  async searchCatalog(filters: SearchFilters & {
    pageIndex?: number;
    pageSize?: number;
  } = {}): Promise<SearchResult> {
    try {
      const arguments_: any = {
        pageIndex: Math.floor((filters.offset || 0) / (filters.limit || 10)) + 1,
        pageSize: filters.limit || 12,
        searchText: filters.query || '',
        componentId: 1,
        componentInsId: 3131,
        userId: this.userContext?.UserID || -1,
        siteId: this.userContext?.SiteID || 374,
        orgUnitId: this.userContext?.SiteID?.toString() || '374',
        locale: 'en-us',
        categories: filters.category || '',
        objectTypes: filters.contentType || '',
        sortBy: filters.sortBy || '',
        additionalFilter: '',
        additionalParams: ''
      };

      // Add content type ID filter if specified
      if (filters.contentTypeId) {
        arguments_.additionalFilter = `ContentTypeId:${filters.contentTypeId}`;
      }

      // Add difficulty filter
      if (filters.difficulty) {
        const difficultyFilter = `Difficulty:${filters.difficulty}`;
        arguments_.additionalFilter = arguments_.additionalFilter 
          ? `${arguments_.additionalFilter},${difficultyFilter}`
          : difficultyFilter;
      }

      const result = await this.callTool({
        name: 'get_catalog_objects',
        arguments: arguments_
      });

      return this.transformCatalogResponse(result);
    } catch (error) {
      console.error('MCP search catalog failed:', error);
      throw error;
    }
  }

  /**
   * Get catalog item details using MCP get_catalog_object_details tool
   */
  async getCatalogItemDetails(contentId: string): Promise<CatalogItem> {
    try {
      const result = await this.callTool({
        name: 'get_catalog_object_details',
        arguments: {
          contentId,
          siteId: this.userContext?.SiteID || 374,
          userId: this.userContext?.UserID || 1,
          locale: 'en-us',
          componentId: 1,
          componentInsId: 3131,
          orgUnitId: this.userContext?.SiteID?.toString() || '374'
        }
      });

      return this.transformCatalogItem(result);
    } catch (error) {
      console.error('MCP get catalog item details failed:', error);
      throw error;
    }
  }

  /**
   * Get catalog categories using MCP get_category_for_browse tool - FIXED response parsing
   */
  async getCatalogCategories(): Promise<string[]> {
    try {
      console.log('🔍 Getting catalog categories via MCP...');
      
      const result = await this.callTool({
        name: 'get_category_for_browse',
        arguments: {
          type: 'cat',
          componentId: 1,
          siteId: this.userContext?.SiteID || 374,
          userId: this.userContext?.UserID || 1,
          locale: 'en-us'
        }
      });

      console.log('Raw MCP categories result:', result);

      // Handle different MCP response formats for categories
      let categoriesData;
      
      // Check if result has content array (standard MCP format)
      if (result && result.content && Array.isArray(result.content)) {
        const textContent = result.content[1];
        if (textContent && textContent.text) {
          try {
            // Try to parse as JSON first
            categoriesData = JSON.parse(textContent.text);
            console.log('Parsed categories JSON:', categoriesData);
          } catch (parseError) {
            console.warn('Could not parse categories as JSON, trying direct text:', textContent.text);
            // If not JSON, try to split by common delimiters
            categoriesData = textContent.text.split(/[,\n]/).map((cat: string) => cat.trim()).filter(Boolean);
          }
        }
      }  
      console.log('Final categories data:', categoriesData);
      return categoriesData; 

    } catch (error) {
      console.error('❌ MCP get catalog categories failed:', error);
      console.log('🔄 Using fallback categories due to error');
      return this.getFallbackCategories();
    }
  }

  /**
   * Fallback categories when MCP fails
   */
  private getFallbackCategories(): string[] {
    return [
      'Artificial Intelligence',
      'Business',
      'Communication',
      'Compliance',
      'CRM Software',
      'Customer Service',
      'Data Analysis',
      'Finance & Accounting',
      'Healthcare',
      'Human Resources',
      'Leadership',
      'Microsoft Office',
      'Project Management',
      'Professional Development',
      'Safety',
      'Sales & Marketing',
      'Software Training',
      'Technology',
      'Workplace Health'
    ];
  }

  /**
   * Get content recommendations using MCP get_recommendation_content tool
   */
  async getRecommendations(): Promise<CatalogItem[]> {
    try {
      const result = await this.callTool({
        name: 'get_recommendation_content',
        arguments: {
          siteId: this.userContext?.SiteID || 374,
          userId: this.userContext?.UserID || 1,
          componentInsId: 3131,
          locale: 'en-us',
          componentId: 303
        }
      });

      return this.transformRecommendationsResponse(result);
    } catch (error) {
      console.error('MCP get recommendations failed:', error);
      return [];
    }
  }

  // MY LEARNING OPERATIONS

  /**
   * Add to My Learning using MCP tool
   */
  async addToMyLearning(contentId: string): Promise<{ success: boolean; message: string }> {
    try {
      const result = await this.callTool({
        name: 'add_to_my_learning',
        arguments: {
          userId: this.userContext?.UserID,
          siteId: this.userContext?.SiteID,
          selectedContent: contentId,
          componentId: 1,
          componentInsId: 3131,
          locale: 'en-us',
          orgUnitId: this.userContext?.SiteID,
          additionalParams: '',
          outputType: 'HTML',
          multiInstanceEventEnroll: false
        }
      });

      // Handle the MCP response format
      let success = false;
      let message = 'Unknown response';

      if (result && result.content && Array.isArray(result.content)) {
        // Extract success info from MCP tool response
        const textContent = result.content.find((c: any) => c.type === 'text');
        if (textContent && textContent.text) {
          if (textContent.text.includes('Successfully')) {
            success = true;
            message = 'Item added to My Learning successfully';
          } else if (textContent.text.includes('Error')) {
            success = false;
            message = textContent.text;
          }
        }
      } else if (result && result.Content && Array.isArray(result.Content)) {
        // Alternative MCP response format
        const textContent = result.Content.find((c: any) => c.Type === 'text');
        if (textContent && textContent.Text) {
          if (textContent.Text.includes('Successfully')) {
            success = true;
            message = 'Item added to My Learning successfully';
          } else if (textContent.Text.includes('Error')) {
            success = false;
            message = textContent.Text;
          }
        }
      } else {
        // Assume success if we got any response
        success = true;
        message = 'Item added to My Learning successfully';
      }

      return { success, message };
    } catch (error) {
      console.error('MCP add to learning failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to add to My Learning'
      };
    }
  }

  // TRANSFORMATION METHODS

  /**
   * Transform MCP catalog response to SearchResult format - FIXED for your API
   */
  private transformCatalogResponse(mcpResult: any): SearchResult {
    try {
      console.log('Transforming MCP result:', mcpResult);
      
      let catalogData;
      
      // Handle the actual MCP response structure from your API
      if (mcpResult.content && Array.isArray(mcpResult.content)) {
        // Find the JSON content in the MCP response
        const jsonContent = mcpResult.content.find((c: any) => 
          c.type === 'text' && c.text && c.text.includes('CourseList')
        );
        
        if (jsonContent && jsonContent.text) {
          try {
            catalogData = JSON.parse(jsonContent.text);
          } catch (parseError) {
            console.error('Failed to parse JSON from MCP response:', parseError);
            // Try to extract JSON from the text
            const jsonMatch = jsonContent.text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              catalogData = JSON.parse(jsonMatch[0]);
            }
          }
        }
      }
      
      // Fallback: if mcpResult is already the parsed data
      if (!catalogData && mcpResult.CourseList) {
        catalogData = mcpResult;
      }
      
      // Fallback: if mcpResult.Content exists (alternative structure)
      if (!catalogData && mcpResult.Content && Array.isArray(mcpResult.Content)) {
        const jsonContent = mcpResult.Content.find((c: any) => 
          c.Type === 'text' && c.Text && c.Text.includes('CourseList')
        );
        if (jsonContent) {
          catalogData = JSON.parse(jsonContent.Text);
        }
      }

      if (!catalogData) {
        console.warn('Could not extract catalog data from MCP response');
        return { items: [], total: 0, hasMore: false };
      }

      console.log('Extracted catalog data:', catalogData);

      const items = (catalogData.CourseList || []).map((item: any) => this.transformCatalogItem(item));
      const total = catalogData.CourseCount || items.length;
      
      console.log('Transformed items:', items.length, 'Total:', total);
      
      return {
        items,
        total,
        hasMore: total > items.length
      };
    } catch (error) {
      console.error('Error transforming catalog response:', error);
      return { items: [], total: 0, hasMore: false };
    }
  }

  /**
   * Transform individual catalog item from MCP to CatalogItem format - UPDATED for your API
   */
  private transformCatalogItem(apiItem: any): CatalogItem {
    console.log('Transforming catalog item:', apiItem.Title);
    
    // Parse tags from DetailspopupTags
    const tags = apiItem.DetailspopupTags 
      ? apiItem.DetailspopupTags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
      : [];

    // Parse enrollment and rating
    const enrollmentCount = parseInt(apiItem.NoofUsersEnrolled) || 0;
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

    // Build thumbnail URL - Handle your API's image paths
    let thumbnailImagePath = apiItem.ThumbnailImagePath || '/api/placeholder/300/200';
    if (thumbnailImagePath.startsWith('/Content/')) {
      // Prepend your server URL for relative paths
      thumbnailImagePath = `${API_CONFIG.LearnerURL}${thumbnailImagePath}`;
    }

    // Extract category from tags or use a default
    const category = this.extractCategoryFromTags(tags) || 'General';
    
    // Map difficulty from tags or default to intermediate
    const difficulty = this.mapDifficultyFromTags(tags);
    
    // Parse duration from your API format
    const duration = this.parseDuration(apiItem.Duration) || 60;

    var isContentInMyLeaning = false; 
    if(apiItem.AddLink=="")
    {
      isContentInMyLeaning = true; // If addLink is empty, assume it's already in My Learning
    }
    return {
      id: apiItem.ContentID,
      title: apiItem.Title || apiItem.ContentName || 'Untitled',
      description: apiItem.ShortDescription || '',
      contentTypeId: apiItem.ContentTypeId || 8,
      contentType: apiItem.ContentType || 'Learning Module',
      category,
      difficulty,
      duration,
      thumbnail: thumbnailImagePath,
      author: {
        id: `author-${apiItem.SiteId || 1}`,
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
        certificateAvailable: false,
        scoId: apiItem.ScoID || apiItem.ContentScoID,
        folderPath: apiItem.FolderPath,
        startPage: apiItem.startpage
      },
      pathItems: [],
      isPartOfPath: [],
      viewType: (apiItem.ViewType as (1 | 2 | 3)) || this.determineViewType(apiItem),
      directViewUrl: apiItem.ViewLink || undefined,       
      isInMyLearning: isContentInMyLeaning,
      isInCart: false, // Your API doesn't seem to have cart info yet
      folderPath: apiItem.FolderPath,
      EnrollNowLink: apiItem.EnrollNowLink || '', // Link to enroll directly if available
    };
  }

  /**
   * Transform recommendations response
   */
  private transformRecommendationsResponse(mcpResult: any): CatalogItem[] {
    try {
      let data = mcpResult;
      
      if (mcpResult.content && Array.isArray(mcpResult.content)) {
        const jsonContent = mcpResult.content.find((c: any) => 
          c.type === 'text' && c.text.includes('CourseDTO')
        );
        if (jsonContent) {
          data = JSON.parse(jsonContent.text);
        }
      }

      const recommendations: CatalogItem[] = [];
      
      if (data.CourseDTO && Array.isArray(data.CourseDTO)) {
        data.CourseDTO.forEach((category: any) => {
          if (category.CourseList && Array.isArray(category.CourseList)) {
            category.CourseList.forEach((item: any) => {
              recommendations.push(this.transformCatalogItem(item));
            });
          }
        });
      }

      return recommendations.slice(0, 10); // Limit to top 10 recommendations
    } catch (error) {
      console.error('Error transforming recommendations response:', error);
      return [];
    }
  }

  // HELPER METHODS

  private extractCategoryFromTags(tags: string[]): string {
    const categoryKeywords = ['ai', 'artificial intelligence', 'microsoft', 'zoho', 'crm', 'outlook', 'ergonomics', 'workplace', 'productivity'];
    for (const tag of tags) {
      const lowercaseTag = tag.toLowerCase();
      for (const keyword of categoryKeywords) {
        if (lowercaseTag.includes(keyword)) {
          if (keyword.includes('ai') || keyword.includes('artificial')) return 'Artificial Intelligence';
          if (keyword.includes('microsoft') || keyword.includes('outlook')) return 'Microsoft Office';
          if (keyword.includes('zoho') || keyword.includes('crm')) return 'CRM Software';
          if (keyword.includes('ergonomics') || keyword.includes('workplace')) return 'Workplace Health';
          return keyword.charAt(0).toUpperCase() + keyword.slice(1);
        }
      }
    }
    return 'General';
  }

  private mapDifficultyFromTags(tags: string[]): 'beginner' | 'intermediate' | 'advanced' {
    const tagString = tags.join(' ').toLowerCase();
    if (tagString.includes('beginner') || tagString.includes('basic') || tagString.includes('intro') || tagString.includes('essential')) {
      return 'beginner';
    }
    if (tagString.includes('advanced') || tagString.includes('expert') || tagString.includes('master')) {
      return 'advanced';
    }
    return 'intermediate';
  }

  private parseDuration(duration: string): number {
    if (!duration) return 60;
    
    const matches = duration.match(/\d+/);
    if (matches) {
      return parseInt(matches[0]);
    }
    
    return 60;
  }

  private determineViewType(apiItem: any): 1 | 2 | 3 {
    // Use the ViewType from your API if available
    if (apiItem.ViewType) {
      return apiItem.ViewType as 1 | 2 | 3;
    }
    
    // Fallback business logic
    if (apiItem.ContentTypeId === 36 || apiItem.ContentTypeId === 11 || apiItem.ContentTypeId === 14) {
      return 1; // Direct View
    } else if (apiItem.SalePrice && parseFloat(apiItem.SalePrice) > 0) {
      return 3; // Add to Cart
    } else {
      return 2; // Add to My Learning
    }
  }

  // Check if connected
  isConnected(): boolean {
    return !!this.userContext;
  }

  // Disconnect
  async disconnect(): Promise<void> {
    this.userContext = null;
    console.log('✅ MCP client disconnected');
  }
}

// Singleton instance
export const mcpClientService = new McpClientService();