import React, { useEffect, useRef } from 'react'; 
import { observersConfigType } from 'flowise-embed/dist/components/Bot';
import { ButtonTheme, ChatWindowTheme, DisclaimerPopUpTheme, FormTheme, ToolTipTheme } from 'flowise-embed/dist/features/bubble/types';
import { getSiteConfigValue } from '@/services/api.service';
import { sessionUtils } from '@/utils/auth';
import { API_CONFIG } from '@/config/api.config';

interface BotDetailsType {
  BotID: string;
  BotName: string;
  BotSettings: string;
}

interface UserContextType {
  jwtToken: string;
  email: string;
  clientUrl: string;
  siteId: string | number;
  userId: string | number;
  orgUnitId: string | number;
  locale: string;
  webAPIUrl: string;
  sessionId: string;
}

interface FlowiseFullPageAIAssistantProps {
  BotDetails?: BotDetailsType;
  userContext?: any;
  welcomeMessage?: string;
  starterPrompts?: string[];
  userAvatarImage?: string;
  apiHost?: string;
  mode?: 'bot' | 'ai-tutor';
  contentId?: string;
  topicNodes?: any;
  aiTutorSettings?: {
    title?: string;
    welcomeMessage?: string;
    backgroundColor?: string;
    botMessage?: {
      backgroundColor?: string;
      textColor?: string;
      showAvatar?: boolean;
      avatarSrc?: string;
    };
    userMessage?: {
      backgroundColor?: string;
      textColor?: string;
      showAvatar?: boolean;
      avatarSrc?: string;
    };
    textInput?: {
      placeholder?: string;
      backgroundColor?: string;
      textColor?: string;
      sendButtonColor?: string;
    };
    footer?: {
      textColor?: string;
      text?: string;
      company?: string;
      companyLink?: string;
    };
  };
}

const DEFAULT_CHATFLOW_ID = '8e5b16d8-d2c2-4666-abc8-bdff0d5ad451';
const DEFAULT_API_HOST = 'https://qaaiagentstudio.instancy.com:4500';

type Props = BotProps & {
   style?: React.CSSProperties;
   className?: string;
};

type BotProps = {
  chatflowid: string;
  apiHost?: string;
  onRequest?: (request: RequestInit) => Promise<void>;
  chatflowConfig?: Record<string, unknown>;
  observersConfig?: observersConfigType;
  theme?: BubbleTheme; 
};
export type BubbleParams = {
  theme?: BubbleTheme;
};

export type BubbleTheme = {
  chatWindow?: ChatWindowTheme;
  button?: ButtonTheme;
  tooltip?: ToolTipTheme;
  disclaimer?: DisclaimerPopUpTheme;
  customCSS?: string;
  form?: FormTheme;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'flowise-fullchatbot': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & { class?: string };
    }
  }
}

type FullPageChatElement = HTMLElement & Props;

export const FullPageChat = ({ style, className, ...assignableProps }: Props) => {
  const ref = useRef<FullPageChatElement | null>(null);

  useEffect(() => {
    const loadScript = async () => {
      try {
        const script = document.createElement('script');
        script.src = API_CONFIG.AIAgentScriptSrc;
        script.async = true;
        script.setAttribute('type', 'module');
        document.head.appendChild(script);
      } catch (error) {
        console.error('Failed to load Flowise script:', error);
      }
    };
    
    loadScript();
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    Object.assign(ref.current, assignableProps);
  }, [assignableProps]);

  // @ts-ignore: Custom element not recognized by TS
  return <flowise-fullchatbot ref={ref} style={style} class={className} />;
};

