
import React, { useState, useEffect } from 'react';
import { Chat } from '../types';
import { getNearbyPeople } from '../services/geminiService';
import { ICONS } from '../constants';

interface NearbyPeopleModalProps {
  onClose: () => void;
  onAddContact: (contact: Chat) => void;
}

const NearbyPeopleModal: React.FC<NearbyPeopleModalProps> = ({ onClose, onAddContact }) => {
  const [isScanning, setIsScanning] = useState(true);
  const [people, setPeople] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startScan = async () => {
      if (!navigator.geolocation) {
        setError("Geolocalização não suportada pelo navegador.");
        setIsScanning(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const results = await getNearbyPeople(position.coords.latitude, position.coords.longitude);
            setPeople(results);
            setIsScanning(false);
          } catch (err) {
            setError("Falha ao buscar pessoas nos arredores.");
            setIsScanning(false);
          }
        },
        (err) => {
          setError("Acesso à localização negado. Verifique as permissões.");
          setIsScanning(false);
        }
      );
    };

    const timer = setTimeout(startScan, 2500); // Delay para efeito visual do radar
    return () => clearTimeout(timer);
  }, []);

  const handleAdd = (person: any) => {
    const newContact: Chat = {
      id: `nearby_${Date.now()}_${Math.random()}`,
      name: person.name,
      username: person.username,
      avatar: `https://picsum.photos/seed/${person.username}/200`,
      status: 'online',
      personality: person.personality || "Um usuário anônimo encontrado nas proximidades.",
      lastMessage: 'Ei! Vi que você está por perto também.',
      lastMessageTime: Date.now(),
      unreadCount: 1
    };
    onAddContact(newContact);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[200] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-md flex flex-col items-center">
        {isScanning ? (
          <div className="flex flex-col items-center space-y-12 w-full">
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* Radar Rings */}
              <div className="absolute inset-0 border-2 border-[var(--p)] rounded-full animate-ping opacity-20"></div>
              <div className="absolute inset-4 border border-[var(--p)] rounded-full opacity-40"></div>
              <div className="absolute inset-12 border border-[var(--p)] rounded-full opacity-60"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-[var(--p)] to-transparent rounded-full opacity-10 animate-[spin_4s_linear_infinite]"></div>
              
              <div className="relative z-10 p-6 bg-zinc-900 rounded-full border border-white/10 shadow-2xl">
                <ICONS.Logo size={60} />
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-white uppercase tracking-widest animate-pulse">Escaneando Arredores</h2>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em]">Utilizando geolocalização segura</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center p-8 bg-zinc-900 rounded-[2.5rem] border border-zinc-800 shadow-2xl w-full">
            <div className="text-red-500 text-5xl mb-6">⚠️</div>
            <h3 className="text-xl font-bold text-white mb-2">Ops! Algo deu errado</h3>
            <p className="text-zinc-500 text-sm mb-8">{error}</p>
            <button onClick={onClose} className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all">Voltar</button>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] shadow-2xl w-full overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
            <div className="p-6 border-b border-zinc-800 bg-black/20 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tighter">Pessoas Próximas</h3>
                <p className="text-[9px] text-[var(--p)] font-bold uppercase tracking-widest">Encontradas em sua região</p>
              </div>
              <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
              {people.length === 0 ? (
                <div className="p-12 text-center text-zinc-600 font-bold uppercase text-xs">Ninguém encontrado no momento.</div>
              ) : (
                people.map((person, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handleAdd(person)}
                    className="w-full p-4 flex items-center space-x-4 hover:bg-white/5 border-b border-white/[0.02] transition-colors group text-left"
                  >
                    <div className="relative">
                      <img src={`https://picsum.photos/seed/${person.username}/100`} className="w-12 h-12 rounded-full border border-zinc-800" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-zinc-900 rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <p className="font-bold text-white truncate">{person.name}</p>
                        <span className="text-[9px] font-black text-[var(--p)] uppercase">{person.distance}</span>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-mono truncate">{person.username}</p>
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5">{person.bio}</p>
                    </div>
                    <div className="text-zinc-700 group-hover:text-[var(--p)] transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="p-6 bg-black/40 text-center">
              <p className="text-[10px] text-zinc-500 font-medium leading-relaxed italic">
                Ao clicar em um perfil, uma nova conversa segura e anônima será iniciada. Sua localização exata nunca é revelada.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NearbyPeopleModal;
