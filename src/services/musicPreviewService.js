// Music Preview Service using ~30s SoundCloud / Music Previews (Zero Geo-Blocking, Direct Audio Streams)

export const CURATED_PREVIEW_SONGS = {
  "Pop": [
    {
      title: "Blinding Lights",
      artist: "The Weeknd",
      preview_url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/12/73/ca/1273ca46-233a-5331-189b-25ac1d656533/mzaf_976341070785891411.plus.aac.p.m4a",
      thumbnail: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/61/e7/3f/61e73f94-018d-5f50-50ec-8521952bc72e/20UM1IM11629.rgb.jpg/600x600bb.jpg",
      genre: "Pop",
      duration: 30
    },
    {
      title: "Shape of You",
      artist: "Ed Sheeran",
      preview_url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/28/7f/0f/287f0f7c-7201-1433-21c6-a67b4b10b06b/mzaf_6702651478229676694.plus.aac.p.m4a",
      thumbnail: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/eb/05/bb/eb05bb43-be76-ee32-fc20-00d3a77610fa/190295851286.jpg/600x600bb.jpg",
      genre: "Pop",
      duration: 30
    },
    {
      title: "Levitating",
      artist: "Dua Lipa",
      preview_url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/65/d6/ee/65d6ee49-163f-bc26-2911-37d404987fe8/mzaf_1130635176189913697.plus.aac.p.m4a",
      thumbnail: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/aa/76/b5aa7695-ae77-b99f-7a41-e23a48e77a28/190295171735.jpg/600x600bb.jpg",
      genre: "Pop",
      duration: 30
    },
    {
      title: "Uptown Funk (feat. Bruno Mars)",
      artist: "Mark Ronson",
      preview_url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/91/3d/cf/913dcf50-8b06-df6b-bfa1-df07a0c4f8ea/mzaf_18342732955986873551.plus.aac.p.m4a",
      thumbnail: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/64/46/7d/64467d02-1262-e6e7-1422-77169a6b1076/886444933902.jpg/600x600bb.jpg",
      genre: "Pop",
      duration: 30
    }
  ],
  "Rock": [
    {
      title: "Bohemian Rhapsody",
      artist: "Queen",
      preview_url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/17/fc/1e/17fc1eba-946d-84a9-710b-a0e88ea64209/mzaf_3049006317693088799.plus.aac.p.m4a",
      thumbnail: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/8b/0a/ea/8b0aea60-6f4a-195b-5958-cdf459c2333b/602527644271.jpg/600x600bb.jpg",
      genre: "Rock",
      duration: 30
    },
    {
      title: "Smells Like Teen Spirit",
      artist: "Nirvana",
      preview_url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/65/58/1a/65581a0e-4ff6-9dbd-bb3e-79013bbce7ce/mzaf_11849842472719223798.plus.aac.p.m4a",
      thumbnail: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/33/c1/98/33c19864-4e2b-ffbc-980b-93ffba59ef17/00602527779089.rgb.jpg/600x600bb.jpg",
      genre: "Rock",
      duration: 30
    },
    {
      title: "In the End",
      artist: "LINKIN PARK",
      preview_url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/d9/33/34/d933341d-ba95-dc3b-11a3-34d6632dd62e/mzaf_10942671303595386057.plus.aac.p.m4a",
      thumbnail: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/53/a7/7f/53a77fab-c54c-a57b-8130-248fc12d0c80/093624948995.jpg/600x600bb.jpg",
      genre: "Rock",
      duration: 30
    }
  ],
  "Hip-Hop": [
    {
      title: "HUMBLE.",
      artist: "Kendrick Lamar",
      preview_url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/1f/2e/37/1f2e37be-bdd0-d770-6ea4-091011a6aade/mzaf_2360827885900940865.plus.aac.p.m4a",
      thumbnail: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/ab/16/ef/ab16efe9-e7f1-66ec-021c-5592a23f0f9e/17UMGIM88793.rgb.jpg/600x600bb.jpg",
      genre: "Hip-Hop",
      duration: 30
    },
    {
      title: "God's Plan",
      artist: "Drake",
      preview_url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/c6/4a/be/c64abe74-adb4-cff5-005d-0fab3d72a806/mzaf_10276154697254415719.plus.aac.p.m4a",
      thumbnail: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/bb/6d/8f/bb6d8f67-6d04-10b5-dd62-eb5809ac54fc/00602567879152.rgb.jpg/600x600bb.jpg",
      genre: "Hip-Hop",
      duration: 30
    },
    {
      title: "SICKO MODE",
      artist: "Travis Scott",
      preview_url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/d3/91/a1/d391a141-256f-726f-9da1-8aa4e42b3236/mzaf_17761183103753218003.plus.aac.p.m4a",
      thumbnail: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/e7/49/8f/e7498f65-df8f-bead-d6e3-2a8d4d642a79/886447235317.jpg/600x600bb.jpg",
      genre: "Hip-Hop",
      duration: 30
    }
  ],
  "EDM": [
    {
      title: "Levels",
      artist: "Avicii",
      preview_url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/66/dc/bd/66dcbd68-b557-bdfd-f2c2-a05491758783/mzaf_13654489760720011690.plus.aac.p.m4a",
      thumbnail: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/67/38/43/67384338-9ed7-fc68-5927-93f1fcf4705d/11UMGIM36900.rgb.jpg/600x600bb.jpg",
      genre: "EDM",
      duration: 30
    },
    {
      title: "Titanium (feat. Sia)",
      artist: "David Guetta",
      preview_url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/45/dd/8f/45dd8ffc-0164-1f70-c53d-bf91a1d80b1a/mzaf_3092057092144618662.plus.aac.p.m4a",
      thumbnail: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/99/b4/7b/99b47bd8-2b22-e1ef-2e60-c5147f27a861/dj.thrvmjqj.jpg/600x600bb.jpg",
      genre: "EDM",
      duration: 30
    }
  ],
  "Trap": [
    {
      title: "Mask Off",
      artist: "Future",
      preview_url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/32/a1/e1/32a1e159-c6d9-534c-c804-decbabc123b3/mzaf_17669400031547555255.plus.aac.p.m4a",
      thumbnail: "https://is1-ssl.mzstatic.com/image/thumb/Music127/v4/f9/10/59/f9105950-7370-e2ac-20b5-f82b9ccdc593/886446559476.jpg/600x600bb.jpg",
      genre: "Trap",
      duration: 30
    },
    {
      title: "Lucid Dreams",
      artist: "Juice WRLD",
      preview_url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/9c/cb/87/9ccb87b5-cfd0-a77c-94fb-fe6fa124bcef/mzaf_7202917834670087023.plus.aac.p.m4a",
      thumbnail: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/75/9b/af/759baf5f-f3c9-b8c7-d3cf-55a3079914b9/18UMGIM24792.rgb.jpg/600x600bb.jpg",
      genre: "Trap",
      duration: 30
    }
  ],
  "Reggaeton": [
    {
      title: "Despacito",
      artist: "Luis Fonsi & Daddy Yankee",
      preview_url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/0d/cb/ec/0dcbec41-5e9e-bd09-7cdd-fdff44acdf78/mzaf_17345185466754008149.plus.aac.p.m4a",
      thumbnail: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/e2/ef/f0/e2eff0bc-c51d-7de5-9280-6891ddcee71b/18UMGIM85289.rgb.jpg/600x600bb.jpg",
      genre: "Reggaeton",
      duration: 30
    },
    {
      title: "Mi Gente",
      artist: "J Balvin & Willy William",
      preview_url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/de/bf/1f/debf1ffb-3440-93ce-b0a8-1477874a2419/mzaf_16600081962078547731.plus.aac.p.m4a",
      thumbnail: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/43/23/44/43234493-859a-53f6-e31c-805370dc33d7/18UMGIM19841.rgb.jpg/600x600bb.jpg",
      genre: "Reggaeton",
      duration: 30
    }
  ],
  "Metal": [
    {
      title: "Enter Sandman",
      artist: "Metallica",
      preview_url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/53/8a/fc/538afc1c-b9cd-24ab-b401-2fa8c81abc46/mzaf_3160131754964321707.plus.aac.p.m4a",
      thumbnail: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/2e/94/95/2e9495d7-dfe3-ddc8-87ef-6ef797a60218/850007452056.png/600x600bb.jpg",
      genre: "Metal",
      duration: 30
    },
    {
      title: "Chop Suey!",
      artist: "System Of A Down",
      preview_url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/99/1f/74/991f74a5-0f17-bf20-7c10-7150ccb452de/mzaf_6639234409564144843.plus.aac.p.m4a",
      thumbnail: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/82/51/52/825152b4-9423-b23b-c036-cc67ead732d4/888888046775.jpg/600x600bb.jpg",
      genre: "Metal",
      duration: 30
    }
  ],
  "Synthpop 80s": [
    {
      title: "Take On Me",
      artist: "a-ha",
      preview_url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/f2/03/4f/f2034f41-707f-7111-bc63-e5d3cf7f2240/mzaf_17215043934336702540.plus.aac.p.m4a",
      thumbnail: "https://is1-ssl.mzstatic.com/image/thumb/Music/c6/e1/c8/mzi.ixgzfcmc.jpg/600x600bb.jpg",
      genre: "Synthpop 80s",
      duration: 30
    },
    {
      title: "Billie Jean",
      artist: "Michael Jackson",
      preview_url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/dc/bc/8a/dcbc8a3e-4ce1-c00d-cc02-eda2212053c7/mzaf_8347559338388601510.plus.aac.p.m4a",
      thumbnail: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/32/4f/fd/324ffda2-9e51-8f6a-0c2d-c6fd2b41ac55/074643811224.jpg/600x600bb.jpg",
      genre: "Synthpop 80s",
      duration: 30
    }
  ],
  "Acoustic": [
    {
      title: "Thinking Out Loud",
      artist: "Ed Sheeran",
      preview_url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/78/a5/f2/78a5f25e-ad1b-718d-82ad-b82e676c1855/mzaf_6133970271589343093.plus.aac.p.m4a",
      thumbnail: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2d/36/f9/2d36f9a7-2c3e-ce0f-7fb6-036feecb221f/825646974450.jpg/600x600bb.jpg",
      genre: "Acoustic",
      duration: 30
    },
    {
      title: "Riptide",
      artist: "Vance Joy",
      preview_url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/1e/de/ea/1edeea50-c0f4-9d95-f0b8-b23a1af561db/mzaf_6343110017276582270.plus.aac.p.m4a",
      thumbnail: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/7a/1c/65/7a1c6571-34e9-bb77-32be-90c72ba003c0/075679920355.jpg/600x600bb.jpg",
      genre: "Acoustic",
      duration: 30
    }
  ],
  "Lo-Fi": [
    {
      title: "with the right people",
      artist: "Trix. & fnonose",
      preview_url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/a5/b2/cf/a5b2cf72-7e63-7088-cc53-9f897efaf306/mzaf_14222483314913923954.plus.aac.p.m4a",
      thumbnail: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/fd/b8/f6/fdb8f625-96bd-b3ac-aaa2-9e8794cd4968/1963624956759_cover.jpg/600x600bb.jpg",
      genre: "Lo-Fi",
      duration: 30
    }
  ]
};

