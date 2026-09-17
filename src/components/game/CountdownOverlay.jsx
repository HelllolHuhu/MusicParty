import { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function CountdownOverlay({ countdownStartTime, song, isHost, onComplete }) {
  const { t } = useLanguage();
  const [secondsLeft, setSecondsLeft] = useState(5);

  const videoId = song?.videoId || "4NRXx6U8ABQ";
  const startTime = song?.startTime || 25;
  const endTime = startTime + 30;

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
      
      {/* Background Preloader to buffer and warm up the YouTube video during the 5-second countdown */}
      {videoId && (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&start=${startTime}&end=${endTime}&controls=0&modestbranding=1&rel=0&showinfo=0&loop=0&fs=0&playsinline=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : ''}`}
          title="Preload Video Buffer"
          className="w-1 h-1 opacity-0 pointer-events-none absolute -left-[9999px]"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        />
      )}

      <div className="text-center flex flex-col items-center z-10">
        <div className="inline-block bg-pink-500 text-white font-black text-xs sm:text-sm uppercase tracking-widest px-4 py-1.5 rounded-full border-2 border-black shadow-[0_4px_0_0_#000] mb-6 animate-pulse">
          {t('countdown.title')}
        </div>

        {/* Big Animated Number */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-yellow-400 border-4 border-black shadow-[0_8px_0_0_#000] flex items-center justify-center">
            <span 
              key={secondsLeft} 
              className="text-7xl sm:text-9xl font-black text-white drop-shadow-[0_6px_0_#000] animate-bounce"
            >
              {secondsLeft > 0 ? secondsLeft : '🔥'}
            </span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white mt-6 mb-2 tracking-wide drop-shadow-[0_4px_0_#000]">
          {secondsLeft > 0 ? t('countdown.getReady') : 'GO!'}
        </h1>
        <p className="text-sm sm:text-base font-bold text-gray-300 max-w-sm">
          {song?.title ? `🎵 ${song.title} - ${song.artist}` : t('songPreview.subtitle')}
        </p>
      </div>
    </div>
  );
}
