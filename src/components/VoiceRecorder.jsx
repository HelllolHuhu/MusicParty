import { useState, useRef, useEffect } from 'react';
import { db } from '../firebase';
import { ref, set } from 'firebase/database';
import { FaMicrophone, FaStop, FaPlay, FaTrash } from 'react-icons/fa';

export default function VoiceRecorder({ roomId, playerId, locked, savedVoice }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(savedVoice || null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    if (locked) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result;
          setAudioUrl(base64data);
          // Save to Firebase
          set(ref(db, `rooms/${roomId}/tracks/${playerId}/voiceBase64`), base64data);
        };
        // Stop all tracks to release mic
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Auto stop after 10 seconds to prevent huge blobs
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopRecording();
        }
      }, 10000);

    } catch (err) {
      console.error("Mic access denied", err);
      alert("Nepodarilo sa získať prístup k mikrofónu.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const deleteRecording = () => {
    if (locked) return;
    setAudioUrl(null);
    set(ref(db, `rooms/${roomId}/tracks/${playerId}/voiceBase64`), null);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg flex flex-col h-full">
      <h3 className="text-xl font-bold mb-6">Nahrávanie Hlasu</h3>
      
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        {!audioUrl ? (
          <>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={locked}
              className={`w-32 h-32 rounded-full flex flex-col items-center justify-center gap-2 transition-all ${
                locked ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 
                isRecording ? 'bg-red-500 animate-pulse scale-110 shadow-[0_0_20px_rgba(239,68,68,0.6)]' : 'bg-red-600 hover:bg-red-500'
              }`}
            >
              {isRecording ? <FaStop size={32} /> : <FaMicrophone size={32} />}
              <span className="font-bold text-sm">{isRecording ? 'Stop' : 'Rec (max 10s)'}</span>
            </button>
            {isRecording && <div className="text-red-400 font-bold animate-bounce">Nahrávam...</div>}
          </>
        ) : (
          <div className="w-full flex flex-col items-center gap-4">
            <audio controls src={audioUrl} className="w-full" />
            {!locked && (
              <button 
                onClick={deleteRecording}
                className="flex items-center gap-2 text-red-400 hover:text-red-300 px-4 py-2 bg-red-900/30 rounded"
              >
                <FaTrash /> Zmazať a nahrať znova
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
