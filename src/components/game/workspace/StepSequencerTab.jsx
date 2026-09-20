import { useState } from 'react';
import { FaTrash, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { audioEngine } from './AudioEngine';
import { DRUM_SOUND_OPTIONS } from './presetData';

export default function StepSequencerTab({
  stepCount = 16,
  steps,
  setSteps,
  channels,
  setChannels,
  activePatternIndex,
  setActivePatternIndex,
  onStampToPlaylist,
  isPlaying,
  currentStep
}) {
  const toggleStep = (channelId, stepIndex) => {
    setSteps(prev => {
      const channelSteps = prev[channelId] || Array(stepCount).fill(false);
      const newChannelSteps = [...channelSteps];
      newChannelSteps[stepIndex] = !newChannelSteps[stepIndex];

      // Audition drum sound immediately on click
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

  const handleChannelSoundChange = (channelId, newSoundKey) => {
    setChannels(prev => prev.map(c => {
      if (c.id === channelId) {
        return { ...c, soundKey: newSoundKey };
      }
      return c;
    }));
    audioEngine.playDrum(newSoundKey);
  };

  const handleMuteToggle = (channelId) => {
    setChannels(prev => prev.map(c => {
      if (c.id === channelId) {
        return { ...c, muted: !c.muted };
      }
      return c;
    }));
  };

  const handleSoloToggle = (channelId) => {
    setChannels(prev => prev.map(c => {
      if (c.id === channelId) {
        return { ...c, solo: !c.solo };
      }
      return { ...c, solo: false };
    }));
  };

  const handleVolumeChange = (channelId, val) => {
    setChannels(prev => prev.map(c => {
      if (c.id === channelId) {
        return { ...c, volume: Number(val) };
      }
      return c;
    }));
  };

  const handleClearGrid = () => {
    const empty = {};
    channels.forEach(c => {
      empty[c.id] = Array(stepCount).fill(false);
    });
    setSteps(empty);
  };

  const handleStampPattern = () => {
    if (onStampToPlaylist) {
      onStampToPlaylist({
        type: 'drum',
        name: `Drums (Pat ${activePatternIndex})`,
        steps,
        channels,
        duration: 4,
        color: 'bg-gradient-to-r from-red-500 to-orange-500'
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 p-4 select-none overflow-y-auto">
      
      {/* Top Controls & Pattern Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/90 border-2 border-zinc-800 p-3 rounded-2xl shadow-sm mb-4">
        
        {/* Pattern switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-pink-400">Pattern:</span>
          {[1, 2, 3, 4].map(num => (
            <button
              key={num}
              onClick={() => setActivePatternIndex(num)}
              className={`px-3 py-1 rounded-xl text-xs font-black border-2 border-black transition-all ${
                activePatternIndex === num
                  ? 'bg-pink-500 text-white shadow-[0_2px_0_0_#000] scale-105'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
              }`}
            >
              Pat {num}
            </button>
          ))}
        </div>

        {/* Clear Grid & Stamp to Arranger */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleClearGrid}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-red-500/20 text-zinc-300 hover:text-red-400 border border-zinc-700 font-bold text-xs flex items-center gap-1.5 transition-all"
            title="Clear all drum steps on this pattern"
          >
            <FaTrash size={10} />
            <span>Clear Grid</span>
          </button>

          <button
            onClick={handleStampPattern}
            className="btn-chunky btn-chunky-green text-xs font-black px-4 py-2 flex items-center gap-1.5 shadow-[0_3px_0_0_#000]"
            title="Stamp this drum rhythm as a 4-second clip onto Track 1 in the Arranger timeline"
          >
            <span>📥 Stamp to Arranger</span>
          </button>
        </div>
      </div>

      {/* Channel Rack Grid */}
      <div className="flex-1 bg-zinc-900 border-2 border-zinc-800 rounded-2xl p-3 sm:p-4 overflow-x-auto shadow-inner flex flex-col justify-start gap-2.5">
        
        {/* Step Numbers Header */}
        <div className="flex items-center gap-2 ml-[19rem] min-w-[580px]">
          {Array.from({ length: stepCount }).map((_, i) => {
            const isFirstOfBeat = i % 4 === 0;
            const isCurrentPlayingStep = isPlaying && currentStep === i;

            return (
              <div 
                key={i} 
                className={`flex-1 text-center font-mono text-[10px] transition-transform ${
                  isCurrentPlayingStep
                    ? 'text-yellow-400 font-black scale-125' 
                    : isFirstOfBeat 
                      ? 'text-pink-400 font-black' 
                      : 'text-zinc-600 font-bold'
                }`}
              >
                {i + 1}
              </div>
            );
          })}
        </div>

        {/* Channels List */}
        {channels.map((chan) => {
          const chanSteps = steps[chan.id] || Array(stepCount).fill(false);
          const hasActiveSolo = channels.some(c => c.solo);
          const isChannelMuted = chan.muted || (hasActiveSolo && !chan.solo);

          return (
            <div 
              key={chan.id} 
              className={`flex items-center gap-2 p-2 rounded-xl border-2 border-black transition-all ${
                isChannelMuted ? 'bg-zinc-950/60 opacity-40' : 'bg-zinc-800/80 shadow-[0_2px_0_0_#000]'
              }`}
            >
              {/* Left Channel Controls (Mute, Solo, Sound Picker, Volume) */}
              <div className="w-[18rem] shrink-0 flex items-center gap-2">
                
                {/* Mute button */}
                <button
                  onClick={() => handleMuteToggle(chan.id)}
                  className={`w-6 h-6 rounded-md font-black text-[10px] flex items-center justify-center transition-all ${
                    chan.muted ? 'bg-red-500 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                  }`}
                  title={chan.muted ? "Unmute Channel" : "Mute Channel"}
                >
                  M
                </button>

                {/* Solo button */}
                <button
                  onClick={() => handleSoloToggle(chan.id)}
                  className={`w-6 h-6 rounded-md font-black text-[10px] flex items-center justify-center transition-all ${
                    chan.solo ? 'bg-yellow-400 text-black font-black' : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                  }`}
                  title={chan.solo ? "Unsolo Channel" : "Solo Channel"}
                >
                  S
                </button>

                {/* Sound Name & Audition Button */}
                <button
                  onClick={() => audioEngine.playDrum(chan.soundKey)}
                  className={`w-28 px-2 py-1 rounded-lg border border-black font-black text-xs text-left truncate text-white shadow-sm flex items-center justify-between ${chan.color}`}
                  title="Click to preview drum sound"
                >
                  <span className="truncate">{chan.name}</span>
                  <span className="text-[10px] opacity-75">🔊</span>
                </button>

                {/* Sound Selector Dropdown */}
                <select
                  value={chan.soundKey}
                  onChange={(e) => handleChannelSoundChange(chan.id, e.target.value)}
                  className="bg-black/80 text-[10px] text-zinc-300 font-bold rounded-md px-1.5 py-1 border border-zinc-700 outline-none w-20 cursor-pointer"
                >
                  {DRUM_SOUND_OPTIONS.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>

                {/* Volume slider */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={chan.volume}
                  onChange={(e) => handleVolumeChange(chan.id, e.target.value)}
                  className="w-12 accent-pink-500 h-1.5 cursor-pointer"
                  title={`Volume: ${chan.volume}%`}
                />
              </div>

              {/* 16-Step Pads Grid with 4-Beat Grouping Colors */}
              <div className="flex-1 flex items-center gap-1.5 min-w-[580px]">
                {Array.from({ length: stepCount }).map((_, stepIdx) => {
                  const isActive = Boolean(chanSteps[stepIdx]);
                  const isCurrentPlayhead = isPlaying && currentStep === stepIdx;
                  const beatGroup = Math.floor(stepIdx / 4) % 2 === 0;

                  return (
                    <button
                      key={stepIdx}
                      onClick={() => toggleStep(chan.id, stepIdx)}
                      className={`flex-1 h-9 rounded-lg border-2 border-black transition-all transform active:scale-95 flex items-center justify-center relative ${
                        isActive
                          ? `${chan.color} shadow-[0_2px_0_0_#000] scale-[1.02]`
                          : beatGroup
                            ? 'bg-zinc-700/80 hover:bg-zinc-600/90'
                            : 'bg-zinc-800/90 hover:bg-zinc-700/90'
                      } ${
                        isCurrentPlayhead 
                          ? 'ring-2 ring-yellow-400 scale-105 z-10 shadow-[0_0_12px_rgba(250,204,21,0.8)]' 
                          : ''
                      }`}
                      title={`Step ${stepIdx + 1} - ${isActive ? 'ON' : 'OFF'}`}
                    >
                      {/* Active indicator dot */}
                      {isActive && (
                        <div className="w-2 h-2 rounded-full bg-white shadow-xs" />
                      )}

                      {/* Playhead sweep line */}
                      {isCurrentPlayhead && (
                        <div className="absolute inset-0 bg-yellow-400/20 rounded-lg pointer-events-none animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>

            </div>
          );
        })}

      </div>

      {/* Beginner Hint */}
      <div className="mt-3 text-center text-xs font-bold text-zinc-400 flex items-center justify-center gap-2">
        <span>💡</span>
        <span>Click pads to make your drum rhythm. Hit <b>Play</b> to listen live in an infinite loop, then click <b>Stamp to Arranger</b>!</span>
      </div>

    </div>
  );
}
