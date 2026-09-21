import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function CountdownOverlay({ countdownStartTime, song, isHost, onComplete }) {
  const { t } = useLanguage();
  const [secondsLeft, setSecondsLeft] = useState(5);
  const audioPreloadRef = useRef(null);

  const audioUrl = song?.preview_url || song?.previewUrl;

  // Preload / buffer the audio preview in the background during the 5-second countdown
  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = audioUrl;
      audio.load();
      audioPreloadRef.current = audio;
    }

    return () => {
      if (audioPreloadRef.current) {
        audioPreloadRef.current = null;
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    const updateCountdown = () => {
      const elapsed = Math.floor((Date.now() - countdownStartTime) / 1000);
      const remaining = Math.max(0, 5 - elapsed);
      setSecondsLeft(remaining);

      if (remaining <= 0) {
        onComplete();
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 250);
    return () => clearInterval(interval);
  }, [countdownStartTime, onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex flex-col items-center justify-center select-none p-4 animate-in fade-in duration-300">
      
      <div className="text-center flex flex-col items-center z-10 max-w-md w-full">
        
        {/* Genre & Inspiration Badge */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-xs sm:text-sm uppercase tracking-widest px-4 py-1.5 rounded-full border-2 border-black shadow-[0_4px_0_0_#000] mb-6 animate-pulse">
          <span>🎵 {song?.genre || 'Music'}</span>
          <span>•</span>
          <span>{t('countdown.title')}</span>
        </div>

        {/* Big Animated Number */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-yellow-400 border-4 border-black shadow-[0_8px_0_0_#000] flex items-center justify-center">
            <span 
              key={secondsLeft} 
              className="text-7xl sm:text-8xl font-black text-white drop-shadow-[0_6px_0_#000] animate-bounce"
            >
              {secondsLeft > 0 ? secondsLeft : '🔥'}
            </span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white mt-5 mb-2 tracking-wide drop-shadow-[0_4px_0_#000]">
          {secondsLeft > 0 ? t('countdown.getReady') : 'GO!'}
        </h1>

        {/* Song Info Card */}
        {song?.title && (
          <div className="mt-3 bg-zinc-900/90 border-2 border-zinc-800 rounded-2xl p-3 flex items-center gap-3 w-full shadow-lg">
            {song.thumbnail && (
              <img
                src={song.thumbnail}
                alt={song.title}
                className="w-12 h-12 rounded-xl object-cover border border-black shadow-sm shrink-0"
              />
            )}
            <div className="flex-1 text-left min-w-0">
              <div className="text-sm font-black text-white truncate">{song.title}</div>
              <div className="text-xs font-bold text-zinc-400 truncate">{song.artist}</div>
            </div>
            <div className="text-[10px] font-black uppercase text-pink-400 bg-pink-500/20 px-2 py-1 rounded-lg border border-pink-500/30">
              30s Preview
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
