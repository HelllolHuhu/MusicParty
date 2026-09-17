export const COLOR_PALETTES = {
  head: [
    '#f9c9b6', '#ffcca5', '#e0a39a', '#d78774', 
    '#b56752', '#8d5440', '#4a2c20', '#a0e426', '#70d6ff', '#ff70a6'
  ],
  hair: [
    '#18181b', '#3f2e27', '#78350f', '#ca8a04', 
    '#dc2626', '#9ca3af', '#3b82f6', '#ec4899', '#8b5cf6', '#10b981'
  ],
  eyes: [
    '#451a03', '#3b82f6', '#10b981', '#06b6d4', 
    '#8b5cf6', '#f59e0b', '#ef4444', '#71717a'
  ],
  beard: [
    '#18181b', '#3f2e27', '#78350f', '#ca8a04', 
    '#dc2626', '#9ca3af', '#3b82f6', '#ec4899', '#8b5cf6'
  ]
};

export const PART_OPTIONS = {
  head: [
    { id: 'head_1', labelKey: 'creator.part.head_1', file: 'head/head_1.svg' },
    { id: 'head_2', labelKey: 'creator.part.head_2', file: 'head/head_2.svg' },
    { id: 'head_3', labelKey: 'creator.part.head_3', file: 'head/head_3.svg' },
  ],
  hair: [
    { id: 'none', labelKey: 'creator.part.hair_none', file: null },
    { id: 'hair_1', labelKey: 'creator.part.hair_1', file: 'hair/hair_1.svg' },
    { id: 'hair_2', labelKey: 'creator.part.hair_2', file: 'hair/hair_2.svg' },
    { id: 'hair_3', labelKey: 'creator.part.hair_3', file: 'hair/hair_3.svg' },
  ],
  eyes: [
    { id: 'eyes_1', labelKey: 'creator.part.eyes_1', file: 'eyes/eyes_1.svg' },
    { id: 'eyes_2', labelKey: 'creator.part.eyes_2', file: 'eyes/eyes_2.svg' },
    { id: 'eyes_3', labelKey: 'creator.part.eyes_3', file: 'eyes/eyes_3.svg' },
  ],
  beard: [
    { id: 'none', labelKey: 'creator.part.beard_none', file: null },
    { id: 'beard_1', labelKey: 'creator.part.beard_1', file: 'beard/beard_1.svg' },
    { id: 'beard_2', labelKey: 'creator.part.beard_2', file: 'beard/beard_2.svg' },
    { id: 'beard_3', labelKey: 'creator.part.beard_3', file: 'beard/beard_3.svg' },
  ],
  accessory: [
    { id: 'none', labelKey: 'creator.part.acc_none', file: null },
    { id: 'acc_1', labelKey: 'creator.part.acc_1', file: 'accessories/acc_1.svg' },
    { id: 'acc_2', labelKey: 'creator.part.acc_2', file: 'accessories/acc_2.svg' },
    { id: 'acc_3', labelKey: 'creator.part.acc_3', file: 'accessories/acc_3.svg' },
  ]
};

export const DEFAULT_AVATAR_CONFIG = {
  head: 'head_1',
  headColor: '#f9c9b6',
  hair: 'hair_1',
  hairColor: '#18181b',
  eyes: 'eyes_1',
  eyesColor: '#3b82f6',
  beard: 'none',
  beardColor: '#18181b',
  accessory: 'none'
};

export const RANDOM_NAMES_BY_LANG = {
  en: [
    "DJ Cosmic", "MC Beat", "Lil Groovy", "SynthLord", "Disco King", 
    "BassDrop", "Neon Rider", "Funky Fox", "Captain Vibe", "SoundWave",
    "AudioMaster", "RetroRocker", "GlitchBoy", "PixelPunk"
  ],
  sk: [
    "Lil Fero", "DJ Kapusta", "MC Bryndza", "Traktorista", "Vejper77", 
    "Stoned Dog", "Acid Jožo", "Párok", "Cibuľa", "Disco Kráľ", 
    "BassDrop", "RetroVibe", "Klobása", "Majster Zvuku"
  ],
  es: [
    "DJ Fuego", "MC Ritmo", "El Loco", "Rey Disco", "Vaper77", 
    "Perro Loco", "Ácido Pepe", "Salchicha", "Cebolla", "Señor Beat", 
    "BassDrop", "Onda Retro", "Sonido Puro", "Capitán Fiesta"
  ],
  de: [
    "DJ Kraut", "MC Beat", "Der Meister", "Disco König", "Vaper77", 
    "Stoned Dog", "Acid Hans", "Würstchen", "Zwiebel", "BassDrop", 
    "RetroVibe", "SoundGott", "KlangKaiser", "PixelRocker"
  ]
};
