/**
 * Quiz page for a single question.
 * Displays a question and its answers using the 9-slice quiz components.
 * Includes header with navigation and question title, and navigation for bookmarked questions.
 */
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { QuizContainer } from '../components/nine-slice-quiz';
import type { TopicQuestion } from '../types/topic-detail';
import { LoadingSpinner } from '../components/home/loading-spinner';
import { translations } from '../utils/translations';
import { questionAdminService } from '../services/question-admin';

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
  onBack,
  onAIAssist,
  isBookmarked,
  onToggleBookmark,
  topicTitle,
}: {
  onBack: () => void;
  onAIAssist: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  topicTitle: string;
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
      <div className="absolute left-1/2 -translate-x-1/2 text-center">
        <div className="text-sm text-gray-400 mb-1">gemerkte Fragen</div>
        <h1 className="text-xl font-bold text-white max-w-md truncate">
          {topicTitle}
        </h1>
      </div>
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
  answers: Array<{ id: string; text: string }>;
  topicTitle: string;
  bookmarkedAt: string;
  correctAnswerId?: string;
}

function useCompletedQuestions(topicId: string | undefined) {
  const markAsCompleted = (questionId: string) => {
    if (!topicId) return;

    const completedKey = `completed_${topicId}`;
    try {
      const completedRaw = localStorage.getItem(completedKey) || '[]';
      const completed: string[] = JSON.parse(completedRaw);
      if (!completed.includes(questionId)) {
        completed.push(questionId);
        localStorage.setItem(completedKey, JSON.stringify(completed));
      }
    } catch (e) {
      console.error('Failed to update completed questions:', e);
    }
  };

  return { markAsCompleted };
}

/**
 * Creates TopicQuestion objects from bookmarked question data.
 */
function createTopicQuestionsFromBookmarks(
  bookmarkedQuestionIds: string[],
  bookmarkedQuestionsData: Record<string, BookmarkedQuestionData>,
  topicTitle: string
): TopicQuestion[] {
  return bookmarkedQuestionIds.map((questionId, index) => {
    const questionData = bookmarkedQuestionsData[questionId];

    if (questionData) {
      // Handles both old (string-based) and new (object-based) answer formats.
      const validatedAnswers = questionData.answers.map((answer, i) =>
        typeof answer === 'string'
          ? { id: (i + 1).toString(), text: answer }
          : { id: answer.id, text: answer.text }
      );

      return {
        id: questionData.id,
        number: index + 1,
        title: questionData.text,
        questionText: questionData.text,
        answers: validatedAnswers,
        correctAnswerId: questionData.correctAnswerId || '1',
        isBookmarked: true,
        isCompleted: false,
        difficulty: 2, // Default difficulty
      };
    }
    // Fallback for missing data.
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
  });
}

/**
 * Finds bookmarked questions data by checking all possible topic titles.
 * @note This is inefficient as it scans all of localStorage. A better
 * implementation would use a predictable key or a single entry for all bookmarks.
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
 * Loads questions from the backend and maps them to the TopicQuestion format.
 */
async function loadQuestionsFromBackend(
  topicId: string
): Promise<TopicQuestion[]> {
  try {
    const questions = await questionAdminService.getQuestions();
    const topicQuestions = questions.filter(q => q.topicId === topicId);

    return topicQuestions.map(q => {
      const correctAnswer = q.answers.find(a => a.isCorrect);
      return {
        id: q.id,
        number: 1, // Not provided by backend.
        title: q.content,
        questionText: q.content,
        answers: q.answers.map(a => ({
          id: a.id,
          text: a.content,
        })),
        correctAnswerId: correctAnswer?.id || '1',
        isBookmarked: false,
        isCompleted: false,
        difficulty: q.difficulty,
      };
    });
  } catch (error) {
    console.error('Failed to load questions from backend:', error);
    return [];
  }
}

/**
 * Main component for the quiz page.
 * Fetches question data, handles state, and renders the quiz UI.
 */
