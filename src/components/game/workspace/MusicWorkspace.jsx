import { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { audioEngine } from './AudioEngine';
import FLMobileHeader from './FLMobileHeader';
import FLMobileArranger from './FLMobileArranger';
import FLMobileDrumRack from './FLMobileDrumRack';
import FLMobileKeyboard from './FLMobileKeyboard';
import FLMobileVocalRecorder from './FLMobileVocalRecorder';
import { DEFAULT_DRUM_CHANNELS } from './presetData';

const TOTAL_TIMELINE_SECONDS = 30;

export default function MusicWorkspace({
  roomId,
  playerId,
  timeRemaining = 120,
  isReady = false,
  readyStatus,
  currentSong = null,
  onFinish
}) {
  // FL Mobile View Tabs: 'arranger' | 'drums' | 'keys' | 'vocal'
  const [activeTab, setActiveTab] = useState('arranger');

  // Transport & Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadTime, setPlayheadTime] = useState(0);
  const [currentStep, setCurrentStep] = useState(0); // 0 to 15
  const [bpm, setBpm] = useState(130);
  const [activeTrackId, setActiveTrackId] = useState('t1');
  const [zoom, setZoom] = useState(1);

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

  // Arrangement Tracks (Tracks 1 to 6 + Reference Song Track at bottom)
  const [tracks, setTracks] = useState(() => {
    const baseTracks = [
      { id: 't1', name: '🥁 Beat (Drums)', type: 'audio', muted: false, clips: [] },
      { id: 't2', name: '🔊 808 Bass', type: 'audio', muted: false, clips: [] },
      { id: 't3', name: '🎹 Chords & Keys', type: 'audio', muted: false, clips: [] },
      { id: 't4', name: '⚡ Lead Synth', type: 'audio', muted: false, clips: [] },
      { id: 't5', name: '🪄 FX & Percs', type: 'audio', muted: false, clips: [] },
      { id: 't6', name: '🎤 Vocal Take', type: 'vocal', muted: false, clips: [] },
    ];

    if (currentSong && (currentSong.preview_url || currentSong.previewUrl)) {
      baseTracks.push({
        id: 't_ref',
        name: `🎯 ${currentSong.title || 'Original Song'}`,
        type: 'reference',
        isReference: true,
        muted: true, // Muted by default so it doesn't clash with user beat unless unmuted
        clips: [
          {
            id: 'clip_ref_target',
            name: `🎯 ${currentSong.title || 'Original Song'} - Reference`,
            url: currentSong.preview_url || currentSong.previewUrl,
            startAt: 0,
            duration: 30,
            color: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black',
            isReference: true
          }
        ]
      });
    }

    return baseTracks;
  });

  // Ensure reference track exists or updates when currentSong is passed/changed
  useEffect(() => {
    if (!currentSong) return;
    const refUrl = currentSong.preview_url || currentSong.previewUrl;
    if (!refUrl) return;

    setTracks(prev => {
      const exists = prev.some(t => t.id === 't_ref');
      if (exists) {
        return prev.map(t => t.id === 't_ref' ? {
          ...t,
          name: `🎯 ${currentSong.title || 'Original Song'}`,
          clips: [{
            id: 'clip_ref_target',
            name: `🎯 ${currentSong.title || 'Original Song'} - Reference`,
            url: refUrl,
            startAt: 0,
            duration: 30,
            color: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black',
            isReference: true
          }]
        } : t);
      } else {
        return [
          ...prev,
          {
            id: 't_ref',
            name: `🎯 ${currentSong.title || 'Original Song'}`,
            type: 'reference',
            isReference: true,
            muted: true,
            clips: [
              {
                id: 'clip_ref_target',
                name: `🎯 ${currentSong.title || 'Original Song'} - Reference`,
                url: refUrl,
                startAt: 0,
                duration: 30,
                color: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black',
                isReference: true
              }
            ]
          }
        ];
      }
    });
  }, [currentSong]);

  // Contextual Hint Banner
  const [hintMessage, setHintMessage] = useState(
    "💡 Adobe Audition Timeline: Click/drag playhead to scrub audio with proportional velocity, use Ctrl+Scroll to zoom, and hit Play to listen from any position!"
  );

  // Synchronous references for real-time Web Audio Transport loops
  const drumStepsRef = useRef(drumSteps);
  const drumChannelsRef = useRef(drumChannels);
  const pianoNotesRef = useRef(pianoNotes);
  const pianoInstrumentRef = useRef(pianoInstrument);
  const tracksRef = useRef(tracks);
  const tapTimesRef = useRef([]);
  const animFrameRef = useRef(null);
  const playStartTimeRef = useRef(0);
  const startOffsetRef = useRef(0);

  useEffect(() => { drumStepsRef.current = drumSteps; }, [drumSteps]);
  useEffect(() => { drumChannelsRef.current = drumChannels; }, [drumChannels]);
  useEffect(() => { pianoNotesRef.current = pianoNotes; }, [pianoNotes]);
  useEffect(() => { pianoInstrumentRef.current = pianoInstrument; }, [pianoInstrument]);
  useEffect(() => { tracksRef.current = tracks; }, [tracks]);

  // Sync BPM changes with AudioEngine
  useEffect(() => {
    audioEngine.setBpm(bpm);
  }, [bpm]);

  // Clean up any stale localStorage from past sessions
  useEffect(() => {
    try {
      localStorage.removeItem(`track_${roomId}_${playerId}`);
    } catch {
      // ignore
    }
  }, [roomId, playerId]);

  // --------------------------------------------------------------------------
  // TRANSPORT PLAYBACK CONTROLLER (1X via requestAnimationFrame, pause in place, reset to 0 on stop)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      audioEngine.stop();
      return;
    }

    // Mode 1: DRUMS -> Infinite 16-step Drum Machine Loop
    if (activeTab === 'drums') {
      audioEngine.startSequencerLive(
        () => drumStepsRef.current,
        () => drumChannelsRef.current,
        (step) => setCurrentStep(step)
      ).catch(console.error);
    }
    // Mode 2: KEYS -> Infinite 16-step Piano Roll / Keyboard Loop
    else if (activeTab === 'keys') {
      audioEngine.startPianoRollLive(
        () => pianoNotesRef.current,
        () => pianoInstrumentRef.current,
        (step) => setCurrentStep(step)
      ).catch(console.error);
    }
    // Mode 3: PLAYLIST (Arranger) -> 30s Multi-Track Arrangement Playback from current playheadTime
    else if (activeTab === 'arranger') {
      playStartTimeRef.current = performance.now();
      startOffsetRef.current = playheadTime;

      audioEngine.syncTracks(tracksRef.current, true, TOTAL_TIMELINE_SECONDS, playheadTime);
      audioEngine.start(playheadTime).catch(console.error);

      const updateTimelineScrubber = () => {
        const elapsed = (performance.now() - playStartTimeRef.current) / 1000;
        const currentPos = (startOffsetRef.current + elapsed) % TOTAL_TIMELINE_SECONDS;
        setPlayheadTime(currentPos);

        const stepDuration = 60 / bpm / 4;
        const stepIndex = Math.floor((currentPos / stepDuration) % 16);
        setCurrentStep(stepIndex);

        animFrameRef.current = requestAnimationFrame(updateTimelineScrubber);
      };

      animFrameRef.current = requestAnimationFrame(updateTimelineScrubber);
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      audioEngine.stop();
    };
  }, [isPlaying, activeTab]);

  // Spacebar Hotkey to Play/Pause & Mode Switch hotkeys
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === '1') {
        handleTabChange('arranger');
      } else if (e.key === '2') {
        handleTabChange('drums');
      } else if (e.key === '3') {
        handleTabChange('keys');
      } else if (e.key === '4') {
        handleTabChange('vocal');
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
    setCurrentStep(0);
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

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    if (newTab === 'arranger') {
      setHintMessage("🎛️ Playlist: Click & drag playhead to scrub audio with proportional velocity, use zoom, and listen from any offset!");
    } else if (newTab === 'drums') {
      setHintMessage("🥁 Drum Rack: Tap pads to create your beat, hit Play to hear it live, then click 'Stamp to Playlist'!");
    } else if (newTab === 'keys') {
      setHintMessage("🎹 Keyboard & Piano Roll: Scale Lock is active! Tap keys and grid to make a catchy melody!");
    } else if (newTab === 'vocal') {
      setHintMessage("🎤 Vocal Booth: Record custom vocals, singing, or ad-libs and place them onto your song!");
    }
  };

  // Stamp Drum Beat Pattern to Track 1
  const handleStampDrums = (drumPatternObj) => {
    const startPos = Math.min(TOTAL_TIMELINE_SECONDS - (drumPatternObj.duration || 4), Math.max(0, Math.floor(playheadTime)));
    const newClip = {
      id: `drum_clip_${Date.now()}`,
      name: drumPatternObj.name || '🥁 Drum Beat',
      color: drumPatternObj.color || 'bg-red-500',
      startAt: startPos,
      duration: drumPatternObj.duration || 4,
      patternData: drumPatternObj
    };

    setTracks(prev => prev.map(t => t.id === 't1' ? { ...t, clips: [...t.clips, newClip] } : t));
    setActiveTab('arranger');
    setHintMessage(`✓ Stamped "${drumPatternObj.name}" onto Track 1 at 00:${startPos.toString().padStart(2, '0')}!`);
  };

  // Stamp Melodic Note Pattern to Track 2, 3, or 4
  const handleStampMelody = (melodyObj) => {
    let targetTrack = 't3';
    if (melodyObj.instrument === 'bass') targetTrack = 't2';
    else if (melodyObj.instrument === 'lead') targetTrack = 't4';

    const startPos = Math.min(TOTAL_TIMELINE_SECONDS - (melodyObj.duration || 4), Math.max(0, Math.floor(playheadTime)));
    const newClip = {
      id: `melody_clip_${Date.now()}`,
      name: melodyObj.name || '🎹 Melody',
      color: melodyObj.color || 'bg-purple-500',
      startAt: startPos,
      duration: melodyObj.duration || 4,
      notes: melodyObj.notes,
      instrument: melodyObj.instrument
    };

    setTracks(prev => prev.map(t => t.id === targetTrack ? { ...t, clips: [...t.clips, newClip] } : t));
    setActiveTab('arranger');
    setHintMessage(`✓ Stamped "${melodyObj.name}" onto ${tracks.find(t => t.id === targetTrack)?.name || 'Track'}!`);
  };

  // Add Vocal Clip
  const handleAddVocalClip = ({ trackId, url, duration, startAt, name }) => {
    const newVocalClip = {
      id: `vocal_clip_${Date.now()}`,
      name: name || '🎤 Vocal Take',
      color: 'bg-emerald-500',
      startAt: Math.min(TOTAL_TIMELINE_SECONDS - duration, Math.max(0, startAt)),
      duration: duration || 4,
      url,
      isVocal: true
    };

    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, clips: [...t.clips, newVocalClip] } : t));
    setActiveTab('arranger');
    setHintMessage(`✓ Saved vocal take to ${tracks.find(t => t.id === trackId)?.name || 'Track'}!`);
  };

  // Add Track
  const handleAddTrack = () => {
    const userTrackCount = tracks.filter(t => !t.isReference).length + 1;
    const newTrack = {
      id: `t${Date.now()}`,
      name: `🎵 Track ${userTrackCount}`,
      type: 'audio',
      muted: false,
      clips: []
    };

    // Insert before reference track if it exists
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

  // Open Track Editor when clicking track header in arranger
  const handleOpenTrackEditor = (track) => {
    if (track.isReference) return;
    if (track.id === 't1') {
      setActiveTab('drums');
    } else if (track.id === 't6' || track.type === 'vocal') {
      setActiveTab('vocal');
    } else {
      if (track.id === 't2') setPianoInstrument('bass');
      else if (track.id === 't4') setPianoInstrument('lead');
      else setPianoInstrument('pluck');
      setActiveTab('keys');
    }
  };

  // Submit track without reference track
  const handleFinish = () => {
    const playerCreationTracks = tracks.filter(t => !t.isReference);
    onFinish?.(playerCreationTracks);
  };

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950 text-white rounded-2xl overflow-hidden border-2 border-black shadow-[0_6px_0_0_#000] relative">
      
      {/* Adobe Audition / FL Mobile Header Transport Bar */}
      <FLMobileHeader
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onStop={handleStop}
        isRecording={false}
        onToggleRecord={() => setActiveTab('vocal')}
        bpm={bpm}
        setBpm={setBpm}
        onTapTempo={handleTapTempo}
        playheadTime={playheadTime}
        timeRemaining={timeRemaining}
        isReady={isReady}
        readyStatus={readyStatus}
        zoom={zoom}
        setZoom={setZoom}
        onFinish={handleFinish}
      />

      {/* Floating Micro-Tutorial / Hint Ribbon */}
      <div className="bg-gradient-to-r from-orange-950/40 via-amber-950/30 to-zinc-950 px-4 py-1 border-b border-zinc-900 text-center text-[11px] font-bold text-orange-300 select-none shrink-0 truncate">
        {hintMessage}
      </div>

      {/* Main Active Viewport */}
      <div className="flex-1 flex min-h-0 bg-zinc-950 overflow-hidden relative">
        
        {activeTab === 'arranger' && (
          <FLMobileArranger
            tracks={tracks}
            setTracks={setTracks}
            activeTrackId={activeTrackId}
            setActiveTrackId={setActiveTrackId}
            playheadTime={playheadTime}
            setPlayheadTime={setPlayheadTime}
            onOpenTrackEditor={handleOpenTrackEditor}
            onAddTrack={handleAddTrack}
            zoom={zoom}
            setZoom={setZoom}
          />
        )}

        {activeTab === 'drums' && (
          <FLMobileDrumRack
            steps={drumSteps}
            setSteps={setDrumSteps}
            channels={drumChannels}
            setChannels={setDrumChannels}
            onStampToPlaylist={handleStampDrums}
            isPlaying={isPlaying}
            currentStep={currentStep}
          />
        )}

        {activeTab === 'keys' && (
          <FLMobileKeyboard
            notes={pianoNotes}
            setNotes={setPianoNotes}
            instrument={pianoInstrument}
            setInstrument={setPianoInstrument}
            rootNote={rootNote}
            setRootNote={setRootNote}
            scaleKey={scaleKey}
            setScaleKey={setScaleKey}
            scaleLock={scaleLock}
            setScaleLock={setScaleLock}
            onStampToPlaylist={handleStampMelody}
            isPlaying={isPlaying}
            currentStep={currentStep}
          />
        )}

        {activeTab === 'vocal' && (
          <FLMobileVocalRecorder
            onAddVocalClip={handleAddVocalClip}
            tracks={tracks}
            playheadTime={playheadTime}
          />
        )}

      </div>

    </div>
  );
}
