
import React, { useState } from 'react';
import { ThemeConfig, UserSettings, UserProfile, CallLog, Message, Chat } from '../types';
import { ICONS } from '../constants';
import NearbyPeopleModal from './NearbyPeopleModal';

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeConfig;
  onUpdateTheme: (theme: Partial<ThemeConfig>) => void;
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  profile: UserProfile;
  onUpdateProfile: (profile: Partial<UserProfile>) => void;
  callLogs: CallLog[];
  messages: Message[];
  chats: Chat[];
  onSelectChat: (id: string) => void;
  onAddContact: (chat: Chat) => void;
  onInstallApp: () => void;
}

const STEALTH_PRESETS = [
  { id: 'default', name: 'PopChat (Padrão)', title: 'PopChat', icon: '🔴' },
  { id: 'calc', name: 'Calculadora', title: 'Calculadora', icon: '🔢' },
  { id: 'notes', name: 'Notas', title: 'Minhas Notas', icon: '📝' },
  { id: 'weather', name: 'Clima', title: 'Previsão do Tempo', icon: '☁️' },
  { id: 'wiki', name: 'Educação', title: 'Pesquisa Acadêmica', icon: '🎓' },
  { id: 'finance', name: 'Finanças', title: 'Cotação Real-Time', icon: '📈' },
];

const THEME_PRESETS = [
  { color: '#dc2626', name: 'Pop Red' },
  { color: '#2563eb', name: 'Telegram Blue' },
  { color: '#16a34a', name: 'Matrix Green' },
  { color: '#9333ea', name: 'Royal Purple' },
  { color: '#ea580c', name: 'Sunset' },
  { color: '#52525b', name: 'Carbon' },
];

