import { useMemo } from 'react';
import { HeadParts, EyesParts, BeardParts, HairParts, AccessoryParts } from './AvatarPartsSvg';
import { DEFAULT_AVATAR_CONFIG } from './avatarData';

export default function AvatarViewer({ config, className = "" }) {
  const mergedConfig = useMemo(() => {
    return {
      ...DEFAULT_AVATAR_CONFIG,
      ...(config || {})
    };
  }, [config]);

  const HeadComponent = HeadParts[mergedConfig.head] || HeadParts.head_1;
  const EyesComponent = EyesParts[mergedConfig.eyes] || EyesParts.eyes_1;
  const BeardComponent = mergedConfig.beard && mergedConfig.beard !== 'none' ? BeardParts[mergedConfig.beard] : null;
  const HairComponent = mergedConfig.hair && mergedConfig.hair !== 'none' ? HairParts[mergedConfig.hair] : null;
  const AccessoryComponent = mergedConfig.accessory && mergedConfig.accessory !== 'none' ? AccessoryParts[mergedConfig.accessory] : null;

  return (
    <div className={`relative overflow-hidden flex items-center justify-center bg-gradient-to-b from-indigo-950/80 via-purple-950/80 to-zinc-900 border-4 border-black shadow-[4px_4px_0_0_#000] select-none ${className}`}>
      <svg 
        viewBox="0 0 200 200" 
        className="w-full h-full object-contain pointer-events-none drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]"
      >
        {/* Layer 1: Head shape & skin */}
        {HeadComponent && <HeadComponent color={mergedConfig.headColor} />}

        {/* Layer 2: Eyes */}
        {EyesComponent && <EyesComponent color={mergedConfig.eyesColor} />}

        {/* Layer 3: Beard & Facial Hair */}
        {BeardComponent && <BeardComponent color={mergedConfig.beardColor} />}

        {/* Layer 4: Hair */}
        {HairComponent && <HairComponent color={mergedConfig.hairColor} />}

        {/* Layer 5: Accessories */}
        {AccessoryComponent && <AccessoryComponent />}
      </svg>
    </div>
  );
}
