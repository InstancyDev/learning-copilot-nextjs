// components/common/ContentDetailModal.tsx - Detail modal for catalog items

import React from 'react';
import {
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Star,
  Users,
  Eye,
  PlayCircle,
  BookOpen,
  User,
  MapPin,
  Award,
  ExternalLink
} from 'lucide-react';

import type { CatalogItem } from '@/types/Catalog';
import type { LearningItem } from '@/types/Learning';

type UnifiedItem = CatalogItem | LearningItem;

// Type guard to check if item is a LearningItem
const isLearningItem = (item: UnifiedItem): item is LearningItem => {
  return 'learningStatus' in item && 'progress' in item;
};

interface ContentDetailModalProps {
  item: UnifiedItem;
  isOpen: boolean;
  onClose: () => void;
  onLaunch?: (item: UnifiedItem) => void;
  context: 'catalog' | 'my-learning';
}

export const ContentDetailModal: React.FC<ContentDetailModalProps> = ({ 
  item, 
  isOpen, 
  onClose, 
  onLaunch,
  context 
}) => {
  if (!isOpen) return null;

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getStatusColor = (status?: string) => {
    if (!isLearningItem(item)) return '';
    
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'in-progress': return 'text-yellow-600 bg-yellow-50';
      case 'registered': return 'text-purple-600 bg-purple-50';
      case 'pending-review': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderActionButton = () => {
    if (context === 'catalog') {
      const viewType = item.viewType || (item.price && item.price.amount > 0 ? 3 : 2);
      
      if (viewType === 1) {
        return (
          <button
            onClick={() => onLaunch?.(item)}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Eye className="w-5 h-5" />
            View Content
          </button>
        );
      } else if (viewType === 2) {
        const inMyLearning = item.isInMyLearning ?? false;
        return (
          <button
            onClick={() => !inMyLearning && onLaunch?.(item)}
            disabled={inMyLearning}
            className={`w-full py-3 px-4 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 ${
              inMyLearning 
                ? 'bg-green-100 text-green-800 cursor-not-allowed' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {inMyLearning ? <CheckCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
            {inMyLearning ? 'In My Learning' : 'Add to My Learning'}
          </button>
        );
      } else {
        const inCart = item.isInCart ?? false;
        return (
          <button
            onClick={() => !inCart && onLaunch?.(item)}
            disabled={inCart}
            className={`w-full py-3 px-4 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 ${
              inCart 
                ? 'bg-purple-100 text-purple-800 cursor-not-allowed' 
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {inCart ? <CheckCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
            {inCart ? 'In Cart' : 'Add to Cart'}
          </button>
        );
      }
    } else {
      // My Learning context
      if (!isLearningItem(item)) return null;
      
      return (
        <button
          onClick={() => onLaunch?.(item)}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
        >
          <PlayCircle className="w-5 h-5" />
          {item.learningStatus === 'not attempted' ? 'Start Learning' : item.learningStatus === 'completed' ? 'Review Content' : 'Continue Learning'}
        </button>
      );
    }
  };

  const learningItem = isLearningItem(item) ? item : null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Content Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title and Description */}
              <div>
                <div className="flex items-start justify-between mb-3">
                  <h1 className="text-2xl font-bold text-gray-900 flex-1">{item.title}</h1>
                  <div className="flex items-center gap-2 ml-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(item.difficulty)}`}>
                      {item.difficulty}
                    </span>
                    {context === 'my-learning' && learningItem && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(learningItem.learningStatus)}`}>
                        {learningItem.learningStatus.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>

              {/* Content Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Content Type</div>
                  <div className="font-medium">{item.contentType}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Category</div>
                  <div className="font-medium">{item.category}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Duration</div>
                  <div className="font-medium">{formatTime(item.duration)}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Enrollment</div>
                  <div className="font-medium">{item.enrollment.enrolled.toLocaleString()} learners</div>
                </div>
              </div>

              {/* Learning Objectives */}
              {item.learningObjectives && item.learningObjectives.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Learning Objectives</h3>
                  <ul className="space-y-2">
                    {item.learningObjectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Prerequisites */}
              {item.prerequisites && item.prerequisites.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Prerequisites</h3>
                  <ul className="space-y-2">
                    {item.prerequisites.map((prereq, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{prereq}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Progress Card for My Learning */}
              {context === 'my-learning' && learningItem && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Your Progress</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Completion</span>
                        <span className="font-medium">{learningItem.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${learningItem.progress}%` }}
                        />
                      </div>
                    </div>

                    {learningItem.score !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Score</span>
                        <span className="font-medium text-green-600">{learningItem.score}%</span>
                      </div>
                    )}

                    {learningItem.actualTimeSpent && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Time Spent</span>
                        <span className="font-medium">{formatTime(learningItem.actualTimeSpent)}</span>
                      </div>
                    )}

                    {learningItem.nextDueDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Due Date</span>
                        <span className="font-medium">{new Date(learningItem.nextDueDate).toLocaleDateString()}</span>
                      </div>
                    )}

                    {learningItem.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{learningItem.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Author & Rating */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Course Info</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {item.author.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-sm">{item.author.name}</div>
                      <div className="text-xs text-gray-500">
                        {learningItem?.instructor ? 'Instructor' : 'Author'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{item.rating.average}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      ({item.rating.count} reviews)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {item.enrollment.enrolled.toLocaleString()} enrolled
                    </span>
                  </div>

                  {context === 'catalog' && item.price && (
                    <div className="pt-3 border-t border-gray-100">
                      <div className="text-2xl font-bold text-gray-900">
                        ${item.price.amount}
                      </div>
                      <div className="text-sm text-gray-500">{item.price.currency}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {renderActionButton()}

                <button
                  onClick={onClose}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};