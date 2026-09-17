import * as Tone from 'tone';

class AudioEngine {
  constructor() {
    this.parts = {};
    this.players = {};
    this.synths = {};
    this.initialized = false;
  }

  ensureInitialized() {
    if (!this.initialized) {
      try {
        Tone.Transport.loop = false;
        Tone.Transport.bpm.value = 128;
        
        // Setup specialized instruments
        this.synths.kick = new Tone.MembraneSynth({
          pitchDecay: 0.05,
          octaves: 8,
          oscillator: { type: 'sine' },
          envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 0.4 }
        }).toDestination();

        this.synths.hihat = new Tone.NoiseSynth({
          noise: { type: 'white' },
          envelope: { attack: 0.001, decay: 0.08, sustain: 0 }
        }).toDestination();

        this.synths.bass = new Tone.MonoSynth({
          oscillator: { type: 'sawtooth' },
          filter: { Q: 3, type: 'lowpass', rolloff: -24 },
          envelope: { attack: 0.02, decay: 0.3, sustain: 0.6, release: 0.5 },
          filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.4, baseFrequency: 60, octaves: 3 }
        }).toDestination();

        this.synths.poly = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.05, decay: 0.3, sustain: 0.4, release: 0.8 }
        }).toDestination();

        this.synths.fx = new Tone.MetalSynth({
          frequency: 200,
          envelope: { attack: 0.001, decay: 0.3, release: 0.2 },
          harmonicity: 5.1,
          modulationIndex: 32,
          resonance: 4000,
          octaves: 1.5
        }).toDestination();

        this.initialized = true;
      } catch (e) {
        console.warn("Tone initialization delayed:", e);
      }
    }
  }

  previewSample(sampleId, name = '') {
    this.ensureInitialized();
    Tone.start().catch(() => {});
    try {
      if (sampleId === 's1' || (name && name.toLowerCase().includes('kick'))) {
        this.synths.kick?.triggerAttackRelease("C1", "8n");
      } else if (sampleId === 's2' || (name && name.toLowerCase().includes('hat'))) {
        this.synths.hihat?.triggerAttackRelease("16n");
      } else if (sampleId === 's3' || (name && name.toLowerCase().includes('bass'))) {
        this.synths.bass?.triggerAttackRelease("E1", "4n");
      } else if (sampleId === 's4' || (name && name.toLowerCase().includes('synth'))) {
        this.synths.poly?.triggerAttackRelease(["C4", "E4", "G4", "B4"], "2n");
      } else if (sampleId === 's5' || (name && name.toLowerCase().includes('scratch'))) {
        this.synths.fx?.triggerAttackRelease("16n");
      } else {
        this.synths.poly?.triggerAttackRelease(["C4", "G4"], "4n");
      }
    } catch (e) {
      console.warn("Preview error:", e);
    }
  }

  async start(startSeconds = 0) {
    this.ensureInitialized();
    await Tone.start();
    Tone.Transport.seconds = startSeconds;
    Tone.Transport.start();
  }

  seek(seconds = 0) {
    this.ensureInitialized();
    Tone.Transport.seconds = seconds;
  }

  stop() {
    this.ensureInitialized();
    Tone.Transport.pause();
    Tone.Transport.stop();
  }

  disposeAll() {
    Object.values(this.parts).forEach(part => {
      try { part.dispose(); } catch (e) { /* ignore */ }
    });
    this.parts = {};
  }

  getTrackDuration(tracks) {
    if (!tracks || !Array.isArray(tracks)) return 15;
    let max = 0;
    tracks.forEach(t => {
      if (t.clips) {
        t.clips.forEach(c => {
          const end = (c.startAt || 0) + (c.duration || 10);
          if (end > max) max = end;
        });
      }
    });
    return Math.max(10, Math.ceil(max));
  }

  async syncTracks(tracks, isLooping = true, loopEnd = 30) {
    this.ensureInitialized();
    this.disposeAll();
    
    if (!tracks || !Array.isArray(tracks)) return;

    Tone.Transport.loop = isLooping;
    if (isLooping) {
      Tone.Transport.loopStart = 0;
      Tone.Transport.loopEnd = loopEnd;
    }

    tracks.forEach(track => {
      if (track.muted || !track.clips) return;

      const events = track.clips.map(clip => ({
        time: clip.startAt || 0,
        duration: clip.duration || 10,
        sampleId: clip.sampleId,
        isVocal: Boolean(clip.url),
        url: clip.url,
        name: clip.name
      }));

      const part = new Tone.Part((time, value) => {
        try {
          if (value.isVocal && value.url) {
            const player = new Tone.Player(value.url).toDestination();
            player.start(time);
            player.stop(time + value.duration);
          } else if (value.sampleId === 's1' || (value.name && value.name.toLowerCase().includes('kick'))) {
            this.synths.kick?.triggerAttackRelease("C1", "8n", time);
          } else if (value.sampleId === 's2' || (value.name && value.name.toLowerCase().includes('hat'))) {
            this.synths.hihat?.triggerAttackRelease("16n", time);
          } else if (value.sampleId === 's3' || (value.name && value.name.toLowerCase().includes('bass'))) {
            this.synths.bass?.triggerAttackRelease("E1", "4n", time);
          } else if (value.sampleId === 's4' || (value.name && value.name.toLowerCase().includes('synth'))) {
            this.synths.poly?.triggerAttackRelease(["C4", "E4", "G4", "B4"], "2n", time);
          } else if (value.sampleId === 's5' || (value.name && value.name.toLowerCase().includes('scratch'))) {
            this.synths.fx?.triggerAttackRelease("16n", time);
          } else {
            this.synths.poly?.triggerAttackRelease(["C4", "G4"], "4n", time);
          }
        } catch (err) {
          console.error("Playback trigger error:", err);
        }
      }, events).start(0);

      this.parts[track.id] = part;
    });
  }
}

export const audioEngine = new AudioEngine();

