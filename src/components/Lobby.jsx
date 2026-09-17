import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { ref, update, get } from 'firebase/database';
import CharacterCreator from './lobby/CharacterCreator';
import LobbySettings from './lobby/LobbySettings';
import PlayerList from './lobby/PlayerList';
import JoinCodeBox from './lobby/JoinCodeBox';
import { useLanguage } from '../context/LanguageContext';

export default function Lobby({ onJoin, initialRoomId, initialName, initialAvatarConfig }) {
  const { t } = useLanguage();
  const [roomId, setRoomId] = useState(initialRoomId || '');
  const [error, setError] = useState('');
  
  // State from CharacterCreator
  const [playerName, setPlayerName] = useState(initialName || '');
  const [avatarConfig, setAvatarConfig] = useState(initialAvatarConfig || null);

  const handleCharacterChange = useCallback((newName, newConfig) => {
    setPlayerName(newName);
    setAvatarConfig(newConfig);
  }, []);

  const handleCreate = async () => {
    if (!playerName.trim()) return setError(t('lobby.enterNameError'));
    const newRoomId = Math.random().toString(36).substr(2, 6).toUpperCase();
    onJoin(newRoomId, playerName, avatarConfig);
  };

  const handleJoin = async () => {
    if (!playerName.trim()) return setError(t('lobby.enterNameError'));
    if (!roomId.trim()) return setError(t('lobby.enterRoomError'));
    
    const roomRef = ref(db, `rooms/${roomId.toUpperCase()}`);
    const snapshot = await get(roomRef);
    if (!snapshot.exists()) {
      return setError(t('lobby.roomNotFound'));
    }
    
    const roomData = snapshot.val();
    const maxPlayers = roomData?.settings?.maxPlayers || 10;
    const currentPlayersCount = Object.keys(roomData?.players || {}).length;
    
    if (currentPlayersCount >= maxPlayers) {
      return setError(t('lobby.roomFull'));
    }

    onJoin(roomId.toUpperCase(), playerName, avatarConfig);
  };

  return (
    <div className="min-h-screen bg-[#111827] flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-5xl">
        <h1 className="text-6xl md:text-7xl font-black text-center mb-8 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] tracking-wide">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
            Music Party
          </span>
        </h1>
        
        {error && (
          <div className="mb-6 bg-red-500 text-white font-bold p-4 rounded-xl text-center border-4 border-red-700 shadow-[0_4px_0_0_#991b1b] animate-bounce">
            {error}
          </div>
        )}

        <div className="mb-8">
          <CharacterCreator 
            onChange={handleCharacterChange} 
            initialName={playerName} 
            initialConfig={avatarConfig} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="chunky-panel p-6 flex flex-col justify-center">
            <h2 className="text-2xl font-bold mb-4 text-center">{t('lobby.newGame')}</h2>
            <button 
              onClick={handleCreate}
              className="btn-chunky btn-chunky-purple w-full text-xl py-6"
            >
              {t('lobby.createRoom')}
            </button>
          </div>

          <div className="chunky-panel p-6 flex flex-col justify-center">
            <h2 className="text-2xl font-bold mb-4 text-center">{t('lobby.joinGame')}</h2>
            <div className="flex gap-2">
              <input 
                type="text" 
                className="flex-1 bg-gray-700 border-4 border-gray-900 rounded-2xl p-4 text-xl font-black text-center text-white focus:outline-none focus:border-pink-500 uppercase shadow-inner placeholder-gray-500"
                placeholder={t('lobby.roomCode')}
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                maxLength={6}
              />
              <button 
                onClick={handleJoin}
                className="btn-chunky btn-chunky-gray text-xl px-8"
              >
                {t('lobby.go')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Lobby.InRoom = function InRoom({ roomId, roomData, playerId, playerName, avatarConfig }) {
  const { t } = useLanguage();

  // Join the room in DB on mount if not already there
  useEffect(() => {
    if (!roomData?.players?.[playerId]) {
      const isHost = !roomData || !roomData.host;
      
      const updates = {};
      if (isHost) {
        updates[`rooms/${roomId}/host`] = playerId;
        updates[`rooms/${roomId}/status`] = 'lobby';
        updates[`rooms/${roomId}/settings`] = { maxPlayers: 10, timeMinutes: 10, genres: ["Pop", "Hip-Hop", "EDM", "Lo-Fi"] };
      }
      updates[`rooms/${roomId}/players/${playerId}`] = { 
        name: playerName, 
        score: 0,
        avatarConfig: avatarConfig || null
      };
      
      update(ref(db), updates).catch(err => {
        console.error("Firebase write error:", err);
        alert(t('lobby.dbError') + err.message);
      });
    }
  }, [roomId, playerId, playerName, avatarConfig, roomData, t]);

  // If I got kicked, I shouldn't be here
  useEffect(() => {
    if (roomData?.players && !roomData.players[playerId] && roomData.host) {
      alert(t('lobby.kickedAlert'));
      window.location.href = "/";
    }
  }, [roomData, playerId, t]);

  const isHost = roomData?.host === playerId;
  const playersCount = Object.keys(roomData?.players || {}).length;

  const startGame = () => {
    if (playersCount < 2) {
      alert(t('lobby.need2Players'));
      return;
    }

    const styles = roomData.settings?.genres || ["Pop"];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    const timeMs = (roomData.settings?.timeMinutes || 10) * 60 * 1000;
    
    update(ref(db, `rooms/${roomId}`), {
      status: 'playing',
      currentStyle: randomStyle,
      startTime: Date.now(),
      gameDurationMs: timeMs,
      tracks: null,
      votes: null
    });
  };

  return (
    <div className="min-h-screen p-4 py-8 md:p-8 flex flex-col">
      <div className="max-w-6xl mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          <JoinCodeBox roomId={roomId} />
          <LobbySettings roomId={roomId} roomData={roomData} isHost={isHost} />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 flex flex-col gap-8 h-[80vh] lg:h-auto">
          <div className="flex-1 min-h-[400px]">
            <PlayerList roomId={roomId} roomData={roomData} isHost={isHost} myPlayerId={playerId} />
          </div>

          <div className="chunky-panel p-6 bg-gradient-to-r from-gray-800 to-gray-900 border-purple-900">
            {isHost ? (
              <button 
                onClick={startGame}
                disabled={playersCount < 2}
                className={`w-full text-3xl py-6 tracking-wide uppercase ${playersCount < 2 ? 'btn-chunky btn-chunky-gray opacity-50 cursor-not-allowed' : 'btn-chunky btn-chunky-green animate-pulse'}`}
              >
                {playersCount < 2 ? t('lobby.waitingPlayers') : t('lobby.startGame')}
              </button>
            ) : (
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-400 mb-2">{t('lobby.waitingHost')}</div>
                <div className="text-gray-500">({roomData?.players?.[roomData.host]?.name || t('lobby.unknown')})</div>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
};
