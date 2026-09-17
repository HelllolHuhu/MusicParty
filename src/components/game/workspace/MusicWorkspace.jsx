import { useState, useEffect, useRef, useCallback } from 'react';
import { FaPlay, FaPause, FaMicrophone, FaTrash, FaVolumeUp, FaVolumeMute, FaPlus, FaCheck } from 'react-icons/fa';
import { useLanguage } from '../../../context/LanguageContext';
import { audioEngine } from './AudioEngine';

const SAMPLES = [
  { id: 's1', name: 'Trap Kick', category: 'Drums', color: 'bg-red-500', textColor: 'text-red-400', duration: 0.8 },
  { id: 's2', name: 'Hi-Hat Roll', category: 'Drums', color: 'bg-orange-500', textColor: 'text-orange-400', duration: 1.2 },
  { id: 's3', name: '808 Bass', category: 'Bass', color: 'bg-blue-500', textColor: 'text-blue-400', duration: 2.0 },
  { id: 's4', name: 'Synth Chords', category: 'Melody', color: 'bg-purple-500', textColor: 'text-purple-400', duration: 2.5 },
  { id: 's5', name: 'Vinyl Scratch', category: 'FX', color: 'bg-yellow-500', textColor: 'text-yellow-400', duration: 1.0 },
];

const TOTAL_TIMELINE_SECONDS = 30;

