// components/catalog/CatalogFilters.tsx
import React from 'react';
import { Crown, TrendingUp } from 'lucide-react';

interface FilterValues {
  query: string;
  category: string;
  contentTypeId: string;
  contentType: string;
  difficulty: string;
  author: string;
  rating: string;
  duration: string;
  status: string;
  tags: string[];
  sortBy: string;
  sortOrder: string;
}

interface Category {
  CategoryID: string;
  CategoryName: string;
}

interface CatalogFiltersProps {
  filters: FilterValues;
  categories: Category[];
  contentTypes: Record<string, string>;
  catalogItems: any[];
  showFilters: boolean;
  onToggleFilters: () => void;
  onFilterChange: (key: keyof FilterValues, value: any) => void;
  onClearFilters: () => void;
  catalogState: any;
  accessLevel: string;
  checkContentAccess: (item: any) => { hasAccess: boolean; requiredTier?: string };
  onUpgradeSubscription: () => void;
}

export const CatalogFilters: React.FC<CatalogFiltersProps> = ({
  filters,
  categories,
  contentTypes,
  catalogItems,
  showFilters,
  onToggleFilters,
  onFilterChange,
  onClearFilters,
  catalogState,
  accessLevel,
  checkContentAccess,
  onUpgradeSubscription
}) => {
  // Render premium content stats
  const renderPremiumContentStats = () => {
    const premiumCount = catalogState.items.filter((item: any) => 
      item.subscriptionTier && item.subscriptionTier !== 'free'
    ).length;
    
    const accessibleCount = catalogState.items.filter((item: any) => 
      checkContentAccess(item).hasAccess
    ).length;

    if (premiumCount === 0) return null;

    return (
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <Crown className="w-4 h-4 text-purple-600" />
          <span className="text-gray-600">
            {premiumCount} Premium {premiumCount === 1 ? 'Course' : 'Courses'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <span className="text-gray-600">
            {accessibleCount} Accessible
          </span>
        </div>
        {premiumCount > accessibleCount && (
          <button
            onClick={onUpgradeSubscription}
            className="text-blue-600 hover:text-blue-700 underline text-sm"
          >
            Unlock {premiumCount - accessibleCount} More
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Search and Filter Controls */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search courses, certifications, videos..."
              value={filters.query}
              onChange={(e) => onFilterChange('query', e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            /> 
             {/* Category Filter */}
              <select
                value={filters.category}
                onChange={(e) => onFilterChange('category', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
               >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.CategoryName} value={category.CategoryID}>
                    {category.CategoryName}
                  </option>
                ))}
              </select>

              {/* Content Type Filter */}
              <select
                value={filters.contentTypeId}
                onChange={(e) => onFilterChange('contentTypeId', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Content Types</option>
                {Object.entries(contentTypes).map(([id, name]) => (
                  <option key={name} value={id}>
                    {name}
                  </option>
                ))}
              </select> 
          { (filters.query!='' || filters.category!='' || filters.contentTypeId!='') && (<button
              onClick={onClearFilters}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              Clear
            </button>)}
          </div> 
        </div>

        {/* Results Summary with Subscription Info */}
        <div className="flex items-center justify-between text-sm text-gray-600 mt-4">
          <div className="flex items-center gap-4">
            <div>
              Showing {catalogState.items.length} of {catalogState.total} results
              {filters.query && (
                <span className="ml-2">
                  for "<span className="font-medium">{filters.query}</span>"
                </span>
              )}
            </div>
            
            {/* Premium Content Stats */}
            {renderPremiumContentStats()}
          </div> 
        </div>
      </div>
    </div>
  );
};