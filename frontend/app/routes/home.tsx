import type { QuizData } from "../components/nine-slice-quiz";
import type { Route } from "./+types/home";
import { useState } from "react";
import { Link, Navigate } from "react-router";
import { QuizContainer } from "../components/nine-slice-quiz";
import { MainNav } from "../components/navigation/main-nav";
import { useAuth } from "../contexts/auth";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Quizdom - Rise of the Wise" },
    { name: "description", content: "Welcome to Quizdom - Das ultimative Quiz-Erlebnis!" },
  ];
}

export default function Home() {
  const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>();
  const { isAuthenticated, isViewingAsAdmin } = useAuth();

  // Redirect admins viewing as admin to admin dashboard
  if (isAuthenticated && isViewingAsAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const sampleQuizData: QuizData = {
    question: "Which Quizsystem is the best?",
    answers: [
      { id: "quizdom", text: "Quizdom" },
      { id: "quizduell", text: "Quizduell" },
      { id: "quizpoker", text: "Quizpoker" },
      { id: "quizster", text: "Quizster" },
    ],
  };

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswer(answerId);
    console.log(`Selected answer: ${answerId}`);
  };

  const handleQuestionClick = () => {
    console.log("Question clicked - could show help or play sound");
  };

  if (!isAuthenticated) {
    // Landing page for unauthenticated users
    return (
      <div className="min-h-screen bg-[#061421]">
        <MainNav />
        
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

  // Authenticated user view with quiz
  return (
    <div className="min-h-screen bg-[#061421]">
      <MainNav />
      <div className="py-8">
        <QuizContainer
          quizData={sampleQuizData}
          selectedAnswer={selectedAnswer}
          onAnswerSelect={handleAnswerSelect}
          onQuestionClick={handleQuestionClick}
        />
      </div>
    </div>
  );
}
