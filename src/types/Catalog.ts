
export interface CatalogItem {
  id: string;
  title: string;
  description: string;
  contentTypeId: number;
  contentType: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  thumbnail: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  tags: string[];
  rating: {
    average: number;
    count: number;
  };
  enrollment: {
    enrolled: number;
    capacity?: number;
  };
  status: 'published' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
  price?: {
    amount: number;
    currency: string;
  };
  prerequisites?: string[];
  learningObjectives: string[];
  metadata: Record<string, any>;
  // Learning Path specific fields
  pathItems?: string[]; // Array of content IDs for learning paths
  isPartOfPath?: string[]; // Array of learning path IDs this item belongs to 
  viewType: 1 | 2 | 3; // 1: Direct View, 2: Add to My Learning, 3: Add to Cart
  // Additional properties for different view types
  directViewUrl?: string; // For ViewType 1
  isInMyLearning?: boolean; // For ViewType 2
  isInCart?: boolean; // For ViewType 3 
  folderPath?: string;
  EnrollNowLink?: string; // Link to enroll in the course directly

}

// Instancy Content Types mapping
export const CONTENT_TYPES = {
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
} as const;

// MCP Resource for catalog data
export interface CatalogResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

// MCP Tool definitions for catalog operations
export interface CatalogTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface SearchFilters {
  query?: string;
  category?: string;
  contentTypeId?: number;
  contentType?: string;
  difficulty?: string;
  author?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult {
  items: CatalogItem[];
  total: number;
  hasMore: boolean;
}
