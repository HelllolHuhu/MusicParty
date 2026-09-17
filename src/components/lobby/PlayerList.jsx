import { db } from '../../firebase';
import { ref, update } from 'firebase/database';
import AvatarViewer from './AvatarViewer';
import { useLanguage } from '../../context/LanguageContext';

export default function PlayerList({ roomId, roomData, isHost, myPlayerId }) {
  const { t } = useLanguage();
  const players = Object.entries(roomData?.players || {}).map(([id, p]) => ({ id, ...p }));
  const MAX_PLAYERS = 10;

  const handleKick = (targetId) => {
    if (!isHost) return;
    if (confirm(t('playerList.kickConfirm'))) {
      const updates = {};
      updates[`rooms/${roomId}/players/${targetId}`] = null;
      update(ref(db), updates);
    }
  };

  return (
    <div className="chunky-panel p-5 sm:p-6 h-full flex flex-col">
      <h3 className="text-xl sm:text-2xl font-black mb-4 flex justify-between items-center">
        <span>{t('playerList.players')}</span>
        <span className="text-sm sm:text-base opacity-80 font-mono font-black bg-black/30 px-3 py-1 rounded-xl border border-black/40">
          {players.length} / {MAX_PLAYERS}
        </span>
      </h3>
      
      <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-3">
        {players.map(p => {
          const isCurrentPlayerHost = p.id === roomData?.host;
          const isMe = p.id === myPlayerId;

          return (
            <div 
              key={p.id} 
              className={`flex items-center justify-between p-3 sm:p-4 rounded-2xl border-3 border-black transition-all ${
                isMe 
                  ? 'bg-black/40 shadow-[4px_4px_0_0_#000]' 
                  : 'bg-black/20 shadow-[2px_2px_0_0_#000]'
              }`}
            >
              <div className="flex items-center gap-3.5 sm:gap-4.5 min-w-0">
                {/* Big Character Icon */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-3 border-black shadow-[2px_2px_0_0_#000] overflow-hidden shrink-0 flex items-center justify-center bg-black/40">
                  {p.avatarConfig ? (
                    <AvatarViewer config={p.avatarConfig} className="w-full h-full" />
                  ) : (
                    <span className="font-black text-white text-2xl sm:text-3xl">{p.name?.charAt(0)?.toUpperCase()}</span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="font-black text-white text-lg sm:text-xl flex items-center gap-2 truncate">
                    <span className="truncate">{p.name}</span>
                    {isCurrentPlayerHost && (
                      <span className="inline-flex items-center gap-1 bg-yellow-400 text-black text-xs font-black px-2 py-0.5 rounded-lg border border-black shrink-0 shadow-sm" title={t('playerList.host')}>
                        👑 {t('playerList.host')}
                      </span>
                    )}
                  </div>
                  {isMe && (
                    <div className="mt-0.5 text-xs font-black text-yellow-300 uppercase tracking-wider">
                      ✨ {t('playerList.you')}
                    </div>
                  )}
                </div>
              </div>
              
              {isHost && !isMe && (
                <button 
                  onClick={() => handleKick(p.id)}
                  className="btn-chunky btn-chunky-gray text-red-400 hover:text-red-200 px-3 py-1.5 rounded-xl font-black text-xs transition-colors shrink-0 ml-2"
                >
                  {t('playerList.kick')}
                </button>
              )}
            </div>
          );
        })}

        {players.length < 2 && (
          <div className="p-4 rounded-2xl border-2 border-dashed border-black/30 text-center font-bold text-xs sm:text-sm opacity-60">
            {t('lobby.waitingPlayers')} ({players.length}/{MAX_PLAYERS})
          </div>
        )}
      </div>
    </div>
  );
}