export default function QuizPage() {
  const { topicId, questionId } = useParams();
  const navigate = useNavigate();
  const { markAsCompleted } = useCompletedQuestions(topicId);

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
    if (!question || !topicId) return;

    const { topicTitle } = findBookmarkedQuestionsData(topicId);

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

      const currentIndex = bookmarkedQuestions.findIndex(
        q => q.id === question.id
      );
      const nextQuestion =
        bookmarkedQuestions[currentIndex + 1] ||
        bookmarkedQuestions[currentIndex - 1];

      if (nextQuestion) {
        navigate(`/topics/${topicId}/questions/${nextQuestion.id}`);
      } else {
        navigate(`/topics/${topicId}`);
      }
    } else {
      // Add bookmark
      const newBookmarkedIds = [...currentBookmarked, question.id];
      currentBookmarkedData[question.id] = {
        id: question.id,
        text: question.questionText,
        answers: question.answers.map(a => ({ id: a.id, text: a.text })),
        topicTitle: topicTitle,
        bookmarkedAt: new Date().toISOString(),
        correctAnswerId: question.correctAnswerId,
      };

      localStorage.setItem(bookmarkedKey, JSON.stringify(newBookmarkedIds));
      localStorage.setItem(
        bookmarkedDataKey,
        JSON.stringify(currentBookmarkedData)
      );

      // Update state to avoid page reload
      setQuestion(prev => (prev ? { ...prev, isBookmarked: true } : null));
      const newBookmarkedQuestion = { ...question, isBookmarked: true };
      setBookmarkedQuestions(prev => [...prev, newBookmarkedQuestion]);
    }
  };

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswer(answerId);
    if (question && question.correctAnswerId === answerId) {
      markAsCompleted(question.id);
    }
  };

  useEffect(() => {
    setSelectedAnswer(undefined);

    if (!topicId || !questionId) return;

    const loadQuestions = async () => {
      try {
        setLoading(true);

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

        const currentQ = bookmarkedQuestions.find(q => q.id === questionId);

        if (!currentQ) {
          const backendQuestions = await loadQuestionsFromBackend(topicId);
          const backendQ = backendQuestions.find(q => q.id === questionId);
          if (!backendQ) {
            throw new Error('Question not found in topic data');
          }
          const isBackendQuestionBookmarked =
            bookmarkedQuestionIds.includes(questionId);
          setQuestion({
            ...backendQ,
            isBookmarked: isBackendQuestionBookmarked,
          });
          setBookmarkedQuestions(bookmarkedQuestions);
          setCurrentQuestionIndex(-1);
        } else {
          // If the correct answer isn't set, try to fetch it from the backend.
          if (currentQ.correctAnswerId === '1') {
            const backendQuestions = await loadQuestionsFromBackend(topicId);
            const backendQ = backendQuestions.find(q => q.id === questionId);
            if (backendQ && backendQ.correctAnswerId !== '1') {
              setQuestion({
                ...currentQ,
                correctAnswerId: backendQ.correctAnswerId,
                answers: backendQ.answers,
              });
            } else {
              setQuestion(currentQ);
            }
          } else {
            setQuestion(currentQ);
          }
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

  const correctIndex = question.answers.findIndex(
    a => a.id === question.correctAnswerId
  );

  const { topicTitle } = findBookmarkedQuestionsData(topicId!);

  return (
    <div>
      <QuizHeader
        onBack={() => navigate(`/topics/${topicId}`)}
        onAIAssist={() => window.alert('AI Assistant coming soon!')}
        isBookmarked={question.isBookmarked}
        onToggleBookmark={toggleBookmark}
        topicTitle={topicTitle}
      />
      <QuizContainer
        quizData={quizData}
        selectedAnswer={selectedAnswer}
        onAnswerSelect={handleAnswerSelect}
        showCorrectAnswer={{
          correct: correctIndex,
          selected: selectedAnswer
            ? question.answers.findIndex(a => a.id === selectedAnswer)
            : undefined,
        }}
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
