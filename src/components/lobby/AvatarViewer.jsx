import { useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import { micah } from '@dicebear/collection';

// Overlays configurations (Emojis or CSS for now to emulate the items)
const OVERLAYS = {
  heldItem: {
    cigarette: { emoji: '🚬', className: 'absolute bottom-2 left-2 text-4xl transform -rotate-12' },
    vodka: { emoji: '🍾', className: 'absolute bottom-2 left-1 text-5xl transform -rotate-12' },
    beer: { emoji: '🍺', className: 'absolute bottom-2 left-2 text-4xl transform -rotate-12' },
    joint: { emoji: '🌿', className: 'absolute bottom-3 left-4 text-3xl transform rotate-45' },
    mic: { emoji: '🎤', className: 'absolute bottom-2 left-2 text-4xl transform -rotate-12' },
    none: null
  },
  adultEyes: {
    red: { className: 'absolute top-[42%] left-[30%] w-[40%] h-[15%] bg-red-500/30 rounded-full blur-[2px]' },
    sleepy: { className: 'absolute top-[38%] left-[28%] w-[45%] h-[10%] bg-black/40 rounded-full' },
    none: null
  },
  headwear: {
    headphones_dj: { emoji: '🎧', className: 'absolute -top-2 left-1/2 -translate-x-1/2 text-6xl' },
    cap_backward: { emoji: '🧢', className: 'absolute -top-3 left-1/2 -translate-x-[40%] text-6xl scale-x-[-1]' },
    beanie: { emoji: '🧣', className: 'absolute -top-1 left-1/2 -translate-x-1/2 text-5xl' }, // no beanie emoji, using scarf as placeholder or just skip
    none: null
  },
  shirtDecal: {
    gold_chain: { emoji: '⛓️', className: 'absolute top-[65%] left-1/2 -translate-x-1/2 text-5xl text-yellow-500' },
    silver_chain: { emoji: '⛓️', className: 'absolute top-[65%] left-1/2 -translate-x-1/2 text-5xl text-gray-300' },
    tattoo: { emoji: '🕸️', className: 'absolute top-[60%] left-[35%] text-2xl opacity-60' },
    none: null
  },
  background: {
    neon_city: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-black',
    studio: 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black',
    graffiti: 'bg-gradient-to-tr from-pink-600 via-red-600 to-yellow-500',
    gradient_pink: 'bg-gradient-to-br from-pink-500 to-purple-600',
    gradient_cyan: 'bg-gradient-to-tl from-cyan-400 to-blue-600',
    none: 'bg-transparent'
  }
};

export default function AvatarViewer({ config, seed, className = "" }) {
  const avatarUri = useMemo(() => {
    if (!config) return null;
    return createAvatar(micah, {
      seed: seed || 'fallback',
      eyes: config.eyes,
      hair: config.hair,
      shirt: config.shirt,
      baseColor: config.baseColor,
      shirtColor: config.shirtColor,
      glasses: config.glasses,
      glassesProbability: config.glassesProbability,
      backgroundColor: ['transparent']
    }).toDataUri();
  }, [config, seed]);

  if (!config) return <div className={`bg-gray-800 ${className}`}></div>;

  const bgClass = OVERLAYS.background[config.background || 'none'] || OVERLAYS.background.none;
  const eyesOverlay = OVERLAYS.adultEyes[config.adultEyes];
  const headOverlay = OVERLAYS.headwear[config.headwear];
  const itemOverlay = OVERLAYS.heldItem[config.heldItem];
  const decalOverlay = OVERLAYS.shirtDecal[config.shirtDecal];

  return (
    <div className={`relative overflow-hidden flex items-center justify-center ${bgClass} ${className}`}>
      {avatarUri && <img src={avatarUri} alt="Avatar" className="w-full h-full object-cover scale-110 translate-y-2 z-10" />}
      
      {/* Overlays */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {eyesOverlay && <div className={eyesOverlay.className}></div>}
        {headOverlay && <div className={headOverlay.className}>{headOverlay.emoji}</div>}
        {decalOverlay && <div className={decalOverlay.className}>{decalOverlay.emoji}</div>}
        {itemOverlay && <div className={itemOverlay.className}>{itemOverlay.emoji}</div>}
      </div>
    </div>
  );
}
