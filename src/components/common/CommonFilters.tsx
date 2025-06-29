// components/common/CommonFilters.tsx - Unified filters for both Catalog and My Learning

import React from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  X
} from 'lucide-react';

export interface FilterOptions {
  categories: any[];
  contentTypes: { id: number; name: string }[];
  authors: string[];
  difficulties: string[];
  tags?: string[];
  statuses?: { value: string; label: string; color: string }[];
}

export interface FilterValues {
  query: string;
  category: string;
  contentTypeId: number | string;
  contentType: string;
  difficulty: string;
  author: string;
  rating: number | string;
  duration: string;
  status: string;
  tags: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface CommonFiltersProps {
  filters: FilterValues;
  filterOptions: FilterOptions;
  onFilterChange: (key: keyof FilterValues, value: any) => void;
  onClearFilters: () => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  context: 'catalog' | 'my-learning';
  searchPlaceholder?: string;
  hideAdvancedFilters?: string[]; // Hide specific filters
}

export const CommonFilters: React.FC<CommonFiltersProps> = ({
  filters,
  filterOptions,
  onFilterChange,
  onClearFilters,
  showFilters,
  onToggleFilters,
  context,
  searchPlaceholder = "Search content...",
  hideAdvancedFilters = []
}) => {

  const handleSearchChange = (query: string) => {
    console.log('Search change:', query); // Debug log
    onFilterChange('query', query);
  };

  const getSortOptions = () => {
    const baseSortOptions = [
      { value: 'recent', label: 'Recently Accessed' },
      { value: 'title', label: 'Title (A-Z)' },
      { value: 'rating', label: 'Rating' },
      { value: 'duration', label: 'Duration' }
    ];

    if (context === 'my-learning') {
      return [
        ...baseSortOptions,
        { value: 'progress', label: 'Progress' },
        { value: 'due-date', label: 'Due Date' }
      ];
    }

    return baseSortOptions;
  };

  const getDurationOptions = () => [
    { value: '', label: 'Any Duration' },
    { value: 'short', label: 'Short (< 1 hour)' },
    { value: 'medium', label: 'Medium (1-3 hours)' },
    { value: 'long', label: 'Long (> 3 hours)' }
  ];

  const getRatingOptions = () => [
    { value: '', label: 'Any Rating' },
    { value: '4.5', label: '4.5+ Stars' },
    { value: '4.0', label: '4.0+ Stars' },
    { value: '3.5', label: '3.5+ Stars' },
    { value: '3.0', label: '3.0+ Stars' }
  ];

  const hasActiveFilters = () => {
    return filters.query || 
           filters.category || 
           filters.contentTypeId || 
           filters.difficulty || 
           filters.author || 
           filters.rating || 
           filters.duration || 
           filters.status ||
           (filters.tags && filters.tags.length > 0) ||
           filters.sortBy !== 'recent';
  };

  const isFilterHidden = (filterName: string) => {
    return hideAdvancedFilters.includes(filterName);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar and Basic Controls */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.query}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          {filters.query && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <select
          value={filters.sortBy}
          onChange={(e) => onFilterChange('sortBy', e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-w-[160px]"
        >
          {getSortOptions().map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Advanced Filters Toggle */}
        <button
          onClick={onToggleFilters}
          className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
            showFilters || hasActiveFilters()
              ? 'border-blue-300 bg-blue-50 text-blue-700'
              : 'border-gray-300 hover:bg-gray-50 text-gray-700'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters() && (
            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
              {Object.values(filters).filter(v => v && v !== 'recent' && (Array.isArray(v) ? v.length > 0 : true)).length}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          {/* Category Filter */}
          {!isFilterHidden('category') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => onFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Categories</option>
                {filterOptions.categories.map(category => (
                  <option key={category.CategoryID} value={category.CategoryID}>{category.CategoryName}</option>
                ))}
              </select>
            </div>
          )}

          {/* Content Type Filter */}
          {!isFilterHidden('contentType') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
              <select
                value={filters.contentTypeId}
                onChange={(e) => onFilterChange('contentTypeId', e.target.value ? parseInt(e.target.value) : '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Types</option>
                {filterOptions.contentTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Difficulty Filter */}
          {!isFilterHidden('difficulty') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                value={filters.difficulty}
                onChange={(e) => onFilterChange('difficulty', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Levels</option>
                {filterOptions.difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Duration Filter */}
          {!isFilterHidden('duration') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <select
                value={filters.duration}
                onChange={(e) => onFilterChange('duration', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {getDurationOptions().map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Author Filter */}
          {!isFilterHidden('author') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
              <select
                value={filters.author}
                onChange={(e) => onFilterChange('author', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Authors</option>
                {filterOptions.authors.map(author => (
                  <option key={author} value={author}>{author}</option>
                ))}
              </select>
            </div>
          )}

          {/* Rating Filter */}
          {!isFilterHidden('rating') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <select
                value={filters.rating}
                onChange={(e) => onFilterChange('rating', e.target.value ? parseFloat(e.target.value) : '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {getRatingOptions().map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Status Filter (My Learning only) */}
          {context === 'my-learning' && !isFilterHidden('status') && filterOptions.statuses && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => onFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Status</option>
                {filterOptions.statuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Tags Filter */}
          {!isFilterHidden('tags') && filterOptions.tags && filterOptions.tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value && !filters.tags.includes(e.target.value)) {
                    onFilterChange('tags', [...filters.tags, e.target.value]);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Add Tag Filter...</option>
                {filterOptions.tags
                  .filter(tag => !filters.tags.includes(tag))
                  .map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))
                }
              </select>
              {/* Selected Tags */}
              {filters.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {filters.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {tag}
                      <button
                        onClick={() => onFilterChange('tags', filters.tags.filter(t => t !== tag))}
                        className="hover:text-blue-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Clear Filters Button */}
          <div className="flex items-end">
            <button
              onClick={onClearFilters}
              disabled={!hasActiveFilters()}
              className={`w-full px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                hasActiveFilters()
                  ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              }`}
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters() && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Active filters:</span>
          <div className="flex flex-wrap gap-2">
            {filters.query && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                Search: "{filters.query}"
                <button onClick={() => onFilterChange('query', '')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.category && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                Category: {filters.category}
                <button onClick={() => onFilterChange('category', '')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.difficulty && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                Difficulty: {filters.difficulty}
                <button onClick={() => onFilterChange('difficulty', '')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.duration && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                Duration: {getDurationOptions().find(d => d.value === filters.duration)?.label}
                <button onClick={() => onFilterChange('duration', '')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.status && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                Status: {filterOptions.statuses?.find(s => s.value === filters.status)?.label}
                <button onClick={() => onFilterChange('status', '')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.sortBy !== 'recent' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                Sort: {getSortOptions().find(s => s.value === filters.sortBy)?.label}
                <button onClick={() => onFilterChange('sortBy', 'recent')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};