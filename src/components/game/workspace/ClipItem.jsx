import { useState, useRef, useEffect } from 'react';
import { FaTrash, FaVolumeUp } from 'react-icons/fa';
import { audioEngine } from './AudioEngine';

export default function ClipItem({
  clip,
  track,
  songDurationSeconds = 60,
  zoom = 1,
  isSelected = false,
  onSelect = () => {},
  onDelete = () => {},
  onUpdate = () => {}
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [localStartAt, setLocalStartAt] = useState(clip.startAt);
  const [localDuration, setLocalDuration] = useState(clip.duration);

  const startXRef = useRef(0);
  const initialStartAtRef = useRef(0);
  const initialDurationRef = useRef(0);

  useEffect(() => {
    if (!isDragging) {
      setLocalStartAt(clip.startAt);
    }
  }, [clip.startAt, isDragging]);

  useEffect(() => {
    if (!isResizing) {
      setLocalDuration(clip.duration);
    }
  }, [clip.duration, isResizing]);

  const currentStartAt = isDragging ? localStartAt : clip.startAt;
  const currentDuration = isResizing ? localDuration : clip.duration;

  const leftPercent = Math.max(0, Math.min(100, (currentStartAt / songDurationSeconds) * 100));
  const widthPercent = Math.max(1, Math.min(100 - leftPercent, (currentDuration / songDurationSeconds) * 100));

  // Audition clip on click
  const handleAudition = (e) => {
    e.stopPropagation();
    if (clip.url) {
      const a = new Audio(clip.url);
      a.volume = Math.max(0, Math.min(1, (track.volume ?? 100) / 100));
      a.play().catch(console.warn);
    } else if (clip.notes && clip.notes.length > 0) {
      audioEngine.playNote(clip.instrument || 'pluck', clip.notes[0].note, '4n');
    } else if (clip.patternData?.steps) {
      const firstSound = Object.keys(clip.patternData.steps)[0] || 'kick';
      audioEngine.playDrum(firstSound);
    } else if (clip.soundKey || clip.sampleId) {
      audioEngine.previewSample(clip.sampleId || clip.soundKey, clip.name);
    }
  };

  // Drag Clip along timeline to change startAt
  const handleDragPointerDown = (e) => {
    if (e.button !== 0 || e.target.closest('.no-drag-handle')) return;
    e.stopPropagation();
    setIsDragging(true);
    startXRef.current = e.clientX;
    initialStartAtRef.current = clip.startAt;

    const laneEl = e.currentTarget.closest('.track-lane');
    const laneWidth = laneEl ? laneEl.getBoundingClientRect().width : 1000;
    let latestStartAt = clip.startAt;

    const handlePointerMove = (moveEvt) => {
      const deltaX = moveEvt.clientX - startXRef.current;
      const deltaTime = (deltaX / laneWidth) * songDurationSeconds;
      let newStartAt = Math.round((initialStartAtRef.current + deltaTime) * 10) / 10;
      // Clamp within timeline bounds
      newStartAt = Math.max(0, Math.min(songDurationSeconds - clip.duration, newStartAt));
      latestStartAt = newStartAt;
      setLocalStartAt(newStartAt);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);

      if (Math.abs(latestStartAt - initialStartAtRef.current) > 0.05) {
        onUpdate({ ...clip, startAt: latestStartAt });
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Resize duration handle (right edge)
  const handleResizeRightDown = (e) => {
    e.stopPropagation();
    setIsResizing(true);
    startXRef.current = e.clientX;
    initialDurationRef.current = clip.duration;

    const laneEl = e.currentTarget.closest('.track-lane');
    const laneWidth = laneEl ? laneEl.getBoundingClientRect().width : 1000;
    let latestDuration = clip.duration;

    const handlePointerMove = (moveEvt) => {
      const deltaX = moveEvt.clientX - startXRef.current;
      const deltaTime = (deltaX / laneWidth) * songDurationSeconds;
      let newDuration = Math.round((initialDurationRef.current + deltaTime) * 10) / 10;
      // Clamp duration: minimum 0.5s, maximum until end of song
      newDuration = Math.max(0.5, Math.min(songDurationSeconds - clip.startAt, newDuration));
      latestDuration = newDuration;
      setLocalDuration(newDuration);
    };

    const handlePointerUp = () => {
      setIsResizing(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);

      if (Math.abs(latestDuration - initialDurationRef.current) > 0.05) {
        onUpdate({ ...clip, duration: latestDuration });
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Determine clip visual badge color
  const clipBg = clip.color || (
    clip.isReference ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black' :
    clip.isVocal || clip.url ? 'bg-emerald-600 text-white' :
    clip.patternData ? 'bg-pink-600 text-white' :
    clip.notes ? 'bg-purple-600 text-white' :
    'bg-blue-600 text-white'
  );

  return (
    <div
      onPointerDown={handleDragPointerDown}
      onClick={onSelect}
      className={`absolute top-1.5 bottom-1.5 rounded-xl border-2 border-black flex flex-col overflow-hidden select-none cursor-grab active:cursor-grabbing group shadow-[0_3px_0_0_#000] transition-all duration-75 ${clipBg} ${
        isSelected ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-zinc-950 scale-[1.01] z-20 shadow-[0_4px_12px_rgba(251,191,36,0.4)]' : 'z-10'
      } ${isDragging || isResizing ? 'opacity-90 shadow-2xl' : ''}`}
      style={{
        left: `${leftPercent}%`,
        width: `${widthPercent}%`,
        minWidth: '40px'
      }}
      title={`${clip.name} (Start: ${clip.startAt.toFixed(1)}s, Dur: ${clip.duration.toFixed(1)}s)`}
    >
      {/* Clip Header Bar */}
      <div className="h-5 px-1.5 flex items-center justify-between bg-black/30 border-b border-black/20 text-[10px] font-black truncate">
        <span className="truncate flex items-center gap-1">
          {clip.name}
        </span>
        
        <div className="flex items-center gap-1 shrink-0 no-drag-handle">
          {/* Quick Audition Button */}
          <button
            onClick={handleAudition}
            className="w-3.5 h-3.5 rounded flex items-center justify-center bg-black/40 hover:bg-black/60 text-white/80 hover:text-white transition-colors"
            title="Preview Audio"
          >
            <FaVolumeUp size={7} />
          </button>

          {/* Delete Clip Button */}
          {!clip.isReference && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(clip.id);
              }}
              className="w-3.5 h-3.5 rounded flex items-center justify-center bg-red-600/80 hover:bg-red-500 text-white hover:scale-110 transition-all"
              title="Delete clip"
            >
              <FaTrash size={7} />
            </button>
          )}
        </div>
      </div>

      {/* Clip Waveform / Pattern Preview Body */}
      <div className="flex-1 flex items-center px-1 relative overflow-hidden pointer-events-none">
        
        {/* 1. Vocal / Audio Waveform Representation */}
        {(clip.isVocal || clip.url) && (
          <div className="w-full h-full flex items-center justify-around gap-0.5 opacity-80 px-1">
            {Array.from({ length: Math.max(6, Math.min(60, Math.floor(clip.duration * 6))) }).map((_, i) => {
              // Deterministic pseudo-random height based on index for clean audio waveform peaks
              const peakHeight = Math.sin(i * 0.7) * 35 + Math.cos(i * 1.3) * 25 + 40;
              return (
                <div
                  key={i}
                  className="w-1 bg-white/90 rounded-full"
                  style={{ height: `${Math.max(15, Math.min(95, peakHeight))}%` }}
                />
              );
            })}
          </div>
        )}

        {/* 2. Drum Pattern 16-Step Grid Representation */}
        {clip.patternData?.steps && (
          <div className="w-full h-full flex flex-col justify-center gap-0.5 px-1 opacity-80">
            {Object.entries(clip.patternData.steps).slice(0, 3).map(([key, steps], rIdx) => (
              <div key={key} className="flex items-center gap-0.5 w-full">
                {steps.map((isActive, sIdx) => (
                  <div
                    key={sIdx}
                    className={`flex-1 h-1 rounded-sm ${isActive ? 'bg-yellow-300' : 'bg-black/30'}`}
                  />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* 3. Melodic Synth / Piano Roll Note Representation */}
        {clip.notes && Array.isArray(clip.notes) && (
          <div className="w-full h-full relative opacity-85 px-1">
            {clip.notes.map((n, idx) => (
              <div
                key={idx}
                className="absolute h-1.5 bg-yellow-200 rounded-sm shadow-sm"
                style={{
                  left: `${((n.step || 0) / 16) * 100}%`,
                  width: `${Math.max(4, ((n.length || 2) / 16) * 100)}%`,
                  top: `${20 + (idx % 3) * 25}%`
                }}
              />
            ))}
          </div>
        )}

        {/* 4. One-Shot Sample representation */}
        {!clip.isVocal && !clip.url && !clip.patternData && !clip.notes && (
          <div className="w-full h-full flex items-center justify-center opacity-70">
            <span className="text-[11px] font-black tracking-widest uppercase">🎵 SAMPLE</span>
          </div>
        )}
      </div>

      {/* Resize Handle (Right Edge) */}
      {!clip.isReference && (
        <div
          onPointerDown={handleResizeRightDown}
          className="no-drag-handle absolute top-0 bottom-0 right-0 w-2.5 bg-black/20 hover:bg-yellow-400 cursor-ew-resize flex items-center justify-center transition-colors"
          title="Drag to resize duration"
        >
          <div className="w-0.5 h-3 bg-white/60 rounded-full" />
        </div>
      )}
    </div>
  );
}