export default function MusicWorkspace({ roomId, playerId, timeRemaining, isReady, readyStatus, onFinish }) {
  const { t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadTime, setPlayheadTime] = useState(0);
  const [micError, setMicError] = useState(null);
  const [isScrubbingRuler, setIsScrubbingRuler] = useState(false);
  
  // Selected sample for click-to-stamp mode
  const [selectedSample, setSelectedSample] = useState(null);
  
  // Mouse pointer drag state (universal drag system that works in all environments)
  const [pointerDrag, setPointerDrag] = useState(null); // { sample, x, y }
  
  // Dragging existing clip state
  const [draggingClip, setDraggingClip] = useState(null); // { fromTrackId, clip, initialX }

  const [tracks, setTracks] = useState(() => [
    { id: 't1', name: 'Beat (Drums)', type: 'audio', volume: 0, muted: false, clips: [] },
    { id: 't2', name: 'Bassline', type: 'audio', volume: 0, muted: false, clips: [] },
    { id: 't3', name: 'Melody / Synth', type: 'audio', volume: 0, muted: false, clips: [] },
    { id: 't4', name: 'Vocals / FX', type: 'vocal', volume: 0, muted: false, clips: [] },
  ]);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordStartTimeRef = useRef(0);
  const recordStartPlayheadRef = useRef(0);

  const rulerRef = useRef(null);
  const timelineContainerRef = useRef(null);
  const animFrameRef = useRef(null);
  const playStartTimeRef = useRef(0);
  const startOffsetRef = useRef(0);

  // Clean up any old leftover localstorage track items
  useEffect(() => {
    try {
      localStorage.removeItem(`track_${roomId}_${playerId}`);
    } catch (e) {
      // ignore
    }
  }, [roomId, playerId]);

  // Sync tracks with AudioEngine
  useEffect(() => {
    audioEngine.syncTracks(tracks, true, TOTAL_TIMELINE_SECONDS);
  }, [tracks]);

  // Audio Playback & Real-Time Moving Playhead Animation
  useEffect(() => {
    if (isPlaying) {
      playStartTimeRef.current = performance.now();
      startOffsetRef.current = playheadTime;
      
      audioEngine.syncTracks(tracks, true, TOTAL_TIMELINE_SECONDS);
      audioEngine.start(playheadTime).catch(console.error);

      const updatePlayhead = () => {
        const elapsed = (performance.now() - playStartTimeRef.current) / 1000;
        const currentPos = (startOffsetRef.current + elapsed) % TOTAL_TIMELINE_SECONDS;
        setPlayheadTime(currentPos);
        animFrameRef.current = requestAnimationFrame(updatePlayhead);
      };

      animFrameRef.current = requestAnimationFrame(updatePlayhead);
    } else {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      audioEngine.stop();
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      audioEngine.stop();
    };
  }, [isPlaying, tracks]);

  // Ruler scrubber helper function: Only moves playhead when interacting with the ruler bar
  const updatePlayheadFromRuler = useCallback((clientX) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const xPos = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const ratio = Math.max(0, Math.min(1, xPos / rect.width));
    const newTime = ratio * TOTAL_TIMELINE_SECONDS;
    const roundedTime = Math.round(newTime * 10) / 10;

    setPlayheadTime(roundedTime);
    startOffsetRef.current = roundedTime;
    playStartTimeRef.current = performance.now();
    audioEngine.seek(roundedTime);
  }, []);

  const handleRulerPointerDown = (e) => {
    if (e.button !== 0) return;
    setIsScrubbingRuler(true);
    updatePlayheadFromRuler(e.clientX);
  };

  // Scrubbing on ruler drag
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
  }, [isScrubbingRuler, updatePlayheadFromRuler]);

  // Pointer drag global listeners for samples
  useEffect(() => {
    if (!pointerDrag && !draggingClip) return;

    const handlePointerMove = (e) => {
      if (pointerDrag) {
        setPointerDrag(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
      }
    };

    const handlePointerUp = (e) => {
      // Find what element is under the cursor
      const elem = document.elementFromPoint(e.clientX, e.clientY);
      const trackDropZone = elem ? elem.closest('[data-track-dropzone]') : null;

      if (trackDropZone) {
        const trackId = trackDropZone.getAttribute('data-track-id');
        const rect = trackDropZone.getBoundingClientRect();
        const xPos = Math.max(0, e.clientX - rect.left);
        const ratio = Math.min(1, Math.max(0, xPos / rect.width));
        const snapTime = Math.round((ratio * TOTAL_TIMELINE_SECONDS) * 2) / 2;

        if (pointerDrag) {
          addClipToTrack(trackId, pointerDrag.sample, snapTime);
        } else if (draggingClip) {
          moveClipToTrack(draggingClip.fromTrackId, trackId, draggingClip.clip, snapTime);
        }
      }

      setPointerDrag(null);
      setDraggingClip(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [pointerDrag, draggingClip]);

  const addClipToTrack = (trackId, sample, startAtTime) => {
    const duration = sample.duration || (
      sample.category === 'FX' ? 1.0 :
      sample.category === 'Drums' ? 0.8 :
      sample.category === 'Bass' ? 2.0 :
      sample.category === 'Melody' ? 2.5 : 1.0
    );
    const adjustedStart = Math.min(TOTAL_TIMELINE_SECONDS - duration, Math.max(0, startAtTime));

    const newClip = {
      id: `clip_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      sampleId: sample.id,
      name: sample.name,
      category: sample.category,
      color: sample.color,
      startAt: adjustedStart,
      duration: duration
    };

    setTracks(prev => prev.map(t => {
      if (t.id === trackId) {
        return { ...t, clips: [...t.clips, newClip] };
      }
      return t;
    }));

    audioEngine.previewSample(sample.id, sample.name);
  };

  const moveClipToTrack = (fromTrackId, toTrackId, clip, newStartAt) => {
    const clipDuration = clip.duration || 1;
    const adjustedStart = Math.min(TOTAL_TIMELINE_SECONDS - clipDuration, Math.max(0, newStartAt));

    setTracks(prev => {
      const withoutClip = prev.map(t => {
        if (t.id === fromTrackId) {
          return { ...t, clips: t.clips.filter(c => c.id !== clip.id) };
        }
        return t;
      });

      return withoutClip.map(t => {
        if (t.id === toTrackId) {
          return {
            ...t,
            clips: [...t.clips, { ...clip, startAt: adjustedStart }]
          };
        }
        return t;
      });
    });
  };

  const togglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  // Track click handler: Only stamps sound if in stamp mode; NEVER moves the playhead
  const handleTrackClick = (trackId, e) => {
    if (selectedSample && trackId) {
      const rect = e.currentTarget.getBoundingClientRect();
      const xPos = Math.max(0, e.clientX - rect.left);
      const ratio = Math.min(1, Math.max(0, xPos / rect.width));
      const snapTime = Math.round((ratio * TOTAL_TIMELINE_SECONDS) * 2) / 2;
      addClipToTrack(trackId, selectedSample, snapTime);
    }
  };

  // HTML5 Drag & Drop handlers
  const handleNativeDragStart = (e, sample) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(sample));
    e.dataTransfer.setData('sample_payload', JSON.stringify(sample));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleNativeClipDragStart = (e, trackId, clip) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', JSON.stringify({ fromTrackId: trackId, clip }));
    e.dataTransfer.setData('move_clip_payload', JSON.stringify({ fromTrackId: trackId, clip }));
    e.dataTransfer.effectAllowed = 'move';
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
        moveClipToTrack(fromTrackId, trackId, clip, snapTime);
        return;
      } catch (err) {
        console.error("Move error:", err);
      }
    }

    if (sampleData) {
      try {
        const sample = JSON.parse(sampleData);
        if (sample && sample.id) {
          addClipToTrack(trackId, sample, snapTime);
        }
      } catch (err) {
        console.error("Sample drop error:", err);
      }
    }
  };

  // Sample card click handler
  const handleSampleCardClick = (sample) => {
    audioEngine.previewSample(sample.id, sample.name);
    if (selectedSample?.id === sample.id) {
      setSelectedSample(null); // toggle off
    } else {
      setSelectedSample(sample); // stamp mode active
    }
  };

  // Quick 1-Click Add
  const handleQuickAdd = (sample) => {
    audioEngine.previewSample(sample.id, sample.name);
    let targetIndex = 0;
    if (sample.category === 'Bass') targetIndex = 1;
    else if (sample.category === 'Melody') targetIndex = 2;
    else if (sample.category === 'FX') targetIndex = 3;

    const targetTrack = tracks[targetIndex] || tracks[0];
    const placeTime = Math.round(playheadTime * 2) / 2;
    addClipToTrack(targetTrack.id, sample, placeTime);
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

  const toggleMute = (trackId) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, muted: !t.muted } : t));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      recordStartTimeRef.current = Date.now();
      recordStartPlayheadRef.current = playheadTime;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const elapsedSec = Math.max(0.5, Math.min(
          TOTAL_TIMELINE_SECONDS,
          Math.round(((Date.now() - recordStartTimeRef.current) / 1000) * 10) / 10
        ));

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Url = reader.result;
          setTracks(prev => {
            const newTracks = [...prev];
            const vTrack = newTracks.find(t => t.type === 'vocal') || newTracks[3];
            if (vTrack) {
              const startPos = Math.min(
                TOTAL_TIMELINE_SECONDS - elapsedSec,
                Math.max(0, Math.round(recordStartPlayheadRef.current * 2) / 2)
              );
              vTrack.clips.push({
                id: `vocal_${Date.now()}`,
                name: `${t('game.vocalTake')} (${elapsedSec}s)`,
                color: 'bg-emerald-500',
                startAt: startPos,
                duration: elapsedSec,
                url: base64Url
              });
            }
            return newTracks;
          });
        };
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access denied", err);
      setMicError(t('game.allowMic'));
      setTimeout(() => setMicError(null), 4000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex h-full bg-zinc-950 text-white rounded-xl overflow-hidden border-2 border-zinc-800 relative">
      
      {/* Floating Drag Avatar when using mouse pointer drag */}
      {pointerDrag && (
        <div 
          className={`fixed pointer-events-none z-50 px-3 py-1.5 rounded-xl border-2 border-black font-black text-xs text-black shadow-2xl scale-110 -translate-x-1/2 -translate-y-1/2 ${pointerDrag.sample.color}`}
          style={{ left: pointerDrag.x, top: pointerDrag.y }}
        >
          🎵 {pointerDrag.sample.name}
        </div>
      )}

      {/* Mic error toast banner */}
      {micError && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white font-bold text-xs px-4 py-2 rounded-xl border border-black shadow-[0_4px_0_0_#000] animate-bounce">
          {micError}
        </div>
      )}

      {/* Sample Browser (Left Sidebar) */}
      <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0 select-none">
        <div className="p-4 border-b border-zinc-800 font-bold text-pink-500 uppercase tracking-widest text-sm flex items-center justify-between">
          <span>{t('game.soundLibrary')}</span>
          <span className="text-[10px] text-zinc-400 font-bold bg-black/40 px-2 py-0.5 rounded-md">
            {selectedSample ? 'Stamp Mode' : 'Drag / Click'}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {selectedSample && (
            <div className="bg-pink-500/20 border-2 border-pink-500 text-pink-300 p-2.5 rounded-xl text-xs font-bold flex items-center justify-between animate-pulse mb-2">
              <span>Click track to stamp: <b>{selectedSample.name}</b></span>
              <button onClick={() => setSelectedSample(null)} className="text-white hover:text-red-400 text-sm ml-2">✕</button>
            </div>
          )}

          {SAMPLES.map(s => {
            const isSelected = selectedSample?.id === s.id;
            return (
              <div 
                key={s.id}
                draggable="true"
                onDragStart={(e) => handleNativeDragStart(e, s)}
                onPointerDown={(e) => {
                  // Only start pointer drag on left click and not on the plus button
                  if (e.button === 0 && !e.target.closest('button')) {
                    setPointerDrag({ sample: s, x: e.clientX, y: e.clientY });
                  }
                }}
                onClick={() => handleSampleCardClick(s)}
                className={`p-3 rounded-xl cursor-grab active:cursor-grabbing border-3 border-black shadow-[0_3px_0_0_#000] hover:translate-y-[-2px] hover:shadow-[0_5px_0_0_#000] transition-all flex items-center justify-between group ${s.color} ${
                  isSelected ? 'ring-4 ring-white scale-105 shadow-[0_0_15px_rgba(255,255,255,0.8)]' : ''
                }`}
                title="Drag onto timeline or click to stamp on any track"
              >
                <div>
                  <div className="font-black text-black text-sm drop-shadow-sm flex items-center gap-1.5">
                    {isSelected && <FaCheck size={12} className="text-black" />}
                    <span>{s.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-black/75 font-black uppercase tracking-wider">{s.category}</span>
                    <span className="text-[9px] bg-black/20 text-black font-bold px-1.5 py-0.2 rounded">{s.duration}s</span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickAdd(s);
                  }}
                  className="w-7 h-7 rounded-lg bg-black/80 hover:bg-black text-white flex items-center justify-center text-xs opacity-80 group-hover:opacity-100 transition-all hover:scale-110 shadow-sm"
                  title="Quick Add (+)"
                >
                  <FaPlus size={11} />
                </button>
              </div>
            );
          })}

          <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 text-center mt-3">
            <span className="text-xs text-zinc-300 font-bold block mb-1">💡 3 Ways to Place Sounds:</span>
            <span className="text-[10px] text-zinc-400 leading-tight block">
              1. <b>Drag & Drop</b> anywhere on a track<br/>
              2. <b>Click sound</b> then click timeline to stamp<br/>
              3. Click <b>(+)</b> button for instant add
            </span>
          </div>
        </div>
      </div>

      {/* Main Studio Timeline Workspace */}
      <div className="flex-1 flex flex-col min-w-0 select-none">
        
        {/* Top Toolbar */}
        <div className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6 shrink-0">
          <div className="flex gap-3 items-center">
            
            {/* Play / Pause */}
            <button 
              onClick={togglePlay}
              className={`w-12 h-12 rounded-2xl border-2 border-black font-black flex items-center justify-center text-lg shadow-[0_3px_0_0_#000] active:translate-y-0.5 active:shadow-[0_1px_0_0_#000] transition-all ${
                isPlaying 
                  ? 'bg-amber-400 hover:bg-amber-300 text-black animate-pulse' 
                  : 'bg-emerald-500 hover:bg-emerald-400 text-white'
              }`}
              title={isPlaying ? "Pause Studio" : "Play Studio"}
            >
              {isPlaying ? <FaPause size={16} /> : <FaPlay size={16} className="ml-0.5" />}
            </button>
            
            {/* Vocal Mic Button */}
            <button 
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-12 h-12 rounded-2xl border-2 border-black flex items-center justify-center text-lg shadow-[0_3px_0_0_#000] active:translate-y-0.5 active:shadow-[0_1px_0_0_#000] transition-all ${
                isRecording 
                  ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.7)]' 
                  : 'bg-zinc-800 hover:bg-red-500/30 text-red-400 hover:text-white'
              }`}
              title={isRecording ? "Stop Recording" : "Record Vocal Take"}
            >
              <FaMicrophone size={16} />
            </button>

            {/* Time Pointer Display */}
            <div className="bg-black/60 px-3.5 py-1.5 rounded-xl border border-zinc-800 font-mono font-bold text-xs text-yellow-300 flex items-center gap-1.5">
              <span>⏱</span>
              <span>00:{Math.floor(playheadTime).toString().padStart(2, '0')} / 00:30</span>
            </div>
          </div>
          
          {/* Creation Timer */}
          <div className="font-mono text-xl font-black text-pink-500 bg-black/60 px-4 py-1.5 rounded-xl border border-zinc-800 shadow-inner">
            {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
          </div>
          
          {/* Finish Track */}
          <button 
            onClick={() => onFinish(tracks)} 
            className={`btn-chunky font-black text-sm px-4 py-2.5 transition-all flex items-center gap-2 ${
              isReady 
                ? 'bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse' 
                : 'btn-chunky-green'
            }`}
          >
            <span>{isReady ? '✓ Ready!' : t('game.finishTrack')}</span>
            {isReady && readyStatus && (
              <span className="bg-black/30 px-2 py-0.5 rounded-md font-mono text-xs">
                ({readyStatus.ready}/{readyStatus.total})
              </span>
            )}
          </button>
        </div>

        {/* Timeline Ruler Header (Only area where playhead can be moved/scrubbed) */}
        <div className="h-9 bg-zinc-900 border-b border-zinc-800 flex px-2 shrink-0 select-none items-center">
          {/* Track column spacer to align ruler perfectly with dropzones */}
          <div className="w-48 shrink-0 flex items-center justify-between px-3">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <span>📍</span> <span>Timeline</span>
            </span>
            <span className="text-[9px] text-zinc-500 font-mono font-bold">30s</span>
          </div>

          {/* Scrubber Area */}
          <div 
            ref={rulerRef}
            className="flex-1 h-full relative cursor-ew-resize hover:bg-zinc-800/30 transition-colors"
            onPointerDown={handleRulerPointerDown}
            title="Click or drag here on the timeline ruler to move playhead"
          >
            {/* Second markers */}
            {[0, 5, 10, 15, 20, 25, 30].map(sec => (
              <div 
                key={sec} 
                className="absolute top-1 text-[11px] text-zinc-400 font-mono font-bold pointer-events-none select-none" 
                style={{ left: `${(sec / TOTAL_TIMELINE_SECONDS) * 100}%`, transform: 'translateX(-50%)' }}
              >
                00:{sec.toString().padStart(2, '0')}
              </div>
            ))}

            {/* Minor Tick Marks */}
            {Array.from({ length: 31 }).map((_, i) => (
              <div
                key={i}
                className={`absolute bottom-0 w-[1px] ${i % 5 === 0 ? 'h-3 bg-zinc-400' : 'h-1.5 bg-zinc-700'} pointer-events-none`}
                style={{ left: `${(i / TOTAL_TIMELINE_SECONDS) * 100}%` }}
              />
            ))}

            {/* Playhead Scrubber Needle Triangle on Ruler */}
            <div 
              className="absolute top-0 bottom-0 w-3 -ml-1.5 flex flex-col items-center pointer-events-none z-30"
              style={{ left: `${(playheadTime / TOTAL_TIMELINE_SECONDS) * 100}%` }}
            >
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,1)]" />
              <div className="w-[2px] flex-1 bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,1)]" />
            </div>
          </div>
        </div>

        {/* Tracks Playlist */}
        <div className="flex-1 overflow-y-auto bg-zinc-950 p-2 space-y-2 relative" ref={timelineContainerRef}>
          
          {/* Vertical Time Pointer Line sweeping across all tracks */}
          <div 
            className="absolute top-0 bottom-0 pointer-events-none z-30"
            style={{ 
              left: `calc(0.5rem + 12rem + (100% - 13rem) * ${playheadTime / TOTAL_TIMELINE_SECONDS})` 
            }}
          >
            <div className="w-[2px] h-full bg-gradient-to-b from-yellow-400 via-pink-500 to-purple-500 shadow-[0_0_10px_rgba(250,204,21,1)]" />
          </div>

          {tracks.map(track => (
            <div key={track.id} className="flex h-24 bg-zinc-900/90 rounded-xl border-2 border-zinc-800 overflow-hidden relative shadow-sm">
              
              {/* Track Info (Left Sidebar of Track) */}
              <div className="w-48 bg-zinc-900 border-r-2 border-zinc-800 p-2.5 flex flex-col justify-between shrink-0 z-20 shadow-[2px_0_10px_rgba(0,0,0,0.5)]">
                <div className="font-black text-xs sm:text-sm text-zinc-200 truncate">{track.name}</div>
                
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => toggleMute(track.id)}
                    className={`p-2 rounded-lg font-bold text-xs transition-colors ${
                      track.muted ? 'bg-red-500/20 text-red-500' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                    title={track.muted ? "Unmute track" : "Mute track"}
                  >
                    {track.muted ? <FaVolumeMute size={14} /> : <FaVolumeUp size={14} />}
                  </button>
                  
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">
                    {track.clips.length} {track.clips.length === 1 ? 'clip' : 'clips'}
                  </span>
                </div>
              </div>

              {/* Track Timeline Drop Area */}
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
                {track.clips.map(clip => {
                  const clipDuration = clip.duration || 1;
                  const isVeryShort = clipDuration < 1.5;
                  return (
                    <div 
                      key={clip.id}
                      draggable="true"
                      onDragStart={(e) => handleNativeClipDragStart(e, track.id, clip)}
                      onPointerDown={(e) => {
                        if (e.button === 0 && !e.target.closest('button')) {
                          e.stopPropagation();
                          setDraggingClip({ fromTrackId: track.id, clip, initialX: e.clientX });
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className={`absolute top-2 bottom-2 rounded-lg border-2 border-black shadow-[0_2px_0_0_#000] flex flex-col justify-between p-1 group cursor-grab active:cursor-grabbing hover:scale-[1.02] transition-all overflow-hidden ${clip.color || 'bg-purple-500'}`}
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

                      {/* Dynamic waveform graphic sized to clip duration */}
                      <div className="h-2.5 w-full opacity-40 flex items-end gap-0.5 pointer-events-none overflow-hidden">
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

    </div>
  );
}
