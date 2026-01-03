
export interface Attachment {
  type: 'image' | 'file' | 'audio' | 'contact' | 'sticker' | 'video';
  name: string;
  url: string; 
  mimeType: string;
  size?: number;
  contactInfo?: {
    name: string;
    username: string;
    avatar: string;
  };
}

export interface Reaction {
  emoji: string;
  count: number;
  me: boolean;
  usernames?: string[]; 
}

export interface Message {
  id: string;
  chatId: string;
  text: string;
  sender: 'me' | 'other';
  timestamp: number;
  attachment?: Attachment;
  status?: 'sent' | 'read';
  reactions?: Reaction[];
  isEncrypted?: boolean;
  isSaved?: boolean;
  replyTo?: {
    id: string;
    text: string;
    sender: 'me' | 'other';
  };
}

export interface CallLog {
  id: string;
  chatId: string;
  contactName: string;
  contactAvatar: string;
  type: 'audio' | 'video';
  direction: 'incoming' | 'outgoing';
  timestamp: number;
  duration?: number;
}

export interface ThemeConfig {
  primary: string;
  background: string;
  isNightMode?: boolean;
}

export interface UserSettings {
  autoDeleteMessages: 'off' | '1h' | '1d' | '1w' | '1m';
  sensitiveContent: boolean;
  appLockEnabled: boolean;
  appPin?: string;
  autoLockTimer: 'off' | '0' | '30s' | '1m' | '5m' | '1h';
  stealthName?: string;
  stealthIcon?: string;
  stealthCalculatorMode?: boolean; 
  stealthBlurOnFocusLoss?: boolean; 
  stealthHideSenderOnTitle?: boolean; 
  readReceipts: boolean;
  activeSessionsCount: number;
  dataUsageLow: boolean;
}

export interface UserProfile {
  name: string;
  username: string;
  bio: string;
  avatar: string;
  password?: string;
  isRegistered?: boolean;
  isPremium?: boolean;
}

export interface Chat {
  id: string;
  name: string;
  username: string; 
  avatar: string;
  lastMessage?: string;
  lastMessageTime?: number;
  status: 'online' | 'offline' | 'typing...';
  personality: string;
  unreadCount?: number;
  isBlocked?: boolean;
  isPinned?: boolean;
  wallpaper?: string; 
  isVerifiedSecure?: boolean;
  safetyNumber?: string;
}

export interface AppState {
  activeChatId: string | null;
  chats: Chat[];
  messages: Message[];
  callLogs: CallLog[];
  theme: ThemeConfig;
  settings: UserSettings;
  userProfile: UserProfile;
}
