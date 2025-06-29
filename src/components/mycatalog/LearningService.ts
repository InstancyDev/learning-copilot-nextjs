// Enhanced Learning Service - MCP Integration for Dynamic Loading with POST Method

import type { UserContext } from '@/types';
import type {
  LearningItem,
  LearningStats,
  LearningTabType,
  LearningFilters,
  LearningActionResponse,
  LearningListResponse
} from '@/types/Learning';
import type { CatalogItem } from '@/types/Catalog';
import { mcpClientService } from '@/services/McpClientService';

export class LearningServiceClass {
  private learningDataCache: Map<string, LearningListResponse> = new Map();
  private tabCountsCache: Map<number, Record<LearningTabType, number>> = new Map();

  /**
   * Helper function to extract learning result from MCP response
   */
  private extractLearningResultFromMcpResponse(response: any): { items: LearningItem[], total: number, hasMore: boolean } {
    try {
      console.log('🔍 Extracting learning result from MCP POST response:', response);

      // Check if response is already in expected format
      if (response?.items && Array.isArray(response.items)) {
        return {
          items: response.items,
          total: response.total || response.items.length,
          hasMore: response.hasMore || false
        };
      }

      // Handle MCP tool response format
      let learningData;

      if (response?.content && Array.isArray(response.content)) {
        const textContent = response.content[1];
        if (textContent && textContent.text) {
          try {
            learningData = JSON.parse(textContent.text);
            console.log('📥 Parsed learning data from MCP POST:', learningData);
          } catch (parseError) {
            console.warn('Could not parse learning data as JSON:', parseError);
            learningData = textContent.text;
          }
        }
      }
      console.log('📥 Raw learning data from MCP POST:', learningData);

      // Handle alternative MCP response structure
      if (!learningData && response?.Content && Array.isArray(response.Content)) {
        const textContent = response.Content.find((c: any) => c.Type === 'text' && c.Text);
        if (textContent && textContent.Text) {
          try {
            learningData = JSON.parse(textContent.Text);
          } catch (parseError) {
            learningData = textContent.Text;
          }
        }
      }

      // Fallback: if response is already the data
      if (!learningData && response) {
        learningData = response;
      }

      if (!learningData) {
        console.warn('Could not extract learning data from MCP POST response');
        return { items: [], total: 0, hasMore: false };
      }

      console.log('📊 Extracted learning data from POST:', learningData);

      // Transform based on your API structure (similar to catalog)
      let items: LearningItem[] = [];
      let total = 0;

      if (learningData.CourseList && Array.isArray(learningData.CourseList)) {
        items = learningData.CourseList.map((item: any) => this.transformMcpItemToLearningItem(item));
        total = learningData.CourseCount || items.length;
      } else if (learningData.LearningList && Array.isArray(learningData.LearningList)) {
        items = learningData.LearningList.map((item: any) => this.transformMcpItemToLearningItem(item));
        total = learningData.LearningCount || items.length;
      } else if (Array.isArray(learningData)) {
        items = learningData.map((item: any) => this.transformMcpItemToLearningItem(item));
        total = items.length;
      }

      console.log('✅ Transformed learning items via POST:', items.length, 'Total:', total);

      return {
        items,
        total,
        hasMore: total > items.length
      };

    } catch (error) {
      console.error('❌ Error extracting learning result from MCP POST response:', error);
      return { items: [], total: 0, hasMore: false };
    }
  }

