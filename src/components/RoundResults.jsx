import { useMemo, useEffect } from 'react';
import { db } from '../firebase';
import { ref, update } from 'firebase/database';

export default function RoundResults({ roomId, roomData, playerId }) {
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
      update(ref(db), updates);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const nextRound = () => {
    const styles = ["80s Synthpop", "Lo-Fi Hip Hop", "Punk Rock", "Trap Beat", "Eurodance 90s", "Reggaeton", "Acoustic Ballad"];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    
    update(ref(db, `rooms/${roomId}`), {
      status: 'playing',
      currentStyle: randomStyle,
      startTime: Date.now(),
      tracks: null,
      votes: null
    });
  };

  const endGame = () => {
    update(ref(db, `rooms/${roomId}`), {
      status: 'final_results'
    });
  };

  if (roomData.status === 'final_results') {
    const finalScores = Object.entries(roomData.players || {})
      .map(([id, p]) => ({ name: p.name, score: parseFloat((p.score || 0).toFixed(1)) }))
      .sort((a,b) => b.score - a.score);

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-2xl text-center">
          <h1 className="text-5xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500">
            Koniec Hry!
          </h1>
          <div className="space-y-4">
            {finalScores.map((p, i) => (
              <div key={i} className={`p-4 rounded-xl flex justify-between items-center ${i === 0 ? 'bg-yellow-500/20 border border-yellow-500' : 'bg-gray-700'}`}>
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-gray-400">#{i+1}</span>
                  <span className={`text-xl ${i===0 ? 'font-bold text-yellow-400' : 'text-white'}`}>{p.name}</span>
                </div>
                <div className="text-2xl font-black">{p.score} pt</div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-8 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded-xl transition-colors"
          >
            Späť do menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-2xl text-center">
        <h2 className="text-3xl font-bold mb-8">Výsledky Kola</h2>
        
        <div className="space-y-3 mb-8">
          {results.map((r, i) => (
            <div key={r.id} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
              <span className="font-bold text-lg">{r.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-2xl">★</span>
                <span className="text-xl font-black">{r.avg}</span>
                <span className="text-gray-400 text-sm">({r.votesCount} hlasov)</span>
              </div>
            </div>
          ))}
        </div>

        {isHost ? (
          <div className="flex gap-4">
            <button 
              onClick={nextRound}
              className="flex-1 bg-green-500 hover:bg-green-400 text-white font-bold py-4 px-6 rounded-xl text-lg transition-transform hover:scale-105"
            >
              Ďalšie Kolo
            </button>
            <button 
              onClick={endGame}
              className="bg-red-500 hover:bg-red-400 text-white font-bold py-4 px-6 rounded-xl transition-colors"
            >
              Ukončiť hru
            </button>
          </div>
        ) : (
          <div className="text-gray-400 animate-pulse">
            Čaká sa na hosta...
          </div>
        )}
      </div>
    </div>
  );
}
