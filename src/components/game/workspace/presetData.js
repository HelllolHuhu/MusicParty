// Genre presets for Channel Rack / Step Sequencer and Piano Roll

export const DEFAULT_DRUM_CHANNELS = [
  { id: 'kick', name: '808 Kick', soundKey: 'kick', volume: 85, pan: 0, muted: false, solo: false, color: 'bg-red-500' },
  { id: 'snare', name: 'Snare / Clap', soundKey: 'snare', volume: 80, pan: 0, muted: false, solo: false, color: 'bg-orange-500' },
  { id: 'hihat', name: 'Closed Hi-Hat', soundKey: 'hihat', volume: 70, pan: 5, muted: false, solo: false, color: 'bg-amber-400' },
  { id: 'openhat', name: 'Open Hi-Hat', soundKey: 'openhat', volume: 65, pan: -5, muted: false, solo: false, color: 'bg-yellow-400' },
  { id: 'bass808', name: '808 Sub Bass', soundKey: 'bass808', volume: 90, pan: 0, muted: false, solo: false, color: 'bg-blue-500' },
  { id: 'perc', name: 'Perc / Rim', soundKey: 'perc', volume: 75, pan: 10, muted: false, solo: false, color: 'bg-purple-500' },
];

export const DRUM_SOUND_OPTIONS = [
  { id: 'kick', name: '808 Kick' },
  { id: 'kick_punchy', name: 'Punchy Acoustic Kick' },
  { id: 'snare', name: 'Trap Snare' },
  { id: 'clap', name: 'Crisp Clap' },
  { id: 'hihat', name: 'Closed Hat' },
  { id: 'openhat', name: 'Open Hat' },
  { id: 'bass808', name: '808 Sub' },
  { id: 'perc', name: 'Rimshot / Perc' },
  { id: 'scratch', name: 'Vinyl Scratch' },
  { id: 'crash', name: 'Crash Cymbal' },
];

export const GENRE_DRUM_PRESETS = {
  trap: {
    name: 'Trap Bounce (140 BPM)',
    bpm: 140,
    swing: 10,
    steps: {
      kick: [true, false, false, false, false, false, false, false, true, false, true, false, false, false, false, false],
      snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      hihat: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
      openhat: [false, false, true, false, false, false, false, false, false, false, true, false, false, false, false, false],
      bass808: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false],
      perc: [false, false, false, false, false, false, false, true, false, false, false, false, false, false, true, false],
    }
  },
  house: {
    name: 'House 4-on-the-Floor (126 BPM)',
    bpm: 126,
    swing: 0,
    steps: {
      kick: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
      snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      hihat: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
      openhat: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
      bass808: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
      perc: [false, false, false, false, false, false, true, false, false, false, false, false, false, true, false, false],
    }
  },
  boombap: {
    name: 'Boom-Bap 90s (92 BPM)',
    bpm: 92,
    swing: 15,
    steps: {
      kick: [true, false, false, false, false, false, false, true, false, false, true, false, false, false, false, false],
      snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      hihat: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
      openhat: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true],
      bass808: [true, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false],
      perc: [false, false, false, true, false, false, false, false, false, false, false, true, false, false, false, false],
    }
  },
  lofi: {
    name: 'Lo-Fi Chill (84 BPM)',
    bpm: 84,
    swing: 25,
    steps: {
      kick: [true, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false],
      snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
      hihat: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
      openhat: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false],
      bass808: [true, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false],
      perc: [false, false, true, false, false, false, false, true, false, false, true, false, false, false, false, false],
    }
  },
  reggaeton: {
    name: 'Reggaeton Dembow (98 BPM)',
    bpm: 98,
    swing: 5,
    steps: {
      kick: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
      snare: [false, false, false, true, false, false, true, false, false, false, false, true, false, false, true, false],
      hihat: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
      openhat: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
      bass808: [true, false, false, false, false, false, true, false, true, false, false, false, false, false, true, false],
      perc: [false, false, false, true, false, false, false, false, false, false, false, true, false, false, false, false],
    }
  }
};

export const PIANO_INSTRUMENTS = [
  { id: 'pluck', name: 'Pluck Synth', category: 'Synth', color: 'bg-purple-500', icon: '✨' },
  { id: 'keys', name: 'Electric Piano / Keys', category: 'Keys', color: 'bg-emerald-500', icon: '🎹' },
  { id: 'lead', name: 'Lead Synth', category: 'Lead', color: 'bg-pink-500', icon: '⚡' },
  { id: 'bass', name: '808 Sub Bass', category: 'Bass', color: 'bg-blue-500', icon: '🔊' },
  { id: 'pad', name: 'Retro Synth Pad', category: 'Pad', color: 'bg-indigo-500', icon: '🌌' },
];

export const MELODY_PRESETS = [
  {
    id: 'dark_trap',
    name: 'Dark Trap Riff (C Minor)',
    instrument: 'pluck',
    notes: [
      { note: 'C4', step: 0, length: 2 },
      { note: 'D#4', step: 2, length: 2 },
      { note: 'G4', step: 4, length: 2 },
      { note: 'A#4', step: 6, length: 2 },
      { note: 'G4', step: 8, length: 2 },
      { note: 'D#4', step: 10, length: 2 },
      { note: 'C4', step: 12, length: 4 },
    ]
  },
  {
    id: 'sad_lofi',
    name: 'Sad Lo-Fi Chords (C Minor)',
    instrument: 'keys',
    notes: [
      { note: 'C4', step: 0, length: 4 },
      { note: 'D#4', step: 0, length: 4 },
      { note: 'G4', step: 0, length: 4 },
      { note: 'A#3', step: 4, length: 4 },
      { note: 'D4', step: 4, length: 4 },
      { note: 'F4', step: 4, length: 4 },
      { note: 'G#3', step: 8, length: 4 },
      { note: 'C4', step: 8, length: 4 },
      { note: 'D#4', step: 8, length: 4 },
      { note: 'A#3', step: 12, length: 4 },
      { note: 'D4', step: 12, length: 4 },
      { note: 'F4', step: 12, length: 4 },
    ]
  },
  {
    id: 'pop_uplifting',
    name: 'Uplifting Pop Melody (C Major)',
    instrument: 'lead',
    notes: [
      { note: 'C4', step: 0, length: 2 },
      { note: 'E4', step: 2, length: 2 },
      { note: 'G4', step: 4, length: 2 },
      { note: 'C5', step: 6, length: 2 },
      { note: 'B4', step: 8, length: 2 },
      { note: 'G4', step: 10, length: 2 },
      { note: 'A4', step: 12, length: 2 },
      { note: 'G4', step: 14, length: 2 },
    ]
  },
  {
    id: 'sub_slide',
    name: '808 Bassline Groove',
    instrument: 'bass',
    notes: [
      { note: 'C3', step: 0, length: 4 },
      { note: 'C3', step: 6, length: 2 },
      { note: 'D#3', step: 8, length: 4 },
      { note: 'A#2', step: 12, length: 4 },
    ]
  }
];