  /**
   * Transform MCP API item to LearningItem format
   */
  private transformMcpItemToLearningItem(apiItem: any): LearningItem {
    console.log('🔄 Transforming MCP POST item:', apiItem.Title || apiItem.ContentName);

    // Parse basic item properties
    const baseItem: CatalogItem = {
      id: apiItem.ContentID,
      title: apiItem.ContentName || 'Untitled',
      description: apiItem.ShortDescription || '',
      contentTypeId: apiItem.ContentTypeId,
      contentType: apiItem.ContentType,
      category: this.extractCategoryFromApiItem(apiItem),
      difficulty: this.mapDifficultyFromApiItem(apiItem),
      duration: this.parseDuration(apiItem.Duration) || 60,
      thumbnail: 'https://enterprisedemo.instancy.com/' + apiItem.ThumbnailImagePath,
      author: {
        id: `author-${apiItem.SiteId || 1}`,
        name: apiItem.AuthorDisplayName || apiItem.Author || 'Unknown Author',
        avatar: '/api/placeholder/40/40'
      },
      tags: this.parseTagsFromApiItem(apiItem),
      rating: {
        average: parseFloat(apiItem.RatingID) || 0,
        count: parseInt(apiItem.TotalRatings) || 0
      },
      enrollment: {
        enrolled: parseInt(apiItem.NoofUsersEnrolled) || 0
      },
      status: 'published',
      createdAt: apiItem.CreatedOn || new Date().toISOString(),
      updatedAt: apiItem.ModifiedOn || apiItem.CreatedOn || new Date().toISOString(),
      price: this.parsePrice(apiItem),
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
      isInMyLearning: true, // Since this is from My Learning
      isInCart: false,
      folderPath: apiItem.FolderPath
    };

    // Add learning-specific properties
    const learningItem: LearningItem = {
      ...baseItem,
      // Learning status from API or derive from progress
      learningStatus: this.mapLearningStatus(apiItem),
      progress: this.parseProgress(apiItem),
      enrolledAt: apiItem.EnrollmentDate || apiItem.CreatedOn || new Date().toISOString(),
      lastAccessed: apiItem.LastAccessed || apiItem.LastAccessedDate,
      completedAt: apiItem.CompletedDate || (this.parseProgress(apiItem) >= 100 ? new Date().toISOString() : undefined),
      actualTimeSpent: this.parseTimeSpent(apiItem),
      estimatedTimeRemaining: this.calculateTimeRemaining(apiItem),
      attempts: parseInt(apiItem.AttemptCount) || 0,
      maxAttempts: parseInt(apiItem.MaxAttempts) || 3,
      score: this.parseScore(apiItem),
      completionStatus: this.mapCompletionStatus(apiItem),
      certificateEarned: this.checkCertificateEarned(apiItem),
      // Due date information
      nextDueDate: apiItem.TargetDate,
      dueDate: apiItem.TargetDate,
      isOverdue: this.checkOverdue(apiItem),
      daysToDue: this.calculateDaysToDue(apiItem),

      // Event-specific information
      location: apiItem.Location || (apiItem.ContentTypeId === 70 ? apiItem.EventLocation : undefined),
      instructor: apiItem.InstructorName ? {
        name: apiItem.InstructorName,
        avatar: '/api/placeholder/40/40'
      } : undefined
    };

    return learningItem;
  }

  // Helper methods for transformation
  private extractCategoryFromApiItem(apiItem: any): string {
    return apiItem.Category || apiItem.CategoryName || 'General';
  }

  private mapDifficultyFromApiItem(apiItem: any): 'beginner' | 'intermediate' | 'advanced' {
    const difficulty = apiItem.Difficulty || apiItem.Level;
    if (difficulty) {
      const lowerDiff = difficulty.toLowerCase();
      if (lowerDiff.includes('beginner') || lowerDiff.includes('basic')) return 'beginner';
      if (lowerDiff.includes('advanced') || lowerDiff.includes('expert')) return 'advanced';
    }
    return 'intermediate';
  }

  private parseDuration(duration: string | number): number {
    if (typeof duration === 'number') return duration;
    if (!duration) return 60;

    const matches = duration.toString().match(/\d+/);
    return matches ? parseInt(matches[0]) : 60;
  }

