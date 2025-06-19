import type { Route } from "./+types/home";
import { useState } from "react";
import { Link, Navigate } from "react-router";
import { useAuth } from "../contexts/auth";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Quizdom - Rise of the Wise" },
    { name: "description", content: "Welcome to Quizdom - Das ultimative Quiz-Erlebnis!" },
  ];
}

// Mock data for topics
const availableTopics = [
  {
    id: "it-project-management",
    title: "IT-PROJEKT-MANAGEMENT",
    image: "/topics/IT-projectmanagement.png",
    description: "Projektmanagement in der IT-Welt"
  },
  {
    id: "math",
    title: "MATHE",
    image: "/topics/Math.png",
    description: "Mathematische Grundlagen und fortgeschrittene Konzepte"
  }
];

// Mock data for online users
const onlineUsers = [
  { id: "1", username: "Player1", avatar: "/avatars/player_male_with_greataxe.png" },
  { id: "2", username: "WizardMaster", avatar: "/avatars/ai_assistant_wizard.png" },
  { id: "3", username: "SwordQueen", avatar: "/avatars/player_female_sword_magic.png" },
  { id: "4", username: "Player4", avatar: "/avatars/player_male_with_greataxe.png" },
  { id: "5", username: "Player5", avatar: "/avatars/player_female_sword_magic.png" }
];

