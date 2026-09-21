import { useState, useRef, useEffect, useCallback } from 'react';
import { FaTrash, FaVolumeUp, FaVolumeMute, FaPlus, FaHeadphones } from 'react-icons/fa';
import { audioEngine } from './AudioEngine';

const TOTAL_TIMELINE_SECONDS = 30;

export default function FLMobileArranger({
  tracks,
  setTracks,
  activeTrackId,
  setActiveTrackId,
  playheadTime = 0,
  setPlayheadTime,
  onOpenTrackEditor,
  onAddTrack,
  zoom = 1,
  setZoom = () => {}
}) {
  const timelineRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [isScrubbing, setIsScrubbing] = useState(false);

  // Velocity tracking refs
  const lastPointerXRef = useRef(0);
  const lastPointerTimeRef = useRef(0);
  const scrubVelocityRef = useRef(0);

  // Helper: Convert clientX to timeline seconds based on current zoom and timeline bounding rect
  const getSecondsFromClientX = useCallback((clientX) => {
    if (!timelineRef.current) return 0;
    const rect = timelineRef.current.getBoundingClientRect();
    const xPos = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const ratio = Math.max(0, Math.min(1, xPos / rect.width));
    return Math.max(0, Math.min(TOTAL_TIMELINE_SECONDS, Math.round((ratio * TOTAL_TIMELINE_SECONDS) * 1000) / 1000));
  }, []);

  // Handle Playhead Scrubbing with Velocity
  const handlePointerDown = (e) => {
    if (e.button !== 0) return;
    setIsScrubbing(true);
    lastPointerXRef.current = e.clientX;
    lastPointerTimeRef.current = performance.now();
    scrubVelocityRef.current = 1.0;

    const newTime = getSecondsFromClientX(e.clientX);
    setPlayheadTime(newTime);
    audioEngine.seek(newTime);
    audioEngine.scrubTo(newTime, 1.0, tracks);
  };

  useEffect(() => {
    if (!isScrubbing) return;

    const handlePointerMove = (e) => {
      const now = performance.now();
      const dt = Math.max(0.001, (now - lastPointerTimeRef.current) / 1000);
      const dx = e.clientX - lastPointerXRef.current;
      
      // Calculate normalized mouse velocity in timeline units per second
      if (timelineRef.current) {
        const rect = timelineRef.current.getBoundingClientRect();
        const normalizedVelocity = ((dx / rect.width) * TOTAL_TIMELINE_SECONDS) / dt;
        scrubVelocityRef.current = normalizedVelocity;
      }

      lastPointerXRef.current = e.clientX;
      lastPointerTimeRef.current = now;

      const newTime = getSecondsFromClientX(e.clientX);
      setPlayheadTime(newTime);
      audioEngine.seek(newTime);
      audioEngine.scrubTo(newTime, scrubVelocityRef.current, tracks);
    };

    const handlePointerUp = () => {
      setIsScrubbing(false);
      audioEngine.stopScrubbing();
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isScrubbing, getSecondsFromClientX, setPlayheadTime, tracks]);

  // Handle Ctrl + Wheel Zoom (Adobe Audition Style)
  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.25 : -0.25;
      setZoom(prev => Math.max(1, Math.min(5, Math.round((prev + delta) * 100) / 100)));
    }
  };

  const toggleMute = (trackId, e) => {
    if (e) e.stopPropagation();
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, muted: !t.muted } : t));
  };

  const removeClip = (trackId, clipId, e) => {
    if (e) e.stopPropagation();
    setTracks(prev => prev.map(t => {
      if (t.id === trackId) {
        return { ...t, clips: t.clips.filter(c => c.id !== clipId) };
      }
      return t;
    }));
  };

  const handleClipAudition = (clip, e) => {
    if (e) e.stopPropagation();
    if (clip.url) {
      const a = new Audio(clip.url);
      a.currentTime = 0;
      a.play().catch(console.warn);
    } else if (clip.notes && clip.notes.length > 0) {
      audioEngine.playNote(clip.instrument || 'pluck', clip.notes[0].note, '4n');
    } else {
      audioEngine.previewSample(clip.sampleId, clip.name);
    }
  };

  // Generate dynamic ruler time intervals based on zoom
  const rulerInterval = zoom >= 4 ? 0.5 : zoom >= 2 ? 1.0 : 5.0;
  const timeLabels = [];
  for (let s = 0; s <= TOTAL_TIMELINE_SECONDS; s += rulerInterval) {
    timeLabels.push(s);
  }

  const subTickCount = Math.floor(TOTAL_TIMELINE_SECONDS * (zoom >= 4 ? 10 : zoom >= 2 ? 4 : 1));

  return (
    <div 
      onWheel={handleWheel}
      className="flex-1 flex flex-col h-full bg-zinc-950 select-none overflow-hidden relative"
    >
      {/* Unified Multi-Track Arranger & Scrubber Viewport */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-x-auto overflow-y-auto bg-zinc-950 relative"
      >
        <div 
          className="flex relative min-h-full" 
          style={{ width: `${Math.max(100, zoom * 100)}%`, minWidth: '100%' }}
        >
          {/* Left Column: Sticky Track Channel Headers */}
          <div className="w-40 sm:w-48 shrink-0 sticky left-0 z-30 bg-zinc-900 border-r-2 border-zinc-800 shadow-xl flex flex-col">
            
            {/* Top Ruler Header Spacer */}
            <div className="h-9 border-b-2 border-zinc-800 px-2 sm:px-3 flex items-center justify-between shrink-0 bg-zinc-900">
              <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest flex items-center gap-1">
                <span>🎛️</span> <span>Tracks</span>
              </span>
              <span className="text-[9px] text-zinc-400 font-mono font-bold">{Math.round(zoom * 100)}%</span>
            </div>

            {/* Track Channel Headers */}
            {tracks.map((track) => {
              const isSelected = activeTrackId === track.id;
              const isRefTrack = Boolean(track.isReference);

              return (
                <div
                  key={track.id}
                  onClick={() => {
                    if (!isRefTrack) {
                      setActiveTrackId(track.id);
                      onOpenTrackEditor?.(track);
                    }
                  }}
                  className={`h-16 sm:h-18 border-b-2 border-zinc-800 p-2 flex flex-col justify-between shrink-0 transition-colors cursor-pointer ${
                    isRefTrack
                      ? 'bg-amber-950/90 hover:bg-amber-900/90 border-r-amber-500/50'
                      : isSelected
                        ? 'bg-zinc-800 hover:bg-zinc-750 border-r-orange-500'
                        : 'bg-zinc-900/95 hover:bg-zinc-850'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className={`font-black text-xs truncate flex items-center gap-1 ${
                      isRefTrack ? 'text-amber-300' : 'text-zinc-100'
                    }`}>
                      {track.name}
                    </span>
                    {isRefTrack ? (
                      <span className="text-[8px] bg-amber-500/30 text-amber-300 border border-amber-500/50 px-1 py-0.5 rounded font-black uppercase shrink-0">
                        REF
                      </span>
                    ) : isSelected && (
                      <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping shrink-0" />
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-1">
                    <button
                      onClick={(e) => toggleMute(track.id, e)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-black transition-colors ${
                        track.muted 
                          ? 'bg-red-500/20 text-red-500' 
                          : isRefTrack 
                            ? 'bg-amber-500 text-black font-black' 
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                      title={track.muted ? "Unmute track" : "Mute track"}
                    >
                      {track.muted ? <FaVolumeMute size={10} /> : <FaVolumeUp size={10} />}
                    </button>

                    {isRefTrack ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (track.clips?.[0]?.url) {
                            const a = new Audio(track.clips[0].url);
                            a.currentTime = 0;
                            a.play().catch(console.warn);
                          }
                        }}
                        className="text-[9px] font-black text-amber-300 hover:text-white bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/40 px-2 py-0.5 rounded flex items-center gap-1 transition-all"
                        title="Audition target song preview"
                      >
                        <FaHeadphones size={9} />
                        <span>Listen</span>
                      </button>
                    ) : (
                      <>
                        <span className="text-[9px] font-bold text-zinc-500 uppercase">
                          {track.clips.length} {track.clips.length === 1 ? 'clip' : 'clips'}
                        </span>

                        <span className="text-[9px] font-black text-orange-400/80 bg-black/40 px-1.5 py-0.5 rounded">
                          Edit ➔
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Empty space filler in Left Column */}
            <div className="flex-1 bg-zinc-900/90 min-h-[40px]" />
          </div>

          {/* Right Column: Unified Timeline Canvas (Ruler + All Track Lanes + Single Continuous Playhead) */}
          <div
            ref={timelineRef}
            onPointerDown={handlePointerDown}
            className="flex-1 relative flex flex-col bg-zinc-950 min-w-0"
          >
            {/* 1. Top Ruler Scrubber Row */}
            <div 
              className="h-9 border-b-2 border-zinc-800 bg-zinc-900/95 relative cursor-ew-resize hover:bg-zinc-850 transition-colors shrink-0 overflow-hidden select-none"
              title="Click or drag playhead to scrub audio with proportional velocity"
            >
              {/* Dynamic Time Markers */}
              {timeLabels.map(sec => (
                <div
                  key={sec}
                  className="absolute top-1 text-[9px] sm:text-[10px] text-zinc-400 font-mono font-bold pointer-events-none select-none"
                  style={{ left: `${(sec / TOTAL_TIMELINE_SECONDS) * 100}%`, transform: 'translateX(-50%)' }}
                >
                  {zoom >= 4 ? `00:${sec.toFixed(1).padStart(4, '0')}` : `00:${Math.floor(sec).toString().padStart(2, '0')}`}
                </div>
              ))}

              {/* Dynamic Ruler Sub-Ticks */}
              {Array.from({ length: subTickCount + 1 }).map((_, i) => {
                const isMajor = i % (zoom >= 4 ? 5 : zoom >= 2 ? 4 : 5) === 0;
                return (
                  <div
                    key={i}
                    className={`absolute bottom-0 w-[1px] ${isMajor ? 'h-3 bg-zinc-400' : 'h-1.5 bg-zinc-700'} pointer-events-none`}
                    style={{ left: `${(i / subTickCount) * 100}%` }}
                  />
                );
              })}
            </div>

            {/* 2. Track Lanes Canvas */}
            {tracks.map((track) => {
              const isSelected = activeTrackId === track.id;
              const isRefTrack = Boolean(track.isReference);

              return (
                <div
                  key={track.id}
                  onClick={() => {
                    if (!isRefTrack) {
                      setActiveTrackId(track.id);
                      onOpenTrackEditor?.(track);
                    }
                  }}
                  className={`h-16 sm:h-18 border-b-2 border-zinc-800/80 relative cursor-crosshair transition-colors shrink-0 overflow-hidden ${
                    isRefTrack
                      ? 'bg-amber-950/20 hover:bg-amber-950/30'
                      : isSelected
                        ? 'bg-zinc-900/90 hover:bg-zinc-900'
                        : 'bg-black/40 hover:bg-zinc-900/30'
                  }`}
                >
                  {/* 5-second vertical grid lines */}
                  <div className="absolute inset-0 opacity-15 bg-[linear-gradient(90deg,_#ffffff_1px,_transparent_1px)] bg-[length:16.66%_100%] pointer-events-none" />

                  {/* Render Placed Clips */}
                  {track.clips.map((clip) => {
                    const clipDuration = clip.duration || 1;
                    const isShort = clipDuration < 1.5;

                    // Dynamic waveform resolution scaling based on zoom
                    const waveformBarCount = Math.max(12, Math.floor((clipDuration * 8) * zoom));

                    return (
                      <div
                        key={clip.id}
                        onClick={(e) => handleClipAudition(clip, e)}
                        className={`absolute top-1 bottom-1 rounded-lg border-2 border-black shadow-[0_2px_0_0_#000] flex flex-col justify-between p-1 group hover:scale-[1.01] transition-all overflow-hidden cursor-pointer ${
                          clip.color || 'bg-purple-500'
                        }`}
                        style={{
                          left: `${(clip.startAt / TOTAL_TIMELINE_SECONDS) * 100}%`,
                          width: `${(clipDuration / TOTAL_TIMELINE_SECONDS) * 100}%`,
                          minWidth: '24px'
                        }}
                        title={`${clip.name} (${clipDuration}s) - Click to audition`}
                      >
                        <div className="flex items-center justify-between w-full pointer-events-none">
                          <span className={`font-black uppercase truncate leading-tight drop-shadow-xs ${
                            isRefTrack ? 'text-black font-black text-[10px]' : isShort ? 'text-[8px] text-black' : 'text-[10px] text-black'
                          }`}>
                            {clip.name}
                          </span>

                          {!isRefTrack && (
                            <button
                              onClick={(e) => removeClip(track.id, clip.id, e)}
                              className="pointer-events-auto opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-500 text-white rounded p-0.5 hover:scale-110 transition-all text-[8px] shadow-sm ml-0.5 shrink-0"
                              title="Delete clip"
                            >
                              <FaTrash size={8} />
                            </button>
                          )}
                        </div>

                        {/* Adobe Audition Scaled Waveform Rendering */}
                        <div className="h-3 w-full opacity-50 flex items-end gap-0.5 pointer-events-none overflow-hidden">
                          {Array.from({ length: waveformBarCount }).map((_, i) => {
                            const normalized = i / waveformBarCount;
                            const heightPct = 20 + Math.abs(Math.sin(normalized * Math.PI * 6 + (i % 3)) * 60) + ((i * 19) % 20);
                            return (
                              <div
                                key={i}
                                className="flex-1 bg-black rounded-t-xs"
                                style={{ height: `${Math.min(100, heightPct)}%` }}
                              />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Empty lane space filler */}
            <div className="flex-1 bg-zinc-950 min-h-[40px] relative">
              <div className="absolute inset-0 opacity-15 bg-[linear-gradient(90deg,_#ffffff_1px,_transparent_1px)] bg-[length:16.66%_100%] pointer-events-none" />
            </div>

            {/* 3. Single Continuous Full-Height Playhead Needle spanning Ruler and all Tracks (0.00px offset guaranteed!) */}
            <div
              className="absolute top-0 bottom-0 pointer-events-none z-40 flex flex-col items-center"
              style={{
                left: `${(playheadTime / TOTAL_TIMELINE_SECONDS) * 100}%`,
                transform: 'translateX(-50%)'
              }}
            >
              {/* Top Scrubber Marker Triangle */}
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,1)] shrink-0" />
              {/* Continuous Yellow Playhead Needle Line */}
              <div className="w-[2px] flex-1 bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,1)]" />
            </div>

          </div>
        </div>

        {/* Add Track Button */}
        {onAddTrack && (
          <div className="p-3 bg-zinc-950 sticky left-0 max-w-md">
            <button
              onClick={onAddTrack}
              className="w-full py-2.5 rounded-xl border-2 border-dashed border-zinc-800 hover:border-orange-500 hover:text-orange-400 text-zinc-500 font-black text-xs flex items-center justify-center gap-2 transition-colors bg-zinc-900/40 hover:bg-zinc-900/80"
            >
              <FaPlus size={10} />
              <span>Add Instrument / Vocal Track</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