  private buildThumbnailUrl(thumbnailPath: string): string {
    if (!thumbnailPath) return '/api/placeholder/300/200';
    if (thumbnailPath.startsWith('http')) return thumbnailPath;
    if (thumbnailPath.startsWith('/Content/')) {
      return `${window.location.origin}${thumbnailPath}`;
    }
    return thumbnailPath;
  }

  private parseTagsFromApiItem(apiItem: any): string[] {
    const tags = apiItem.DetailspopupTags || apiItem.Tags || '';
    return tags ? tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : [];
  }

  private parsePrice(apiItem: any): { amount: number; currency: string } | undefined {
    const salePrice = parseFloat(apiItem.SalePrice);
    const listPrice = parseFloat(apiItem.ListPrice);

    if (salePrice > 0) {
      return { amount: salePrice, currency: apiItem.Currency || 'USD' };
    } else if (listPrice > 0) {
      return { amount: listPrice, currency: apiItem.Currency || 'USD' };
    }
    return undefined;
  }

  private determineViewType(apiItem: any): 1 | 2 | 3 {
    if (apiItem.ViewType) return apiItem.ViewType as 1 | 2 | 3;

    if (apiItem.ContentTypeId === 36 || apiItem.ContentTypeId === 11 || apiItem.ContentTypeId === 14) {
      return 1; // Direct View
    } else if (apiItem.SalePrice && parseFloat(apiItem.SalePrice) > 0) {
      return 3; // Add to Cart
    } else {
      return 2; // Add to My Learning
    }
  }

  private mapLearningStatus(apiItem: any): 'not attempted' | 'incomplete' | 'registered' | 'completed' | 'grade' | 'attended' | 'notattended' | 'passed' | 'failed' | 'completed' {
    const status = apiItem.ActualStatus;
    const progress = this.parseProgress(apiItem);

    if (status) {
      const lowerStatus = status.toLowerCase();
      if (lowerStatus.includes('completed')) return 'completed';
      if (lowerStatus.includes('incomplete')) return 'incomplete';
      if (lowerStatus.includes('registered')) return 'registered';
      if (lowerStatus.includes('pending')) return 'grade';
    }
    // Derive from progress
    if (progress >= 100) return 'completed';
    if (progress > 0) return 'incomplete';
    if (apiItem.ContentTypeId === 70) return 'registered'; // Events default to registered

    return 'not attempted';
  }

  private parseProgress(apiItem: any): number {
    const progress = apiItem.PercentCompleted;
    if(progress !== undefined && apiItem.ActualStatus === 'completed') {
      return 100; // Explicitly handle 'not attempted' status 
    }
    else if (progress !== undefined && apiItem.ActualStatus === 'not attempted') {
      return 0; // Explicitly handle 'not attempted' status
    }    
    else if (progress !== undefined) {
      const progressNum = parseFloat(progress);
      return Math.min(100, Math.max(0, progressNum));
    }
    else    
      return 0;
  }

  private parseTimeSpent(apiItem: any): number {
    const timeSpent = apiItem.TimeSpent || apiItem.ActualTimeSpent;
    return timeSpent ? parseInt(timeSpent) : 0;
  }

  private calculateTimeRemaining(apiItem: any): number | undefined {
    const progress = this.parseProgress(apiItem);
    const duration = this.parseDuration(apiItem.Duration);

    if (progress < 100 && duration > 0) {
      const timeSpent = (progress / 100) * duration;
      return Math.max(0, duration - timeSpent);
    }
    return undefined;
  }

  private parseScore(apiItem: any): number | undefined {
    const score = apiItem.Score || apiItem.TestScore || apiItem.Grade;
    return score !== undefined ? parseFloat(score) : undefined;
  }

  private mapCompletionStatus(apiItem: any): 'completed' | 'grade' | 'attended' | 'notattended' | 'passed' | 'failed' | undefined {
    const status = apiItem.CompletionStatus || apiItem.TestResult;
    if (!status) return undefined;

    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('passed') || lowerStatus.includes('pass')) return 'passed';
    if (lowerStatus.includes('failed') || lowerStatus.includes('fail')) return 'failed';
    if (lowerStatus.includes('attended')) return 'attended';
    if (lowerStatus.includes('not-attended')) return 'notattended';

