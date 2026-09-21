import { useState, useRef, useEffect } from 'react';
import { FaMicrophone, FaStop, FaPlay, FaPause, FaTrash, FaCheck, FaVolumeUp } from 'react-icons/fa';

export default function FLMobileVocalRecorder({
  onAddVocalClip,
  tracks = [],
  playheadTime = 0
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [targetTrackId, setTargetTrackId] = useState(tracks[4]?.id || tracks[0]?.id || 't5');
  const [permissionError, setPermissionError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const previewAudioRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
    };
  }, []);

  const startCountdownAndRecord = async () => {
    setPermissionError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Start 3-2-1 Countdown
      setCountdown(3);
      let count = 3;
      const countInterval = setInterval(() => {
        count -= 1;
        if (count > 0) {
          setCountdown(count);
        } else {
          clearInterval(countInterval);
          setCountdown(null);
          beginActualRecording(stream);
        }
      }, 1000);

    } catch (err) {
      console.error("Mic access denied or error:", err);
      setPermissionError("Microphone permission denied or device not found.");
    }
  };

  const beginActualRecording = (stream) => {
    audioChunksRef.current = [];
    setRecordingDuration(0);

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Url = reader.result;
        setRecordedAudioUrl(base64Url);
      };
      reader.readAsDataURL(audioBlob);

      // Stop all tracks to release mic hardware
      stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorder.start();
    setIsRecording(true);

    timerIntervalRef.current = setInterval(() => {
      setRecordingDuration(prev => {
        if (prev >= 30) {
          stopRecording();
          return 30;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  const togglePreviewPlayback = () => {
    if (!recordedAudioUrl) return;

    if (isPlayingPreview && previewAudioRef.current) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      const audio = new Audio(recordedAudioUrl);
      previewAudioRef.current = audio;
      audio.onended = () => setIsPlayingPreview(false);
      audio.play().catch(console.warn);
      setIsPlayingPreview(true);
    }
  };

  const handleSaveTake = () => {
    if (!recordedAudioUrl) return;

    if (onAddVocalClip) {
      onAddVocalClip({
        trackId: targetTrackId,
        url: recordedAudioUrl,
        duration: Math.max(1, recordingDuration),
        startAt: Math.floor(playheadTime),
        name: `🎤 Vocal Take (${recordingDuration}s)`
      });
    }

    // Reset state
    setRecordedAudioUrl(null);
    setRecordingDuration(0);
  };

  const handleDiscard = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    setRecordedAudioUrl(null);
    setRecordingDuration(0);
    setIsPlayingPreview(false);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full bg-zinc-950 p-4 select-none overflow-y-auto">
      
      <div className="w-full max-w-lg bg-zinc-900 border-2 border-black rounded-2xl p-5 shadow-[0_6px_0_0_#000] flex flex-col items-center gap-4">
        
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/40 rounded-full font-black text-xs uppercase tracking-wider mb-2">
            <span>🎤</span> <span>FL Mobile Vocal Booth</span>
          </div>
          <h2 className="text-xl font-black text-white">Record Vocals & Voice</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Sing, rap, or drop ad-libs directly into your song!
          </p>
        </div>

        {/* Error Alert */}
        {permissionError && (
          <div className="w-full bg-red-500/20 border border-red-500 text-red-200 text-xs p-3 rounded-xl text-center font-bold">
            {permissionError}
          </div>
        )}

        {/* Recording Visualizer Box */}
        <div className="w-full h-36 bg-black/60 rounded-xl border-2 border-zinc-800 flex flex-col items-center justify-center p-4 relative overflow-hidden">
          
          {/* 3-2-1 Countdown Overlay */}
          {countdown !== null && (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-20">
              <span className="text-6xl font-black text-yellow-400 animate-ping">{countdown}</span>
              <span className="text-xs font-bold text-zinc-400 uppercase mt-2">Get ready to record...</span>
            </div>
          )}

          {isRecording ? (
            <div className="flex flex-col items-center gap-3">
              {/* Pulsing Live Recording Badge */}
              <div className="flex items-center gap-2 bg-red-600/30 text-red-400 border border-red-500 px-3 py-1 rounded-full animate-pulse font-mono font-black text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span>RECORDING: 00:{recordingDuration.toString().padStart(2, '0')}</span>
              </div>

              {/* Live Waveform Bars */}
              <div className="flex items-end justify-center gap-1 h-12 w-48">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-2 bg-gradient-to-t from-red-600 to-amber-400 rounded-full animate-pulse"
                    style={{
                      height: `${20 + ((i * 37) % 80)}%`,
                      animationDuration: `${0.3 + (i % 5) * 0.1}s`
                    }}
                  />
                ))}
              </div>
            </div>
          ) : recordedAudioUrl ? (
            <div className="flex flex-col items-center gap-2">
              <span className="text-emerald-400 font-black text-sm flex items-center gap-1.5">
                <FaCheck /> Vocal Take Captured ({recordingDuration}s)
              </span>
              <span className="text-xs text-zinc-400">Audition your take below or save it to your playlist.</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-zinc-500">
              <FaMicrophone size={32} className="opacity-40" />
              <span className="text-xs font-bold">Press the Record button below to begin</span>
            </div>
          )}

        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-3 w-full">
          {!isRecording && !recordedAudioUrl && (
            <button
              onClick={startCountdownAndRecord}
              disabled={countdown !== null}
              className="btn-chunky bg-red-600 hover:bg-red-500 text-white font-black px-6 py-3 text-sm flex items-center gap-2 shadow-[0_4px_0_0_#000] active:translate-y-1"
            >
              <FaMicrophone />
              <span>Start Recording Take</span>
            </button>
          )}

          {isRecording && (
            <button
              onClick={stopRecording}
              className="btn-chunky bg-amber-500 hover:bg-amber-400 text-black font-black px-6 py-3 text-sm flex items-center gap-2 shadow-[0_4px_0_0_#000] active:translate-y-1 animate-pulse"
            >
              <FaStop />
              <span>Stop & Save Audio</span>
            </button>
          )}

          {recordedAudioUrl && !isRecording && (
            <div className="flex flex-wrap items-center justify-center gap-2 w-full">
              {/* Preview Button */}
              <button
                onClick={togglePreviewPlayback}
                className="btn-chunky bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-black px-3 py-2 flex items-center gap-1.5"
              >
                {isPlayingPreview ? <FaPause /> : <FaPlay />}
                <span>{isPlayingPreview ? 'Pause' : 'Play Preview'}</span>
              </button>

              {/* Target Track Dropdown */}
              <div className="flex items-center bg-black/60 rounded-xl border border-zinc-800 px-2 py-1 gap-1">
                <span className="text-[10px] font-black text-orange-400 uppercase">Track:</span>
                <select
                  value={targetTrackId}
                  onChange={(e) => setTargetTrackId(e.target.value)}
                  className="bg-transparent text-white font-bold text-xs outline-none cursor-pointer"
                >
                  {tracks.map(t => (
                    <option key={t.id} value={t.id} className="bg-zinc-900 text-white">
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Save Take Button */}
              <button
                onClick={handleSaveTake}
                className="btn-chunky btn-chunky-green text-xs font-black px-4 py-2 flex items-center gap-1.5"
              >
                <span>💾 Add Take to Playlist</span>
              </button>

              {/* Discard Take */}
              <button
                onClick={handleDiscard}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-zinc-700"
                title="Discard take"
              >
                <FaTrash size={12} />
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
