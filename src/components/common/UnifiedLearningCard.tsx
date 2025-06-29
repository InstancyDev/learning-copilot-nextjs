// components/common/UnifiedLearningCard.tsx - Common card for both Catalog and My Learning

import React from 'react';
import {
  PlayCircle,
  PauseCircle,
  CheckCircle,
  XCircle,
  Calendar,
  UserCheck,
  StopCircle,
  AlertCircle,
  Award,
  Clock,
  Eye,
  Play,
  MoreHorizontal,
  MapPin,
  User,
  Star,
  BookOpen,
  Info,
  ExternalLink,
  Plus,
  ShoppingCart,
  Check,
  UserPlus
} from 'lucide-react';

import type { CatalogItem } from '@/types/Catalog';
import type { LearningItem } from '@/types/Learning';
import { on } from 'events';

// Union type for items that can be either catalog or learning items
type UnifiedItem = CatalogItem | LearningItem;

interface UnifiedLearningCardProps {
  item: UnifiedItem;
  viewMode: 'grid' | 'list';
  onAction: (action: string, item: UnifiedItem) => void;
  context: 'catalog' | 'my-learning'; // Determines which features to show
  showDetailsButton?: boolean;
  hideFloatingButtons?: boolean; // For My Learning context
//  accessLevel: 'free' | 'paid'; // Optional access level
  onUpgrade?: () => void; // Optional upgrade action
}

