import { useState, useEffect, useRef } from 'react';
import { FaPlay, FaStop, FaMicrophone, FaTrash, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { useLanguage } from '../../../context/LanguageContext';

const SAMPLES = [
  { id: 's1', name: 'Trap Kick', category: 'Drums', color: 'bg-red-500' },
  { id: 's2', name: 'Hi-Hat Roll', category: 'Drums', color: 'bg-orange-500' },
  { id: 's3', name: '808 Bass', category: 'Bass', color: 'bg-blue-500' },
  { id: 's4', name: 'Synth Chords', category: 'Melody', color: 'bg-purple-500' },
  { id: 's5', name: 'Vinyl Scratch', category: 'FX', color: 'bg-yellow-500' },
];

export default function MusicWorkspace({ roomId, playerId, timeRemaining, onFinish }) {
  const { t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [tracks, setTracks] = useState(() => {
    const saved = localStorage.getItem(`track_${roomId}_${playerId}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 't1', name: 'Beat', type: 'audio', volume: 0, muted: false, clips: [] },
      { id: 't2', name: 'Bass', type: 'audio', volume: 0, muted: false, clips: [] },
      { id: 't3', name: 'Melody', type: 'audio', volume: 0, muted: false, clips: [] },
      { id: 't4', name: 'Vocals 1', type: 'vocal', volume: 0, muted: false, clips: [] },
    ];
  });
  
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem(`track_${roomId}_${playerId}`, JSON.stringify(tracks));
    import('./AudioEngine').then(({ audioEngine }) => {
      audioEngine.syncTracks(tracks);
    });
  }, [tracks, roomId, playerId]);

  useEffect(() => {
    import('./AudioEngine').then(({ audioEngine }) => {
      if (isPlaying) {
        audioEngine.start();
      } else {
        audioEngine.stop();
      }
    });
  }, [isPlaying]);

  const handleDrop = (trackId, e) => {
    e.preventDefault();
    const sampleData = e.dataTransfer.getData('sample');
    if (!sampleData) return;
    
    const sample = JSON.parse(sampleData);
    
    const trackRect = e.currentTarget.getBoundingClientRect();
    const xPos = e.clientX - trackRect.left;
    const ratio = xPos / trackRect.width;
    const dropTime = ratio * 180; // 3 minutes = 180 seconds
    
    setTracks(prev => prev.map(t => {
      if (t.id === trackId) {
        return {
          ...t,
          clips: [...t.clips, { 
            id: `clip_${Date.now()}`, 
            sampleId: sample.id, 
            name: sample.name,
            color: sample.color,
            startAt: dropTime, 
            duration: 10
          }]
        };
      }
      return t;
    }));
  };

  const removeClip = (trackId, clipId) => {
    setTracks(prev => prev.map(t => {
      if (t.id === trackId) {
        return { ...t, clips: t.clips.filter(c => c.id !== clipId) };
      }
      return t;
    }));
  };

  const toggleMute = (trackId) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, muted: !t.muted } : t));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        
        setTracks(prev => {
          const newTracks = [...prev];
          const vTrack = newTracks.find(t => t.type === 'vocal');
          if (vTrack) {
            vTrack.clips.push({
              id: `vocal_${Date.now()}`,
              name: t('game.vocalTake'),
              color: 'bg-green-500',
              startAt: 0,
              duration: 15,
              url: url
            });
          }
          return newTracks;
        });
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access denied", err);
      alert(t('game.allowMic'));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex h-full bg-zinc-950 text-white rounded-xl overflow-hidden border-2 border-zinc-800">
      
      {/* Sample Browser (Left Sidebar) */}
      <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="p-4 border-b border-zinc-800 font-bold text-pink-500 uppercase tracking-widest text-sm">
          {t('game.soundLibrary')}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {SAMPLES.map(s => (
            <div 
              key={s.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('sample', JSON.stringify(s));
              }}
              className={`p-3 rounded-lg cursor-grab active:cursor-grabbing border-2 border-black shadow-[2px_2px_0_0_#000] hover:translate-y-[-2px] hover:shadow-[2px_4px_0_0_#000] transition-all ${s.color}`}
            >
              <div className="font-bold text-black drop-shadow-sm">{s.name}</div>
              <div className="text-xs text-black/60 font-bold uppercase">{s.category}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col">
        
        {/* Toolbar */}
        <div className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6">
          <div className="flex gap-4">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${isPlaying ? 'bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)]' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
            >
              {isPlaying ? <FaStop /> : <FaPlay className="ml-1" />}
            </button>
            
            <button 
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-zinc-800 text-red-500 hover:bg-zinc-700'}`}
            >
              <FaMicrophone />
            </button>
          </div>
          
          <div className="font-mono text-xl font-black text-pink-500 bg-black/50 px-4 py-2 rounded-lg border border-zinc-800 shadow-inner">
            {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
          </div>
          
          <button onClick={() => onFinish(tracks)} className="btn-chunky btn-chunky-green">
            {t('game.finishTrack')}
          </button>
        </div>

        {/* Timeline Headers */}
        <div className="h-8 bg-zinc-900/50 flex ml-48 border-b border-zinc-800 relative">
           {[0, 30, 60, 90, 120, 150, 180].map(sec => (
             <div key={sec} className="absolute text-xs text-zinc-500 font-mono" style={{ left: `${(sec/180)*100}%`, transform: 'translateX(-50%)' }}>
               {Math.floor(sec/60)}:{(sec%60).toString().padStart(2,'0')}
             </div>
           ))}
        </div>

        {/* Tracks Playlist */}
        <div className="flex-1 overflow-y-auto bg-zinc-950 p-2 space-y-2">
          {tracks.map(track => (
            <div key={track.id} className="flex h-24 bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden relative">
              
              {/* Track Controls (Left) */}
              <div className="w-48 bg-zinc-900 border-r border-zinc-800 p-2 flex flex-col justify-between shrink-0 z-10 shadow-[2px_0_10px_rgba(0,0,0,0.5)]">
                <div className="font-bold text-sm text-zinc-300">{track.name}</div>
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => toggleMute(track.id)}
                    className={`p-1.5 rounded ${track.muted ? 'bg-red-500/20 text-red-500' : 'bg-zinc-800 text-zinc-400'}`}
                  >
                    {track.muted ? <FaVolumeMute /> : <FaVolumeUp />}
                  </button>
                  <input type="range" className="w-24 accent-pink-500 h-1 bg-zinc-800 rounded-lg appearance-none" />
                </div>
              </div>

              {/* Track Timeline area */}
              <div 
                className="flex-1 relative bg-black/20"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(track.id, e)}
              >
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(90deg,_#ffffff_1px,_transparent_1px)] bg-[length:16.66%_100%] pointer-events-none"></div>

                {track.clips.map(clip => (
                  <div 
                    key={clip.id}
                    className={`absolute top-2 bottom-2 rounded-md border border-black/50 shadow-md flex flex-col p-1 group ${clip.color}`}
                    style={{
                      left: `${(clip.startAt / 180) * 100}%`,
                      width: `${(clip.duration / 180) * 100}%`,
                      minWidth: '40px'
                    }}
                  >
                    <div className="text-[10px] font-bold text-black uppercase truncate leading-tight">{clip.name}</div>
                    <button 
                      onClick={() => removeClip(track.id, clip.id)}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded p-1 hover:scale-110 transition-all text-[8px]"
                    >
                      <FaTrash />
                    </button>
                    {/* Fake waveform */}
                    <div className="mt-auto h-3 w-full opacity-30 flex items-end gap-px">
                      {Array.from({length: 10}).map((_, i) => (
                        <div key={i} className="flex-1 bg-black rounded-t-sm" style={{height: `${Math.random() * 100}%`}}></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
