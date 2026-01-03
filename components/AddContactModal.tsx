
import React, { useState, useEffect } from 'react';
import { Chat } from '../types';
import QrScanner from './QrScanner';

interface AddContactModalProps {
  onClose: () => void;
  onAdd: (contact: Chat) => void;
  chats: Chat[]; // Recebe chats para validação
}

const AddContactModal: React.FC<AddContactModalProps> = ({ onClose, onAdd, chats }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('@');
  const [personality, setPersonality] = useState('Você é um amigo prestativo no PopChat.');
  const [avatarSeed, setAvatarSeed] = useState(Math.floor(Math.random() * 1000).toString());
  const [usernameError, setUsernameError] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const avatarUrl = `https://picsum.photos/seed/${avatarSeed}/200`;

  // Validação de username
  useEffect(() => {
    if (!username || username === '@') {
      setUsernameError('O nome de usuário é obrigatório.');
      return;
    }

    if (!username.startsWith('@')) {
      setUsernameError('O nome de usuário deve começar com @.');
      return;
    }

    const cleanUsername = username.toLowerCase();
    
    // Regex para validar formato: @ seguido de pelo menos 3 caracteres (letras, números ou underline)
    const isValidFormat = /^@[a-z0-9_]{3,20}$/.test(cleanUsername);
    
    if (!isValidFormat) {
      if (cleanUsername.length < 4) {
        setUsernameError('Nome muito curto (mínimo 3 caracteres após o @).');
      } else if (cleanUsername.length > 21) {
        setUsernameError('Nome muito longo (máximo 20 caracteres após o @).');
      } else {
        setUsernameError('Use apenas letras, números e underlines.');
      }
      return;
    }

    // Verifica se já existe
    const exists = chats.some(c => c.username.toLowerCase() === cleanUsername);
    
    if (exists) {
      setUsernameError('Este nome de usuário já está sendo usado por outro contato.');
    } else {
      setUsernameError('');
    }
  }, [username, chats]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim() || usernameError || username === '@') return;

    const newContact: Chat = {
      id: Date.now().toString(),
      name: name.trim(),
      username: username.toLowerCase(),
      avatar: avatarUrl,
      status: 'online',
      personality,
      lastMessage: 'Olá! Sou seu novo contato.',
      lastMessageTime: Date.now(),
      unreadCount: 0
    };

    onAdd(newContact);
  };

  const handleUsernameChange = (val: string) => {
    // Garante que comece com @
    let sanitized = val.toLowerCase();
    
    if (!sanitized.startsWith('@')) {
      sanitized = '@' + sanitized.replace(/@/g, '');
    } else {
      // Remove @ extras se o usuário tentar digitar mais de um
      const parts = sanitized.split('@');
      sanitized = '@' + parts.join('').replace(/[^a-z0-9_]/g, '');
    }
    
    // Limita o tamanho máximo total (incluindo @) para 21
    if (sanitized.length <= 21) {
      setUsername(sanitized);
    }
  };

  const handleQrScan = (data: string) => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.name && parsed.username) {
        setName(parsed.name);
        handleUsernameChange(parsed.username);
        setIsScanning(false);
      } else {
        alert("QR Code inválido: Formato PopChat não reconhecido.");
      }
    } catch (e) {
      alert("Falha ao ler o QR Code. Certifique-se de que é um contato do PopChat.");
    }
  };

  if (isScanning) {
    return <QrScanner onScan={handleQrScan} onClose={() => setIsScanning(false)} />;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[70] flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-zinc-100">Novo Contato</h2>
            <button onClick={onClose} className="text-zinc-500 hover:text-[var(--p)] transition-colors p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col space-y-5">
            <button 
              onClick={() => setIsScanning(true)}
              className="w-full flex items-center justify-center space-x-3 bg-white/5 border text-white py-4 rounded-2xl font-bold transition-all group active:scale-95"
              style={{ borderColor: 'var(--p-soft)' }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--p)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m0 11v1m5-16v1m0 11v1M4 12h1m11 0h1M4 5h1m11 0h1m-10 7v3m4-3v3M7 7h10M7 17h10" />
                <rect x="3" y="3" width="6" height="6" rx="1" strokeWidth="2" />
                <rect x="15" y="3" width="6" height="6" rx="1" strokeWidth="2" />
                <rect x="3" y="15" width="6" height="6" rx="1" strokeWidth="2" />
              </svg>
              <span>Escanear QR Code</span>
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-zinc-800"></div>
              <span className="flex-shrink mx-4 text-zinc-600 text-[10px] font-black uppercase tracking-widest">Ou preencha manualmente</span>
              <div className="flex-grow border-t border-zinc-800"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex flex-col items-center mb-2">
                <div className="relative group">
                  <img src={avatarUrl} alt="Avatar Preview" className="w-20 h-20 rounded-full border-4 shadow-2xl object-cover transition-transform group-hover:scale-105" style={{ borderColor: 'var(--p-soft)' }} />
                  <button type="button" onClick={() => setAvatarSeed(Math.floor(Math.random() * 1000).toString())} className="absolute bottom-0 right-0 text-white p-1.5 rounded-full shadow-lg hover:brightness-110 transition-all" style={{ backgroundColor: 'var(--p)' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">Nome Exibido</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: João Silva" className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:ring-2 outline-none text-zinc-100 placeholder-zinc-600 transition-all text-sm" style={{ focusRingColor: 'var(--p)' } as any} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">Nome de Usuário (@)</label>
                  <input type="text" required value={username} onChange={(e) => handleUsernameChange(e.target.value)} placeholder="@usuario_unico" className={`w-full bg-zinc-800 border rounded-xl px-4 py-3 focus:ring-2 outline-none text-zinc-100 placeholder-zinc-600 transition-all text-sm font-mono ${usernameError && username !== '@' ? 'border-red-500/50' : 'border-zinc-700'}`} style={{ focusRingColor: 'var(--p)' } as any} />
                  {usernameError && username !== '@' && <p className="text-[10px] text-red-500 mt-1.5 ml-1 font-bold animate-pulse">{usernameError}</p>}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">Personalidade</label>
                <textarea rows={2} value={personality} onChange={(e) => setPersonality(e.target.value)} placeholder="Ex: Um colega de trabalho amigável." className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:ring-2 outline-none text-zinc-100 placeholder-zinc-600 transition-all resize-none text-sm" style={{ focusRingColor: 'var(--p)' } as any} />
              </div>

              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-xl font-bold text-zinc-400 hover:bg-zinc-800 transition-all text-sm">Cancelar</button>
                <button type="submit" disabled={!name.trim() || !!usernameError || username === '@'} className="flex-1 py-3.5 rounded-xl font-bold text-white disabled:opacity-30 disabled:cursor-not-allowed shadow-xl transition-all active:scale-95 text-sm" style={{ backgroundColor: 'var(--p)' }}>Criar Contato</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddContactModal;
