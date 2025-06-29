// components/DueDatesView.tsx - Specialized component for due dates visualization

import React from 'react';
import {
  Clock,
  AlertTriangle,
  Calendar,
  CheckCircle,
  XCircle,
  ArrowRight,
  MapPin,
  User
} from 'lucide-react';

import type { LearningItem } from '@/types/Learning';

interface DueDatesViewProps {
  items: LearningItem[];
  onAction: (action: string, item: LearningItem) => void;
}

export const DueDatesView: React.FC<DueDatesViewProps> = ({ items, onAction }) => {
  
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getDueDateInfo = (item: LearningItem) => {
    const dueDate = item.nextDueDate || item.dueDate;
    if (!dueDate) return null;

    const isOverdue = item.isOverdue || false;
    const daysToDue = item.daysToDue || 0;

    let urgencyLevel: 'overdue' | 'critical' | 'warning' | 'normal' = 'normal';
    let urgencyText = '';

    if (isOverdue) {
      urgencyLevel = 'overdue';
      urgencyText = `Overdue by ${Math.abs(daysToDue)} day${Math.abs(daysToDue) === 1 ? '' : 's'}`;
    } else if (daysToDue <= 1) {
      urgencyLevel = 'critical';
      urgencyText = daysToDue === 0 ? 'Due today' : 'Due tomorrow';
    } else if (daysToDue <= 3) {
      urgencyLevel = 'warning';
      urgencyText = `Due in ${daysToDue} days`;
    } else {
      urgencyLevel = 'normal';
      urgencyText = `Due in ${daysToDue} days`;
    }

    return { urgencyLevel, urgencyText, dueDate, daysToDue };
  };

  const getUrgencyStyles = (urgencyLevel: string) => {
    switch (urgencyLevel) {
      case 'overdue':
        return {
          border: 'border-red-200 bg-red-50',
          header: 'bg-red-100 text-red-800',
          badge: 'bg-red-500 text-white',
          icon: 'text-red-600'
        };
      case 'critical':
        return {
          border: 'border-orange-200 bg-orange-50',
          header: 'bg-orange-100 text-orange-800',
          badge: 'bg-orange-500 text-white',
          icon: 'text-orange-600'
        };
      case 'warning':
        return {
          border: 'border-yellow-200 bg-yellow-50',
          header: 'bg-yellow-100 text-yellow-800',
          badge: 'bg-yellow-500 text-white',
          icon: 'text-yellow-600'
        };
      default:
        return {
          border: 'border-blue-200 bg-blue-50',
          header: 'bg-blue-100 text-blue-800',
          badge: 'bg-blue-500 text-white',
          icon: 'text-blue-600'
        };
    }
  };

  // Group items by urgency level
  const groupedItems = {
    overdue: items.filter(item => item.isOverdue),
    critical: items.filter(item => !item.isOverdue && (item.daysToDue || 0) <= 1),
    warning: items.filter(item => !item.isOverdue && (item.daysToDue || 0) > 1 && (item.daysToDue || 0) <= 3),
    normal: items.filter(item => !item.isOverdue && (item.daysToDue || 0) > 3)
  };

  const renderItemCard = (item: LearningItem) => {
    const dueDateInfo = getDueDateInfo(item);
    if (!dueDateInfo) return null;

    const styles = getUrgencyStyles(dueDateInfo.urgencyLevel);

    return (
      <div key={item.id} className={`border rounded-lg p-4 ${styles.border}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-gray-900 line-clamp-1">{item.title}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${styles.badge}`}>
                {dueDateInfo.urgencyText}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs">
                {item.category}
              </span>
              <span>{item.contentType}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(item.duration)}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 ml-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {formatDate(dueDateInfo.dueDate)}
              </div>
              {item.location && (
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {item.location}
                </div>
              )}
              {item.instructor && (
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {item.instructor.name}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{item.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                item.progress === 100 ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${item.progress}%` }}
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {item.learningStatus === 'completed' ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : item.isOverdue ? (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            ) : (
              <Calendar className="w-4 h-4 text-blue-600" />
            )}
            <span className="text-sm text-gray-600">
              {item.learningStatus === 'completed' 
                ? 'Completed' 
                : item.learningStatus === 'registered'
                  ? 'Registered'
                  : item.learningStatus === 'incomplete'
                    ? 'In Progress'
                    : 'Not Started'
              }
            </span>
          </div>

          <button
            onClick={() => {
              if (item.learningStatus === 'not attempted') {
                onAction('start', item);
              } else if (item.learningStatus === 'incomplete') {
                onAction('continue', item);
              } else if (item.learningStatus === 'completed') {
                onAction('review', item);
              } else {
                onAction('view', item);
              }
            }}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              item.isOverdue 
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : dueDateInfo.urgencyLevel === 'critical'
                  ? 'bg-orange-600 hover:bg-orange-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {item.learningStatus === 'completed' ? 'Review' : 
             item.learningStatus === 'incomplete' ? 'Continue' : 
             item.learningStatus === 'registered' ? 'View Details' : 'Start'}
            <ArrowRight className="w-3 h-3 ml-1 inline" />
          </button>
        </div>
      </div>
    );
  };

  const renderSection = (title: string, items: LearningItem[], urgencyLevel: string) => {
    if (items.length === 0) return null;

    const styles = getUrgencyStyles(urgencyLevel);

    return (
      <div className="mb-6">
        <div className={`px-4 py-2 rounded-t-lg ${styles.header} flex items-center gap-2`}>
          {urgencyLevel === 'overdue' && <AlertTriangle className="w-5 h-5" />}
          {urgencyLevel === 'critical' && <Clock className="w-5 h-5" />}
          {urgencyLevel === 'warning' && <Calendar className="w-5 h-5" />}
          {urgencyLevel === 'normal' && <Calendar className="w-5 h-5" />}
          <h2 className="font-semibold">{title}</h2>
          <span className="text-sm">({items.length})</span>
        </div>
        <div className="space-y-3 p-4 bg-white border-l border-r border-b rounded-b-lg">
          {items.map(renderItemCard)}
        </div>
      </div>
    );
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming due dates</h3>
        <p className="text-gray-600">All your learning items are on track!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <div className="text-2xl font-bold text-red-900">{groupedItems.overdue.length}</div>
              <div className="text-sm text-red-700">Overdue</div>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <div>
              <div className="text-2xl font-bold text-orange-900">{groupedItems.critical.length}</div>
              <div className="text-sm text-orange-700">Due Soon</div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-yellow-600" />
            <div>
              <div className="text-2xl font-bold text-yellow-900">{groupedItems.warning.length}</div>
              <div className="text-sm text-yellow-700">This Week</div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-blue-900">{groupedItems.normal.length}</div>
              <div className="text-sm text-blue-700">Upcoming</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grouped Items */}
      {renderSection('Overdue Items', groupedItems.overdue, 'overdue')}
      {renderSection('Due Today/Tomorrow', groupedItems.critical, 'critical')}
      {renderSection('Due This Week', groupedItems.warning, 'warning')}
      {renderSection('Upcoming Deadlines', groupedItems.normal, 'normal')}
    </div>
  );
};