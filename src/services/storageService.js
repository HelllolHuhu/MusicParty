// IndexedDB Persistence Service for MusicParty Studio Workspace
// Stores tracks, patterns, recorded audio blobs/base64, and BPM under 'track_${roomId}_${playerId}'

const DB_NAME = 'MusicPartyDB';
const DB_VERSION = 1;
const STORE_NAME = 'workspace_tracks';

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save workspace state to IndexedDB with debounce
 */
let saveTimeouts = {};

export function saveTrackState(roomId, playerId, roundId, data) {
  if (!roomId || !playerId || !data) return Promise.resolve();

  const key = `track_${roomId}_${playerId}`;

  return new Promise((resolve, reject) => {
    if (saveTimeouts[key]) {
      clearTimeout(saveTimeouts[key]);
    }

    saveTimeouts[key] = setTimeout(async () => {
      try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);

        const record = {
          key,
          roomId,
          playerId,
          roundId: roundId || data.roundId || null,
          tracks: data.tracks || [],
          bpm: data.bpm || 130,
          songDurationSeconds: data.songDurationSeconds || 60,
          activeTrackId: data.activeTrackId || 't1',
          savedAt: Date.now()
        };

        store.put(record);

        tx.oncomplete = () => {
          db.close();
          resolve(true);
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error);
        };
      } catch (err) {
        console.warn('IndexedDB saveTrackState error:', err);
        // Fallback to localStorage if IndexedDB fails
        try {
          localStorage.setItem(key, JSON.stringify({
            roundId: roundId || data.roundId || null,
            tracks: data.tracks || [],
            bpm: data.bpm || 130,
            songDurationSeconds: data.songDurationSeconds || 60,
            savedAt: Date.now()
          }));
        } catch {}
        resolve(false);
      }
    }, 600); // 600ms debounce
  });
}

/**
 * Load workspace state from IndexedDB for the current round
 */
export async function loadTrackState(roomId, playerId, currentRoundId = null) {
  if (!roomId || !playerId) return null;
  const key = `track_${roomId}_${playerId}`;

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);

      req.onsuccess = () => {
        db.close();
        if (req.result) {
          const res = req.result;
          // Verify roundId matches current round!
          if (currentRoundId && res.roundId && res.roundId !== currentRoundId) {
            clearTrackState(roomId, playerId);
            resolve(null);
            return;
          }
          resolve(res);
        } else {
          // Check fallback localStorage
          try {
            const raw = localStorage.getItem(key);
            if (!raw) return resolve(null);
            const parsed = JSON.parse(raw);
            if (currentRoundId && parsed.roundId && parsed.roundId !== currentRoundId) {
              localStorage.removeItem(key);
              resolve(null);
              return;
            }
            resolve(parsed);
          } catch {
            resolve(null);
          }
        }
      };

      req.onerror = () => {
        db.close();
        resolve(null);
      };
    });
  } catch (err) {
    console.warn('IndexedDB loadTrackState error:', err);
    return null;
  }
}

/**
 * Clear saved workspace state (called after player submits track)
 */
export async function clearTrackState(roomId, playerId) {
  if (!roomId || !playerId) return;
  const key = `track_${roomId}_${playerId}`;

  if (saveTimeouts[key]) {
    clearTimeout(saveTimeouts[key]);
    delete saveTimeouts[key];
  }

  try {
    localStorage.removeItem(key);
  } catch {}

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(key);
    tx.oncomplete = () => db.close();
  } catch (err) {
    console.warn('IndexedDB clearTrackState error:', err);
  }
}
