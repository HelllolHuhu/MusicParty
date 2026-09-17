import { useState, useEffect, useRef } from 'react';
import { FaMusic, FaVolumeUp, FaPlay, FaForward } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';

const PREVIEW_DURATION = 30;

export default function SongPreviewOverlay({ song, songStartTime, isHost, onComplete }) {
  const { t } = useLanguage();
  const [secondsLeft, setSecondsLeft] = useState(PREVIEW_DURATION);
  const [userInteracted, setUserInteracted] = useState(false);
  const iframeRef = useRef(null);

  const videoId = song?.videoId || "4NRXx6U8ABQ";
  const startTime = song?.startTime || 25;
  const endTime = startTime + PREVIEW_DURATION;
  const title = song?.title || "Featured Song";
  const artist = song?.artist || "Artist";
  const genre = song?.genre || "Pop";
  const thumbnail = song?.thumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

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

  const handleUserPlay = () => {
    setUserInteracted(true);
    if (iframeRef.current) {
      iframeRef.current.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&start=${startTime}&end=${endTime}&controls=0&modestbranding=1&rel=0&enablejsapi=1`;
    }
  };

  const progressPercent = Math.min(100, Math.max(0, ((PREVIEW_DURATION - secondsLeft) / PREVIEW_DURATION) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 select-none animate-in zoom-in-95 duration-300">
      
      <div className="chunky-panel max-w-lg w-full p-6 sm:p-8 flex flex-col items-center border-4 border-black relative overflow-hidden">
        
        {/* Genre & Inspiration Tag */}
        <div className="flex items-center gap-2 mb-4">
          <span className="bg-pink-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider px-3.5 py-1 rounded-full border-2 border-black shadow-[0_2px_0_0_#000]">
            {genre}
          </span>
          <span className="text-xs sm:text-sm font-black text-yellow-300 uppercase tracking-widest flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-full border border-black">
            <FaMusic size={12} /> {t('songPreview.subtitle')}
          </span>
        </div>

        {/* Video / Album Art Container with live autoplay video */}
        <div className="relative w-60 h-60 sm:w-72 sm:h-72 rounded-3xl border-4 border-black shadow-[0_8px_0_0_#000] overflow-hidden mb-6 bg-black flex items-center justify-center">
          <img 
            src={thumbnail} 
            alt={title} 
            className="absolute inset-0 w-full h-full object-cover" 
          />
          
          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&start=${startTime}&end=${endTime}&controls=0&modestbranding=1&rel=0&showinfo=0&loop=0&fs=0&playsinline=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : ''}`}
            title={title}
            className="absolute inset-0 w-full h-full object-cover scale-125 pointer-events-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
          
          {/* Animated Equalizer Bars */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end justify-center gap-1.5 h-14 p-2 pointer-events-none">
            <div className="w-1.5 bg-pink-500 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-full"></div>
            <div className="w-1.5 bg-purple-500 rounded-full animate-[pulse_0.4s_ease-in-out_infinite] h-3/4"></div>
            <div className="w-1.5 bg-yellow-400 rounded-full animate-[pulse_0.7s_ease-in-out_infinite] h-5/6"></div>
            <div className="w-1.5 bg-green-400 rounded-full animate-[pulse_0.5s_ease-in-out_infinite] h-2/3"></div>
            <div className="w-1.5 bg-pink-400 rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-full"></div>
          </div>
        </div>

        {/* Song Info */}
        <div className="text-center w-full mb-6">
          <h2 className="text-2xl sm:text-3xl font-black text-white truncate drop-shadow-md mb-1 px-2">
            {title}
          </h2>
          <p className="text-sm sm:text-base font-bold text-gray-300 truncate">
            {artist}
          </p>
        </div>

        {/* 10-Second Progress Bar */}
        <div className="w-full bg-black/40 rounded-full h-4 border-2 border-black overflow-hidden mb-5 shadow-inner relative">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 transition-all duration-300 ease-linear rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Footer info & Skip Button */}
        <div className="w-full flex items-center justify-between gap-4">
          <div className="font-mono text-sm sm:text-base font-black text-yellow-300 bg-black/50 px-3.5 py-1.5 rounded-xl border border-black">
            ⏳ {secondsLeft}s
          </div>

          <button
            onClick={onComplete}
            className="btn-chunky btn-chunky-purple flex items-center gap-2 py-2.5 px-5 text-sm sm:text-base font-black"
          >
            <span>{t('songPreview.skip')}</span>
            <FaForward size={14} />
          </button>
        </div>

      </div>
    </div>
  );
}
