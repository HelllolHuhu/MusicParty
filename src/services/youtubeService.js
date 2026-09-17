// YouTube Music Service with YouTube Data API v3 & Curated World Hits

const API_KEY = import.meta.env.YOUTUBE_API_KEY || import.meta.env.VITE_YOUTUBE_API_KEY || 'AIzaSyAkxaX_H4EH35Sl_YmgujXFmfnLvBMkMB8';

// Top-tier world-famous iconic mega-hits with guaranteed hook / chorus timestamps
export const CURATED_SONGS = {
  "Pop": [
    { videoId: "4NRXx6U8ABQ", title: "Blinding Lights", artist: "The Weeknd", startTime: 25, thumbnail: "https://img.youtube.com/vi/4NRXx6U8ABQ/hqdefault.jpg" },
    { videoId: "JGwWNGJdvx8", title: "Shape of You", artist: "Ed Sheeran", startTime: 30, thumbnail: "https://img.youtube.com/vi/JGwWNGJdvx8/hqdefault.jpg" },
    { videoId: "TUVcZfQe-Kw", title: "Levitating", artist: "Dua Lipa", startTime: 30, thumbnail: "https://img.youtube.com/vi/TUVcZfQe-Kw/hqdefault.jpg" },
    { videoId: "OPf0YbXqDm0", title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars", startTime: 40, thumbnail: "https://img.youtube.com/vi/OPf0YbXqDm0/hqdefault.jpg" },
    { videoId: "DyDfgMOUjCI", title: "bad guy", artist: "Billie Eilish", startTime: 35, thumbnail: "https://img.youtube.com/vi/DyDfgMOUjCI/hqdefault.jpg" },
    { videoId: "09R8_2nJtjg", title: "Sugar", artist: "Maroon 5", startTime: 40, thumbnail: "https://img.youtube.com/vi/09R8_2nJtjg/hqdefault.jpg" }
  ],
  "Rock": [
    { videoId: "fJ9rUzIMcZQ", title: "Bohemian Rhapsody", artist: "Queen", startTime: 180, thumbnail: "https://img.youtube.com/vi/fJ9rUzIMcZQ/hqdefault.jpg" },
    { videoId: "hTWKbfoikeg", title: "Smells Like Teen Spirit", artist: "Nirvana", startTime: 25, thumbnail: "https://img.youtube.com/vi/hTWKbfoikeg/hqdefault.jpg" },
    { videoId: "v2AC41dglnM", title: "Thunderstruck", artist: "AC/DC", startTime: 30, thumbnail: "https://img.youtube.com/vi/v2AC41dglnM/hqdefault.jpg" },
    { videoId: "eVTXPUF4Oz4", title: "In The End", artist: "Linkin Park", startTime: 45, thumbnail: "https://img.youtube.com/vi/eVTXPUF4Oz4/hqdefault.jpg" },
    { videoId: "1w7OgIMMRc4", title: "Sweet Child O' Mine", artist: "Guns N' Roses", startTime: 30, thumbnail: "https://img.youtube.com/vi/1w7OgIMMRc4/hqdefault.jpg" },
    { videoId: "lDK9QqIzhwk", title: "Livin' On A Prayer", artist: "Bon Jovi", startTime: 70, thumbnail: "https://img.youtube.com/vi/lDK9QqIzhwk/hqdefault.jpg" }
  ],
  "Hip-Hop": [
    { videoId: "tvTRZJ-4EyI", title: "HUMBLE.", artist: "Kendrick Lamar", startTime: 20, thumbnail: "https://img.youtube.com/vi/tvTRZJ-4EyI/hqdefault.jpg" },
    { videoId: "_Yhyp-_hX2s", title: "Lose Yourself", artist: "Eminem", startTime: 50, thumbnail: "https://img.youtube.com/vi/_Yhyp-_hX2s/hqdefault.jpg" },
    { videoId: "xpVfcZ0ZcFM", title: "God's Plan", artist: "Drake", startTime: 45, thumbnail: "https://img.youtube.com/vi/xpVfcZ0ZcFM/hqdefault.jpg" },
    { videoId: "6ONRF7h3280", title: "SICKO MODE", artist: "Travis Scott", startTime: 60, thumbnail: "https://img.youtube.com/vi/6ONRF7h3280/hqdefault.jpg" },
    { videoId: "ApXoWvfEYVU", title: "Sunflower", artist: "Post Malone, Swae Lee", startTime: 30, thumbnail: "https://img.youtube.com/vi/ApXoWvfEYVU/hqdefault.jpg" },
    { videoId: "5qm8PH4xAss", title: "In Da Club", artist: "50 Cent", startTime: 35, thumbnail: "https://img.youtube.com/vi/5qm8PH4xAss/hqdefault.jpg" }
  ],
  "EDM": [
    { videoId: "_ovdm2yX4MA", title: "Levels", artist: "Avicii", startTime: 45, thumbnail: "https://img.youtube.com/vi/_ovdm2yX4MA/hqdefault.jpg" },
    { videoId: "gCYcYZ84N5o", title: "Animals", artist: "Martin Garrix", startTime: 60, thumbnail: "https://img.youtube.com/vi/gCYcYZ84N5o/hqdefault.jpg" },
    { videoId: "60ItHLz5WEA", title: "Faded", artist: "Alan Walker", startTime: 48, thumbnail: "https://img.youtube.com/vi/60ItHLz5WEA/hqdefault.jpg" },
    { videoId: "JRfuAukYTKg", title: "Titanium", artist: "David Guetta ft. Sia", startTime: 45, thumbnail: "https://img.youtube.com/vi/JRfuAukYTKg/hqdefault.jpg" },
    { videoId: "PT2_F-1esPk", title: "Closer", artist: "The Chainsmokers", startTime: 45, thumbnail: "https://img.youtube.com/vi/PT2_F-1esPk/hqdefault.jpg" },
    { videoId: "ebXbLfLACGM", title: "Summer", artist: "Calvin Harris", startTime: 30, thumbnail: "https://img.youtube.com/vi/ebXbLfLACGM/hqdefault.jpg" }
  ],
  "Trap": [
    { videoId: "xvZqHgFz51I", title: "Mask Off", artist: "Future", startTime: 30, thumbnail: "https://img.youtube.com/vi/xvZqHgFz51I/hqdefault.jpg" },
    { videoId: "tfSS1e3kYeo", title: "HIGHEST IN THE ROOM", artist: "Travis Scott", startTime: 25, thumbnail: "https://img.youtube.com/vi/tfSS1e3kYeo/hqdefault.jpg" },
    { videoId: "mzB1V935HGg", title: "Lucid Dreams", artist: "Juice WRLD", startTime: 30, thumbnail: "https://img.youtube.com/vi/mzB1V935HGg/hqdefault.jpg" },
    { videoId: "UceaB4D0jpo", title: "rockstar", artist: "Post Malone ft. 21 Savage", startTime: 35, thumbnail: "https://img.youtube.com/vi/UceaB4D0jpo/hqdefault.jpg" },
    { videoId: "r7qovpFAGrQ", title: "Old Town Road", artist: "Lil Nas X", startTime: 20, thumbnail: "https://img.youtube.com/vi/r7qovpFAGrQ/hqdefault.jpg" }
  ],
  "Reggaeton": [
    { videoId: "kJQP7kiw5Fk", title: "Despacito", artist: "Luis Fonsi ft. Daddy Yankee", startTime: 45, thumbnail: "https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg" },
    { videoId: "Cr8K88UcO08", title: "Tití Me Preguntó", artist: "Bad Bunny", startTime: 30, thumbnail: "https://img.youtube.com/vi/Cr8K88UcO08/hqdefault.jpg" },
    { videoId: "wnJ6LuUFpMo", title: "Mi Gente", artist: "J Balvin, Willy William", startTime: 30, thumbnail: "https://img.youtube.com/vi/wnJ6LuUFpMo/hqdefault.jpg" },
    { videoId: "CCF1_jI558g", title: "Gasolina", artist: "Daddy Yankee", startTime: 25, thumbnail: "https://img.youtube.com/vi/CCF1_jI558g/hqdefault.jpg" },
    { videoId: "7zp1TbLFPp8", title: "Danza Kuduro", artist: "Don Omar", startTime: 30, thumbnail: "https://img.youtube.com/vi/7zp1TbLFPp8/hqdefault.jpg" }
  ],
  "Metal": [
    { videoId: "CD-E-LDc384", title: "Enter Sandman", artist: "Metallica", startTime: 50, thumbnail: "https://img.youtube.com/vi/CD-E-LDc384/hqdefault.jpg" },
    { videoId: "CSvFpBOe8eY", title: "Chop Suey!", artist: "System Of A Down", startTime: 40, thumbnail: "https://img.youtube.com/vi/CSvFpBOe8eY/hqdefault.jpg" },
    { videoId: "W3q8Od5qJio", title: "Du Hast", artist: "Rammstein", startTime: 40, thumbnail: "https://img.youtube.com/vi/W3q8Od5qJio/hqdefault.jpg" },
    { videoId: "6fVE8kSM43I", title: "Duality", artist: "Slipknot", startTime: 35, thumbnail: "https://img.youtube.com/vi/6fVE8kSM43I/hqdefault.jpg" },
    { videoId: "uk_wUT139qc", title: "Paranoid", artist: "Black Sabbath", startTime: 20, thumbnail: "https://img.youtube.com/vi/uk_wUT139qc/hqdefault.jpg" }
  ],
  "Synthpop 80s": [
    { videoId: "djV11Xbc914", title: "Take On Me", artist: "A-ha", startTime: 30, thumbnail: "https://img.youtube.com/vi/djV11Xbc914/hqdefault.jpg" },
    { videoId: "Zi_XLOBDo_Y", title: "Billie Jean", artist: "Michael Jackson", startTime: 35, thumbnail: "https://img.youtube.com/vi/Zi_XLOBDo_Y/hqdefault.jpg" },
    { videoId: "qeMFqkcPYcg", title: "Sweet Dreams", artist: "Eurythmics", startTime: 20, thumbnail: "https://img.youtube.com/vi/qeMFqkcPYcg/hqdefault.jpg" },
    { videoId: "dQw4w9WgXcQ", title: "Never Gonna Give You Up", artist: "Rick Astley", startTime: 18, thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg" },
    { videoId: "pIgZ7gMze7A", title: "Wake Me Up Before You Go-Go", artist: "Wham!", startTime: 25, thumbnail: "https://img.youtube.com/vi/pIgZ7gMze7A/hqdefault.jpg" }
  ],
  "Acoustic": [
    { videoId: "lp-EO5I60KA", title: "Thinking Out Loud", artist: "Ed Sheeran", startTime: 40, thumbnail: "https://img.youtube.com/vi/lp-EO5I60KA/hqdefault.jpg" },
    { videoId: "uJ_1HMAGb4k", title: "Riptide", artist: "Vance Joy", startTime: 25, thumbnail: "https://img.youtube.com/vi/uJ_1HMAGb4k/hqdefault.jpg" },
    { videoId: "RBumgq5yVrA", title: "Let Her Go", artist: "Passenger", startTime: 35, thumbnail: "https://img.youtube.com/vi/RBumgq5yVrA/hqdefault.jpg" },
    { videoId: "zABLecsR5UE", title: "Someone You Loved", artist: "Lewis Capaldi", startTime: 40, thumbnail: "https://img.youtube.com/vi/zABLecsR5UE/hqdefault.jpg" },
    { videoId: "zvCBSS5upgg", title: "Ho Hey", artist: "The Lumineers", startTime: 20, thumbnail: "https://img.youtube.com/vi/zvCBSS5upgg/hqdefault.jpg" }
  ],
  "Lo-Fi": [
    { videoId: "jfKfPfyJRdk", title: "Lofi Hip Hop Radio Beat", artist: "Lofi Girl", startTime: 20, thumbnail: "https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg" },
    { videoId: "TURbeWK2wwg", title: "Affection", artist: "Jinsang", startTime: 15, thumbnail: "https://img.youtube.com/vi/TURbeWK2wwg/hqdefault.jpg" },
    { videoId: "d_3F_8aZJ5A", title: "The Girl I Haven't Met", artist: "Kudasaibeats", startTime: 20, thumbnail: "https://img.youtube.com/vi/d_3F_8aZJ5A/hqdefault.jpg" }
  ]
};

/**
 * Fetch a song clip for the specified genre.
 * Selects from curated world-famous hits or searches YouTube Data API ordered by views.
 */
export async function fetchSongForGenre(genre) {
  const normalizedGenre = Object.keys(CURATED_SONGS).find(
    g => g.toLowerCase() === (genre || '').toLowerCase()
  ) || "Pop";

  const fallbackList = CURATED_SONGS[normalizedGenre] || CURATED_SONGS["Pop"];
  const defaultSong = fallbackList[Math.floor(Math.random() * fallbackList.length)];

  // Always prefer our curated high-quality tracks with precise chorus timestamps
  // If random check or API search is desired:
  if (!API_KEY || API_KEY === 'YOUR_YOUTUBE_API_KEY' || Math.random() < 0.75) {
    return { ...defaultSong, genre: normalizedGenre, duration: 10 };
  }

  try {
    const query = `${normalizedGenre} greatest hits official music video`;
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoEmbeddable=true&videoSyndicated=true&videoCategoryId=10&order=viewCount&maxResults=10&key=${API_KEY}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      return { ...defaultSong, genre: normalizedGenre, duration: 10 };
    }

    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      return { ...defaultSong, genre: normalizedGenre, duration: 10 };
    }

    // Pick from top viewed search results
    const item = data.items[Math.floor(Math.random() * Math.min(5, data.items.length))];
    const rawTitle = item.snippet.title || normalizedGenre;
    
    // Clean up title (remove &quot; etc)
    const parser = new DOMParser();
    const cleanTitle = parser.parseFromString(rawTitle, 'text/html').body.textContent || rawTitle;

    return {
      videoId: item.id.videoId,
      title: cleanTitle,
      artist: item.snippet.channelTitle || 'Artist',
      thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || defaultSong.thumbnail,
      genre: normalizedGenre,
      startTime: 30, // Start around the main hook
      duration: 10
    };
  } catch (err) {
    console.error("YouTube search error:", err);
    return { ...defaultSong, genre: normalizedGenre, duration: 10 };
  }
}

