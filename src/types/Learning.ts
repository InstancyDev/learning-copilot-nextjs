// types/Learning.ts - Learning-specific types and interfaces

import type { CatalogItem } from './Catalog';

export interface LearningItem extends CatalogItem {
  // Learning status and progress
  learningStatus: 'not attempted'|'incomplete' | 'registered' | 'completed' | 'grade' |'attended'| 'notattended'|'passed'|'failed'|'completed';
  completionStatus?: 'completed' | 'grade' |'attended'| 'notattended'|'passed'|'failed'| undefined; // For assessments and events
  progress: number; // 0-100
  
  // Timestamps
  lastAccessed?: string;
  completedAt?: string;
  enrolledAt: string;
  
  // Time tracking
  estimatedTimeRemaining?: number; // minutes
  actualTimeSpent?: number; // minutes
  
  // Assessment/scoring
  attempts?: number;
  maxAttempts?: number;
  score?: number;
  passingScore?: number;
  
  // Achievements
  certificateEarned?: boolean;
  
  // Event-specific fields
  nextDueDate?: string; // for events
  dueDate?: string; // for assignments and courses with deadlines
  isOverdue?: boolean; // calculated field for overdue items
  daysToDue?: number; // calculated field for days until due
  location?: string; // for events
  instructor?: {
    name: string;
    avatar?: string;
  };
  
  // User interaction
  notes?: string;
  bookmarks?: number[];
  downloadable?: boolean;
  offlineAccess?: boolean;
}

export interface LearningStats {
  total: number;
  dueSoon: number; // Items due within next 7 days
  overdue: number; // Items past due date
  notStarted: number;
  inProgress: number;
  registered: number;
  completed: number;
  pendingReview: number;
  totalTimeSpent: number; // in minutes
  certificatesEarned: number;
  averageScore: number;
}

export type LearningTabType = 'all' | 'due-dates' | 'not-started' | 'in-progress' | 'registered' | 'completed' | 'pending-review';

export interface LearningFilters {
  query?: string;
  category?: string;
  contentType?: string;
  difficulty?: string;
  sortBy?: 'recent' | 'progress' | 'title' | 'due-date';
  sortOrder?: 'asc' | 'desc';
}

export interface LearningAction {
  type: 'start' | 'continue' | 'complete' | 'review' | 'download' | 'bookmark';
  itemId: string;
  metadata?: Record<string, any>;
}

export interface LearningProgress {
  itemId: string;
  progress: number;
  timeSpent: number;
  lastPosition?: string; // for videos, documents, etc.
  bookmarks?: number[];
  notes?: string;
  updatedAt: string;
}

export interface Certificate {
  id: string;
  itemId: string;
  userId: number;
  earnedAt: string;
  certificateUrl?: string;
  verificationCode?: string;
  expiresAt?: string;
}

export interface LearningEvent {
  id: string;
  itemId: string;
  userId: number;
  eventType: 'started' | 'progress' | 'completed' | 'bookmarked' | 'noted';
  data: Record<string, any>;
  timestamp: string;
}

// API Response types
export interface LearningListResponse {
  items: LearningItem[];
  stats: LearningStats;
  total: number;
  hasMore: boolean;
}

export interface LearningActionResponse {
  success: boolean;
  message: string;
  data?: any;
  url?: string;
  openInNewTab?: boolean;
}