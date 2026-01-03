
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { AppState, Message, Chat, Attachment, ThemeConfig, UserSettings, UserProfile, CallLog } from './types';
import { INITIAL_CHATS, ICONS, LOCAL_STORAGE_KEY } from './constants';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import CallOverlay from './components/CallOverlay';
import PinLockScreen from './components/PinLockScreen';
import AuthScreen from './components/AuthScreen';
import { getChatResponse } from './services/geminiService';

const DEFAULT_THEME: ThemeConfig = {
  primary: '#dc2626', 
  background: '#09090b',
  isNightMode: true,
};

const DEFAULT_SETTINGS: UserSettings = {
  autoDeleteMessages: 'off',
  sensitiveContent: false,
  appLockEnabled: false,
  readReceipts: true,
  activeSessionsCount: 1,
  dataUsageLow: false,
  stealthName: 'PopChat',
  stealthIcon: 'default',
  stealthCalculatorMode: false,
  stealthBlurOnFocusLoss: true,
  stealthHideSenderOnTitle: true,
  autoLockTimer: '5m'
};

const INITIAL_PROFILE: UserProfile = {
  name: '',
  username: '',
  bio: 'Usando o PopChat!',
  avatar: `https://picsum.photos/seed/user_${Math.random()}/200`,
  isRegistered: false,
  isPremium: true
};

const SAVED_MESSAGES_CHAT: Chat = {
  id: 'saved_messages',
  name: 'Mensagens Salvas',
  username: '@me',
  avatar: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23dc2626"%3E%3Cpath d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/%3E%3C/svg%3E',
  status: 'online',
  personality: 'Conversa privada consigo mesmo para salvar notas e arquivos.',
  lastMessage: 'Suas mensagens salvas aqui.',
  isPinned: true,
  isVerifiedSecure: true
};

const STEALTH_ICONS: Record<string, string> = {
  default: "data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100' height='100' rx='30' fill='%23dc2626'/%3E%3Cpath d='M38 28H58C65 28 70 33 70 40C70 47 65 52 58 52H48V72H38V28ZM48 44H58C60 44 62 42 62 40C62 38 60 36 58 36H48V44Z' fill='white'/%3E%3C/svg%3E",
  calc: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='%2352525b'%3E%3Cpath d='M19 2H5a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3ZM7 7h2v2H7V7Zm0 4h2v2H7v-2Zm0 4h2v2H7v-2Zm10 2h-6v-2h6v2Zm0-4h-2v-2h2v2Zm0-4h-2V7h2v2Z'/%3E%3C/svg%3E",
  notes: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='%2371717a'%3E%3Cpath d='M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm-2 14H7v-2h10v2Zm0-4H7v-2h10v2Zm0-4H7V7h10v2Z'/%3E%3C/svg%3E",
  weather: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='%2338bdf8'%3E%3Cpath d='M17.5 19a5.5 5.5 0 0 1-5.5-5.5c0-.42.04-.84.13-1.25A4.5 4.5 0 1 1 15 5.5c0 .35-.04.7-.12 1.04A5.5 5.5 0 1 1 17.5 19Z'/%3E%3C/svg%3E",
  wiki: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='%234ade80'%3E%3Cpath d='M12 2L1 7l11 5 11-5-11-5zM2 17l10 5 10-5M2 12l10 5 10-5'/%3E%3C/svg%3E",
  finance: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='%23fbbf24'%3E%3Cpath d='M3 3v18h18V3H3zm15 14h-2v-4h2v4zm-4 0h-2V7h2v10zm-4 0H8v-7h2v7z'/%3E%3C/svg%3E"
};

