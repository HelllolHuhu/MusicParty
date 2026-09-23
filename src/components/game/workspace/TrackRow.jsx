import { useState } from 'react';
import { FaVolumeMute, FaVolumeUp, FaTrash, FaSlidersH, FaCopy } from 'react-icons/fa';
import ClipItem from './ClipItem';

export function TrackHeader({
  track,
  tracks = [],
  onUpdateTrack = () => {},
  onDeleteTrack = () => {},
  onDuplicateTrack = () => {},
  onOpenInstrument = () => {}
}) {
  const toggleMute = (e) => {
    e.stopPropagation();
    onUpdateTrack({ ...track, muted: !track.muted });
  };

  const toggleSolo = (e) => {
    e.stopPropagation();
    onUpdateTrack({ ...track, solo: !track.solo });
  };

  const handleVolumeChange = (e) => {
    const vol = parseInt(e.target.value, 10);
    onUpdateTrack({ ...track, volume: vol });
  };

  const trackColorBorder = track.isReference
    ? 'border-l-4 border-l-yellow-400'
    : track.type === 'vocal'
    ? 'border-l-4 border-l-emerald-500'
    : track.id === 't1'
    ? 'border-l-4 border-l-pink-500'
    : track.id === 't2'
    ? 'border-l-4 border-l-blue-500'
    : track.id === 't3'
    ? 'border-l-4 border-l-purple-500'
    : 'border-l-4 border-l-zinc-500';

  return (
    <div className={`h-20 w-full bg-zinc-900/95 border-b border-zinc-800 p-2 sm:p-2.5 flex flex-col justify-between shrink-0 select-none transition-opacity ${track.muted ? 'opacity-50' : 'opacity-100'} ${trackColorBorder}`}>
      {/* Track Title, Instrument Launcher & Actions */}
      <div className="flex items-center justify-between gap-1">
        <div 
          onClick={() => onOpenInstrument(track)}
          className="font-black text-xs text-white hover:text-pink-400 cursor-pointer truncate flex items-center gap-1.5 transition-colors"
          title="Click to open pattern editor"
        >
          <span className="truncate">{track.name}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {!track.isReference && (track.id === 't1' || track.id === 't2' || track.id === 't3' || track.id === 't4') && (
            <button
              onClick={() => onOpenInstrument(track)}
              className="w-5 h-5 rounded flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              title="Edit in Instrument Pattern Editor"
            >
              <FaSlidersH size={9} />
            </button>
          )}

          {!track.isReference && (
            <button
              onClick={() => onDuplicateTrack(track.id)}
              className="w-5 h-5 rounded flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
              title="Duplicate Track"
            >
              <FaCopy size={9} />
            </button>
          )}

          {!track.isReference && tracks.length > 2 && (
            <button
              onClick={() => onDeleteTrack(track.id)}
              className="w-5 h-5 rounded flex items-center justify-center bg-zinc-800 hover:bg-red-500/30 text-zinc-400 hover:text-red-400 transition-colors"
              title="Delete Track"
            >
              <FaTrash size={9} />
            </button>
          )}
        </div>
      </div>

      {/* Mute, Solo & Volume Slider */}
      <div className="flex items-center justify-between gap-2 mt-1">
        <div className="flex items-center gap-1">
          <button
            onClick={toggleMute}
            className={`w-6 h-5 rounded text-[10px] font-black border transition-all ${
              track.muted
                ? 'bg-red-600 text-white border-red-700 shadow-inner'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border-zinc-700'
            }`}
            title={track.muted ? "Unmute" : "Mute"}
          >
            M
          </button>

          <button
            onClick={toggleSolo}
            className={`w-6 h-5 rounded text-[10px] font-black border transition-all ${
              track.solo
                ? 'bg-yellow-400 text-black border-yellow-500 shadow-inner'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border-zinc-700'
            }`}
            title={track.solo ? "Solo Off" : "Solo"}
          >
            S
          </button>
        </div>

        <div className="flex items-center gap-1.5 flex-1 max-w-[90px]">
          <span className="text-[9px] font-bold text-zinc-500">
            {track.muted ? <FaVolumeMute size={10} /> : <FaVolumeUp size={10} />}
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={track.volume ?? 100}
            onChange={handleVolumeChange}
            className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
            title={`Track Volume: ${track.volume ?? 100}%`}
          />
        </div>
      </div>
    </div>
  );
}

export function TrackLane({
  track,
  songDurationSeconds = 60,
  zoom = 1,
  selectedClipId,
  onSelectClip = () => {},
  onAddClipToTrack = () => {},
  onUpdateClip = () => {},
  onDeleteClip = () => {}
}) {
  const [isDropHover, setIsDropHover] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDropHover) setIsDropHover(true);
  };

  const handleDragLeave = () => {
    setIsDropHover(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDropHover(false);

    const rawData = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
    if (!rawData) return;

    try {
      const item = JSON.parse(rawData);
      const laneRect = e.currentTarget.getBoundingClientRect();
      const relativeX = Math.max(0, Math.min(laneRect.width, e.clientX - laneRect.left));
      const rawTime = (relativeX / laneRect.width) * songDurationSeconds;
      
      const snappedTime = Math.round(rawTime * 2) / 2;
      const finalTime = Math.max(0, Math.min(songDurationSeconds - (item.duration || 2), snappedTime));

      const newClip = {
        id: `clip_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        name: item.name || 'Sample',
        color: item.color || 'bg-blue-600',
        startAt: finalTime,
        duration: item.duration || 4,
        sampleId: item.id || item.soundKey,
        soundKey: item.soundKey,
        isNote: item.isNote,
        note: item.note
      };

      onAddClipToTrack(track.id, newClip);
    } catch (err) {
      console.warn("Track drop parse error:", err);
    }
  };

  return (
    <div
      className={`track-lane h-20 w-full relative overflow-hidden border-b border-zinc-800/80 transition-colors ${
        track.muted ? 'opacity-40' : 'opacity-100'
      } ${
        isDropHover ? 'bg-pink-500/10 ring-2 ring-inset ring-pink-500/50' : 'bg-zinc-900/30 hover:bg-zinc-900/50'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Background Beat Grid Lines */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px)',
          backgroundSize: `${(1 / (songDurationSeconds / 4)) * 100}% 100%`
        }}
      />

      {/* Drop Guidance Placeholder */}
      {isDropHover && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs font-black text-pink-400 bg-pink-500/10">
          ⬇ Drop sound here
        </div>
      )}

      {/* Render Clips */}
      {(track.clips || []).map(clip => (
        <ClipItem
          key={clip.id}
          clip={clip}
          track={track}
          songDurationSeconds={songDurationSeconds}
          zoom={zoom}
          isSelected={selectedClipId === clip.id}
          onSelect={() => onSelectClip(clip.id)}
          onDelete={(clipId) => onDeleteClip(track.id, clipId)}
          onUpdate={(updatedClip) => onUpdateClip(track.id, updatedClip)}
        />
      ))}
    </div>
  );
}

export default function TrackRow(props) {
  return (
    <div className="flex h-20 bg-zinc-900 border-b border-zinc-800/80">
      <div className="w-48 sm:w-56 shrink-0">
        <TrackHeader {...props} />
      </div>
      <div className="flex-1 min-w-0">
        <TrackLane {...props} />
      </div>
    </div>
  );
}
