// components/catalog/CatalogGrid.tsx
import React from 'react';
import { Loader2 } from 'lucide-react';
import { ContentAccessGate } from '@/components/common/ContentAccessGate';
import { UnifiedLearningCard } from '@/components/common/UnifiedLearningCard';

interface CatalogGridProps {
  catalogState: {
    items: any[];
    total: number;
    loading: boolean;
    error: string | null;
  };
  viewMode: 'grid' | 'list';
  accessLevel: 'free' | 'paid';
  checkContentAccess: (item: any) => { hasAccess: boolean; requiredTier?: string };
  onItemAction: (action: string, item: any) => void;
  onUpgradeSubscription: () => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  mcpConnected: boolean;
  onRetryMcp: () => void;
  isItemLoading?: boolean;
  getItemError?: (item: any) => string | null;
  showDetailsButton?: boolean;
}

export const CatalogGrid: React.FC<CatalogGridProps> = ({
  catalogState,
  viewMode,
  accessLevel,
  checkContentAccess,
  onItemAction,
  onUpgradeSubscription,
  currentPage,
  onPageChange,
  mcpConnected,
  onRetryMcp,
  isItemLoading= false
}) => {
  const itemsPerPage = 12;
  const totalPages = Math.ceil(catalogState.total / itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {catalogState.items.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-2">No items found</div>
          <div className="text-gray-400">Try adjusting your search or filters</div>
          {!mcpConnected && (
            <div className="mt-4">
              <button
                onClick={onRetryMcp}
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Reconnect to MCP Server
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Catalog Items Grid */}
          <div className={`
            ${viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
            }
          `}>
            {catalogState.items.map((item, index) => {
              const accessCheck = checkContentAccess(item);
              
              return (
                <div key={`catalog-${item.id}-${index}`}>
                  {!accessCheck.hasAccess ? (
                    <ContentAccessGate
                      requiredTier={accessCheck.requiredTier as any}
                      currentTier={accessLevel}
                      onUpgrade={onUpgradeSubscription}
                      contentType="course"
                      contentTitle={item.title}
                    >
                      <UnifiedLearningCard
                        item={item}
                        viewMode={viewMode}
                        onAction={onItemAction}
                        context="catalog"
                        showDetailsButton={true}
                        hideFloatingButtons={false}
                        //accessLevel={accessLevel}
                        onUpgrade={onUpgradeSubscription}
                      />
                    </ContentAccessGate>
                  ) : (
                    <UnifiedLearningCard
                      item={item}
                      viewMode={viewMode}
                      onAction={onItemAction}
                      context="catalog"
                      showDetailsButton={true}
                      hideFloatingButtons={false}
                      //accessLevel={accessLevel}
                      onUpgrade={onUpgradeSubscription}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Loading Indicator */}
          {catalogState.loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading...</span>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-8 gap-2">
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border text-gray-600 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`px-3 py-2 border rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'text-gray-600 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};