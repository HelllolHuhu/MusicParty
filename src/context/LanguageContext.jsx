import { createContext, useContext, useState, useMemo, useCallback } from 'react';

export const LANGUAGES = [
  { code: 'en', label: 'EN', flag: '🇬🇧', name: 'English' },
  { code: 'sk', label: 'SK', flag: '🇸🇰', name: 'Slovenčina' },
  { code: 'es', label: 'ES', flag: '🇪🇸', name: 'Español' },
  { code: 'de', label: 'DE', flag: '🇩🇪', name: 'Deutsch' },
];

export const TRANSLATIONS = {
  en: {
    // Character Creator
    "creator.title": "Character Appearance",
    "creator.enterName": "Enter name...",
    "creator.randomize": "Randomize",
    "creator.randomTooltip": "Random avatar and name",
    "creator.style": "Type / Style:",
    "creator.color": "Color",
    "creator.customColor": "Custom color",
    "creator.tab.head": "Head",
    "creator.tab.hair": "Hair",
    "creator.tab.eyes": "Eyes",
    "creator.tab.beard": "Beard",
    "creator.tab.accessory": "Accessories",
    "creator.part.head_1": "Round",
    "creator.part.head_2": "Square",
    "creator.part.head_3": "Heart / Oval",
    "creator.part.hair_none": "Bald",
    "creator.part.hair_1": "Quiff / Spiky",
    "creator.part.hair_2": "Afro / Curls",
    "creator.part.hair_3": "Mohawk / Punk",
    "creator.part.eyes_1": "Classic",
    "creator.part.eyes_2": "Chill",
    "creator.part.eyes_3": "Sparkle (Anime)",
    "creator.part.beard_none": "Clean Shaven",
    "creator.part.beard_1": "Full Beard",
    "creator.part.beard_2": "Goatee",
    "creator.part.beard_3": "Mustache",
    "creator.part.acc_none": "None",
    "creator.part.acc_1": "Sunglasses",
    "creator.part.acc_2": "DJ Headphones",
    "creator.part.acc_3": "Gold Chain",

    // Lobby
    "lobby.newGame": "New Game",
    "lobby.createRoom": "Create Room",
    "lobby.joinGame": "Join Game",
    "lobby.roomCode": "CODE",
    "lobby.go": "Go!",
    "lobby.enterNameError": "Please enter your name!",
    "lobby.enterRoomError": "Please enter room code!",
    "lobby.roomNotFound": "Room does not exist!",
    "lobby.roomFull": "Room is full!",
    "lobby.kickedAlert": "You were kicked from the room!",
    "lobby.need2Players": "At least 2 players are needed to start the game!",
    "lobby.startGame": "🚀 Start Game!",
    "lobby.waitingPlayers": "Waiting for players...",
    "lobby.waitingHost": "Waiting for host...",
    "lobby.unknown": "Unknown",
    "lobby.dbError": "Database write error: ",

    // Join Code Box
    "joinCode.inviteFriends": "Invite Friends",
    "joinCode.copied": "Copied!",
    "joinCode.copyInviteLink": "Copy invite link",

    // Player List
    "playerList.players": "Players",
    "playerList.you": "You",
    "playerList.host": "Host",
    "playerList.kick": "KICK",
    "playerList.kickConfirm": "Are you sure you want to kick this player?",
    "playerList.emptySlot": "Empty slot...",

    // Lobby Settings
    "settings.title": "Game Settings",
    "settings.hostOnly": "Host Only",
    "settings.maxPlayers": "Max Players",
    "settings.timeMinutes": "Creation Time",
    "settings.genres": "Music Genres (random pick)",

    // Game Phase & Studio
    "game.genre": "Genre:",
    "game.yourGenre": "Your Genre",
    "game.partyVibes": "120 BPM • Party Vibes",
    "game.letsGo": "Let's Go!",
    "game.soundLibrary": "Sound Library",
    "game.finishTrack": "Finish Track",
    "game.trackSavedAlert": "Track saved! Wait for others.",
    "game.allowMic": "Please allow microphone access!",
    "game.vocalTake": "Vocal Take",

    // Presentation Phase
    "presentation.nowPresenting": "Now Presenting",
    "presentation.yourTurn": "YOUR TURN!",
    "presentation.style": "Style:",
    "presentation.rating": "Rating",
    "presentation.voteRecorded": "Vote recorded!",
    "presentation.othersListening": "Everyone is listening to your track!",
    "presentation.playTrack": "Play Song",
    "presentation.pauseTrack": "Pause",
    "presentation.replayTrack": "Replay",
    "presentation.nextTrack": "Next Song ⏭",
    "presentation.finishPresentation": "Finish & View Results 🏆",
    "presentation.waitingHostPlay": "Waiting for host to play...",
    "presentation.nowPlaying": "Now Playing 🎵",
    "presentation.trackOf": "Track",
    "presentation.of": "of",

    // Results
    "results.roundResults": "Round Results",
    "results.gameOver": "Game Over!",
    "results.votes": "votes",
    "results.nextRound": "Next Round",
    "results.endGame": "End Game",
    "results.returnToLobby": "🎮 Return to Lobby",
    "results.waitingHostLobby": "Waiting for host to return to lobby...",
    "results.viewLeaderboard": "🏆 Final Scores",
    "results.backToMenu": "Back to Menu",

    "lobby.leaveParty": "Leave Party",
    "lobby.disbandParty": "Disband Party",
    "lobby.confirmLeave": "Confirm Leave?",
    "lobby.confirmDisband": "Confirm Disband?",
    "lobby.leaveConfirm": "Are you sure you want to leave the party?",
    "lobby.disbandConfirm": "Are you sure you want to DISBAND this party for all players?",
    "lobby.disbandedAlert": "The party was disbanded by the host.",
    "countdown.title": "Game Starting",
    "countdown.getReady": "GET READY!",
    "songPreview.title": "Inspiration Track",
    "songPreview.subtitle": "30-Second Song Clip",
    "songPreview.skip": "Start Making Music",
    "songPreview.unmute": "Click for Audio",

    // Theme & Navbar
    "navbar.logo": "Music Party",
    "theme.label": "Theme",
    "theme.mantis": "Mantis",
    "theme.asphalt": "Asphalt",
    "theme.rose": "Rose",
    "lang.label": "Language",
  },
  sk: {
    // Character Creator
    "creator.title": "Vzhľad Postavy",
    "creator.enterName": "Zadaj meno...",
    "creator.randomize": "Náhodne",
    "creator.randomTooltip": "Náhodný avatar a meno",
    "creator.style": "Typ / Štýl:",
    "creator.color": "Farba",
    "creator.customColor": "Vlastná farba",
    "creator.tab.head": "Hlava",
    "creator.tab.hair": "Vlasy",
    "creator.tab.eyes": "Oči",
    "creator.tab.beard": "Brada",
    "creator.tab.accessory": "Doplnky",
    "creator.part.head_1": "Okrúhla",
    "creator.part.head_2": "Hranatá",
    "creator.part.head_3": "Oválna / Špicatá",
    "creator.part.hair_none": "Bez vlasov",
    "creator.part.hair_1": "Quiff / Spiky",
    "creator.part.hair_2": "Afro / Kučery",
    "creator.part.hair_3": "Mohawk / Punk",
    "creator.part.eyes_1": "Klasické",
    "creator.part.eyes_2": "Pohodové",
    "creator.part.eyes_3": "Iskrivé (Anime)",
    "creator.part.beard_none": "Oholený",
    "creator.part.beard_1": "Plná brada",
    "creator.part.beard_2": "Kozia briadka",
    "creator.part.beard_3": "Fúzy",
    "creator.part.acc_none": "Žiadny",
    "creator.part.acc_1": "Okuliare",
    "creator.part.acc_2": "DJ Slúchadlá",
    "creator.part.acc_3": "Zlatá reťaz",

    // Lobby
    "lobby.newGame": "Nová Hra",
    "lobby.createRoom": "Vytvoriť Miestnosť",
    "lobby.joinGame": "Pripojiť sa",
    "lobby.roomCode": "KÓD",
    "lobby.go": "Go!",
    "lobby.enterNameError": "Zadaj svoje meno!",
    "lobby.enterRoomError": "Zadaj kód miestnosti!",
    "lobby.roomNotFound": "Miestnosť neexistuje!",
    "lobby.roomFull": "Miestnosť je plná!",
    "lobby.kickedAlert": "Bol si vykopnutý z miestnosti!",
    "lobby.need2Players": "Na spustenie hry sú potrební aspoň 2 hráči!",
    "lobby.startGame": "🚀 Start Game!",
    "lobby.waitingPlayers": "Čaká sa na hráčov...",
    "lobby.waitingHost": "Čaká sa na hosta...",
    "lobby.unknown": "Neznámy",
    "lobby.dbError": "Chyba pri zápise do databázy: ",

    // Join Code Box
    "joinCode.inviteFriends": "Pozvi Kamošov",
    "joinCode.copied": "Skopírované!",
    "joinCode.copyInviteLink": "Kopírovať invite link",

    // Player List
    "playerList.players": "Hráči",
    "playerList.you": "Ty",
    "playerList.host": "Host",
    "playerList.kick": "KICK",
    "playerList.kickConfirm": "Naozaj chceš vykopnúť tohto hráča?",
    "playerList.emptySlot": "Voľné miesto...",

    // Lobby Settings
    "settings.title": "Nastavenia Hry",
    "settings.hostOnly": "Iba Host",
    "settings.maxPlayers": "Max Hráčov",
    "settings.timeMinutes": "Čas na tvorbu",
    "settings.genres": "Hudobné Žánre (losuje sa)",

    // Game Phase & Studio
    "game.genre": "Žáner:",
    "game.yourGenre": "Tvoj Žáner",
    "game.partyVibes": "120 BPM • Party Vibes",
    "game.letsGo": "Ideme na to!",
    "game.soundLibrary": "Zvuková Knižnica",
    "game.finishTrack": "Dokončiť Track",
    "game.trackSavedAlert": "Track uložený! Čakaj na ostatných.",
    "game.allowMic": "Povoľ mikrofón!",
    "game.vocalTake": "Vocal Take",

    // Presentation Phase
    "presentation.nowPresenting": "Teraz prezentuje",
    "presentation.yourTurn": "TVOJ RAD!",
    "presentation.style": "Štýl:",
    "presentation.rating": "Hodnotenie",
    "presentation.voteRecorded": "Hlas zaznamenaný!",
    "presentation.othersListening": "Ostatní práve počúvajú tvoj výtvor!",
    "presentation.playTrack": "Prehrať Skladbu",
    "presentation.pauseTrack": "Pozastaviť",
    "presentation.replayTrack": "Znova",
    "presentation.nextTrack": "Ďalšia Skladba ⏭",
    "presentation.finishPresentation": "Koniec & Zobraziť Výsledky 🏆",
    "presentation.waitingHostPlay": "Čaká sa na hostiteľa pre prehratie...",
    "presentation.nowPlaying": "Práve hrá 🎵",
    "presentation.trackOf": "Skladba",
    "presentation.of": "z",

    // Results
    "results.roundResults": "Výsledky Kola",
    "results.gameOver": "Koniec Hry!",
    "results.votes": "hlasov",
    "results.nextRound": "Ďalšie Kolo",
    "results.endGame": "Ukončiť Hru",
    "results.returnToLobby": "🎮 Návrat do Lobby",
    "results.waitingHostLobby": "Čaká sa na hostiteľa na návrat do lobby...",
    "results.viewLeaderboard": "🏆 Konečné Skóre",
    "results.backToMenu": "Späť do Menu",

    // Theme & Navbar
    "navbar.logo": "Music Party",
    "theme.label": "Téma",
    "theme.mantis": "Mantis",
    "theme.asphalt": "Asfalt",
    "theme.rose": "Ružová",
    "lang.label": "Jazyk",

    "lobby.leaveParty": "Opustiť Párty",
    "lobby.disbandParty": "Zrušiť Párty",
    "lobby.confirmLeave": "Potvrdiť Odchod?",
    "lobby.confirmDisband": "Potvrdiť Zrušenie?",
    "lobby.leaveConfirm": "Naozaj chceš opustiť párty?",
    "lobby.disbandConfirm": "Naozaj chceš ZRUŠIŤ párty pre všetkých hráčov?",
    "lobby.disbandedAlert": "Párty bola zrušená hostiteľom.",
    "countdown.title": "Hra začína",
    "countdown.getReady": "PRIPRAV SA!",
    "songPreview.title": "Inšpiratívna Skladba",
    "songPreview.subtitle": "30-sekundová ukážka",
    "songPreview.skip": "Začať tvoriť hudbu",
    "songPreview.unmute": "Klikni pre zvuk",
  },
  es: {
    // Character Creator
    "creator.title": "Aspecto del Personaje",
    "creator.enterName": "Ingresa nombre...",
    "creator.randomize": "Aleatorio",
    "creator.randomTooltip": "Avatar y nombre aleatorio",
    "creator.style": "Tipo / Estilo:",
    "creator.color": "Color",
    "creator.customColor": "Color personalizado",
    "creator.tab.head": "Cabeza",
    "creator.tab.hair": "Pelo",
    "creator.tab.eyes": "Ojos",
    "creator.tab.beard": "Barba",
    "creator.tab.accessory": "Accesorios",
    "creator.part.head_1": "Redonda",
    "creator.part.head_2": "Cuadrada",
    "creator.part.head_3": "Ovalada",
    "creator.part.hair_none": "Calvo",
    "creator.part.hair_1": "Tupé / Picos",
    "creator.part.hair_2": "Afro / Rizos",
    "creator.part.hair_3": "Cresta",
    "creator.part.eyes_1": "Clásicos",
    "creator.part.eyes_2": "Relajados",
    "creator.part.eyes_3": "Brillantes",
    "creator.part.beard_none": "Afeitado",
    "creator.part.beard_1": "Barba Completa",
    "creator.part.beard_2": "Perilla",
    "creator.part.beard_3": "Bigote",
    "creator.part.acc_none": "Ninguno",
    "creator.part.acc_1": "Gafas de Sol",
    "creator.part.acc_2": "Auriculares DJ",
    "creator.part.acc_3": "Cadena de Oro",

    // Lobby
    "lobby.newGame": "Nueva Partida",
    "lobby.createRoom": "Crear Sala",
    "lobby.joinGame": "Unirse",
    "lobby.roomCode": "CÓDIGO",
    "lobby.go": "¡Ir!",
    "lobby.enterNameError": "¡Por favor ingresa tu nombre!",
    "lobby.enterRoomError": "¡Por favor ingresa el código!",
    "lobby.roomNotFound": "¡La sala no existe!",
    "lobby.roomFull": "¡La sala está llena!",
    "lobby.kickedAlert": "¡Fuiste expulsado de la sala!",
    "lobby.need2Players": "¡Se necesitan al menos 2 jugadores!",
    "lobby.startGame": "🚀 ¡Comenzar!",
    "lobby.waitingPlayers": "Esperando jugadores...",
    "lobby.waitingHost": "Esperando al anfitrión...",
    "lobby.unknown": "Desconocido",
    "lobby.dbError": "Error de base de datos: ",

    // Join Code Box
    "joinCode.inviteFriends": "Invitar Amigos",
    "joinCode.copied": "¡Copiado!",
    "joinCode.copyInviteLink": "Copiar enlace",

    // Player List
    "playerList.players": "Jugadores",
    "playerList.you": "Tú",
    "playerList.host": "Anfitrión",
    "playerList.kick": "EXPULSAR",
    "playerList.kickConfirm": "¿Seguro que deseas expulsar a este jugador?",
    "playerList.emptySlot": "Espacio vacío...",

    // Lobby Settings
    "settings.title": "Ajustes de Partida",
    "settings.hostOnly": "Solo Anfitrión",
    "settings.maxPlayers": "Máx. Jugadores",
    "settings.timeMinutes": "Tiempo de Creación",
    "settings.genres": "Géneros Musicales (aleatorio)",

    // Game Phase & Studio
    "game.genre": "Género:",
    "game.yourGenre": "Tu Género",
    "game.partyVibes": "120 BPM • Modo Fiesta",
    "game.letsGo": "¡Vamos!",
    "game.soundLibrary": "Biblioteca de Sonidos",
    "game.finishTrack": "Terminar Pista",
    "game.trackSavedAlert": "¡Pista guardada! Espera a los demás.",
    "game.allowMic": "¡Por favor permite el acceso al micrófono!",
    "game.vocalTake": "Toma Vocal",

    // Presentation Phase
    "presentation.nowPresenting": "Presentando ahora",
    "presentation.yourTurn": "¡TU TURNO!",
    "presentation.style": "Estilo:",
    "presentation.rating": "Valoración",
    "presentation.voteRecorded": "¡Voto guardado!",
    "presentation.othersListening": "¡Todos están escuchando tu creación!",
    "presentation.playTrack": "Reproducir Canción",
    "presentation.pauseTrack": "Pausar",
    "presentation.replayTrack": "Repetir",
    "presentation.nextTrack": "Siguiente Canción ⏭",
    "presentation.finishPresentation": "Terminar y Ver Resultados 🏆",
    "presentation.waitingHostPlay": "Esperando al anfitrión para reproducir...",
    "presentation.nowPlaying": "Reproduciendo ahora 🎵",
    "presentation.trackOf": "Pista",
    "presentation.of": "de",

    // Results
    "results.roundResults": "Resultados de Ronda",
    "results.gameOver": "¡Fin del Juego!",
    "results.votes": "votos",
    "results.nextRound": "Siguiente Ronda",
    "results.endGame": "Terminar Juego",
    "results.returnToLobby": "🎮 Volver a la Sala",
    "results.waitingHostLobby": "Esperando al anfitrión para volver a la sala...",
    "results.viewLeaderboard": "🏆 Puntuaciones Finales",
    "results.backToMenu": "Volver al Menú",

    // Theme & Navbar
    "navbar.logo": "Music Party",
    "theme.label": "Tema",
    "theme.mantis": "Mantis",
    "theme.asphalt": "Asfalto",
    "theme.rose": "Rosa",
    "lang.label": "Idioma",

    "lobby.leaveParty": "Salir de la Sala",
    "lobby.disbandParty": "Disolver Sala",
    "lobby.confirmLeave": "¿Confirmar Salir?",
    "lobby.confirmDisband": "¿Confirmar Disolver?",
    "lobby.leaveConfirm": "¿Estás seguro de que quieres salir del grupo?",
    "lobby.disbandConfirm": "¿Estás seguro de que deseas DISOLVER esta sala para todos los jugadores?",
    "lobby.disbandedAlert": "La sala fue disuelta por el anfitrión.",
    "countdown.title": "El juego comienza",
    "countdown.getReady": "¡PREPÁRATE!",
    "songPreview.title": "Pista de Inspiración",
    "songPreview.subtitle": "Clip de canción de 30 segundos",
    "songPreview.skip": "Empezar a crear música",
    "songPreview.unmute": "Clic para audio",
  },
  de: {
    // Character Creator
    "creator.title": "Charakter-Aussehen",
    "creator.enterName": "Name eingeben...",
    "creator.randomize": "Zufällig",
    "creator.randomTooltip": "Zufälliger Avatar & Name",
    "creator.style": "Typ / Stil:",
    "creator.color": "Farbe",
    "creator.customColor": "Eigene Farbe",
    "creator.tab.head": "Kopf",
    "creator.tab.hair": "Haare",
    "creator.tab.eyes": "Augen",
    "creator.tab.beard": "Bart",
    "creator.tab.accessory": "Zubehör",
    "creator.part.head_1": "Rund",
    "creator.part.head_2": "Eckig",
    "creator.part.head_3": "Oval / Herz",
    "creator.part.hair_none": "Kahl",
    "creator.part.hair_1": "Tolle / Stachelig",
    "creator.part.hair_2": "Afro / Locken",
    "creator.part.hair_3": "Irokesenschnitt",
    "creator.part.eyes_1": "Klassisch",
    "creator.part.eyes_2": "Entspannt",
    "creator.part.eyes_3": "Funkelnd (Anime)",
    "creator.part.beard_none": "Glattrasiert",
    "creator.part.beard_1": "Vollbart",
    "creator.part.beard_2": "Ziegenbart",
    "creator.part.beard_3": "Schnurrbart",
    "creator.part.acc_none": "Keins",
    "creator.part.acc_1": "Sonnenbrille",
    "creator.part.acc_2": "DJ-Kopfhörer",
    "creator.part.acc_3": "Goldkette",

    // Lobby
    "lobby.newGame": "Neues Spiel",
    "lobby.createRoom": "Raum Erstellen",
    "lobby.joinGame": "Beitreten",
    "lobby.roomCode": "CODE",
    "lobby.go": "Los!",
    "lobby.enterNameError": "Bitte gib deinen Namen ein!",
    "lobby.enterRoomError": "Bitte gib den Raum-Code ein!",
    "lobby.roomNotFound": "Raum existiert nicht!",
    "lobby.roomFull": "Raum ist voll!",
    "lobby.kickedAlert": "Du wurdest aus dem Raum geworfen!",
    "lobby.need2Players": "Mindestens 2 Spieler werden benötigt!",
    "lobby.startGame": "🚀 Spiel Starten!",
    "lobby.waitingPlayers": "Warte auf Spieler...",
    "lobby.waitingHost": "Warte auf den Host...",
    "lobby.unknown": "Unbekannt",
    "lobby.dbError": "Fehler beim Datenbankzugriff: ",

    // Join Code Box
    "joinCode.inviteFriends": "Freunde Einladen",
    "joinCode.copied": "Kopiert!",
    "joinCode.copyInviteLink": "Link kopieren",

    // Player List
    "playerList.players": "Spieler",
    "playerList.you": "Du",
    "playerList.host": "Host",
    "playerList.kick": "KICKEN",
    "playerList.kickConfirm": "Möchtest du diesen Spieler wirklich kicken?",
    "playerList.emptySlot": "Freier Platz...",

    // Lobby Settings
    "settings.title": "Spieleinstellungen",
    "settings.hostOnly": "Nur Host",
    "settings.maxPlayers": "Max. Spieler",
    "settings.timeMinutes": "Erstellungszeit",
    "settings.genres": "Musikgenres (Zufallsauswahl)",

    // Game Phase & Studio
    "game.genre": "Genre:",
    "game.yourGenre": "Dein Genre",
    "game.partyVibes": "120 BPM • Party-Vibes",
    "game.letsGo": "Los geht's!",
    "game.soundLibrary": "Sound-Bibliothek",
    "game.finishTrack": "Track Fertigstellen",
    "game.trackSavedAlert": "Track gespeichert! Warte auf die anderen.",
    "game.allowMic": "Bitte Mikrofonzugriff erlauben!",
    "game.vocalTake": "Vocal Take",

    // Presentation Phase
    "presentation.nowPresenting": "Präsentiert jetzt",
    "presentation.yourTurn": "DU BIST DRAN!",
    "presentation.style": "Stil:",
    "presentation.rating": "Bewertung",
    "presentation.voteRecorded": "Stimme aufgezeichnet!",
    "presentation.othersListening": "Alle hören gerade deinen Track!",
    "presentation.playTrack": "Song Abspielen",
    "presentation.pauseTrack": "Pause",
    "presentation.replayTrack": "Wiederholen",
    "presentation.nextTrack": "Nächster Song ⏭",
    "presentation.finishPresentation": "Beenden & Ergebnisse Anzeigen 🏆",
    "presentation.waitingHostPlay": "Warte auf den Host zum Abspielen...",
    "presentation.nowPlaying": "Läuft gerade 🎵",
    "presentation.trackOf": "Track",
    "presentation.of": "von",

    // Results
    "results.roundResults": "Rundenergebnisse",
    "results.gameOver": "Spiel Vorbei!",
    "results.votes": "Stimmen",
    "results.nextRound": "Nächste Runde",
    "results.endGame": "Spiel Beenden",
    "results.returnToLobby": "🎮 Zurück zur Lobby",
    "results.waitingHostLobby": "Warte auf den Host für die Rückkehr zur Lobby...",
    "results.viewLeaderboard": "🏆 Endstand",
    "results.backToMenu": "Hauptmenü",

    // Theme & Navbar
    "navbar.logo": "Music Party",
    "theme.label": "Design",
    "theme.mantis": "Mantis",
    "theme.asphalt": "Asphalt",
    "theme.rose": "Rose",
    "lang.label": "Sprache",

    "lobby.leaveParty": "Party Verlassen",
    "lobby.disbandParty": "Party Auflösen",
    "lobby.confirmLeave": "Verlassen Bestätigen?",
    "lobby.confirmDisband": "Auflösen Bestätigen?",
    "lobby.leaveConfirm": "Möchtest du die Party wirklich verlassen?",
    "lobby.disbandConfirm": "Möchtest du diese Party wirklich für alle Spieler AUFLÖSEN?",
    "lobby.disbandedAlert": "Die Party wurde vom Host aufgelöst.",
    "countdown.title": "Spiel startet",
    "countdown.getReady": "MACH DICH BEREIT!",
    "songPreview.title": "Inspirations-Track",
    "songPreview.subtitle": "30-Sekunden-Song-Clip",
    "songPreview.skip": "Musik-Erstellung starten",
    "songPreview.unmute": "Klicken für Ton",
  }
};

const LanguageContext = createContext({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
  languages: LANGUAGES
});

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('app_lang') || 'en';
  });

  const setLang = useCallback((newLang) => {
    if (TRANSLATIONS[newLang]) {
      setLangState(newLang);
      localStorage.setItem('app_lang', newLang);
    }
  }, []);

  const t = useCallback((key) => {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    if (dict[key]) return dict[key];
    if (TRANSLATIONS.en[key]) return TRANSLATIONS.en[key];
    return key;
  }, [lang]);

  const value = useMemo(() => ({
    lang,
    setLang,
    t,
    languages: LANGUAGES
  }), [lang, setLang, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
