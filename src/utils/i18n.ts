import type { Language } from '../types/game';

export const COPY: Record<
  Language,
  {
    appTitle: string;
    subtitle: string;
    modeAdventure: string;
    modeAdventureDesc: string;
    modeBoardClear: string;
    modeBoardClearDesc: string;
    modeBlockBlast: string;
    modeBlockBlastDesc: string;
    modeBlocksturz: string;
    modeBlocksturzDesc: string;
    continueGame: string;
    startGame: string;
    newGame: string;
    score: string;
    best: string;
    combo: string;
    lines: string;
    speed: string;
    nextPiece: string;
    pause: string;
    resume: string;
    pausedLabel: string;
    rules: string;
    privacy: string;
    soundOn: string;
    soundOff: string;
    home: string;
    undo: string;
    gameOverTitle: string;
    soCloseTitle: string;
    newRecord: string;
    finalScore: string;
    bestScore: string;
    linesClearedLabel: string;
    bestStreakLabel: string;
    playAgain: string;
    retry: string;
    changeMode: string;
    rulesTitle: string;
    rulesAdventure: string;
    rulesBoardClear: string;
    rulesGoal: string;
    rulesControls: string;
    rulesFalling: string;
    rulesScoring: string;
    rulesGithub: string;
    close: string;
    comboSingle: string;
    comboDouble: string;
    comboTriple: string;
    comboMega: string;
    allClear: string;
    praiseGood: string;
    praiseGreat: string;
    praisePerfect: string;
    praiseExcellent: string;
    praiseUnbelievable: string;
    selectedHint: string;
    noMovesLeft: string;
    rotate: string;
    drop: string;
    levelLabel: string;
    stageLabel: string;
    blocksLeftLabel: string;
    boardClearedTitle: string;
    nextStage: string;
    targetScoreLabel: string;
    collectGemsLabel: string;
    wellDone: string;
    nextLevel: string;
    backToMap: string;
    consecutiveVictories: string;
    adventureMapTitle: string;
    adventureProgress: string;
    playLevel: string;
    allLevelsCleared: string;
    rescueTitle: string;
    rescueSubtitle: string;
    rescueAccept: string;
    rescueSkip: string;
    privacyTitle: string;
    privacySubtitle: string;
    privacyNoTrackingTitle: string;
    privacyNoTrackingText: string;
    privacyLocalTitle: string;
    privacyLocalText: string;
    privacyStorageToggle: string;
    privacyStorageOn: string;
    privacyStorageOff: string;
    privacyHostingTitle: string;
    privacyHostingText: string;
    privacyManageTitle: string;
    privacyExportBtn: string;
    privacyImportBtn: string;
    privacyClearBtn: string;
    privacyConfirmClearBtn: string;
    privacyClearedDone: string;
    privacyImportedDone: string;
    privacyImportError: string;
  }
