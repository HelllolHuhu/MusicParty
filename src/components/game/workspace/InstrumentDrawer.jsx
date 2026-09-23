import { FaTimes, FaStamp } from 'react-icons/fa';
import FLMobileDrumRack from './FLMobileDrumRack';
import FLMobileKeyboard from './FLMobileKeyboard';

export default function InstrumentDrawer({
  activeDrawer = null, // 'drums' | 'keys' | null
  onClose = () => {},
  // Drum rack props
  drumSteps,
  setDrumSteps,
  drumChannels,
  setDrumChannels,
  onStampDrums,
  // Keyboard props
  pianoNotes,
  setPianoNotes,
  setNotes,
  pianoInstrument,
  setPianoInstrument,
  rootNote,
  setRootNote,
  scaleKey,
  setScaleKey,
  scaleLock,
  setScaleLock,
  onStampMelody,
  // Transport sync
  isPlaying,
  currentStep
}) {
  if (!activeDrawer) return null;

  return (
    <div className="h-80 sm:h-96 bg-zinc-900 border-t-3 border-black flex flex-col shrink-0 z-30 shadow-[0_-8px_20px_rgba(0,0,0,0.7)] animate-in slide-in-from-bottom-4 duration-200 select-none">
      
      {/* Drawer Control Header */}
      <div className="h-10 bg-zinc-950 px-4 flex items-center justify-between border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wider text-pink-500">
            <span>{activeDrawer === 'drums' ? '🥁 16-Step Drum Machine' : '🎹 Touch Keyboard & Piano Roll'}</span>
          </div>
          <span className="text-[10px] text-zinc-400 font-bold hidden sm:inline">
            Create custom patterns and stamp directly into your project!
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-7 h-7 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center text-xs transition-colors"
          title="Close Instrument Drawer"
        >
          <FaTimes size={12} />
        </button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 min-h-0 relative overflow-hidden bg-zinc-950">
        {activeDrawer === 'drums' && (
          <FLMobileDrumRack
            steps={drumSteps}
            setSteps={setDrumSteps}
            channels={drumChannels}
            setChannels={setDrumChannels}
            onStampToPlaylist={(pattern) => {
              onStampDrums(pattern);
            }}
            isPlaying={isPlaying}
            currentStep={currentStep}
          />
        )}

        {activeDrawer === 'keys' && (
          <FLMobileKeyboard
            notes={pianoNotes}
            setNotes={setPianoNotes || setNotes}
            instrument={pianoInstrument}
            setInstrument={setPianoInstrument}
            rootNote={rootNote}
            setRootNote={setRootNote}
            scaleKey={scaleKey}
            setScaleKey={setScaleKey}
            scaleLock={scaleLock}
            setScaleLock={setScaleLock}
            onStampToPlaylist={(melody) => {
              onStampMelody(melody);
            }}
            isPlaying={isPlaying}
            currentStep={currentStep}
          />
        )}
      </div>

    </div>
  );
}
