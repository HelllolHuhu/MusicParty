import * as Tone from 'tone';

class AudioEngine {
  constructor() {
    this.parts = {};
    this.players = {}; // cache of Tone.Player instances mapped by sample URL
    Tone.Transport.loop = true;
    Tone.Transport.loopStart = 0;
    Tone.Transport.loopEnd = 180; // 3 mins loop max
  }

  async start() {
    await Tone.start();
    Tone.Transport.start();
  }

  stop() {
    Tone.Transport.pause(); // Or stop, but pause keeps playhead
  }

  async syncTracks(tracks) {
    // Basic sync logic: rebuild parts for tracks that changed
    // In a full app, we would dynamically add/remove events from existing Tone.Parts
    
    tracks.forEach(track => {
      // Clean up old part
      if (this.parts[track.id]) {
        this.parts[track.id].dispose();
      }

      // If muted, just skip adding events
      if (track.muted) return;

      const events = track.clips.map(clip => {
        // Here we'd map clip.sampleId or clip.url to an actual AudioBuffer/Player
        // For MVP, we just create synth placeholders if it's not a vocal
        return {
          time: clip.startAt,
          duration: clip.duration,
          isVocal: !!clip.url,
          url: clip.url
        };
      });

      const part = new Tone.Part((time, value) => {
        // Trigger sound
        if (value.isVocal && value.url) {
          // In real life, reuse Player instances to avoid memory leaks
          const player = new Tone.Player(value.url).toDestination();
          player.autostart = true;
          // Stop it after duration
          player.stop(time + value.duration);
        } else {
          // Fake synth sound for sample drops
          const synth = new Tone.Synth().toDestination();
          synth.triggerAttackRelease("C4", "8n", time);
        }
      }, events).start(0);

      this.parts[track.id] = part;
    });
  }
}

export const audioEngine = new AudioEngine();
