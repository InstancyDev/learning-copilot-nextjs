// config/learning-integration.ts - Configuration for integrating enhanced learning features

import { LearningService } from '@/components/mycatalog/LearningService';

// Update the main MyLearning component to use the enhanced service
// Replace the import in MyLearning.tsx:
// import { learningService } from '@/components/mycatalog/LearningService'
// with:
// import { enhancedLearningService as learningService } from '@/components/mycatalog/EnhancedLearningService'

// Also update the LearningCard import:
// import { LearningCard } from '@/components/mycatalog/LearningCard';
// with:
// import { EnhancedLearningCard as LearningCard } from '@/components/mycatalog/EnhancedLearningCard';

// Content viewer configuration for different content types
export const contentViewerConfig = {
  // Modal dimensions for different content types
  modalSizes: {
    default: { width: '90vw', height: '90vh', maxWidth: '1200px' },
    video: { width: '80vw', height: '70vh', maxWidth: '1000px' },
    document: { width: '85vw', height: '85vh', maxWidth: '1100px' },
    assessment: { width: '75vw', height: '80vh', maxWidth: '900px' },
    scorm: { width: '95vw', height: '95vh', maxWidth: '1400px' },
    event: { width: '70vw', height: '60vh', maxWidth: '800px' }
  },

  // Content type specific configurations
  contentTypes: {
    8: { // Learning Module
      modalSize: 'default',
      allowFullscreen: true,
      trackProgress: true,
      supportBookmarks: true
    },
    9: { // Assessment
      modalSize: 'assessment',
      allowFullscreen: false,
      trackProgress: true,
      preventNavigation: true,
      timeLimit: true
    },
    11: { // Video
      modalSize: 'video',
      allowFullscreen: true,
      trackProgress: true,
      supportBookmarks: true,
      autoplay: false
    },
    14: { // Document
      modalSize: 'document',
      allowFullscreen: true,
      trackProgress: false,
      supportBookmarks: true,
      downloadable: true
    },
    21: { // HTML Package
      modalSize: 'default',
      allowFullscreen: true,
      trackProgress: true,
      supportBookmarks: false
    },
    26: { // eLearning Course (SCORM)
      modalSize: 'scorm',
      allowFullscreen: true,
      trackProgress: true,
      supportBookmarks: false,
      scormCompliant: true
    },
    70: { // Event
      modalSize: 'event',
      allowFullscreen: false,
      trackProgress: false,
      supportBookmarks: false,
      showSchedule: true
    }
  },

  // Default URLs for different content types
  defaultUrls: {
    8: '/learning/module',
    9: '/learning/assessment',
    11: '/learning/video',
    14: '/learning/document',
    21: '/learning/html-package',
    26: '/learning/scorm',
    27: '/learning/aicc',
    70: '/learning/event',
    693: '/learning/cmi5',
    695: '/learning/ar',
    696: '/learning/vr',
    697: '/learning/chatbot'
  }
};

// Filter configuration matching catalog
export const learningFilterConfig = {
  // Available sort options
  sortOptions: [
    { value: 'recent', label: 'Recently Accessed', icon: 'clock' },
    { value: 'progress', label: 'Progress', icon: 'bar-chart' },
    { value: 'title', label: 'Title (A-Z)', icon: 'alpha' },
    { value: 'due-date', label: 'Due Date', icon: 'calendar' },
    { value: 'rating', label: 'Rating', icon: 'star' },
    { value: 'duration', label: 'Duration', icon: 'time' }
  ],

  // Duration filters
  durationFilters: [
    { value: 'short', label: 'Short (< 1 hour)', min: 0, max: 60 },
    { value: 'medium', label: 'Medium (1-3 hours)', min: 60, max: 180 },
    { value: 'long', label: 'Long (> 3 hours)', min: 180, max: Infinity }
  ],

  // Rating filters
  ratingFilters: [
    { value: 4.5, label: '4.5+ Stars' },
    { value: 4.0, label: '4.0+ Stars' },
    { value: 3.5, label: '3.5+ Stars' },
    { value: 3.0, label: '3.0+ Stars' }
  ],

  // Status filters
  statusFilters: [
    { value: 'not-started', label: 'Not Started', color: 'blue' },
    { value: 'in-progress', label: 'In Progress', color: 'yellow' },
    { value: 'completed', label: 'Completed', color: 'green' },
    { value: 'registered', label: 'Registered', color: 'purple' },
    { value: 'pending-review', label: 'Pending Review', color: 'orange' }
  ]
};

