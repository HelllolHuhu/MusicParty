import { useState, useEffect, useMemo } from 'react';
import { FaChevronLeft, FaChevronRight, FaDice } from 'react-icons/fa';
import AvatarViewer from './AvatarViewer';

const OPTIONS = {
  eyes: ['eyes', 'round', 'smiling', 'eyesShadow', 'smilingShadow'],
  adultEyes: ['none', 'red', 'sleepy'],
  hair: ['mrClean', 'fonze', 'mrT', 'dougFunny', 'dannyPhantom', 'full', 'turban', 'pixie'],
  headwear: ['none', 'headphones_dj', 'cap_backward', 'beanie'],
  shirt: ['crew', 'open', 'collared'],
  shirtDecal: ['none', 'gold_chain', 'silver_chain', 'tattoo'],
  glasses: ['round', 'square', 'none'],
  baseColor: ['f9c9b6', 'f9cb28', 'ffb057', 'ffcca5', 'e0a39a', 'd78774', 'b56752', '8d5440'],
  shirtColor: ['9287ff', '6bc89b', 'ffb443', 'ff7474', '74aaff', 'e0e0e0', '343a40'],
  heldItem: ['none', 'cigarette', 'vodka', 'beer', 'joint', 'mic'],
  background: ['none', 'neon_city', 'studio', 'graffiti', 'gradient_pink', 'gradient_cyan']
};

const RANDOM_NAMES = ["Lil Fero", "DJ Kapusta", "MC Bryndza", "Traktorista", "Vejper77", "Stoned Dog", "Acid Jožo", "Párok", "Cibuľa"];

export default function CharacterCreator({ onChange, initialConfig, initialName }) {
  const [name, setName] = useState(initialName || '');
  const [config, setConfig] = useState(initialConfig || {
    eyes: 0,
    adultEyes: 0,
    hair: 0,
    headwear: 0,
    shirt: 0,
    shirtDecal: 0,
    glasses: 2,
    baseColor: 0,
    shirtColor: 0,
    heldItem: 0,
    background: 4
  });

  const mappedConfig = useMemo(() => ({
    eyes: [OPTIONS.eyes[config.eyes]],
    hair: [OPTIONS.hair[config.hair]],
    shirt: [OPTIONS.shirt[config.shirt]],
    baseColor: [OPTIONS.baseColor[config.baseColor]],
    shirtColor: [OPTIONS.shirtColor[config.shirtColor]],
    ...(OPTIONS.glasses[config.glasses] !== 'none' ? { glasses: [OPTIONS.glasses[config.glasses]], glassesProbability: 100 } : { glassesProbability: 0 }),
    adultEyes: OPTIONS.adultEyes[config.adultEyes],
    headwear: OPTIONS.headwear[config.headwear],
    shirtDecal: OPTIONS.shirtDecal[config.shirtDecal],
    heldItem: OPTIONS.heldItem[config.heldItem],
    background: OPTIONS.background[config.background]
  }), [config]);

  // Export state upwards
  useEffect(() => {
    onChange(name, mappedConfig);
  }, [name, mappedConfig, onChange]);

  const handleNext = (key) => {
    setConfig(prev => ({
      ...prev,
      [key]: (prev[key] + 1) % OPTIONS[key].length
    }));
  };

  const handlePrev = (key) => {
    setConfig(prev => ({
      ...prev,
      [key]: prev[key] === 0 ? OPTIONS[key].length - 1 : prev[key] - 1
    }));
  };

  const randomizeAll = () => {
    setConfig({
      eyes: Math.floor(Math.random() * OPTIONS.eyes.length),
      adultEyes: Math.random() > 0.7 ? Math.floor(Math.random() * OPTIONS.adultEyes.length) : 0,
      hair: Math.floor(Math.random() * OPTIONS.hair.length),
      headwear: Math.random() > 0.7 ? Math.floor(Math.random() * OPTIONS.headwear.length) : 0,
      shirt: Math.floor(Math.random() * OPTIONS.shirt.length),
      shirtDecal: Math.random() > 0.7 ? Math.floor(Math.random() * OPTIONS.shirtDecal.length) : 0,
      glasses: Math.floor(Math.random() * OPTIONS.glasses.length),
      baseColor: Math.floor(Math.random() * OPTIONS.baseColor.length),
      shirtColor: Math.floor(Math.random() * OPTIONS.shirtColor.length),
      heldItem: Math.random() > 0.5 ? Math.floor(Math.random() * OPTIONS.heldItem.length) : 0,
      background: Math.floor(Math.random() * OPTIONS.background.length)
    });
    setName(RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)]);
  };

  const OptionRow = ({ label, stateKey }) => (
    <div className="flex justify-between items-center bg-gray-700 rounded-xl p-2 px-4 shadow-inner mb-2">
      <span className="font-bold text-gray-300 w-24">{label}</span>
      <div className="flex items-center gap-4">
        <button onClick={() => handlePrev(stateKey)} className="text-gray-400 hover:text-white hover:scale-125 transition-transform"><FaChevronLeft /></button>
        <div className="w-16 text-center text-sm font-semibold truncate capitalize text-yellow-400">
          {OPTIONS[stateKey][config[stateKey]]}
        </div>
        <button onClick={() => handleNext(stateKey)} className="text-gray-400 hover:text-white hover:scale-125 transition-transform"><FaChevronRight /></button>
      </div>
    </div>
  );

  return (
    <div className="chunky-panel p-6 flex flex-col md:flex-row gap-8">
      {/* Avatar Preview */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <AvatarViewer 
          config={mappedConfig} 
          seed={name} 
          className="w-48 h-48 rounded-full border-4 border-black shadow-[4px_4px_0_0_#000] mb-6" 
        />
        
        <div className="w-full flex gap-2">
          <input
            type="text"
            placeholder="Zadaj meno..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 bg-gray-700 border-2 border-gray-900 rounded-xl p-3 font-bold text-lg focus:outline-none focus:border-purple-500 shadow-inner"
            maxLength={15}
          />
          <button 
            onClick={randomizeAll}
            className="btn-chunky btn-chunky-purple flex items-center justify-center w-14"
            title="Náhodný avatar a meno"
          >
            <FaDice size={24} />
          </button>
        </div>
      </div>

      {/* Options Controls */}
      <div className="flex-1">
        <h3 className="text-xl font-bold mb-4 text-purple-300">Vzhľad Postavy</h3>
        <OptionRow label="Farba Pleti" stateKey="baseColor" />
        <OptionRow label="Oči" stateKey="eyes" />
        <OptionRow label="Vlasy / Hlava" stateKey="hair" />
        <OptionRow label="Oblečenie" stateKey="shirt" />
        <OptionRow label="Farba odevu" stateKey="shirtColor" />
        <OptionRow label="Okuliare" stateKey="glasses" />
      </div>
    </div>
  );
}
