import React, { useEffect, useRef } from 'react';

// Declare window.Chatbot for TypeScript
declare global {
  interface Window {
    Chatbot?: {
      initFull: (config: any) => void;
    };
  }
}

interface BotDetailsType {
  BotID: string;
  BotName: string;
  BotSettings: string;
}

interface FlowiseAIAssistantProps {
  BotDetails?: BotDetailsType;
  userContext?: {
    jwtToken: string;
    email: string;
    clientUrl: string;
    siteId: string | number;
    userId: string | number;
    orgUnitId: string | number;
    locale: string;
    webAPIUrl: string;
    sessionId: string;
  };
  welcomeMessage?: string;
  starterPrompts?: string[];
  userAvatarImage?: string;
  apiHost?: string;
}

const DEFAULT_FLOWISE_EMBED_URL = 'https://instancycommoncontent.blob.core.windows.net/flowise-embed/1.2.5.2/dist/web.js';
const DEFAULT_CHATFLOW_ID = '8e5b16d8-d2c2-4666-abc8-bdff0d5ad451';
const DEFAULT_API_HOST = 'https://qaaiagentstudio.instancy.com:4500';

const FlowiseAIAssistant: React.FC<FlowiseAIAssistantProps> = ({
  BotDetails,
  userContext,
  welcomeMessage,
  starterPrompts,
  userAvatarImage,
  apiHost,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Clean up previous chatbot if needed
    if (containerRef.current) {
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
      // Always create the custom element before initializing
      const chatbotElement = document.createElement('flowise-fullchatbot');
      containerRef.current.appendChild(chatbotElement);
    }

    // Parse BotSettings if available
    let botSettings: any = {};
    if (BotDetails && BotDetails.BotSettings) {
      try {
        botSettings = JSON.parse(BotDetails.BotSettings);
      } catch (e) {
        botSettings = {};
      }
    }

    // Build config
    const config = {
      chatflowid: BotDetails?.BotID || DEFAULT_CHATFLOW_ID,
      apiHost: apiHost || DEFAULT_API_HOST,
      chatflowConfig: userContext
        ? {
            vars: {
              authorizationCode: userContext.jwtToken,
              emailId: userContext.email,
              clientUrl: userContext.clientUrl,
              siteId: userContext.siteId,
              userId: userContext.userId,
              orgUnitId: userContext.orgUnitId,
              Language: userContext.locale,
              webAPIURL: userContext.webAPIUrl,
              categoryId: '',
              UserSessionID: userContext.sessionId,
              sessionId: userContext.sessionId,
            },
          }
        : undefined,
      observersConfig: {},
      theme: {
        button: {
          backgroundColor: botSettings?.button?.backgroundColor || '#3B81F6',
          right: botSettings?.button?.right || 20,
          bottom: botSettings?.button?.bottom || 20,
          size: botSettings?.button?.size || 48,
          dragAndDrop: true,
          iconColor: botSettings?.button?.iconColor || 'white',
          customIconSrc: botSettings?.titleAvatarSrc || '',
          autoWindowOpen: {
            autoOpen: botSettings?.button?.autoOpenBot || false,
            openDelay: 0,
            autoOpenOnMobile: false,
          },
        },
        tooltip: {
          showTooltip: botSettings?.tooltip?.showTooltip || false,
          tooltipMessage: botSettings?.tooltip?.tooltipMessage || 'Hi there!',
          tooltipBackgroundColor: botSettings?.tooltip?.tooltipBackgroundColor || 'black',
          tooltipTextColor: botSettings?.tooltip?.tooltipTextColor || 'white',
        },
      },
      welcomeMessage,
      starterPrompts,
      userAvatarImage,
    };

    const FLOWISE_EMBED_URL = DEFAULT_FLOWISE_EMBED_URL;
    let script = document.querySelector(`script[src="${FLOWISE_EMBED_URL}"]`) as HTMLScriptElement | null;

    // Bulletproof polling for window.Chatbot
    const pollForChatbot = () => {
      let tries = 0;
      const maxTries = 100;
      const poll = () => {
        if (window.Chatbot && typeof window.Chatbot.initFull === 'function') {
          window.Chatbot.initFull(config);
        } else if (tries < maxTries) {
          tries++;
          setTimeout(poll, 100);
        } else {
          if (containerRef.current) {
            containerRef.current.innerHTML = '<div style="color:red">Chatbot failed to load. Please contact support.</div>';
          }
          console.error('Chatbot not found on window');
        }
      };
      poll();
    };

    if (!script) {
      script = document.createElement('script') as HTMLScriptElement;
      script.src = FLOWISE_EMBED_URL;
      script.async = true;
      script.onload = pollForChatbot;
      document.body.appendChild(script);
    } else {
      // If the script is already present, check if window.Chatbot is ready
      if (window.Chatbot && typeof window.Chatbot.initFull === 'function') {
        window.Chatbot.initFull(config);
      } else {
        pollForChatbot();
      }
    }

    // No cleanup needed
  }, [BotDetails, userContext, welcomeMessage, starterPrompts, userAvatarImage, apiHost]);

  return <div ref={containerRef} id="flowise-chatbot-container" className="w-full h-full" />;
};

export default FlowiseAIAssistant; 