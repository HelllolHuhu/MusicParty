import { useMemo } from 'react';
import { db } from '../../firebase';
import { ref, update } from 'firebase/database';
import AvatarViewer from './AvatarViewer';

export default function PlayerList({ roomId, roomData, isHost, myPlayerId }) {
  const players = Object.entries(roomData?.players || {}).map(([id, p]) => ({ id, ...p }));
  const maxPlayers = roomData?.settings?.maxPlayers || 10;

  const handleKick = (targetId) => {
    if (!isHost) return;
    if (confirm("Naozaj chceš vykopnúť tohto hráča?")) {
      const updates = {};
      updates[`rooms/${roomId}/players/${targetId}`] = null;
      update(ref(db), updates);
    }
  };

  return (
    <div className="chunky-panel p-6 h-full flex flex-col">
      <h3 className="text-xl font-bold text-green-400 mb-4 flex justify-between items-end">
        <span>Hráči</span>
        <span className="text-sm text-gray-500">{players.length} / {maxPlayers}</span>
      </h3>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {players.map(p => (
          <div key={p.id} className={`flex items-center justify-between p-3 rounded-2xl border-2 ${p.id === myPlayerId ? 'bg-zinc-800 border-green-500 shadow-[0_4px_0_0_#22c55e]' : 'bg-zinc-900 border-black shadow-[0_4px_0_0_#000]'}`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-zinc-800 border-2 border-black flex items-center justify-center overflow-hidden relative">
                {p.avatarConfig ? (
                  <AvatarViewer config={p.avatarConfig} seed={p.name} className="w-full h-full" />
                ) : (
                  <span className="font-bold text-gray-500">{p.name?.charAt(0)?.toUpperCase()}</span>
                )}
                </div>
                <div>
                  <div className="font-bold text-white text-lg">
                    {p.name} 
                    {p.id === roomData.host && <span className="ml-2 text-yellow-400 text-sm" title="Host">👑</span>}
                  </div>
                  {p.id === myPlayerId && <div className="text-xs text-green-400 font-bold uppercase tracking-wider">Ty</div>}
                </div>
              </div>
              
              {isHost && p.id !== myPlayerId && (
                <button 
                  onClick={() => handleKick(p.id)}
                  className="text-red-500 hover:text-red-400 hover:bg-red-500/20 p-2 rounded-lg font-bold text-sm transition-colors"
                >
                  KICK
                </button>
              )}
            </div>
        ))}

        {/* Empty slots placeholders */}
        {Array.from({ length: Math.max(0, maxPlayers - players.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="flex items-center gap-4 p-3 rounded-2xl border-2 border-dashed border-gray-700 opacity-50">
            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center"></div>
            <div className="font-bold text-gray-600">Voľné miesto...</div>
          </div>
        ))}
      </div>
    </div>
  );
}
