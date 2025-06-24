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
    userManual: 'Benutzerhandbuch',
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
    back: 'Zurück',
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

  // User Manual
  userManual: {
    title: 'QUIZDOM Benutzerhandbuch',
    subtitle: 'Rise of the Wise',
    welcome:
      'Willkommen bei QUIZDOM - Rise of the Wise! Gratulation - es war eine weise Entscheidung von dir, erstmal hier her zu kommen und dich zu belesen. Hier findest du alle wichtigen Informationen für deine Reise in Quizdom!',
    tableOfContents: 'Inhaltsverzeichnis',
    gettingStarted: 'Erste Schritte',
    gameplay: 'Spielablauf',
    features: 'Funktionen',
    account: 'Konto & Profil',
    faq: 'Häufig gestellte Fragen',
    support: 'Support',

    // Getting Started Section
    whatIsQuizdom: 'Was ist QUIZDOM - Rise of the Wise?',
    whatIsQuizdomDesc:
      'QUIZDOM ist eine interaktive Quiz-Plattform, die Bildung mit Gaming-Elementen verbindet. Spieler können ihr Wissen in verschiedenen Themenbereichen testen, Wisecoins sammeln und durch verschiedene Spielmodi ihre Fähigkeiten verbessern.',

    howToPlay: 'Wo bzw. wie kann ich QUIZDOM spielen?',
    howToPlayDesc:
      'Aktuell können Sie QUIZDOM online in der Web-App über Ihren Internet-Browser spielen.',

    compatibility: 'Kompatibilität',
    browserCompatibility:
      'Mit welchen Internet-Browsern ist QUIZDOM kompatibel?',
    browserCompatibilityDesc:
      'QUIZDOM sollte fehlerfrei funktionieren, wenn Sie eine aktuell unterstützte Version von Google Chrome, Mozilla Firefox, Safari (macOS, iOS) oder Microsoft Edge benutzen.',

    deviceCompatibility: 'Mit welchen Geräten ist QUIZDOM kompatibel?',
    deviceCompatibilityDesc:
      'Wir haben in der Entwicklung von QUIZDOM konsequent auf ein responsives Design geachtet, sodass das Layout auf Smartphones (≤ 480 px), Tablets (481 – 1024 px) und Desktop (PC/Laptop) (≥ 1025 px) ohne Funktionsverlust funktioniert.',

    // Gameplay Section
    topicSelection: 'Wie kann ich ein bestimmtes Thema oder Fach auswählen?',
    topicSelectionDesc:
      'Um ein Thema oder ein bestimmtes Fach auszuwählen gibt es drei Möglichkeiten:',
    topicOption1:
      '1. Vor der Auswahl des Spielmodus: Loggen Sie sich ein und klicken Sie in der Navigationsleiste auf "Themen". Dort finden Sie alle Themen und Fächer.',
    topicOption2:
      '2. Nach der Auswahl des Spielmodus: Klicken Sie auf "Spielmodi", wählen Sie Ihren gewünschten Modus aus und wählen Sie dann ein Thema.',
    topicOption3:
      '3. Über Ihr Dashboard: Auf der "Start"-Seite werden Ihnen direkt alle Themen angezeigt, die Sie als Favorit hinzugefügt haben.',

    gameModes: 'Welche Spielmodi gibt es in QUIZDOM?',
    gameModesDesc:
      'QUIZDOM bietet verschiedene Spielmodi für unterschiedliche Präferenzen:',
    soloMode:
      'Solo Quiz / Solo Mode: Spielen Sie alleine und testen Sie Ihr Wissen in Ihrem eigenen Tempo.',
    collaborativeMode:
      'Team Battle / Collaborative Mode: Arbeiten Sie mit anderen Spielern zusammen, um gemeinsam Fragen zu beantworten.',
    competitiveMode:
      'Duell / Competitive Mode: Treten Sie direkt gegen andere Spieler an und messen Sie Ihr Wissen.',

    playWithFriends: 'Kann ich in QUIZDOM auch gegen meine Freunde spielen?',
    playWithFriendsDesc:
      'In dieser prototypischen Umsetzung wird der andere Spieler für den Collaborative Mode oder den Competitive Mode zufällig aus den Spielern ausgewählt, die gerade online sind und dasselbe Thema im selben Spielmodus spielen wollen.',

    questionTypes: 'Welche Fragetypen gibt es in QUIZDOM?',
    questionTypesDesc:
      'In dieser prototypischen Umsetzung gibt es nur Single- bzw. Multiple-Choice-Fragen. Wer weiß, was die Zukunft noch bringt...',

    timeLimit:
      'Wie viel Zeit habe ich in einem Quiz zur Beantwortung einer Frage?',
    timeLimitDesc:
      'Die Zeitbegrenzung variiert je nach Schwierigkeit der Frage. Sie haben ausreichend Zeit, um sorgfältig zu überlegen, aber die Begrenzung hält das Spiel spannend und herausfordernd.',

    // Features Section
    wisecoins: 'Was sind Wisecoins und warum gibt es sie?',
    wisecoinsDesc:
      'Wisecoins sind die Spielwährung in QUIZDOM. Sie werden für richtige Antworten vergeben und können für verschiedene Verbesserungen und Belohnungen eingesetzt werden.',

    hearts: 'Wofür gibt es während eines Quiz Herzen?',
    heartsDesc:
      'Herzen repräsentieren Ihre Leben während eines Quiz. Bei falschen Antworten verlieren Sie Herzen. Haben Sie alle Herzen verloren, ist das Quiz beendet.',

    aiWizard: 'Was ist der AI Wizard und wo finde ich ihn?',
    aiWizardDesc:
      'Der AI Wizard ist Ihr persönlicher Lernassistent, der Ihnen detaillierte Erklärungen zu Fragen und Antworten gibt. Sie finden ihn in verschiedenen Bereichen der Anwendung.',

    explanations:
      'Gibt es weiterführende Erklärungen, warum einzelne Antworten richtig sind?',
    explanationsDesc:
      'Ja, der AI Wizard bietet detaillierte Erklärungen zu den richtigen Antworten, um Ihr Verständnis zu vertiefen.',

    progressTracking: 'Wie kann ich in QUIZDOM meinen Fortschritt verfolgen?',
    progressTrackingDesc:
      'Ihr Fortschritt wird automatisch gespeichert und kann über die "Fortschritt"-Seite eingesehen werden. Dort sehen Sie Ihre Statistiken, verdiente Badges und gesammelte Wisecoins.',

    bookmarkQuestions:
      'Kann ich mir Quiz-Fragen während eines Quiz/Spiels abspeichern?',
    bookmarkQuestionsDesc:
      'Ja, Sie können Fragen markieren und später in Ihrem Profil wiederfinden, um sie erneut zu üben.',

    markedQuestions: 'Was sind markierte Fragen?',
    markedQuestionsDesc:
      'Markierte Fragen sind Fragen, die Sie für späteres Wiederholen gespeichert haben. Diese finden Sie in Ihrem Profil unter den gespeicherten Inhalten.',

    // Account Section
    needAccount:
      'Brauche ich für QUIZDOM ein Konto und wie kann ich mir eines anlegen?',
    needAccountDesc:
      'Ja, für die vollständige QUIZDOM-Erfahrung benötigen Sie ein Konto. Klicken Sie auf "Registrieren" und folgen Sie den Anweisungen.',

    changePassword: 'Wie kann ich mein Passwort ändern bzw. zurücksetzen?',
    changePasswordDesc:
      'Nutzen Sie die "Passwort vergessen?"-Funktion auf der Anmeldeseite oder ändern Sie Ihr Passwort in den Profileinstellungen.',

    editProfile: 'Wie kann ich meine Profilinformationen ändern?',
    editProfileDesc:
      'Gehen Sie zu Ihrem Profil und klicken Sie auf "Bearbeiten", um Profilbild, Benutzername oder E-Mail-Adresse zu ändern.',

    deleteAccount: 'Wie kann ich mein Konto und meine Daten löschen?',
    deleteAccountDesc:
      'Die Kontolöschung kann über die Profileinstellungen beantragt werden. Kontaktieren Sie den Support für weitere Unterstützung.',

    // FAQ Section
    faqTitle: 'Häufig gestellte Fragen (FAQ)',

    // Support Section
    supportTitle: 'Benutzersupport',
    supportDesc:
      'In der aktuellen prototypischen Umsetzung gibt es keinen direkten Benutzersupport. Fragen, Wünsche, Fehler sowie Lob und Kritik können Sie gerne an example@quizdom.com senden. Bitte haben Sie Verständnis dafür, dass wir es vermutlich nicht schaffen auf jede E-Mail zu antworten.',

    contactEmail: 'Kontakt: example@quizdom.com',
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
