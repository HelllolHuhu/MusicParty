import ThemeSwitcher from './ThemeSwitcher';
import LanguageDropdown from './LanguageDropdown';
import { useLanguage } from '../../context/LanguageContext';

export default function Navbar({ onLogoClick, className = "" }) {
  const { t } = useLanguage();

  return (
    <header className={`w-full sticky top-0 z-40 bg-black/40 backdrop-blur-md border-b-2 border-black/60 shadow-[0_4px_10px_rgba(0,0,0,0.3)] select-none transition-colors ${className}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        
        {/* Left: Music Party Logo */}
        <div 
          onClick={onLogoClick}
          className={`flex items-center gap-1.5 sm:gap-2 px-1 py-1 rounded-2xl transition-transform ${onLogoClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}`}
        >
          <span className="text-xl sm:text-2xl md:text-3xl animate-bounce">🎵</span>
          <span className="text-lg sm:text-2xl md:text-3xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
            {t('navbar.logo')}
          </span>
        </div>

        {/* Right: Theme Switcher & Language Dropdown */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          <ThemeSwitcher />
          <LanguageDropdown />
        </div>

      </div>
    </header>
  );
}
