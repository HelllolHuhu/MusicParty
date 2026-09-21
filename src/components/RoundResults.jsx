import { useMemo, useEffect } from 'react';
import { db } from '../firebase';
import { ref, update } from 'firebase/database';
import { useLanguage } from '../context/LanguageContext';
import { fetchSongForGenre } from '../services/musicPreviewService';

export default function RoundResults({ roomId, roomData, playerId, onLeave }) {
  const { t } = useLanguage();
  const isHost = roomData.host === playerId;

  // Calculate results
  const results = useMemo(() => {
    const players = roomData.players || {};
    const votes = roomData.votes || {};
    
    return Object.entries(players).map(([id, p]) => {
      const playerVotes = votes[id] || {};
      const voteValues = Object.values(playerVotes);
      const avg = voteValues.length > 0 
        ? voteValues.reduce((a,b) => a+b, 0) / voteValues.length 
        : 0;
        
      return {
        id,
        name: p.name,
        avg: parseFloat(avg.toFixed(1)),
        votesCount: voteValues.length
      };
    }).sort((a, b) => b.avg - a.avg);
  }, [roomData.players, roomData.votes]);

  // Once on mount for the host, update global scores
  useEffect(() => {
    if (isHost && results.length > 0) {
      const updates = {};
      results.forEach(r => {
        const currentScore = roomData.players[r.id]?.score || 0;
        updates[`rooms/${roomId}/players/${r.id}/score`] = currentScore + r.avg;
      });
      update(ref(db), updates).catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nextRound = async () => {
    const styles = roomData?.settings?.genres || ["Pop", "Rock", "Hip-Hop", "EDM", "Trap", "Reggaeton", "Metal", "Synthpop 80s", "Acoustic", "Lo-Fi"];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    const timeMs = (roomData?.settings?.timeMinutes || 10) * 60 * 1000;
    
    const song = await fetchSongForGenre(randomStyle);

    update(ref(db, `rooms/${roomId}`), {
      status: 'countdown',
      countdownStartTime: Date.now(),
      currentSong: song,
      currentStyle: song.genre || randomStyle,
      gameDurationMs: timeMs,
      tracks: null,
      votes: null,
      presentQueue: null,
      currentPresenter: null,
      presentationStartTime: null
    }).catch(console.error);
  };

  const returnToLobby = () => {
    update(ref(db, `rooms/${roomId}`), {
      status: 'lobby',
      tracks: null,
      votes: null,
      presentQueue: null,
      currentPresenter: null,
      currentSong: null,
      currentStyle: null,
      countdownStartTime: null,
      songStartTime: null,
      presentationStartTime: null,
      startTime: null
    }).catch(console.error);
  };

  const viewFinalLeaderboard = () => {
    update(ref(db, `rooms/${roomId}`), {
      status: 'final_results'
    }).catch(console.error);
  };

  if (roomData.status === 'final_results') {
    const finalScores = Object.entries(roomData.players || {})
      .map(([id, p]) => ({ name: p.name, score: parseFloat((p.score || 0).toFixed(1)) }))
      .sort((a,b) => b.score - a.score);

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-2xl text-center border-4 border-black">
          <h1 className="text-5xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500">
            {t('results.gameOver')}
          </h1>
          <div className="space-y-4 mb-8">
            {finalScores.map((p, i) => (
              <div key={i} className={`p-4 rounded-xl flex justify-between items-center ${i === 0 ? 'bg-yellow-500/20 border-2 border-yellow-500 shadow-md' : 'bg-gray-700'}`}>
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-gray-400">#{i+1}</span>
                  <span className={`text-xl font-black ${i===0 ? 'text-yellow-400' : 'text-white'}`}>{p.name}</span>
                </div>
                <div className="text-2xl font-black">{p.score} pt</div>
              </div>
            ))}
          </div>

          {isHost ? (
            <button 
              onClick={returnToLobby}
              className="btn-chunky btn-chunky-green w-full text-xl sm:text-2xl py-4 sm:py-5 font-black uppercase tracking-wide animate-pulse"
            >
              {t('results.returnToLobby')}
            </button>
          ) : (
            <div className="text-gray-400 font-bold text-base sm:text-lg animate-pulse">
              {t('results.waitingHostLobby')}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-2xl text-center border-4 border-black">
        <h2 className="text-3xl font-black mb-8 text-white">{t('results.roundResults')}</h2>
        
        <div className="space-y-3 mb-8">
          {results.map((r) => (
            <div key={r.id} className="bg-gray-700 p-4 rounded-xl flex justify-between items-center border border-gray-600">
              <span className="font-black text-lg text-white">{r.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-2xl">★</span>
                <span className="text-xl font-black text-white">{r.avg}</span>
                <span className="text-gray-400 text-sm">({r.votesCount} {t('results.votes')})</span>
              </div>
            </div>
          ))}
        </div>

        {isHost ? (
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={nextRound}
              className="btn-chunky btn-chunky-green flex-1 py-4 text-lg font-black tracking-wide uppercase"
            >
              {t('results.nextRound')}
            </button>
            <button 
              onClick={returnToLobby}
              className="btn-chunky btn-chunky-purple flex-1 py-4 text-base font-black tracking-wide uppercase"
            >
              {t('results.returnToLobby')}
            </button>
            <button 
              onClick={viewFinalLeaderboard}
              className="btn-chunky btn-chunky-pink py-4 px-5 text-base font-black tracking-wide uppercase"
            >
              {t('results.viewLeaderboard')}
            </button>
          </div>
        ) : (
          <div className="text-gray-400 font-bold text-base sm:text-lg animate-pulse">
            {t('lobby.waitingHost')}
          </div>
        )}
      </div>
    </div>
  );
}

