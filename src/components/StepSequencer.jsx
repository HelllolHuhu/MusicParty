import { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { db } from '../firebase';
import { ref, set } from 'firebase/database';
import { FaPlay, FaStop } from 'react-icons/fa';

const ROWS = 4;
const COLS = 16;
const INSTRUMENTS = ["Synth C4", "Synth E4", "Synth G4", "Synth C5"];
const NOTES = ["C4", "E4", "G4", "C5"]; // Simple major chord notes

export default function StepSequencer({ roomId, playerId, locked, savedSequence }) {
  // Initialize empty grid if no saved sequence
  const initialGrid = savedSequence || Array(ROWS).fill().map(() => Array(COLS).fill(false));
  const [grid, setGrid] = useState(initialGrid);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  const synthRef = useRef(null);
  const loopRef = useRef(null);

  // Sync grid to Firebase whenever it changes
  useEffect(() => {
    if (locked) return;
    set(ref(db, `rooms/${roomId}/tracks/${playerId}/sequence`), grid);
  }, [grid, locked, roomId, playerId]);

  useEffect(() => {
    // Setup Tone.js
    synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination();
    
    // Cleanup on unmount
    return () => {
      if (loopRef.current) loopRef.current.dispose();
      if (synthRef.current) synthRef.current.dispose();
      Tone.Transport.stop();
    };
  }, []);

  const toggleCell = (row, col) => {
    if (locked) return;
    const newGrid = [...grid];
    newGrid[row] = [...grid[row]];
    newGrid[row][col] = !newGrid[row][col];
    setGrid(newGrid);
  };

  const togglePlay = async () => {
    if (isPlaying) {
      Tone.Transport.stop();
      if (loopRef.current) loopRef.current.stop();
      setIsPlaying(false);
      setCurrentStep(0);
    } else {
      await Tone.start();
      Tone.Transport.bpm.value = 120;
      
      let step = 0;
      if (loopRef.current) loopRef.current.dispose();
      
      loopRef.current = new Tone.Loop((time) => {
        // Play active notes for the current step
        const notesToPlay = [];
        for (let r = 0; r < ROWS; r++) {
          if (grid[r][step]) {
            notesToPlay.push(NOTES[r]);
          }
        }
        if (notesToPlay.length > 0) {
          synthRef.current.triggerAttackRelease(notesToPlay, "16n", time);
        }
        
        // Schedule UI update slightly ahead to avoid React lag
        Tone.Draw.schedule(() => {
          setCurrentStep(step);
        }, time);
        
        step = (step + 1) % COLS;
      }, "16n").start(0);

      Tone.Transport.start();
      setIsPlaying(true);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Sequencer</h3>
        <button
          onClick={togglePlay}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-colors ${
            isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {isPlaying ? <FaStop /> : <FaPlay />}
          {isPlaying ? 'Stop' : 'Play'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-max">
          {grid.map((row, r) => (
            <div key={r} className="flex gap-1 mb-2 items-center">
              <div className="w-24 text-xs font-semibold text-gray-400 mr-2 text-right">
                {INSTRUMENTS[r]}
              </div>
              {row.map((cell, c) => (
                <div
                  key={c}
                  onClick={() => toggleCell(r, c)}
                  className={`w-10 h-10 rounded cursor-pointer transition-all ${
                    locked ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'
                  } ${
                    cell 
                      ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]' 
                      : 'bg-gray-700'
                  } ${
                    isPlaying && currentStep === c ? 'border-2 border-white' : 'border border-gray-600'
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {locked && <div className="mt-4 text-center text-red-400 font-bold">Úpravy uzamknuté</div>}
    </div>
  );
}