> = {
  de: {
    appTitle: 'Blocky',
    subtitle:
      'Feld-räumen-Puzzles, Abenteuer-Pyramide (Level 1–96), Klassik-8×8 mit Kombo-Herz und Blocksturz – optimiert für Smartphone & Browser.',
    modeAdventure: 'Abenteuer · Level 1–96',
    modeAdventureDesc:
      'Erklimme die 96-stufige Abenteuer-Pyramide mit Zielpunkten & Edelsteinen.',
    modeBoardClear: 'Feld räumen · Puzzle',
    modeBoardClearDesc:
      'Räume 30 bunte Figuren & Muster restlos leer bis auf 0 Blöcke!',
    modeBlockBlast: 'Klassik · 8×8',
    modeBlockBlastDesc:
      'Endlos-Highscore-Jagd mit Kombo-Herz und +300 Bonus für ein leeres Feld.',
    modeBlocksturz: 'Blocksturz · Tempo',
    modeBlocksturzDesc:
      'Blöcke fallen von oben – das Tempo steigt mit Zeit und Punkten.',
    continueGame: 'Weiterspielen',
    startGame: 'Spielen',
    newGame: 'Neu starten',
    score: 'Punkte',
    best: 'Rekord',
    combo: 'Kombo',
    lines: 'Reihen',
    speed: 'Tempo',
    nextPiece: 'Nächster',
    pause: 'Pause',
    resume: 'Weiter',
    pausedLabel: 'Pausiert',
    rules: 'Regeln',
    privacy: 'Datenschutz',
    soundOn: 'Ton an',
    soundOff: 'Ton aus',
    home: 'Menü',
    undo: 'Zurück',
    gameOverTitle: 'Kein Platz mehr frei',
    soCloseTitle: 'Knapp daneben!',
    newRecord: 'Neuer Rekord!',
    finalScore: 'Endstand',
    bestScore: 'Bestleistung',
    linesClearedLabel: 'Entfernte Reihen',
    bestStreakLabel: 'Beste Kombo',
    playAgain: 'Nochmal spielen',
    retry: 'Erneut versuchen',
    changeMode: 'Modus wechseln',
    rulesTitle: 'Spielregeln & Steuerung',
    rulesAdventure:
      'Abenteuer (Level 1–96): Erklimme die Pyramide vom Fuß bis zum Pokal auf Stufe 96 – erreiche Zielpunkte oder sammle funkelnde Edelsteine.',
    rulesBoardClear:
      'Feld räumen (Puzzle): Jede Stufe startet mit einer bunten Figur auf dem 8×8-Feld. Platziere die abgestimmten Bausteine so, dass 0 Blöcke übrig bleiben (+300 Regenbogen-Bonus!). Mit „Zurück“ kannst du Züge korrigieren.',
    rulesGoal:
      'Klassik (8×8): Halte deine Kombo aktiv (innerhalb von 3 Zügen eine Reihe klären) und räume das gesamte Feld leer für +300 Extrapunkte. Einmal pro Runde steht dir eine kostenlose Rettung zur Verfügung.',
    rulesControls:
      'Smartphone-Steuerung: Beim Ziehen schwebt der Stein über deinem Finger; aufzulösende Reihen leuchten sofort in deiner Steinfarbe auf.',
    rulesFalling:
      'Blocksturz (Tempo): Steuere fallende Steine per Wischgeste, Tasten unter dem Feld oder Pfeiltasten.',
    rulesScoring:
      'Jede entfernte Reihe steigert die Grundpunkte. Mehrfach-Reihen, Kombo-Serien und ein komplett geleertes Spielfeld bringen hohe Boni.',
    rulesGithub:
      'Läuft zu 100 % lokal im Browser ohne Tracking oder externe Schriftarten – direkt bereit für GitHub Pages.',
    close: 'Schließen',
    comboSingle: 'Reihe!',
    comboDouble: 'Doppel-Reihe!',
    comboTriple: 'Dreifach!',
    comboMega: 'Vierfach-Blast!',
    allClear: 'Spielfeld leer!',
    praiseGood: 'Good!',
    praiseGreat: 'Great!',
    praisePerfect: 'Perfect!',
    praiseExcellent: 'Excellent!',
    praiseUnbelievable: 'Unbelievable!',
    selectedHint: 'Tippe auf das Spielfeld zum Platzieren',
    noMovesLeft: 'Kein Platz mehr frei',
    rotate: 'Drehen',
    drop: 'Fallen',
    levelLabel: 'Level',
    stageLabel: 'Muster',
    blocksLeftLabel: 'Blöcke übrig',
    boardClearedTitle: 'Spielfeld komplett leer!',
    nextStage: 'Nächstes Muster',
    targetScoreLabel: 'Zielpunkte',
    collectGemsLabel: 'Edelsteine sammeln',
    wellDone: 'Gut gemacht!',
    nextLevel: 'Nächstes Level',
    backToMap: 'Pyramide',
    consecutiveVictories: 'Siegesserie',
    adventureMapTitle: 'Abenteuer-Pyramide',
    adventureProgress: 'Fortschritt',
    playLevel: 'Level',
    allLevelsCleared: 'Alle 96 Level gemeistert!',
    rescueTitle: '2. Chance · Rettung!',
    rescueSubtitle:
      'Einmalig pro Runde: Räume die mittleren Reihen frei und erhalte 3 frische Steine – komplett kostenlos & ohne Werbung.',
    rescueAccept: 'Feld freiräumen & weiter',
    rescueSkip: 'Runde beenden',
    privacyTitle: 'Datenschutz & Lokale Daten',
    privacySubtitle:
      'Datensparsam nach DSGVO-Prinzipien – 100 % lokal in deinem Browser.',
    privacyNoTrackingTitle: 'Kein Tracking · Keine Cookies · Keine Werbung',
    privacyNoTrackingText:
      'Blocky verwendet keinerlei Analyse-Dienste, Werbenetzwerke, Tracking-Pixel oder Drittanbieter-Cookies. Auch auf externe Schriftarten-Server (z. B. Google Fonts) wird bewusst verzichtet, damit deine IP-Adresse nicht an Dritte übertragen wird.',
    privacyLocalTitle: 'Lokale Speicherung (localStorage)',
    privacyLocalText:
      'Deine Highscores, freigeschalteten Abenteuer-Level (1–96), Feld-räumen-Stufen sowie Ton- und Spracheinstellungen werden ausschließlich lokal auf deinem eigenen Gerät im Browser-Speicher (localStorage) abgelegt. Diese Daten verlassen niemals dein Gerät.',
    privacyStorageToggle: 'Spielstände lokal im Browser speichern',
    privacyStorageOn: 'Aktiv',
    privacyStorageOff: 'Deaktiviert',
    privacyHostingTitle: 'Statisches Hosting (z. B. GitHub Pages)',
    privacyHostingText:
      'Beim Aufruf dieser statischen Webseite über GitHub Pages erhebt der Hosting-Anbieter (GitHub Inc.) technisch notwendige Verbindungsdaten (wie IP-Adresse, Zeitstempel und Browsertyp) in Server-Logfiles, um die Seite sicher auszuliefern.',
    privacyManageTitle: 'Deine Daten verwalten (Auskunft, Backup & Löschung)',
    privacyExportBtn: 'Backup exportieren (JSON)',
    privacyImportBtn: 'Backup laden',
    privacyClearBtn: 'Alle lokalen Daten löschen',
    privacyConfirmClearBtn: 'Jetzt endgültig löschen',
    privacyClearedDone: 'Alle lokalen Spielstände wurden gelöscht.',
    privacyImportedDone: 'Spielstand erfolgreich wiederhergestellt!',
    privacyImportError: 'Ungültige Backup-Datei.',
  },
  en: {
    appTitle: 'Blocky',
    subtitle:
      'Clear-the-Board puzzles, 96-Level Adventure Pyramid, Classic 8×8 with Combo Heart, and Tempo Drop — built for mobile and desktop.',
    modeAdventure: 'Adventure · Levels 1–96',
    modeAdventureDesc:
      'Climb the 96-level stepped pyramid by hitting target scores or collecting gems.',
    modeBoardClear: 'Clear the Board · Puzzle',
    modeBoardClearDesc:
      'Wipe 30 pre-built colorful figures completely clean down to 0 blocks!',
    modeBlockBlast: 'Classic · 8×8',
    modeBlockBlastDesc:
      'Endless high-score chase with Combo Heart and +300 All-Clear rainbow bursts.',
    modeBlocksturz: 'Tempo Drop',
    modeBlocksturzDesc:
      'Falling blocks from above — drop speed climbs steadily with time and score.',
    continueGame: 'Resume',
    startGame: 'Play',
    newGame: 'Restart',
    score: 'Score',
    best: 'Best',
    combo: 'Combo',
    lines: 'Rows',
    speed: 'Speed',
    nextPiece: 'Next',
    pause: 'Pause',
    resume: 'Resume',
    pausedLabel: 'Paused',
    rules: 'Rules',
    privacy: 'Privacy',
    soundOn: 'Sound On',
    soundOff: 'Muted',
    home: 'Menu',
    undo: 'Undo',
    gameOverTitle: 'No Space Left',
    soCloseTitle: 'So Close!',
    newRecord: 'Best Score!',
    finalScore: 'Score',
    bestScore: 'Best Score',
    linesClearedLabel: 'Rows Cleared',
    bestStreakLabel: 'Best Combo',
    playAgain: 'Play Again',
    retry: 'Retry',
    changeMode: 'Switch Mode',
    rulesTitle: 'Rules & Controls',
    rulesAdventure:
      'Adventure (Levels 1–96): Climb the stepped pyramid all the way to the Trophy at Level 96 by reaching target scores or collecting gems.',
    rulesBoardClear:
      'Clear the Board (Puzzle): Each stage starts with a colorful figure on the 8×8 grid. Clear every single block down to 0 (+300 Rainbow Bonus!). Use Undo anytime.',
    rulesGoal:
      'Classic (8×8): Chain combos (clear a line within 3 placements) and empty the entire board for a +300 bonus. Includes 1 free Rescue per run.',
    rulesControls:
      'Mobile Controls: Touch dragging lifts the piece above your finger, and lines about to clear glow in your piece color.',
    rulesFalling:
      'Tempo Drop: Control falling pieces via swipe gestures, buttons below the board, or Arrow keys.',
    rulesScoring:
      'Each cleared row earns progressively more points. Multi-line clears, active combos, and full-board clears grant big bonuses.',
    rulesGithub:
      'Runs 100% locally in the browser with zero tracking and zero external font requests — ready for GitHub Pages.',
    close: 'Close',
    comboSingle: 'Line Clear!',
    comboDouble: 'Double!',
    comboTriple: 'Triple!',
    comboMega: 'Quad Blast!',
    allClear: 'Board Cleared!',
    praiseGood: 'Good!',
    praiseGreat: 'Great!',
    praisePerfect: 'Perfect!',
    praiseExcellent: 'Excellent!',
    praiseUnbelievable: 'Unbelievable!',
    selectedHint: 'Tap a valid cell on the board to place',
    noMovesLeft: 'No Space Left',
    rotate: 'Rotate',
    drop: 'Drop',
    levelLabel: 'Level',
    stageLabel: 'Stage',
    blocksLeftLabel: 'Blocks Left',
    boardClearedTitle: 'Board Completely Cleared!',
    nextStage: 'Next Stage',
    targetScoreLabel: 'Target Score',
    collectGemsLabel: 'Collect Gems',
    wellDone: 'Well Done!',
    nextLevel: 'Next Level',
    backToMap: 'Pyramid',
    consecutiveVictories: 'Win Streak',
    adventureMapTitle: 'Adventure Pyramid',
    adventureProgress: 'Progress',
    playLevel: 'Level',
    allLevelsCleared: 'All 96 Levels Cleared!',
    rescueTitle: 'Second Chance · Rescue!',
    rescueSubtitle:
      'Once per game: Blast open the center rows and deal 3 fresh pieces — completely free, no ads.',
    rescueAccept: 'Clear Center & Continue',
    rescueSkip: 'End Game',
    privacyTitle: 'Privacy & Local Data',
    privacySubtitle:
      'GDPR-friendly privacy by design — 100% local in your browser.',
    privacyNoTrackingTitle: 'Zero Tracking · Zero Cookies · Zero Ads',
    privacyNoTrackingText:
      'Blocky uses no analytics scripts, ad networks, tracking pixels, or third-party cookies. It also uses local system fonts instead of external Google Fonts servers so your IP address is never leaked to third parties.',
    privacyLocalTitle: 'Local Browser Storage (localStorage)',
    privacyLocalText:
      'Your high scores, unlocked Adventure levels (1–96), Board-Clear stages, and audio/language preferences are stored solely on your own device in localStorage and never leave your browser.',
    privacyStorageToggle: 'Save progress locally in browser',
    privacyStorageOn: 'Enabled',
    privacyStorageOff: 'Disabled',
    privacyHostingTitle: 'Static Hosting Notice (GitHub Pages)',
    privacyHostingText:
      'When accessed via GitHub Pages, the static host (GitHub Inc.) processes technically necessary server connection logs (such as IP address, timestamp, and user agent) to deliver the files securely.',
    privacyManageTitle: 'Manage Your Data (Backup, Restore & Wipe)',
    privacyExportBtn: 'Export Backup (JSON)',
    privacyImportBtn: 'Import Backup',
    privacyClearBtn: 'Delete All Local Data',
    privacyConfirmClearBtn: 'Confirm Permanent Wipe',
    privacyClearedDone: 'All local save data has been deleted.',
    privacyImportedDone: 'Backup restored successfully!',
    privacyImportError: 'Invalid backup file.',
  },
};
