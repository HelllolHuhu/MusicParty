import { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { audioEngine } from './AudioEngine';
import TransportBar from './TransportBar';
import TimelineArranger from './TimelineArranger';
import SampleLibrarySidebar from './SampleLibrarySidebar';
import ReferenceLyricsSidebar from './ReferenceLyricsSidebar';
import VocalBoothModal from './VocalBoothModal';
import InstrumentDrawer from './InstrumentDrawer';
import { DEFAULT_DRUM_CHANNELS } from './presetData';
import { saveTrackState, loadTrackState, clearTrackState } from '../../../services/storageService';

export default function MusicWorkspace({
  roomId,
  playerId,
  roundId = null,
  timeRemaining = 120,
  songDurationSeconds = 60,
  isReady = false,
  readyStatus,
  currentSong = null,
  onFinish
}) {
  // Transport & Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadTime, setPlayheadTime] = useState(0);
  const [bpm, setBpm] = useState(130);
  const [zoom, setZoom] = useState(1);
  const [selectedClipId, setSelectedClipId] = useState(null);

  // Creative Tool View Toggles
  const [showLibrary, setShowLibrary] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState(null); // 'drums' | 'keys' | null
  const [isVocalBoothOpen, setIsVocalBoothOpen] = useState(false);

  // Drum Rack State
  const [drumChannels, setDrumChannels] = useState(DEFAULT_DRUM_CHANNELS);
  const [drumSteps, setDrumSteps] = useState(() => {
    const initial = {};
    DEFAULT_DRUM_CHANNELS.forEach(c => {
      initial[c.id] = Array(16).fill(false);
    });
    initial.kick[0] = true;
    initial.kick[8] = true;
    initial.snare[4] = true;
    initial.snare[12] = true;
    initial.hihat = [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false];
    return initial;
  });

  // Keyboard / Piano Roll State
  const [pianoNotes, setPianoNotes] = useState(() => [
    { id: 'n1', note: 'C4', step: 0, length: 2 },
    { id: 'n2', note: 'D#4', step: 2, length: 2 },
    { id: 'n3', note: 'G4', step: 4, length: 2 },
    { id: 'n4', note: 'A#4', step: 6, length: 2 },
  ]);
  const [pianoInstrument, setPianoInstrument] = useState('pluck');
  const [rootNote, setRootNote] = useState('C');
  const [scaleKey, setScaleKey] = useState('minor_pentatonic');
  const [scaleLock, setScaleLock] = useState(true);

  // Arrangement Tracks
  const [tracks, setTracks] = useState(() => {
    const baseTracks = [
      { id: 't1', name: '🥁 Beat (Drums)', type: 'audio', volume: 100, muted: false, solo: false, clips: [] },
      { id: 't2', name: '🔊 808 Bass', type: 'audio', volume: 100, muted: false, solo: false, clips: [] },
      { id: 't3', name: '🎹 Chords & Keys', type: 'audio', volume: 100, muted: false, solo: false, clips: [] },
      { id: 't4', name: '⚡ Lead Synth', type: 'audio', volume: 100, muted: false, solo: false, clips: [] },
      { id: 't5', name: '🪄 FX & Percs', type: 'audio', volume: 100, muted: false, solo: false, clips: [] },
      { id: 't6', name: '🎤 Vocals', type: 'vocal', volume: 100, muted: false, solo: false, clips: [] },
    ];

    if (currentSong) {
      const refUrl = currentSong.preview_url || currentSong.previewUrl || currentSong.url || '';
      baseTracks.push({
        id: 't_ref',
        name: `🎯 ${currentSong.title || 'Original Song'}`,
        type: 'reference',
        isReference: true,
        volume: 85,
        muted: true, // Muted by default so user can compare optionally
        solo: false,
        clips: refUrl ? [
          {
            id: 'clip_ref_target',
            name: `🎯 ${currentSong.title || 'Original Song'} - Reference`,
            url: refUrl,
            startAt: 0,
            duration: Math.min(songDurationSeconds, 30),
            color: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black',
            isReference: true
          }
        ] : []
      });
    }

    return baseTracks;
  });

  const animFrameRef = useRef(null);
  const tracksRef = useRef(tracks);
  const tapTimesRef = useRef([]);

  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  // --------------------------------------------------------------------------
  // 1. INDEXEDDB PERSISTENCE (Restore on mount, Auto-save debounced)
  // --------------------------------------------------------------------------
  useEffect(() => {
    let isCancelled = false;
    loadTrackState(roomId, playerId, roundId).then(saved => {
      if (!isCancelled && saved && saved.tracks && saved.tracks.length > 0) {
        let restoredTracks = saved.tracks;
        if (currentSong) {
          const refUrl = currentSong.preview_url || currentSong.previewUrl || currentSong.url || '';
          restoredTracks = restoredTracks.map(t => {
            if (t.id === 't_ref') {
              return {
                ...t,
                name: `🎯 ${currentSong.title || 'Original Song'}`,
                clips: refUrl ? [{
                  id: 'clip_ref_target',
                  name: `🎯 ${currentSong.title || 'Original Song'} - Reference`,
                  url: refUrl,
                  startAt: 0,
                  duration: Math.min(songDurationSeconds, 30),
                  color: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black',
                  isReference: true
                }] : t.clips
              };
            }
            return t;
          });
        }
        setTracks(restoredTracks);
        if (saved.bpm) setBpm(saved.bpm);
        // Pre-sync restored tracks to audio engine
        audioEngine.syncTracks(restoredTracks, true, songDurationSeconds, 0);
      }
    });

    return () => { isCancelled = true; };
  }, [roomId, playerId, roundId, songDurationSeconds, currentSong]);

  // Debounced auto-save on tracks or bpm change
  useEffect(() => {
    saveTrackState(roomId, playerId, roundId, {
      tracks,
      bpm,
      songDurationSeconds
    });
  }, [tracks, bpm, songDurationSeconds, roomId, playerId, roundId]);

  // Sync BPM changes with Tone.js
  useEffect(() => {
    audioEngine.setBpm(bpm);
  }, [bpm]);

  // Ensure reference track exists or updates when currentSong prop changes
  useEffect(() => {
    if (!currentSong) return;
    const refUrl = currentSong.preview_url || currentSong.previewUrl || currentSong.url || '';

    setTracks(prev => {
      const exists = prev.some(t => t.id === 't_ref');
      if (exists) {
        return prev.map(t => t.id === 't_ref' ? {
          ...t,
          name: `🎯 ${currentSong.title || 'Original Song'}`,
          clips: refUrl ? [{
            id: 'clip_ref_target',
            name: `🎯 ${currentSong.title || 'Original Song'} - Reference`,
            url: refUrl,
            startAt: 0,
            duration: Math.min(songDurationSeconds, 30),
            color: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black',
            isReference: true
          }] : (t.clips || [])
        } : t);
      } else {
        return [
          ...prev,
          {
            id: 't_ref',
            name: `🎯 ${currentSong.title || 'Original Song'}`,
            type: 'reference',
            isReference: true,
            volume: 85,
            muted: true,
            solo: false,
            clips: refUrl ? [
              {
                id: 'clip_ref_target',
                name: `🎯 ${currentSong.title || 'Original Song'} - Reference`,
                url: refUrl,
                startAt: 0,
                duration: Math.min(songDurationSeconds, 30),
                color: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black',
                isReference: true
              }
            ] : []
          }
        ];
      }
    });
  }, [currentSong, songDurationSeconds]);

  // --------------------------------------------------------------------------
  // 2. PLAYBACK TRANSPORT CONTROLLER (requestAnimationFrame tied to Tone.Transport)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      audioEngine.stop();
      return;
    }

    audioEngine.syncTracks(tracksRef.current, true, songDurationSeconds, playheadTime);
    audioEngine.start(playheadTime).catch(console.error);

    const updatePlayhead = () => {
      if (Tone.Transport.state === 'started') {
        const audioSec = Tone.Transport.seconds % songDurationSeconds;
        setPlayheadTime(audioSec);
      }
      animFrameRef.current = requestAnimationFrame(updatePlayhead);
    };

    animFrameRef.current = requestAnimationFrame(updatePlayhead);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      audioEngine.stop();
    };
  }, [isPlaying, songDurationSeconds]);

  // Spacebar Hotkey to Play/Pause
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const togglePlay = async () => {
    audioEngine.ensureInitialized();
    await Tone.start();
    if (Tone.context.state !== 'running') {
      await Tone.context.resume();
    }
    setIsPlaying(prev => !prev);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setPlayheadTime(0);
    audioEngine.seek(0);
    audioEngine.stop();
  };

  const handleTapTempo = () => {
    const now = performance.now();
    const taps = [...tapTimesRef.current, now].slice(-4);
    tapTimesRef.current = taps;

    if (taps.length >= 2) {
      const intervals = [];
      for (let i = 1; i < taps.length; i++) {
        intervals.push(taps[i] - taps[i - 1]);
      }
      const avgMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgMs);
      if (calculatedBpm >= 60 && calculatedBpm <= 200) {
        setBpm(calculatedBpm);
      }
    }
  };

  // Add new track
  const handleAddTrack = () => {
    const count = tracks.filter(t => !t.isReference).length + 1;
    const newTrack = {
      id: `t_${Date.now()}`,
      name: `🎵 Track ${count}`,
      type: 'audio',
      volume: 100,
      muted: false,
      solo: false,
      clips: []
    };

    setTracks(prev => {
      const refIdx = prev.findIndex(t => t.id === 't_ref');
      if (refIdx !== -1) {
        const next = [...prev];
        next.splice(refIdx, 0, newTrack);
        return next;
      }
      return [...prev, newTrack];
    });
  };

  // Open instrument drawer when clicking track header
  const handleOpenInstrument = (track) => {
    if (track.isReference) return;
    if (track.id === 't1') {
      setActiveDrawer('drums');
    } else {
      if (track.id === 't2') setPianoInstrument('bass');
      else if (track.id === 't4') setPianoInstrument('lead');
      else setPianoInstrument('pluck');
      setActiveDrawer('keys');
    }
  };

  // Stamp Drum Beat Pattern to Track 1 at Playhead
  const handleStampDrums = (patternObj) => {
    const startPos = Math.min(songDurationSeconds - (patternObj.duration || 4), Math.max(0, Math.floor(playheadTime)));
    const newClip = {
      id: `drum_clip_${Date.now()}`,
      name: patternObj.name || '🥁 Drum Pattern',
      color: patternObj.color || 'bg-pink-600',
      startAt: startPos,
      duration: patternObj.duration || 4,
      patternData: patternObj
    };

    setTracks(prev => {
      const next = prev.map(t => t.id === 't1' ? { ...t, clips: [...t.clips, newClip] } : t);
      const updatedTrack = next.find(t => t.id === 't1');
      if (updatedTrack) audioEngine.syncTrackLive(updatedTrack, songDurationSeconds, true);
      return next;
    });

    setActiveDrawer(null);
  };

  // Stamp Melody / Keys Pattern to Track 2, 3, or 4 at Playhead
  const handleStampMelody = (melodyObj) => {
    let targetTrack = 't3';
    if (melodyObj.instrument === 'bass') targetTrack = 't2';
    else if (melodyObj.instrument === 'lead') targetTrack = 't4';

    const startPos = Math.min(songDurationSeconds - (melodyObj.duration || 4), Math.max(0, Math.floor(playheadTime)));
    const newClip = {
      id: `melody_clip_${Date.now()}`,
      name: melodyObj.name || '🎹 Melody',
      color: melodyObj.color || 'bg-purple-600',
      startAt: startPos,
      duration: melodyObj.duration || 4,
      notes: melodyObj.notes,
      instrument: melodyObj.instrument
    };

    setTracks(prev => {
      const next = prev.map(t => t.id === targetTrack ? { ...t, clips: [...t.clips, newClip] } : t);
      const updatedTrack = next.find(t => t.id === targetTrack);
      if (updatedTrack) audioEngine.syncTrackLive(updatedTrack, songDurationSeconds, true);
      return next;
    });

    setActiveDrawer(null);
  };

  // Add Vocal Take from VocalBoothModal
  const handleSaveVocalTake = ({ mode, targetTrackId, url, duration, startAt }) => {
    const newVocalClip = {
      id: `vocal_clip_${Date.now()}`,
      name: '🎤 Vocal Take',
      color: 'bg-emerald-600',
      startAt: Math.min(songDurationSeconds - duration, Math.max(0, startAt)),
      duration: duration || 4,
      url,
      isVocal: true
    };

    if (mode === 'new_track') {
      const vocalCount = tracks.filter(t => t.type === 'vocal').length + 1;
      const newVocalTrack = {
        id: `t_vocal_${Date.now()}`,
        name: `🎤 Vocals ${vocalCount}`,
        type: 'vocal',
        volume: 100,
        muted: false,
        solo: false,
        clips: [newVocalClip]
      };

      setTracks(prev => {
        const refIdx = prev.findIndex(t => t.id === 't_ref');
        let next;
        if (refIdx !== -1) {
          next = [...prev];
          next.splice(refIdx, 0, newVocalTrack);
        } else {
          next = [...prev, newVocalTrack];
        }
        audioEngine.syncTrackLive(newVocalTrack, songDurationSeconds, true);
        return next;
      });
    } else {
      const destId = targetTrackId || 't6';
      setTracks(prev => {
        const next = prev.map(t => t.id === destId ? { ...t, clips: [...t.clips, newVocalClip] } : t);
        const updatedTrack = next.find(t => t.id === destId);
        if (updatedTrack) audioEngine.syncTrackLive(updatedTrack, songDurationSeconds, true);
        return next;
      });
    }
  };

  // Quick Add Sample from Library at current playhead
  const handleAddSampleAtPlayhead = (sampleItem) => {
    let destTrackId = 't5'; // Default to FX
    if (sampleItem.category === 'Drums') destTrackId = 't1';
    else if (sampleItem.category === 'Bass') destTrackId = 't2';
    else if (sampleItem.category === 'Melody') destTrackId = 't3';

    const newClip = {
      id: `clip_${Date.now()}`,
      name: sampleItem.name,
      color: sampleItem.color,
      startAt: Math.min(songDurationSeconds - (sampleItem.duration || 2), Math.max(0, Math.floor(playheadTime))),
      duration: sampleItem.duration || 2,
      sampleId: sampleItem.id,
      soundKey: sampleItem.soundKey,
      isNote: sampleItem.isNote,
      note: sampleItem.note
    };

    setTracks(prev => {
      const next = prev.map(t => t.id === destTrackId ? { ...t, clips: [...t.clips, newClip] } : t);
      const updatedTrack = next.find(t => t.id === destTrackId);
      if (updatedTrack) audioEngine.syncTrackLive(updatedTrack, songDurationSeconds, true);
      return next;
    });
  };

  // Submit track to Firebase and clear IndexedDB for next round
  const handleFinish = async () => {
    const playerCreationTracks = tracks.filter(t => !t.isReference);
    await clearTrackState(roomId, playerId);
    onFinish?.(playerCreationTracks);
  };

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950 text-white rounded-2xl overflow-hidden border-2 border-black shadow-[0_8px_0_0_#000] relative select-none">
      
      {/* 1. Soundtrap-Style Top Transport Bar */}
      <TransportBar
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onStop={handleStop}
        onOpenVocalBooth={() => setIsVocalBoothOpen(true)}
        bpm={bpm}
        setBpm={setBpm}
        onTapTempo={handleTapTempo}
        playheadTime={playheadTime}
        songDurationSeconds={songDurationSeconds}
        zoom={zoom}
        setZoom={setZoom}
        showLibrary={showLibrary}
        setShowLibrary={setShowLibrary}
        showLyrics={showLyrics}
        setShowLyrics={setShowLyrics}
        activeDrawer={activeDrawer}
        setActiveDrawer={setActiveDrawer}
        isReady={isReady}
        readyStatus={readyStatus}
        onFinish={handleFinish}
      />

      {/* 2. Main Center Body: Multi-Track Timeline Arranger + Collapsible Sidebars */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden bg-zinc-950">
        
        {/* Multi-Track Timeline Arranger */}
        <TimelineArranger
          tracks={tracks}
          setTracks={setTracks}
          songDurationSeconds={songDurationSeconds}
          playheadTime={playheadTime}
          setPlayheadTime={setPlayheadTime}
          zoom={zoom}
          setZoom={setZoom}
          selectedClipId={selectedClipId}
          setSelectedClipId={setSelectedClipId}
          onOpenInstrument={handleOpenInstrument}
          onAddTrack={handleAddTrack}
        />

        {/* Collapsible Sample / Loop Library Sidebar */}
        <SampleLibrarySidebar
          isOpen={showLibrary}
          onClose={() => setShowLibrary(false)}
          onAddSampleAtPlayhead={handleAddSampleAtPlayhead}
        />

        {/* Collapsible Reference Lyrics Sidebar */}
        <ReferenceLyricsSidebar
          isOpen={showLyrics}
          onClose={() => setShowLyrics(false)}
          currentSong={currentSong}
        />

      </div>

      {/* 3. Slide-Up Instrument Drawer (Drum Rack & Piano Roll / Keyboard) */}
      <InstrumentDrawer
        activeDrawer={activeDrawer}
        onClose={() => setActiveDrawer(null)}
        drumSteps={drumSteps}
        setDrumSteps={setDrumSteps}
        drumChannels={drumChannels}
        setChannels={setDrumChannels}
        onStampDrums={handleStampDrums}
        pianoNotes={pianoNotes}
        setPianoNotes={setPianoNotes}
        setNotes={setPianoNotes}
        pianoInstrument={pianoInstrument}
        setPianoInstrument={setPianoInstrument}
        rootNote={rootNote}
        setRootNote={setRootNote}
        scaleKey={scaleKey}
        setScaleKey={setScaleKey}
        scaleLock={scaleLock}
        setScaleLock={setScaleLock}
        onStampMelody={handleStampMelody}
        isPlaying={isPlaying}
        currentStep={Math.floor((playheadTime / (60 / bpm / 4)) % 16)}
      />

      {/* 4. Dedicated Vocal Recording Booth Modal */}
      <VocalBoothModal
        isOpen={isVocalBoothOpen}
        onClose={() => setIsVocalBoothOpen(false)}
        tracks={tracks}
        playheadTime={playheadTime}
        onSaveTake={handleSaveVocalTake}
      />

    </div>
  );
}
