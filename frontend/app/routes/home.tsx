import type { QuizData } from "../../components/nine-slice-quiz";
import type { Route } from "./+types/home";
import { useState } from "react";
import { QuizContainer } from "../../components/nine-slice-quiz";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>();

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

  return (
    <div
      style={{
        backgroundColor: "#061421",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <QuizContainer
        quizData={sampleQuizData}
        selectedAnswer={selectedAnswer}
        onAnswerSelect={handleAnswerSelect}
        onQuestionClick={handleQuestionClick}
      />
    </div>
  );
}
