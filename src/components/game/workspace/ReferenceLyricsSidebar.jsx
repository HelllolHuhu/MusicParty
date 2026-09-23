import { useState, useEffect } from 'react';
import { FaTimes, FaMusic } from 'react-icons/fa';
import { fetchLyricsForSong } from '../../../services/lyricsService';

export default function ReferenceLyricsSidebar({
  isOpen = false,
  onClose = () => {},
  currentSong = null
}) {
  const [lyricsData, setLyricsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const artist = currentSong?.artist || '';
  const title = currentSong?.title || '';

  useEffect(() => {
    let isCancelled = false;
    if (isOpen && artist && title) {
      setIsLoading(true);
      fetchLyricsForSong(artist, title)
        .then(data => {
          if (!isCancelled) {
            setLyricsData(data);
            setIsLoading(false);
          }
        })
        .catch(() => {
          if (!isCancelled) {
            setLyricsData(null);
            setIsLoading(false);
          }
        });
    }
    return () => { isCancelled = true; };
  }, [isOpen, artist, title]);

  if (!isOpen) return null;

  return (
    <aside className="w-72 sm:w-80 bg-zinc-900 border-l-2 border-black flex flex-col shrink-0 select-none z-30 shadow-2xl h-full animate-in slide-in-from-right-4 duration-200">
      
      {/* Header */}
      <div className="p-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-950 shrink-0">
        <div className="flex items-center gap-2 truncate">
          <span className="w-6 h-6 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
            <FaMusic size={11} />
          </span>
          <span className="font-black text-pink-500 uppercase tracking-widest text-xs truncate">
            Song Lyrics
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center text-xs transition-colors"
          title="Close Lyrics Panel"
        >
          <FaTimes size={10} />
        </button>
      </div>

      {/* Song Reference Details Card */}
      <div className="p-3 bg-black/40 border-b border-zinc-800/80 flex items-center gap-3 shrink-0">
        {currentSong?.thumbnail && (
          <img
            src={currentSong.thumbnail}
            alt={title}
            className="w-12 h-12 rounded-xl object-cover border border-black shadow-sm shrink-0"
          />
        )}
        <div className="truncate">
          <h4 className="font-black text-xs text-white truncate drop-shadow-sm">
            {title || "Reference Song"}
          </h4>
          <p className="text-[11px] font-bold text-zinc-400 truncate">
            {artist || "Artist"}
          </p>
          {currentSong?.genre && (
            <span className="inline-block mt-0.5 text-[9px] font-black text-pink-400 bg-pink-500/10 px-1.5 py-0.2 rounded border border-pink-500/30 uppercase">
              {currentSong.genre}
            </span>
          )}
        </div>
      </div>

      {/* Lyrics Content */}
      <div className="flex-1 overflow-y-auto p-4 select-text">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-zinc-500">
            <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold">Loading lyrics...</span>
          </div>
        ) : lyricsData && lyricsData.text ? (
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium text-zinc-200 leading-relaxed whitespace-pre-line font-sans">
              {lyricsData.text}
            </p>
            <div className="pt-4 text-center">
              <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">
                Source: {lyricsData.source || 'lrclib'}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-center p-4 text-zinc-500">
            <span className="text-2xl mb-1">📝</span>
            <p className="text-xs font-bold text-zinc-400">No lyrics found for this song.</p>
            <p className="text-[10px] text-zinc-600 mt-1">You can write your own original bars and vocals!</p>
          </div>
        )}
      </div>

    </aside>
  );
}
