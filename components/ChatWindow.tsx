
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Chat, Message, Attachment, CallLog } from '../types';
import { ICONS } from '../constants';
import MessageBubble from './MessageBubble';
import QrScanner from './QrScanner';
import StickerPicker from './StickerPicker';
import EmojiPicker from './EmojiPicker';

interface ChatWindowProps {
  chat: Chat | null;
  messages: Message[];
  onSendMessage: (text: string, attachment?: Attachment, replyTo?: Message) => void;
  onBack: () => void;
  onUpdateChat: (id: string, updates: Partial<Chat>) => void;
  onClearHistory?: (id: string) => void;
  onBlockChat?: (id: string) => void;
  onPinChat?: (id: string) => void;
  onDeleteChat?: (id: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  replyingTo?: Message | null;
  onCancelReply?: () => void;
  onReply?: (message: Message) => void;
  onAddChat?: (chat: Chat) => void;
  onAddCallLog?: (log: Omit<CallLog, 'id' | 'timestamp'>) => void;
  onStartCall: (chat: Chat, type: 'audio' | 'video') => void;
  onMarkAsUnread?: (chatId: string) => void;
}

const PRESET_WALLPAPERS = [
  { name: 'Padrão', value: '' },
  { name: 'Pop Dark', value: 'linear-gradient(135deg, #1a0505 0%, #09090b 100%)' },
  { name: 'Noite Zinc', value: '#09090b' },
  { name: 'Vinho Deep', value: '#450a0a' },
  { name: 'Oceano Profundo', value: '#082f49' },
  { name: 'Aurora Borealis', value: 'linear-gradient(135deg, #09090b 0%, #1e1b4b 100%)' },
];

type MediaTab = 'all' | 'images' | 'videos' | 'files' | 'audios';

export const TypingDots: React.FC<{ color?: string; size?: 'sm' | 'md'; variant?: 'wave' | 'pulse' }> = ({ 
  color = '', 
  size = 'md', 
  variant = 'wave'
}) => {
  const dotSizes = { sm: 'w-1 h-1', md: 'w-1.5 h-1.5' };
  const animationClass = variant === 'wave' ? 'dot-wave' : 'dot-pulse';
  return (
    <div className={`flex items-center space-x-1 h-4 ${color || 'text-[var(--p)]'}`}>
      {[0, 1, 2].map((i) => (
        <div key={i} className={`typing-dot ${dotSizes[size]} rounded-full bg-current`}></div>
      ))}
    </div>
  );
};

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  chat, messages, onSendMessage, onBack, onUpdateChat, onClearHistory, onBlockChat, onPinChat, onDeleteChat, onReact, replyingTo, onCancelReply, onReply, onAddChat, onAddCallLog, onStartCall, onMarkAsUnread
}) => {
  const [inputText, setInputText] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showWallpaperModal, setShowWallpaperModal] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [activeMediaTab, setActiveMediaTab] = useState<MediaTab | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [tempName, setTempName] = useState('');
  const [tempPersonality, setTempPersonality] = useState('');
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showOptionsMenu) setShowOptionsMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showOptionsMenu]);

  useEffect(() => {
    if (!chat || !inputText.trim() || chat.isBlocked) return;
    if (chat.status !== 'typing...') onUpdateChat(chat.id, { status: 'typing...' });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onUpdateChat(chat.id, { status: 'online' });
      typingTimeoutRef.current = null;
    }, 2000);
  }, [inputText, chat?.id]);

  useEffect(() => {
    if (!activeMediaTab && !showSearch) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showSearch, activeMediaTab]);

  useEffect(() => {
    if (chat) { setTempName(chat.name); setTempPersonality(chat.personality); }
  }, [chat, showSettings]);

  const filteredMessages = useMemo(() => {
    let result = messages;
    if (activeMediaTab) {
      result = result.filter(msg => {
        if (!msg.attachment) return false;
        switch (activeMediaTab) {
          case 'images': return msg.attachment.type === 'image' || msg.attachment.type === 'sticker';
          case 'videos': return msg.attachment.type === 'video';
          case 'files': return msg.attachment.type === 'file';
          case 'audios': return msg.attachment.type === 'audio';
          default: return true;
        }
      });
    }
    if (showSearch) result = result.filter(msg => msg.text.toLowerCase().includes(searchQuery.toLowerCase()));
    return result;
  }, [messages, searchQuery, showSearch, activeMediaTab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chat?.isBlocked) return;
    if (inputText.trim() || selectedAttachment) {
      onSendMessage(inputText, selectedAttachment || undefined, replyingTo || undefined);
      setInputText(''); setSelectedAttachment(null);
    }
  };

  const startCall = (type: 'audio' | 'video') => {
    if (chat && !chat.isBlocked) {
      onStartCall(chat, type);
    }
  };

  const startRecording = async () => {
    if (chat?.isBlocked) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => onSendMessage('', { type: 'audio', name: `Audio_${Date.now()}.webm`, url: reader.result as string, mimeType: 'audio/webm', size: blob.size });
        reader.readAsDataURL(blob);
      };
      recorder.start(); setIsRecording(true); setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch (err) { alert("Microfone negado"); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    }
  };

  if (isScanning) return <QrScanner onScan={() => {}} onClose={() => setIsScanning(false)} />;

  if (!chat) return (
    <div className="hidden md:flex flex-1 items-center justify-center text-zinc-600 p-8 text-center flex-col aurora-bg" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="animate-float">
        <ICONS.Logo size={120} className="mb-6 opacity-40 shadow-2xl rounded-[35px]" />
      </div>
      <h2 className="text-2xl font-black text-white uppercase tracking-[0.4em] mb-2">PopChat Desktop</h2>
      <p className="max-w-xs text-zinc-500 text-sm font-bold uppercase tracking-widest leading-relaxed">Conectando você de forma segura e anônima.</p>
      <div className="mt-12 flex items-center space-x-2 text-[10px] text-zinc-700 font-black uppercase tracking-widest">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500/50"></div>
          <span>Encriptação End-to-End Ativa</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full flex-1 relative overflow-hidden animate-scale-in" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[110] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] w-full max-w-lg shadow-3xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Dados do Contato</h3>
                <button onClick={() => setShowSettings(false)} className="text-zinc-500 hover:text-white p-2 transition-colors">
                   <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <div className="flex flex-col items-center mb-8">
                 <img src={chat.avatar} className="w-24 h-24 rounded-full border-4 border-zinc-800 shadow-2xl mb-4" />
                 <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">{chat.username}</p>
              </div>

              <div className="space-y-5">
                <div>
                   <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1 mb-2 block">Nome Exibido</label>
                   <input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} className="w-full bg-black/20 border border-zinc-800 rounded-2xl px-5 py-4 text-zinc-100 outline-none focus:border-[var(--p)] transition-all font-bold" />
                </div>
                <div>
                   <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1 mb-2 block">Instrução de Personalidade (AI)</label>
                   <textarea rows={3} value={tempPersonality} onChange={(e) => setTempPersonality(e.target.value)} className="w-full bg-black/20 border border-zinc-800 rounded-2xl px-5 py-4 text-zinc-100 outline-none focus:border-[var(--p)] transition-all resize-none text-sm leading-relaxed" />
                </div>
              </div>
              
              <button onClick={() => { onUpdateChat(chat.id, { name: tempName, personality: tempPersonality }); setShowSettings(false); }} className="w-full py-4 mt-8 text-white rounded-[1.5rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-red-900/40 transition-all hover:scale-[1.02] active:scale-95" style={{ backgroundColor: 'var(--p)' }}>Salvar Alterações</button>
            </div>
          </div>
        </div>
      )}

      {/* Shared Media View */}
      {activeMediaTab && (
        <div className="absolute inset-0 z-[120] bg-zinc-950 flex flex-col animate-in slide-in-from-right duration-300">
           <div className="p-4 md:p-6 glass border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                  <button onClick={() => setActiveMediaTab(null)} className="p-2 text-zinc-500 hover:text-white"><ICONS.Back /></button>
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">Mídia e Arquivos</h3>
              </div>
              <div className="flex space-x-1">
                 {['all', 'images', 'files'].map((tab) => (
                   <button key={tab} onClick={() => setActiveMediaTab(tab as any)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeMediaTab === tab ? 'bg-[var(--p)] text-white' : 'text-zinc-500 hover:bg-white/5'}`}>{tab}</button>
                 ))}
              </div>
           </div>
           <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                 {messages.filter(m => m.attachment).map(msg => (
                   <div key={msg.id} className="aspect-square bg-white/5 rounded-2xl overflow-hidden border border-white/5 group relative">
                      {msg.attachment?.type === 'image' || msg.attachment?.type === 'sticker' ? (
                        <img src={msg.attachment.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4">
                           <ICONS.Attach className="w-8 h-8 text-zinc-700 mb-2" />
                           <span className="text-[8px] font-black text-zinc-600 uppercase text-center truncate w-full">{msg.attachment?.name}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <button onClick={() => window.open(msg.attachment?.url, '_blank')} className="p-2 bg-white/10 rounded-full text-white"><ICONS.Search /></button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* Header */}
      <div className="p-4 bg-black/40 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between z-[100]">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="md:hidden text-zinc-500 p-1 hover:text-white transition-colors"><ICONS.Back /></button>
          <div className="relative cursor-pointer group" onClick={() => setShowSettings(true)}>
            <img src={chat.avatar} alt={chat.name} className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white/5 group-hover:border-[var(--p)] transition-all shadow-xl" />
            {chat.status === 'online' && <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-[3px] border-zinc-950 rounded-full animate-pulse shadow-sm shadow-green-900"></div>}
          </div>
          <div className="cursor-pointer" onClick={() => setShowSettings(true)}>
            <h2 className="font-black text-zinc-100 leading-tight flex items-center tracking-tight text-lg">
              {chat.name}
              {chat.isVerifiedSecure && <ICONS.Shield className="w-3.5 h-3.5 text-green-500 ml-1.5" />}
            </h2>
            <div className="flex items-center space-x-2">
                <p className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${chat.status === 'typing...' ? 'text-[var(--p)]' : 'text-zinc-600'}`}>
                    {chat.status === 'typing...' ? 'digitando...' : chat.status}
                </p>
                {chat.status === 'typing...' && <TypingDots size="sm" variant="pulse" />}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button onClick={() => startCall('audio')} className="p-2.5 text-zinc-500 hover:text-[var(--p)] hover:bg-white/5 rounded-2xl transition-all active:scale-90"><ICONS.Phone /></button>
          <button onClick={() => startCall('video')} className="p-2.5 text-zinc-500 hover:text-[var(--p)] hover:bg-white/5 rounded-2xl transition-all active:scale-90"><ICONS.Video /></button>
          <button onClick={() => setShowSearch(!showSearch)} className={`p-2.5 rounded-2xl transition-all ${showSearch ? 'text-[var(--p)] bg-white/5' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}><ICONS.Search /></button>
          <button onClick={(e) => { e.stopPropagation(); setShowOptionsMenu(!showOptionsMenu); }} className={`p-2.5 rounded-2xl transition-all ${showOptionsMenu ? 'text-[var(--p)] bg-white/5' : 'text-zinc-500 hover:text-[var(--p)] hover:bg-white/5'}`}>
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v.01M12 12v.01M12 19v.01" /></svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-1 custom-scrollbar" style={chat.wallpaper ? { background: chat.wallpaper, backgroundSize: 'cover', backgroundAttachment: 'fixed' } : {}}>
        <div className="flex justify-center mb-8">
            <div className="glass rounded-2xl px-6 py-3 text-center max-w-xs">
                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-relaxed">
                   Conversa protegida com criptografia quântica ponta-a-ponta
                </p>
            </div>
        </div>
        
        {filteredMessages.map((msg, index) => {
          const prevMsg = filteredMessages[index - 1];
          const isFirstInSequence = !prevMsg || prevMsg.sender !== msg.sender;
          return (
            <MessageBubble 
              key={msg.id} 
              message={msg} 
              onReact={onReact} 
              onReply={onReply} 
              onMarkAsUnread={onMarkAsUnread}
              showName={isFirstInSequence}
              senderName={msg.sender === 'me' ? 'Você' : chat.name}
              searchQuery={searchQuery}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Section - Improved Glassmorphism */}
      <div className="p-4 md:p-6 bg-black/60 backdrop-blur-3xl border-t border-white/5 relative">
        {replyingTo && (
          <div className="max-w-4xl mx-auto mb-3 glass rounded-2xl p-4 flex items-center justify-between border-l-4 border-l-[var(--p)] animate-slide-up">
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-[var(--p)] mb-0.5">Respondendo a {replyingTo.sender === 'me' ? 'você' : chat.name}</span>
              <p className="text-xs text-zinc-300 truncate max-w-lg">{replyingTo.text || '[Anexo]'}</p>
            </div>
            <button onClick={onCancelReply} className="text-zinc-500 hover:text-white p-2 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}
        <div className="max-w-4xl mx-auto flex items-end space-x-3">
          {!isRecording ? (
            <>
              <button type="button" onClick={() => setShowAttachmentMenu(!showAttachmentMenu)} className={`p-3.5 transition-all active:scale-90 ${showAttachmentMenu ? 'text-[var(--p)]' : 'text-zinc-500 hover:text-[var(--p)]'}`}><ICONS.Attach /></button>
              <div className="flex-1 glass rounded-[1.8rem] px-5 py-3 flex items-end group focus-within:border-[var(--p)] transition-all shadow-xl">
                <textarea 
                  value={inputText} 
                  onChange={(e) => setInputText(e.target.value)} 
                  placeholder="Envie sua mensagem..." 
                  className="w-full bg-transparent border-none focus:ring-0 outline-none resize-none py-1 text-[16px] max-h-40 text-zinc-100 placeholder-zinc-600 font-medium" 
                  onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e as any); } }}
                />
              </div>
              {inputText.trim() ? (
                <button onClick={handleSubmit as any} className="p-4 rounded-full text-white shadow-2xl active:scale-90 transition-all bubble-me"><ICONS.Send /></button>
              ) : (
                <button type="button" onClick={startRecording} className="p-4 rounded-full bg-white/5 text-zinc-500 hover:text-[var(--p)] hover:bg-white/10 transition-all active:scale-90"><ICONS.Mic /></button>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center glass border rounded-[2rem] px-6 py-4 space-x-6 animate-in zoom-in-95 duration-200" style={{ borderColor: 'var(--p)' }}>
              <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                  <span className="font-black font-mono text-sm text-white">{Math.floor(recordingTime/60)}:{(recordingTime%60).toString().padStart(2,'0')}</span>
              </div>
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden relative"><div className="absolute inset-y-0 left-0 bg-[var(--p)] animate-pulse shadow-[0_0_15px_var(--p)]" style={{width:'100%'}}></div></div>
              <button onClick={() => { setIsRecording(false); if(recordingIntervalRef.current) clearInterval(recordingIntervalRef.current); }} className="text-zinc-600 p-2 hover:text-red-500 transition-colors"><ICONS.Trash /></button>
              <button onClick={stopRecording} className="text-white px-6 py-2 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl transition-all active:scale-95" style={{ backgroundColor: 'var(--p)' }}>Enviar</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MenuOption = ({ icon, label, onClick, danger }: { icon: React.ReactNode, label: string, onClick: () => void, danger?: boolean }) => (
  <button 
    onClick={onClick} 
    className={`w-full px-5 py-4 text-left text-sm font-bold flex items-center space-x-4 transition-all ${danger ? 'text-red-500 hover:bg-red-500/10' : 'text-zinc-300 hover:bg-white/5 hover:text-white'}`}
  >
    <div className={`w-5 h-5 flex items-center justify-center ${danger ? 'text-red-500' : 'text-zinc-500'}`}>
      {icon}
    </div>
    <span className="tracking-tight">{label}</span>
  </button>
);

export default ChatWindow;