// Type guard to check if item is a LearningItem
const isLearningItem = (item: UnifiedItem): item is LearningItem => {
  return 'learningStatus' in item && 'progress' in item;
};
export const UnifiedLearningCard: React.FC<UnifiedLearningCardProps> = ({ 
  item, 
  viewMode, 
  onAction,
  context,
  showDetailsButton = true,  
  hideFloatingButtons = false,
 // accessLevel = 'public',// Default to public access
  onUpgrade= () => { console.log('Upgrade action triggered'); }
}) => { 
  
  const getStatusIcon = (status?: string, completionStatus?: string) => {
    if (!isLearningItem(item)) return null;
    
    switch (status) {
      case 'not-started':
        return <PlayCircle className="w-5 h-5 text-blue-600" />;
      case 'in-progress':
        return <PauseCircle className="w-5 h-5 text-yellow-600" />;
      case 'registered':
        return <Calendar className="w-5 h-5 text-purple-600" />;
      case 'completed':
        if (completionStatus === 'passed') return <CheckCircle className="w-5 h-5 text-green-600" />;
        if (completionStatus === 'failed') return <XCircle className="w-5 h-5 text-red-600" />;
        if (completionStatus === 'attended') return <UserCheck className="w-5 h-5 text-green-600" />;
        if (completionStatus === 'not-attended') return <StopCircle className="w-5 h-5 text-gray-600" />;
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending-review':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      default:
        return <PlayCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = (status?: string, completionStatus?: string) => {
    if (!isLearningItem(item)) return null;
    
    switch (status) {
      case 'not attempted': return 'Not Started';
      case 'incomplete': return 'In Progress';
      case 'registered': return 'Registered';
      case 'completed':
        if (completionStatus === 'passed') return 'Completed (Passed)';
        if (completionStatus === 'failed') return 'Completed (Failed)';
        if (completionStatus === 'attended') return 'Completed (Attended)';
        if (completionStatus === 'not-attended') return 'Completed (Not Attended)';
        return 'Completed';
      case 'pending-review': return 'Pending Review';
      default: return 'not attempted';
    }
  };

  const getProgressColor = (progress: number, status?: string) => {
    if (status === 'completed') return 'bg-green-500';
    if (progress === 0) return 'bg-gray-300';
    if (progress < 25) return 'bg-red-500';
    if (progress < 50) return 'bg-yellow-500';
    if (progress < 75) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDueDateInfo = (item: UnifiedItem) => {
    if (!isLearningItem(item)) return null;
    
    const dueDate = item.nextDueDate || item.dueDate;
    if (!dueDate) return null;

    const isOverdue = item.isOverdue || false;
    const daysToDue = item.daysToDue || 0;

    let urgencyClass = '';
    let urgencyText = '';

    if (isOverdue) {
      urgencyClass = 'text-red-600 bg-red-50 border-red-200';
      urgencyText = `Overdue by ${Math.abs(daysToDue)} day${Math.abs(daysToDue) === 1 ? '' : 's'}`;
    } else if (daysToDue <= 1) {
      urgencyClass = 'text-red-600 bg-red-50 border-red-200';
      urgencyText = daysToDue === 0 ? 'Due today' : 'Due tomorrow';
    } else if (daysToDue <= 3) {
      urgencyClass = 'text-orange-600 bg-orange-50 border-orange-200';
      urgencyText = `Due in ${daysToDue} days`;
    } else if (daysToDue <= 7) {
      urgencyClass = 'text-yellow-600 bg-yellow-50 border-yellow-200';
      urgencyText = `Due in ${daysToDue} days`;
    } else {
      urgencyClass = 'text-blue-600 bg-blue-50 border-blue-200';
      urgencyText = `Due ${formatDate(dueDate)}`;
    }

    return { urgencyClass, urgencyText, dueDate };
  };

  // Render action buttons based on context
  const renderActionButton = () => {
    if (context === 'catalog') {
      // Catalog context - show catalog-style buttons
      const viewType = item.viewType || (item.price && item.price.amount > 0 ? 3 : 2);
      
      if (viewType === 1) {
        return (
          <button
            onClick={() => onAction('direct-view', item)}
            className="flex px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View Content
          </button>
        );
      } else if (viewType === 2) {
        const inMyLearning = item.isInMyLearning ?? false;
        if(inMyLearning==false) {
          return (
          <button
            onClick={() => onAction('add-to-learning', item)}
            disabled={inMyLearning}
            className={`flex items-left gap-1 px-2 py-1 rounded-lg transition-colors flex items-center gap-2 ${'bg-green-600 text-white hover:bg-green-700'}`}
          >
            {<Plus className="w-4 h-4" />}
            {'Add to My Learning'}
          </button>
        );
        }else {
           return (
          <button
            onClick={() => onAction('direct-view', item)}
            className="flex items-left gap-1 px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View Content
          </button>
        );
        }
        
      } else {
        if(item.EnrollNowLink==="upgrademembership") {

          return (
          <button
            onClick={() => onAction('upgrade-subscription', item)}
            className="flex items-left gap-1 px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
             Subcribe to View
          </button>
        );
        }
        else{
        const inCart = item.isInCart ?? false;
        return (
          <button
            onClick={() => onAction('add-to-cart', item)}
            disabled={inCart}
            className={`px-2 py-1 rounded-lg transition-colors flex items-center gap-1 ${
              inCart 
                ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {inCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
            {inCart ? 'In Cart' : 'Add to Cart'}
          </button>
        );
      }
      }
    } else {
      // My Learning context - show learning-style buttons
      if (!isLearningItem(item)) return null;
      
      switch (item.learningStatus) {
        case 'not attempted':
          return (
            <button
              onClick={() => onAction('view-content', item)}
              className="px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              <Eye className="w-4 h-4" />
              View Content
            </button>
          );
        case 'incomplete':
          return (
            <button
              onClick={() => onAction('view-content', item)}
              className="px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
               <Eye className="w-4 h-4" />
              View Content
            </button>
          );
        case 'completed':
          return (
            <button
              onClick={() => onAction('view-content', item)}
              className="px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              <Eye className="w-4 h-4" />
             View Content
            </button>
          );
        case 'registered':
          return (
            <div className="text-center">
              <div className="text-sm text-gray-600">Event Date</div>
              <div className="font-medium text-sm">
                {item.nextDueDate ? formatDate(item.nextDueDate) : 'TBD'}
              </div>
              {item.location && (
                <div className="text-xs text-gray-500 flex items-center gap-1 justify-center mt-1">
                  <MapPin className="w-3 h-3" />
                  {item.location}
                </div>
              )}
            </div>
          );
        default:
          return (
            <div className="text-center text-sm text-orange-600">
              Under Review
            </div>
          );
      }
    }
  };

  // Common View Link button for My Learning
  const renderViewLinkButton = () => {
    if (context !== 'my-learning') return null;
    
    return (
      <button 
        onClick={() => onAction('view-content', item)}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded border border-blue-200 transition-colors"
        title="View Content"
      >
        <Eye className="w-4 h-4" />
      </button>
    );
  };

  const dueDateInfo = getDueDateInfo(item);
  const learningItem = isLearningItem(item) ? item : null;

  if (viewMode === 'list') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative group">
        <div className="flex items-center gap-4">
          <img
            src={item.thumbnail || 'https://ionicframework.com/docs/img/demos/thumbnail.svg'}
            alt={item.title}
            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 truncate pr-2">{item.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {/* <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(item.difficulty)}`}>
                    {item.difficulty}
                  </span> */}
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {item.contentType}
                  </span>
                  {item.rating.average > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-gray-600">{item.rating.average}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Status for My Learning */}
              {context === 'my-learning' && learningItem && (
                <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                  {getStatusIcon(learningItem.learningStatus, learningItem.completionStatus)}
                  <span className="text-sm text-gray-600">
                    {getStatusText(learningItem.learningStatus, learningItem.completionStatus)}
                  </span>
                </div>
              )}
            </div>

            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
              {/*<span className="text-blue-600 font-medium">{item.category}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatTime(item.duration)}
              </span>*/}
              
              {/* Learning-specific info */}
              {learningItem?.lastAccessed && (
                <span>Last accessed: {formatDate(learningItem.lastAccessed)}</span>
              )}
              {learningItem?.score !== undefined && (
                <span className="text-green-600 font-medium">Score: {learningItem.score}%</span>
              )}
              {learningItem?.instructor && (
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {learningItem.instructor.name}
                </span>
              )}
              
              {/* Catalog-specific info */}
             {/* {context === 'catalog' && (
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {item.enrollment.enrolled.toLocaleString()} enrolled
                </span>
              )}*/}
            </div>

            {/* Due Date Alert for My Learning */}
            {dueDateInfo && (
              <div className={`text-xs px-2 py-1 rounded border mb-3 inline-block ${dueDateInfo.urgencyClass}`}>
                {dueDateInfo.urgencyText}
              </div>
            )}

            {/* Progress Bar for My Learning */}
            {learningItem && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{learningItem.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getProgressColor(learningItem.progress, learningItem.learningStatus)}`}
                    style={{ width: `${learningItem.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Estimated time remaining for My Learning */}
            {learningItem?.estimatedTimeRemaining && learningItem.learningStatus === 'incomplete' && (
              <div className="text-sm text-gray-500">
                Estimated time remaining: {formatTime(learningItem.estimatedTimeRemaining)}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 flex-shrink-0">
            {/* Price for Catalog */}
            {context === 'catalog' && item.price && (
              <div className="text-right mb-2">
                <div className="text-lg font-bold text-gray-900">
                  ${item.price.amount}
                </div>
                <div className="text-xs text-gray-500">{item.price.currency}</div>
              </div>
            )}
            
            {renderActionButton()}
            
            {/* <div className="flex gap-2">
              {showDetailsButton && (
                <button 
                  onClick={() => onAction('details', item)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded border border-blue-200 transition-colors"
                  title="View Details"
                >
                  <Info className="w-4 h-4" />
                </button>
              )}
              
               
              {renderViewLinkButton()}
              
              <button 
                onClick={() => onAction('menu', item)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded border border-gray-200 transition-colors"
                title="More Options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>*/}
          </div>
        </div>

        {/* Hover overlay for details (only if not hiding floating buttons) */}
        {showDetailsButton && !hideFloatingButtons && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onAction('details', item)}
              className="bg-white text-blue-600 p-1.5 rounded-lg shadow-md border border-blue-200"
              title="Quick View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Grid view
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow relative group">
      <div className="relative">
        <img
          src={item.thumbnail || 'https://ionicframework.com/docs/img/demos/thumbnail.svg'}
          alt={item.title}
          className="w-full h-48 object-cover"
        />
        
        {/* Status Icon for My Learning */}
        {context === 'my-learning' && learningItem && (
          <div className="absolute top-3 left-3 flex items-center gap-2">
            {getStatusIcon(learningItem.learningStatus, learningItem.completionStatus)}
          </div>
        )}
        
        {/* Progress Indicator for My Learning */}
        {learningItem && (
          <div className="absolute top-3 right-3">
            <span className="bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
              {learningItem.progress}%
            </span>
          </div>
        )}
        
        {/* Certificate Badge for My Learning */}
        {learningItem?.certificateEarned && (
          <div className="absolute bottom-3 right-3">
            <Award className="w-6 h-6 text-yellow-500" />
          </div>
        )}
        
        {/* Due Date Alert for My Learning */}
        {dueDateInfo && dueDateInfo.urgencyClass.includes('red') && (
          <div className="absolute bottom-3 left-3">
            <div className={`text-xs px-2 py-1 rounded border ${dueDateInfo.urgencyClass}`}>
              {dueDateInfo.urgencyText}
            </div>
          </div>
        )}

        {/* Hover Details Button (only if not hiding floating buttons) */}
        {showDetailsButton && !hideFloatingButtons && (
          <div className="absolute inset-0 bg-transparent hover:bg-transparent transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <button
              onClick={() => onAction('details', item)}
              className="bg-white text-gray-900 px-4 py-2 rounded-lg shadow-lg transform scale-95 hover:scale-100 transition-transform flex items-center gap-2"
            >
              <Info className="w-4 h-4" />
              View Details
            </button>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-3">
          <h3 className="text-md font-semibold text-gray-900 mb-1 line-clamp-2">{item.title}</h3>
          <p className="text-xs text-blue-600 pb-2">{item.contentType}</p>
          <p className="text-gray-600 text-xs line-clamp-2">{item.description}</p>
        </div>

        {/* Tags and Metadata */}
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-500 flex-wrap">
         {/* <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(item.difficulty)}`}>
            {item.difficulty}
          </span> */}
           {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-1">
              {item.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {item.tags.length > 3 && (
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                  +{item.tags.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
          {/*<span className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs">
            {item.category}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTime(item.duration)}
          </span>*/}
          {learningItem?.score !== undefined && (
            <span className="text-green-600 font-medium text-xs">
              {learningItem.score}%
            </span>
          )}
        </div>

        {/* Rating */}
        {item.rating.average > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="font-medium text-sm">{item.rating.average}</span>
            </div>
            <span className="text-sm text-gray-500">
              ({item.rating.count} reviews)
            </span>
          </div>
        )}

        {/* Progress Bar for My Learning */}
        {learningItem && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">
                {getStatusText(learningItem.learningStatus, learningItem.completionStatus)}
              </span>
              <span className="font-medium">{learningItem.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${getProgressColor(learningItem.progress, learningItem.learningStatus)}`}
                style={{ width: `${learningItem.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Time and Date Info */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          {learningItem?.lastAccessed && (
            <span>Last: {formatDate(learningItem.lastAccessed)}</span>
          )}
          {learningItem?.estimatedTimeRemaining && learningItem.learningStatus === 'incomplete' && (
            <span>{formatTime(learningItem.estimatedTimeRemaining)} left</span>
          )}
          {learningItem?.nextDueDate && learningItem.learningStatus === 'registered' && (
            <span>Due: {formatDate(learningItem.nextDueDate)}</span>
          )}
         {/*} {context === 'catalog' && (
            <span>{item.enrollment.enrolled.toLocaleString()} enrolled</span>
          )}*/}
        </div>

        {/* Instructor for Events */}
        {learningItem?.instructor && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <User className="w-4 h-4" />
            <span>{learningItem.instructor.name}</span>
          </div>
        )}

        {/* Due Date Warning for My Learning */}
        {dueDateInfo && !dueDateInfo.urgencyClass.includes('blue') && (
          <div className={`text-xs px-2 py-1 rounded border mb-4 ${dueDateInfo.urgencyClass}`}>
            <div className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {dueDateInfo.urgencyText}
            </div>
          </div>
        )}

        {/* Price for Catalog */}
        {context === 'catalog' && item.price && (
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-bold text-gray-900">
              ${item.price.amount}
            </span>
            <span className="text-sm text-gray-500">{item.price.currency}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <div className="flex-1">
            {renderActionButton()}
          </div>
          
           {/*<div className="flex gap-2">
            {showDetailsButton && (
              <button 
                onClick={() => onAction('details', item)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded border border-blue-200 transition-colors"
                title="View Details"
              >
                <Info className="w-4 h-4" />
              </button>
            )} 
           {renderViewLinkButton()}            
           <button 
              onClick={() => onAction('menu', item)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded border border-gray-200 transition-colors"
              title="More Options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>*/}
        </div>

        {/* Learning Path Indicator */}
        {item.isPartOfPath && item.isPartOfPath.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <BookOpen className="w-3 h-3" />
              <span>Part of {item.isPartOfPath.length} learning path{item.isPartOfPath.length > 1 ? 's' : ''}</span>
            </div>
          </div>
        )} 
      </div>
    </div>
  );
};