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
    favoriteTopics: 'Favoriten',
    favoriteTopicsDescription: 'Deine markierten Themen',
    noFavoriteTopics: 'Noch keine Favoriten',
    addFavoritesFromTopics:
      'Markiere Themen in der Themenübersicht als Favorit',
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
      'Mit "QUIZDOM – Rise of the Wise" bringen wir die Kraft von Gamification, Kollaboration und Kooperation sowie künstlicher Intelligenz in die akademische Bildung. Mit einer interaktiven Quiz-Plattform wollen wir Lernen neugestalten – als positives, motivierendes Erlebnis, ausgerichtet auf die Bedürfnisse der Studierenden. Wir glauben: Wenn Lernen richtig gestaltet ist, fühlt es sich nicht wie Mühe an, sondern wie ein sinnvoller, belohnender Prozess. Mit QUIZDOM kannst dich auf spielerische Art und Weise in einer Fantasy-Mittelalter-Atmosphäre auf deine Prüfungen vorbereiten. Dabei bist du nicht auf dich allein gestellt - z.B. im Spielmodus Team Battle kannst du zusammen mit anderen Quizfragen zu verschiedenen Themenbereichen beantworten.',

    howToPlay: 'Wo bzw. wie kann ich QUIZDOM spielen?',
    howToPlayDesc:
      'Aktuell kann man QUIZDOM online in der Web-App über einen Internet-Browser spielen.',

    structureQuizdom: 'Wie ist QUIZDOM aufgebaut?',
    structureQuizdomDesc:
      'QUIZDOM besteht aus verschiedenen Seiten, die du über die Navigationsleiste erreichen kannst:',
    structureQuizdomPage1:
      'Start: Hier findest du deine als Favorit markierten Themenbereiche.',
    structureQuizdomPage2:
      'Themen: Such dir aus, in welchem Themenbereich du dein Wissen erweitern willst.',
    structureQuizdomPage3:
      'Spielmodi: Wähle zwischen Solo Mission und Team Battle und starte das Quizzen.',
    structureQuizdomPage4:
      'Benutzerhandbuch: Hier findest du Antworten auf all deine Fragen rund um QUIZDOM selbst.',
    structureQuizdomPage5:
      'Profil: Klick auf dein Profilbild, um deine Einstellungen zu verwalten, deinen Fortschritt zu tracken oder wenn du dich abmelden willst.',

    compatibility: 'Kompatibilität',
    browserCompatibility:
      'Mit welchen Internet-Browsern ist QUIZDOM kompatibel?',
    browserCompatibilityDesc:
      'QUIZDOM sollte fehlerfrei funktionieren, wenn du eine aktuell unterstützte Version von Google Chrome, Mozilla Firefox oder Microsoft Edge benutzt.',

    deviceCompatibility: 'Mit welchen Geräten ist QUIZDOM kompatibel?',
    deviceCompatibilityDesc:
      'Wir haben in der Entwicklung von QUIZDOM konsequent auf ein responsives Design geachtet, sodass das Layout auf Smartphones (≤ 480 px), Tablets (481 – 1024 px) und Desktop (PC/Laptop) (≥ 1025 px) ohne Funktionsverlust funktioniert.',

    // Gameplay Section
    topicSelection: 'Wie kann ich ein bestimmtes Thema oder Fach auswählen?',
    topicSelectionDesc:
      'Um ein Thema oder ein bestimmtes Fach auszuwählen gibt es drei Möglichkeiten:',
    topicOption1:
      '1. Vor der Auswahl des Spielmodus: Logge dich ein bzw. registriere dich und klicke dann in der Navigationsleiste auf Themen. Dort findest du alle Themen und Fächer. Über eine Suchleiste kannst du nach einem Thema bzw. Fach suchen. Mithilfe des Filters kannst du das Suchergebnis einschränken. Dann kannst du das gewünschte Thema auswählen und entweder auf SPIELEN klicken, dir gemerkte Fragen anschauen und vom AI Wizard erklären lassen oder das Fach zu deinen Favoriten hinzufügen indem du das leere Herz anklickst. Das Herz befindet sich auf der Höhe des Titels des Themas.',
    topicOption2:
      '2. Nach der Auswahl des Spielmodus: Logge dich ein bzw. registriere dich und klicke dann in der Navigationsleiste auf Spielmodi. Wähle dann den von dir gewünschten Modus aus. Nach der Auswahl des Spielmodus werden dir alle Themen und Fächer angezeigt. Wähle eines aus und du kannst dein Spiel direkt beginnen.',
    topicOption3:
      '3. Über dein Dashboard: Logge dich ein, wenn du bereits ein Konto hast. Auf der Seite Start werden dir dann direkt alle Themen die du als Favorit hinzugefügt hast angezeigt. Dann kannst du das gewünschte Thema auswählen und entweder auf SPIELEN klicken oder dir gemerkte Fragen anschauen und vom AI Wizard erklären lassen.',

    gameModes: 'Welche Spielmodi gibt es in QUIZDOM?',
    gameModesDesc:
      'QUIZDOM bietet unterschiedliche Spielmodi für unterschiedliche Präferenzen:',
    soloMode:
      'Solo Mission: Spiele alleine und teste dein Wissen in deinem eigenen Tempo.',
    collaborativeMode:
      'Team Battle: Arbeite mit anderen Studierenden zusammen, um gemeinsam zu lernen.',
    competitiveMode:
      '(Aktuell noch nicht verfügbar) Duell: Trete direkt gegen andere Studierende an und beweise dein Wissen in einem spannenden Wissensduell.',

    // Gameplay Section: Detailed gamemode descriptions
    soloModeDetails: 'Wie funktioniert der Spielmodus Solo Mission?',
    soloModeDetailsDesc:
      'Im Spielmodus Solo Mission werden dir verschiedene Fragen zum gewählten Themenbereich ohne Zeitbegrenzung gestellt. Du beginnst das Spiel mit drei Herzen. Wenn du eine Frage falsch beantwortest, verlierst du nur ein Herz - aber pass auf! Wenn alle Herzen weg sind, endet das Spiel. Die Bepunktung ist abhängig davon, wie schnell du es schaffst zu antworten:',
    collaborativeModeDetails: 'Wie funktioniert der Spielmodus Team Battle?',
    collaborativeModeDetailsDesc:
      'Im Spielmodus Team Battle könnt ihr euch gemeinsam als Team verschiedenen Fragen zum gewählten Themenbereich stellen. Pro Frage haben alle Teammitglieder 15 Sekunden Zeit ihre Antwort abzugeben. Ihr beginnt das Spiel mit drei Herzen, die für das gesamte Team gelten. Wenn ihr eine Frage falsch beantwortet oder die Zeit abgelaufen ist, verliert ihr nur ein Herz - aber passt auf! Wenn alle Herzen weg sind, endet das Spiel. Die Bepunktung ist abhängig davon, wie schnell ihr es schafft zu antworten - die schnellste richtige Antwort zählt.',
    competitiveModeDetails: 'Wie funktioniert der Spielmodus Duell?',
    competitiveModeDetailsDesc:
      'In der aktuellen prototypischen Umsetzung ist dieser Spielmodus noch nicht verfügbar, hier aber bereits ein Sneak Peek wie der Spielmodus Duell geplant ist: Der Spielmodus Duell ist für alle, die den Wettkampf lieben. Tretet gegeneinander an und findet heraus, wer weiser ist - oder einfach schneller. Jeder Spieler hat pro Frage 10 Sekunden Zeit zu antworten.Beide Spieler beginnen das Spiel mit drei Herzen. Herzen werden abgezogen, wenn eine Frage falsch beantwortet wurde oder die Zeit abgelaufen ist. Wenn ein Spieler alle seine Herzen verbraucht hat, hat er verloren und das Spiel ist beendet. Die Bepunktung ist abhängig davon, wie schnell ihr es schafft zu antworten.',

    // Gameplay Section: Play with friends
    playWithFriends: 'Kann ich in QUIZDOM auch gegen meine Freunde spielen?',
    playWithFriendsDesc:
      'In dieser prototypischen Umsetzung wird der andere Spieler für den Collaborative Mode oder den Competitive Mode zufällig aus den Spielern ausgewählt, die gerade online sind und dasselbe Thema im selben Spielmodus spielen wollen.',

    questionTypes: 'Welche Fragetypen gibt es in QUIZDOM?',
    questionTypesDesc:
      'In dieser prototypischen Umsetzung gibt es nur Single- bzw. Multiple-Choice-Fragen. Wer weiß, was die Zukunft noch bringt...',

    timeLimit:
      'Wie viel Zeit habe ich in einem Quiz zur Beantwortung einer Frage?',
    timeLimitSoloMission:
      'Solo Mission ➡️ In diesem Spielmodus hast du alle Zeit der Welt für ein entspanntes Solo-Lernen.',
    timeLimitTeamBattle:
      'Team Battle ➡️ Für jede Frage habt ihr gemeinsam 15 Sekunden Zeit. Die schnellste richtige Antwort zählt.',
    timeLimitDuell:
      'Duell ➡️ Für die Beantwortung der Frage haben dein Gegner und du 10 Sekunden Zeit.',

    timeLimitPurpose:
      'Warum gibt es eine Zeitbegrenzung für die Beantwortung der Quiz-Fragen?',
    timeLimitReasoning:
      'Die Zeitbegrenzung gibt es, um dir eine möglichst Prüfungs-nahe Vorbereitung bieten zu können, da es dort meistens auch eine Zeitbegrenzung gibt. Zudem macht es das Spiel doch spannend, wenn ein bisschen Druck da ist, oder? Gleichzeitig ist es natürlich ebenso wichtig, ganz entspannt und ohne Druck lernen zu können. Das geht dann im Spielmodus Solo Mission.',

    // Features Section
    wisecoins: 'Was sind Wisecoins und warum gibt es sie?',
    wisecoinsDesc:
      'Wisecoins sind die Ingame-Währung in QUIZDOM. Sie werden für das erfolgreiche Absolvieren von Quizzes vergeben und sollen in Zukunft für verschiedene Verbesserungen und Belohnungen eingesetzt werden können.',

    hearts:
      'Wofür gibt es während eines Quiz Herzen und was sollte ich alles dazu wissen?',
    heartsDesc:
      'Herzen repräsentieren dein Leben während eines Quiz. Bei falschen Antworten oder beim Erreichen der Zeitbegrenzung verlierst du Herzen. Hast du alle Herzen verloren, ist das Quiz beendet.',

    aiWizard: 'Was ist der AI Wizard und wo finde ich ihn?',
    aiWizardDesc:
      'Der AI Wizard ist dein persönlicher Lehrmeister, der dir detaillierte Erklärungen zu den richtigen Antworten gibt, um dein Verständnis zu vertiefen. In die prototypische Umsetzung hat er es leider noch nicht geschafft, Zauberer haben eben ihr eigenes Timing: "Ein Zauberer kommt nie zu spät, Frodo Beutlin, ebenso wenig zu früh. Er trifft genau dann ein, wenn er es beabsichtigt." (Gandalf, "Der Herr der Ringe: Die Gefährten")',
    aiWizardDesc2:
      'Wenn du während eines Quiz Fragen markiert hast, dann kannst du sie dir später unter "Markierte Fragen" in dem Fach zu dem sie gehören wieder ansehen und dort findest du dann auch den AI Wizard.',

    explanations:
      'Gibt es weiterführende Erklärungen, warum einzelne Antworten richtig sind?',
    explanationsDesc:
      'Sobald der AI Wizard seinen Weg ins Spiel gefunden hat, bietet er detaillierte Erklärungen zu den richtigen Antworten, um dein Verständnis zu vertiefen.',

    progressTracking: 'Wie kann ich in QUIZDOM meinen Fortschritt verfolgen?',
    progressTrackingDesc:
      'Ihr Fortschritt wird automatisch gespeichert und kann über die "Fortschritt"-Seite eingesehen werden. Dort sehen Sie Ihre Statistiken, verdiente Badges und gesammelte Wisecoins.',

    bookmarkQuestions:
      'Kann ich mir Quiz-Fragen während eines Quiz/Spiels abspeichern?',
    bookmarkQuestionsDesc:
      'Ja, du kannst Fragen markieren und später unter "Markierte Fragen" in dem Fach, zu dem sie gehören wiederfinden, um sie erneut zu üben.',

    markedQuestions: 'Was sind markierte Fragen?',
    markedQuestionsDesc:
      'Markierte Fragen sind Fragen, die du für ein späteres Wiederholen oder für die Erklärung durch den AI Wizard gespeichert hast. Diese findest du, unter "Markierte Fragen" in dem Fach, zu dem sie gehören. Zu einem späteren Zeitpunkt, bietet dir das auch die Möglichkeit, dir die richtige Antwort vom AI Wizard erklären zu lassen.',

    // Account Section
    needAccount:
      'Brauche ich für QUIZDOM ein Konto und wie kann ich mir eines anlegen?',
    needAccountDesc:
      'Ja, für die vollständige QUIZDOM-Erfahrung benötigst du ein Konto. Klick auf "Registrieren" und folge den Anweisungen.',

    changePassword: 'Wie kann ich mein Passwort ändern bzw. zurücksetzen?',
    changePasswordDesc:
      'Nutze die "Passwort vergessen?"-Funktion auf der Anmeldeseite oder ändere dein Passwort in den Profileinstellungen.',

    editProfile: 'Wie kann ich meine Profilinformationen ändern?',
    editProfileDesc:
      'Gehe zu deinem Profil (Bild oben rechts in der Navigationsleiste) und klicke auf "Bearbeiten", um Profilbild, Benutzername oder E-Mail-Adresse zu ändern.',

    deleteAccount: 'Wie kann ich mein Konto und meine Daten löschen?',
    deleteAccountDesc:
      'Die Kontolöschung erfolgt über die Profileinstellungen.',

    // FAQ Section
    faqTitle: 'Häufig gestellte Fragen (FAQ)',

    // Support Section
    supportTitle: 'Benutzersupport',
    supportDesc:
      'In der aktuellen prototypischen Umsetzung gibt es keinen direkten Benutzersupport. Fragen, Wünsche, Fehler sowie Lob und Kritik können Sie gerne an example@quizdom.com senden. Bitte haben Sie Verständnis dafür, dass wir es vermutlich nicht schaffen auf jede E-Mail zu antworten.',

    contactEmail: 'Kontakt: example@quizdom.com',
  },

  // Profile
  profile: {
    pageTitle: 'Profil | Quizdom',
    pageDescription: 'Verwalten Sie Ihr Quizdom-Profil.',
    title: 'Profil',
    subtitle: 'Verwalten Sie Ihr Quizdom-Profil und Ihre Einstellungen.',
    editProfile: 'Profil bearbeiten',
    saveChanges: 'Änderungen speichern',
    saving: 'Speichert...',
    role: {
      admin: 'Administrator',
      player: 'Spieler',
    },
    fields: {
      nickname: 'Nickname',
      nicknamePlaceholder: 'Geben Sie Ihren Nickname ein',
      avatar: 'Avatar auswählen',
      bio: 'Bio',
      bioPlaceholder: 'Erzählen Sie etwas über sich...',
      bioHelper: '{chars} / {max} Zeichen',
    },
    errors: {
      nicknameMin: 'Nickname muss mindestens 3 Zeichen lang sein',
      nicknameMax: 'Nickname darf maximal 50 Zeichen lang sein',
      bioMax: 'Bio darf maximal 500 Zeichen lang sein',
      updateFailed: 'Profil konnte nicht aktualisiert werden',
      nicknameAlreadyTaken: 'Dieser Nickname ist bereits vergeben',
      invalidInput: 'Ungültige Eingabe',
      deleteFailed: 'Konto konnte nicht gelöscht werden',
    },
    success: {
      profileUpdated: 'Profil erfolgreich aktualisiert',
    },
    dangerZone: {
      title: 'Gefahrenzone',
      deleteWarning: 'Das Löschen Ihres Kontos ist endgültig. Alle Ihre Daten werden unwiderruflich gelöscht.',
      deleteButton: 'Konto löschen',
    },
    deleteModal: {
      title: 'Konto löschen',
      message: 'Sind Sie sicher, dass Sie Ihr Konto löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
      inputPlaceholder: 'Geben Sie Ihren Nickname zur Bestätigung ein',
      confirm: 'Konto löschen',
      deleting: 'Lösche Konto...',
    },
  },

  // Goodbye page
  goodbye: {
    pageTitle: 'Auf Wiedersehen | Quizdom',
    pageDescription: 'Ihr Konto wurde deaktiviert.',
    title: 'Auf Wiedersehen!',
    message: 'Dein Konto wurde deaktiviert. Hoffentlich bis bald!',
    homeButton: 'Zur Startseite',
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
