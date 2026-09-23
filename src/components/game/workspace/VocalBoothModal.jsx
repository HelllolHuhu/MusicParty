import { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaStop, FaPlay, FaPause, FaCheck, FaPlus, FaTimes, FaRedo } from 'react-icons/fa';

export default function VocalBoothModal({
  isOpen = false,
  onClose = () => {},
  tracks = [],
  playheadTime = 0,
  onSaveTake = () => {} // ({ mode: 'new_track' | 'current_track', targetTrackId, url, duration, startAt })
}) {
  const [countdown, setCountdown] = useState(null); // 3, 2, 1, null
  const [isRecording, setIsRecording] = useState(false);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [recordedUrl, setRecordedUrl] = useState(null);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [selectedVocalTrackId, setSelectedVocalTrackId] = useState(() => {
    const firstVocal = tracks.find(t => t.type === 'vocal' || t.name.toLowerCase().includes('vocal'));
    return firstVocal ? firstVocal.id : null;
  });

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const previewAudioRef = useRef(null);

  // Available vocal tracks for destination dropdown
  const vocalTracks = tracks.filter(t => !t.isReference && (t.type === 'vocal' || t.name.toLowerCase().includes('vocal')));

  useEffect(() => {
    if (!selectedVocalTrackId && vocalTracks.length > 0) {
      setSelectedVocalTrackId(vocalTracks[0].id);
    }
  }, [vocalTracks, selectedVocalTrackId]);

  // Clean up stream & timers on unmount or close
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
    };
  }, []);

  if (!isOpen) return null;

  // Step 1: Start 3-2-1 Countdown
  const triggerCountdown = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setHasPermission(true);

      setCountdown(3);
      let c = 3;
      const cdInterval = setInterval(() => {
        c -= 1;
        if (c > 0) {
          setCountdown(c);
        } else {
          clearInterval(cdInterval);
          setCountdown(null);
          startActualRecording(stream);
        }
      }, 900);
    } catch (err) {
      console.warn("Microphone access error:", err);
      setHasPermission(false);
      alert("Please allow microphone access to record your voice!");
    }
  };

  // Step 2: Record up to 30 Seconds
  const startActualRecording = (stream) => {
    audioChunksRef.current = [];
    setRecordedDuration(0);
    setRecordedUrl(null);
    setRecordedBlob(null);

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      setRecordedBlob(blob);
      setRecordedUrl(url);
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };

    mediaRecorder.start(100);
    setIsRecording(true);

    const startTime = Date.now();
    timerIntervalRef.current = setInterval(() => {
      const elapsedSec = (Date.now() - startTime) / 1000;
      setRecordedDuration(Math.min(30, elapsedSec));
      // Enforce strict 30-second single take limit
      if (elapsedSec >= 30) {
        stopRecording();
      }
    }, 100);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
  };

  // Step 3: Audition Recorded Take
  const togglePlayPreview = () => {
    if (!recordedUrl) return;

    if (isPlayingPreview) {
      previewAudioRef.current?.pause();
      setIsPlayingPreview(false);
    } else {
      if (!previewAudioRef.current || previewAudioRef.current.src !== recordedUrl) {
        previewAudioRef.current = new Audio(recordedUrl);
        previewAudioRef.current.onended = () => setIsPlayingPreview(false);
      }
      previewAudioRef.current.currentTime = 0;
      previewAudioRef.current.play().catch(console.warn);
      setIsPlayingPreview(true);
    }
  };

  // Step 4: Save Choice
  const handleSave = (mode) => {
    if (!recordedUrl) return;
    onSaveTake({
      mode, // 'new_track' | 'current_track'
      targetTrackId: selectedVocalTrackId,
      url: recordedUrl,
      duration: Math.max(1, Math.round(recordedDuration * 10) / 10),
      startAt: Math.round(playheadTime * 10) / 10
    });
    handleReset();
    onClose();
  };

  const handleReset = () => {
    if (previewAudioRef.current) previewAudioRef.current.pause();
    setRecordedUrl(null);
    setRecordedBlob(null);
    setRecordedDuration(0);
    setIsPlayingPreview(false);
    setCountdown(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      
      <div className="chunky-panel max-w-md w-full bg-zinc-900 border-4 border-black p-6 flex flex-col items-center relative shadow-[0_12px_0_0_#000]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          title="Close Vocal Booth"
        >
          <FaTimes size={12} />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-4">
          <span className="w-8 h-8 rounded-full bg-red-600/30 text-red-500 border border-red-500/40 flex items-center justify-center">
            <FaMicrophone size={14} />
          </span>
          <h2 className="text-xl font-black text-white uppercase tracking-wider">
            Vocal Booth
          </h2>
        </div>

        {/* Countdown Stage */}
        {countdown !== null && (
          <div className="my-8 flex flex-col items-center animate-in zoom-in duration-200">
            <div className="text-7xl font-black text-yellow-400 drop-shadow-[0_0_25px_rgba(250,204,21,0.6)] animate-pulse">
              {countdown}
            </div>
            <p className="text-xs font-bold text-zinc-400 mt-2 uppercase tracking-widest">
              Get ready to sing / drop bars...
            </p>
          </div>
        )}

        {/* Recording Stage */}
        {countdown === null && isRecording && (
          <div className="my-6 flex flex-col items-center w-full">
            {/* Pulsing On-Air Indicator */}
            <div className="flex items-center gap-2 mb-4">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <span className="font-black text-xs uppercase tracking-widest text-red-500">
                Recording (Max 30s)
              </span>
            </div>

            {/* Time progress */}
            <div className="font-mono text-4xl font-black text-white mb-4">
              00:{Math.floor(recordedDuration).toString().padStart(2, '0')} / 00:30
            </div>

            {/* Simulated Live Audio Meter Wave */}
            <div className="flex items-center justify-center gap-1.5 h-12 w-full px-8 mb-6">
              {Array.from({ length: 15 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-red-600 to-yellow-400 rounded-full animate-pulse"
                  style={{
                    height: `${30 + ((i * 19) % 70)}%`,
                    animationDuration: `${0.2 + (i % 4) * 0.1}s`
                  }}
                />
              ))}
            </div>

            {/* Stop Recording Button */}
            <button
              onClick={stopRecording}
              className="btn-chunky bg-red-600 hover:bg-red-500 text-white border-2 border-red-900 shadow-[0_4px_0_0_#991b1b] py-3 px-6 text-sm font-black flex items-center gap-2"
            >
              <FaStop size={12} />
              <span>Stop Recording</span>
            </button>
          </div>
        )}

        {/* Post-Take Review & Destination Selection */}
        {countdown === null && !isRecording && recordedUrl && (
          <div className="my-4 flex flex-col items-center w-full animate-in fade-in duration-200">
            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-2">
              ✓ Vocal Take Captured ({recordedDuration.toFixed(1)}s)
            </span>

            {/* Preview Play/Pause button */}
            <button
              onClick={togglePlayPreview}
              className="w-14 h-14 rounded-full bg-pink-600 hover:bg-pink-500 border-2 border-black flex items-center justify-center text-white text-lg shadow-[0_4px_0_0_#000] active:translate-y-1 transition-all mb-4"
              title="Audition recorded vocal take"
            >
              {isPlayingPreview ? <FaPause size={18} /> : <FaPlay size={18} className="ml-1" />}
            </button>

            {/* Choice: Layering vs New Track */}
            <div className="w-full bg-black/40 border-2 border-black rounded-2xl p-4 mb-4 flex flex-col gap-3">
              <span className="text-xs font-black text-zinc-300 uppercase">
                Choose Where to Place:
              </span>

              {/* Option A: Add to Existing Track */}
              {vocalTracks.length > 0 && (
                <div className="flex items-center gap-2">
                  <select
                    value={selectedVocalTrackId || ''}
                    onChange={(e) => setSelectedVocalTrackId(e.target.value)}
                    className="flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-2 text-xs font-bold outline-none"
                  >
                    {vocalTracks.map(t => (
                      <option key={t.id} value={t.id}>
                        Insert into: {t.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleSave('current_track')}
                    className="btn-chunky btn-chunky-green py-2 px-3 text-xs font-black whitespace-nowrap"
                  >
                    Insert at {playheadTime.toFixed(1)}s
                  </button>
                </div>
              )}

              {/* Option B: Add as New Track */}
              <button
                onClick={() => handleSave('new_track')}
                className="btn-chunky btn-chunky-purple py-2.5 px-4 text-xs font-black flex items-center justify-center gap-1.5 w-full"
              >
                <FaPlus size={11} />
                <span>Add as Brand New Vocal Track (Layering)</span>
              </button>
            </div>

            {/* Retake Button */}
            <button
              onClick={handleReset}
              className="text-xs text-zinc-400 hover:text-white font-bold flex items-center gap-1.5 transition-colors"
            >
              <FaRedo size={10} />
              <span>Discard & Record Again</span>
            </button>
          </div>
        )}

        {/* Initial Idle State: Launch Mic */}
        {countdown === null && !isRecording && !recordedUrl && (
          <div className="my-6 flex flex-col items-center text-center">
            <p className="text-xs text-zinc-300 font-bold mb-6 max-w-xs leading-relaxed">
              Record a verse, chorus, or vocal ad-lib. Audio starts at playhead position ({playheadTime.toFixed(1)}s) with a maximum of 30 seconds per take.
            </p>

            <button
              onClick={triggerCountdown}
              className="btn-chunky btn-chunky-pink py-4 px-8 text-base font-black flex items-center gap-2.5 shadow-[0_4px_0_0_#000] hover:scale-105 active:scale-95 transition-all"
            >
              <FaMicrophone size={16} />
              <span>Start 3-2-1 Recording</span>
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
