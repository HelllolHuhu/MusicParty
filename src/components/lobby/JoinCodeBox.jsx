import { useState } from 'react';
import { FaEye, FaEyeSlash, FaCopy, FaCheck } from 'react-icons/fa';

export default function JoinCodeBox({ roomId }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const inviteLink = `${window.location.origin}/?join=${roomId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="chunky-panel p-6 text-center">
      <h3 className="text-gray-400 font-bold mb-2 uppercase tracking-widest text-sm">Pozvi Kamošov</h3>
      
      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="bg-gray-900 border-2 border-gray-700 rounded-xl px-6 py-3 font-mono text-4xl font-black tracking-[0.2em] relative group cursor-pointer"
             onClick={() => setRevealed(!revealed)}
        >
          {revealed ? roomId : '••••••'}
          <div className="absolute inset-y-0 right-3 flex items-center text-gray-500 opacity-50 group-hover:opacity-100 transition-opacity">
            {revealed ? <FaEyeSlash /> : <FaEye />}
          </div>
        </div>
      </div>

      <button 
        onClick={handleCopy}
        className={`w-full font-bold py-3 px-4 rounded-xl border-2 shadow-[0_4px_0_0] active:translate-y-1 active:shadow-[0_0px_0_0] transition-all flex items-center justify-center gap-2 ${
          copied 
            ? 'bg-green-500 border-green-800 shadow-green-900 text-white' 
            : 'bg-gray-700 hover:bg-gray-600 border-gray-900 shadow-gray-900 text-gray-300'
        }`}
      >
        {copied ? <FaCheck /> : <FaCopy />}
        {copied ? 'Skopírované!' : 'Kopírovať invite link'}
      </button>
    </div>
  );
}
