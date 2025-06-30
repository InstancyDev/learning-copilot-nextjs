declare module 'flowise-embed/dist/components/Bot' {
  export type observersConfigType = {
    observeUserInput?: (userInput: string) => void;
    observeMessages?: (messages: any[]) => void;
    observeLoading?: (loading: boolean) => void;
  };
}

declare module 'flowise-embed/dist/features/bubble/types' {
  export interface ButtonTheme {
    backgroundColor?: string;
    right?: number;
    bottom?: number;
    size?: number;
    dragAndDrop?: boolean;
    iconColor?: string;
    customIconSrc?: string;
    autoWindowOpen?: {
      autoOpen?: boolean;
      openDelay?: number;
      autoOpenOnMobile?: boolean;
    };
  }

  export interface ChatWindowTheme {
    showTitle?: boolean;
    title?: string;
    titleAvatarSrc?: string;
    showAgentMessages?: boolean;
    welcomeMessage?: string;
    errorMessage?: string;
    backgroundColor?: string;
    height?: number;
    width?: number;
    fontSize?: number;
    poweredByTextColor?: string;
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
      maxChars?: number;
      autoFocus?: boolean;
      sendMessageSound?: boolean;
      receiveMessageSound?: boolean;
    };
    feedback?: {
      color?: string;
    };
    dateTimeToggle?: {
      date?: boolean;
      time?: boolean;
    };
    footer?: {
      textColor?: string;
      text?: string;
      company?: string;
      companyLink?: string;
    };
  }

  export interface DisclaimerPopUpTheme {
    title?: string;
    description?: string;
    buttonText?: string;
    backgroundColor?: string;
    textColor?: string;
    buttonBackgroundColor?: string;
    buttonTextColor?: string;
  }

  export interface FormTheme {
    title?: string;
    description?: string;
    buttonText?: string;
    backgroundColor?: string;
    textColor?: string;
    buttonBackgroundColor?: string;
    buttonTextColor?: string;
  }

  export interface ToolTipTheme {
    showTooltip?: boolean;
    tooltipMessage?: string;
    tooltipBackgroundColor?: string;
    tooltipTextColor?: string;
    tooltipFontSize?: number;
  }
}