/**
 * German translations for all user-visible text in the application
 * Centralized translation system for consistent German localization
 */

export const translations = {
  // Navigation
  nav: {
    start: 'Start',
    topics: 'Themen',
    gameModes: 'Spielmodi',
    progress: 'Fortschritt',
    profile: 'Profil',
    dashboard: 'Dashboard',
    questions: 'Fragen',
    users: 'Benutzer',
    logs: 'Protokolle',
    login: 'Anmelden',
    register: 'Registrieren',
    logout: 'Abmelden',
    admin: 'Admin',
    player: 'Spieler',
    toggleMenu: 'Menü umschalten',
    hideFilters: 'Filter ausblenden',
    showFilters: 'Filter anzeigen',
  },

  // Authentication
  auth: {
    welcomeBack: 'Willkommen zurück!',
    createAccount: 'Konto erstellen!',
    loginSubtitle: 'Bitte melden Sie sich in Ihrem Konto an.',
    signupSubtitle: 'Bitte füllen Sie Ihre Daten aus, um sich zu registrieren.',
    firstName: 'Vorname',
    lastName: 'Nachname',
    email: 'E-Mail',
    password: 'Passwort',
    confirmPassword: 'Passwort bestätigen',
    yourPassword: 'Ihr Passwort',
    rememberMe: 'Angemeldet bleiben',
    forgotPassword: 'Passwort vergessen?',
    login: 'Anmelden',
    signup: 'Registrieren',
    createAccountButton: 'Konto erstellen',
    backToLogin: 'Zurück zur Anmeldung',
    accountCreated: 'Konto erfolgreich erstellt! Weiterleitung...',
    loginInProgress: 'Anmeldung läuft...',
    accountCreationInProgress: 'Konto wird erstellt...',
    demoAccounts: 'Demo-Konten:',
    playerDemo: 'Spieler: player@quizdom.com',
    adminDemo: 'Admin: admin@quizdom.com',
    passwordDemo: 'Passwort: beliebig',
  },

  // Password Reset
  passwordReset: {
    enterEmail: 'Geben Sie Ihre E-Mail-Adresse ein',
    sendResetEmail: 'E-Mail zum Zurücksetzen senden',
    sendingResetEmail: 'E-Mail zum Zurücksetzen senden...',
    emailSent: 'E-Mail erfolgreich gesendet!',
    emailSentDescription:
      'Wir haben Anweisungen zum Zurücksetzen des Passworts an {email} gesendet',
    sendAnotherEmail: 'Weitere E-Mail senden',
    needHelp: 'Brauchen Sie Hilfe?',
    helpText:
      'Falls Sie die E-Mail innerhalb weniger Minuten nicht erhalten, überprüfen Sie Ihren Spam-Ordner oder versuchen Sie es mit einer anderen E-Mail-Adresse.',
  },

  // Password Strength
  passwordStrength: {
    weak: 'Schwach',
    fair: 'Ausreichend',
    good: 'Gut',
    strong: 'Stark',
    passwordStrength: 'Passwortstärke: {strength}',
  },

  // Landing Page
  landing: {
    tagline: 'Rise of the Wise',
    description:
      'Tauchen Sie ein in die ultimative Quiz-Erfahrung. Sammeln Sie Wisecoins, verdienen Sie Badges und beweisen Sie Ihr Wissen!',
    startPlaying: 'Jetzt spielen',
    collectWisecoins: 'Wisecoins sammeln',
    collectWisecoinsDesc:
      'Verdienen Sie Wisecoins für richtige Antworten und kaufen Sie Power-Ups.',
    earnBadges: 'Badges verdienen',
    earnBadgesDesc:
      'Schalten Sie einzigartige Achievements frei und zeigen Sie Ihre Erfolge.',
    variousModes: 'Verschiedene Modi',
    variousModesDesc:
      'Spielen Sie Solo, gegen Freunde oder in spannenden Turnieren.',
  },

  // Topics
  topics: {
    overview: 'Themen Übersicht',
    overviewDescription:
      'Entdecken Sie spannende Themen aus verschiedenen Kategorien und testen Sie Ihr Wissen.',
    searchTopics: 'Themen suchen...',
    yourTopics: 'Ihre Themen',
    noTopicsFound: 'Keine Themen gefunden',
    tryDifferentSearch: 'Versuchen Sie einen anderen Suchbegriff',
    adjustSearchCriteria:
      'Versuchen Sie, Ihre Suchkriterien anzupassen oder eine andere Kategorie zu wählen.',
    filters: 'Filter',
    category: 'Kategorie',
    allCategories: 'Alle Kategorien',
    difficulty: 'Schwierigkeit',
    allDifficulties: 'Alle Schwierigkeiten',
    sortBy: 'Sortieren nach',
    popularity: 'Beliebtheit',
    difficultySort: 'Schwierigkeit',
    title: 'Titel',
    progress: 'Fortschritt',
    availableTopics: 'Verfügbare Themen',
    myFavorites: 'Meine Favoriten',
    completed: 'Abgeschlossen',
    totalProgress: 'Gesamtfortschritt',
    yourWisecoins: 'Meine Wisecoins',
    questions: 'Fragen',
    reward: 'Belohnung',
    wisecoins: 'Wisecoins',
    star: 'Stern',
    exploreTopic: 'Thema erkunden',
    addToFavorites: 'Zu Favoriten hinzufügen',
    removeFromFavorites: 'Aus Favoriten entfernen',
  },

  // Game Modes
  gameModes: {
    selectGameMode: 'Spielmodus auswählen',
  },

  // Admin
  admin: {
    addNewQuestion: 'Neue Frage hinzufügen',
    manageUsers: 'Benutzer verwalten',
    systemSettings: 'System-Einstellungen',
    createReports: 'Berichte erstellen',
    previous: 'Zurück',
    next: 'Weiter',
    add: 'Hinzufügen',
    settings: 'Einstellungen',
    reports: 'Berichte',
  },

  // Dashboard
  dashboard: {
    achievements: 'Erfolge',
    rewards: 'Belohnungen',
    wisecoins: 'Wisecoins',
    onlineUsers: 'Andere Benutzer online',
    firstQuiz: 'Erstes Quiz',
    quizMaster: 'Quiz-Meister',
  },

  // Common
  common: {
    loading: 'Lädt...',
    error: 'Fehler',
    success: 'Erfolg',
    cancel: 'Abbrechen',
    save: 'Speichern',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    close: 'Schließen',
    confirm: 'Bestätigen',
    back: 'Zurück',
    next: 'Weiter',
    submit: 'Absenden',
    reset: 'Zurücksetzen',
    search: 'Suchen',
    filter: 'Filter',
    sort: 'Sortieren',
    view: 'Anzeigen',
    hide: 'Ausblenden',
    show: 'Anzeigen',
    toggle: 'Umschalten',
    select: 'Auswählen',
    choose: 'Wählen',
    play: 'Spielen',
    pause: 'Pausieren',
    stop: 'Stoppen',
    restart: 'Neustart',
    refresh: 'Aktualisieren',
    reload: 'Neu laden',
    download: 'Herunterladen',
    upload: 'Hochladen',
    share: 'Teilen',
    copy: 'Kopieren',
    paste: 'Einfügen',
    cut: 'Ausschneiden',
    undo: 'Rückgängig',
    redo: 'Wiederholen',
    zoomIn: 'Vergrößern',
    zoomOut: 'Verkleinern',
    fullscreen: 'Vollbild',
    exitFullscreen: 'Vollbild beenden',
    help: 'Hilfe',
    about: 'Über',
    contact: 'Kontakt',
    support: 'Support',
    feedback: 'Feedback',
    settings: 'Einstellungen',
    preferences: 'Einstellungen',
    profile: 'Profil',
    account: 'Konto',
    security: 'Sicherheit',
    privacy: 'Datenschutz',
    terms: 'Nutzungsbedingungen',
    privacyPolicy: 'Datenschutzerklärung',
    cookies: 'Cookies',
    accessibility: 'Barrierefreiheit',
    language: 'Sprache',
    theme: 'Design',
    darkMode: 'Dunkler Modus',
    lightMode: 'Heller Modus',
    autoMode: 'Automatischer Modus',
  },

  // Error Messages
  errors: {
    error: 'Fehler',
    oops: 'Ups!',
    somethingWentWrong: 'Etwas ist schiefgelaufen.',
    pageNotFound: 'Seite nicht gefunden.',
    unauthorized: 'Nicht autorisiert.',
    forbidden: 'Zugriff verweigert.',
    serverError: 'Serverfehler.',
    networkError: 'Netzwerkfehler.',
    validationError: 'Validierungsfehler.',
    invalidEmail: 'Ungültige E-Mail-Adresse.',
    invalidPassword: 'Ungültiges Passwort.',
    passwordsDoNotMatch: 'Passwörter stimmen nicht überein.',
    fieldRequired: 'Dieses Feld ist erforderlich.',
    invalidInput: 'Ungültige Eingabe.',
    fileTooLarge: 'Datei ist zu groß.',
    invalidFileType: 'Ungültiger Dateityp.',
    connectionLost: 'Verbindung verloren.',
    timeout: 'Zeitüberschreitung.',
    retry: 'Erneut versuchen.',
    goHome: 'Zur Startseite',
  },

  // Success Messages
  success: {
    saved: 'Gespeichert!',
    deleted: 'Gelöscht!',
    updated: 'Aktualisiert!',
    created: 'Erstellt!',
    uploaded: 'Hochgeladen!',
    downloaded: 'Heruntergeladen!',
    copied: 'Kopiert!',
    shared: 'Geteilt!',
    sent: 'Gesendet!',
    completed: 'Abgeschlossen!',
    success: 'Erfolgreich!',
  },

  // Accessibility
  accessibility: {
    emailSent: 'E-Mail gesendet',
    logout: 'Abmelden',
    toggleMenu: 'Menü umschalten',
    previous: 'Zurück',
    next: 'Weiter',
    add: 'Hinzufügen',
    settings: 'Einstellungen',
    reports: 'Berichte',
    user: 'Benutzer',
    selectGameMode: 'Spielmodus auswählen',
  },

  // Page Titles
  pageTitles: {
    home: 'Quizdom - Rise of the Wise',
    homeDescription: 'Willkommen bei Quizdom - dem ultimativen Quiz-Erlebnis!',
    authentication: 'Authentifizierung | Quizdom',
    authDescription: 'Melden Sie sich an oder erstellen Sie Ihr Quizdom-Konto.',
    adminDashboard: 'Admin Dashboard | Quizdom',
    adminDashboardDescription: 'Administrationsbereich für Quizdom.',
    adminUsers: 'Benutzer verwalten | Quizdom Admin',
    adminUsersDescription: 'Verwalten Sie Benutzerkonten und Berechtigungen.',
    progress: 'Fortschritt & Badges | Quizdom',
    progressDescription: 'Verfolgen Sie Ihren Fortschritt und Ihre Erfolge.',
  },

  // Return Message
  returnMessage: {
    title: "Ohne dich ist's still – komm zurück!",
  },
} as const;

/**
 * Helper function to replace placeholders in translation strings
 */
export function translate(
  key: string,
  replacements?: Record<string, string>
): string {
  const keys = key.split('.');
  let value: unknown = translations;

  for (const k of keys) {
    // @ts-expect-error: dynamic key access
    value = value?.[k];
    if (value === undefined) {
      // console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }

  if (typeof value !== 'string') {
    // console.warn(`Translation value is not a string: ${key}`);
    return key;
  }

  if (replacements) {
    return Object.entries(replacements).reduce(
      (str, [placeholder, replacement]) =>
        str.replace(new RegExp(`{${placeholder}}`, 'g'), replacement),
      value
    );
  }

  return value;
}

/**
 * Type-safe translation key helper
 */
export type TranslationKey = keyof typeof translations;
