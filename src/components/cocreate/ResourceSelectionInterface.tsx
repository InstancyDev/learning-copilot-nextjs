import React from 'react';

interface ResourceSelectionInterfaceProps {
  onResourceSelect: (resource: any) => void;
  onClose: () => void;
}

const ResourceSelectionInterface: React.FC<ResourceSelectionInterfaceProps> = ({ onResourceSelect, onClose }) => {
  return (
    <div className="fixed inset-0 z-[110] bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl">
        <h2 className="text-lg font-bold mb-4">Select Resource (Placeholder)</h2>
        <p>This is a placeholder for the resource selection UI.</p>
        <div className="mt-6 flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Close</button>
          <button 
            onClick={() => {
              onResourceSelect({
                title: 'Mock Selected Resource',
                url: 'https://example.com/mock-resource',
                description: 'This is a mock resource selected from the placeholder interface.',
                thumbnail: 'https://via.placeholder.com/150'
              });
            }} 
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Select Mock Resource
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResourceSelectionInterface; 