import { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, onValue } from 'firebase/database';
import Lobby from './components/Lobby';
import GamePhase from './components/GamePhase';
import PresentationPhase from './components/PresentationPhase';
import RoundResults from './components/RoundResults';
import LanguageSwitcher from './components/common/LanguageSwitcher';

function App() {
  const [playerId, setPlayerId] = useState(localStorage.getItem('playerId') || null);
  const [playerName, setPlayerName] = useState(localStorage.getItem('playerName') || '');
  const [avatarConfig, setAvatarConfig] = useState(JSON.parse(localStorage.getItem('avatarConfig')) || null);
  const [roomId, setRoomId] = useState(null);
  const [roomData, setRoomData] = useState(null);

  // Check URL for join code
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode && !roomId) {
      // Don't auto-set roomId yet if we don't have a player setup, just keep it in URL
    }
  }, [roomId]);

  // Sync room data from Firebase
  useEffect(() => {
    if (!roomId || !db) return;
    const roomRef = ref(db, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRoomData(data);
      } else {
        setRoomData(null);
      }
    });
    return () => unsubscribe();
  }, [roomId]);

  if (!db) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center p-8 bg-red-900/50 rounded-xl border border-red-500 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Firebase Missing</h2>
          <p>Please add your Firebase configuration to <code className="bg-gray-800 p-1 rounded">src/firebase.js</code></p>
        </div>
      </div>
    );
  }

  // Generate random player ID if not exists
  const initializePlayer = (name, config) => {
    let newId = playerId;
    if (!newId) {
      newId = `player_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('playerId', newId);
      setPlayerId(newId);
    }
    localStorage.setItem('playerName', name);
    localStorage.setItem('avatarConfig', JSON.stringify(config));
    setPlayerName(name);
    setAvatarConfig(config);
    return newId;
  };

  // 1. HOME SCREEN (Not in room)
  if (!roomId) {
    const params = new URLSearchParams(window.location.search);
    const initialRoomId = params.get('join');
    
    return (
      <div className="relative">
        <div className="fixed top-4 right-4 z-50">
          <LanguageSwitcher />
        </div>
        <Lobby 
          initialRoomId={initialRoomId}
          initialName={playerName}
          initialAvatarConfig={avatarConfig}
          onJoin={(id, name, config) => {
            initializePlayer(name, config);
            setRoomId(id);
            window.history.replaceState({}, '', '/');
          }} 
        />
      </div>
    );
  }

  const currentRoomData = roomData || { status: 'lobby', players: {} };

  // Main routing based on room status
  return (
    <div className="min-h-screen font-sans relative">
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      {currentRoomData.status === 'lobby' && (
        <Lobby.InRoom 
          roomId={roomId} 
          roomData={currentRoomData} 
          playerId={playerId}
          playerName={playerName} 
          avatarConfig={avatarConfig}
        />
      )}
      
      {currentRoomData.status === 'playing' && (
        <GamePhase 
          roomId={roomId}
          roomData={currentRoomData}
          playerId={playerId}
        />
      )}

      {currentRoomData.status === 'presenting' && (
        <PresentationPhase 
          roomId={roomId}
          roomData={currentRoomData}
          playerId={playerId}
        />
      )}

      {currentRoomData.status === 'round_results' && (
        <RoundResults 
          roomId={roomId}
          roomData={currentRoomData}
          playerId={playerId}
        />
      )}
    </div>
  );
}

export default App;
