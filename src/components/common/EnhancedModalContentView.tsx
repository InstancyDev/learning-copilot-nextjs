// components/common/EnhancedModalContentView.tsx - Modal with always visible close button

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ExternalLink,
  Maximize2,
  Minimize2,
  Clock,
  Loader2,
  AlertCircle,
  RotateCcw,
  Volume2,
  VolumeX,
  Pause,
  Play
} from 'lucide-react';

import type { CatalogItem } from '@/types/Catalog';
import type { LearningItem } from '@/types/Learning';
import { API_CONFIG } from '@/config/api.config';

type UnifiedItem = CatalogItem | LearningItem;

// Type guard to check if item is a LearningItem
const isLearningItem = (item: UnifiedItem): item is LearningItem => {
  return 'learningStatus' in item && 'progress' in item;
};

interface EnhancedModalContentViewProps {
  item: UnifiedItem;
  isOpen: boolean;
  onClose: () => void;
  onProgressUpdate?: (progress: number, timeSpent: number) => void;
  hideHeaderFooter?: boolean;
  showCloseButton?: boolean; // New prop for always visible close button
  previewUrl?: string; // Optional custom preview URL
  embeddedComponent?: React.ReactNode; // New prop for embedded React components
}

export const EnhancedModalContentView: React.FC<EnhancedModalContentViewProps> = ({ 
  item, 
  isOpen, 
  onClose,
  onProgressUpdate,
  hideHeaderFooter = true,
  showCloseButton = true,
  previewUrl,
  embeddedComponent
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(null);
      startTimeRef.current = Date.now();
      
      // Initialize progress from learning item if available
      if (isLearningItem(item)) {
        setCurrentProgress(item.progress || 0);
        setTimeSpent(item.actualTimeSpent || 0);
      }
      
      // Simulate content loading
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1500);
      
      // Set up progress tracking interval
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60); // minutes
        setTimeSpent(prev => prev + 1);
        
        // Simulate progress increment for demo
        setCurrentProgress(prev => {
          const newProgress = Math.min(100, prev + 1);
          if (onProgressUpdate) {
            onProgressUpdate(newProgress, elapsed);
          }
          return newProgress;
        });
      }, 30000); // Update every 30 seconds
      
      return () => {
        clearTimeout(timer);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      };
    }
  }, [isOpen, item, onProgressUpdate]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (event.key) {
        case 'Escape':
          if (isFullscreen) {
            setIsFullscreen(false);
          } else {
            onClose();
          }
          break;
        case 'F11':
          event.preventDefault();
          setIsFullscreen(!isFullscreen);
          break;
        case ' ':
          event.preventDefault();
          setIsPlaying(!isPlaying);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, isFullscreen, isPlaying, onClose]);

  const getContentUrl = (item: UnifiedItem): string => {    
     console.log(item); 
     const version = process.env.NEXT_PUBLIC_DOCUMENTVERSION

     if(item.contentTypeId == 14){
      if(item.directViewUrl?.includes("?")){
        return API_CONFIG.NEXT_JS_URL.replace("http://","https://") + 'learning-app' + item.directViewUrl?.toString().replace("start_cdn.html","start.html") +"&IsInstancyContent=false&v=" + version || "";
      }else{
        return API_CONFIG.NEXT_JS_URL.replace("http://","https://") + 'learning-app' + item.directViewUrl?.toString().replace("start_cdn.html","start.html") +"?IsInstancyContent=false&v=" + version || "";
      }
     }else{
      if(item.directViewUrl?.includes("?")){
        return API_CONFIG.LearnerURL.replace("http://","https://") + item.directViewUrl?.toString().replace("start_cdn.html","start.html") +"&IsInstancyContent=false&v=" + version || "";
      }else{
        return API_CONFIG.LearnerURL.replace("http://","https://") + item.directViewUrl?.toString().replace("start_cdn.html","start.html") +"?IsInstancyContent=false&v=" + version || "";
      }
        
     }
      
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleOpenExternal = () => {
    window.open(getContentUrl(item), '_blank');
  };

  if (!isOpen) return null;

  const modalClasses = isFullscreen 
    ? 'fixed inset-0 bg-transparent z-50' 
    : 'fixed inset-0 bg-transparent z-50 flex items-center justify-center p-0';

  const contentClasses = isFullscreen
    ? 'w-full h-full relative border-4 border-white border-opacity-20 rounded-lg'
    : 'bg-white rounded-xl w-full h-full max-w-[100vw] max-h-[100vh] flex flex-col relative border-4 border-gray-300 shadow-2xl';

  return (
    <div className={modalClasses}>
      <div ref={modalRef} className={contentClasses}>
        {/* Always Visible Close Button - Fixed Position */}
        {showCloseButton && (
          <div className={`absolute z-50 ${embeddedComponent ? 'top-0 right-3' : 'top-4 right-4'}`}>
            <div className="flex items-center gap-2 bg-black bg-opacity-75 rounded-lg p-2">
              {/* Optional additional controls */}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-gray-300 p-1 transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              
              <button
                onClick={handleOpenExternal}
                className="text-white hover:text-gray-300 p-1 transition-colors"
                title="Open in new window"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
              
              {/* Close Button - Always Visible */}
              <button
                onClick={onClose}
                className="text-white hover:text-red-400 p-1 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Content Area - Full Screen with No Headers/Footers */}
        <div className="w-full h-full relative">
          {/* If embeddedComponent is provided, render it directly */}
          {embeddedComponent ? (
            <div className="w-full h-full">
              {embeddedComponent}
            </div>
          ) : previewUrl ? (
            <iframe
              src={previewUrl}
              className="w-full h-full border-0"
              title="Preview"
              allow="autoplay; fullscreen; microphone; camera; encrypted-media; picture-in-picture"
              allowFullScreen
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation allow-presentation"
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent'
              }}
            />
          ) : (
            <>
              {/* Role Play Content Type: Show error if missing metadata */}
              {item.contentTypeId === 699 && (!item.metadata?.FolderPath || !(item.metadata?.ContentID || item.id)) ? (
                <div className="flex items-center justify-center h-full bg-gray-100">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Cannot Preview Role Play Content</h3>
                    <p className="text-gray-600 mb-4">Required metadata (FolderPath or ContentID) is missing. Please contact your administrator.</p>
                    <button
                      onClick={onClose}
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center h-full bg-gray-100">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                    <p className="text-gray-600">Loading content...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full bg-gray-100">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Content</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                      onClick={handleRetry}
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Try Again
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Main Content iFrame - Full Screen, No Controls */}
                  <iframe
                    ref={iframeRef}
                    src={getContentUrl(item)}
                    className="w-full h-full border-0"
                    title={item.title}
                    allow="autoplay; fullscreen; microphone; camera; encrypted-media; picture-in-picture"
                    allowFullScreen
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation allow-presentation"
                    onLoad={() => setLoading(false)}
                    onError={() => setError('Failed to load content')}
                    style={{
                      border: 'none',
                      outline: 'none',
                      background: 'transparent'
                    }}
                  />
                  
                  {/* Minimal Progress Indicator - Only for Learning Items */}
                  {isLearningItem(item) && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-30">
                      <div
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${currentProgress}%` }}
                      />
                    </div>
                  )}

                  {/* Hidden Progress Info - Only visible on hover over progress bar */}
                  {isLearningItem(item) && (
                    <div className="absolute bottom-2 left-4 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity">
                      Progress: {currentProgress}% | Time: {Math.floor(timeSpent / 60)}h {timeSpent % 60}m
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Completely Hidden Header - NO HEADER AT ALL */}
        {/* Header section removed completely */}

        {/* Completely Hidden Footer - NO FOOTER AT ALL */}
        {/* Footer section removed completely */}

        {/* Hidden Title Overlay - Only Shows on Hover for 2 seconds */}
        {!loading && !error && (
          <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded opacity-0 hover:opacity-100 transition-opacity group">
            <h2 className="font-semibold text-sm truncate max-w-xs">
              {item.title}
            </h2>
            <span className="text-xs text-gray-300">
              {item.contentType}
            </span>
          </div>
        )}

        {/* Media Controls Overlay - Only for Videos and Only on Hover */}
        {!loading && !error && item.contentTypeId === 11 && (
          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black bg-opacity-75 rounded-lg p-2 opacity-0 hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-white hover:text-gray-300 p-1"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-white hover:text-gray-300 p-1"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        )}

        {/* Time Indicator - Only Shows on Progress Bar Hover */}
        {!loading && !error && isLearningItem(item) && timeSpent > 0 && (
          <div className="absolute bottom-8 right-4 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>
                {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};