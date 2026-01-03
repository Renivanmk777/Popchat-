
import React, { useState, useRef, useEffect } from 'react';
import { Message, Reaction } from '../types';
import { ICONS } from '../constants';

interface MessageBubbleProps {
  message: Message;
  searchQuery?: string;
  onReact?: (messageId: string, emoji: string) => void;
  onReply?: (message: Message) => void;
  onMarkAsUnread?: (chatId: string) => void;
  showName?: boolean;
  senderName?: string;
}

const REACTION_OPTIONS = ['👍', '❤️', '🔥', '😂', '😮', '😢', '👏', '🎉'];

const StatusIcon: React.FC<{ status: 'sent' | 'read' }> = ({ status }) => {
  if (status === 'read') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-4 ml-0.5 text-zinc-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="2 12 7 17 12 12" />
        <polyline points="12 17 17 12 22 17" />
        <path d="M7 17l10-10" />
        <path d="M17 12l5-5" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-0.5 text-zinc-100/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
};

const AudioPlayer: React.FC<{ url: string; isMe: boolean }> = ({ url, isMe }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center space-x-3 p-2 min-w-[200px] md:min-w-[240px]`}>
      <button 
        onClick={togglePlay}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all transform active:scale-90 ${
          isMe ? 'bg-white text-black' : 'text-white'
        }`}
        style={!isMe ? { backgroundColor: 'var(--p)' } : {}}
      >
        {isPlaying ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        ) : (
          <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        )}
      </button>
      
      <div className="flex-1 flex flex-col space-y-1">
        <div className={`h-1 w-full rounded-full relative bg-white/20`}>
          <div 
            className={`absolute top-0 left-0 h-full rounded-full ${isMe ? 'bg-white' : ''}`}
            style={{ width: `${progress}%`, ...(!isMe ? { backgroundColor: 'var(--p)' } : {}) }}
          />
        </div>
        <div className={`flex justify-between text-[10px] font-bold uppercase tracking-wider ${isMe ? 'text-white/70' : 'text-zinc-500'}`}>
          <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      
      <audio 
        ref={audioRef} 
        src={url} 
        onTimeUpdate={handleTimeUpdate} 
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
    </div>
  );
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, searchQuery, onReact, onReply, onMarkAsUnread, showName, senderName }) => {
  const isMe = message.sender === 'me';
  const { attachment } = message;
  const isSticker = attachment?.type === 'sticker';
  const [showOptions, setShowOptions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hoveredReaction, setHoveredReaction] = useState<Reaction | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      setShowOptions(true);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowOptions(true);
  };

  const selectReaction = (emoji: string) => {
    if (onReact) onReact(message.id, emoji);
    setShowOptions(false);
  };

  const handleReply = () => {
    if (onReply) onReply(message);
    setShowOptions(false);
  };

  const handleMarkAsUnreadAction = () => {
    if (onMarkAsUnread) onMarkAsUnread(message.chatId);
    setShowOptions(false);
  };

  const handleCopyText = async () => {
    if (message.text) {
      try {
        await navigator.clipboard.writeText(message.text);
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
          setShowOptions(false);
        }, 1000);
      } catch (err) {
        console.error('Falha ao copiar:', err);
      }
    }
  };

  const highlightText = (text: string, query?: string) => {
    if (!query || !query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() 
            ? <mark key={i} className="bg-yellow-500/40 text-white rounded-sm px-0.5 no-underline">{part}</mark> 
            : part
        )}
      </>
    );
  };

  useEffect(() => {
    if (showOptions) {
      const handleGlobalClick = () => {
        if (!copied) setShowOptions(false);
      };
      window.addEventListener('click', handleGlobalClick);
      return () => window.removeEventListener('click', handleGlobalClick);
    }
  }, [showOptions, copied]);
  
  return (
    <div className={`flex w-full ${showName ? 'mt-4' : 'mt-0.5'} mb-1 relative animate-message-entry ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[70%]`}>
        {showName && senderName && (
          <span 
            className={`text-[11px] font-black uppercase tracking-widest mb-1 px-1 opacity-90 ${isMe ? 'text-zinc-500' : 'text-[var(--p)]'}`}
          >
            {senderName}
          </span>
        )}
        
        <div
          onMouseDown={handleTouchStart}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onContextMenu={handleContextMenu}
          className={`rounded-2xl relative transition-all w-full ${
            isSticker 
              ? 'bg-transparent shadow-none' 
              : `shadow-md ${isMe ? 'text-zinc-50 rounded-tr-none' : 'bg-zinc-800 text-zinc-100 rounded-tl-none border border-zinc-700'}`
          }`}
          style={isMe && !isSticker ? { backgroundColor: 'var(--p)' } : {}}
        >
          {showOptions && (
            <div 
              className={`absolute z-20 bottom-full mb-2 bg-zinc-800 border border-zinc-700 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150 ${isMe ? 'right-0' : 'left-0'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col min-w-[160px]">
                <div className="p-3 flex space-x-2 border-b border-zinc-700/50 flex-wrap justify-center max-w-[240px]">
                  {REACTION_OPTIONS.map(emoji => (
                    <button 
                      key={emoji} 
                      onClick={() => selectReaction(emoji)}
                      className="hover:scale-150 transition-transform text-lg px-1 duration-200"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                
                <button 
                  onClick={handleReply}
                  className="w-full px-4 py-3 text-left text-sm font-bold text-zinc-100 hover:bg-zinc-700 flex items-center space-x-3 transition-colors"
                >
                  <svg className="w-5 h-5 text-[var(--p)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  <span>Responder</span>
                </button>

                <button 
                  onClick={handleMarkAsUnreadAction}
                  className="w-full px-4 py-3 text-left text-sm font-bold text-zinc-100 hover:bg-zinc-700 flex items-center space-x-3 transition-colors"
                >
                  <svg className="w-5 h-5 text-[var(--p)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    <circle cx="18" cy="6" r="3" fill="currentColor" />
                  </svg>
                  <span>Marcar como não lida</span>
                </button>

                {message.text && (
                  <button 
                    onClick={handleCopyText}
                    className={`w-full px-4 py-3 text-left text-sm font-bold flex items-center space-x-3 transition-colors ${copied ? 'text-green-500 bg-green-500/10' : 'text-zinc-100 hover:bg-zinc-700'}`}
                  >
                    {copied ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 text-[var(--p)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        <span>Copiar Texto</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {!isSticker && message.replyTo && (
            <div className={`mx-2 mt-2 p-2 rounded-lg border-l-4 overflow-hidden text-xs ${
              isMe ? 'bg-black/20 border-white/40' : 'bg-black/40 border-[var(--p)]'
            }`}>
              <p className={`font-bold uppercase tracking-widest mb-0.5 ${isMe ? 'text-white' : ''}`} style={!isMe ? { color: 'var(--p)' } : {}}>
                {message.replyTo.sender === 'me' ? 'Você' : 'Assistente'}
              </p>
              <p className={`truncate opacity-80 ${isMe ? 'text-zinc-100' : 'text-zinc-400'}`}>
                {message.replyTo.text || '[Arquivo]'}
              </p>
            </div>
          )}

          {attachment && (
            <div className={`${message.text ? 'mb-1' : ''}`}>
              {attachment.type === 'image' ? (
                <div className="relative group">
                  <img src={attachment.url} alt={attachment.name} className="w-full h-auto max-h-80 object-cover cursor-zoom-in" onClick={() => window.open(attachment.url, '_blank')} />
                </div>
              ) : attachment.type === 'sticker' ? (
                <div className="relative group">
                  <img src={attachment.url} alt="Sticker" className="w-32 h-32 md:w-48 md:h-48 object-contain" />
                </div>
              ) : attachment.type === 'audio' ? (
                <AudioPlayer url={attachment.url} isMe={isMe} />
              ) : (
                <div className={`flex items-center space-x-3 p-3 border-b ${isMe ? 'bg-black/10 border-white/10' : 'bg-black/10 border-zinc-700'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isMe ? 'bg-white/10' : 'bg-zinc-800'}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  </div>
                  <div className="flex-1 min-w-0"><p className="text-xs font-bold truncate">{highlightText(attachment.name, searchQuery)}</p></div>
                  <a href={attachment.url} download={attachment.name} className={`p-2 rounded-lg transition-all ${isMe ? 'hover:bg-white/10' : 'hover:bg-zinc-700'}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </a>
                </div>
              )}
            </div>
          )}

          {!isSticker && (
            <div className="px-4 py-2.5 relative">
              {message.text && <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap font-medium">{highlightText(message.text, searchQuery)}</p>}
              <div className={`text-[9px] mt-1.5 font-bold flex items-center justify-end space-x-1.5 uppercase tracking-tighter ${isMe ? 'text-white/60' : 'text-zinc-500'}`}>
                <ICONS.Lock className="w-2.5 h-2.5 opacity-60" />
                <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {isMe && message.status && <StatusIcon status={message.status} />}
              </div>
            </div>
          )}

          {isSticker && (
            <div className={`text-[9px] mt-1 font-bold flex items-center justify-end space-x-1.5 uppercase tracking-tighter text-zinc-500`}>
              <ICONS.Lock className="w-2.5 h-2.5 opacity-60" />
              <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              {isMe && message.status && <StatusIcon status={message.status} />}
            </div>
          )}
          
          {!isSticker && <div className={`absolute top-0 w-2 h-2 ${isMe ? 'right-[-2px]' : 'left-[-2px] bg-zinc-800'}`} style={isMe ? { backgroundColor: 'var(--p)', clipPath: 'polygon(0 0, 0% 100%, 100% 0)' } : { clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>}
          
          {message.reactions && message.reactions.length > 0 && (
            <div className={`absolute bottom-[-14px] flex flex-wrap gap-1 ${isMe ? 'right-0' : 'left-0'}`}>
              {message.reactions.map((reaction, idx) => (
                <button 
                  key={idx} 
                  onClick={() => selectReaction(reaction.emoji)}
                  onMouseEnter={() => setHoveredReaction(reaction)}
                  onMouseLeave={() => setHoveredReaction(null)}
                  className={`flex items-center space-x-1 px-1.5 py-0.5 rounded-full text-[10px] font-black border transition-all active:scale-90 ${
                    reaction.me 
                      ? 'bg-white/20 border-white/50 text-white shadow-[0_0_10px_rgba(255,255,255,0.2)]' 
                      : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                  }`}
                >
                  <span>{reaction.emoji}</span>
                  {reaction.count > 1 && <span>{reaction.count}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
