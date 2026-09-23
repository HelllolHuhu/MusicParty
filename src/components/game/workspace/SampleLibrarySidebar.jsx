import { useState } from 'react';
import { FaPlay, FaPlus, FaTimes, FaVolumeUp } from 'react-icons/fa';
import { audioEngine } from './AudioEngine';

const SOUND_LIBRARY = {
  drums: [
    { id: 's_kick', name: '808 Kick', category: 'Drums', color: 'bg-red-500', duration: 1.0, soundKey: 'kick' },
    { id: 's_kick_p', name: 'Punchy Kick', category: 'Drums', color: 'bg-rose-500', duration: 1.0, soundKey: 'kick_punchy' },
    { id: 's_snare', name: 'Trap Snare', category: 'Drums', color: 'bg-orange-500', duration: 1.0, soundKey: 'snare' },
    { id: 's_clap', name: 'Crisp Clap', category: 'Drums', color: 'bg-amber-500', duration: 1.0, soundKey: 'clap' },
    { id: 's_hihat', name: 'Closed Hi-Hat', category: 'Drums', color: 'bg-yellow-500', duration: 0.5, soundKey: 'hihat' },
    { id: 's_openhat', name: 'Open Cymbal', category: 'Drums', color: 'bg-lime-500', duration: 1.5, soundKey: 'openhat' },
    { id: 's_perc', name: 'Rimshot / Perc', category: 'Drums', color: 'bg-teal-500', duration: 0.8, soundKey: 'perc' },
  ],
  bass: [
    { id: 's_bass808', name: '808 Sub Boom', category: 'Bass', color: 'bg-blue-600', duration: 4.0, soundKey: 'bass808' },
    { id: 's_bass_punch', name: 'Punchy Bass', category: 'Bass', color: 'bg-indigo-600', duration: 2.0, soundKey: 'bass808' },
    { id: 's_bass_glide', name: '808 Glide Wave', category: 'Bass', color: 'bg-cyan-600', duration: 4.0, soundKey: 'bass808' },
  ],
  synths: [
    { id: 's_pluck', name: 'Pluck Synth (C4)', category: 'Melody', color: 'bg-purple-600', duration: 2.0, soundKey: 'pluck', isNote: true, note: 'C4' },
    { id: 's_pluck_high', name: 'Pluck Arp (G4)', category: 'Melody', color: 'bg-fuchsia-600', duration: 2.0, soundKey: 'pluck', isNote: true, note: 'G4' },
    { id: 's_keys', name: 'Electric Piano', category: 'Melody', color: 'bg-pink-600', duration: 3.0, soundKey: 'keys', isNote: true, note: 'C4' },
    { id: 's_lead', name: 'Neon Lead Synth', category: 'Melody', color: 'bg-violet-600', duration: 2.0, soundKey: 'lead', isNote: true, note: 'A4' },
    { id: 's_pad', name: 'Synthwave Pad', category: 'Melody', color: 'bg-purple-700', duration: 4.0, soundKey: 'pad', isNote: true, note: 'C4' },
  ],
  fx: [
    { id: 's_scratch', name: 'Vinyl Scratch', category: 'FX', color: 'bg-amber-400 text-black', duration: 1.5, soundKey: 'scratch' },
    { id: 's_crash', name: 'Crash Cymbal', category: 'FX', color: 'bg-emerald-400 text-black', duration: 2.5, soundKey: 'crash' },
  ]
};

export default function SampleLibrarySidebar({
  isOpen = true,
  onClose = () => {},
  onAddSampleAtPlayhead = () => {}
}) {
  const [activeCategory, setActiveCategory] = useState('drums');

  if (!isOpen) return null;

  const handlePreview = (item, e) => {
    if (e) e.stopPropagation();
    if (item.isNote) {
      audioEngine.playNote(item.soundKey, item.note || 'C4', '4n');
    } else {
      audioEngine.playDrum(item.soundKey || item.id);
    }
  };

  const handleDragStart = (item, e) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const items = SOUND_LIBRARY[activeCategory] || [];

  return (
    <aside className="w-64 sm:w-72 bg-zinc-900 border-l-2 border-black flex flex-col shrink-0 select-none z-30 shadow-2xl h-full animate-in slide-in-from-right-4 duration-200">
      
      {/* Header */}
      <div className="p-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
        <div className="flex items-center gap-1.5">
          <span className="font-black text-pink-500 uppercase tracking-widest text-xs">
            Sound Library
          </span>
          <span className="text-[9px] text-zinc-400 font-bold bg-zinc-800 px-1.5 py-0.5 rounded">
            Drag & Drop
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center text-xs transition-colors"
          title="Close Library"
        >
          <FaTimes size={10} />
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex bg-zinc-950 p-1.5 gap-1 border-b border-zinc-800">
        {[
          { key: 'drums', label: '🥁 Drums' },
          { key: 'bass', label: '🔊 Bass' },
          { key: 'synths', label: '🎹 Synths' },
          { key: 'fx', label: '🪄 FX' },
        ].map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`flex-1 py-1.5 rounded-xl text-[10px] font-black transition-all ${
              activeCategory === cat.key
                ? 'bg-pink-500 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Loop Items List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        <div className="text-[10px] font-bold text-zinc-400 px-1 pb-1">
          💡 Drag any sound card onto any timeline track:
        </div>

        {items.map(item => (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => handleDragStart(item, e)}
            onClick={(e) => handlePreview(item, e)}
            className={`p-2.5 rounded-2xl border-2 border-black flex items-center justify-between cursor-grab active:cursor-grabbing hover:scale-[1.02] shadow-[0_3px_0_0_#000] active:translate-y-0.5 active:shadow-[0_1px_0_0_#000] transition-all group ${item.color}`}
          >
            <div className="flex items-center gap-2 truncate">
              <button
                onClick={(e) => handlePreview(item, e)}
                className="w-7 h-7 rounded-xl bg-black/40 hover:bg-black/60 text-white flex items-center justify-center shrink-0 transition-transform active:scale-90"
                title="Audition Sound"
              >
                <FaPlay size={10} className="ml-0.5" />
              </button>
              <div className="truncate">
                <div className="font-black text-xs text-white truncate drop-shadow-sm">
                  {item.name}
                </div>
                <div className="text-[9px] font-bold text-white/70">
                  {item.category} • {item.duration}s
                </div>
              </div>
            </div>

            {/* Quick Add Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddSampleAtPlayhead(item);
              }}
              className="w-6 h-6 rounded-lg bg-black/30 hover:bg-black/60 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              title="Add to active track at playhead"
            >
              <FaPlus size={9} />
            </button>
          </div>
        ))}
      </div>

    </aside>
  );
}
