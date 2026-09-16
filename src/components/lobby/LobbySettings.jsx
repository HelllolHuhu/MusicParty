import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { ref, update } from 'firebase/database';

const AVAILABLE_GENRES = ["Pop", "Rock", "Hip-Hop", "EDM", "Lo-Fi", "Trap", "Acoustic", "Synthpop 80s", "Reggaeton", "Metal"];

export default function LobbySettings({ roomId, roomData, isHost }) {
  // Local state for immediate UI feedback, synced to DB on change
  const [maxPlayers, setMaxPlayers] = useState(roomData?.settings?.maxPlayers || 10);
  const [timeMinutes, setTimeMinutes] = useState(roomData?.settings?.timeMinutes || 10);
  const [genres, setGenres] = useState(roomData?.settings?.genres || ["Pop", "Hip-Hop", "EDM", "Lo-Fi"]);

  // Sync to Firebase (only host does this)
  useEffect(() => {
    if (!isHost) return;
    
    update(ref(db, `rooms/${roomId}/settings`), {
      maxPlayers,
      timeMinutes,
      genres
    });
  }, [maxPlayers, timeMinutes, genres, isHost, roomId]);

  // Sync FROM Firebase (for non-hosts)
  useEffect(() => {
    if (isHost || !roomData?.settings) return;
    setMaxPlayers(roomData.settings.maxPlayers);
    setTimeMinutes(roomData.settings.timeMinutes);
    setGenres(roomData.settings.genres);
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
    <div className={`chunky-panel p-6 ${!isHost && 'opacity-80 pointer-events-none'}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-pink-400">Nastavenia Hry</h3>
        {!isHost && <span className="text-xs bg-gray-900 px-2 py-1 rounded text-gray-500 font-bold uppercase">Iba Host</span>}
      </div>

      <div className="space-y-6">
        {/* Sliders */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="font-bold text-gray-300">Max Hráčov</label>
            <span className="font-black text-white">{maxPlayers}</span>
          </div>
          <input 
            type="range" min="2" max="10" 
            value={maxPlayers} 
            onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-pink-500"
            disabled={!isHost}
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="font-bold text-gray-300">Čas na tvorbu</label>
            <span className="font-black text-white">{timeMinutes} min</span>
          </div>
          <input 
            type="range" min="1" max="20" 
            value={timeMinutes} 
            onChange={(e) => setTimeMinutes(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-pink-500"
            disabled={!isHost}
          />
        </div>

        {/* Genres */}
        <div>
          <label className="font-bold text-gray-300 block mb-3">Hudobné Žánre (losuje sa)</label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_GENRES.map(g => {
              const active = genres.includes(g);
              return (
                <button
                  key={g}
                  onClick={() => toggleGenre(g)}
                  disabled={!isHost}
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all border-2 ${
                    active 
                      ? 'bg-pink-500 border-pink-700 text-white shadow-[0_3px_0_0_#be185d] translate-y-[-2px]' 
                      : 'bg-gray-700 border-gray-900 text-gray-400 hover:bg-gray-600'
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
