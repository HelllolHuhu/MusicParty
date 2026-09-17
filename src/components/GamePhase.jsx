import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, update } from 'firebase/database';
import MusicWorkspace from './game/workspace/MusicWorkspace';
import { useLanguage } from '../context/LanguageContext';

export default function GamePhase({ roomId, roomData, playerId }) {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState(600);
  
  const isHost = roomData.host === playerId;

  useEffect(() => {
    const gameDurationMs = roomData.gameDurationMs || (10 * 60 * 1000);
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - roomData.startTime;
      const remaining = Math.max(0, Math.floor((gameDurationMs - elapsed) / 1000));
      
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        clearInterval(interval);
        if (isHost) {
          moveToPresentation();
        }
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [roomData.startTime, roomData.gameDurationMs, isHost]);

  // Immediately finish and move to presentation when all players are ready
  useEffect(() => {
    if (!roomData?.players || !isHost || roomData.status !== 'playing') return;
    const playerIds = Object.keys(roomData.players);
    if (playerIds.length === 0) return;

    const allReady = playerIds.every(id => Boolean(roomData?.tracks?.[id]?.ready));
    if (allReady) {
      moveToPresentation();
    }
  }, [roomData?.tracks, roomData?.players, roomData?.status, isHost]);

  const moveToPresentation = () => {
    const playerIds = Object.keys(roomData.players || {});
    update(ref(db, `rooms/${roomId}`), {
      status: 'presenting',
      presentQueue: playerIds,
      currentPresenter: playerIds[0],
      presentationPlaying: false,
      presentationPlayStartTime: null,
      presentationStartTime: Date.now()
    });
  };

  const handleFinishTrack = (tracksData) => {
    update(ref(db, `rooms/${roomId}/tracks/${playerId}`), {
      ready: true,
      timestamp: Date.now(),
      tracks: tracksData || null
    });
  };

  const playersList = Object.keys(roomData.players || {});
  const readyPlayersCount = playersList.filter(id => Boolean(roomData.tracks?.[id]?.ready)).length;
  const isMyTrackReady = Boolean(roomData.tracks?.[playerId]?.ready);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#09090b] overflow-hidden p-4">
      
      {/* Header bar */}
      <div className="h-14 shrink-0 flex items-center justify-between px-4 sm:px-6 bg-zinc-900 border-2 border-black rounded-2xl shadow-[0_4px_0_0_#000] mb-4">
        <div className="font-black text-lg sm:text-xl text-pink-500 uppercase tracking-widest flex items-center gap-2">
          <span>FL PARTY STUDIO</span>
        </div>
        <div className="font-bold text-xs sm:text-sm text-zinc-400 flex items-center gap-2 truncate">
          <span className="bg-pink-500/20 text-pink-400 border border-pink-500/40 px-2.5 py-0.5 rounded-lg font-black text-xs uppercase">
            {roomData.currentStyle || roomData.currentSong?.genre || 'Pop'}
          </span>
          {roomData.currentSong?.title && (
            <span className="text-white font-black truncate max-w-[180px] sm:max-w-xs">
              🎵 {roomData.currentSong.title}
            </span>
          )}
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 min-h-0 relative">
        <MusicWorkspace 
          roomId={roomId}
          playerId={playerId}
          timeRemaining={timeLeft}
          isReady={isMyTrackReady}
          readyStatus={{ ready: readyPlayersCount, total: playersList.length }}
          onFinish={handleFinishTrack}
        />
      </div>

    </div>
  );
}
