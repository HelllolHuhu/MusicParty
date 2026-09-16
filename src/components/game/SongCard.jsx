import { useState, useEffect } from 'react';
import { FaPlay, FaPause } from 'react-icons/fa';

export default function SongCard({ genre, onDismiss }) {
  const [playing, setPlaying] = useState(false);
  const [countdown, setCountdown] = useState(10);

  // Auto dismiss after 10s
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onDismiss]);

  const togglePlay = () => {
    // Fake audio playback for now
    setPlaying(!playing);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="chunky-panel max-w-md w-full bg-zinc-900 border-zinc-800 p-8 flex flex-col items-center animate-in zoom-in duration-300">
        
        <h2 className="text-pink-500 font-bold text-xl uppercase tracking-widest mb-6">Tvoj Žáner</h2>
        
        {/* Cover Art Fake */}
        <div className="w-64 h-64 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl shadow-2xl border-4 border-black mb-6 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20 mix-blend-overlay"></div>
          <span className="text-4xl font-black text-white text-center transform -rotate-12 drop-shadow-lg p-4">
            {genre} <br/> ANTHEM
          </span>
          
          {/* Play button overlay */}
          <button 
            onClick={togglePlay}
            className="absolute bottom-4 right-4 w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-[0_4px_15px_rgba(0,0,0,0.5)]"
          >
            {playing ? <FaPause size={20} /> : <FaPlay size={20} className="ml-1" />}
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white mb-2">{genre}</h1>
          <p className="text-zinc-400 font-bold">120 BPM • Party Vibes</p>
        </div>

        <button 
          onClick={onDismiss}
          className="btn-chunky btn-chunky-purple w-full py-4 text-xl flex justify-between px-8"
        >
          <span>Ideme na to!</span>
          <span className="opacity-50">({countdown}s)</span>
        </button>
      </div>
    </div>
  );
}
