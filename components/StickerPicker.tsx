
import React, { useState } from 'react';
import { STICKER_PACKS } from '../constants';

interface StickerPickerProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

const StickerPicker: React.FC<StickerPickerProps> = ({ onSelect, onClose }) => {
  const [activePack, setActivePack] = useState(0);

  return (
    <div className="absolute bottom-full mb-2 right-0 left-0 md:left-auto md:w-80 bg-zinc-900 border border-zinc-800 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 z-[110]">
      <div className="p-4 flex flex-col h-[400px]">
        {/* Header Pack Selector */}
        <div className="flex space-x-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {STICKER_PACKS.map((pack, idx) => (
            <button
              key={pack.name}
              onClick={() => setActivePack(idx)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                activePack === idx 
                ? 'bg-[var(--p)] text-white shadow-lg' 
                : 'bg-white/5 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {pack.name}
            </button>
          ))}
        </div>

        {/* Stickers Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-3 p-1 custom-scrollbar">
          {STICKER_PACKS[activePack].stickers.map((url, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(url)}
              className="aspect-square p-2 rounded-2xl hover:bg-white/5 transition-all transform hover:scale-110 active:scale-90"
            >
              <img src={url} alt={`Sticker ${idx}`} className="w-full h-full object-contain" loading="lazy" />
            </button>
          ))}
        </div>

        {/* Bottom indicator */}
        <div className="pt-3 border-t border-zinc-800/50 flex justify-center">
          <div className="w-8 h-1 bg-zinc-800 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default StickerPicker;
