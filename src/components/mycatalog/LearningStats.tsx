// components/LearningStats.tsx - Complete learning statistics dashboard component

import React from 'react';
import {
  TrendingUp,
  CheckCircle,
  Clock,
  Award,
  Target,
  BookOpen,
  Calendar,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  BarChart3,
  Users,
  Star,
  Zap
} from 'lucide-react';

import type { LearningStats } from '@/types/Learning';

interface LearningStatsProps {
  stats: LearningStats;
  className?: string;
}

// Main compact stats component for the header
export const LearningStatsComponent: React.FC<LearningStatsProps> = ({ 
  stats, 
  className = '' 
}) => {
  
  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const calculateCompletionRate = (): number => {
    if (stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  };

  const getProgressDistribution = () => {
    const total = stats.total;
    if (total === 0) return [];

    return [
      { 
        label: 'Not Started', 
        count: stats.notStarted, 
        percentage: Math.round((stats.notStarted / total) * 100),
        color: 'bg-gray-400',
        icon: PlayCircle
      },
      { 
        label: 'In Progress', 
        count: stats.inProgress, 
        percentage: Math.round((stats.inProgress / total) * 100),
        color: 'bg-yellow-500',
        icon: PauseCircle
      },
      { 
        label: 'Registered', 
        count: stats.registered, 
        percentage: Math.round((stats.registered / total) * 100),
        color: 'bg-purple-500',
        icon: Calendar
      },
      { 
        label: 'Completed', 
        count: stats.completed, 
        percentage: Math.round((stats.completed / total) * 100),
        color: 'bg-green-500',
        icon: CheckCircle
      },
      { 
        label: 'Pending Review', 
        count: stats.pendingReview, 
        percentage: Math.round((stats.pendingReview / total) * 100),
        color: 'bg-orange-500',
        icon: AlertCircle
      }
    ].filter(item => item.count > 0);
  };

  const progressDistribution = getProgressDistribution();
  const completionRate = calculateCompletionRate();

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-4 ${className}`}>
      {/* Total Progress */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">Total Items</span>
        </div>
        <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
        <div className="text-sm text-blue-600">Learning items</div>
      </div>

      {/* Completion Rate */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-green-700">Completed</span>
        </div>
        <div className="text-2xl font-bold text-green-900">{stats.completed}</div>
        <div className="text-sm text-green-600">{completionRate}% completion rate</div>
      </div>

      {/* Time Spent */}
      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-5 h-5 text-yellow-600" />
          <span className="text-sm font-medium text-yellow-700">Time Spent</span>
        </div>
        <div className="text-2xl font-bold text-yellow-900">{formatTime(stats.totalTimeSpent)}</div>
        <div className="text-sm text-yellow-600">Learning time</div>
      </div>

      {/* Certificates */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-5 h-5 text-purple-600" />
          <span className="text-sm font-medium text-purple-700">Certificates</span>
        </div>
        <div className="text-2xl font-bold text-purple-900">{stats.certificatesEarned}</div>
        <div className="text-sm text-purple-600">Earned</div>
      </div>

      {/* Average Score */}
      <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-5 h-5 text-indigo-600" />
          <span className="text-sm font-medium text-indigo-700">Avg Score</span>
        </div>
        <div className="text-2xl font-bold text-indigo-900">{stats.averageScore}%</div>
        <div className="text-sm text-indigo-600">Performance</div>
      </div>

      {/* Due Soon Alert */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-5 h-5 text-orange-600" />
          <span className="text-sm font-medium text-orange-700">Due Soon</span>
        </div>
        <div className="text-2xl font-bold text-orange-900">{stats.dueSoon}</div>
        <div className="text-sm text-orange-600">Within 7 days</div>
      </div>

      {/* Overdue Alert */}
      <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-sm font-medium text-red-700">Overdue</span>
        </div>
        <div className="text-2xl font-bold text-red-900">{stats.overdue}</div>
        <div className="text-sm text-red-600">Past deadline</div>
      </div>

      {/* Progress Distribution */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Distribution</span>
        </div>
        <div className="space-y-2">
          {progressDistribution.slice(0, 2).map((item) => {
            const IconComponent = item.icon;
            return (
              <div key={item.label} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <IconComponent className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-600">{item.label}</span>
                </div>
                <span className="font-medium text-gray-900">{item.count}</span>
              </div>
            );
          })}
          {progressDistribution.length > 2 && (
            <div className="text-xs text-gray-500">
              +{progressDistribution.length - 2} more
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Extended Stats Component with Progress Bars and Detailed Analytics
export const DetailedLearningStats: React.FC<LearningStatsProps> = ({ 
  stats, 
  className = '' 
}) => {
  
  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getProgressDistribution = () => {
    const total = stats.total;
    if (total === 0) return [];

    return [
      { 
        label: 'Not Started', 
        count: stats.notStarted, 
        percentage: Math.round((stats.notStarted / total) * 100),
        color: 'bg-gray-400',
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-700',
        icon: PlayCircle
      },
      { 
        label: 'In Progress', 
        count: stats.inProgress, 
        percentage: Math.round((stats.inProgress / total) * 100),
        color: 'bg-yellow-500',
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-700',
        icon: PauseCircle
      },
      { 
        label: 'Registered', 
        count: stats.registered, 
        percentage: Math.round((stats.registered / total) * 100),
        color: 'bg-purple-500',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-700',
        icon: Calendar
      },
      { 
        label: 'Completed', 
        count: stats.completed, 
        percentage: Math.round((stats.completed / total) * 100),
        color: 'bg-green-500',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        icon: CheckCircle
      },
      { 
        label: 'Pending Review', 
        count: stats.pendingReview, 
        percentage: Math.round((stats.pendingReview / total) * 100),
        color: 'bg-orange-500',
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-700',
        icon: AlertCircle
      }
    ].filter(item => item.count > 0);
  };

  const progressDistribution = getProgressDistribution();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Items</div>
            </div>
          </div>
          <div className="w-full bg-blue-100 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
          <div className="w-full bg-green-100 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }} 
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{formatTime(stats.totalTimeSpent)}</div>
              <div className="text-sm text-gray-600">Time Spent</div>
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Zap className="w-4 h-4 mr-1" />
            {stats.total > 0 ? Math.round(stats.totalTimeSpent / stats.total) : 0}m avg per item
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.certificatesEarned}</div>
              <div className="text-sm text-gray-600">Certificates</div>
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Star className="w-4 h-4 mr-1" />
            {stats.averageScore}% avg score
          </div>
        </div>
      </div>

      {/* Progress Distribution */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Progress Distribution</h3>
        <div className="space-y-4">
          {progressDistribution.map((item) => {
            const IconComponent = item.icon;
            return (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-900">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{item.count}</span>
                    <span className="text-sm text-gray-500">({item.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${item.color}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Due Dates Alert Section */}
      {(stats.overdue > 0 || stats.dueSoon > 0) && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attention Required</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.overdue > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-800">Overdue Items</span>
                </div>
                <div className="text-2xl font-bold text-red-900 mb-1">{stats.overdue}</div>
                <div className="text-sm text-red-700">Items past their deadline</div>
              </div>
            )}
            
            {stats.dueSoon > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span className="font-medium text-orange-800">Due Soon</span>
                </div>
                <div className="text-2xl font-bold text-orange-900 mb-1">{stats.dueSoon}</div>
                <div className="text-sm text-orange-700">Items due within 7 days</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {stats.averageScore > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Average Score</span>
                <span className="text-sm font-bold text-gray-900">{stats.averageScore}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-green-500"
                  style={{ width: `${stats.averageScore}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Completion Rate</span>
                <span className="text-sm font-bold text-gray-900">
                  {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-yellow-500 to-green-500"
                  style={{ 
                    width: `${stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%` 
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Learning Velocity */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-blue-900">{stats.inProgress}</div>
            <div className="text-sm text-blue-700">Active Learning</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-green-900">{stats.certificatesEarned}</div>
            <div className="text-sm text-green-700">Achievements</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-purple-900">{stats.pendingReview}</div>
            <div className="text-sm text-purple-700">Under Review</div>
          </div>
        </div>
      </div>
    </div>
  );
};