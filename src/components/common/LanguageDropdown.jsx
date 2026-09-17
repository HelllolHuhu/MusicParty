import { useState, useRef, useEffect } from 'react';
import { useLanguage, LANGUAGES } from '../../context/LanguageContext';
import { FaChevronDown, FaGlobe, FaCheck } from 'react-icons/fa';

export default function LanguageDropdown({ className = "" }) {
  const { lang, setLang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return (
    <div className={`relative inline-block text-left select-none ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-900/90 hover:bg-gray-800 text-white font-bold text-xs md:text-sm rounded-2xl border-2 border-black shadow-[2px_2px_0_0_#000] active:translate-y-0.5 transition-all"
        title={t('lang.label')}
      >
        <span className="text-base">{currentLang.flag}</span>
        <span className="font-black tracking-wider uppercase">{currentLang.label}</span>
        <FaChevronDown size={10} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 sm:w-48 rounded-2xl bg-gray-900 border-3 border-black shadow-[6px_6px_0_0_#000] p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="text-[10px] font-black uppercase tracking-wider text-gray-400 px-3 py-1.5 flex items-center gap-1.5 border-b border-gray-800 mb-1">
            <FaGlobe size={11} className="text-cyan-400" /> {t('lang.label')}
          </div>

          <div className="space-y-1">
            {LANGUAGES.map((l) => {
              const isSelected = lang === l.code;
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => {
                    setLang(l.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_2px_0_0_#000]'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{l.flag}</span>
                    <div className="flex flex-col text-left">
                      <span className="font-bold leading-none">{l.name}</span>
                      <span className="text-[10px] text-gray-400 uppercase leading-tight font-mono">{l.label}</span>
                    </div>
                  </div>

                  {isSelected && <FaCheck size={12} className="text-yellow-300" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
