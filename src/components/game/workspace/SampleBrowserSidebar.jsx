import { useState } from 'react';
import { FaPlus, FaCheck, FaVolumeUp } from 'react-icons/fa';
import { audioEngine } from './AudioEngine';

const SOUND_LIBRARY = {
  drums: [
    { id: 'kick', name: '808 Kick', category: 'Drums', color: 'bg-red-500', duration: 0.8, soundKey: 'kick' },
    { id: 'snare', name: 'Trap Snare', category: 'Drums', color: 'bg-orange-500', duration: 0.8, soundKey: 'snare' },
    { id: 'clap', name: 'Crisp Clap', category: 'Drums', color: 'bg-amber-500', duration: 0.8, soundKey: 'clap' },
    { id: 'hihat', name: 'Closed Hi-Hat', category: 'Drums', color: 'bg-yellow-500', duration: 0.6, soundKey: 'hihat' },
    { id: 'openhat', name: 'Open Cymbal', category: 'Drums', color: 'bg-lime-500', duration: 1.2, soundKey: 'openhat' },
    { id: 'perc', name: 'Rimshot / Perc', category: 'Drums', color: 'bg-teal-500', duration: 0.8, soundKey: 'perc' },
  ],
  bass: [
    { id: 'bass808', name: '808 Sub Boom', category: 'Bass', color: 'bg-blue-500', duration: 2.0, soundKey: 'bass808' },
    { id: 'bass_punch', name: 'Punchy Sub', category: 'Bass', color: 'bg-indigo-500', duration: 1.8, soundKey: 'bass808' },
    { id: 'bass_slide', name: '808 Glide Bass', category: 'Bass', color: 'bg-cyan-500', duration: 2.5, soundKey: 'bass808' },
  ],
  synths: [
    { id: 'pluck', name: 'Pluck Synth', category: 'Melody', color: 'bg-purple-500', duration: 2.0, soundKey: 'pluck', isNote: true, note: 'C4' },
    { id: 'keys', name: 'Electric Piano', category: 'Melody', color: 'bg-pink-500', duration: 2.5, soundKey: 'keys', isNote: true, note: 'C4' },
    { id: 'lead', name: 'Lead Synth', category: 'Melody', color: 'bg-fuchsia-500', duration: 2.0, soundKey: 'lead', isNote: true, note: 'G4' },
    { id: 'pad', name: 'Retro Pad', category: 'Melody', color: 'bg-violet-500', duration: 3.0, soundKey: 'pad', isNote: true, note: 'C4' },
  ],
  fx: [
    { id: 'scratch', name: 'Vinyl Scratch', category: 'FX', color: 'bg-yellow-400', duration: 1.0, soundKey: 'scratch' },
    { id: 'crash', name: 'Crash Cymbal', category: 'FX', color: 'bg-emerald-400', duration: 1.5, soundKey: 'crash' },
  ]
};

export default function SampleBrowserSidebar({
  selectedSample,
  setSelectedSample,
  onPointerDragStart,
  onQuickAdd
}) {
  const [activeTab, setActiveTab] = useState('drums');

  const handlePreview = (item) => {
    if (item.isNote) {
      audioEngine.playNote(item.soundKey, item.note || 'C4', '4n');
    } else {
      audioEngine.playDrum(item.soundKey || item.id);
    }
  };

  const handleCardClick = (item) => {
    handlePreview(item);
    if (selectedSample?.id === item.id) {
      setSelectedSample(null); // toggle off
    } else {
      setSelectedSample(item); // stamp mode active
    }
  };

  const items = SOUND_LIBRARY[activeTab] || [];

  return (
    <div className="w-64 bg-zinc-900 border-r-2 border-zinc-800 flex flex-col shrink-0 select-none">
      
      {/* Header */}
      <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
        <span className="font-black text-pink-500 uppercase tracking-widest text-xs">
          Sound Library
        </span>
        <span className="text-[10px] text-zinc-400 font-bold bg-black/50 px-2 py-0.5 rounded-md">
          {selectedSample ? 'Stamp Mode' : 'Drag / Click'}
        </span>
      </div>

      {/* Category Tabs */}
      <div className="flex bg-zinc-950 p-1 gap-1 border-b border-zinc-800">
        {[
          { key: 'drums', label: '🥁 Drums' },
          { key: 'bass', label: '🔊 Bass' },
          { key: 'synths', label: '🎹 Synths' },
          { key: 'fx', label: '🪄 FX' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all ${
              activeTab === tab.key
                ? 'bg-pink-500 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sound Items List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {selectedSample && (
          <div className="bg-pink-500/20 border-2 border-pink-500 text-pink-300 p-2 rounded-xl text-[11px] font-bold flex items-center justify-between animate-pulse mb-2">
            <span>Stamp: <b>{selectedSample.name}</b></span>
            <button onClick={() => setSelectedSample(null)} className="text-white hover:text-red-400 text-sm ml-2">✕</button>
          </div>
        )}

        {items.map(item => {
          const isSelected = selectedSample?.id === item.id;

          return (
            <div
              key={item.id}
              draggable="true"
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', JSON.stringify(item));
                e.dataTransfer.setData('sample_payload', JSON.stringify(item));
                e.dataTransfer.effectAllowed = 'copy';
              }}
              onPointerDown={(e) => {
                if (e.button === 0 && !e.target.closest('button')) {
                  onPointerDragStart?.(item, e.clientX, e.clientY);
                }
              }}
              onClick={() => handleCardClick(item)}
              className={`p-2.5 rounded-xl cursor-grab active:cursor-grabbing border-2 border-black shadow-[0_2px_0_0_#000] hover:translate-y-[-1px] transition-all flex items-center justify-between group ${
                item.color
              } ${
                isSelected ? 'ring-4 ring-white scale-105 shadow-[0_0_12px_rgba(255,255,255,0.8)]' : ''
              }`}
              title="Click to preview & stamp, or drag onto timeline"
            >
              <div>
                <div className="font-black text-black text-xs drop-shadow-xs flex items-center gap-1">
                  {isSelected && <FaCheck size={10} className="text-black" />}
                  <span>{item.name}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] text-black/75 font-black uppercase">{item.category}</span>
                  <span className="text-[9px] bg-black/20 text-black font-bold px-1 rounded">{item.duration}s</span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreview(item);
                  onQuickAdd?.(item);
                }}
                className="w-6 h-6 rounded-lg bg-black/80 hover:bg-black text-white flex items-center justify-center text-xs opacity-80 group-hover:opacity-100 transition-all hover:scale-110 shadow-xs"
                title="Quick Add (+)"
              >
                <FaPlus size={10} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 bg-zinc-950/80 border-t border-zinc-800 text-[10px] text-zinc-400 text-center leading-tight">
        Click any sound to preview and stamp on timeline, or drag & drop!
      </div>

    </div>
  );
}
