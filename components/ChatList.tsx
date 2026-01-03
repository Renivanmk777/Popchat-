
import React, { useState } from 'react';
import { Chat, ThemeConfig, UserSettings, UserProfile, CallLog, Message } from '../types';
import { ICONS } from '../constants';
import { TypingDots } from './ChatWindow';
import AddContactModal from './AddContactModal';
import SidebarMenu from './SidebarMenu';

interface ChatListProps {
  chats: Chat[];
  activeId: string | null;
  onSelectChat: (id: string) => void;
  onAddChat: (chat: Chat) => void;
  theme: ThemeConfig;
  onUpdateTheme: (theme: Partial<ThemeConfig>) => void;
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  userProfile: UserProfile;
  onUpdateProfile: (profile: Partial<UserProfile>) => void;
  callLogs: CallLog[];
  messages: Message[];
  onInstallApp: () => void;
}

const ChatList: React.FC<ChatListProps> = ({ 
  chats, 
  activeId, 
  onSelectChat, 
  onAddChat, 
  theme, 
  onUpdateTheme,
  settings,
  onUpdateSettings,
  userProfile,
  onUpdateProfile,
  callLogs,
  messages,
  onInstallApp
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const sortedChats = [...chats].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return (b.lastMessageTime || 0) - (a.lastMessageTime || 0);
  });

  const filteredChats = sortedChats.filter(chat => 
    chat.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    (chat.lastMessage && chat.lastMessage.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full border-r border-zinc-800 w-full md:w-80 lg:w-96 flex-shrink-0 relative" style={{ backgroundColor: 'var(--bg)' }}>
      <SidebarMenu 
        isOpen={showSidebar} 
        onClose={() => setShowSidebar(false)} 
        theme={theme} 
        onUpdateTheme={onUpdateTheme} 
        settings={settings}
        onUpdateSettings={onUpdateSettings}
        profile={userProfile}
        onUpdateProfile={onUpdateProfile}
        callLogs={callLogs}
        messages={messages}
        chats={chats}
        onSelectChat={(id) => { onSelectChat(id); setShowSidebar(false); }}
        onAddContact={(chat) => { onAddChat(chat); setShowSidebar(false); }}
        onInstallApp={onInstallApp}
      />
      
      {showAddModal && (
        <AddContactModal 
          onClose={() => setShowAddModal(false)} 
          chats={chats}
          onAdd={(newChat) => {
            onAddChat(newChat);
            setShowAddModal(false);
          }}
        />
      )}

      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-zinc-800 bg-black/20">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowSidebar(true)}
            className="text-zinc-500 hover:text-[var(--p)] transition-colors p-1"
          >
            <ICONS.Menu />
          </button>
          <div className="flex items-center space-x-2">
            <ICONS.Logo size={28} />
            <h1 className="text-xl font-black tracking-tighter" style={{ color: 'var(--p)' }}>PopChat</h1>
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="text-white p-2 rounded-xl transition-all shadow-lg active:scale-95"
          style={{ backgroundColor: 'var(--p)' }}
          title="Novo Contato"
        >
          <ICONS.Plus />
        </button>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500 pointer-events-none">
            <ICONS.Search />
          </span>
          <input
            type="text"
            placeholder="Pesquisar..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full bg-white/5 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 transition-all outline-none text-sm text-zinc-100 placeholder-zinc-500 focus:border-[var(--p-mid)]"
          />
        </div>
      </div>

      {/* Chats */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredChats.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-zinc-600 text-sm">Nenhuma conversa encontrada.</p>
          </div>
        ) : (
          filteredChats.map((chat, index) => {
            const hasUnread = chat.unreadCount && chat.unreadCount > 0;
            const isActive = activeId === chat.id;

            return (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full flex items-center p-3 space-x-4 transition-all relative group border-b border-white/[0.02] animate-chat-entry ${
                  isActive 
                    ? 'bg-white/5' 
                    : hasUnread ? 'bg-[var(--p-soft)] hover:bg-[var(--p-mid)]' : 'hover:bg-white/5'
                }`}
                style={{ 
                  animationDelay: `${Math.min(index * 40, 400)}ms` 
                }}
              >
                {(isActive || chat.isPinned) && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full" style={{ backgroundColor: chat.isPinned ? 'var(--p)' : 'rgba(255,255,255,0.2)' }}></div>
                )}
                
                <div className="relative flex-shrink-0">
                  <div className={`rounded-full p-0.5 transition-transform duration-300 ${hasUnread ? 'scale-110' : ''}`} style={hasUnread ? { backgroundColor: 'var(--p-soft)' } : {}}>
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      className="w-14 h-14 rounded-full border border-zinc-800 shadow-lg object-cover"
                    />
                  </div>
                  {chat.status === 'online' && (
                    <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-zinc-950 rounded-full shadow-sm"></div>
                  )}
                </div>
                
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-baseline">
                    <div className="min-w-0 flex-1">
                      <h3 className={`truncate transition-colors flex items-center ${
                        hasUnread ? 'font-black text-white' : isActive ? 'font-bold text-zinc-100' : 'font-semibold text-zinc-300 group-hover:text-zinc-100'
                      }`}>
                        {chat.name}
                        {chat.isPinned && <svg className="w-2.5 h-2.5 ml-1.5 text-zinc-500 rotate-45" fill="currentColor" viewBox="0 0 24 24"><path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z"/></svg>}
                      </h3>
                      <p className={`text-[10px] font-mono tracking-tighter ${hasUnread ? 'text-[var(--p)]' : 'text-zinc-500'}`}>
                        {chat.username}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end flex-shrink-0 ml-2">
                      <span className={`text-[10px] uppercase font-bold tracking-tighter ${hasUnread ? '' : 'text-zinc-600'}`} style={hasUnread ? { color: 'var(--p)' } : {}}>
                        {chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '12:00'}
                      </span>
                      
                      {hasUnread && (
                        <div 
                          className="mt-1.5 text-white text-[10px] font-black min-w-[20px] h-[20px] rounded-full flex items-center justify-center px-1 shadow-lg animate-bounce-short ring-2 ring-white/10" 
                          style={{ 
                            backgroundColor: 'var(--p)',
                            boxShadow: '0 4px 12px var(--p-mid)'
                          }}
                        >
                          {chat.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-0.5 min-w-0">
                    {chat.status === 'typing...' ? (
                      <>
                        <TypingDots size="sm" />
                        <span className="text-sm italic font-black truncate animate-pulse" style={{ color: 'var(--p)' }}>digitando...</span>
                      </>
                    ) : (
                      <p className={`text-sm truncate leading-tight w-full ${
                        hasUnread ? 'text-zinc-100 font-bold' : 'text-zinc-500'
                      }`}>
                        {chat.lastMessage}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
      <style>{`
        @keyframes bounce-short {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        .animate-bounce-short {
          animation: bounce-short 2s infinite ease-in-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--p-soft);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default ChatList;
