import { useLanguage, LANGUAGES } from '../../context/LanguageContext';

export default function LanguageSwitcher({ className = "" }) {
  const { lang, setLang } = useLanguage();

  return (
    <div className={`inline-flex items-center bg-gray-900/90 border-2 border-black rounded-2xl p-1 shadow-[2px_2px_0_0_#000] backdrop-blur-sm select-none ${className}`}>
      {LANGUAGES.map((l) => {
        const isActive = lang === l.code;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => setLang(l.code)}
            title={l.name}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black transition-all ${
              isActive
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_2px_0_0_#831843] scale-105 z-10'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <span className="text-sm leading-none">{l.flag}</span>
            <span>{l.label}</span>
          </button>
        );
      })}
    </div>
  );
}
