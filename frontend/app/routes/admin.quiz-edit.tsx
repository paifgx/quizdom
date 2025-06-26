import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ProtectedRoute } from '../components/auth/protected-route';
import { quizAdminService } from '../services/quiz-admin';
import {
  questionAdminService,
  type Topic,
  type Question,
} from '../services/question-admin';
import type {
  CreateQuizPayload,
  UpdateQuizPayload,
  QuizDifficulty,
  QuizSettings,
  CreateQuizBatchPayload,
} from '../types/quiz';
import { getDifficultyName } from '../utils/difficulty';

export function meta() {
  return [
    { title: 'Quiz bearbeiten | Quizdom Admin' },
    {
      name: 'description',
      content: 'Erstellen oder bearbeiten Sie ein Quiz.',
    },
  ];
}

export default function AdminQuizEditPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const isNewQuiz = quizId === 'new';

  // State management
  const [loading, setLoading] = useState(!isNewQuiz);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 1 as QuizDifficulty,
    tags: [] as string[],
    imageUrl: '',
    estimatedDuration: 15,
  });

  const [settings, setSettings] = useState<QuizSettings>({
    randomizeQuestions: false,
    randomizeAnswers: false,
    showExplanations: true,
    allowSkipping: false,
    showProgress: true,
    passingScore: 70,
    maxAttempts: undefined,
  });

  // Filter state for questions
  const [questionFilters, setQuestionFilters] = useState({
    topicId: '',
    difficulty: 'all' as 'all' | QuizDifficulty,
    search: '',
  });

  // Inline question creation state
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    content: '',
    explanation: '',
    difficulty: 1 as QuizDifficulty,
    answers: [
      { content: '', isCorrect: false },
      { content: '', isCorrect: false },
    ],
  });
  const [creatingQuestion, setCreatingQuestion] = useState(false);
  const [createdQuestions, setCreatedQuestions] = useState<
    Array<{
      content: string;
      explanation?: string;
      difficulty: QuizDifficulty;
      answers: Array<{ content: string; isCorrect: boolean }>;
    }>
  >([]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load topics and questions in parallel
      const [topicsData, questionsData] = await Promise.all([
        questionAdminService.getTopics(),
        questionAdminService.getQuestions(),
      ]);

      setTopics(topicsData);
      setAvailableQuestions(questionsData);

      // Load quiz data if editing
      if (!isNewQuiz && quizId) {
        const quizData = await quizAdminService.getQuizById(quizId);

        setFormData({
          title: quizData.title,
          description: quizData.description,
          difficulty: quizData.difficulty,
          tags: quizData.tags,
          imageUrl: quizData.imageUrl || '',
          estimatedDuration: quizData.estimatedDuration,
        });

        setSettings(quizData.settings);
        setSelectedQuestions(quizData.questions.map(q => q.id));
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Fehler beim Laden der Daten. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  }, [isNewQuiz, quizId]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | number | string[] | QuizDifficulty
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSettingsChange = (
    field: keyof QuizSettings,
    value: boolean | number
  ) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    setFormData(prev => ({ ...prev, tags }));
  };

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const selectAllQuestions = () => {
    const filtered = getFilteredQuestions();
    const allIds = filtered.map(q => q.id);
    setSelectedQuestions(prev => [...new Set([...prev, ...allIds])]);
  };

  const deselectAllQuestions = () => {
    const filtered = getFilteredQuestions();
    const filteredIds = new Set(filtered.map(q => q.id));
    setSelectedQuestions(prev => prev.filter(id => !filteredIds.has(id)));
  };

  const getFilteredQuestions = () => {
    return availableQuestions.filter(question => {
      const matchesTopic =
        !questionFilters.topicId ||
        question.topicId === questionFilters.topicId;
      const matchesDifficulty =
        questionFilters.difficulty === 'all' ||
        parseInt(question.difficulty?.toString() || '1') ===
          questionFilters.difficulty;
      const matchesSearch =
        !questionFilters.search ||
        question.content
          .toLowerCase()
          .includes(questionFilters.search.toLowerCase());

      return matchesTopic && matchesDifficulty && matchesSearch;
    });
  };

  // Inline question creation functions
  const handleNewQuestionChange = (
    field: string,
    value: string | QuizDifficulty
  ) => {
    setNewQuestion(prev => ({ ...prev, [field]: value }));
  };

  const handleNewQuestionAnswerChange = (
    index: number,
    field: 'content' | 'isCorrect',
    value: string | boolean
  ) => {
    setNewQuestion(prev => ({
      ...prev,
      answers: prev.answers.map((answer, i) =>
        i === index ? { ...answer, [field]: value } : answer
      ),
    }));
  };

  const addNewQuestionAnswer = () => {
    if (newQuestion.answers.length < 6) {
      setNewQuestion(prev => ({
        ...prev,
        answers: [...prev.answers, { content: '', isCorrect: false }],
      }));
    }
  };

  const removeNewQuestionAnswer = (index: number) => {
    if (newQuestion.answers.length > 2) {
      setNewQuestion(prev => ({
        ...prev,
        answers: prev.answers.filter((_, i) => i !== index),
      }));
    }
  };

  const validateNewQuestion = (): string | null => {
    if (!newQuestion.content.trim()) {
      return 'Bitte geben Sie den Fragetext ein.';
    }

    const validAnswers = newQuestion.answers.filter(answer =>
      answer.content.trim()
    );
    if (validAnswers.length < 2) {
      return 'Mindestens 2 Antworten müssen ausgefüllt sein.';
    }

    const correctAnswers = newQuestion.answers.filter(
      answer => answer.isCorrect && answer.content.trim()
    );
    if (correctAnswers.length === 0) {
      return 'Mindestens eine Antwort muss als korrekt markiert sein.';
    }

    return null;
  };

  const handleCreateQuestion = async () => {
    const validationError = validateNewQuestion();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setCreatingQuestion(true);
      setError(null);

      const validAnswers = newQuestion.answers.filter(answer =>
        answer.content.trim()
      );

      const questionData = {
        content: newQuestion.content.trim(),
        explanation: newQuestion.explanation.trim() || undefined,
        difficulty: newQuestion.difficulty,
        answers: validAnswers.map(answer => ({
          content: answer.content.trim(),
          isCorrect: answer.isCorrect,
        })),
      };

      // Add to created questions list for batch creation
      setCreatedQuestions(prev => [...prev, questionData]);

      // Reset the form
      setNewQuestion({
        content: '',
        explanation: '',
        difficulty: 1,
        answers: [
          { content: '', isCorrect: false },
          { content: '', isCorrect: false },
        ],
      });
      setShowQuestionForm(false);
    } catch (err) {
      console.error('Failed to create question:', err);
      setError(
        'Fehler beim Erstellen der Frage. Bitte versuchen Sie es erneut.'
      );
    } finally {
      setCreatingQuestion(false);
    }
  };

  const cancelQuestionCreation = () => {
    setNewQuestion({
      content: '',
      explanation: '',
      difficulty: 1,
      answers: [
        { content: '', isCorrect: false },
        { content: '', isCorrect: false },
      ],
    });
    setShowQuestionForm(false);
    setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.title.trim()) {
      return 'Bitte geben Sie einen Titel ein.';
    }

    if (settings.passingScore < 0 || settings.passingScore > 100) {
      return 'Die Bestehensgrenze muss zwischen 0 und 100 liegen.';
    }

    if (settings.maxAttempts && settings.maxAttempts < 1) {
      return 'Die maximale Anzahl der Versuche muss mindestens 1 sein.';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (isNewQuiz) {
        if (createdQuestions.length > 0) {
          const payload: CreateQuizBatchPayload = {
            title: formData.title.trim(),
            description: formData.description.trim(),
            difficulty: formData.difficulty,
            estimatedDuration: formData.estimatedDuration,
            questions: createdQuestions,
          };

          await quizAdminService.createQuizBatch(payload);
        } else {
          const payload: CreateQuizPayload = {
            title: formData.title.trim(),
            description: formData.description.trim(),
            difficulty: formData.difficulty,
            tags: formData.tags,
            imageUrl: formData.imageUrl.trim() || undefined,
            settings,
          };

          await quizAdminService.createQuiz(payload);
        }
      } else if (quizId) {
        const payload: UpdateQuizPayload = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          difficulty: formData.difficulty,
          tags: formData.tags,
          imageUrl: formData.imageUrl.trim() || undefined,
          settings,
        };

        await quizAdminService.updateQuiz(quizId, payload);
      }

      navigate('/admin/quizzes');
    } catch (err) {
      console.error('Failed to save quiz:', err);
      setError(
        'Fehler beim Speichern des Quiz. Bitte versuchen Sie es erneut.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center min-h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FCC822] mx-auto mb-4"></div>
              <p className="text-gray-300">Lade Quiz...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const filteredQuestions = getFilteredQuestions();

  return (
    <ProtectedRoute requireAdmin>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => navigate('/admin/quizzes')}
              className="p-2 text-gray-400 hover:text-[#FCC822] transition-colors duration-200"
            >
              <img src="/buttons/Left.png" alt="Back" className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-[#FCC822]">
                {isNewQuiz ? 'Neues Quiz erstellen' : 'Quiz bearbeiten'}
              </h1>
              <p className="text-gray-300 text-lg mt-2">
                {isNewQuiz
                  ? 'Erstellen Sie ein neues Quiz für Ihre Spieler.'
                  : 'Bearbeiten Sie die Quiz-Einstellungen und Fragen.'}
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-600 bg-opacity-20 border border-red-600 rounded-xl p-4 mb-8">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-[#FCC822] mb-6">
              Grundinformationen
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label
                  htmlFor="title"
                  className="block text-gray-300 font-medium mb-2"
                >
                  Titel *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={e => handleInputChange('title', e.target.value)}
                  placeholder="Quiz-Titel eingeben..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
                  required
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="block text-gray-300 font-medium mb-2"
                >
                  Beschreibung
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={e =>
                    handleInputChange('description', e.target.value)
                  }
                  placeholder="Quiz-Beschreibung eingeben..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent resize-vertical"
                />
              </div>

              {/* Difficulty */}
              <div>
                <label
                  htmlFor="difficulty"
                  className="block text-gray-300 font-medium mb-2"
                >
                  Schwierigkeit *
                </label>
                <select
                  id="difficulty"
                  value={formData.difficulty}
                  onChange={e =>
                    handleInputChange(
                      'difficulty',
                      parseInt(e.target.value) as QuizDifficulty
                    )
                  }
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
                  required
                >
                  <option value={1}>1 - Anfänger</option>
                  <option value={2}>2 - Lehrling</option>
                  <option value={3}>3 - Geselle</option>
                  <option value={4}>4 - Meister</option>
                  <option value={5}>5 - Großmeister</option>
                </select>
              </div>

              {/* Estimated Duration */}
              <div>
                <label
                  htmlFor="estimatedDuration"
                  className="block text-gray-300 font-medium mb-2"
                >
                  Geschätzte Dauer (Minuten)
                </label>
                <input
                  type="number"
                  id="estimatedDuration"
                  value={formData.estimatedDuration}
                  onChange={e =>
                    handleInputChange(
                      'estimatedDuration',
                      parseInt(e.target.value) || 15
                    )
                  }
                  min="1"
                  max="180"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
                />
              </div>

              {/* Image URL */}
              <div>
                <label
                  htmlFor="imageUrl"
                  className="block text-gray-300 font-medium mb-2"
                >
                  Bild-URL (optional)
                </label>
                <input
                  type="url"
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={e => handleInputChange('imageUrl', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
                />
              </div>

              {/* Tags */}
              <div className="md:col-span-2">
                <label
                  htmlFor="tags"
                  className="block text-gray-300 font-medium mb-2"
                >
                  Tags (kommagetrennt)
                </label>
                <input
                  type="text"
                  id="tags"
                  value={formData.tags.join(', ')}
                  onChange={e => handleTagsChange(e.target.value)}
                  placeholder="mathematik, grundlagen, algebra"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Quiz Settings */}
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-[#FCC822] mb-6">
              Quiz-Einstellungen
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Passing Score */}
              <div>
                <label
                  htmlFor="passingScore"
                  className="block text-gray-300 font-medium mb-2"
                >
                  Bestehensgrenze (%)
                </label>
                <input
                  type="number"
                  id="passingScore"
                  value={settings.passingScore}
                  onChange={e =>
                    handleSettingsChange(
                      'passingScore',
                      parseInt(e.target.value) || 70
                    )
                  }
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
                />
              </div>

              {/* Max Attempts */}
              <div>
                <label
                  htmlFor="maxAttempts"
                  className="block text-gray-300 font-medium mb-2"
                >
                  Max. Versuche (leer = unbegrenzt)
                </label>
                <input
                  type="number"
                  id="maxAttempts"
                  value={settings.maxAttempts || ''}
                  onChange={e => {
                    const value = e.target.value;
                    setSettings(prev => ({
                      ...prev,
                      maxAttempts: value
                        ? parseInt(value) || undefined
                        : undefined,
                    }));
                  }}
                  min="1"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
                />
              </div>
            </div>

            {/* Boolean Settings */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  key: 'randomizeQuestions',
                  label: 'Fragen zufällig anordnen',
                },
                {
                  key: 'randomizeAnswers',
                  label: 'Antworten zufällig anordnen',
                },
                { key: 'showExplanations', label: 'Erklärungen anzeigen' },
                { key: 'allowSkipping', label: 'Überspringen erlauben' },
                { key: 'showProgress', label: 'Fortschritt anzeigen' },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={settings[key as keyof QuizSettings] as boolean}
                    onChange={e =>
                      handleSettingsChange(
                        key as keyof QuizSettings,
                        e.target.checked
                      )
                    }
                    className="w-5 h-5 text-[#FCC822] bg-gray-600 border-gray-500 rounded focus:ring-[#FCC822] focus:ring-2"
                  />
                  <span className="text-gray-300">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Question Selection */}
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#FCC822]">
                  Fragen hinzufügen ({selectedQuestions.length} ausgewählt,{' '}
                  {createdQuestions.length} neu erstellt)
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {createdQuestions.length > 0 &&
                    'Neu erstellte Fragen werden automatisch mit dem Quiz gespeichert. '}
                  Sie können auch ein leeres Quiz für die Vorbereitung
                  erstellen.
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowQuestionForm(!showQuestionForm)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                >
                  <img
                    src="/buttons/Add.png"
                    alt="Add"
                    className="inline h-4 w-4 mr-2"
                  />
                  Neue Frage erstellen
                </button>
                <button
                  type="button"
                  onClick={selectAllQuestions}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors duration-200"
                >
                  Alle auswählen
                </button>
                <button
                  type="button"
                  onClick={deselectAllQuestions}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors duration-200"
                >
                  Alle abwählen
                </button>
              </div>
            </div>

            {/* Created Questions Display */}
            {createdQuestions.length > 0 && (
              <div className="mb-6 p-4 bg-green-900 bg-opacity-30 rounded-lg border border-green-600">
                <h3 className="text-green-400 font-semibold mb-3">
                  Neu erstellte Fragen ({createdQuestions.length})
                </h3>
                <div className="space-y-2">
                  {createdQuestions.map((q, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-green-800 bg-opacity-20 p-3 rounded"
                    >
                      <div className="flex-1">
                        <p className="text-white font-medium">{q.content}</p>
                        <p className="text-green-300 text-sm">
                          {q.difficulty} •{' '}
                          {q.answers.filter(a => a.isCorrect).length} korrekte
                          von {q.answers.length} Antworten
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setCreatedQuestions(prev =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                        className="text-red-400 hover:text-red-300 ml-3"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inline Question Creation Form */}
            {showQuestionForm && (
              <div className="mb-6 p-6 bg-gray-700 bg-opacity-50 rounded-lg border border-gray-600">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-[#FCC822]">
                    Neue Frage erstellen
                  </h3>
                  <button
                    type="button"
                    onClick={cancelQuestionCreation}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Question Content */}
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">
                      Fragetext *
                    </label>
                    <textarea
                      value={newQuestion.content}
                      onChange={e =>
                        handleNewQuestionChange('content', e.target.value)
                      }
                      placeholder="Geben Sie hier den Fragetext ein..."
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent resize-vertical"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Difficulty */}
                    <div>
                      <label className="block text-gray-300 font-medium mb-2">
                        Schwierigkeit
                      </label>
                      <select
                        value={newQuestion.difficulty}
                        onChange={e =>
                          handleNewQuestionChange(
                            'difficulty',
                            parseInt(e.target.value) as QuizDifficulty
                          )
                        }
                        className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
                      >
                        <option value={1}>1 - Anfänger</option>
                        <option value={2}>2 - Lehrling</option>
                        <option value={3}>3 - Geselle</option>
                        <option value={4}>4 - Meister</option>
                        <option value={5}>5 - Großmeister</option>
                      </select>
                    </div>

                    {/* Explanation */}
                    <div>
                      <label className="block text-gray-300 font-medium mb-2">
                        Erklärung (optional)
                      </label>
                      <input
                        type="text"
                        value={newQuestion.explanation}
                        onChange={e =>
                          handleNewQuestionChange('explanation', e.target.value)
                        }
                        placeholder="Optionale Erklärung..."
                        className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Answers */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-gray-300 font-medium">
                        Antworten
                      </label>
                      <button
                        type="button"
                        onClick={addNewQuestionAnswer}
                        disabled={newQuestion.answers.length >= 6}
                        className="px-3 py-1 bg-[#FCC822] text-black rounded-lg font-medium hover:bg-yellow-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        + Antwort
                      </button>
                    </div>

                    <div className="space-y-3">
                      {newQuestion.answers.map((answer, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-3 bg-gray-600 bg-opacity-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <input
                              type="text"
                              value={answer.content}
                              onChange={e =>
                                handleNewQuestionAnswerChange(
                                  index,
                                  'content',
                                  e.target.value
                                )
                              }
                              placeholder={`Antwort ${index + 1}...`}
                              className="w-full px-3 py-2 bg-gray-500 border border-gray-400 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
                            />
                          </div>

                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={answer.isCorrect}
                              onChange={e =>
                                handleNewQuestionAnswerChange(
                                  index,
                                  'isCorrect',
                                  e.target.checked
                                )
                              }
                              className="w-4 h-4 text-[#FCC822] bg-gray-500 border-gray-400 rounded focus:ring-[#FCC822] focus:ring-2"
                            />
                            <span className="text-gray-300 text-sm">
                              Korrekt
                            </span>
                          </label>

                          {newQuestion.answers.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeNewQuestionAnswer(index)}
                              className="p-1 text-red-400 hover:bg-red-400 hover:bg-opacity-20 rounded transition-colors duration-200"
                              title="Antwort entfernen"
                            >
                              <img
                                src="/buttons/Delete.png"
                                alt="Delete"
                                className="h-4 w-4"
                              />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-600">
                    <button
                      type="button"
                      onClick={cancelQuestionCreation}
                      className="px-4 py-2 bg-gray-600 text-gray-300 rounded-lg font-medium hover:bg-gray-500 transition-colors duration-200"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateQuestion}
                      disabled={creatingQuestion}
                      className="px-4 py-2 bg-[#FCC822] text-black rounded-lg font-medium hover:bg-yellow-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {creatingQuestion ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black inline mr-2"></div>
                          Erstellen...
                        </>
                      ) : (
                        'Frage erstellen'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Question Filters */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-300 font-medium mb-2">
                  Thema
                </label>
                <select
                  value={questionFilters.topicId}
                  onChange={e =>
                    setQuestionFilters(prev => ({
                      ...prev,
                      topicId: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822]"
                >
                  <option value="">Alle Themen</option>
                  {topics.map(topic => (
                    <option key={topic.id} value={topic.id}>
                      {topic.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">
                  Schwierigkeit
                </label>
                <select
                  value={questionFilters.difficulty}
                  onChange={e =>
                    setQuestionFilters(prev => ({
                      ...prev,
                      difficulty:
                        e.target.value === 'all'
                          ? 'all'
                          : (parseInt(e.target.value) as QuizDifficulty),
                    }))
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822]"
                >
                  <option value="all">Alle Schwierigkeiten</option>
                  <option value={1}>1 - Anfänger</option>
                  <option value={2}>2 - Lehrling</option>
                  <option value={3}>3 - Geselle</option>
                  <option value={4}>4 - Meister</option>
                  <option value={5}>5 - Großmeister</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">
                  Suche
                </label>
                <input
                  type="text"
                  value={questionFilters.search}
                  onChange={e =>
                    setQuestionFilters(prev => ({
                      ...prev,
                      search: e.target.value,
                    }))
                  }
                  placeholder="Frage suchen..."
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822]"
                />
              </div>
            </div>

            {/* Questions List */}
            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredQuestions.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  Keine Fragen gefunden. Passen Sie die Filter an oder erstellen
                  Sie neue Fragen.
                </p>
              ) : (
                filteredQuestions.map(question => (
                  <div
                    key={question.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedQuestions.includes(question.id)
                        ? 'border-[#FCC822] bg-[#FCC822] bg-opacity-10'
                        : 'border-gray-600 bg-gray-700 bg-opacity-50 hover:border-gray-500'
                    }`}
                    onClick={() => toggleQuestionSelection(question.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-white font-medium mb-2">
                          {question.content}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>
                            Thema: {question.topicTitle || 'Unbekannt'}
                          </span>
                          <span>
                            Schwierigkeit:{' '}
                            {getDifficultyName(question.difficulty)}
                          </span>
                          <span>{question.answers?.length || 0} Antworten</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <input
                          type="checkbox"
                          checked={selectedQuestions.includes(question.id)}
                          onChange={() => toggleQuestionSelection(question.id)}
                          className="w-5 h-5 text-[#FCC822] bg-gray-600 border-gray-500 rounded focus:ring-[#FCC822] focus:ring-2"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <p className="text-gray-400 text-sm mt-4">
              💡 Tipp: Sie können das Quiz auch ohne Fragen erstellen und diese
              später hinzufügen oder direkt hier neue Fragen erstellen.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/quizzes')}
              className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg font-medium hover:bg-gray-600 transition-colors duration-200"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-gradient px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white inline mr-2"></div>
                  Speichern...
                </>
              ) : (
                <>
                  <img
                    src="/buttons/Accept.png"
                    alt="Save"
                    className="inline h-5 w-5 mr-2"
                  />
                  {isNewQuiz
                    ? createdQuestions.length > 0
                      ? 'Quiz mit Fragen erstellen'
                      : 'Quiz erstellen'
                    : 'Änderungen speichern'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