const SidebarMenu: React.FC<SidebarMenuProps> = ({ 
  isOpen, onClose, theme, onUpdateTheme, settings, onUpdateSettings, profile, onUpdateProfile, chats, onAddContact, callLogs, onSelectChat, onInstallApp
}) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showNearby, setShowNearby] = useState(false);
  const [showCallsHistory, setShowCallsHistory] = useState(false);
  const [tempPin, setTempPin] = useState('');
  const [shareFeedback, setShareFeedback] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: 'PopChat Secure Messenger',
      text: '🚀 Baixe o PopChat APK agora e converse com total privacidade! Local, seguro e sem login.',
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(`🚀 Baixe o PopChat APK: ${shareData.url}`);
        setShareFeedback(true);
        setTimeout(() => setShareFeedback(false), 2000);
      } catch (err) {
        alert('Link copiado: ' + shareData.url);
      }
    }
  };

  const SettingToggle = ({ label, desc, value, onChange }: { label: string, desc?: string, value: boolean, onChange: (v: boolean) => void }) => (
    <div className="w-full flex flex-col py-3 border-b border-white/5">
      <button onClick={() => onChange(!value)} className="w-full flex items-center justify-between group/toggle">
        <span className="text-sm text-zinc-200 group-hover/toggle:text-white transition-colors">{label}</span>
        <div className={`w-10 h-5 rounded-full relative transition-all duration-300 ${value ? 'bg-[var(--p)]' : 'bg-zinc-800'}`}>
          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${value ? 'right-1' : 'left-1'}`}></div>
        </div>
      </button>
      {desc && <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">{desc}</p>}
    </div>
  );

  return (
    <>
      <div className={`fixed inset-0 bg-black/80 backdrop-blur-md z-[100] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      
      {showNearby && <NearbyPeopleModal onClose={() => setShowNearby(false)} onAddContact={onAddContact} />}

      {/* Modal de Chamadas Recentes */}
      {showCallsHistory && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
              <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                 <h3 className="text-xl font-black text-white">Chamadas Recentes</h3>
                 <button onClick={() => setShowCallsHistory(false)} className="text-zinc-500 hover:text-white p-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                {callLogs.length === 0 ? (
                  <div className="p-12 text-center text-zinc-600 font-bold uppercase text-[10px] tracking-widest">Nenhuma chamada recente.</div>
                ) : (
                  callLogs.map((log) => (
                    <div key={log.id} className="p-4 rounded-3xl hover:bg-white/5 transition-colors flex items-center space-x-4">
                      <img src={log.contactAvatar} className="w-12 h-12 rounded-full border border-zinc-800" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{log.contactName}</p>
                        <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest flex items-center space-x-1.5 mt-0.5">
                          {log.direction === 'outgoing' ? <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg> : <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>}
                          <span>{log.type === 'video' ? 'Chamada de Vídeo' : 'Chamada de Áudio'}</span>
                        </p>
                      </div>
                      <span className="text-[10px] text-zinc-600 font-mono">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  ))
                )}
              </div>
           </div>
        </div>
      )}

      {showPinModal && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-sm rounded-[2.5rem] p-8 shadow-3xl">
            <h2 className="text-2xl font-black text-white text-center mb-8">Segurança</h2>
            <div className="flex justify-center space-x-4 mb-10">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-xl font-black transition-all ${tempPin.length > i ? 'border-[var(--p)] bg-[var(--p-soft)] text-white shadow-[0_0_15px_var(--p-soft)]' : 'border-zinc-800 text-zinc-800'}`}>
                  {tempPin.length > i ? '●' : ''}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '←'].map((btn) => (
                <button
                  key={btn.toString()}
                  onClick={() => {
                    if (btn === 'C') setTempPin('');
                    else if (btn === '←') setTempPin(prev => prev.slice(0, -1));
                    else if (typeof btn === 'number' && tempPin.length < 4) setTempPin(prev => prev + btn);
                  }}
                  className="aspect-square rounded-2xl bg-white/5 border border-zinc-800 flex items-center justify-center text-lg font-bold text-zinc-300 hover:bg-white/10 hover:border-zinc-700 transition-all active:scale-90"
                >
                  {btn}
                </button>
              ))}
            </div>
            <button 
              onClick={() => { onUpdateSettings({ appLockEnabled: true, appPin: tempPin }); setShowPinModal(false); setTempPin(''); }}
              disabled={tempPin.length !== 4}
              className="w-full py-4 rounded-2xl bg-[var(--p)] text-white font-black text-xs uppercase tracking-widest disabled:opacity-30 shadow-xl shadow-red-900/20 transition-all"
            >
              Ativar PIN
            </button>
            <button onClick={() => setShowPinModal(false)} className="w-full py-3 mt-2 text-zinc-500 font-bold text-[10px] uppercase tracking-widest hover:text-white transition-colors">Cancelar</button>
          </div>
        </div>
      )}

      <div className={`fixed top-0 left-0 h-full w-80 z-[101] shadow-2xl transform transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col aurora-bg ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Profile Header */}
        <div className="p-8 pb-10 text-white relative overflow-hidden flex flex-col items-center">
          <div className="absolute inset-0 bg-[var(--p)] opacity-10 blur-[100px] -z-10"></div>
          
          <div className="relative group cursor-pointer mb-5" onClick={() => onUpdateProfile({ avatar: `https://picsum.photos/seed/${Math.random()}/200` })}>
            <div className="w-24 h-24 rounded-full border-4 border-white/10 shadow-3xl overflow-hidden bg-zinc-800 transition-all group-hover:scale-105 group-hover:border-white/20 duration-500">
              <img src={profile.avatar} className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-1 right-1 bg-white p-1.5 rounded-full shadow-lg text-[var(--p)] animate-bounce-short">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeWidth="3" strokeLinecap="round"/></svg>
            </div>
          </div>
          
          <div className="flex flex-col items-center space-y-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-black tracking-tight">{profile.name || 'Usuário Pop'}</h3>
              {profile.isPremium && <span className="bg-gradient-to-r from-yellow-500 to-amber-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest text-white shadow-lg shadow-amber-900/40">Premium</span>}
            </div>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">{profile.username}</p>
          </div>
        </div>

        <div className="flex-1 py-4 overflow-y-auto px-6 space-y-1.5 custom-scrollbar">
          
          <SidebarMenuOption icon="🔖" label="Mensagens Salvas" onClick={() => { onSelectChat('saved_messages'); onClose(); }} />
          <SidebarMenuOption icon="📞" label="Chamadas Recentes" onClick={() => { setShowCallsHistory(true); }} />
          <SidebarMenuOption icon="📡" label="Radar Pop (Pessoas Próximas)" onClick={() => { setShowNearby(true); onClose(); }} />
          
          {/* Install Option */}
          <SidebarMenuOption 
            icon={<ICONS.Download className="w-5 h-5 text-blue-400" />} 
            label="Baixar Aplicativo" 
            onClick={() => { onInstallApp(); onClose(); }}
            className="hover:bg-blue-500/10 text-blue-100"
          />

          {/* Share Option */}
          <SidebarMenuOption 
            icon={<ICONS.Share className={`w-5 h-5 ${shareFeedback ? 'text-green-500' : ''}`} />} 
            label={shareFeedback ? "Link Copiado!" : "Compartilhar PopChat"} 
            onClick={handleShare}
            className={`${shareFeedback ? 'bg-green-500/10 text-green-500 border border-green-500/20' : ''}`}
          />
          
          {/* Instagram Option - Dynor Styled */}
          <button 
            onClick={() => window.open('https://instagram.com/_dynor_', '_blank')}
            className="w-full flex items-center space-x-4 p-4 rounded-[1.5rem] bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-white/5 hover:border-pink-500/50 transition-all text-zinc-200 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="text-xl w-6 text-center flex items-center justify-center group-hover:scale-125 transition-transform duration-300">
              <svg className="w-5 h-5 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </span>
            <div className="flex flex-col items-start z-10">
                <span className="text-xs font-black uppercase tracking-widest text-pink-500 group-hover:text-white transition-colors">Seguir _dynor_</span>
                <span className="text-[9px] text-zinc-600 font-bold group-hover:text-pink-200 transition-colors">Novidades e atualizações</span>
            </div>
          </button>
          
          <div className="h-px bg-white/5 my-6 mx-2"></div>

          <SidebarAccordion icon="👤" label="Meu Perfil" isOpen={activeSection === 'profile'} onClick={() => setActiveSection(activeSection === 'profile' ? null : 'profile')}>
            <div className="space-y-4 pt-2">
              <div className="space-y-3">
                <div className="flex flex-col">
                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1.5 ml-1">Seu Nome</label>
                  <input type="text" value={profile.name} onChange={(e) => onUpdateProfile({ name: e.target.value })} className="w-full bg-black/20 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-[var(--p)] transition-all"/>
                </div>
                <div className="flex flex-col">
                  <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1.5 ml-1">Sobre Você</label>
                  <textarea value={profile.bio} onChange={(e) => onUpdateProfile({ bio: e.target.value })} rows={2} className="w-full bg-black/20 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-[var(--p)] transition-all resize-none"/>
                </div>
              </div>
            </div>
          </SidebarAccordion>

          <SidebarAccordion icon="🎨" label="Cores e Temas" isOpen={activeSection === 'theme'} onClick={() => setActiveSection(activeSection === 'theme' ? null : 'theme')}>
            <div className="pt-2 grid grid-cols-3 gap-2">
              {THEME_PRESETS.map((p) => (
                <button key={p.name} onClick={() => onUpdateTheme({ primary: p.color })} className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${theme.primary === p.color ? 'bg-[var(--p-soft)] border-[var(--p)]' : 'bg-black/20 border-zinc-800 hover:border-zinc-700'}`}>
                  <div className="w-6 h-6 rounded-full mb-2 shadow-lg" style={{ backgroundColor: p.color }}></div>
                  <span className="text-[8px] font-black uppercase text-zinc-500 tracking-tighter text-center leading-none">{p.name}</span>
                </button>
              ))}
              <div className="col-span-3 pt-3">
                <SettingToggle label="Modo Noturno OLED" value={theme.isNightMode || false} onChange={(v) => onUpdateTheme({ isNightMode: v })} />
              </div>
            </div>
          </SidebarAccordion>

          <SidebarAccordion icon="🎭" label="Protocolo Stealth" isOpen={activeSection === 'stealth'} onClick={() => setActiveSection(activeSection === 'stealth' ? null : 'stealth')}>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 gap-1.5">
                {STEALTH_PRESETS.map((p) => (
                  <button key={p.id} onClick={() => onUpdateSettings({ stealthName: p.title, stealthIcon: p.id })} className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all ${settings.stealthIcon === p.id ? 'border-[var(--p)] bg-[var(--p-soft)] shadow-inner' : 'border-zinc-800 hover:bg-white/5'}`}>
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{p.icon}</span>
                      <span className="text-xs font-bold text-zinc-200">{p.name}</span>
                    </div>
                    {settings.stealthIcon === p.id && <div className="w-1.5 h-1.5 rounded-full bg-[var(--p)] animate-pulse shadow-[0_0_8px_var(--p)]"></div>}
                  </button>
                ))}
              </div>
              
              <div className="mt-4 space-y-1">
                <SettingToggle label="Calculadora Lock" desc="PIN deve ser digitado na calculadora fake." value={settings.stealthCalculatorMode || false} onChange={(v) => onUpdateSettings({ stealthCalculatorMode: v })} />
                <SettingToggle label="Focus Blur" desc="Borra o app ao perder o foco (Alt+Tab)." value={settings.stealthBlurOnFocusLoss || false} onChange={(v) => onUpdateSettings({ stealthBlurOnFocusLoss: v })} />
                <SettingToggle label="Panic Title" desc="Notificações como 'Alerta de Sistema'." value={settings.stealthHideSenderOnTitle || false} onChange={(v) => onUpdateSettings({ stealthHideSenderOnTitle: v })} />
              </div>
            </div>
          </SidebarAccordion>

          <SidebarAccordion icon="🔒" label="Segurança Máxima" isOpen={activeSection === 'security'} onClick={() => setActiveSection(activeSection === 'security' ? null : 'security')}>
            <div className="pt-2 space-y-4">
              <button onClick={() => setShowPinModal(true)} className="w-full flex items-center justify-between p-5 rounded-2xl bg-black/20 border border-zinc-800 hover:border-[var(--p)] transition-all group">
                <div className="text-left">
                  <p className="text-xs font-black uppercase tracking-widest text-white group-hover:text-[var(--p)] transition-colors">Configurar PIN</p>
                  <p className="text-[9px] text-zinc-600 font-bold">{settings.appLockEnabled ? 'PROTEGIDO' : 'VULNERÁVEL'}</p>
                </div>
                <ICONS.Lock className={`w-5 h-5 ${settings.appLockEnabled ? 'text-green-500' : 'text-zinc-700'}`} />
              </button>

              <div className="bg-black/20 p-4 rounded-3xl border border-zinc-800">
                <div className="flex items-center space-x-2 mb-4">
                   <div className="w-1.5 h-1.5 rounded-full bg-[var(--p)] animate-pulse"></div>
                   <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Auto-Bloqueio</label>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 'off', label: 'Off' },
                    { val: '0', label: 'Now' },
                    { val: '30s', label: '30s' },
                    { val: '1m', label: '1m' },
                    { val: '5m', label: '5m' },
                    { val: '1h', label: '1h' }
                  ].map((opt) => (
                    <button 
                      key={opt.val}
                      onClick={() => onUpdateSettings({ autoLockTimer: opt.val as any })}
                      className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${settings.autoLockTimer === opt.val ? 'bg-[var(--p)] border-[var(--p)] text-white shadow-lg' : 'bg-black/40 border-zinc-800 text-zinc-600 hover:border-zinc-700'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-[9px] text-zinc-600 leading-relaxed font-bold italic text-center">
                  O app será trancado após o tempo selecionado.
                </p>
              </div>
            </div>
          </SidebarAccordion>

          <div className="h-px bg-white/5 my-6 mx-2"></div>

          <button onClick={() => { if(confirm("Apagar todos os dados e histórico permanentemente?")) { localStorage.clear(); window.location.reload(); } }} className="w-full flex items-center space-x-4 p-5 rounded-[1.5rem] bg-red-600/5 hover:bg-red-600/10 text-red-500 transition-all group border border-transparent hover:border-red-600/20">
             <div className="w-10 h-10 rounded-2xl bg-red-600/10 flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg">
              <ICONS.Trash className="w-5 h-5" />
            </div>
            <div className="text-left">
                <p className="text-xs font-black uppercase tracking-[0.2em]">Destruir Dados</p>
                <p className="text-[9px] text-red-800 font-bold">Ação Irreversível</p>
            </div>
          </button>
        </div>
        
        <div className="p-8 border-t border-white/5 text-center flex flex-col space-y-1 bg-black/20">
           <p className="text-[10px] text-zinc-700 font-black uppercase tracking-[0.4em]">PopChat Secure</p>
           <p className="text-[9px] text-zinc-800 font-bold italic">© _dynor_ interactive • 2025</p>
        </div>
      </div>
    </>
  );
};

const SidebarMenuOption = ({ icon, label, onClick, className }: { icon: string | React.ReactNode, label: string, onClick: () => void, className?: string }) => (
  <button onClick={onClick} className={`w-full flex items-center space-x-4 p-4 rounded-[1.5rem] hover:bg-white/5 transition-all text-zinc-300 hover:text-white group ${className}`}>
    <span className="text-xl w-6 text-center flex items-center justify-center group-hover:scale-110 transition-transform">{icon}</span>
    <span className="text-sm font-bold tracking-tight">{label}</span>
  </button>
);

const SidebarAccordion = ({ icon, label, isOpen, onClick, children }: { icon: string | React.ReactNode, label: string, isOpen: boolean, onClick: () => void, children?: React.ReactNode }) => (
  <div className="flex flex-col">
    <button className={`w-full flex items-center justify-between p-4 rounded-[1.5rem] transition-all ${isOpen ? 'bg-white/5' : 'hover:bg-white/5 group'}`} onClick={onClick}>
      <div className="flex items-center space-x-4">
        <span className="text-xl w-6 text-center flex items-center justify-center group-hover:scale-110 transition-transform">{icon}</span>
        <span className="text-zinc-100 text-sm font-bold tracking-tight">{label}</span>
      </div>
      <svg className={`w-4 h-4 text-zinc-700 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
    <div className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-[1000px] opacity-100 mt-2 mb-4 px-2' : 'max-h-0 opacity-0'}`}>
      <div className="p-1">{children}</div>
    </div>
  </div>
);

export default SidebarMenu;
