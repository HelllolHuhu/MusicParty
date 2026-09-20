import { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause, FaStop, FaMicrophone } from 'react-icons/fa';
import * as Tone from 'tone';
import { useLanguage } from '../../../context/LanguageContext';
import { audioEngine } from './AudioEngine';
import StepSequencerTab from './StepSequencerTab';
import PianoRollTab from './PianoRollTab';
import PlaylistArrangerTab from './PlaylistArrangerTab';
import SampleBrowserSidebar from './SampleBrowserSidebar';
import { DEFAULT_DRUM_CHANNELS } from './presetData';

const TOTAL_TIMELINE_SECONDS = 30;

export default function MusicWorkspace({
  roomId,
  playerId,
  timeRemaining,
  isReady,
  readyStatus,
  onFinish
}) {
  const { t } = useLanguage();
  
  // Active DAW Mode: 'sequencer' | 'pianoroll' | 'arranger'
  const [activeTab, setActiveTab] = useState('sequencer');
  
  // Transport State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadTime, setPlayheadTime] = useState(0);
  const [currentStep, setCurrentStep] = useState(0); // 0 to 15 for live sequencer / piano roll
  const [bpm, setBpm] = useState(130);
  const [swing, setSwing] = useState(0);
  const [masterVolume, setMasterVolume] = useState(85);
  const [isMuted, setIsMuted] = useState(false);

  // Micro-tutorial floating toast
  const [tutorialHint, setTutorialHint] = useState(
    "💡 Beat Maker: Click pads to build a drum rhythm, hit Play to listen live in an infinite loop, then switch to Arranger to lay out your song!"
  );

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingCountdown, setRecordingCountdown] = useState(0);
  const [micError, setMicError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordStartTimeRef = useRef(0);
  const recordStartPlayheadRef = useRef(0);

  // Step Sequencer State (Persistent across tab switches)
  const [sequencerChannels, setSequencerChannels] = useState(DEFAULT_DRUM_CHANNELS);
  const [sequencerSteps, setSequencerSteps] = useState(() => {
    const initial = {};
    DEFAULT_DRUM_CHANNELS.forEach(c => {
      initial[c.id] = Array(16).fill(false);
    });
    // Add default starting kick & snare
    initial.kick[0] = true;
    initial.kick[8] = true;
    initial.snare[4] = true;
    initial.snare[12] = true;
    initial.hihat = [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false];
    return initial;
  });
  const [activePatternIndex, setActivePatternIndex] = useState(1);

  // Piano Roll State (Persistent across tab switches)
  const [pianoNotes, setPianoNotes] = useState(() => [
    { id: 'n1', note: 'C4', step: 0, length: 2 },
    { id: 'n2', note: 'D#4', step: 2, length: 2 },
    { id: 'n3', note: 'G4', step: 4, length: 2 },
    { id: 'n4', note: 'A#4', step: 6, length: 2 },
  ]);
  const [pianoInstrument, setPianoInstrument] = useState('pluck');

  // Multi-track arrangement timeline (Tracks 1 to 6)
  const [tracks, setTracks] = useState(() => [
    { id: 't1', name: '🥁 Beat (Drums)', type: 'audio', volume: 100, muted: false, clips: [] },
    { id: 't2', name: '🔊 808 Bass', type: 'audio', volume: 100, muted: false, clips: [] },
    { id: 't3', name: '🎹 Chords & Keys', type: 'audio', volume: 100, muted: false, clips: [] },
    { id: 't4', name: '⚡ Lead Synth', type: 'audio', volume: 100, muted: false, clips: [] },
    { id: 't5', name: '🪄 FX & Percs', type: 'audio', volume: 100, muted: false, clips: [] },
    { id: 't6', name: '🎤 Vocal Take', type: 'vocal', volume: 100, muted: false, clips: [] },
  ]);

  // Stamping & Dragging State
  const [selectedSample, setSelectedSample] = useState(null);
  const [pointerDrag, setPointerDrag] = useState(null);
  const [draggingClip, setDraggingClip] = useState(null);

  // Synchronous refs for real-time live audio callbacks
  const sequencerStepsRef = useRef(sequencerSteps);
  const sequencerChannelsRef = useRef(sequencerChannels);
  const pianoNotesRef = useRef(pianoNotes);
  const pianoInstrumentRef = useRef(pianoInstrument);
  const tracksRef = useRef(tracks);

  useEffect(() => {
    sequencerStepsRef.current = sequencerSteps;
  }, [sequencerSteps]);

  useEffect(() => {
    sequencerChannelsRef.current = sequencerChannels;
  }, [sequencerChannels]);

  useEffect(() => {
    pianoNotesRef.current = pianoNotes;
  }, [pianoNotes]);

  useEffect(() => {
    pianoInstrumentRef.current = pianoInstrument;
  }, [pianoInstrument]);

  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  const animFrameRef = useRef(null);
  const playStartTimeRef = useRef(0);
  const startOffsetRef = useRef(0);
  const tapTimesRef = useRef([]);

  // Clean up any old leftover localstorage track items
  useEffect(() => {
    try {
      localStorage.removeItem(`track_${roomId}_${playerId}`);
    } catch {
      // ignore
    }
  }, [roomId, playerId]);

  // Sync BPM & Swing with AudioEngine
  useEffect(() => {
    audioEngine.setBpm(bpm);
  }, [bpm]);

  useEffect(() => {
    audioEngine.setSwing(swing);
  }, [swing]);

  useEffect(() => {
    if (isMuted) {
      audioEngine.setMasterVolume(-100);
    } else {
      const dbVal = masterVolume === 0 ? -100 : (masterVolume - 85) * 0.4;
      audioEngine.setMasterVolume(dbVal);
    }
  }, [masterVolume, isMuted]);

  // --------------------------------------------------------------------------
  // UNIFIED LIVE PLAYBACK CONTROLLER
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      audioEngine.stop();
      return;
    }

    // 1. BEAT MAKER MODE -> Live Infinite 16-step Sequencer Loop
    if (activeTab === 'sequencer') {
      audioEngine.startSequencerLive(
        () => sequencerStepsRef.current,
        () => sequencerChannelsRef.current,
        (step) => setCurrentStep(step)
      ).catch(console.error);
    }
    // 2. PIANO ROLL MODE -> Live Infinite 16-step Piano Roll Loop
    else if (activeTab === 'pianoroll') {
      audioEngine.startPianoRollLive(
        () => pianoNotesRef.current,
        () => pianoInstrumentRef.current,
        (step) => setCurrentStep(step)
      ).catch(console.error);
    }
    // 3. ARRANGER MODE -> 30s Multi-track Timeline Arrangement Playback
    else if (activeTab === 'arranger') {
      playStartTimeRef.current = performance.now();
      startOffsetRef.current = playheadTime;

      audioEngine.syncTracks(tracksRef.current, true, TOTAL_TIMELINE_SECONDS);
      audioEngine.start(playheadTime).catch(console.error);

      const updateArrangerLoop = () => {
        const elapsed = (performance.now() - playStartTimeRef.current) / 1000;
        const currentPos = (startOffsetRef.current + elapsed) % TOTAL_TIMELINE_SECONDS;
        setPlayheadTime(currentPos);

        const stepDuration = 60 / bpm / 4;
        const stepIndex = Math.floor((currentPos / stepDuration) % 16);
        setCurrentStep(stepIndex);

        animFrameRef.current = requestAnimationFrame(updateArrangerLoop);
      };

      animFrameRef.current = requestAnimationFrame(updateArrangerLoop);
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      audioEngine.stop();
    };
  }, [isPlaying, activeTab]);

  // Spacebar hotkey to Play/Pause & Mode hotkeys [1], [2], [3]
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === '1') {
        handleTabSwitch('sequencer');
      } else if (e.key === '2') {
        handleTabSwitch('pianoroll');
      } else if (e.key === '3') {
        handleTabSwitch('arranger');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTabSwitch = (tabKey) => {
    setActiveTab(tabKey);
    if (tabKey === 'sequencer') {
      setTutorialHint("💡 Beat Maker: Click pads to make your drum rhythm, then hit Play to listen live!");
    } else if (tabKey === 'pianoroll') {
      setTutorialHint("💡 Piano Roll: Scale Lock is ON! Any note you place will sound in-tune and harmonious!");
    } else if (tabKey === 'arranger') {
      setTutorialHint("💡 Arranger: Stamp your drum rhythms and melody patterns across the 30s timeline to complete your song!");
    }
  };

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

  // Stamp a drum pattern from Sequencer to Timeline Track 1
  const handleStampDrumPattern = (patternObj) => {
    const placeTime = Math.round(playheadTime * 2) / 2;
    const adjustedStart = Math.min(TOTAL_TIMELINE_SECONDS - patternObj.duration, Math.max(0, placeTime));

    const newClip = {
      id: `drum_pat_${Date.now()}`,
      name: patternObj.name,
      color: patternObj.color || 'bg-red-500',
      startAt: adjustedStart,
      duration: patternObj.duration || 4,
      patternData: patternObj
    };

    setTracks(prev => prev.map(t => t.id === 't1' ? { ...t, clips: [...t.clips, newClip] } : t));
    setActiveTab('arranger');
    setTutorialHint(`✓ Stamped "${patternObj.name}" onto Track 1 at 00:${Math.floor(adjustedStart).toString().padStart(2, '0')}!`);
  };

  // Stamp a melody pattern from Piano Roll to Timeline Track 2 or 3
  const handleStampMelody = (melodyObj) => {
    const targetTrackId = melodyObj.instrument === 'bass' ? 't2' : 't3';
    const placeTime = Math.round(playheadTime * 2) / 2;
    const adjustedStart = Math.min(TOTAL_TIMELINE_SECONDS - melodyObj.duration, Math.max(0, placeTime));

    const newClip = {
      id: `melody_pat_${Date.now()}`,
      name: melodyObj.name,
      instrument: melodyObj.instrument,
      color: melodyObj.color || 'bg-purple-500',
      startAt: adjustedStart,
      duration: melodyObj.duration || 4,
      notes: melodyObj.notes
    };

    setTracks(prev => prev.map(t => t.id === targetTrackId ? { ...t, clips: [...t.clips, newClip] } : t));
    setActiveTab('arranger');
    setTutorialHint(`✓ Stamped "${melodyObj.name}" onto ${targetTrackId === 't2' ? 'Bass Track' : 'Keys/Synth Track'}!`);
  };

  // Quick 1-click Add from Sidebar
  const handleQuickAdd = (sample) => {
    let targetTrackId = 't1';
    if (sample.category === 'Bass') targetTrackId = 't2';
    else if (sample.category === 'Melody') targetTrackId = 't3';
    else if (sample.category === 'FX') targetTrackId = 't5';

    const placeTime = Math.round(playheadTime * 2) / 2;
    const duration = sample.duration || 1;
    const adjustedStart = Math.min(TOTAL_TIMELINE_SECONDS - duration, Math.max(0, placeTime));

    const newClip = {
      id: `clip_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      sampleId: sample.id,
      name: sample.name,
      category: sample.category,
      color: sample.color,
      startAt: adjustedStart,
      duration: duration
    };

    setTracks(prev => prev.map(t => t.id === targetTrackId ? { ...t, clips: [...t.clips, newClip] } : t));
  };

  // Vocal Take Recording with 3-2-1 Countdown
  const startRecordingFlow = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      setRecordingCountdown(3);
      const cInterval = setInterval(() => {
        setRecordingCountdown(prev => {
          if (prev <= 1) {
            clearInterval(cInterval);
            beginActualRecording(stream);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Mic access error:", err);
      setMicError(t('game.allowMic') || "Please allow microphone access!");
      setTimeout(() => setMicError(null), 4000);
    }
  };

  const beginActualRecording = (stream) => {
    try {
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      recordStartTimeRef.current = Date.now();
      recordStartPlayheadRef.current = playheadTime;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const elapsedSec = Math.max(0.5, Math.min(
          TOTAL_TIMELINE_SECONDS,
          Math.round(((Date.now() - recordStartTimeRef.current) / 1000) * 10) / 10
        ));

        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Url = reader.result;
          const startPos = Math.min(
            TOTAL_TIMELINE_SECONDS - elapsedSec,
            Math.max(0, Math.round(recordStartPlayheadRef.current * 2) / 2)
          );

          const newVocalClip = {
            id: `vocal_${Date.now()}`,
            name: `🎙️ Vocal (${elapsedSec}s)`,
            color: 'bg-emerald-500',
            startAt: startPos,
            duration: elapsedSec,
            url: base64Url,
            isVocal: true
          };

          setTracks(prev => {
            const next = [...prev];
            const vTrackIndex = next.findIndex(t => t.type === 'vocal');
            const targetIdx = vTrackIndex !== -1 ? vTrackIndex : (next.length - 1);
            next[targetIdx] = {
              ...next[targetIdx],
              clips: [...next[targetIdx].clips, newVocalClip]
            };
            return next;
          });

          setActiveTab('arranger');
          setTutorialHint(`✓ Vocal take recorded (${elapsedSec}s) and placed on timeline!`);
        };

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPlaying(true);
    } catch (e) {
      console.error("Recording start error:", e);
      setMicError("Microphone initialization failed");
      setTimeout(() => setMicError(null), 4000);
    }
  };

  const stopRecordingFlow = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPlaying(false);
    }
  };

  return (
    <div className="flex h-full bg-zinc-950 text-white rounded-xl overflow-hidden border-2 border-zinc-800 relative flex-col">
      
      {/* Mic Error Banner */}
      {micError && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white font-black text-xs px-4 py-2 rounded-xl border border-black shadow-[0_4px_0_0_#000] animate-bounce">
          {micError}
        </div>
      )}

      {/* Floating Drag Avatar */}
      {pointerDrag && (
        <div
          className={`fixed pointer-events-none z-50 px-3 py-1.5 rounded-xl border-2 border-black font-black text-xs text-black shadow-2xl scale-110 -translate-x-1/2 -translate-y-1/2 ${pointerDrag.sample.color}`}
          style={{ left: pointerDrag.x, top: pointerDrag.y }}
        >
          🎵 {pointerDrag.sample.name}
        </div>
      )}

      {/* Top Master DAW Toolbar */}
      <div className="h-16 bg-zinc-900 border-b-2 border-zinc-800 flex items-center justify-between px-4 sm:px-6 shrink-0 gap-3 select-none">
        
        {/* Left: Transport Controls (Play, Stop, Record, BPM, Swing) */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Play / Pause */}
          <button
            onClick={togglePlay}
            className={`w-11 h-11 rounded-2xl border-2 border-black font-black flex items-center justify-center text-lg shadow-[0_3px_0_0_#000] active:translate-y-0.5 active:shadow-[0_1px_0_0_#000] transition-all ${
              isPlaying
                ? 'bg-amber-400 hover:bg-amber-300 text-black animate-pulse'
                : 'bg-emerald-500 hover:bg-emerald-400 text-white'
            }`}
            title={isPlaying ? "Pause Studio (Space)" : "Play Studio (Space)"}
          >
            {isPlaying ? <FaPause size={15} /> : <FaPlay size={15} className="ml-0.5" />}
          </button>

          {/* Stop / Rewind */}
          <button
            onClick={handleStop}
            className="w-10 h-10 rounded-2xl border-2 border-black bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center text-sm shadow-[0_2px_0_0_#000] active:translate-y-0.5 transition-all"
            title="Stop & Rewind to Start"
          >
            <FaStop size={12} />
          </button>

          {/* Vocal Record Button */}
          <button
            onClick={isRecording ? stopRecordingFlow : startRecordingFlow}
            className={`w-10 h-10 rounded-2xl border-2 border-black flex items-center justify-center text-sm shadow-[0_2px_0_0_#000] active:translate-y-0.5 transition-all ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]'
                : 'bg-zinc-800 hover:bg-red-500/30 text-red-400 hover:text-white'
            }`}
            title={isRecording ? "Stop Recording" : "Record Vocal Take"}
          >
            <FaMicrophone size={14} />
          </button>

          {/* BPM Controller */}
          <div className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1.5 rounded-xl border border-zinc-800">
            <span className="text-[10px] font-black uppercase text-pink-400">BPM</span>
            <input
              type="number"
              min="60"
              max="200"
              value={bpm}
              onChange={(e) => setBpm(Math.max(60, Math.min(200, Number(e.target.value))))}
              className="w-12 bg-transparent text-white font-mono font-black text-xs text-center outline-none"
            />
            <button
              onClick={handleTapTempo}
              className="text-[9px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-black px-1.5 py-0.5 rounded border border-zinc-700 active:scale-95"
              title="Click in rhythm to tap tempo"
            >
              TAP
            </button>
          </div>

          {/* Time Scrubber Display */}
          <div className="bg-black/60 px-3 py-1.5 rounded-xl border border-zinc-800 font-mono font-bold text-xs text-yellow-300 flex items-center gap-1">
            <span>⏱ 00:{Math.floor(playheadTime).toString().padStart(2, '0')} / 00:30</span>
          </div>
        </div>

        {/* Center: Mode Switcher Tabs (Sequencer, Piano Roll, Arranger) */}
        <div className="flex bg-zinc-950 p-1 rounded-2xl border-2 border-black gap-1 shadow-inner">
          {[
            { key: 'sequencer', label: '🥁 Beat Maker', hotkey: '1' },
            { key: 'pianoroll', label: '🎹 Piano Roll', hotkey: '2' },
            { key: 'arranger', label: '🎛️ Arranger', hotkey: '3' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabSwitch(tab.key)}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_2px_0_0_#000] scale-105'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[9px] bg-black/40 px-1 rounded opacity-75">[{tab.hotkey}]</span>
            </button>
          ))}
        </div>

        {/* Right: Round Timer & Finish Button */}
        <div className="flex items-center gap-3">
          
          {/* Creation Timer */}
          <div className="font-mono text-lg font-black text-pink-500 bg-black/60 px-3 py-1 rounded-xl border border-zinc-800">
            {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
          </div>

          {/* Finish Track */}
          <button
            onClick={() => onFinish(tracks)}
            className={`btn-chunky font-black text-xs sm:text-sm px-4 py-2 transition-all flex items-center gap-1.5 ${
              isReady
                ? 'bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.6)] animate-pulse'
                : 'btn-chunky-green'
            }`}
          >
            <span>{isReady ? '✓ Ready!' : t('game.finishTrack')}</span>
            {isReady && readyStatus && (
              <span className="bg-black/30 px-1.5 py-0.5 rounded font-mono text-[10px]">
                ({readyStatus.ready}/{readyStatus.total})
              </span>
            )}
          </button>
        </div>

      </div>

      {/* Floating Tutorial Hint Banner */}
      <div className="bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-zinc-950 px-4 py-1 border-b border-zinc-800 text-center text-xs font-bold text-pink-300">
        {tutorialHint}
      </div>

      {/* Main Studio Body Workspace */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        
        {/* Left Sample Browser */}
        <SampleBrowserSidebar
          selectedSample={selectedSample}
          setSelectedSample={setSelectedSample}
          onQuickAdd={handleQuickAdd}
          onPointerDragStart={(sample, x, y) => setPointerDrag({ sample, x, y })}
        />

        {/* Center Active Tab Workspace */}
        <div className="flex-1 flex flex-col min-w-0 bg-zinc-950 overflow-hidden">
          {activeTab === 'sequencer' && (
            <StepSequencerTab
              stepCount={16}
              steps={sequencerSteps}
              setSteps={setSequencerSteps}
              channels={sequencerChannels}
              setChannels={setSequencerChannels}
              activePatternIndex={activePatternIndex}
              setActivePatternIndex={setActivePatternIndex}
              onStampToPlaylist={handleStampDrumPattern}
              isPlaying={isPlaying}
              currentStep={currentStep}
            />
          )}

          {activeTab === 'pianoroll' && (
            <PianoRollTab
              notes={pianoNotes}
              setNotes={setPianoNotes}
              selectedInstrument={pianoInstrument}
              setSelectedInstrument={setPianoInstrument}
              onStampToPlaylist={handleStampMelody}
              isPlaying={isPlaying}
              currentStep={currentStep}
            />
          )}

          {activeTab === 'arranger' && (
            <PlaylistArrangerTab
              tracks={tracks}
              setTracks={setTracks}
              playheadTime={playheadTime}
              setPlayheadTime={setPlayheadTime}
              isPlaying={isPlaying}
              selectedSample={selectedSample}
              setSelectedSample={setSelectedSample}
              pointerDrag={pointerDrag}
              setPointerDrag={setPointerDrag}
              draggingClip={draggingClip}
              setDraggingClip={setDraggingClip}
              onRecordStart={startRecordingFlow}
              onRecordStop={stopRecordingFlow}
              isRecording={isRecording}
              recordingCountdown={recordingCountdown}
            />
          )}
        </div>

      </div>

    </div>
  );
}
