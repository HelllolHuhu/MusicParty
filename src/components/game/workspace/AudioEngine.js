import * as Tone from 'tone';

export function formatTimeHMSM(seconds) {
  const totalMs = Math.max(0, Math.floor(seconds * 1000));
  const ms = (totalMs % 1000).toString().padStart(3, '0');
  const totalSec = Math.floor(totalMs / 1000);
  const ss = (totalSec % 60).toString().padStart(2, '0');
  const totalMin = Math.floor(totalSec / 60);
  const mm = (totalMin % 60).toString().padStart(2, '0');
  const hh = Math.floor(totalMin / 60).toString().padStart(2, '0');
  return `${hh}:${mm}:${ss}.${ms}`;
}

class AudioEngine {
  constructor() {
    this.parts = {};
    this.players = {};
    this.synths = {};
    this.instruments = {};
    this.activeAudios = [];
    this.scrubAudio = null;
    this.lastScrubStep = -1;
    this.initialized = false;
    this.currentBpm = 130;
    this.currentSwing = 0;
    this.liveLoopId = null;
  }

  ensureInitialized() {
    if (this.initialized) return;

    try {
      Tone.Transport.loop = false;
      Tone.Transport.bpm.value = this.currentBpm;
      Tone.Transport.swing = this.currentSwing;

      // --- DRUM SYNTHESIZERS (Direct .toDestination() for 100% audio output reliability) ---
      this.synths.kick = new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 6,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.35, sustain: 0.01, release: 0.4 }
      }).toDestination();

      this.synths.kick_punchy = new Tone.MembraneSynth({
        pitchDecay: 0.08,
        octaves: 5,
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.001, decay: 0.25, sustain: 0.0, release: 0.2 }
      }).toDestination();

      this.synths.snare = new Tone.NoiseSynth({
        noise: { type: 'white', playbackRate: 3 },
        envelope: { attack: 0.001, decay: 0.18, sustain: 0 }
      }).toDestination();

      this.synths.clap = new Tone.NoiseSynth({
        noise: { type: 'pink', playbackRate: 2 },
        envelope: { attack: 0.01, decay: 0.22, sustain: 0 }
      }).toDestination();

      this.synths.hihat = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.05, sustain: 0 }
      }).toDestination();

      this.synths.openhat = new Tone.MetalSynth({
        frequency: 250,
        envelope: { attack: 0.001, decay: 0.35, release: 0.2 },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5
      }).toDestination();

      this.synths.bass808 = new Tone.MonoSynth({
        oscillator: { type: 'sine' },
        filter: { Q: 2, type: 'lowpass', rolloff: -24 },
        envelope: { attack: 0.01, decay: 0.4, sustain: 0.8, release: 0.6 },
        filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.5, baseFrequency: 55, octaves: 2 }
      }).toDestination();

      this.synths.perc = new Tone.MetalSynth({
        frequency: 380,
        envelope: { attack: 0.001, decay: 0.12, release: 0.1 },
        harmonicity: 3.1,
        modulationIndex: 16,
        resonance: 2500,
        octaves: 1.2
      }).toDestination();

      this.synths.scratch = new Tone.MetalSynth({
        frequency: 220,
        envelope: { attack: 0.001, decay: 0.25, release: 0.2 },
        harmonicity: 4.5,
        modulationIndex: 28,
        resonance: 3500,
        octaves: 1.8
      }).toDestination();

      this.synths.crash = new Tone.MetalSynth({
        frequency: 180,
        envelope: { attack: 0.005, decay: 1.0, release: 0.8 },
        harmonicity: 6.2,
        modulationIndex: 40,
        resonance: 5000,
        octaves: 2.5
      }).toDestination();

      // --- PIANO ROLL & MELODIC INSTRUMENTS ---
      this.instruments.pluck = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.005, decay: 0.25, sustain: 0.05, release: 0.4 }
      }).toDestination();

      this.instruments.keys = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.02, decay: 0.5, sustain: 0.3, release: 0.6 }
      }).toDestination();

      this.instruments.lead = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.02, decay: 0.3, sustain: 0.5, release: 0.4 }
      }).toDestination();

      this.instruments.bass = new Tone.MonoSynth({
        oscillator: { type: 'sawtooth' },
        filter: { Q: 2, type: 'lowpass', rolloff: -24 },
        envelope: { attack: 0.02, decay: 0.3, sustain: 0.7, release: 0.5 }
      }).toDestination();

      this.instruments.pad = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.1, decay: 0.5, sustain: 0.6, release: 0.8 }
      }).toDestination();

      this.initialized = true;
    } catch (e) {
      console.warn("Tone initialization error:", e);
    }
  }

  setBpm(bpm) {
    this.currentBpm = Math.max(60, Math.min(200, bpm));
    if (this.initialized) {
      Tone.Transport.bpm.value = this.currentBpm;
    }
  }

  setSwing(swingPercent) {
    this.currentSwing = Math.max(0, Math.min(100, swingPercent)) / 100;
    if (this.initialized) {
      Tone.Transport.swing = this.currentSwing;
    }
  }

  setMasterVolume(volDb) {
    try {
      Tone.getDestination().volume.value = volDb;
    } catch (e) {
      // ignore
    }
  }

  // Audition / Preview a drum hit immediately on click
  playDrum(soundKey) {
    this.ensureInitialized();
    Tone.start().catch(() => {});
    if (Tone.context.state !== 'running') {
      Tone.context.resume().catch(() => {});
    }
    this.playDrumAtTime(soundKey, Tone.now());
  }

  // Trigger drum sound at audio clock time
  playDrumAtTime(soundKey, time) {
    this.ensureInitialized();
    const t = Math.max(Tone.now(), time || Tone.now());
    try {
      if (soundKey === 'kick' || soundKey === 's1') {
        this.synths.kick?.triggerAttackRelease("C1", "8n", t);
      } else if (soundKey === 'kick_punchy') {
        this.synths.kick_punchy?.triggerAttackRelease("D1", "16n", t);
      } else if (soundKey === 'snare') {
        this.synths.snare?.triggerAttackRelease("16n", t);
      } else if (soundKey === 'clap') {
        this.synths.clap?.triggerAttackRelease("16n", t);
      } else if (soundKey === 'hihat' || soundKey === 's2') {
        this.synths.hihat?.triggerAttackRelease("32n", t);
      } else if (soundKey === 'openhat') {
        this.synths.openhat?.triggerAttackRelease("16n", t);
      } else if (soundKey === 'bass808' || soundKey === 's3') {
        this.synths.bass808?.triggerAttackRelease("C1", "4n", t);
      } else if (soundKey === 'perc') {
        this.synths.perc?.triggerAttackRelease("16n", t);
      } else if (soundKey === 'scratch' || soundKey === 's5') {
        this.synths.scratch?.triggerAttackRelease("16n", t);
      } else if (soundKey === 'crash') {
        this.synths.crash?.triggerAttackRelease("8n", t);
      } else {
        this.synths.hihat?.triggerAttackRelease("16n", t);
      }
    } catch (e) {
      console.warn("Drum trigger error:", e);
    }
  }

  // Audition / Preview a melodic note
  playNote(instrumentKey = 'pluck', note = 'C4', duration = '8n', time) {
    this.ensureInitialized();
    Tone.start().catch(() => {});
    if (Tone.context.state !== 'running') {
      Tone.context.resume().catch(() => {});
    }
    const t = Math.max(Tone.now(), time || Tone.now());
    try {
      const inst = this.instruments[instrumentKey] || this.instruments.pluck;
      inst?.triggerAttackRelease(note, duration, t);
    } catch (e) {
      console.warn("Note audition error:", e);
    }
  }

  // Preview sample from sound library
  previewSample(sampleId, name = '') {
    this.ensureInitialized();
    Tone.start().catch(() => {});
    if (Tone.context.state !== 'running') {
      Tone.context.resume().catch(() => {});
    }
    try {
      if (sampleId === 's1' || (name && name.toLowerCase().includes('kick'))) {
        this.playDrum('kick');
      } else if (sampleId === 's2' || (name && name.toLowerCase().includes('hat'))) {
        this.playDrum('hihat');
      } else if (sampleId === 's3' || (name && name.toLowerCase().includes('bass'))) {
        this.playNote('bass', 'C2', '4n');
      } else if (sampleId === 's4' || (name && name.toLowerCase().includes('synth'))) {
        this.playNote('pluck', 'C4', '4n');
      } else if (sampleId === 's5' || (name && name.toLowerCase().includes('scratch'))) {
        this.playDrum('scratch');
      } else {
        this.playNote('keys', 'C4', '4n');
      }
    } catch (e) {
      console.warn("Preview error:", e);
    }
  }

  // --------------------------------------------------------------------------
  // LIVE STEP SEQUENCER INFINITE LOOP
  // --------------------------------------------------------------------------
  async startSequencerLive(getLiveSteps, getLiveChannels, onStepCallback) {
    this.ensureInitialized();
    await Tone.start();
    if (Tone.context.state !== 'running') {
      await Tone.context.resume();
    }

    this.stopSequencerLive();
    this.disposeAll();

    Tone.Transport.bpm.value = this.currentBpm;
    Tone.Transport.position = 0;

    let stepIndex = 0;
    this.liveLoopId = Tone.Transport.scheduleRepeat((time) => {
      const currentStep = stepIndex % 16;

      const steps = getLiveSteps ? getLiveSteps() : null;
      const channels = getLiveChannels ? getLiveChannels() : null;

      if (steps && channels) {
        const hasActiveSolo = channels.some(c => c.solo);
        channels.forEach(chan => {
          const isChannelMuted = chan.muted || (hasActiveSolo && !chan.solo);
          if (isChannelMuted) return;

          const chanSteps = steps[chan.id];
          if (chanSteps && chanSteps[currentStep]) {
            this.playDrumAtTime(chan.soundKey || chan.id, time);
          }
        });
      }

      if (onStepCallback) {
        Tone.Draw.schedule(() => {
          onStepCallback(currentStep);
        }, time);
      }

      stepIndex = (stepIndex + 1) % 16;
    }, "16n");

    Tone.Transport.start();
  }

  stopSequencerLive() {
    if (this.liveLoopId !== null) {
      Tone.Transport.clear(this.liveLoopId);
      this.liveLoopId = null;
    }
    Tone.Transport.pause();
    Tone.Transport.stop();
  }

  // --------------------------------------------------------------------------
  // LIVE PIANO ROLL INFINITE LOOP
  // --------------------------------------------------------------------------
  async startPianoRollLive(getLiveNotes, getInstrument, onStepCallback) {
    this.ensureInitialized();
    await Tone.start();
    if (Tone.context.state !== 'running') {
      await Tone.context.resume();
    }

    this.stopSequencerLive();
    this.disposeAll();

    Tone.Transport.bpm.value = this.currentBpm;
    Tone.Transport.position = 0;

    let stepIndex = 0;
    this.liveLoopId = Tone.Transport.scheduleRepeat((time) => {
      const currentStep = stepIndex % 16;

      const notes = getLiveNotes ? getLiveNotes() : null;
      const instKey = getInstrument ? getInstrument() : 'pluck';

      if (notes && Array.isArray(notes)) {
        const activeNotes = notes.filter(n => n.step === currentStep);
        const inst = this.instruments[instKey] || this.instruments.pluck;
        activeNotes.forEach(n => {
          const dur = `${(n.length || 2) * 0.12}s`;
          inst?.triggerAttackRelease(n.note, dur, time);
        });
      }

      if (onStepCallback) {
        Tone.Draw.schedule(() => {
          onStepCallback(currentStep);
        }, time);
      }

      stepIndex = (stepIndex + 1) % 16;
    }, "16n");

    Tone.Transport.start();
  }

  // --------------------------------------------------------------------------
  // ADOBE AUDITION STYLE AUDIO SCRUBBING
  // --------------------------------------------------------------------------
  scrubTo(timeInSeconds, velocity = 1, tracks = []) {
    this.ensureInitialized();
    const clampedTime = Math.max(0, Math.min(30, timeInSeconds));
    const absVelocity = Math.abs(velocity);
    // Audio playback rate proportional to mouse scrub velocity (0.5x to 3.0x)
    const shuttleRate = Math.min(3.0, Math.max(0.5, absVelocity > 0 ? absVelocity * 1.2 : 1.0));

    // 1. Scrub active unmuted audio clips (Vocal takes / Reference target song)
    if (tracks && Array.isArray(tracks)) {
      const activeAudioClip = tracks
        .filter(t => !t.muted)
        .flatMap(t => t.clips || [])
        .find(c => c.url && clampedTime >= c.startAt && clampedTime < (c.startAt + c.duration));

      if (activeAudioClip && activeAudioClip.url) {
        if (!this.scrubAudio || this.scrubAudio.src !== activeAudioClip.url) {
          if (this.scrubAudio) {
            try { this.scrubAudio.pause(); } catch {}
          }
          this.scrubAudio = new Audio(activeAudioClip.url);
        }
        try {
          const offset = clampedTime - activeAudioClip.startAt;
          this.scrubAudio.currentTime = Math.max(0, offset);
          this.scrubAudio.playbackRate = shuttleRate;
          this.scrubAudio.play().catch(() => {});
        } catch {}
      } else if (this.scrubAudio) {
        try { this.scrubAudio.pause(); } catch {}
      }

      // 2. Audible scrub tick for drum & melodic steps
      const stepDuration = 60 / this.currentBpm / 4;
      const currentStep16 = Math.floor(clampedTime / stepDuration) % 16;

      if (currentStep16 !== this.lastScrubStep) {
        this.lastScrubStep = currentStep16;
        tracks.forEach(track => {
          if (track.muted || !track.clips) return;
          track.clips.forEach(clip => {
            if (clampedTime < clip.startAt || clampedTime >= (clip.startAt + clip.duration)) return;

            // Trigger drum preview tick
            if (clip.patternData?.steps) {
              Object.entries(clip.patternData.steps).forEach(([soundKey, stepArr]) => {
                if (stepArr[currentStep16]) {
                  this.playDrumAtTime(soundKey, Tone.now());
                }
              });
            }
            // Trigger melodic note preview tick
            else if (clip.notes && Array.isArray(clip.notes)) {
              const activeNotes = clip.notes.filter(n => n.step === currentStep16);
              const inst = this.instruments[clip.instrument] || this.instruments.pluck;
              activeNotes.forEach(n => {
                inst?.triggerAttackRelease(n.note, '16n', Tone.now());
              });
            }
          });
        });
      }
    }
  }

  stopScrubbing() {
    if (this.scrubAudio) {
      try {
        this.scrubAudio.pause();
        this.scrubAudio.currentTime = 0;
      } catch {}
      this.scrubAudio = null;
    }
    this.lastScrubStep = -1;
  }

  // --------------------------------------------------------------------------
  // MULTI-TRACK ARRANGEMENT PLAYBACK FROM ANY OFFSET
  // --------------------------------------------------------------------------
  async start(startSeconds = 0) {
    this.ensureInitialized();
    await Tone.start();
    if (Tone.context.state !== 'running') {
      await Tone.context.resume();
    }
    Tone.Transport.seconds = Math.max(0, startSeconds);
    Tone.Transport.start();
  }

  seek(seconds = 0) {
    this.ensureInitialized();
    const targetSec = Math.max(0, seconds);
    Tone.Transport.seconds = targetSec;

    // Reposition any active HTML5 audio streams
    if (this.activeAudios && this.activeAudios.length > 0) {
      this.activeAudios.forEach(item => {
        try {
          const audio = item.audio || item;
          const clipStart = item.clipStart || 0;
          const clipEnd = clipStart + (item.duration || 30);
          if (targetSec >= clipStart && targetSec < clipEnd) {
            audio.currentTime = targetSec - clipStart;
            if (Tone.Transport.state === 'started') {
              audio.play().catch(() => {});
            }
          } else {
            audio.pause();
          }
        } catch {}
      });
    }
  }

  stop() {
    this.ensureInitialized();
    if (this.liveLoopId !== null) {
      Tone.Transport.clear(this.liveLoopId);
      this.liveLoopId = null;
    }
    this.stopScrubbing();
    if (this.activeAudios && this.activeAudios.length > 0) {
      this.activeAudios.forEach(item => {
        try {
          const a = item.audio || item;
          a.pause();
          a.currentTime = 0;
        } catch {}
      });
      this.activeAudios = [];
    }
    Tone.Transport.pause();
    Tone.Transport.stop();
  }

  disposeAll() {
    this.stopScrubbing();
    if (this.activeAudios && this.activeAudios.length > 0) {
      this.activeAudios.forEach(item => {
        try {
          const a = item.audio || item;
          a.pause();
          a.currentTime = 0;
        } catch {}
      });
      this.activeAudios = [];
    }
    Object.values(this.parts).forEach(part => {
      try { part.dispose(); } catch {}
    });
    this.parts = {};
  }

  getTrackDuration(tracks) {
    if (!tracks || !Array.isArray(tracks)) return 15;
    let max = 0;
    tracks.forEach(t => {
      if (t.isReference) return;
      if (t.clips) {
        t.clips.forEach(c => {
          const end = (c.startAt || 0) + (c.duration || 1);
          if (end > max) max = end;
        });
      }
    });
    return Math.min(30, Math.max(5, Math.ceil(max)));
  }

  // Synchronize multi-track arrangement scheduling starting from ANY playhead offset!
  async syncTracks(tracks, isLooping = true, loopEnd = 30, startOffset = 0) {
    this.ensureInitialized();
    this.disposeAll();

    if (!tracks || !Array.isArray(tracks)) return;

    Tone.Transport.loop = isLooping;
    if (isLooping) {
      Tone.Transport.loopStart = 0;
      Tone.Transport.loopEnd = loopEnd;
    }

    const stepDuration = 60 / this.currentBpm / 4; // 16th note in seconds

    tracks.forEach(track => {
      if (track.muted || !track.clips || track.clips.length === 0) return;

      const events = [];

      track.clips.forEach(clip => {
        const clipStart = clip.startAt || 0;
        const clipDur = clip.duration || 1;
        const clipEnd = clipStart + clipDur;

        // 1. Audio Clips (Vocals & Reference Tracks)
        if (clip.url) {
          // If playback starts inside this clip, start immediately at the offset
          if (startOffset >= clipStart && startOffset < clipEnd) {
            const audio = new Audio(clip.url);
            const offset = startOffset - clipStart;
            audio.currentTime = offset;
            audio.play().catch(e => console.warn("Audio offset play error:", e));
            this.activeAudios.push({ audio, clipStart, duration: clipDur });
          }
          // Also schedule future playback when loop wraps or if clip starts in future
          events.push({
            time: clipStart,
            duration: clipDur,
            type: 'audio',
            url: clip.url,
            name: clip.name
          });
        }

        // 2. Drum Pattern Blocks
        else if (clip.patternData?.steps) {
          const repeatCount = Math.ceil(clipDur / (stepDuration * 16));
          for (let bar = 0; bar < repeatCount; bar++) {
            const barStart = clipStart + (bar * 16 * stepDuration);
            if (barStart >= clipEnd) break;

            Object.entries(clip.patternData.steps).forEach(([soundKey, stepArr]) => {
              stepArr.forEach((isActive, stepIdx) => {
                if (!isActive) return;
                const hitTime = barStart + (stepIdx * stepDuration);
                if (hitTime >= clipStart && hitTime < clipEnd) {
                  events.push({
                    time: hitTime,
                    duration: stepDuration,
                    type: 'drum',
                    soundKey
                  });
                }
              });
            });
          }
        }

        // 3. Melodic Piano Roll Notes
        else if (clip.notes && Array.isArray(clip.notes)) {
          const instKey = clip.instrument || 'pluck';
          clip.notes.forEach(n => {
            const noteTime = clipStart + ((n.step || 0) * stepDuration);
            if (noteTime >= clipStart && noteTime < clipEnd) {
              events.push({
                time: noteTime,
                duration: (n.length || 2) * 0.12,
                type: 'note',
                note: n.note,
                instrument: instKey
              });
            }
          });
        }

        // 4. One-Shot Drum & Synth Samples
        else {
          events.push({
            time: clipStart,
            duration: clipDur,
            type: 'oneshot',
            sampleId: clip.sampleId,
            name: clip.name
          });
        }
      });

      // Schedule discrete events across Tone.Transport
      const part = new Tone.Part((time, value) => {
        try {
          if (value.type === 'audio' && value.url) {
            const audio = new Audio(value.url);
            audio.currentTime = 0;
            audio.play().catch(e => console.warn("Scheduled audio play error:", e));
            this.activeAudios.push({ audio, clipStart: value.time, duration: value.duration });
          } else if (value.type === 'drum' && value.soundKey) {
            this.playDrumAtTime(value.soundKey, time);
          } else if (value.type === 'note' && value.note) {
            const inst = this.instruments[value.instrument] || this.instruments.pluck;
            inst?.triggerAttackRelease(value.note, `${value.duration}s`, time);
          } else if (value.type === 'oneshot') {
            this.previewSample(value.sampleId, value.name);
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
