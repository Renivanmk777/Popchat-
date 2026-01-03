
import React from 'react';
import { Chat } from './types';

// Chave para persistência no LocalStorage
export const LOCAL_STORAGE_KEY = 'popchat_v1_state';

export const INITIAL_CHATS: Chat[] = [
  {
    id: '1',
    name: 'Assistente Pop',
    username: '@pop_assistant',
    avatar: 'https://picsum.photos/seed/pop/200',
    status: 'online',
    personality: 'Você é a Assistente Pop, amigável, prestativa e adora a interface do PopChat. Suas respostas são curtas e cordiais, estilo Telegram.',
    lastMessage: 'Olá! Como posso te ajudar hoje?',
    unreadCount: 0,
    isVerifiedSecure: true,
    safetyNumber: '48291 00231 99281 33421 00291 44521'
  },
  {
    id: '2',
    name: 'Suporte Técnico',
    username: '@support_tech',
    avatar: 'https://picsum.photos/seed/tech/200',
    status: 'online',
    personality: 'Você é o técnico de suporte do PopChat. Direto ao ponto, resolve problemas rapidamente e é um pouco nerd.',
    lastMessage: 'Já tentou reiniciar o aplicativo?',
    unreadCount: 0,
    isVerifiedSecure: true,
    safetyNumber: '11202 55432 99182 22341 88721 00921'
  },
  {
    id: '3',
    name: 'Canal de Notícias',
    username: '@news_channel',
    avatar: 'https://picsum.photos/seed/news/200',
    status: 'offline',
    personality: 'Você é um bot de notícias do PopChat. Reporta fatos de forma impessoal e informativa.',
    lastMessage: 'Novas atualizações disponíveis no PopChat!',
    unreadCount: 0,
    isVerifiedSecure: true,
    safetyNumber: '00921 44532 11281 33421 88291 55621'
  }
];

export const STICKER_PACKS = [
  {
    name: 'Pops',
    stickers: [
      'https://fonts.gstatic.com/s/e/notoemoji/latest/1f600/512.webp',
      'https://fonts.gstatic.com/s/e/notoemoji/latest/1f60d/512.webp',
      'https://fonts.gstatic.com/s/e/notoemoji/latest/1f525/512.webp',
      'https://fonts.gstatic.com/s/e/notoemoji/latest/1f602/512.webp',
      'https://fonts.gstatic.com/s/e/notoemoji/latest/1f44d/512.webp',
      'https://fonts.gstatic.com/s/e/notoemoji/latest/1f64c/512.webp',
      'https://fonts.gstatic.com/s/e/notoemoji/latest/1f62d/512.webp',
      'https://fonts.gstatic.com/s/e/notoemoji/latest/1f60e/512.webp',
      'https://fonts.gstatic.com/s/e/notoemoji/latest/1f929/512.webp',
      'https://fonts.gstatic.com/s/e/notoemoji/latest/1f914/512.webp',
      'https://fonts.gstatic.com/s/e/notoemoji/latest/1f631/512.webp',
      'https://fonts.gstatic.com/s/e/notoemoji/latest/1f480/512.webp',
    ]
  },
  {
    name: 'Animais',
    stickers: [
      'https://fonts.gstatic.com/s/e/notoemoji/latest/1f431/512.webp',
      'https://fonts.gstatic.com/s/e/notoemoji/latest/1f436/512.webp',
      'https://fonts.gstatic.com/s/e/notoemoji/latest/1f98a/512.webp',
      'https://fonts.gstatic.com/s/e/notoemoji/latest/1f984/512.webp',
      'https://fonts.gstatic.com/s/e/notoemoji/latest/1f43c/512.webp',
      'https://fonts.gstatic.com/s/e/notoemoji/latest/1f98b/512.webp',
    ]
  }
];

export const EMOJI_GROUPS = [
  { 
    name: 'Rostos', 
    icon: '😀',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕'] 
  },
  { 
    name: 'Mãos', 
    icon: '👋',
    emojis: ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪'] 
  },
  { 
    name: 'Amor', 
    icon: '❤️',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '✨', '⭐', '🌟', '💫', '🔥', '💥', '💢', '💨', '💦', '💤'] 
  },
  {
    name: 'Objetos',
    icon: '💡',
    emojis: ['💡', '🔦', '🕯️', '🗑️', '🛒', '🛍️', '🎁', '🎈', '🎉', '🎊', '🎀', '🪄', '🧧', '✉️', '📩', '📨', '📧', '📪', '📫', '📬', '📭', '📮', '📦', '📜', '📄', '📑', '📊', '📈', '📉', '🗒️', '🗓️', '📅', '🗑️', '📇', '🗃️', '📂', '📁', ' briefcase', '📁', '🗄️', ' clipboard', '📁']
  }
];

export const ICONS = {
  Logo: ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--p)" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <rect width="100" height="100" rx="30" fill="url(#logoGradient)" />
      <path 
        d="M25 35C25 29.4772 29.4772 25 35 25H65C70.5228 25 75 29.4772 75 35V55C75 60.5228 70.5228 65 65 65H45L30 75V65H35C29.4772 65 25 60.5228 25 55V35Z" 
        fill="white" 
        fillOpacity="0.15" 
      />
      <path 
        d="M38 28H58C65 28 70 33 70 40C70 47 65 52 58 52H48V72H38V28ZM48 44H58C60 44 62 42 62 40C62 38 60 36 58 36H48V44Z" 
        fill="white" 
        filter="url(#glow)"
      />
    </svg>
  ),
  Shield: ({ className = "" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Lock: ({ className = "" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  Send: ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  Attach: ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
  ),
  Emoji: ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Phone: ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  Video: ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  Sticker: ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 4.5L19.5 8" />
    </svg>
  ),
  Menu: ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Search: ({ className = "h-5 w-5" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Back: ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  QrCode: ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m0 11v1m5-16v1m0 11v1M4 12h1m11 0h1M4 5h1m11 0h1m-10 7v3m4-3v3M7 7h10M7 17h10" />
      <rect x="3" y="3" width="6" height="6" rx="1" strokeWidth="2" />
      <rect x="15" y="3" width="6" height="6" rx="1" strokeWidth="2" />
      <rect x="3" y="15" width="6" height="6" rx="1" strokeWidth="2" />
      <path d="M18 18h.01" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  Plus: ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Mic: ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  ),
  Trash: ({ className = "h-5 w-5" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Settings: ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Instagram: ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  ),
  Share: ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  ),
  Download: ({ className = "h-6 w-6" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
};
