// Lyrics Service: Fetches synced or plain lyrics using LRCLIB API with fallback to lyrics.ovh

/**
 * Parses an LRC string format into an array of timestamped lines.
 * Example LRC format:
 * [00:12.34] Hello world
 * [00:15.80] Another line
 */
export function parseLrcLyrics(lrcString) {
  if (!lrcString || typeof lrcString !== 'string') return [];

  const lines = lrcString.split('\n');
  const result = [];
  const timeRegex = /\[(\d{2}):(\d{2}(?:\.\d{1,3})?)\]/g;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    let match;
    const timestamps = [];
    while ((match = timeRegex.exec(trimmed)) !== null) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseFloat(match[2]);
      timestamps.push(minutes * 60 + seconds);
    }

    const text = trimmed.replace(/\[\d{2}:\d{2}(?:\.\d{1,3})?\]/g, '').trim();

    if (text) {
      for (const time of timestamps) {
        result.push({ time, text });
      }
    }
  }

  // Sort chronologically
  result.sort((a, b) => a.time - b.time);
  return result;
}

/**
 * Cleans song title by removing featuring artists, remaster tags, etc. for better lyrics search matching
 */
function cleanTitle(title = '') {
  return title
    .replace(/\s*\(feat\.[^)]*\)/gi, '')
    .replace(/\s*\(with[^)]*\)/gi, '')
    .replace(/\s*-\s*remaster(?:ed)?(?:\s*\d{4})?/gi, '')
    .replace(/\s*\(remaster(?:ed)?(?:\s*\d{4})?\)/gi, '')
    .trim();
}

/**
 * Fetches lyrics for the given artist and title.
 * Returns: { type: 'synced', lines: [...] } or { type: 'plain', text: "..." } or null
 */
export async function fetchLyricsForSong(artist, title) {
  if (!artist || !title) return null;

  const sanitizedArtist = artist.trim();
  const sanitizedTitle = cleanTitle(title);

  // 1. First attempt: LRCLIB API (free, fast, no API key needed, provides synced LRC)
  try {
    const lrclibUrl = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(sanitizedArtist)}&track_name=${encodeURIComponent(sanitizedTitle)}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(lrclibUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.plainLyrics && data.plainLyrics.trim()) {
        return {
          type: 'plain',
          text: data.plainLyrics.trim(),
          source: 'lrclib'
        };
      }

      if (data.syncedLyrics) {
        const parsedLines = parseLrcLyrics(data.syncedLyrics);
        if (parsedLines.length > 0) {
          const cleanText = parsedLines.map(l => l.text).join('\n');
          return {
            type: 'plain',
            text: cleanText,
            source: 'lrclib'
          };
        }
      }
    }
  } catch (err) {
    // LRCLIB failed or timed out, continue to fallback
  }

  // 2. Second attempt: lyrics.ovh fallback (free, provides plain lyrics text)
  try {
    const ovhUrl = `https://api.lyrics.ovh/v1/${encodeURIComponent(sanitizedArtist)}/${encodeURIComponent(sanitizedTitle)}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(ovhUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.lyrics && data.lyrics.trim()) {
        return {
          type: 'plain',
          text: data.lyrics.trim(),
          source: 'lyrics.ovh'
        };
      }
    }
  } catch (err) {
    // Fallback failed
  }

  // 3. Neither source found lyrics - return null for clean silent fallback
  return null;
}
