import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { ref, update, set } from 'firebase/database';
import * as Tone from 'tone';

const ROWS = 4;
const COLS = 16;
const NOTES = ["C4", "E4", "G4", "C5"];

export default function PresentationPhase({ roomId, roomData, playerId }) {
  const [timeLeft, setTimeLeft] = useState(20);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteValue, setVoteValue] = useState(0);
  
  const currentPresenterId = roomData.currentPresenter;
  const currentPresenterName = roomData.players[currentPresenterId]?.name;
  const isMe = currentPresenterId === playerId;
  const isHost = roomData.host === playerId;

  const trackData = roomData.tracks?.[currentPresenterId];
  
  const synthRef = useRef(null);
  const loopRef = useRef(null);
  const audioRef = useRef(null);

  // Timer logic
  useEffect(() => {
    const PRES_DURATION = 20;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - roomData.presentationStartTime) / 1000);
      const remaining = PRES_DURATION - elapsed;
      
      if (remaining <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
        if (isHost) {
          nextPresenter();
        }
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [roomData.presentationStartTime, isHost, currentPresenterId]);

  // Audio Playback logic
  useEffect(() => {
    const playPresentation = async () => {
      await Tone.start();
      
      if (!synthRef.current) {
        synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination();
      }
      
      Tone.Transport.stop();
      if (loopRef.current) loopRef.current.dispose();
      
      const grid = trackData?.sequence;
      if (grid) {
        Tone.Transport.bpm.value = 120;
        let step = 0;
        loopRef.current = new Tone.Loop((time) => {
          const notesToPlay = [];
          for (let r = 0; r < ROWS; r++) {
            if (grid[r][step]) {
              notesToPlay.push(NOTES[r]);
            }
          }
          if (notesToPlay.length > 0) {
            synthRef.current.triggerAttackRelease(notesToPlay, "16n", time);
          }
          step = (step + 1) % COLS;
        }, "16n").start(0);
        Tone.Transport.start();
      }

      if (trackData?.voiceBase64 && audioRef.current) {
        audioRef.current.src = trackData.voiceBase64;
        audioRef.current.play().catch(e => console.log("Autoplay prevented:", e));
      }
    };

    playPresentation();

    return () => {
      Tone.Transport.stop();
      if (loopRef.current) loopRef.current.dispose();
      if (audioRef.current) audioRef.current.pause();
    };
  }, [currentPresenterId, trackData]);

  // Reset vote when presenter changes
  useEffect(() => {
    setHasVoted(false);
    setVoteValue(0);
  }, [currentPresenterId]);

  const nextPresenter = () => {
    const queue = roomData.presentQueue || [];
    const currentIndex = queue.indexOf(currentPresenterId);
    
    if (currentIndex + 1 < queue.length) {
      update(ref(db, `rooms/${roomId}`), {
        currentPresenter: queue[currentIndex + 1],
        presentationStartTime: Date.now()
      });
    } else {
      update(ref(db, `rooms/${roomId}`), {
        status: 'round_results'
      });
    }
  };

  const submitVote = (stars) => {
    setVoteValue(stars);
    setHasVoted(true);
    set(ref(db, `rooms/${roomId}/votes/${currentPresenterId}/${playerId}`), stars);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-2xl text-center">
        
        <div className="mb-8">
          <h2 className="text-gray-400 uppercase tracking-widest mb-2">Teraz prezentuje</h2>
          <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
            {isMe ? "TVOJ RAD!" : currentPresenterName}
          </div>
          <div className="text-sm text-gray-500 mt-2">Štýl: {roomData.currentStyle}</div>
        </div>

        <div className="text-6xl font-mono mb-8 font-bold text-white">
          00:{timeLeft.toString().padStart(2, '0')}
        </div>

        {/* Hidden audio element for voice playback */}
        <audio ref={audioRef} />

        {!isMe ? (
          <div className="bg-gray-700 p-6 rounded-xl mt-8">
            <h3 className="text-xl font-bold mb-4">Hodnotenie</h3>
            {hasVoted ? (
              <div className="text-green-400 text-lg font-bold">Hlas zaznamenaný! ({voteValue} / 5)</div>
            ) : (
              <div className="flex justify-center gap-4">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => submitVote(star)}
                    className="text-4xl text-gray-400 hover:text-yellow-400 hover:scale-125 transition-transform focus:outline-none"
                  >
                    ★
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-xl text-yellow-400 animate-pulse mt-8">
            Ostatní práve počúvajú tvoj výtvor!
          </div>
        )}

      </div>
    </div>
  );
}
