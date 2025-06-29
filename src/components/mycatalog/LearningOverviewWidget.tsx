// components/LearningOverviewWidget.tsx - Compact learning overview for dashboards

import React from 'react';
import {
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  ArrowRight,
  TrendingUp,
  Award,
  PlayCircle
} from 'lucide-react';

import type { LearningStats, LearningItem } from '@/types/Learning';

interface LearningOverviewWidgetProps {
  stats: LearningStats;
  recentItems?: LearningItem[];
  upcomingDueDates?: LearningItem[];
  onNavigate?: (tab: string) => void;
  className?: string;
}

export const LearningOverviewWidget: React.FC<LearningOverviewWidgetProps> = ({
  stats,
  recentItems = [],
  upcomingDueDates = [],
  onNavigate,
  className = ''
}) => {
  
  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getProgressColor = (progress: number) => {
    if (progress === 0) return 'bg-gray-300';
    if (progress < 25) return 'bg-red-400';
    if (progress < 50) return 'bg-yellow-400';
    if (progress < 75) return 'bg-blue-400';
    return 'bg-green-400';
  };

  const getDueDateUrgency = (item: LearningItem) => {
    if (item.isOverdue) return 'text-red-600';
    if ((item.daysToDue || 0) <= 1) return 'text-orange-600';
    if ((item.daysToDue || 0) <= 3) return 'text-yellow-600';
    return 'text-blue-600';
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">My Learning</h3>
        </div>
        <button
          onClick={() => onNavigate?.('my-learning')}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs text-gray-500">Total Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
            <div className="text-xs text-gray-500">In Progress</div>
          </div>
        </div>

        {/* Urgent Items Alert */}
        {(stats.overdue > 0 || stats.dueSoon > 0) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">Attention Needed</span>
            </div>
            <div className="space-y-1">
              {stats.overdue > 0 && (
                <div className="text-xs text-red-700">
                  {stats.overdue} item{stats.overdue > 1 ? 's' : ''} overdue
                </div>
              )}
              {stats.dueSoon > 0 && (
                <div className="text-xs text-orange-700">
                  {stats.dueSoon} item{stats.dueSoon > 1 ? 's' : ''} due soon
                </div>
              )}
            </div>
            <button
              onClick={() => onNavigate?.('due-dates')}
              className="text-xs text-red-600 hover:text-red-700 font-medium mt-1"
            >
              View Due Dates →
            </button>
          </div>
        )}

        {/* Recent Learning Activity */}
        {recentItems.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-900">Continue Learning</h4>
              <button
                onClick={() => onNavigate?.('in-progress')}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                View All
              </button>
            </div>
            <div className="space-y-2">
              {recentItems.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                    <PlayCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {item.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-12 bg-gray-200 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full ${getProgressColor(item.progress)}`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{item.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Due Dates */}
        {upcomingDueDates.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-900">Upcoming Deadlines</h4>
              <button
                onClick={() => onNavigate?.('due-dates')}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                View All
              </button>
            </div>
            <div className="space-y-2">
              {upcomingDueDates.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {item.title}
                      </div>
                      <div className="text-xs text-gray-500">{item.contentType}</div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-xs font-medium ${getDueDateUrgency(item)}`}>
                      {item.isOverdue 
                        ? 'Overdue' 
                        : item.nextDueDate || item.dueDate 
                          ? formatDate(item.nextDueDate || item.dueDate!)
                          : 'TBD'
                      }
                    </div>
                    {item.daysToDue !== undefined && !item.isOverdue && (
                      <div className="text-xs text-gray-400">
                        {item.daysToDue === 0 ? 'Today' : 
                         item.daysToDue === 1 ? 'Tomorrow' : 
                         `${item.daysToDue} days`}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Summary */}
        <div className="pt-3 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-gray-900">
                  {formatTime(stats.totalTimeSpent)}
                </span>
              </div>
              <div className="text-xs text-gray-500">Time Invested</div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <Award className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-900">
                  {stats.certificatesEarned}
                </span>
              </div>
              <div className="text-xs text-gray-500">Certificates</div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onNavigate?.('catalog')}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Browse Learning Catalog
        </button>
      </div>
    </div>
  );
};

// Compact version for smaller spaces
export const LearningOverviewCompact: React.FC<{
  stats: LearningStats;
  onNavigate?: (tab: string) => void;
  className?: string;
}> = ({ stats, onNavigate, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Learning Progress</h3>
        </div>
        {(stats.overdue > 0 || stats.dueSoon > 0) && (
          <AlertCircle className="w-5 h-5 text-red-500" />
        )}
      </div>

      <div className="grid grid-cols-4 gap-3 mb-3">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">{stats.total}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">{stats.completed}</div>
          <div className="text-xs text-gray-500">Done</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-orange-600">{stats.inProgress}</div>
          <div className="text-xs text-gray-500">Active</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-red-600">{stats.overdue}</div>
          <div className="text-xs text-gray-500">Overdue</div>
        </div>
      </div>

      <button
        onClick={() => onNavigate?.('my-learning')}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
      >
        <TrendingUp className="w-4 h-4" />
        View Details
      </button>
    </div>
  );
};