// Modal behavior configuration
export const modalConfig = {
  // Animation settings
  animation: {
    duration: 300,
    easing: 'ease-in-out'
  },

  // Overlay settings
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    closeOnClick: true
  },

  // Progress tracking
  progressTracking: {
    intervalMs: 30000, // Update progress every 30 seconds
    saveOnClose: true,
    trackTimeSpent: true
  },

  // Keyboard shortcuts
  keyboardShortcuts: {
    escape: 'close',
    f11: 'fullscreen',
    space: 'pause-resume',
    arrowLeft: 'previous',
    arrowRight: 'next'
  }
};

// Integration hooks for external systems
export const integrationHooks = {
  // Called when content is launched
  onContentLaunch: (item: any) => {
    console.log('Content launched:', item.title);
    // Add analytics tracking here
  },

  // Called when progress is updated
  onProgressUpdate: (itemId: string, progress: number) => {
    console.log(`Progress updated for ${itemId}: ${progress}%`);
    // Add progress tracking to external systems here
  },

  // Called when content is completed
  onContentComplete: (item: any, score?: number) => {
    console.log('Content completed:', item.title, score ? `Score: ${score}%` : '');
    // Add completion tracking here
  },

  // Called when modal is closed
  onModalClose: (item: any, timeSpent: number) => {
    console.log(`Modal closed for ${item.title}, time spent: ${timeSpent}ms`);
    // Add time tracking here
  }
};

// Export configuration
export const learningConfig = {
  contentViewer: contentViewerConfig,
  filters: learningFilterConfig,
  modal: modalConfig,
  hooks: integrationHooks
};

// Utility functions for integration
export const learningUtils = {
  // Get modal size for content type
  getModalSize: (contentTypeId: number) => {
    type ModalSizeKey = keyof typeof contentViewerConfig.modalSizes;
    const config = contentViewerConfig.contentTypes[contentTypeId as keyof typeof contentViewerConfig.contentTypes];
    if (config && typeof config.modalSize === 'string' && (config.modalSize as ModalSizeKey) in contentViewerConfig.modalSizes) {
      return contentViewerConfig.modalSizes[config.modalSize as ModalSizeKey];
    }
    return contentViewerConfig.modalSizes.default;
  },

  // Check if content type supports feature
  supportsFeature: (contentTypeId: number, feature: string) => {
    const config = contentViewerConfig.contentTypes[contentTypeId as keyof typeof contentViewerConfig.contentTypes];
    return config && feature in config ? (config as Record<string, any>)[feature] : false;
  },

  // Generate content URL
  generateContentUrl: (item: any, resume: boolean = false) => {
    const baseUrl = contentViewerConfig.defaultUrls[item.contentTypeId as keyof typeof contentViewerConfig.defaultUrls] || '/learning/content';
    const resumeParam = resume ? '?resume=true' : '';
    return `${baseUrl}/${item.id}${resumeParam}`;
  },

  // Format filter options for UI
  formatFilterOptions: (items: any[]) => {
    return {
      categories: [...new Set(items.map(item => item.category))],
      contentTypes: [...new Set(items.map(item => ({ 
        id: item.contentTypeId, 
        name: item.contentType 
      })))].filter((value, index, self) => 
        index === self.findIndex(t => t.id === value.id)
      ),
      authors: [...new Set(items.map(item => item.author.name))],
      difficulties: [...new Set(items.map(item => item.difficulty))],
      tags: [...new Set(items.flatMap(item => item.tags || []))]
    };
  }
};

// Example usage in component:
/*
import { learningConfig, learningUtils } from '@/config/learning-integration';

// In your component:
const modalSize = learningUtils.getModalSize(item.contentTypeId);
const supportsBookmarks = learningUtils.supportsFeature(item.contentTypeId, 'supportBookmarks');
const contentUrl = learningUtils.generateContentUrl(item, true);

// Set up progress tracking
useEffect(() => {
  const interval = setInterval(() => {
    // Update progress
    learningConfig.hooks.onProgressUpdate(item.id, currentProgress);
  }, learningConfig.modal.progressTracking.intervalMs);
  
  return () => clearInterval(interval);
}, []);
*/