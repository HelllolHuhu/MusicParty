import { useState, useRef, useEffect, useCallback } from 'react';
import { FaPlus } from 'react-icons/fa';
import { TrackHeader, TrackLane } from './TrackRow';
import { audioEngine } from './AudioEngine';

export default function TimelineArranger({
  tracks,
  setTracks,
  songDurationSeconds = 60,
  playheadTime = 0,
  setPlayheadTime,
  zoom = 1,
  setZoom,
  selectedClipId,
  setSelectedClipId,
  onOpenInstrument,
  onAddTrack
}) {
  const rulerRef = useRef(null);
  const lanesContainerRef = useRef(null);
  const headersScrollRef = useRef(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrollbarWidth, setScrollbarWidth] = useState(0);

  // Velocity tracking refs for scrubbing
  const lastPointerXRef = useRef(0);
  const lastPointerTimeRef = useRef(0);
  const scrubVelocityRef = useRef(0);

  // Measure vertical scrollbar width to keep ruler and lanes aligned 1:1
  useEffect(() => {
    const updateScrollbar = () => {
      if (lanesContainerRef.current) {
        const sw = lanesContainerRef.current.offsetWidth - lanesContainerRef.current.clientWidth;
        setScrollbarWidth(Math.max(0, sw));
      }
    };
    updateScrollbar();
    window.addEventListener('resize', updateScrollbar);
    return () => window.removeEventListener('resize', updateScrollbar);
  }, [tracks.length]);

  // Synchronize vertical scroll between left headers and right lanes
  const handleLanesScroll = (e) => {
    if (headersScrollRef.current) {
      headersScrollRef.current.scrollTop = e.target.scrollTop;
    }
  };

  const handleHeadersWheel = (e) => {
    if (lanesContainerRef.current) {
      lanesContainerRef.current.scrollTop += e.deltaY;
    }
  };

  // Convert clientX on ruler to timeline seconds
  const getSecondsFromClientX = useCallback((clientX) => {
    if (!rulerRef.current) return 0;
    const rect = rulerRef.current.getBoundingClientRect();
    const xPos = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const ratio = Math.max(0, Math.min(1, xPos / rect.width));
    return Math.max(0, Math.min(songDurationSeconds, Math.round((ratio * songDurationSeconds) * 100) / 100));
  }, [songDurationSeconds]);

  // Scrubbing on Ruler
  const handleRulerPointerDown = (e) => {
    if (e.button !== 0) return;
    setIsScrubbing(true);
    lastPointerXRef.current = e.clientX;
    lastPointerTimeRef.current = performance.now();
    scrubVelocityRef.current = 1.0;

    const newTime = getSecondsFromClientX(e.clientX);
    setPlayheadTime(newTime);
    audioEngine.seek(newTime, tracks);
    audioEngine.scrubTo(newTime, 1.0, tracks, songDurationSeconds);
  };

  useEffect(() => {
    if (!isScrubbing) return;

    const handlePointerMove = (e) => {
      const now = performance.now();
      const dt = Math.max(0.001, (now - lastPointerTimeRef.current) / 1000);
      const dx = e.clientX - lastPointerXRef.current;

      if (rulerRef.current) {
        const rect = rulerRef.current.getBoundingClientRect();
        const normalizedVelocity = ((dx / rect.width) * songDurationSeconds) / dt;
        scrubVelocityRef.current = normalizedVelocity;
      }

      lastPointerXRef.current = e.clientX;
      lastPointerTimeRef.current = now;

      const newTime = getSecondsFromClientX(e.clientX);
      setPlayheadTime(newTime);
      audioEngine.seek(newTime, tracks);
      audioEngine.scrubTo(newTime, scrubVelocityRef.current, tracks, songDurationSeconds);
    };

    const handlePointerUp = () => {
      setIsScrubbing(false);
      audioEngine.stopScrubbing();
      const finalTime = getSecondsFromClientX(lastPointerXRef.current);
      audioEngine.seek(finalTime, tracks);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isScrubbing, getSecondsFromClientX, setPlayheadTime, tracks, songDurationSeconds]);

  // Ctrl + Wheel Zoom
  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.25 : -0.25;
      setZoom?.(prev => Math.max(1, Math.min(5, Math.round((prev + delta) * 100) / 100)));
    }
  };

  // Track & Clip operations with Live tone update
  const handleUpdateTrack = (updatedTrack) => {
    setTracks(prev => {
      const next = prev.map(t => t.id === updatedTrack.id ? updatedTrack : t);
      audioEngine.syncTrackLive(updatedTrack, songDurationSeconds, true);
      return next;
    });
  };

  const handleDeleteTrack = (trackId) => {
    setTracks(prev => {
      const next = prev.filter(t => t.id !== trackId);
      audioEngine.syncTrackLive({ id: trackId, muted: true, clips: [] }, songDurationSeconds, true);
      return next;
    });
  };

  const handleDuplicateTrack = (trackId) => {
    setTracks(prev => {
      const src = prev.find(t => t.id === trackId);
      if (!src) return prev;
      const dup = {
        ...src,
        id: `t_${Date.now()}`,
        name: `${src.name} (Copy)`,
        clips: (src.clips || []).map(c => ({
          ...c,
          id: `clip_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`
        }))
      };
      const next = [...prev, dup];
      audioEngine.syncTrackLive(dup, songDurationSeconds, true);
      return next;
    });
  };

  const handleAddClipToTrack = (trackId, newClip) => {
    setTracks(prev => {
      const next = prev.map(t => {
        if (t.id === trackId) {
          const updatedClips = [...(t.clips || []), newClip];
          const updatedTrack = { ...t, clips: updatedClips };
          audioEngine.syncTrackLive(updatedTrack, songDurationSeconds, true);
          return updatedTrack;
        }
        return t;
      });
      return next;
    });
  };

  const handleUpdateClip = (trackId, updatedClip) => {
    setTracks(prev => {
      const next = prev.map(t => {
        if (t.id === trackId) {
          const updatedClips = (t.clips || []).map(c => c.id === updatedClip.id ? updatedClip : c);
          const updatedTrack = { ...t, clips: updatedClips };
          audioEngine.syncTrackLive(updatedTrack, songDurationSeconds, true);
          return updatedTrack;
        }
        return t;
      });
      return next;
    });
  };

  const handleDeleteClip = (trackId, clipId) => {
    setTracks(prev => {
      const next = prev.map(t => {
        if (t.id === trackId) {
          const updatedClips = (t.clips || []).filter(c => c.id !== clipId);
          const updatedTrack = { ...t, clips: updatedClips };
          audioEngine.syncTrackLive(updatedTrack, songDurationSeconds, true);
          return updatedTrack;
        }
        return t;
      });
      return next;
    });
  };

  // Playhead position percentage across timeline (0% to 100%)
  const playheadPercent = Math.max(0, Math.min(100, (playheadTime / songDurationSeconds) * 100));

  // Generate markers along timeline
  const stepInterval = songDurationSeconds <= 30 ? 5 : songDurationSeconds <= 60 ? 10 : songDurationSeconds <= 120 ? 15 : 30;
  const markerCount = Math.floor(songDurationSeconds / stepInterval);

  return (
    <div 
      className="flex-1 flex flex-col min-h-0 bg-zinc-950 overflow-hidden relative select-none"
      onWheel={handleWheel}
    >
      
      {/* 1. Timeline Header: Track Label corner + Time Ruler */}
      <div className="h-9 bg-zinc-900 border-b border-zinc-800 flex shrink-0 z-30">
        
        {/* Left Corner: Track Headers Label */}
        <div className="w-48 sm:w-56 bg-zinc-900 border-r border-zinc-800 px-3 flex items-center justify-between shrink-0 shadow-md">
          <span className="font-black text-[11px] text-zinc-400 uppercase tracking-widest">
            Tracks
          </span>
          <span className="text-[10px] font-bold text-zinc-500">
            {tracks.length} active
          </span>
        </div>

        {/* Right: Ruler Bar */}
        <div 
          ref={rulerRef}
          onPointerDown={handleRulerPointerDown}
          className="flex-1 relative cursor-pointer bg-zinc-900/80 hover:bg-zinc-800/50 transition-colors overflow-hidden"
          title="Click or drag to scrub playhead needle"
        >
          {/* Second & Bar Markers */}
          {Array.from({ length: markerCount + 1 }).map((_, idx) => {
            const sec = idx * stepInterval;
            const pct = (sec / songDurationSeconds) * 100;
            const m = Math.floor(sec / 60);
            const s = sec % 60;
            const timeLabel = m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `0:${s.toString().padStart(2, '0')}`;

            return (
              <div
                key={sec}
                className="absolute top-0 bottom-0 flex flex-col justify-end pb-1 border-l border-zinc-700 pointer-events-none"
                style={{ left: `${pct}%` }}
              >
                <span className="text-[9px] font-mono font-black text-zinc-400 pl-1">
                  {timeLabel}
                </span>
              </div>
            );
          })}

          {/* Subdivisions */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px)',
              backgroundSize: `${(1 / (songDurationSeconds / 2)) * 100}% 100%`
            }}
          />

          {/* Playhead Diamond Head on Ruler */}
          <div
            className="absolute top-0 bottom-0 pointer-events-none z-30"
            style={{
              left: `${playheadPercent}%`,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="w-3.5 h-3.5 bg-yellow-400 border border-black rotate-45 -translate-y-1 shadow-[0_0_10px_#facc15] mx-auto" />
          </div>
        </div>

        {/* Scrollbar gutter compensation spacer if lanes container has vertical scrollbar */}
        {scrollbarWidth > 0 && (
          <div style={{ width: `${scrollbarWidth}px` }} className="shrink-0 bg-zinc-900" />
        )}

      </div>

      {/* 2. Main Body: Split into Left Track Headers & Right Track Lanes */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden">
        
        {/* Left Column: Track Headers (vertical scroll synced with lanes) */}
        <div
          ref={headersScrollRef}
          onWheel={handleHeadersWheel}
          className="w-48 sm:w-56 shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col overflow-y-hidden overflow-x-hidden z-20 shadow-[4px_0_10px_rgba(0,0,0,0.5)]"
        >
          {tracks.map(track => (
            <TrackHeader
              key={track.id}
              track={track}
              tracks={tracks}
              onUpdateTrack={handleUpdateTrack}
              onDeleteTrack={handleDeleteTrack}
              onDuplicateTrack={handleDuplicateTrack}
              onOpenInstrument={onOpenInstrument}
            />
          ))}

          {/* Add Track Button Row */}
          <div className="h-16 p-3 flex items-center gap-2 bg-zinc-900/60 border-b border-zinc-800/40 shrink-0">
            <button
              onClick={onAddTrack}
              className="btn-chunky btn-chunky-gray py-2 px-4 text-xs font-black flex items-center gap-1.5"
            >
              <FaPlus size={10} />
              <span>Add Track</span>
            </button>
          </div>
        </div>

        {/* Right Column: Track Lanes Container & Full-Height Playhead Needle */}
        <div 
          ref={lanesContainerRef}
          onScroll={handleLanesScroll}
          className="flex-1 relative overflow-y-auto overflow-x-hidden bg-black/20"
        >
          {/* Playhead Vertical Needle (Spans entire height of the lanes area with zero offset) */}
          <div
            className="absolute top-0 bottom-0 pointer-events-none z-30"
            style={{
              left: `${playheadPercent}%`,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="w-0.5 h-full bg-yellow-400 shadow-[0_0_8px_#facc15] mx-auto" />
          </div>

          {/* Render Track Lanes */}
          {tracks.map(track => (
            <TrackLane
              key={track.id}
              track={track}
              songDurationSeconds={songDurationSeconds}
              zoom={zoom}
              selectedClipId={selectedClipId}
              onSelectClip={setSelectedClipId}
              onAddClipToTrack={handleAddClipToTrack}
              onUpdateClip={handleUpdateClip}
              onDeleteClip={handleDeleteClip}
            />
          ))}

          {/* Bottom spacer to match Add Track row height */}
          <div className="h-16 bg-transparent shrink-0" />
        </div>

      </div>

    </div>
  );
}
