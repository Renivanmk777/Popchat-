
import React, { useState } from 'react';
import { EMOJI_GROUPS } from '../constants';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose }) => {
  const [activeGroup, setActiveGroup] = useState(0);

  return (
    <div className="absolute bottom-full mb-2 right-0 left-0 md:left-auto md:w-80 bg-zinc-900 border border-zinc-800 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 z-[110]">
      <div className="p-4 flex flex-col h-[350px]">
        {/* Category Tabs */}
        <div className="flex space-x-1 mb-4 border-b border-zinc-800 pb-2 overflow-x-auto scrollbar-hide">
          {EMOJI_GROUPS.map((group, idx) => (
            <button
              key={group.name}
              onClick={() => setActiveGroup(idx)}
              className={`p-2 rounded-xl text-lg transition-all flex-shrink-0 ${
                activeGroup === idx 
                ? 'bg-white/10 shadow-inner scale-110' 
                : 'opacity-40 hover:opacity-100'
              }`}
              title={group.name}
            >
              {group.icon}
            </button>
          ))}
        </div>

        {/* Emoji Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-6 gap-1 p-1 custom-scrollbar">
          {EMOJI_GROUPS[activeGroup].emojis.map((emoji, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(emoji)}
              className="aspect-square flex items-center justify-center text-2xl rounded-xl hover:bg-white/10 transition-all transform hover:scale-125 active:scale-90"
            >
              {emoji}
            </button>
          ))}
        </div>

        <div className="pt-2 flex justify-center opacity-20">
          <div className="w-12 h-1 bg-white rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default EmojiPicker;
