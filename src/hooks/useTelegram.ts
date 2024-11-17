interface TelegramWebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface TelegramWebApp {
  WebApp?: {
    // Payment methods
    openInvoice: (url: string, callback?: (status: string) => void) => void;

    // User info
    initData: string;
    initDataUnsafe: {
      user?: TelegramWebAppUser;
      start_param?: string;
    };

    // Platform info
    platform: string;
    colorScheme: 'light' | 'dark';

    // UI methods
    ready: () => void;
    expand: () => void;
    close: () => void;
    isExpanded: boolean;

    // Viewport info
    viewportHeight: number;
    viewportStableHeight: number;

    // Event handlers
    onEvent: (eventType: string, eventHandler: () => void) => void;
    offEvent: (eventType: string, eventHandler: () => void) => void;

    // Theme
    themeParams: {
      bg_color?: string;
      text_color?: string;
      hint_color?: string;
      link_color?: string;
      button_color?: string;
      button_text_color?: string;
    };
  };
}

declare global {
  interface Window {
    Telegram?: TelegramWebApp;
  }
}

export function useTelegram() {
  const telegram = window.Telegram;
  const webApp = telegram?.WebApp;
  const isTelegramWebApp = !!webApp;

  // Get current user if available
  const user = webApp?.initDataUnsafe?.user;

  // Check if we're running in Telegram
  const isInTelegram = isTelegramWebApp && !!webApp.initData;

  // Get platform info
  const platform = webApp?.platform || 'unknown';
  const colorScheme = webApp?.colorScheme || 'light';

  // Utility functions
  const expandWebApp = () => {
    webApp?.expand();
  };

  const closeWebApp = () => {
    webApp?.close();
  };

  const readyWebApp = () => {
    webApp?.ready();
  };

  // Payment function
  const openInvoice = async (
    url: string,
    callback?: (status: string) => void
  ) => {
    if (!webApp?.openInvoice) {
      throw new Error('Telegram WebApp payments are not available');
    }
    return webApp.openInvoice(url, callback);
  };

  return {
    telegram,
    webApp,
    isTelegramWebApp,
    isInTelegram,
    user,
    platform,
    colorScheme,
    themeParams: webApp?.themeParams,
    expandWebApp,
    closeWebApp,
    readyWebApp,
    openInvoice,
  };
}
