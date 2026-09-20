import { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaMicrophone, FaTrash, FaVolumeUp, FaVolumeMute, FaPlus } from 'react-icons/fa';
import { audioEngine } from './AudioEngine';

const TOTAL_TIMELINE_SECONDS = 30;

export default function PlaylistArrangerTab({
  tracks,
  setTracks,
  playheadTime,
  setPlayheadTime,
  isPlaying,
  selectedSample,
  setSelectedSample,
  pointerDrag,
  setPointerDrag,
  draggingClip,
  setDraggingClip,
  onRecordStart,
  onRecordStop,
  isRecording,
  recordingCountdown
}) {
  const rulerRef = useRef(null);
  const [isScrubbingRuler, setIsScrubbingRuler] = useState(false);

  // Ruler scrubber: updates playhead strictly when clicking/dragging on the top ruler bar
  const updatePlayheadFromRuler = (clientX) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const xPos = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const ratio = Math.max(0, Math.min(1, xPos / rect.width));
    const newTime = Math.round((ratio * TOTAL_TIMELINE_SECONDS) * 10) / 10;

    setPlayheadTime(newTime);
    audioEngine.seek(newTime);
  };

  const handleRulerPointerDown = (e) => {
    if (e.button !== 0) return;
    setIsScrubbingRuler(true);
    updatePlayheadFromRuler(e.clientX);
  };

  useEffect(() => {
    if (!isScrubbingRuler) return;

    const handlePointerMove = (e) => {
      updatePlayheadFromRuler(e.clientX);
    };

    const handlePointerUp = () => {
      setIsScrubbingRuler(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isScrubbingRuler]);

  const toggleMute = (trackId) => {
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

  const handleTrackClick = (trackId, e) => {
    // If a sample or pattern is selected for stamping, place it!
    if (selectedSample && trackId) {
      const rect = e.currentTarget.getBoundingClientRect();
      const xPos = Math.max(0, e.clientX - rect.left);
      const ratio = Math.min(1, Math.max(0, xPos / rect.width));
      const snapTime = Math.round((ratio * TOTAL_TIMELINE_SECONDS) * 2) / 2;

      const duration = selectedSample.duration || (selectedSample.category === 'FX' ? 1.0 : selectedSample.category === 'Drums' ? 0.8 : 2.0);
      const adjustedStart = Math.min(TOTAL_TIMELINE_SECONDS - duration, Math.max(0, snapTime));

      const newClip = {
        id: `clip_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        sampleId: selectedSample.id,
        name: selectedSample.name,
        category: selectedSample.category,
        color: selectedSample.color,
        startAt: adjustedStart,
        duration: duration,
        notes: selectedSample.notes || null,
        patternData: selectedSample.patternData || null
      };

      setTracks(prev => prev.map(t => t.id === trackId ? { ...t, clips: [...t.clips, newClip] } : t));
      audioEngine.previewSample(selectedSample.id, selectedSample.name);
    }
  };

  const handleNativeDrop = (trackId, e) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const xPos = Math.max(0, e.clientX - rect.left);
    const ratio = Math.min(1, Math.max(0, xPos / rect.width));
    const snapTime = Math.round((ratio * TOTAL_TIMELINE_SECONDS) * 2) / 2;

    const moveData = e.dataTransfer.getData('move_clip_payload');
    const sampleData = e.dataTransfer.getData('sample_payload') || e.dataTransfer.getData('text/plain');

    if (moveData) {
      try {
        const { fromTrackId, clip } = JSON.parse(moveData);
        const clipDuration = clip.duration || 1;
        const adjustedStart = Math.min(TOTAL_TIMELINE_SECONDS - clipDuration, Math.max(0, snapTime));

        setTracks(prev => {
          const without = prev.map(t => t.id === fromTrackId ? { ...t, clips: t.clips.filter(c => c.id !== clip.id) } : t);
          return without.map(t => t.id === trackId ? { ...t, clips: [...t.clips, { ...clip, startAt: adjustedStart }] } : t);
        });
        return;
      } catch (err) {
        console.error("Drop move error:", err);
      }
    }

    if (sampleData) {
      try {
        const sample = JSON.parse(sampleData);
        if (sample) {
          const duration = sample.duration || 1;
          const adjustedStart = Math.min(TOTAL_TIMELINE_SECONDS - duration, Math.max(0, snapTime));
          const newClip = {
            id: `clip_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            sampleId: sample.id,
            name: sample.name,
            category: sample.category,
            color: sample.color,
            startAt: adjustedStart,
            duration: duration,
            notes: sample.notes || null,
            patternData: sample.patternData || null
          };
          setTracks(prev => prev.map(t => t.id === trackId ? { ...t, clips: [...t.clips, newClip] } : t));
        }
      } catch (err) {
        console.error("Sample drop error:", err);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 select-none overflow-hidden relative">
      
      {/* Recording 3-2-1 Countdown Overlay */}
      {recordingCountdown > 0 && (
        <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center animate-fade-in">
          <div className="text-8xl font-black text-red-500 animate-ping mb-4">
            {recordingCountdown}
          </div>
          <div className="text-xl font-black text-white uppercase tracking-widest">
            🎙️ Get Ready to Sing / Rap!
          </div>
        </div>
      )}

      {/* Top Ruler Header (Only Area to move / scrub playhead) */}
      <div className="h-9 bg-zinc-900 border-b border-zinc-800 flex px-2 shrink-0 select-none items-center">
        {/* Track Column Spacer */}
        <div className="w-52 shrink-0 flex items-center justify-between px-3">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
            <span>📍</span> <span>Timeline Ruler</span>
          </span>
          <span className="text-[9px] text-zinc-500 font-mono font-bold">30s Song</span>
        </div>

        {/* Scrubber Area */}
        <div
          ref={rulerRef}
          onPointerDown={handleRulerPointerDown}
          className="flex-1 h-full relative cursor-ew-resize hover:bg-zinc-800/40 transition-colors"
          title="Click or drag here to jump / scrub the playhead needle"
        >
          {/* Time markers */}
          {[0, 5, 10, 15, 20, 25, 30].map(sec => (
            <div
              key={sec}
              className="absolute top-1 text-[11px] text-zinc-400 font-mono font-bold pointer-events-none select-none"
              style={{ left: `${(sec / TOTAL_TIMELINE_SECONDS) * 100}%`, transform: 'translateX(-50%)' }}
            >
              00:{sec.toString().padStart(2, '0')}
            </div>
          ))}

          {/* Tick marks */}
          {Array.from({ length: 31 }).map((_, i) => (
            <div
              key={i}
              className={`absolute bottom-0 w-[1px] ${i % 5 === 0 ? 'h-3.5 bg-zinc-400' : 'h-1.5 bg-zinc-700'} pointer-events-none`}
              style={{ left: `${(i / TOTAL_TIMELINE_SECONDS) * 100}%` }}
            />
          ))}

          {/* Playhead Triangle on Ruler */}
          <div
            className="absolute top-0 bottom-0 w-3 -ml-1.5 flex flex-col items-center pointer-events-none z-30"
            style={{ left: `${(playheadTime / TOTAL_TIMELINE_SECONDS) * 100}%` }}
          >
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,1)]" />
            <div className="w-[2px] flex-1 bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,1)]" />
          </div>
        </div>
      </div>

      {/* Playlist Multi-Track Playlist */}
      <div className="flex-1 overflow-y-auto bg-zinc-950 p-2 space-y-2 relative">
        
        {/* Playhead Needle Vertical Line Sweeping Across All Tracks */}
        <div
          className="absolute top-0 bottom-0 pointer-events-none z-30"
          style={{
            left: `calc(0.5rem + 13rem + (100% - 14rem) * ${playheadTime / TOTAL_TIMELINE_SECONDS})`
          }}
        >
          <div className="w-[2px] h-full bg-gradient-to-b from-yellow-400 via-pink-500 to-purple-500 shadow-[0_0_10px_rgba(250,204,21,1)]" />
        </div>

        {tracks.map((track) => (
          <div key={track.id} className="flex h-20 bg-zinc-900/90 rounded-xl border-2 border-zinc-800 overflow-hidden relative shadow-sm">
            
            {/* Track Info Header (Left side of track) */}
            <div className="w-52 bg-zinc-900 border-r-2 border-zinc-800 p-2 flex flex-col justify-between shrink-0 z-20 shadow-[2px_0_10px_rgba(0,0,0,0.5)]">
              <div className="font-black text-xs text-zinc-200 truncate flex items-center justify-between">
                <span>{track.name}</span>
                {track.type === 'vocal' && (
                  <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold">MIC</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => toggleMute(track.id)}
                  className={`p-1.5 rounded-lg font-bold text-xs transition-colors ${
                    track.muted ? 'bg-red-500/20 text-red-500' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                  title={track.muted ? "Unmute track" : "Mute track"}
                >
                  {track.muted ? <FaVolumeMute size={12} /> : <FaVolumeUp size={12} />}
                </button>

                <span className="text-[10px] font-bold text-zinc-500 uppercase">
                  {track.clips.length} {track.clips.length === 1 ? 'clip' : 'clips'}
                </span>
              </div>
            </div>

            {/* Track Dropzone & Arrangement Lane */}
            <div
              data-track-dropzone="true"
              data-track-id={track.id}
              className={`flex-1 relative h-full transition-colors select-none ${
                selectedSample ? 'bg-pink-950/20 hover:bg-pink-950/40 cursor-crosshair' : 'bg-black/35 hover:bg-black/25 cursor-default'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
              }}
              onDragEnter={(e) => e.preventDefault()}
              onDrop={(e) => handleNativeDrop(track.id, e)}
              onClick={(e) => handleTrackClick(track.id, e)}
            >
              {/* 5-second vertical grid lines */}
              <div className="absolute inset-0 opacity-15 bg-[linear-gradient(90deg,_#ffffff_1px,_transparent_1px)] bg-[length:16.66%_100%] pointer-events-none" />

              {/* Placed Clips */}
              {track.clips.map((clip) => {
                const clipDuration = clip.duration || 1;
                const isVeryShort = clipDuration < 1.5;

                return (
                  <div
                    key={clip.id}
                    draggable="true"
                    onDragStart={(e) => {
                      e.stopPropagation();
                      e.dataTransfer.setData('move_clip_payload', JSON.stringify({ fromTrackId: track.id, clip }));
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onPointerDown={(e) => {
                      if (e.button === 0 && !e.target.closest('button')) {
                        e.stopPropagation();
                        setDraggingClip({ fromTrackId: track.id, clip, initialX: e.clientX });
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className={`absolute top-1.5 bottom-1.5 rounded-lg border-2 border-black shadow-[0_2px_0_0_#000] flex flex-col justify-between p-1 group cursor-grab active:cursor-grabbing hover:scale-[1.02] transition-all overflow-hidden ${
                      clip.color || 'bg-purple-500'
                    }`}
                    style={{
                      left: `${(clip.startAt / TOTAL_TIMELINE_SECONDS) * 100}%`,
                      width: `${(clipDuration / TOTAL_TIMELINE_SECONDS) * 100}%`,
                      minWidth: '22px'
                    }}
                    title={`${clip.name} (${clipDuration}s)`}
                  >
                    <div className="flex items-center justify-between w-full pointer-events-none">
                      <span className={`font-black text-black uppercase truncate leading-tight drop-shadow-xs ${isVeryShort ? 'text-[8px]' : 'text-[10px]'}`}>
                        {clip.name}
                      </span>

                      <button
                        onClick={(e) => removeClip(track.id, clip.id, e)}
                        className="pointer-events-auto opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-500 text-white rounded p-0.5 hover:scale-110 transition-all text-[8px] shadow-sm ml-0.5 shrink-0"
                        title="Delete clip"
                      >
                        <FaTrash size={8} />
                      </button>
                    </div>

                    {/* Waveform graphic */}
                    <div className="h-2 w-full opacity-40 flex items-end gap-0.5 pointer-events-none overflow-hidden">
                      {Array.from({ length: Math.max(3, Math.min(24, Math.floor(clipDuration * 4))) }).map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-black rounded-t-xs"
                          style={{ height: `${30 + ((i * 23) % 70)}%` }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}
