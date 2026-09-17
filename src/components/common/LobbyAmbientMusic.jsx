import { useEffect, useRef, useState } from 'react';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

export default function LobbyAmbientMusic({ isActive = true }) {
  const audioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('musicparty_lobby_muted') === 'true';
  });
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.09; // Nice quiet background ambient level
    audio.loop = true;

    const playAudio = () => {
      if (!audio || isMuted || !isActive) return;
      audio.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // Autoplay was blocked before user interaction; resume on first user interaction
          const handleFirstUserGesture = () => {
            if (audio && !isMuted && isActive) {
              audio.play().then(() => setIsPlaying(true)).catch(console.error);
            }
            window.removeEventListener('click', handleFirstUserGesture);
            window.removeEventListener('keydown', handleFirstUserGesture);
            window.removeEventListener('pointerdown', handleFirstUserGesture);
            window.removeEventListener('touchstart', handleFirstUserGesture);
          };

          window.addEventListener('click', handleFirstUserGesture, { once: true });
          window.addEventListener('keydown', handleFirstUserGesture, { once: true });
          window.addEventListener('pointerdown', handleFirstUserGesture, { once: true });
          window.addEventListener('touchstart', handleFirstUserGesture, { once: true });
        });
    };

    if (isActive && !isMuted) {
      playAudio();
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, [isActive, isMuted]);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    localStorage.setItem('musicparty_lobby_muted', String(nextMuted));
    
    if (audioRef.current) {
      if (nextMuted) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else if (isActive) {
        audioRef.current.volume = 0.18;
        audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
      }
    }
  };

  return (
    <>
      <audio 
        ref={audioRef}
        src="/lobby_song/pripac-cozy-game-beats-323490.mp3"
        preload="auto"
      />

      {/* Floating discreet Ambient Music Mute / Unmute Button in Lobby */}
      {isActive && (
        <button
          onClick={toggleMute}
          title={isMuted ? "Unmute lobby ambient music" : "Mute lobby ambient music"}
          className={`fixed bottom-4 left-4 z-40 p-2.5 sm:px-3 sm:py-2 rounded-2xl border-2 border-black font-black text-xs flex items-center gap-2 shadow-[0_3px_0_0_#000] active:translate-y-0.5 active:shadow-[0_1px_0_0_#000] transition-all ${
            isMuted 
              ? 'bg-zinc-800 text-zinc-400 opacity-60 hover:opacity-100' 
              : 'bg-pink-500 hover:bg-pink-400 text-white animate-[pulse_3s_ease-in-out_infinite]'
          }`}
        >
          {isMuted ? <FaVolumeMute size={14} /> : <FaVolumeUp size={14} />}
          <span className="hidden sm:inline">
            {isMuted ? "Music: OFF" : "Cozy Beats 🎵"}
          </span>
        </button>
      )}
    </>
  );
}
