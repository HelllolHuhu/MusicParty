import { useState, useEffect } from 'react';
import { FaDice, FaChevronLeft, FaChevronRight, FaPalette } from 'react-icons/fa';
import AvatarViewer from './AvatarViewer';
import { useLanguage } from '../../context/LanguageContext';
import { 
  COLOR_PALETTES, 
  PART_OPTIONS, 
  DEFAULT_AVATAR_CONFIG, 
  RANDOM_NAMES_BY_LANG 
} from './avatarData';

export default function CharacterCreator({ onChange, initialConfig, initialName }) {
  const { t, lang } = useLanguage();
  const [name, setName] = useState(initialName || '');
  const [config, setConfig] = useState(initialConfig || DEFAULT_AVATAR_CONFIG);
  const [activeTab, setActiveTab] = useState('head');

  // Push state upwards to parent
  useEffect(() => {
    onChange(name, config);
  }, [name, config, onChange]);

  const updatePart = (partKey, delta) => {
    const options = PART_OPTIONS[partKey];
    const currentIndex = options.findIndex(opt => opt.id === config[partKey]);
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = (safeIndex + delta + options.length) % options.length;
    
    setConfig(prev => ({
      ...prev,
      [partKey]: options[nextIndex].id
    }));
  };

  const updateColor = (colorKey, colorHex) => {
    setConfig(prev => ({
      ...prev,
      [colorKey]: colorHex
    }));
  };

  const randomizeAll = () => {
    const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
    
    const randomHead = randomItem(PART_OPTIONS.head).id;
    const randomHeadColor = randomItem(COLOR_PALETTES.head);
    
    const randomHair = randomItem(PART_OPTIONS.hair).id;
    const randomHairColor = randomItem(COLOR_PALETTES.hair);
    
    const randomEyes = randomItem(PART_OPTIONS.eyes).id;
    const randomEyesColor = randomItem(COLOR_PALETTES.eyes);
    
    const randomBeard = randomItem(PART_OPTIONS.beard).id;
    const randomBeardColor = randomHairColor;
    
    const randomAccessory = randomItem(PART_OPTIONS.accessory).id;

    setConfig({
      head: randomHead,
      headColor: randomHeadColor,
      hair: randomHair,
      hairColor: randomHairColor,
      eyes: randomEyes,
      eyesColor: randomEyesColor,
      beard: randomBeard,
      beardColor: randomBeardColor,
      accessory: randomAccessory
    });

    const names = RANDOM_NAMES_BY_LANG[lang] || RANDOM_NAMES_BY_LANG.en;
    setName(names[Math.floor(Math.random() * names.length)]);
  };

  // Enable mouse wheel horizontal scrolling on PC
  const handleSliderWheel = (e) => {
    if (e.deltaY !== 0) {
      e.currentTarget.scrollLeft += e.deltaY;
    }
  };

  // Enable mouse drag scrolling on PC
  const handleSliderMouseDown = (e) => {
    if (e.button !== 0) return;
    const slider = e.currentTarget;
    const startX = e.pageX - slider.offsetLeft;
    const startScrollLeft = slider.scrollLeft;

    const onMouseMove = (ev) => {
      const x = ev.pageX - slider.offsetLeft;
      const walk = (x - startX);
      if (Math.abs(walk) > 3) {
        slider.scrollLeft = startScrollLeft - walk;
      }
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const tabs = [
    { key: 'head', labelKey: 'creator.tab.head', hasColor: true, colorKey: 'headColor' },
    { key: 'hair', labelKey: 'creator.tab.hair', hasColor: true, colorKey: 'hairColor' },
    { key: 'eyes', labelKey: 'creator.tab.eyes', hasColor: true, colorKey: 'eyesColor' },
    { key: 'beard', labelKey: 'creator.tab.beard', hasColor: true, colorKey: 'beardColor' },
    { key: 'accessory', labelKey: 'creator.tab.accessory', hasColor: false }
  ];

  const currentOptions = PART_OPTIONS[activeTab] || [];
  const currentSelectedOption = currentOptions.find(opt => opt.id === config[activeTab]) || currentOptions[0];
  const activeTabConfig = tabs.find(t => t.key === activeTab);

  return (
    <div className="chunky-panel p-4 sm:p-6 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-stretch">
      {/* Left Column: Avatar Preview & Compact Name Input + Randomize Button below */}
      <div className="md:w-60 lg:w-64 flex flex-col items-center justify-center shrink-0">
        <AvatarViewer 
          config={config} 
          className="w-44 h-44 sm:w-48 sm:h-48 rounded-3xl mb-3.5 sm:mb-4 shadow-[0_6px_0_0_#000] border-4 border-black" 
        />
        
        <div className="w-full max-w-[210px] sm:max-w-[230px] flex flex-col items-center gap-2.5">
          <input
            type="text"
            placeholder={t('creator.enterName')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-black/40 border-3 border-black rounded-2xl py-2 px-3 font-bold text-sm sm:text-base text-center text-white placeholder-gray-300 focus:outline-none focus:border-purple-400 shadow-inner"
            maxLength={15}
          />
          <button 
            type="button"
            onClick={randomizeAll}
            className="btn-chunky btn-chunky-purple w-full flex items-center justify-center gap-2 py-2 px-3 rounded-2xl text-xs sm:text-sm font-black tracking-wide"
            title={t('creator.randomTooltip')}
          >
            <FaDice size={18} />
            <span>{t('creator.randomize')}</span>
          </button>
        </div>
      </div>

      {/* Right Column: Interactive Parts & Color Controls */}
      <div className="flex-1 w-full min-w-0 flex flex-col justify-between overflow-hidden">
        <div>
          {/* Category Tabs (Single-line Horizontal Slider) */}
          <div 
            className="horizontal-slider gap-1.5 mb-4 bg-black/30 p-1.5 rounded-2xl border-2 border-black"
            onWheel={handleSliderWheel}
            onMouseDown={handleSliderMouseDown}
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-shrink-0 py-2 px-3.5 sm:px-4 rounded-xl font-black text-xs sm:text-sm transition-all text-center whitespace-nowrap cursor-pointer ${
                    isActive 
                      ? 'bg-purple-600 text-white shadow-[0_3px_0_0_#000] scale-[1.02]' 
                      : 'text-white/80 hover:text-white hover:bg-black/20'
                  }`}
                >
                  {t(tab.labelKey)}
                </button>
              );
            })}
          </div>

          {/* Part Type Selector Carousel & Style Chips (Single-line Horizontal Slider) */}
          <div className="bg-black/25 border-2 border-black rounded-2xl p-3.5 sm:p-4 mb-3.5 shadow-inner">
            <div className="text-xs font-black uppercase tracking-wider text-purple-200 mb-2">
              {t('creator.style')}
            </div>
            
            <div className="flex items-center justify-between gap-3 sm:gap-4 mb-1">
              <button 
                type="button"
                onClick={() => updatePart(activeTab, -1)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-black/40 hover:bg-purple-600 hover:scale-110 flex items-center justify-center text-white font-bold transition-all border border-black shadow-[0_2px_0_0_#000] shrink-0"
              >
                <FaChevronLeft size={14} />
              </button>
              
              <div className="flex-1 text-center font-black text-base sm:text-lg text-yellow-300 truncate px-2">
                {currentSelectedOption?.labelKey ? t(currentSelectedOption.labelKey) : currentSelectedOption?.id}
              </div>

              <button 
                type="button"
                onClick={() => updatePart(activeTab, 1)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-black/40 hover:bg-purple-600 hover:scale-110 flex items-center justify-center text-white font-bold transition-all border border-black shadow-[0_2px_0_0_#000] shrink-0"
              >
                <FaChevronRight size={14} />
              </button>
            </div>

            {/* Quick Chips Selection (Single-line Horizontal Slider) */}
            <div 
              className="horizontal-slider gap-2 mt-3 pt-3 border-t border-black/30 pb-1"
              onWheel={handleSliderWheel}
              onMouseDown={handleSliderMouseDown}
            >
              {currentOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setConfig(prev => ({ ...prev, [activeTab]: opt.id }))}
                  className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer ${
                    config[activeTab] === opt.id
                      ? 'bg-yellow-400 text-black shadow-[0_2px_0_0_#000]'
                      : 'bg-black/40 text-white/90 hover:bg-black/60'
                  }`}
                >
                  {t(opt.labelKey)}
                </button>
              ))}
            </div>
          </div>

          {/* Color Palette Picker (Single-line Horizontal Slider) */}
          {activeTabConfig?.hasColor && (
            <div className="bg-black/25 border-2 border-black rounded-2xl p-3.5 sm:p-4 shadow-inner">
              <div className="flex justify-between items-center mb-2.5">
                <div className="text-xs font-black uppercase tracking-wider text-purple-200 flex items-center gap-1.5">
                  <FaPalette /> {t('creator.color')} ({t(activeTabConfig.labelKey)})
                </div>
                
                {/* Custom Color Input */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/90 font-mono font-bold">
                    {config[activeTabConfig.colorKey]}
                  </span>
                  <input
                    type="color"
                    value={config[activeTabConfig.colorKey] || '#ffffff'}
                    onChange={(e) => updateColor(activeTabConfig.colorKey, e.target.value)}
                    className="w-7 h-7 rounded-lg border-2 border-black cursor-pointer bg-transparent"
                    title={t('creator.customColor')}
                  />
                </div>
              </div>

              {/* Color Swatches (Single-line Horizontal Slider) */}
              <div 
                className="horizontal-slider gap-2.5 py-1 px-1"
                onWheel={handleSliderWheel}
                onMouseDown={handleSliderMouseDown}
              >
                {(COLOR_PALETTES[activeTab] || []).map((colorHex) => {
                  const isSelected = config[activeTabConfig.colorKey]?.toLowerCase() === colorHex.toLowerCase();
                  return (
                    <button
                      key={colorHex}
                      type="button"
                      onClick={() => updateColor(activeTabConfig.colorKey, colorHex)}
                      style={{ backgroundColor: colorHex }}
                      className={`flex-shrink-0 w-8 h-8 rounded-full border-2 transition-transform cursor-pointer ${
                        isSelected 
                          ? 'border-white scale-125 shadow-[0_0_8px_rgba(255,255,255,0.9)] z-10' 
                          : 'border-black hover:scale-110 opacity-90 hover:opacity-100'
                      }`}
                      title={colorHex}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
