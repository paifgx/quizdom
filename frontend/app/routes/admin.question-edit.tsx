import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ProtectedRoute } from '../components/auth/protected-route';
import {
  questionAdminService,
  type Topic,
  type CreateQuestionPayload,
  type UpdateQuestionPayload,
} from '../services/question-admin';

export function meta() {
  return [
    { title: 'Frage bearbeiten | Quizdom Admin' },
    {
      name: 'description',
      content: 'Erstellen oder bearbeiten Sie eine Frage.',
    },
  ];
}

interface Answer {
  id?: string;
  content: string;
  isCorrect: boolean;
}

// Question difficulty type for admin interface
type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export default function AdminQuestionEditPage() {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const isNewQuestion = questionId === 'new';

  // State management
  const [loading, setLoading] = useState(!isNewQuestion);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    topicId: '',
    difficulty: 'easy' as QuestionDifficulty,
    content: '',
    explanation: '',
  });

  const [answers, setAnswers] = useState<Answer[]>([
    { content: '', isCorrect: false },
    { content: '', isCorrect: false },
  ]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Always load topics
      const topicsData = await questionAdminService.getTopics();
      setTopics(topicsData);

      // Load question data if editing
      if (!isNewQuestion && questionId) {
        const questionData =
          await questionAdminService.getQuestionById(questionId);

        setFormData({
          topicId: questionData.topicId,
          difficulty: questionData.difficulty,
          content: questionData.content,
          explanation: questionData.explanation || '',
        });

        setAnswers(
          questionData.answers.map(answer => ({
            id: answer.id,
            content: answer.content,
            isCorrect: answer.isCorrect,
          }))
        );
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Fehler beim Laden der Daten. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  }, [isNewQuestion, questionId]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleInputChange = (
    field: string,
    value: string | QuestionDifficulty
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAnswerChange = (
    index: number,
    field: 'content' | 'isCorrect',
    value: string | boolean
  ) => {
    setAnswers(prev =>
      prev.map((answer, i) =>
        i === index ? { ...answer, [field]: value } : answer
      )
    );
  };

  const addAnswer = () => {
    if (answers.length < 6) {
      setAnswers(prev => [...prev, { content: '', isCorrect: false }]);
    }
  };

  const removeAnswer = (index: number) => {
    if (answers.length > 2) {
      setAnswers(prev => prev.filter((_, i) => i !== index));
    }
  };

  const validateForm = (): string | null => {
    if (!formData.topicId) {
      return 'Bitte wählen Sie ein Thema aus.';
    }

    if (!formData.content.trim()) {
      return 'Bitte geben Sie den Fragetext ein.';
    }

    if (answers.length < 2) {
      return 'Eine Frage muss mindestens 2 Antworten haben.';
    }

    const validAnswers = answers.filter(answer => answer.content.trim());
    if (validAnswers.length < 2) {
      return 'Mindestens 2 Antworten müssen ausgefüllt sein.';
    }

    const correctAnswers = answers.filter(
      answer => answer.isCorrect && answer.content.trim()
    );
    if (correctAnswers.length === 0) {
      return 'Mindestens eine Antwort muss als korrekt markiert sein.';
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

      const validAnswers = answers.filter(answer => answer.content.trim());

      if (isNewQuestion) {
        const payload: CreateQuestionPayload = {
          topicId: formData.topicId,
          difficulty: formData.difficulty,
          content: formData.content.trim(),
          explanation: formData.explanation.trim() || undefined,
          answers: validAnswers.map(answer => ({
            content: answer.content.trim(),
            isCorrect: answer.isCorrect,
          })),
        };

        await questionAdminService.createQuestion(payload);
      } else if (questionId) {
        const payload: UpdateQuestionPayload = {
          topicId: formData.topicId,
          difficulty: formData.difficulty,
          content: formData.content.trim(),
          explanation: formData.explanation.trim() || undefined,
        };

        await questionAdminService.updateQuestion(questionId, payload);
      }

      navigate('/admin/questions');
    } catch (err) {
      console.error('Failed to save question:', err);
      setError(
        'Fehler beim Speichern der Frage. Bitte versuchen Sie es erneut.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center min-h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FCC822] mx-auto mb-4"></div>
              <p className="text-gray-300">Lade Frage...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => navigate('/admin/questions')}
              className="p-2 text-gray-400 hover:text-[#FCC822] transition-colors duration-200"
            >
              <img src="/buttons/Left.png" alt="Back" className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-4xl font-bold text-[#FCC822]">
                {isNewQuestion ? 'Neue Frage erstellen' : 'Frage bearbeiten'}
              </h1>
              <p className="text-gray-300 text-lg mt-2">
                {isNewQuestion
                  ? 'Erstellen Sie eine neue Frage für Ihre Quizzes.'
                  : 'Bearbeiten Sie die Frage und ihre Antworten.'}
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
              {/* Topic */}
              <div>
                <label
                  htmlFor="topic"
                  className="block text-gray-300 font-medium mb-2"
                >
                  Thema *
                </label>
                <select
                  id="topic"
                  value={formData.topicId}
                  onChange={e => handleInputChange('topicId', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
                  required
                >
                  <option value="">Thema auswählen</option>
                  {topics.map(topic => (
                    <option key={topic.id} value={topic.id}>
                      {topic.title}
                    </option>
                  ))}
                </select>
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
                      e.target.value as QuestionDifficulty
                    )
                  }
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
                  required
                >
                  <option value="easy">Einfach</option>
                  <option value="medium">Mittel</option>
                  <option value="hard">Schwer</option>
                </select>
              </div>
            </div>

            {/* Question Content */}
            <div className="mt-6">
              <label
                htmlFor="content"
                className="block text-gray-300 font-medium mb-2"
              >
                Fragetext *
              </label>
              <textarea
                id="content"
                value={formData.content}
                onChange={e => handleInputChange('content', e.target.value)}
                placeholder="Geben Sie hier den Fragetext ein..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent resize-vertical"
                required
              />
            </div>

            {/* Explanation */}
            <div className="mt-6">
              <label
                htmlFor="explanation"
                className="block text-gray-300 font-medium mb-2"
              >
                Erklärung (optional)
              </label>
              <textarea
                id="explanation"
                value={formData.explanation}
                onChange={e => handleInputChange('explanation', e.target.value)}
                placeholder="Optionale Erklärung zur Frage..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent resize-vertical"
              />
            </div>
          </div>

          {/* Answers */}
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#FCC822]">Antworten</h2>
              <button
                type="button"
                onClick={addAnswer}
                disabled={answers.length >= 6}
                className="btn-gradient px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <img
                  src="/buttons/Add.png"
                  alt="Add"
                  className="inline h-4 w-4 mr-2"
                />
                Antwort hinzufügen
              </button>
            </div>

            <div className="space-y-4">
              {answers.map((answer, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-4 bg-gray-700 bg-opacity-50 rounded-lg"
                >
                  <div className="flex-1">
                    <input
                      type="text"
                      value={answer.content}
                      onChange={e =>
                        handleAnswerChange(index, 'content', e.target.value)
                      }
                      placeholder={`Antwort ${index + 1}...`}
                      className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FCC822] focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={answer.isCorrect}
                        onChange={e =>
                          handleAnswerChange(
                            index,
                            'isCorrect',
                            e.target.checked
                          )
                        }
                        className="w-5 h-5 text-[#FCC822] bg-gray-600 border-gray-500 rounded focus:ring-[#FCC822] focus:ring-2"
                      />
                      <span className="text-gray-300 text-sm">Korrekt</span>
                    </label>

                    {answers.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeAnswer(index)}
                        className="p-2 text-red-400 hover:bg-red-400 hover:bg-opacity-20 rounded-lg transition-colors duration-200"
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
                </div>
              ))}
            </div>

            <p className="text-gray-400 text-sm mt-4">
              * Mindestens 2 Antworten erforderlich, maximal 6 möglich.
              Mindestens eine Antwort muss als korrekt markiert sein.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/questions')}
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
                  {isNewQuestion ? 'Frage erstellen' : 'Änderungen speichern'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