const App: React.FC = () => {
  const [isAppReady, setIsAppReady] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLocked, setIsLocked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isWindowFocused, setIsWindowFocused] = useState(true);
  const [activeCall, setActiveCall] = useState<{ chat: Chat, type: 'audio' | 'video', direction: 'incoming' | 'outgoing' } | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const escCountRef = useRef<number>(0);
  const escTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const currentChats: Chat[] = parsed.chats || INITIAL_CHATS;
        if (!currentChats.find(c => c.id === 'saved_messages')) {
          currentChats.unshift(SAVED_MESSAGES_CHAT);
        }
        return {
          activeChatId: null,
          chats: currentChats,
          messages: parsed.messages || [],
          callLogs: parsed.callLogs || [],
          theme: { ...DEFAULT_THEME, ...parsed.theme },
          settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
          userProfile: { ...INITIAL_PROFILE, ...parsed.userProfile },
        };
      } catch (e) {
        console.error("Failed to restore app state", e);
      }
    }
    return {
      activeChatId: null,
      chats: [SAVED_MESSAGES_CHAT, ...INITIAL_CHATS],
      messages: [],
      callLogs: [],
      theme: DEFAULT_THEME,
      settings: DEFAULT_SETTINGS,
      userProfile: INITIAL_PROFILE,
    };
  });

  const [isMobileListVisible, setIsMobileListVisible] = useState(true);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        escCountRef.current += 1;
        if (escTimerRef.current) clearTimeout(escTimerRef.current);
        
        if (escCountRef.current >= 2) {
          setIsLocked(true);
          escCountRef.current = 0;
          document.title = "Google Research"; 
        } else {
          escTimerRef.current = setTimeout(() => { escCountRef.current = 0; }, 400);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleBlur = () => { 
      setIsWindowFocused(false); 
      if (state.settings.autoLockTimer === '0') {
        setIsLocked(true);
      }
      lastActivityRef.current = Date.now(); 
    };
    const handleFocus = () => { setIsWindowFocused(true); lastActivityRef.current = Date.now(); };
    const updateActivity = () => { lastActivityRef.current = Date.now(); };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('mousedown', updateActivity);
    window.addEventListener('keydown', updateActivity);

    const checkInactivity = setInterval(() => {
      const timeoutStr = state.settings.autoLockTimer;
      if (timeoutStr === 'off' || isLocked) return;

      let timeoutMs = 0;
      if (timeoutStr === '30s') timeoutMs = 30000;
      else if (timeoutStr === '1m') timeoutMs = 60000;
      else if (timeoutStr === '5m') timeoutMs = 300000;
      else if (timeoutStr === '1h') timeoutMs = 3600000;
      else if (timeoutStr === '0') timeoutMs = 0;

      if (timeoutMs > 0 && (Date.now() - lastActivityRef.current > timeoutMs)) {
        setIsLocked(true);
      }
    }, 1000);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('mousedown', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      clearInterval(checkInactivity);
    };
  }, [state.settings.autoLockTimer, isLocked]);

  useEffect(() => {
    const unreadTotal = state.chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
    const stealthName = state.settings.stealthName || 'PopChat';
    const stealthIconKey = state.settings.stealthIcon || 'default';
    const hideSender = state.settings.stealthHideSenderOnTitle;
    
    let title = stealthName;
    if (unreadTotal > 0) {
      title = hideSender ? `(${unreadTotal}) Alerta de Sistema` : `(${unreadTotal}) ${stealthName}`;
    }
    document.title = title;
    
    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = STEALTH_ICONS[stealthIconKey] || STEALTH_ICONS.default;
  }, [state.settings, state.chats]);

  useEffect(() => {
    if (state.settings.appLockEnabled && state.settings.appPin) setIsLocked(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsAppReady(true), 1200); 
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const theme = state.theme || DEFAULT_THEME;
    const root = document.documentElement;
    const effectiveBg = theme.isNightMode ? (theme.background || '#09090b') : '#f4f4f5';
    
    root.style.setProperty('--p', theme.primary);
    root.style.setProperty('--bg', effectiveBg);
    root.style.setProperty('--p-soft', `${theme.primary}25`); 
    root.style.setProperty('--p-mid', `${theme.primary}60`);  
    
    if (!theme.isNightMode) root.classList.add('light-mode');
    else root.classList.remove('light-mode');
  }, [state.theme]);

  const activeChat = useMemo(() => state.chats.find(c => c.id === state.activeChatId) || null, [state.chats, state.activeChatId]);
  const filteredMessages = useMemo(() => state.messages.filter(m => m.chatId === state.activeChatId), [state.messages, state.activeChatId]);

  const handleSelectChat = (id: string) => {
    setState(prev => ({ 
      ...prev, 
      activeChatId: id,
      chats: prev.chats.map(chat => chat.id === id ? { ...chat, unreadCount: 0 } : chat)
    }));
    setReplyingTo(null);
    if (window.innerWidth < 768) setIsMobileListVisible(false);
  };

  const handleUpdateTheme = (newTheme: Partial<ThemeConfig>) => setState(prev => ({ ...prev, theme: { ...prev.theme, ...newTheme } }));
  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => setState(prev => ({ ...prev, settings: { ...prev.settings, ...newSettings } }));
  const handleUpdateProfile = (newProfile: Partial<UserProfile>) => setState(prev => ({ ...prev, userProfile: { ...prev.userProfile, ...newProfile } }));

  const handleAuthComplete = (profile: UserProfile) => {
    setState(prev => ({
      ...prev,
      userProfile: { ...profile, isRegistered: true }
    }));
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    if (confirm("Isso apagará sua conta local permanentemente. Deseja continuar?")) {
      setState(prev => ({
        ...prev,
        userProfile: INITIAL_PROFILE,
        chats: [SAVED_MESSAGES_CHAT, ...INITIAL_CHATS],
        messages: [],
        callLogs: []
      }));
      setIsAuthenticated(false);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      window.location.reload();
    }
  };

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      alert("Seu navegador não suporta instalação direta ou o app já está instalado. Procure por 'Adicionar à tela de início' no menu do seu navegador.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleSendMessage = useCallback(async (text: string, attachment?: Attachment, replyTo?: Message) => {
    if (!state.activeChatId) return;
    const currentChatId = state.activeChatId;
    const currentChat = state.chats.find(c => c.id === currentChatId);
    if (!currentChat || currentChat.isBlocked) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      chatId: currentChatId,
      text,
      sender: 'me',
      timestamp: Date.now(),
      attachment,
      status: 'sent',
      isEncrypted: true,
      replyTo: replyTo ? { id: replyTo.id, text: replyTo.text, sender: replyTo.sender } : undefined
    };

    setReplyingTo(null);
    setState(prev => {
      const updatedChats = prev.chats.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, lastMessage: text || '[Anexo]', lastMessageTime: Date.now(), unreadCount: 0 }
          : chat
      );
      return { ...prev, messages: [...prev.messages, newMessage], chats: updatedChats };
    });

    if (currentChatId === 'saved_messages' || !navigator.onLine) return;

    setTimeout(async () => {
      setState(prev => ({
        ...prev,
        chats: prev.chats.map(c => c.id === currentChatId ? { ...c, status: 'typing...' } : c),
        messages: prev.messages.map(m => m.id === newMessage.id ? { ...m, status: 'read' } : m)
      }));

      const chatHistory = state.messages.filter(m => m.chatId === currentChatId).map(m => ({ text: m.text, sender: m.sender }));
      const aiResponse = await getChatResponse(text, currentChat.personality, chatHistory);
      
      setTimeout(() => {
        const botMessage: Message = { id: (Date.now() + 1).toString(), chatId: currentChatId, text: aiResponse, sender: 'other', timestamp: Date.now(), isEncrypted: true };
        setState(prev => ({
          ...prev,
          chats: prev.chats.map(c => c.id === currentChatId ? { ...c, status: 'online', lastMessage: aiResponse, lastMessageTime: Date.now(), unreadCount: prev.activeChatId === currentChatId ? 0 : (c.unreadCount || 0) + 1 } : c),
          messages: [...prev.messages, botMessage]
        }));
      }, 1000);
    }, 500);
  }, [state.activeChatId, state.chats, state.messages]);

  const handleStartCall = (chat: Chat, type: 'audio' | 'video') => {
    setActiveCall({ chat, type, direction: 'outgoing' });
    const newLog: CallLog = {
      id: Date.now().toString(),
      chatId: chat.id,
      contactName: chat.name,
      contactAvatar: chat.avatar,
      type,
      direction: 'outgoing',
      timestamp: Date.now(),
      duration: 0
    };
    setState(prev => ({ ...prev, callLogs: [newLog, ...prev.callLogs] }));
  };

  if (!isAppReady) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center z-[200] aurora-bg">
        <div className="relative mb-8 animate-float shadow-[0_30px_60px_rgba(var(--p),0.4)] rounded-[40px]">
          <ICONS.Logo size={140} />
        </div>
        <div className="flex flex-col items-center">
            <h1 className="text-5xl font-black tracking-tighter text-white mb-2">PopChat</h1>
            <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--p)] animate-pulse"></div>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Iniciando ambiente seguro</p>
            </div>
        </div>
      </div>
    );
  }

  if (isLocked) {
    return (
      <PinLockScreen 
        correctPin={state.settings.appPin || ''} 
        onUnlock={() => setIsLocked(false)} 
        useCalculator={state.settings.stealthCalculatorMode}
      />
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen onComplete={handleAuthComplete} onLogout={handleLogout} existingProfile={state.userProfile.isRegistered ? state.userProfile : undefined} />;
  }

  return (
    <div className={`flex flex-col h-screen w-full overflow-hidden transition-all duration-700 ${!isWindowFocused && state.settings.stealthBlurOnFocusLoss ? 'blur-[60px] scale-[0.98] grayscale opacity-50' : 'animate-scale-in'}`} style={{ backgroundColor: 'var(--bg)' }}>
      {activeCall && (
        <CallOverlay 
          chat={activeCall.chat} 
          callType={activeCall.type} 
          direction={activeCall.direction}
          onEndCall={() => setActiveCall(null)} 
        />
      )}

      <div className="flex-1 flex w-full h-full max-w-[1700px] mx-auto overflow-hidden">
        <div className={`flex w-full h-full ${isMobileListVisible ? 'flex' : 'hidden md:flex'}`}>
          <ChatList 
            chats={state.chats} 
            activeId={state.activeChatId} 
            onSelectChat={handleSelectChat} 
            onAddChat={(chat) => setState(prev => ({ ...prev, chats: [chat, ...prev.chats], activeChatId: chat.id }))}
            theme={state.theme}
            onUpdateTheme={handleUpdateTheme}
            settings={state.settings}
            onUpdateSettings={handleUpdateSettings}
            userProfile={state.userProfile}
            onUpdateProfile={handleUpdateProfile}
            callLogs={state.callLogs}
            messages={state.messages}
            onInstallApp={handleInstallApp}
          />
        </div>
        <div className={`flex-1 h-full ${!isMobileListVisible ? 'flex' : 'hidden md:flex'}`}>
          <ChatWindow 
            chat={activeChat} 
            messages={filteredMessages} 
            onSendMessage={handleSendMessage}
            onBack={() => setIsMobileListVisible(true)}
            onUpdateChat={(id, updates) => setState(prev => ({ ...prev, chats: prev.chats.map(c => c.id === id ? {...c, ...updates} : c)}))}
            onReply={setReplyingTo}
            replyingTo={replyingTo}
            onCancelReply={() => setReplyingTo(null)}
            onMarkAsUnread={(id) => setState(prev => ({ ...prev, chats: prev.chats.map(c => c.id === id ? {...c, unreadCount: (c.unreadCount || 0) + 1} : c) }))}
            onStartCall={handleStartCall}
            onDeleteChat={(id) => setState(prev => ({ ...prev, chats: prev.chats.filter(c => c.id !== id), activeChatId: null }))}
            onClearHistory={(id) => setState(prev => ({ ...prev, messages: prev.messages.filter(m => m.chatId !== id) }))}
            onBlockChat={(id) => setState(prev => ({ ...prev, chats: prev.chats.map(c => c.id === id ? {...c, isBlocked: !c.isBlocked} : c) }))}
            onPinChat={(id) => setState(prev => ({ ...prev, chats: prev.chats.map(c => c.id === id ? {...c, isPinned: !c.isPinned} : c) }))}
            onReact={(mid, emo) => setState(prev => ({
              ...prev,
              messages: prev.messages.map(m => m.id === mid ? {
                ...m,
                reactions: (m.reactions || []).some(r => r.emoji === emo)
                  ? m.reactions!.map(r => r.emoji === emo ? { ...r, count: r.count + 1, me: true } : r)
                  : [...(m.reactions || []), { emoji: emo, count: 1, me: true }]
              } : m)
            }))}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
