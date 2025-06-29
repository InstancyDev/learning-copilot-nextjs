'use client';

import React, { useRef, useCallback, useEffect } from 'react';
import { useTavusStreaming } from '../hooks/useTavusStreaming';
import { TavusPersonaConfig, SimpleTavusPersonaConfig } from '../types/tavus';

interface TavusStreamingAvatarProps {
  apiKey: string;
  replicaId: string;
  personaConfig: TavusPersonaConfig | SimpleTavusPersonaConfig;
  useSimplePersona?: boolean;
  className?: string;
  onSessionStart?: () => void;
  onSessionEnd?: () => void;
  onError?: (error: Error) => void;
}

 const TavusStreamingAvatar: React.FC<TavusStreamingAvatarProps> = ({
  apiKey,
  replicaId,
  personaConfig,
  useSimplePersona = false,
  className = '',
  onSessionStart,
  onSessionEnd,
  onError,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    isConnecting,
    isConnected,
    isLoading,
    error,
    conversationId,
    startStreaming,
    stopStreaming,
  } = useTavusStreaming({
    apiKey,
    replicaId,
    personaConfig,
    useSimplePersona,
    onJoined: onSessionStart,
    onLeft: onSessionEnd,
    onError,
  });

  const handleStartStreaming = useCallback(async () => {
    if (!containerRef.current) {
      console.error('Container ref is null');
      onError?.(new Error('Video container not ready'));
      return;
    }
    
    console.log('Container element:', containerRef.current);
    console.log('Container dimensions:', {
      width: containerRef.current.offsetWidth,
      height: containerRef.current.offsetHeight
    });
    
    try {
      await startStreaming(containerRef.current);
    } catch (error) {
      console.error('Error in handleStartStreaming:', error);
      onError?.(error instanceof Error ? error : new Error('Failed to start streaming'));
    }
  }, [startStreaming, onError]);

  const handleStopStreaming = useCallback(async () => {
    try {
      await stopStreaming();
    } catch (error) {
      console.error('Error in handleStopStreaming:', error);
      onError?.(error instanceof Error ? error : new Error('Failed to stop streaming'));
    }
  }, [stopStreaming, onError]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (containerRef.current) {
        // Clear container on unmount
        try {
          containerRef.current.innerHTML = '';
        } catch (error) {
          console.warn('Error clearing container on unmount:', error);
        }
      }
    };
  }, []);

  return (
    <div className={`tavus-streaming-container ${className}`}>
      <div
        ref={containerRef}
        className="video-container"
        style={{
          width: '100%',
          height: '500px',
          backgroundColor: '#000',
          borderRadius: '8px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Your loading states and placeholders */}
      </div>
      
      {/* Your controls */}
      <div className="controls" style={{ marginTop: '16px' }}>
        {!isConnected ? (
          <button
            onClick={handleStartStreaming}
            disabled={isLoading || isConnecting}
          >
            {isLoading ? 'Initializing...' : isConnecting ? 'Connecting...' : 'Start Avatar'}
          </button>
        ) : (
          <button onClick={handleStopStreaming}>
            End Conversation
          </button>
        )}
      </div>
      
      {/* Error display */}
      {error && (
        <div className="error-message" style={{ marginTop: '16px', color: 'red' }}>
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default TavusStreamingAvatar;