// Aliases for compatibility
export const CURATED_SONGS = CURATED_PREVIEW_SONGS;

/**
 * Fetch a 30-second audio preview clip for the specified genre.
 * Selects from curated world-famous hits or queries live music preview APIs without geo-blocking.
 */
export async function fetchSongForGenre(genre) {
  const normalizedGenre = Object.keys(CURATED_PREVIEW_SONGS).find(
    g => g.toLowerCase() === (genre || '').toLowerCase()
  ) || "Pop";

  const fallbackList = CURATED_PREVIEW_SONGS[normalizedGenre] || CURATED_PREVIEW_SONGS["Pop"];
  const defaultSong = fallbackList[Math.floor(Math.random() * fallbackList.length)];

  // 75% of the time, use our curated high-resolution hits
  if (Math.random() < 0.75) {
    return {
      ...defaultSong,
      previewUrl: defaultSong.preview_url,
      genre: normalizedGenre,
      duration: 30
    };
  }

  // Live query preview API for diversity
  try {
    const query = `${normalizedGenre} hits`;
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=10`;
    
    const response = await fetch(url);
    if (!response.ok) {
      return { ...defaultSong, previewUrl: defaultSong.preview_url, genre: normalizedGenre, duration: 30 };
    }

    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      return { ...defaultSong, previewUrl: defaultSong.preview_url, genre: normalizedGenre, duration: 30 };
    }

    // Filter tracks that contain a valid previewUrl
    const validTracks = data.results.filter(t => Boolean(t.previewUrl));
    if (validTracks.length === 0) {
      return { ...defaultSong, previewUrl: defaultSong.preview_url, genre: normalizedGenre, duration: 30 };
    }

    const item = validTracks[Math.floor(Math.random() * validTracks.length)];
    const highResArtwork = item.artworkUrl100?.replace('100x100bb', '600x600bb') || defaultSong.thumbnail;

    return {
      title: item.trackName || defaultSong.title,
      artist: item.artistName || defaultSong.artist,
      preview_url: item.previewUrl,
      previewUrl: item.previewUrl,
      thumbnail: highResArtwork,
      genre: normalizedGenre,
      duration: 30
    };
  } catch (err) {
    console.error("Music preview fetch error:", err);
    return { ...defaultSong, previewUrl: defaultSong.preview_url, genre: normalizedGenre, duration: 30 };
  }
}
