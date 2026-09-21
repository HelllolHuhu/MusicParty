import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../firebase';
import { ref, update, get } from 'firebase/database';
import CharacterCreator from './lobby/CharacterCreator';
import LobbySettings from './lobby/LobbySettings';
import PlayerList from './lobby/PlayerList';
import JoinCodeBox from './lobby/JoinCodeBox';
import { useLanguage } from '../context/LanguageContext';
import { fetchSongForGenre } from '../services/musicPreviewService';

export default function Lobby({ onJoin, initialRoomId, initialName, initialAvatarConfig, playerId }) {
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
    const cleanName = playerName.trim();
    if (!cleanName) return setError(t('lobby.enterNameError'));
    setError('');

    const newRoomId = Math.random().toString(36).substr(2, 6).toUpperCase();
    
    try {
      const roomRef = ref(db, `rooms/${newRoomId}`);
      await update(ref(db), {
        [`rooms/${newRoomId}`]: {
          host: playerId,
          status: 'lobby',
          settings: { 
            maxPlayers: 10, 
            timeMinutes: 10, 
            genres: ["Pop", "Hip-Hop", "EDM", "Lo-Fi"] 
          },
          players: {
            [playerId]: {
              name: cleanName,
              score: 0,
              avatarConfig: avatarConfig || null,
              joinedAt: Date.now()
            }
          },
          createdAt: Date.now()
        }
      });

      onJoin(newRoomId, cleanName, avatarConfig);
    } catch (err) {
      console.error("Firebase create room error:", err);
      setError(t('lobby.dbError') + err.message);
    }
  };

  const handleJoin = async () => {
    const cleanName = playerName.trim();
    const cleanRoomCode = roomId.trim().toUpperCase();
    if (!cleanName) return setError(t('lobby.enterNameError'));
    if (!cleanRoomCode) return setError(t('lobby.enterRoomError'));
    setError('');
    
    try {
      const roomRef = ref(db, `rooms/${cleanRoomCode}`);
      const snapshot = await get(roomRef);
      if (!snapshot.exists()) {
        return setError(t('lobby.roomNotFound'));
      }
      
      const roomData = snapshot.val();
      const currentPlayers = roomData?.players || {};
      const currentPlayersCount = Object.keys(currentPlayers).length;
      
      if (!currentPlayers[playerId] && currentPlayersCount >= 10) {
        return setError(t('lobby.roomFull'));
      }

      await update(ref(db, `rooms/${cleanRoomCode}/players/${playerId}`), {
        name: cleanName,
        score: currentPlayers[playerId]?.score || 0,
        avatarConfig: avatarConfig || null,
        joinedAt: currentPlayers[playerId]?.joinedAt || Date.now()
      });

      onJoin(cleanRoomCode, cleanName, avatarConfig);
    } catch (err) {
      console.error("Firebase join error:", err);
      setError(t('lobby.dbError') + err.message);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center px-4 sm:px-8 md:px-16 lg:px-24 xl:px-36 py-6 sm:py-10">
      <div className="w-full max-w-4xl">
        
        {error && (
          <div className="mb-6 bg-red-500 text-white font-bold p-3.5 sm:p-4 rounded-2xl text-center border-3 border-black shadow-[4px_4px_0_0_#000] animate-bounce">
            {error}
          </div>
        )}

        {/* Character Creator */}
        <div className="mb-6 sm:mb-8">
          <CharacterCreator 
            onChange={handleCharacterChange} 
            initialName={playerName} 
            initialConfig={avatarConfig} 
          />
        </div>

        {/* Action Panels: Create Room & Join */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div className="chunky-panel p-5 sm:p-6 flex flex-col justify-center">
            <h2 className="text-xl sm:text-2xl font-black mb-3.5 sm:mb-4 text-center">
              {t('lobby.newGame')}
            </h2>
            <button 
              onClick={handleCreate}
              className="btn-chunky btn-chunky-purple w-full text-lg sm:text-xl py-4 sm:py-5"
            >
              {t('lobby.createRoom')}
            </button>
          </div>

          <div className="chunky-panel p-4 sm:p-6 flex flex-col justify-center overflow-hidden min-w-0">
            <h2 className="text-xl sm:text-2xl font-black mb-3.5 sm:mb-4 text-center">
              {t('lobby.joinGame')}
            </h2>
            <div className="flex gap-2 w-full min-w-0 items-center">
              <input 
                type="text" 
                className="min-w-0 flex-1 w-full bg-black/40 border-3 border-black rounded-2xl p-2.5 sm:p-4 text-base sm:text-xl font-black text-center text-white placeholder-gray-300 focus:outline-none focus:border-pink-500 uppercase shadow-inner"
                placeholder={t('lobby.roomCode')}
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                maxLength={6}
              />
              <button 
                onClick={handleJoin}
                className="shrink-0 btn-chunky btn-chunky-gray text-base sm:text-xl px-4 sm:px-8 py-2.5 sm:py-4"
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

Lobby.InRoom = function InRoom({ roomId, roomData, playerId, playerName, avatarConfig, onLeave }) {
  const { t } = useLanguage();

  // Ensure current player's record is present in Firebase
  useEffect(() => {
    if (!roomId || !playerId || !db) return;
    
    if (roomData && roomData.players && !roomData.players[playerId]) {
      const updates = {};
      updates[`rooms/${roomId}/players/${playerId}`] = { 
        name: playerName || 'Player', 
        score: 0,
        avatarConfig: avatarConfig || null,
        joinedAt: Date.now()
      };
      
      update(ref(db), updates).catch(err => {
        console.error("Firebase player sync error:", err);
      });
    }
  }, [roomId, playerId, playerName, avatarConfig, roomData]);

  const [isConfirmingLeave, setIsConfirmingLeave] = useState(false);
  const [lobbyError, setLobbyError] = useState(null);
  const confirmTimerRef = useRef(null);

  // If host left or is missing, elect the first active player as host
  useEffect(() => {
    if (!roomData || !roomData.players || !roomId || !db) return;
    const playerIds = Object.keys(roomData.players);
    if (playerIds.length === 0) return;

    if (!roomData.host || !roomData.players[roomData.host]) {
      const nextHostId = playerIds[0];
      if (playerId === nextHostId) {
        update(ref(db, `rooms/${roomId}`), { host: nextHostId }).catch(console.error);
      }
    }
  }, [roomData, roomId, playerId]);

  // If room was disbanded by host
  useEffect(() => {
    if (roomData?.status === 'disbanded') {
      if (onLeave) onLeave();
      else window.location.href = "/";
    }
  }, [roomData?.status, onLeave]);

  const isHost = roomData?.host === playerId;
  const playersCount = Object.keys(roomData?.players || {}).length;

  const handleLeaveOrDisband = () => {
    if (!isConfirmingLeave) {
      setIsConfirmingLeave(true);
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
      confirmTimerRef.current = setTimeout(() => {
        setIsConfirmingLeave(false);
      }, 4000);
      return;
    }

    // Executed when confirmed
    if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    setIsConfirmingLeave(false);

    if (isHost) {
      update(ref(db, `rooms/${roomId}`), { status: 'disbanded' })
        .then(() => {
          if (onLeave) onLeave();
        })
        .catch(console.error);
    } else {
      const updates = {};
      updates[`rooms/${roomId}/players/${playerId}`] = null;
      update(ref(db), updates)
        .then(() => {
          if (onLeave) onLeave();
        })
        .catch(console.error);
    }
  };

  const startGame = async () => {
    if (playersCount < 2) {
      setLobbyError(t('lobby.need2Players'));
      setTimeout(() => setLobbyError(null), 4000);
      return;
    }

    const styles = roomData?.settings?.genres || ["Pop"];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    const timeMs = (roomData?.settings?.timeMinutes || 10) * 60 * 1000;
    
    // Fetch a real YouTube song clip for the selected genre
    const song = await fetchSongForGenre(randomStyle);

    // Transition to 5-second countdown first!
    update(ref(db, `rooms/${roomId}`), {
      status: 'countdown',
      countdownStartTime: Date.now(),
      currentSong: song,
      currentStyle: song.genre || randomStyle,
      gameDurationMs: timeMs,
      tracks: null,
      votes: null
    });
  };

  return (
    <div className="w-full px-4 sm:px-8 md:px-12 lg:px-20 xl:px-28 py-6 sm:py-8 flex flex-col items-center">
      <div className="max-w-5xl mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Left Column */}
        <div className="lg:col-span-1 flex flex-col gap-6 sm:gap-8">
          <JoinCodeBox roomId={roomId} />
          <LobbySettings roomId={roomId} roomData={roomData} isHost={isHost} />
          
          {/* Leave / Disband Party Button */}
          <button
            onClick={handleLeaveOrDisband}
            className={`w-full py-3 sm:py-3.5 px-4 rounded-2xl font-black text-sm sm:text-base border-3 border-black shadow-[0_4px_0_0_#000] active:translate-y-1 active:shadow-[0_0px_0_0] transition-all flex items-center justify-center gap-2 ${
              isConfirmingLeave
                ? 'bg-amber-400 hover:bg-amber-300 text-black animate-pulse'
                : isHost 
                  ? 'bg-red-600 hover:bg-red-500 text-white' 
                  : 'bg-black/40 hover:bg-red-600/70 text-white hover:text-white'
            }`}
          >
            <span>{isConfirmingLeave ? '⚠️' : isHost ? '💥' : '🚪'}</span>
            <span>
              {isConfirmingLeave
                ? (isHost ? t('lobby.confirmDisband') : t('lobby.confirmLeave'))
                : (isHost ? t('lobby.disbandParty') : t('lobby.leaveParty'))}
            </span>
          </button>

          {lobbyError && (
            <div className="bg-red-500/20 border-2 border-red-500 text-red-300 text-xs sm:text-sm font-bold p-3 rounded-xl text-center animate-bounce">
              {lobbyError}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 flex flex-col gap-6 sm:gap-8 h-[80vh] lg:h-auto">
          <div className="flex-1 min-h-[350px]">
            <PlayerList roomId={roomId} roomData={roomData} isHost={isHost} myPlayerId={playerId} />
          </div>

          <div className="chunky-panel p-5 sm:p-6 bg-black/25 border-3 border-black">
            {isHost ? (
              <button 
                onClick={startGame}
                disabled={playersCount < 2}
                className={`w-full text-2xl sm:text-3xl py-4 sm:py-6 tracking-wide uppercase ${playersCount < 2 ? 'btn-chunky btn-chunky-gray opacity-50 cursor-not-allowed' : 'btn-chunky btn-chunky-green animate-pulse'}`}
              >
                {playersCount < 2 ? t('lobby.waitingPlayers') : t('lobby.startGame')}
              </button>
            ) : (
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold mb-1">{t('lobby.waitingHost')}</div>
                <div className="text-sm sm:text-base opacity-75">({roomData?.players?.[roomData.host]?.name || t('lobby.unknown')})</div>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
};
