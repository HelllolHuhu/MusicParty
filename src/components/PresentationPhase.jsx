import { useState, useEffect, useMemo, useRef } from 'react';
import { db } from '../firebase';
import { ref, update, set } from 'firebase/database';
import { FaPlay, FaPause, FaRedo, FaForward, FaTrophy, FaStar, FaMusic } from 'react-icons/fa';
import AvatarViewer from './lobby/AvatarViewer';
import { audioEngine } from './game/workspace/AudioEngine';
import { useLanguage } from '../context/LanguageContext';

export default function PresentationPhase({ roomId, roomData, playerId }) {
  const { t } = useLanguage();
  
  const currentPresenterId = roomData.currentPresenter || roomData.presentQueue?.[0] || Object.keys(roomData.players || {})[0];
  const presenter = roomData.players?.[currentPresenterId] || {};
  const presenterName = presenter.name || t('lobby.unknown');
  const presenterAvatar = presenter.avatarConfig || null;

  const isMe = currentPresenterId === playerId;
  const isHost = roomData.host === playerId;

  const queue = useMemo(() => {
    return roomData.presentQueue || Object.keys(roomData.players || {});
  }, [roomData.presentQueue, roomData.players]);

  const currentIndex = queue.indexOf(currentPresenterId);
  const isLastPresenter = currentIndex >= queue.length - 1;

  const trackData = roomData.tracks?.[currentPresenterId];
  const tracksList = trackData?.tracks || [];
  const trackDuration = useMemo(() => {
    return audioEngine.getTrackDuration(tracksList);
  }, [tracksList]);

  const isPlaying = Boolean(roomData.presentationPlaying);
  const playStartTime = roomData.presentationPlayStartTime || 0;

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteValue, setVoteValue] = useState(0);

  // Sync Tone audio playback whenever isPlaying or currentPresenterId changes
  useEffect(() => {
    if (isPlaying && tracksList.length > 0) {
      audioEngine.syncTracks(tracksList, false);
      audioEngine.start().catch(console.error);
    } else {
      audioEngine.stop();
    }

    return () => {
      audioEngine.stop();
    };
  }, [isPlaying, currentPresenterId, tracksList]);

  // Local progress ticker synced with playStartTime
  useEffect(() => {
    if (!isPlaying || !playStartTime) {
      if (!isPlaying) setElapsedSeconds(0);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.min(trackDuration, Math.floor((Date.now() - playStartTime) / 1000));
      setElapsedSeconds(elapsed);

      // Auto stop playback when reaching end of track
      if (elapsed >= trackDuration) {
        if (isHost) {
          update(ref(db, `rooms/${roomId}`), {
            presentationPlaying: false
          }).catch(console.error);
        }
      }
    }, 250);

    return () => clearInterval(interval);
  }, [isPlaying, playStartTime, trackDuration, isHost, roomId]);

  // Reset vote state when presenter changes
  useEffect(() => {
    const myVote = roomData.votes?.[currentPresenterId]?.[playerId];
    if (myVote) {
      setHasVoted(true);
      setVoteValue(myVote);
    } else {
      setHasVoted(false);
      setVoteValue(0);
    }
  }, [currentPresenterId, playerId, roomData.votes]);

  // Host playback controls
  const handleTogglePlay = () => {
    if (!isHost) return;
    const nextPlaying = !isPlaying;
    update(ref(db, `rooms/${roomId}`), {
      presentationPlaying: nextPlaying,
      presentationPlayStartTime: nextPlaying ? Date.now() : null
    }).catch(console.error);
  };

  const handleReplay = () => {
    if (!isHost) return;
    update(ref(db, `rooms/${roomId}`), {
      presentationPlaying: true,
      presentationPlayStartTime: Date.now()
    }).catch(console.error);
  };

  const handleNext = () => {
    if (!isHost) return;
    audioEngine.stop();

    if (!isLastPresenter) {
      const nextId = queue[currentIndex + 1];
      update(ref(db, `rooms/${roomId}`), {
        currentPresenter: nextId,
        presentationPlaying: false,
        presentationPlayStartTime: null,
        presentationStartTime: Date.now()
      }).catch(console.error);
    } else {
      update(ref(db, `rooms/${roomId}`), {
        status: 'round_results',
        presentationPlaying: false,
        presentationPlayStartTime: null
      }).catch(console.error);
    }
  };

  const submitVote = (stars) => {
    if (isMe) return;
    setVoteValue(stars);
    setHasVoted(true);
    set(ref(db, `rooms/${roomId}/votes/${currentPresenterId}/${playerId}`), stars).catch(console.error);
  };

  const progressPercent = Math.min(100, Math.max(0, (elapsedSeconds / trackDuration) * 100));

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-6 select-none bg-[#09090b]">
      
      {/* Top Bar: Stage Header & Performer Queue Indicator */}
      <div className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900/90 border-3 border-black p-3 sm:px-6 rounded-2xl shadow-[0_4px_0_0_#000] z-10">
        
        <div className="flex items-center gap-3">
          <span className="bg-pink-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider px-3 py-1 rounded-full border-2 border-black shadow-[0_2px_0_0_#000]">
            {roomData.currentStyle || 'Party Track'}
          </span>
          <span className="font-mono font-bold text-xs sm:text-sm text-yellow-300 bg-black/50 px-3 py-1 rounded-xl border border-black">
            {t('presentation.trackOf')} {currentIndex + 1} {t('presentation.of')} {queue.length}
          </span>
        </div>

        {/* Mini Performer Queue Avatars */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1">
          {queue.map((qId, idx) => {
            const pData = roomData.players?.[qId] || {};
            const isCurrent = qId === currentPresenterId;
            return (
              <div 
                key={qId} 
                className={`relative w-9 h-9 rounded-full border-2 border-black overflow-hidden flex items-center justify-center transition-transform ${
                  isCurrent 
                    ? 'ring-3 ring-pink-500 scale-110 shadow-[0_0_10px_rgba(236,72,153,0.8)]' 
                    : 'opacity-50'
                }`}
                title={pData.name}
              >
                <AvatarViewer config={pData.avatarConfig} className="w-full h-full" showBackground={false} />
              </div>
            );
          })}
        </div>

      </div>

      {/* Center Stage: Spotlight, Performer Avatar & Live Waveform */}
      <div className="flex-1 w-full max-w-3xl flex flex-col items-center justify-center py-6">
        
        {/* Spotlight Card */}
        <div className="relative w-full chunky-panel p-6 sm:p-8 flex flex-col items-center border-4 border-black shadow-[0_8px_0_0_#000] overflow-hidden bg-gradient-to-b from-zinc-900 to-zinc-950">
          
          {/* Animated Ambient Spotlight Glow */}
          <div className={`absolute -top-24 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-opacity duration-700 ${
            isPlaying ? 'bg-pink-500/30 opacity-100 animate-pulse' : 'bg-purple-500/10 opacity-40'
          }`} />

          <h2 className="text-xs sm:text-sm font-black uppercase tracking-widest text-pink-400 mb-1 flex items-center gap-2">
            <FaMusic size={12} /> {t('presentation.nowPresenting')}
          </h2>

          <div className="text-3xl sm:text-5xl font-black text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] mb-6 text-center truncate max-w-full px-2">
            {isMe ? t('presentation.yourTurn') : presenterName}
          </div>

          {/* Large Performer Avatar */}
          <div className={`relative w-44 h-44 sm:w-56 sm:h-56 rounded-3xl border-4 border-black shadow-[0_6px_0_0_#000] overflow-hidden mb-6 bg-zinc-800 flex items-center justify-center transition-transform duration-300 ${
            isPlaying ? 'scale-105 shadow-[0_0_25px_rgba(236,72,153,0.5)]' : ''
          }`}>
            <AvatarViewer config={presenterAvatar} className="w-full h-full" />

            {/* Pulsing Equalizer Bars Overlay on Performer */}
            {isPlaying && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end justify-center gap-1.5 h-14 p-2 pointer-events-none">
                <div className="w-1.5 bg-pink-500 rounded-full animate-[pulse_0.4s_ease-in-out_infinite] h-full"></div>
                <div className="w-1.5 bg-purple-500 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-3/4"></div>
                <div className="w-1.5 bg-yellow-400 rounded-full animate-[pulse_0.5s_ease-in-out_infinite] h-5/6"></div>
                <div className="w-1.5 bg-green-400 rounded-full animate-[pulse_0.7s_ease-in-out_infinite] h-2/3"></div>
                <div className="w-1.5 bg-pink-400 rounded-full animate-[pulse_0.3s_ease-in-out_infinite] h-full"></div>
              </div>
            )}
          </div>

          {/* Timeline & Progress Bar */}
          <div className="w-full max-w-md flex flex-col gap-2 mb-4">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-zinc-400">
              <span>00:{elapsedSeconds.toString().padStart(2, '0')}</span>
              <span className="text-yellow-400">{isPlaying ? t('presentation.nowPlaying') : t('presentation.waitingHostPlay')}</span>
              <span>00:{trackDuration.toString().padStart(2, '0')}</span>
            </div>
            
            <div className="w-full bg-black/60 rounded-full h-3.5 border-2 border-black overflow-hidden shadow-inner relative">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 transition-all duration-300 ease-linear rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Voting Stars for Listeners */}
          {!isMe ? (
            <div className="w-full max-w-md bg-black/40 border-2 border-black rounded-2xl p-4 flex flex-col items-center gap-2 mt-2">
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-gray-300">
                {t('presentation.rating')}
              </span>

              <div className="flex items-center gap-2 sm:gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => submitVote(star)}
                    className={`text-3xl sm:text-4xl transition-all transform active:scale-90 hover:scale-125 ${
                      (voteValue >= star) 
                        ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]' 
                        : 'text-zinc-600 hover:text-yellow-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>

              {hasVoted && (
                <div className="text-xs font-bold text-emerald-400 animate-pulse">
                  ✓ {t('presentation.voteRecorded')} ({voteValue}/5)
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm sm:text-base font-black text-yellow-400 animate-pulse mt-2 flex items-center gap-2">
              <span>🎵</span>
              <span>{t('presentation.othersListening')}</span>
            </div>
          )}

        </div>

      </div>

      {/* Bottom Controls Bar: Host chooses playback & next presenter */}
      <div className="w-full max-w-4xl bg-zinc-900 border-3 border-black p-4 rounded-2xl shadow-[0_4px_0_0_#000] flex flex-col sm:flex-row items-center justify-between gap-4 z-10">
        
        {isHost ? (
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* Play / Pause & Replay */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleTogglePlay}
                className={`btn-chunky flex-1 sm:flex-none px-6 py-3.5 text-base sm:text-lg font-black flex items-center justify-center gap-2 ${
                  isPlaying 
                    ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_4px_0_0_#000]' 
                    : 'btn-chunky-green animate-pulse'
                }`}
              >
                {isPlaying ? <FaPause size={16} /> : <FaPlay size={16} />}
                <span>{isPlaying ? t('presentation.pauseTrack') : t('presentation.playTrack')}</span>
              </button>

              <button
                onClick={handleReplay}
                title={t('presentation.replayTrack')}
                className="btn-chunky btn-chunky-purple p-3.5 sm:px-4 font-black text-base flex items-center justify-center"
              >
                <FaRedo size={16} />
              </button>
            </div>

            {/* Next Track or Finish Presentation */}
            <button
              onClick={handleNext}
              className={`btn-chunky w-full sm:w-auto px-6 py-3.5 text-base sm:text-lg font-black flex items-center justify-center gap-2 ${
                isLastPresenter ? 'btn-chunky-pink animate-bounce' : 'btn-chunky-purple'
              }`}
            >
              <span>{isLastPresenter ? t('presentation.finishPresentation') : t('presentation.nextTrack')}</span>
              {isLastPresenter ? <FaTrophy size={16} /> : <FaForward size={16} />}
            </button>

          </div>
        ) : (
          <div className="w-full text-center py-2">
            <div className="text-sm sm:text-base font-black text-gray-300">
              {isPlaying ? t('presentation.nowPlaying') : t('presentation.waitingHostPlay')}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              ({roomData?.players?.[roomData.host]?.name || t('lobby.host')})
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
