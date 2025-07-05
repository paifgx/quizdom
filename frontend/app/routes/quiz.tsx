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
import { translations } from '../utils/translations';

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
 * Displays a back button, the question title, bookmark button, and an AI assistant button.
 */
function QuizHeader({
  title,
  onBack,
  onAIAssist,
  isBookmarked,
  onToggleBookmark,
}: {
  title: string;
  onBack: () => void;
  onAIAssist: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}) {
  return (
    <div className="relative bg-gray-800/80 rounded-xl border border-gray-600 backdrop-blur-sm p-3 flex justify-between items-center mb-8">
      <button
        onClick={onBack}
        className="flex items-center text-white hover:text-[#FCC822] transition-colors duration-200 font-bold py-2 px-4 rounded-lg cursor-pointer"
      >
        <img src="/buttons/Left.png" alt="Zurück" className="h-6 w-6 mr-2" />
        <span>{translations.common.back}</span>
      </button>
      <h1 className="absolute left-1/2 -translate-x-1/2 text-xl font-bold text-white text-center max-w-md truncate">
        {title}
      </h1>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleBookmark}
          className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
            isBookmarked
              ? 'bg-[#FCC822]/20 border-2 border-[#FCC822]'
              : 'bg-gray-700/50 border-2 border-gray-600 hover:border-gray-500'
          }`}
          title={isBookmarked ? 'Markierung entfernen' : 'Frage markieren'}
        >
          <span
            className={`text-lg font-bold ${isBookmarked ? 'text-[#FCC822]' : 'text-gray-400'}`}
          >
            {isBookmarked ? '★' : '☆'}
          </span>
        </button>
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

interface BookmarkedQuestionData {
  id: string;
  text: string;
  answers: string[];
  topicTitle: string;
  bookmarkedAt: string;
}

/**
 * Creates TopicQuestion objects from bookmarked question data
 */
function createTopicQuestionsFromBookmarks(
  bookmarkedQuestionIds: string[],
  bookmarkedQuestionsData: Record<string, BookmarkedQuestionData>,
  topicTitle: string
): TopicQuestion[] {
  return bookmarkedQuestionIds.map((questionId, index) => {
    const questionData = bookmarkedQuestionsData[questionId];

    if (questionData) {
      // Use the actual question data
      return {
        id: questionData.id,
        number: index + 1,
        title: questionData.text,
        questionText: questionData.text,
        answers: questionData.answers.map(
          (answer: string, answerIndex: number) => ({
            id: (answerIndex + 1).toString(),
            text: answer,
          })
        ),
        correctAnswerId: '1', // We don't store the correct answer, so default to first
        isBookmarked: true,
        isCompleted: false,
        difficulty: 2, // Default difficulty
      };
    } else {
      // Fallback for missing data
      return {
        id: questionId,
        number: index + 1,
        title: `Markierte Frage ${index + 1}`,
        questionText: `Diese markierte Frage aus "${topicTitle}" konnte nicht geladen werden.`,
        answers: [
          { id: '1', text: 'Antwort A' },
          { id: '2', text: 'Antwort B' },
          { id: '3', text: 'Antwort C' },
          { id: '4', text: 'Antwort D' },
        ],
        correctAnswerId: '1',
        isBookmarked: true,
        isCompleted: false,
        difficulty: 2,
      };
    }
  });
}

/**
 * Finds bookmarked questions data by checking all possible topic titles
 */
function findBookmarkedQuestionsData(_topicId: string): {
  questionIds: string[];
  questionData: Record<string, BookmarkedQuestionData>;
  topicTitle: string;
} {
  const localStorageKeys = Object.keys(localStorage);
  const bookmarkedKeys = localStorageKeys.filter(
    key => key.startsWith('bookmarked_') && !key.includes('questions_data')
  );

  // Try to find matching data
  for (const key of bookmarkedKeys) {
    const topicTitle = key.replace('bookmarked_', '');
    const dataKey = `bookmarked_questions_data_${topicTitle}`;

    if (localStorageKeys.includes(dataKey)) {
      try {
        const questionIds = JSON.parse(localStorage.getItem(key) || '[]');
        const questionData = JSON.parse(localStorage.getItem(dataKey) || '{}');

        if (questionIds.length > 0) {
          return { questionIds, questionData, topicTitle };
        }
      } catch (error) {
        console.error('Error parsing localStorage data:', error);
      }
    }
  }

  return { questionIds: [], questionData: {}, topicTitle: 'General Knowledge' };
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

  const toggleBookmark = () => {
    if (!question) return;

    // Find the topic title from localStorage
    const { topicTitle } = findBookmarkedQuestionsData(topicId!);

    // Get current bookmarked questions
    const bookmarkedKey = `bookmarked_${topicTitle}`;
    const bookmarkedDataKey = `bookmarked_questions_data_${topicTitle}`;

    const currentBookmarked = JSON.parse(
      localStorage.getItem(bookmarkedKey) || '[]'
    );
    const currentBookmarkedData = JSON.parse(
      localStorage.getItem(bookmarkedDataKey) || '{}'
    );

    if (question.isBookmarked) {
      // Remove bookmark
      const newBookmarked = currentBookmarked.filter(
        (id: string) => id !== question.id
      );
      delete currentBookmarkedData[question.id];

      localStorage.setItem(bookmarkedKey, JSON.stringify(newBookmarked));
      localStorage.setItem(
        bookmarkedDataKey,
        JSON.stringify(currentBookmarkedData)
      );

      // Navigate to next bookmarked question or back to topic
      const currentIndex = bookmarkedQuestions.findIndex(
        q => q.id === question.id
      );
      const nextQuestion =
        bookmarkedQuestions[currentIndex + 1] ||
        bookmarkedQuestions[currentIndex - 1];

      if (nextQuestion) {
        // Navigate to next/previous bookmarked question
        navigate(`/topics/${topicId}/questions/${nextQuestion.id}`);
      } else {
        // No more bookmarked questions, go back to topic
        navigate(`/topics/${topicId}`);
      }
    } else {
      // Add bookmark
      const newBookmarked = [...currentBookmarked, question.id];
      currentBookmarkedData[question.id] = {
        id: question.id,
        text: question.questionText,
        answers: question.answers.map(a => a.text),
        topicTitle: topicTitle,
        bookmarkedAt: new Date().toISOString(),
      };

      localStorage.setItem(bookmarkedKey, JSON.stringify(newBookmarked));
      localStorage.setItem(
        bookmarkedDataKey,
        JSON.stringify(currentBookmarkedData)
      );

      // Refresh the page to reflect changes
      window.location.reload();
    }
  };

  useEffect(() => {
    setSelectedAnswer(undefined);

    if (!topicId || !questionId) return;

    const loadQuestions = async () => {
      try {
        setLoading(true);

        // Load topic data from backend (might be empty)
        let topicData;
        try {
          topicData = await fetchTopicDetailData(topicId);
        } catch {
          // If backend fails, create minimal topic data
          topicData = {
            id: topicId,
            title: 'General Knowledge', // Default title
            description: '',
            image: '',
            totalQuestions: 0,
            completedQuestions: 0,
            bookmarkedQuestions: 0,
            stars: 1,
            questions: [],
            isFavorite: false,
            wisecoinReward: 0,
          };
        }

        // Load bookmarked questions from localStorage (try to find any available data)
        const {
          questionIds: bookmarkedQuestionIds,
          questionData: bookmarkedQuestionsData,
          topicTitle: actualTopicTitle,
        } = findBookmarkedQuestionsData(topicId);
        const bookmarkedQuestions = createTopicQuestionsFromBookmarks(
          bookmarkedQuestionIds,
          bookmarkedQuestionsData,
          actualTopicTitle
        );

        // For bookmarked questions, prioritize localStorage data
        const currentQ = bookmarkedQuestions.find(q => q.id === questionId);

        if (!currentQ) {
          // If not found in bookmarked questions, try backend questions
          const backendQ = topicData.questions.find(q => q.id === questionId);
          if (!backendQ) {
            throw new Error('Question not found in topic data');
          }
          // Check if this backend question is bookmarked
          const isBackendQuestionBookmarked =
            bookmarkedQuestionIds.includes(questionId);
          const backendQuestionWithBookmark = {
            ...backendQ,
            isBookmarked: isBackendQuestionBookmarked,
          };
          setQuestion(backendQuestionWithBookmark);
          setBookmarkedQuestions(bookmarkedQuestions);
          setCurrentQuestionIndex(-1); // Not in bookmarked questions
        } else {
          setQuestion(currentQ);
          setBookmarkedQuestions(bookmarkedQuestions);
          const currentIndex = bookmarkedQuestions.findIndex(
            q => q.id === questionId
          );
          setCurrentQuestionIndex(currentIndex);
        }
      } catch (error) {
        console.error('Error loading question:', error);
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
        isBookmarked={question.isBookmarked}
        onToggleBookmark={toggleBookmark}
      />
      <QuizContainer
        quizData={quizData}
        selectedAnswer={selectedAnswer}
        onAnswerSelect={setSelectedAnswer}
      />
      {bookmarkedQuestions.length > 0 && (
        <QuizNavigation
          prevId={prevQuestionId}
          nextId={nextQuestionId}
          topicId={topicId!}
        />
      )}
    </div>
  );
}
