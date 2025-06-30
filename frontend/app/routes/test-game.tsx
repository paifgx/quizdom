/**
 * Test route for directly connecting to the backend game API.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { LoadingSpinner } from '../components/home/loading-spinner';
import { gameService } from '../services/game';
import { useAuthenticatedGame } from '../hooks/useAuthenticatedGame';

export default function TestGamePage() {
  const _navigate = useNavigate(); // Keep for future use but mark as unused
  const { isAuthenticated, isLoading: authLoading } = useAuthenticatedGame();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topicId, setTopicId] = useState<string>('1');
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [question, setQuestion] = useState<any>(null);
  const [result, setResult] = useState<any>(null);

  const startGame = async () => {
    try {
      setLoading(true);
      setError(null);
      setSessionId(null);
      setQuestion(null);
      setResult(null);

      // Start game session
      const sessionResponse = await gameService.startTopicGame(
        topicId,
        'solo',
        5 // 5 questions
      );

      setSessionId(sessionResponse.session_id);
      
      // Get first question
      const questionData = await gameService.getQuestion(
        sessionResponse.session_id,
        0
      );
      
      setQuestion(questionData);
      setLoading(false);
    } catch (err) {
      console.error('Failed to start game:', err);
      setError(err instanceof Error ? err.message : 'Failed to start game');
      setLoading(false);
    }
  };

  const answerQuestion = async (answerId: number) => {
    if (!sessionId || !question) return;

    try {
      setLoading(true);
      const response = await gameService.submitAnswer(
        sessionId,
        question.question_id,
        answerId
      );
      
      setResult(response);
      setLoading(false);
    } catch (err) {
      console.error('Failed to submit answer:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
      setLoading(false);
    }
  };

  const completeGame = async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      const response = await gameService.completeSession(sessionId);
      setResult(response);
      setLoading(false);
    } catch (err) {
      console.error('Failed to complete game:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete game');
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  }

  if (!isAuthenticated) {
    return null; // The hook will handle redirection
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-white">Test Game API Integration</h1>
      
      <div className="mb-6">
        <label className="block text-gray-300 mb-2">Topic ID:</label>
        <input 
          type="text" 
          value={topicId} 
          onChange={(e) => setTopicId(e.target.value)} 
          className="px-3 py-2 bg-gray-800 text-white rounded border border-gray-700"
        />
      </div>
      
      <div className="flex space-x-4 mb-8">
        <button 
          onClick={startGame} 
          disabled={loading} 
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Start Game
        </button>
        <button 
          onClick={completeGame} 
          disabled={loading || !sessionId} 
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50"
        >
          Complete Game
        </button>
      </div>
      
      {loading && <LoadingSpinner />}
      
      {error && (
        <div className="p-4 mb-6 bg-red-900/30 border border-red-700 text-red-400 rounded">
          {error}
        </div>
      )}
      
      {sessionId && (
        <div className="mb-6 p-4 bg-gray-800/50 rounded border border-gray-700">
          <h2 className="text-lg font-bold text-white mb-2">Session Info</h2>
          <p className="text-gray-400">Session ID: {sessionId}</p>
        </div>
      )}
      
      {question && (
        <div className="mb-6 p-4 bg-gray-800/50 rounded border border-gray-700">
          <h2 className="text-lg font-bold text-white mb-2">Question</h2>
          <p className="text-white mb-4">{question.content}</p>
          
          <div className="space-y-2">
            {question.answers.map((answer: any) => (
              <button 
                key={answer.id}
                onClick={() => answerQuestion(answer.id)}
                className="block w-full text-left px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded"
              >
                {answer.content}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {result && (
        <div className="p-4 bg-gray-800/50 rounded border border-gray-700">
          <h2 className="text-lg font-bold text-white mb-2">Result</h2>
          <pre className="text-sm text-gray-400 overflow-auto p-2 bg-gray-900 rounded">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 