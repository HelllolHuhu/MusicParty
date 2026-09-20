import { useState, useMemo } from 'react';
import { FaTrash, FaMagic, FaMusic, FaCheck } from 'react-icons/fa';
import { audioEngine } from './AudioEngine';
import { NOTE_NAMES, SCALES, getScaleNotes } from './scaleUtils';
import { PIANO_INSTRUMENTS } from './presetData';

const STEPS_COUNT = 16; // 1 bar (16th notes)

export default function PianoRollTab({
  notes,
  setNotes,
  selectedInstrument,
  setSelectedInstrument,
  onStampToPlaylist,
  isPlaying,
  currentStep
}) {
  const [rootNote, setRootNote] = useState('C');
  const [scaleKey, setScaleKey] = useState('minor_pentatonic');
  const [scaleLockEnabled, setScaleLockEnabled] = useState(true);
  const [noteLength, setNoteLength] = useState(2); // 2 steps (8th note)

  const gridNotes = useMemo(() => {
    return getScaleNotes(rootNote, scaleKey, [3, 4]); // 2 octaves C3 to B4
  }, [rootNote, scaleKey]);

  const handleCellClick = (noteStr, stepIdx, isInScale) => {
    if (scaleLockEnabled && !isInScale) return;

    // Check if a note already starts at or covers this step
    const existingIndex = notes.findIndex(n => n.note === noteStr && stepIdx >= n.step && stepIdx < (n.step + n.length));

    if (existingIndex !== -1) {
      // Remove note
      setNotes(prev => prev.filter((_, i) => i !== existingIndex));
    } else {
      // Add note
      const newNote = {
        id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        note: noteStr,
        step: stepIdx,
        length: noteLength
      };
      setNotes(prev => [...prev, newNote]);
      audioEngine.playNote(selectedInstrument, noteStr, `${noteLength * 0.12}s`);
    }
  };

  const handleClearNotes = () => {
    setNotes([]);
  };

  const handleStampMelody = () => {
    if (onStampToPlaylist && notes.length > 0) {
      const instObj = PIANO_INSTRUMENTS.find(i => i.id === selectedInstrument) || PIANO_INSTRUMENTS[0];
      onStampToPlaylist({
        type: 'melody',
        name: `${instObj.name} Riff`,
        instrument: selectedInstrument,
        notes: notes,
        duration: 4, // 4-second loop block
        color: instObj.color
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 p-4 select-none overflow-y-auto">
      
      {/* Top Controls: Scale Lock, Root Key, Instrument Picker, Note Duration */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/90 border-2 border-zinc-800 p-3 rounded-2xl shadow-sm mb-4">
        
        {/* Instrument Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-pink-400">Instrument:</span>
          <div className="flex gap-1.5 overflow-x-auto py-0.5">
            {PIANO_INSTRUMENTS.map(inst => (
              <button
                key={inst.id}
                onClick={() => {
                  setSelectedInstrument(inst.id);
                  audioEngine.playNote(inst.id, 'C4', '4n');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black border-2 border-black flex items-center gap-1.5 transition-all ${
                  selectedInstrument === inst.id
                    ? `${inst.color} text-white shadow-[0_2px_0_0_#000] scale-105`
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                <span>{inst.icon}</span>
                <span>{inst.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Scale Lock & Key Assist */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScaleLockEnabled(prev => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black border-2 border-black flex items-center gap-1.5 transition-all ${
              scaleLockEnabled
                ? 'bg-emerald-500 text-white shadow-[0_2px_0_0_#000]'
                : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
            }`}
            title="Scale Lock prevents placing notes outside the musical scale"
          >
            <span>🔒 Scale Lock</span>
            <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded">{scaleLockEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Root Key */}
          <select
            value={rootNote}
            onChange={(e) => setRootNote(e.target.value)}
            className="bg-black/60 border-2 border-zinc-700 text-white text-xs font-bold rounded-xl px-2.5 py-1.5 outline-none cursor-pointer"
          >
            {NOTE_NAMES.map(n => (
              <option key={n} value={n}>Key: {n}</option>
            ))}
          </select>

          {/* Scale Type */}
          <select
            value={scaleKey}
            onChange={(e) => setScaleKey(e.target.value)}
            className="bg-black/60 border-2 border-zinc-700 text-white text-xs font-bold rounded-xl px-2.5 py-1.5 outline-none cursor-pointer max-w-[180px]"
          >
            {Object.entries(SCALES).map(([key, s]) => (
              <option key={key} value={key}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Clear & Stamp Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleClearNotes}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-red-500/20 text-zinc-300 hover:text-red-400 border border-zinc-700 font-bold text-xs flex items-center gap-1.5 transition-all"
            title="Clear all notes"
          >
            <FaTrash size={10} />
            <span>Clear</span>
          </button>

          <button
            onClick={handleStampMelody}
            disabled={notes.length === 0}
            className={`btn-chunky text-xs font-black px-4 py-2 flex items-center gap-1.5 shadow-[0_3px_0_0_#000] ${
              notes.length > 0 ? 'btn-chunky-green' : 'bg-zinc-800 text-zinc-600 opacity-50 cursor-not-allowed'
            }`}
            title="Stamp this melody/bassline onto the Arranger timeline"
          >
            <span>📥 Stamp to Arranger</span>
          </button>
        </div>

      </div>

      {/* Note Length Selector */}
      <div className="flex items-center justify-between px-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-400">Note Length:</span>
          {[
            { label: '1/16 (Short)', val: 1 },
            { label: '1/8 (Normal)', val: 2 },
            { label: '1/4 (Long)', val: 4 },
            { label: '1/2 (Full)', val: 8 },
          ].map(len => (
            <button
              key={len.val}
              onClick={() => setNoteLength(len.val)}
              className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${
                noteLength === len.val 
                  ? 'bg-pink-500 text-white border-black font-black' 
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
              }`}
            >
              {len.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-zinc-400 font-mono">
          {notes.length} {notes.length === 1 ? 'note' : 'notes'} placed
        </div>
      </div>

      {/* Piano Roll 2-Octave Matrix Grid */}
      <div className="flex-1 bg-zinc-900 border-2 border-zinc-800 rounded-2xl overflow-auto shadow-inner flex flex-col">
        
        {/* Step Numbers Top Header */}
        <div className="flex items-center bg-zinc-950 border-b border-zinc-800 sticky top-0 z-20">
          <div className="w-24 shrink-0 px-2 py-1 text-[10px] font-black uppercase text-zinc-500">
            Keys
          </div>
          <div className="flex-1 flex min-w-[600px]">
            {Array.from({ length: STEPS_COUNT }).map((_, stepIdx) => (
              <div 
                key={stepIdx} 
                className={`flex-1 text-center font-mono text-[10px] py-1 border-r border-zinc-800/60 ${
                  currentStep === stepIdx && isPlaying
                    ? 'text-yellow-400 font-black bg-yellow-400/20' 
                    : stepIdx % 4 === 0 
                      ? 'text-pink-400 font-bold bg-zinc-900' 
                      : 'text-zinc-600'
                }`}
              >
                {stepIdx + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Rows of Pitches (C3 to B4) */}
        <div className="flex flex-col">
          {gridNotes.map((gNote) => {
            const isScaleValid = gNote.isInScale || !scaleLockEnabled;
            const isRoot = gNote.isRoot;

            return (
              <div 
                key={gNote.note} 
                className={`flex items-center border-b border-zinc-800/40 h-7 ${
                  !isScaleValid ? 'opacity-30 bg-zinc-950/80' : gNote.isBlackKey ? 'bg-zinc-900/60' : 'bg-zinc-900/20'
                }`}
              >
                {/* Left Piano Key */}
                <button
                  onClick={() => audioEngine.playNote(selectedInstrument, gNote.note, '4n')}
                  disabled={!isScaleValid}
                  className={`w-24 shrink-0 h-full px-2 flex items-center justify-between border-r-2 border-black font-mono text-xs font-bold transition-colors ${
                    gNote.isBlackKey
                      ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                      : 'bg-zinc-200 text-zinc-900 hover:bg-white'
                  } ${
                    isRoot ? 'ring-2 ring-pink-500 font-black' : ''
                  }`}
                  title={`Play ${gNote.note} ${isRoot ? '(Root Key)' : ''}`}
                >
                  <span>{gNote.note}</span>
                  {isRoot && <span className="text-[9px] bg-pink-500 text-white px-1 rounded-sm">ROOT</span>}
                </button>

                {/* Step Division Cells */}
                <div className="flex-1 flex h-full relative min-w-[600px]">
                  {Array.from({ length: STEPS_COUNT }).map((_, stepIdx) => {
                    const isPlayheadHere = isPlaying && currentStep === stepIdx;
                    const beatBlock = Math.floor(stepIdx / 4) % 2 === 0;

                    return (
                      <div
                        key={stepIdx}
                        onClick={() => handleCellClick(gNote.note, stepIdx, gNote.isInScale)}
                        className={`flex-1 h-full border-r border-zinc-800/50 cursor-pointer transition-colors relative ${
                          beatBlock ? 'bg-black/10 hover:bg-pink-500/20' : 'bg-black/30 hover:bg-pink-500/20'
                        } ${
                          isPlayheadHere ? 'bg-yellow-400/10' : ''
                        }`}
                      />
                    );
                  })}

                  {/* Render Placed Note Blocks on this Row */}
                  {notes
                    .filter(n => n.note === gNote.note)
                    .map(n => {
                      const leftPercent = (n.step / STEPS_COUNT) * 100;
                      const widthPercent = (n.length / STEPS_COUNT) * 100;

                      return (
                        <div
                          key={n.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Delete note on click
                            setNotes(prev => prev.filter(x => x.id !== n.id));
                          }}
                          className="absolute top-0.5 bottom-0.5 rounded-md border-2 border-black bg-pink-500 hover:bg-red-500 shadow-[0_2px_0_0_#000] cursor-pointer z-10 flex items-center px-1 text-[9px] font-black text-white truncate transition-all animate-scale-in"
                          style={{
                            left: `${leftPercent}%`,
                            width: `${widthPercent}%`,
                            minWidth: '18px'
                          }}
                          title={`Note: ${n.note} (Click to remove)`}
                        >
                          {n.note}
                        </div>
                      );
                    })}
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* Floating Beginner Scale Hint */}
      <div className="mt-3 text-center text-xs font-bold text-zinc-400 flex items-center justify-center gap-2">
        <span>💡</span>
        <span><b>Scale Lock is ON:</b> Any note you click will automatically sound harmonic and catchy in <b>{rootNote} {SCALES[scaleKey]?.name}</b>!</span>
      </div>

    </div>
  );
}
