// Scale Definitions and Music Theory Helpers for Beginner-Friendly Piano Roll

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const SCALES = {
  minor_pentatonic: {
    name: 'Minor Pentatonic (Easiest - 0 Wrong Notes)',
    intervals: [0, 3, 5, 7, 10],
    description: 'Guaranteed to sound melodic and clean. Perfect for beginners.'
  },
  major_pentatonic: {
    name: 'Major Pentatonic (Happy / Uplifting)',
    intervals: [0, 2, 4, 7, 9],
    description: 'Bright and cheerful pop feeling.'
  },
  natural_minor: {
    name: 'Natural Minor (Sad / Emotional)',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    description: 'Classic emotional and dramatic minor feel.'
  },
  major: {
    name: 'Major (Full Pop / Anthem)',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    description: 'Standard uplifting pop scale.'
  },
  trap_phrygian: {
    name: 'Trap / Phrygian (Dark / Heavy)',
    intervals: [0, 1, 3, 5, 7, 8, 10],
    description: 'Dark, tense, and menacing trap bounce.'
  },
  blues: {
    name: 'Blues (Soulful / Gritty)',
    intervals: [0, 3, 5, 6, 7, 10],
    description: 'Soulful with gritty blue notes.'
  },
  chromatic: {
    name: 'Chromatic (All Notes)',
    intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    description: 'Unrestricted full keyboard.'
  }
};

/**
 * Returns a list of in-scale note names across given octaves
 */
export function getScaleNotes(rootNote = 'C', scaleKey = 'minor_pentatonic', octaves = [3, 4]) {
  const rootIndex = NOTE_NAMES.indexOf(rootNote);
  if (rootIndex === -1) return [];

  const scale = SCALES[scaleKey] || SCALES.minor_pentatonic;
  const inScaleSet = new Set();

  scale.intervals.forEach(interval => {
    const noteIndex = (rootIndex + interval) % 12;
    inScaleSet.add(NOTE_NAMES[noteIndex]);
  });

  const fullGrid = [];

  // Generate grid from highest octave down to lowest octave (top of piano roll to bottom)
  const sortedOctaves = [...octaves].sort((a, b) => b - a);

  sortedOctaves.forEach(oct => {
    for (let i = NOTE_NAMES.length - 1; i >= 0; i--) {
      const name = NOTE_NAMES[i];
      const noteWithOct = `${name}${oct}`;
      const isInScale = inScaleSet.has(name);
      const isRoot = name === rootNote;
      const isBlackKey = name.includes('#');

      fullGrid.push({
        name,
        octave: oct,
        note: noteWithOct,
        isInScale,
        isRoot,
        isBlackKey
      });
    }
  });

  return fullGrid;
}
