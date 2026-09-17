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
  const [activeTab, setActiveTab] = useState('head'); // 'head' | 'hair' | 'eyes' | 'beard' | 'accessory'

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
    <div className="chunky-panel p-6 flex flex-col md:flex-row gap-8 items-stretch">
      {/* Left Column: Avatar Preview & Name */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <AvatarViewer 
          config={config} 
          className="w-52 h-52 rounded-3xl mb-6 shadow-[0_8px_0_0_#000]" 
        />
        
        <div className="w-full flex gap-2">
          <input
            type="text"
            placeholder={t('creator.enterName')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 bg-gray-800 border-3 border-gray-900 rounded-2xl p-3 px-4 font-bold text-lg text-white focus:outline-none focus:border-purple-500 shadow-inner"
            maxLength={15}
          />
          <button 
            type="button"
            onClick={randomizeAll}
            className="btn-chunky btn-chunky-purple flex items-center justify-center w-14 rounded-2xl"
            title={t('creator.randomTooltip')}
          >
            <FaDice size={24} />
          </button>
        </div>
      </div>

      {/* Right Column: Interactive Parts & Color Controls */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 mb-5 bg-gray-900/70 p-1.5 rounded-2xl border-2 border-black">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-2 px-3 rounded-xl font-black text-sm transition-all text-center whitespace-nowrap ${
                    isActive 
                      ? 'bg-purple-600 text-white shadow-[0_3px_0_0_#4c1d95] scale-[1.02]' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {t(tab.labelKey)}
                </button>
              );
            })}
          </div>

          {/* Part Type Selector Carousel */}
          <div className="bg-gray-800 border-2 border-black rounded-2xl p-4 mb-4 shadow-inner">
            <div className="text-xs font-black uppercase tracking-wider text-purple-300 mb-2">
              {t('creator.style')}
            </div>
            <div className="flex items-center justify-between gap-4">
              <button 
                type="button"
                onClick={() => updatePart(activeTab, -1)}
                className="w-10 h-10 rounded-xl bg-gray-700 hover:bg-purple-600 hover:scale-110 flex items-center justify-center text-white font-bold transition-all border border-black shadow-[0_2px_0_0_#000]"
              >
                <FaChevronLeft size={16} />
              </button>
              
              <div className="flex-1 text-center font-black text-lg text-yellow-400 truncate">
                {currentSelectedOption?.labelKey ? t(currentSelectedOption.labelKey) : currentSelectedOption?.id}
              </div>

              <button 
                type="button"
                onClick={() => updatePart(activeTab, 1)}
                className="w-10 h-10 rounded-xl bg-gray-700 hover:bg-purple-600 hover:scale-110 flex items-center justify-center text-white font-bold transition-all border border-black shadow-[0_2px_0_0_#000]"
              >
                <FaChevronRight size={16} />
              </button>
            </div>

            {/* Quick Chips Selection */}
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-700/60">
              {currentOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setConfig(prev => ({ ...prev, [activeTab]: opt.id }))}
                  className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                    config[activeTab] === opt.id
                      ? 'bg-yellow-400 text-black shadow-[0_2px_0_0_#ca8a04]'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {t(opt.labelKey)}
                </button>
              ))}
            </div>
          </div>

          {/* Color Palette Picker (if applicable) */}
          {activeTabConfig?.hasColor && (
            <div className="bg-gray-800 border-2 border-black rounded-2xl p-4 shadow-inner">
              <div className="flex justify-between items-center mb-3">
                <div className="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <FaPalette /> {t('creator.color')} ({t(activeTabConfig.labelKey)})
                </div>
                
                {/* Custom Color Input */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-mono">
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

              {/* Color Swatches Grid */}
              <div className="flex flex-wrap gap-2.5">
                {(COLOR_PALETTES[activeTab] || []).map((colorHex) => {
                  const isSelected = config[activeTabConfig.colorKey]?.toLowerCase() === colorHex.toLowerCase();
                  return (
                    <button
                      key={colorHex}
                      type="button"
                      onClick={() => updateColor(activeTabConfig.colorKey, colorHex)}
                      style={{ backgroundColor: colorHex }}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${
                        isSelected 
                          ? 'border-white scale-125 shadow-[0_0_8px_rgba(255,255,255,0.8)] z-10' 
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