    return undefined;
  }

  private checkCertificateEarned(apiItem: any): boolean | undefined {
    const certificateEarned = apiItem.CertificateEarned || apiItem.HasCertificate;
    if (certificateEarned !== undefined) {
      return Boolean(certificateEarned);
    }

    // Check if score is high enough and course is completed
    const score = this.parseScore(apiItem);
    const progress = this.parseProgress(apiItem);

    if (score !== undefined && progress >= 100 && score >= 80) {
      return true;
    }

    return undefined;
  }

  private checkOverdue(apiItem: any): boolean {
    const dueDate = apiItem.TargetDate;
    if (!dueDate) return false;

    const dueDateObj = new Date(dueDate);
    return dueDateObj.getTime() < Date.now();
  }

  private calculateDaysToDue(apiItem: any): number | undefined {
    const dueDate = apiItem.TargetDate;
    if (!dueDate) return undefined;

    const dueDateObj = new Date(dueDate);
    const timeDiff = dueDateObj.getTime() - Date.now();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  /**
   * Get user's learning items using MCP POST method - MAIN METHOD
   */
  async getMyLearning(
    userContext: UserContext,
    tab?: LearningTabType,
    filters?: any
  ): Promise<LearningListResponse> {
    try {
      console.log('🔍 Getting My Learning via MCP POST method...', { tab, filters });

      // Check if MCP is connected
      if (!mcpClientService.isConnected()) {
        throw new Error('MCP service not connected');
      }

      // Build MCP arguments for POST method (MyCatalogParams structure)
      const mcpArguments: any = {
        // REQUIRED PARAMETERS
        userId: userContext.UserID,
        siteId: userContext.SiteID,
        orgUnitId: userContext.SiteID?.toString() || '374',

        // CORE COMPONENT PARAMETERS
        locale: 'en-us',
        componentId: 3, // My Learning component
        componentInsId: 3134, // My Learning component instance

        // PAGINATION PARAMETERS
        pageIndex: 1,
        pageSize: 50, // Number of items per page

        // SEARCH AND CONTENT FILTERING
        contentId: '', // Specific content ID filter
        searchText: '', // Search text filter
        source: '', // Source filter
        type: '', // Content type filter
        sortBy: 'MC.DateAssigned', // Sort field (MC.DateAssigned, Title, Progress, DueDate, etc.)
        groupBy: '', // Group by field

        // CATALOG-STYLE FILTERS (mapped to My Learning context)
        categories: '', // Categories filter (comma-separated)
        objecttypes: '', // Object/Content types filter (comma-separated)
        skillcats: '', // Skill categories filter (comma-separated)
        skills: '', // Skills filter (comma-separated)
        jobroles: '', // Job roles filter (comma-separated)
        solutions: '', // Solutions filter (comma-separated)
        ratings: '', // Ratings filter (e.g., "4", "5")
        pricerange: '', // Price range filter (if applicable)
        duration: '', // Duration filter (e.g., "short", "medium", "long")
        instructors: '', // Instructors filter (comma-separated)

        // ADDITIONAL FILTERS AND PARAMETERS
        additionalParams: '', // Additional parameters
        selectedTab: '', // Selected tab identifier
        addtionalFilter: '', // Additional filter string (custom filters)
        locationFilter: '', // Location filter (for events)
        ContentStatus: '', // Content status filter (e.g., "published", "draft")
      };

      // Add tab-specific filtering
      if (tab && tab !== 'all') {
        // Use additionalFilter for status-based filtering
        let statusFilter = '';

        switch (tab) {
          case 'due-dates':
            // For due dates, we'll filter client-side after getting results
            mcpArguments.addtionalFilter = 'hasDueDate:true';
            break;
          case 'not-started':
            statusFilter = 'not attempted';
            break;
          case 'in-progress':
            statusFilter = 'incomplete';
            break;
          case 'registered':
            statusFilter = 'registered';
            break;
          case 'completed':
            statusFilter = 'completed';
            break;
          case 'pending-review':
            statusFilter = 'grade';
            break;
        }

        if (statusFilter) {
           mcpArguments.ContentStatus= statusFilter;
        }
      }

      // Add search and filter parameters
      if (filters) {
        if (filters.query) mcpArguments.searchText = filters.query;
        if (filters.category) mcpArguments.categories = filters.category;
        if (filters.contentTypeId) mcpArguments.objecttypes = filters.contentTypeId.toString();
        if (filters.contentType) mcpArguments.objecttypes = filters.contentType;
        if (filters.difficulty) {
          const difficultyFilter = `Difficulty:${filters.difficulty}`;
          mcpArguments.addtionalFilter = mcpArguments.addtionalFilter
            ? `${mcpArguments.addtionalFilter},${difficultyFilter}`
            : difficultyFilter;
        }
        if (filters.author) {
          const authorFilter = `Author:${filters.author}`;
          mcpArguments.addtionalFilter = mcpArguments.addtionalFilter
            ? `${mcpArguments.addtionalFilter},${authorFilter}`
            : authorFilter;
        }
        if (filters.rating) mcpArguments.ratings = filters.rating;
        if (filters.duration) mcpArguments.duration = filters.duration;

        // Handle sorting
        if (filters.sortBy) {
          switch (filters.sortBy) {
            case 'recent':
              mcpArguments.sortBy = 'MC.DateAssigned';
              break;
            case 'title':
              mcpArguments.sortBy = 'MC.Name';
              break;
            case 'progress':
              mcpArguments.sortBy = 'MC.ActualStatus';
              break;
            case 'due-date':
              mcpArguments.sortBy = 'MC.TargetDate';
              break;
            default:
              mcpArguments.sortBy = 'MC.DateAssigned';
          }
        } else {
          mcpArguments.sortBy = 'MC.DateAssigned'; // Default sort
        }

        if (filters.tags && filters.tags.length > 0) {
          const tagsFilter = `Tags:${filters.tags.join(',')}`;
          mcpArguments.addtionalFilter = mcpArguments.addtionalFilter
            ? `${mcpArguments.addtionalFilter},${tagsFilter}`
            : tagsFilter;
        }
      } else {
        // Default sorting when no filters
        mcpArguments.sortBy = 'MC.DateAssigned';
      }

      console.log('📤 MCP POST call arguments:', mcpArguments);

      // Make MCP call using the POST method
      const result = await mcpClientService.callTool({
        name: 'get_my_learning_objects_post',
        arguments: mcpArguments
      });

      console.log('📥 Raw MCP POST response:', result);

      // Transform the response
      const transformedResult = this.extractLearningResultFromMcpResponse(result);

      // Apply client-side filtering for due dates tab if needed
      let finalItems = transformedResult.items;
      if (tab === 'due-dates') {
        const now = new Date();
        finalItems = transformedResult.items.filter(item => {
          const dueDate = item.nextDueDate || item.dueDate;
          if (!dueDate) return false;

          const dueDateObj = new Date(dueDate);
          const timeDiff = dueDateObj.getTime() - now.getTime();
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

          // Include overdue items AND items due within 30 days
          return timeDiff < 0 || daysDiff <= 30;
        });
      }

      // Calculate stats
      const stats = this.calculateStats(finalItems);

      const response: LearningListResponse = {
        items: finalItems,
        stats,
        total: finalItems.length,
        hasMore: transformedResult.hasMore && finalItems.length < transformedResult.total
      };

      console.log('✅ Final learning response via POST method:', {
        itemCount: response.items.length,
        total: response.total,
        stats: response.stats,
        tabFilter: tab
      });

      return response;

    } catch (error) {
      console.error('❌ Error getting learning items via MCP POST method:', error);

      // Return empty result on error
      return {
        items: [],
        stats: {
          total: 0,
          dueSoon: 0,
          overdue: 0,
          notStarted: 0,
          inProgress: 0,
          registered: 0,
          completed: 0,
          pendingReview: 0,
          totalTimeSpent: 0,
          certificatesEarned: 0,
          averageScore: 0
        },
        total: 0,
        hasMore: false
      };
    }
  }

  /**
   * Calculate statistics for learning items
   */
  private calculateStats(items: LearningItem[]): LearningStats {
    const now = new Date();

    const stats: LearningStats = {
      total: items.length,
      dueSoon: 0,
      overdue: 0,
      notStarted: 0,
      inProgress: 0,
      registered: 0,
      completed: 0,
      pendingReview: 0,
      totalTimeSpent: 0,
      certificatesEarned: 0,
      averageScore: 0
    };

    let totalScore = 0;
    let scoredItems = 0;

    items.forEach(item => {
      // Count by status
      switch (item.learningStatus) {
        case 'notattended':
          stats.notStarted++;
          break;
        case 'incomplete':
          stats.inProgress++;
          break;
        case 'registered':
          stats.registered++;
          break;
        case 'completed':
          stats.completed++;
          break;
        case 'grade':
          stats.pendingReview++;
          break;
      }

      // Check due dates
      const dueDate = item.nextDueDate || item.dueDate;
      if (dueDate) {
        const dueDateObj = new Date(dueDate);
        const timeDiff = dueDateObj.getTime() - now.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (timeDiff < 0) {
          stats.overdue++;
        } else if (daysDiff <= 7) {
          stats.dueSoon++;
        }
      }

      // Time spent
      if (item.actualTimeSpent) {
        stats.totalTimeSpent += item.actualTimeSpent;
      }

      // Certificates
      if (item.certificateEarned) {
        stats.certificatesEarned++;
      }

      // Scores
      if (item.score !== undefined) {
        totalScore += item.score;
        scoredItems++;
      }
    });

    stats.averageScore = scoredItems > 0 ? Math.round(totalScore / scoredItems) : 0;

    return stats;
  }

  /**
   * Get tab counts using MCP POST method
   */
  async getTabCounts(userContext: UserContext): Promise<Record<LearningTabType, number>> {
    try {
      console.log('🔍 Getting tab counts via MCP POST method...');

      // Get all learning items first using POST method
      const allItems = await this.getMyLearning(userContext, 'all', {});
      const items = allItems.items;
      const now = new Date();

      // Count items with due dates
      const dueDateItems = items.filter(item => {
        const dueDate = item.nextDueDate || item.dueDate;
        if (!dueDate) return false;

        const dueDateObj = new Date(dueDate);
        const timeDiff = dueDateObj.getTime() - now.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        // Include overdue items and items due within 30 days
        return timeDiff < 0 || daysDiff <= 30;
      });

      const counts: Record<LearningTabType, number> = {
        'all': items.length,
        'due-dates': dueDateItems.length,
        'not-started': items.filter(item => item.learningStatus === 'not attempted').length,
        'in-progress': items.filter(item => item.learningStatus === 'incomplete').length,
        'registered': items.filter(item => item.learningStatus === 'registered').length,
        'completed': items.filter(item => item.learningStatus === 'completed').length,
        'pending-review': items.filter(item => item.learningStatus === 'grade').length
      };

      console.log('✅ Tab counts calculated via POST method:', counts);
      return counts;

    } catch (error) {
      console.error('❌ Error getting tab counts via MCP POST method:', error);
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
  }

  /**
   * Start learning an item using MCP
   */
  async startLearning(
    itemId: string,
    userContext: UserContext
  ): Promise<LearningActionResponse> {
    try {
      console.log('🚀 Starting learning via MCP POST context:', itemId);

      if (!mcpClientService.isConnected()) {
        throw new Error('MCP service not connected');
      }

      // Call MCP to start learning
      const result = await mcpClientService.callTool({
        name: 'start_learning_content',
        arguments: {
          contentId: itemId,
          userId: userContext.UserID,
          siteId: userContext.SiteID,
          locale: 'en-us'
        }
      });

      console.log('✅ Start learning MCP result (POST context):', result);

      return {
        success: true,
        message: 'Learning started successfully',
        openInNewTab: false
      };

    } catch (error) {
      console.error('❌ Error starting learning via MCP POST context:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to start learning'
      };
    }
  }

  /**
   * Continue learning an item using MCP
   */
  async continueLearning(
    itemId: string,
    userContext: UserContext
  ): Promise<LearningActionResponse> {
    try {
      console.log('▶️ Continuing learning via MCP POST context:', itemId);

      if (!mcpClientService.isConnected()) {
        throw new Error('MCP service not connected');
      }

      const result = await mcpClientService.callTool({
        name: 'continue_learning_content',
        arguments: {
          contentId: itemId,
          userId: userContext.UserID,
          siteId: userContext.SiteID,
          locale: 'en-us'
        }
      });

      console.log('✅ Continue learning MCP result (POST context):', result);

      return {
        success: true,
        message: 'Continuing learning',
        openInNewTab: false
      };

    } catch (error) {
      console.error('❌ Error continuing learning via MCP POST context:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to continue learning'
      };
    }
  }

  /**
   * Update learning progress using MCP
   */
  async updateProgress(
    itemId: string,
    progress: number,
    userContext: UserContext,
    metadata?: Record<string, any>
  ): Promise<LearningActionResponse> {
    try {
      console.log('📊 Updating progress via MCP POST context:', { itemId, progress, metadata });

      if (!mcpClientService.isConnected()) {
        throw new Error('MCP service not connected');
      }

      const result = await mcpClientService.callTool({
        name: 'update_learning_progress',
        arguments: {
          contentId: itemId,
          userId: userContext.UserID,
          siteId: userContext.SiteID,
          progress: Math.min(100, Math.max(0, progress)),
          timeSpent: metadata?.timeSpent || 0,
          locale: 'en-us'
        }
      });

      console.log('✅ Update progress MCP result (POST context):', result);

      return {
        success: true,
        message: 'Progress updated successfully'
      };

    } catch (error) {
      console.error('❌ Error updating progress via MCP POST context:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update progress'
      };
    }
  }

  /**
   * Remove item from learning using MCP
   */
  async removeFromLearning(
    itemId: string,
    userContext: UserContext
  ): Promise<LearningActionResponse> {
    try {
      console.log('🗑️ Removing from learning via MCP POST context:', itemId);

      if (!mcpClientService.isConnected()) {
        throw new Error('MCP service not connected');
      }

      const result = await mcpClientService.callTool({
        name: 'remove_from_my_learning',
        arguments: {
          contentId: itemId,
          userId: userContext.UserID,
          siteId: userContext.SiteID,
          locale: 'en-us'
        }
      });

      console.log('✅ Remove from learning MCP result (POST context):', result);

      return {
        success: true,
        message: 'Item removed from learning successfully'
      };

    } catch (error) {
      console.error('❌ Error removing from learning via MCP POST context:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to remove item from learning'
      };
    }
  }

  /**
   * Clear cache - useful for refreshing data
   */
  clearCache(): void {
    this.learningDataCache.clear();
    this.tabCountsCache.clear();
    console.log('🧹 Learning service cache cleared (POST method context)');
  }

  /**
   * Check if MCP is connected
   */
  isConnected(): boolean {
    return mcpClientService.isConnected();
  }
}

// Export singleton instance
export const LearningService = new LearningServiceClass();