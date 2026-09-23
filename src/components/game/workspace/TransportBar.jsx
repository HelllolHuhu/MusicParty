import { FaPlay, FaPause, FaStop, FaMicrophone, FaSearchPlus, FaSearchMinus, FaBookOpen, FaCheck } from 'react-icons/fa';
import { useLanguage } from '../../../context/LanguageContext';

export default function TransportBar({
  isPlaying = false,
  onTogglePlay = () => {},
  onStop = () => {},
  onOpenVocalBooth = () => {},
  bpm = 130,
  setBpm = () => {},
  onTapTempo = () => {},
  playheadTime = 0,
  songDurationSeconds = 60,
  zoom = 1,
  setZoom = () => {},
  showLibrary = false,
  setShowLibrary = () => {},
  showLyrics = false,
  setShowLyrics = () => {},
  activeDrawer = null, // 'drums' | 'keys' | null
  setActiveDrawer = () => {},
  isReady = false,
  readyStatus = null,
  onFinish = () => {}
}) {
  const { t } = useLanguage();

  const formatTime = (secs) => {
    const totalSec = Math.max(0, Math.floor(secs));
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleZoomChange = (delta) => {
    setZoom(prev => Math.max(1, Math.min(5, Math.round((prev + delta) * 10) / 10)));
  };

  return (
    <header className="h-16 bg-zinc-900 border-b-2 border-black flex items-center justify-between px-3 sm:px-5 shrink-0 gap-2 select-none z-40 shadow-md">
      
      {/* 1. Left: Transport Playback Controls & BPM */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        
        {/* Play / Pause Button */}
        <button
          onClick={onTogglePlay}
          className={`w-11 h-11 rounded-2xl border-2 border-black font-black flex items-center justify-center text-base shadow-[0_3px_0_0_#000] active:translate-y-0.5 active:shadow-[0_1px_0_0_#000] transition-all ${
            isPlaying
              ? 'bg-amber-400 hover:bg-amber-300 text-black animate-pulse shadow-[0_0_12px_rgba(251,191,36,0.6)]'
              : 'bg-emerald-500 hover:bg-emerald-400 text-white'
          }`}
          title={isPlaying ? "Pause (Space)" : "Play (Space)"}
        >
          {isPlaying ? <FaPause size={15} /> : <FaPlay size={15} className="ml-0.5" />}
        </button>

        {/* Stop Button */}
        <button
          onClick={onStop}
          className="w-10 h-10 rounded-2xl border-2 border-black bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center text-xs shadow-[0_2px_0_0_#000] active:translate-y-0.5 transition-all"
          title="Stop & Reset to 0:00"
        >
          <FaStop size={13} />
        </button>

        {/* Record Vocal Button */}
        <button
          onClick={onOpenVocalBooth}
          className="w-10 h-10 rounded-2xl border-2 border-black bg-red-600/90 hover:bg-red-500 text-white flex items-center justify-center text-xs shadow-[0_2px_0_0_#000] active:translate-y-0.5 hover:scale-105 transition-all"
          title="Open Vocal Recording Booth"
        >
          <FaMicrophone size={14} />
        </button>

        {/* BPM & Tap Tempo */}
        <div className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1.5 rounded-2xl border border-zinc-800 shadow-inner">
          <span className="text-[10px] font-black uppercase text-pink-400 hidden sm:inline">BPM</span>
          <input
            type="number"
            min="60"
            max="200"
            value={bpm}
            onChange={(e) => setBpm(Math.max(60, Math.min(200, Number(e.target.value))))}
            className="w-10 sm:w-12 bg-transparent text-white font-mono font-black text-xs text-center outline-none"
          />
          <button
            onClick={onTapTempo}
            className="text-[9px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-black px-1.5 py-0.5 rounded-lg border border-zinc-700 active:scale-95 transition-all"
            title="Tap Tempo"
          >
            TAP
          </button>
        </div>

        {/* Current Time / Song Duration Display */}
        <div className="flex items-center gap-1 bg-black/80 px-3 py-1.5 rounded-2xl border border-zinc-800 font-mono text-xs font-black shadow-inner">
          <span className="text-yellow-400">⏱ {formatTime(playheadTime)}</span>
          <span className="text-zinc-500">/</span>
          <span className="text-zinc-400">{formatTime(songDurationSeconds)}</span>
        </div>

      </div>

      {/* 2. Center: Creative Tools & Toggles (Drums, Keys, Loops) */}
      <div className="flex items-center gap-1.5">
        
        {/* Toggle Drum Rack Drawer */}
        <button
          onClick={() => setActiveDrawer(prev => prev === 'drums' ? null : 'drums')}
          className={`py-2 px-3 rounded-xl border-2 border-black text-xs font-black flex items-center gap-1.5 shadow-[0_2px_0_0_#000] active:translate-y-0.5 transition-all ${
            activeDrawer === 'drums'
              ? 'bg-pink-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.5)]'
              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white'
          }`}
          title="Toggle 16-Step Drum Machine"
        >
          <span>🥁</span>
          <span className="hidden md:inline">Drum Machine</span>
        </button>

        {/* Toggle Piano Roll / Keyboard Drawer */}
        <button
          onClick={() => setActiveDrawer(prev => prev === 'keys' ? null : 'keys')}
          className={`py-2 px-3 rounded-xl border-2 border-black text-xs font-black flex items-center gap-1.5 shadow-[0_2px_0_0_#000] active:translate-y-0.5 transition-all ${
            activeDrawer === 'keys'
              ? 'bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]'
              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white'
          }`}
          title="Toggle Piano Roll & Keyboard"
        >
          <span>🎹</span>
          <span className="hidden md:inline">Piano Roll</span>
        </button>

        {/* Toggle Sound Library Sidebar */}
        <button
          onClick={() => setShowLibrary(prev => !prev)}
          className={`py-2 px-3 rounded-xl border-2 border-black text-xs font-black flex items-center gap-1.5 shadow-[0_2px_0_0_#000] active:translate-y-0.5 transition-all ${
            showLibrary
              ? 'bg-yellow-400 text-black shadow-[0_0_12px_rgba(250,204,21,0.5)]'
              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white'
          }`}
          title="Toggle Sound & Loop Library (Drag & Drop)"
        >
          <FaBookOpen size={11} />
          <span className="hidden sm:inline">Loops</span>
        </button>

        {/* Toggle Reference Lyrics Panel */}
        <button
          onClick={() => setShowLyrics(prev => !prev)}
          className={`py-2 px-3 rounded-xl border-2 border-black text-xs font-black flex items-center gap-1.5 shadow-[0_2px_0_0_#000] active:translate-y-0.5 transition-all ${
            showLyrics
              ? 'bg-pink-500 text-white shadow-[0_0_12px_rgba(236,72,153,0.5)]'
              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white'
          }`}
          title="Toggle Song Lyrics Panel"
        >
          <span>📜</span>
          <span className="hidden sm:inline">Lyrics</span>
        </button>

      </div>

      {/* 3. Right: Zoom & Submit / Finish */}
      <div className="flex items-center gap-2">
        
        {/* Zoom Controls (hidden on very small screens) */}
        <div className="hidden lg:flex items-center gap-1 bg-black/60 px-2 py-1 rounded-2xl border border-zinc-800">
          <button
            onClick={() => handleZoomChange(-0.2)}
            disabled={zoom <= 1}
            className="w-6 h-6 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-zinc-300 flex items-center justify-center text-xs"
            title="Zoom Out (Ctrl+Wheel)"
          >
            <FaSearchMinus size={9} />
          </button>
          <span className="text-[10px] font-mono font-bold text-zinc-400 w-8 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => handleZoomChange(0.2)}
            disabled={zoom >= 5}
            className="w-6 h-6 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-zinc-300 flex items-center justify-center text-xs"
            title="Zoom In (Ctrl+Wheel)"
          >
            <FaSearchPlus size={9} />
          </button>
        </div>

        {/* Finish / Ready Button */}
        <button
          onClick={onFinish}
          className={`btn-chunky py-2 px-3 sm:px-4 text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-[0_3px_0_0_#000] ${
            isReady
              ? 'btn-chunky-green animate-pulse'
              : 'btn-chunky-purple'
          }`}
          title="Submit your creation for presentation"
        >
          <FaCheck size={11} />
          <span>{isReady ? "Ready! ✓" : t('game.finishTrack') || "Finish Track"}</span>
          {readyStatus && (
            <span className="text-[10px] bg-black/50 px-1.5 py-0.5 rounded-full ml-1">
              {readyStatus.ready}/{readyStatus.total}
            </span>
          )}
        </button>

      </div>

    </header>
  );
}