// Mock data for recent achievements
const recentAchievements = [
  { id: "1", title: "First Quiz", badge: "/badges/badge_book_1.png" },
  { id: "2", title: "Quiz Master", badge: "/badges/badge_book_2.png" }
];

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const { isAuthenticated, isViewingAsAdmin, user, logout } = useAuth();

  // Redirect admins viewing as admin to admin dashboard
  if (isAuthenticated && isViewingAsAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const filteredTopics = availableTopics.filter(topic =>
    topic.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    // Landing page for unauthenticated users
    return (
      <div className="min-h-screen bg-[#061421]">
        {/* Hero Section */}
        <div className="relative min-h-screen flex items-center justify-center px-4">
          {/* Background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#FCC822] opacity-5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FFCD2E] opacity-5 rounded-full blur-3xl"></div>
          </div>

          <div className="relative text-center max-w-4xl mx-auto">
            {/* Logo */}
            <div className="mb-8">
              <img
                src="/logo/Logo_Quizdom_transparent.png"
                alt="Quizdom Logo"
                className="h-64 w-64 mx-auto mb-8 drop-shadow-2xl"
              />
            </div>

            {/* Hero Text */}
            <h1 className="text-6xl md:text-8xl font-bold text-[#FCC822] mb-6 drop-shadow-lg">
              QUIZDOM
            </h1>
            <p className="text-2xl md:text-3xl text-gray-300 mb-4 font-medium">
              Rise of the Wise
            </p>
            <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
              Tauchen Sie ein in die ultimative Quiz-Erfahrung.
              Sammeln Sie Wisecoins, verdienen Sie Badges und beweisen Sie Ihr Wissen!
            </p>

            {/* CTA Button */}
            <Link
              to="/login"
              className="btn-gradient inline-block px-8 py-4 rounded-xl text-xl font-bold transition-all duration-300 hover:scale-110 shadow-2xl"
            >
              Start playing
            </Link>

            {/* Features */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-6 bg-gray-800 bg-opacity-30 rounded-xl backdrop-blur-sm">
                <div className="mb-4">
                  <img src="/wisecoin/wisecoin.png" alt="Wisecoins" className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-[#FCC822] text-lg font-bold mb-2">Wisecoins sammeln</h3>
                <p className="text-gray-300 text-sm">
                  Verdienen Sie Wisecoins für richtige Antworten und kaufen Sie Power-Ups.
                </p>
              </div>

              <div className="p-6 bg-gray-800 bg-opacity-30 rounded-xl backdrop-blur-sm">
                <div className="mb-4">
                  <img src="/badges/badge_book_1.png" alt="Badges" className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-[#FCC822] text-lg font-bold mb-2">Badges verdienen</h3>
                <p className="text-gray-300 text-sm">
                  Schalten Sie einzigartige Achievements frei und zeigen Sie Ihre Erfolge.
                </p>
              </div>

              <div className="p-6 bg-gray-800 bg-opacity-30 rounded-xl backdrop-blur-sm">
                <div className="mb-4">
                  <img src="/playmodi/competitive.png" alt="Multiplayer" className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-[#FCC822] text-lg font-bold mb-2">Verschiedene Modi</h3>
                <p className="text-gray-300 text-sm">
                  Spielen Sie Solo, gegen Freunde oder in spannenden Turnieren.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated user dashboard view
  return (
    <div className="flex flex-col lg:flex-row max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 gap-6 lg:gap-8">
      {/* Main Content */}
      <div className="flex-1 order-1">
        {/* Search Bar */}
        <div className="mb-6 lg:mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Suche nach einem Thema..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-gray-800/80 border border-gray-600 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent text-base sm:text-lg backdrop-blur-sm"
            />
            <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Topics Header */}
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Deine Themen</h2>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredTopics.map((topic) => (
            <Link
              key={topic.id}
              to={`/quizzes?topic=${topic.id}`}
              className="group relative bg-gray-800/70 rounded-xl overflow-hidden border border-gray-600 hover:border-[#FCC822] transition-all duration-300 hover:scale-105 backdrop-blur-sm"
              title={topic.description}
            >
              <div className="aspect-w-16 aspect-h-12">
                <img
                  src={topic.image}
                  alt={topic.title}
                  className="w-full h-40 sm:h-48 object-cover rounded-xl"
                />
              </div>

              {/* Hover tooltip */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="text-center p-3 sm:p-4">
                  <p className="text-white text-xs sm:text-sm font-medium">
                    {topic.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* No results message */}
        {filteredTopics.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-400 text-base sm:text-lg mb-2">Keine Themen gefunden</p>
            <p className="text-gray-500 text-sm">Versuchen Sie einen anderen Suchbegriff</p>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-80 space-y-4 sm:space-y-6 order-2">
        {/* Online Users */}
        <div className="bg-gray-800/80 rounded-xl p-4 sm:p-6 border border-gray-600 backdrop-blur-sm">
          <h3 className="text-[#FCC822] font-bold text-base sm:text-lg mb-3 sm:mb-4">Other Users Online</h3>
          <div className="space-y-2 sm:space-y-3">
            {onlineUsers.slice(0, 6).map((onlineUser) => (
              <div key={onlineUser.id} className="flex items-center space-x-2 sm:space-x-3">
                <img
                  src={onlineUser.avatar}
                  alt={onlineUser.username}
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-green-400"
                />
                <span className="text-white text-xs sm:text-sm font-medium flex-1 truncate">{onlineUser.username}</span>
                <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
              </div>
            ))}
            {onlineUsers.length > 6 && (
              <div className="text-center pt-2">
                <span className="text-[#FCC822] text-xs sm:text-sm font-medium">20+</span>
              </div>
            )}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-gray-800/80 rounded-xl p-4 sm:p-6 border border-gray-600 backdrop-blur-sm">
          <h3 className="text-[#FCC822] font-bold text-base sm:text-lg mb-3 sm:mb-4">Achievements</h3>
          <div className="flex justify-center space-x-2 sm:space-x-3">
            {recentAchievements.map((achievement) => (
              <div key={achievement.id} className="flex flex-col items-center">
                <img
                  src={achievement.badge}
                  alt={achievement.title}
                  className="h-10 w-10 sm:h-12 sm:w-12 mb-1 sm:mb-2"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Current Wisecoins */}
        <div className="bg-gray-800/80 rounded-xl p-4 sm:p-6 border border-gray-600 backdrop-blur-sm">
          <h3 className="text-[#FCC822] font-bold text-base sm:text-lg mb-3 sm:mb-4">Belohnungen</h3>
          <div className="flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3">
            <img
              src="/wisecoin/wisecoin.png"
              alt="Wisecoins"
              className="h-6 w-6 sm:h-8 sm:w-8"
            />
            <span className="text-[#FCC822] text-lg sm:text-2xl font-bold">
              {user?.wisecoins || 0} Wisecoins
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
