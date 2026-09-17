import { useState } from 'react';
import { FaEye, FaEyeSlash, FaCopy, FaCheck } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';

export default function JoinCodeBox({ roomId }) {
  const { t } = useLanguage();
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const inviteLink = `${window.location.origin}/?join=${roomId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="chunky-panel p-5 sm:p-6 text-center">
      <h3 className="font-black mb-2 uppercase tracking-widest text-xs sm:text-sm opacity-80">
        {t('joinCode.inviteFriends')}
      </h3>
      
      <div className="flex items-center justify-center gap-4 mb-4">
        <div 
          className="bg-black/40 border-3 border-black text-white rounded-2xl px-5 sm:px-6 py-2.5 sm:py-3 font-mono text-3xl sm:text-4xl font-black tracking-[0.2em] relative group cursor-pointer shadow-inner"
          onClick={() => setRevealed(!revealed)}
        >
          {revealed ? roomId : '••••••'}
          <div className="absolute inset-y-0 right-3 flex items-center text-gray-400 opacity-60 group-hover:opacity-100 transition-opacity">
            {revealed ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
          </div>
        </div>
      </div>

      <button 
        onClick={handleCopy}
        className={`w-full font-black py-3 px-4 rounded-2xl border-2 border-black shadow-[0_4px_0_0_#000] active:translate-y-1 active:shadow-[0_0px_0_0] transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
          copied 
            ? 'bg-emerald-500 text-white' 
            : 'bg-black/40 hover:bg-black/60 text-white'
        }`}
      >
        {copied ? <FaCheck /> : <FaCopy />}
        {copied ? t('joinCode.copied') : t('joinCode.copyInviteLink')}
      </button>
    </div>
  );
}