const FlowiseFullPageAIAssistant: React.FC<FlowiseFullPageAIAssistantProps> = ({
  BotDetails,
  userContext,
  welcomeMessage,
  starterPrompts,
  userAvatarImage,
  apiHost,
  mode = 'bot',
  contentId,
  topicNodes,
  aiTutorSettings,
}) => {
  // Parse BotSettings if available
  let botSettings: any = {};
  let theme = {};
  let greetingMessage = '';
  debugger;
  let chatflowConfig;
  if (BotDetails && BotDetails.BotSettings) {
    try {
      botSettings = JSON.parse(BotDetails.BotSettings);
      const user = sessionUtils.getUserFromSession();
      if (!user) throw new Error('User not authenticated');
      greetingMessage = getSiteConfigValue('BotGreetingContent')?.toString() || '';
      greetingMessage = greetingMessage.replace(user.UserDisplayName === '' ? ' ##UserName##' : '##UserName##',user.UserDisplayName)
      greetingMessage = greetingMessage.replace('##BotName##',botSettings.title)
      console.log(botSettings);
      chatflowConfig = userContext
    ? {
        vars: {
          authorizationCode: userContext.jwtToken || userContext.JwtToken,
          emailId: userContext.email || userContext.EmailAddress,
          clientUrl: API_CONFIG.LearnerURL,
          siteId: userContext.siteId || userContext.SiteID,
          userId: userContext.userId || userContext.UserID,
          orgUnitId: userContext.orgUnitId || userContext.OrgUnitID,
          Language: userContext.locale || userContext.Language,
          webAPIURL: API_CONFIG.WebAPIURL,
          categoryId: '',
          UserSessionID: userContext.sessionId || userContext.SessionID,
          sessionId: userContext.sessionId || userContext.SessionID,
          contentId: contentId || '', 
        },
      }
    : {};
      theme = {
        button: {
          backgroundColor: botSettings.button.backgroundColor,
          right: botSettings.button.right,
          bottom: botSettings.button.bottom,
          size: botSettings.button.size,
          dragAndDrop: true,
          iconColor: botSettings.button.iconColor,
          customIconSrc: botSettings.titleAvatarSrc,
          autoWindowOpen: {
              autoOpen: true,
              openDelay: 2,
              autoOpenOnMobile: false
          }
      },
      tooltip: {
          showTooltip: true,
          tooltipMessage: botSettings.tooltip.tooltipMessage,
          tooltipBackgroundColor: botSettings.tooltip.tooltipBackgroundColor,
          tooltipTextColor: botSettings.tooltip.tooltipTextColor,
          tooltipFontSize: botSettings.tooltip.tooltipFontSize
      }, 
      customCSS: ``,
      chatWindow: {
          showTitle: true,
          showAgentMessages: true,
          title: botSettings.title,
          titleAvatarSrc: botSettings.titleAvatarSrc,
          welcomeMessage: botSettings?.welcomeMessage ? botSettings?.welcomeMessage : (greetingMessage ? greetingMessage : ''),
          errorMessage: botSettings.errorMessage,
          backgroundColor: botSettings.backgroundColor, 
          fontSize: 16,
          starterPrompts: starterPrompts == undefined ? [] : starterPrompts,
          starterPromptFontSize: 15,
          clearChatOnReload: false,
          sourceDocsTitle: 'Sources:',
          renderHTML: true,
          botMessage: {
              backgroundColor: botSettings.botMessage.backgroundColor,
              textColor: botSettings.botMessage.textColor,
              showAvatar: botSettings.botMessage.showAvatar,
              avatarSrc: botSettings.botMessage.avatarSrc
          },
          userMessage: {
              backgroundColor: botSettings.userMessage.backgroundColor,
              textColor: botSettings.userMessage.textColor,
              showAvatar: botSettings.userMessage.showAvatar,
              avatarSrc: botSettings.userMessage.avatarSrc
          },
          textInput: {
              placeholder: botSettings.textInput.placeholder,
              backgroundColor: botSettings.textInput.backgroundColor,
              textColor: botSettings.textInput.textColor,
              sendButtonColor: botSettings.textInput.sendButtonColor,              
              maxCharsWarningMessage: 'You exceeded the characters limit. Please input less than 50 characters.',
              autoFocus: true,
              sendMessageSound: true,
              sendSoundLocation: 'send_message.mp3',
              receiveMessageSound: true,
              receiveSoundLocation: 'receive_message.mp3'
          },
          feedback: {
              color: '#303235'
          },
          dateTimeToggle: {
              date: true,
              time: true
          },
          footer: {
              textColor: botSettings?.footer?.textColor || '#FFFFFF',
              text: botSettings?.footer?.text || '',
              company: botSettings?.footer?.company || '',
              companyLink: botSettings?.footer?.companyLink || ''
          }
      }
      };
    } catch (e) {
      botSettings = {};
    }
  } else if (mode === 'ai-tutor' && aiTutorSettings) {
    // AI Tutor theme configuration
    theme = {
      button: {
        backgroundColor: '#3B81F6',
        right: 20,
        bottom: 20,
        size: 48,
        dragAndDrop: true,
        iconColor: 'white',
        customIconSrc: 'https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/svg/google-messages.svg',
        autoWindowOpen: {
            autoOpen: true,
            openDelay: 2,
            autoOpenOnMobile: false
        }
      },
      tooltip: {
        showTooltip: true,
        tooltipMessage: 'AI Tutor Assistant',
        tooltipBackgroundColor: 'black',
        tooltipTextColor: 'white',
        tooltipFontSize: 16
      },
      customCSS: ``,
      chatWindow: {
        showTitle: true,
        showAgentMessages: true,
        title: aiTutorSettings.title || 'AI Tutor',
        titleAvatarSrc: 'https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/svg/google-messages.svg',
        welcomeMessage: aiTutorSettings.welcomeMessage || 'Hello! I\'m your AI Tutor. How can I help you today?',
        errorMessage: 'Sorry, I encountered an error. Please try again.',
        backgroundColor: aiTutorSettings.backgroundColor || '#ffffff',
        fontSize: 16,
        starterPrompts: starterPrompts || [],
        starterPromptFontSize: 15,
        clearChatOnReload: false,
        sourceDocsTitle: 'Sources:',
        renderHTML: true,
        botMessage: {
          backgroundColor: aiTutorSettings.botMessage?.backgroundColor || '#f7f8ff',
          textColor: aiTutorSettings.botMessage?.textColor || '#303235',
          showAvatar: aiTutorSettings.botMessage?.showAvatar !== false,
          avatarSrc: aiTutorSettings.botMessage?.avatarSrc || 'https://raw.githubusercontent.com/zahidkhawaja/langchain-chat-nextjs/main/public/parroticon.png'
        },
        userMessage: {
          backgroundColor: aiTutorSettings.userMessage?.backgroundColor || '#3B81F6',
          textColor: aiTutorSettings.userMessage?.textColor || '#ffffff',
          showAvatar: aiTutorSettings.userMessage?.showAvatar !== false,
          avatarSrc: aiTutorSettings.userMessage?.avatarSrc || 'https://raw.githubusercontent.com/zahidkhawaja/langchain-chat-nextjs/main/public/usericon.png'
        },
        textInput: {
          placeholder: aiTutorSettings.textInput?.placeholder || 'Ask your AI Tutor...',
          backgroundColor: aiTutorSettings.textInput?.backgroundColor || '#ffffff',
          textColor: aiTutorSettings.textInput?.textColor || '#303235',
          sendButtonColor: aiTutorSettings.textInput?.sendButtonColor || '#3B81F6',
          maxCharsWarningMessage: 'You exceeded the characters limit. Please input less than 50 characters.',
          autoFocus: true,
          sendMessageSound: true,
          sendSoundLocation: 'send_message.mp3',
          receiveMessageSound: true,
          receiveSoundLocation: 'receive_message.mp3'
        },
        feedback: {
          color: '#303235'
        },
        dateTimeToggle: {
          date: true,
          time: true
        },
        footer: {
          textColor: aiTutorSettings.footer?.textColor || '#303235',
          text: aiTutorSettings.footer?.text || 'Powered by',
          company: aiTutorSettings.footer?.company || 'AI Tutor',
          companyLink: aiTutorSettings.footer?.companyLink || '#'
        }
      }
    };
  }

  // Build chatflowConfig
  // const chatflowConfig = userContext
  //   ? {
  //       vars: {
  //         authorizationCode: userContext.jwtToken || userContext.JwtToken,
  //         emailId: userContext.email || userContext.EmailAddress,
  //         clientUrl: API_CONFIG.LearnerURL,
  //         siteId: userContext.siteId || userContext.SiteID,
  //         userId: userContext.userId || userContext.UserID,
  //         orgUnitId: userContext.orgUnitId || userContext.OrgUnitID,
  //         Language: userContext.locale || userContext.Language,
  //         webAPIURL: API_CONFIG.WebAPIURL,
  //         categoryId: '',
  //         UserSessionID: userContext.sessionId || userContext.SessionID,
  //         sessionId: userContext.sessionId || userContext.SessionID,
  //         contentId: contentId || '', 
  //       },
  //     }
  //   : {};

  return (
    <div className="flex-1 min-h-0">
      {(mode === 'bot' && BotDetails) || (mode === 'ai-tutor' && contentId) ? (
        <FullPageChat
          chatflowid={mode === 'bot' ? (BotDetails?.BotID || DEFAULT_CHATFLOW_ID) : (contentId || '')}
          apiHost={apiHost || DEFAULT_API_HOST}
          chatflowConfig={chatflowConfig}  
          theme={theme as BubbleTheme} 
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">
            {mode === 'ai-tutor' ? 'Loading AI Tutor...' : 'Loading AI Assistant...'}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowiseFullPageAIAssistant; 