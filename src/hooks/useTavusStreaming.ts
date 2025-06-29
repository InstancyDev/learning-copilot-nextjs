// Replace your useTavusStreaming.ts with this fixed version:

import { useState, useCallback, useRef, useEffect } from 'react';
import DailyIframe, { DailyCall } from '@daily-co/daily-js';
import { TavusClient } from '@/lib/tavus';
import { TavusPersonaConfig, SimpleTavusPersonaConfig } from '@/types/tavus';

export interface UseTavusStreamingOptions {
  apiKey: string;
  replicaId: string;
  personaConfig: TavusPersonaConfig | SimpleTavusPersonaConfig;
  useSimplePersona?: boolean;
  onJoined?: () => void;
  onLeft?: () => void;
  onError?: (error: Error) => void;
}

export interface TavusStreamingState {
  isConnecting: boolean;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  conversationId: string | null;
}

export function useTavusStreaming({
  apiKey,
  replicaId,
  personaConfig,
  useSimplePersona = false,
  onJoined,
  onLeft,
  onError,
}: UseTavusStreamingOptions) {
  const [state, setState] = useState<TavusStreamingState>({
    isConnecting: false,
    isConnected: false,
    isLoading: false,
    error: null,
    conversationId: null,
  });

  const callFrameRef = useRef<DailyCall | null>(null);
  const tavusClientRef = useRef<TavusClient | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callFrameRef.current) {
        try {
          callFrameRef.current.destroy();
        } catch (error) {
          console.warn('Error destroying call frame:', error);
        }
        callFrameRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
  return () => {
    console.log('Component unmounting, cleaning up...');
    cleanup();
  };
}, []);

// 2. Add this cleanup function:
const cleanup = useCallback(() => {
  console.log('Starting cleanup...');
  
  if (callFrameRef.current) {
    try {
      console.log('Destroying call frame...');
      
      // Get the iframe before destroying
      const iframe = callFrameRef.current.iframe();
      
      // Leave the call first
      callFrameRef.current.leave().catch((error) => {
        console.warn('Error leaving call:', error);
      });
      
      // Destroy the call frame
      callFrameRef.current.destroy();
      callFrameRef.current = null;
      
      // Manually remove iframe if it still exists in DOM
      if (iframe && iframe.parentNode) {
        try {
          iframe.parentNode.removeChild(iframe);
          console.log('Iframe removed from DOM');
        } catch (removeError) {
          console.warn('Error removing iframe:', removeError);
        }
      }
      
    } catch (error) {
      console.warn('Error during call frame cleanup:', error);
      callFrameRef.current = null;
    }
  }
  
  if (tavusClientRef.current) {
    tavusClientRef.current.endConversation().catch((error) => {
      console.warn('Error ending conversation:', error);
    });
    tavusClientRef.current = null;
  }
}, []);
 const startStreaming = useCallback(async (containerElement: HTMLElement) => {
  setState(prev => ({ ...prev, isLoading: true, error: null }));

  try {
    console.log('=== STARTING STREAMING ===');
    
    // Validate container
    if (!containerElement) {
      throw new Error('Container element is required');
    }

    // Clean up any existing setup first
    cleanup();
    
    // Wait a bit for cleanup to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Clear container safely
    try {
      while (containerElement.firstChild) {
        containerElement.removeChild(containerElement.firstChild);
      }
      console.log('Container cleared');
    } catch (clearError) {
      console.warn('Error clearing container:', clearError);
      containerElement.innerHTML = ''; // Fallback
    }

    // Initialize Tavus client
    tavusClientRef.current = new TavusClient(apiKey);

    // Test API connection first
    console.log('Testing API connection...');
    await tavusClientRef.current.testAPIConnection();
    // Create conversation
    console.log('Creating conversation...');
    const conversation = await tavusClientRef.current.createConversation(
      replicaId,
      'p15bf6b10810'
    );

    console.log('Conversation created:', conversation);

    setState(prev => ({
      ...prev,
      conversationId: conversation.conversationId,
      isConnecting: true,
    }));

    // Validate meeting URL
    if (!conversation.meetingUrl || !conversation.meetingUrl.startsWith('https://')) {
      throw new Error(`Invalid meeting URL: ${conversation.meetingUrl}`);
    }

    console.log('Initializing Daily call frame...');

    // Create Daily call frame with better error handling
    try {
      callFrameRef.current = DailyIframe.createFrame({
        iframeStyle: {
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '8px',
        },
        showLeaveButton: true,
        showFullscreenButton: true,
        showLocalVideo: true,
        showParticipantsBar: true,
      });

      console.log('Call frame created successfully');

      // Get and append iframe safely
      if (callFrameRef.current) {
        const iframe = callFrameRef.current.iframe();
        if (iframe && containerElement) {
          // Check if iframe is already in DOM
          if (!iframe.parentNode) {
            containerElement.appendChild(iframe);
            console.log('Iframe appended to container');
          } else {
            console.log('Iframe already has parent, moving to new container');
            containerElement.appendChild(iframe);
          }
        } else {
          throw new Error('Failed to get iframe or container is null');
        }
      } else {
        throw new Error('Failed to create call frame');
      }

      // Set up event listeners
      callFrameRef.current.on('joined-meeting', (event) => {
        console.log('✅ Joined meeting successfully:', event);
        setState(prev => ({
          ...prev,
          isConnecting: false,
          isConnected: true,
          isLoading: false,
        }));
        onJoined?.();
      });

      callFrameRef.current.on('left-meeting', (event) => {
        console.log('Left meeting:', event);
        setState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
        }));
        onLeft?.();
      });

      callFrameRef.current.on('error', (event) => {
        console.error('Daily call error:', event);
        const error = new Error(event.errorMsg || 'Daily call error');
        setState(prev => ({
          ...prev,
          error: error.message,
          isLoading: false,
          isConnecting: false,
        }));
        onError?.(error);
      });

      callFrameRef.current.on('participant-joined', (event) => {
        console.log('Participant joined:', event.participant);
      });

      callFrameRef.current.on('participant-left', (event) => {
        console.log('Participant left:', event.participant);
      });

      // Join the meeting
      console.log('Joining meeting:', conversation.meetingUrl);
      
      const joinResult = await callFrameRef.current.join({
        url: conversation.meetingUrl,
        userName: 'User',
        userData: { isHost: false },
      });

      console.log('Join result:', joinResult);

    } catch (dailyError) {
      console.error('Daily.js error:', dailyError);
      throw new Error(`Failed to initialize video call: ${dailyError instanceof Error ? dailyError.message : 'Unknown Daily.js error'}`);
    }

  } catch (error) {
    console.error('=== STREAMING ERROR ===');
    console.error('Error details:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    setState(prev => ({
      ...prev,
      error: errorMessage,
      isLoading: false,
      isConnecting: false,
    }));
    onError?.(error instanceof Error ? error : new Error(errorMessage));
  }
}, [apiKey, replicaId, personaConfig, useSimplePersona, onJoined, onLeft, onError, cleanup]);

// 4. Update the stopStreaming function:
const stopStreaming = useCallback(async () => {
  try {
    console.log('=== STOPPING STREAMING ===');
    
    cleanup();

    setState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      conversationId: null,
      error: null,
    }));

    console.log('✅ Streaming stopped successfully');

  } catch (error) {
    console.error('Error stopping streaming:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    setState(prev => ({ ...prev, error: errorMessage }));
    onError?.(error instanceof Error ? error : new Error(errorMessage));
  }
}, [cleanup, onError]);

  return {
    ...state,
    startStreaming,
    stopStreaming,
  };
}