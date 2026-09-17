import { useState, useEffect } from 'react';
import { db } from './firebase';
import { ref, onValue } from 'firebase/database';
import Lobby from './components/Lobby';
import GamePhase from './components/GamePhase';
import PresentationPhase from './components/PresentationPhase';
import RoundResults from './components/RoundResults';
import Navbar from './components/common/Navbar';

function App() {
  const [playerId, setPlayerId] = useState(() => {
    let saved = localStorage.getItem('playerId');
    if (!saved) {
      saved = `player_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('playerId', saved);
    }
    return saved;
  });

  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('playerName') || '';
  });

  const [avatarConfig, setAvatarConfig] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('avatarConfig')) || null;
    } catch {
      return null;
    }
  });

  const [roomId, setRoomId] = useState(() => {
    // If URL has an explicit join code parameter, start at Lobby with that join code
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join');
    if (joinCode) {
      return null;
    }
    // Otherwise restore active room from localStorage
    return localStorage.getItem('currentRoomId') || null;
  });

  const [roomData, setRoomData] = useState(null);

  // Sync room data from Firebase
  useEffect(() => {
    if (!roomId || !db) return;
    
    const roomRef = ref(db, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setRoomData(data);
      } else {
        // Room was deleted or does not exist
        console.warn(`Room ${roomId} does not exist. Resetting state.`);
        localStorage.removeItem('currentRoomId');
        setRoomId(null);
        setRoomData(null);
      }
    }, (err) => {
      console.error("Firebase onValue error:", err);
      localStorage.removeItem('currentRoomId');
      setRoomId(null);
      setRoomData(null);
    });

    return () => unsubscribe();
  }, [roomId]);

  if (!db) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="text-center p-8 bg-red-900/50 rounded-2xl border border-red-500 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Firebase Missing</h2>
          <p>Please add your Firebase configuration to <code className="bg-gray-800 p-1 rounded">src/firebase.js</code></p>
        </div>
      </div>
    );
  }

  // Generate or store player details
  const initializePlayer = (name, config) => {
    let currentId = playerId;
    if (!currentId) {
      currentId = `player_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('playerId', currentId);
      setPlayerId(currentId);
    }
    if (name) {
      localStorage.setItem('playerName', name);
      setPlayerName(name);
    }
    if (config) {
      localStorage.setItem('avatarConfig', JSON.stringify(config));
      setAvatarConfig(config);
    }
    return currentId;
  };

  const handleLeaveRoom = () => {
    if (window.confirm("Leave current room?")) {
      if (roomId && playerId && db) {
        // Remove self from room players
        const updates = {};
        updates[`rooms/${roomId}/players/${playerId}`] = null;
        update(ref(db), updates).catch(console.error);
      }
      localStorage.removeItem('currentRoomId');
      setRoomId(null);
      setRoomData(null);
      window.history.replaceState({}, '', '/');
    }
  };

  const handleForcedLeave = () => {
    localStorage.removeItem('currentRoomId');
    setRoomId(null);
    setRoomData(null);
    window.history.replaceState({}, '', '/');
  };

  const currentRoomData = roomData || { status: 'lobby', players: {} };

  return (
    <div className="min-h-screen font-sans flex flex-col transition-colors duration-200">
      {/* Top Navbar with Theme Switcher, Logo, and Language Dropdown */}
      <Navbar onLogoClick={roomId ? handleLeaveRoom : undefined} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center">
        {!roomId && (
          <Lobby 
            initialRoomId={new URLSearchParams(window.location.search).get('join')}
            initialName={playerName}
            initialAvatarConfig={avatarConfig}
            playerId={playerId}
            onJoin={(id, name, config) => {
              initializePlayer(name, config);
              localStorage.setItem('currentRoomId', id);
              setRoomId(id);
              window.history.replaceState({}, '', '/');
            }} 
          />
        )}

        {roomId && currentRoomData.status === 'lobby' && (
          <Lobby.InRoom 
            roomId={roomId} 
            roomData={currentRoomData} 
            playerId={playerId}
            playerName={playerName} 
            avatarConfig={avatarConfig}
            onLeave={handleForcedLeave}
          />
        )}
        
        {roomId && currentRoomData.status === 'playing' && (
          <GamePhase 
            roomId={roomId}
            roomData={currentRoomData}
            playerId={playerId}
          />
        )}

        {roomId && currentRoomData.status === 'presenting' && (
          <PresentationPhase 
            roomId={roomId}
            roomData={currentRoomData}
            playerId={playerId}
          />
        )}

        {roomId && currentRoomData.status === 'round_results' && (
          <RoundResults 
            roomId={roomId}
            roomData={currentRoomData}
            playerId={playerId}
          />
        )}
      </main>
    </div>
  );
}

export default App;
