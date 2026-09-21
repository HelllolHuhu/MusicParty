import { FaTrash, FaVolumeUp, FaVolumeMute, FaPlus } from 'react-icons/fa';
import { audioEngine } from './AudioEngine';
import { DRUM_SOUND_OPTIONS } from './presetData';

export default function FLMobileDrumRack({
  steps,
  setSteps,
  channels,
  setChannels,
  onStampToPlaylist,
  isPlaying,
  currentStep
}) {
  const toggleStep = (channelId, stepIndex) => {
    setSteps(prev => {
      const channelSteps = prev[channelId] || Array(16).fill(false);
      const newChannelSteps = [...channelSteps];
      newChannelSteps[stepIndex] = !newChannelSteps[stepIndex];

      // Instant sound audition when toggled ON
      if (newChannelSteps[stepIndex]) {
        const chan = channels.find(c => c.id === channelId);
        audioEngine.playDrum(chan?.soundKey || channelId);
      }

      return {
        ...prev,
        [channelId]: newChannelSteps
      };
    });
  };

  const handleSoundChange = (channelId, newSoundKey) => {
    setChannels(prev => prev.map(c => c.id === channelId ? { ...c, soundKey: newSoundKey } : c));
    audioEngine.playDrum(newSoundKey);
  };

  const handleMute = (channelId) => {
    setChannels(prev => prev.map(c => c.id === channelId ? { ...c, muted: !c.muted } : c));
  };

  const handleSolo = (channelId) => {
    setChannels(prev => prev.map(c => c.id === channelId ? { ...c, solo: !c.solo } : { ...c, solo: false }));
  };

  const handleClear = () => {
    const empty = {};
    channels.forEach(c => {
      empty[c.id] = Array(16).fill(false);
    });
    setSteps(empty);
  };

  const handleStamp = () => {
    if (onStampToPlaylist) {
      onStampToPlaylist({
        type: 'drum',
        name: '🥁 Drum Beat',
        steps,
        channels,
        duration: 4,
        color: 'bg-gradient-to-r from-red-500 to-orange-500'
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 p-2 sm:p-3 select-none overflow-hidden">
      
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between gap-2 bg-zinc-900 border-2 border-zinc-800 px-3 py-2 rounded-xl mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase text-orange-400 flex items-center gap-1.5">
            <span>🥁</span> <span>Drum Machine Rack</span>
          </span>
          <span className="text-[10px] text-zinc-500 font-bold hidden sm:inline">(16 Steps • 1 Bar)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-300 hover:text-red-400 border border-zinc-700 text-xs font-bold flex items-center gap-1 transition-all"
            title="Clear all steps"
          >
            <FaTrash size={10} />
            <span className="hidden sm:inline">Clear</span>
          </button>

          <button
            onClick={handleStamp}
            className="btn-chunky btn-chunky-green text-xs font-black px-3 py-1.5 flex items-center gap-1 shadow-[0_2px_0_0_#000]"
            title="Stamp this drum rhythm as a 4-second clip onto Track 1"
          >
            <span>📥 Stamp to Playlist</span>
          </button>
        </div>
      </div>

      {/* Drum Rack Channel Rows */}
      <div className="flex-1 bg-zinc-900 border-2 border-zinc-800 rounded-xl p-2 sm:p-3 overflow-auto shadow-inner flex flex-col gap-1.5 min-w-0">
        
        {/* Step Indicator Header */}
        <div className="flex items-center gap-1 ml-[15rem] sm:ml-[17rem] min-w-[500px]">
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

        {/* Channels */}
        {channels.map((chan) => {
          const chanSteps = steps[chan.id] || Array(16).fill(false);
          const hasActiveSolo = channels.some(c => c.solo);
          const isMuted = chan.muted || (hasActiveSolo && !chan.solo);

          return (
            <div
              key={chan.id}
              className={`flex items-center gap-1.5 p-1 sm:p-1.5 rounded-lg border-2 border-black transition-all ${
                isMuted ? 'bg-zinc-950/60 opacity-40' : 'bg-zinc-800/80 shadow-[0_2px_0_0_#000]'
              }`}
            >
              {/* Channel Controls (Audition, Mute/Solo, Sound Picker) */}
              <div className="w-[14.5rem] sm:w-[16.5rem] shrink-0 flex items-center gap-1.5">
                
                {/* Mute */}
                <button
                  onClick={() => handleMute(chan.id)}
                  className={`w-5 h-5 rounded font-black text-[9px] flex items-center justify-center transition-all ${
                    chan.muted ? 'bg-red-500 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                  }`}
                  title="Mute"
                >
                  M
                </button>

                {/* Solo */}
                <button
                  onClick={() => handleSolo(chan.id)}
                  className={`w-5 h-5 rounded font-black text-[9px] flex items-center justify-center transition-all ${
                    chan.solo ? 'bg-yellow-400 text-black font-black' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                  }`}
                  title="Solo"
                >
                  S
                </button>

                {/* Sound Audition Button */}
                <button
                  onClick={() => audioEngine.playDrum(chan.soundKey)}
                  className={`w-24 sm:w-28 px-1.5 py-0.5 rounded border border-black font-black text-[11px] text-left truncate text-white shadow-xs flex items-center justify-between ${chan.color}`}
                  title="Click to preview sound"
                >
                  <span className="truncate">{chan.name}</span>
                  <span className="text-[9px] opacity-75">🔊</span>
                </button>

                {/* Sound Dropdown */}
                <select
                  value={chan.soundKey}
                  onChange={(e) => handleSoundChange(chan.id, e.target.value)}
                  className="bg-black/80 text-[9px] sm:text-[10px] text-zinc-300 font-bold rounded px-1 py-0.5 border border-zinc-700 outline-none w-18 sm:w-20 cursor-pointer"
                >
                  {DRUM_SOUND_OPTIONS.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
              </div>

              {/* 16 Step Pads */}
              <div className="flex-1 flex items-center gap-1 min-w-[500px]">
                {Array.from({ length: 16 }).map((_, stepIdx) => {
                  const isActive = Boolean(chanSteps[stepIdx]);
                  const isCurrentPlayhead = isPlaying && currentStep === stepIdx;
                  const beatGroup = Math.floor(stepIdx / 4) % 2 === 0;

                  return (
                    <button
                      key={stepIdx}
                      onClick={() => toggleStep(chan.id, stepIdx)}
                      className={`flex-1 h-7 sm:h-8 rounded border-2 border-black transition-all transform active:scale-95 flex items-center justify-center relative ${
                        isActive
                          ? `${chan.color} shadow-[0_2px_0_0_#000] scale-[1.02]`
                          : beatGroup
                            ? 'bg-zinc-700/80 hover:bg-zinc-600/90'
                            : 'bg-zinc-800/90 hover:bg-zinc-700/90'
                      } ${
                        isCurrentPlayhead 
                          ? 'ring-2 ring-yellow-400 scale-105 z-10 shadow-[0_0_10px_rgba(250,204,21,0.8)]' 
                          : ''
                      }`}
                      title={`Step ${stepIdx + 1}`}
                    >
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                      )}

                      {isCurrentPlayhead && (
                        <div className="absolute inset-0 bg-yellow-400/20 rounded pointer-events-none animate-pulse" />
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
  );
}
