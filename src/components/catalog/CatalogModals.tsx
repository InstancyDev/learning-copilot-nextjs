// components/catalog/CatalogModals.tsx
import React from 'react';
import { Eye, X } from 'lucide-react';

interface CatalogModalsProps {
  selectedItem: any;
  showDetailModal: boolean;
  showContentModal: boolean;
  onCloseDetailModal: () => void;
  onCloseContentModal: () => void;
  onLaunchContent: (item: any) => void;
}

// Mock Content Detail Modal
const ContentDetailModal = ({ item, isOpen, onClose, onLaunch, context }: any) => {
  if (!isOpen) return null;
  
   

  return (
    <div className="fixed inset-0 bg-transparent/80 z-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">{item.title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            <img 
              src={item.thumbnail || 'https://via.placeholder.com/400x200'} 
              alt={item.title}
              className="w-full h-48 object-cover rounded-lg"
            />
            
            <p className="text-gray-600">{item.description}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Content Type:</span> {item.contentType}
              </div>
              <div>
                <span className="font-medium">Author:</span> {item.author?.name}
              </div>
              <div>
                <span className="font-medium">Rating:</span> {item.rating?.average}/5 ({item.rating?.count} reviews)
              </div>
              <div>
                <span className="font-medium">Access Level:</span> 
                <span className={`ml-1 capitalize ${
                  item.subscriptionTier === 'free' ? 'text-green-600' :
                  item.subscriptionTier === 'basic' ? 'text-blue-600' :
                  item.subscriptionTier === 'premium' ? 'text-yellow-600' :
                  'text-purple-600'
                }`}>
                  {item.subscriptionTier || 'Free'}
                </span>
              </div>
            </div>
            
            {item.tags && item.tags.length > 0 && (
              <div>
                <span className="font-medium text-sm">Tags:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {item.tags.map((tag: string) => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-3 mt-6">
          {(item.viewType === 1 || item.isInMyLearning) && (
            <button
              onClick={() => onLaunch(item)}
              className="flex-1 px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Content
            </button>
          )} 
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mock Enhanced Modal Content View
const EnhancedModalContentView = ({ item, isOpen, onClose, hideHeaderFooter, showCloseButton }: any) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {!hideHeaderFooter && (
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold">{item.title}</h2>
              {showCloseButton && (
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              )}
            </div>
          )}
          
          {showCloseButton && hideHeaderFooter && (
            <div className="flex justify-end mb-4">
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
          )}
          
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <h3 className="text-xl font-semibold mb-4">Content Viewer</h3>
            <p className="text-gray-600 mb-6">
              This is where the actual content would be displayed based on the item type and user's access permissions.
            </p>
            
            <div className="space-y-4">
              <div className="bg-white p-4 rounded border">
                <h4 className="font-medium mb-2">Currently Viewing:</h4>
                <p className="text-sm text-gray-600">{item.title}</p>
              </div>
              
              <div className="bg-white p-4 rounded border">
                <h4 className="font-medium mb-2">Content Type:</h4>
                <p className="text-sm text-gray-600">{item.contentType}</p>
              </div>

            </div>
            
            <div className="mt-6">
              <p className="text-xs text-gray-500">
                In a real implementation, this would load the appropriate content viewer 
                based on the content type (video player, document viewer, interactive course, etc.)
              </p>
            </div>
          </div>
          
          {!hideHeaderFooter && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const CatalogModals: React.FC<CatalogModalsProps> = ({
  selectedItem,
  showDetailModal,
  showContentModal,
  onCloseDetailModal,
  onCloseContentModal,
  onLaunchContent
}) => {
  if (!selectedItem) return null;

  return (
    <>
      {/* Detail Modal */}
      <ContentDetailModal
        item={selectedItem}
        isOpen={showDetailModal}
        onClose={onCloseDetailModal}
        onLaunch={onLaunchContent}
        context="catalog"
      />

      {/* Content Viewing Modal */}
      <EnhancedModalContentView
        item={selectedItem}
        isOpen={showContentModal}
        onClose={onCloseContentModal}
        hideHeaderFooter={true}
        showCloseButton={true}
      />
    </>
  );
};