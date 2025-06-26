import type { MetaFunction } from 'react-router';
import { Link } from 'react-router';
import { useState } from 'react';
import { translate } from '../utils/translations';

export const meta: MetaFunction = () => {
  return [
    { title: `${translate('userManual.title')} - QUIZDOM` },
    { name: 'description', content: translate('userManual.welcome') },
  ];
};

/**
 * User Manual Page Component
 *
 * Comprehensive guide for using the QUIZDOM application
 * Includes sections for getting started, gameplay, features, account management, FAQ, and support
 */
export default function UserManual() {
  const [activeSection, setActiveSection] = useState<string>('getting-started');

  const sections = [
    {
      id: 'getting-started',
      title: translate('userManual.gettingStarted'),
      icon: '🚀',
    },
    { id: 'gameplay', title: translate('userManual.gameplay'), icon: '🎮' },
    { id: 'features', title: translate('userManual.features'), icon: '✨' },
    { id: 'account', title: translate('userManual.account'), icon: '👤' },
    { id: 'faq', title: translate('userManual.faq'), icon: '❓' },
    { id: 'support', title: translate('userManual.support'), icon: '💬' },
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-[#061421] border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src="/logo/miniLogo.png"
                alt="Quizdom Logo"
                className="h-12 w-12"
              />
              <div>
                <h1 className="text-3xl font-bold text-[#FCC822]">
                  {translate('userManual.title')}
                </h1>
                <p className="text-gray-300 text-sm">
                  {translate('userManual.subtitle')}
                </p>
              </div>
            </div>
            <Link
              to="/"
              className="btn-gradient px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
            >
              {translate('common.back')}
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Table of Contents */}
          <div className="lg:w-1/4">
            <div className="bg-[#0F1B2D] rounded-xl p-6 border border-gray-700 sticky top-32">
              <h2 className="text-xl font-bold text-[#FCC822] mb-4 flex items-center">
                📖 {translate('userManual.tableOfContents')}
              </h2>
              <nav className="space-y-2">
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-3 ${
                      activeSection === section.id
                        ? 'bg-[#FCC822] text-[#061421]'
                        : 'text-gray-300 hover:text-[#FCC822] hover:bg-[#16213E]'
                    }`}
                  >
                    <span className="text-lg">{section.icon}</span>
                    <span>{section.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Welcome Section */}
            <div className="bg-[#0F1B2D] rounded-xl p-8 border border-gray-700 mb-8">
              <div className="flex items-center space-x-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#FCC822]">
                    🧙‍♂️ {translate('userManual.welcome')}
                  </h2>
                </div>
              </div>
            </div>

            {/* Getting Started Section */}
            <section id="getting-started" className="mb-12">
              <div className="bg-[#0F1B2D] rounded-xl p-8 border border-gray-700">
                <h2 className="text-2xl font-bold text-[#FCC822] mb-6 flex items-center">
                  🚀 {translate('userManual.gettingStarted')}
                </h2>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                      {translate('userManual.whatIsQuizdom')}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {translate('userManual.whatIsQuizdomDesc')}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                      {translate('userManual.howToPlay')}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {translate('userManual.howToPlayDesc')}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">
                      {translate('userManual.compatibility')}
                    </h3>

                    <div className="bg-[#16213E] rounded-lg p-6 mb-4">
                      <h4 className="text-lg font-medium text-[#FCC822] mb-3">
                        {translate('userManual.browserCompatibility')}
                      </h4>
                      <p className="text-gray-300 mb-4">
                        {translate('userManual.browserCompatibilityDesc')}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {['Chrome', 'Firefox', 'Safari', 'Edge'].map(
                          browser => (
                            <div
                              key={browser}
                              className="text-center p-3 bg-[#0F1B2D] rounded-lg"
                            >
                              <div className="text-2xl mb-2">🌐</div>
                              <div className="text-sm text-gray-300">
                                {browser}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div className="bg-[#16213E] rounded-lg p-6">
                      <h4 className="text-lg font-medium text-[#FCC822] mb-3">
                        {translate('userManual.deviceCompatibility')}
                      </h4>
                      <p className="text-gray-300 mb-4">
                        {translate('userManual.deviceCompatibilityDesc')}
                      </p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-600">
                              <th className="text-left py-3 px-4 text-[#FCC822]">
                                Gerät
                              </th>
                              <th className="text-left py-3 px-4 text-[#FCC822]">
                                Bildschirmgröße
                              </th>
                            </tr>
                          </thead>
                          <tbody className="text-gray-300">
                            <tr className="border-b border-gray-700">
                              <td className="py-3 px-4">📱 Smartphones</td>
                              <td className="py-3 px-4">≤ 480 px</td>
                            </tr>
                            <tr className="border-b border-gray-700">
                              <td className="py-3 px-4">📟 Tablets</td>
                              <td className="py-3 px-4">481 – 1024 px</td>
                            </tr>
                            <tr>
                              <td className="py-3 px-4">
                                💻 Desktop (PC/Laptop)
                              </td>
                              <td className="py-3 px-4">≥ 1025 px</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Gameplay Section */}
            <section id="gameplay" className="mb-12">
              <div className="bg-[#0F1B2D] rounded-xl p-8 border border-gray-700">
                <h2 className="text-2xl font-bold text-[#FCC822] mb-6 flex items-center">
                  🎮 {translate('userManual.gameplay')}
                </h2>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                      {translate('userManual.topicSelection')}
                    </h3>
                    <p className="text-gray-300 leading-relaxed mb-4">
                      {translate('userManual.topicSelectionDesc')}
                    </p>
                    <div className="space-y-3">
                      <div className="bg-[#16213E] rounded-lg p-4">
                        <p className="text-gray-300">
                          {translate('userManual.topicOption1')}
                        </p>
                      </div>
                      <div className="bg-[#16213E] rounded-lg p-4">
                        <p className="text-gray-300">
                          {translate('userManual.topicOption2')}
                        </p>
                      </div>
                      <div className="bg-[#16213E] rounded-lg p-4">
                        <p className="text-gray-300">
                          {translate('userManual.topicOption3')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                      {translate('userManual.gameModes')}
                    </h3>
                    <p className="text-gray-300 leading-relaxed mb-4">
                      {translate('userManual.gameModesDesc')}
                    </p>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-[#16213E] rounded-lg p-6 text-center">
                        <img
                          src="/playmodi/solo.png"
                          alt="Solo Mode"
                          className="h-16 w-16 mx-auto mb-3 rounded-lg"
                        />
                        <p className="text-gray-300 text-sm">
                          {translate('userManual.soloMode')}
                        </p>
                      </div>
                      <div className="bg-[#16213E] rounded-lg p-6 text-center">
                        <img
                          src="/playmodi/collaborative.png"
                          alt="Collaborative Mode"
                          className="h-16 w-16 mx-auto mb-3 rounded-lg"
                        />
                        <p className="text-gray-300 text-sm">
                          {translate('userManual.collaborativeMode')}
                        </p>
                      </div>
                      <div className="bg-[#16213E] rounded-lg p-6 text-center">
                        <img
                          src="/playmodi/competitive.png"
                          alt="Competitive Mode"
                          className="h-16 w-16 mx-auto mb-3 rounded-lg"
                        />
                        <p className="text-gray-300 text-sm">
                          {translate('userManual.competitiveMode')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                      {translate('userManual.playWithFriends')}
                    </h3>
                    <div className="bg-amber-900 bg-opacity-30 border border-amber-600 rounded-lg p-4">
                      <p className="text-amber-300 font-medium mb-2">
                        Die kurze Antwort: Jein.
                      </p>
                      <p className="text-gray-200 leading-relaxed">
                        {translate('userManual.playWithFriendsDesc')}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                      {translate('userManual.questionTypes')}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {translate('userManual.questionTypesDesc')}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                      {translate('userManual.timeLimit')}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {translate('userManual.timeLimitDesc')}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section id="features" className="mb-12">
              <div className="bg-[#0F1B2D] rounded-xl p-8 border border-gray-700">
                <h2 className="text-2xl font-bold text-[#FCC822] mb-6 flex items-center">
                  ✨ {translate('userManual.features')}
                </h2>

                <div className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-[#16213E] rounded-lg p-6">
                      <div className="flex items-center mb-3">
                        <img
                          src="/wisecoin/wisecoin.png"
                          alt="Wisecoins"
                          className="h-8 w-8 mr-3"
                        />
                        <h3 className="text-lg font-semibold text-[#FCC822]">
                          {translate('userManual.wisecoins')}
                        </h3>
                      </div>
                      <p className="text-gray-300 text-sm">
                        {translate('userManual.wisecoinsDesc')}
                      </p>
                    </div>

                    <div className="bg-[#16213E] rounded-lg p-6">
                      <div className="flex items-center mb-3">
                        <img
                          src="/hearts/heart_full.png"
                          alt="Hearts"
                          className="h-8 w-8 mr-3"
                        />
                        <h3 className="text-lg font-semibold text-[#FCC822]">
                          {translate('userManual.hearts')}
                        </h3>
                      </div>
                      <p className="text-gray-300 text-sm">
                        {translate('userManual.heartsDesc')}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                      <img
                        src="/avatars/ai_assistant_wizard.png"
                        alt="AI Wizard"
                        className="h-8 w-8 mr-3 rounded-full"
                      />
                      {translate('userManual.aiWizard')}
                    </h3>
                    <p className="text-gray-300 leading-relaxed mb-4">
                      {translate('userManual.aiWizardDesc')}
                    </p>
                    <div className="bg-[#16213E] rounded-lg p-4">
                      <h4 className="text-lg font-medium text-[#FCC822] mb-2">
                        {translate('userManual.explanations')}
                      </h4>
                      <p className="text-gray-300 text-sm">
                        {translate('userManual.explanationsDesc')}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                      {translate('userManual.progressTracking')}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {translate('userManual.progressTrackingDesc')}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-[#16213E] rounded-lg p-6">
                      <h4 className="text-lg font-medium text-[#FCC822] mb-3">
                        {translate('userManual.bookmarkQuestions')}
                      </h4>
                      <p className="text-gray-300 text-sm">
                        {translate('userManual.bookmarkQuestionsDesc')}
                      </p>
                    </div>

                    <div className="bg-[#16213E] rounded-lg p-6">
                      <h4 className="text-lg font-medium text-[#FCC822] mb-3">
                        {translate('userManual.markedQuestions')}
                      </h4>
                      <p className="text-gray-300 text-sm">
                        {translate('userManual.markedQuestionsDesc')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Account Section */}
            <section id="account" className="mb-12">
              <div className="bg-[#0F1B2D] rounded-xl p-8 border border-gray-700">
                <h2 className="text-2xl font-bold text-[#FCC822] mb-6 flex items-center">
                  👤 {translate('userManual.account')}
                </h2>

                <div className="space-y-6">
                  <div className="bg-[#16213E] rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-3">
                      {translate('userManual.needAccount')}
                    </h3>
                    <p className="text-gray-300">
                      {translate('userManual.needAccountDesc')}
                    </p>
                  </div>

                  <div className="bg-[#16213E] rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-3">
                      {translate('userManual.changePassword')}
                    </h3>
                    <p className="text-gray-300">
                      {translate('userManual.changePasswordDesc')}
                    </p>
                  </div>

                  <div className="bg-[#16213E] rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-3">
                      {translate('userManual.editProfile')}
                    </h3>
                    <p className="text-gray-300">
                      {translate('userManual.editProfileDesc')}
                    </p>
                  </div>

                  <div className="bg-red-900 bg-opacity-20 border border-red-500 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-red-400 mb-3">
                      {translate('userManual.deleteAccount')}
                    </h3>
                    <p className="text-gray-300">
                      {translate('userManual.deleteAccountDesc')}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="mb-12">
              <div className="bg-[#0F1B2D] rounded-xl p-8 border border-gray-700">
                <h2 className="text-2xl font-bold text-[#FCC822] mb-6 flex items-center">
                  ❓ {translate('userManual.faqTitle')}
                </h2>

                <div className="space-y-4">
                  {/* FAQ items will be populated with common questions */}
                  <details className="bg-[#16213E] rounded-lg">
                    <summary className="p-4 cursor-pointer text-white font-medium hover:text-[#FCC822] transition-colors">
                      Wie starte ich mein erstes Quiz?
                    </summary>
                    <div className="px-4 pb-4 text-gray-300">
                      <p>
                        Melden Sie sich an, gehen Sie zu "Themen", wählen Sie
                        ein Thema aus und klicken Sie auf "SPIELEN".
                      </p>
                    </div>
                  </details>

                  <details className="bg-[#16213E] rounded-lg">
                    <summary className="p-4 cursor-pointer text-white font-medium hover:text-[#FCC822] transition-colors">
                      Was passiert, wenn ich eine Frage falsch beantworte?
                    </summary>
                    <div className="px-4 pb-4 text-gray-300">
                      <p>
                        Sie verlieren ein Herz und erhalten eine Erklärung der
                        richtigen Antwort vom AI Wizard.
                      </p>
                    </div>
                  </details>

                  <details className="bg-[#16213E] rounded-lg">
                    <summary className="p-4 cursor-pointer text-white font-medium hover:text-[#FCC822] transition-colors">
                      Kann ich mein Quiz pausieren?
                    </summary>
                    <div className="px-4 pb-4 text-gray-300">
                      <p>
                        In der aktuellen Version ist das Pausieren von Quiz
                        nicht möglich. Planen Sie ausreichend Zeit für Ihr Quiz
                        ein.
                      </p>
                    </div>
                  </details>

                  <details className="bg-[#16213E] rounded-lg">
                    <summary className="p-4 cursor-pointer text-white font-medium hover:text-[#FCC822] transition-colors">
                      Wie kann ich meine Statistiken einsehen?
                    </summary>
                    <div className="px-4 pb-4 text-gray-300">
                      <p>
                        Ihre Statistiken finden Sie auf der "Fortschritt"-Seite
                        und in Ihrem Profil.
                      </p>
                    </div>
                  </details>

                  <details className="bg-[#16213E] rounded-lg">
                    <summary className="p-4 cursor-pointer text-white font-medium hover:text-[#FCC822] transition-colors">
                      Gibt es eine mobile App?
                    </summary>
                    <div className="px-4 pb-4 text-gray-300">
                      <p>
                        Aktuell ist QUIZDOM nur als Web-App verfügbar, die auf
                        allen Geräten responsive funktioniert.
                      </p>
                    </div>
                  </details>
                </div>
              </div>
            </section>

            {/* Support Section */}
            <section id="support" className="mb-12">
              <div className="bg-[#0F1B2D] rounded-xl p-8 border border-gray-700">
                <h2 className="text-2xl font-bold text-[#FCC822] mb-6 flex items-center">
                  💬 {translate('userManual.supportTitle')}
                </h2>

                <div className="bg-[#16213E] rounded-lg p-6">
                  <p className="text-gray-300 leading-relaxed mb-4">
                    {translate('userManual.supportDesc')}
                  </p>
                  <div className="flex items-center space-x-3 p-4 bg-[#0F1B2D] rounded-lg">
                    <span className="text-2xl">📧</span>
                    <span className="text-[#FCC822] font-medium">
                      {translate('userManual.contactEmail')}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
