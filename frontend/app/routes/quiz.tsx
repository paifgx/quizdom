/**
 * Quiz page for a single question.
 * Displays a question and its answers using the 9-slice quiz components.
 * Includes header with navigation and question title, and navigation for bookmarked questions.
 */
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { QuizContainer } from '../components/nine-slice-quiz';
import type { TopicQuestion } from '../types/topic-detail';
import { fetchTopicDetailData } from '../api';
import { LoadingSpinner } from '../components/home/loading-spinner';

export function meta() {
  return [
    { title: 'Frage | Quizdom' },
    {
      name: 'description',
      content: 'Beantworte die Quizfrage.',
    },
  ];
}

/**
 * Header component for the quiz page.
 * Displays a back button, the question title, and an AI assistant button.
 */
function QuizHeader({
  title,
  onBack,
  onAIAssist,
}: {
  title: string;
  onBack: () => void;
  onAIAssist: () => void;
}) {
  return (
    <div className="relative bg-gray-800/80 rounded-xl border border-gray-600 backdrop-blur-sm p-3 flex justify-between items-center mb-8">
      <button
        onClick={onBack}
        className="flex items-center text-white hover:text-[#FCC822] transition-colors duration-200 font-bold py-2 px-4 rounded-lg cursor-pointer"
      >
        <img src="/buttons/Left.png" alt={translations.backAlt} className="h-6 w-6 mr-2" />
        <span>{translations.back}</span>
      </button>
      <h1 className="absolute left-1/2 -translate-x-1/2 text-xl font-bold text-white text-center">
        {title}
      </h1>
      <button
        onClick={onAIAssist}
        className="h-10 w-10 rounded-full flex items-center justify-center bg-blue-500/50 hover:bg-blue-500/80 transition-colors cursor-pointer"
        title="KI-Assistent um Hilfe bitten"
      >
        <img
          src="/avatars/ai_assistant_wizard_gif.gif"
          alt="KI Assistent"
          className="h-8 w-8 object-cover transform -scale-x-100"
        />
      </button>
    </div>
  );
}

/**
 * Navigation component for cycling through bookmarked questions.
 */
function QuizNavigation({
  prevId,
  nextId,
  topicId,
}: {
  prevId?: string;
  nextId?: string;
  topicId: string;
}) {
  if (!prevId && !nextId) {
    return null;
  }
  return (
    <div className="flex justify-between mt-8">
      {prevId ? (
        <Link
          to={`/topics/${topicId}/questions/${prevId}`}
          className="flex items-center text-white hover:text-[#FCC822] transition-colors duration-200 font-bold py-2 px-4 rounded-lg bg-gray-700/50 border border-gray-600"
        >
          <img src="/buttons/Left.png" alt="Zurück" className="h-8 w-8 mr-2" />
          Vorherige Frage
        </Link>
      ) : (
        <div />
      )}
      {nextId ? (
        <Link
          to={`/topics/${topicId}/questions/${nextId}`}
          className="flex items-center text-white hover:text-[#FCC822] transition-colors duration-200 font-bold py-2 px-4 rounded-lg bg-gray-700/50 border border-gray-600"
        >
          Nächste Frage
          <img src="/buttons/Right.png" alt="Weiter" className="h-8 w-8 ml-2" />
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}

/**
 * Main component for the quiz page.
 * Fetches question data, handles state, and renders the quiz UI.
 */
export default function QuizPage() {
  const { topicId, questionId } = useParams();
  const navigate = useNavigate();

  const [question, setQuestion] = useState<TopicQuestion | null>(null);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<
    TopicQuestion[]
  >([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    setSelectedAnswer(undefined);

    if (!topicId || !questionId) return;

    const loadQuestions = async () => {
      try {
        setLoading(true);
        const topicData = await fetchTopicDetailData(topicId);
        const currentQ = topicData.questions.find(q => q.id === questionId);

        if (!currentQ) {
          throw new Error('Question not found in topic data');
        }

        const bookmarked = topicData.questions.filter(q => q.isBookmarked);
        const currentIndex = bookmarked.findIndex(q => q.id === questionId);

        setQuestion(currentQ);
        setBookmarkedQuestions(bookmarked);
        setCurrentQuestionIndex(currentIndex);
      } catch {
        setQuestion(null);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [topicId, questionId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!question) {
    return (
      <div className="text-center text-white py-8">
        <h1 className="text-2xl font-bold mb-4">Frage nicht gefunden</h1>
        <p className="text-gray-300">
          Die angeforderte Frage konnte nicht gefunden werden.
        </p>
        <Link
          to={`/topics/${topicId}`}
          className="text-blue-400 hover:underline mt-4 inline-block"
        >
          Zurück zum Thema
        </Link>
      </div>
    );
  }

  const prevQuestionId =
    currentQuestionIndex > 0
      ? bookmarkedQuestions[currentQuestionIndex - 1]?.id
      : undefined;
  const nextQuestionId =
    currentQuestionIndex !== -1 &&
    currentQuestionIndex < bookmarkedQuestions.length - 1
      ? bookmarkedQuestions[currentQuestionIndex + 1]?.id
      : undefined;

  const quizData = {
    question: question.questionText,
    answers: question.answers,
  };

  return (
    <div>
      <QuizHeader
        title={question.title}
        onBack={() => navigate(`/topics/${topicId}`)}
        onAIAssist={() => window.alert('AI Assistant coming soon!')}
      />
      <QuizContainer
        quizData={quizData}
        selectedAnswer={selectedAnswer}
        onAnswerSelect={setSelectedAnswer}
      />
      {currentQuestionIndex !== -1 && (
        <QuizNavigation
          prevId={prevQuestionId}
          nextId={nextQuestionId}
          topicId={topicId!}
        />
      )}
    </div>
  );
}
