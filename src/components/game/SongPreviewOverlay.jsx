import { useState, useEffect, useRef } from 'react';
import { FaMusic, FaForward, FaVolumeMute, FaVolumeDown, FaVolumeUp } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';

const PREVIEW_DURATION = 30;

export default function SongPreviewOverlay({ song, songStartTime, isHost, onComplete }) {
  const { t } = useLanguage();
  const [secondsLeft, setSecondsLeft] = useState(PREVIEW_DURATION);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [showVolumePopup, setShowVolumePopup] = useState(false);
  const [hasError, setHasError] = useState(false);

  const audioRef = useRef(null);
  const volumePopupRef = useRef(null);

  const audioUrl = song?.preview_url || song?.previewUrl;
  const title = song?.title || "Featured Song";
  const artist = song?.artist || "Artist";
  const genre = song?.genre || "Pop";
  const thumbnail = song?.thumbnail || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80";

  // Audio Playback Lifecycle
  useEffect(() => {
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.preload = 'auto';
    audio.volume = isMuted ? 0 : volume;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn("Autoplay audio blocked or pending user interaction:", err);
          setIsPlaying(false);
        });
    }

    audio.onended = () => {
      onComplete();
    };

    audio.onerror = (e) => {
      console.warn("Audio load error:", e);
      setHasError(true);
    };

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [audioUrl, onComplete]);

  // Handle Volume & Mute updates
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Close Volume Pop-up on outside click
  useEffect(() => {
    if (!showVolumePopup) return;

    const handleOutsideClick = (e) => {
      if (volumePopupRef.current && !volumePopupRef.current.contains(e.target)) {
        setShowVolumePopup(false);
      }
    };

    window.addEventListener('pointerdown', handleOutsideClick);
    return () => window.removeEventListener('pointerdown', handleOutsideClick);
  }, [showVolumePopup]);

  // Countdown timer synced with songStartTime
  useEffect(() => {
    const updateCountdown = () => {
      const elapsed = Math.floor((Date.now() - songStartTime) / 1000);
      const remaining = Math.max(0, PREVIEW_DURATION - elapsed);
      setSecondsLeft(remaining);

      if (remaining <= 0) {
        onComplete();
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 250);
    return () => clearInterval(interval);
  }, [songStartTime, onComplete]);

  const handleVolumeSliderChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (isMuted && newVol > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const elapsedSeconds = PREVIEW_DURATION - secondsLeft;
  const progressPercent = Math.min(100, Math.max(0, (elapsedSeconds / PREVIEW_DURATION) * 100));

  const effectiveVolume = isMuted ? 0 : volume;
  const volumePercentage = Math.round(effectiveVolume * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 select-none animate-in zoom-in-95 duration-300">
      
      <div className="chunky-panel max-w-lg w-full p-6 sm:p-8 flex flex-col items-center border-4 border-black relative overflow-visible shadow-[0_12px_0_0_#000]">
        
        {/* Genre & 30-Second Clip Inspiration Badges */}
        <div className="flex items-center gap-2 mb-5">
          <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider px-4 py-1 rounded-full border-2 border-black shadow-[0_3px_0_0_#000]">
            {genre}
          </span>
          <span className="text-xs sm:text-sm font-black text-yellow-300 uppercase tracking-widest flex items-center gap-1.5 bg-black/60 px-3.5 py-1 rounded-full border-2 border-black shadow-[0_3px_0_0_#000]">
            <FaMusic size={12} /> <span>30-SECOND SONG CLIP</span>
          </span>
        </div>

        {/* Album Artwork & Waveform Container (NO play/pause button) */}
        <div className="relative w-60 h-60 sm:w-72 sm:h-72 rounded-3xl border-4 border-black shadow-[0_8px_0_0_#000] overflow-hidden mb-5 bg-zinc-900 flex items-center justify-center">
          <img 
            src={thumbnail} 
            alt={title} 
            className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-105' : 'scale-100'}`}
          />

          {/* Subtle dark vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />

          {/* Animated Neon Equalizer Bars at bottom */}
          {isPlaying && (
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-center gap-1.5 h-16 p-3 pointer-events-none">
              {Array.from({ length: 11 }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 bg-gradient-to-t from-purple-500 via-pink-500 to-yellow-400 rounded-full animate-pulse shadow-sm"
                  style={{
                    height: `${25 + ((i * 27) % 75)}%`,
                    animationDuration: `${0.3 + (i % 5) * 0.1}s`
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Song Details */}
        <div className="text-center w-full mb-5 px-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white truncate drop-shadow-md mb-1">
            {title}
          </h2>
          <p className="text-sm sm:text-base font-bold text-zinc-300 truncate">
            {artist}
          </p>
        </div>

        {/* 30-Second Progress Bar */}
        <div className="w-full bg-black/60 rounded-full h-4 border-2 border-black overflow-hidden mb-6 shadow-inner relative">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 transition-all duration-300 ease-linear rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Footer info, Volume Pop-up & Skip Button */}
        <div className="w-full flex items-center justify-between gap-3 relative">
          
          {/* Volume Pop-up Button Container */}
          <div className="relative" ref={volumePopupRef}>
            
            {/* Pop-up Slider Panel */}
            {showVolumePopup && (
              <div className="absolute bottom-full mb-3 left-0 bg-zinc-900 border-3 border-black rounded-2xl p-4 shadow-[0_8px_0_0_#000] w-60 z-50 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>🔊</span> <span>Volume</span>
                  </span>
                  <span className="font-mono text-xs font-black text-yellow-400 bg-black/60 px-2 py-0.5 rounded-lg border border-zinc-800">
                    {effectiveVolume === 0 ? 'Muted' : `${volumePercentage}%`}
                  </span>
                </div>

                {/* Range Slider */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {effectiveVolume === 0 ? (
                      <FaVolumeMute size={13} className="text-red-400" />
                    ) : effectiveVolume < 0.5 ? (
                      <FaVolumeDown size={13} />
                    ) : (
                      <FaVolumeUp size={13} />
                    )}
                  </button>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={effectiveVolume}
                    onChange={handleVolumeSliderChange}
                    className="flex-1 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-pink-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Volume Trigger Button */}
            <button
              onClick={() => setShowVolumePopup(!showVolumePopup)}
              className={`w-12 h-12 rounded-2xl border-3 border-black font-black flex items-center justify-center text-base shadow-[0_4px_0_0_#000] active:translate-y-1 active:shadow-[0_0px_0_0] transition-all ${
                showVolumePopup
                  ? 'bg-pink-500 text-white'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white'
              }`}
              title="Adjust Volume"
            >
              {effectiveVolume === 0 ? (
                <FaVolumeMute size={18} className="text-red-400" />
              ) : effectiveVolume < 0.5 ? (
                <FaVolumeDown size={18} />
              ) : (
                <FaVolumeUp size={18} />
              )}
            </button>

          </div>

          {/* Time Countdown Display */}
          <div className="font-mono text-xs sm:text-sm font-black text-yellow-300 bg-black/60 px-3.5 py-2.5 rounded-2xl border-2 border-black shadow-[0_3px_0_0_#000]">
            ⏱ 00:{elapsedSeconds.toString().padStart(2, '0')} / 00:30
          </div>

          {/* Skip / Start Making Music Button */}
          <button
            onClick={onComplete}
            className="btn-chunky btn-chunky-purple flex items-center gap-2 py-3 px-4 sm:px-5 text-xs sm:text-sm font-black shadow-[0_4px_0_0_#000]"
            title="Start making your own track in the DAW Studio"
          >
            <span>Start Making Music</span>
            <FaForward size={12} />
          </button>

        </div>

      </div>
    </div>
  );
}
