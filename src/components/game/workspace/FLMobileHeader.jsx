import { FaPlay, FaPause, FaStop, FaMicrophone, FaSearchPlus, FaSearchMinus } from 'react-icons/fa';
import { useLanguage } from '../../../context/LanguageContext';
import { formatTimeHMSM } from './AudioEngine';

export default function FLMobileHeader({
  activeTab,
  setActiveTab,
  isPlaying,
  onTogglePlay,
  onStop,
  isRecording,
  onToggleRecord,
  bpm,
  setBpm,
  onTapTempo,
  playheadTime = 0,
  timeRemaining = 120,
  isReady = false,
  readyStatus,
  zoom = 1,
  setZoom = () => {},
  onFinish
}) {
  const { t } = useLanguage();

  const handleZoomChange = (delta) => {
    setZoom(prev => Math.max(1, Math.min(5, Math.round((prev + delta) * 10) / 10)));
  };

  return (
    <header className="h-16 bg-zinc-900 border-b-2 border-black flex items-center justify-between px-3 sm:px-5 shrink-0 gap-2 select-none z-30 shadow-md">
      
      {/* Left: Brand & Transport Controls */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
        
        {/* FL Studio Mobile Badge */}
        <div className="flex items-center gap-1.5 mr-1 hidden sm:flex">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 border-2 border-black shadow-[0_2px_0_0_#000] flex items-center justify-center font-black text-black text-xs">
            FL
          </div>
          <span className="font-black text-xs uppercase tracking-wider text-orange-400 hidden md:inline">
            Studio
          </span>
        </div>

        {/* Play / Pause */}
        <button
          onClick={onTogglePlay}
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl border-2 border-black font-black flex items-center justify-center text-base shadow-[0_3px_0_0_#000] active:translate-y-0.5 active:shadow-[0_1px_0_0_#000] transition-all ${
            isPlaying
              ? 'bg-amber-400 hover:bg-amber-300 text-black animate-pulse shadow-[0_0_12px_rgba(251,191,36,0.6)]'
              : 'bg-emerald-500 hover:bg-emerald-400 text-white'
          }`}
          title={isPlaying ? "Pause (Space)" : "Play (Space)"}
        >
          {isPlaying ? <FaPause size={14} /> : <FaPlay size={14} className="ml-0.5" />}
        </button>

        {/* Stop / Rewind to 0 */}
        <button
          onClick={onStop}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 border-black bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center text-xs shadow-[0_2px_0_0_#000] active:translate-y-0.5 transition-all"
          title="Stop & Reset to 00:00:00.000"
        >
          <FaStop size={12} />
        </button>

        {/* Vocal Mic Record Button */}
        <button
          onClick={onToggleRecord}
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 border-black flex items-center justify-center text-xs shadow-[0_2px_0_0_#000] active:translate-y-0.5 transition-all ${
            isRecording
              ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]'
              : 'bg-zinc-800 hover:bg-red-500/30 text-red-400 hover:text-white'
          }`}
          title={isRecording ? "Stop Recording" : "Record Vocal Take"}
        >
          <FaMicrophone size={13} />
        </button>

        {/* BPM & Tap */}
        <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded-xl border border-zinc-800">
          <span className="text-[10px] font-black uppercase text-orange-400 hidden sm:inline">BPM</span>
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
            className="text-[9px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-black px-1.5 py-0.5 rounded border border-zinc-700 active:scale-95"
            title="Tap Tempo"
          >
            TAP
          </button>
        </div>

        {/* Precise Adobe Audition Time Position (HH:MM:SS.mmm) */}
        <div className="bg-black/70 px-2.5 py-1 rounded-xl border border-zinc-800 font-mono font-bold text-[11px] sm:text-xs text-yellow-300 hidden md:flex items-center gap-1 shadow-inner whitespace-nowrap">
          <span>⏱ {formatTimeHMSM(playheadTime)}</span>
          <span className="text-zinc-500">/</span>
          <span className="text-zinc-400">00:00:30.000</span>
        </div>

        {/* Zoom Slider Controller (Adobe Audition Style) */}
        {activeTab === 'arranger' && (
          <div className="hidden xl:flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => handleZoomChange(-0.5)}
              className="text-zinc-400 hover:text-white p-0.5"
              title="Zoom Out (Ctrl+Scroll Down)"
            >
              <FaSearchMinus size={10} />
            </button>
            <input
              type="range"
              min="1"
              max="5"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-16 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              title="Timeline Zoom"
            />
            <button
              onClick={() => handleZoomChange(0.5)}
              className="text-zinc-400 hover:text-white p-0.5"
              title="Zoom In (Ctrl+Scroll Up)"
            >
              <FaSearchPlus size={10} />
            </button>
            <span className="font-mono text-[9px] font-black text-orange-400 min-w-[28px]">
              {Math.round(zoom * 100)}%
            </span>
          </div>
        )}

      </div>

      {/* Center: FL Mobile View Mode Switcher Tabs */}
      <div className="flex bg-zinc-950 p-1 rounded-2xl border-2 border-black gap-1 shadow-inner overflow-x-auto">
        {[
          { key: 'arranger', label: '🎛️ Playlist', short: 'Playlist' },
          { key: 'drums', label: '🥁 Drums', short: 'Drums' },
          { key: 'keys', label: '🎹 Keys', short: 'Keys' },
          { key: 'vocal', label: '🎤 Vocal', short: 'Vocal' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-2.5 sm:px-3.5 py-1 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-black shadow-[0_2px_0_0_#000] scale-105 font-black'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.short}</span>
          </button>
        ))}
      </div>

      {/* Right: Round Timer & Finish Button */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Game Phase Countdown */}
        <div className="font-mono text-xs sm:text-sm font-black text-pink-500 bg-black/60 px-2.5 sm:px-3 py-1 rounded-xl border border-zinc-800 whitespace-nowrap">
          {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
        </div>

        {/* Finish Track Button */}
        <button
          onClick={onFinish}
          className={`btn-chunky font-black text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            isReady
              ? 'bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.6)] animate-pulse'
              : 'btn-chunky-green'
          }`}
        >
          <span>{isReady ? '✓ Ready!' : t('game.finishTrack')}</span>
          {isReady && readyStatus && (
            <span className="bg-black/30 px-1.5 py-0.5 rounded font-mono text-[10px] hidden sm:inline">
              ({readyStatus.ready}/{readyStatus.total})
            </span>
          )}
        </button>
      </div>

    </header>
  );
}
