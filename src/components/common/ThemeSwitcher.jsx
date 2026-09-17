import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { FaChevronDown, FaPalette, FaCheck } from 'react-icons/fa';

export default function ThemeSwitcher({ className = "" }) {
  const { theme, setTheme, themes } = useTheme();
  const { t } = useLanguage();
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

  const currentTheme = themes[theme] || themes.mantis;

  const themeList = [
    { id: 'mantis', labelKey: 'theme.mantis' },
    { id: 'asphalt', labelKey: 'theme.asphalt' },
    { id: 'rose', labelKey: 'theme.rose' },
  ];

  return (
    <div className={`relative inline-block text-left select-none ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 bg-gray-900/90 hover:bg-gray-800 text-white font-bold text-xs sm:text-sm rounded-2xl border-2 border-black shadow-[2px_2px_0_0_#000] active:translate-y-0.5 transition-all"
        title={t('theme.label')}
      >
        <span className="text-sm sm:text-base">{currentTheme.icon}</span>
        <span className="hidden sm:inline font-black tracking-wide">{t(`theme.${theme}`)}</span>
        <div className="flex gap-1 items-center">
          <span 
            className="w-2.5 h-2.5 rounded-full border border-black" 
            style={{ backgroundColor: currentTheme.panel }}
          />
        </div>
        <FaChevronDown size={10} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu (aligned right since it sits on the right side) */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 sm:w-56 rounded-2xl bg-gray-900 border-3 border-black shadow-[6px_6px_0_0_#000] p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="text-[10px] font-black uppercase tracking-wider text-gray-400 px-3 py-1.5 flex items-center gap-1.5 border-b border-gray-800 mb-1">
            <FaPalette size={11} className="text-pink-400" /> {t('theme.label')}
          </div>

          <div className="space-y-1">
            {themeList.map(({ id, labelKey }) => {
              const th = themes[id];
              const isSelected = theme === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setTheme(id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_2px_0_0_#000]'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{th.icon}</span>
                    <span>{t(labelKey)}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Color Preview Dots */}
                    <div className="flex items-center -space-x-1">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black shadow-sm"
                        style={{ backgroundColor: th.bg }}
                        title={`Background: ${th.bg}`}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black shadow-sm"
                        style={{ backgroundColor: th.panel }}
                        title={`Panels: ${th.panel}`}
                      />
                    </div>
                    {isSelected && <FaCheck size={12} className="text-yellow-300 ml-1" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
