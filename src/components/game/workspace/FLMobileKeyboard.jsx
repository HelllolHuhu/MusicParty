import { useState } from 'react';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import { audioEngine } from './AudioEngine';
import { NOTE_NAMES, SCALES, getScaleNotes } from './scaleUtils';
import { PIANO_INSTRUMENTS } from './presetData';

export default function FLMobileKeyboard({
  notes,
  setNotes,
  instrument,
  setInstrument,
  rootNote,
  setRootNote,
  scaleKey,
  setScaleKey,
  scaleLock,
  setScaleLock,
  onStampToPlaylist,
  isPlaying,
  currentStep
}) {
  const [octaveBase, setOctaveBase] = useState(3);
  const [activePressedNote, setActivePressedNote] = useState(null);

  // Active octaves shown on grid & keyboard
  const octaves = [octaveBase, octaveBase + 1];
  const gridRows = getScaleNotes(rootNote, scaleKey, octaves);

  // Filter rows if scale lock is active
  const visibleRows = scaleLock ? gridRows.filter(r => r.isInScale) : gridRows;

  // Trigger sound when key or grid note is clicked
  const handleAudition = (noteStr) => {
    setActivePressedNote(noteStr);
    audioEngine.playNote(instrument, noteStr, '8n');
    setTimeout(() => setActivePressedNote(null), 180);
  };

  const handleOctaveChange = (delta) => {
    setOctaveBase(prev => Math.max(1, Math.min(5, prev + delta)));
  };

  const toggleGridNote = (noteStr, stepIdx) => {
    setNotes(prev => {
      const existingIdx = prev.findIndex(n => n.note === noteStr && n.step === stepIdx);
      if (existingIdx >= 0) {
        // Remove note
        return prev.filter((_, idx) => idx !== existingIdx);
      } else {
        // Add note and audition
        audioEngine.playNote(instrument, noteStr, '8n');
        return [...prev, { note: noteStr, step: stepIdx, length: 2 }];
      }
    });
  };

  const handleClear = () => {
    setNotes([]);
  };

  const handleStamp = () => {
    if (onStampToPlaylist) {
      const currentInst = PIANO_INSTRUMENTS.find(i => i.id === instrument) || PIANO_INSTRUMENTS[0];
      onStampToPlaylist({
        type: 'melody',
        name: `🎹 ${currentInst.name}`,
        notes: [...notes],
        instrument,
        duration: 4,
        color: currentInst.color
      });
    }
  };

  // Keyboard keys for the lower octave and upper octave
  const keyboardKeys = [];
  octaves.forEach(oct => {
    NOTE_NAMES.forEach(name => {
      const noteStr = `${name}${oct}`;
      const isBlack = name.includes('#');
      const rowInfo = gridRows.find(r => r.note === noteStr);
      keyboardKeys.push({
        note: noteStr,
        name,
        octave: oct,
        isBlack,
        isInScale: rowInfo?.isInScale ?? true,
        isRoot: name === rootNote
      });
    });
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 p-2 sm:p-3 select-none overflow-hidden">
      
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-900 border-2 border-zinc-800 px-3 py-2 rounded-xl mb-2 shrink-0">
        
        {/* Left: Instrument & Scale Picker */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Instrument Selector */}
          <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded-xl border border-zinc-800">
            <span className="text-[10px] font-black uppercase text-orange-400">Inst</span>
            <select
              value={instrument}
              onChange={(e) => {
                setInstrument(e.target.value);
                audioEngine.playNote(e.target.value, 'C4', '8n');
              }}
              className="bg-transparent text-white font-black text-xs outline-none cursor-pointer"
            >
              {PIANO_INSTRUMENTS.map(inst => (
                <option key={inst.id} value={inst.id} className="bg-zinc-900 text-white">
                  {inst.icon} {inst.name}
                </option>
              ))}
            </select>
          </div>

          {/* Root Note Picker */}
          <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded-xl border border-zinc-800">
            <span className="text-[10px] font-black uppercase text-orange-400">Key</span>
            <select
              value={rootNote}
              onChange={(e) => setRootNote(e.target.value)}
              className="bg-transparent text-white font-mono font-black text-xs outline-none cursor-pointer"
            >
              {NOTE_NAMES.map(n => (
                <option key={n} value={n} className="bg-zinc-900 text-white">{n}</option>
              ))}
            </select>
          </div>

          {/* Scale Type Picker */}
          <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded-xl border border-zinc-800 max-w-[200px] sm:max-w-xs">
            <span className="text-[10px] font-black uppercase text-orange-400">Scale</span>
            <select
              value={scaleKey}
              onChange={(e) => setScaleKey(e.target.value)}
              className="bg-transparent text-white font-black text-xs outline-none truncate cursor-pointer"
            >
              {Object.entries(SCALES).map(([key, info]) => (
                <option key={key} value={key} className="bg-zinc-900 text-white">
                  {info.name}
                </option>
              ))}
            </select>
          </div>

          {/* Scale Lock Toggle */}
          <button
            onClick={() => setScaleLock(!scaleLock)}
            className={`px-2.5 py-1 rounded-xl font-black text-xs border-2 border-black transition-all flex items-center gap-1 ${
              scaleLock
                ? 'bg-emerald-500 text-black shadow-[0_2px_0_0_#000]'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
            title="When active, hides out-of-scale notes so you cannot play a wrong note"
          >
            <span>🔒 Scale Lock:</span>
            <span>{scaleLock ? 'ON (Safe)' : 'OFF'}</span>
          </button>
        </div>

        {/* Right: Octave Controls, Clear, Stamp */}
        <div className="flex items-center gap-2">
          {/* Octave Shift */}
          <div className="flex items-center bg-black/60 rounded-xl border border-zinc-800 p-0.5">
            <button
              onClick={() => handleOctaveChange(-1)}
              disabled={octaveBase <= 1}
              className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 active:scale-95"
              title="Lower Octave"
            >
              <FaMinus size={9} />
            </button>
            <span className="font-mono font-bold text-[10px] text-yellow-300 px-1.5 whitespace-nowrap">
              Oct {octaveBase}-{octaveBase + 1}
            </span>
            <button
              onClick={() => handleOctaveChange(1)}
              disabled={octaveBase >= 5}
              className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 active:scale-95"
              title="Raise Octave"
            >
              <FaPlus size={9} />
            </button>
          </div>

          {/* Clear Notes */}
          <button
            onClick={handleClear}
            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-300 hover:text-red-400 border border-zinc-700 text-xs font-bold flex items-center gap-1 transition-all"
            title="Clear all notes"
          >
            <FaTrash size={10} />
            <span className="hidden sm:inline">Clear</span>
          </button>

          {/* Stamp to Playlist */}
          <button
            onClick={handleStamp}
            className="btn-chunky btn-chunky-green text-xs font-black px-3 py-1.5 flex items-center gap-1 shadow-[0_2px_0_0_#000]"
            title="Stamp this melody pattern as a 4-second clip onto Playlist"
          >
            <span>📥 Stamp to Playlist</span>
          </button>
        </div>

      </div>

      {/* Main Container: Piano Roll Grid (Top) + Interactive Touch Keyboard (Bottom) */}
      <div className="flex-1 flex flex-col gap-2 min-h-0 overflow-hidden">
        
        {/* 16-Step Piano Roll Grid Matrix */}
        <div className="flex-1 bg-zinc-900 border-2 border-zinc-800 rounded-xl p-2 overflow-auto shadow-inner flex flex-col min-h-0">
          
          {/* Step Numbers Header */}
          <div className="flex items-center gap-1 ml-16 sm:ml-20 min-w-[500px] mb-1">
            {Array.from({ length: 16 }).map((_, i) => {
              const isFirstOfBeat = i % 4 === 0;
              const isCurrentPlayingStep = isPlaying && currentStep === i;

              return (
                <div
                  key={i}
                  className={`flex-1 text-center font-mono text-[9px] sm:text-[10px] transition-transform ${
                    isCurrentPlayingStep
                      ? 'text-yellow-400 font-black scale-125'
                      : isFirstOfBeat
                        ? 'text-orange-400 font-black'
                        : 'text-zinc-600 font-bold'
                  }`}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>

          {/* Note Rows */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {visibleRows.map((row) => {
              const isRoot = row.name === rootNote;
              const isHighlighted = activePressedNote === row.note;

              return (
                <div key={row.note} className="flex items-center gap-1">
                  
                  {/* Pitch Header / Audition Key */}
                  <button
                    onClick={() => handleAudition(row.note)}
                    className={`w-16 sm:w-20 h-6 shrink-0 rounded font-black text-[10px] sm:text-[11px] px-1.5 flex items-center justify-between border border-black shadow-xs transition-all ${
                      isHighlighted
                        ? 'bg-yellow-400 text-black scale-105 shadow-[0_0_8px_rgba(250,204,21,0.8)]'
                        : isRoot
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-black font-black'
                          : row.isBlackKey
                            ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                            : 'bg-zinc-200 text-black hover:bg-white'
                    }`}
                    title="Click to audition note"
                  >
                    <span className="font-mono">{row.note}</span>
                    {isRoot && <span className="text-[8px] bg-black text-amber-300 px-1 rounded">ROOT</span>}
                  </button>

                  {/* 16 Step Grid Blocks */}
                  <div className="flex-1 flex items-center gap-1 min-w-[500px]">
                    {Array.from({ length: 16 }).map((_, stepIdx) => {
                      const activeNote = notes.find(n => n.note === row.note && n.step === stepIdx);
                      const isActive = Boolean(activeNote);
                      const isCurrentPlayhead = isPlaying && currentStep === stepIdx;
                      const beatGroup = Math.floor(stepIdx / 4) % 2 === 0;

                      return (
                        <button
                          key={stepIdx}
                          onClick={() => toggleGridNote(row.note, stepIdx)}
                          className={`flex-1 h-6 rounded border transition-all transform active:scale-95 flex items-center justify-center relative ${
                            isActive
                              ? 'bg-gradient-to-r from-orange-500 to-amber-400 border-black shadow-[0_1px_0_0_#000]'
                              : beatGroup
                                ? 'bg-zinc-800/90 border-zinc-700/60 hover:bg-zinc-700'
                                : 'bg-zinc-850 border-zinc-800 hover:bg-zinc-750'
                          } ${
                            isCurrentPlayhead
                              ? 'ring-2 ring-yellow-400 z-10 shadow-[0_0_8px_rgba(250,204,21,0.8)]'
                              : ''
                          }`}
                          title={`${row.note} @ Step ${stepIdx + 1}`}
                        >
                          {isActive && (
                            <div className="w-1.5 h-1.5 rounded-full bg-black shadow-xs" />
                          )}

                          {isCurrentPlayhead && (
                            <div className="absolute inset-0 bg-yellow-400/20 rounded pointer-events-none" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                </div>
              );
            })}
          </div>

        </div>

        {/* FL Studio Mobile Touch Piano Keyboard Controller */}
        <div className="h-28 sm:h-32 bg-zinc-900 border-2 border-zinc-800 rounded-xl p-2 shrink-0 flex flex-col justify-between shadow-md">
          
          <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 px-1 mb-1">
            <span className="flex items-center gap-1 text-orange-400 font-black uppercase">
              <span>🎹</span> <span>Interactive Touch Keyboard</span>
            </span>
            <span className="text-zinc-500 hidden sm:inline">Tap keys to play live instruments</span>
          </div>

          {/* Keys Ribbon */}
          <div className="flex-1 flex gap-1 overflow-x-auto p-1 bg-black/40 rounded-lg border border-zinc-800">
            {keyboardKeys.map((k) => {
              const isPressed = activePressedNote === k.note;
              const isLockedOut = scaleLock && !k.isInScale;

              return (
                <button
                  key={k.note}
                  onClick={() => handleAudition(k.note)}
                  disabled={isLockedOut}
                  className={`flex-1 min-w-[28px] sm:min-w-[34px] rounded-b-lg border-2 border-black flex flex-col justify-end items-center pb-1 transition-all active:translate-y-1 shadow-[0_3px_0_0_#000] relative ${
                    isLockedOut
                      ? 'bg-zinc-950 text-zinc-700 opacity-20 cursor-not-allowed shadow-none'
                      : isPressed
                        ? 'bg-yellow-400 text-black scale-95 shadow-[0_0_12px_rgba(250,204,21,1)]'
                        : k.isRoot
                          ? 'bg-gradient-to-t from-amber-500 to-yellow-300 text-black font-black'
                          : k.isBlack
                            ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200'
                            : 'bg-zinc-100 hover:bg-white text-zinc-900'
                  }`}
                  title={isLockedOut ? `${k.note} (Out of Scale)` : `Play ${k.note}`}
                >
                  {k.isRoot && (
                    <span className="w-1.5 h-1.5 rounded-full bg-black mb-1" />
                  )}
                  <span className="font-mono font-bold text-[9px] sm:text-[10px] leading-none pointer-events-none">
                    {k.name}
                  </span>
                </button>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
}
