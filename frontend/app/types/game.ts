/**
 * Game-related type definitions for the quiz application.
 * Defines interfaces for game modes, topics, and related data structures.
 */

export interface GameMode {
  id: 'solo' | 'comp' | 'collab';
  name: string;
  description: string;
  icon: string;
}

export interface Topic {
  id: string;
  title: string;
  totalQuestions: number;
  image: string;
  description: string;
}

export type GameStep = 'mode' | 'topic';
export type GameModeId = GameMode['id'];

// Game state types
export interface Question {
  id: string;
  text: string;
  answers: string[];
  correctAnswer: number;
  showTimestamp: number; // Server timestamp when question was shown
  isBookmarked?: boolean; // Whether the question is bookmarked
  answerIds?: number[]; // Backend answer IDs for submission
}

export interface PlayerState {
  id: string;
  name: string;
  score: number;
  hearts: number;
  avatar?: string;
  hasAnswered?: boolean;
  answerTimestamp?: number;
  selectedAnswer?: number;
  isCorrect?: boolean;
}

export interface GameState {
  mode: 'solo' | 'competitive' | 'collaborative';
  status: 'waiting' | 'playing' | 'paused' | 'finished';
  currentQuestionIndex: number;
  questions: Question[];
  players: PlayerState[];
  teamHearts?: number; // For collaborative mode
  teamScore?: number; // For collaborative mode
  timeLimit: number; // Seconds per question
  startTime?: number;
  endTime?: number;
  winner?: string; // Player ID for competitive mode
}

export interface GameResult {
  mode: string;
  result: 'win' | 'fail';
  score: number;
  heartsRemaining: number;
  playerScores?: Record<string, number>; // For competitive mode
}

export interface ScoreUpdate {
  playerId: string;
  points: number;
  totalScore: number;
  responseTime: number; // in milliseconds
}

export interface HeartLossEvent {
  playerId?: string;
  heartsRemaining: number;
  isTeamHeart?: boolean;
}

export interface CompetitiveUpdate {
  players: PlayerState[];
  currentQuestion: number;
  timeRemaining: number;
}

export interface CollaborativeUpdate {
  teamScore: number;
  teamHearts: number;
  playerAnswers: Record<string, number>; // playerId -> answer index
  currentQuestion: number;
  timeRemaining: number;
}

export interface GameOverEvent {
  mode: string;
  result: 'win' | 'fail';
  score: number;
  heartsRemaining: number;
}
