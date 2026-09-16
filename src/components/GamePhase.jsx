import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, update } from 'firebase/database';
import SongCard from './game/SongCard';
import MusicWorkspace from './game/workspace/MusicWorkspace';

export default function GamePhase({ roomId, roomData, playerId }) {
  const [timeLeft, setTimeLeft] = useState(600);
  const [showSongCard, setShowSongCard] = useState(true);
  
  const isHost = roomData.host === playerId;

  useEffect(() => {
    // Calculate remaining time based on startTime and gameDurationMs
    const gameDurationMs = roomData.gameDurationMs || (10 * 60 * 1000);
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - roomData.startTime;
      const remaining = Math.max(0, Math.floor((gameDurationMs - elapsed) / 1000));
      
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        clearInterval(interval);
        // Host automatically moves the game to presenting phase
        if (isHost) {
          moveToPresentation();
        }
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [roomData.startTime, roomData.gameDurationMs, isHost]);

  const moveToPresentation = () => {
    const playerIds = Object.keys(roomData.players || {});
    update(ref(db, `rooms/${roomId}`), {
      status: 'presenting',
      presentQueue: playerIds,
      currentPresenter: playerIds[0],
      presentationStartTime: Date.now()
    });
  };

  const handleFinishTrack = (tracks) => {
    // Save the finalized track structure to firebase
    // Because tracks contains Blob URLs which can't be saved to Firebase directly,
    // in a real app we would upload the blobs to Firebase Storage and save the download URLs.
    // For this MVP, we save the structure (and assume we'll stringify small audio blocks or upload later).
    
    update(ref(db, `rooms/${roomId}/tracks/${playerId}`), {
      ready: true,
      // Just saving a placeholder for the presentation phase for now
      timestamp: Date.now()
    });
    
    // Alert the user that they are done early
    alert("Track uložený! Čakaj na ostatných.");
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#09090b] overflow-hidden p-4">
      
      {showSongCard && (
        <SongCard 
          genre={roomData.currentStyle} 
          onDismiss={() => setShowSongCard(false)} 
        />
      )}

      {/* Header bar */}
      <div className="h-14 shrink-0 flex items-center justify-between px-6 bg-zinc-900 border-2 border-black rounded-2xl shadow-[0_4px_0_0_#000] mb-4">
        <div className="font-black text-xl text-pink-500 uppercase tracking-widest">
          FL PARTY STUDIO
        </div>
        <div className="font-bold text-zinc-400">
          Žáner: <span className="text-white ml-2">{roomData.currentStyle}</span>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 min-h-0 relative">
        <MusicWorkspace 
          roomId={roomId}
          playerId={playerId}
          timeRemaining={timeLeft}
          onFinish={handleFinishTrack}
        />
      </div>

    </div>
  );
}
