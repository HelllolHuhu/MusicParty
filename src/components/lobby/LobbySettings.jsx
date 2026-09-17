import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { ref, update } from 'firebase/database';
import { useLanguage } from '../../context/LanguageContext';

const AVAILABLE_GENRES = ["Pop", "Rock", "Hip-Hop", "EDM", "Lo-Fi", "Trap", "Acoustic", "Synthpop 80s", "Reggaeton", "Metal"];

export default function LobbySettings({ roomId, roomData, isHost }) {
  const { t } = useLanguage();
  const [timeMinutes, setTimeMinutes] = useState(roomData?.settings?.timeMinutes || 10);
  const [genres, setGenres] = useState(roomData?.settings?.genres || ["Pop", "Hip-Hop", "EDM", "Lo-Fi"]);

  // Sync to Firebase (only host does this)
  useEffect(() => {
    if (!isHost) return;
    
    update(ref(db, `rooms/${roomId}/settings`), {
      maxPlayers: 10,
      timeMinutes,
      genres
    });
  }, [timeMinutes, genres, isHost, roomId]);

  // Sync FROM Firebase (for non-hosts)
  useEffect(() => {
    if (isHost || !roomData?.settings) return;
    setTimeMinutes(roomData.settings.timeMinutes || 10);
    setGenres(roomData.settings.genres || ["Pop", "Hip-Hop", "EDM", "Lo-Fi"]);
  }, [roomData?.settings, isHost]);

  const toggleGenre = (genre) => {
    if (!isHost) return;
    setGenres(prev => {
      if (prev.includes(genre)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter(g => g !== genre);
      }
      return [...prev, genre];
    });
  };

  return (
    <div className={`chunky-panel p-5 sm:p-6 ${!isHost && 'opacity-85 pointer-events-none'}`}>
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg sm:text-xl font-black">{t('settings.title')}</h3>
        {!isHost && <span className="text-[10px] bg-black/60 px-2.5 py-1 rounded-lg text-white font-bold uppercase">{t('settings.hostOnly')}</span>}
      </div>

      <div className="space-y-5">
        {/* Creation Time Slider */}

        <div className="bg-black/20 p-3.5 rounded-2xl border-2 border-black/40">
          <div className="flex justify-between mb-2">
            <label className="font-black text-xs sm:text-sm uppercase tracking-wider">{t('settings.timeMinutes')}</label>
            <span className="font-black text-sm sm:text-base">{timeMinutes} min</span>
          </div>
          <input 
            type="range" min="1" max="20" 
            value={timeMinutes} 
            onChange={(e) => setTimeMinutes(parseInt(e.target.value))}
            className="w-full h-2.5 bg-black/50 rounded-lg appearance-none cursor-pointer accent-pink-500"
            disabled={!isHost}
          />
        </div>

        {/* Genres */}
        <div className="bg-black/20 p-3.5 rounded-2xl border-2 border-black/40">
          <label className="font-black text-xs sm:text-sm uppercase tracking-wider block mb-2.5">{t('settings.genres')}</label>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {AVAILABLE_GENRES.map(g => {
              const active = genres.includes(g);
              return (
                <button
                  key={g}
                  onClick={() => toggleGenre(g)}
                  disabled={!isHost}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border-2 border-black shadow-[0_2px_0_0_#000] cursor-pointer ${
                    active 
                      ? 'bg-pink-500 text-white translate-y-[-1px]' 
                      : 'bg-black/30 text-white/75 hover:bg-black/50'
                  }`}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
